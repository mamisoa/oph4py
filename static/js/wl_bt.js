// set parameters for ajax request from bootstrap-table
let s_wl="";
let toggle_wl="";
// add visibility to main modalities
let mainModalityArr = ['MD', 'GP']

// Make sure this object is defined immediately to avoid bootstrap-table initialization errors
window.operateEvents_wl = {};

// Make sure we're integrated with the state management system
// This assumes wl-state-manager.js is loaded before this file
if (typeof WorklistState === 'undefined') {
    console.error('WorklistState not found! Make sure wl-state-manager.js is loaded first.');
}

function queryParams_wl(params) {
    search = params.search.split(",");
    if (search == [""]) {
        s_wl =""
    } else {
        if (search[0]!= undefined) {
            s_wl = "id_auth_user.last_name.contains=" + search[0];
        } else {
            s_wl = "";
        };
        if (search[1]!= undefined) {
            s_wl += "&id_auth_user.first_name.startswith=" + capitalize(search[1]);
        } else {
            s_wl +="";
        };
        if (search[2]!= undefined) {
            s_wl += "&procedure.exam_name.startswith=" + capitalize(search[2]);
        } else {
            s_wl +="";
        };
        if (search[3]!= undefined) {
            s_wl += "&modality_dest.modality_name.startswith=" + capitalize(search[3]);
        } else {
            s_wl +="";
        };
    }
    if (params.sort != undefined) {
        if (params.sort == "id") {
            params.sort = "id";
        }
        if (params.sort == "modality") {
            params.sort = "modality_dest";
        }
        if (params.sort == "procedure") {
            params.sort = "procedure";
        }
        if (params.sort == "patient") {
            params.sort = "id_auth_user";
        }
        if (toggle_wl=="") {
            s_wl += "&@order="+params.sort;
            toggle_wl="~";
        } else {
            s_wl += "&@order=~"+params.sort;
            toggle_wl="";
        }
    }
    if (params.offset != "0") {
        console.log(params.offset);
        s_wl += "&@offset="+params.offset;
    }
    if (params.limit != "0") {
        // console.log(params.offset);
        s_wl += "&@limit="+params.limit;
    }
    // console.log('s_wl',s_wl);
    return decodeURI(encodeURI(s_wl));
};

function styleTimeslot(ts) {
    let arr = ts.split(' ');
    let res = '<strong>'+arr[1]+'</strong> '+arr[0].split('-').reverse().join('/');
    return res;
};

function responseHandler_wl(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'id_auth_user': list[i]['id_auth_user.id'],
            'sending_facility': list[i]['sending_facility.facility_name'],
            'receiving_facility': list[i]['receiving_facility.facility_name'],
            'patient': list[i]['id_auth_user.last_name']+' '+list[i]['id_auth_user.first_name'],
            'provider': list[i]['provider.last_name']+' '+list[i]['provider.first_name'],
            'senior': list[i]['senior.last_name']+' '+list[i]['senior.first_name'],
            'procedure': list[i]['procedure.exam_name'],
            'modality': list[i]['modality.modality_name'],
            'laterality': list[i]['laterality'],
            'requested_time': styleTimeslot(list[i]['requested_time']),
            'status_flag': list[i]['status_flag'],
            'counter': list[i]['counter'],
            'warning': list[i]['warning'],
            'modified_by': list[i]['modified_by.last_name']+' '+list[i]['modified_by.first_name'],
            'modified_on': list[i]['modified_on'],
            'created_by': list[i]['created_by.last_name']+' '+list[i]['created_by.first_name'],
            'created_on': list[i]['created_on']
        });
    });
    return {    rows: display, 
                total: res.count,
                };
};

function operateFormatter_wl(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit worklist item"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Delete worklist item"><i class="fas fa-trash-alt"></i></a>');
    if (row.status_flag != 'done') {
        html.push('<a class="done ms-1" href="javascript:void(0)" title="Set to process"><i class="fas fa-check"></i></a>');
        html.push('<a class="stopwatch ms-1" href="javascript:void(0)" title="Counter minus 1"><i class="fas fa-stopwatch"></i></a>');
    } else {
        html.push('<a class="unlock ms-1" href="javascript:void(0)" title="Set to process"><i class="fas fa-unlock"></i></a>');
    };
    if (modalityDict[row.modality] != 'none') {
        html.push('<a class="modality_ctr ms-1" href="javascript:void(0)" title="Execute task"><i class="fas fa-heartbeat"></i></a>');
    }
    if (mainModalityArr.includes(row.modality)  && row.status_flag =='done') {
        html.push('<a class="summary ms-1" href="javascript:void(0)" title="Read summary"><i class="fas fa-th-list"></i></a>');
    } else {};
    html.push('</div>');
    return html.join('');
};

