function responseHandler_airPachy(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'tonometry': list[i]['tonometry'],
            'pachymetry': list[i]['pachymetry'],
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

