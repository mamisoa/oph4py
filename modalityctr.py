# Modality controllers

from py4web import (  # add response to throw http error 400
    URL,
    Field,
    abort,
    action,
    redirect,
    request,
    response,
)
from py4web.utils.form import (  # added import Field Form and FormStyleBulma to get form working
    Form,
    FormStyleBootstrap4,
    FormStyleBulma,
)
from py4web.utils.grid import Grid
from pydal.validators import CRYPT  # to encrypt passwords
from yatl.helpers import CAT, OPTION, XML, A

from .common import (
    T,
    auth,
    authenticated,
    cache,
    db,
    flash,
    logger,
    session,
    unauthenticated,
)

# import settings
from .settings import (
    APP_NAME,
    ASSETS_FOLDER,
    ENV_STATUS,
    LOCAL_URL,
    MACHINES_FOLDER,
    NEW_INSTALLATION,
    SUPPLEMENT_RATIO,
    TIMEOFFSET,
)

# import userful
from .useful import dropdownSelect, getMembershipId, rows2json

# get standard index in db for patient/user profile
# TODO remove try and check if new installation
if "NEW_INSTALLATION" in globals():
    if NEW_INSTALLATION == True:
        pass
    else:
        mdId = db(db.modality.modality_name == 'MD').select(db.modality.id).first().id
        gpId = db(db.modality.modality_name == 'GP').select(db.modality.id).first().id
        genderId = {
            db(db.gender.sex == 'Male').select(db.gender.id).first().id : "Male",
            db(db.gender.sex == 'Female').select(db.gender.id).first().id : "Female",
            db(db.gender.sex == 'Other').select(db.gender.id).first().id : "Other" }
else:
    # TODO: create an array for practitioners in modalities
    mdId = db(db.modality.modality_name == 'MD').select(db.modality.id).first().id
    gpId = db(db.modality.modality_name == 'GP').select(db.modality.id).first().id
    genderId = {
        db(db.gender.sex == 'Male').select(db.gender.id).first().id : "Male",
        db(db.gender.sex == 'Female').select(db.gender.id).first().id : "Female",
        db(db.gender.sex == 'Other').select(db.gender.id).first().id : "Other" }

# tono controller
@action('tono')
@action('modalityCtr/tono/<wlId>')
@action.uses(session, auth, db,'modalityCtr/tono.html')
def tono(wlId):
    """
    The 'tono' function is used to retrieve necessary information for encoding tonometry.
    It fetches details on a specific worklist, along with information on the provider and senior associated with that worklist.

    Args:
        wlId (str): The ID of the worklist from which to retrieve information.

    Returns:
        dict: A dictionary containing local information including:
              - Information on the specific worklist
              - Information on the provider and senior linked to the worklist
              - Information about the authenticated user
              - Environment constants like 'env_status', 'timeOffset', and 'hosturl'
              
    Note:
        Decorators
            'tono': 
            'modalityCtr/tono/<wlId>': endpoint
            'uses' decorators from py4web to specify its behavior and dependencies.
    """
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
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
    # Define the fields you need from auth_user
    auth_user_fields = [
        db.auth_user.id,
        db.auth_user.username,
        db.auth_user.email,
        db.auth_user.first_name,
        db.auth_user.last_name,
        db.auth_user.sso_id,
        db.auth_user.action_token,
        db.auth_user.uid,
        db.auth_user.membership,
        db.auth_user.maiden_name,
        db.auth_user.dob,
        db.auth_user.birth_town,
        db.auth_user.birth_country,
        db.auth_user.gender,
        db.auth_user.marital,
        db.auth_user.ethny,
        db.auth_user.idc_num,
        db.auth_user.ssn,
        db.auth_user.user_notes,
        db.auth_user.chipnumber,
        db.auth_user.validfrom,
        db.auth_user.validtill,
        db.auth_user.initials,
        db.auth_user.nationality,
        db.auth_user.noblecondition,
        db.auth_user.documenttype,
        db.auth_user.specialstatus,
        db.auth_user.photob64,
        db.auth_user.cme,
        db.auth_user.created_on,
        db.auth_user.created_by,
        db.auth_user.modified_on,
        db.auth_user.modified_by,
        db.auth_user.is_active,
    ]
    providerDict = (
        db(wldb.id == wlId)
        .select(
            *auth_user_fields, left=db.auth_user.on(db.auth_user.id == wldb.provider)
        )
        .as_json()
    )
    seniorDict = (
        db(wldb.id == wlId)
        .select(*auth_user_fields, left=db.auth_user.on(db.auth_user.id == wldb.senior))
        .as_json()
    )
    return locals()

