"""
Email API Endpoints

This module provides API endpoints for sending emails with and without attachments.
"""

import base64
import binascii
import json
import smtplib
import traceback
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import encode_rfc2231

from py4web import action, request, response

from ...common import logger, session
from ...settings import COMPANY_LOGO, SMTP_LOGIN, SMTP_SERVER
from ..core.base import APIResponse


@action("api/email/send", method=["POST"])
def send_email():
    """
    Send a regular email using SMTP server.

    Expected JSON payload:
        - recipient: Email address of the recipient
        - title: Subject of the email (optional)
        - content: Email body content (optional)
        - sender_name: Name of the sender (optional)

    Returns:
        JSON response with status and details of the email sent
    """
    logger.info("Regular email API called")

    try:
        # Check if request has JSON payload
        payload = request.json
        if not payload:
            logger.error("No JSON payload in request")
            return APIResponse.error(
                message="No JSON payload provided", error_type="invalid_request"
            )

        logger.info(f"Regular email request received with keys: {list(payload.keys())}")

        # Set default values
        sender_name, sender_quality = "Mamisoa Andriantafika", "MD, FEBO"
        title, content = "Informations | Centre Médical Bruxelles-Schuman", "content"

        # Parse SMTP credentials
        username, password = SMTP_LOGIN.split("::")
        smtp_server, port_str = SMTP_SERVER.split(":")
        port = int(port_str)  # Convert port to integer
        company_logo = COMPANY_LOGO

        # Validate recipient
        if "recipient" not in payload:
            logger.error("No recipient in regular email request")
            return APIResponse.error(
                message="No recipient provided", error_type="validation_error"
            )

        # Extract parameters from payload
        recipient = payload["recipient"]
        if "title" in payload:
            title = payload["title"]
        if "content" in payload:
            content = payload["content"]
        if "sender_name" in payload:
            sender_name = payload["sender_name"]

        logger.info(f"Regular email recipient: {recipient}")
        logger.info(f"Regular email content length: {len(content) if content else 0}")

        # Create HTML email template
        html_template = f"""
            <html>
                <body>
                    <div>{content}</div>
                    <br>
                    <p>Cordialement,<br>Vriendelijke groeten,<br>Best regards,</p>
                    <table>
                        <tr>
                            <td><img src="{company_logo}" alt="Company Logo" style="max-width: 100px;"></td>
                            <td>
                                <p>{sender_name}<br>{sender_quality}</p>
                            </td>
                        </tr>
                    </table>
                    <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
                    <p style="font-size: 0.8em; color: #666;">
                        The contents of this e-mail are intended for the named addressee only. It contains information which may be confidential and which may also be privileged. Any non-conform use, dissemination or disclosure of this message is prohibited. If you received it in error, please notify us immediately and then destroy it.
                    </p>
                </body>
            </html>
            """

        # Create the email message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = title
        msg["From"] = username
        msg["To"] = recipient

        # Attach HTML content
        msg.attach(MIMEText(html_template, "html"))

        logger.info(
            f"Regular email prepared: From={username}, To={recipient}, Subject={title}"
        )

        try:
            # Send the email
            logger.info(
                f"Connecting to SMTP server for regular email: {smtp_server}:{port}"
            )
            with smtplib.SMTP(smtp_server, port) as server:
                logger.info("Starting TLS for regular email")
                server.starttls()  # Secure the connection using TLS
                logger.info("Logging in to SMTP server for regular email")
                server.login(username, password)
                logger.info(f"Sending regular email from {username} to {recipient}")
                server.sendmail(username, recipient, msg.as_string())
                logger.info("Regular email sent successfully")

            # Prepare success response
            return APIResponse.success(
                message="Email sent successfully.",
                data={
                    "title": title,
                    "content": content,
                    "recipient": recipient,
                },
            )

        except smtplib.SMTPException as e:
            logger.error(f"SMTP error sending regular email: {str(e)}")
            return APIResponse.error(
                message=f"SMTP error: {str(e)}", error_type="smtp_error"
            )

    except Exception as e:
        logger.error(f"Unexpected error in send_email: {str(e)}")
        logger.error(traceback.format_exc())
        return APIResponse.error(
            message=f"Unexpected error: {str(e)}",
            error_type="server_error",
            status_code=500,
        )


