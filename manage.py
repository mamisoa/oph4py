# Management controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working

def check_duplicate(form):
    query_email = (db.auth_user.email == form.vars['email'])
    query_username = (db.auth_user.username == form.vars['username'])
    form.errors['email'] = ""
    form.errors['username'] = ""
    if (db(query_email).count() + db(query_username).count() == 2):
        form.errors['email'] = T('Email already taken')
        form.errors['username'] = T('and username already taken')
    elif (db(query_email).count() != 0):
        form.errors['email'] = T('Email already taken')
    elif (db(query_username).count() != 0):
        form.errors['username'] = T('Username already taken')

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
        Field('password')],
        validation=check_duplicate
        )
    form_key=form.formkey # identify the form, formname="None"
    if form.accepted:
        db.auth_user.insert(first_name=form.vars['first_name'],
            last_name=form.vars['last_name'],
            username=form.vars['username'],
            email=form.vars['email'],
            password=form.vars['password']
            )
        db.commit()
        flash.set("User added", sanitize=True)
        redirect(URL('index'))
    elif form.errors:
        flash.set(form.errors['email']+' '+form.errors['username'])
        redirect(URL('index'))
    return locals()
