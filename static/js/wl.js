
// useful functions 

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
};

// Convert seconds to hh:mm:ss
// Allow for -ve time values
function secondsToHMS(secs) {
    function z(n){return (n<10?'0':'') + n;}
    var sign = secs < 0? '-':'';
    secs = Math.abs(secs);
    return sign + z(secs/3600 |0) + ':' + z((secs%3600) / 60 |0) + ':' + z(secs%60);
};

// Convert H:M:S to seconds
// Seconds are optional (i.e. n:n is treated as h:s)
function hmsToSeconds(s) {
    var b = s.split(':');
    return b[0]*3600 + b[1]*60 + (+b[2] || 0);
};

// convert in TZ time eg 
function convertTZ(date, tzString='Europe/Brussels') {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

// set modality options
function setModalityOptions(exam2doId){
    let modalityOptions = getModalityOptions(exam2doId);
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

// crud(table,id,req): table = 'table' req = 'POST' without id,  'PUT' 'DELETE' with id, data in string
function crud(table,id='0',req='POST',data) {
    console.log(data);
    var API_URL = ((req == 'POST') || (req == 'PUT')? HOSTURL+"/myapp/api/"+table : HOSTURL+"/myapp/api/"+table+"/"+ id );
    var mode = ( req == 'POST' ? ' added' : (req == 'PUT' ? ' edited': ' deleted'));
    $.ajax({
        url: API_URL,
        data: data,
        contentType: 'application/json',
        dataType: 'json',
        method: req
        })
        .done(function(data) {
            console.log(data);
            status = data.status;
            message = data.message;
            errors = "";
            if (data.status == "error") {
                for (i in data.errors) {
                    errors += data.errors[i]+'</br>';
                };
                text = errors;
                displayToast('error',data.message,errors,'6000');
            };
            if (data.status == "success") {
                text='User id: '+(req == 'DELETE'? id : data.id)+mode;
                displayToast('success', table+' '+mode,text,'6000');
            };
        });
}

// get json data for modality options
function getModalityOptions(exam2doId) {
    return Promise.resolve(
        $.ajax({
            type: "GET",
            url: HOSTURL+"/myapp/api/modality?id_modality.exam2do_family.id_exam2do.eq="+exam2doId,
            dataType: "json",
            success: function (data) {
                // console.log(data); 
                if (data.status == 'error' || data.count == 0) {
                    displayToast('error', 'GET error', 'Cannot retrieve modality options', '6000');
                } else {                    
                    displayToast('info', 'GET success', 'modality options for ' + exam2doId, '6000');
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
    let choice = $('select#exam2doSelect option:checked').val();
    setModalityOptions(choice);
}

// init worklist form

// change modality options on exam2do select
$('#exam2doSelect').change(function(){
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

var wlItemsJson = [];
var wlItemsHtml = [];
var wlItemsCounter = 0;
var temp;
// add new item in worklist format
// TODO: remove status_flag -> only needed when modification
$('#btnWlItemAdd').click(function() {
    let formDataStr = $('#newWlItemForm').serializeJSON();
    let formDataObj = JSON.parse(formDataStr);
    delete formDataObj['modality_destPut']; // used for PUT request
    delete formDataObj['idWl']; // no Id when new Item
    let formDataObjMultiple = [];
    wlItemsJson.push(formDataObj);
    // console.log('wlItemsJson',wlItemsJson); // not used
    // console.log('formDataObj before',formDataObj);
    if (formDataObj['modality_dest'] == 13 ) {
        console.log('Multiple!');
        // console.log('formDataObj in if',formDataObj);
        getCombo(formDataObj['exam2do'])
            .then(function(data) {
                let arr = [];
                console.log('dataitem:',data);
                for (let i in data.items) {
                    console.log('multiple modality item:',data.items[i]['id_modality.id']);
                    arr[data.items[i]['id_modality.modality_name']]=data.items[i]['id_modality.id'];
                };
                console.log('arr=',arr);
                let o;
                for (let a in arr) {
                    o = Object.assign({},formDataObj); // clone formDataObj
                    // console.log('arr=',arr[a]);
                    o['modality_dest']=arr[a];
                    o['modality_name']= a; // only to get modality name
                    if (a == 'MD') {
                        o['provider']=o['senior'];
                    }
                    formDataObjMultiple.push(o);
                    // console.log('Object:',o);
                };
                for (let f in formDataObjMultiple) {
                    let modalityName = formDataObjMultiple[f]['modality_name'];
                    delete formDataObjMultiple[f]['modality_name']; // only to get modality name
                    delete formDataObjMultiple[f]['id']; // only for put request
                    let formDataObjMultipleStr = JSON.stringify(formDataObjMultiple[f]);
                    console.log('formDataObjMultiple['+f+']', formDataObjMultipleStr);
                    appendWlItem(JSON.stringify(formDataObjMultiple[f]), wlItemsCounter, modalityName);
                };
            }); // end getCombo
        console.log('formDataObjMultiple:',formDataObjMultiple);
    } else {
        delete formDataObj['modality_name']; // only to get modality name
        delete formDataObj['id']; // only for put request
        formDataStr = JSON.stringify(formDataObj);
        appendWlItem(formDataStr, wlItemsCounter);
    }
});

function getCombo(id_exam2do) {
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: HOSTURL+"/myapp/api/combo?@lookup=id_exam2do!:id_exam2do[exam_name],id_modality!:id_modality&@count=true&id_exam2do="+id_exam2do,
            success: function(data) {
                if (data.status != 'error' || data.count) {
                    displayToast('success', 'GET combo exams', 'GET'+data.items[0]['id_exam2do.exam_name']);
                } else {
                    displayToast('error', 'GET error', 'Cannot retrieve combo exams');
                }
            }, // success
            error: function (er) {
                console.log(er);
            }
        })
    ); // promise return data
};

// TODO: put in useful functions
function getUuid() {
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: HOSTURL+"/myapp/api/uuid",
            success: function(data) {
                if (data.unique_id != undefined) {
                    displayToast('success', 'GET uuid', 'GET uuid:'+data['unique_id'],6000);
                } else {
                    displayToast('error', 'GET error', 'Cannot retrieve uuid');
                }
            }, // success
            error: function (er) {
                console.log(er);
            }
        })
    ); // promise return data
};


// arr = field content, cnt = row counter, dataStr = json data string type
// create wlItemsHtml for display
// create wlItemsHtml for display
function appendWlItem(dataStr,cnt, modalityName) {
    console.log('wlItems:', wlItemsJson);
    console.log('modality Name:', modalityName );
    wlItemsHtml['From'] = $('#sendingFacilitySelect :selected').text();
    wlItemsHtml['To'] = $('#receivingFacilitySelect :selected').text();
    wlItemsHtml['Procedure'] = $('#exam2doSelect :selected').text();
    wlItemsHtml['Provider'] = $('#providerSelect :selected').text();
    wlItemsHtml['Senior'] = $('#seniorSelect :selected').text();
    wlItemsHtml['Timeslot'] = $('#requested_time').val();
    if (modalityName != undefined) {
        wlItemsHtml['Modality'] = modalityName;
    } else {
        wlItemsHtml['Modality'] = $('#modality_destSelect :selected').text();
    }
    // wlItemsHtml['side'] = $('input[name="laterality"]:checked').val();
    wlItemsHtml['Status'] = $('input[name="status_flag"]:checked').val();
    wlItemsHtml['Counter'] = $('input[name="counter"]').val();
    wlItemsHtml['warning'] = $('input[name="warning"]').val();
    console.log('wlItemsHtml', wlItemsHtml);
    let head = '<tr>';
    let html = '<tr id="wlItem'+ cnt + '">';
    for (item in wlItemsHtml) {
        head += '<th scope="col">'+ item + '</th>'
        html += '<td>' + wlItemsHtml[item] + '</td>';
    };
    html +='<td class="list-group-item"><button type="button" class="btn btn-danger btn-sm" onclick="delWlItemModal(\''+ cnt +'\');" data-index='+cnt+'><i class="far fa-trash-alt"></i></button></td>'
    html += '</tr>';
    head += '<tr>';
    $('#tbodyItems').append(html);
    $('#theadItems').html(head);
    // set data-json attribute with row formDataStr
    $('#wlItem'+cnt).data('json',dataStr);
    wlItemsCounter += 1;
    console.log('wlItemsCounter',wlItemsCounter);
}

function delWlItemModal(itemId){
    $('#wlItem'+itemId).remove();
}

// show modal from wl button in patient table
function addToWorklist(userId) {
    // init form
    resetWlForm();
    // wlItemsCounter = 0;
    // show all input
    let show = ['wlItemAddDiv', 'wlItemsDiv']
    for (i in show) {
        hideDiv('#'+show[i],'visually-hidden','remove');
    };
    $('#tbodyItems').html('');
    $('#idPatientWl').val(userId);
    // open modal
    $('#newWlItemModal').modal('show');
}

// hide or remove class ; e = DOM id element c= classe req = remove or add
function hideDiv(e,c,req) {
    req == 'add' ? $(e).addClass(c) : $(e).removeClass(c);
}

// get item details for put request
function getWlItemDetails(wl_id) {
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: HOSTURL+"/myapp/api/worklist/"+wl_id+"?@lookup=id_auth_user!:id_auth_user[id,first_name,last_name],provider!:provider[id,first_name,last_name],exam2do!:exam2do,modality!:modality_dest[id,modality_name],receiving_facility!:receiving_facility[id,facility_name],sending_facility!:sending_facility[id,facility_name],senior!:senior[id,first_name,last_name]",
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

// set modal for PUT request wl
function putWlModal(wlId){
    // init form
    resetWlForm();
    wlItemsCounter = 0;
    // TODO: set inputs
    // hide useless input
    let hide = ['wlItemAddDiv', 'wlItemsDiv']
    for (i in hide) {
        hideDiv('#'+hide[i],'visually-hidden','add');
    };
    $('#newWlItemModal h5.modal-title').html('Edit worklist item #'+wlId);
    hideDiv('#modality_destDiv', 'visually-hidden','add');
    hideDiv('#modality_destPutDiv', 'visually-hidden','remove');
    getWlItemDetails(wlId)
        .then(function (data) {
            let field=data.items[0];
            document.getElementById("newWlItemForm").reset();
            document.getElementById("sendingFacilitySelect").value= field['sending_facility.id'];
            document.getElementById("receivingFacilitySelect").value= field['receiving_facility.id'];
            document.getElementById("exam2doSelect").value= field['exam2do.id'];
            document.getElementById("providerSelect").value= field['provider.id'];
            document.getElementById("seniorSelect").value= field['senior.id'];
            document.getElementById("requested_time").value= field['requested_time'];
            document.getElementById("modality_destSelectPut").value= field['modality.id'];
            $("[name=laterality]").val([field.laterality]);
            $("[name=status_flag]").val([field.status_flag]);
            $("[name=counter]").val([field.counter]);
            document.getElementById("warning").value= field['warning'];
            document.getElementById("idPatientWl").value= field['id_auth_user.id'];
            document.getElementById("idWl").value= wlId;
            document.getElementById("methodWlItemSubmit").value= 'PUT';
        });
    $('#newWlItemModal').modal('show');
}

// submit each wl items in wlItemsJson
$('#newWlItemForm').submit(function(e) {
    e.preventDefault();
    let req = $('#methodWlItemSubmit').val();
    if (req =='POST') {
        for (let i = 0; i<=wlItemsCounter+1; i++) {
            let el = "#wlItem"+parseInt(i);
            if ($(el).length != 0) {
                let itemDataObj = JSON.parse($(el).data().json);
                delete itemDataObj['methodWlItemSubmit'];
                getUuid()
                    .then(function(uuid) {
                        itemDataObj["message_unique_id"] = uuid.unique_id;
                        console.log('messageuuid:',itemDataObj["message_unique_id"]);
                        let itemDataStr = JSON.stringify(itemDataObj);
                        crud('worklist','0', req, itemDataStr);
                        $(el).remove(); // remove wl item element node when posted
                    })
                    .then(function(){
                        $table_wl.bootstrapTable('refresh');
                    });
            };
        }; // end for loop
    } else if (req=='PUT') {
        let itemDataPutStr = $('#newWlItemForm').serializeJSON();
        let itemDataPutObj = JSON.parse(itemDataPutStr);
        delete itemDataPutObj['methodWlItemSubmit'];
        delete itemDataPutObj['modality_dest'];
        itemDataPutObj['modality_dest']=itemDataPutObj['modality_destPut'];
        delete itemDataPutObj['modality_destPut'];
        itemDataPutStr = JSON.stringify(itemDataPutObj);
        console.log('PUT data:',itemDataPutObj);
        crud('worklist','0','PUT',itemDataPutStr);
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
                crud('worklist',id,'DELETE');
                // console.log('Row.id deleted:'+id);
                $table_wl.bootstrapTable('refresh');
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};

// set wlItem status: done processing and counter adjustment
// id is in the dataStr
function setWlItemStatus (dataStr) {
    console.log('dataStrPut:',dataStr);
    crud('worklist','0','PUT', dataStr);
    $table_wl.bootstrapTable('refresh');    
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