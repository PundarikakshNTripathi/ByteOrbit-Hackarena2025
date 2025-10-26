"""
Scheduler Service
APScheduler configuration for autonomous follow-up checks
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timedelta
import logging
from typing import Optional
from app.core.config import settings
from app.services.agent_workflow import process_complaint_followup
from app.db.supabase import supabase_client

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler: Optional[AsyncIOScheduler] = None


def get_scheduler() -> AsyncIOScheduler:
    """Get or create the global scheduler instance"""
    global scheduler
    if scheduler is None:
        scheduler = AsyncIOScheduler(timezone=settings.SCHEDULER_TIMEZONE)
    return scheduler


async def check_pending_complaints():
    """
    Periodic job to check all pending complaints and trigger follow-ups
    This runs every hour (configurable)
    """
    try:
        logger.info("Running periodic complaint check...")
        
        # Fetch all non-resolved complaints
        response = supabase_client.table("complaints") \
            .select("id, created_at, status, sla_hours") \
            .not_.in_("status", ["resolved", "rejected"]) \
            .execute()
        
        pending_complaints = response.data
        logger.info(f"Found {len(pending_complaints)} pending complaints")
        
        # Process each complaint
        for complaint in pending_complaints:
            complaint_id = complaint["id"]
            
            # Check if it's time for a follow-up
            created_at = datetime.fromisoformat(complaint["created_at"].replace("Z", "+00:00"))
            now = datetime.now(created_at.tzinfo)
            hours_since_creation = (now - created_at).total_seconds() / 3600
            
            sla_hours = complaint.get("sla_hours", 72)
            
            # Follow up if:
            # 1. More than 24 hours old, OR
            # 2. SLA deadline approaching (80% of SLA time), OR
            # 3. SLA already breached
            should_followup = (
                hours_since_creation >= 24 and
                (hours_since_creation % 24 < 1)  # Check once per day
            ) or hours_since_creation >= (sla_hours * 0.8)
            
            if should_followup:
                logger.info(f"Triggering follow-up for complaint {complaint_id}")
                await process_complaint_followup(complaint_id)
        
        logger.info("Periodic complaint check completed")
        
    except Exception as e:
        logger.error(f"Error in periodic complaint check: {e}")


def schedule_complaint_followup(complaint_id: str, sla_hours: int):
    """
    Schedule a specific follow-up check for a complaint
    
    Args:
        complaint_id: UUID of the complaint
        sla_hours: SLA deadline in hours
    """
    try:
        scheduler_instance = get_scheduler()
        
        # Schedule first check at 80% of SLA time
        first_check_hours = sla_hours * 0.8
        run_date = datetime.now() + timedelta(hours=first_check_hours)
        
        job_id = f"complaint_{complaint_id}_followup"
        
        # Check if job already exists
        existing_job = scheduler_instance.get_job(job_id)
        if existing_job:
            logger.info(f"Job {job_id} already exists, updating...")
            scheduler_instance.reschedule_job(job_id, trigger='date', run_date=run_date)
        else:
            scheduler_instance.add_job(
                func=process_complaint_followup,
                args=[complaint_id],
                trigger='date',
                run_date=run_date,
                id=job_id,
                name=f"Follow-up check for complaint {complaint_id[:8]}",
                replace_existing=True
            )
        
        logger.info(f"Scheduled follow-up for complaint {complaint_id} at {run_date}")
        
    except Exception as e:
        logger.error(f"Error scheduling complaint follow-up: {e}")


def start_scheduler():
    """Initialize and start the scheduler"""
    try:
        scheduler_instance = get_scheduler()
        
        # Add periodic job to check all pending complaints
        scheduler_instance.add_job(
            func=check_pending_complaints,
            trigger=IntervalTrigger(minutes=settings.FOLLOW_UP_CHECK_INTERVAL_MINUTES),
            id='periodic_complaint_check',
            name='Periodic Complaint Check',
            replace_existing=True
        )
        
        # Start the scheduler
        scheduler_instance.start()
        logger.info("Scheduler started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")
        raise


def stop_scheduler():
    """Gracefully stop the scheduler"""
    try:
        scheduler_instance = get_scheduler()
        if scheduler_instance.running:
            scheduler_instance.shutdown(wait=True)
            logger.info("Scheduler stopped successfully")
    except Exception as e:
        logger.error(f"Error stopping scheduler: {e}")
