"""
This file defines the database models
"""

from .common import db, Field, auth, groups # add auth for auto.signature
from pydal.validators import *
from py4web.utils.tags import Tags

import uuid
import random

rd = random.Random()
rd.seed(0)

### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later
#
# db.commit()
#

def str_uuid():
    unique_id = str(uuid.uuid4().hex)
    return unique_id

db.define_table('facilities',
    Field('facility_name', 'string', required=True),
    Field('hosp_id',type='integer'),
    auth.signature)

db.define_table('testtable',
    Field('test_name', 'string', required=True),
    Field('test_id',type='integer'),
    Field('test_gender', 'reference gender'),
    auth.signature
    )


################################################################
#               MAIN DBs                                       #
################################################################

db.define_table('photo_id',
    Field('imagefile', 'upload'),
    Field('b64img','text'),
    Field('id_auth_user', 'reference auth_user', writable = False, readable = False),
    auth.signature)

db.define_table('facility',
    Field('facility_name', 'string', required=True),
    auth.signature,
    format='%(facility_name)s')

db.define_table('modality_family',
    Field('family', 'string', required=True),
    auth.signature,
    format='%(family)s')

db.define_table('modality_controller',
    Field('modality_controller_name', 'string', required=True),
    auth.signature,
    format='%(modality_controller_name)s')

db.define_table('modality',
    Field('modality_name', 'string', required=True),
    Field('id_modality_controller','reference modality_controller'),
    auth.signature,
    format='%(modality_name)s')

modality_types = Tags(db.modality)

db.define_table('data_origin',
    Field('origin', 'string', default='Home'),
    format=lambda r: r.origin or 'Home'
    )

db.define_table('address',  #PID11
    Field('id_auth_user', 'reference auth_user', writable = False, readable = False),
    Field('home_num', 'string', required=True), #PID11_1
    Field('box_num', 'string'), # pid11_2
    Field('address1', 'string', required=True), #pid11_3
    Field('address2', 'string'), # pid11_4
    Field('zipcode', 'string', required=True), #pid11_5
    Field('town', 'string', required=True), # pid11_6
    Field('country', 'string', required=True), # pid11_7
    Field('address_rank','integer'),
    Field('address_origin', 'string', required=True),
    auth.signature)

db.address.address_origin.requires = IS_IN_DB(db, 'data_origin.origin', '%(origin)s')

db.define_table('phone', # pid13
    Field('id_auth_user', 'reference auth_user', writable= False, readable= False),
    Field('phone_prefix', 'integer', required=True, default = '32'), # pid13_1
    Field('phone', 'string', required=True), # pid13_2
    Field('phone_origin', 'string', required=True ),
    auth.signature)

db.phone.phone_origin.requires=IS_IN_DB(db,'data_origin.origin','%(origin)s')

db.define_table('insurance_sector',
    Field('sector', 'string', default='State'),
    format=lambda r: r.sector or 'State'
)

db.define_table('insurance',
    Field('id_auth_user', 'reference auth_user', writable= False, readable= False),
    Field('insurance_name', 'string', required=True),
    Field('insurance_plan', 'string'),
    Field('insurance_type', 'string'),
    auth.signature)

db.insurance.insurance_type.requires=IS_IN_DB(db,'insurance_sector.sector','%(sector)s')

db.define_table('procedure',
    Field('loinc_code', 'string'),
    Field('exam_name','string'),
    Field('exam_description','string'),
    Field('cycle_num','integer', default='1'),
    Field('procedure_seq','string'),
    auth.signature,
    format='%(exam_name)s')

db.define_table('procedure_family', # many to many
    Field('id_procedure', 'reference procedure'),
    Field('id_modality', 'reference modality'),
    Field('id_modality_family', 'reference modality_family'),
    auth.signature)

db.define_table('combo',
    Field('id_procedure','reference procedure'),
    Field('id_modality','reference modality'),
    auth.signature)

# db.worklist.truncate()

db.define_table('worklist',
    Field('id_auth_user', 'reference auth_user'),
    Field('sending_app','string', default = 'Oph4Py'),
    Field('sending_facility','reference facility', default = '1'),
    Field('receiving_app','string', default = 'Receiving App'),
    Field('receiving_facility','reference facility', default = '1'),
    Field('message_unique_id','string', default=str_uuid(), required=True),
    Field('procedure', 'reference procedure', required=True),
    Field('provider', 'reference auth_user', required=True),
    Field('senior', 'reference auth_user', required=True),
    Field('requested_time', 'datetime', required=True),
    Field('modality_dest', 'reference modality', required=True),
    Field('laterality', 'string', default ='both', required=True),
    Field('status_flag', 'string', required=True),
    Field('counter', 'integer', default='0'),
    Field('warning', 'string'),
    auth.signature)

