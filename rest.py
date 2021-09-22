# restAPI controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A
from .common import db, dbo, session, T, cache, auth, logger, authenticated, unauthenticated, flash

from pydal.restapi import RestAPI, Policy
from .settings import MACHINES_FOLDER

policy = Policy()
policy.set('*','GET', authorize=True, limit=1000, allowed_patterns=['*'])
policy.set('*','POST', authorize=True)
policy.set('*','PUT', authorize=True)
policy.set('*','DELETE', authorize=True)

def rows2json (tablename,rows):
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
    import datetime
    try:
        datetime.datetime.strptime(datestring, '%Y-%m-%d')
        return True
    except ValueError:
        return False

@action('api/uuid', method=['GET'])
def generate_unique_id():
    import uuid, bottle, json
    response = bottle.response
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    unique_id = str(uuid.uuid4().hex)
    return json.dumps({"unique_id": unique_id})

# TODO: add header to allow CORS on distant card reader
@action('api/beid', method=['GET'])
def beid():
    import json, bottle
    from base64 import b64encode
    from .beid import scan_readers, read_infos, triggered_decorator
    from time import sleep
    r = scan_readers()[0]
    infos_json = {}
    response = bottle.response
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'
    try:
        # sleep(2)
        infos = read_infos(r, read_photo=True)
        infos['photo'] =  b64encode(infos['photo']).decode('utf8')
        infos_json = json.dumps(infos)
    except Exception as e:
        infos = { 'results': 'cannot read card', 'erreur': e}
        # infos_json = {}
    return infos_json


# TODO: authentification
#  http://localhost:8000/myapp/api/phone?id_auth_user=2&@lookup=phone:id_auth_user -> get phone from auth_user_id
# http://localhost:8000/myapp/api/phone?id_auth_user=2&@lookup=identity!:id_auth_user[first_name,last_name] -> denormalised (flat)
@action('api/<tablename>/', method=['GET','POST','PUT']) # PUT ok
@action('api/<tablename>/<rec_id>', method=['GET','PUT','DELETE']) # delete OK get OK post OK
@action.uses(db)
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
    import os
    upload = request.files.get('upload')
    file1 = open("uploads/called.txt","w")
    file1.write("function called \n")
    file1.close()
    # name, ext = os.path.splitext(upload.filename)
    # if ext not in ('.pdf'):
    #     return 'File extension not allowed.'
    upload.save('uploads/')
    return True

@action('rest/l80', method=['GET'])
def l80():
    import os, json, bottle
    response = bottle.response
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    list = []
    with os.scandir(MACHINES_FOLDER+'/rx/l80/ClientDB') as itr:
        for e in itr:
            if e.is_dir():
                list.append({"file" : e.name, "path" : e.path})
    infos_json = json.dumps(list)
    return infos_json

