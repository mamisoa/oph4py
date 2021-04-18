# Modality controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A, XML, OPTION, CAT
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from pydal.validators import CRYPT # to encrypt passwords

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working
from py4web.utils.grid import Grid

# import settings
from .settings import LOCAL_URL

from .manage import dropdownSelect

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
    import base64
    hosturl = LOCAL_URL
    user = auth.get_user()
    authUserId = db(db.worklist.id == wlId).select(db.worklist.id_auth_user).first().id_auth_user
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
    mdParams= db(db.md_params.id_auth_user == user['id']).select(db.md_params.id_auth_user,db.md_params.inami,db.md_params.email,db.md_params.officename,db.md_params.officeaddress,db.md_params.officezip,db.md_params.officetown,db.md_params.officeurl,db.md_params.officephone).first().as_dict()
    userDict = db(db.auth_user.id == user['id']).select(db.auth_user.first_name,db.auth_user.last_name).first().as_dict()
    # glasses assets
    axe_img_path = '/home/mamisoa16/code/py4web/apps/myapp/static/images/assets/glassesrx/axe.png'
    logo_img_path = '/home/mamisoa16/code/py4web/apps/myapp/static/images/assets/glassesrx/logo.jpg'
    axeImg64 = base64.b64encode(open(axe_img_path, "rb").read())
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
    axe_img_path = '/home/mamisoa16/code/py4web/apps/myapp/static/images/assets/glassesrx/axe.png'
    logo_img_path = '/home/mamisoa16/code/py4web/apps/myapp/static/images/assets/glassesrx/logo.jpg'
    axeImg64 = base64.b64encode(open(axe_img_path, "rb").read())
    logo64 = base64.b64encode(open(logo_img_path, "rb").read())
    # with open('/home/mamisoa16/code/py4web/apps/myapp/static/images/assets/glassesrx/axe.png', "rb") as image_file:
    #    axeImg64 = base64.b64encode(image_file.read())
    # with open('/home/mamisoa16/code/py4web/apps/myapp/static/images/assets/glassesrx/logo.jpg', "rb") as image_file:
    #    logo64 = base64.b64encode(image_file.read())
    return locals()