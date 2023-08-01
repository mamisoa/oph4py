# restAPI eyesuite controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400

from ...common import db, session, T, cache, auth, logger, authenticated, unauthenticated

from ...settings import MACHINES_FOLDER, EYESUITE_FOLDER, EYESUITE_RESULTS_FOLDER


def createWlFile(device, id='', lastname='', firstname='', dob='', sex=''):
    """
    Creates a UTF-8 encoded patient.txt for eyesuite with the provided information 
    
    Args:
        device (str): The device information. Must be either 'PERIMETRY_STATIC' or 'BIOM_MEASUREMENT'.
        id (str): The ID number.
        lastname (str, optional): The last name. Defaults to an empty string.
        firstname (str, optional): The first name. Defaults to an empty string.
        dob (str, optional): The date of birth (format: "yyyy-mm-dd"). Defaults to an empty string.
        sex (str, optional): The gender. Defaults to an empty string.
    
    Returns:
        str: The filename of the created text file.
    
    Raises:
        ValueError:
            device value is invalid
            the ID number is missing
        IOError
    """
    if device not in ('PERIMETRY_STATIC', 'BIOM_MEASUREMENT'):
        return { 'result': "Invalid device value. Must be either 'PERIMETRY_STATIC' or 'BIOM_MEASUREMENT'."}
    if not id:
        return { 'result': "id is required." }
    
    machine =""

    if device == 'PERIMETRY_STATIC':
        machine = 'octopus/worklist/'
    
    if device == 'BIOM_MEASUREMENT':
        machine = 'lenstar/worklist/'
    
    dob_parts = dob.split('-')
    year, month, day = dob_parts[0], dob_parts[1], dob_parts[2]
    content = f'id_number={id}_oph4py\rname={lastname}\rfirstname={firstname}\r'
    content += f'birthdate_year={year}\rbirthdate_month={month}\rbirthdate_day={day}\r'
    content += f'gender={sex.upper()}\rdevice={device}\r'
    
    filename = EYESUITE_FOLDER+machine+'patient.txt'

    try:
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(content)
    except IOError as e:
        error_type = type(e).__name__
        error_description = e.strerror
        print()
        return { 'result': f"An {error_type} occurred: {error_description}" }
    
    return { 'result': 'success'}

@action('rest/create_eyesuite_wl/<machine>/', method=['POST']) 
def createWlItem(machine,id='1',lastname='_',firstname='_',dob='', sex=''):
    """
    API endpoint '/rest/create_eyesuite_wl/<machine>/'

    Check if patient exists in Visionix machines, if so send JSON response with corresponding file and path
    Args:
        machine (str): machine 'PERIMETRY_STATIC' or 'BIOM_MEASUREMENT'

    Returns:
        str: JSON response with a list of patient folders corresponding to first name and last name
    Raises:
        from modules
    Modules:
        createWLFile: create patient.txt file to eyesuite EMR directory
    
    """
    import json
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

# biometry

def convert_to_float(data):
    """
    Tries to convert a string to a float. If it can't be converted, it returns None.
    
    Parameters:
    data (str): The string to convert to a float.

    Returns:
    float or None: The converted float or None if the conversion fails.
    """
    try:
        return float(data)
    except ValueError:
        return None

def convert_to_int(data):
    """
    Tries to convert a string to a int. If it can't be converted, it returns None.
    
    Parameters:
    data (str): The string to convert to a int.

    Returns:
    float or None: The converted int or None if the conversion fails.
    """
    try:
        return int(data)
    except ValueError:
        return None


def remove_accents(input_string):
    from unidecode import unidecode
    return unidecode(input_string)

# find xml file
def find_matching_xml(date: str, lastname: str, firstname: str, ID: str = '', directory: str = '.'):
    """
    Returns a list of file paths in a given directory that match the specified format.

    Parameters:
    ID (str): The ID
    name (str): The last name
    firstname (str): The first name
    directory (str): The directory in which to search
    date (str): The date in the format 'yyyy-mm-dd'

    Returns:
    list: A list of matching file paths
    """
    import os,re,glob
    # Convert date to required format
    date = date.replace('-', '_')
    lastname = lastname.replace(' ', '_')
    firstname = firstname.replace(' ', '_')

    # Create the regular expression 
    # \d{4}_\d{2}_\d{2}_\d{2}_\d{2}_LEFEVRE_CARLO(_10139)?(_.{6})?_biometry.xml$
    # \\d{4}_\\d{2}_\\d{2}_\\d{2}_\\d{2}(_\\d{2})?_Magnin_Camille_SolA\"ne(_)?(_.*)?_biometry.xml$"
    reg = rf"\d{{4}}_\d{{2}}_\d{{2}}_\d{{2}}_\d{{2}}(_\d{{2}})?_{lastname}_{firstname}(_{ID})?(_.*)?_biometry.xml$"
    pattern = re.compile(reg)
    
    # Get the list of all xml files in the directory
    all_files = glob.glob(f"{directory}/*.xml")
    
    # Filter the list to include only those that match the regular expression
    matching_files = [file for file in all_files if pattern.match(os.path.basename(file))]
    # matching_files = [file for file in all_files]
    
    return matching_files,{ 'regex': reg, 'lastname': lastname, 'firstname' : firstname, 'date': date}

