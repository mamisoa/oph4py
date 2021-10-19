refreshTables(tablesArr);

// remove class top-fixed from topnav
document.getElementById('topNavbar').classList.remove('fixed-top');

// set counters
var idRxArr = ['#idRightRx','#idLeftRx', '#rxFormModal']; 
var sphCylArr = ['sph_far', 'sph_int', 'sph_close','cyl_far', 'cyl_int', 'cyl_close'];
var axisArr = ['axis_far', 'axis_int', 'axis_close'];
var addArr = ['add_int', 'add_close'];
var vaFarArr = ['va_far', 'va_int'];
var vaCloseArr = ['va_close'];

// set rx timestamps
$('#timestampRight').val(new Date().addHours(timeOffsetInHours).toJSON().slice(0,16))
$('#timestampLeft').val(new Date().addHours(timeOffsetInHours).toJSON().slice(0,16))

for (let id of idRxArr) {
  for (let sph of sphCylArr) {
      setCounter(id,sph,0.25,-30,30,2,true);    
  };
  for (let add of addArr) {
      setCounter(id,add,0.25,0,10,2,true);
  };
  for (let axis of axisArr) {
      setCounter(id,axis,5,0,180,0,false);
  };
  for (let va of vaFarArr) {
      setCounter(id,va,0.02,0,2,2,false);
  };
  for (let va of vaCloseArr) {
      setCounter(id,va,0.5,1,8,2,false);
  };
  // update SE
  $(id+' .rxDiv input').change(function(){
    let SEf = (parseFloat($(id+ ' input[name=sph_far]').val())+0.5*parseFloat($(id+ ' input[name=cyl_far]').val())).toFixed(2);
    let SEi = (parseFloat($(id+ ' input[name=sph_int]').val())+0.5*parseFloat($(id+ ' input[name=cyl_int]').val())).toFixed(2);
    let SEc = (parseFloat($(id+ ' input[name=sph_close]').val())+0.5*parseFloat($(id+ ' input[name=cyl_close]').val())).toFixed(2);
    $(id+' .SEf').html(SEf);
    $(id+' .SEi').html(SEi);
    $(id+' .SEc').html(SEc);
    // if axis value is input manually for far, set the other with the same axis
    if ($(this).attr('name')=='axis_far'){
      $(id+' input[name=axis_int]').val($(id+' input[name=axis_far]').val());
      $(id+' input[name=axis_close]').val($(id+' input[name=axis_far]').val());
    };
  });
};

var idKmArr = ['#idRightKm','#idLeftKm', '#kmModal'];
var kmArr = ['km1','km2'];
var axisArr = ['axis1','axis2'];

for (let id of idKmArr) {
  for (let km of kmArr) {
    setCounter(id,km,0.25,35.00,65.00,2,false);
  };
  for (let axis of axisArr) {
    setCounter(id,axis,5,0,180,0,false);
  };
  // km conversions
  $(id+' input').change(function() {
    let k1d = parseFloat(diopter2mm(parseFloat($(id+' input[name=k1]').val())));
    let k2d = parseFloat(diopter2mm(parseFloat($(id+' input[name=k2]').val())));
    let kmd = (k1d+k2d)/2;
    $(id+ ' .kmCalculated').html(kmd.toFixed(2)+'mm ('+diopter2mm(kmd)+'D)');
    $(id+ ' .k1Calculated').html(k1d.toFixed(2)+' mm');
    $(id+ ' .k2Calculated').html(k2d.toFixed(2)+' mm');
  });  
};

