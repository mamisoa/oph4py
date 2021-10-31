lmfile = './lxml/xml/lm/M-Serial4010_20211023_121330187_TOPCON_CL-300_00.xml'
exportfile = './lxml/xml/rm/cv-iris/0013_20211002_204149125_TOPCON_CV-5000_19216810164.xml'
exportfile2 = './lxml/xml/rm/cv-iris/0013_20211002_223710125_TOPCON_CV-5000_19216810164.xml'
exportfile3 = './lxml/xml/rm/cv-cornea/1244_20211002_220225000_TOPCON_CV-5000_19216810167.xml'
xmlfile = exportfile2
ns = {
    'xsi' :'http://www.w3.org/2001/XMLSchema-instance',
    'nsCommon' : 'http://www.joia.or.jp/standardized/namespaces/Common',
    'nsLM' : 'http://www.joia.or.jp/standardized/namespaces/LM',
    'nsSBJ' : 'http://www.joia.or.jp/standardized/namespaces/SBJ',
    'nsREF' : 'http://www.joia.or.jp/standardized/namespaces/REF',
    'nsKM' : 'http://www.joia.or.jp/standardized/namespaces/KM',
    'xsi:schemaLocation' : 'http://www.joia.or.jp/standardized/namespaces/Common Common_schema.xsd http://www.joia.or.jp/standardized/namespaces/LM LM_schema.xsd http://www.joia.or.jp/standardized/namespaces/KM KM_schema.xsd http://www.joia.or.jp/standardized/namespaces/SBJ SBJ_schema.xsd'
}
from lxml import etree as ET
tree = ET.parse(xmlfile)
root = tree.getroot()

print ('-------------------')

print(root.tag)
# print ('-------------------\n')

# for child in root:
#     print(child.tag,child.attrib)

# print ('-------------------\n')

# for el in root.findall('nsSBJ:Measure',ns):
#     for child in el:
#         print(el.tag,el.text)
#         for gdchild in el:
#             print(gdchild.tag,gdchild.text)
#             print('count:',len(gdchild))
#             for gdgdchild in gdchild:
#                 print(gdgdchild.tag,gdgdchild.attrib)

# print ('-------------------\n')

# sbjtype = root.findall('.//*nsSBJ:Type', ns)
# print('sbj count:',len(sbjtype))

# for el in sbjtype:
#     # print([e for e in el.find('../..',ns)])
#     print ('nsSBJ:Type No',el.attrib)

print ('-------------------\n')

# get all refraction data: Full Correction, Objective Data, Current Spectacles, Prescription
rfdata = root.findall('.//*nsSBJ:RefractionData', ns)
rx = { 'filename' : xmlfile , 'count' : len(rfdata) , 'measures': []}

