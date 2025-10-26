"""
Complaints API Endpoints
Handles all complaint-related operations including creation, retrieval, and feedback
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

from app.api.deps import get_current_user, get_optional_user
from app.schemas.complaint import (
    ComplaintCreateRequest,
    ComplaintCreateResponse,
    ComplaintResponse,
    ComplaintDetailResponse,
    ComplaintListResponse,
    ComplaintFeedbackRequest,
    ComplaintActionResponse,
    AIExplanationResponse
)
from app.db.supabase import supabase_client
from app.services.vision_model import analyze_image_for_civic_issue
from app.services.gen_ai import reason_about_complaint
from app.services.agent_workflow import initialize_complaint_workflow, log_complaint_action
from app.services.scheduler import schedule_complaint_followup
from app.services.decision_model import decision_model
from app.db.models import DecisionFeatures
from app.core.config import settings

router = APIRouter(prefix="/complaints", tags=["Complaints"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=ComplaintCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    category: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    landmark: Optional[str] = Form(None),
    image: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new complaint with AI-powered analysis
    
    This is the core endpoint that:
    1. Uploads image to Supabase Storage
    2. Runs AI vision analysis
    3. Runs AI reasoning to assign department and generate official summary
    4. Saves complaint to database
    5. Initializes autonomous follow-up workflow
    6. Schedules first follow-up check
    
    Requires authentication.
    """
    try:
        user_id = current_user["id"]
        complaint_id = str(uuid.uuid4())
        
        # Step 1: Upload image to Supabase Storage
        logger.info(f"Uploading image for complaint {complaint_id}")
        
        # Read image file
        image_bytes = await image.read()
        file_extension = image.filename.split(".")[-1] if image.filename else "jpg"
        storage_path = f"{user_id}/{complaint_id}.{file_extension}"
        
        # Upload to Supabase Storage
        supabase_client.storage.from_(settings.STORAGE_BUCKET).upload(
            path=storage_path,
            file=image_bytes,
            file_options={"content-type": image.content_type or "image/jpeg"}
        )
        
        # Get public URL
        image_url = supabase_client.storage.from_(settings.STORAGE_BUCKET).get_public_url(storage_path)
        
        logger.info(f"Image uploaded successfully: {image_url}")
        
        # Step 2: AI Vision Analysis
        logger.info(f"Starting AI vision analysis for {complaint_id}")
        vision_result = await analyze_image_for_civic_issue(image_url)
        
        # Step 3: AI Reasoning
        logger.info(f"Starting AI reasoning for {complaint_id}")
        location_text = landmark if landmark else f"({latitude}, {longitude})"
        reasoning_result = await reason_about_complaint(
            vision_result=vision_result,
            user_description=description,
            latitude=latitude,
            longitude=longitude
        )
        
        # Calculate SLA deadline
        sla_deadline = datetime.utcnow() + timedelta(hours=reasoning_result.sla_hours)
        
        # Step 4: Save complaint to database
        complaint_data = {
            "id": complaint_id,
            "user_id": user_id,
            "category": category,
            "description": description,
            "landmark": landmark,
            "latitude": str(latitude),
            "longitude": str(longitude),
            "image_url": image_url,
            "status": "submitted",
            "ai_detected_category": vision_result.issue,
            "ai_confidence": int(vision_result.confidence * 100),
            "ai_report": vision_result.summary,
            "assigned_department": reasoning_result.department_id,
            "official_summary": reasoning_result.official_summary,
            "sla_hours": reasoning_result.sla_hours,
            "sla_deadline": sla_deadline.isoformat()
        }
        
        supabase_client.table("complaints").insert(complaint_data).execute()
        
        # Log initial action
        await log_complaint_action(
            complaint_id=complaint_id,
            action_type="submitted",
            description=f"Complaint submitted by user. AI detected: {vision_result.issue} (confidence: {int(vision_result.confidence * 100)}%)",
            metadata={
                "ai_category": vision_result.issue,
                "ai_confidence": vision_result.confidence,
                "assigned_department": reasoning_result.department_name
            }
        )
        
        # Step 5: Initialize workflow (send initial email)
        await initialize_complaint_workflow(
            complaint_id=complaint_id,
            department_id=reasoning_result.department_id,
            category=category,
            summary=reasoning_result.official_summary,
            location_text=location_text,
            image_url=image_url
        )
        
        # Step 6: Schedule follow-up
        schedule_complaint_followup(complaint_id, reasoning_result.sla_hours)
        
        logger.info(f"Complaint {complaint_id} created successfully")
        
        # Prepare response
        complaint_response = ComplaintResponse(**complaint_data)
        
        return ComplaintCreateResponse(
            success=True,
            message="Complaint submitted successfully. AI analysis complete.",
            complaint_id=complaint_id,
            complaint=complaint_response
        )
        
    except Exception as e:
        logger.error(f"Failed to create complaint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create complaint: {str(e)}"
        )


