# restAPI controllers

import json

from py4web import (  # add response to throw http error 400
    URL,
    Field,
    abort,
    action,
    redirect,
    request,
    response,
)
from pydal.restapi import Policy, RestAPI
from yatl.helpers import A

from .common import (  # ,dbo
    T,
    auth,
    authenticated,
    cache,
    db,
    flash,
    logger,
    session,
    unauthenticated,
)
from .settings import COMPANY_LOGO, SMTP_LOGIN, SMTP_SENDER, SMTP_SERVER, UPLOAD_FOLDER

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


@action("api/uuid", method=["GET"])
def generate_unique_id():
    """
    Generate a unique ID (Universally Unique Identifier - UUID) and return it as a JSON response.

    This function is a route handler used in the py4web framework to handle HTTP GET requests
    targeting the 'api/uuid' endpoint.

    Dependencies:
        - uuid: The uuid module is used to generate the unique identifier.
        - json: The json module is used to convert the response data to a JSON string.

    Returns:
        str: A JSON string representing the response containing the generated unique ID.

    Example:
        HTTP GET Request: /api/uuid
        Response:
        {
            "unique_id": "d81d4fae-7d58-4d9f-97d4-9ba66a3e77ad"
        }
    """
    import json
    import uuid

    response.headers["Content-Type"] = "application/json;charset=UTF-8"
    unique_id = str(uuid.uuid4().hex)
    return json.dumps({"unique_id": unique_id})


# TODO: add header to allow CORS on distant card reader
# TODO: check if triggered_decorator is necessary
# TODO: check if sleep is necesary for allowing time to read card, or use async ?
@action("api/beid", method=["GET"])
def beid():
    """
    Get informations contained in the Belgium EID card and return them as a JSON response

    This function is a route handler used in the py4web framework to handle HTTP GET requests
    targeting the 'api/beid' endpoint.
    Dependencies:
        - beid: module to read eid.
        - base64: The base64 module is used to convert the image ID in base64 for export to view

    Returns:
        str: A JSON string representing the response contained in the EID.

    """
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


# TODO: authentification
# TODO: correct password PUT -> does not work
@action("api/<tablename>/", method=["GET", "POST", "PUT"])  # PUT ok
@action(
    "api/<tablename>/<rec_id>", method=["GET", "PUT", "DELETE"]
)  # delete OK get OK post OK
@action.uses(db, session)
def api(tablename, rec_id=None):
    """
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
    """
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

    if tablename == "auth_user" and request.method == "PUT" and "id" in request.json:
        row = db(db.auth_user.id == request.json["id"]).select(db.auth_user.ALL).first()
        if "password" not in request.json:
            request.json["password"] = row.password
        if "email" not in request.json:
            request.json["email"] = row.email
        if "first_name" not in request.json:
            request.json["first_name"] = row.first_name
        if "last_name" not in request.json:
            request.json["last_name"] = row.last_name
        if "username" not in request.json:
            request.json["username"] = row.username

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


@action("api/email/send", method=["POST"])
def send_email():
    """
    Send an email using SMTP server.

    Parameters:
    - recipient: The email address of the recipient.
    - title: The subject of the email.
    - content: The main content/body of the email.
    - company_logo: URL or path to the company logo.
    - sender_name: The name of the sender.
    - sender_quality: The title or position of the sender.

    Returns:
    - JSON-formatted response indicating the result of the email sending operation.
    """
    import json
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    payload = request.json
    sender_name, sender_quality = "Mamisoa Andriantafika", "MD, FEBO"
    title, content = "Informations | Centre Médical Bruxelles-Schuman", "content"
    username, password = SMTP_LOGIN.split("::")
    smtp_server, port = SMTP_SERVER.split(":")
    company_logo = COMPANY_LOGO

    if "recipient" not in payload:
        return json.dumps('{ "status": "error", "message": "No recipient"}')

    for key in request.json:
        if key == "recipient":
            recipient = payload["recipient"]
        if key == "title":
            title = payload["title"]
        if key == "content":
            content = payload["content"]
        if key == "sender_name":
            sender_name = payload["sender_name"]

    # HTML template
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

    # Create the MIMEText object
    msg = MIMEMultipart("alternative")
    msg["Subject"] = title
    msg["From"] = username
    msg["To"] = recipient

    # Attach the HTML content to the email
    msg.attach(MIMEText(html_template, "html"))

    try:
        # Send the email
        with smtplib.SMTP(smtp_server, port) as server:
            server.starttls()  # Secure the connection using TLS
            server.login(username, password)
            server.sendmail(username, recipient, msg.as_string())

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
        response = {"status": "error", "message": str(e)}

    return json.dumps(response)
