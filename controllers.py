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

from py4web import action, request, abort, redirect, URL, Field
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working


@unauthenticated("index", "index.html")
def index():
    user = auth.get_user()
    message = T("Hello {first_name}".format(**user) if user else "Hello")
    return dict(message=message)

@action("test") # route
@action.uses('test.html', T, auth, db, flash)
def test():
    user = auth.get_user()
    flash.set("Hello World", sanitize=True)   
    test="Test OK"
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
    if form.accepted:
        db.testtable.insert(test_name=form.vars['test_name'],
            test_id=form.vars['test_id'],
            test_gender=form.vars['test_gender'])
        flash.set("Testtable row added", sanitize=True)
        redirect(URL('index'))
    return dict(form=form, user=user)

################################################################
#                    API                                       #
################################################################

from pydal.restapi import RestAPI, Policy

policy = Policy()
policy.set('*','GET', authorize=True, allowed_patterns=['*'])
policy.set('*','POST', authorize=True)

@action('api/<tablename>/', method=['GET','POST'])
@action('api/<tablename>/<rec_id>', method=['GET','PUT','DELETE'])
def api(tablename, rec_id=None):
    return RestAPI(db,policy)(request.method,tablename,rec_id,request.GET,request.POST)

