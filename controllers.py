"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A, XML, OPTION, CAT
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working
from pydal.tools.tags import Tags

from pydal.validators import CRYPT # to encrypt passwords

# import settings
from .settings import ENV_STATUS, LOCAL_URL, APP_NAME, TIMEOFFSET, NEW_INSTALLATION # DB_OCTOPUS

# grid
from functools import reduce
from py4web.utils.grid import Grid

# useful
from .useful import getMembershipId, dropdownSelect, check_duplicate


# @unauthenticated("index", "index.html")
@action('index')
@action.uses(session, auth.user, db,'index.html')
def index():
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    user = auth.get_user()
    userMembership = db(db.membership.id == user['membership']).select(db.membership.membership).first()['membership']
    if "NEW_INSTALLATION" in globals():
        if NEW_INSTALLATION == True:
            redirect(URL('isNew'))
    if 'membership' in user:
        userMembership = db(db.membership.id == user['membership']).select(db.membership.membership).first()['membership']
    message = T("Hello {first_name}!".format(**user) if user else "Hello. You should sign in!")
    db_admins_count = db(db.auth_user.membership==getMembershipId('Admin')).count()
    db_doctors_count = db(db.auth_user.membership==getMembershipId('Doctor')).count()
    db_nurses_count = db(db.auth_user.membership==getMembershipId('Nurse')).count()
    db_massistants_count = db(db.auth_user.membership==getMembershipId('Medical assistant')).count()
    db_assistants_count = db(db.auth_user.membership==getMembershipId('Administrative')).count()
    db_patients_count = db(db.auth_user.membership==getMembershipId('Patient')).count()
    db_entries_count = db(db.auth_user).count()
    return locals()

@action('isNew')
@action.uses(session, auth.user, db, 'test/isnew.html')
def isNew():
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    userMembership = None
    return locals()

@action("test", method=['POST','GET']) # route
@action('test/<membership>')
@action.uses(session, T, auth, db, flash, 'test.html')
def test(membership=6):
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    hosturl = LOCAL_URL
    user = auth.get_user()
    userId=user['username']
    flash.set("Hello World", sanitize=True)   
    test="Test OK"
    try: # check if membership exists
        check_group= db(db.membership.id == membership).isempty()
    except ValueError:
        membership = 6
    else:
        if check_group is True: # if does not exist
            membership = 6
    def group_icon(membership):
        dict_icon = {
            1:'fa-users-cog',
            2:'fa-user-md',
            3:'fa-user-nurse',
            4:'fa-user-nurse',
            5:'fa-user-edit',
            6:'fa-user'
        }
        return dict_icon[int(membership)]
    class_icon = group_icon(membership)
    group = (db(db.membership.id == membership).select().first()).membership #name of membership
    roleOptions=""
    for role in db(db.membership.id>0).select(db.membership.ALL):
        if role.membership == "Patient": # make "Patient" as default option
            roleOptions = CAT(roleOptions, OPTION(role.membership + " (level " + str(role.hierarchy) + ")",_selected="selected",_value=str(role.id)))
        else:
            roleOptions = CAT(roleOptions, OPTION(role.membership + " (level " + str(role.hierarchy) + ")",_value=str(role.id)))
    roleOptions = XML(roleOptions)
    genderOptions = dropdownSelect(db.gender,db.gender.fields[1],1) 
    return locals()

@action("facilities", method=['GET', 'POST'])
@action.uses(session, auth.user, db, flash,'facilities.html') # add auth.user and db to get 
def facilities():
    env_status = ENV_STATUS
    user = auth.get_user() # needed to transfer globals to view
    form = Form([
        Field('facility_name'),
        Field('hosp_id')],
        formstyle=FormStyleBootstrap4)
    if form.accepted:
        db.facilities.insert(facility_name=form.vars['facility_name'],hosp_id=form.vars['hosp_id'])
        flash.set("Facility row added", sanitize=True)
        db.commit()
        redirect(URL('index'))
    return dict(form=form, user=user)

@action("testtable", method=['GET', 'POST'])
@action.uses(session, auth.user, db, flash, 'testtable.html')
def testtable():
    env_status = ENV_STATUS
    user = auth.get_user()
    form = Form([
        Field('test_name'),
        Field('test_id'),
        Field('test_gender')],
        formstyle=FormStyleBootstrap4)
    form_key=form.formkey
    if form.accepted:
        db.testtable.insert(test_name=form.vars['test_name'],
            test_id=form.vars['test_id'],
            test_gender=form.vars['test_gender'])
        db.commit()
        flash.set("Testtable row added", sanitize=True)
        redirect(URL('index'))
    return dict(form=form, user=user, form_key=form_key)

@action('companies', method=['POST', 'GET'])
@action('companies/<path:path>', method=['POST', 'GET'])
@action.uses(session, db, auth, 'grid.html')
def companies(path=None):
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    grid = Grid(path,
                query=reduce(lambda a, b: (a & b), [db.auth_user.id > 0]),
                orderby=[db.auth_user.username],
                search_queries=[['Search by Name', lambda val: db.auth_user.username.contains(val)]])
    return dict(grid=grid)

@action('listdir')
@action.uses(session, auth.user, db, flash,'listdir.html')
def listdir():
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    user = auth.get_user()
    hosturl = LOCAL_URL
    test = 5
    return locals()

