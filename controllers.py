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
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working
from py4web.utils.tags import Tags


if db(db.facility.id > 1).count() == 0:
    db.facility.insert(facility_name="Desk1")
    db.facility.insert(facility_name="Desk2")
    db.facility.insert(facility_name="Iris")
    db.facility.insert(facility_name="Cornea")
    db.facility.insert(facility_name="Cristalline")
    db.facility.insert(facility_name="Retina")
    db.facility.insert(facility_name="Exam1")
    db.facility.insert(facility_name="Exam2")
    db.facility.insert(facility_name="Reunion")

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

if db(db.data_origin.id > 1).count() == 0:
    db.data_origin.insert(origin="Home")
    db.data_origin.insert(origin="Mobile")
    db.data_origin.insert(origin="Work")

@unauthenticated("index", "index.html")
def index():
    user = auth.get_user()
    message = T("Hello {first_name}!".format(**user) if user else "Hello. You should sign in!")
    db_admins_count = db(db.auth_user.membership==1).count()
    db_doctors_count = db(db.auth_user.membership==2).count()
    db_nurses_count = db(db.auth_user.membership==3).count()
    db_massistants_count = db(db.auth_user.membership==4).count()
    db_assistants_count = db(db.auth_user.membership==5).count()
    db_patients_count = db(db.auth_user.membership==6).count()
    db_entries_count = db(db.auth_user).count()
    return locals()

@action("test") # route
@action('test/<membership>')
@action.uses('test.html', T, auth, db, flash)
def test(membership=2):
    user = auth.get_user()
    flash.set("Hello World", sanitize=True)   
    test="Test OK"
    try: # check if membership exists
        check_group= db(db.membership.id == membership).isempty()
    except ValueError:
        membership = 2
    else:
        if check_group is True: # if does not exist
            membership = 2
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
    return locals()

@action("facilities", method=['GET', 'POST'])
@action.uses('facilities.html', session, auth.user, db, flash) # add auth.user and db to get 
def facilities():
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
@action.uses('testtable.html', session, auth.user, db, flash)
def testtable():
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
