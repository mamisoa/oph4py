// Add script reference to wl-state-manager.js
// This needs to be added in the HTML template that includes wl.js

// init worklist form

// change modality options on procedure select
$('#procedureSelect').change(function(){
    setModalityOptions(this.value);
}); 
// reset form
resetWlForm();

$(".btn.counter_down").click(function() {
    value = parseInt($("input.counter").val());
    if (value >= 1) {
        $("input.counter").val(value-1);
    } else {};
});
$(".btn.counter_up").click(function() {
    value = parseInt($("input.counter").val());
    if (value >= 0) {
        $("input.counter").val(value+1);
    } else {};
});

// set modality options
function setModalityOptions(procedureId){
    let modalityOptions = getModalityOptions(procedureId);
    modalityOptions.then(function(data){
        if (data.status != 'error') {
            let items = data.items;
            let html = '';
            for (let item of items) {
                html += '<option value="'+ item.id + '">'+ item.modality_name+'</option>';
            };
            // console.log(html);
            $('#modality_destSelect').html(html);
        };
    });
}

// get json data for modality options
function getModalityOptions(procedureId) {
    return Promise.resolve(
        $.ajax({
            type: "GET",
            url: HOSTURL+"/"+APP_NAME+"/api/modality?id_modality.procedure_family.id_procedure.eq="+procedureId,
            dataType: "json",
            success: function (data) {
                // console.log(data); 
                if (data.status == 'error' || data.count == 0) {
                    displayToast('error', 'GET error', 'Cannot retrieve modality options', '6000');
                } else {                    
                    displayToast('info', 'GET success', 'modality options for ' + procedureId, '6000');
                }
            },
            error: function (er) {
                console.log(er);
            }
        }));
}

// reset add new item in worklist modal
function resetWlForm() {
    // set default value for form
    $("#requested_time").val(new Date().addHours(timeOffsetInHours).toJSON().slice(0,16)); // or 19
    $("[name=laterality]").val(["both"]);
    $("[name=status_flag]").val(["requested"]);
    $("[name=warning]").val([""]);
    let choice = $('select#procedureSelect option:checked').val();
    setModalityOptions(choice);
    
    // Clear the state manager's pending items
    WorklistState.Manager.clearPendingItems();
}

// Replace the global variables with the state manager
// var wlItemsJson = [];
// var wlItemsHtml = [];
var wlItemsCounter = 0;
var temp;

