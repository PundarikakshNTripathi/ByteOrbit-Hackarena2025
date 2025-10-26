"""
Decision Model Service
Scikit-learn based decision model with SHAP explainability for escalation decisions
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import shap
import joblib
import logging
from pathlib import Path
from typing import Dict, Any, Tuple
from app.db.models import DecisionFeatures

logger = logging.getLogger(__name__)

# Model persistence paths
MODEL_DIR = Path(__file__).parent.parent.parent / "models"
MODEL_PATH = MODEL_DIR / "decision_model.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"


class DecisionModel:
    """
    Decision model for determining complaint follow-up actions
    Uses LogisticRegression for interpretability with SHAP
    """
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.explainer = None
        self.feature_names = [
            "time_since_sla_breach",
            "category_priority",
            "number_of_followups",
            "days_since_submission",
            "status_score"
        ]
        
    def train(self):
        """
        Train the decision model on synthetic data
        Action classes: 0 = send_follow_up, 1 = escalate
        """
        try:
            # Create MODEL_DIR if it doesn't exist
            MODEL_DIR.mkdir(parents=True, exist_ok=True)
            
            # Generate synthetic training data
            np.random.seed(42)
            n_samples = 500
            
            # Features
            time_breach = np.random.uniform(-24, 120, n_samples)  # Hours before/after SLA
            priority = np.random.randint(1, 11, n_samples)  # 1-10
            followups = np.random.randint(0, 5, n_samples)  # Number of follow-ups
            days_since = np.random.uniform(0, 30, n_samples)  # Days since submission
            status_score = np.random.choice([1, 2, 3, 4], n_samples)  # Status encoding
            
            X = np.column_stack([time_breach, priority, followups, days_since, status_score])
            
            # Labels: Escalate if SLA breached significantly OR high priority with multiple follow-ups
            y = np.where(
                (time_breach > 24) | ((priority >= 8) & (followups >= 2)) | (days_since > 14),
                1,  # Escalate
                0   # Follow-up
            ).astype(int)
            
            # Train scaler
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model = LogisticRegression(random_state=42, max_iter=1000)
            self.model.fit(X_scaled, y)
            
            # Initialize SHAP explainer
            self.explainer = shap.LinearExplainer(self.model, X_scaled)
            
            # Save models
            joblib.dump(self.model, MODEL_PATH)
            joblib.dump(self.scaler, SCALER_PATH)
            
            logger.info(f"Decision model trained successfully. Accuracy: {self.model.score(X_scaled, y):.2f}")
            
        except Exception as e:
            logger.error(f"Failed to train decision model: {e}")
            raise
    
    def load(self):
        """Load pre-trained model and scaler"""
        try:
            if MODEL_PATH.exists() and SCALER_PATH.exists():
                self.model = joblib.load(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                logger.info("Decision model loaded successfully")
            else:
                logger.warning("Model files not found. Training new model...")
                self.train()
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            logger.info("Training new model...")
            self.train()
    
    def predict_action(self, features: DecisionFeatures) -> Tuple[str, float]:
        """
        Predict the recommended action for a complaint
        
        Args:
            features: DecisionFeatures object with complaint metrics
            
        Returns:
            Tuple of (action, confidence) where action is "follow_up" or "escalate"
        """
        if self.model is None:
            self.load()
        
        # Prepare feature vector
        X = np.array([[
            features.time_since_sla_breach,
            features.category_priority,
            features.number_of_followups,
            features.days_since_submission,
            features.status_score
        ]])
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        confidence = np.max(self.model.predict_proba(X_scaled)[0])
        
        action = "escalate" if prediction == 1 else "follow_up"
        
        return action, confidence
    
    def explain_prediction(self, features: DecisionFeatures) -> Dict[str, Any]:
        """
        Generate SHAP explanation for a prediction
        
        Args:
            features: DecisionFeatures object
            
        Returns:
            Dictionary with SHAP values and explanation
        """
        if self.model is None or self.explainer is None:
            self.load()
            # Re-initialize explainer if needed
            if self.explainer is None:
                dummy_data = np.random.randn(100, 5)
                X_scaled = self.scaler.transform(dummy_data)
                self.explainer = shap.LinearExplainer(self.model, X_scaled)
        
        # Prepare features
        X = np.array([[
            features.time_since_sla_breach,
            features.category_priority,
            features.number_of_followups,
            features.days_since_submission,
            features.status_score
        ]])
        
        X_scaled = self.scaler.transform(X)
        
        # Get prediction
        action, confidence = self.predict_action(features)
        
        # Calculate SHAP values
        shap_values = self.explainer.shap_values(X_scaled)
        
        # Handle different SHAP value formats
        if isinstance(shap_values, list):
            shap_values_class = shap_values[1][0]  # For escalate class
        else:
            shap_values_class = shap_values[0]
        
        # Build explanation
        shap_dict = {
            name: float(value) for name, value in zip(self.feature_names, shap_values_class)
        }
        
        # Feature importance (absolute SHAP values)
        feature_importance = {
            name: abs(value) for name, value in shap_dict.items()
        }
        
        # Sort by importance
        sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        
        # Generate explanation text
        top_feature = sorted_features[0][0]
        explanation_text = self._generate_explanation_text(action, features, top_feature)
        
        return {
            "action": action,
            "confidence": float(confidence),
            "shap_values": shap_dict,
            "feature_importance": feature_importance,
            "explanation_text": explanation_text
        }
    
    def _generate_explanation_text(self, action: str, features: DecisionFeatures, top_feature: str) -> str:
        """Generate human-readable explanation"""
        if action == "escalate":
            if top_feature == "time_since_sla_breach":
                return f"Escalation recommended because the SLA has been breached by {features.time_since_sla_breach:.1f} hours."
            elif top_feature == "category_priority":
                return f"Escalation recommended due to high priority level ({features.category_priority}/10)."
            elif top_feature == "number_of_followups":
                return f"Escalation recommended after {features.number_of_followups} follow-up attempts."
            else:
                return "Escalation recommended based on overall complaint metrics."
        else:
            return "Follow-up email recommended. Issue is within SLA parameters and escalation not yet warranted."


# Global model instance
decision_model = DecisionModel()
