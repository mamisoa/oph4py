// refresh tables
const tablesArr = ['#mx_tbl','#ax_tbl','#mHx_tbl','#sHx_tbl', '#oHx_tbl', '#table-wl','#rxRight_tbl','#rxLeft_tbl'];
refreshTables(tablesArr);

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
        console.log(item.id);
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
var mHxmodal = document.getElementById('mHxModal')
mHxmodal.addEventListener('show.bs.modal', function (event) {
    // Button that triggered the modal
    var button = event.relatedTarget;
    if (button != undefined) {
        document.getElementById('mHxFormModal').reset();
        // Extract info from data-bs-* attributes
        var category = button.getAttribute('data-bs-category');
        $('#mHxModal .modal-title').html('New '+category+' history');
        $('#mHxModal input[name=category]').val([category]);
        $('#mHxModal input[name=site]').val(['systemic']);
    };
});

$('#mxFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodMxModalSubmit'];
    if (req == 'POST') {
        delete dataObj['id'];
    } else {};
    dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=wlItemObj['patient.id']:{};
    dataObj['medication']=capitalize(dataObj['medication']);
    delete dataObj['methodMxModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    console.log("dataForm",dataObj);
    if (dataObj['id_medic_ref'] == "") {
        let newMedicObj = {};
        newMedicObj['name']=dataObj['medication'];
        newMedicObj['delivery']=dataObj['delivery'];
        newMedicStr = JSON.stringify(newMedicObj);
        crud('medic_ref','0','POST',newMedicStr);
    };
    crud('mx','0',req,dataStr);
    document.getElementById('mxFormModal').reset();
    $mx_tbl.bootstrapTable('refresh');
    $('#mxModal').modal('hide');
});

$('#axFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodAxModalSubmit'];
    if (req == 'POST') {
        delete dataObj['id'];
    } else {};
    dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=wlItemObj['patient.id']:{};
    dataObj['agent']=capitalize(dataObj['agent']);
    delete dataObj['methodAxModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    console.log("dataForm",dataObj);
    if (dataObj['id_agent'] == "") {
        let newMedicObj = {};
        newMedicObj['name']=dataObj['agent'];
        newMedicStr = JSON.stringify(newMedicObj);
        crud('agent','0','POST',newMedicStr);
    };    
    crud('allergy','0',req,dataStr); 
    document.getElementById('axFormModal').reset();
    $ax_tbl.bootstrapTable('refresh'); 
    $('#axModal').modal('hide'); 
});

