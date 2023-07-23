# restAPI eyesuite controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400

from ...common import session, T, cache, auth, logger, authenticated, unauthenticated

from ...settings import MACHINES_FOLDER, EYESUITE_WL_FOLDER, EYESUITE_RESULTS_FOLDER

def createWlFile(device, id='', lastname='', firstname='', dob='', sex=''):
    """
    Creates a UTF-8 encoded patient.txt for eyesuite with the provided information 
    
    Args:
        device (str): The device information. Must be either 'PERIMETRY_STATIC' or 'BIOM_MEASUREMENT'.
        id (str): The ID number.
        lastname (str, optional): The last name. Defaults to an empty string.
        firstname (str, optional): The first name. Defaults to an empty string.
        dob (str, optional): The date of birth (format: "dd/mm/yyyy"). Defaults to an empty string.
        sex (str, optional): The gender. Defaults to an empty string.
    
    Returns:
        str: The filename of the created text file.
    
    Raises:
        ValueError: If the device value is invalid or if the ID number is missing.
    """
    if device not in ('PERIMETRY_STATIC', 'BIOM_MEASUREMENT'):
        return { 'result': "Invalid device value. Must be either 'PERIMETRY_STATIC' or 'BIOM_MEASUREMENT'."}
    if not id:
        return { 'result': "id is required." }
    
    content = f'''
        id_number={id}\r
        name={lastname.upper()}\r
        firstname={firstname.upper()}\r
        birthdate_year={dob[-4:]}\r
        birthdate_month={dob[3:5]}\r
        birthdate_day={dob[:2]}\r
        gender={sex}\r
        device={device}\r
        '''
    filename = EYESUITE_WL_FOLDER+'patient.txt'

    try:
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(content)
    except IOError:
        return { 'result': "Error writing to file: {filename}" }
    
    return { 'result': 'success'}

@action('rest/create_eyesuite_wl/<machine>/', method=['GET']) 
def createWlItem(machine,id,lastname='_',firstname='_',dob='', sex=''):
    """
    API endpoint for creating patient.txt file
    """
    import os,json
    response.headers['Content-Type'] = 'application/json;charset=UTF-8'
    res = { 'result': 'error'}
    if 'lastname' in request.query:
        lastname = request.query.get('lastname')
    if 'firstname' in request.query:
        firstname = request.query.get('firstname')
    if 'dob' in request.query:
        dob = request.query.get('dob')
    if 'sex' in request.query:
        sex = request.query.get('sex')
    if 'id' in request.query:
        id = request.query.get('id')
    if machine in ('PERIMETRY_STATIC', 'BIOM_MEASUREMENT'):
        res = createWlFile(machine, id, lastname, firstname, dob, sex)
    else:
        res = { 'result': 'no matching machine'}
    # default res = error
    return json.dumps(res)
