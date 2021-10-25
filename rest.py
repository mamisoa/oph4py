# restAPI controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash # ,dbo

from pydal.restapi import RestAPI, Policy
from .settings import MACHINES_FOLDER, L80_FOLDER, VX100_FOLDER, VX100_XML_FOLDER, UPLOAD_FOLDER, LM_FOLDER

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
    except Exception as e:
        infos = { 'results': 'cannot read card', 'erreur': e.args}
    infos_json = json.dumps(infos)
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

def getWF(machine,path,filename,side,patient):
    from math import pi
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
            rx = { 'patient' : patient , 'file': filename, 'exam' : 'wf', 'side' : side }
            for line in reader:
                # get SPHERE
                if s == 3:
                    if 'R_3=' in line:
                        sph3 = float(line.split('=')[1])
                        rx['sph3'] = sph3
                    s -=1
                elif s == 2:
                    if 'R_5=' in line:
                        sph5 = float(line.split('=')[1])
                        rx['sph5'] = sph5
                    s -=1
                elif s == 1:
                    if 'R_7=' in line:
                        sph7 = float(line.split('=')[1])
                        rx['sph7'] = sph7
                    s -=1 # s = 0
                if '[SPHERE]' in line:
                    # read 3 next lines to get values
                    s = 3
                # get CYL
                if c == 3:
                    if 'R_3=' in line:
                        cyl3 = float(line.split('=')[1])
                        rx['cyl3'] = cyl3
                    c -=1
                elif c == 2:
                    if 'R_5=' in line:
                        cyl5 = float(line.split('=')[1])
                        rx['cyl5'] = cyl5
                    c -=1
                elif c == 1:
                    if 'R_7=' in line:
                        cyl7 = float(line.split('=')[1])
                        rx['cyl7'] = cyl7
                    c -=1 # c = 0
                if '[CYLINDER]' in line:
                    # read 3 next lines to get values
                    c = 3
                # get AXIS
                if a == 3: # en radian !!!
                    if 'R_3=' in line:
                        axis3 = float(line.split('=')[1])*180/pi
                        rx['axis3'] = axis3
                    a -=1
                elif a == 2:
                    if 'R_5=' in line:
                        axis5 = float(line.split('=')[1])*180/pi
                        rx['axis5'] = axis5
                    a -=1
                elif a == 1:
                    if 'R_7=' in line:
                        axis7 = float(line.split('=')[1])*180/pi
                        rx['axis7'] = axis7
                    a -=1 # c = 0
                if '[AXIS]' in line:
                    # read 3 next lines to get values
                    a = 3
                # get PD
                if 'Pd=' in line:
                    pd_re = float(line.split('=')[1])
                    rx['pd'] = pd_re
        return rx
    except:
        return False

def getTopo(machine,path,filename,side,patient):
    if machine == 'vx100':
        code = 'utf-16-le'
    elif machine == 'l80':
        code = 'us-ascii'
    else:
        code = 'utf8'
    try:
        with open(path+'/Topo/'+filename,'r', encoding=code) as reader:
            topo = {'patient' : patient , 'file': filename, 'exam': 'topo', 'side' : side }
            k = 0
            for line in reader:
                # get Sim_K
                if k == 6:
                    if 'K1=' in line:
                        k1 = float(line.split('=')[1])
                        topo['k1'] = k1
                    k -=1
                elif k == 5:
                    if 'K1_axis=' in line:
                        k1_axis = float(line.split('=')[1])
                        topo['k1_axis'] = k1_axis
                    k -=1
                elif k == 4:
                    if 'K2=' in line:
                        k2 = float(line.split('=')[1])
                        topo['k2'] = k2
                    k -=1 # s = 0
                elif k == 3:
                    if 'K2_axis=' in line:
                        k2_axis = float(line.split('=')[1])
                        topo['k2_axis'] = k2_axis
                    k -=1
                elif k == 2:
                    if 'Cyl=' in line:
                        kcyl = float(line.split('=')[1])
                        topo['kcyl'] = kcyl
                    k -=1
                elif k == 1:
                    if 'Avg=' in line:
                        km = float(line.split('=')[1])
                        topo['km'] = km
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

def getARK(machine,path,filename,side,patient):
    from math import pi
    import re
    if machine == 'vx100':
        code = 'utf-16-le'
    elif machine == 'l80':
        code = 'us-ascii'
    else:
        code = 'utf8'
    # p1 = re.compile('(?P<section>\[[A-Z]+\])')
    p1 = re.compile('(?P<section>\[AR\])')
    p2 = re.compile('(?P<key>.+)=(?P<value>.+)')
    rx = {'patient': patient, 'file': filename, 'exam': 'ark', 'side': side}
    try:
        with open(path+'/ARK/'+filename,'r', encoding=code) as reader:
            lines = [ line.split('\n')[0] for line in reader]
        for el in lines:
            m1= p1.search(el)
            if m1 != None:
                flag = True ### to be continued
        return True
    except:
        return False