// id_count : form id , count_class: tono pachy (counter_tono), step, min, max, precision, show sign
// add update values of sph
function setCounter (id_count, count_class,step, min, max, precision,sign) {
  $(id_count+' .btn.counter_down_'+count_class).click(function() {
    value = parseFloat($(id_count+' input.counter_'+count_class).val());
    if (value >= (min+step)) {
      set = value-step;
      set = Math.round(set*100)/100;
      sign == true? (set > 0? result='+'+set.toFixed(precision) : (result=set.toFixed(precision))) : result=set.toFixed(precision);
      $(id_count+' input.counter_'+count_class).val(result).trigger('change');
    } else {
      set = max;
      set = Math.round(set*100)/100;
      sign == true? (set > 0? result='+'+set.toFixed(precision) : (result=set.toFixed(precision))) : result=set.toFixed(precision);
      $(id_count+' input.counter_'+count_class).val(result).trigger('change');
    };
    if (count_class == 'add_close') {
      add = set + parseFloat($(id_count+' input.sph_far').val());
      $(id_count+' input.sph_close').val(round2dec(add));
      $(id_count+' input.cyl_close').val($(id_count+' input.cyl_far').val());
    } else if (count_class == 'add_int') {
      add = set + parseFloat($(id_count+' input.sph_far').val());
      $(id_count+' input.sph_int').val(round2dec(add));
      $(id_count+' input.cyl_int').val($(id_count+' input.cyl_far').val());
    } else if (count_class == 'sph_far') {
      add_int = set + parseFloat($(id_count+' input.add_int').val());
      $(id_count+' input.sph_int').val(round2dec(add_int));
      add_close = set + parseFloat($(id_count+' input.add_close').val());
      $(id_count+' input.sph_close').val(round2dec(add_close));
    } else if (count_class == 'cyl_far') {
      $(id_count+' input.cyl_int').val($(id_count+' input.cyl_far').val());
      $(id_count+' input.cyl_close').val($(id_count+' input.cyl_far').val());
    } else if (count_class == 'axis_far') {
      $(id_count+' input.axis_int').val($(id_count+' input.axis_far').val());
      $(id_count+' input.axis_close').val($(id_count+' input.axis_far').val());
    };
  });

  $(id_count+' .btn.counter_up_'+count_class).click(function() {
    value = parseFloat($(id_count+' input.counter_'+count_class).val());
    if (value <= (max-step)) {
      set = value+step;
      set = Math.round(set*100)/100;
      sign == true? (set > 0? result='+'+set.toFixed(precision) : (result=set.toFixed(precision))) : result=set.toFixed(precision);
      $(id_count+' input.counter_'+count_class).val(result).trigger('change');
    } else {
      set = min;
      set = Math.round(set*100)/100;
      sign == true? (set > 0? result='+'+set.toFixed(precision) : (result=set.toFixed(precision))) : result=set.toFixed(precision);
      $(id_count+' input.counter_'+count_class).val(result).trigger('change');
    };
    if (count_class == 'add_close') {
      add = set + parseFloat($(id_count+' input.sph_far').val());
      $(id_count+' input.sph_close').val(round2dec(add));
      $(id_count+' input.cyl_close').val($(id_count+' input.cyl_far').val());
    } else if (count_class == 'add_int') {
      add = set + parseFloat($(id_count+' input.sph_far').val());
      $(id_count+' input.sph_int').val(round2dec(add));
      $(id_count+' input.cyl_int').val($(id_count+' input.cyl_far').val());
    } else if (count_class == 'sph_far') {
      add_int = set + parseFloat($(id_count+' input.add_int').val());
      $(id_count+' input.sph_int').val(round2dec(add_int));
      add_close = set + parseFloat($(id_count+' input.add_close').val());
      $(id_count+' input.sph_close').val(round2dec(add_close));
    } else if (count_class == 'cyl_far') {
      $(id_count+' input.cyl_int').val($(id_count+' input.cyl_far').val());
      $(id_count+' input.cyl_close').val($(id_count+' input.cyl_far').val());
    } else if (count_class == 'axis_far') {
      $(id_count+' input.axis_int').val($(id_count+' input.axis_far').val());
      $(id_count+' input.axis_close').val($(id_count+' input.axis_far').val());
    };
  });
};

// set default state for refraction

