let test = 'test';
function responseHandler_vx(res) { // used if data-response-handler="responseHandler_vl"
    let list = res.mesurements;
    let display = [];
    test = res;
    $.each(list, function (i) {
        display.push({
            'date': list[i]['date'],
            'exam': list[i]['exam'],
            'side': list[i]['side'],
            'kx': 'k1= '+list[i]['k1']+'x'+list[i]['k1_axis']+'k2= '+list[i]['k2']+'x'+list[i]['k2_axis'],
            'rx': list[i]['sph5']+'('+list[i]['cyl5']+'x'+list[i]['axis5'],
            'k1': list[i]['k1'],
            'k2': list[i]['k2'],
            'k1_axis': list[i]['k1_axis'],
            'k2_axis': list[i]['k2_axis'],
            'sph5': list[i]['sph5'],
            'cyl5': list[i]['cyl5'],
            'axis5': list[i]['axis5']
        });
    });
    return {    rows: display, 
                total: res.count,
                };
};