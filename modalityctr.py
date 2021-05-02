# Modality controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A, XML, OPTION, CAT
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from pydal.validators import CRYPT # to encrypt passwords

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working
from py4web.utils.grid import Grid

# import settings
from .settings import LOCAL_URL, ASSETS_FOLDER

from .manage import dropdownSelect, rows2json

# tono controller
@action('tono')
@action('modalityCtr/tono/<wlId>')
@action.uses('modalityCtr/tono.html', session, auth, db)
def tono(wlId):
    hosturl = LOCAL_URL
    user = auth.get_user()
    return locals()

# autorx controller
@action('autorx')
@action('modalityCtr/autorx/<wlId>')
@action.uses('modalityCtr/autorx.html', session, auth, db)
def autorx(wlId):
    hosturl = LOCAL_URL
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
    import base64, ast
    from datetime import datetime
    hosturl = LOCAL_URL
    user = auth.get_user()
    patientId = db(db.worklist.id == wlId).select(db.worklist.id_auth_user).first().id_auth_user
    patientDict = db(db.auth_user.id == patientId).select(db.auth_user.first_name,db.auth_user.last_name,db.auth_user.dob,db.auth_user.photob64).as_json()
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
    followup = initFields(wlId,'followup')
    billing = initFields(wlId,'billing')
    mddb=db.md_params
    mdParams= db(mddb.id_auth_user == user['id']).select(mddb.id_auth_user,mddb.inami,mddb.email,mddb.officename,mddb.officeaddress,mddb.officezip,mddb.officetown,mddb.officeurl,mddb.officephone,mddb.companynum,mddb.companyname,mddb.companyiban,mddb.companyaddress).first().as_dict()
    userDict = db(db.auth_user.id == user['id']).select(db.auth_user.first_name,db.auth_user.last_name).first().as_dict()
    # glasses assets
    axe_img_path = ASSETS_FOLDER+'/images/assets/glassesrx/axe.png'
    logo_img_path = ASSETS_FOLDER+'/images/assets/glassesrx/logo.jpg'
    axe64 = base64.b64encode(open(axe_img_path, "rb").read())
    logo64 = base64.b64encode(open(logo_img_path, "rb").read())
    return locals()

# helloworld controller
@action('hello')
@action('modalityCtr/hello/<wlId>')
@action.uses('modalityCtr/hello.html', session, auth, db)
def hello(wlId):
    import base64
    hosturl = LOCAL_URL
    database = db._tables
    user = auth.get_user()
    # userId = db(db.worklist.id == wlId).select(db.worklist.id_auth_user).first().id_auth_user
    userId = "1"
    string = "Hello World!"
    return locals()
