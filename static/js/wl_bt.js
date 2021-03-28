// set parameters for ajax request from bootstrap-table
var s_wl="";
var toggle_wl="";
function queryParams_wl(params) {
    search = params.search.split(",");
    if (search == [""]) {
        s_wl =""
    } else {
        if (search[0]!= undefined) {
            s_wl = "id_auth_user.last_name.startswith=" + capitalize(search[0]);
        } else {
            s_wl = "";
        }
        if (search[1]!= undefined) {
            s_wl += "&id_auth_user.first_name.startswith=" + capitalize(search[1]);
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
        if (params.sort == "patient") {
            params.sort = "id_auth_user";
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
    let nbrows = Object.keys(list).length;
    let display = [];
    $.each(list, function (i) {
        // console.log('id',list[i].id);
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
        });
    });
    // console.log('display',display);
    let test = [{"total": res.count, "items": display}];
    // console.log('test',test);
    // console.log(test[0]['items']);
    return {    rows: display, 
                total: res.count,
                };
};

function operateFormatter_wl(value, row, index) {
    return [
        '<a class="edit" href="javascript:void(0)" title="Edit user">',
        '<i class="fas fa-edit"></i>',
        '</a>  ',
        '<a class="remove ms-1" href="javascript:void(0)" title="Remove">',
        '<i class="fas fa-trash-alt"></i>',
        '</a>',
        '<a class="done ms-1" href="javascript:void(0)" title="Remove">',
        '<i class="fas fa-check"></i>',
        '</a>',
        '<a class="stopwatch ms-1" href="javascript:void(0)" title="Remove">',
        '<i class="fas fa-stopwatch"></i>',
        '</a>'
    ].join('')
  };

window.operateEvents_wl = {
    'click .edit': function (e, value, row, index) {
      console.log('You click action EDIT on row: ' + JSON.stringify(row));
      putWlModal(row.id);
    },
    'click .remove': function (e, value, row, index) {
        delWlItem(row.id);
    },
    'click .stopwatch': function (e, value, row, index) {
        let dataObj = { 'laterality': row.laterality, 'id': row.id };
        let dataStr;
        if ( (row.counter > 0) && (row.status_flag != 'cancelled') ) {
            if (row.counter == 1) {
                dataObj['status_flag'] = 'done';
                dataObj['counter'] = 0;
            } else if (row.counter > 1) {
                dataObj['counter'] = row.counter-1;
                dataObj['status_flag'] = 'processing';
            }
            dataStr = JSON.stringify(dataObj);
            setWlItemStatus(dataStr);
        }
    },
    'click .done': function (e, value, row, index) {
        let dataObj = { 'laterality': row.laterality, 'id': row.id };
        let dataStr;
        if (row.status_flag != 'done') {
            dataObj['status_flag'] = 'done';
            dataObj['counter'] = 0;
            dataStr = JSON.stringify(dataObj);
            setWlItemStatus(dataStr);
        }
    }
};

function rowStyle_wl(row,value) {
    let statusColor = {'requested':'lightblue', 'processing':'papayawhip', 'done':'#98ff98', 'cancelled':'#ff9999'};
    return { 
                css: { 'background-color': statusColor[row.status_flag] }
            };
};

function detailFormatter_wl(index, row) {
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
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