// set changes when From is selected
for (let rx of idRxArr) {
  let arr;
  if (idRxArr.indexOf(rx) == 0) { // if right side ie first index
    arr = ['#rightTypeDiv', '#intRight', '#closeRight']; //right
  } else if (idRxArr.indexOf(rx) == 1){
    arr = ['#leftTypeDiv', '#intLeft', '#closeLeft']; //left
  } else {
    arr = ['#modalTypeDiv', '#intModal', '#closeModal']; // modal
  };
  // if glass_type is mono or na -> typeDiv hide int and close
  // else show typeDiv int and close
  $(rx + ' input[name=glass_type]').change(function(){
    if ( ($(rx + ' input[name=glass_type]:checked').val() == 'monofocal') || ($(rx + ' input[name=glass_type]:checked').val() == 'na') ) {
      for (hide of arr.slice(1)) {
        $(hide).addClass('visually-hidden');
        if (rx != '#rxFormModal') {
          $(rx+' input[name=va_far]').val('1.0');
          $(rx+' input[name=va_int]').val('');
          $(rx+' input[name=va_close]').val('');
        };
      };
    } else {
      for (show of arr.slice(1)) {
        $(show).removeClass('visually-hidden');
        if (rx != '#rxFormModal') {
          $(rx+' input[name=va_int]').val(''); // no int vision as default, before 1.0
          $(rx+' input[name=va_close]').val('2');
        };
      };
    };
  });
  // if origin of rx is autorx, cyclo, dil -> hide int and close, reset them to 0 and hide them
  $(rx+' input[name=rx_origin]').change(function () {
    if (rx == '#idRightRx') {
      console.log('#idRightRx changed');
      $('#idLeftRx input[name=rx_origin][value="'+$('#idRightRx input[name=rx_origin]:checked').val()+'"]').prop('checked', true);
    } else if (rx == '#idLeftRx') {
      console.log('#leftTypeDiv changed');
      $('#idRightRx input[name=rx_origin][value="'+$('#idLeftRx input[name=rx_origin]:checked').val()+'"]').prop('checked', true);
    };
    if (($(rx+' input[name=rx_origin]:checked').val() == 'trial') || ($(rx+' input[name=rx_origin]:checked').val() == 'glass')) {
      // if glass or trial, show (right/left)TypeDiv and set default values
      // $(arr[0]).removeClass('visually-hidden');
      $('#rightTypeDiv').removeClass('visually-hidden');
      $('#leftTypeDiv').removeClass('visually-hidden');
      // $('#idGetFromMachines').addClass('visually-hidden');
      if (rx != '#rxFormModal') {
        $(rx+' input[name=va_far]').val('1.0');
        $(rx+' input[name=va_int]').val('');
        $(rx+' input[name=va_close]').val('');
      };
    } else {
      // else if not glass or trial, hide (right/left)TypeDiv and set default values
      // and show get buttons
      // $(arr[0]).addClass('visually-hidden');
      $('#rightTypeDiv').addClass('visually-hidden');
      $('#leftTypeDiv').addClass('visually-hidden');
      // $('#idGetFromMachines').removeClass('visually-hidden');
      if (rx != '#rxFormModal') {
        $(rx+' input[name=va_far]').val('');
        $(rx+' input[name=va_int]').val(''); // no int vision as default, before 1.0
        $(rx+' input[name=va_close]').val('2');
        for (hide of arr.slice(1)) {
          $(hide).addClass('visually-hidden');
        };
        // reset int and close fields to 0 if monofocal dil cyclo
        $(rx+' input[name=sph_int]').val($(rx+' input[name=sph_far]').val());
        $(rx+' input[name=cyl_int]').val($(rx+' input[name=cyl_far]').val());
        $(rx+' input[name=axis_int]').val($(rx+' input[name=axis_far]').val());
        $(rx+' input[name=sph_close]').val($(rx+' input[name=sph_far]').val());
        $(rx+' input[name=cyl_close]').val($(rx+' input[name=cyl_far]').val());
        $(rx+' input[name=axis_close]').val($(rx+' input[name=axis_far]').val());
        $(rx+' input[name=add_int]').val(round2dec(0));
        $(rx+' input[name=add_close]').val(round2dec(0));
      };
    };
  });
};

// set default glass then rx_origin (order important)
$('input[name=glass_type]').val(['monofocal']).trigger('change');
$('input[name=rx_origin]').val(['autorx']).trigger('change');

// sync right and left rx type


// set rx submit buttons
$('#idRightRx').submit(function(e){
  e.preventDefault();
  rxInsert('#idRightRx','right');
});

$('#idLeftRx').submit(function (e) {
  e.preventDefault();
  rxInsert('#idLeftRx', 'left');
});

$('#btnAddBothRx').click(function () {
  rxInsert('#idRightRx','right');
  rxInsert('#idLeftRx', 'left');
});

$('#idRightKm').submit(function(e){
  e.preventDefault();
  kmInsert('#idRightKm','right');
});

$('#idLeftKm').submit(function (e) {
  e.preventDefault();
  kmInsert('#idLeftKm', 'left');
});

