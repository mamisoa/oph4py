# Management controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A, XML, OPTION, CAT
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from pydal.validators import CRYPT # to encrypt passwords

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working
from py4web.utils.grid import Grid

# import settings
from .settings import LOCAL_URL, LOCAL_BEID

# table rows query to json string
def rows2json (tablename,rows):
    import datetime
    import json
    def date_handler(obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime(str(T('%d/%m/%Y %T')))
        elif isinstance(obj, datetime.date):
            return obj.strftime(str(T('%d/%m/%Y')))
        else:
            return False
    rows = rows.as_list()
    concat = '{ "'+tablename+'": ['
    for row in rows:
        concat = concat + json.dumps(row, default=date_handler)+","
    concat = concat.strip(',')
    concat = concat + ']}'
    return concat

def dropdownSelect(table,fieldId,defaultId,val="index",queryOptions=True): ## eg table=db.gender fieldId=db.gender.fields[0] defaultId=0 val = index ou value
    selectOptions=""
    query= (table.id>0) & queryOptions
    for selection in db(query).select(table.ALL):
        if selection.id == defaultId:
            selectOptions += "<option selected value='"
        else:
            selectOptions += "<option value='"
        if val == 'index':
            selectOptions += str(selection.id)+"'>"+selection[fieldId]+"</option>"
        else:
            selectOptions += selection[fieldId]+"'>"+selection[fieldId]+"</option>"
        selectOptions = XML(selectOptions)
    return selectOptions # html <option value=""></option>

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

## edit user/id from auth_user
@action('user')
@action('user/<rec_id>')
@action.uses('manage/user.html', session, auth, db)
def user(rec_id="1"):
    hosturl = LOCAL_URL
    localbeid = LOCAL_BEID
    user = auth.get_user()
    row = db(db.auth_user.id == rec_id).select().first()
    username = row.username
    membership = row.membership
    hierarchy = db(db.membership.id == membership).select(db.membership.hierarchy).first()['hierarchy']
    roleOptions=""
    for role in db(db.membership.id>0).select(db.membership.ALL):
        if role.membership == "Patient": # make "Patient" as default option
            roleOptions = CAT(roleOptions, OPTION(role.membership + " (level " + str(role.hierarchy) + ")",_selected="selected",_value=str(role.id)))
        else:
            roleOptions = CAT(roleOptions, OPTION(role.membership + " (level " + str(role.hierarchy) + ")",_value=str(role.id)))
    roleOptions = XML(roleOptions)
    genderOptions = dropdownSelect(db.gender,db.gender.fields[1],1) 
    originOptions = dropdownSelect(db.data_origin,db.data_origin.fields[1],1,"value")
    ethnyOptions = dropdownSelect(db.ethny,db.ethny.fields[1],1,"index")
    maritalOptions = dropdownSelect(db.marital,db.marital.fields[1],1,"index")
    return locals()

# list users from membership
@action('manage/users', method=['POST','GET']) # route
@action('manage/users/<membership>')
# @action.uses('manage/users.html', session, T, auth, db)
@action.uses('manage/users.html', session, T, db)
def users(membership=6):
    hosturl = LOCAL_URL
    # user = auth.get_user()
    test="Test OK"
    try: # check if membership exists
        check_group= db(db.membership.id == membership).isempty()
    except ValueError:
        membership = 6
    else:
        if check_group is True: # if does not exist
            membership = 6
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
    roleOptions=""
    for role in db(db.membership.id>0).select(db.membership.ALL):
        if role.membership == group: # make "Patient" as default option
            roleOptions = CAT(roleOptions, OPTION(role.membership + " (level " + str(role.hierarchy) + ")",_selected="selected",_value=str(role.id)))
        else:
            roleOptions = CAT(roleOptions, OPTION(role.membership + " (level " + str(role.hierarchy) + ")",_value=str(role.id)))
    roleOptions = XML(roleOptions)
    genderOptions = dropdownSelect(db.gender,db.gender.fields[1],1) 
    return locals()

# patients worklist 
@action('worklist', method=['POST','GET']) # route
@action.uses('worklist.html', session, T, auth, db)
def worklist():
    hosturl = LOCAL_URL
    localbeid = LOCAL_BEID
    user = auth.get_user()
    test="Test OK"
    membership = 6
    class_icon = 'fa-user'
    group = "Patient"
    roleOptions=""
    for role in db(db.membership.id>0).select(db.membership.ALL):
        if role.membership == group: # make "Patient" as default option
            roleOptions = CAT(roleOptions, OPTION(role.membership + " (level " + str(role.hierarchy) + ")",_selected="selected",_value=str(role.id)))
        else:
            roleOptions = CAT(roleOptions, OPTION(role.membership + " (level " + str(role.hierarchy) + ")",_value=str(role.id)))
    roleOptions = XML(roleOptions)
    genderOptions = dropdownSelect(db.gender,db.gender.fields[1],1)
    sendingFacilityOptions = dropdownSelect(db.facility,db.facility.fields[1],1) # defaultId = 1 (desk1)
    receivingFacilityOptions = dropdownSelect(db.facility,db.facility.fields[1],3) # defaultId = 3 (iris)
    procedureOptions = dropdownSelect(db.procedure,db.procedure.fields[2],4) # field exam_name defaultId = 4 (routine consultation)
    providerOptions=""
    for provider in db((db.auth_user.membership>=1)&(db.auth_user.membership<=4)).select(db.auth_user.ALL, orderby=db.auth_user.last_name):
        if provider.last_name == 'Griffith': # make "House" as default option
            providerOptions = CAT(providerOptions, OPTION(provider.last_name + ' '+ provider.first_name,_selected="selected",_value=str(provider.id)))
        else:
            providerOptions = CAT(providerOptions, OPTION(provider.last_name + ' '+ provider.first_name,_value=str(provider.id)))
    providerOptions = XML(providerOptions) 
    seniorOptions = ""
    for senior in db((db.auth_user.membership >= 1) & (db.auth_user.membership <= 4)).select(db.auth_user.ALL, orderby=db.auth_user.last_name):
        if senior.last_name == 'Lloyd':  # make "House" as default option
            seniorOptions = CAT(seniorOptions, OPTION(
                senior.last_name + ' ' + senior.first_name, _selected="selected", _value=str(senior.id)))
        else:
            seniorOptions = CAT(seniorOptions, OPTION(
                senior.last_name + ' ' + senior.first_name, _value=str(senior.id)))
    seniorOptions = XML(seniorOptions)
    everyModalityOptions = dropdownSelect(db.modality,db.modality.fields[1],1)
    modalityRows = db(db.modality).select(db.modality.modality_name,db.modality.id_modality_controller)
    modalityDict = {}
    rows = db(db.modality.id_modality_controller==db.modality_controller.id).select()
    for row in rows:
        modalityDict[row.modality.modality_name]=row.modality_controller.modality_controller_name
    return locals()

## manage medic_ref

@action('manage/medications')
@action('manage/medications/<rec_id>')
@action.uses('manage/medications.html', session, auth, db)
def medications(rec_id="1"):
    hosturl = LOCAL_URL
    user = auth.get_user()
    return locals()

## manage allergic agents

@action('manage/allergy')
@action('manage/allergy/<rec_id>')
@action.uses('manage/allergy.html', session, auth, db)
def allergy(rec_id="1"):
    hosturl = LOCAL_URL
    user = auth.get_user()
    return locals()

## manage diseases

@action('manage/diseases')
@action('manage/diseases/<rec_id>')
@action.uses('manage/diseases.html', session, auth, db)
def diseases(rec_id="1"):
    hosturl = LOCAL_URL
    user = auth.get_user()
    return locals()

## manage_db

## import users 
@action('import_users')
@action.uses('generic.html', T, db)
def import_users():
    # hosturl = LOCAL_URL
    import os
    # rows = db(db.auth_user).select()
    with open(os.path.join(os.path.dirname(__file__),'uploads/csv/')+'1.csv', 'r', encoding='utf-8', newline='') as dumpfile:
        db.auth_user.import_from_csv_file(dumpfile)
    return dict(message="OK")

@action('db_truncate')
@action.uses('generic.html', T, db, auth.user)
def truncate_db():
    hosturl = LOCAL_URL
    for table_name in db.tables():
        db[table_name].truncate('RESTART IDENTITY CASCADE')
    return locals()

# TODO: add action uses aut.user to all sensible pages
@action("manage/db")
@action.uses('manage/manage_db.html', T, auth.user, db, flash)
def manage_db():
    tablesArr = db._tables
    hosturl = LOCAL_URL
    user = auth.get_user()
    return locals()

@action("list_dir_csv")
def list_dir_csv():
    import os
    try:
        upload_folder = os.path.join(os.path.dirname(__file__),'uploads/csv')
        dir_array=os.listdir(upload_folder)
        dir_array.append('true')
        return " ".join(dir_array) # return in string to convert in array in js
        # return "show_csv_dir(%s,true);" % repr(dir_array)
    except:
        folder = ['uploads/csv','false']
        return "%s" % repr(folder)

@action("del_csv", method=['GET'])
def del_csv():
    import os
    file2del = request.query.datafile
    try:
        fullPath=os.path.join(os.path.dirname(__file__),'uploads/csv/')+file2del
        os.remove(fullPath)
        return file2del+"#True"
    except:
        return file2del+"#False"

@action("save_table")
@action('save_table/<tablename>')
def save_table(tablename):
    from datetime import datetime
    import os
    now = datetime.now()
    date_backup = now.strftime("%y%m%d-%H%M%S")
    backup_path = os.path.join(os.path.dirname(__file__),'uploads/csv/')
    filename = date_backup+'-'+tablename+'-table-backup.csv'
    backup_path_file = backup_path+filename
    rows=db(db[tablename]).select()
    try:
        with open(backup_path_file, 'w', encoding='utf-8', newline='') as dumpfile:
            rows.export_to_csv_file(dumpfile)
        evalArr = (filename+" True").split(' ')
        return '#'.join(evalArr)
    except Exception as e:
        evalArr = (filename+" False").split(' ')
        evalArr.append(print(e))
        return '#'.join(evalArr)

@action("save_all_tables")
def save_all_tables():
    from datetime import datetime
    import os
    now = datetime.now()
    dblist = db._tables
    for table in dblist:
        if table != 'auth_user':
            date_backup = now.strftime("%y%m%d-%H%M%S")
            backup_path = os.path.join(os.path.dirname(__file__),'uploads/csv/tables/')
            filename = date_backup+'-'+table+'-table-backup.csv'
            backup_path_file = backup_path+filename
            rows=db(db[table]).select()
            with open(backup_path_file, 'w', encoding='utf-8', newline='') as dumpfile:
                rows.export_to_csv_file(dumpfile)
        else :
            None
    return True

@action("save_db")
def save_db():
    from datetime import datetime
    import os
    now = datetime.now()
    date_backup = now.strftime("%y%m%d-%H%M%S")
    backup_path = os.path.join(os.path.dirname(__file__),'uploads/csv/')
    filename = date_backup+'-db-full-backup.csv'
    backup_path_file = backup_path+filename
    # rows=db(db.auth_user).select()
    try:
        with open(backup_path_file, 'w', encoding='utf-8', newline='') as dumpfile:
            db.export_to_csv_file(dumpfile)
        evalArr = (filename+" True").split(' ')
        return '#'.join(evalArr)
    except Exception as e:
        evalArr = (filename+" False").split(' ')
        # evalArr.append(print(e))
        return '#'.join(evalArr)

@action("init_db")
def init_db():
    import os
    for table_name in db.tables():
        db[table_name].truncate('ON DELETE CASCADE')
    backup_path = os.path.join(os.path.dirname(__file__),'uploads/csv/')
    backup_path_file = backup_path+'init_db.csv'
    try:
        with open(backup_path_file,'r', encoding='utf-8', newline='') as dumpfile:
            db.import_from_csv_file(dumpfile)
        # set_defaults_db()
        return "reset"+"#"+"True"
    except:
        return "reset"+"#"+"False"

@action("restore_db", method=['GET'])
def restore_db():
    import os
    file2restore = request.query.datafile
    # delete all tables
    for table_name in db.tables():
        db[table_name].truncate('RESTART IDENTITY CASCADE')
    # import csv file
    backup_path = os.path.join(os.path.dirname(__file__),'uploads/csv/')
    backup_path_file = backup_path+file2restore
    try:
        with open(backup_path_file,'r', encoding='utf-8', newline='') as dumpfile:
            db.import_from_csv_file(dumpfile)
        evalArr = (file2restore+" True").split(' ')
        return '#'.join(evalArr)
    except Exception as e:
        evalArr = (file2restore+" False").split(' ')
        evalArr.append(print(e))
        return '#'.join(evalArr)
    

@action("restore", method=['GET'])
def restore():
    import os
    filename = request.query.datafile
    # filename contains date-time-(tablename or db)-(full or table)-backup.csv -> [date,time,tablename or db,full or table,backup.csv]
    reqArr = filename.split('-')
    backup_path = os.path.join(os.path.dirname(__file__),'uploads/csv/')
    backup_path_file = backup_path+filename
    table_name = reqArr[2]
    errorTruncate = errorImport = ""
    if reqArr[3] == 'table':
        ###### truncate can cause some id discrepancies #####
        # # truncate table
        # try:
        #     db[table_name].truncate('RESTART IDENTITY CASCADE')
        # except Exception as et:
        #     errorTruncate = print(et)
        # import
        try:
            with open(backup_path_file,'r', encoding='utf-8', newline='') as dumpfile:
                db[table_name].import_from_csv_file(dumpfile)
            evalArr = (filename+" True").split(' ')
            evalArr.append(errorTruncate)
            return '#'.join(evalArr)
        except Exception as ei:
            errorImport = print(ei)
            evalArr = (filename+" False").split(' ')
            # evalArr.append(errorTruncate+' '+errorImport)
            return '#'.join(evalArr)
    elif reqArr[3] == 'full':
        ###### truncate can cause some id discrepancies #####
        # truncate db
        # try:
        #     db.truncate('RESTART IDENTITY CASCADE')
        # except Exception as et:
        #     errorTruncate = print(et)
        # import
        try:
            with open(backup_path_file,'r', encoding='utf-8', newline='') as dumpfile:
                db.import_from_csv_file(dumpfile)
            evalArr = (filename+" True").split(' ')
            evalArr.append(errorImport)
            return '#'.join(evalArr)
        except Exception as ei:
            errorImport = print(ei)
            evalArr = (filename+" False").split(' ')
            # evalArr.append(errorTruncate+' '+errorImport)
            return '#'.join(evalArr)
    else:
        return filename+'#False'

# manage procedure combo
@action('manage/combo')
@action.uses(session, db, 'manage/combo.html')
def combo():
    hosturl = LOCAL_URL
    procedureOptions=dropdownSelect(db.procedure,db.procedure.fields[2],1) # table to show is procedure, field to show=name, selected value is id=1, value is index
    modalityOptions=dropdownSelect(db.modality,db.modality.fields[1],1)
    return locals()


# manage billing summary
@action('billing/summary')
@action('billing/summary/<rec_id>')
@action.uses('billing/summary.html', session, auth, db)
def summary(rec_id):
    hosturl = LOCAL_URL
    user = auth.get_user()
    row = db(db.auth_user.id == rec_id).select().first()
    username = row.username
    membership = row.membership
    return locals()