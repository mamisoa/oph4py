# Modality controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A, XML, OPTION, CAT
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from pydal.validators import CRYPT # to encrypt passwords

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working
from py4web.utils.grid import Grid

# import settings
from .settings import LOCAL_URL, ASSETS_FOLDER, MACHINES_FOLDER, NEW_INSTALLATION, TIMEOFFSET, ENV_STATUS

# import userful
from .useful import dropdownSelect, rows2json, getMembershipId

# get standard index in db for patient/user profile
# TODO remove try and check if new installation
if "NEW_INSTALLATION" in globals():
    if NEW_INSTALLATION == True:
        pass
    else:
        mdId = db(db.modality.modality_name == 'MD').select(db.modality.id).first().id
        genderId = {
            db(db.gender.sex == 'Male').select(db.gender.id).first().id : "Male",
            db(db.gender.sex == 'Female').select(db.gender.id).first().id : "Female",
            db(db.gender.sex == 'Other').select(db.gender.id).first().id : "Other" }
else:
    mdId = db(db.modality.modality_name == 'MD').select(db.modality.id).first().id
    genderId = {
        db(db.gender.sex == 'Male').select(db.gender.id).first().id : "Male",
        db(db.gender.sex == 'Female').select(db.gender.id).first().id : "Female",
        db(db.gender.sex == 'Other').select(db.gender.id).first().id : "Other" }

# tono controller
@action('tono')
@action('modalityCtr/tono/<wlId>')
@action.uses(session, auth, db,'modalityCtr/tono.html')
def tono(wlId):
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    hosturl = LOCAL_URL
    user = auth.get_user()
    genderObj = genderId # used in patient-bar
    wldb = db.worklist
    wlDict = db(wldb.id == wlId).select(wldb.ALL,db.auth_user.ALL, db.modality.modality_name,
        join=[
            db.auth_user.on(db.auth_user.id == wldb.id_auth_user),
            db.modality.on(db.modality.id == wldb.modality_dest),
            ]
        ).as_json()
    providerDict = db(wldb.id == wlId).select(db.auth_user.ALL,
        left = db.auth_user.on(db.auth_user.id == wldb.provider)).as_json()
    seniorDict = db(wldb.id == wlId).select(db.auth_user.ALL,
        left = db.auth_user.on(db.auth_user.id == wldb.senior)).as_json()
    return locals()

# autorx controller
@action('autorx')
@action('modalityCtr/autorx/<wlId>')
@action.uses(session, auth, db,'modalityCtr/autorx.html')
def autorx(wlId):
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    hosturl = LOCAL_URL
    user = auth.get_user()
    genderObj = genderId # used in patient-bar
    wldb = db.worklist
    patientId = db(db.worklist.id == wlId).select(db.worklist.id_auth_user).first().id_auth_user
    wlDict = db(wldb.id == wlId).select(wldb.ALL,db.auth_user.ALL, db.modality.modality_name,
        join=[
            db.auth_user.on(db.auth_user.id == wldb.id_auth_user),
            db.modality.on(db.modality.id == wldb.modality_dest),
            ]
        ).as_json()
    providerDict = db(wldb.id == wlId).select(db.auth_user.ALL,
        left = db.auth_user.on(db.auth_user.id == wldb.provider)).as_json()
    seniorDict = db(wldb.id == wlId).select(db.auth_user.ALL,
        left = db.auth_user.on(db.auth_user.id == wldb.senior)).as_json()
    qFar = db.optotype.distance == 'far'
    qClose = db.optotype.distance == 'close'
    optoFarOptions = dropdownSelect(db.optotype, db.optotype.fields[2],1,'index', qFar)
    optoCloseOptions = dropdownSelect(db.optotype, db.optotype.fields[2],1,'index', qClose)
    statusRxOptions = dropdownSelect(db.status_rx, db.status_rx.fields[1],'index')
    statusRxIndex = db(db.status_rx).select(db.status_rx.id,db.status_rx.status).as_json()
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
@action.uses(session, auth.user, db,'modalityCtr/md.html')
def md(wlId):
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    import base64
    from datetime import datetime
    response.headers['Cross-Origin-Embedder-Policy']='require-corp'
    response.headers['Cross-Origin-Opener-Policy']='same-origin'
    hosturl = LOCAL_URL
    user = auth.get_user()
    userMembership = db(db.membership.id == user['membership']).select(db.membership.membership).first()['membership']
    userHierarchy = db(db.membership.id == user['membership']).select(db.membership.hierarchy).first()['hierarchy']
    if userHierarchy >= 3:
        redirect(URL('worklist'))
    db.auth_user.password.readable = False
    db.auth_user.password.writable  = False
    genderObj = genderId # used in patient-bar
    wldb = db.worklist
    wlDict = db(wldb.id == wlId).select(wldb.ALL,db.auth_user.ALL, db.modality.modality_name,
        join=[
            db.auth_user.on(db.auth_user.id == wldb.id_auth_user),
            db.modality.on(db.modality.id == wldb.modality_dest),
            ]
        ).as_json()
    providerDict = db(wldb.id == wlId).select(db.auth_user.ALL,
        left = db.auth_user.on(db.auth_user.id == wldb.provider)).as_json()
    seniorDict = db(wldb.id == wlId).select(db.auth_user.ALL,
        left = db.auth_user.on(db.auth_user.id == wldb.senior)).as_json()
    patientId = db(db.worklist.id == wlId).select(db.worklist.id_auth_user).first().id_auth_user
    userdb = db.auth_user
    mdHistory = db((db.worklist.modality_dest == mdId) & (db.worklist.id_auth_user == patientId)).select().as_json()
    modalityDict = {}
    rows = db(db.modality.id_modality_controller==db.modality_controller.id).select()
    for row in rows:
        modalityDict[row.modality.modality_name]=row.modality_controller.modality_controller_name
    # init all fields
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

