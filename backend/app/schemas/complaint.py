"""
API Schemas for Request/Response Validation
Pydantic schemas for complaint-related endpoints
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# ============= Request Schemas =============

class ComplaintCreateRequest(BaseModel):
    """Schema for creating a new complaint"""
    category: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    landmark: Optional[str] = Field(None, max_length=200)
    latitude: Decimal = Field(..., ge=-90, le=90)
    longitude: Decimal = Field(..., ge=-180, le=180)
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        allowed_categories = [
            "Garbage Dump", "Pothole", "Streetlight Out", 
            "Broken Footpath", "Water Leakage", "Illegal Construction",
            "Tree Cutting", "Other"
        ]
        if v not in allowed_categories:
            raise ValueError(f"Category must be one of: {', '.join(allowed_categories)}")
        return v


class ComplaintFeedbackRequest(BaseModel):
    """Schema for submitting user feedback on resolved complaints"""
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = Field(None, max_length=500)


class ComplaintStatusUpdateRequest(BaseModel):
    """Schema for admin status updates"""
    status: str = Field(..., pattern="^(submitted|in_progress|escalated|resolved|rejected)$")
    admin_notes: Optional[str] = Field(None, max_length=500)


# ============= Response Schemas =============

class ComplaintActionResponse(BaseModel):
    """Schema for complaint action timeline events"""
    id: str
    complaint_id: str
    action_type: str
    description: str
    metadata: Optional[dict] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ComplaintResponse(BaseModel):
    """Schema for complaint response with all details"""
    id: str
    user_id: str
    category: str
    description: str
    landmark: Optional[str]
    latitude: Decimal
    longitude: Decimal
    image_url: Optional[str]
    status: str
    
    # AI fields
    ai_detected_category: Optional[str]
    ai_confidence: Optional[int]
    ai_report: Optional[str]
    assigned_department: Optional[str]
    official_summary: Optional[str]
    
    # SLA tracking
    sla_hours: Optional[int]
    sla_deadline: Optional[datetime]
    
    # Feedback
    user_rating: Optional[int]
    user_feedback: Optional[str]
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ComplaintDetailResponse(ComplaintResponse):
    """Schema for detailed complaint with timeline"""
    actions: List[ComplaintActionResponse] = []


class ComplaintListResponse(BaseModel):
    """Schema for paginated complaint list"""
    complaints: List[ComplaintResponse]
    total: int
    page: int
    page_size: int


class AIExplanationResponse(BaseModel):
    """Schema for XAI explanation response"""
    complaint_id: str
    current_status: str
    recommended_action: str
    shap_values: dict
    feature_importance: dict
    explanation_text: str
    confidence: float


class DashboardStatsResponse(BaseModel):
    """Schema for admin dashboard statistics"""
    total_complaints: int
    submitted: int
    in_progress: int
    escalated: int
    resolved: int
    rejected: int
    avg_resolution_time_hours: Optional[float]
    sla_compliance_rate: Optional[float]


class ComplaintCreateResponse(BaseModel):
    """Schema for successful complaint creation"""
    success: bool
    message: str
    complaint_id: str
    complaint: ComplaintResponse