// Update the window.operateEvents_wl object with all the event handlers
window.operateEvents_wl = {
    'click .edit': function (e, value, row, index) {
      console.log('You click action EDIT on row: ' + JSON.stringify(row));
      putWlModal(row.id);
    },
    'click .remove': function (e, value, row, index) {
        // Use request queue for deletion to prevent race conditions
        WorklistState.UI.lockUI('.remove', 'Deleting...');
        
        // Add to request queue instead of calling directly
        WorklistState.Queue.enqueue(
            function() {
                return new Promise((resolve, reject) => {
                    bootbox.confirm({
                        message: "Are you sure you want to delete this worklist item?",
                        closeButton: false,
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
                            if (result) {
                                // Track the item being processed
                                WorklistState.Manager.trackProcessingItem(row.id);
                                
                                // Delete through the API
                                crudp('worklist', row.id, 'DELETE')
                                    .then(data => {
                                        $table_wl.bootstrapTable('refresh');
                                        resolve(data);
                                    })
                                    .catch(err => {
                                        console.error('Error deleting worklist item:', err);
                                        reject(err);
                                    });
                            } else {
                                // User canceled, resolve with no action
                                resolve({canceled: true});
                            }
                        }
                    });
                });
            },
            function(result) {
                // Success callback
                if (!result.canceled) {
                    WorklistState.UI.showFeedback('success', 'Item deleted successfully', 'feedbackContainer');
                }
                WorklistState.UI.unlockUI('.remove');
            },
            function(error) {
                // Error callback
                console.error('Delete operation failed:', error);
                WorklistState.UI.showFeedback('error', 'Error deleting item: ' + error, 'feedbackContainer');
                WorklistState.UI.unlockUI('.remove');
            }
        );
    },
    'click .stopwatch': function (e, value, row, index) {
        // Lock UI during processing
        WorklistState.UI.lockUI('.stopwatch', 'Processing...');
        
        let dataObj = { 'laterality': row.laterality, 'id': row.id };
        
        if ((row.counter > 0) && (row.status_flag != 'cancelled')) {
            if (row.counter == 1) {
                dataObj['status_flag'] = 'done';
                dataObj['counter'] = 0;
            } else if (row.counter > 1) {
                dataObj['counter'] = row.counter-1;
                dataObj['status_flag'] = 'processing';
            }
            
            const dataStr = JSON.stringify(dataObj);
            
            // Add to request queue instead of calling directly
            WorklistState.Queue.enqueue(
                function() {
                    // Track the item being processed
                    WorklistState.Manager.trackProcessingItem(row.id);
                    
                    return setWlItemStatus(dataStr);
                },
                function() {
                    // Success callback
                    $table_wl.bootstrapTable('refresh');
                    WorklistState.UI.showFeedback('success', 'Counter updated successfully', 'feedbackContainer');
                    WorklistState.UI.unlockUI('.stopwatch');
                },
                function(error) {
                    // Error callback
                    console.error('Counter update failed:', error);
                    WorklistState.UI.showFeedback('error', 'Error updating counter: ' + error, 'feedbackContainer');
                    WorklistState.UI.unlockUI('.stopwatch');
                }
            );
        } else {
            WorklistState.UI.unlockUI('.stopwatch');
        }
    },
    'click .done': function (e, value, row, index) {
        // Lock UI during processing
        WorklistState.UI.lockUI('.done', 'Processing...');
        
        let dataObj = { 'laterality': row.laterality, 'id': row.id };
        
        if (row.status_flag != 'done') {
            dataObj['status_flag'] = 'done';
            dataObj['counter'] = 0;
            
            const dataStr = JSON.stringify(dataObj);
            
            // Add to request queue instead of calling directly
            WorklistState.Queue.enqueue(
                function() {
                    // Track the item being processed
                    WorklistState.Manager.trackProcessingItem(row.id);
                    
                    return setWlItemStatus(dataStr);
                },
                function() {
                    // Success callback
                    $table_wl.bootstrapTable('refresh');
                    WorklistState.UI.showFeedback('success', 'Status updated to done', 'feedbackContainer');
                    WorklistState.UI.unlockUI('.done');
                },
                function(error) {
                    // Error callback
                    console.error('Status update failed:', error);
                    WorklistState.UI.showFeedback('error', 'Error updating status: ' + error, 'feedbackContainer');
                    WorklistState.UI.unlockUI('.done');
                }
            );
        } else {
            WorklistState.UI.unlockUI('.done');
        }
    },
    'click .modality_ctr': function (e, value, row, index) {
        // Lock UI during processing
        WorklistState.UI.lockUI('.modality_ctr', 'Processing...');
        
        let dataObj = { 'laterality': row.laterality, 'id': row.id };
        
        if (row.status_flag == 'requested') {
            dataObj['status_flag'] = 'processing';
            dataObj['counter'] = row.counter;
            
            const dataStr = JSON.stringify(dataObj);
            
            // Add to request queue instead of calling directly
            WorklistState.Queue.enqueue(
                function() {
                    // Track the item being processed
                    WorklistState.Manager.trackProcessingItem(row.id);
                    
                    return setWlItemStatus(dataStr);
                },
                function() {
                    // Success callback
                    $table_wl.bootstrapTable('refresh');
                    
                    // Navigate to the controller page after status is updated
                    let controller = modalityDict[row.modality];
                    let link = HOSTURL+'/'+APP_NAME+'/modalityCtr/'+controller+'/'+row.id;
                    window.location.href = link;
                },
                function(error) {
                    // Error callback
                    console.error('Status update failed:', error);
                    WorklistState.UI.showFeedback('error', 'Error updating status: ' + error, 'feedbackContainer');
                    WorklistState.UI.unlockUI('.modality_ctr');
                }
            );
        } else {
            // If already processing, just navigate
            let controller = modalityDict[row.modality];
            let link = HOSTURL+'/'+APP_NAME+'/modalityCtr/'+controller+'/'+row.id;
            window.location.href = link;
        }
    },
    'click .summary': function (e, value, row, index) {
        let link = HOSTURL+'/'+APP_NAME+'/billing/summary/'+row.id_auth_user;
        window.location.href = link;
    },
    'click .unlock': function (e, value, row, index) {
        // Lock UI during processing
        WorklistState.UI.lockUI('.unlock', 'Processing...');
        
        let dataObj = { 'laterality': row.laterality, 'id': row.id };
        
        if (row.status_flag == 'done') {
            dataObj['status_flag'] = 'processing';
            dataObj['counter'] = 1;
            
            const dataStr = JSON.stringify(dataObj);
            
            // Add to request queue instead of calling directly
            WorklistState.Queue.enqueue(
                function() {
                    // Track the item being processed
                    WorklistState.Manager.trackProcessingItem(row.id);
                    
                    return setWlItemStatus(dataStr);
                },
                function() {
                    // Success callback
                    $table_wl.bootstrapTable('refresh');
                    WorklistState.UI.showFeedback('success', 'Status updated to processing', 'feedbackContainer');
                    WorklistState.UI.unlockUI('.unlock');
                },
                function(error) {
                    // Error callback
                    console.error('Status update failed:', error);
                    WorklistState.UI.showFeedback('error', 'Error updating status: ' + error, 'feedbackContainer');
                    WorklistState.UI.unlockUI('.unlock');
                }
            );
        } else {
            WorklistState.UI.unlockUI('.unlock');
        }
    }
};

