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
            'va_far': list[i].va_far,
            'opto_far': list[i].opto_far,
            'sph_far': list[i].sph_far,
            'cyl_far': list[i].cyl_far,
            'axis_far': list[i].axis_far,
            'rx_far': list[i].sph_far+'('+list[i].cyl_far+'x'+list[i].axis_far+')',
            'se_far': (parseFloat(list[i].sph_far)+0.5*parseFloat(list[i].cyl_far)).toString(),
            'va_int': list[i].va_int,
            'opto_int': list[i].opto_int,
            'sph_int': list[i].sph_int,
            'cyl_int': list[i].cyl_int,
            'axis_int': list[i].axis_int,
            'rx_int': list[i].sph_int+'('+list[i].cyl_int+'x'+list[i].axis_int+')',
            'va_close': list[i].va_close,
            'opto_close': list[i].opto_close,
            'sph_close': list[i].sph_close,
            'cyl_close': list[i].cyl_close,
            'axis_close': list[i].axis_close,
            'rx_close': list[i].sph_close+'('+list[i].cyl_close+'x'+list[i].axis_close+')',
            'note': list[i].note,
            'laterality': list[i]['laterality'],
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
        console.log(params.offset);
        s += "&@offset="+params.offset;
    }
    if (params.limit != "0") {
        console.log(params.offset);
        s += "&@limit="+params.limit;
    }
    return decodeURI(encodeURI(s.slice(1-s.length))); // remove the first &
};

function operateFormatter(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit tono/pachy"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Delete tono/pachy"><i class="fas fa-trash-alt"></i></a>');
    html.push('</div>');
    return html.join('');
  };

window.operateEvents = {
    'click .edit': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
    },
    'click .remove': function (e, value, row, index) {
        console.log('You click action DELETE on row: ' + JSON.stringify(row));
        // delTonoPachy(row.id);
    }
};
