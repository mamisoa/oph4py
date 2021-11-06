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
            'rx_far': round2dec(list[i].sph_far)+'('+round2dec(list[i].cyl_far)+'x'+list[i].axis_far+')',
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
            'pd05' : list[i]['pd05'],
            'color' : list[i]['color'],
            'note': list[i].note,
            'id_pair': list[i].id_pair,
            'status': list[i].status,
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
        // console.log('You click action EDIT on row: ' + JSON.stringify(row));
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
        $('#rxFormModal [name=pd05]').val(row.pd05);
        $('#rxFormModal [name=color]').val(row.color);
        $('#rxFormModal [name=status]').val(row.status);
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

function cellStyle(value,row) {
    let statusColor = {'cyclo':'#98ff98' , 'glass':'papayawhip', 'dil':'#98ff98', 'trial':'#00FF00', 'autorx':'white' };
    row.color != undefined ? bg = row.color : bg = statusColor[row.rx_origin];
    return {    
        css: { 
            'background-color': bg,
            'color': bg
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
    html.push('<p class=""><span class="fw-bold">ID_pair: </span>'+ row.id_pair);
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

// import visionix machine in bs-table
function responseHandler_vx(res) { // used if data-response-handler="responseHandler_vl"
    let list = res.mesurements;
    // console.log(list);
    let display = [];
    let kx,rx;
    $.each(list, function (i) {
        if (list[i]['exam'] == 'ark') {
            rx = (round2qter(list[i]['sph5'], true) + '(' +
                round2qter(list[i]['cyl5'], true) + 'x' + Math.round(list[i]['axis5']) + '°)');
            kx = [round2dec(list[i]['k1'], false) + 'x' + list[i]['k1_axis'] + '°',
            round2dec(list[i]['k2'], false) + 'x' + list[i]['k2_axis'] + '°'];
        } else if (list[i]['exam'] == 'topo'){
            kx = [round2dec(list[i]['k1'], false) + 'x' + list[i]['k1_axis'] + '°',
                round2dec(list[i]['k2'], false) + 'x' + list[i]['k2_axis'] + '°'];
            rx = null;
        } else if (list[i]['exam'] == 'wf') {
            rx = (round2qter(list[i]['sph5'], true) + '(' +
                round2qter(list[i]['cyl5'], true) + 'x' + Math.round(list[i]['axis5']) + '°)');
            kx = [null,null];
        } else {
            rx = null;
            kx = [null, null];
        };
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
        // console.log('kx:', kx, 'rx', rx)
        patient = patient.join(' ');
        display.push({
            'date': datetime,
            'patient': patient,
            'exam': list[i]['exam'],
            'side': list[i]['side'],
            'k1str': kx[0],
            'k2str': kx[1],
            'rx': rx,
            'k1': list[i]['k1'] == null?list[i]['k1']:diopter2mm(list[i]['k1']),
            'k2': list[i]['k2'] == null?list[i]['k1']:diopter2mm(list[i]['k2']),
            'k1_axis': list[i]['k1_axis'],
            'k2_axis': list[i]['k2_axis'],
            'pd05' : list[i]['pd05'],
            'sph5': list[i]['sph5'],
            'cyl5': list[i]['cyl5'],
            'axis5': list[i]['axis5']
        });
    });
    return {    rows: display, 
                total: res.count,
                };
};

function operateFormatter_vx(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="import" href="javascript:void(0)" title="Cache '+row.side+' rx"><i class="fas fa-file-import"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents_vx = {
    'click .import': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        let side = capitalize(row.side);
        let domIdRx = '#id' + side + 'Rx';
        let domIdKm = '#id' + side + 'Km';
        // $('#rxFormModal [name=timestamp]').val(row['timestamp'].split(' ').join('T'));
        // have to add timestamp in form and default in rx/kminsert if not set.
        // have to add uuid for each pair of rx
        // $('#rxFormModal [name=va_far]').val(row.va_far);
        // $('#rxFormModal [name=opto_far]').val(row.opto_far);
        if (row.exam == 'topo') {
            $(domIdKm + ' [name=k1]').val(row.k1);
            $(domIdKm + ' [name=axis1]').val(row.k1_axis);
            $(domIdKm + ' [name=k2]').val(row.k2);
            $(domIdKm + ' [name=axis2]').val(row.k2_axis);
            $(domIdRx + ' [name=pd05]').val(row.pd05);
        };
        if (row.exam == 'wf') {
            $(domIdRx + ' [name=sph_far]').val(round2qter(row.sph5,true)).trigger('change');
            $(domIdRx + ' [name=cyl_far]').val(round2qter(row.cyl5,true)).trigger('change');
            $(domIdRx + ' [name=axis_far]').val(Math.round(row.axis5)).trigger('change');
            $(domIdRx + ' [name=sph_int]').val(round2qter(row.sph5, true)).trigger('change');
            $(domIdRx + ' [name=cyl_int]').val(round2qter(row.cyl5, true)).trigger('change');
            $(domIdRx + ' [name=axis_int]').val(Math.round(row.axis5)).trigger('change');
            $(domIdRx + ' [name=sph_close]').val(round2qter(row.sph5, true)).trigger('change');
            $(domIdRx + ' [name=cyl_close]').val(round2qter(row.cyl5, true)).trigger('change');
            $(domIdRx + ' [name=axis_close]').val(Math.round(row.axis5)).trigger('change');
        };
        if (row.exam == 'ark') {
            $(domIdRx + ' [name=sph_far]').val(round2qter(row.sph5, true)).trigger('change');
            $(domIdRx + ' [name=cyl_far]').val(round2qter(row.cyl5, true)).trigger('change');
            $(domIdRx + ' [name=axis_far]').val(Math.round(row.axis5)).trigger('change');
            $(domIdRx + ' [name=sph_int]').val(round2qter(row.sph5, true)).trigger('change');
            $(domIdRx + ' [name=cyl_int]').val(round2qter(row.cyl5, true)).trigger('change');
            $(domIdRx + ' [name=axis_int]').val(Math.round(row.axis5)).trigger('change');
            $(domIdRx + ' [name=sph_close]').val(round2qter(row.sph5, true)).trigger('change');
            $(domIdRx + ' [name=cyl_close]').val(round2qter(row.cyl5, true)).trigger('change');
            $(domIdRx + ' [name=axis_close]').val(Math.round(row.axis5)).trigger('change');
            $(domIdKm + ' [name=k1]').val(row.k1);
            $(domIdKm + ' [name=axis1]').val(row.k1_axis);
            $(domIdKm + ' [name=k2]').val(row.k2);
            $(domIdKm + ' [name=axis2]').val(row.k2_axis);
            $(domIdRx + ' [name=pd05]').val(row.pd05);
        };
    }
};

// import cv5000 rx in bs-table
function responseHandler_cvrx(res) {
    let list = res['rx']['measures'];
    // console.log(list);
    let display = [];
    $.each(list, function (i) {
        display.push({
            'type': list[i]['TypeName'],
            'TypeNo': list[i]['TypeNo'],
            'Distance': list[i]['Distance'],
            'vaR': list[i]['vaR'],
            'vaL': list[i]['VaL'],
            'vaB': list[i]['vaB'],
            'pdR': list[i]['31.75'],
            'pdL': list[i]['31.75'],
            'pdB': list[i]['pdB'],
            'SphR': list[i]['SphR'],
            'CylR': list[i]['CylR'],
            'AxisR': list[i]['AxisR'],
            'HPriR': list[i]['HPriR'],
            'HBaseR': list[i]['HBaseR'],
            'VPriR': list[i]['VpriR'],
            'VBaseR': list[i]['VBaseR'],
            'PrismR': list[i]['PrismR'],
            'AngleR': list[i]['AngleR'],
            'SphL': list[i]['SphL'],
            'CylL': list[i]['CylL'],
            'AxisL': list[i]['AxisL'],
            'HPriL': list[i]['HPriL'],
            'HBaseL': list[i]['HbaseL'],
            'VPriL': list[i]['VPriL'],
            'VBaseL': list[i]['BU'],
            'PrismL': list[i]['PrismL'],
            'AngleL': list[i]['AngleL'],
            'rxright': `${list[i]['SphR']}(${list[i]['CylR']}x${list[i]['AxisR']}°) `+`VA=${checkIfDataIsNull(list[i]['vaR'])}`,
            'rxleft': `${list[i]['SphL']}(${list[i]['CylL']}x${list[i]['AxisL']}°) `+ `VA=${checkIfDataIsNull(list[i]['vaL'])}`,
            'pupilsd': `${list[i]['pdB']}mm`
        });
    });
    return {    rows: display, 
                total: list.count,
                };
};

function operateFormatter_cvrx(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="import" href="javascript:void(0)" title="cache '+index+' km"><i class="fas fa-file-download"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents_cvrx = {
    'click .import': function (e, value, row, index) {
        // console.log('You click action EDIT on row: ' + JSON.stringify(row));
        cacheCVtbl(JSON.stringify(row),'rx')
        // crud right rx
        // crud left rx
    }
};

function rowStyle_rx(row) {
    let bg, statusColor = {'Objective Data':'white' , 'Full Correction':'white', 'Prescription': '#00FF00',
        'Current Spectacles': 'papayawhip', 'Last Prescription': 'papayawhip' };
    row.type != undefined ? bg = statusColor[row.type] : bg = "white";
    return { 
                css: { 'background-color': bg }
            };
};

// import cv5000 km in bs-table
function responseHandler_cvkm(res) {
    let list = res['km']['measures'];
    // console.log(list);
    let display = [];
    $.each(list, function (i) {
        display.push({
            'R1Radius': list[i]['R1Radius'],
            'R1Power': list[i]['R1Power'],
            'R1Axis': list[i]['R1Axis'],
            'R2Radius': list[i]['R2Radius'],
            'R2Power': list[i]['R2Power'],
            'R2Axis': list[i]['R2Axis'],
            'CylPower': list[i]['CylPower'],
            'CylAxis': list[i]['CylAxis'],
            'AverageRadius': list[i]['AverageRadius'],
            'AveragePower': list[i]['AveragePower'],
            'side': list[i]['side'],
            'kmformula': `R1=${list[i]['R1Radius']}x${list[i]['R1Axis']}° - R2=${list[i]['R2Radius']}x${list[i]['R2Axis']}°`
        });
    });
    return {    rows: display, 
                total: list.count,
                };
};

function operateFormatter_cvkm(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="import" href="javascript:void(0)" title="cache '+index+' km"><i class="fas fa-file-download"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents_cvkm = {
    'click .import': function (e, value, row, index) {
        cacheCVtbl(JSON.stringify(row),'km')
        // console.log('You click action EDIT on row: ' + JSON.stringify(row));
        // crud right km
        // crud left km
    }
};

function rowStyle_km(row) {
    let bg, statusColor = {'R':'#F0F8FF' , 'L':'#FFF5EE'};
    row.side != undefined ? bg = statusColor[row.side] : bg = "white";
    return { 
                css: { 'background-color': bg }
            };
};

cvtblCounter = 1;
exportDict = {
    'patient': {
        'firstName': patientObj.first_name,
        'lastName' : patientObj.last_name,
        'patientid': patientObj.id,
        'gender' : genderIdObj[patientObj['gender']],
        'dob' : patientObj.dob,
        'age' : getAge(patientObj.dob),
        'date' : getToday()['date'],
        'time' : getToday()['time']
    },
    rx: {
        'count': '0',
        'measures' : []
    },
    km :{
        'count': '0',
        'measures' : []
    }
};

function removecvMeasure(mesType,id) {
    $(`#cvtrcounter_${id}`).remove();
    console.log(exportDict[mesType]['measures']);
    exportDict[mesType]['measures'].forEach(function(measure, index) {
        console.log('measure',measure);
        if (measure['id'] == id) {
            console.log('to delete', delete exportDict[mesType]['measures'][index]);
            exportDict[mesType]['measures'].splice(index,1);
            };
        exportDict[mesType]['count'] = String(parseInt(exportDict[mesType]['count'],10)-1);
        }
    );
};

function cacheCVtbl(data, datatype) {
    data = JSON.parse(data);
    console.log(data);
    if (data == {} || data == undefined) { return; };
    let html = [];
    html.push(`<tr id="cvtrcounter_${cvtblCounter}">`);
    html.push(`<td>${cvtblCounter}</td>`);
    html.push(`<td>${datatype}</td>`);
    if (datatype == 'rx') {
        html.push(`<td>RE: ${data.rxright} LE: ${data.rxleft}</td>`);
        data['id']=cvtblCounter;
        exportDict['rx']['measures'].push(data);
        exportDict['rx']['count'] = String(1+parseInt(exportDict['rx']['count'],10))
    } else {
        html.push(`<td>${data.side}E: ${data.kmformula}</td>`);
        data['id']=cvtblCounter;
        exportDict['km']['measures'].push(data);
        exportDict['km']['count'] = String(1+parseInt(exportDict['km']['count'],10))
    }
    html.push(`<td><button type="button" onclick="removecvMeasure('${datatype}',${cvtblCounter});" class="btn btn-danger"><i class="fas fa-trash-alt"></i></button></td>`);
    html.push('</tr>');
    cvtblCounter += 1;
    document.getElementById("cvtblBody").innerHTML += html.join('');
    console.log('item count:', document.getElementById('cvtblBody').childElementCount);
};

