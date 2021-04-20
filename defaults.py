"""
This file defines the default values in models
"""

from .common import db, Field # add auth for auto.signature
from pydal.validators import *
from py4web.utils.tags import Tags
from py4web import action

# todo to update and add a button!
@action('set_defaults_db')
def set_defaults_db():
    # gender reference to: nothing
    db.gender.insert(sex="Male")
    db.gender.insert(sex="Female")
    db.gender.insert(sex="Other")
    db.commit()
    # ethny reference to: nothing
    db.ethny.insert(ethny="Caucasian")
    db.ethny.insert(ethny="Black")
    db.ethny.insert(ethny="Hispanic")
    db.ethny.insert(ethny="Arabic")
    db.commit()
    # marital reference to: nothing
    db.marital.insert(marital_status="single")
    db.marital.insert(marital_status="married")
    db.commit()
    # membership reference to: nothing
    db.membership.insert(membership="Admin", hierarchy="0")
    db.membership.insert(membership="Doctor", hierarchy="1") #2
    db.membership.insert(membership="Nurse", hierarchy="2") #3
    db.membership.insert(membership="Medical assistant", hierarchy="2") #4
    db.membership.insert(membership="Administrative", hierarchy="3")
    db.membership.insert(membership="Patient", hierarchy="99") #6
    db.commit()
    # data_origin reference to: nothing
    db.data_origin.insert(origin="Home")
    db.data_origin.insert(origin="Mobile")
    db.data_origin.insert(origin="Work")
    db.commit()
    # facility reference to: nothing
    db.facility.insert(facility_name="Desk1")
    db.facility.insert(facility_name="Desk2")
    db.facility.insert(facility_name="Iris")
    db.facility.insert(facility_name="Cornea")
    db.facility.insert(facility_name="Cristalline")
    db.facility.insert(facility_name="Retina")
    db.facility.insert(facility_name="Exam1")
    db.facility.insert(facility_name="Exam2")
    db.facility.insert(facility_name="Reunion")
    db.commit()
    # facility reference to: nothing 160421
    db.modality_family.insert(family="refraction")
    db.modality_family.insert(family="corneal mapping")
    db.modality_family.insert(family="biometry")
    db.modality_family.insert(family="visual field")
    db.modality_family.insert(family="angiography")
    db.modality_family.insert(family="OCT")
    db.modality_family.insert(family="Multiple")
    db.modality_family.insert(family="Laser")
    db.modality_family.insert(family="Dilatation")
    db.commit()
    # modality_controller reference to: nothing 160421
    db.modality_controller.insert(modality_controller_name="autorx") #1
    db.modality_controller.insert(modality_controller_name="tono") #4
    db.modality_controller.insert(modality_controller_name="topo") #7
    db.modality_controller.insert(modality_controller_name="visualfield") #10
    db.modality_controller.insert(modality_controller_name="oct") #13
    db.modality_controller.insert(modality_controller_name="fluo") #16
    db.modality_controller.insert(modality_controller_name="cem500") #19
    db.modality_controller.insert(modality_controller_name="anterion") #22
    db.modality_controller.insert(modality_controller_name="lenstar") #25
    db.modality_controller.insert(modality_controller_name="none") #28
    db.modality_controller.insert(modality_controller_name="md") #31
    db.modality_controller.insert(modality_controller_name="oct") #34
    db.modality_controller.insert(modality_controller_name="yag") #37
    db.commit()
    # medic reference to: nothing , better to download the table
    db.medic_ref.insert(name="DAFALGAN FORTE 1g", brand="Bristol Mayers", package="Boite de 40cp",active_ingredient="paracetamol", dosage = "['1g']", form="pill", delivery="PO")
    db.medic_ref.insert(name="TOBRADEX", brand="Alcon", packaging="Collyre de 5ml", active_ingredient="['dexamethasone,'tobramycine']", dosage = "['1mg','3mg']", form="drop", delivery="both")
    #  agent (allergy) reference to: nothing, better to download the table
    db.agent.insert(name="Dust", code="dustC66", description="dust allergy")
    db.agent.insert(name="Penicilline", code="penC66", description="penicillin allergy")
    db.agent.insert(name="NSAID", code="nsaidC66", description="NSAID allergy")
    db.agent.insert(name="Bactrim", code="bactrimC66", description="Bactrim allergy")
    db.commit()
    # reference to: nothing
    db.auto_dict.insert(keywd="frequency", keyoption = "qd")
    db.auto_dict.insert(keywd="frequency", keyoption = "bid")
    db.auto_dict.insert(keywd="frequency", keyoption = "tid")
    db.auto_dict.insert(keywd="frequency", keyoption = "qid")
    db.auto_dict.insert(keywd="frequency", keyoption = "1x/j")
    db.auto_dict.insert(keywd="frequency", keyoption = "2x/j")
    db.auto_dict.insert(keywd="frequency", keyoption = "3x/j")
    db.auto_dict.insert(keywd="frequency", keyoption = "4x/j")
    db.commit()
    # status_rx reference to: nothing
    db.status_rx.insert(status="measure")
    db.status_rx.insert(status="prescribed")
    db.status_rx.insert(status="duplicate")
    db.commit()
    # optotype reference to: nothing
    db.optotype.insert(distance="far", opto="Monoyer")
    db.optotype.insert(distance="far", opto="Snellen")
    db.optotype.insert(distance="far", opto="ETDRS")
    db.optotype.insert(distance="close", opto="Parinaud")
    db.optotype.insert(distance="close", opto="Jaeger")
    db.commit()
    # procedure reference to : nothing 160421
    db.procedure.insert(loinc_code="autorxc66", exam_name="AutoRx",exam_description="Automatic refraction",cycle_num="1", procedure_seq="1") #1
    db.procedure.insert(loinc_code="topoc66", exam_name="Corneal mapping",exam_description="Corneal mapping",cycle_num="1", procedure_seq="1") # 4
    db.procedure.insert(loinc_code="biometryc66", exam_name="Optical biometry",exam_description="Optical biometry",cycle_num="1", procedure_seq="1") #7
    db.procedure.insert(loinc_code="routinec66", exam_name="Routine consultation",exam_description="Routine consultation",cycle_num="1", procedure_seq="4") #10 
    db.procedure.insert(loinc_code="glaucoma1c66", exam_name="Glaucoma consultation",exam_description="Glaucoma consultation with visual field and OCT",cycle_num="1", procedure_seq="6") #13
    db.procedure.insert(loinc_code="keratoconusc66", exam_name="Keratoconus consultation",exam_description="Keratoconus consultation with corneal mapping",cycle_num="1", procedure_seq="5") #16
    db.procedure.insert(loinc_code="sltc66", exam_name="SLT",exam_description="Selective Laser Therapy",cycle_num="1", procedure_seq="1") #19
    db.procedure.insert(loinc_code="iridoc66", exam_name="Iridotomy",exam_description="Iridotomy with YAG laser",cycle_num="1", procedure_seq="1") # 22
    db.procedure.insert(loinc_code="capsuloc66", exam_name="Capsulotomy",exam_description="Capsulotomy with YAG laser",cycle_num="1", procedure_seq="1") #25 
    db.procedure.insert(loinc_code="octmacc66", exam_name="OCT macula",exam_description="Macular OCT",cycle_num="1", procedure_seq="1") #28
    db.procedure.insert(loinc_code="octpapc66", exam_name="OCT glaucoma",exam_description="Optic nerve layer OCT on papil and retina",cycle_num="1", procedure_seq="1") #31
    db.procedure.insert(loinc_code="cycloc66", exam_name="Cycloplegia",exam_description="Cycloplegia",cycle_num="1", procedure_seq="1") #34
    db.procedure.insert(loinc_code="dilc66", exam_name="Dilatation",exam_description="Dilatation of pupils",cycle_num="1", procedure_seq="1") #37
    db.commit()
    # modality reference to: modality_controller 160421
    moddb = db.modality_controller
    db.modality.insert(modality_name="L80", id_modality_controller=db(moddb.modality_controller_name == 'autorx').select(moddb.id).first()['id']) # ctrl is autorx
    db.modality.insert(modality_name="VX-120", id_modality_controller=db(moddb.modality_controller_name == 'autorx').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="TonoRef", id_modality_controller=db(moddb.modality_controller_name == 'tono').select(moddb.id).first()['id']) 
    db.modality.insert(modality_name="TonoCan", id_modality_controller=db(moddb.modality_controller_name == 'tono').select(moddb.id).first()['id']) 
    db.modality.insert(modality_name="Octopus 900", id_modality_controller=db(moddb.modality_controller_name == 'visualfield').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="FDT", id_modality_controller=db(moddb.modality_controller_name == 'visualfield').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="OCT Maestro", id_modality_controller=db(moddb.modality_controller_name == 'oct').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="Pentacam", id_modality_controller=db(moddb.modality_controller_name == 'topo').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="Anterion", id_modality_controller=db(moddb.modality_controller_name == 'anterion').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="Visucam", id_modality_controller=db(moddb.modality_controller_name == 'fluo').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="CEM-500", id_modality_controller=db(moddb.modality_controller_name == 'cem500').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="Lenstar", id_modality_controller=db(moddb.modality_controller_name == 'lenstar').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="Multiple", id_modality_controller=db(moddb.modality_controller_name == 'none').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="MD", id_modality_controller=db(moddb.modality_controller_name == 'md').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="YAG Lumenis", id_modality_controller=db(moddb.modality_controller_name == 'yag').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="Cyclopentol", id_modality_controller=db(moddb.modality_controller_name == 'autorx').select(moddb.id).first()['id'])
    db.modality.insert(modality_name="Mix Tropicol/Phenylephrine", id_modality_controller=db(moddb.modality_controller_name == 'none').select(moddb.id).first()['id'])
    db.commit()
    return True
    