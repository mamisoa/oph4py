from lxml import etree as ET

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

root = ET.Element("Ophthalmology",{attr_qname: nsloc['schemLoc']}, nsmap=ns)


def cSubElement(_parent, _tag, attrib={}, _text=None, nsmap=None, **_extra):
    res = ET.SubElement(_parent, _tag, attrib, nsmap, **_extra)
    res.text = _text
    return res


rootSBJMes = cSubElement(root, f'{{{ns["nsSBJ"]}}}Measure', {"type": "SBJ"})
# rootSBJMes.set()
rootSBJRef = ET.SubElement(rootSBJMes, f'{{{ns["nsSBJ"]}}}RefractionTest')
rootSBJType = ET.SubElement(rootSBJRef, f'{{{ns["nsSBJ"]}}}Type', {"No": "1"})
# rootSBJType.set()

rootSBJTypeName = ET.SubElement(rootSBJType, f'{{{ns["nsSBJ"]}}}TypeName')
rxTypeName = 'Objective Data'
rootSBJTypeName.text = rxTypeName

rootSBJExamDistance = ET.SubElement(
    rootSBJType, f'{{{ns["nsSBJ"]}}}ExamDistance', {"No": "1"})
# rootSBJExamDistance.set("No","1")

rootSBJDistance = ET.SubElement(
    rootSBJExamDistance, f'{{{ns["nsSBJ"]}}}Distance')
rootSBJDistance.set("cm", "500")
rootSBJRefractionData = ET.SubElement(
    rootSBJExamDistance, f'{{{ns["nsSBJ"]}}}RefractionData')
##
childSBJRL = [
    {'node': 'Sph', 'unit': 'D', 'value': '-1.00'},
    {'node': 'Cyl', 'unit': 'D', 'value': '-0.75'},
    {'node': 'Axis', 'unit': 'deg', 'value': '180'},
    {'node': 'HPri', 'unit': 'prism', 'value': ''},
    {'node': 'HBase', 'unit': 'string', 'value': ''},
    {'node': 'VPri', 'unit': 'prism', 'value': ''},
    {'node': 'VBase', 'unit': 'string', 'value': ''},
    {'node': 'Angle', 'unit': 'deg', 'value': '180'}]

rootSBJR = ET.SubElement(rootSBJRefractionData, f'{{{ns["nsSBJ"]}}}R')
[cSubElement(rootSBJR, f'{{{ns["nsSBJ"]}}}' + e["node"], {"unit": e["unit"]}, e['value']) for e in childSBJRL]
rootSBJL = ET.SubElement(rootSBJRefractionData, f'{{{ns["nsSBJ"]}}}L')
[cSubElement(rootSBJL, f'{{{ns["nsSBJ"]}}}' + e["node"], {"unit": e["unit"]}, e['value']) for e in childSBJRL]

rootSBJPD = ET.SubElement(rootSBJExamDistance, f'{{{ns["nsSBJ"]}}}PD')
childSBJPD = [
    {'node': 'R', 'unit': 'mm', 'value': '32'},
    {'node': 'L', 'unit': 'mm', 'value': '32'},
    {'node': 'B', 'unit': 'mm', 'value': '64'}]
[cSubElement(rootSBJPD, f'{{{ns["nsSBJ"]}}}' + e["node"], {"unit": e["unit"]}, e['value']) for e in childSBJPD]

##
rootSBJkMes = ET.SubElement(root, f'{{{ns["nsKM"]}}}Measure', {"type": "KM"})
childSBJkMes = [
    {'node': 'DiopterStep', 'unit': 'mm', 'value': ''},
    {'node': 'AxisStep', 'unit': 'deg', 'value': ''},
    {'node': 'CylinderMode', 'unit': 'string', 'value': ''},
    {'node': 'RefractiveIndex', 'unit': '', 'value': '1.3375'}
]
## this is standard
[cSubElement(rootSBJkMes, f'{{{ns["nsKM"]}}}'+e["node"], {"unit": e["unit"]}, e['value']) for e in childSBJkMes]
rootSBJKM = ET.SubElement(rootSBJkMes, f'{{{ns["nsKM"]}}}KM')

childSBJKMRn = [
    {'node': 'Radius', 'unit': 'mm', 'value': '7.80'},
    {'node': 'Power', 'unit': 'D', 'value': '7.75'},
    {'node': 'Axis', 'unit': 'deg', 'value': '180'}
]


# KM right
rootSBJKMR = ET.SubElement(rootSBJKM, f'{{{ns["nsKM"]}}}R')

rootSBJKMRList = ET.SubElement(
    rootSBJKMR, f'{{{ns["nsKM"]}}}List', {"No": "1"})
rootSBJKMrR1 = ET.SubElement(rootSBJKMRList, f'{{{ns["nsKM"]}}}R1')
[cSubElement(rootSBJKMrR1, f'{{{ns["nsKM"]}}}'+e["node"], {"unit": e["unit"]}, e['value']) for e in childSBJKMRn]
rootSBJKMrR2 = ET.SubElement(rootSBJKMRList, f'{{{ns["nsKM"]}}}R2')
[cSubElement(rootSBJKMrR2, f'{{{ns["nsKM"]}}}'+e["node"], {"unit": e["unit"]}, e['value']) for e in childSBJKMRn]

rootSBJKMrMedian = ET.SubElement(rootSBJKMR, f'{{{ns["nsKM"]}}}Median')
rootSBJKMmMR1 = ET.SubElement(rootSBJKMrMedian, f'{{{ns["nsKM"]}}}R1')
[cSubElement(rootSBJKMmMR1, f'{{{ns["nsKM"]}}}'+e["node"], {"unit": e["unit"]}, e['value']) for e in childSBJKMRn]
rootSBJKMmMR2 = ET.SubElement(rootSBJKMrMedian, f'{{{ns["nsKM"]}}}R2')
[cSubElement(rootSBJKMmMR2, f'{{{ns["nsKM"]}}}'+e["node"], {"unit": e["unit"]}, e['value']) for e in childSBJKMRn]


print(ET.tostring(root, pretty_print=True).decode())

for e in childSBJPD:
    print('Node is ', e['node']) if e['node'] == 'R' else print(e['node'], ' is not R')

dicttest = {
"side": "L",
"TypeName": "Prescription",
"Type No": "1",
"ExamDistance": "500.000",
"vaR": " 0.20",
"vaL": " 0.00",
"vaB": " 0.10",
"pdR": "31.75",
"pdL": "31.75",
"pdB": "63.50",
"Sph": "-2.75",
"Cyl": "-2.25",
"Axis": "110",
"HPri": "2.30",
"HBase": "BO",
"VPri": "1.00",
"VBase": "BU",
"Prism": "2.51",
"Angle": "23"
}