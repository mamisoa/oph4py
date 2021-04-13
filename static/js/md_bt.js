function responseHandler_mx(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'id_auth_user': list[i].id_auth_user,
            'id_worklist': list[i].id_worklist,
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
            'note': list[i].note,
            'status': list[i].status,
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
            'id_worklist': list[i]['id_worklist'],
            'icd10': list[i]['disease.icd10'],
            'title': list[i]['title'],
            'site': list[i]['site'],
            'note': list[i]['note'],
            'onset': list[i].onset,
            'ended': list[i].ended,
            'category': list[i].category,
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
            case "timestamp":
                params.sort = "timestamp";
                break;
            case "rx_origin":
                params.sort = "rx_origin";
                break;
            case "va_far":
                params.sort = "va_far";
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
        $('#mxFormModal [name=note]').val(row.note);
        $('#mxFormModal [name=id_worklist]').val(row.id_worklist);
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
        let modalFormId = '#mHxFormModal', modalId = '#mHxModal';
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        document.getElementById(modalFormId.split('#').join('')).reset();
        $(modalFormId+' [name=id]').val(row.id); 
        $(modalFormId+' [name=id_auth_user]').val(row.id_auth_user);
        $(modalFormId+' [name=id_disease_ref]').val(row.id_disease_ref); 
        $(modalFormId+' [name=onset]').val(row.onset); 
        $(modalFormId+' [name=ended]').val(row.ended); 
        $(modalFormId+' [name=category]').val([row.category]); 
        $(modalFormId+' [name=site]').val([row.site]);
        $(modalFormId+' [name=title]').val(row.title);
        $(modalFormId+' [name=id_worklist]').val(row.id_worklist);  
        $(modalFormId+' [name=note]').val(row.note); 
        $(modalFormId+' [name=methodmHxModalSubmit]').val('PUT');
        $(modalId+' .modal-title').html('Edit past history #'+row.id);
        $(modalId).modal('show');
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
    html.push('<p class=""><span class="fw-bold">Delivery: </span>' + row.delivery + '</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Status: </span>' + row.status + '</p>');
    html.push('<p class=""><span class="fw-bold">Onset: </span>' + row.onset + '</p>');
    html.push('<p class=""><span class="fw-bold">Ended: </span>' + row.ended + '</p>');
    html.push('<p class=""><span class="fw-bold">Note: </span>' + row.note + '</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Mx ID: </span>' + row.id);
    html.push('<p class=""><span class="fw-bold">PatientID: </span>' + row.id_auth_user + '</p>');
    html.push('<p class=""><span class="fw-bold">Worklist ID: </span>' + row.id_worklist + '</p>');
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
    html.push('<p class=""><span class="fw-bold">PatientID: </span>' + row.id_auth_user + '</p>');
    html.push('<p class=""><span class="fw-bold">Created by: </span>' + row.created_by_name + ' on ' + row.created_on + '</p>');
    html.push('<p class=""><span class="fw-bold">Modified by: </span>' + row.modified_by_name + ' on ' + row.modified_on + '</p>');
    html.push('</div>');
    html.push('</div></div>');
    return html.join('');
};

function detailFormatter_msHx(index, row) {
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Title: </span>' + row.title + '</p>');
    html.push('<p class=""><span class="fw-bold">Site: </span>' + row.site + '</p>');
    html.push('<p class=""><span class="fw-bold">Note: </span>' + row.note + '</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Category: </span>' + row.category + '</p>');
    html.push('<p class=""><span class="fw-bold">Onset: </span>' + row.onset + '</p>');
    html.push('<p class=""><span class="fw-bold">Ended: </span>' + row.ended + '</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
    html.push('<p class=""><span class="fw-bold">PatientID: </span>' + row.id_auth_user + '</p>');
    html.push('<p class=""><span class="fw-bold">Worklist ID: </span>' + row.id_worklist + '</p>');
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

// set parameters for worklist table
var s_wl="";
var toggle_wl="";

function queryParams_wl(params) {
    search = params.search.split(",");
    if (search == [""]) {
        s_wl =""
    } else {
        if (search[0]!= undefined) {
            s_wl = "exam2do.exam_name.startswith=" + capitalize(search[0]);
        } else {
            s_wl = "";
        }
        if (search[1]!= undefined) {
            s_wl += "&modality_dest.modality_name.startswith=" + capitalize(search[1]);
        } else {
            s_wl +="";
        }
    }
    if (params.sort != undefined) {
        if (params.sort == "id") {
            params.sort = "id";
        }
        if (params.sort == "modality") {
            params.sort = "modality_dest";
        }
        if (params.sort == "procedure") {
            params.sort = "exam2do";
        }
        if (toggle_wl=="") {
            s_wl += "&@order="+params.sort;
            toggle_wl="~";
        } else {
            s_wl += "&@order=~"+params.sort;
            toggle_wl="";
        }
    }
    if (params.offset != "0") {
        console.log(params.offset);
        s_wl += "&@offset="+params.offset;
    }
    if (params.limit != "0") {
        console.log(params.offset);
        s_wl += "&@limit="+params.limit;
    }
    console.log('s_wl',s_wl);
    return decodeURI(encodeURI(s_wl));
};

function responseHandler_wl(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'sending_facility': list[i]['sending_facility.facility_name'],
            'receiving_facility': list[i]['receiving_facility.facility_name'],
            'patient': list[i]['id_auth_user.last_name']+' '+list[i]['id_auth_user.first_name'],
            'provider': list[i]['provider.last_name']+' '+list[i]['provider.first_name'],
            'senior': list[i]['senior.last_name']+' '+list[i]['senior.first_name'],
            'procedure': list[i]['exam2do.exam_name'],
            'modality': list[i]['modality.modality_name'],
            'laterality': list[i]['laterality'],
            'requested_time': list[i]['requested_time'],
            'status_flag': list[i]['status_flag'],
            'counter': list[i]['counter'],
            'warning': list[i]['warning'],
            'modified_by': list[i]['modified_by.last_name']+' '+list[i]['modified_by.first_name'],
            'modified_on': list[i]['modified_on'],
            'created_by': list[i]['created_by.last_name']+' '+list[i]['created_by.first_name'],
            'created_on': list[i]['created_on']
        });
    });
    return {    rows: display, 
                total: res.count,
                };
};