def normalize_data(data):
    """
    Normalize the data according to the following rules:
    - Dates are converted to the format yyyy-mm-dd
    - Floats use a dot instead of a comma and are converted to float type
    - CENTRAL_CORNEA_THICKNESS is converted to an integer
    """
    from datetime import datetime
    # Normalize date
    date_str = data['EXAMINATION']['DATE']
    try:
        # Try parsing the date with timestamp
        date_obj = datetime.strptime(date_str, '%Y.%m.%d %H:%M:%S')
    except ValueError:
        # If it fails, try parsing the date without timestamp
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    data['EXAMINATION']['DATE'] = date_obj.strftime('%Y-%m-%d')
    
    # # Normalize birthday
    # birthday_str = data['PATIENT']['BIRTHDAY']
    # try:
    #     birthday_obj = datetime.strptime(birthday_str, '%d/%m/%Y')
    # except ValueError:
    #     birthday_obj = datetime.strptime(birthday_str, '%Y-%m-%d')
    # data['PATIENT']['BIRTHDAY'] = birthday_obj.strftime('%Y-%m-%d')
    
    # Normalize floats
    for measurement_type in ['A-SCAN', 'KERATOMETRY', 'WHITE-WHITE', 'PUPILLOMETRY']:
        if measurement_type in data:
            for measurement, value in data[measurement_type].items():
                if value is not None and ',' in value:
                    data[measurement_type][measurement] = float(value.replace(',', '.'))
                    
    # Convert CENTRAL_CORNEA_THICKNESS to an integer
    if 'A-SCAN' in data and 'CENTRAL_CORNEA_THICKNESS' in data['A-SCAN']:
        value = data['A-SCAN']['CENTRAL_CORNEA_THICKNESS']
        if value is not None:
            data['A-SCAN']['CENTRAL_CORNEA_THICKNESS'] = int(float(value))


def extract_eye_data(eye_node, examination_info):
    """
    Extracts data from an EYE node and includes patient and examination information.
    Returns a dictionary where keys are measurement types and values are dictionaries of measurements and their values.
    """
    data = {"EXAMINATION": examination_info}
    
    # Loop through the measurement nodes (e.g., A-SCAN, KERATOMETRY, etc.)
    for measurement_node in eye_node:
        measurement_type = measurement_node.tag
        data[measurement_type] = {}
        
        # Loop through the individual measurements and extract their values
        for individual_measurement_node in measurement_node:
            measurement = individual_measurement_node.tag
            value = individual_measurement_node.text
            data[measurement_type][measurement] = value
    
    # Normalize the data
    normalize_data(data)
    return data

