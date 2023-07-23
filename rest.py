# restAPI controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash # ,dbo

from pydal.restapi import RestAPI, Policy
from .settings import UPLOAD_FOLDER

policy = Policy()
policy.set('*','GET', authorize=True, limit=1000, allowed_patterns=['*'])
policy.set('*','POST', authorize=True)
policy.set('*','PUT', authorize=True)
policy.set('*','DELETE', authorize=True)

def rows2json (tablename,rows):
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
            return obj.strftime(str(T('%Y-%m-%d %T'))) #(str(T('%d/%m/%Y %T')))
        elif isinstance(obj, datetime.date):
            return obj.strftime(str(T('%Y-%m-%d'))) # (str(T('%d/%m/%Y')))
        else:
            return False
    rows = rows.as_list()
    concat = '{ "'+tablename+'": ['
    for row in rows:
        concat = concat + json.dumps(row, default=date_handler)+","
    concat = concat.strip(',')
    concat = concat + ']}'
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
        datetime.datetime.strptime(datestring, '%Y-%m-%d')
        return True
    except ValueError:
        return False

@action('api/uuid', method=['GET'])
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
    import uuid, json
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    unique_id = str(uuid.uuid4().hex)
    return json.dumps({"unique_id": unique_id})

# TODO: add header to allow CORS on distant card reader
@action('api/beid', method=['GET'])
def beid():
    """
    Get informations contained in the Belgium EID card and return them as a JSON response

    This function is a route handler used in the py4web framework to handle HTTP GET requests
    targeting the 'api/beid' endpoint.
    Dependencies:
        - uuid: The uuid module is used to generate the unique identifier.
        - json: The json module is used to convert the response data to a JSON string.

    Returns:
        str: A JSON string representing the response contained in the EID.

    """
    import json
    from base64 import b64encode
    from .beid import scan_readers, read_infos, triggered_decorator
    from time import sleep
    r = scan_readers()[0]
    infos_json = {}
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'
    try:
        # sleep(2)
        infos = read_infos(r, read_photo=True)
        infos['photo'] =  b64encode(infos['photo']).decode('utf8')
    except Exception as e:
        infos = { 'results': 'cannot read card', 'erreur': e.args}
    infos_json = json.dumps(infos)
    return infos_json


# TODO: authentification
#  http://localhost:8000/myapp/api/phone?id_auth_user=2&@lookup=phone:id_auth_user -> get phone from auth_user_id
# http://localhost:8000/myapp/api/phone?id_auth_user=2&@lookup=identity!:id_auth_user[first_name,last_name] -> denormalised (flat)
@action('api/<tablename>/', method=['GET','POST','PUT']) # PUT ok
@action('api/<tablename>/<rec_id>', method=['GET','PUT','DELETE']) # delete OK get OK post OK
@action.uses(db,session)
def api(tablename, rec_id=None):
    db.phone.id_auth_user.writable= db.address.id_auth_user.writable = True
    db.phone.id_auth_user.readable = db.address.id_auth_user.readable = True
    db.auth_user.password.readable = True
    db.auth_user.password.writable  = True
    db.address.created_by.readable = db.address.modified_by.readable = db.address.created_on.readable = db.address.modified_on.readable = db.address.id_auth_user.readable = True
    db.auth_user.created_by.readable = db.auth_user.modified_by.readable = db.auth_user.created_on.readable = db.auth_user.modified_on.readable = True
    db.phone.created_by.readable = db.phone.modified_by.readable = db.phone.created_on.readable = db.phone.modified_on.readable = db.phone.id_auth_user.readable = True
    db.worklist.created_by.readable = db.worklist.modified_by.readable = db.worklist.created_on.readable = db.worklist.modified_on.readable = db.worklist.id_auth_user.readable = True
    db.photo_id.created_by.readable = db.photo_id.modified_by.readable = db.photo_id.created_on.readable = db.photo_id.modified_on.readable = db.photo_id.id_auth_user.readable = True
    if (tablename == "auth_user" and request.method == "PUT" and "id" in request.json): # check if email, password, first_name, last_name 
        # request.json["password"]=db(db.auth_user.id == 1).select(db.auth_user.password).first()[0]
        row=db(db.auth_user.id == request.json["id"]).select(db.auth_user.ALL).first()
        if "password" not in request.json:
            request.json["password"]= row.password
        if "email" not in request.json:
            request.json["email"]= row.email
        if "first_name" not in request.json:
            request.json["first_name"]= row.first_name
        if "last_name" not in request.json:
            request.json["last_name"]= row.last_name
        if "username" not in request.json:
            request.json["username"]= row.username
    try:
        json_resp = RestAPI(db,policy)(request.method,tablename,rec_id,request.GET,request.json)
        # json_resp RestAPI(db,policy)(request.method,tablename,rec_id,request.GET,request.POST) 
        db.commit()
        return json_resp
    except ValueError: 
        response.status = 400
        return

@action('octopus/api/<tablename>/', method=['GET','POST','PUT']) # PUT ok
@action('octopus/api/<tablename>/<rec_id>', method=['GET','PUT','DELETE']) # delete OK get OK post OK
@action.uses(db)
def octopus(tablename, rec_id=None):
    try:
        json_resp = RestAPI(dbo,policy)(request.method,tablename,rec_id,request.GET,request.json)
        db.commit()
        return json_resp
    except ValueError: 
        response.status = 400
        return

@action('upload', method=['POST'])
def do_upload():
    import os, json, bottle
    response = bottle.response
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    file = request.files.get('file')
    re_dict = { 'filename': file.filename }
    name, ext = os.path.splitext(file.filename)
    if ext not in ('.png','.jpg','.jpeg','.webp','.pdf'):
        re_dict.update({ 'status' : 'error', 'error' : 'File extension not allowed.'})
        return json.dumps(re_dict)
    try:
        file.save(UPLOAD_FOLDER)
        re_dict.update({ 'status' : 'saved'})
    except Exception as e:
        re_dict.update({ 'status' : 'error', 'error' : e.args[0] })
    re = json.dumps(re_dict)
    return re
