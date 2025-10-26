"""
AI Reasoning Agent Service
Uses Google Gemini Pro for civic complaint reasoning and report generation
"""

import google.generativeai as genai
from typing import Dict, Any
import json
import logging
from app.core.config import settings
from app.db.models import AIAnalysisResult, AIReasoningResult
from app.db.supabase import supabase_client

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

logger = logging.getLogger(__name__)


# Reference SLA hours based on Swachh Bharat Mission and typical municipal standards
CATEGORY_SLA_MAP = {
    "Garbage Dump": 24,  # 1 day
    "Pothole": 72,  # 3 days
    "Streetlight Out": 48,  # 2 days
    "Broken Footpath": 120,  # 5 days
    "Water Leakage": 12,  # 12 hours (emergency)
    "Illegal Construction": 168,  # 7 days
    "Tree Cutting": 96,  # 4 days
    "Other": 72  # 3 days default
}


CATEGORY_PRIORITY = {
    "Water Leakage": 10,  # Critical
    "Garbage Dump": 8,  # High
    "Pothole": 7,
    "Streetlight Out": 6,
    "Broken Footpath": 5,
    "Illegal Construction": 9,  # High due to safety
    "Tree Cutting": 6,
    "Other": 5
}


async def get_all_departments() -> list:
    """Fetch all departments from database"""
    try:
        response = supabase_client.table("departments").select("*").execute()
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch departments: {e}")
        return []


async def reason_about_complaint(
    vision_result: AIAnalysisResult,
    user_description: str,
    latitude: float,
    longitude: float
) -> AIReasoningResult:
    """
    Use AI reasoning to finalize complaint categorization, assign department,
    generate official summary, and determine SLA
    
    Args:
        vision_result: Result from vision model analysis
        user_description: User's description of the issue
        latitude: Location latitude
        longitude: Location longitude
        
    Returns:
        AIReasoningResult with complete civic agent analysis
    """
    try:
        # Fetch available departments
        departments = await get_all_departments()
        
        if not departments:
            logger.warning("No departments found in database")
            # Create fallback department info
            departments = [
                {"id": "general", "name": "General Municipal Services", 
                 "contact_email": "municipal@civicagent.com", "priority_level": 5}
            ]
        
        # Prepare department information for the AI
        dept_info = "\n".join([
            f"- {dept['name']} (ID: {dept['id']}, Priority: {dept.get('priority_level', 5)})"
            for dept in departments
        ])
        
        # Initialize reasoning model
        model = genai.GenerativeModel(settings.REASONING_MODEL_NAME)
        
        # Craft detailed reasoning prompt
        prompt = f"""
        You are a Civic Agent AI Reasoner for a smart city complaint management system.
        
        VISION ANALYSIS RESULT:
        - Detected Issue: {vision_result.issue}
        - Confidence: {vision_result.confidence}
        - Summary: {vision_result.summary}
        - Severity: {vision_result.severity}
        
        USER PROVIDED INFORMATION:
        - Description: {user_description}
        - Location: ({latitude}, {longitude})
        
        AVAILABLE DEPARTMENTS:
        {dept_info}
        
        TASK:
        1. Finalize the issue category (must be one of: Garbage Dump, Pothole, Streetlight Out, 
           Broken Footpath, Water Leakage, Illegal Construction, Tree Cutting, Other)
        2. Map this to the BEST matching department from the list above
        3. Generate a professional, structured service report summary suitable for municipal officials
        4. Determine the appropriate SLA in hours (reference: Water issues=12h, Garbage=24h, 
           Potholes=72h, Construction=168h)
        5. Assign a priority level (1-10, higher = more urgent)
        
        Return a JSON object with this EXACT structure:
        {{
            "category": "finalized category name",
            "department_id": "exact department ID from the list",
            "department_name": "exact department name",
            "official_summary": "Professional 2-3 sentence summary for officials including location context",
            "sla_hours": 24,
            "priority_level": 8,
            "recommended_action": "Brief action recommendation"
        }}
        
        Be precise and ensure the department_id exactly matches one from the available list.
        """
        
        # Generate reasoning response
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Extract JSON from markdown
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        result_data = json.loads(result_text)
        
        # Validate department exists
        dept_id = result_data.get("department_id")
        dept_exists = any(d["id"] == dept_id for d in departments)
        
        if not dept_exists:
            logger.warning(f"AI suggested non-existent department {dept_id}, using fallback")
            dept_id = departments[0]["id"]
            result_data["department_id"] = dept_id
            result_data["department_name"] = departments[0]["name"]
        
        # Create AIReasoningResult
        reasoning = AIReasoningResult(
            category=result_data.get("category", vision_result.issue),
            department_id=result_data["department_id"],
            department_name=result_data["department_name"],
            official_summary=result_data["official_summary"],
            sla_hours=int(result_data.get("sla_hours", CATEGORY_SLA_MAP.get(result_data.get("category"), 72))),
            priority_level=int(result_data.get("priority_level", CATEGORY_PRIORITY.get(result_data.get("category"), 5))),
            recommended_action=result_data.get("recommended_action", "Forward to department for action")
        )
        
        logger.info(f"AI reasoning complete: {reasoning.category} -> {reasoning.department_name} (SLA: {reasoning.sla_hours}h)")
        return reasoning
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI reasoning response: {e}")
        # Fallback reasoning
        return create_fallback_reasoning(vision_result, departments)
    except Exception as e:
        logger.error(f"AI reasoning failed: {e}")
        raise Exception(f"AI reasoning failed: {str(e)}")


def create_fallback_reasoning(vision_result: AIAnalysisResult, departments: list) -> AIReasoningResult:
    """Create fallback reasoning result when AI fails"""
    category = vision_result.issue
    dept = departments[0] if departments else {"id": "general", "name": "General Services"}
    
    return AIReasoningResult(
        category=category,
        department_id=dept["id"],
        department_name=dept["name"],
        official_summary=f"Civic issue reported: {vision_result.summary}. Manual review required.",
        sla_hours=CATEGORY_SLA_MAP.get(category, 72),
        priority_level=CATEGORY_PRIORITY.get(category, 5),
        recommended_action="Review and assign to appropriate department"
    )