@action('rest/l80s', method=['GET'])
def l80s():
    import os, json, bottle, re
    response = bottle.response
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    if 'lastname' in request.query:
        lastname = request.query.get('lastname')
    else:
        lastname = ''
    if 'firstname' in request.query:
        firstname = request.query.get('firstname')
    else:
        firstname = ''
    searchList = [lastname, firstname]
    list = []
    workingDir = '/l80/working_dir21/ClientDB'
    with os.scandir(MACHINES_FOLDER+workingDir) as itr:
        for e in itr:
            if e.is_dir(): # check if directory
                if re.search(searchList[0]+'\\w*'+'#'+searchList[1]+'\\w*'+"#",e.name,flags=re.IGNORECASE):
                    list.append({"file" : e.name, "path" : e.path})
                    with os.scandir(MACHINES_FOLDER+workingDir+'/'+e.name) as childitr:
                        exams = []
                        for echild in childitr:
                            if echild.is_dir():
                                rx = []
                                try:
                                    with open(echild.path+'/WF/LeftWF_Meas_1.txt','r') as reader:
                                        s = 0
                                        c = 0
                                        a = 0
                                        for line in reader:
                                            # get SPHERE
                                            if s == 3:
                                                if 'R_3=' in line:
                                                    sph3 = float(line.split('=')[1])
                                                    rx.append({'sph3_le' : sph3})
                                                s -=1
                                            elif s == 2:
                                                if 'R_5=' in line:
                                                    sph5 = float(line.split('=')[1])
                                                    rx.append({'sph5_le' : sph5})
                                                s -=1
                                            elif s == 1:
                                                if 'R_7=' in line:
                                                    sph7 = float(line.split('=')[1])
                                                    rx.append({'sph7_le' : sph7})
                                                s -=1 # s = 0
                                            if '[SPHERE]' in line:
                                                # read 3 next lines to get values
                                                s = 3
                                            # get CYL
                                            if c == 3:
                                                if 'R_3=' in line:
                                                    cyl3 = float(line.split('=')[1])
                                                    rx.append({'cyl3_le' : cyl3})
                                                c -=1
                                            elif c == 2:
                                                if 'R_5=' in line:
                                                    cyl5 = float(line.split('=')[1])
                                                    rx.append({'cyl5_le' : cyl5})
                                                c -=1
                                            elif c == 1:
                                                if 'R_7=' in line:
                                                    cyl7 = float(line.split('=')[1])
                                                    rx.append({'cyl7_le' : cyl7})
                                                c -=1 # c = 0
                                            if '[CYLINDER]' in line:
                                                # read 3 next lines to get values
                                                c = 3
                                            # get AXIS
                                            if a == 3:
                                                if 'R_3=' in line:
                                                    axis3 = float(line.split('=')[1])
                                                    rx.append({'axis3_le' : axis3})
                                                a -=1
                                            elif a == 2:
                                                if 'R_5=' in line:
                                                    axis5 = float(line.split('=')[1])
                                                    rx.append({'axis5_le' : axis5})
                                                a -=1
                                            elif a == 1:
                                                if 'R_7=' in line:
                                                    axis7 = float(line.split('=')[1])
                                                    rx.append({'axis7_le' : axis7})
                                                a -=1 # c = 0
                                            if '[AXIS]' in line:
                                                # read 3 next lines to get values
                                                a = 3
                                            # get PD
                                            if 'Pd=' in line:
                                                pd_le = float(line.split('=')[1])
                                                rx.append({'pd_le': pd_le})
                                except: # file not found
                                    pass
                                try:
                                    with open(echild.path+'/WF/RightWF_Meas_1.txt','r') as reader:
                                        s = 0
                                        c = 0
                                        a = 0
                                        for line in reader:
                                            # get SPHERE
                                            if s == 3:
                                                if 'R_3=' in line:
                                                    sph3 = float(line.split('=')[1])
                                                    rx.append({'sph3_re' : sph3})
                                                s -=1
                                            elif s == 2:
                                                if 'R_5=' in line:
                                                    sph5 = float(line.split('=')[1])
                                                    rx.append({'sph5_re' : sph5})
                                                s -=1
                                            elif s == 1:
                                                if 'R_7=' in line:
                                                    sph7 = float(line.split('=')[1])
                                                    rx.append({'sph7_re' : sph7})
                                                s -=1 # s = 0
                                            if '[SPHERE]' in line:
                                                # read 3 next lines to get values
                                                s = 3
                                            # get CYL
                                            if c == 3:
                                                if 'R_3=' in line:
                                                    cyl3 = float(line.split('=')[1])
                                                    rx.append({'cyl3_re' : cyl3})
                                                c -=1
                                            elif c == 2:
                                                if 'R_5=' in line:
                                                    cyl5 = float(line.split('=')[1])
                                                    rx.append({'cyl5_re' : cyl5})
                                                c -=1
                                            elif c == 1:
                                                if 'R_7=' in line:
                                                    cyl7 = float(line.split('=')[1])
                                                    rx.append({'cyl7_re' : cyl7})
                                                c -=1 # c = 0
                                            if '[CYLINDER]' in line:
                                                # read 3 next lines to get values
                                                c = 3
                                            # get AXIS
                                            if a == 3:
                                                if 'R_3=' in line:
                                                    axis3 = float(line.split('=')[1])
                                                    rx.append({'axis3_re' : axis3})
                                                a -=1
                                            elif a == 2:
                                                if 'R_5=' in line:
                                                    axis5 = float(line.split('=')[1])
                                                    rx.append({'axis5_re': axis5})
                                                a -=1
                                            elif a == 1:
                                                if 'R_7=' in line:
                                                    axis7 = float(line.split('=')[1])
                                                    rx.append({'axis7_re': axis7})
                                                a -=1 # c = 0
                                            if '[AXIS]' in line:
                                                # read 3 next lines to get values
                                                a = 3
                                            # get PD
                                            if 'Pd=' in line:
                                                pd_re = float(line.split('=')[1])
                                                rx.append({'pd_re': pd_re})
                                except: # file not found
                                    pass
                                    # TOPO
                                try:
                                    with open(echild.path+'/Topo/RightTopo_Meas_1.txt','r') as reader:
                                        k = 0
                                        for line in reader:
                                            # get Sim_K
                                            if k == 6:
                                                if 'K1=' in line:
                                                    k1 = float(line.split('=')[1])
                                                    rx.append({'k1_re': k1})
                                                k -=1
                                            elif k == 5:
                                                if 'K1_axis=' in line:
                                                    k1_axis = float(line.split('=')[1])
                                                    rx.append({'k1_axis_re': k1_axis})
                                                k -=1
                                            elif k == 4:
                                                if 'K2=' in line:
                                                    k2 = float(line.split('=')[1])
                                                    rx.append({'k2_re': k2})
                                                k -=1 # s = 0
                                            elif k == 3:
                                                if 'K2_axis=' in line:
                                                    k2_axis = float(line.split('=')[1])
                                                    rx.append({'k2_axis_re': k2_axis})
                                                k -=1
                                            elif k == 2:
                                                if 'Cyl=' in line:
                                                    kcyl = float(line.split('=')[1])
                                                    rx.append({'kcyl_re': kcyl})
                                                k -=1
                                            elif k == 1:
                                                if 'Avg=' in line:
                                                    km = float(line.split('=')[1])
                                                    rx.append({'km_re': km})
                                                k -=1 # k = 0
                                            if '[Sim_K]' in line:
                                                # read 6 next lines to get values
                                                k = 6
                                except: # file not found
                                    pass
                                try:
                                    with open(echild.path+'/Topo/LeftTopo_Meas_1.txt','r') as reader:
                                        k = 0
                                        for line in reader:
                                            # get Sim_K
                                            if k == 6:
                                                if 'K1=' in line:
                                                    k1 = float(line.split('=')[1])
                                                    rx.append({'k1_le': k1})
                                                k -=1
                                            elif k == 5:
                                                if 'K1_axis=' in line:
                                                    k1_axis = float(line.split('=')[1])
                                                    rx.append({'k1_axis_le': k1_axis})
                                                k -=1
                                            elif k == 4:
                                                if 'K2=' in line:
                                                    k2 = float(line.split('=')[1])
                                                    rx.append({'k2_le': k2})
                                                k -=1 # s = 0
                                            elif k == 3:
                                                if 'K2_axis=' in line:
                                                    k2_axis = float(line.split('=')[1])
                                                    rx.append({'k2_axis_le': k2_axis})
                                                k -=1
                                            elif k == 2:
                                                if 'Cyl=' in line:
                                                    kcyl = float(line.split('=')[1])
                                                    rx.append({'kcyl_le': kcyl})
                                                k -=1
                                            elif k == 1:
                                                if 'Avg=' in line:
                                                    km = float(line.split('=')[1])
                                                    rx.append({'km_le': km})
                                                k -=1 # k = 0
                                            if '[Sim_K]' in line:
                                                # read 6 next lines to get values
                                                k = 6
                                except: # file not found
                                    pass
                                exams.append({echild.name:rx})
                        list[-1]['exams'] = exams
    infos_json = json.dumps(list)
    return infos_json
