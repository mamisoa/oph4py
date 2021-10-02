# restAPI controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A
from .common import db, dbo, session, T, cache, auth, logger, authenticated, unauthenticated, flash

from pydal.restapi import RestAPI, Policy
from .settings import MACHINES_FOLDER, L80_FOLDER, VX100_FOLDER

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

def getWF(machine,path,filename,side):
    if machine == 'vx100':
        code = 'utf-16-le'
    elif machine == 'l80':
        code = 'us-ascii'
    else:
        code = 'utf8'
    try:
        with open(path+'/WF/'+filename,'r', encoding=code) as reader:
            s = 0
            c = 0
            a = 0
            rx = []
            for line in reader:
                # get SPHERE
                if s == 3:
                    if 'R_3=' in line:
                        sph3 = float(line.split('=')[1])
                        rx.append({'sph3_'+side : sph3})
                    s -=1
                elif s == 2:
                    if 'R_5=' in line:
                        sph5 = float(line.split('=')[1])
                        rx.append({'sph5_'+side : sph5})
                    s -=1
                elif s == 1:
                    if 'R_7=' in line:
                        sph7 = float(line.split('=')[1])
                        rx.append({'sph7_'+side : sph7})
                    s -=1 # s = 0
                if '[SPHERE]' in line:
                    # read 3 next lines to get values
                    s = 3
                # get CYL
                if c == 3:
                    if 'R_3=' in line:
                        cyl3 = float(line.split('=')[1])
                        rx.append({'cyl3_'+side : cyl3})
                    c -=1
                elif c == 2:
                    if 'R_5=' in line:
                        cyl5 = float(line.split('=')[1])
                        rx.append({'cyl5_'+side : cyl5})
                    c -=1
                elif c == 1:
                    if 'R_7=' in line:
                        cyl7 = float(line.split('=')[1])
                        rx.append({'cyl7_'+side : cyl7})
                    c -=1 # c = 0
                if '[CYLINDER]' in line:
                    # read 3 next lines to get values
                    c = 3
                # get AXIS
                if a == 3:
                    if 'R_3=' in line:
                        axis3 = float(line.split('=')[1])
                        rx.append({'axis3_'+side : axis3})
                    a -=1
                elif a == 2:
                    if 'R_5=' in line:
                        axis5 = float(line.split('=')[1])
                        rx.append({'axis5_'+side: axis5})
                    a -=1
                elif a == 1:
                    if 'R_7=' in line:
                        axis7 = float(line.split('=')[1])
                        rx.append({'axis7_'+side: axis7})
                    a -=1 # c = 0
                if '[AXIS]' in line:
                    # read 3 next lines to get values
                    a = 3
                # get PD
                if 'Pd=' in line:
                    pd_re = float(line.split('=')[1])
                    rx.append({'pd_'+side: pd_re})
        return rx
    except:
        return False

def getTopo(machine,path,filename,side):
    if machine == 'vx100':
        code = 'utf-16-le'
    elif machine == 'l80':
        code = 'us-ascii'
    else:
        code = 'utf8'
    try:
        with open(path+'/Topo/'+filename,'r', encoding=code) as reader:
            topo = []
            k = 0
            for line in reader:
                # get Sim_K
                if k == 6:
                    if 'K1=' in line:
                        k1 = float(line.split('=')[1])
                        topo.append({'k1_'+side: k1})
                    k -=1
                elif k == 5:
                    if 'K1_axis=' in line:
                        k1_axis = float(line.split('=')[1])
                        topo.append({'k1_axis_'+side: k1_axis})
                    k -=1
                elif k == 4:
                    if 'K2=' in line:
                        k2 = float(line.split('=')[1])
                        topo.append({'k2_'+side: k2})
                    k -=1 # s = 0
                elif k == 3:
                    if 'K2_axis=' in line:
                        k2_axis = float(line.split('=')[1])
                        topo.append({'k2_axis_'+side: k2_axis})
                    k -=1
                elif k == 2:
                    if 'Cyl=' in line:
                        kcyl = float(line.split('=')[1])
                        topo.append({'kcyl_'+side: kcyl})
                    k -=1
                elif k == 1:
                    if 'Avg=' in line:
                        km = float(line.split('=')[1])
                        topo.append({'km_'+side: km})
                    k -=1 # k = 0
                if '[Sim_K]' in line:
                    # read 6 next lines to get values
                    k = 6
                #if '[Topo]' in line:
                    # read 6 next lines to get values
                #    k = 6
        return topo
    except:
        return False

@action('rest/scan_visionix/<machine>/', method=['GET']) 
def scan_visionix(machine,lastname='',firstname=''):
    import os,json,bottle,re
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
    list = { 'count': 0, 'results' : []}
    if (machine == 'l80') or (machine == 'vx100'):
        searchList = [searchList[0],searchList[1]]
        if machine == 'l80':
            WORKING_FOLDER = L80_FOLDER
        elif machine == 'vx100':
            WORKING_FOLDER = VX100_FOLDER
        with os.scandir(WORKING_FOLDER) as itr:
            for e in itr:
                if e.is_dir(): # check if directory
                    if re.search(searchList[0]+'\\w*'+'#'+searchList[1]+'\\w*',e.name,flags=re.IGNORECASE):
                        list['results'].append({"file" : e.name, "path" : e.path})
                        list['count'] += 1
    infos_json = json.dumps(list)
    return infos_json

