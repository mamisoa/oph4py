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
    # Field('b64img','blob'),
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

modality_types = Tags(db.modality)

if db(db.modality.id > 1).count() == 0:
    db.modality.insert(modality_name="L80")
    modality_types.add(1, ['Rx'])
    db.modality.insert(modality_name="VX-120")
    modality_types.add(2, ['Rx'])
    db.modality.insert(modality_name="TonoRef")
    modality_types.add(3, ['Tono'])
    db.modality.insert(modality_name="TonoCan")
    modality_types.add(4, ['Tono'])
    db.modality.insert(modality_name="Octopus 900")
    modality_types.add(5, ['VF'])
    db.modality.insert(modality_name="FDT")
    modality_types.add(6, ['VF'])
    db.modality.insert(modality_name="OCT Maestro")
    modality_types.add(7, ['Imaging','OCT'])
    db.modality.insert(modality_name="Pentacam")
    modality_types.add(8, ['Imaging','Biometry','Topo'])
    db.modality.insert(modality_name="Anterion")
    modality_types.add(9, ['Imaging','Biometry','Topo'])
    db.modality.insert(modality_name="Visucam")
    modality_types.add(10, ['Imaging','Angiography','Fluo'])
    db.modality.insert(modality_name="CEM-500")
    modality_types.add(11, ['Imaging'])

db.define_table('address',
    Field('id_auth_user', 'reference auth_user', writable = False, readable = False),
    Field('home_num_pid11_1', 'integer', required=True),
    Field('box_num_pid11_2', 'string'),
    Field('address1_pid11_3', 'string', required=True),
    Field('address2_pid11_4', 'string'),
    Field('zipcode_pid11_5', 'string', required=True),
    Field('town_pid11_6', 'string', required=True),
    Field('country_pid11_7', 'string', required=True),
    Field('address_rank','integer'),
    auth.signature)

db.define_table('data_origin',
    Field('origin', 'string', default='Home'),
    format=lambda r: r.origin or 'Home'
)

if db(db.data_origin.id > 1).count() == 0:
    db.data_origin.insert(origin="Home")
    db.data_origin.insert(origin="Mobile")
    db.data_origin.insert(origin="Work")

db.define_table('phone',
    Field('id_auth_user', 'reference auth_user', writable= False, readable= False),
    Field('phone_prefix_pid13_1', 'integer', required=True, default = '32'),
    Field('phone_pid13_2', 'string', required=True),
    Field('phone_origin', 'string', required=True ),
    auth.signature)

db.phone.phone_origin.requires=IS_IN_DB(db,'data_origin.origin','%(origin)s')

db.define_table('insurance_sector',
    Field('sector', 'string', default='State'),
    format=lambda r: r.sector or 'State'
)

db.define_table('insurance',
    Field('id_auth_user', 'reference auth_user', writable= False, readable= False),
    Field('insurance_name_IN1', 'string', required=True),
    Field('insurance_plan_IN2', 'string'),
    Field('insurance_type_IN3', 'string'),
    auth.signature)

db.insurance.insurance_type_IN3.requires=IS_IN_DB(db,'insurance_sector.sector','%(sector)s')

db.define_table('exam2do_OBR4',
    Field('loinc_code', 'string'),
    Field('exam_description','string'),
    Field('cycle_num','integer', default='1'),
    Field('procedure_seq','string'),
    Field('controller','string'),
    auth.signature)

db.define_table('worklist',
    Field('id_auth_user', 'reference auth_user'),
    Field('sending_app_MSH3','string', default = 'Oph2Py'),
    Field('sending_facility_MSH4','reference facility', default = '1'),
    Field('receving_app_MSH5','string', default = 'Receving App'),
    Field('receving_facility_MSH6','reference facility', default = '1'),
    Field('message_unique_id_MSH10','string', default=str(uuid.UUID(int=rd.getrandbits(128), version=4)), required=True),
    Field('exam2do_OBR4', 'reference exam2do_OBR4', required=True),
    Field('provider_OBR16', 'reference auth_user', required=True),
    Field('requested_time_OBR6', 'datetime', required=True),
    Field('modality_dest_OBR24', 'reference modality', required=True),
    Field('laterality', 'list:string', default ='both', required=True),
    Field('status_flag', 'list:string', required=True),
    Field('counter', 'integer', default='0'),
    Field('warning', 'string'),
    auth.signature)

db.worklist.laterality.requires=IS_IN_SET(['both', 'right', 'left', 'none'])

# query_sessions = ((db(groups.find['doctor']))&(db(groups.find['nurse']))&(db(groups.find['assistant'])))

db.worklist.id_auth_user.requires=IS_IN_DB(db,'auth_user.id','%(first_name)s'+' '+'%(last_name)s')
db.worklist.provider_OBR16.requires=IS_IN_DB(db, 'auth_user.id', '%(first_name)s'+' '+'%(last_name)s' )
db.worklist.status_flag.requires=IS_IN_SET(('requested', 'in process', 'done', 'cancelled'))
db.worklist.exam2do_OBR4.requires=IS_IN_DB(db,'exam2do_OBR4.id', '%(exam_description)s')
db.worklist.receving_facility_MSH6.requires=IS_IN_DB(db,'facility.id', '%(facility_name)s' + ' ('+'%(id)s)')
db.worklist.modality_dest_OBR24.requires=IS_IN_DB(db,'modality.id', '%(modality_name)s')

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
