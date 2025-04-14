# restAPI controllers
#
# COMPATIBILITY NOTICE:
# This file is being gradually migrated to a modular structure in the 'api/' directory.
# New code should be added to the appropriate modules in 'api/endpoints/'.
# This file is maintained for backward compatibility during the transition.

import base64
import binascii
import datetime
import json
import traceback

from py4web import action, request, response  # add response to throw http error 400
from pydal.restapi import Policy, RestAPI

# Import the modular API endpoints
# This ensures the endpoints are registered with py4web
from .api import beid, email, endpoint_utils
from .common import (  # ,dbo
    T,
    auth,
    authenticated,
    cache,
    db,
    logger,
    session,
    unauthenticated,
)
from .models import str_uuid
from .settings import APP_NAME, COMPANY_LOGO, SMTP_LOGIN, SMTP_SERVER, UPLOAD_FOLDER

# Legacy policy configuration - new code should use api.default_policy
policy = Policy()
policy.set("*", "GET", authorize=True, limit=1000, allowed_patterns=["*"])
policy.set("*", "POST", authorize=True)
policy.set("*", "PUT", authorize=True)
policy.set("*", "DELETE", authorize=True)


def rows2json(tablename, rows):
    """
    Converts a list of rows from a table into a JSON string.

    This function converts each row in the input list into a JSON object. If the row contains a datetime or date object,
    it is converted into a string format using strftime. The format for datetime is '%Y-%m-%d %T' and for date, it is '%Y-%m-%d'.
    The resulting JSON objects are concatenated into a single JSON array, which is then wrapped into a JSON object with the table name as the key.

    Parameters:
    tablename (str): The name of the table which the rows belong to. This is used as the key in the resulting JSON object.
    rows (pandas.DataFrame or similar): A list-like object of rows to be converted into a JSON string. Each row should be a dictionary-like object where the keys correspond to the column names and the values correspond to the data in each cell.

    Returns:
    str: A string representation of the JSON object that contains the table data.

    Raises:
    TypeError: If any of the values in the rows are neither serializable as JSON nor instances of datetime.datetime or datetime.date.
    """
    import datetime
    import json

    def date_handler(obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime(str(T("%Y-%m-%d %T")))  # (str(T('%d/%m/%Y %T')))
        elif isinstance(obj, datetime.date):
            return obj.strftime(str(T("%Y-%m-%d")))  # (str(T('%d/%m/%Y')))
        else:
            return False

    rows = rows.as_list()
    concat = '{ "' + tablename + '": ['
    for row in rows:
        concat = concat + json.dumps(row, default=date_handler) + ","
    concat = concat.strip(",")
    concat = concat + "]}"
    return concat


def valid_date(datestring):
    """
    Check if a given date string is a valid date in the format 'YYYY-MM-DD'.

    Parameters:
        datestring (str): A string representing a date in the format 'YYYY-MM-DD'.

    Returns:
        bool: True if the datestring is a valid date, False otherwise.

    Example:
        >>> valid_date('2023-07-23')
        True
        >>> valid_date('2023-13-40')
        False
    """
    import datetime

    try:
        datetime.datetime.strptime(datestring, "%Y-%m-%d")
        return True
    except ValueError:
        return False


# COMPATIBILITY NOTICE:
# The generate_unique_id function has been moved to api/endpoints/utils.py
# This function definition is commented out to avoid route conflicts
"""
@action("api/uuid", method=["GET"])
def generate_unique_id():
    import json
    import uuid

    response.headers["Content-Type"] = "application/json;charset=UTF-8"
    unique_id = str(uuid.uuid4().hex)
    return json.dumps({"unique_id": unique_id})
"""


# COMPATIBILITY NOTICE:
# The beid function has been moved to api/endpoints/devices/beid.py
# This function definition is commented out to avoid route conflicts
"""
@action("api/beid", method=["GET"])
def beid():
    import json
    from base64 import b64encode
    from time import sleep

    from .beid import read_infos, scan_readers, triggered_decorator

    r = scan_readers()[0]
    infos_json = {}
    response.headers["Content-Type"] = "application/json;charset=UTF-8"
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = (
        "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
    )
    try:
        # sleep(2)
        infos = read_infos(r, read_photo=True)
        infos["photo"] = b64encode(infos["photo"]).decode("utf8")
    except Exception as e:
        infos = {"results": "cannot read card", "erreur": e.args}
    infos_json = json.dumps(infos)
    return infos_json
"""


# TODO: authentification
# TODO: correct password PUT -> does not work

# COMPATIBILITY NOTICE:
# The api function has been moved to api/endpoints/auth.py
# This function definition is commented out to avoid route conflicts
"""
@action("api/<tablename>/", method=["GET", "POST", "PUT"])  # PUT ok
@action(
    "api/<tablename>/<rec_id>", method=["GET", "PUT", "DELETE"]
)  # delete OK get OK post OK
@action.uses(db, session)
def api(tablename, rec_id=None):
    \"\"\"
    API endpoint for GET, POST, PUT, DELETE a row in a table

    Args:
        tablename (str): name of the table
        rec_id (int): id of the row for PUT or DELETE
    Returns:
        str: a JSON response from py4web
    Raises:
        ValueError: 400 values are not valid
    Exemples:
        http://localhost:8000/'+APP_NAME+'/api/phone?id_auth_user=2&@lookup=phone:id_auth_user -> get phone from auth_user_id
        http://localhost:8000/'+APP_NAME+'/api/phone?id_auth_user=2&@lookup=identity!:id_auth_user[first_name,last_name] -> denormalised (flat)
    \"\"\"
    logger.info(
        f"API Request - Method: {request.method}, Table: {tablename}, ID: {rec_id}"
    )
    logger.info(f"Request JSON: {request.json}")
    logger.info(f"Request GET params: {request.GET}")
    logger.info(f"Request URL: {request.url}")
    logger.info(f"Request path: {request.path}")

    # Enable necessary fields
    db.phone.id_auth_user.writable = db.address.id_auth_user.writable = True
    db.phone.id_auth_user.readable = db.address.id_auth_user.readable = True
    db.auth_user.password.readable = True
    db.auth_user.password.writable = True
    db.address.created_by.readable = db.address.modified_by.readable = (
        db.address.created_on.readable
    ) = db.address.modified_on.readable = db.address.id_auth_user.readable = True
    db.auth_user.created_by.readable = db.auth_user.modified_by.readable = (
        db.auth_user.created_on.readable
    ) = db.auth_user.modified_on.readable = True
    db.phone.created_by.readable = db.phone.modified_by.readable = (
        db.phone.created_on.readable
    ) = db.phone.modified_on.readable = db.phone.id_auth_user.readable = True
    db.worklist.created_by.readable = db.worklist.modified_by.readable = (
        db.worklist.created_on.readable
    ) = db.worklist.modified_on.readable = db.worklist.id_auth_user.readable = True
    db.photo_id.created_by.readable = db.photo_id.modified_by.readable = (
        db.photo_id.created_on.readable
    ) = db.photo_id.modified_on.readable = db.photo_id.id_auth_user.readable = True

    if tablename == "auth_user" and request.method == "PUT":
        try:
            logger.info(f"Processing PUT request for auth_user")
            logger.info(f"Request data: {request.json}")

            # Get the existing user record
            user_id = request.json.get("id") or rec_id
            if not user_id:
                return {
                    "status": "error",
                    "message": "No user ID provided",
                    "code": 400,
                }

            row = db(db.auth_user.id == user_id).select(db.auth_user.ALL).first()
            if not row:
                logger.error(f"User not found with ID: {user_id}")
                return {"status": "error", "message": "User not found", "code": 404}

            # Parse the data field if it's a string
            data = request.json.get("data")
            if isinstance(data, str):
                try:
                    data = json.loads(data)
                except json.JSONDecodeError as e:
                    logger.error(f"JSON parsing error: {str(e)}")
                    return {
                        "status": "error",
                        "message": f"Invalid JSON data: {str(e)}",
                    }
            else:
                data = request.json

            logger.info(f"Processed data for update: {data}")

            # Store original password validation state
            original_requires = db.auth_user.password.requires

            try:
                # Always preserve existing password in updates unless explicitly changed
                if "password" not in data or not data.get("password"):
                    logger.info(
                        "No password in update data, preserving existing password"
                    )
                    data["password"] = row.password
                    # Disable password validation since we're using the existing password
                    db.auth_user.password.requires = None
                    logger.info("Password validation disabled for this update")
                else:
                    logger.info(
                        "Password field present in update, will validate new password"
                    )

                # Update user
                logger.info(
                    f"Updating user with data: {json.dumps({k: v for k, v in data.items() if k != 'password'}, indent=2)}"
                )
                db(db.auth_user.id == user_id).update(
                    **{k: v for k, v in data.items() if k in db.auth_user.fields}
                )
                db.commit()
                logger.info("User update successful")

                return {
                    "api_version": "0.1",
                    "code": 200,
                    "errors": {},
                    "status": "success",
                    "id": user_id,
                    "updated": 1,
                }

            finally:
                # Always restore the original password validation
                logger.info("Restoring original password validation")
                db.auth_user.password.requires = original_requires

        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return {"status": "error", "message": str(e)}

    try:
        # Log the state before RestAPI call
        logger.info(
            f"Calling RestAPI with method={request.method}, table={tablename}, id={rec_id}"
        )
        if request.json:
            logger.info(f"Request body: {json.dumps(request.json, indent=2)}")

        # Check if record exists for PUT requests
        if request.method == "PUT" and rec_id:
            record = db(db[tablename].id == rec_id).select().first()
            logger.info(f"Existing record for PUT: {record}")
            if not record:
                logger.error(f"Record not found for id {rec_id}")
                return json.dumps(
                    {"status": "error", "message": "Record not found", "code": 404}
                )

        # Try to get table definition
        try:
            table = db[tablename]
            logger.info(f"Table fields: {[field for field in table.fields]}")
        except Exception as e:
            logger.error(f"Error accessing table: {str(e)}")

        json_resp = RestAPI(db, policy)(
            request.method, tablename, rec_id, request.GET, request.json
        )

        # Log the response
        logger.info(f"RestAPI Response: {json_resp}")

        db.commit()
        return json_resp
    except ValueError as e:
        # Log the error
        logger.error(f"Validation Error: {str(e)}")
        response.status = 400
        return
    except Exception as e:
        # Log any other errors
        logger.error(f"Unexpected Error: {str(e)}")
        response.status = 500
        return json.dumps({"status": "error", "message": str(e)})
"""


# COMPATIBILITY NOTICE:
# The octopus function has been moved to api/endpoints/auth.py
# This function definition is commented out to avoid route conflicts
"""
@action("octopus/api/<tablename>/", method=["GET", "POST", "PUT"])  # PUT ok
@action(
    "octopus/api/<tablename>/<rec_id>", method=["GET", "PUT", "DELETE"]
)  # delete OK get OK post OK
@action.uses(db)
def octopus(tablename, rec_id=None):
    try:
        json_resp = RestAPI(dbo, policy)(
            request.method, tablename, rec_id, request.GET, request.json
        )
        db.commit()
        return json_resp
    except ValueError:
        response.status = 400
        return
"""


# COMPATIBILITY NOTICE:
# The do_upload function has been moved to api/endpoints/upload.py
# This function definition is commented out to avoid route conflicts
"""
@action("upload", method=["POST"])
def do_upload():
    import json
    import os

    import bottle

    response = bottle.response
    response.headers["Content-Type"] = "application/json;charset=UTF-8"
    file = request.files.get("file")
    re_dict = {"filename": file.filename}
    name, ext = os.path.splitext(file.filename)
    if ext not in (".png", ".jpg", ".jpeg", ".webp", ".pdf"):
        re_dict.update({"status": "error", "error": "File extension not allowed."})
        return json.dumps(re_dict)
    try:
        file.save(UPLOAD_FOLDER)
        re_dict.update({"status": "saved"})
    except Exception as e:
        re_dict.update({"status": "error", "error": e.args[0]})
    re = json.dumps(re_dict)
    return re
"""


# COMPATIBILITY NOTICE:
# The send_email function has been moved to api/endpoints/email.py
# This function definition is commented out to avoid route conflicts
"""
@action("api/email/send", method=["POST"])
def send_email():
    import json
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    logger.info("Regular email API called")

    try:
        payload = request.json
        logger.info(f"Regular email request received with keys: {list(payload.keys())}")

        sender_name, sender_quality = "Mamisoa Andriantafika", "MD, FEBO"
        title, content = "Informations | Centre Médical Bruxelles-Schuman", "content"
        username, password = SMTP_LOGIN.split("::")
        smtp_server, port_str = SMTP_SERVER.split(":")
        port = int(port_str)  # Convert port to integer
        company_logo = COMPANY_LOGO

        if "recipient" not in payload:
            logger.error("No recipient in regular email request")
            return json.dumps('{ "status": "error", "message": "No recipient"}')

        for key in request.json:
            if key == "recipient":
                recipient = payload["recipient"]
                logger.info(f"Regular email recipient: {recipient}")
            if key == "title":
                title = payload["title"]
            if key == "content":
                content = payload["content"]
                logger.info(
                    f"Regular email content length: {len(content) if content else 0}"
                )
            if key == "sender_name":
                sender_name = payload["sender_name"]

        # HTML template
        html_template = f'''
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
            '''

        # Create the MIMEText object
        msg = MIMEMultipart("alternative")
        msg["Subject"] = title
        msg["From"] = username
        msg["To"] = recipient
        logger.info(
            f"Regular email prepared: From={username}, To={recipient}, Subject={title}"
        )

        # Attach the HTML content to the email
        msg.attach(MIMEText(html_template, "html"))
        logger.info("HTML content attached to regular email")

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

            # If the email is sent successfully, return a success response
            response = {
                "status": "success",
                "message": "Email sent successfully.",
                "title": title,
                "content": content,
                "recipient": recipient,
            }
        except Exception as e:
            # If there's an error, return an error response
            logger.error(f"Error sending regular email: {str(e)}")
            response = {"status": "error", "message": str(e)}

        return json.dumps(response)

    except Exception as e:
        logger.error(f"Unexpected error in send_email: {str(e)}")
        return json.dumps({"status": "error", "message": f"Unexpected error: {str(e)}"})
"""


# COMPATIBILITY NOTICE:
# The send_email_with_attachment function has been moved to api/endpoints/email.py
# This function definition is commented out to avoid route conflicts
"""
@action("api/email/send_with_attachment", method=["POST"])
def send_email_with_attachment():
    import json
    import smtplib
    import traceback
    from email.mime.application import MIMEApplication
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    logger.info("Email with attachment API called")

    try:
        # Check if request has JSON payload
        if not request.json:
            logger.error("No JSON payload in request")
            return json.dumps(
                {"status": "error", "message": "No JSON payload provided"}
            )

        payload = request.json
        logger.info(f"Email request received with keys: {list(payload.keys())}")

        sender_name, sender_quality = "Mamisoa Andriantafika", "MD, FEBO"
        subject = "Document | Centre Médical Bruxelles-Schuman"
        content = "Veuillez trouver ci-joint votre document."
        username, password = SMTP_LOGIN.split("::")
        smtp_server, port_str = SMTP_SERVER.split(":")
        port = int(port_str)  # Convert port to integer
        company_logo = COMPANY_LOGO

        # Validate required parameters
        if "recipient" not in payload:
            logger.error("No recipient in email request")
            return json.dumps({"status": "error", "message": "No recipient provided"})

        # Extract and validate recipient
        recipient = payload["recipient"]
        if not recipient or "@" not in recipient:
            logger.error(f"Invalid email address: {recipient}")
            return json.dumps({"status": "error", "message": "Invalid email address"})

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
            return json.dumps(
                {"status": "error", "message": "Missing attachment data or name"}
            )

        attachment_data = payload["attachmentData"]
        attachment_name = payload["attachmentName"]
        attachment_type = payload.get("attachmentType", "application/pdf")

        # Validate attachment data
        if not attachment_data:
            logger.error("Empty attachment data")
            return json.dumps({"status": "error", "message": "Empty attachment data"})

        # Check attachment size (rough estimate)
        if len(attachment_data) > 10000000:  # ~10MB limit
            logger.error(f"Attachment too large: {len(attachment_data)} bytes")
            return json.dumps(
                {"status": "error", "message": "Attachment too large (max 10MB)"}
            )

        logger.info(f"Attachment name: {attachment_name}, type: {attachment_type}")
        logger.info(f"Attachment data length: {len(attachment_data)}")

        # HTML template
        html_template = f'''
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
            '''

        # Create the MIMEMultipart object
        msg = MIMEMultipart()
        msg["Subject"] = subject
        msg["From"] = username
        msg["To"] = recipient

        # Attach the HTML content to the email
        msg.attach(MIMEText(html_template, "html"))

        # Decode and attach the PDF
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

                # Validate decoded data (should be at least 100 bytes for a minimal PDF)
                if len(decoded_attachment) < 100:
                    raise ValueError("Decoded data too small to be a valid PDF")

                # Create the attachment part
                logger.info("Creating MIME attachment")
                attachment = MIMEApplication(decoded_attachment, _subtype="pdf")

                # Fix: Properly encode the filename for Content-Disposition header
                try:
                    # Better filename handling with proper encoding for non-ASCII characters
                    from email.utils import encode_rfc2231

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
                return json.dumps(
                    {"status": "error", "message": f"Invalid base64 data: {str(be)}"}
                )
        except Exception as e:
            logger.error(f"Error processing attachment: {str(e)}")
            logger.error(traceback.format_exc())
            return json.dumps(
                {"status": "error", "message": f"Error processing attachment: {str(e)}"}
            )

        try:
            # Send the email
            logger.info(f"Connecting to SMTP server: {smtp_server}:{port}")
            with smtplib.SMTP(smtp_server, port) as server:
                logger.info("Starting TLS")
                server.starttls()  # Secure the connection using TLS
                logger.info("Logging in to SMTP server")
                server.login(username, password)
                logger.info(f"Sending email from {username} to {recipient}")
                server.sendmail(username, recipient, msg.as_string())
                logger.info("Email sent successfully")

            # If the email is sent successfully, return a success response
            response = {
                "status": "success",
                "message": "Email with attachment sent successfully.",
                "subject": subject,
                "recipient": recipient,
            }
            logger.info("Email with attachment sent successfully")
        except smtplib.SMTPException as smtp_error:
            # Handle specific SMTP errors
            logger.error(f"SMTP error sending email: {str(smtp_error)}")
            response = {"status": "error", "message": f"SMTP error: {str(smtp_error)}"}
        except Exception as e:
            # If there's an error, return an error response
            logger.error(f"Error sending email: {str(e)}")
            logger.error(traceback.format_exc())
            response = {"status": "error", "message": str(e)}

        return json.dumps(response)
    except Exception as e:
        logger.error(f"Unexpected error in send_email_with_attachment: {str(e)}")
        logger.error(traceback.format_exc())
        return json.dumps({"status": "error", "message": f"Unexpected error: {str(e)}"})
"""


# COMPATIBILITY NOTICE:
# The worklist_batch function has been moved to api/endpoints/worklist.py
# This function definition is commented out to avoid route conflicts
"""
@action("api/worklist/batch", method=["POST"])
@action.uses(db, session)
def worklist_batch():
    \"\"\"
    Batch endpoint for atomic worklist operations.
    Handles multiple worklist items in a single transaction.

    Expected JSON format:
    {
        "items": [
            {
                "id_auth_user": int,
                "sending_app": str,
                "sending_facility": int,
                "receiving_app": str,
                "receiving_facility": int,
                "message_unique_id": str,
                "procedure": int,
                "provider": int,
                "senior": int,
                "requested_time": datetime,
                "modality_dest": int,
                "laterality": str,
                "status_flag": str
            },
            ...
        ],
        "transaction_id": str  # Optional, for tracking
    }

    Returns:
        JSON response with status and created/updated items
    \"\"\"
    try:
        data = request.json
        logger.info(f"Batch worklist request received: {json.dumps(data, indent=2)}")

        if not data or not isinstance(data.get("items"), list):
            logger.error("Invalid request format - no items array")
            return json.dumps(
                {
                    "status": "error",
                    "message": "Invalid request format. Expected 'items' array.",
                    "code": 400,
                }
            )

        # Ensure we have a transaction_id
        transaction_id = data.get("transaction_id")
        if not transaction_id:
            transaction_id = str_uuid()
            data["transaction_id"] = transaction_id
            logger.info(f"Generated transaction_id: {transaction_id}")

        # Start transaction
        db.commit()  # Commit any pending transactions
        db._adapter.connection.begin()

        created_items = []
        audit_entries = []

        # Create initial audit entry for this transaction
        try:
            audit_id = db.transaction_audit.insert(
                transaction_id=transaction_id,
                operation="batch_create",
                table_name="worklist",
                status="in_progress",
            )
            logger.info(
                f"Created audit entry with ID: {audit_id} for transaction: {transaction_id}"
            )
        except Exception as e:
            logger.error(f"Failed to create audit entry: {str(e)}")
            # Continue even if audit creation fails

        # Validate all items before processing
        patient_id = None
        logger.info(f"Validating {len(data['items'])} worklist items")

        for idx, item in enumerate(data["items"]):
            logger.info(f"Validating item {idx+1}: {json.dumps(item, indent=2)}")

            # Ensure all items are for the same patient
            if patient_id is None:
                patient_id = item.get("id_auth_user")
                logger.info(f"First item patient ID: {patient_id}")
            elif patient_id != item.get("id_auth_user"):
                logger.error(
                    f"Inconsistent patient IDs: {patient_id} vs {item.get('id_auth_user')}"
                )
                raise ValueError("All items in batch must be for the same patient")

            # Validate required fields
            required_fields = [
                "id_auth_user",
                "procedure",
                "provider",
                "senior",
                "requested_time",
                "modality_dest",
                "laterality",
                "status_flag",
            ]
            missing_fields = [f for f in required_fields if f not in item]
            if missing_fields:
                logger.error(
                    f"Missing required fields in item {idx+1}: {', '.join(missing_fields)}"
                )
                raise ValueError(
                    f"Missing required fields: {', '.join(missing_fields)}"
                )

            # Validate field values
            if "laterality" in item and item.get("laterality") not in [
                "both",
                "right",
                "left",
                "none",
            ]:
                logger.error(
                    f"Invalid laterality value in item {idx+1}: {item.get('laterality')}"
                )
                raise ValueError(f"Invalid laterality value: {item.get('laterality')}")

            if "status_flag" in item and item.get("status_flag") not in [
                "requested",
                "processing",
                "done",
                "cancelled",
            ]:
                logger.error(
                    f"Invalid status_flag value in item {idx+1}: {item.get('status_flag')}"
                )
                raise ValueError(
                    f"Invalid status_flag value: {item.get('status_flag')}"
                )

        # Process all items
        logger.info("All items validated, now processing")
        for idx, item in enumerate(data["items"]):
            # Set default values if not provided
            item.setdefault("sending_app", "Oph4Py")
            item.setdefault("sending_facility", 1)
            item.setdefault("receiving_app", "Receiving App")
            item.setdefault("receiving_facility", 1)
            item.setdefault("message_unique_id", str_uuid())
            item.setdefault("counter", 0)

            # Add transaction_id to each item
            item["transaction_id"] = transaction_id

            # Remove any fields that aren't in the worklist table
            item_fields = {k: v for k, v in item.items() if k in db.worklist.fields}

            # Create worklist item
            logger.info(
                f"Inserting item {idx+1} with fields: {json.dumps(item_fields, indent=2)}"
            )
            item_id = db.worklist.insert(**item_fields)
            created_item = db(db.worklist.id == item_id).select().first()
            logger.info(f"Item {idx+1} created with ID: {item_id}")
            created_items.append(created_item)

            # Create individual audit entry for this item
            try:
                audit_entries.append(
                    db.transaction_audit.insert(
                        transaction_id=transaction_id,
                        operation="create",
                        table_name="worklist",
                        record_id=item_id,
                        status="complete",
                    )
                )
            except Exception as e:
                logger.error(f"Failed to create item audit entry: {str(e)}")
                # Continue even if audit creation fails

        # If we got here, all operations succeeded
        logger.info(
            f"All {len(created_items)} items created successfully, committing transaction"
        )
        db.commit()

        # Update the main audit entry to mark as complete
        try:
            db(db.transaction_audit.id == audit_id).update(status="complete")
            db.commit()
        except Exception as e:
            logger.error(f"Failed to update audit entry status: {str(e)}")
            # Don't fail the operation if just the audit update fails

        # Create individual item dictionaries with proper datetime handling
        item_dicts = []
        for item in created_items:
            # Convert to dict and handle datetime conversion
            item_dict = {k: v for k, v in item.as_dict().items()}
            # Convert any datetime objects to strings
            for key, value in item_dict.items():
                if isinstance(value, datetime.datetime):
                    item_dict[key] = value.strftime("%Y-%m-%d %H:%M:%S")
                elif isinstance(value, datetime.date):
                    item_dict[key] = value.strftime("%Y-%m-%d")
            item_dicts.append(item_dict)

        # Create response with the expected format
        response_data = {
            "status": "success",
            "message": "Batch operation completed successfully",
            "items": item_dicts,
            "transaction_id": transaction_id,
        }

        logger.info(
            f"Returning success response for batch operation with {len(item_dicts)} items"
        )
        return json.dumps(response_data)

    except ValueError as e:
        logger.error(f"Validation error in batch operation: {str(e)}")
        # Record failure in audit if we have a transaction_id
        if "transaction_id" in locals() and "audit_id" in locals():
            try:
                db(db.transaction_audit.id == audit_id).update(
                    status="failed", error_message=str(e)
                )
                db.commit()
            except Exception as audit_err:
                logger.error(f"Failed to update audit for error: {str(audit_err)}")

        db.rollback()
        return json.dumps({"status": "error", "message": str(e), "code": 400})
    except Exception as e:
        logger.error(f"Unexpected error in batch operation: {str(e)}")
        logger.error(traceback.format_exc())

        # Record failure in audit if we have a transaction_id
        if "transaction_id" in locals() and "audit_id" in locals():
            try:
                db(db.transaction_audit.id == audit_id).update(
                    status="failed", error_message=str(e)
                )
                db.commit()
            except Exception as audit_err:
                logger.error(f"Failed to update audit for error: {str(audit_err)}")

        db.rollback()
        return json.dumps(
            {
                "status": "error",
                "message": f"Internal server error: {str(e)}",
                "code": 500,
            }
        )
"""

# COMPATIBILITY NOTICE:
# The get_transaction_status function has been moved to api/endpoints/worklist.py
# This function definition is commented out to avoid route conflicts
"""
@action("api/worklist/transaction/<transaction_id>", method=["GET"])
@action.uses(db, session)
def get_transaction_status(transaction_id):
    \"\"\"
    Get the status of a transaction by ID.
    Returns detailed information about the transaction and related items.
    \"\"\"
    try:
        # Get all audit records for this transaction
        audit_records = (
            db(db.transaction_audit.transaction_id == transaction_id).select().as_list()
        )

        # Get all worklist items for this transaction
        worklist_items = (
            db(db.worklist.transaction_id == transaction_id).select().as_list()
        )

        # Convert datetime objects to strings in worklist items
        for item in worklist_items:
            for key, value in item.items():
                if isinstance(value, datetime.datetime):
                    item[key] = value.strftime("%Y-%m-%d %H:%M:%S")
                elif isinstance(value, datetime.date):
                    item[key] = value.strftime("%Y-%m-%d")

        # Convert datetime objects to strings in audit records
        for record in audit_records:
            for key, value in record.items():
                if isinstance(value, datetime.datetime):
                    record[key] = value.strftime("%Y-%m-%d %H:%M:%S")
                elif isinstance(value, datetime.date):
                    record[key] = value.strftime("%Y-%m-%d")

        # Determine overall transaction status
        overall_status = "complete"
        if any(record["status"] == "failed" for record in audit_records):
            overall_status = "failed"
        elif any(record["status"] == "in_progress" for record in audit_records):
            overall_status = "in_progress"
        elif any(record["status"] == "partial" for record in audit_records):
            overall_status = "partial"

        response_data = {
            "transaction_id": transaction_id,
            "status": overall_status,
            "item_count": len(worklist_items),
            "audit_records": audit_records,
            "worklist_items": worklist_items,
        }

        return json.dumps(response_data)
    except Exception as e:
        logger.error(f"Error retrieving transaction {transaction_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return json.dumps(
            {"status": "error", "message": f"Error retrieving transaction: {str(e)}"}
        )
"""

# COMPATIBILITY NOTICE:
# The retry_failed_transaction function has been moved to api/endpoints/worklist.py
# This function definition is commented out to avoid route conflicts
"""
@action("api/worklist/transaction/<transaction_id>/retry", method=["POST"])
@action.uses(db, session)
def retry_failed_transaction(transaction_id):
    \"\"\"
    Retry a failed transaction.
    This endpoint is used to recover from partial or failed transactions.
    \"\"\"
    try:
        # Check if transaction exists and has failed items
        audit_records = db(
            (db.transaction_audit.transaction_id == transaction_id)
            & (db.transaction_audit.status.belongs(["failed", "partial"]))
        ).select()

        if not audit_records:
            return json.dumps(
                {
                    "status": "error",
                    "message": f"No failed operations found for transaction {transaction_id}",
                }
            )

        # Start transaction
        db.commit()  # Commit any pending transactions
        db._adapter.connection.begin()

        # Get the main audit record
        main_audit = (
            db(
                (db.transaction_audit.transaction_id == transaction_id)
                & (db.transaction_audit.operation == "batch_create")
            )
            .select()
            .first()
        )

        if main_audit:
            # Update retry count
            retry_count = main_audit.retry_count + 1
            db(db.transaction_audit.id == main_audit.id).update(
                retry_count=retry_count, status="in_progress"
            )

        # Process each failed item
        recovered_items = []
        failed_items = []

        for audit in audit_records:
            if (
                audit.operation != "batch_create"
                and audit.record_id
                and audit.status in ["failed", "partial"]
            ):
                try:
                    # Update the audit status
                    db(db.transaction_audit.id == audit.id).update(
                        status="in_progress", retry_count=audit.retry_count + 1
                    )

                    # Get the worklist item to retry
                    worklist_item = (
                        db(db.worklist.id == audit.record_id).select().first()
                    )

                    if worklist_item:
                        # Perform recovery logic here
                        # This may involve re-sending to external systems, updating status, etc.
                        db(db.worklist.id == audit.record_id).update(
                            status_flag="requested"
                        )

                        # Mark as recovered
                        db(db.transaction_audit.id == audit.id).update(
                            status="complete"
                        )
                        recovered_items.append(audit.record_id)
                    else:
                        # Item doesn't exist, mark as failed
                        db(db.transaction_audit.id == audit.id).update(
                            status="failed",
                            error_message="Worklist item not found during recovery",
                        )
                        failed_items.append(audit.record_id)

                except Exception as item_error:
                    logger.error(
                        f"Error recovering item {audit.record_id}: {str(item_error)}"
                    )
                    db(db.transaction_audit.id == audit.id).update(
                        status="failed", error_message=str(item_error)
                    )
                    failed_items.append(audit.record_id)

        # Update the main audit record based on results
        if main_audit:
            if failed_items:
                new_status = "partial" if recovered_items else "failed"
            else:
                new_status = "complete"

            db(db.transaction_audit.id == main_audit.id).update(status=new_status)

        # Commit the transaction
        db.commit()

        return json.dumps(
            {
                "status": "success",
                "transaction_id": transaction_id,
                "recovered_items": recovered_items,
                "failed_items": failed_items,
                "message": f"Recovery complete: {len(recovered_items)} items recovered, {len(failed_items)} items failed",
            }
        )

    except Exception as e:
        logger.error(f"Error during transaction recovery: {str(e)}")
        logger.error(traceback.format_exc())
        db.rollback()
        return json.dumps({"status": "error", "message": f"Recovery failed: {str(e)}"})
"""
