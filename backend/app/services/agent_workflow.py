"""
Agent Workflow Service
Core agentic state machine logic for autonomous complaint management
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import asyncio
from app.db.supabase import supabase_client
from app.db.models import DecisionFeatures
from app.services.decision_model import decision_model
from app.services.email_service import email_service

logger = logging.getLogger(__name__)


# Status encoding for decision model
STATUS_SCORES = {
    "submitted": 1,
    "in_progress": 2,
    "escalated": 3,
    "resolved": 4,
    "rejected": 0
}


async def log_complaint_action(
    complaint_id: str,
    action_type: str,
    description: str,
    metadata: Optional[Dict[str, Any]] = None
):
    """
    Log an action in the complaint_actions table
    
    Args:
        complaint_id: UUID of the complaint
        action_type: Type of action (submitted, emailed, escalated, etc.)
        description: Human-readable description
        metadata: Optional additional data
    """
    try:
        supabase_client.table("complaint_actions").insert({
            "complaint_id": complaint_id,
            "action_type": action_type,
            "description": description,
            "metadata": metadata or {}
        }).execute()
        
        logger.info(f"Logged action '{action_type}' for complaint {complaint_id}")
    except Exception as e:
        logger.error(f"Failed to log action for complaint {complaint_id}: {e}")


async def get_complaint_by_id(complaint_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a complaint by ID"""
    try:
        response = supabase_client.table("complaints").select("*").eq("id", complaint_id).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Failed to fetch complaint {complaint_id}: {e}")
        return None


async def get_department_by_id(department_id: str) -> Optional[Dict[str, Any]]:
    """Fetch department details"""
    try:
        response = supabase_client.table("departments").select("*").eq("id", department_id).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Failed to fetch department {department_id}: {e}")
        return None


async def count_complaint_followups(complaint_id: str) -> int:
    """Count number of follow-up actions sent"""
    try:
        response = supabase_client.table("complaint_actions") \
            .select("id", count="exact") \
            .eq("complaint_id", complaint_id) \
            .eq("action_type", "follow_up") \
            .execute()
        return response.count or 0
    except Exception as e:
        logger.error(f"Failed to count follow-ups: {e}")
        return 0


async def process_complaint_followup(complaint_id: str):
    """
    Process a scheduled follow-up check for a complaint
    This is the core autonomous agent workflow
    
    Args:
        complaint_id: UUID of the complaint to check
    """
    try:
        logger.info(f"Processing follow-up for complaint {complaint_id}")
        
        # Fetch complaint details
        complaint = await get_complaint_by_id(complaint_id)
        if not complaint:
            logger.error(f"Complaint {complaint_id} not found")
            return
        
        # Check if already resolved
        if complaint["status"] in ["resolved", "rejected"]:
            logger.info(f"Complaint {complaint_id} already {complaint['status']}, skipping")
            return
        
        # Calculate features for decision model
        created_at = datetime.fromisoformat(complaint["created_at"].replace("Z", "+00:00"))
        now = datetime.now(created_at.tzinfo)
        days_since_submission = (now - created_at).total_seconds() / 86400
        
        sla_hours = complaint.get("sla_hours", 72)
        sla_deadline = created_at + timedelta(hours=sla_hours)
        time_since_sla_breach = (now - sla_deadline).total_seconds() / 3600  # Hours
        
        # Get category priority (from AI report or default)
        category_priority = 5  # Default
        if complaint.get("assigned_department"):
            dept = await get_department_by_id(complaint["assigned_department"])
            if dept:
                category_priority = dept.get("priority_level", 5)
        
        num_followups = await count_complaint_followups(complaint_id)
        status_score = STATUS_SCORES.get(complaint["status"], 1)
        
        # Create features
        features = DecisionFeatures(
            time_since_sla_breach=time_since_sla_breach,
            category_priority=category_priority,
            number_of_followups=num_followups,
            days_since_submission=days_since_submission,
            status_score=status_score
        )
        
        # Get AI decision
        action, confidence = decision_model.predict_action(features)
        
        logger.info(f"Decision for {complaint_id}: {action} (confidence: {confidence:.2f})")
        
        # Execute the recommended action
        if action == "escalate":
            await execute_escalation(complaint, features)
        else:
            await execute_followup(complaint, features)
            
    except Exception as e:
        logger.error(f"Error processing follow-up for {complaint_id}: {e}")