// add new item in worklist format
// TODO: remove status_flag -> only needed when modification
document.getElementById('btnWlItemAdd').addEventListener('click', function() {
    // Lock the button during processing
    WorklistState.UI.lockUI('#btnWlItemAdd', 'Adding...');
    
    let formDataStr = $('#newWlItemForm').serializeJSON();
    let formDataObj = JSON.parse(formDataStr);
    delete formDataObj['modality_destPut']; // used for PUT request
    delete formDataObj['idWl']; // no Id when new Item
    
    // Store patient context
    WorklistState.Manager.setPatientContext({
        id: formDataObj['id_auth_user'],
        sending_facility: $('#sendingFacilitySelect :selected').text(),
        receiving_facility: $('#receivingFacilitySelect :selected').text()
    });
    
    let formDataObjMultiple = [];
    
    // Add item to state manager instead of pushing to array
    const itemId = WorklistState.Manager.addItem(formDataObj);
    
    // Remove uniqueId from the object to be submitted (keep a copy of the ID)
    const stateUniqueId = formDataObj.uniqueId;
    delete formDataObj.uniqueId;
    
    if (formDataObj['modality_dest'] == multiplemod) { // modality_dest 13 is multiple
        // Create a task function for the request queue
        const comboTask = function() {
            return getCombo(formDataObj['procedure'])
                .then(function(data) {
                    let arr = [];
                    for (let i in data.items) {
                        arr[data.items[i]['id_modality.modality_name']] = data.items[i]['id_modality.id'];
                    }
                    
                    let o;
                    for (let a in arr) {
                        o = Object.assign({}, formDataObj); // clone formDataObj
                        o['modality_dest'] = arr[a];
                        o['modality_name'] = a; // only to get modality name
                        if (a == 'MD') {
                            // o['provider']=o['senior'];
                            o['counter'] = 1;
                        }
                        
                        // Add each item to state manager
                        const modalityItemId = WorklistState.Manager.addItem(o);
                        
                        // Store uniqueId separately but don't include in the object for server submission
                        const itemUniqueId = o.uniqueId;
                        delete o.uniqueId;
                        
                        formDataObjMultiple.push(o);
                        
                        // Re-associate the uniqueId for client-side tracking only
                        o._uniqueId = itemUniqueId;
                    }
                    
                    // Validate patient consistency before proceeding
                    if (!WorklistState.Manager.validatePatientConsistency()) {
                        WorklistState.UI.showFeedback('error', 'Error: Items belong to different patients', 'feedbackContainer');
                        return Promise.reject('Patient consistency validation failed');
                    }
                    
                    // Process the items for UI display
                    for (let f in formDataObjMultiple) {
                        let modalityName = formDataObjMultiple[f]['modality_name'];
                        delete formDataObjMultiple[f]['modality_name']; // only to get modality name
                        delete formDataObjMultiple[f]['id']; // only for put request
                        
                        // Get the uniqueId we stored earlier
                        const uniqueId = formDataObjMultiple[f]._uniqueId;
                        delete formDataObjMultiple[f]._uniqueId;
                        
                        // Re-add the uniqueId for client tracking, but ensure it's removed before stringifying
                        const itemWithUniqueId = { ...formDataObjMultiple[f], uniqueId };
                        let formDataObjMultipleStr = JSON.stringify(itemWithUniqueId);
                        
                        // Update status to reflect processing
                        WorklistState.Manager.updateItemStatus(uniqueId, 'pending');
                        
                        appendWlItem(formDataObjMultipleStr, wlItemsCounter, modalityName);
                    }
                    
                    return formDataObjMultiple;
                });
        };
        
        // Add to request queue instead of immediate execution
        WorklistState.Queue.enqueue(
            comboTask,
            function(result) {
                // Success callback
                WorklistState.UI.showFeedback('success', 'Items added to worklist queue', 'feedbackContainer');
                WorklistState.UI.unlockUI('#btnWlItemAdd');
            },
            function(error) {
                // Error callback
                console.error('Error in combo processing:', error);
                WorklistState.UI.showFeedback('error', 'Error adding items: ' + error, 'feedbackContainer');
                WorklistState.UI.unlockUI('#btnWlItemAdd');
            }
        );
    } else {
        // Single modality selection
        delete formDataObj['modality_name']; // only to get modality name
        delete formDataObj['id']; // only for put request
        
        // Re-add the uniqueId for tracking only, but it will be removed by appendWlItem
        formDataObj.uniqueId = stateUniqueId;
        formDataStr = JSON.stringify(formDataObj);
        
        // Update the item status
        WorklistState.Manager.updateItemStatus(stateUniqueId, 'pending');
        
        // Use the request queue for consistent processing
        WorklistState.Queue.enqueue(
            function() {
                // Simple task that executes immediately
                return Promise.resolve(appendWlItem(formDataStr, wlItemsCounter));
            },
            function() {
                // Success callback
                WorklistState.UI.showFeedback('success', 'Item added to worklist queue', 'feedbackContainer');
                WorklistState.UI.unlockUI('#btnWlItemAdd');
            },
            function(error) {
                // Error callback
                console.error('Error adding item:', error);
                WorklistState.UI.showFeedback('error', 'Error adding item: ' + error, 'feedbackContainer');
                WorklistState.UI.unlockUI('#btnWlItemAdd');
            }
        );
    }
});

