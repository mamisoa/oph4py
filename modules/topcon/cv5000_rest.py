# restAPI cv5000 controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400

from ...common import session, T, cache, auth, logger, authenticated, unauthenticated

from ...settings import MACHINES_FOLDER, LM_FOLDER, RM_FOLDER, TOPCON_DICT

# get from CV5000
# set machine = cv-iris, cv-cornea, cv-crist (use dict?)
def importCV5000(machine):
    machinedict = TOPCON_DICT
    try:
        RMpath = RM_FOLDER + machinedict[machine]
    except KeyError:
        RMpath = RM_FOLDER + machinedict['default']
    from lxml import etree as ET
    import glob, os
    xmlfiles_lst = glob.glob(RMpath+'/*.xml')
    xmlfile = max(xmlfiles_lst, key=os.path.getctime) # last modified xmlfile
    ns = {
    'xsi' :'http://www.w3.org/2001/XMLSchema-instance',
    'nsCommon' : 'http://www.joia.or.jp/standardized/namespaces/Common',
    'nsLM' : 'http://www.joia.or.jp/standardized/namespaces/LM',
    'nsSBJ' : 'http://www.joia.or.jp/standardized/namespaces/SBJ',
    'nsREF' : 'http://www.joia.or.jp/standardized/namespaces/REF',
    'nsKM' : 'http://www.joia.or.jp/standardized/namespaces/KM',
    'xsi:schemaLocation' : 'http://www.joia.or.jp/standardized/namespaces/Common Common_schema.xsd http://www.joia.or.jp/standardized/namespaces/LM LM_schema.xsd http://www.joia.or.jp/standardized/namespaces/KM KM_schema.xsd http://www.joia.or.jp/standardized/namespaces/SBJ SBJ_schema.xsd'
    }
    tree = ET.parse(xmlfile) # parsing the file
    root = tree.getroot() # get the root
    ## REFRACTION
    # get all refraction data: Full Correction, Objective Data, Current Spectacles, Prescription
    rfdata = root.findall('.//*nsSBJ:RefractionData', ns)
    rx = { 'filename' : xmlfile , 'count' : len(rfdata) , 'measures': []}
    for rf in rfdata:
        mes = {}
        # get nsSBJ:TypeName
        typeName = {'TypeName' : (rf.findall('../../nsSBJ:TypeName',ns)[0]).text}
        mes.update(typeName)
        # print([(e.tag,e.attrib) for e in rf.findall('../..',ns)]) # nsSBJ:Type
        typeNo = {'TypeNo' : (rf.findall('../..',ns)[0].attrib)['No'] }
        mes.update(typeNo) # nsSBJ:Type
        # get nsSBJ:Distance
        Distance = {'Distance' : (rf.findall('../nsSBJ:Distance',ns)[0]).text} ## always only one node
        mes.update(Distance) # nsSBJ:ExamDistance
        vadict = {}
        [vadict.update({'va'+((e.tag).split('}'))[1]: e.text}) for e in rf.findall('../nsSBJ:VA/',ns)]
        mes.update(vadict)
        pddict = {} 
        [pddict.update({'pd'+((e.tag).split('}'))[1]: e.text}) for e in rf.findall('../nsSBJ:PD/',ns)]
        # print([{e.tag: e.text} for e in rf.findall('../nsSBJ:PD/',ns)]) # iterate all child nodes nsSBJ:PD
        mes.update(pddict)
        # nsSBJ:R
        rdict = {}
        [rdict.update({((e.tag).split('}'))[1]+'R': e.text}) for e in rf.findall('.//nsSBJ:R/',ns)]
        mes.update(rdict)
        # print([{e.tag: e.text} for e in rf.findall('.//nsSBJ:R/',ns)]) # iterate all child nodes nsSBJ:R
        # print([{e.tag: e.text} for e in rf.findall('.//nsSBJ:L/',ns)]) # iterate all child nodes nsSBJ:L
        ldict = {}
        [ldict.update({((e.tag).split('}'))[1]+'L': e.text}) for e in rf.findall('.//nsSBJ:L/',ns)]
        mes.update(ldict)
        rx['measures'].append(mes)
    ## KERATOMETRY
    # get keratometry data from file
    kmdata = root.findall('.//*nsKM:Median', ns)
    km = { 'filename' : xmlfile , 'count' : len(kmdata) , 'measures': []}
    for kx in kmdata:
        mes = {}
        # print(kx.findall('..')) # gives a set!
        side = list(iter(([{e.tag.split('}')[1]} for e in kx.findall('..',ns)][0])))[0]
        [mes.update({ 'R1' + e.tag.split('}')[1]+side : e.text }) for e in kx.findall('./nsKM:R1/',ns)]
        [mes.update({ 'R2' + e.tag.split('}')[1]+side : e.text }) for e in kx.findall('./nsKM:R2/',ns)]
        [mes.update({ 'Cyl' + e.tag.split('}')[1]+side : e.text }) for e in kx.findall('./nsKM:Cylinder/',ns)]
        [mes.update({ 'Average' + e.tag.split('}')[1]+side : e.text }) for e in kx.findall('./nsKM:Average/',ns)]
        mes.update({ 'side' : side })
        km['measures'].append(mes)
    return { 'RMpath': RMpath, 'machine': machine,'rx' : rx, 'km': km }

# set machine in TOPCON_DICT 
@action('rest/getCV5000', method=['GET']) 
def getCV5000():
    import json
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    machinedict = TOPCON_DICT
    if 'machine' in request.query:
        machine = request.query.get('machine')
    else:
        machine = 'default'
    res = importCV5000(machine)
    return json.dumps(res)
