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

function responseHandler_ax(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'id_auth_user': list[i].id_auth_user,
            'id_agent': list[i]['agentRef.id'],
            'agent_from_id': list[i]['agentRef.name'],
            'agent': list[i]['agent'],
            'typ': list[i]['typ'],
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

function responseHandler_msHx(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'id_auth_user': list[i].id_auth_user,
            'id_disease_ref': list[i]['disease.id'],
            'disease_from_id': list[i]['disease.title'],
            'title': list[i]['title'],
            'site': list[i]['site'],
            'note': list[i]['note'],
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
        switch (params.sort) {
            case "onset":
                params.sort = "onset";
                break;
            case "medication":
                params.sort = "medication";
                break;
            case "typ":
                params.sort = "typ";
                break;
            case "agent":
                params.sort = "agent";
                break;
            case "title":
                params.sort = "title";
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
        $('#mxModal .modal-title').html('Edit allergy #'+row.id);
        $('#mxModal').modal('show');
    },
    'click .remove': function (e, value, row, index) {
        console.log('You click action DELETE on row: ' + JSON.stringify(row));
        delItem(row.id, 'mx', 'medication');
    }
};

function operateFormatter_ax(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit allergy"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Delete allergy"><i class="fas fa-trash-alt"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents_ax = {
    'click .edit': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        document.getElementById("axFormModal").reset();
        $('#axFormModal [name=id]').val(row.id); 
        $('#axFormModal [name=id_agent]').val(row.id_agent);
        $('#axFormModal [name=id_auth_user]').val(row.id_auth_user);
        $('#axFormModal [name=onset]').val(row.onset);
        $('#axFormModal [name=ended]').val(row.ended);
        $('#axFormModal [name=typ]').val([row.typ]);
        $('#axFormModal [name=agent]').val(row.agent);
        $('#axFormModal [name=methodAxModalSubmit]').val('PUT');
        $('#axModal .modal-title').html('Edit allergy #'+row.id);
        $('#axModal').modal('show');
    },
    'click .remove': function (e, value, row, index) {
        console.log('You click action DELETE on row: ' + JSON.stringify(row));
        delItem(row.id, 'allergy', 'allergy');
    }
};

function checkIfNull(value, resultStrIfNull) { 
    if (value == null) {
        return resultStrIfNull;
    } else {
        return value;
    }
}

function operateFormatter_msHx(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit past history"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Delete past history"><i class="fas fa-trash-alt"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents_msHx = {
    'click .edit': function (e, value, row, index) {
        let modalId = '#sHxFormModal';
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        document.getElementById(modalId).reset();
        $(modalId+' [name=id]').val(row.id); 
        $(modalId+' [name=onset]').val(row.onset); 
        $(modalId+' [name=ended]').val(row.ended); 
        $(modalId+' [name=category]').val([row.category]); 
        $(modalId+' [name=site]').val([row.site]);
        $(modalId+' [name=title]').val(row.title); 
        $(modalId+' [name=note]').val(row.note); 
        $(modalId+' [name=methodsHxModalSubmit]').val('PUT');
        $('#sHxModal .modal-title').html('Edit allergy #'+row.id);
        $('#sHxModal').modal('show');
    },
    'click .remove': function (e, value, row, index) {
        console.log('You click action DELETE on row: ' + JSON.stringify(row));
        delItem(row.id, 'phistory', 'past history');
    }
};

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

function detailFormatter_ax(index, row) {
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Type: </span>' + row.typ + '</p>');
    html.push('<p class=""><span class="fw-bold">Agent: </span>' + row.agent + '</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
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

function rowStyle_ax(row,value) {
    let statusColor = {'atopy':'lightblue', 'intolerance':'papayawhip', 'allergy':'#ff9999'};
    return { 
                css: { 'background-color': statusColor[row.typ] }
            };
};