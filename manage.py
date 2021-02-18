# Management controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working

@action('user', method=['POST','GET'])
@action('user/<rec_id>', method=['POST','GET','PUT','DELETE'])
@action.uses('manage/user.html', session, auth.user, db, flash)
def user(rec_id=None):
    user = auth.get_user()
    return locals()
