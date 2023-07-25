# restAPI eyesuite controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400

from ...common import session, T, cache, auth, logger, authenticated, unauthenticated

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
    reg = rf"\d{{4}}_\d{{2}}_\d{{2}}_\d{{2}}_\d{{2}}(_\d{{2}})?_{lastname}_{firstname}(_{ID})?(_.*)?_biometry.xml$"
    pattern = re.compile(reg)
    
    # Get the list of all xml files in the directory
    all_files = glob.glob(f"{directory}/*.xml")
    
    # Filter the list to include only those that match the regular expression
    matching_files = [file for file in all_files if pattern.match(os.path.basename(file))]
    # matching_files = [file for file in all_files]
    
    return matching_files,reg


def extract_nested_elements(element, path=""):
    """
    Recursively extract nested elements and their attributes from an XML element.
    
    Parameters:
    element (xml.etree.ElementTree.Element): The XML element to extract data from.
    path (str): The current path of the element, used for recursive calls.
    
    Returns:
    nested_elements (dict): A dictionary where the keys are the paths of the elements
    and the values are the texts or attribute values.
    """
    nested_elements = {}
    
    # If the element has text, store it
    if element.text and element.text.strip():
        nested_elements[path] = element.text.strip()
    
    # If the element has attributes, store them
    for attr_name, attr_value in element.attrib.items():
        nested_elements[f"{path}@{attr_name}"] = attr_value

    # If the element has children, recursively extract their elements
    for child in element:
        nested_elements.update(extract_nested_elements(child, f"{path}/{child.tag}" if path else child.tag))
    
    return nested_elements

