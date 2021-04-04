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
        console.log(data.items[0]);
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
        $('#wlItemDetails .patientName').html(itemObj['patient.first_name']+' '+itemObj['patient.last_name']);
        $('#wlItemDetails .patientDob').html(itemObj['patient.dob']+' ('+getAge(itemObj['patient.dob'])+'yo)');
        $('#wlItemDetails .timeslot').html(itemObj['requested_time'].split('T').join(' '));
        $('#wlItemDetails .modality').html(itemObj['modality.modality_name']);
        $('#wlItemDetails .laterality').html(itemObj['laterality']);
        $('#wlItemDetails .provider').html(itemObj['provider.first_name']+' '+itemObj['provider.last_name']);
        $('#wlItemDetails .senior').html(itemObj['senior.first_name']+' '+itemObj['senior.last_name']);
        $('#wlItemDetails .status').html(itemObj['status_flag']);
        if (itemObj['status_flag'] == 'done') {
            disableBtn();
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
var idArr = ['#idRightRx','#idLeftRx']; 
var sphCylArr = ['sph_far', 'sph_int', 'sph_close','cyl_far', 'cyl_int', 'cyl_close'];
var axisArr = ['axis_far', 'axis_int', 'axis_close'];
var addArr = ['add_int', 'add_close'];
var vaFarArr = ['va_far', 'va_int'];
var vaCloseArr = ['va_close'];

for (let id of idArr) {
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
      $(id_count+' input.counter_'+count_class).val(result);
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
      $(id_count+' input.counter_'+count_class).val(result);
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