async function getCombo(id_procedure) {
    try {
        const response = await fetch(`${HOSTURL}/${APP_NAME}/api/combo?@lookup=id_procedure!:id_procedure[exam_name],id_modality!:id_modality&@count=true&id_procedure=${id_procedure}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status !== 'error' || data.count) {
            displayToast('success', 'GET combo exams', 'GET ' + data.items[0]['id_procedure.exam_name']);
        } else {
            displayToast('error', 'GET error', 'Cannot retrieve combo exams');
        }
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Appends a worklist item to the table display and registers it with the state manager.
 * 
 * @param {string} dataStr - JSON string containing the worklist item data
 * @param {number} cnt - Counter/row index used for uniquely identifying the row
 * @param {string} [modalityName] - Optional name of the modality if different from selected
 * @returns {void}
 */
function appendWlItem(dataStr, cnt, modalityName) {
    // Create a new object for UI display
    const wlItemsHtml = {};
    
    // Parse the data string to an object for manipulation
    const parsedData = JSON.parse(dataStr);
    
    // Remove the uniqueId field before storing back to data-json
    const uniqueId = parsedData.uniqueId;
    delete parsedData.uniqueId;
    
    // Convert back to string for storage
    const cleanDataStr = JSON.stringify(parsedData);
    
    // Get form values using vanilla JS
    wlItemsHtml['From'] = document.getElementById('sendingFacilitySelect').options[document.getElementById('sendingFacilitySelect').selectedIndex].text;
    wlItemsHtml['To'] = document.getElementById('receivingFacilitySelect').options[document.getElementById('receivingFacilitySelect').selectedIndex].text;
    wlItemsHtml['Procedure'] = document.getElementById('procedureSelect').options[document.getElementById('procedureSelect').selectedIndex].text;
    wlItemsHtml['Provider'] = document.getElementById('providerSelect').options[document.getElementById('providerSelect').selectedIndex].text;
    wlItemsHtml['Senior'] = document.getElementById('seniorSelect').options[document.getElementById('seniorSelect').selectedIndex].text;
    wlItemsHtml['Timeslot'] = document.getElementById('requested_time').value;
    
    if (modalityName !== undefined) {
        wlItemsHtml['Modality'] = modalityName;
    } else {
        wlItemsHtml['Modality'] = document.getElementById('modality_destSelect').options[document.getElementById('modality_destSelect').selectedIndex].text;
    }
    
    wlItemsHtml['Status'] = document.querySelector('input[name="status_flag"]:checked').value;
    wlItemsHtml['Counter'] = document.querySelector('input[name="counter"]').value;
    wlItemsHtml['warning'] = document.querySelector('input[name="warning"]').value;
    
    // Build HTML string for table header and row
    let head = '<tr>';
    let html = `<tr id="wlItem${cnt}">`;
    
    for (const item in wlItemsHtml) {
        head += `<th scope="col">${item}</th>`;
        html += `<td>${wlItemsHtml[item]}</td>`;
    }
    
    html += `<td class="list-group-item"><button type="button" class="btn btn-danger btn-sm" onclick="delWlItemModal('${cnt}');" data-index=${cnt}><i class="far fa-trash-alt"></i></button></td>`;
    html += '</tr>';
    head += '<tr>';
    
    // Update DOM
    const tbodyItems = document.getElementById('tbodyItems');
    tbodyItems.insertAdjacentHTML('beforeend', html);
    
    document.getElementById('theadItems').innerHTML = head;
    
    // Set data attribute with cleaned JSON
    const rowElement = document.getElementById(`wlItem${cnt}`);
    rowElement.dataset.json = cleanDataStr;
    
    // Store reference to HTML element in state manager using original uniqueId
    if (uniqueId) {
        WorklistState.Manager.htmlElements.set(uniqueId, rowElement);
        
        // Store the mapping between row index and uniqueId for later reference
        rowElement.dataset.uniqueId = uniqueId;
    }
    
    wlItemsCounter += 1;
}

// delete item in item worklist to append
function delWlItemModal(itemId) {
    const element = document.getElementById('wlItem' + itemId);
    
    if (element) {
        // Get the uniqueId from the element's dataset
        const uniqueId = element.dataset.uniqueId;
        if (uniqueId) {
            // Remove from state manager using the uniqueId
            WorklistState.Manager.pendingItems.delete(uniqueId);
            WorklistState.Manager.htmlElements.delete(uniqueId);
        }
        
        element.remove();
    }
};

/**
 * Adds a patient to the worklist by preparing and showing the worklist modal
 * 
 * @param {string|number} userId - The ID of the patient to add to worklist
 * @description
 * This function:
 * 1. Resets the worklist form
 * 2. Shows necessary UI elements
 * 3. Clears existing items
 * 4. Sets the patient ID in the form
 * 5. Updates the WorklistState manager
 * 6. Shows the modal dialog
 */
function addToWorklist(userId) {
    // Initialize form
    resetWlForm();

    // Show all required input elements
    const showElements = ['wlItemAddDiv', 'wlItemsDiv'];
    showElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('visually-hidden');
        }
    });

    // Clear existing items
    const tbodyItems = document.getElementById('tbodyItems');
    if (tbodyItems) {
        tbodyItems.innerHTML = '';
    }

    // Set patient ID in form
    const patientIdInput = document.getElementById('idPatientWl');
    if (patientIdInput) {
        patientIdInput.value = userId;
    }

    // Update state manager with patient context
    WorklistState.Manager.setPatientContext({
        id: userId
    });

    // Show modal using Bootstrap
    const modal = document.getElementById('newWlItemModal');
    if (modal) {
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

/**
 * Toggles a CSS class on a DOM element
 * @param {string} elementId - The ID of the DOM element without '#' prefix
 * @param {string} className - The CSS class name to toggle
 * @param {string} action - The action to perform: 'add' or 'remove'
 */
function hideDiv(elementId, className, action) {
    const element = document.getElementById(elementId.replace('#', ''));
    if (element) {
        action === 'add' ? element.classList.add(className) : element.classList.remove(className);
    }
}

// get item details for put request
function getWlItemDetails(wl_id) {
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: HOSTURL+"/"+APP_NAME+"/api/worklist/"+wl_id+"?@lookup=id_auth_user!:id_auth_user[id,first_name,last_name],provider!:provider[id,first_name,last_name],procedure!:procedure,modality!:modality_dest[id,modality_name],receiving_facility!:receiving_facility[id,facility_name],sending_facility!:sending_facility[id,facility_name],senior!:senior[id,first_name,last_name]",
            success: function(data) {
                if (data.status != 'error') {
                    displayToast('success', 'GET wl details', 'GET wl details from id :'+wl_id,6000);
                } else {
                    displayToast('error', 'GET error', 'Cannot retrieve wl details');
                }
            }, // success
            error: function (er) {
                console.log(er);
            }
        })
    ); // promise return data
};

/**
 * Sets up and displays a modal for editing a worklist item
 * @param {number} wlId - The ID of the worklist item to edit
 * @returns {Promise<void>}
 */
async function putWlModal(wlId) {
    // Initialize form
    resetWlForm();
    wlItemsCounter = 0;

    // Hide unnecessary elements
    const hideElements = ['wlItemAddDiv', 'wlItemsDiv'];
    hideElements.forEach(id => hideDiv(id, 'visually-hidden', 'add'));

    // Update modal title
    const modalTitle = document.querySelector('#newWlItemModal h5.modal-title');
    if (modalTitle) {
        modalTitle.textContent = `Edit worklist item #${wlId}`;
    }

    // Toggle visibility of modality sections
    hideDiv('modality_destDiv', 'visually-hidden', 'add');
    hideDiv('modality_destPutDiv', 'visually-hidden', 'remove');

    try {
        const data = await getWlItemDetails(wlId);
        const field = data.items[0];

        // Reset form
        const form = document.getElementById('newWlItemForm');
        form.reset();

        // Update form fields
        const formUpdates = {
            'sendingFacilitySelect': field['sending_facility.id'],
            'receivingFacilitySelect': field['receiving_facility.id'],
            'procedureSelect': field['procedure.id'],
            'providerSelect': field['provider.id'],
            'seniorSelect': field['senior.id'],
            'requested_time': field['requested_time'].split(' ').join('T'),
            'modality_destSelectPut': field['modality.id'],
            'warning': field['warning'],
            'idPatientWl': field['id_auth_user.id'],
            'idWl': wlId,
            'methodWlItemSubmit': 'PUT'
        };

        // Apply updates to form elements
        Object.entries(formUpdates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });

        // Update radio buttons
        document.querySelectorAll('[name=laterality]').forEach(radio => {
            radio.checked = radio.value === field.laterality;
        });
        document.querySelectorAll('[name=status_flag]').forEach(radio => {
            radio.checked = radio.value === field.status_flag;
        });
        document.querySelectorAll('[name=counter]').forEach(radio => {
            radio.checked = radio.value === field.counter;
        });

        // Show modal
        const modal = document.getElementById('newWlItemModal');
        if (modal && typeof bootstrap !== 'undefined') {
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
        }
    } catch (error) {
        console.error('Error fetching worklist item details:', error);
    }
}

