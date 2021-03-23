
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
    $("#requested_time").val(new Date().addHours(1).toJSON().slice(0,16)); // or 19
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
// TODO: remove status_flag -> only needed when modification
$('#btnWlItemAdd').click(function() {
    let formDataStr = $('#newWlItemForm').serializeJSON();
    formDataObj = JSON.parse(formDataStr); // from string to object
    console.log('formDataStr:',formDataStr);
    wlItemsJson.push(formDataObj);
    console.log('wlItems:',wlItemsJson);
    wlItemsHtml['From'] = $('#sendingFacilitySelect :selected').text();
    wlItemsHtml['To'] = $('#receivingFacilitySelect :selected').text();
    wlItemsHtml['Procedure'] = $('#exam2doSelect :selected').text();
    wlItemsHtml['Provider'] = $('#providerSelect :selected').text();
    wlItemsHtml['Timeslot'] = $('#requested_time').val();
    // wlItemsHtml['Modality'] = $('#modality_destSelect :selected').text();
    // wlItemsHtml['side'] = $('input[name="laterality"]:checked').val();
    wlItemsHtml['Status'] = $('input[name="status_flag"]:checked').val();
    wlItemsHtml['Counter'] = $('input[name="counter"]').val();
    wlItemsHtml['warning'] = $('input[name="warning"]').val();
    console.log('wlItemsHtml',wlItemsHtml);
    wlItemsCounter += 1;
    appendWlItem(wlItemsHtml,wlItemsCounter,formDataStr);
});

function appendWlItem(arr,cnt,dataStr) {
    let html = '<tr id="wlItem'+ cnt + '">';
    for (item in arr) {
        html += '<td>' + arr[item] + '</td>';
    };
    html +='<td class="list-group-item"><button type="button" class="btn btn-danger btn-sm" onclick="delWlItemModal(\''+ cnt +'\');" data-index='+cnt+'><i class="far fa-trash-alt"></i></button></td>'
    html += '</tr>';
    $('#tbodyItems').append(html);
    // set data-json attribute with row formDataStr
    $('#wlItem'+cnt).data('json',dataStr);
}

function delWlItemModal(itemId){
    $('#wlItem'+itemId).remove();
}

function addToWorklist(userId) {
    // init form
    resetWlForm();
    wlItemsCounter = 0;
    // show all input
    let show = ['wlItemAddDiv', 'wlItemsDiv']
    for (i in show) {
        hideDiv('#'+show[i],'visually-hidden','remove');
    };
    $('#tbodyItems').html('');
    $('#idWlItemSubmit').val(userId);
    // open modal
    $('#newWlItemModal').modal('show');
}

// hide or remove class ; e = DOM id element c= classe req = remove or add
function hideDiv(e,c,req) {
    req == 'add' ? $(e).addClass(c) : $(e).removeClass(c);
}

function putWlModal(userId){
    // init form
    resetWlForm();
    wlItemsCounter = 0;
    // TODO: set inputs
    // hide useless input
    let hide = ['wlItemAddDiv', 'wlItemsDiv']
    for (i in hide) {
        hideDiv('#'+hide[i],'visually-hidden','add');
    };
    $('#newWlItemModal h5.modal-title').html('Edit worklist item #'+userId);
    $('#newWlItemModal').modal('show');
}

// submit each wl items in wlItemsJson
$('#newWlItemForm').submit(function(e) {
    e.preventDefault();
    for (let i = 1; i<=wlItemsCounter; i++) {
        let el = "#wlItem"+parseInt(i);
        if ($(el).length != 0) {
            let itemDataObj = JSON.parse($(el).data().json);
            let req = itemDataObj['methodWlItemSubmit'];
            delete itemDataObj['methodWlItemSubmit'];
            let itemDataStr = JSON.stringify(itemDataObj);
            crud('worklist','0', req, itemDataStr);
            $table_wl.bootstrapTable('refresh');
        }
    };
    $('#newWlItemModal').modal('hide');
}); // end submit function
