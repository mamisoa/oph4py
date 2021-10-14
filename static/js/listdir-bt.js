let test = 'test';
function responseHandler_vx(res) { // used if data-response-handler="responseHandler_vl"
    let list = res.mesurements;
    let display = [];
    let kx,rx;
    $.each(list, function (i) {
        list[i]['exam'] == 'topo'? kx = ('k1= '+round2decunsigned(list[i]['k1'])+'x'+list[i]['k1_axis']+' k2= '+round2decunsigned(list[i]['k2'])+'x'+list[i]['k2_axis']): kx ='';
        list[i]['exam'] == 'wf'? rx = (round2qtersigned(list[i]['sph5'])+'('+round2qtersigned(list[i]['cyl5'])+'x'+Math.round(list[i]['axis5'])+')'): rx ='';
        display.push({
            'date': list[i]['date'],
            'patient': list[i]['patient'],
            'exam': list[i]['exam'],
            'side': list[i]['side'],
            'kx': kx,
            'rx': rx,
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