function rowStyle_wl(row,value) {
    let statusColor = {'requested':'#ffcc99' , 'processing':'papayawhip', 'done':'#98ff98', 'cancelled':'#ff9999', 'doctorDone': '#00FF00' };
    let bg;
    if (mainModalityArr.includes(row.modality)  && row.status_flag =='done') {
        bg = statusColor['doctorDone'];
    } else {
        bg = statusColor[row.status_flag];
    };
    return { 
                css: { 'background-color': bg }
            };
};

function detailFormatter_wl(index, row) {
    let lastmodif = Date.parse(row.created_on);
    var rightnow = new Date();
    let elapse = Math.round((rightnow-lastmodif)/1000)-timeOffset;
    let waiting =secondsToHMS(elapse);
    timer_id.push('#waiting_'+row.id);
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Created on: </span>'+ row.created_on+'<span class="badge rounded-pill bg-light text-dark">'+waiting+'</span></p>');
    html.push('<p class=""><span class="fw-bold">Created by: </span>'+ row.created_by+'</p>');
    html.push('<p class=""><span class="fw-bold">ID: </span>'+ row.id);
    html.push('<p class=""><span class="fw-bold">Sending: </span>'+ row.sending_facility+'</p>');
    html.push('<p class=""><span class="fw-bold">Receiving: </span>'+ row.receiving_facility+'</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Patient: </span>'+ row.patient +'</p>');
    html.push('<p class=""><span class="fw-bold">Provider: </span>'+ row.provider +'</p>');
    html.push('<p class=""><span class="fw-bold">Procedure: </span>'+ row.procedure +'</p>');
    html.push('<p class=""><span class="fw-bold">Modality: </span>'+ row.modality +'</p>');
    html.push('<p class=""><span class="fw-bold">Laterality: </span>'+ row.laterality +'</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Timeslot: </span>'+ row.requested_time +'</p>');
    html.push('<p class=""><span class="fw-bold">Status: </span>'+ row.status_flag +'</p>');
    html.push('<p class=""><span class="fw-bold">Counter: </span>'+ row.counter +'</p>');
    html.push('<p class=""><span class="fw-bold">Warning: </span>'+ row.counter +'</p>');
    html.push('</div>');
    html.push('</div></div>');
    return html.join('');
};