# create a patient folder in visionix L80 or VX100
@action('rest/create_visionix/<machine>/', method=['GET']) 
def scan_visionix(machine,lastname='_',firstname='_',dob='_'):
    import os,json
    res = { 'result': 'success'}
    if 'lastname' in request.query:
        lastname = request.query.get('lastname')
    if 'firstname' in request.query:
        firstname = request.query.get('firstname')
    if (machine == 'l80' or machine == 'vx100'):
        if machine == 'l80':
            folder = L80_FOLDER
            coding= 'latin-1'
        else:
            folder = VX100_FOLDER
            coding = 'utf-8'
        # create file
        filename = lastname + '#' + firstname
        try:
            os.mkdir(folder+'/'+filename)
        except:
            return json.dumps({'result':'error creating folder: '+folder+'/'+filename})
        # add to index and sort
        list = []
        count = 0 #
        try:
            with open(folder+'/'+'Index.txt','r', encoding = coding ) as index:
                for line in index:
                    list.append(line)
                    count +=1
        except:
            return json.dumps({'result':'error reading index:' +folder+'/'+filename + '/Index.txt'})
        # add new patient
        list.append(filename+'*'+lastname+'%'+firstname+'\n')
        # remove counter
        list.remove(list[0])
        list= sorted(list, key=str.casefold)
        list.insert(0,str(count)+'\n')
        try:
            with open(folder+'/'+'Index.txt','w', encoding = coding) as index:
                for line in list:
                    index.write(line)
        except:
            return json.dumps({'result':'error creating index:' +folder+'/'+filename + '/Index.txt'})
    else:
        return json.dumps({'result':'no machine matching found'})
    return json.dumps(res)


@action('rest/machines/<machine>/', method=['GET']) 
def l80s(machine=L80_FOLDER):
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
    dirList = json.loads(scan_visionix(machine,searchList[0],searchList[1]))
    list = []
    if dirList['count'] > 0:
        for folder in dirList['results']:
            with os.scandir(folder['path']) as patientFolderitr:
                exams = []
                for examsFolders in patientFolderitr: # datetime exam folders
                    if examsFolders.is_dir():
                        mes = []
                        with os.scandir(examsFolders.path) as examFolderitr: # topo wf folder
                            for exam in examFolderitr:
                                if exam.is_dir():
                                    with os.scandir(exam.path) as examitr:
                                        for f in examitr:
                                            data = []
                                            if f.is_file():
                                                rx = {}
                                                p = re.compile('(?P<side>Left|Right)(?P<exam>Topo|WF)_Meas_(?P<index>[0-9]+).txt')
                                                m = p.search(f.name) # get the file
                                                if m != None:
                                                    if m.group('exam') == 'WF':
                                                        wf = getWF(machine,examsFolders.path,f.name,m.group('side').lower()) # get the mesures from file
                                                        if wf != False:
                                                            data.append(wf)
                                                        else:
                                                            data.append({examsFolders.path+'/'+f.name:'nothing found!'})
                                                    if m.group('exam') == 'Topo':
                                                        topo = getTopo(machine,examsFolders.path,f.name,m.group('side').lower()) # get the mesures from file
                                                        if topo != False:
                                                            data.append(topo)
                                                        else:
                                                            data.append({examsFolders.path+'/'+f.name:'nothing found!'})
                                                    rx = { m.group('exam')+'_'+m.group('index')+'_'+m.group('side')[0] : data }
                                                # else:
                                                #    rx = { f.name : ' did not match'}
                                                if rx != {}:
                                                    mes.append(rx)
                        exams.append({examsFolders.name : mes })
                list=exams
    infos_json = json.dumps(list)
    return infos_json

@action('rest/update_machine/<machine>/', method=['GET']) 
def update_machine(machine='l80'):
    res = []
    if machine != 'l80':
        return res
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
    # check l80
    if machine == 'l80':
        WORKING_FOLDER = L80_FOLDER
    elif machine == 'vx100':
        WORKING_FOLDER = VX100_FOLDER
    list = []
    with os.scandir(WORKING_FOLDER) as itr:
        for e in itr:
            if e.is_dir(): # check if directory
                if re.search(searchList[0]+'\\w*'+'#'+searchList[1]+'\\w*',e.name,flags=re.IGNORECASE):
                    list.append({"file" : e.name, "path" : e.path})
                    with os.scandir(WORKING_FOLDER+'/'+e.name) as childitr: # in patient folder
                        exams = []
                        for echild in childitr: # in exam folder
                            if echild.is_dir():
                                mes = []
                                with os.scandir(echild.path) as mitr: # exam folder WF or TOPO
                                    for d in mitr:
                                        if d.is_dir():
                                            with os.scandir(d.path) as ditr: # files measure level
                                                # data = []
                                                for f in ditr:
                                                    data = []
                                                    if f.is_file():
                                                        rx = {}
                                                        p = re.compile('(?P<side>Left|Right)(?P<exam>Topo|WF)_Meas_(?P<index>[0-9]+).txt')
                                                        m = p.search(f.name) # get the file
                                                        if m != None:
                                                            if m.group('exam') == 'WF':
                                                                wf = getWF(machine,echild.path,f.name,m.group('side').lower()) # get the mesures from file
                                                                if wf != False:
                                                                    data.append(wf)
                                                                else:
                                                                    data.append({echild.path+'/'+f.name:'nothing found!'})
                                                            if m.group('exam') == 'Topo':
                                                                topo = getTopo(machine,echild.path,f.name,m.group('side').lower()) # get the mesures from file
                                                                if topo != False:
                                                                    data.append(topo)
                                                                else:
                                                                    data.append({echild.path+'/'+f.name:'nothing found!'})
                                                            rx = { m.group('exam')+'_'+m.group('index')+'_'+m.group('side')[0] : data }
                                                        # else:
                                                        #     rx = { f.name : ' did not match'}
                                                        if rx != {}:
                                                            mes.append(rx)
                                    exams.append({echild.name : mes })
                        list[-1]['exams'] = exams
    infos_json = json.dumps(list)
    return infos_json