// submit each wl items in wlItemsJson
$('#newWlItemForm').submit(function(e) {
    e.preventDefault();
    let req = $('#methodWlItemSubmit').val();
    let seniorSelect = document.getElementById('seniorSelect').options[document.getElementById('seniorSelect').selectedIndex].text;
    let providerSelect = document.getElementById('providerSelect').options[document.getElementById('providerSelect').selectedIndex].text;
    let patientId = document.getElementById('idPatientWl').value;
    // not to use ? let wlIdEl = document.getElementById('idWl').value;
    // constructing studyData
    let studyData = {};
    studyData.ReferringPhysicianName = seniorSelect.replace(/,/g, '^');
    studyData.ScheduledPerformingPhysicianName = providerSelect.replace(/,/g, '^');

    // TODO: create patient for pacs at this level instead of for each modality
    if (req =='POST') {
        // create patient in dicom
        let patientInfo = getUserInfo(patientId);
        patientInfo
            .then( (patient) => {
                    let patientData = {}; 
                    patientData.PatientID = patient['items'][0]['id'];
                    patientData.PatientName = patient['items'][0]['last_name']+'^'+ patient['items'][0]['first_name'];
                    patientData.PatientBirthDate = patient['items'][0]['dob'].replace(/-/g, "");
                    patientData.PatientSex = patient['items'][0]['gender.sex'].charAt(0).toUpperCase();
                    studyData.PatientID = patient['items'][0]['id'];
                    let postPatientPacs = addPatientPacs(patientData) // promise
                    postPatientPacs
                    .then( () => { // patient is added to PACS, now loop the workinglist items
                            // FIXME: wlItemsCounter will be lower if an item is deleted???
                            for (let i = 0; i<=wlItemsCounter+1; i++) {
                                let el = "wlItem"+parseInt(i);
                                let wlId;
                                const element = document.getElementById(el);
                                if (element) {
                                    // Get data from the dataset instead of jQuery's data()
                                    let itemDataObj;
                                    try {
                                        itemDataObj = JSON.parse(element.dataset.json);
                                    } catch (e) {
                                        console.error('Error parsing JSON from data-json attribute:', e);
                                        continue;
                                    }
                                    delete itemDataObj['methodWlItemSubmit'];
                                    let modalityLowCase;
                                    getUuid() // promise
                                        .then(function(uuid) {
                                            console.log('WlItemObj:',itemDataObj);                   
                                            itemDataObj["message_unique_id"] = uuid.unique_id;
                                            let itemDataStr = JSON.stringify(itemDataObj);
                                            console.log('itemDataStr:',itemDataStr);
                                            crudp('worklist','0', req, itemDataStr)
                                            .then( data => {
                                                // Remove element using vanilla JS
                                                element.remove();
                                                wlId = data.id;
                                            }); 
                                        })
                                        .catch(error => console.error('An error occurred generating uuid:', error))
                                        .then(function() {
                                            getTableInfo('modality',itemDataObj['modality_dest'])
                                                .then(function(modality){
                                                    modalityLowCase = modality['items'][0]['modality_name'].toLowerCase();
                                                    studyData.ScheduledProcedureStepStartDate = itemDataObj['requested_time'].substring(0, 4) + itemDataObj['requested_time'].substring(5, 7) + itemDataObj['requested_time'].substring(8, 10);
                                                    studyData.ScheduledProcedureStepStartTime = itemDataObj['requested_time'].substring(11, 13) + itemDataObj['requested_time'].substring(14, 16);
                                                    studyData.RequestedProcedureDescription = "Opthalmology Procedure";
                                                    // TODO: construct Dicom Sequences
                                                    if ( modalityLowCase == 'l80') {
                                                        console.log('L80 detected');
                                                        let firstname = removeAccent(patient['items'][0]['first_name']);
                                                        let lastname = removeAccent(patient['items'][0]['last_name']);
                                                        let dob = patient['items'][0]['dob'];
                                                        let id = patient['items'][0]['id'];
                                                        let sex = patient['items'][0]['gender.sex'];
                                                        // console.log('useritem: ', user['items'][0]);
                                                        addPatientVisionix('vx100', id, lastname, firstname, dob, sex)
                                                        .then( () => {
                                                                    addPatientVisionix('l80', id, lastname, firstname, dob, sex)
                                                                    // .then( () => {$table_wl.bootstrapTable('refresh');})
                                                                    .catch(error => console.error('An error occurred adding patient to l80:', error))
                                                                }
                                                            )
                                                        .catch(error => console.error('An error occurred adding patient to visionix:', error));
                                                    } else {
                                                        // console.log('not L80');
                                                    };

                                                    if (modalityLowCase == 'octopus 900' || modalityLowCase == 'lenstar') {
                                                        console.log(modalityLowCase,' detected');
                                                        let firstname = removeAccent(patient['items'][0]['first_name']);
                                                        let lastname = removeAccent(patient['items'][0]['last_name']);
                                                        let dob = patient['items'][0]['dob'];
                                                        let id = patient['items'][0]['id'];
                                                        let sex = patient['items'][0]['gender.sex'];
                                                        let machineType;
                                                        if (modalityLowCase === 'octopus 900') {
                                                            machineType = 'PERIMETRY_STATIC';
                                                        } else if (modalityLowCase === 'lenstar') {
                                                            machineType = 'BIOM_MEASUREMENT';};
                                                        addPatientEyesuite(machineType, id, lastname, firstname, dob, sex)
                                                        // .then( () => {$table_wl.bootstrapTable('refresh')})
                                                        .catch(error => console.error('An error occurred adding patient to Eyesuite:', error));
                                                    } else {
                                                        console.log('not octopus 900 nor lenstar');
                                                    };

                                                    if (modalityLowCase == 'anterion') {
                                                        console.log('modality is', modalityLowCase);
                                                        studyData.StudyDescription = "Anterior OCT";
                                                        studyData.ScheduledStationAETitle = "ANTERION";
                                                        console.log("studyData PENTACAM",studyData)
                                                        let updateMwl = addStudyMwl(studyData);
                                                        updateMwl
                                                        // .then(() => {$table_wl.bootstrapTable('refresh');})
                                                        .catch(error => console.error('An error occurred adding Pentacam to MWL:', error));
                                                    } else {
                                                        console.log('not Anterion');
                                                    };

                                                    if (modalityLowCase == 'pentacam') {
                                                        console.log('modality is', modalityLowCase);
                                                        studyData.StudyDescription = "Scheimpflug topography";
                                                        studyData.ScheduledStationAETitle = "PENTACAM";
                                                        console.log("studyData PENTACAM",studyData)
                                                        let updateMwl = addStudyMwl(studyData);
                                                        updateMwl
                                                        // .then(() => {$table_wl.bootstrapTable('refresh');})
                                                        .catch(error => console.error('An error occurred adding Pentacam to MWL:', error));
                                                    } else {
                                                        console.log('not Pentacam');
                                                    };

                                                    if (modalityLowCase == 'md') {
                                                        console.log('modality is', modalityLowCase);
                                                        studyData.StudyDescription = "Non mydriatic retinography";
                                                        studyData.ScheduledStationAETitle = "CR1";
                                                        console.log("studyData CR1",studyData)
                                                        let updateMwl = addStudyMwl(studyData);
                                                        updateMwl
                                                        // .then(() => {$table_wl.bootstrapTable('refresh');})
                                                        .catch(error => console.error('An error occurred adding CR1 to MWL:', error));
                                                    } else {
                                                        console.log('not MD');
                                                    };

                                                }) // end getTableInfo
                                                .catch(error => console.error('An error occurred getting modality informations:', error));
                                        })
                                        .then(function(){
                                            $table_wl.bootstrapTable('refresh');
                                        });
                                };
                            }; // end for loop
                        } // .then patient added to PCS

                    )
                    .catch(error => console.error('An error occurred adding patient to PACS:', error));
                })
            .catch(error => console.error('An error occurred getting patient informations:', error));
    } else if (req=='PUT') {
        let itemDataPutStr = $('#newWlItemForm').serializeJSON();
        let itemDataPutObj = JSON.parse(itemDataPutStr);
        delete itemDataPutObj['methodWlItemSubmit'];
        delete itemDataPutObj['modality_dest'];
        itemDataPutObj['modality_dest']=itemDataPutObj['modality_destPut'];
        delete itemDataPutObj['modality_destPut'];
        // Extract ID before deleting it from the payload
        const id = itemDataPutObj.id;
        delete itemDataPutObj.id;  // Remove ID from payload
        itemDataPutStr = JSON.stringify(itemDataPutObj);
        // Use the ID in the URL instead of the payload
        crudp('worklist', id, 'PUT', itemDataPutStr);
        hideDiv('#modality_destPutDiv', 'visually-hidden','add');
        hideDiv('#modality_destDiv', 'visually-hidden','remove');
    };
    $table_wl.bootstrapTable('refresh');
    $('#newWlItemModal').modal('hide');
}); // end submit function

function delWlItem (id) {
    bootbox.confirm({
        message: "Are you sure you want to delete this worklist item?",
        closeButton: false ,
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-success'
            },
            cancel: {
                label: 'No',
                className: 'btn-danger'
            }
        },
        callback: function (result) {
            if (result == true) {
                crudp('worklist',id,'DELETE').then( data => $table_wl.bootstrapTable('refresh'));
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};

// set timers 
function set_timers(timers) {
    $.each(timers, function(i){
      $(timers[i]).timer({
        seconds: $(timers[i]).text()
      });
    });
    timer_id = [];
};