# autorx controller
@action('autorx')
@action('modalityCtr/autorx/<wlId>')
@action.uses(session, auth, db,'modalityCtr/autorx.html')
def autorx(wlId):
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    app_name = APP_NAME
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
    # Define the fields you need from auth_user
    auth_user_fields = [
        db.auth_user.id,
        db.auth_user.username,
        db.auth_user.email,
        db.auth_user.first_name,
        db.auth_user.last_name,
        db.auth_user.sso_id,
        db.auth_user.action_token,
        db.auth_user.uid,
        db.auth_user.membership,
        db.auth_user.maiden_name,
        db.auth_user.dob,
        db.auth_user.birth_town,
        db.auth_user.birth_country,
        db.auth_user.gender,
        db.auth_user.marital,
        db.auth_user.ethny,
        db.auth_user.idc_num,
        db.auth_user.ssn,
        db.auth_user.user_notes,
        db.auth_user.chipnumber,
        db.auth_user.validfrom,
        db.auth_user.validtill,
        db.auth_user.initials,
        db.auth_user.nationality,
        db.auth_user.noblecondition,
        db.auth_user.documenttype,
        db.auth_user.specialstatus,
        db.auth_user.photob64,
        db.auth_user.cme,
        db.auth_user.created_on,
        db.auth_user.created_by,
        db.auth_user.modified_on,
        db.auth_user.modified_by,
        db.auth_user.is_active,
    ]
    providerDict = (
        db(wldb.id == wlId)
        .select(
            *auth_user_fields, left=db.auth_user.on(db.auth_user.id == wldb.provider)
        )
        .as_json()
    )
    seniorDict = (
        db(wldb.id == wlId)
        .select(*auth_user_fields, left=db.auth_user.on(db.auth_user.id == wldb.senior))
        .as_json()
    )
    qFar = db.optotype.distance == 'far'
    qClose = db.optotype.distance == 'close'
    optoFarOptions = dropdownSelect(db.optotype, db.optotype.fields[2],1,'index', qFar)
    optoCloseOptions = dropdownSelect(db.optotype, db.optotype.fields[2],1,'index', qClose)
    statusRxOptions = dropdownSelect(db.status_rx, db.status_rx.fields[1],'index')
    statusRxIndex = db(db.status_rx).select(db.status_rx.id,db.status_rx.status).as_json()
    return locals()

def initFields(wlId,table,lat=""):
    """
    Initialize fields in view and get values or return empty string "" if None
    filter laterality if necessary
    return a dictionary used in array for view
    Args:
        wlId (str): The ID of the worklist from which to retrieve information.
        table(str): table containing fields content
        lat(str): laterality if applicable, "" if not

    Returns:
        items(dict)
            dictionary containing ffield content relative to laterality if applicable
            exported with [[ = XML(field['description']) ]] in view
    """
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

### md controller