db.worklist.laterality.requires=IS_IN_SET(['both', 'right', 'left', 'none'])
db.worklist.status_flag.requires=IS_IN_SET(('requested', 'processing', 'done', 'cancelled'))

# query_sessions = db((db.auth_user.membership == 2)|(db.auth_user.membership == 3)|(db.auth_user.membership == 4))

#  db.worklist.id_auth_user.requires=IS_IN_DB(db,'auth_user.id','%(first_name)s'+' '+'%(last_name)s')
#  db.worklist.provider.requires=IS_IN_DB(db(query_sessions), 'auth_user.id', '%(first_name)s'+' '+'%(last_name)s' )
# db.worklist.procedure.requires=IS_IN_DB(db,'procedure.id', '%(exam_description)s')
# db.worklist.receiving_facility.requires=IS_IN_DB(db,'facility.id', '%(facility_name)s' + ' ('+'%(id)s)')
# db.worklist.modality_dest.requires=IS_IN_DB(db,'modality.id', '%(modality_name)s')


################################################################
#               procedure                                        #
################################################################

db.define_table('tono',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist'),
    Field('timestamp', 'datetime', required=True),
    Field('tonometry','decimal(4,2)'),
    Field('pachymetry','integer'),
    Field('techno','string'),
    Field('laterality', 'string', required=True),
    auth.signature)

db.define_table('km',
    Field('id_auth_user','reference auth_user', required=True),
    Field('id_worklist','reference worklist'),
    Field('timestamp', 'datetime', required=True),
    Field('k1','decimal(4,2)'),
    Field('k2','decimal(4,2)'),
    Field('axis1','decimal(5,2)'),
    Field('axis2','decimal(5,2)'),
    Field('note','string'),
    Field('laterality','string', required=True),
    auth.signature)

db.define_table('capsulotomy',
    Field('id_auth_user','reference auth_user', required=True),
    Field('id_worklist','reference worklist'),
    Field('timestamp', 'datetime', required=True),
    Field('power_intensity','decimal(4,2)'),
    Field('spot_size','decimal(4,2)'),
    Field('laterality','string', required=True),
    auth.signature)

db.tono.id_auth_user.requires = IS_IN_DB(db, 'auth_user.id', '%(first_name)s'+' '+'%(last_name)s')
db.km.id_auth_user.requires = IS_IN_DB(db, 'auth_user.id', '%(first_name)s'+' '+'%(last_name)s')
db.tono.laterality.requires = IS_IN_SET(('right','left'))
db.capsulotomy.laterality.requires = IS_IN_SET(('right','left'))
db.km.laterality.requires = IS_IN_SET(('right','left'))
db.tono.techno.requires = IS_IN_SET(('air','apla'))

db.define_table ('optotype',
    Field('distance', 'string', required=True),
    Field('opto', 'string', required=True),
    auth.signature)

db.optotype.distance.requires = IS_IN_SET(('far','intermediate','close'))


db.define_table ('status_rx',
    Field('status', 'string', required=True),
    auth.signature)

db.define_table('rx',
    Field('id_auth_user','reference auth_user', required=True),
    Field('id_worklist','reference worklist'),
    Field('timestamp', 'datetime', required=True),
    Field('rx_origin', 'string', required=True),
    Field('glass_type', 'string'),
    Field('va_far','decimal(3,2)'),
    Field('opto_far','reference optotype'),
    Field('sph_far','decimal(4,2)'),
    Field('cyl_far','decimal(4,2)'),
    Field('axis_far', 'integer'),
    Field('opto_int','reference optotype'),
    Field('va_int','decimal(3,2)'),
    Field('sph_int','decimal(4,2)'),
    Field('cyl_int','decimal(4,2)'),
    Field('axis_int', 'integer'),
    Field('opto_close','reference optotype'),
    Field('va_close','decimal(3,2)'),
    Field('sph_close','decimal(4,2)'),
    Field('cyl_close','decimal(4,2)'),
    Field('axis_close', 'integer'),
    Field('note','string'),
    Field('laterality','string', required=True),
    Field('status','reference status_rx', required=True, default='1'),
    Field('id_duplicate', 'integer'),
    auth.signature)

db.rx.rx_origin.requires = IS_IN_SET(('autorx','glass','trial','cyclo','dil'))
db.rx.laterality.requires = IS_IN_SET(('right','left'))
db.rx.glass_type.requires = IS_IN_SET(('monofocal','progressive','bifocal','degressive','na'))

db.define_table('current_hx',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist', required=True),
    Field('description','string'),
    auth.signature)

db.define_table('ant_biom',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist', required=True),
    Field('laterality','string', required=True),
    Field('cornea','string'),
    Field('ant_chamb','string'),
    Field('iris','string'),
    Field('lens','string'),
    Field('other','string'),
    auth.signature)