# check if patient exists in Visionix machines, if so send Json output with corresponding file and path
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

# create XML file for VX100
def createxml_vx100(id='',lastname='',firstname='',dob='',sex=''):
    from xml.dom import minidom
    xmlfolder = VX100_XML_FOLDER
    # set XML file
    root = minidom.Document()
    # root.setAttribute('standalone', 'yes')
    optic = root.createElement('optic')
    root.appendChild(optic)
    optometry = root.createElement('optometry')
    optic.appendChild(optometry)
    # patient node , birthday is compulsory
    patient = root.createElement('patient')
    optometry.appendChild(patient)
    ide = root.createElement('ID')
    patient.appendChild(ide)
    first_name = root.createElement('first_name')
    patient.appendChild(first_name)
    last_name = root.createElement('last_name')
    patient.appendChild(last_name)
    gender = root.createElement('gender')
    patient.appendChild(gender)
    birthday = root.createElement('birthday')
    patient.appendChild(birthday)
    # address
    address = root.createElement('address')
    patient.appendChild(address)
    street = root.createElement('street')
    address.appendChild(street)
    street2 = root.createElement('street2')
    address.appendChild(street2)
    zip = root.createElement('zip')
    address.appendChild(zip)
    city = root.createElement('city')
    address.appendChild(city)
    # contact
    contact = root.createElement('contact')
    patient.appendChild(contact)
    phone = root.createElement('phone')
    contact.appendChild(phone)
    mobile_phone = root.createElement('mobile_phone')
    contact.appendChild(mobile_phone)
    fax = root.createElement('fax')
    contact.appendChild(fax)
    email = root.createElement('email')
    contact.appendChild(email)
    # add text nodes
    first_name.appendChild(root.createTextNode(firstname))
    last_name.appendChild(root.createTextNode(lastname))
    birthday.appendChild(root.createTextNode(dob))
    gender.appendChild(root.createTextNode(sex))
    ide.appendChild(root.createTextNode(id))
    # generate xml
    xmlstr = root.toprettyxml(encoding='UTF-8',indent='\t')
    filename = id + '_'+lastname+'_'+firstname+'_'+dob
    try:
        with open(VX100_FOLDER+ xmlfolder +'/'+filename+'.xml', 'wb') as f:
            f.write(xmlstr)
        return { 'result': 'success'}
    except:
        return { 'result': 'cannot create patient'}

# check if patient exists in folder, if not create folder and update Index.txt
def addpatient_l80(firstname,lastname):
    import os
    folder = L80_FOLDER
    coding= 'latin-1'
    # create file
    filename = lastname + '#' + firstname
    try:
        os.mkdir(folder+'/'+filename)
    except:
        return {'result':'error creating folder: '+folder+'/'+filename}
    # add to index and sort
    list = []
    count = 0
    try:
        with open(folder+'/'+'Index.txt','r', encoding = coding ) as index:
            for line in index:
                list.append(line)
                count +=1
    except:
        return {'result':'error reading index:' +folder+'/'+filename + '/Index.txt'}
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
            return {'result':'success'}
    except:
        return {'result':'error creating index:' +folder+'/'+filename + '/Index.txt'}

# create a patient folder in visionix L80 or VX100
@action('rest/create_visionix/<machine>/', method=['GET']) 
def create_visionix(machine,lastname='_',firstname='_',dob='', id='', sex=''):
    import os,json,bottle
    response = bottle.response
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    res = { 'result': 'error'}
    if 'lastname' in request.query:
        lastname = request.query.get('lastname')
    if 'firstname' in request.query:
        firstname = request.query.get('firstname')
    if 'dob' in request.query:
        dob = request.query.get('dob')
    if 'sex' in request.query:
        sex = request.query.get('sex')
    if 'id' in request.query:
        id = request.query.get('id')
    if (machine == 'l80' or machine == 'vx100'):
        if machine == 'l80':
            res = addpatient_l80(firstname,lastname)
        elif machine == 'vx100':
            res = createxml_vx100(id,lastname,firstname,dob,sex)
    else:
        res = { 'result': 'no matching machine'}
    # default res = error
    return json.dumps(res)

