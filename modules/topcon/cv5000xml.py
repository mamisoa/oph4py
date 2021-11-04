from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import XML
from ...common import session, T, cache
from ...settings import TOPCON_DICT

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
    ns = {
        'xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'nsCommon': 'http://www.joia.or.jp/standardized/namespaces/Common',
        'nsLM': 'http://www.joia.or.jp/standardized/namespaces/LM',
        'nsSBJ': 'http://www.joia.or.jp/standardized/namespaces/SBJ',
        'nsREF': 'http://www.joia.or.jp/standardized/namespaces/REF',
        'nsKM': 'http://www.joia.or.jp/standardized/namespaces/KM'
    }
    # add a URI with a semi-colon
    nsloc = {'schemLoc': 'http://www.joia.or.jp/standardized/namespaces/Common Common_schema.xsd http://www.joia.or.jp/standardized/namespaces/LM LM_schema.xsd http://www.joia.or.jp/standardized/namespaces/KM KM_schema.xsd http://www.joia.or.jp/standardized/namespaces/SBJ SBJ_schema.xsd'}
    attr_qname = ET.QName(
        "http://www.w3.org/2001/XMLSchema-instance", "schemaLocation")
    # root
    root = ET.Element("Ophthalmology",{attr_qname: nsloc['schemLoc']}, nsmap=ns)
    rootSBJMes = cSubElement(root, f'{{{ns["nsSBJ"]}}}Measure', {"type": "SBJ"})
    rootSBJRef = ET.SubElement(rootSBJMes, f'{{{ns["nsSBJ"]}}}RefractionTest')
    typeLst = []
    examDistanceDict = {}
    for item in mesLst:
        if item['Type No'] not in typeLst:
            rootSBJType = ET.SubElement(rootSBJRef, f'{{{ns["nsSBJ"]}}}Type', {"No": item['Type No']})
            typeLst.append(item['Type No'])
            rootSBJTypeName = ET.SubElement(rootSBJType, f'{{{ns["nsSBJ"]}}}TypeName')
            rootSBJTypeName.text = item['TypeName']
        # build examDistance dict eg {"1": {"R": ['500','67'],"L": ['500','67']}
        if item['Type No'] not in examDistanceDict:
            examDistanceDict.update({ item['Type No'] : { item['side'] : [ item['Distance'] ] }  })
        else: # type No exists
            if item['side'] not in examDistanceDict[item['Type No']]:
                examDistanceDict[item['Type No']].update({ item['side'] : [ item['Distance' ]]})
            else: # side exists
                examDistanceDict[item['Type No']][item['side']].append(item['Distance'])
    for e in typeLst:
        rootSBJTypeLst=root.findall('.//nsSBJ:Type[@No="'+e+'"]',ns)
        rootSBJType = rootSBJTypeLst[0]
        # create nsSBJExamDistance No
        for i,d in enumerate(examDistanceDict[e], start=1):
                rootSBJExamDistance = ET.SubElement(rootSBJType, f'{{{ns["nsSBJ"]}}}ExamDistance', {"No": str(i)})
    rootSBJExamDistance = root.findall('.//nsSBJ:ExamDistance',ns)
    for item in mesLst:
        rootSBJType = root.findall('.//nsSBJ:Type[@No="'+item['Type No']+'"]',ns)
        ed = rootSBJType[0].xpath('.//nsSBJ:ExamDistance/RefractionData',namespaces=ns)
        if len(list(ed)) == 0:
            for node in rootSBJType[0].findall('.//nsSBJ:ExamDistance',ns):
                ET.SubElement(node, f'{{{ns["nsSBJ"]}}}RefractionData')
    # return examDistanceDict
    return ET.tostring(root, pretty_print=True).decode()

@action('rest/exportCV5000xml', method=['GET'])
def exportCV5000xml():
    import json
    response.headers['Content-Type'] = 'application/xml;charset=UTF-8'
    machinedict = TOPCON_DICT
    if 'machine' in request.query:
        machine = request.query.get('machine')
    else:
        machine = 'default'
    # importDict = { 'machine': 'test', 'rx': { 'count':20 , 'measures': [ { 'sph': '-1.25', 'cyl' : '-0.50'} ]} }
    importDict = importCV5000(machine)
    resDict = createCV5000xml(importDict)
    return resDict