@action('gp')
@action('modalityCtr/gp/<wlId>')
@action.uses(session, auth.user, db,'modalityCtr/gp.html')
def md(wlId):
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    import base64
    from datetime import datetime
    response.headers['Cross-Origin-Embedder-Policy']='require-corp'
    response.headers['Cross-Origin-Opener-Policy']='same-origin'
    hosturl = LOCAL_URL
    user = auth.get_user()
    userMembership = db(db.membership.id == user['membership']).select(db.membership.membership).first()['membership']
    userHierarchy = db(db.membership.id == user['membership']).select(db.membership.hierarchy).first()['hierarchy']
    if userHierarchy >= 3:
        redirect(URL('worklist'))
    db.auth_user.password.readable = False
    db.auth_user.password.writable  = False
    genderObj = genderId # used in patient-bar
    wldb = db.worklist
    wlDict = db(wldb.id == wlId).select(wldb.ALL,db.auth_user.ALL, db.modality.modality_name,
        join=[
            db.auth_user.on(db.auth_user.id == wldb.id_auth_user),
            db.modality.on(db.modality.id == wldb.modality_dest),
            ]
        ).as_json()
    providerDict = db(wldb.id == wlId).select(db.auth_user.ALL,
        left = db.auth_user.on(db.auth_user.id == wldb.provider)).as_json()
    seniorDict = db(wldb.id == wlId).select(db.auth_user.ALL,
        left = db.auth_user.on(db.auth_user.id == wldb.senior)).as_json()
    patientId = db(db.worklist.id == wlId).select(db.worklist.id_auth_user).first().id_auth_user
    userdb = db.auth_user
    mdHistory = db((db.worklist.modality_dest == mdId) & (db.worklist.id_auth_user == patientId)).select().as_json()
    modalityDict = {}
    rows = db(db.modality.id_modality_controller==db.modality_controller.id).select()
    for row in rows:
        modalityDict[row.modality.modality_name]=row.modality_controller.modality_controller_name
    # init all fields
    currentHx = initFields(wlId,'current_hx')
    soap = initFields(wlId,'soap')
    motility = initFields(wlId,'motility')
    phoria = initFields(wlId,'phoria')
    pupils = initFields(wlId,'pupils')
    ccx = initFields(wlId,'ccx')
    followup = initFields(wlId,'followup')
    billing = initFields(wlId,'billing')
    mddb=db.md_params
    mdParams= db(mddb.id_auth_user == user['id']).select(mddb.id_auth_user,mddb.inami,mddb.email,mddb.officename,mddb.officeaddress,mddb.officezip,mddb.officetown,mddb.officeurl,mddb.officephone,mddb.companynum,mddb.companyname,mddb.companyiban,mddb.companyaddress).first().as_dict()
    userDict = db(db.auth_user.id == user['id']).select(db.auth_user.first_name,db.auth_user.last_name).first().as_dict()
    return locals()


# helloworld controller
@action('hello')
@action('modalityCtr/hello/<wlId>')
@action.uses(session, auth, db,'modalityCtr/hello.html')
def hello(wlId):
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    import base64
    hosturl = LOCAL_URL
    database = db._tables
    user = auth.get_user()
    # userId = db(db.worklist.id == wlId).select(db.worklist.id_auth_user).first().id_auth_user
    userId = "1"
    string = "Hello World!"
    return locals()
