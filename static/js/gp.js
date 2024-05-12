// refresh tables
// refreshTables(tablesArr);

// remove class top-fixed from topnav
document.getElementById('topNavbar').classList.remove('fixed-top');

// frequency autocomplete
$('#mxModal input[name=frequency]').autoComplete({
    bootstrapVersion: '4',
    minLength: '1',
    resolverSettings: {
        url: API_AUTODICT+'frequency',
        queryKey: 'keyoption.contains'
    },
    events: {
        searchPost: function(res) {
            return res.items;
        }   
    },
    formatResult: function(item) {
        return {
            value: item.id,
            text: item.keyoption
        }
    }
});

// medication autocomplete
$('#mxModal input[name=medication]').autoComplete({
    bootstrapVersion: '4',
    minLength: '1',
    resolverSettings: {
        url: API_MEDICATIONS,
        queryKey: 'name.contains'
    },
    events: {
        searchPost: function(res) {
            if (res.count == 0) {
                $('#mxModal input[name=id_medic_ref]').val('');
            }
            return res.items;
        }   
    },
    formatResult: function(item) {
        // console.log(item.id);
        $('#mxModal input[name=id_medic_ref]').val(item.id);
        $('#mxModal input[name=delivery]').val([item.delivery]);
        return {
            text: item.name
        }
    }
});

// agent autocomplete
$('#axModal input[name=agent]').autoComplete({
    bootstrapVersion: '4',
    minLength: '1',
    resolverSettings: {
        url: API_AGENTS,
        queryKey: 'name.contains'
    },
    events: {
        searchPost: function(res) {
            if (res.count == 0) {
                $('#axModal input[name=id_agent]').val('');
            }
            return res.items;
        }   
    },
    formatResult: function(item) {
        $('#axModal input[name=id_agent]').val(item.id);
        return {
            text: item.name
        }
    }
});

// disease title autocomplete
$('#mHxModal input[name=title]').autoComplete({
    bootstrapVersion: '4',
    minLength: '1',
    resolverSettings: {
        url: API_DISEASES,
        queryKey: 'title.contains'
    },
    events: {
        searchPost: function(res) {
            if (res.count == 0) {
                $('#mHxModal input[name=id_disease_ref]').val('');
                console.log('Disease not in dict');
            }
            return res.items;
        }   
    },
    formatResult: function(item) {
        $('#mHxModal input[name=id_disease_ref]').val(item.id);
        return {
            text: item.title
        }
    }
});

// init modal according to the button that called it, before it is shown
// set mHxModal parameters by default: category
// diagnosis associated to a worklist item have a WlId, NOT the others
var mHxmodal = document.getElementById('mHxModal')
mHxmodal.addEventListener('show.bs.modal', function (event) {
    // console.log('mHx modal listener triggered');
    // Button that triggered the modal
    let button = event.relatedTarget;
    if (button != undefined) {
        document.getElementById('mHxFormModal').reset();
        // Extract info from data-*-flag attributes
        let category = button.getAttribute('data-category-flag');
        let mhxFlag = button.getAttribute('data-mhx-flag');
        if (mhxFlag == 'code') {
            // set wlId, onset today
            category = 'medical';
            $('#mHxModal input[name=id_worklist]').val(wlId);
            let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0,10);
            $('#mHxModal input[name=onset]').val(today);
        } else {
            $('#mHxModal input[name=id_worklist]').val('');
        }
        $('#mHxModal .modal-title').html('New '+category+' history');
        $('#mHxModal input[name=category]').val([category]);
        $('#mHxModal input[name=site]').val(['systemic']);
    };
});

// set mxModal parameters by default:
// medications associated to a worklist item have a WlId, NOT the others
var mxModal = document.getElementById('mxModal')
mxModal.addEventListener('show.bs.modal', function (event) {
    // console.log('mx modal listener triggered');
    // Button that triggered the modal
    let button = event.relatedTarget;
    if (button != undefined) {
        // reset the form on opening
        document.getElementById('mxFormModal').reset();
        // Extract info from data-*-flag attributes
        let mxFlag = button.getAttribute('data-mx-flag');
        if (mxFlag == 'mxWl') {
            // console.log('data flag:','mxWl');
            // set wlId, onset today
            $('#mxModal input[name=id_worklist]').val(wlId);
            let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0,10);
            $('#mxModal input[name=onset]').val(today);
            // set end of prescription 3 months later
            let end = new Date().addHours(2160).toJSON().slice(0,10);
            $('#mxModal input[name=ended]').val(end);
            $('#mxModal input[name=prescribed]').val('False');
        } else {
            // console.log('data flag:','NOT a mxWl');
            $('#mxModal input[name=id_worklist]').val('');
        };
        $('#mxModal input[name=delivery]').val(['PO']);
    };
});

