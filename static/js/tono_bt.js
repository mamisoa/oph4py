function responseHandler_airPachy(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'laterality': list[i]['laterality'],
            'tonometry': highlightValue(list[i]['tonometry'],20),
            'pachymetry': highlightValue(list[i]['pachymetry'],500,'low'),
            'timestamp': list[i]['timestamp'].split('T').join(' '),
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

function queryParams_airPachy(params) {
    var s="";
    if (params.offset != "0") {
        console.log(params.offset);
        s += "&@offset="+params.offset;
    }
    if (params.limit != "0") {
        console.log(params.offset);
        s += "&@limit="+params.limit;
    }
    console.log('s_wl',s.slice(1-s.length));
    return decodeURI(encodeURI(s.slice(1-s.length)));
};

function operateFormatter_airPachy(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit tono/pachy"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Delete tono/pachy"><i class="fas fa-trash-alt"></i></a>');
    html.push('</div>');
    return html.join('');
  };

window.operateEvents_airPachy = {
    'click .edit': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        document.getElementById("tonoPachyForm").reset();
        $("[name=laterality]").val(row.laterality);
        putTonoPachy(row.id);
    },
    'click .remove': function (e, value, row, index) {
        delTonoPachy(row.id);
    }
};



function highlightValue(str,threshold, direction = 'high') {
    if (direction == 'high') {
        if (parseFloat(str) >=threshold) {
            return '<span style="color: red;"><strong>'+str+'<strong><span>'
        } else {
            return '<span style="color: green;">'+str+'<span>'
        }
    } else {
        if (parseFloat(str) <= threshold) {
            return '<span style="color: red;"><strong>'+str+'<strong><span>'
        } else {
            return '<span style="color: green;">'+str+'<span>'
        }
    };
};
