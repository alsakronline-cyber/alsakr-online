from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

router = APIRouter()

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

def send_email_task(name: str, email: str, subject: str, message: str):
    try:
        # Create message container
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = settings.SMTP_USER  # Send to admin
        msg['Reply-To'] = email
        msg['Subject'] = f"New Contact Request: {subject}"

        body = f"""
        You have received a new message from the contact form:

        Name: {name}
        Email: {email}
        Subject: {subject}

        Message:
        {message}
        """
        msg.attach(MIMEText(body, 'plain'))

        # Connect to SMTP Server
        server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.sendmail(settings.SMTP_USER, settings.SMTP_USER, msg.as_string())
        server.quit()
        print(f"✅ Email sent from {email}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")

@router.post("/send")
async def send_contact_message(request: ContactRequest, background_tasks: BackgroundTasks):
    """
    Receive contact form submission and send email in background.
    """
    background_tasks.add_task(
        send_email_task, 
        request.name, 
        request.email, 
        request.subject, 
        request.message
    )
    return {"message": "Message sent successfully"}