db.ant_biom.laterality.requires = IS_IN_SET(('right','left'))

db.define_table('post_biom',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist', required=True),
    Field('laterality','string', required=True),
    Field('vitreous','string'),
    Field('retina','string'),
    Field('macula','string'),
    Field('papil','string'),
    Field('other','string'),
    auth.signature)

db.post_biom.laterality.requires = IS_IN_SET(('right','left'))

db.define_table('motility',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist', required=True),
    Field('description','string'),
    auth.signature)

db.define_table('phoria',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist', required=True),
    Field('description','string'),
    auth.signature)

db.define_table('pupils',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist', required=True),
    Field('description','string'),
    auth.signature)

db.define_table('disease_ref',
    Field('title','string'),
    Field('category','string'),
    Field('icd10','string'),
    Field('description', 'string'),
    auth.signature)

db.disease_ref.category.requires = IS_IN_SET(('surgical','medical'))

# should not reference to a worklist
db.define_table('phistory',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_disease_ref', 'reference disease_ref'),
    Field('id_worklist','reference worklist'),
    Field('site','string'),
    Field('title','string'),
    Field('category','string'),
    Field('note','string'),
    Field('onset', 'date'),
    Field('ended', 'date'),
    auth.signature)

db.phistory.site.requires = IS_IN_SET(('right','left','both','local','systemic'))

db.define_table('medic_ref',
    Field('name','string', required=True),
    Field('brand','string'),
    Field('packaging','string'),
    Field('active_ingredient','string'),
    Field('dosage','string'),
    Field('form','string'),
    Field('delivery', default='PO'),
    auth.signature,
    format='%(name)s'
)

db.medic_ref.delivery.requires = IS_IN_SET(('right','left','both','PO','local','IV','IM'))

# db.medic_ref.truncate('RESTART IDENTITY CASCADE')
db.define_table('mx',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_medic_ref', 'reference medic_ref'),
    Field('id_worklist','reference worklist'),
    Field('medication', 'string'),
    Field('delivery', default='PO'),
    Field('unit_per_intake','decimal(4,2)'),
    Field('frequency','string'),
    Field('onset','date'),
    Field('ended','date'), # add validity for prescription
    Field('note','string'),
    Field('prescribed','boolean', default = False),
    auth.signature
    )

# todo: laterality table to custom dropdown select
db.mx.delivery.requires = IS_IN_SET(('right','left','both','PO','local','IV','IM'))

# db.mx.truncate('RESTART IDENTITY CASCADE')

db.define_table('agent',
    Field('name','string', required=True),
    Field('code','string'),
    Field('description','string'),
    auth.signature)
# todo: reference to substance id -> get warning with interactions

#db.agent.truncate('RESTART IDENTITY CASCADE')

db.define_table('allergy',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_agent','reference agent'),
    Field('typ','string', required=True),
    Field('agent','string', required=True),
    Field('onset','date'),
    Field('ended','date'),
    auth.signature
    )

db.allergy.typ.requires=IS_IN_SET(('allergy','intolerance', 'atopy'))

db.define_table('auto_dict',
    Field('keywd', 'string'),
    Field('keyoption','string'),
    Field('keysynonym', 'string'),
    Field('keyvalue', 'string'),
    auth.signature)

# db.auto_dict.truncate('RESTART IDENTITY CASCADE')

db.define_table('ccx',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist', required=True),
    Field('laterality','string', required=True),
    Field('description','string'),
    auth.signature)

db.ccx.laterality.requires = IS_IN_SET(('right','left','na'))

db.define_table('medical_rx_list',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist','reference worklist', required=True),
    Field('id_mx_ref', 'string', required=True),
    Field('mx_names', 'string'),
    Field('uuid','string', default=str_uuid()),
    Field('pdf_report','blob'),
    auth.signature)

db.define_table('md_params',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('inami', 'string'),
    Field('email', 'string'),
    Field('officename', 'string'),
    Field('officeaddress','string'),
    Field('officezip','string'),
    Field('officetown','string'),
    Field('officecountry','string'),
    Field('officephone','string'),
    Field('officeurl','string'),
    Field('companynum','string'),
    Field('companyname','string'),
    Field('companyaddress','string'),
    Field('companyiban','string'),
    auth.signature)