$('#rxFormModal').submit(function (e) {
  e.preventDefault();
  let dataStr = $(this).serializeJSON();
  let dataObj = JSON.parse(dataStr);
  console.log("dataForm",dataObj);
  if ((dataObj['rx_origin'] != 'glass') && (dataObj['rx_origin'] != 'trial')) {
    dataObj['glass_type'] = 'na';
  };
  delete dataObj['add_int'];
  delete dataObj['add_close'];
  let req = dataObj['methodRxModalSubmit'];
  delete dataObj['methodRxModalSubmit'];
  dataStr = JSON.stringify(dataObj);
  crud('rx','0', req, dataStr);
  refreshTables(tablesArr);
  $('#rxModal').modal('hide');
});

$('#kmFormModal').submit(function(e) {
  e.preventDefault();
  let dataStr = $(this).serializeJSON();
  let dataObj = JSON.parse(dataStr);
  let req = dataObj['methodKmModalSubmit'];
  delete dataObj['methodKmModalSubmit'];
  // console.log("dataForm",dataObj);
  dataStr = JSON.stringify(dataObj);
  crud('km','0', req, dataStr);
  refreshTables(tablesArr);
  $('#kmModal').modal('hide');
});

function refreshMachine(machine='l80') {
  let API_R, API_L;
  machine == 'l80'? [API_R,API_L] = [API_L80_R,API_L80_L] : [API_R,API_L] = [API_VX100_R,API_VX100_L];
  $('#visionixRight_tbl').bootstrapTable(
    'refresh',
    {
    url: API_R
    }
  );
  $('#visionixLeft_tbl').bootstrapTable(
    'refresh',
    {
    url: API_L
    }
  );
};

// show machineModal
$('#btnGetFromL80').click(function() {
  refreshMachine('l80');
  document.getElementById('importMachineTitle').innerHTML = 'Import from L80'
  $('#machineModal').modal('show');
});
$('#btnGetFromVx100').click(function() {
  refreshMachine('vx100');
  document.getElementById('importMachineTitle').innerHTML = 'Import from VX100'
  $('#machineModal').modal('show');
});

// domId eg #idRightRx , laterality eg 'right', default status = measure
function rxInsert(domId,laterality,status=1) {
  let dataStr = $(domId).serializeJSON();
  let dataObj = JSON.parse(dataStr);
  console.log('rx dataObj:',dataObj);
  dataObj['laterality'] = laterality;
  // dataObj['status'] = status;
  // dataObj['timestamp']= new Date().addHours(timeOffsetInHours).toJSON().slice(0,16);
  // console.log('rx_origin',dataObj['rx_origin']);
  if ((dataObj['rx_origin'] != 'glass') && (dataObj['rx_origin'] != 'trial')) {
    dataObj['glass_type'] = 'na';
    dataObj['va_close'] = dataObj['va_int']='';
  };
  delete dataObj['add_int'];
  delete dataObj['add_close'];
  // console.log('dataObj',dataObj);
  dataStr = JSON.stringify(dataObj);
  crud('rx','0','POST', dataStr);
  $('#rx'+capitalize(laterality)+'_tbl').bootstrapTable('refresh');
};

// domId eg #idRightRx , laterality eg 'right', default status = measure
function kmInsert(domId,laterality) {
  let dataStr = $(domId).serializeJSON();
  let dataObj = JSON.parse(dataStr);
  console.log(dataObj);
  dataObj['laterality'] = laterality;
  dataObj['timestamp']= new Date().addHours(timeOffsetInHours).toJSON().slice(0,16);
  console.log('dataObj',dataObj);
  dataStr = JSON.stringify(dataObj);
  crud('km','0','POST', dataStr);
  $('#km'+capitalize(laterality)+'_tbl').bootstrapTable('refresh');
};

function delItem (id,table) {
  bootbox.confirm({
      message: "Are you sure you want to delete this "+table+" ?",
      closeButton: false ,
      buttons: {
          confirm: {
              label: 'Yes',
              className: 'btn-success'
          },
          cancel: {
              label: 'No',
              className: 'btn-danger'
          }
      },
      callback: function (result) {
          if (result == true) {
              crud(table,id,'DELETE');
              refreshTables(tablesArr);
          } else {
              console.log('This was logged in the callback: ' + result);
          }
      }
  });
};
