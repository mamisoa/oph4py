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
            'laterality': list[i]['laterality'],
            'k1': list[i].k1,
            'axis1': list[i].axis1,
            'k2': list[i].k2,
            'axis2': list[i].axis2,
            'note': list[i].note,
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

function queryParams(params) {
    var s="";
    if (params.offset != "0") {
        s =="" ? s += "@offset=" + params.offset : s += "&@offset=" + params.offset;
    }
    if (params.limit != "0") {
        s =="" ? s += "@limit=" + params.limit: s += "&@limit=" + params.limit
    }
    // console.log('s:',s);
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
        $('#rxModal').modal('show');
    },
    'click .remove': function (e, value, row, index) {
        console.log('You click action DELETE on row: ' + JSON.stringify(row));
        delItem(row.id,'rx');
    }
};

function detailFormatter(index, row) {
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

function rowStyle_type(row) {
    let bg, statusColor = {'cyclo':'#98ff98' , 'glass':'papayawhip', 'dil':'#98ff98', 'trial':'#00FF00', 'autorx':'white' };
    row.rx_origin != undefined ? bg = statusColor[row.rx_origin] : bg = "white";
    return { 
                css: { 'background-color': bg }
            };
};

function cellStyle_formula(value,row) {
    let bg, statusColor = {'cyclo':'#98ff98' , 'glass':'papayawhip', 'dil':'#98ff98', 'trial':'#00FF00', 'autorx':'white' };
    row.rx_origin != undefined ? bg = statusColor[row.rx_origin] : bg = "white";
    return {    
        css: { 
            'font-weight': 'bold',
            'background-color': bg
        }
    };
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
        // console.log('You click action EDIT on row: ' + JSON.stringify(row));
        document.getElementById("kmFormModal").reset();
        $('#kmFormModal [name=id]').val(row.id);
        $('#kmFormModal [name=id_auth_user]').val(row.id_auth_user);
        $('#kmFormModal [name=id_worklist]').val(row.id_worklist);
        $('#kmFormModal [name=timestamp]').val(row['timestamp'].split(' ').join('T'));
        $('#kmFormModal [name=id_worklist]').val(row.id_worklist);
        $('#kmFormModal [name=laterality]').val([row.laterality]);
        $('#kmFormModal [name=k1]').val(row.k1).trigger('change');
        $('#kmFormModal [name=k2]').val(row.k2).trigger('change');
        $('#kmFormModal [name=axis1]').val(row.axis1);
        $('#kmFormModal [name=axis2]').val(row.axis2);
        $('#kmFormModal [name=note]').val(row.note);
        $('#kmModal').modal('show');
    },
    'click .remove': function (e, value, row, index) {
        // console.log('You click action DELETE on row: ' + JSON.stringify(row));
        delItem(row.id,'km');
    }
};

function detailFormatter(index, row) {
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Origin: </span>'+ row.rx_origin+'</p>');
    html.push('<p class=""><span class="fw-bold">Rx far: </span>'+ row.rx_far +'</p>');
    if ((row.rx_origin == 'glass') || (row.rx_origin == 'trial')) {
        html.push('<p class=""><span class="fw-bold">Rx int: </span>'+ row.rx_int +'</p>');
        html.push('<p class=""><span class="fw-bold">Rx close: </span>'+ row.rx_close+'(Add+'+row.add+')</p>');
    };
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Laterality: </span>'+ (row.laterality).toUpperCase() +'</p>');
    html.push('<p class=""><span class="fw-bold">Va far: </span>'+ row.va_far +'</p>');
    if ((row.rx_origin == 'glass') || (row.rx_origin == 'trial')) {
        html.push('<p class=""><span class="fw-bold">Va int: </span>'+ row.va_int +'</p>');
        html.push('<p class=""><span class="fw-bold">Va close: </span>'+ row.va_close +'</p>');
    };
    html.push('<p class=""><span class="fw-bold">Type: </span>'+ row.glass_type+'</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">ID: </span>'+ row.id);
    html.push('<p class=""><span class="fw-bold">Timestamp: </span>'+ row.timestamp +'</p>');
    html.push('<p class=""><span class="fw-bold">Created by: </span>'+ row.created_by_name+' on '+row.created_on+'</p>');
    html.push('<p class=""><span class="fw-bold">Modified by: </span>'+ row.modified_by_name+' on '+row.modified_on+'</p>');
    html.push('</div>');
    html.push('</div></div>');
    return html.join('');
};

function detailFormatter_km(index, row) {
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">K1: </span>'+ row.k1+'D x '+row.axis1+'°</p>');
    html.push('<p class=""><span class="fw-bold">K2: </span>'+ row.k2+'D x '+row.axis2+'°</p>');
    html.push('<p class=""><span class="fw-bold">Laterality: </span>'+ row.laterality +'</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">ID: </span>'+ row.id);
    html.push('<p class=""><span class="fw-bold">Timestamp: </span>'+ row.timestamp +'</p>');
    html.push('<p class=""><span class="fw-bold">Created by: </span>'+ row.created_by_name+' on '+row.created_on+'</p>');
    html.push('<p class=""><span class="fw-bold">Modified by: </span>'+ row.modified_by_name+' on '+row.modified_on+'</p>');
    html.push('</div>');
    html.push('</div></div>');
    return html.join('');
};
