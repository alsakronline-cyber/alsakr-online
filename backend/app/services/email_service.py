import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_rfq_email(vendor_email: str, rfq_details: dict):
        """
        Sends an RFQ email to the vendor.
        In a real implementation, this would use a provider like SendGrid or SES.
        For now, we log the action.
        """
        
        subject = f"RFQ: {rfq_details.get('part_name')} - Quote Request"
        
        # Bilingual HTML Template (Mock)
        html_content = f"""
        <html>
            <body>
                <h1>Request for Quotation / طلب عرض سعر</h1>
                <p>Hello,</p>
                <p>We are interested in purchasing the following item:</p>
                <ul>
                    <li><strong>Part Number:</strong> {rfq_details.get('part_number')}</li>
                    <li><strong>Description:</strong> {rfq_details.get('part_description')}</li>
                    <li><strong>Quantity:</strong> {rfq_details.get('quantity')}</li>
                </ul>
                <p>Please reply to this email with your best price and lead time.</p>
                <hr>
                <p dir="rtl">مرحباً،</p>
                <p dir="rtl">نود الحصول على عرض سعر للمنتج التالي:</p>
                <ul dir="rtl">
                    <li><strong>رقم القطعة:</strong> {rfq_details.get('part_number')}</li>
                    <li><strong>الوصف:</strong> {rfq_details.get('part_description')}</li>
                    <li><strong>الكمية:</strong> {rfq_details.get('quantity')}</li>
                </ul>
                <p dir="rtl">يرجى الرد على هذا البريد الإلكتروني بأفضل سعر وموعد للتسليم.</p>
            </body>
        </html>
        """
        
        # Simulate sending
        logger.info(f"Sending email to {vendor_email} with subject: {subject}")
        # print(f"[MOCK EMAIL] To: {vendor_email}\nSubject: {subject}\nBody: {html_content[:100]}...")
        return True