@router.get("/", response_model=ComplaintListResponse)
async def list_complaints(
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    List all complaints with optional filtering
    
    Public endpoint - returns all complaints for the map view
    If authenticated, can filter by user's own complaints
    """
    try:
        offset = (page - 1) * page_size
        
        query = supabase_client.table("complaints").select("*", count="exact")
        
        # Apply filters
        if status_filter:
            query = query.eq("status", status_filter)
        
        # If user is authenticated and requests their own complaints
        if user:
            query = query.eq("user_id", user["id"])
        
        # Execute query with pagination
        response = query.order("created_at", desc=True).range(offset, offset + page_size - 1).execute()
        
        complaints = [ComplaintResponse(**c) for c in response.data]
        
        return ComplaintListResponse(
            complaints=complaints,
            total=response.count or 0,
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        logger.error(f"Failed to list complaints: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve complaints"
        )


@router.get("/{complaint_id}", response_model=ComplaintDetailResponse)
async def get_complaint_detail(
    complaint_id: str,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Get detailed information about a specific complaint including timeline
    
    Public endpoint
    """
    try:
        # Fetch complaint
        complaint_response = supabase_client.table("complaints").select("*").eq("id", complaint_id).execute()
        
        if not complaint_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )
        
        complaint = complaint_response.data[0]
        
        # Fetch actions (timeline)
        actions_response = supabase_client.table("complaint_actions") \
            .select("*") \
            .eq("complaint_id", complaint_id) \
            .order("created_at", desc=False) \
            .execute()
        
        actions = [ComplaintActionResponse(**a) for a in actions_response.data]
        
        # Build response
        detail = ComplaintDetailResponse(**complaint, actions=actions)
        
        return detail
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get complaint detail: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve complaint details"
        )


@router.post("/{complaint_id}/feedback", status_code=status.HTTP_200_OK)
async def submit_feedback(
    complaint_id: str,
    feedback: ComplaintFeedbackRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Submit user feedback for a resolved complaint
    
    Requires authentication. User must be the complaint owner.
    """
    try:
        # Verify complaint exists and belongs to user
        complaint_response = supabase_client.table("complaints") \
            .select("*") \
            .eq("id", complaint_id) \
            .eq("user_id", current_user["id"]) \
            .execute()
        
        if not complaint_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found or access denied"
            )
        
        complaint = complaint_response.data[0]
        
        # Verify complaint is resolved
        if complaint["status"] != "resolved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback can only be submitted for resolved complaints"
            )
        
        # Update complaint with feedback
        supabase_client.table("complaints").update({
            "user_rating": feedback.rating,
            "user_feedback": feedback.feedback,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", complaint_id).execute()
        
        # Log feedback action
        await log_complaint_action(
            complaint_id=complaint_id,
            action_type="status_change",
            description=f"User submitted feedback: {feedback.rating} stars",
            metadata={"rating": feedback.rating, "has_comment": bool(feedback.feedback)}
        )
        
        return {"success": True, "message": "Feedback submitted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to submit feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit feedback"
        )


@router.get("/{complaint_id}/explanation", response_model=AIExplanationResponse)
async def get_ai_explanation(
    complaint_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get XAI (Explainable AI) explanation for the decision model's recommendation
    
    Uses SHAP to explain why the system recommends a particular action (follow-up vs escalate)
    
    Requires authentication.
    """
    try:
        # Fetch complaint
        complaint_response = supabase_client.table("complaints").select("*").eq("id", complaint_id).execute()
        
        if not complaint_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )
        
        complaint = complaint_response.data[0]
        
        # Calculate features (same as in agent_workflow)
        created_at = datetime.fromisoformat(complaint["created_at"].replace("Z", "+00:00"))
        now = datetime.now(created_at.tzinfo)
        days_since_submission = (now - created_at).total_seconds() / 86400
        
        sla_hours = complaint.get("sla_hours", 72)
        sla_deadline = created_at + timedelta(hours=sla_hours)
        time_since_sla_breach = (now - sla_deadline).total_seconds() / 3600
        
        # Get department priority
        category_priority = 5
        if complaint.get("assigned_department"):
            dept_response = supabase_client.table("departments").select("priority_level").eq("id", complaint["assigned_department"]).execute()
            if dept_response.data:
                category_priority = dept_response.data[0].get("priority_level", 5)
        
        # Count follow-ups
        followups_response = supabase_client.table("complaint_actions") \
            .select("id", count="exact") \
            .eq("complaint_id", complaint_id) \
            .eq("action_type", "follow_up") \
            .execute()
        num_followups = followups_response.count or 0
        
        status_scores = {"submitted": 1, "in_progress": 2, "escalated": 3, "resolved": 4, "rejected": 0}
        status_score = status_scores.get(complaint["status"], 1)
        
        # Create features
        features = DecisionFeatures(
            time_since_sla_breach=time_since_sla_breach,
            category_priority=category_priority,
            number_of_followups=num_followups,
            days_since_submission=days_since_submission,
            status_score=status_score
        )
        
        # Get SHAP explanation
        explanation = decision_model.explain_prediction(features)
        
        return AIExplanationResponse(
            complaint_id=complaint_id,
            current_status=complaint["status"],
            recommended_action=explanation["action"],
            shap_values=explanation["shap_values"],
            feature_importance=explanation["feature_importance"],
            explanation_text=explanation["explanation_text"],
            confidence=explanation["confidence"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate explanation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI explanation"
        )
