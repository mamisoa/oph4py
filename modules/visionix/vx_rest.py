# restAPI visionix controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400

from ...common import session, T, cache, auth, logger, authenticated, unauthenticated

from ...settings import MACHINES_FOLDER, L80_FOLDER, VX100_FOLDER, VX100_XML_FOLDER

def getWF(machine,path,filename,side,patient):
    """
    Read file in Microsoft Windows ini format to extract refraction from L80 and VX100 machines
    Args:
        machine (str): machine 'l80' or 'vx100'
        path (str): path to directory containing data files
        side (str): eye side
        patient (str): patient full name
    Returns:
        str: dictionary with refraction related to side
    Raises:
        Exception: any error -> set the status to 'error'
    """
    from math import pi
    import configparser
    config = configparser.ConfigParser()
    if machine == 'vx100':
        code = 'utf16'
    elif machine == 'l80':
        code = 'us-ascii'
    else:
        code = 'utf8'
    rx = { 'patient' : patient , 'file': filename, 'exam' : 'wf', 'side' : side }
    try:
        with open(path+'/WF/'+filename,'r', encoding=code) as file:
            config.read_file(file)
        sph_dict = dict(config.items('SPHERE'))
        cyl_dict = dict(config.items('CYLINDER'))
        axis_dict = dict(config.items('AXIS'))
        [rx['sph3'],rx['cyl3'],rx['axis3']] = [float(sph_dict['r_3']),float(cyl_dict['r_3']),float(axis_dict['r_3'])*180/pi]
        [rx['sph5'],rx['cyl5'],rx['axis5']] = [float(sph_dict['r_5']),float(cyl_dict['r_5']),float(axis_dict['r_5'])*180/pi]
        [rx['sph7'],rx['cyl7'],rx['axis7']] = [float(sph_dict['r_7']),float(cyl_dict['r_7']),float(axis_dict['r_7'])*180/pi]
        rx['status'] = 'success'
    except Exception as e:
        rx['status'] = 'error'
        rx['error'] = e.args[0]
    return rx

def getTopo(machine,path,filename,side,patient):
    # TODO: get topo parameters and image
    # TODO: export kpi to view
    """
    Read file in Microsoft Windows ini format to extract keratometry from L80 and VX100 machines
    Args:
        machine (str): machine 'l80' or 'vx100'
        path (str): path to directory containing data files
        side (str): eye side
        patient (str): patient full name
    Returns:
        str: dictionary with keratometry related to side
    Raises:
        Exception: any error -> set the status to 'error'
    """
    import configparser
    config = configparser.ConfigParser(allow_no_value=True)
    if machine == 'vx100':
        config = configparser.ConfigParser()
        code = 'utf16'
    elif machine == 'l80':
        config = configparser.ConfigParser(allow_no_value=True)
        code = 'us-ascii'
    else:
        code = 'utf8'
    topo = {'patient' : patient , 'file': filename, 'exam': 'topo', 'side' : side }
    try:
        with open(path+'/Topo/'+filename,'r', encoding=code) as file:
            config.read_file(file)
        simk_dict = dict(config.items('Sim_K'))
        topo_dict = dict(config.items('TOPO'))
        if machine == 'vx100':
            kc_dict = dict(config.items('KERATOCONUS'))
            topo['kpi'] = float(kc_dict['kpi'])
        [topo['k1'], topo['k2'], topo['k1_axis'], topo['k2_axis'], topo['kcyl'], topo['pd05']] = [
            float(simk_dict['k1']),float(simk_dict['k2']),
            float(simk_dict['k1_axis']),float(simk_dict['k2_axis']),
            float(simk_dict['cyl']), float(topo_dict['pd'])/2]
        topo['status'] = 'success'
    except Exception as e:
        topo['error'] = str(e)
        topo['status'] = 'error'
    return topo