@action("api/email/send_with_attachment", method=["POST"])
def send_email_with_attachment():
    """
    Send an email with a PDF attachment using SMTP server.

    Expected JSON payload:
        - recipient: Email address of the recipient
        - subject: Subject of the email (optional)
        - content: Email body content (optional)
        - attachmentName: Filename for the attachment
        - attachmentData: Base64-encoded data of the attachment
        - attachmentType: MIME type of the attachment (default: application/pdf)
        - sender_name: Name of the sender (optional)

    Returns:
        JSON response with status and details of the email sent
    """
    logger.info("Email with attachment API called")

    try:
        # Check if request has JSON payload
        payload = request.json
        if not payload:
            logger.error("No JSON payload in request")
            return APIResponse.error(
                message="No JSON payload provided", error_type="invalid_request"
            )

        logger.info(f"Email request received with keys: {list(payload.keys())}")

        # Set default values
        sender_name, sender_quality = "Mamisoa Andriantafika", "MD, FEBO"
        subject = "Document | Centre Médical Bruxelles-Schuman"
        content = "Veuillez trouver ci-joint votre document."

        # Parse SMTP credentials
        username, password = SMTP_LOGIN.split("::")
        smtp_server, port_str = SMTP_SERVER.split(":")
        port = int(port_str)  # Convert port to integer
        company_logo = COMPANY_LOGO

        # Validate recipient
        if "recipient" not in payload:
            logger.error("No recipient in email request")
            return APIResponse.error(
                message="No recipient provided", error_type="validation_error"
            )

        # Extract and validate recipient
        recipient = payload["recipient"]
        if not recipient or "@" not in recipient:
            logger.error(f"Invalid email address: {recipient}")
            return APIResponse.error(
                message="Invalid email address", error_type="validation_error"
            )

        logger.info(f"Email recipient: {recipient}")

        # Get optional parameters
        if "subject" in payload:
            subject = payload["subject"]
        if "content" in payload:
            content = payload["content"]
        if "sender_name" in payload:
            sender_name = payload["sender_name"]

        # Check for required attachment data
        if "attachmentData" not in payload or "attachmentName" not in payload:
            logger.error("Missing attachment data or name in email request")
            return APIResponse.error(
                message="Missing attachment data or name", error_type="validation_error"
            )

        attachment_data = payload["attachmentData"]
        attachment_name = payload["attachmentName"]
        attachment_type = payload.get("attachmentType", "application/pdf")

        # Validate attachment data
        if not attachment_data:
            logger.error("Empty attachment data")
            return APIResponse.error(
                message="Empty attachment data", error_type="validation_error"
            )

        # Check attachment size (rough estimate)
        if len(attachment_data) > 10000000:  # ~10MB limit
            logger.error(f"Attachment too large: {len(attachment_data)} bytes")
            return APIResponse.error(
                message="Attachment too large (max 10MB)", error_type="file_too_large"
            )

        logger.info(f"Attachment name: {attachment_name}, type: {attachment_type}")
        logger.info(f"Attachment data length: {len(attachment_data)}")

        # Create HTML email template
        html_template = f"""
            <html>
                <body>
                    <div>{content}</div>
                    <br>
                    <p>Cordialement,<br>Vriendelijke groeten,<br>Best regards,</p>
                    <table>
                        <tr>
                            <td><img src="{company_logo}" alt="Company Logo" style="max-width: 100px;"></td>
                            <td>
                                <p>{sender_name}<br>{sender_quality}</p>
                            </td>
                        </tr>
                    </table>
                    <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
                    <p style="font-size: 0.8em; color: #666;">
                        The contents of this e-mail are intended for the named addressee only. It contains information which may be confidential and which may also be privileged. Any non-conform use, dissemination or disclosure of this message is prohibited. If you received it in error, please notify us immediately and then destroy it.
                    </p>
                </body>
            </html>
            """

        # Create the email message
        msg = MIMEMultipart()
        msg["Subject"] = subject
        msg["From"] = username
        msg["To"] = recipient

        # Attach the HTML content
        msg.attach(MIMEText(html_template, "html"))

        # Process attachment
        try:
            logger.info("Processing attachment data")

            # Remove the data:application/pdf;base64, prefix if present
            if "," in attachment_data:
                logger.info("Removing base64 prefix")
                attachment_data = attachment_data.split(",", 1)[1]

            # Decode the base64 data
            logger.info("Decoding base64 data")
            try:
                decoded_attachment = base64.b64decode(attachment_data)
                logger.info(f"Decoded attachment size: {len(decoded_attachment)} bytes")

                # Validate decoded data
                if len(decoded_attachment) < 100:
                    raise ValueError("Decoded data too small to be a valid PDF")

                # Create the attachment part
                logger.info("Creating MIME attachment")
                attachment = MIMEApplication(decoded_attachment, _subtype="pdf")

                # Properly encode the filename for Content-Disposition header
                try:
                    encoded_filename = encode_rfc2231(attachment_name, "utf-8")
                    attachment.add_header(
                        "Content-Disposition",
                        f"attachment; filename*={encoded_filename}",
                    )
                    logger.info(f"Set attachment filename to: {attachment_name}")
                except Exception as fn_error:
                    # Fallback to simple header if encoding fails
                    logger.warning(
                        f"Could not encode filename properly: {str(fn_error)}"
                    )
                    attachment.add_header(
                        "Content-Disposition",
                        f'attachment; filename="{attachment_name}"',
                    )

                msg.attach(attachment)
                logger.info("Attachment added to email")

            except binascii.Error as be:
                logger.error(f"Base64 decoding error: {str(be)}")
                return APIResponse.error(
                    message=f"Invalid base64 data: {str(be)}",
                    error_type="data_encoding_error",
                )

        except Exception as e:
            logger.error(f"Error processing attachment: {str(e)}")
            logger.error(traceback.format_exc())
            return APIResponse.error(
                message=f"Error processing attachment: {str(e)}",
                error_type="attachment_error",
            )

        # Send the email
        try:
            logger.info(f"Connecting to SMTP server: {smtp_server}:{port}")
            with smtplib.SMTP(smtp_server, port) as server:
                logger.info("Starting TLS")
                server.starttls()  # Secure the connection using TLS
                logger.info("Logging in to SMTP server")
                server.login(username, password)
                logger.info(f"Sending email from {username} to {recipient}")
                server.sendmail(username, recipient, msg.as_string())
                logger.info("Email sent successfully")

            # Return success response
            return APIResponse.success(
                message="Email with attachment sent successfully.",
                data={
                    "subject": subject,
                    "recipient": recipient,
                },
            )

        except smtplib.SMTPException as smtp_error:
            # Handle specific SMTP errors
            logger.error(f"SMTP error sending email: {str(smtp_error)}")
            return APIResponse.error(
                message=f"SMTP error: {str(smtp_error)}", error_type="smtp_error"
            )

        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            logger.error(traceback.format_exc())
            return APIResponse.error(message=str(e), error_type="sending_error")

    except Exception as e:
        logger.error(f"Unexpected error in send_email_with_attachment: {str(e)}")
        logger.error(traceback.format_exc())
        return APIResponse.error(
            message=f"Unexpected error: {str(e)}",
            error_type="server_error",
            status_code=500,
        )
