refreshTables(tablesArr);
// get wl details
var wlItemObj;

function getWlDetails(wlId){
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: HOSTURL+"/myapp/api/worklist/"+wlId+"?@lookup=patient!:id_auth_user[id,last_name,first_name,dob,photob64],modality!:modality_dest[id,modality_name],provider!:provider[id,last_name,first_name,dob],senior!:senior[id,last_name,first_name,dob]",
            success: function(data) {
                if (data.status != 'error' || data.count) {
                    displayToast('success', 'GET combo exams', 'GET'+data.items[0]['patient.first_name']+' '+data.items[0]['patient.last_name'],3000);
                } else {
                    displayToast('error', 'GET error', 'Cannot retrieve combo exams');
                }
            }, // success
            error: function (er) {
                console.log(er);
            }
        })
    ); // promise return data
};

getWlDetails(wlId)
    .then(function (data) {
        // console.log(data.items[0]);
        let html = [];
        let dataWl = data.items[0];
        for (item in dataWl) {
            html.push('<p>Key: '+item+' - Value: '+dataWl[item]+'</p>');
        }
        $('#wldetails').append(html.join(''));
        return data.items[0];
    })
    .then(function (itemObj){ // set patient ID in top bar
        wlItemObj = Object.assign({},itemObj); // clone wltitemobj in global
        $('input[name=id_auth_user]').val(wlItemObj['patient.id']); // set patient id in forms
        $('input[name=id_worklist]').val(wlItemObj['id']); // set patient id in forms
        $('#wlItemDetails .patientName').html(itemObj['patient.first_name']+' '+itemObj['patient.last_name']);
        $('#wlItemDetails .patientDob').html(itemObj['patient.dob']+' ('+getAge(itemObj['patient.dob'])+'yo)');
        $('#wlItemDetails .timeslot').html(itemObj['requested_time'].split('T').join(' '));
        $('#wlItemDetails .modality').html(itemObj['modality.modality_name']);
        $('#wlItemDetails .laterality').html(itemObj['laterality']);
        $('#wlItemDetails .provider').html(itemObj['provider.first_name']+' '+itemObj['provider.last_name']);
        $('#wlItemDetails .senior').html(itemObj['senior.first_name']+' '+itemObj['senior.last_name']);
        $('#wlItemDetails .status').html(itemObj['status_flag']);
        if (itemObj['status_flag'] == 'done') {
            disableBtn(btnArr);
        }
        wlItemObj['warning'] != null? $('#wlItemDetails .warning').html('<i class="fas fa-exclamation-circle"></i> '+itemObj['warning']) : $('#wlItemDetails .warning').html('').removeClass('bg-danger text-wrap');
        if (wlItemObj['patient.photob64'] == null) {
            $('#photoDiv').addClass('visually-hidden');
            $('#patientIdDiv').removeClass('text-end').addClass('text-center');
        } else {
            document.getElementById("photoId").setAttribute("src",wlItemObj['patient.photob64']);
        }
});

// set counters
var idRxArr = ['#idRightRx','#idLeftRx', '#rxFormModal']; 
var sphCylArr = ['sph_far', 'sph_int', 'sph_close','cyl_far', 'cyl_int', 'cyl_close'];
var axisArr = ['axis_far', 'axis_int', 'axis_close'];
var addArr = ['add_int', 'add_close'];
var vaFarArr = ['va_far', 'va_int'];
var vaCloseArr = ['va_close'];

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
  });
};

var idKmArr = ['#idRightKm','#idLeftKm'];
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
    } else {};
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
    } else {};
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
// let idArr = ['#idRightRx', '#idLeftRx', '#rxFormModal'];
for (let rx of idRxArr) {
  let arr;
  if (idRxArr.indexOf(rx) == 0) { // if right side ie first index
    arr = ['#rightTypeDiv', '#intRight', '#closeRight'];
  } else if (idRxArr.indexOf(rx) == 1){
    arr = ['#leftTypeDiv', '#intLeft', '#closeLeft'];
  } else {
    arr = ['#modalTypeDiv', '#intModal', '#closeModal'];
  };
  // if glass_type is mono or na -> typeDiv hide int and close
  // else show typeDiv int and close
  $(rx + ' input[name=glass_type]').change(function(){
    if ( ($(rx + ' input[name=glass_type]:checked').val() == 'monofocal') || ($(rx + ' input[name=glass_type]:checked').val() == 'na') ) {
      for (hide of arr.slice(1)) {
        $(hide).addClass('visually-hidden');
      };
    } else {
      for (show of arr.slice(1)) {
        $(show).removeClass('visually-hidden');
      };
    };
  });
  $(rx+' input[name=rx_origin]').change(function () {
    if (($(rx+' input[name=rx_origin]:checked').val() == 'trial') || ($(rx+' input[name=rx_origin]:checked').val() == 'glass')) {
      $(arr[0]).removeClass('visually-hidden');
    } else {
      $(arr[0]).addClass('visually-hidden');
    };
  });
};

// set default rx_origin and glass
$('input[name=rx_origin]').val(['autorx']).trigger('change');
$('input[name=glass_type]').val(['monofocal']).trigger('change');

// set rx submit buttons
$('#idRightRx').submit(function(e){
  e.preventDefault();
  rxInsert('#idRightRx','right');
});

$('#idLeftRx').submit(function (e) {
  e.preventDefault();
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
  delete dataObj['add_int'];
  delete dataObj['add_close'];
  let req = dataObj['methodRxModalSubmit'];
  delete dataObj['methodRxModalSubmit'];
  dataStr = JSON.stringify(dataObj);
  crud('rx','0', req, dataStr);
  console.log(tablesArr);
  refreshTables(tablesArr);
  $('#rxModal').modal('hide');
});

// domId eg #idRightRx , laterality eg 'right', default status = measure
function rxInsert(domId,laterality,status=1) {
  let dataStr = $(domId).serializeJSON();
  let dataObj = JSON.parse(dataStr);
  console.log(dataObj);
  dataObj['laterality'] = laterality;
  dataObj['status'] = status;
  dataObj['timestamp']= new Date().addHours(timeOffsetInHours).toJSON().slice(0,16);
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

// set task to done and disable form buttons
$('#btnTaskDone').click(function() {
  bootbox.confirm({
      message: "Are you sure you want to set this task to DONE?",
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
              let dataObj = { 'laterality': wlItemObj['laterality'], 'id': wlId };
              let dataStr;
              if (wlItemObj['status_flag'] != 'done') {
                  dataObj['status_flag'] = 'done';
                  dataObj['counter'] = 0;
                  dataStr = JSON.stringify(dataObj);
                  crud('worklist','0','PUT', dataStr);
                  getWlDetails(wlId) // check if set to done successful and disable forms
                      .then(function (itemObj) {
                          wlItemObj = Object.assign({},itemObj.items[0]); // clone wltitemobj in global
                          if (wlItemObj['status_flag'] == 'done') {
                              $('#wlItemDetails .status').html(wlItemObj['status_flag']);
                              disableBtn(btnArr);
                          };
                          window.location.href = '/myapp/worklist';
                      });
              }
          } // end if
      } // end callback
  }); //end bootbox
});