@action('md')
@action('modalityCtr/md/<wlId>')
@action.uses(session, auth.user, db,'modalityCtr/md.html')
def md(wlId):
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    modalityController = 'md'
    supplement_ratio = SUPPLEMENT_RATIO
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
    # Define the fields you need from auth_user
    auth_user_fields = [
        db.auth_user.id,
        db.auth_user.username,
        db.auth_user.email,
        db.auth_user.first_name,
        db.auth_user.last_name,
        db.auth_user.sso_id,
        db.auth_user.action_token,
        db.auth_user.uid,
        db.auth_user.membership,
        db.auth_user.maiden_name,
        db.auth_user.dob,
        db.auth_user.birth_town,
        db.auth_user.birth_country,
        db.auth_user.gender,
        db.auth_user.marital,
        db.auth_user.ethny,
        db.auth_user.idc_num,
        db.auth_user.ssn,
        db.auth_user.user_notes,
        db.auth_user.chipnumber,
        db.auth_user.validfrom,
        db.auth_user.validtill,
        db.auth_user.initials,
        db.auth_user.nationality,
        db.auth_user.noblecondition,
        db.auth_user.documenttype,
        db.auth_user.specialstatus,
        db.auth_user.photob64,
        db.auth_user.cme,
        db.auth_user.created_on,
        db.auth_user.created_by,
        db.auth_user.modified_on,
        db.auth_user.modified_by,
        db.auth_user.is_active,
    ]
    providerDict = (
        db(wldb.id == wlId)
        .select(
            *auth_user_fields, left=db.auth_user.on(db.auth_user.id == wldb.provider)
        )
        .as_json()
    )
    seniorDict = (
        db(wldb.id == wlId)
        .select(*auth_user_fields, left=db.auth_user.on(db.auth_user.id == wldb.senior))
        .as_json()
    )
    patientId = db(db.worklist.id == wlId).select(db.worklist.id_auth_user).first().id_auth_user
    userdb = db.auth_user
    mdHistory = db((db.worklist.modality_dest == mdId) & (db.worklist.id_auth_user == patientId)).select().as_json()
    modalityDict = {}
    rows = db(db.modality.id_modality_controller==db.modality_controller.id).select()
    comboDict = db(db.combo_codes).select().as_json()

    ###
    # Step 1: Fetch all combo_codes
    combos = db(db.combo_codes).select()

    # Step 2 & 3: Fetch related nomenclature for each combo
    for combo in combos:
        # Find proxy entries
        proxy_entries = db(db.combo_proxy_nomenclature.combo_id == combo.id).select()

        # Fetch nomenclature records for each proxy entry
        combo['nomenclatures'] = [
            db.nomenclature(proxy_entry.nomenclature_id) for proxy_entry in proxy_entries
        ]

    # Step 4: Convert to JSON
    combos_json = combos.as_json()

    # combos_json now contains all the combo_codes with their related nomenclatures
    ###
    transactions_row = db((db.transactions.id_worklist == wlId) &
                          (db.transactions.id_auth_user == patientId)).select().first()

    if transactions_row is not None:
        transactionObj = transactions_row.as_json()
    else:
        transactions_row = {"id": 0, "note": ""}
        transactionObj = ""  # Or some other default value, depending on your needs

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
    mddb=db.md_params # TODO: if details from doctor is not provided, return "Please provide provider details"
    mdParams= db(mddb.id_auth_user == user['id']).select(mddb.id_auth_user,mddb.inami,mddb.email,mddb.officename,mddb.officeaddress,mddb.officezip,mddb.officetown,mddb.officeurl,mddb.officephone,mddb.companynum,mddb.companyname,mddb.companyiban,mddb.companyaddress).first().as_dict()
    userDict = db(db.auth_user.id == user['id']).select(db.auth_user.first_name,db.auth_user.last_name).first().as_dict()
    # glasses assets
    axe_img_path = ASSETS_FOLDER+'/images/assets/glassesrx/axe.jpg'
    logo_img_path = ASSETS_FOLDER+'/images/assets/glassesrx/logo.jpg'
    axe64 = base64.b64encode(open(axe_img_path, "rb").read())
    logo64 = base64.b64encode(open(logo_img_path, "rb").read())
    return locals()

