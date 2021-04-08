function responseHandler_mx(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'id_auth_user': list[i].id_auth_user,
            'id_medic_ref': list[i]['medication.id'],
            'medication': list[i]['medication.name'],
            'brand': list[i]['medication.brand'],
            'frequency': list[i].frequency,
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

function queryParams(params) {
    var s = "";
    if (params.offset != "0") {
        // console.log(params.offset);
        s += "&@offset=" + params.offset;
    }
    if (params.limit != "0") {
        // console.log(params.offset);
        s += "&@limit=" + params.limit;
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
 //      document.getElementById("rxFormModal").reset();
 //      $('#rxFormModal [name=note]').val(row.note);
//      $('#rxModal').modal('show');
    },
    'click .remove': function (e, value, row, index) {
        console.log('You click action DELETE on row: ' + JSON.stringify(row));
//        delItem(row.id, 'rx');
    }
};

function detailFormatter_mx(index, row) {
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Origin: </span>' + row.name + '</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('</div>');
    html.push('</div></div>');
    return html.join('');
};
