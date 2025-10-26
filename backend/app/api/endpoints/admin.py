"""
Admin API Endpoints
Admin-only endpoints for complaint management and dashboard statistics
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

from app.api.deps import get_current_admin_user
from app.schemas.complaint import (
    ComplaintResponse,
    ComplaintListResponse,
    ComplaintStatusUpdateRequest,
    DashboardStatsResponse
)
from app.db.supabase import supabase_client
from app.services.agent_workflow import log_complaint_action

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)


@router.get("/complaints", response_model=ComplaintListResponse)
async def list_all_complaints(
    page: int = 1,
    page_size: int = 50,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """
    List all complaints with advanced filtering for admin dashboard
    
    Requires admin authentication.
    """
    try:
        offset = (page - 1) * page_size
        
        query = supabase_client.table("complaints").select("*", count="exact")
        
        # Apply status filter
        if status_filter:
            query = query.eq("status", status_filter)
        
        # Apply search filter (search in category, description, or landmark)
        if search:
            query = query.or_(f"category.ilike.%{search}%,description.ilike.%{search}%,landmark.ilike.%{search}%")
        
        # Execute with pagination
        response = query.order("created_at", desc=True).range(offset, offset + page_size - 1).execute()
        
        complaints = [ComplaintResponse(**c) for c in response.data]
        
        return ComplaintListResponse(
            complaints=complaints,
            total=response.count or 0,
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        logger.error(f"Admin list complaints failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve complaints"
        )


@router.put("/complaints/{complaint_id}", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: str,
    update: ComplaintStatusUpdateRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """
    Update complaint status manually (admin action)
    
    Requires admin authentication.
    """
    try:
        # Fetch current complaint
        complaint_response = supabase_client.table("complaints").select("*").eq("id", complaint_id).execute()
        
        if not complaint_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )
        
        old_status = complaint_response.data[0]["status"]
        
        # Update status
        updated_complaint = supabase_client.table("complaints").update({
            "status": update.status,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", complaint_id).execute()
        
        # Log the status change
        description = f"Admin {current_admin['email']} changed status from '{old_status}' to '{update.status}'"
        if update.admin_notes:
            description += f". Notes: {update.admin_notes}"
        
        await log_complaint_action(
            complaint_id=complaint_id,
            action_type="status_change",
            description=description,
            metadata={
                "old_status": old_status,
                "new_status": update.status,
                "admin_email": current_admin["email"],
                "admin_notes": update.admin_notes
            }
        )
        
        logger.info(f"Admin updated complaint {complaint_id} status: {old_status} -> {update.status}")
        
        return ComplaintResponse(**updated_complaint.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update complaint status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update complaint status"
        )


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_statistics(
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """
    Get comprehensive dashboard statistics for admin
    
    Returns counts by status and performance metrics
    
    Requires admin authentication.
    """
    try:
        # Get total count
        total_response = supabase_client.table("complaints").select("id", count="exact").execute()
        total = total_response.count or 0
        
        # Get counts by status
        statuses = ["submitted", "in_progress", "escalated", "resolved", "rejected"]
        status_counts = {}
        
        for status_name in statuses:
            response = supabase_client.table("complaints") \
                .select("id", count="exact") \
                .eq("status", status_name) \
                .execute()
            status_counts[status_name] = response.count or 0
        
        # Calculate average resolution time (for resolved complaints)
        resolved_response = supabase_client.table("complaints") \
            .select("created_at, updated_at") \
            .eq("status", "resolved") \
            .execute()
        
        avg_resolution_hours = None
        if resolved_response.data:
            total_hours = 0
            for complaint in resolved_response.data:
                created = datetime.fromisoformat(complaint["created_at"].replace("Z", "+00:00"))
                updated = datetime.fromisoformat(complaint["updated_at"].replace("Z", "+00:00"))
                hours = (updated - created).total_seconds() / 3600
                total_hours += hours
            avg_resolution_hours = total_hours / len(resolved_response.data)
        
        # Calculate SLA compliance rate
        sla_compliance_rate = None
        complaints_with_sla = supabase_client.table("complaints") \
            .select("created_at, updated_at, sla_hours, status") \
            .in_("status", ["resolved", "rejected"]) \
            .execute()
        
        if complaints_with_sla.data:
            compliant_count = 0
            for complaint in complaints_with_sla.data:
                if complaint.get("sla_hours"):
                    created = datetime.fromisoformat(complaint["created_at"].replace("Z", "+00:00"))
                    updated = datetime.fromisoformat(complaint["updated_at"].replace("Z", "+00:00"))
                    actual_hours = (updated - created).total_seconds() / 3600
                    if actual_hours <= complaint["sla_hours"]:
                        compliant_count += 1
            sla_compliance_rate = (compliant_count / len(complaints_with_sla.data)) * 100
        
        return DashboardStatsResponse(
            total_complaints=total,
            submitted=status_counts.get("submitted", 0),
            in_progress=status_counts.get("in_progress", 0),
            escalated=status_counts.get("escalated", 0),
            resolved=status_counts.get("resolved", 0),
            rejected=status_counts.get("rejected", 0),
            avg_resolution_time_hours=avg_resolution_hours,
            sla_compliance_rate=sla_compliance_rate
        )
        
    except Exception as e:
        logger.error(f"Failed to get dashboard stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard statistics"
        )
