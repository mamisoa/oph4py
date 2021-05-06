// 

$('input[name=id_auth_user]').val(patientObj['id']); // set patient id in forms
$('input[name=id_worklist]').val(wlObj['worklist']['id']); // set patient id in forms
$('#wlItemDetails .patientName').html(patientObj['first_name']+' '+patientObj['last_name'].toUpperCase());
$('#wlItemDetails .patientDob').html(patientObj['dob'].split('-').reverse().join('/')+' ('+getAge(patientObj['dob'])+'yo)');
$('#wlItemDetails .patientId').html('#'+patientObj['id']);
$('#wlItemDetails .timeslot').html(wlObj['worklist']['requested_time'].split('T').join(' '));
$('#wlItemDetails .modality').html(wlObj['modality']['modality_name']);
$('#wlItemDetails .laterality').html(wlObj['worklist']['laterality']);
$('#wlItemDetails .provider').html(providerObj['first_name']+' '+providerObj['last_name']);
$('#wlItemDetails .senior').html(seniorObj['first_name']+' '+seniorObj['last_name']);
$('#wlItemDetails .status').html(wlObj['worklist']['status_flag']);
if (wlObj['worklist']['status_flag'] == 'done') {
    disableBtn(btnArr);
}
wlObj['worklist']['warning'] != null? $('#wlItemDetails .warning').html('<i class="fas fa-exclamation-circle"></i> '+wlObj['worklist']['warning']) : $('#wlItemDetails .warning').html('').removeClass('bg-danger text-wrap');
if (patientObj['photob64'] == null) {
    $('#photoDiv').addClass('visually-hidden');
    $('#patientIdDiv').removeClass('text-end').addClass('text-center');
} else {
    document.getElementById("photoId").setAttribute("src",patientObj['photob64']);
};

function getWlDetails(wlId){
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: HOSTURL+"/myapp/api/worklist/"+wlId+"?@lookup=patient!:id_auth_user[id,last_name,first_name,dob,photob64],modality!:modality_dest[id,modality_name],provider!:provider[id,last_name,first_name,dob],senior!:senior[id,last_name,first_name,dob]",
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
                    dataStr = JSON.stringify(dataObj);
                    let res =crud('worklist','0','PUT', dataStr);
                    console.log("update result:",res);
                    getWlDetails(wlId) // check if set to done successful and disable forms
                        .then(function (itemObj) {
                            wlObj['worklist'] = Object.assign({},itemObj.items[0]); // update wlObj worklist 
                            if (wlObj['status_flag'] == 'done') {
                                $('#wlItemDetails .status').html(wlObj['status_flag']);
                                disableBtn(btnArr);
                            };
                            window.location.href = '/myapp/worklist';
                        });
                }
            } // end if
        } // end callback
    }); //end bootbox
});
  