// submit mxFormModal (medications)
$('#mxFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodMxModalSubmit'];
    let id = dataObj.id;
    delete dataObj.id;
    dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=patientObj['id']:{};
    dataObj['medication']=capitalize(dataObj['medication']);
    delete dataObj['methodMxModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    // console.log("dataForm",dataObj);
    if (dataObj['id_medic_ref'] == "") { // if no med ref, add new medication to the medication db
        let newMedicObj = {};
        newMedicObj['name']=dataObj['medication'];
        newMedicObj['delivery']=dataObj['delivery'];
        newMedicStr = JSON.stringify(newMedicObj);
        crudp('medic_ref','0','POST',newMedicStr);
    };
    crudp('mx',id,req,dataStr).then(function () {
        $mx_tbl.bootstrapTable('refresh');
        $mxWl_tbl.bootstrapTable('refresh');
    });
    document.getElementById('mxFormModal').reset();
    $('#mxModal').modal('hide');
});

$('#axFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodAxModalSubmit'];
    let id = dataObj.id;
    delete dataObj.id;
    dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=patientObj['id']:{};
    dataObj['agent']=capitalize(dataObj['agent']);
    delete dataObj['methodAxModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    // console.log("dataForm",dataObj);
    if (dataObj['id_agent'] == "") { // if no agent ref, add new agent to the agent db
        let newMedicObj = {};
        newMedicObj['name']=dataObj['agent'];
        newMedicStr = JSON.stringify(newMedicObj);
        crudp('agent','0','POST',newMedicStr);
    };    
    crudp('allergy',id,req,dataStr).then( data => $ax_tbl.bootstrapTable('refresh'));
    document.getElementById('axFormModal').reset();
    $('#axModal').modal('hide'); 
});

$('#mHxFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodmHxModalSubmit'];
    let id = dataObj.id;
    delete dataObj.id;
    dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=patientObj['id']:{};
    dataObj['title']=capitalize(dataObj['title']);
    delete dataObj['methodmHxModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    // console.log("dataForm",dataObj);
    if (dataObj['id_disease_ref'] == "") { // if no disease ref, add new disease to the disease db
        let newMedicObj = {};
        newMedicObj['title']=dataObj['title'];
        newMedicObj['category']=dataObj['category'];
        newMedicStr = JSON.stringify(newMedicObj);
        // console.log("newMedicObj",newMedicObj);
        crudp('disease_ref','0','POST',newMedicStr);
    };    
    crudp('phistory',id,req,dataStr).then( function() {
        $mHx_tbl.bootstrapTable('refresh'); 
        $sHx_tbl.bootstrapTable('refresh');
        $oHx_tbl.bootstrapTable('refresh');
        $coding.bootstrapTable('refresh');
    });
    document.getElementById('mHxFormModal').reset();
    $('#mHxModal').modal('hide'); 
});