db.define_table('glasses_rx_list',
    Field('uuid','string', default=str_uuid()),
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist','reference worklist', required=True), # from the autorx wl!
    Field('datestamp', 'date'),
    Field('glass_type', 'string'),
    Field('sph_farR','decimal(4,2)'),
    Field('cyl_farR','decimal(4,2)'),
    Field('axis_farR', 'integer'),
    Field('sph_intR','decimal(4,2)'),
    Field('cyl_intR','decimal(4,2)'),
    Field('axis_intR', 'integer'),
    Field('sph_closeR','decimal(4,2)'),
    Field('cyl_closeR','decimal(4,2)'),
    Field('axis_closeR', 'integer'),
    Field('sph_farL','decimal(4,2)'),
    Field('cyl_farL','decimal(4,2)'),
    Field('axis_farL', 'integer'),
    Field('sph_intL','decimal(4,2)'),
    Field('cyl_intL','decimal(4,2)'),
    Field('axis_intL', 'integer'),
    Field('sph_closeL','decimal(4,2)'),
    Field('cyl_closeL','decimal(4,2)'),
    Field('axis_closeL', 'integer'),
    Field('remarks','string'),
    Field('art30','boolean', default=False),
    Field('prismR','decimal(4,2)'),
    Field('baseR', 'string'),
    Field('prismL','decimal(4,2)'),
    Field('baseL', 'string'),
    Field('tint','boolean'), # true = medical, false = non medical, null = no tint
    Field('photo','boolean'), # true = medical, false = non medical, null = not photochromic
    Field('pdf_report','blob'),
    auth.signature)

db.define_table('followup',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist','reference worklist', required=True),
    Field('description','string'),
    auth.signature)

#temporary
db.define_table('billing',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist','reference worklist', required=True),
    Field('description','string'),
    auth.signature)

# contactlenses
db.define_table('lenses',
    Field('name', 'string', required=True),
    Field('brand','string'),
    Field('material','string'),
    Field('design','string'),
    Field('edge','string'),
    Field('opticalzone','string'),
    Field('basecurve','string'),
    Field('diameter','string'),
    Field('rigidity','string'),
    Field('toricity','boolean'),
    Field('misc','string'),
    auth.signature)

# cleaning solution
db.define_table ('cleaning_solution',
    Field('name','string', required=True),
    Field('brand', 'string'),
    Field('cat', 'string'),
    auth.signature)

db.define_table('contacts_rx_list',
    Field('uuid','string', default=str_uuid()),
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist','reference worklist', required=True), # from the autorx wl!
    Field('datestamp', 'date'),
    Field('sph_farR','decimal(4,2)'),
    Field('cyl_farR','decimal(4,2)'),
    Field('axis_farR', 'integer'),
    Field('sph_intR','decimal(4,2)'),
    Field('cyl_intR','decimal(4,2)'),
    Field('axis_intR', 'integer'),
    Field('sph_closeR','decimal(4,2)'),
    Field('cyl_closeR','decimal(4,2)'),
    Field('axis_closeR', 'integer'),
    Field('sph_farL','decimal(4,2)'),
    Field('cyl_farL','decimal(4,2)'),
    Field('axis_farL', 'integer'),
    Field('sph_intL','decimal(4,2)'),
    Field('cyl_intL','decimal(4,2)'),
    Field('axis_intL', 'integer'),
    Field('sph_closeL','decimal(4,2)'),
    Field('cyl_closeL','decimal(4,2)'),
    Field('axis_closeL', 'integer'),
    Field('remarks','string'),
    Field('art30','boolean', default=False),
    Field('prismR','decimal(4,2)'),
    Field('baseR', 'string'),
    Field('prismL','decimal(4,2)'),
    Field('baseL', 'string'),
    Field('sphR','decimal(4,2)'),
    Field('cylR','decimal(4,2)'),
    Field('axisR', 'integer'),
    Field('sphL','decimal(4,2)'),
    Field('cylL','decimal(4,2)'),
    Field('axisL', 'integer'),
    Field('cleaningR','string'),
    Field('lensnameR','string'),
    Field('diameterR','string'),
    Field('edgeR','string'),
    Field('designR','string'),
    Field('basecurveR','string'),
    Field('materialR', 'string'),
    Field('opticalzoneR','string'),
    Field('cleaningL','string'),
    Field('lensnameL','string'),
    Field('diameterL','string'),
    Field('edgeL','string'),
    Field('designL','string'),
    Field('basecurveL','string'),
    Field('materialL', 'string'),
    Field('opticalzoneL','string'),
    Field('g1sspheric','boolean'),
    Field('g1storic','boolean'),
    Field('g1rspheric','boolean'),
    Field('g1rtoric','boolean'),
    Field('g2soft','boolean'),
    Field('g2rigidc','boolean'),
    Field('g2rigidcs','boolean'),
    Field('g2rigids','boolean'),
    Field('g3iris','boolean'),
    Field('g3pupil','boolean'),
    Field('addcR','decimal(4,2)'),
    Field('addcL','decimal(4,2)'),
    Field('pdf_report','blob'),
    auth.signature)