function operateFormatter_wl(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="modality_ctr ms-1" href="javascript:void(0)" title="Execute task"><i class="fas fa-heartbeat"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents_wl = {
    'click .modality_ctr': function (e, value, row, index) {
        let dataObj = { 'laterality': row.laterality, 'id': row.id };
        let dataStr;
        if (row.status_flag == 'requested') {
            dataObj['status_flag'] = 'processing';
            dataObj['counter'] = row.counter;
            dataStr = JSON.stringify(dataObj);
            setWlItemStatus(dataStr);
        }
        let controller = modalityDict[row.modality];
        link = HOSTURL+'/myapp/modalityCtr/'+controller+'/'+row.id
        window.location.href = link;
    }
};

function rowStyle_wl(row,value) {
    let statusColor = {'requested':'lightblue', 'processing':'papayawhip', 'done':'#98ff98', 'cancelled':'#ff9999'};
    return { 
                css: { 'background-color': statusColor[row.status_flag] }
            };
};

function detailFormatter_wl(index, row) {
    let lastmodif = Date.parse(row.created_on);
    var rightnow = new Date();
    let elapse = Math.round((rightnow-lastmodif)/1000)-timeOffset;
    let waiting =secondsToHMS(elapse);
    timer_id.push('#waiting_'+row.id);
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Created on: </span>'+ row.created_on+'<span class="badge rounded-pill bg-light text-dark">'+waiting+'</span></p>');
    html.push('<p class=""><span class="fw-bold">Created by: </span>'+ row.created_by+'</p>');
    html.push('<p class=""><span class="fw-bold">ID: </span>'+ row.id);
    html.push('<p class=""><span class="fw-bold">Sending: </span>'+ row.sending_facility+'</p>');
    html.push('<p class=""><span class="fw-bold">Receiving: </span>'+ row.receiving_facility+'</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Patient: </span>'+ row.patient +'</p>');
    html.push('<p class=""><span class="fw-bold">Provider: </span>'+ row.provider +'</p>');
    html.push('<p class=""><span class="fw-bold">Procedure: </span>'+ row.procedure +'</p>');
    html.push('<p class=""><span class="fw-bold">Modality: </span>'+ row.modality +'</p>');
    html.push('<p class=""><span class="fw-bold">Laterality: </span>'+ row.laterality +'</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Timeslot: </span>'+ row.requested_time +'</p>');
    html.push('<p class=""><span class="fw-bold">Status: </span>'+ row.status_flag +'</p>');
    html.push('<p class=""><span class="fw-bold">Counter: </span>'+ row.counter +'</p>');
    html.push('<p class=""><span class="fw-bold">Warning: </span>'+ row.counter +'</p>');
    html.push('</div>');
    html.push('</div></div>');
    return html.join('');
};

function counterFormatter_wl(value,row){ 
    let html = [];
    let lastmodif = Date.parse(row.modified_on);
    var rightnow = new Date();
    // console.log('Rightnow:',rightnow);
    // console.log('Lastmodif:',lastmodif);
    let elapse = Math.round((rightnow-lastmodif)/1000)-timeOffset;
    // console.log('elapse:',elapse);
    timer_id.push('#timer_'+row.id);
    html.push('<div class="d-flex justify-content-between"><span class="badge rounded-pill bg-primary mx-1">'+row.counter+'</span>');
    html.push('<span id="timer_'+row.id+'" class="badge rounded-pill bg-light text-dark mx-1">'+elapse+'</span>');
    html.push('</div>');
    return html.join('');
};

function rowAttributes_wl(row,index) { // set tooltip values
    row.created_by == '' ? createdby = 'created by <strong>unknown</strong>' : createdby = 'created by <strong>'+row.created_by+'</strong>';
    row.created_on == '' ? createdon = ' on <strong>unknown date</strong>' : createdon = ' on <strong>'+row.created_on+'</strong>';
    row.modified_by == '' ? modifiedby = ' modified by <strong>unknown</strong>' : modifiedby = ' modified by <strong>'+row.modified_by+'</strong>';
    row.modified_on == '' ? modifiedon = ' on <strong>unknown date</strong>' : modifiedon = ' on <strong>'+row.modified_on+'</strong>';
    let html = ['<div class="container"><div class="row">'];
    html.push(['<div class="col">'+createdby+createdon+'</div>']);
    html.push(['<div class="col">'+modifiedby+modifiedon+'</div>']);
    html.push('</div></div>');
    html.join('');
    return { 
        "data-bs-html": html,
        "data-bs-toggle": "tooltip"
    };
};

// for rx table
function responseHandler_rx(res) { 
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'id_auth_user': list[i].id_auth_user,
            'id_worklist': list[i].id_worklist,
            'timestamp': list[i]['timestamp'].split('T').join(' '),
            'rx_origin': list[i].rx_origin,
            'glass_type': list[i].glass_type,
            'va_far': list[i].va_far,
            'opto_far': list[i].opto_far,
            'sph_far': list[i].sph_far,
            'cyl_far': list[i].cyl_far,
            'axis_far': list[i].axis_far,
            'rx_far': list[i].sph_far+'('+list[i].cyl_far+'x'+list[i].axis_far+')',
            'se_far': (parseFloat(list[i].sph_far)+0.5*parseFloat(list[i].cyl_far)).toFixed(2),
            'va_int': list[i].va_int,
            'opto_int': list[i].opto_int,
            'sph_int': list[i].sph_int,
            'cyl_int': list[i].cyl_int,
            'axis_int': list[i].axis_int,
            'rx_int': list[i].sph_int+'('+list[i].cyl_int+'x'+list[i].axis_int+')',
            'va_close': list[i].va_close,
            'add': (parseFloat(list[i].sph_close)-parseFloat(list[i].sph_far)).toFixed(2),
            'opto_close': list[i].opto_close,
            'sph_close': list[i].sph_close,
            'cyl_close': list[i].cyl_close,
            'axis_close': list[i].axis_close,
            'rx_close': list[i].sph_close+'('+list[i].cyl_close+'x'+list[i].axis_close+')',
            'note': list[i].note,
            'laterality': list[i]['laterality'],
            'modified_by_name': list[i]['mod.last_name']+' '+list[i]['mod.first_name'],
            'modified_by': list[i]['mod.id'],
            'modified_on': list[i]['modified_on'],
            'created_by': list[i]['creator.id'],
            'created_by_name': list[i]['creator.last_name']+' '+list[i]['creator.first_name'],
            'created_on': list[i]['created_on']
        });
    });
    return {    rows: display, 
                total: res.count,
                };
};