function delItem (id,table,desc) {
    bootbox.confirm({
        message: "Are you sure you want to delete this "+desc+" ?",
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
                crudp(table,id,'DELETE').then( data => refreshTables(tablesArr));
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};

// set intake counter
function setCounter (id_count, count_class,step, min, max) {
    $(id_count+' .btn.counter_down_'+count_class).click(function() {
        value = parseFloat($(id_count+' input.counter_'+count_class).val());
        if (value >= (min+step)) {
        $(id_count+' input.counter_'+count_class).val(value-step);
        } else {};
    });
    
    $(id_count+' .btn.counter_up_'+count_class).click(function() {
        value = parseFloat($(id_count+' input.counter_'+count_class).val());
        if (value <= (max-step)) {
        $(id_count+' input.counter_'+count_class).val(value+step);
        } else {};
    });
};

setCounter('#mxFormModal', 'intake', 0.25,0.25,100);

// set wlItem status: done processing and counter adjustment
// id is removed from the dataStr
function setWlItemStatus (dataStr) {
    let dataJson = JSON.parse(dataStr);
    let id = dataJson.id;
    delete dataJson.id;
    console.log('dataStr: ', dataJson,' Type:', typeof dataJson);
    crudp('worklist', id ,'PUT', JSON.stringify(dataJson))
        .then( data => $table_wl.bootstrapTable('refresh'));    
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

// set timers in wl when completely rendered
// Fires after the table body is rendered and available in the DOM, the parameters contain data
$('#table-wl').on('post-body.bs.table', function () {
    set_timers(timer_id);
});

// update cache
function updateCache(cacheObj) {
    let domId = "#offcanvasCache .rxTd";
    let html = [], typeContent='', rxContent='';
    $.each(cacheObj, function(i){
        // console.log(cacheObj[i]);
        // content
        // if true: rxContent no add, write monofocal or nothing
        if ((cacheObj[i]['rx_origin']=='autorx') || (cacheObj[i]['rx_origin']=='dil') || (cacheObj[i]['rx_origin']=='cyclo') || (cacheObj[i]['glass_type']=='monofocal')) {
            rxContent = cacheObj[i]['rx_far'];
            cacheObj[i]['glass_type']=='monofocal'? typeContent='<span class="badge bg-secondary rounded-pill mx-1">'+capitalize(cacheObj[i]['glass_type'])+'</span>': typeContent='-';
        } else {
            typeContent = '<span class="badge bg-secondary rounded-pill mx-1">'+capitalize(cacheObj[i]['glass_type'])+'</span>';
            rxContent = cacheObj[i]['rx_far'] + ' Add+'+cacheObj[i]['add'];
        };
        html.push('<tr>'); // row
        html.push('<td>'); // 1st col origin
        html.push(cacheObj[i]['rx_origin']);
        html.push('</td>');
        html.push('<td>'); // 2nd col glass type
        html.push(typeContent);
        html.push('</td>');
        html.push('<th scope="row">'); // 3rd col rx
        html.push(rxContent);
        html.push('</td>');
        html.push('</tr>'); // end row
    });
    $(domId).html(html.join(''));
};
// clear cache button
$('#clearCache').click(function(){
    $('#offcanvasCache .rxTd').html('');
    rxObj = [];
});

// 3 functions for each fields:
// 1) Submit: check for PUT, capitalize, crud
// 2) on focus: check in DB if field has changed
// 3) on change: if field value has changed then submit

// promise to get item wl fields value
function getWlItemData(table,wlId,lat='',options='') {
    let WURL, lookup='mod!:modified_by[id,first_name,last_name]', filters = options.split('@lookup=');
    // TODO: what if filter is undefined ?
    if ( filters[1] != undefined ) {
        lookup += ','+filters[1].split('&')[0]
        filters[1].split('&')[1] != undefined ? options = filters[0]+ filters[1].split('&')[1] : options = filters[0];
    }
    console.log('lookup',lookup);
    console.log('lookup',options);
    if (lat == '') {
        WURL = HOSTURL+"/"+APP_NAME+"/api/"+table+"?@lookup="+lookup+"&id_worklist.eq="+wlId+"&"+options;
    } else {
        WURL = HOSTURL+"/"+APP_NAME+"/api/"+table+"?@lookup=mod!:modified_by[id,first_name,last_name]&id_worklist.eq="+wlId+'&laterality.eq='+lat+"&"+options;
    }
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: WURL,
            success: function(data) {
                if (data.status != 'error' && parseInt(data.count) > 0) {
                    displayToast('success', 'Item exists', 'Count is '+data.count,3000);
                } else if (data.count == 0) {
                    displayToast('warning', 'Item not found', 'Items does not exist.',3000);
                } else {
                    displayToast('error', 'GET error', 'Request to check failed.');
                }
            }, // success
            error: function (er) {
                console.log(er);
            }
        })
    )
};


// TODO: check if field is TEXTAREA or INPUT

let inspectionFieldsArr = ['skin','head','hands',
    'chest','abdomen', 'legs','veins', 'genitals','others'],
    auscultationFieldsArr = ['lungs','heart',
    'abdomen','neck', 'vascular','others'],
    palpationFieldsArr = ['chest','abdomen',
        'ganglions','articulations','others'],
    percussionFieldsArr = ['chest','abdomen','others'],
    neuroFieldsArr = ['head','motor',
        'sensorial','reflexes','others'];

