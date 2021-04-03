// get wl details

var wlItemObj;

function disableBtn() {
    $('#btnTaskDone').attr('disabled', true);
    $('#btnAddTonoPachyRight').attr('disabled', true);
    $('#btnAddTonoPachyLeft').attr('disabled', true);
    $('#btnAddAplaRight').attr('disabled', true);
    $('#btnAddAplaLeft').attr('disabled', true);            
};

function getWlDetails(wlId){
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: HOSTURL+"/myapp/api/worklist/"+wlId+"?@lookup=patient!:id_auth_user[id,last_name,first_name,dob,photob64],modality!:modality_dest[id,modality_name],provider!:provider[id,last_name,first_name,dob],senior!:senior[id,last_name,first_name,dob]",
            success: function(data) {
                if (data.status != 'error' || data.count) {
                    displayToast('success', 'GET combo exams', 'GET'+data.items[0]['patient.first_name']+' '+data.items[0]['patient.last_name'],3000);
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

getWlDetails(wlId)
    .then(function (data) {
        console.log(data.items[0]);
        let html = [];
        let dataWl = data.items[0];
        for (item in dataWl) {
            html.push('<p>Key: '+item+' - Value: '+dataWl[item]+'</p>');
        }
        $('#wldetails').append(html.join(''));
        return data.items[0];
    })
    .then(function (itemObj){ // set patient ID in top bar
        wlItemObj = Object.assign({},itemObj); // clone wltitemobj in global        
        $('#wlItemDetails .patientName').html(itemObj['patient.first_name']+' '+itemObj['patient.last_name']);
        $('#wlItemDetails .patientDob').html(itemObj['patient.dob']+' ('+getAge(itemObj['patient.dob'])+'yo)');
        $('#wlItemDetails .timeslot').html(itemObj['requested_time'].split('T').join(' '));
        $('#wlItemDetails .modality').html(itemObj['modality.modality_name']);
        $('#wlItemDetails .laterality').html(itemObj['laterality']);
        $('#wlItemDetails .provider').html(itemObj['provider.first_name']+' '+itemObj['provider.last_name']);
        $('#wlItemDetails .senior').html(itemObj['senior.first_name']+' '+itemObj['senior.last_name']);
        $('#wlItemDetails .status').html(itemObj['status_flag']);
        if (itemObj['status_flag'] == 'done') {
            disableBtn();
        }
        wlItemObj['patient.photob64'] != null? $('#wlItemDetails .warning').html('<i class="fas fa-exclamation-circle"></i> '+itemObj['warning']) : $('#wlItemDetails .warning').html('').removeClass('bg-danger text-wrap');
        if (wlItemObj['patient.photob64'] == null) {
            $('#photoDiv').addClass('visually-hidden');
            $('#patientIdDiv').removeClass('text-end').addClass('text-center');
        } else {
            document.getElementById("photoTitle").setAttribute("src",wlItemObj['patient.photob64']);
        }
});

// hide pachy when techno is apla
// if val(), change by chaining trigger("change")
$('#tonoPachyForm [name=techno]').change(function() {
    pachyCache = $('#tonoPachyForm [name=pachymetry]').val();
    if ($('#tonoPachyForm [name=techno]:checked').val() == 'apla') {
        $('#pachyDiv').addClass('visually-hidden');
    } else {
        $('#pachyDiv').removeClass('visually-hidden');
    }
});

// set counters
// id_count : form id , count_class: tono pachy (counter_tono) 

counterArr = ['#airRightForm', '#airLeftForm', '#aplaRightForm', '#aplaLeftForm', '#tonoPachyForm','#form_right_apla','#form_left_apla'];

for (let counter of counterArr) {
    setCounter(counter,'tono',0.5,0,80);
    setCounter(counter,'pachy',2,300,700);    
};

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

// submit airPachy and apla forms
$('#airRightForm').submit(function(e){
    e.preventDefault();
    tonoPachyInsert(this,'right');
});

$('#airLeftForm').submit(function(e){
    e.preventDefault();
    tonoPachyInsert(this,'left');
})

$('#aplaRightForm').submit(function(e){
    e.preventDefault();
    tonoPachyInsert(this,'right','apla');
});

$('#aplaLeftForm').submit(function(e){
    e.preventDefault();
    tonoPachyInsert(this,'left','apla');
});

// domId eg #airRightForm , laterality eg 'right'
function tonoPachyInsert(domId,laterality, techno='air') {
    let dataStr = $(domId).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let o ={};
    o['tonometry'] = dataObj[techno+capitalize(laterality)];
    techno == 'air'? o['pachymetry'] = dataObj['pachy'+capitalize(laterality)] : o['pachymetry'] = '';
    o['id_auth_user'] = wlItemObj['patient.id'];
    o['id_worklist'] = wlItemObj['id'];
    o['laterality'] = laterality;
    o['techno'] = techno;
    o['timestamp']= new Date().addHours(timeOffsetInHours).toJSON().slice(0,16);
    console.log('o',o);
    oStr = JSON.stringify(o);
    crud('tono','0','POST', oStr);
    techno == 'air'? $('#airPachy'+capitalize(laterality)+'_tbl').bootstrapTable('refresh') : $('#apla'+capitalize(laterality)+'_tbl').bootstrapTable('refresh');
};

function refreshTables() {
    $table_airRight.bootstrapTable('refresh');
    $table_airLeft.bootstrapTable('refresh');
    $table_aplaRight.bootstrapTable('refresh');
    $table_aplaLeft.bootstrapTable('refresh');
};

function delTonoPachy (id) {
    bootbox.confirm({
        message: "Are you sure you want to delete this tono/pachy?",
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
                crud('tono',id,'DELETE');
                refreshTables();
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};

$('#tonoPachyForm').submit(function (e){
    e.preventDefault();
    let dataStr = $('#tonoPachyForm').serializeJSON();
    let dataObj = JSON.parse(dataStr);
    console.log(dataObj);
    let req = dataObj['methodTonoPachySubmit'];
    delete dataObj['methodTonoPachySubmit'];
    dataStr = JSON.stringify(dataObj);
    crud('tono','0',req,dataStr);
    $('#tonoPachyModal').modal('hide');
    refreshTables();
});

// set task to done and disable form buttons
$('#btnTaskDone').click(function() {
    bootbox.confirm({
        message: "Are you sure you want to set this task to DONE?",
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
                let dataObj = { 'laterality': wlItemObj['laterality'], 'id': wlId };
                let dataStr;
                if (wlItemObj['status_flag'] != 'done') {
                    dataObj['status_flag'] = 'done';
                    dataObj['counter'] = 0;
                    dataStr = JSON.stringify(dataObj);
                    crud('worklist','0','PUT', dataStr);
                    getWlDetails(wlId) // check if set to done successful and disable forms
                        .then(function (itemObj) {
                            wlItemObj = Object.assign({},itemObj.items[0]); // clone wltitemobj in global
                            if (wlItemObj['status_flag'] == 'done') {
                                $('#wlItemDetails .status').html(wlItemObj['status_flag']);
                                disableBtn();
                            }
                        });
                }
            } // end if
        } // end callback
    }); //end bootbox
});

// delete tono
function delTonoPachy (id) {
    bootbox.confirm({
        message: "Are you sure you want to delete this tono/pachy?",
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
                crud('tono',id,'DELETE');
                refreshTables();
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};
