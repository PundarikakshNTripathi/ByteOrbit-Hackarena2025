"""
Database Models
Pydantic models representing database tables and their relationships
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class Department(BaseModel):
    """Department model representing municipal departments"""
    id: str
    name: str
    contact_email: str
    escalation_email: Optional[str] = None
    description: Optional[str] = None
    priority_level: int = 5  # 1-10, higher = more critical
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Complaint(BaseModel):
    """Complaint model representing civic issue reports"""
    id: str
    user_id: str
    category: str
    description: str
    landmark: Optional[str] = None
    latitude: Decimal
    longitude: Decimal
    image_url: Optional[str] = None
    status: str = "submitted"
    
    # AI-powered fields
    ai_detected_category: Optional[str] = None
    ai_confidence: Optional[int] = None
    ai_report: Optional[str] = None
    assigned_department: Optional[str] = None
    official_summary: Optional[str] = None
    
    # SLA tracking
    sla_hours: Optional[int] = None
    sla_deadline: Optional[datetime] = None
    
    # User feedback
    user_rating: Optional[int] = None
    user_feedback: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ComplaintAction(BaseModel):
    """Complaint action model representing timeline events"""
    id: str
    complaint_id: str
    action_type: str
    description: str
    metadata: Optional[dict] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class User(BaseModel):
    """User model from Supabase Auth"""
    id: str
    email: str
    created_at: datetime
    role: Optional[str] = "user"
    
    model_config = ConfigDict(from_attributes=True)


class AIAnalysisResult(BaseModel):
    """Model for AI vision analysis results"""
    issue: str
    confidence: float
    summary: str
    detected_objects: Optional[List[str]] = []
    severity: Optional[str] = "medium"


class AIReasoningResult(BaseModel):
    """Model for AI reasoning agent results"""
    category: str
    department_id: str
    department_name: str
    official_summary: str
    sla_hours: int
    priority_level: int
    recommended_action: Optional[str] = None


class DecisionFeatures(BaseModel):
    """Features used for decision model prediction"""
    time_since_sla_breach: float
    category_priority: int
    number_of_followups: int
    days_since_submission: float
    status_score: int
