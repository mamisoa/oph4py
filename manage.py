# Management controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400
from yatl.helpers import A, XML, OPTION, CAT
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from pydal.validators import CRYPT # to encrypt passwords

from py4web.utils.form import Form, FormStyleBulma, FormStyleBootstrap4 # added import Field Form and FormStyleBulma to get form working
from py4web.utils.grid import Grid

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

def dropdownSelect(table,fieldId,defaultId,val="index"): ## eg table=db.gender fieldId=db.gender.fields[0] defaultId=0 val = index ou value
    selectOptions=""
    for selection in db(table.id>0).select(table.ALL):
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
@action.uses('manage/user.html', session, auth, db, flash)
def user(rec_id="1"):
    user = auth.get_user()
    row = db(db.auth_user.id == rec_id).select().first()
    username = row.username
    membership = row.membership
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
@action.uses('manage/users.html', session, T, auth, db)
def users(membership=6):
    user = auth.get_user()
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
    exam2doOptions = dropdownSelect(db.exam2do,db.exam2do.fields[2],4) # field exam_name defaultId = 4 (routine consultation)
    providerOptions=""
    for provider in db((db.auth_user.membership>=1)&(db.auth_user.membership<=4)).select(db.auth_user.ALL, orderby=db.auth_user.last_name):
        if provider.last_name == 'Lloyd': # make "House" as default option
            providerOptions = CAT(providerOptions, OPTION(provider.last_name + ' '+ provider.first_name,_selected="selected",_value=str(provider.id)))
        else:
            providerOptions = CAT(providerOptions, OPTION(provider.last_name + ' '+ provider.first_name,_value=str(provider.id)))
    providerOptions = XML(providerOptions) 
    seniorOptions = ""
    for senior in db((db.auth_user.membership >= 1) & (db.auth_user.membership <= 4)).select(db.auth_user.ALL, orderby=db.auth_user.last_name):
        if provider.last_name == 'Lloyd':  # make "House" as default option
            seniorOptions = CAT(seniorrOptions, OPTION(
                senior.last_name + ' ' + senior.first_name, _selected="selected", _value=str(senior.id)))
        else:
            seniorOptions = CAT(providerOptions, OPTION(
                senior.last_name + ' ' + senior.first_name, _value=str(senior.id)))
    seniorOptions = XML(seniorOptions)
    return locals()

## manage_db

## import users 
@action('import_users')
@action.uses('generic.html', T, db)
def import_users():
    import os
    rows = db(db.auth_user).select()
    with open(os.path.join(os.path.dirname(__file__),'uploads/csv/')+'1.csv', 'r', encoding='utf-8', newline='') as dumpfile:
        db.auth_user.import_from_csv_file(dumpfile)
    return dict(message="OK")

@action('db_truncate')
@action.uses('generic.html', T, db, auth.user)
def import_users():
    for table_name in db.tables():
        db[table_name].truncate('RESTART IDENTITY CASCADE')
    return locals()

@action("manage/db")
@action.uses('manage/manage_db.html', T, auth.user, db, flash)
def manage_db():
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
        return file2del+" "+"True"
    except:
        return file2del+" "+"False"

@action("save_db")
def save_db():
    from datetime import datetime
    import os
    now = datetime.now()
    date_backup = now.strftime("%y%m%d-%H%M%S")
    backup_path = os.path.join(os.path.dirname(__file__),'uploads/csv/')
    filename = date_backup+'_backup.csv'
    backup_path_file = backup_path+filename
    try:
        with open(backup_path_file, 'w', encoding='utf-8', newline='') as dumpfile:
            db.export_to_csv_file(dumpfile)
        evalstr = filename+" "+"True"
        return evalstr
    except:
        return filename+" "+"False"

def set_defaults_db():
    db.gender.insert(sex="Male")
    db.gender.insert(sex="Female")
    db.gender.insert(sex="Other")
    db.ethny.insert(ethny="Caucasian")
    db.ethny.insert(ethny="Black")
    db.ethny.insert(ethny="Hispanic")
    db.ethny.insert(ethny="Arabic")
    db.marital.insert(marital_status="single")
    db.marital.insert(marital_status="married")
    db.membership.insert(membership="Admin", hierarchy="0")
    db.membership.insert(membership="Doctor", hierarchy="1")
    db.membership.insert(membership="Nurse", hierarchy="2")
    db.membership.insert(membership="Medical assistant", hierarchy="2")
    db.membership.insert(membership="Administrative", hierarchy="3")
    db.membership.insert(membership="Patient", hierarchy="99")
    db.data_origin.insert(origin="Home")
    db.data_origin.insert(origin="Mobile")
    db.data_origin.insert(origin="Work")
    db.commit()
    return

@action("init_db")
def init_db():
    import os
    for table_name in db.tables():
        db[table_name].truncate('RESTART IDENTITY CASCADE')
    backup_path = os.path.join(os.path.dirname(__file__),'uploads/csv/')
    backup_path_file = backup_path+'init_db.csv'
    try:
        # with open(backup_path_file,'r', encoding='utf-8', newline='') as dumpfile:
        #     db.import_from_csv_file(dumpfile)
        # set_defaults_db()
        return "reset"+" "+"True"
    except:
        return "reset"+" "+"False"

@action("restore_db", method=['GET'])
def restore_db():
    import os
    file2restore = request.query.datafile
    for table_name in db.tables():
        db[table_name].truncate('RESTART IDENTITY CASCADE')
    backup_path = os.path.join(os.path.dirname(__file__),'uploads/csv/')
    backup_path_file = backup_path+file2restore
    try:
        with open(backup_path_file,'r', encoding='utf-8', newline='') as dumpfile:
            db.import_from_csv_file(dumpfile)
        return file2restore +" "+"True"
    except:
        return file2restore +" "+"False"
