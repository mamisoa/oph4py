# restAPI dicom controllers

from py4web import action, request, abort, redirect, URL, Field, response # add response to throw http error 400

from ...common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash

from ...settings import PACS, PACS_URL, AET, REALMS_URL, KEYCLOAK_SECRET

import json, requests # maybe check to use from ombott
import os
from datetime import datetime

import pydicom
from pydicom.dataset import Dataset
from pydicom.sequence import Sequence

def get_token():
    url = f'{REALMS_URL}/realms/dcm4che/protocol/openid-connect/token'
    data = {
        "grant_type": "client_credentials",
        "client_id": "curl",
        "client_secret": KEYCLOAK_SECRET,
    }
    response = requests.post(url, data=data, verify=False)
    return response.json()

def token_is_valid(token_info):
    # Check if the token is valid (not expired)
    if 'exp' not in token_info:
        return False

    expiry_date = datetime.utcfromtimestamp(token_info['exp'])
    return datetime.utcnow() < expiry_date

def check_token():
    """
    Check if token is not expired and renew if so
    return json valid token
    """ 
    token_filename = 'token.txt'
    token_info = None

    # check if token file exists
    if os.path.exists(token_filename):
        # read the token and check if not expired
        with open(token_filename, 'r') as file:
            token_info = json.load(file)
            # set token_info to None if expired
            if not token_is_valid(token_info):
                token_info = None
            else:
                print('Token is still valid...')
    
    # if expired, renew token
    if token_info is None:
        print('Renewing token ...')
        token_info = get_token()
        with open(token_filename, 'w') as file:
            json.dump(token_info, file)    
    return token_info

def get_modality_id(modality : str):
    """
    Get modality id from table
    Parameters:
        modality (str): modality name
    """
    row = db(db.modality.modality_name == modality).select(db.modality.id).first()
    if row:
        return row.id
    else:
        return None

@action('rest/dcm4chee/patient/create', method=['POST'])
def create_patient():
    """
    Create or update patient in PACS
    Parameters:
        patient_data (json)

    """
    patient_data = request.json

    if PACS != True:
        return f'[{{ "status": "error", "code": "503", "message": "PACS module disabled"}}]'
    
    ds = Dataset()
    ds.add_new(0x00080005, 'CS', 'ISO_IR 192')
    ds.add_new(0x00100010, 'PN', patient_data['PatientName']) 
    ds.add_new(0x00100020, 'LO', str(patient_data['PatientID'])+"_oph4py") 
    ds.add_new(0x00100030, 'DA', patient_data['PatientBirthDate']) 
    ds.add_new(0x00100040, 'CS', patient_data['PatientSex']) #M/F/O oph4py returns 'Male'/'Female'/'Other'

    # Get authorization
    json_token = check_token()
    token = json_token['access_token']
    url = f"{PACS_URL}/aets/{AET['PACS']}/rs/patients"
    
    payload = ds.to_json_dict()
    # print('Payload:',payload)
    headers = {"Authorization": f"Bearer {token}",
               "Content-Type": "application/json",
               "accept": "application/json"}
    
    response = requests.post(url, json=payload, headers=headers)
    response.encoding = 'utf-8'
    if response.status_code == 200:
        return f'[{{ "status": "success" , "code": "{response.status_code}", "message": "{response.text}"}}]'
    if response.status_code == 400:
        return '[{{ "status": "error" , "code": "{response.status_code}", "message": "Missing patient identifier with trusted assigning authority in specified patient identifiers"}}]'
    if response.status_code == 403:
        return f'[{{ "status": "error" , "code": "{response.status_code}", "message": "Creation of already merged patient forbidden"}}]'
    if response.status_code == 409:
        return f'[{{ "status": "error" , "code": "{response.status_code}", "message": "Non Unique Patients found for patient identifiers in request payload"}}]'
    else:
        return f'[{{ "status": "error", "code": "{response.status_code}", "message": "Request error"}}]'

@action('rest/dcm4chee/mwl/create', method=['POST'])
def add_mwl():
    """
    Create a new MWL item. Patient must exist beforehands.
    Parameters:
        patient_data (dict)

    """

    if PACS != True:
        return f'[{{ "status": "error", "code": "503", "message": "PACS module disabled"}}]'

    study_data = request.json

    ds = Dataset()
    ds.add_new(0x00080005, 'CS', 'ISO_IR 192')
    ds.add_new(0x00100020, 'LO', str(study_data['PatientID'])+"_oph4py") 
    ds.add_new(0x00800090, 'PN', study_data['ReferringPhysicianName'])

    sps = Dataset()
    sps.add_new(0x00400002, 'DA', study_data['ScheduledProcedureStepStartDate'])
    sps.add_new(0x00400003, 'TM', study_data['ScheduledProcedureStepStartTime'])
    # sps.add_new(0x00401001, 'SH', study_data['RequestedProcedureID'])
    sps.add_new(0x00321060, 'LO', study_data['RequestedProcedureDescription'])
    sps.add_new(0x00400001, 'AE', study_data['ScheduledStationAETitle']) 
    sps.add_new(0x00400006, 'SH', study_data['ScheduledPerformingPhysicianName'])
    # sps.add_new(0x00400011, 'SH', study_data['ScheduledProcedureStepLocation'])
    sps.add_new(0x00400020, 'CS', 'SCHEDULED')
    ds.add_new(0x00400100, 'SQ', Sequence([sps]))
    # You'll need to modify this line based on the specific SOP Class UID for the MWL item
    ds.SOPClassUID = '1.2.840.10008.5.1.4.31'

    json_token = check_token()
    token = json_token['access_token']
    url = f"{PACS_URL}/aets/{AET['MWL']}/rs/mwlitems"

    payload = ds.to_json_dict()
    # print('Payload:',payload)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    response = requests.post(url, json=payload, headers=headers)
    response.encoding = 'utf-8'
    if response.status_code == 200:
        return f'[{{ "status": "success" , "code": "{response.status_code}", "message": "{response.text}"}}]'
    if response.status_code == 400:
        return '[{{ "status": "error" , "code": "{response.status_code}", "message": "Missing Patient ID or Scheduled Procedure Step Sequence in request body or Patient found using patient identifiers sent in request payload does not match with patient of MWL"}}]'
    if response.status_code == 403:
        return f'[{{ "status": "success" , "code": "{response.status_code}", "message": "Create/Update MWL forbidden for already merged patients"}}]'
    if response.status_code == 404:
        return f'[{{ "status": "success" , "code": "{response.status_code}", "message": "There is no Archive AE with the specified Title or Patient does not exist."}}]'
    if response.status_code == 409:
        return f'[{{ "status": "success" , "code": "{response.status_code}", "message": "Non Unique Patient or Patient is already merged exception."}}]'
    else:
        return f'[{{ "status": "error", "code": "{response.status_code}", "message": "Request error"}}]'
