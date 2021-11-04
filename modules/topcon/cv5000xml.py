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
    from lxml import etree
    from string import Template
    from pathlib import Path
    skel = Path(TOPCON_XML+'/partial_skel0txt.xml').read_text()
    nsSBJ = Path(TOPCON_XML+'/partial_nsSBJtxt.xml').read_text()
    nsSBJExamDistance = Path(TOPCON_XML+'/partial_nsSBJExamDistancetxt.xml').read_text()
    typeno = { } # {typeNo1 : txt, typeNo2 : txt ... typeNon : txt}
    typenotxt = []
    partial =''
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
        partial +=t
    full = Template(skel).safe_substitute({ "refractionTest" : partial})
    root = etree.fromstring(full)
    full = etree.tostring(root, encoding='UTF-8', xml_declaration=True ,pretty_print=True).decode()
    # return partial
    # return typeno
    return full

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