@action('gp')
@action('modalityCtr/gp/<wlId>')
@action.uses(session, auth.user, db,'modalityCtr/gp.html')
def gp(wlId):
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    modalityController = 'gp'
    supplement_ratio = SUPPLEMENT_RATIO
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
    # Define the fields you need from auth_user
    auth_user_fields = [
        db.auth_user.id,
        db.auth_user.username,
        db.auth_user.email,
        db.auth_user.first_name,
        db.auth_user.last_name,
        db.auth_user.sso_id,
        db.auth_user.action_token,
        db.auth_user.uid,
        db.auth_user.membership,
        db.auth_user.maiden_name,
        db.auth_user.dob,
        db.auth_user.birth_town,
        db.auth_user.birth_country,
        db.auth_user.gender,
        db.auth_user.marital,
        db.auth_user.ethny,
        db.auth_user.idc_num,
        db.auth_user.ssn,
        db.auth_user.user_notes,
        db.auth_user.chipnumber,
        db.auth_user.validfrom,
        db.auth_user.validtill,
        db.auth_user.initials,
        db.auth_user.nationality,
        db.auth_user.noblecondition,
        db.auth_user.documenttype,
        db.auth_user.specialstatus,
        db.auth_user.photob64,
        db.auth_user.cme,
        db.auth_user.created_on,
        db.auth_user.created_by,
        db.auth_user.modified_on,
        db.auth_user.modified_by,
        db.auth_user.is_active,
    ]
    providerDict = (
        db(wldb.id == wlId)
        .select(
            *auth_user_fields, left=db.auth_user.on(db.auth_user.id == wldb.provider)
        )
        .as_json()
    )
    seniorDict = (
        db(wldb.id == wlId)
        .select(*auth_user_fields, left=db.auth_user.on(db.auth_user.id == wldb.senior))
        .as_json()
    )
    patientId = db(db.worklist.id == wlId).select(db.worklist.id_auth_user).first().id_auth_user
    userdb = db.auth_user
    # get history from previous main consultations for GP
    mdHistory = db((db.worklist.modality_dest == gpId) & (db.worklist.id_auth_user == patientId)).select().as_json()
    modalityDict = {}
    rows = db(db.modality.id_modality_controller==db.modality_controller.id).select()
    for row in rows:
        modalityDict[row.modality.modality_name]=row.modality_controller.modality_controller_name
    # init all fields
    currentHx = initFields(wlId,'current_hx')
    soap = initFields(wlId,'soap')
    inspection = initFields(wlId,'inspection')
    auscultation = initFields(wlId,'auscultation')
    palpation = initFields(wlId,'palpation')
    percussion = initFields(wlId,'percussion')
    neuro = initFields(wlId,'neuro')
    motility = initFields(wlId,'motility')
    phoria = initFields(wlId,'phoria')
    pupils = initFields(wlId,'pupils')
    ccx = initFields(wlId,'ccx')
    followup = initFields(wlId,'followup')
    billing = initFields(wlId,'billing')
    mddb=db.md_params
    mdParams= db(mddb.id_auth_user == user['id']).select(mddb.id_auth_user,mddb.inami,mddb.email,mddb.officename,mddb.officeaddress,mddb.officezip,mddb.officetown,mddb.officeurl,mddb.officephone,mddb.companynum,mddb.companyname,mddb.companyiban,mddb.companyaddress).first().as_dict()
    userDict = db(db.auth_user.id == user['id']).select(db.auth_user.first_name,db.auth_user.last_name).first().as_dict()
    logo_img_path = ASSETS_FOLDER+'/images/assets/glassesrx/logo.jpg'
    logo64 = base64.b64encode(open(logo_img_path, "rb").read())
    return locals()

# biometry controller
@action('lenstar')
@action('modalityCtr/lenstar/<wlId>')
@action.uses(session, auth, db,'modalityCtr/lenstar.html')
def lenstar(wlId):
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
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
    # Define the fields you need from auth_user
    auth_user_fields = [
        db.auth_user.id,
        db.auth_user.username,
        db.auth_user.email,
        db.auth_user.first_name,
        db.auth_user.last_name,
        db.auth_user.sso_id,
        db.auth_user.action_token,
        db.auth_user.uid,
        db.auth_user.membership,
        db.auth_user.maiden_name,
        db.auth_user.dob,
        db.auth_user.birth_town,
        db.auth_user.birth_country,
        db.auth_user.gender,
        db.auth_user.marital,
        db.auth_user.ethny,
        db.auth_user.idc_num,
        db.auth_user.ssn,
        db.auth_user.user_notes,
        db.auth_user.chipnumber,
        db.auth_user.validfrom,
        db.auth_user.validtill,
        db.auth_user.initials,
        db.auth_user.nationality,
        db.auth_user.noblecondition,
        db.auth_user.documenttype,
        db.auth_user.specialstatus,
        db.auth_user.photob64,
        db.auth_user.cme,
        db.auth_user.created_on,
        db.auth_user.created_by,
        db.auth_user.modified_on,
        db.auth_user.modified_by,
        db.auth_user.is_active,
    ]
    providerDict = (
        db(wldb.id == wlId)
        .select(
            *auth_user_fields, left=db.auth_user.on(db.auth_user.id == wldb.provider)
        )
        .as_json()
    )
    seniorDict = (
        db(wldb.id == wlId)
        .select(*auth_user_fields, left=db.auth_user.on(db.auth_user.id == wldb.senior))
        .as_json()
    )
    return locals()


# helloworld controller
@action('hello')
@action('modalityCtr/hello')
@action.uses(session, auth, db,'modalityCtr/hello.html')
def hello():
    env_status = ENV_STATUS
    timeOffset = TIMEOFFSET
    app_name = APP_NAME
    import base64
    hosturl = LOCAL_URL
    database = db._tables
    user = auth.get_user()
    # userId = db(db.worklist.id == wlId).select(db.worklist.id_auth_user).first().id_auth_user
    userId = "1"
    string = "Hello World!"
    return locals()
