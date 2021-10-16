function responseHandler_vx(res) { // used if data-response-handler="responseHandler_vl"
    let list = res.mesurements;
    let display = [];
    let kx,rx;
    $.each(list, function (i) {
        list[i]['exam'] == 'topo'? kx = [round2dec(list[i]['k1'],false)+'x'+list[i]['k1_axis']+'°',
            round2dec(list[i]['k2'],false)+'x'+list[i]['k2_axis']+'°' ] : kx =[null,null];
        list[i]['exam'] == 'wf'? rx = (round2qter(list[i]['sph5'],true)+'(' +
            round2qter(list[i]['cyl5'],true)+'x'+Math.round(list[i]['axis5'])+'°)') : rx = null;
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

function operateFormatter(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="import" href="javascript:void(0)" title="Cache '+row.side+' rx"><i class="fas fa-file-import"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents = {
    'click .import': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        // document.getElementById("rxFormModal").reset();
        // $('#rxFormModal [name=id]').val(row.id);
        // $('#rxFormModal [name=id_auth_user]').val(row.id_auth_user);
        // $('#rxFormModal [name=id_worklist]').val(row.id_worklist);
        // $('#rxFormModal [name=timestamp]').val(row['timestamp'].split(' ').join('T'));
        // $('#rxFormModal [name=laterality]').val([row.laterality]).trigger('change');
        // $('#rxFormModal [name=rx_origin]').val([row.rx_origin]).trigger('change');
        // $('#rxFormModal [name=glass_type]').val([row.glass_type]).trigger('change');
        // $('#rxFormModal [name=va_far]').val(row.va_far);
        // $('#rxFormModal [name=opto_far]').val(row.opto_far);
        // $('#rxFormModal [name=sph_far]').val(row.sph_far);
        // $('#rxFormModal [name=cyl_far]').val(row.cyl_far);
        // $('#rxFormModal [name=axis_far]').val(row.axis_far);
        // $('#rxFormModal [name=va_int]').val(row.va_int);
        // $('#rxFormModal [name=opto_int]').val(row.opto_int);
        // $('#rxFormModal [name=sph_int]').val(row.sph_int);
        // $('#rxFormModal [name=cyl_int]').val(row.cyl_int);
        // $('#rxFormModal [name=axis_int]').val(row.axis_int);
        // $('#rxFormModal [name=va_close]').val(row.va_close);
        // $('#rxFormModal [name=opto_close]').val(row.opto_close);
        // $('#rxFormModal [name=sph_close]').val(row.sph_close);
        // $('#rxFormModal [name=cyl_close]').val(row.cyl_close);
        // $('#rxFormModal [name=axis_close]').val(row.axis_close);
        // $('#rxFormModal [name=note]').val(row.note);
        // let add_int = round2dec(parseFloat(row.sph_int)-parseFloat(row.sph_far));
        // let add_close = round2dec(parseFloat(row.sph_close)-parseFloat(row.sph_far));
        // console.log('add_close',add_close);
        // $('#rxFormModal [name=add_int]').val(add_int).trigger('change');
        // $('#rxFormModal [name=add_close]').val(add_close).trigger('change');
        // $('#rxFormModal [name=methodRxModalSubmit]').val('PUT');
        // $('#rxModal').modal('show');
    }
};