function counterFormatter_wl(value,row){ 
    let html = [];
    let lastmodif = Date.parse(row.modified_on);
    var rightnow = new Date();
    // console.log('Rightnow:'+row.id,rightnow);
    // console.log('Lastmodif:'+row.id,lastmodif);
    let elapse = Math.round((rightnow-lastmodif)/1000)-timeOffset;
    // console.log('elapse:'+row.id,elapse);
    let elapsestyle = "bg-light text-dark";
    if (elapse >= (30*60) && elapse <= (45*60)) {
        elapsestyle ="bg-warning text-dark";
    } else if (elapse > (45*60)) {
        elapsestyle ="bg-danger";
    };
    timer_id.push('#timer_'+row.id);
    // console.log('row.status=',row.status_flag);
    html.push('<div class="d-flex justify-content-between"><span class="badge rounded-pill bg-primary mx-1">'+row.counter+'</span>');
    // if over 1 day, elapse counter is not shown
    if (elapse < (24*60*60) && row.status_flag != 'done') {
        html.push('<span id="timer_'+row.id+'" class="badge rounded-pill '+elapsestyle+' mx-1">'+elapse+'</span>');
    };
    html.push('</div>');
    return html.join('');
};

function rowAttributes_wl(row,index) { // set tooltip values
    row.created_by == '' ? createdby = 'created by <strong>unknown</strong>' : createdby = 'created by <strong>'+row.created_by+'</strong>';
    row.created_on == '' ? createdon = ' on <strong>unknown date</strong>' : createdon = ' on <strong>'+row.created_on+'</strong>';
    row.modified_by == '' ? modifiedby = ' modified by <strong>unknown</strong>' : modifiedby = ' modified by <strong>'+row.modified_by+'</strong>';
    row.modified_on == '' ? modifiedon = ' on <strong>unknown date</strong>' : modifiedon = ' on <strong>'+row.modified_on+'</strong>';
    let html = ['<div class="container"><div class="row">'];
    html.push(['<div class="col">'+createdby+createdon+'</div>']);
    html.push(['<div class="col">'+modifiedby+modifiedon+'</div>']);
    html.push('</div></div>');
    html.join('');
    return { 
        "data-bs-html": html,
        "data-bs-toggle": "tooltip"
    };
};

// Add a helper function to properly set worklist item status
function setWlItemStatus(dataStr) {
    // Parse the data to extract the ID
    const data = JSON.parse(dataStr);
    const id = data.id;
    
    // Remove the ID from the data object since it will be in the URL
    delete data.id;
    
    // Convert back to JSON string without the ID
    const cleanDataStr = JSON.stringify(data);
    
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "PUT",
            url: HOSTURL+"/"+APP_NAME+"/api/worklist/" + id,
            dataType: "json",
            data: cleanDataStr,
            contentType: "application/json",
            success: function (data) {
                if (data.status == 'error') {
                    displayToast('error', 'PUT error', 'Cannot update worklist status', '6000');
                    reject('PUT error: Cannot update worklist status');
                } else {
                    displayToast('info', 'PUT success', 'worklist status updated', '3000');
                    resolve(data);
                }
            },
            error: function (er) {
                console.log(er);
                reject(er);
            }
        });
    });
}