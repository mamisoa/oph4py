function responseHandler(res) { // used if data-response-handler="responseHandler_wl"
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

function responseHandler_km(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'id_auth_user': list[i].id_auth_user,
            'id_worklist': list[i].id_worklist,
            'timestamp': list[i]['timestamp'].split('T').join(' '),
            'k1': list[i].k1,
            'axis1': list[i].axis1,
            'k2': list[i].k2,
            'axis2': list[i].axis2,
            'note': list[i].note,
            'modified_by': list[i]['mod.last_name']+' '+list[i]['mod.first_name'],
            'modified_on': list[i]['modified_on'],
            'created_by': list[i]['creator.last_name']+' '+list[i]['creator.first_name'],
            'created_on': list[i]['created_on']
        });
    });
    return {    rows: display, 
                total: res.count,
                };
};

function queryParams(params) {
    var s="";
    if (params.offset != "0") {
        // console.log(params.offset);
        s += "&@offset="+params.offset;
    }
    if (params.limit != "0") {
        // console.log(params.offset);
        s += "@limit="+params.limit;
    }
    // return decodeURI(encodeURI(s.slice(1-s.length))); // remove the first &
    return s; // remove the first &
};

function operateFormatter(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit rx"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Delete rx"><i class="fas fa-trash-alt"></i></a>');
    html.push('</div>');
    return html.join('');
  };

window.operateEvents = {
    'click .edit': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        document.getElementById("rxFormModal").reset();
        $('#rxFormModal [name=id]').val(row.id);
        $('#rxFormModal [name=id_auth_user]').val(row.id_auth_user);
        $('#rxFormModal [name=id_worklist]').val(row.id_worklist);
        $('#rxFormModal [name=timestamp]').val(row['timestamp'].split(' ').join('T'));
        $('#rxFormModal [name=laterality]').val([row.laterality]).trigger('change');
        $('#rxFormModal [name=rx_origin]').val([row.rx_origin]).trigger('change');
        $('#rxFormModal [name=glass_type]').val([row.glass_type]).trigger('change');
        $('#rxFormModal [name=va_far]').val(row.va_far);
        $('#rxFormModal [name=opto_far]').val(row.opto_far);
        $('#rxFormModal [name=sph_far]').val(row.sph_far);
        $('#rxFormModal [name=cyl_far]').val(row.cyl_far);
        $('#rxFormModal [name=axis_far]').val(row.axis_far);
        $('#rxFormModal [name=va_int]').val(row.va_int);
        $('#rxFormModal [name=opto_int]').val(row.opto_int);
        $('#rxFormModal [name=sph_int]').val(row.sph_int);
        $('#rxFormModal [name=cyl_int]').val(row.cyl_int);
        $('#rxFormModal [name=axis_int]').val(row.axis_int);
        $('#rxFormModal [name=va_close]').val(row.va_close);
        $('#rxFormModal [name=opto_close]').val(row.opto_close);
        $('#rxFormModal [name=sph_close]').val(row.sph_close);
        $('#rxFormModal [name=cyl_close]').val(row.cyl_close);
        $('#rxFormModal [name=axis_close]').val(row.axis_close);
        $('#rxFormModal [name=note]').val(row.note);
        let add_int = round2dec(parseFloat(row.sph_int)-parseFloat(row.sph_far));
        let add_close = round2dec(parseFloat(row.sph_close)-parseFloat(row.sph_far));
        console.log('add_close',add_close);
        $('#rxFormModal [name=add_int]').val(add_int).trigger('change');
        $('#rxFormModal [name=add_close]').val(add_close).trigger('change');
        $('#rxFormModal [name=methodRxModalSubmit]').val('PUT');
        $('#rxFormModal [name=rx_origin]').trigger('change');
        $('#rxModal').modal('show');
    },
    'click .remove': function (e, value, row, index) {
        console.log('You click action DELETE on row: ' + JSON.stringify(row));
        delItem(row.id,'rx');
    }
};

function operateFormatter_km(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit tono/pachy"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Delete keratometry"><i class="fas fa-trash-alt"></i></a>');
    html.push('</div>');
    return html.join('');
  };

window.operateEvents_km = {
    'click .edit': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
    },
    'click .remove': function (e, value, row, index) {
        console.log('You click action DELETE on row: ' + JSON.stringify(row));
        delItem(row.id,'km');
    }
};