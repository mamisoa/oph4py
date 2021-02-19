# Management controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A, XML
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from pydal.validators import CRYPT # to encrypt passwords

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working
from py4web.utils.grid import Grid


def check_duplicate(form):
    if not form.errors:
        query_email = (db.auth_user.email == form.vars['email'])
        query_username = (db.auth_user.username == form.vars['username'])
        if (db(query_email).count() + db(query_username).count() == 2):
            form.errors['email'] = T('Email already taken')
            form.errors['username'] = T('and username already taken')
        elif (db(query_email).count() != 0):
            form.errors['email'] = T('Email already taken')
            form.errors['username'] = ""
        elif (db(query_username).count() != 0):
            form.errors['username'] = T('Username already taken')
            form.errors['email'] = ""

@action('user', method=['POST','GET'])
@action('user/<rec_id>', method=['POST','GET','PUT','DELETE'])
@action.uses('manage/user.html', session, auth.user, db, flash)
def user(rec_id=None):
    user = auth.get_user()
    form = Form([
        Field('first_name'),
        Field('last_name'),
        Field('email'),
        Field('username'),
        Field('password'),
        Field('membership'),
        Field('gender')],
        validation=check_duplicate
        )
    roleOption=""
    for role in db(db.membership.id>0).select(db.membership.ALL):
        if len(roleOption) == 0:
            roleOption += "<option selected value='"
        else:
            roleOption += "<option value='"
        roleOption += str(role.id) + "'>" + role.membership + " (level " + str(role.hierarchy) + ")</option>"
        roleOption = XML(roleOption)
    genderOption=""
    for gender in db(db.gender.id>0).select(db.gender.ALL):
        if len(genderOption) == 0:
            genderOption += "<option selected value='"
        else:
            genderOption += "<option value='"
        genderOption += str(gender.id) + "'>" + gender.sex+"</option>"
        genderOption = XML(genderOption)
    form_key=form.formkey # identify the form, formname="None"
    if form.accepted:
        db.auth_user.insert(first_name=form.vars['first_name'],
            last_name=form.vars['last_name'],
            username=form.vars['username'],
            email=form.vars['email'],
            password=str(CRYPT()(form.vars['password'])[0]),
            membership=form.vars['membership'],
            gender=form.vars['gender'],
            )
        db.commit()
        passwordRow = db(db.auth_user.email == form.vars['email']).select(db.auth_user.password)
        password = passwordRow[0].password
        flash.set("User added with password: "+ password, sanitize=True)
        redirect(URL('index'))
    elif form.errors:
        flash.set(form.errors['email']+' '+form.errors['username'])
        redirect(URL('index'))
    return locals()

@action('users', method=['POST','GET'])
@action('users/<path:path>', method=['POST', 'GET'])
@action.uses('manage/users.html', session, db, auth.user, flash)
def users(path=None):
    grid = Grid (path, query = db.auth_user.id > 0, formstyle=FormStyleBootstrap4)
    return locals()