def add_biometry_to_db(wlId,data):
    """
    Controller action to add eye exam data to the 'biometry' table.

    Loads data from a JSON file, extracts the eye exam data and adds it to the 'biometry' table in the database.

    The JSON file should have the following structure:
    {
        "patient": { ... },
        "exams": {
            "filename": {
                "od": { ... },
                "os": { ... }
            },
            ...
        }
    }
    Parameters:
        data : JSON dictionary containing biometry data from one or many xml files
    Returns:
        A dictionary with key "result" and value "success" if the data was added successfully.
        A dictionary with keys "result" and "error" if there was an error.
    """
    from datetime import datetime
    try:
        
        # Get the patient id
        patient_id = data['patient']['id']  # adjust as needed
        
        # Loop over each exam
        for filename, exams in data['exams'].items():
            # Extract the exam date from the filename
            date_str = filename.split('/')[-1].split('_')[0:6]
            exam_date = datetime.strptime('_'.join(date_str), '%Y_%m_%d_%H_%M_%S')
            
            # Check if an exam with the same date and patient_id already exists
            existing_exam = db(db.biometry.exam_date == exam_date, db.biometry.patient_id == patient_id).select().first()
            if existing_exam is not None:
                continue  # Skip this exam
            
            # Loop over each eye ('od' and 'os')
            for laterality, measures in exams.items():
                # Add a new record to the 'biometry' table
                db.biometry.insert(
                    patient_id=patient_id,
                    id_worklist=wlId,
                    exam_date=exam_date,
                    laterality=laterality,
                    # A-SCAN measures
                    a_scan_aqueous_depth=measures['A-SCAN']['AQUEOUS_DEPTH'],
                    a_scan_axial_length=measures['A-SCAN']['AXIAL_LENGTH'],
                    a_scan_central_cornea_thickness=measures['A-SCAN']['CENTRAL_CORNEA_THICKNESS'],
                    a_scan_lense_thickness=measures['A-SCAN']['LENSE_THICKNESS'],
                    a_scan_mode=measures['A-SCAN']['MODE'],
                    # KERATOMETRY measures
                    keratometry_flat_meridian=measures['KERATOMETRY']['FLAT_MERIDIAN'],
                    keratometry_flat_meridian_axis=measures['KERATOMETRY']['FLAT_MERIDIAN_AXIS'],
                    keratometry_steep_meridian=measures['KERATOMETRY']['STEEP_MERIDIAN'],
                    # PUPILLOMETRY measures
                    pupillometry_barycenter_x=measures['PUPILLOMETRY']['BARYCENTER_X'],
                    pupillometry_barycenter_y=measures['PUPILLOMETRY']['BARYCENTER_Y'],
                    pupillometry_diameter=measures['PUPILLOMETRY']['DIAMETER'],
                    # WHITE-WHITE measures
                    white_white_barycenter_x=measures['WHITE-WHITE']['BARYCENTER_X'],
                    white_white_barycenter_y=measures['WHITE-WHITE']['BARYCENTER_Y'],
                    white_white_diameter=measures['WHITE-WHITE']['DIAMETER'],
                )
        
        # Commit the changes
        db.commit()

        return {"result": "success"}
    except Exception as e:
        return {"result": "failure", "error": str(e)}

@action('rest/lenstar/', method=['GET']) 
def upload_lenstar(wlId=None, id='',lastname='_',firstname='_'):
    """
    Load data from an XML file and insert it into the database.
    
    The XML file name is expected to be passed as a request parameter.
    The XML file is parsed, and the data is extracted using the `extract_nested_elements` function.
    The data is then converted to the format expected by the database and inserted into the 'examination' table.
    """
    from datetime import datetime as dt
    import datetime
    import xml.etree.ElementTree as ET
    database_commit = 'no record added'
    path = EYESUITE_FOLDER + 'lenstar/export'
    now = datetime.date.today().strftime('%Y-%m-%d')
    # force accent decoding
    if 'lastname' in request.query:
        lastname = request.query.get('lastname').encode('latin-1').decode('utf-8')
    if 'firstname' in request.query:
        firstname = request.query.get('firstname').encode('latin-1').decode('utf-8')
    if 'id' in request.query:
        id = request.query.get('id')
    filenames, params = find_matching_xml(directory=path, date=now, lastname=lastname, firstname=firstname, ID=id)
    if len(filenames) == 0:
        return {'status': 'error', 'message': 'no xml found', 'params': params , 'filenames': filenames, 'firstname': firstname, 'lastname': lastname} 
    
    lenstar_data = {    "exams" : {},
                    }    

    for filename in filenames:
        # Parse the XML file
        tree = ET.parse(filename)
        root = tree.getroot()
        patient_node = root.find('EXAMINATION/PATIENT')
        patient_info = {child.tag: child.text for child in patient_node}
        if 'patient' not in lenstar_data:
            lenstar_data['patient'] = patient_info
            # Normalize birthday
            birthday_str = patient_info['BIRTHDAY']
            try:
                birthday_obj = dt.strptime(birthday_str, '%d/%m/%Y')
            except ValueError:
                birthday_obj = dt.strptime(birthday_str, '%Y-%m-%d')
            patient_info['BIRTHDAY'] = birthday_obj.strftime('%Y-%m-%d')

        examination_node = root.find('EXAMINATION')
        examination_info = {child.tag: child.text for child in examination_node if child.tag == 'DATE'}

        od_node = root.find("EXAMINATION/EYE[@side='OD']")
        od_data = extract_eye_data(od_node, examination_info)

        os_node = root.find("EXAMINATION/EYE[@side='OS']")
        os_data = extract_eye_data(os_node, examination_info)

        lenstar_data['exams'][filename] = {'od': od_data , 'os': os_data }

    # database_commit = add_biometry_to_db(wlId, lenstar_data)
    # TODO: delete files already in database

    return { 'status': 'success', 'data': lenstar_data, 'database' :  database_commit }
