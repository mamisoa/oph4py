function responseHandler_mx(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'id_auth_user': list[i].id_auth_user,
            'id_medic_ref': list[i]['medication.id'],
            'medication_from_id': list[i]['medication.name'],
            'medication': list[i]['medication'],
            'brand': list[i]['medication.brand'],
            'delivery': list[i]['delivery'],
            'form': list[i]['medication.form'],
            'intake': list[i]['unit_per_intake'],
            'frequency': list[i].frequency,
            'frequency_h': list[i]['unit_per_intake'] +' '+ checkIfNull(list[i]['medication.form'],'') + ' '+ list[i].frequency,
            'onset': list[i].onset,
            'ended': list[i].ended,
            'modified_by_name': list[i]['mod.last_name'] + ' ' + list[i]['mod.first_name'],
            'modified_by': list[i]['mod.id'],
            'modified_on': list[i]['modified_on'],
            'created_by': list[i]['creator.id'],
            'created_by_name': list[i]['creator.last_name'] + ' ' + list[i]['creator.first_name'],
            'created_on': list[i]['created_on']
        });
    });
    return {
        rows: display,
        total: res.count,
    };
};

var toggle ='';
function queryParams(params) {
    let s = '';
    if (params.offset != "0") {
        s =="" ? s += "@offset=" + params.offset : s += "&@offset=" + params.offset;
    }
    if (params.limit != "0") {
        s =="" ? s += "@limit=" + params.limit: s += "&@limit=" + params.limit
    }
    if (params.sort != undefined) {
        if (params.sort == "onset") {
            params.sort = "onset";
        }
        if (params.sort == "medication") {
            params.sort = "medication";
        }
        if (toggle=="") {
            s += "&@order="+params.sort;
            toggle="~";
        } else {
            s += "&@order=~"+params.sort;
            toggle="";
        }
    }
    return s; // remove the first &
};

function operateFormatter_mx(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit rx"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Delete rx"><i class="fas fa-trash-alt"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents_mx = {
    'click .edit': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        document.getElementById("mxFormModal").reset();
        $('#mxFormModal [name=id]').val(row.id); 
        $('#mxFormModal [name=id_medic_ref]').val(row.id_medic_ref);
        $('#mxFormModal [name=id_auth_user]').val(row.id_auth_user);
        $('#mxFormModal [name=onset]').val(row.onset);
        $('#mxFormModal [name=ended]').val(row.ended);
        $('#mxFormModal [name=delivery]').val([row.delivery]);
        $('#mxFormModal [name=intake]').val(row.intake);
        $('#mxFormModal [name=frequency]').val(row.frequency);
        $('#mxFormModal [name=medication]').val(row.medication);
        $('#mxFormModal [name=methodMxModalSubmit]').val('PUT');
        $('#mxModal .modal-title').val('Edit medication #'+row.id);
        $('#mxModal').modal('show');
    },
    'click .remove': function (e, value, row, index) {
        console.log('You click action DELETE on row: ' + JSON.stringify(row));
        delItem(row.id, 'mx', 'medication');
    }
};

function checkIfNull(value, resultStrIfNull) { 
    if (value == null) {
        return resultStrIfNull;
    } else {
        return value;
    }
}

function detailFormatter_mx(index, row) {
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Intake: </span>' + row.intake + '</p>');
    html.push('<p class=""><span class="fw-bold">Frequency: </span>' + row.frequency + '</p>');
    html.push('<p class=""><span class="fw-bold">Name: </span>' + row.medication + '</p>');
    html.push('<p class=""><span class="fw-bold">Brand: </span>' + checkIfNull(row.brand, '-') +'</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Delivery: </span>' + row.delivery + '</p>');
    html.push('<p class=""><span class="fw-bold">Onset: </span>' + row.onset + '</p>');
    html.push('<p class=""><span class="fw-bold">Ended: </span>' + row.ended + '</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
    html.push('<p class=""><span class="fw-bold">Created by: </span>' + row.created_by_name + ' on ' + row.created_on + '</p>');
    html.push('<p class=""><span class="fw-bold">Modified by: </span>' + row.modified_by_name + ' on ' + row.modified_on + '</p>');
    html.push('</div>');
    html.push('</div></div>');
    return html.join('');
};
