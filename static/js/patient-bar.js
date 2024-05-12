// 

$('input[name=id_auth_user]').val(patientObj['id']); // set patient id in forms
$('input[name=id_worklist]').val(wlObj['worklist']['id']); // set patient id in forms
$('#wlItemDetails .patientName').html(patientObj['last_name'].toUpperCase()+' '+patientObj['first_name']);
patientObj['dob'] != null ? $('#wlItemDetails .patientDob').html(patientObj['dob'].split('-').reverse().join('/')+' ('+getAge(patientObj['dob'])+'yo)') : $('#wlItemDetails .patientDob').html('DOB: n/a');
$('#wlItemDetails .patientGender').html('Gender: '+ genderIdObj[patientObj['gender']]);
$('#wlItemDetails .patientSsn').html('NISS #'+checkIfDataIsNull(patientObj['ssn']));
$('#wlItemDetails .patientCard').html('Card #'+checkIfDataIsNull(patientObj['idc_num']));
$('#wlItemDetails .patientEmail').html('Email: '+checkIfDataIsNull(patientObj['email']));
$('#wlItemDetails .patientId').html('ID #'+patientObj['id']);
$('#wlItemDetails .timeslot').html(datetime2eu(wlObj['worklist']['requested_time']));
patientObj['user_notes'] != null? $('#wlItemDetails .user_notes').html(patientObj['user_notes']) : $('#wlItemDetails .user_notes').removeClass('whitebg');
$('#wlItemDetails .modality').html(wlObj['modality']['modality_name']);
$('#wlItemDetails .laterality').html(wlObj['worklist']['laterality']);
$('#wlItemDetails .provider').html(providerObj['first_name']+' '+providerObj['last_name']);
$('#wlItemDetails .senior').html(seniorObj['first_name']+' '+seniorObj['last_name']);
$('#wlItemDetails .status').html(wlObj['worklist']['status_flag']);
if (wlObj['worklist']['status_flag'] == 'done') {
    $('#btnTaskDone').addClass('visually-hidden');
    disableBtn(btnArr);
} else {
    $('#btnUnlockTask').addClass('visually-hidden');
};
wlObj['worklist']['warning'] != null? $('#wlItemDetails .warning').html('<i class="fas fa-exclamation-circle"></i> '+wlObj['worklist']['warning']) : $('#wlItemDetails .warning').html('').removeClass('bg-danger text-wrap');
if (patientObj['photob64'] == null) {
    document.getElementById("photoId").setAttribute("height", 200);
    document.getElementById("photoId").setAttribute("width", 150);
    genderIdObj[patientObj['gender']] == "Male" ? document.getElementById("photoId").setAttribute("src", HOSTURL+"/"+APP_NAME+"/static/images/assets/avatar/mini-man.svg") : document.getElementById("photoId").setAttribute("src", HOSTURL+"/"+APP_NAME+"/static/images/assets/avatar/mini-woman.svg");
    // $('#photoDiv').addClass('visually-hidden');
    // $('#patientIdDiv').removeClass('text-end').addClass('text-center');
} else {
    document.getElementById("photoId").setAttribute("src",patientObj['photob64']);
};

function getWlDetails(wlId){
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: HOSTURL+"/"+APP_NAME+"/api/worklist/"+wlId+"?@lookup=patient!:id_auth_user[id,last_name,first_name,dob,photob64],modality!:modality_dest[id,modality_name],provider!:provider[id,last_name,first_name,dob],senior!:senior[id,last_name,first_name,dob]",
            success: function(data) {
                if (data.status != 'error' && data.count) {
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

// todo: transfer to useful
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
                let dataObj = { 'laterality': wlObj['worklist']['laterality'], 'id': wlId };
                let dataStr;
                if (wlObj['status_flag'] != 'done') {
                    dataObj['status_flag'] = 'done';
                    dataObj['counter'] = 0;
                    let id = dataObj.id;
                    delete dataObj.id;
                    dataStr = JSON.stringify(dataObj);
                    crudp('worklist',id,'PUT', dataStr)
                        .then( function(data){
                            console.log("update result:",data);
                            getWlDetails(wlId) // check if set to done successful and disable forms
                                .then(function (itemObj) {
                                    wlObj['worklist'] = Object.assign({},itemObj.items[0]); // update wlObj worklist 
                                    if (wlObj['status_flag'] == 'done') {
                                        $('#wlItemDetails .status').html(wlObj['status_flag']);
                                        disableBtn(btnArr);
                                    };
                                    window.location.href = '/'+APP_NAME+'/worklist';
                                });
                        });
                }
            } // end if
        } // end callback
    }); //end bootbox
});

$('#btnUnlockTask').click(function(){
    let dataObj = { 'laterality': wlObj['worklist']['laterality'], 'id': wlObj['worklist']['id'] };
    let dataStr;
    if (wlObj['worklist']['status_flag'] == 'done') {
        dataObj['status_flag'] = 'processing';
        dataObj['counter'] = 1;
        let id = dataObj.id;
        delete dataObj.id;
        dataStr = JSON.stringify(dataObj);
        crudp('worklist',id,'PUT', dataStr)
            .then(function(){document.location.reload()});
    } else {};
});

// MD history
mdHistory.forEach(function (arrayItem) {
    let id = arrayItem.id;
    let ts = arrayItem.requested_time;
    let setbtnclass = ""
    if (id == wlId) {
        setbtnclass = "disabled";
    };
    // console.log("Id: ", id);
    // console.log("Timeslot: ", ts);
    document.getElementById("mdHistory").innerHTML += '<button class="btn btn-primary btn-sm '+setbtnclass+' mx-2 my-1 btnmdHistory" data-mdId="'+id+'" type="button">'+ts+'</button>';
});

$('.btnmdHistory').click(function(){
    // console.log("btn id is:",this.dataset.mdid);
    window.location.href = '/'+APP_NAME+'/modalityCtr/'+modalityController+'/'+this.dataset.mdid+'/#cHxDiv';
});