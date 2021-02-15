"""
This file defines the database models
"""

from .common import db, Field, auth # add auth for auto.signature
from pydal.validators import *

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

