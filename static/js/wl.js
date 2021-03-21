
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

var wlItems = [];
// add new item in worklist format
// TODO: on submit: clear wlItems
$('#btnWlItemAdd').click(function() {
    let formData = $('#newWlItemForm').serializeJSON();
    formData = JSON.parse(formData);
    console.log('formData:',formData);
    wlItems.push(formData);
    console.log('wlItems:',wlItems);
});

function addToWorklist(userId) {
    resetWlForm();
    $('#idWlItemSubmit').val(userId);
    $('#newWlItemModal').modal('show');
}