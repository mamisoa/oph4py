let test = 'test';
function responseHandler_vx(res) { // used if data-response-handler="responseHandler_vl"
    let list = res.mesurements;
    let display = [];
    let kx,rx;
    $.each(list, function (i) {
        list[i]['exam'] == 'topo'? kx = [round2dec(list[i]['k1'],false)+'x'+list[i]['k1_axis']+'°',round2dec(list[i]['k2'],false)+'x'+list[i]['k2_axis']+'°' ] : kx =['-','-'];
        list[i]['exam'] == 'wf'? rx = (round2qter(list[i]['sph5'],true)+'('+round2qter(list[i]['cyl5'],true)+'x'+Math.round(list[i]['axis5'])+'°)'): rx ='-';
        let datetime = list[i]['date'].split('T');
        datetime[0] = datestr2eu(datetime[0]);
        datetime = datetime.join(' ');
        let patientfolder = list[i]['patient'].split('#')
        let patient = [];
        patientfolder.forEach((element,index) => {
            if (index <= 2 && element != '_' ) {
                patient.push(element);
            };
        });
        patient = patient.join(' ');
        display.push({
            'date': datetime,
            'patient': patient,
            'exam': list[i]['exam'],
            'side': list[i]['side'],
            'k1str': kx[0],
            'k2str': kx[1],
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