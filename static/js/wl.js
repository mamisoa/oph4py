function setModalityOptions(exam2doId){
    let modalityOptions = getModalityOptions(exam2doId);
    modalityOptions.then(function(data){
        if (data.status != 'error') {
            let items = data.items;
            let html = '';
            for (let item of items) {
                html += '<option value="'+ item.id + '">'+ item.modality_name+'</option>';
            };
            console.log(html);
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
                console.log(data); 
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


// init modality options for default exam2do select
function modality_destSelectInit(){
    let choice = $('select#exam2doSelect option:checked').val();
    setModalityOptions(choice);
}

// set default request time to now
$("#request_time").val(new Date().toJSON().slice(0,19));

// change modality options on exam2do select
modality_destSelectInit();
$('#exam2doSelect').change(function(){
    setModalityOptions(this.value);
}); 