from lxml import etree as ET, objectify
import io, re
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
root=rfdata[0]

print('-------------------\n')
print('Raw XML string:\n')
xml_str = ET.tostring(root, pretty_print=True).decode()
print (xml_str)

print('-------------------\n')
# ET.cleanup_namespaces(rootFC)
print(ET.tostring(rootFC, pretty_print=True).decode())


print('-------------------\n')
# http://wiki.tei-c.org/index.php/Remove-Namespaces.xsl
# xslt='''<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
# <xsl:output method="xml" indent="no"/>

# <xsl:template match="/|comment()|processing-instruction()">
#     <xsl:copy>
#       <xsl:apply-templates/>
#     </xsl:copy>
# </xsl:template>

# <xsl:template match="*">
#     <xsl:element name="{local-name()}">
#       <xsl:apply-templates select="@*|node()"/>
#     </xsl:element>
# </xsl:template>

# <xsl:template match="@*">
#     <xsl:attribute name="{local-name()}">
#       <xsl:value-of select="."/>
#     </xsl:attribute>
# </xsl:template>
# </xsl:stylesheet>
# '''
# xslt_doc=ET.parse(io.BytesIO(str.encode(xslt)))
# transform=ET.XSLT(xslt_doc)
# root=transform(root)
# print (ET.tostring(root, pretty_print=True).decode())