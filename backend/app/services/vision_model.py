"""
AI Vision Model Service
Handles image analysis using Google Gemini Pro Vision API
"""

import google.generativeai as genai
from typing import Dict, Any
import json
import logging
from app.core.config import settings
from app.db.models import AIAnalysisResult

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

logger = logging.getLogger(__name__)


async def analyze_image_for_civic_issue(image_url: str) -> AIAnalysisResult:
    """
    Analyze an uploaded image to detect civic issues using Gemini Pro Vision
    
    Args:
        image_url: Public URL of the uploaded image
        
    Returns:
        AIAnalysisResult containing detected issue, confidence, and summary
        
    Raises:
        Exception: If AI analysis fails
    """
    try:
        # Initialize the vision model
        model = genai.GenerativeModel(settings.VISION_MODEL_NAME)
        
        # Craft a detailed prompt for civic issue detection
        prompt = """
        You are an expert civic issue analyzer for a municipal complaint system in India.
        
        Analyze this image and identify the PRIMARY civic issue visible. Focus on infrastructure 
        and public service problems that require municipal action.
        
        Classify the issue into ONE of these categories:
        - Garbage Dump: Overflowing bins, littering, waste accumulation
        - Pothole: Road damage, cracks, potholes
        - Streetlight Out: Non-functional or broken street lights
        - Broken Footpath: Damaged sidewalks, missing tiles, obstacles
        - Water Leakage: Pipe bursts, drainage issues, flooding
        - Illegal Construction: Unauthorized building or encroachment
        - Tree Cutting: Illegal tree felling or dangerous trees
        - Other: Any other civic issue
        
        Return your analysis as a JSON object with this exact structure:
        {
            "issue": "category name from the list above",
            "confidence": 0.95,
            "summary": "A brief 1-2 sentence description of what you see",
            "detected_objects": ["object1", "object2"],
            "severity": "low/medium/high"
        }
        
        Be precise and confident. The confidence should be between 0.7 and 0.99.
        """
        
        # Generate content with the image
        response = model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_url}])
        
        # Parse the JSON response
        result_text = response.text.strip()
        
        # Extract JSON from markdown code blocks if present
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        result_data = json.loads(result_text)
        
        # Validate and create AIAnalysisResult
        analysis = AIAnalysisResult(
            issue=result_data.get("issue", "Other"),
            confidence=float(result_data.get("confidence", 0.85)),
            summary=result_data.get("summary", "Civic issue detected"),
            detected_objects=result_data.get("detected_objects", []),
            severity=result_data.get("severity", "medium")
        )
        
        logger.info(f"Vision analysis complete: {analysis.issue} (confidence: {analysis.confidence})")
        return analysis
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI vision response: {e}")
        # Fallback result
        return AIAnalysisResult(
            issue="Other",
            confidence=0.75,
            summary="Unable to parse detailed analysis. Manual review recommended.",
            detected_objects=[],
            severity="medium"
        )
    except Exception as e:
        logger.error(f"Vision model analysis failed: {e}")
        raise Exception(f"AI vision analysis failed: {str(e)}")


async def validate_image_quality(image_url: str) -> Dict[str, Any]:
    """
    Validate if the image is suitable for analysis (not blurry, has sufficient lighting, etc.)
    
    Args:
        image_url: Public URL of the image
        
    Returns:
        Dictionary with quality metrics
    """
    try:
        model = genai.GenerativeModel(settings.VISION_MODEL_NAME)
        
        prompt = """
        Assess the quality of this image for civic issue detection.
        
        Return a JSON with:
        {
            "is_valid": true/false,
            "quality_score": 0-100,
            "issues": ["list of quality problems if any"],
            "recommendation": "brief message"
        }
        
        Consider: clarity, lighting, focus, relevance to civic issues.
        """
        
        response = model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_url}])
        result_text = response.text.strip()
        
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        
        return json.loads(result_text)
        
    except Exception as e:
        logger.warning(f"Image quality validation failed: {e}")
        return {
            "is_valid": True,
            "quality_score": 75,
            "issues": [],
            "recommendation": "Proceeding with analysis"
        }