def getARK(machine,path,filename,side,patient):
    """
    Read file in Microsoft Windows ini format to extract ARK from L80 and VX100 machines
    Args:
        machine (str): machine 'l80' or 'vx100'
        path (str): path to directory containing data files
        side (str): eye side
        patient (str): patient full name
    Returns:
        str: dictionary with ARK related to side
    Raises:
        Exception: any error -> set the status to 'error'
    """
    from math import pi
    import configparser
    config = configparser.ConfigParser()
    if machine == 'vx100':
        code = 'utf16'
    elif machine == 'l80':
        code = 'us-ascii'
    else:
        code = 'utf8'
    rx = {'patient': patient, 'file': filename, 'exam': 'ark', 'side': side}
    try:
        with open(path+'/ARK/'+filename,'r', encoding=code) as file:
            config.read_file(file)
        ar = dict(config.items('AR'))
        [rx['sph3'],rx['cyl3'],rx['axis3']] = [float(ar['sphere_3']),float(ar['cylinder_3']),float(ar['axis_3'])*180/pi]
        [rx['sph5'],rx['cyl5'],rx['axis5']] = [float(ar['sphere_5']),float(ar['cylinder_5']),float(ar['axis_5'])*180/pi]
        [rx['sph7'],rx['cyl7'],rx['axis7']] = [float(ar['sphere_7']),float(ar['cylinder_7']),float(ar['axis_7'])*180/pi]
        kr = dict(config.items('KR'))
        [rx['k1'],rx['k2'],rx['k1_axis'],rx['k2_axis'], rx['kcyl']] = [float(kr['k1']),float(kr['k2']),kr['k1_axis'],kr['k2_axis'], float(kr['simk_cyl'])]
        topo = dict(config.items('GENERAL'))
        rx['pd05'] = float(topo['pd'])
        rx['status'] = 'success'
    except Exception as e:
        rx['error'] = e.args[0]
        rx['status'] = 'error'
    return rx

@action('rest/scan_visionix/<machine>/', method=['GET']) 
def scan_visionix(machine,lastname='',firstname=''):
    """
    API endpoint /rest/scan_visionix/<machine>/

    Check if patient exists in Visionix machines, if so send JSON response with corresponding file and path
    Args:
        machine (str): machine 'l80' or 'vx100'
        lastname (str): patient last name
        firstname (str): patient first name
    Returns:
        str: JSON response with a list of patient folders corresponding to first name and last name
    Raises:
        #TODO: no error test
    """
    import os,json,re
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

def createxml_vx100(id='',lastname='',firstname='',dob='',sex=''):
    """
    create XML file for VX100 in waiting list (specific shared directory)
    
    Args:
        id (str): patient id
        lastname (str): patient last name
        firstname (str): patient first name
        dob (str): dob (format ?)
        sex (str): gender (format ?)
    Returns:
        str: JSON response status report
    Raises:
        exception: any exception returns an 'error' status report
    """
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

def addpatient_l80(firstname,lastname):
    """
    check if patient exists in folder, if not create folder and update Index.txt
    # TODO: add id, dob
    Args:
        lastname (str): patient last name
        firstname (str): patient first name
    Returns:
        str: JSON response status report
    Raises:
        exception: any exception returns an 'error' status report
    """
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
    """
    API endpoint /rest/create_visionix/<machine>

    Check if patient exists in Visionix machines, if so send JSON response with corresponding file and path
    Args:
        machine (str): machine 'l80' or 'vx100'
        lastname (str): patient last name
        firstname (str): patient first name
        dob (str): dob (format ?)
        id (str): patient id
        sex (str): gender (format ?)
    Returns:
        str: JSON response with a list of patient folders corresponding to first name and last name
    Raises:
        errors are reported from modules
    Modules:
        addpatient_l80: add patient to l80 folder
        createpatient_vx100: add patient to vx100 waiting list
    """
    import os,json
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

@action('rest/machines/<machine>/', method=['GET']) 
def get_visionix_mes(machine=L80_FOLDER):
    """
    API endpoint rest/machines/<machine>

    Bootstrap-table optimized JSON output from Visionix machines L80/VX100
    Args:
        machine (str): machine folder path, by default L80 folder
    Returns:
        str: JSON response with corresponding measurements
    Raises:
        errors are reported from modules
    Modules:
        getWF: get WF measurements
        getTopo:get keratometry measurements
        getARK: get ARK measurements
    """
    import os, json, re
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
                                                            if wf['status'] != 'error':
                                                                exams['count'] += 1
                                                            wf['date'] = dateFolder
                                                            data.append(wf)
                                                        if m.group('exam') == 'Topo':
                                                            topo = getTopo(machine,examsFolders.path,f.name,m.group('side').lower(),folder['file']) # get the mesures from file
                                                            if topo['status'] != 'error':
                                                                exams['count'] += 1
                                                            topo['date'] = dateFolder
                                                            data.append(topo)
                                                        if m.group('exam') == 'ARK':
                                                            ark = getARK(machine, examsFolders.path, f.name, m.group('side').lower(), folder['file'])  # get the mesures from file
                                                            if ark['status'] != 'error':
                                                                exams['count'] += 1
                                                            ark['date'] = dateFolder
                                                            data.append(ark)
                                            if data != []:
                                                mes.extend(data)
                        exams['mesurements'].extend(mes)
            # exams.append(patient)
        list=exams
    infos_json = json.dumps(list)
    return infos_json
