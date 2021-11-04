from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import XML
from ...common import session, T, cache
from ...settings import TOPCON_DICT, TOPCON_XML

from lxml import etree as ET
from .cv5000_rest import importCV5000

# useful function to create a node with an attribute and text in one line
def cSubElement(_parent, _tag, attrib={}, _text=None, nsmap=None, **_extra):
    res = ET.SubElement(_parent, _tag, attrib, nsmap, **_extra)
    res.text = _text
    return res

def createCV5000xml(resDict):
    rxDict = resDict['rx']
    mesLst = rxDict['measures']
    kmDict = resDict['km']
    meskLst = kmDict['measures'] 
    patDict = resDict['patient']
    from lxml import etree
    from string import Template
    from pathlib import Path
    skel = Path(TOPCON_XML+'/partial_skel0txt.xml').read_text()
    nsSBJ = Path(TOPCON_XML+'/partial_nsSBJtxt.xml').read_text()
    nsSBJExamDistance = Path(TOPCON_XML+'/partial_nsSBJExamDistancetxt.xml').read_text()
    nsKm = Path(TOPCON_XML+'/partial_nsKmtxt.xml').read_text()
    nsKmR = Path(TOPCON_XML+'/partial_nsKmRtxt.xml').read_text()
    nsKmL = Path(TOPCON_XML+'/partial_nsKmLtxt.xml').read_text()
    nsCommon = Path(TOPCON_XML+'/partial_nsCommontxt.xml').read_text()
    typeno = { } # {typeNo1 : txt, typeNo2 : txt ... typeNon : txt}
    rxTxt =''
    ## nsSBJ:RefractionData
    for mes in mesLst:
        if mes['TypeNo'] not in typeno:
            mes['edNo'] = 1
            t = Template(nsSBJExamDistance).safe_substitute(mes)
            typeno.update({mes['TypeNo']: {'txt': t, 'TypeName': mes['TypeName'], 'edNo': '1' }})
        else:
            mes['edNo'] = str(int(typeno[ mes['TypeNo'] ]['edNo'])+1)
            t = Template(nsSBJExamDistance).safe_substitute(mes)
            typeno[mes['TypeNo']]['txt'] += t
    for k,v in typeno.items(): # include each ExamDistance in correponding typeNo
        t = Template(nsSBJ).safe_substitute({ "TypeNo": k, "TypeName" : typeno[k]['TypeName'], "ExamDistance" : typeno[k]['txt'] })
        rxTxt +=t
    ## nsKM:KM -> always only 0-2 measures max
    [kmR, kmL] = ['','']
    for mes in meskLst:
        if mes['side'] == 'R':
            kmR = Template(nsKmR).safe_substitute(mes)
        if mes['side'] == 'L':
            kmL = Template(nsKmL).safe_substitute(mes)
    kmTxt = Template(nsKm).safe_substitute({"kmR" : kmR , "kmL" : kmL })
    common = Template(nsCommon).safe_substitute(patDict)
    full = Template(skel).safe_substitute({ "refractionTest" : rxTxt , "km" : kmTxt, "common": common })
    root = etree.fromstring(full)
    full = etree.tostring(root, encoding='UTF-8', xml_declaration=True ,pretty_print=True).decode()
    return full

@action('rest/exportCV5000xml', method=['GET'])
def exportCV5000xml():
    import json
    from datetime import datetime
    now = datetime.now()
    response.headers['Content-Type'] = 'application/xml;charset=UTF-8'
    machinedict = TOPCON_DICT
    if 'machine' in request.query:
        machine = request.query.get('machine')
    else:
        machine = 'default'
    patient = {'firstname': 'Steve', 'lastname': 'Jobs', 'patientid': '2600',
        'gender': 'Male', 'age': '66', 'dob': '2000-01-01',
        'date': now.strftime("%Y-%m-%d"), 'time': now.strftime("%H:%M:%S")
        }
    # importDict = { 'machine': 'test', 'rx': { 'count':20 , 'measures': [ { 'sph': '-1.25', 'cyl' : '-0.50'} ]} }
    importDict = importCV5000(machine)
    importDict.update({"patient" : patient})
    resDict = createCV5000xml(importDict)
    return resDict
