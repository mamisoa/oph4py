from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import XML
from ...common import session, T, cache
from ...settings import TOPCON_DICT, TOPCON_XML, LM_FOLDER, RM_FOLDER

# import userful
# from .useful import 

from lxml import etree as ET
from .cv5000_rest import importCV5000


# useful function to create a node with an attribute and text in one line
def cSubElement(_parent, _tag, attrib={}, _text=None, nsmap=None, **_extra):
    res = ET.SubElement(_parent, _tag, attrib, nsmap, **_extra)
    res.text = _text
    return res

def initMissingKeyDict(mesDict, mesType): # mesType is 'rx' or 'km'
    possibleMesTypeArgument = ['rx','km']
    if (mesType == None) or (mesType not in possibleMesTypeArgument):
        return mesDict
    diffKmLst = ['R1Radius', 'R1Power', 'R1Axis', 'R2Radius', 'R2Power', 'R2Axis', 'AverageRadius', 'AveragePower', 'CylPower','CylAxis']
    diffRxLst = ['Distance', 
        'SphR', 'CylR', 'AxisR', 'HPrisR', 'HBaseR', 'VPriR', 'VBaseR', 'PrismR', 'AngleR',
        'SphL', 'CylL', 'AxisL', 'HPrisL', 'HBaseL', 'VPriL', 'VBaseL', 'PrismL', 'AngleL',
        'vaR','vaL','vaB','pdR','pdB','pdR'
        ]
    diffLst = diffRxLst if mesType == 'rx' else diffKmLst
    for key in diffLst:
        if key not in mesDict:
            mesDict.update({ key : ''})
    return mesDict


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
    nsKmS = Path(TOPCON_XML+'/partial_nsKmStxt.xml').read_text()
    nsCommon = Path(TOPCON_XML+'/partial_nsCommontxt.xml').read_text()
    typeno = { } # {typeNo1 : txt, typeNo2 : txt ... typeNon : txt}
    rxTxt =''
    ## nsSBJ:RefractionData
    for mes in mesLst:
        ## todo: have to sanitize values eg check if not a number, change to ""  isnumeric() method
        if mes['TypeNo'] not in typeno:
            mes['edNo'] = 1
            mes = initMissingKeyDict(mes,'rx')
            t = Template(nsSBJExamDistance).safe_substitute(mes)
            typeno.update({mes['TypeNo']: {'txt': t, 'TypeName': mes['TypeName'], 'edNo': '1' }})
        else:
            mes['edNo'] = str(int(typeno[ mes['TypeNo'] ]['edNo'])+1)
            mes = initMissingKeyDict(mes,'rx')
            t = Template(nsSBJExamDistance).safe_substitute(mes)
            typeno[mes['TypeNo']]['txt'] += t
    for k,v in typeno.items(): # include each ExamDistance in correponding typeNo
        t = Template(nsSBJ).safe_substitute({ "TypeNo": k, "TypeName" : typeno[k]['TypeName'], "ExamDistance" : typeno[k]['txt'] })
        rxTxt +=t
    ## nsKM:KM -> always only 0-2 measures max
    [kmR, kmL] = ['','']
    for mes in meskLst:
        if mes['side'] == 'R':
            mes = initMissingKeyDict(mes,'km')
            kmR = Template(nsKmS).safe_substitute(mes)
        if mes['side'] == 'L':
            mes = initMissingKeyDict(mes,'km')
            kmL = Template(nsKmS).safe_substitute(mes)
    kmTxt = Template(nsKm).safe_substitute({"kmR" : kmR , "kmL" : kmL })
    common = Template(nsCommon).safe_substitute(patDict)
    full = Template(skel).safe_substitute({ "refractionTest" : rxTxt , "km" : kmTxt, "common": common })
    root = etree.fromstring(full)
    full = etree.tostring(root, encoding='UTF-8', xml_declaration=True ,pretty_print=True).decode()
    return full

@action('rest/exportCV5000xml', method=['GET', 'POST'])
def exportCV5000xml():
    import json
    from datetime import datetime
    now = datetime.now()
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    # response.headers['Content-Type'] = 'application/xml;charset=UTF-8'
    importDict = request.json
    machineDict = TOPCON_DICT
    if 'machine' in request.query:
        machine = request.query.get('machine')
    else:
        machine = machineDict['default']
    if 'machine' in importDict:
        machine = importDict['machine']
    # use this for unittest
    # importDict = {
    #     "RMpath": "/home/mamisoa16/code/py4web/apps/"+APP_NAME+"/machines/cv5000/rm/cv-iris",
    #     'patient' : {
    #         'firstname': 'Steve', 'lastname': 'Jobs', 'patientid': '2600', 'gender': 'Male', 'age': '66', 'dob': '2000-01-01',
    #             'date': now.strftime("%Y-%m-%d"), 'time': now.strftime("%H:%M:%S")
    #             },
    #     "machine": "cv-iris",
    #     "rx": {
    #         "filename": "/home/mamisoa16/code/py4web/apps/"+APP_NAME+"/machines/cv5000/rm/cv-iris/M-Serial0031_20211011_164311343_TOPCON_KR-8800_01.xml",
    #         "count": 0,
    #         "measures": []
    #         },
    #     "km": {
    #         "filename": "/home/mamisoa16/code/py4web/apps/"+APP_NAME+"/machines/cv5000/rm/cv-iris/M-Serial0031_20211011_164311343_TOPCON_KR-8800_01.xml",
    #         "count": 2,
    #         "measures": [
    #             {
    #                 "R1Radius": "7.92", "R1Power": "42.50", "R1Axis": "148",  "R2Radius": "7.75", "R2Power": "43.50", "R2Axis": "58", "CylPower": "-1.00",
    #                 "CylAxis": "148", "AverageRadius": "7.83", "AveragePower": None, "side": "R"
    #             },
    #             { 
    #                 "R1Radius": "7.86", "R1Power": "43.00", "R1Axis": "21", "R2Radius": "7.73", "R2Power": "43.75", "R2Axis": "111", "CylPower": "-0.75",
    #                 "CylAxis": "21", "AverageRadius": "7.79", "AveragePower": None, "side": "L"
    #             }
    #         ]
    #     }
    # }
    ## write file
    filename = RM_FOLDER+f'/{importDict["machine"]}/{importDict["patient"]["patientid"]}_{now.strftime("%Y%m%d")}_{now.strftime("%H%M%S%f")}_OPH4PY_2600.xml'
    try:
        resDict = createCV5000xml(importDict) # create xml
        with open(filename, 'w') as xmlfile:
            xmlfile.write(resDict)
        return json.dumps({'status': 'success', 'message': f'Export to {machine} done', 'errors': 'None', 'machine': machine, 'xmlfilepath' : filename })
    except Exception as e:
        return json.dumps({'status': 'error', 'message': f'Export to {machine} failed', 'errors' : [e.args[0]], 'data': importDict } )