# bootstrap-table optimized JSON output from Visionix machines L80/VX100
@action('rest/machines/<machine>/', method=['GET']) 
def get_visionix_mes(machine=L80_FOLDER):
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
    if 'side' in request.query:
        side = request.query.get('side')
    else:
        side = 'both'
    searchList = [lastname, firstname]
    dirList = json.loads(scan_visionix(machine,searchList[0],searchList[1]))
    list = []
    if dirList['count'] > 0:
        exams = { 'count' : 0 , 'mesurements' : [] }
        for folder in dirList['results']:
            patient = {'patient': folder['file'], 'count' : 0 , 'mesurements' : [] }
            with os.scandir(folder['path']) as patientFolderitr:
                for examsFolders in patientFolderitr: # datetime exam folders
                    if examsFolders.is_dir():
                        mes = []
                        # format examsFoldername
                        month = { 'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04',
                                'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug': '08',
                                'Sep' : '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' }
                        dateFolderList = (examsFolders.name).split(' ')
                        dateFolderList[1] = month[dateFolderList[1]] # replace month str by num
                        yearTimeList = (dateFolderList.pop(-1)).split('#') # extrude  and list year,time
                        yearTimeList[1] = ':'.join(yearTimeList[1].split('-')) # replace - by : in time
                        dateFolderList.append(yearTimeList[0]) # year
                        dateFolderList.reverse()
                        dateFolder = '-'.join(dateFolderList)
                        dateFolder += 'T'+yearTimeList[1] 
                        with os.scandir(examsFolders.path) as examFolderitr: # topo wf folder
                            for exam in examFolderitr:
                                if exam.is_dir():
                                    with os.scandir(exam.path) as examitr:
                                        for f in examitr:
                                            data = [] # contains all mesurements for a specific date
                                            if f.is_file():
                                                p = re.compile('(?P<side>Left|Right)(?P<exam>Topo|WF|ARK)_Meas_(?P<index>[0-9]+).txt')
                                                m = p.search(f.name) # get the file
                                                if m != None:
                                                    if (m.group('side').lower() == side or side == 'both'):
                                                        patient['count'] +=1
                                                        if m.group('exam') == 'WF':
                                                            wf = getWF(machine,examsFolders.path,f.name,m.group('side').lower(),folder['file']) # get the mesures from file
                                                            if wf != False:
                                                                exams['count'] += 1
                                                                wf['date'] = dateFolder
                                                                data.append(wf)
                                                            else:
                                                                data.append({examsFolders.path+'/'+f.name:'nothing found!'})
                                                        if m.group('exam') == 'Topo':
                                                            topo = getTopo(machine,examsFolders.path,f.name,m.group('side').lower(),folder['file']) # get the mesures from file
                                                            if topo != False:
                                                                exams['count'] += 1
                                                                topo['date'] = dateFolder
                                                                data.append(topo)
                                                            else:
                                                                data.append({examsFolders.path+'/'+f.name:'nothing found!'})
                                                        if m.group('exam') == 'ARK':
                                                            ark = getARK(machine, examsFolders.path, f.name, m.group(
                                                                'side').lower(), folder['file'])  # get the mesures from file
                                                            if ark != False:
                                                                exams['count'] += 1
                                                                topo['date'] = dateFolder
                                                                data.append(ark)
                                                            else:
                                                                data.append({examsFolders.path+'/'+f.name: 'nothing found!'})
                                            if data != []:
                                                mes.extend(data)
                        exams['mesurements'].extend(mes)
            # exams.append(patient)
        list=exams
    infos_json = json.dumps(list)
    return infos_json

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

# side R or L
def xmlLm2dict(side):
    path = './/nsLM:'+side+'/'
    lmdict = {
        'lmSph'+side : path+'nsLM:Sphere',
        'lmCyl'+side : path+'nsLM:Cylinder',
        'lmAxis'+side : path+'nsLM:Axis',
        'lmAxis'+side : path+'nsLM:Axis',
        'lmH'+side : path+'nsLM:H',
        'lmV'+side : path+'nsLM:V',
    }
    return lmdict

@action('readCv5000Xml', methods=['GET'])
# origin: lm, rm, export
# import from CV export and delete file
def readCv5000Xml(origin):
    import os,json,bottle
    from lxml import etree as ET
    response = bottle.response
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    with open(LM_FOLDER+'/M-Serial4011_20211023_124344281_TOPCON_CL-300_00.xml') as xmlfile:
        tree = ET.parse(xmlfile)
    root = tree.getroot()
    ns = {'xsi': 'http://www.w3.org/2001/XMLSchema-instance', 
        'nsCommon': 'http://www.joia.or.jp/standardized/namespaces/Common',
        'nsLM': 'http://www.joia.or.jp/standardized/namespaces/LM'}
    lm = { 'status': 'OK' , 'mesures' : {}}
    try:
        r = xmlLm2dict('R')
        for mes in r:
            lm['mesures'].update({ mes : [ el.text for el in tree.iterfind(r[mes],ns)][0]})
        l = xmlLm2dict('L')
        for mes in l:
            lm['mesures'].update({ mes : [ el.text for el in tree.iterfind(l[mes],ns)][0]})
    except Exception as e:
        lm['status'] = 'error'
        lm.update({'error': e.args[0]})
    res = json.dumps(lm)
    return res