$('#mHxFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodmHxModalSubmit'];
    if (req == 'POST') {
        delete dataObj['id'];
    } else {};
    dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=wlItemObj['patient.id']:{};
    dataObj['title']=capitalize(dataObj['title']);
    delete dataObj['methodmHxModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    console.log("dataForm",dataObj);
    if (dataObj['id_disease_ref'] == "") {
        let newMedicObj = {};
        newMedicObj['title']=dataObj['title'];
        newMedicObj['category']=dataObj['category'];
        newMedicStr = JSON.stringify(newMedicObj);
        console.log("newMedicObj",newMedicObj);
        crud('disease_ref','0','POST',newMedicStr);
    };    
    crud('phistory','0',req,dataStr); 
    $mHx_tbl.bootstrapTable('refresh'); 
    $sHx_tbl.bootstrapTable('refresh');
    $oHx_tbl.bootstrapTable('refresh');
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
                crud(table,id,'DELETE');
                refreshTables(tablesArr);
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
// id is in the dataStr
function setWlItemStatus (dataStr) {
    // console.log('dataStrPut:',dataStr);
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
function getWlItemData(table,wlId,lat='') {
    let WURL;
    if (lat == '') {
        WURL = HOSTURL+"/myapp/api/"+table+"?@lookup=mod!:modified_by[id,first_name,last_name]&id_worklist.eq="+wlId;
    } else {
        WURL = HOSTURL+"/myapp/api/"+table+"?@lookup=mod!:modified_by[id,first_name,last_name]&id_worklist.eq="+wlId+'&laterality.eq='+lat;
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

// todo: to remove later, use as test
// init fields
getWlItemData('current_hx',wlId).then(function (data) {
    if (data.count != 0) {
        console.log("current_hx exists");
    } else {
        console.log("current_hx is empty");
    }
});


// set submit forms
var antFieldsArr = ['cornea','ant_chamb','iris','lens','other'],
    postFieldsArr = ['vitreous','retina','macula','papil','other'];

function setSubmit(domId,table, fieldsArr,lat) {
    $(domId).submit(function(e){
        e.preventDefault();
        let dataStr = $(this).serializeJSON();
        let dataObj = JSON.parse(dataStr);
        let req ;
        getWlItemData(table,wlId,lat)
            .then(function(data){
                if (data.count != 0) {
                    req = 'PUT';
                } else {
                    req = 'POST';
                    delete dataObj['id'];
                };
                console.log('setSubmit request:',req, 'data.count:',data.count);
                dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=wlItemObj['patient.id']:{};
                dataObj['id_worklist'] == "" ? dataObj['id_worklist']=wlItemObj['id']:{};
                // capitalize fields
                for (field of fieldsArr) {
                    if (dataObj[field] != "") {
                        console.log('capitalize:', field ,dataObj[field]);
                        dataObj[field]=capitalize(dataObj[field]); // capitalize text objects
                        $(domId+' input[name='+field+']').val(dataObj[field]); // update fields
                    } else {};
                };
                dataStr= JSON.stringify(dataObj);
                console.log("dataForm from setSubmit",dataObj);
                crud(table,'0',req,dataStr);
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

setSubmit('#antRightForm','ant_biom',antFieldsArr,'right');
setSubmit('#antLeftForm','ant_biom', antFieldsArr,'left');
setSubmit('#postRightForm','post_biom', postFieldsArr,'right');
setSubmit('#postLeftForm','post_biom', postFieldsArr,'left');

// set events handlers to update fields
function updateHandlersFields(table,domId,fieldsArr,lat='') {
    for (const field of fieldsArr) {
        $(domId+' input[name='+field+']').focus(function(){
            getWlItemData(table,wlId,lat)
                .then(function(data){
                    console.log("from update fields "+field+" :",data, data.count);
                    if (data.count != 0) {
                        let item=data.items[0];
                        $(domId+' input[name=id]').val(item['id']);
                        console.log('input value: ', domId+' input[name='+field+']');
                        if ($(domId+' input[name='+field+']').val()!=item[field] && item[field] != 'None' ) {
                            console.log(capitalize(field)+' changed');
                            let modder=item['mod.first_name']+' '+item['mod.last_name'] +' on '+item['modified_on'] ;
                            displayToast('warning', capitalize(field)+' was changed', capitalize(field)+' was changed by '+modder,6000);
                            $(domId+' input[name='+field+']').val(item[field]);
                        } else {};
                    } else {};
                });
        });        
    };
}

updateHandlersFields('ant_biom','#antRightForm', antFieldsArr,'right');
updateHandlersFields('ant_biom','#antLeftForm', antFieldsArr,'left');
updateHandlersFields('post_biom','#postRightForm', postFieldsArr,'right');
updateHandlersFields('post_biom','#postLeftForm', postFieldsArr,'left');

// trigger change at each value change
function monitorValueChange(domId,fieldsArr) {
    for (field of fieldsArr) {
        $(domId+' input[name='+field+']').change(function() {
            $(domId+'FormSubmit').removeClass('btn-secondary').addClass('btn-danger');
            $(domId).submit();
        })
    };
};

monitorValueChange('#antRightForm', antFieldsArr);
monitorValueChange('#antLeftForm', antFieldsArr);
monitorValueChange('#postRightForm', postFieldsArr);
monitorValueChange('#postLeftForm', postFieldsArr);

// motility 

// set form submit with 1 field 'description', not laterality
// domId = formId eg #motForm

oneFieldArr = ['#cHxForm','#motForm'];

function setOneSubmit(domId,table) {
    $(domId).submit(function(e){
        e.preventDefault();
        let dataStr = $(this).serializeJSON();
        let dataObj = JSON.parse(dataStr);
        let req ;
        getWlItemData(table,wlId)
            .then(function(data){
                if (data.count !=0) {
                    req = 'PUT';
                } else {
                    req = 'POST';
                    delete dataObj['id'];
                };
                dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=wlItemObj['patient.id']:{};
                dataObj['id_worklist'] == "" ? dataObj['id_worklist']=wlItemObj['id']:{};
                dataObj['description']=capitalize(dataObj['description']);
                dataStr= JSON.stringify(dataObj);
                console.log("dataForm",dataObj);
                crud(table,'0',req,dataStr);
                $(domId+'Submit').removeClass('btn-danger').addClass('btn-secondary');            
            })
    });    
};

setOneSubmit('#cHxForm','current_hx');
setOneSubmit('#motForm','motility');


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
updateHandlersOneField('#motForm');

// update field on focus and highlight if changed

function monitorValueChangeOneField(domId,table) {
    $(domId+' textarea').focus(function(){
        getWlItemData(table,wlId)
            .then(function(data){
                if (data.count != 0) {
                    let item=data.items[0];
                    $(domId+' input[name=id]').val(item['id']);
                    if ($(domId+' textarea').val()!=item['description']) {
                        console.log('Description changed');
                        let modder=item['mod.first_name']+' '+item['mod.last_name'] +' on '+item['modified_on'] ;
                        displayToast('warning', 'Description was changed', 'Item was changed by '+modder,6000);
                        $(domId+' textarea').val(item.description);
                    } else {};
                } else {};
            });
    });    
}

monitorValueChangeOneField('#cHxForm','current_hx');
monitorValueChangeOneField('#motForm','motility');