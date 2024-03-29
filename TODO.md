Patient informations

In DICOM, the Value Representation (VR) defines the data type and format of an attribute's value. Here are the aforementioned tags along with their corresponding VRs:

Certainly! Here's the information formatted in a table:

| Tag       | Attribute             | VR   | Description                               |
|-----------|-----------------------|------|-------------------------------------------|
| 0x00100020 | Patient ID            | LO   | A unique identifier assigned to the patient. |
| 0x00100010 | Patient's Name        | PN   | The name of the patient.                     |
| 0x00100030 | Patient's Birth Date  | DA   | The birth date of the patient.               |
| 0x00100040 | Patient's Sex         | CS   | The sex of the patient (e.g., M, F).         |
| 0x00101010 | Patient's Age         | AS   | Age of the patient at the time the study was performed. |

The hexadecimal format of the tags is a commonly used representation in the DICOM standard and is often seen in the DICOM file headers and documentation.

The VRs define how the information is stored and facilitate consistent interpretation and handling of these values by different DICOM-compliant systems. Different VRs accommodate different types of data, such as strings, numbers, dates, and more specialized types like Person Name, to reflect the nature and structure of the information.



Doctor order a STUDY for a patient
A STUDY contains SERIES, which are exams ordered by the doctor.
Each SERIE comes from one MODALITY, and contains several IMAGES.

Certainly! Here's the information for the unique identifiers at the study, series, and image levels, formatted in a table with tags in hexadecimal format:

| Tag       | Attribute             | VR   | Description                                         |
|-----------|-----------------------|------|-----------------------------------------------------|
| 0x0020000D | Study Instance UID    | UI   | Unique identifier for the study.                    |
| 0x0020000E | Series Instance UID   | UI   | Unique identifier for a series within a study.      |
| 0x00080018 | SOP Instance UID      | UI   | Unique identifier for an individual image or SOP instance. |

- **Study Level**
  - Tag: (0020,000D)
  - Attribute: Study Instance UID
  - Description: A unique identifier for the study. It's used to group a set of images together that were taken for the same examination or procedure on a particular patient.

- **Series Level**
  - Tag: (0020,000E)
  - Attribute: Series Instance UID
  - Description: A unique identifier for a series within a study. It's used to group images together that were acquired in the same series of a study, typically using the same modality and under similar conditions.

- **Image Level**
  - Tag: (0008,0018)
  - Attribute: SOP Instance UID
  - Description: A unique identifier for an individual image or SOP (Service Object Pair) instance. It uniquely identifies each image within a series.

Mapping with Oph4py

Worklist ID maps to Study instance UID 0x0020000D.
Then one WlId has different modalities when encoded at registration. So Series Instance UID 0x0020000E maps to the ID of the line in the model generated by the modality controller.

So we need a table model to store the SOP Instance UID 0x00080018. This way we can call the see the image straight.
What attributes should we store:
WlId worklist ID
PatientID
ControllerID == modality ID == AET
SOP instance UID 0x00080018