function setSubmit(domId,table, fieldsArr,lat) {
    $(domId).submit(function(e){
        e.preventDefault();
        let dataStr = $(this).serializeJSON();
        let dataObj = JSON.parse(dataStr);
        let req ;
        getWlItemData(table,wlId,lat)
            .then(function(data){
                let id = dataObj['id'];
                delete dataObj['id'];
                if (data.count != 0) {
                    req = 'PUT';
                } else {
                    req = 'POST';
                };
                // console.log('setSubmit request:',req, 'data.count:',data.count);
                dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=patientObj['id']:{};
                dataObj['id_worklist'] == "" ? dataObj['id_worklist']=wlId:{};
                // capitalize fields
                for (field of fieldsArr) {
                    if (dataObj[field] != "") {
                        // console.log('capitalize:', field ,dataObj[field]);
                        dataObj[field]=capitalize(dataObj[field]); // capitalize text objects
                        $(domId+' input[name='+field+']').val(dataObj[field]); // update fields
                    } else {};
                };
                dataStr= JSON.stringify(dataObj);
                // console.log("dataForm from setSubmit",dataObj);
                crudp(table,id,req,dataStr);
                $(domId+'Submit').removeClass('btn-danger').addClass('btn-secondary');
                getWlItemData(table,wlId,lat)
                    .then(function(data) {
                        if (data.count != 0) {
                            $(domId+' input[name=id]').val(data.items[0].id);
                        } else {};
                    })
            });
    });        
}

// Examples:
// setSubmit('#antRightForm','ant_biom',antFieldsArr,'right');
// setSubmit('#antLeftForm','ant_biom', antFieldsArr,'left');
// setSubmit('#postRightForm','post_biom', postFieldsArr,'right');
// setSubmit('#postLeftForm','post_biom', postFieldsArr,'left');

setSubmit('#inspectionForm','inspection',inspectionFieldsArr);
setSubmit('#auscultationForm','auscultation', auscultationFieldsArr);
setSubmit('#palpationForm','palpation', palpationFieldsArr);
setSubmit('#percussionForm','percussion', percussionFieldsArr);
setSubmit('#neuroForm','neuro', neuroFieldsArr);


function updateHandlersFields(table,domId,fieldsArr,lat='') {
    // set events handlers to update fields
    for (const field of fieldsArr) {
        $(domId+' textarea[name='+field+']').focus(function(){
            getWlItemData(table,wlId,lat)
                .then(function(data){
                    //console.log("from update fields "+field+" :",data, data.count);
                    if (data.count != 0) {
                        let item=data.items[0];
                        $(domId+' input[name=id]').val(item['id']);
                        // console.log('input value: ', domId+' input[name='+field+']');
                        if ($(domId+' input[name='+field+']').val()!=item[field] && item[field] != 'None' ) {
                            // console.log(capitalize(field)+' changed');
                            // inform if field has changed
                            let modder=item['mod.first_name']+' '+item['mod.last_name'] +' on '+item['modified_on'] ;
                            displayToast('warning', capitalize(field)+' was changed', capitalize(field)+' was changed by '+modder,6000);
                            // update input field
                            $(domId+' input[name='+field+']').val(item[field]);
                        } else {};
                    } else {};
                });
        });        
    };
}

// Examples
// updateHandlersFields('ant_biom','#antRightForm', antFieldsArr,'right');
// updateHandlersFields('ant_biom','#antLeftForm', antFieldsArr,'left');
// updateHandlersFields('post_biom','#postRightForm', postFieldsArr,'right');
// updateHandlersFields('post_biom','#postLeftForm', postFieldsArr,'left');

updateHandlersFields('inspection','#inspectionForm', inspectionFieldsArr);
updateHandlersFields('auscultation','#auscultationForm', auscultationFieldsArr);
updateHandlersFields('palpation','#palpationForm', palpationFieldsArr);
updateHandlersFields('percussion','#percussionForm', percussionFieldsArr);
updateHandlersFields('neuro','#neuroForm', neuroFieldsArr);


// trigger change at each value change
function monitorValueChange(domId,fieldsArr) {
    for (field of fieldsArr) {
        $(domId+' textarea[name='+field+']').change(function() {
            $(domId+'FormSubmit').removeClass('btn-secondary').addClass('btn-danger');
            $(domId).submit();
        })
    };
};

monitorValueChange('#inspectionForm', inspectionFieldsArr);
monitorValueChange('#auscultationForm', auscultationFieldsArr);
monitorValueChange('#palpationForm', palpationFieldsArr);
monitorValueChange('#percussionForm', percussionFieldsArr);
monitorValueChange('#neuroForm', neuroFieldsArr);

