"""
Email Service
Handles sending transactional emails via Brevo (SendinBlue)
"""

import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Email service using Brevo API"""
    
    def __init__(self):
        # Configure Brevo API client
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = settings.BREVO_API_KEY
        
        self.api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )
    
    async def send_transactional_email(
        self,
        recipient_email: str,
        subject: str,
        html_content: str,
        recipient_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Send a transactional email via Brevo
        
        Args:
            recipient_email: Email address of the recipient
            subject: Email subject line
            html_content: HTML body of the email
            recipient_name: Optional recipient name
            metadata: Optional metadata for tracking
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # Prepare recipient
            to = [{"email": recipient_email}]
            if recipient_name:
                to[0]["name"] = recipient_name
            
            # Prepare sender
            sender = {
                "email": settings.BREVO_SENDER_EMAIL,
                "name": settings.BREVO_SENDER_NAME
            }
            
            # Create send email object
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=to,
                sender=sender,
                subject=subject,
                html_content=html_content,
                tags=["civicagent", metadata.get("tag", "notification")] if metadata else ["civicagent"]
            )
            
            # Send email
            api_response = self.api_instance.send_transac_email(send_smtp_email)
            
            logger.info(f"Email sent successfully to {recipient_email}. Message ID: {api_response.message_id}")
            return True
            
        except ApiException as e:
            logger.error(f"Brevo API exception when sending email: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to send email to {recipient_email}: {e}")
            return False
    
    async def send_complaint_notification(
        self,
        department_email: str,
        department_name: str,
        complaint_id: str,
        category: str,
        summary: str,
        location: str,
        image_url: Optional[str] = None
    ) -> bool:
        """
        Send initial complaint notification to department
        
        Args:
            department_email: Department contact email
            department_name: Name of the department
            complaint_id: Unique complaint ID
            category: Issue category
            summary: AI-generated summary
            location: Location description
            image_url: Optional image URL
            
        Returns:
            True if sent successfully
        """
        subject = f"[CivicAgent] New {category} Complaint - {complaint_id[:8]}"
        
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .complaint-box {{ background-color: #f3f4f6; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }}
                .footer {{ background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }}
                .button {{ background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏙️ CivicAgent - New Complaint Alert</h1>
            </div>
            <div class="content">
                <p>Dear {department_name} Team,</p>
                
                <p>A new civic issue has been reported and assigned to your department through the CivicAgent system.</p>
                
                <div class="complaint-box">
                    <h3>Complaint Details</h3>
                    <p><strong>Complaint ID:</strong> {complaint_id}</p>
                    <p><strong>Category:</strong> {category}</p>
                    <p><strong>Location:</strong> {location}</p>
                    <p><strong>Summary:</strong></p>
                    <p>{summary}</p>
                </div>
                
                {'<p><strong>Evidence Photo:</strong> <a href="' + image_url + '">View Image</a></p>' if image_url else ''}
                
                <p>Please review this complaint and take appropriate action as per municipal SLA guidelines.</p>
                
                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://civicagent.vercel.app/admin-complaints/{complaint_id}" class="button">View in Dashboard</a>
                </p>
            </div>
            <div class="footer">
                <p>This is an automated notification from CivicAgent - AI-Powered Civic Engagement Platform</p>
                <p>For support, contact: support@civicagent.com</p>
            </div>
        </body>
        </html>
        """
        
        return await self.send_transactional_email(
            recipient_email=department_email,
            subject=subject,
            html_content=html_content,
            recipient_name=department_name,
            metadata={"tag": "complaint_notification", "complaint_id": complaint_id}
        )
    
    async def send_follow_up_email(
        self,
        department_email: str,
        department_name: str,
        complaint_id: str,
        category: str,
        days_pending: int
    ) -> bool:
        """Send follow-up reminder to department"""
        subject = f"[CivicAgent] Follow-up Required - {complaint_id[:8]} ({days_pending} days pending)"
        
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .header {{ background-color: #f59e0b; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .warning-box {{ background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }}
                .footer {{ background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>⚠️ CivicAgent - Follow-up Reminder</h1>
            </div>
            <div class="content">
                <p>Dear {department_name} Team,</p>
                
                <div class="warning-box">
                    <h3>Pending Complaint Requires Attention</h3>
                    <p><strong>Complaint ID:</strong> {complaint_id}</p>
                    <p><strong>Category:</strong> {category}</p>
                    <p><strong>Days Pending:</strong> {days_pending}</p>
                    <p>This complaint has been pending for {days_pending} days. Please update the status or provide an update.</p>
                </div>
                
                <p>View full details in the admin dashboard.</p>
            </div>
            <div class="footer">
                <p>Automated follow-up from CivicAgent</p>
            </div>
        </body>
        </html>
        """
        
        return await self.send_transactional_email(
            recipient_email=department_email,
            subject=subject,
            html_content=html_content,
            metadata={"tag": "follow_up", "complaint_id": complaint_id}
        )
    
    async def send_escalation_email(
        self,
        escalation_email: str,
        department_name: str,
        complaint_id: str,
        category: str,
        reason: str
    ) -> bool:
        """Send escalation notification to supervisor"""
        subject = f"[CivicAgent] ESCALATED - {complaint_id[:8]} - {category}"
        
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .header {{ background-color: #dc2626; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .escalation-box {{ background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }}
                .footer {{ background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🚨 CivicAgent - Complaint Escalated</h1>
            </div>
            <div class="content">
                <p>Dear Supervisor,</p>
                
                <div class="escalation-box">
                    <h3>Complaint Escalated for Urgent Attention</h3>
                    <p><strong>Complaint ID:</strong> {complaint_id}</p>
                    <p><strong>Department:</strong> {department_name}</p>
                    <p><strong>Category:</strong> {category}</p>
                    <p><strong>Escalation Reason:</strong> {reason}</p>
                </div>
                
                <p>This complaint requires immediate supervisory intervention.</p>
            </div>
            <div class="footer">
                <p>Automated escalation from CivicAgent AI System</p>
            </div>
        </body>
        </html>
        """
        
        return await self.send_transactional_email(
            recipient_email=escalation_email,
            subject=subject,
            html_content=html_content,
            metadata={"tag": "escalation", "complaint_id": complaint_id}
        )


# Global email service instance
email_service = EmailService()
