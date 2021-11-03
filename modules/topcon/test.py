from lxml import etree as ET
ns = {
    'xsi' :'http://www.w3.org/2001/XMLSchema-instance',
    'nsCommon' : 'http://www.joia.or.jp/standardized/namespaces/Common',
    'nsLM' : 'http://www.joia.or.jp/standardized/namespaces/LM',
    'nsSBJ' : 'http://www.joia.or.jp/standardized/namespaces/SBJ',
    'nsREF' : 'http://www.joia.or.jp/standardized/namespaces/REF',
    'nsKM' : 'http://www.joia.or.jp/standardized/namespaces/KM',
    'xsi:schemaLocation' : 'http://www.joia.or.jp/standardized/namespaces/Common Common_schema.xsd http://www.joia.or.jp/standardized/namespaces/LM LM_schema.xsd http://www.joia.or.jp/standardized/namespaces/KM KM_schema.xsd http://www.joia.or.jp/standardized/namespaces/SBJ SBJ_schema.xsd'
}
# skeleton file
treeskel = ET.parse('partial_skel0.xml')
rootskel = treeskel.getroot()
# nsSBJ:TypeName: Full Correction
treeFC = ET.parse('partial_nsSBJ.xml')
rootFC = treeFC.getroot()
rfdata = rootFC.findall('.//nsSBJ:R',ns)
treeFC.find('.//{http://www.joia.or.jp/standardized/namespaces/SBJ}Sph').text = '-15.00'
print (ET.tostring(rfdata[0], pretty_print=True).decode())