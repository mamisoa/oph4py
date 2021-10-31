from yatl.helpers import XML
from .common import db

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

def getMembershipId(role):
    query = db(db.membership.membership == role).select().first()['id']
    return query

## eg table=db.gender fieldId=db.gender.fields[0] defaultId=0 val = index ou value
def dropdownSelect(table,fieldId,defaultId,val="index",queryOptions=True): 
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