function operateFormatter_rx(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit '+row.laterality+' rx"><i class="fas fa-edit"></i></a>');
    html.push('<a class="cache" href="javascript:void(0)" title="Cache '+row.laterality+' rx"><i class="fas fa-file-import"></i></a>');
    html.push('</div>');
    return html.join('');
  };

window.operateEvents_rx = {
    'click .edit': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        window.location.href = '/myapp/modalityCtr/autorx/'+row.id_worklist;
    },
    'click .cache': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        rxObj.push(row);
        updateCache(rxObj);
    }
};

function detailFormatter_rx(index, row) {
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">ID: </span>'+ row.id);
    html.push('<p class=""><span class="fw-bold">Timestamp: </span>'+ row.timestamp +'</p>');
    html.push('<p class=""><span class="fw-bold">Created on: </span>'+ row.created_on+'</p>');
    html.push('<p class=""><span class="fw-bold">Created by: </span>'+ row.created_by+'</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Origin: </span>'+ row.rx_origin+'</p>');
    html.push('<p class=""><span class="fw-bold">Type: </span>'+ row.glass_type+'</p>');
    html.push('<p class=""><span class="fw-bold">Rx far: </span>'+ row.rx_far +'</p>');
    html.push('<p class=""><span class="fw-bold">Rx int: </span>'+ row.rx_int +'</p>');
    html.push('<p class=""><span class="fw-bold">Rx close: </span>'+ row.rx_close+'(Add+'+row.add+')</p>');
    html.push('<p class=""><span class="fw-bold">Laterality: </span>'+ row.laterality +'</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Va far: </span>'+ row.va_far +'</p>');
    html.push('<p class=""><span class="fw-bold">Va far: </span>'+ row.va_int +'</p>');
    html.push('<p class=""><span class="fw-bold">Va far: </span>'+ row.va_close +'</p>');
    html.push('</div>');
    html.push('</div></div>');
    return html.join('');
};