// TODO: to implement
// key is domId, value is table
oneFieldObj = {
        '#cHxForm': 'current_hx','#motForm':'motility', '#phoForm':'phoria', '#pupForm':'pupils',
        '#soapForm':'soap',
        '#ccxForm':'ccx', '#ccxRForm':'ccx','#ccxLForm':'ccx','#folForm':'followup','#bilForm':'billing' };

function setOneSubmit(domId,table,lat) {
    $(domId).submit(function(e){
        e.preventDefault();
        let dataStr = $(this).serializeJSON();
        let dataObj = JSON.parse(dataStr);
        let req ;
        getWlItemData(table,wlId,lat)
            .then(function(data){
                let id = dataObj.id;
                if (data.count !=0) {
                    req = 'PUT';
                } else {
                    req = 'POST';
                };
                delete dataObj['id'];
                dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=patientObj['id']:{};
                dataObj['id_worklist'] == "" ? dataObj['id_worklist']=wlId:{};
                dataObj['description']=capitalize(dataObj['description']);
                dataStr= JSON.stringify(dataObj);
                // console.log("dataForm",dataObj);
                crudp(table,id,req,dataStr);
                $(domId+'Submit').removeClass('btn-danger').addClass('btn-secondary');            
            })
    });    
};
        
// parameter: #formId , tableName, laterality
setOneSubmit('#cHxForm','current_hx');
setOneSubmit('#soapForm','soap');
setOneSubmit('#motForm','motility');
setOneSubmit('#phoForm','phoria');
setOneSubmit('#pupForm','pupils');
setOneSubmit('#ccxForm','ccx','na');
setOneSubmit('#ccxRForm','ccx','right');
setOneSubmit('#ccxLForm','ccx','left');
setOneSubmit('#folForm','followup');
setOneSubmit('#bilForm','billing');

// using focusout to update will trigger too much ajax call
// button in red if field updated
// trigger change at each value change

function updateHandlersOneField(domId) {
    $(domId+' textarea').change(function(){
        $(domId+'Submit').removeClass('btn-secondary').addClass('btn-danger');
        $(domId).submit();
    });
};

updateHandlersOneField('#cHxForm');
updateHandlersOneField('#soapForm');
updateHandlersOneField('#motForm');
updateHandlersOneField('#phoForm');
updateHandlersOneField('#pupForm');
updateHandlersOneField('#ccxForm');
updateHandlersOneField('#ccxRForm');
updateHandlersOneField('#ccxLForm');
updateHandlersOneField('#folForm');
updateHandlersOneField('#bilForm');

// update field on focus and highlight if changed
function monitorValueChangeOneField(domId,table,lat) {
    $(domId+' textarea').focus(function(){
        getWlItemData(table,wlId,lat)
            .then(function(data){
                if (data.count != 0) {
                    let item=data.items[0];
                    $(domId+' input[name=id]').val(item['id']);
                    if ($(domId+' textarea').val()!=item['description']) {
                        // console.log('Description changed');
                        let modder=item['mod.first_name']+' '+item['mod.last_name'] +' on '+item['modified_on'] ;
                        displayToast('warning', 'Description was changed', 'Item was changed by '+modder,6000);
                        $(domId+' textarea').val(item.description);
                    } else {};
                } else {};
            });
    });    
}

monitorValueChangeOneField('#cHxForm','current_hx');
monitorValueChangeOneField('#soapForm','soap');
monitorValueChangeOneField('#motForm','motility');
monitorValueChangeOneField('#phoForm','phoria');
monitorValueChangeOneField('#pupForm','pupils');
monitorValueChangeOneField('#ccxForm','ccx','na');
monitorValueChangeOneField('#ccxRForm','ccx','right');
monitorValueChangeOneField('#ccxLForm','ccx','left');
monitorValueChangeOneField('#folForm','followup');
monitorValueChangeOneField('#bilForm','billing');

// 3 functions for each form with multiple fields:
// 1) Submit: check for PUT, capitalize, crud
// 2) on focus: check in DB if field has changed
// 3) on change: if field value has changed then submit


// function to prepare pdf content of prescription 
function renderMedicObj(medicObj) {
    let content =['R/'];
    content.push(medicObj['medication']+'\n');
    content.push('DT n°I '+checkIfDataIsNull(medicObj['medic.packaging'],' ')+'\n');
    let posology=item['unit_per_intake']+' '+checkIfDataIsNull(medicObj['medic.form'],'unit(s)')+' '+medicObj['frequency'];
    content.push('S/'+ posology+'\n');
    return content.join('');
};