async def execute_followup(complaint: Dict[str, Any], features: DecisionFeatures):
    """Send a follow-up email to the department"""
    try:
        complaint_id = complaint["id"]
        department_id = complaint.get("assigned_department")
        
        if not department_id:
            logger.warning(f"No department assigned to complaint {complaint_id}")
            return
        
        dept = await get_department_by_id(department_id)
        if not dept:
            logger.error(f"Department {department_id} not found")
            return
        
        # Send follow-up email
        success = await email_service.send_follow_up_email(
            department_email=dept["contact_email"],
            department_name=dept["name"],
            complaint_id=complaint_id,
            category=complaint["category"],
            days_pending=int(features.days_since_submission)
        )
        
        if success:
            # Log the action
            await log_complaint_action(
                complaint_id=complaint_id,
                action_type="follow_up",
                description=f"Follow-up email sent to {dept['name']} (Day {int(features.days_since_submission)})",
                metadata={"days_pending": int(features.days_since_submission)}
            )
            
            logger.info(f"Follow-up sent for complaint {complaint_id}")
        else:
            logger.error(f"Failed to send follow-up for complaint {complaint_id}")
            
    except Exception as e:
        logger.error(f"Error executing follow-up: {e}")


async def execute_escalation(complaint: Dict[str, Any], features: DecisionFeatures):
    """Escalate a complaint to supervisory level"""
    try:
        complaint_id = complaint["id"]
        department_id = complaint.get("assigned_department")
        
        if not department_id:
            logger.warning(f"No department assigned to complaint {complaint_id}")
            return
        
        dept = await get_department_by_id(department_id)
        if not dept:
            logger.error(f"Department {department_id} not found")
            return
        
        escalation_email = dept.get("escalation_email") or dept.get("contact_email")
        
        # Determine escalation reason
        if features.time_since_sla_breach > 24:
            reason = f"SLA breached by {int(features.time_since_sla_breach)} hours"
        elif features.number_of_followups >= 2:
            reason = f"{features.number_of_followups} follow-up attempts with no resolution"
        else:
            reason = "High priority issue requiring urgent attention"
        
        # Send escalation email
        success = await email_service.send_escalation_email(
            escalation_email=escalation_email,
            department_name=dept["name"],
            complaint_id=complaint_id,
            category=complaint["category"],
            reason=reason
        )
        
        if success:
            # Update complaint status
            supabase_client.table("complaints").update({
                "status": "escalated",
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", complaint_id).execute()
            
            # Log the action
            await log_complaint_action(
                complaint_id=complaint_id,
                action_type="escalated",
                description=f"Complaint escalated to supervisor. Reason: {reason}",
                metadata={"reason": reason, "escalation_email": escalation_email}
            )
            
            logger.info(f"Complaint {complaint_id} escalated successfully")
        else:
            logger.error(f"Failed to send escalation email for {complaint_id}")
            
    except Exception as e:
        logger.error(f"Error executing escalation: {e}")


async def initialize_complaint_workflow(
    complaint_id: str,
    department_id: str,
    category: str,
    summary: str,
    location_text: str,
    image_url: Optional[str] = None
):
    """
    Initialize the autonomous workflow for a new complaint
    
    Args:
        complaint_id: UUID of the newly created complaint
        department_id: Assigned department ID
        category: Issue category
        summary: AI-generated summary
        location_text: Human-readable location
        image_url: Optional image URL
    """
    try:
        # Fetch department details
        dept = await get_department_by_id(department_id)
        if not dept:
            logger.error(f"Department {department_id} not found")
            return
        
        # Send initial notification email
        success = await email_service.send_complaint_notification(
            department_email=dept["contact_email"],
            department_name=dept["name"],
            complaint_id=complaint_id,
            category=category,
            summary=summary,
            location=location_text,
            image_url=image_url
        )
        
        if success:
            # Log email sent action
            await log_complaint_action(
                complaint_id=complaint_id,
                action_type="email_sent",
                description=f"Initial notification sent to {dept['name']}",
                metadata={"department": dept["name"], "email": dept["contact_email"]}
            )
            
            logger.info(f"Workflow initialized for complaint {complaint_id}")
        else:
            logger.error(f"Failed to send initial email for complaint {complaint_id}")
            
    except Exception as e:
        logger.error(f"Error initializing complaint workflow: {e}")