for rf in rfdata:
    mes = {}
    # print ({'node' : rf.tag})
    # get nsSBJ:RefractionTest tag, but useless
    mes.update({'node' : (rf.tag.split('}'))[1]})
    # get nsSBJ:TypeName
    mes.update({'TypeName' : (rf.findall('../../nsSBJ:TypeName',ns)[0]).text})
    # print([(e.tag,e.text) for e in rf.findall('../../nsSBJ:TypeName',ns)]) # nsSBJ:TypeName
    # print([(e.tag,e.attrib) for e in rf.findall('../../..',ns)]) # nsSBJ:RefractionTest
    # get nsSBJ:Type, only 1 item in list
    # print([(e.tag,e.attrib) for e in rf.findall('../..',ns)]) # nsSBJ:Type
    mes.update({'Type No' : (rf.findall('../..',ns)[0].attrib)['No'] }) # nsSBJ:Type
    # get nsSBJ:ExamDistance
    mes.update({'ExamDistance' : (rf.findall('../nsSBJ:Distance',ns)[0]).text}) # nsSBJ:ExamDistance
    # print([(e.tag,e.text) for e in rf.findall('../nsSBJ:Distance',ns)]) # nsSBJ:ExamDistance
    # nsSBJ:R
    rdict = {}
    [rdict.update({((e.tag).split('}'))[1]+'R': e.text}) for e in rf.findall('.//nsSBJ:R/',ns)]
    mes.update(rdict)
    # print([{e.tag: e.text} for e in rf.findall('.//nsSBJ:R/',ns)]) # iterate all child nodes nsSBJ:R
    # print([{e.tag: e.text} for e in rf.findall('.//nsSBJ:L/',ns)]) # iterate all child nodes nsSBJ:L
    ldict = {} 
    [ldict.update({((e.tag).split('}'))[1]+'L': e.text}) for e in rf.findall('.//nsSBJ:L/',ns)]
    mes.update(ldict)
    vadict = {}
    [vadict.update({'va'+((e.tag).split('}'))[1]: e.text}) for e in rf.findall('../nsSBJ:VA/',ns)]
    mes.update(vadict)
    pddict = {} 
    [pddict.update({'pd'+((e.tag).split('}'))[1]: e.text}) for e in rf.findall('../nsSBJ:PD/',ns)]
    # print([{e.tag: e.text} for e in rf.findall('../nsSBJ:PD/',ns)]) # iterate all child nodes nsSBJ:PD
    mes.update(pddict)
    rx['measures'].append(mes)
print(rx)

print ('-------------------\n')

# get keratometry data from file
kmdata = root.findall('.//*nsKM:Median', ns)
km = { 'filename' : xmlfile , 'count' : len(kmdata) , 'measures': []}
for kx in kmdata:
    mes = {}
    # print(kx.findall('..')) # gives a set!
    side = iter(([{e.tag.split('}')[1]} for e in kx.findall('..',ns)][0])).next()
    [mes.update({ 'R1' + e.tag.split('}')[1] + side : e.text }) for e in kx.findall('./nsKM:R1/',ns)]
    [mes.update({ 'R2' + e.tag.split('}')[1] + side : e.text }) for e in kx.findall('./nsKM:R2/',ns)]
    [mes.update({ 'Cyl' + e.tag.split('}')[1] + side : e.text }) for e in kx.findall('./nsKM:Cylinder/',ns)]
    [mes.update({ 'Average' + e.tag.split('}')[1] + side : e.text }) for e in kx.findall('./nsKM:Average/',ns)]
    km['measures'].append(mes)
print(km)


# -------------------------------------------------------------------------
# first attempt to get LM text
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
        'lmAdd1'+side : path+'nsLM:Add1',
        'lmAdd2'+side : path+'nsLM:Add2',
    }
    return lmdict

@action('readCv5000Xml', methods=['GET'])
# origin: lm, rm, export
# import from CV export and delete file
def readCv5000Xml():
    import os,glob,json,bottle
    from lxml import etree as ET
    response = bottle.response
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    # xmlfiles = glob.glob(LM_FOLDER+'/cv-iris/*.xml')
    xmlfiles = glob.glob(RM_FOLDER+'/cv-crist/test_import2.xml')
    latestfile = max(xmlfiles, key=os.path.getctime)
    with open(latestfile) as xmlfile:
        tree = ET.parse(xmlfile)
    root = tree.getroot()
    ns = {'xsi': 'http://www.w3.org/2001/XMLSchema-instance', 
        'nsCommon': 'http://www.joia.or.jp/standardized/namespaces/Common',
        'nsLM': 'http://www.joia.or.jp/standardized/namespaces/LM',
        'nsSBJ' : "http://www.joia.or.jp/standardized/namespaces/SBJ"
        }
    lm = { 'status': 'OK' , 'filename': latestfile, 'mesures' : {}}
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
    try:
        t = root.xpath('.//nsSBJ:TypeName[text()="Current Spectacles"]/..', namespaces= ns)
        lm['current'] = [el.tag for el in t]
    except Exception as e2:
        lm.update({'error2': str(e2)})
    res = json.dumps(lm)
    return res

