// 

$('input[name=id_auth_user]').val(patientObj['id']); // set patient id in forms
$('input[name=id_worklist]').val(wlObj['worklist']['id']); // set patient id in forms
$('#wlItemDetails .patientName').html(patientObj['first_name']+' '+patientObj['last_name'].toUpperCase());
$('#wlItemDetails .patientDob').html(patientObj['dob']+' ('+getAge(patientObj['dob'])+'yo)');
$('#wlItemDetails .patientId').html('#'+patientObj['id']);
$('#wlItemDetails .timeslot').html(wlObj['worklist']['requested_time'].split('T').join(' '));
$('#wlItemDetails .modality').html(wlObj['modality']['modality_name']);
$('#wlItemDetails .laterality').html(wlObj['worklist']['laterality']);
$('#wlItemDetails .provider').html(providerObj['first_name']+' '+providerObj['last_name']);
$('#wlItemDetails .senior').html(seniorObj['first_name']+' '+seniorObj['last_name']);
$('#wlItemDetails .status').html(wlObj['status_flag']);
if (wlObj['status_flag'] == 'done') {
    disableBtn(btnArr);
}
wlObj['warning'] != null? $('#wlItemDetails .warning').html('<i class="fas fa-exclamation-circle"></i> '+itemObj['warning']) : $('#wlItemDetails .warning').html('').removeClass('bg-danger text-wrap');
if (patientObj['photob64'] == null) {
    $('#photoDiv').addClass('visually-hidden');
    $('#patientIdDiv').removeClass('text-end').addClass('text-center');
} else {
    document.getElementById("photoId").setAttribute("src",patientObj['photob64']);
};