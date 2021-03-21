
// useful functions 

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
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
    $("#request_time").val(new Date().addHours(1).toJSON().slice(0,19));
    $("[name=laterality]").val(["both"]);
    $("[name=status_flag]").val(["requested"]);
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
// add new item in worklist format
// TODO: on submit: clear wlItems and counter
$('#btnWlItemAdd').click(function() {
    let formData = $('#newWlItemForm').serializeJSON();
    formData = JSON.parse(formData); // from string to object
    console.log('formData:',formData);
    wlItemsJson.push(formData);
    console.log('wlItems:',wlItemsJson);
    // wlItemsHtml['from'] = $('#sendingFacilitySelect :selected').text();
    // wlItemsHtml['to'] = $('#receivingFacilitySelect :selected').text();
    wlItemsHtml['Procedure'] = $('#exam2doSelect :selected').text();
    wlItemsHtml['provider'] = $('#providerSelect :selected').text();
    wlItemsHtml['Timeslot'] = $('#request_time').val();
    wlItemsHtml['Modality'] = $('#modality_destSelect :selected').text();
    // wlItemsHtml['side'] = $('input[name="laterality"]:checked').val();
    wlItemsHtml['status'] = $('input[name="status_flag"]:checked').val();
    wlItemsHtml['counter'] = $('input[name="counter"]').val();
    wlItemsHtml['warning'] = $('input[name="warning"]').val();
    console.log('wlItemsHtml',wlItemsHtml);
    wlItemsCounter += 1;
    appendWlItem(wlItemsHtml,wlItemsCounter);
});

function appendWlItem(arr,cnt) {
    let html = '<li id="wlItem'+ cnt + '" class="list-group-item"><ul class="list-group list-group-horizontal">';
    for (item in arr) {
        html += '<li class="list-group-item">'+ item + ':<br>' + arr[item] + '</li>';
    };
    html +='<li class="list-group-item"><button type="button" class="btn btn-danger btn-sm"><i class="far fa-trash-alt"></i></button></li>'
    html += '</ul></li>';
    console.log(html);
    $('#wlItemsOl').append(html);
}

function addToWorklist(userId) {
    resetWlForm();
    $('#idWlItemSubmit').val(userId);
    $('#newWlItemModal').modal('show');
}