@action('rest/lenstar/', method=['GET']) 
def upload_lenstar(id='',lastname='_',firstname='_'):
    """
    Load data from an XML file and insert it into the database.
    
    The XML file name is expected to be passed as a request parameter.
    The XML file is parsed, and the data is extracted using the `extract_nested_elements` function.
    The data is then converted to the format expected by the database and inserted into the 'examination' table.
    """
    import datetime
    path = EYESUITE_FOLDER + 'lenstar/exports'
    now = datetime.date.today().strftime('%Y-%m-%d')
    import xml.etree.ElementTree as ET, json, datetime
    if 'lastname' in request.query:
        lastname = request.query.get('lastname')
    if 'firstname' in request.query:
        firstname = request.query.get('firstname')
    if 'id' in request.query:
        id = request.query.get('id')
    filenames, reg = find_matching_xml(directory=path, date=now, lastname=lastname, firstname=firstname, ID=id)
    if len(filenames) == 0:
        return {'status': 'error', 'message': 'no xml found', 'params': [id,lastname,firstname,path,now, reg], 'filenames': filenames}
    lenstar_data = {}

    for filename in filenames:
        # Parse the XML file
        tree = ET.parse(filename)
        root = tree.getroot()

        # Extract the data from the XML
        data = extract_nested_elements(root)

        #check keys
        keys = [
            "EXAMINATION/DATE",
            "EXAMINATION/PATIENT/NAME",
            "EXAMINATION/PATIENT/FIRSTNAME",
            "EXAMINATION/PATIENT/BIRTHDAY",
            "EXAMINATION/EYE@side",
            "EXAMINATION/EYE/A-SCAN/MODE",
            "EXAMINATION/EYE/A-SCAN/CENTRAL_CORNEA_THICKNESS",
            "EXAMINATION/EYE/A-SCAN/AQUEOUS_DEPTH",
            "EXAMINATION/EYE/A-SCAN/LENSE_THICKNESS",
            "EXAMINATION/EYE/A-SCAN/AXIAL_LENGTH",
            "EXAMINATION/EYE/KERATOMETRY/FLAT_MERIDIAN",
            "EXAMINATION/EYE/KERATOMETRY/STEEP_MERIDIAN",
            "EXAMINATION/EYE/KERATOMETRY/FLAT_MERIDIAN_AXIS",
            "EXAMINATION/EYE/WHITE-WHITE/DIAMETER",
            "EXAMINATION/EYE/WHITE-WHITE/BARYCENTER_X",
            "EXAMINATION/EYE/WHITE-WHITE/BARYCENTER_Y",
            "EXAMINATION/EYE/PUPILLOMETRY/DIAMETER",
            "EXAMINATION/EYE/PUPILLOMETRY/BARYCENTER_X",
            "EXAMINATION/EYE/PUPILLOMETRY/BARYCENTER_Y",
            "EXAMINATION/EYE/IMAGEAXIS",
            "EXAMINATION/EYE/CHECK@type",
            "EXAMINATION/EYE/CHECK@version",
            "EXAMINATION/EYE/CHECK/QUALITY",
            "EXAMINATION/EYE/CHECK/ERROR",
            "EXAMINATION/EYE/CHECK/ACTIVATION",
            "COMMENT",
        ]

        default_value = ''

        # Convert the data to the format expected by the database
        lenstar_data[filename] = {
            "date": data.get(keys[0], default_value),
            "patient_name": data.get(keys[1], default_value),
            "patient_firstname": data.get(keys[2], default_value),
            "patient_birthday": data.get(keys[3], default_value),
            "eye_side": data.get(keys[4], default_value),
            "ascan_mode": data.get(keys[5], default_value),
            "central_cornea_thickness": convert_to_int(data.get(keys[6], default_value)),
            "aqueous_depth": convert_to_float(data.get(keys[7], default_value).replace(',', '.')),
            "lense_thickness": convert_to_float(data.get(keys[8], default_value).replace(',', '.')),
            "axial_length": convert_to_float(data.get(keys[9], default_value).replace(',', '.')),
            "flat_meridian": convert_to_float(data.get(keys[10], default_value).replace(',', '.')),
            "steep_meridian": convert_to_float(data.get(keys[11], default_value).replace(',', '.')),
            "flat_meridian_axis": convert_to_int(data.get(keys[12], default_value)),
            "white_white_diameter": convert_to_float(data.get(keys[13], default_value).replace(',', '.')),
            "white_white_barycenter_x": convert_to_float(data.get(keys[14], default_value).replace(',', '.')),
            "white_white_barycenter_y": convert_to_float(data.get(keys[15], default_value).replace(',', '.')),
            "pupillometry_diameter": convert_to_float(data.get(keys[16], default_value).replace(',', '.')),
            "pupillometry_barycenter_x": convert_to_float(data.get(keys[17], default_value).replace(',', '.')),
            "pupillometry_barycenter_y": convert_to_float(data.get(keys[18], default_value).replace(',', '.')),
            "imageaxis": convert_to_float(data.get(keys[19], default_value).replace(',', '.')),
            "check_type": data.get(keys[20], default_value),
            "check_version": data.get(keys[21], default_value),
            "quality": convert_to_int(data.get(keys[22], default_value)),
            "error": convert_to_int(data.get(keys[23], default_value)),
            "activation": convert_to_int(data.get(keys[24], default_value)),
            "comment": data.get(keys[25], default_value),
        }


        # Convert the data to the format expected by the database
        # lenstar_data[filename] = {
        #     "date": data["EXAMINATION/DATE"],
        #     "patient_name": data["EXAMINATION/PATIENT/NAME"],
        #     "patient_firstname": data["EXAMINATION/PATIENT/FIRSTNAME"],
        #     "patient_birthday": data["EXAMINATION/PATIENT/BIRTHDAY"],
        #     "eye_side": data["EXAMINATION/EYE@side"],
        #     "ascan_mode": data["EXAMINATION/EYE/A-SCAN/MODE"],
        #     "central_cornea_thickness": convert_to_int(data["EXAMINATION/EYE/A-SCAN/CENTRAL_CORNEA_THICKNESS"]),
        #     "aqueous_depth": convert_to_float(data["EXAMINATION/EYE/A-SCAN/AQUEOUS_DEPTH"].replace(',', '.')),
        #     "lense_thickness": convert_to_float(data["EXAMINATION/EYE/A-SCAN/LENSE_THICKNESS"].replace(',', '.')),
        #     "axial_length": convert_to_float(data["EXAMINATION/EYE/A-SCAN/AXIAL_LENGTH"].replace(',', '.')),
        #     "flat_meridian": convert_to_float(data["EXAMINATION/EYE/KERATOMETRY/FLAT_MERIDIAN"].replace(',', '.')),
        #     "steep_meridian": convert_to_float(data["EXAMINATION/EYE/KERATOMETRY/STEEP_MERIDIAN"].replace(',', '.')),
        #     "flat_meridian_axis": convert_to_int(data["EXAMINATION/EYE/KERATOMETRY/FLAT_MERIDIAN_AXIS"]),
        #     "white_white_diameter": convert_to_float(data["EXAMINATION/EYE/WHITE-WHITE/DIAMETER"].replace(',', '.')),
        #     "white_white_barycenter_x": convert_to_float(data["EXAMINATION/EYE/WHITE-WHITE/BARYCENTER_X"].replace(',', '.')),
        #     "white_white_barycenter_y": convert_to_float(data["EXAMINATION/EYE/WHITE-WHITE/BARYCENTER_Y"].replace(',', '.')),
        #     "pupillometry_diameter": convert_to_float(data["EXAMINATION/EYE/PUPILLOMETRY/DIAMETER"].replace(',', '.')),
        #     "pupillometry_barycenter_x": convert_to_float(data["EXAMINATION/EYE/PUPILLOMETRY/BARYCENTER_X"].replace(',', '.')),
        #     "pupillometry_barycenter_y": convert_to_float(data["EXAMINATION/EYE/PUPILLOMETRY/BARYCENTER_Y"].replace(',', '.')),
        #     "imageaxis": convert_to_float(data["EXAMINATION/EYE/IMAGEAXIS"].replace(',', '.')),
        #     "check_type": data["EXAMINATION/EYE/CHECK@type"],
        #     "check_version": data["EXAMINATION/EYE/CHECK@version"],
        #     "quality": convert_to_int(data["EXAMINATION/EYE/CHECK/QUALITY"]),
        #     "error": convert_to_int(data["EXAMINATION/EYE/CHECK/ERROR"]),
        #     "activation": convert_to_int(data["EXAMINATION/EYE/CHECK/ACTIVATION"]),
        #     "comment": data["COMMENT"],
        # }

    # # Insert the data into the database
    # #db.examination.insert(**db_data)
    # # Commit the transaction
    # # db.commit()
    return { 'status': 'success', 'data': lenstar_data }