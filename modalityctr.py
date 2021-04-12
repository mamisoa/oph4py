# Modality controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A, XML, OPTION, CAT
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from pydal.validators import CRYPT # to encrypt passwords

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working
from py4web.utils.grid import Grid

from .manage import dropdownSelect

# tono controller
@action('tono')
@action('modalityCtr/tono/<wlId>')
@action.uses('modalityCtr/tono.html', session, auth, db)
def tono(wlId):
    user = auth.get_user()
    return locals()

# autorx controller
@action('autorx')
@action('modalityCtr/autorx/<wlId>')
@action.uses('modalityCtr/autorx.html', session, auth, db)
def autorx(wlId):
    user = auth.get_user()
    qFar = db.optotype.distance == 'far'
    qClose = db.optotype.distance == 'close'
    optoFarOptions = dropdownSelect(db.optotype, db.optotype.fields[2],1,'index', qFar)
    optoCloseOptions = dropdownSelect(db.optotype, db.optotype.fields[2],1,'index', qClose)
    statusRxOptions = dropdownSelect(db.status_rx, db.status_rx.fields[1],'index')
    return locals()

### md controller

# function to init fields in view
# return an array
def initFields(wlId,table,lat=""):
    fieldsArr= db[table].fields
    if lat == "":
        query = db(db[table].id_worklist == wlId)
    else:
        query = db((db[table].id_worklist == wlId) & (db[table].laterality == lat))
    items = {}
    if query.count() > 0:
        items = query.select().first()
        # remove 'None' when empty fields
        for item in items:
            if items[item] == None:
                items[item] = ""
    else :
        for i in range(len(fieldsArr)):
            items[fieldsArr[i]]=""
    return items

@action('md')
@action('modalityCtr/md/<wlId>')
@action.uses('modalityCtr/md.html', session, auth, db)
def md(wlId):
    user = auth.get_user()
    userId = db(db.worklist.id == wlId).select(db.worklist.id_auth_user).first().id_auth_user
    # get modality vs controller
    modalityDict = {}
    rows = db(db.modality.id_modality_controller==db.modality_controller.id).select()
    for row in rows:
        modalityDict[row.modality.modality_name]=row.modality_controller.modality_controller_name
    # init fields
    currentHx = initFields(wlId,'current_hx')
    antRight = initFields(wlId,'ant_biom','right')
    postRight = initFields(wlId,'post_biom','right')
    antLeft = initFields(wlId,'ant_biom','left')
    postLeft = initFields(wlId,'post_biom','left')
    motility = initFields(wlId,'motility')
    phoria = initFields(wlId,'phoria')
    pupils = initFields(wlId,'pupils')
    ccx = initFields(wlId,'ccx')
    ccxR = initFields(wlId,'ccx','right')
    ccxL = initFields(wlId,'ccx','left')
    return locals()

# helloworld controller
@action('hello')
@action.uses('modalityCtr/hello.html', session, auth, db)
def hello():
    user = auth.get_user()
    string = "Hello World!"
    return locals()