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

db.define_table('modality_type',
    Field('family', 'string', required=True),
    auth.signature,
    format='%(modality_name)s')

db.define_table('modality',
    Field('modality_name', 'string', required=True),
    auth.signature,
    format='%(modality_name)s')


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

db.define_table('exam2do',
    Field('loinc_code', 'string'),
    Field('exam_description','string'),
    Field('cycle_num','integer', default='1'),
    Field('procedure_seq','string'),
    Field('controller','string'),
    auth.signature)

db.define_table('worklist',
    Field('id_auth_user', 'reference auth_user'),
    Field('sending_app','string', default = 'ECapp19'),
    Field('sending_facility','reference facility', default = '1'),
    Field('receving_app','string', default = 'Receving App'),
    Field('receving_facility','reference facility', default = '1'),
    Field('message_unique_id','string', default=str_uuid(), required=True),
    Field('exam2do', 'reference exam2do', required=True),
    Field('provider', 'reference auth_user', required=True),
    Field('requested_time', 'datetime', required=True),
    Field('modality_dest', 'reference modality', required=True),
    Field('laterality', 'list:string', default ='both', required=True),
    Field('status_flag', 'list:string', required=True),
    Field('counter', 'integer', default='0'),
    Field('warning', 'string'),
    auth.signature)

db.worklist.laterality.requires=IS_IN_SET(['both', 'right', 'left', 'none'])

query_sessions = db((db.auth_user.membership == 2)|(db.auth_user.membership == 3)|(db.auth_user.membership == 4))

db.worklist.id_auth_user.requires=IS_IN_DB(db,'auth_user.id','%(first_name)s'+' '+'%(last_name)s')
db.worklist.provider.requires=IS_IN_DB(db(query_sessions), 'auth_user.id', '%(first_name)s'+' '+'%(last_name)s' )
db.worklist.status_flag.requires=IS_IN_SET(('requested', 'processing', 'done', 'cancelled'))
db.worklist.exam2do.requires=IS_IN_DB(db,'exam2do.id', '%(exam_description)s')
db.worklist.receving_facility.requires=IS_IN_DB(db,'facility.id', '%(facility_name)s' + ' ('+'%(id)s)')
db.worklist.modality_dest.requires=IS_IN_DB(db,'modality.id', '%(modality_name)s')


################################################################
#               EXAM2DO                                        #
################################################################

db.define_table('tono',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist'),
    Field('tonometry','decimal(2,2)'),
    Field('pachymetry','integer'),
    Field('techno','list:string'),
    Field('laterality', 'list:string', required=True),
    auth.signature)

db.define_table('topography',
    Field('id_auth_user','reference auth_user', required=True),
    Field('id_worklist','reference worklist'),
    Field('k1','decimal(2,2)'),
    Field('k2','decimal(2,2)'),
    Field('axis1','decimal(2,2)'),
    Field('axis2','decimal(2,2)'),
    Field('laterality','list:string', required=True),
    auth.signature)

db.define_table('capsulotomy',
    Field('id_auth_user','reference auth_user', required=True),
    Field('id_worklist','reference worklist'),
    Field('power_intensity','decimal(2,2)'),
    Field('spot_size','decimal(2,2)'),
    Field('laterality','list:string', required=True),
    auth.signature)

db.tono.id_auth_user.requires = IS_IN_DB(db, 'auth_user.id', '%(first_name)s'+' '+'%(last_name)s')
db.topography.id_auth_user.requires = IS_IN_DB(db, 'auth_user.id', '%(first_name)s'+' '+'%(last_name)s')
db.tono.laterality.requires = IS_IN_SET(('right','left'))
db.capsulotomy.laterality.requires = IS_IN_SET(('right','left'))
db.topography.laterality.requires = IS_IN_SET(('right','left'))
db.tono.techno.requires = IS_IN_SET(('air','apla'))

db.define_table ('optotype',
    Field('distance', 'list:string', required=True),
    Field('opto', 'string', required=True),
    auth.signature)

db.optotype.distance.requires = IS_IN_SET(('far','intermediate','close'))

db.define_table('rx',
    Field('id_auth_user','reference auth_user', required=True),
    Field('id_worklist','reference worklist'),
    Field('rx_origin', 'list:string', required=True),
    Field('glass_type', 'list:string'),
    Field('va_far','decimal(2,2)'),
    Field('opto_far','string'),
    Field('sph_far','decimal(2,2)'),
    Field('cyl_far','decimal(2,2)'),
    Field('axis_far', 'integer'),
    Field('opto_int','string'),
    Field('va_int','decimal(2,2)'),
    Field('sph_int','decimal(2,2)'),
    Field('cyl_int','decimal(2,2)'),
    Field('axis_int', 'integer'),
    Field('opto_close','string'),
    Field('va_close','decimal(2,2)'),
    Field('sph_close','decimal(2,2)'),
    Field('cyl_close','decimal(2,2)'),
    Field('axis_close', 'integer'),
    Field('note','string'),
    Field('laterality','list:string', required=True),
    auth.signature)

db.rx.rx_origin.requires = IS_IN_SET(('autorx','glass','trial','cyclo','dil'))
db.rx.laterality.requires = IS_IN_SET(('right','left'))
db.rx.glass_type.requires = IS_IN_SET(('monofocal','progressive','bifocal','degressive'))

db.define_table('ant_biom',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist'),
    Field('laterality','list:string', required=True),
    Field('cornea','string'),
    Field('ant_chamb','string'),
    Field('iris','string'),
    Field('lens','string'),
    Field('other','string'),
    auth.signature)

db.ant_biom.laterality.requires = IS_IN_SET(('right','left'))

db.define_table('post_biom',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist'),
    Field('laterality','list:string', required=True),
    Field('vitreous','string'),
    Field('retina','string'),
    Field('macula','string'),
    Field('papil','string'),
    Field('other','string'),
    auth.signature)

db.post_biom.laterality.requires = IS_IN_SET(('right','left'))

db.define_table('phistory',
    Field('id_auth_user', 'reference auth_user', required=True),
    Field('id_worklist', 'reference worklist'),
    Field('phistory','string'),
    auth.signature)

db.define_table('mx',
    Field('id_auth_user', 'reference auth_user', writable = False, readable = False),
    Field('name','string'),
    Field('brand','string'),
    Field('active_ingredient','string'),
    Field('dosage','string'),
    Field('form','string'),
    Field('unit_per_intake','string'),
    Field('frequency','string'),
    Field('onset','date'),
    Field('ended','date'),
    auth.signature
    )

db.define_table('alerts',
    Field('id_auth_user', 'reference auth_user', writable = False, readable = False),
    Field('typ','string'),
    Field('agent','string'),
    Field('description','string'),
    Field('agent_id','string'),
    Field('description_id','string'),
    Field('onset','date'),
    auth.signature
    )

db.alerts.typ.requires=IS_IN_SET(['allergy','intolerance', 'atopy'])
