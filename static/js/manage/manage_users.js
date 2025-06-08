// global vars
var $alert = $('.alert_listing').hide();
var $alert_wl = $('.alert_wl').hide();
var timer_id = [];
var toast_counter = 0, time_counter = 0;
var providers = concatFirstLastname(providers_req);

// bootstrap # table setup ------------------------------------------------------------------------------
// queryParams, responseHandler, detailFormatter, actionFormatter, remove_user, windowAction

function queryParams(params) {
  return {};
} // end queryParams - if not present, queryParams are add after url

function responseHandler(res) {
  list = res.content;
  display = [];
  $.each(list, function(i) {
    display.push({
      'id': list[i].user.id,
      'first_name': list[i].user.first_name,
      'last_name': list[i].user.last_name,
      'dob': list[i].user.dob,
      'gender': list[i].gender.sex,
      'UID': shorter5(list[i].user.unique_id),
      'age': getAge(list[i].user.dob),
      'created_by': list[i].creator.first_name+' '+list[i].creator.last_name,
      'created_on': list[i].user.created_on,
      'modified_by': list[i].editor.first_name+' '+list[i].editor.last_name,
      'modified_on': list[i].user.modified_on,
    });
  });
  //console.log(display);
  return display;
} // end function responseHandler

function detailFormatter(index, row) {
  var html = [];
  label = { // key : description
    id: 'ID',
    uid: 'UID',
    first_name: 'First name',
    last_name: 'Last name',
    dob: 'Date of birth',
    age: 'Age',
    gender: 'Gender',
    created_by: 'Creator',
    created_on: 'on',
    modified_by: 'Last modified by',
    modified_on: 'on'
  };
  $.each(row, function(key, value) {
    if (!(key in label)) {}
    else if (( key == 'created_by') || ( key == 'modified_by')){
      html.push('<p><strong>' + label[key] + ': </strong><span class="font-weight-bold font-italic">' + value + '<span></p>');
    }
    else {
      html.push('<p><strong>' + label[key] + ':</strong> ' + value + '</p>');
    }
  });
  return html.join('');
} // end detailFormatter

// data-events --------------------------------

function actionFormatter(value, row, index) {
  return [
    '<ul class="nav">',
    '<li class="nav-item"><a class="nav-link like" href="javascript:void(0)" title="Like">', '<i class="fas fa-info-circle"></i>', '</a></li>',
    '<li class="nav-item"><a class="nav-link prx" href="javascript:void(0)" title="Rx">', '<i class="fas fa-file-prescription"></i>', '</a></li>',
    '<li class="nav-item"><a class="nav-link worklist" href="javascript:void(0)" title="Add to WL">', '<i class="fas fa-tasks"></i>', '</a></li>',
    '<li class="nav-item"><a class="nav-link edit"  href="',URL_USER_FORM,[row.id],'" title="Edit">', '<i class="fas fa-edit"></i>', '</a></li>',
    '<li class="nav-item ml-auto pt-2"><a class="spacer" href="javascript:" title="Spacer"><i class="border"></i></a></li>',
    '<li class="nav-item "><a class="nav-link remove" href="javascript:void(0)" title="Remove">', '<i class="fas fa-trash-alt"></i>', '</a></li>',
    '</ul>'
  ].join('');
} // end actionFormatter

window.actionEvents = {
  'click .like': function(e, value, row, index) {
    alert('You click like action, row: ' + JSON.stringify(row));
  },
  'click .remove': function(e, value, row, index) {
    remove_user(row.id);
  },
  'click .worklist':function (e,value,row) {
        resetForm($('#form_wl'));
        setSelect('#form_wl select.procedure', exams, 'exam_description','7'); // rx
        setSelect('#form_wl select.sending_facility', facilities, 'facility_name','2'); // desk1
        setSelect('#form_wl select.receving_facility', facilities, 'facility_name','4'); // iris
        setSelect('#form_wl select.provider', providers, 'name','1'); // me
        setSelect('#form_wl select.modality_dest', modalities, 'modality_name','11'); // n/a
        $('#form_wl .requested_time').val(flatpickr.formatDate(new Date(), "Y-m-d H:i:S"));
        $('#form_wl .id_auth_user').val(row.id);
        $('#form_wl .provider').val(1); // select class does not work?
        $('#form_wl .status_flag').val('requested'); // select class does not work?
        $('#form_wl .patient').text(row.first_name+' '+(row.last_name).toUpperCase());
        $('#form_wl .counter').val(!row.cycle_num ? '1': row.cycle_num);
        $('#modal_wl').modal('show');
        $('#form_wl label.laterality_both').addClass('active'); // set both as default after modal is shown
        $('#form_wl input.laterality_both').prop('checked',true);
  }
}; // end actionEvents

function remove_user(id) {
  let API_URL = API_URL_AUTH+id;
  let modalDelete = bootbox.confirm ({
    message: "<h5>Are you sure you want to delete user #"+ id+ " ?<h5>",
    show: true,
    size: 'lg',
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
      if (result) {
        $.ajax({
          url: API_URL,
          type: 'delete',
          beforeSend: function () {time_counter = Date.now();},
          success: function(text) {
            if (text.indexOf('CANNOT') != -1) {
              create_toast(toast_counter,time_counter, 'Status', 'danger','User '+id+' not deleted!');
              // showAlert('Cannot delete user ' + id + '!', 'danger', 'alert_listing');
            } else {
              $table.bootstrapTable('refresh');
              create_toast(toast_counter,time_counter, 'Status', 'success','User '+id+' deleted');
              // showAlert('User ' + id + ' deleted', 'success', 'alert_listing');
            }
          },
          error: function() {
            create_toast(toast_counter,time_counter, 'Status', 'danger','User '+id+' not deleted!');
            // showAlert('Cannot delete user ' + id + ' error!', 'danger', 'alert_listing');
          }
        });
      } else {}
    }
  });
} // remove_user function


// end data-events --------------------------------

// end bootstrap #table setup --------------------------------------------------------------------------

// bootstrap #wl setup ------------------------------------------------------------------------------
// queryParams, responseHandler_wl, detailFormatter_wl, actionFormatter_wl, **** windowAction

function responseHandler_wl(res) {
  worklist = res.content;
  display = [];
  $.each(worklist, function(i) {
    display.push({'id': worklist[i].worklist.id,
     'provider': worklist[i].provider.first_name+' '+worklist[i].provider.last_name,
     'provider_id': worklist[i].provider.id,
     'patient': worklist[i].patient.first_name+' '+worklist[i].patient.last_name,
     'id_auth_user': worklist[i].worklist.id_auth_user,
     'receving_facility': worklist[i].receiver.facility_name,
     'sending_facility': worklist[i].sender.facility_name,
     'message_unique_id': worklist[i].worklist.message_unique_id,
     'requested_time': worklist[i].worklist.requested_time,
     'status_flag': worklist[i].worklist.status_flag,
     'modality_dest': worklist[i].modality.modality_name,
     'created_by': worklist[i].creator.first_name+' '+worklist[i].creator.last_name,
     'created_on': worklist[i].worklist.created_on,
     'modified_by': worklist[i].editor.first_name+' '+worklist[i].editor.last_name,
     'modified_on': worklist[i].worklist.modified_on,
     'procedure': worklist[i].procedure.id,
     'controller': worklist[i].procedure.controller,
     'exam_description': worklist[i].procedure.exam_description,
     'counter': worklist[i].worklist.counter,
     'procedure_seq': worklist[i].procedure.procedure_seq,
     'cycle_num': worklist[i].procedure.cycle_num,
     'laterality': worklist[i].worklist.laterality,
     'warning': worklist[i].worklist.warning,
     'sending_fac_num': worklist[i].receiver.id,
     'receiving_fac_num': worklist[i].sender.id
    });
  });
  return display;
}

function detailFormatter_wl(index, row) {
  var html = [];
  label = { // only labels to show, function detailFormatter_wl loop thru all fields
            id: 'ID',
            exam_description: 'Exam to be done',
            provider: 'Provider', receving_facility: 'Department',
            requested_time: 'Timeslot', modality_dest: 'Modality destination', status_flag: 'Status',
            created_by: 'Creator', created_on: 'on', modified_by: 'Last modified by', modified_on: 'on'
          };
  $.each(row, function (key, value) {
    // console.log(key);
    if (!(key in label)) {
    } else if (( key == 'created_by') || ( key == 'modified_by')) {
      html.push('<p><strong>' + label[key] + ': </strong><span class="font-weight-bold font-italic">' + value + '<span></p>');
    }
    else {
      html.push('<p><strong>' + label[key] + ':</strong> ' + value + '</p>');
    }
  });
  return html.join('');
}

function statusFormatter(index,row) {
  let flag = {
    'requested':'<i class="fas fa-file-prescription text-danger fa-2x" title="requested"></i>', 'processing': '<i class="fas fa-sync text-warning" title="Processing..."></i>',
    'cancelled': '<i class="far fa-window-close text-danger fa-2x" title="Cancelled"></i>', 'done':'<i class="fas fa-check text-success fa-2x" title="Done"></i>'
  };
  return '<div class="d-flex justify-content-center">'+flag[row.status_flag]+'</div>';
  // return row.status_flag;
}

function actionFormatter_wl(value,row) {
    let API_URL = API_URL_EXAMS.slice(0,-5);
    return [
      '<ul id="actionFormatter_wl" class="nav d-flex justify-content-between align-items-center">',
        '<li class="nav-item"><a class="details" href="'+API_URL+'/'+row.controller+'?id_auth_user='+row.id_auth_user+'&id_worklist='+row.id+'" title="Details"><i class="fas fa-plus"></i></a></li>',
        '<li class="nav-item"><a class="processing" href="javascript:" title="Set task as in process"><i class="fas fa-clock"></i></a></li>',
        '<li class="nav-item"><a class="done" href="javascript:" title="Set task as done"><i class="far fa-check-circle"></i></a></li>',
        '<li class="nav-item"><a class="update" href="javascript:" title="Update task"><i class="fas fa-edit"></i></a></li>',
        '<li class="nav-item"><a class="spacer" href="javascript:" title="Spacer"><i class=""></i></a></li>',
        '<li class="nav-item ml-2"><a class="remove" href="javascript:" title="Delete task"><i class="fas fa-trash-alt"></i></a></li>',
      '</ul>',
    ].join('');
}

function modalityFormatter(value,row) {
  let html = [];
  let lastmodif = Date.parse(row.modified_on);
  let rightnow = new Date();
  elapse = Math.round((rightnow-lastmodif)/1000);
  timer_id.push('#timer_'+row.id);
  html.push('<div class="float-left">'+value+'</div><div class="float-right">');
  if ( !row.counter ) {
    // html.push('<div class="float-right">');
  } else {
    html.push('<div class="d-inline"><span class="badge badge-warning badge-counter">'+row.counter+'</span>');
  }
  html.push('<div class="d-inline"><span id="timer_'+row.id+'" class="badge badge-danger badge-timer ml-1 mb-1" >'+elapse+'</span></div>');
  html.push('</div>');
  return html.join('');
}

function examFormatter(value,row) {
  let html = [];
  html.push('<div class="float-left">'+value+'</div><div class="float-right ">');
  if (!row.warning) { }
  else { html.push('<div class=" d-inline"><span class="badge badge-warning">'+row.warning+'</span></div>');}
  if (!row.procedure_seq) { }
  else { html.push('<div class="d-inline mx-1"><span class="badge badge-info badge-procedure">'+row.procedure_seq+'</span></div>');}
  html.push('<div class="d-inline "><span class=" badge badge-danger badge-laterality">'+row.laterality+'</span></div>');
  html.push('</div>');
  return html.join('');
}

// window_actionEvent_wl
// update, flags (done, processing), remove

window.actionEvents_wl = {
  'click .update': function (e,value,row) { // set values of wl items to pass to modal-wl form
    resetForm($('#form_wl'));
    setSelect('#form_wl select.procedure', exams, 'exam_description');
    setSelect('#form_wl select.sending_facility', facilities, 'facility_name',row.sending_fac_num);
    setSelect('#form_wl select.receving_facility', facilities, 'facility_name',row.receiving_fac_num);
    setSelect('#form_wl select.provider', providers, 'name');
    setSelect('#form_wl select.modality_dest', modalities, 'modality_name');
    $('#form_wl .patient').text(row.patient);
    $('#form_wl .id').val(row.id);
    $('#form_wl .id_auth_user').val(row.id_auth_user);
    $('#form_wl .message_unique_id').text(row.message_unique_id);
    $('#form_wl input.requested_time').val(row.requested_time);
    $('#form_wl select.procedure').val(row.procedure);
    $('#form_wl select.provider').val(row.provider_id);
    $('#form_wl select.status_flag').val(row.status_flag);
    $('#form_wl input.warning').val(row.warning);
    console.log('before init: '+row.laterality);
    !row.counter ? $('#form_wl input.counter').val('0') : $('#form_wl input.counter').val(row.counter);
    !row.laterality ? $('#form_wl input.laterality_both').prop('checked',true).parent().addClass('active') : $('#form_wl input.laterality_'+row.laterality).prop('checked',true).parent().addClass('active');
    $('input:radio[name=laterality]').val(!row.laterality ? 'both':row.laterality);
    console.log('after init: '+$('input:radio[name=laterality]').val());
    $('#modal_wl').modal('show');
  },
  'click .done': function (e,value,row) { // set task to done
    simple_row = {id: row.id, status_flag: 'done'};
    $.ajax({
      url:  API_WL+ row.id,
      type: 'put',
      beforeSend: function () {time_counter = Date.now();},
      contentType: 'application/json',
      data: JSON.stringify(simple_row),
      success: function (text) {
        id = text.slice(text.indexOf('id(')+3,text.indexOf(') ***'));
        if ( id == 'None') {
          create_toast(toast_counter,time_counter, 'Status error', 'danger','Unable to modify task#'+simple_row['id']+' status!');
        } else {
          $table_wl.bootstrapTable('refresh');
          create_toast(toast_counter,time_counter, 'Status info', 'success','Task #'+id+'set as done.');
        }
        },
        error: function () {
          create_toast(toast_counter,time_counter, 'Status error', 'danger','Unable to modify task#'+simple_row['id']+' status!');
        }
      });
  },
  'click .processing': function (e,value,row) { // set task to processing
    let simple_row = {id: row.id};
    let flag = 'processing';
    if (row.counter >= 1) {
      simple_row['counter'] = parseInt(row.counter,10)-1;
    } else if (row.counter == 1){
      simple_row['counter'] = parseInt(row.counter,10)-1;
    } else {
      flag = 'done';
    }
    simple_row['status_flag'] = flag;
    // console.log(row);
    $.ajax({
      url:  API_WL+'/worklist/'+ row.id,
      type: 'put',
      contentType: 'application/json',
      beforeSend: function () {time_counter = Date.now();},
      data: JSON.stringify(simple_row),
      success: function (text) {
        id = text.slice(text.indexOf('id(')+3,text.indexOf(') ***'));
        if ( id == 'None') {
          create_toast(toast_counter,time_counter, 'Status error', 'danger','Unable to modify task#'+simple_row['id']+' status!');
        } else {
          $table_wl.bootstrapTable('refresh');
          create_toast(toast_counter,time_counter, 'Status info', 'success','Task #'+id+'set as processing.');
        }
        },
        error: function () {
          create_toast(toast_counter,time_counter, 'Status error', 'danger','Unable to modify task#'+simple_row['id']+' status!');
        }
    });
  },
  'click .remove': function (e, value, row) { // delete a wl item in db
    let API_URL = API_WL+'/worklist/'+row.id;
    let modalWlDelete = bootbox.confirm({
      message: "<h5>Are you sure you want to delete task #"+ row.id + " for "+row.patient+" ?<h5>",
      show: true,
      size: 'lg',
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
        if (result) {
          $.ajax({
              url: API_URL,
              type: 'delete',
              beforeSend: function () {time_counter = Date.now();},
              success: function () {
                  $table_wl.bootstrapTable('refresh');
                  create_toast(toast_counter,time_counter, 'Status info', 'success','Worlisk task #'+row.id+' deleted!');
              },
              error: function () {
                  create_toast(toast_counter,time_counter, 'Status error', 'danger','Unable to delete worlist task#'+row.id+' !');
                  showAlert('Delete item error!', 'danger', 'alert_wl');
              }
          });
        } else {}
      } // end callback
    }); // end modalWlDelete
  } // end click .remove
};

function rowStyle(row, index) {
    var classes = ['active', 'success', 'info', 'warning', 'danger'];
    if (row.status_flag == 'requested') {
        return { classes: classes[4] };
    } else if (row.status_flag== 'processing') {
        return { classes: classes[2] };
    } else if (row.status_flag== 'done') {
        return { classes: classes[1] };
    } else if (row.status_flag== 'cancelled') {
        return { classes: classes[3] };
    }
    return {};
}

// set tooltip values
function rowAttributes(row,index) {
  row.created_by == '' ? createdby = 'created by unknown' : createdby = 'created by '+row.created_by;
  row.created_on == '' ? createdon = ' on unknown date' : createdon = ' on '+row.created_on;
  row.modified_by == '' ? modifiedby = ' modified by unknown' : modifiedby = ' modified by '+row.modified_by;
  row.modified_on == '' ? modifiedon = ' on unknown date' : modifiedon = ' on '+row.modified_on;
  return { "title": createdby + createdon + modifiedby + modifiedon,
    "data-toggle": "tooltip"
  };
}


// end bootstrap #wl setup --------------------------------------------------------------------------

// change value of input when change select in form, after modal init
$('#phone select.phone_origin').change(function () {
   $('#phone input.phone_origin').val($(this).val());
});

$('#facility_io select.sending_facility').change(function () {
   $('#facility_io input.sending_facility').val($(this).val());
});

$('#facility_io select.receving_facility').change(function () {
   $('#facility_io input.receving_facility').val($(this).val());
});


// document ready function, sets forms and buttons ----------------------------------------------------
$(function() {

// init date picker
  $(".requested_time").flatpickr({
      minDate: "today",
      enableTime: true,
      dateFormat: "Y-m-d H:i:S",
      defaultDate: flatpickr.formatDate(new Date(), "Y-m-d H:i:S"),
      time_24hr: true,
      allowInput: true
  });



// init modals
  var $modal = $('#modal').modal({show: false}), // hide modals
    $modal_wl = $('#modal_wl').modal({show: false});

  var $duplicate = $('.duplicate').hide();
  resetForm($('#new_patient'));

  // change value of input when change select in form
  $('#phone select.phone_origin').change(function () {
     $('#phone input.phone_origin').val($(this).val());
  });

  $('.date_selection').hide();
  $('.today').text(flatpickr.formatDate(new Date(), "d/m/Y"));

/*
  $("body").tooltip({
    selector: '[data-toggle=tooltip]'
  });
*/
  $modal.on('hidden.bs.modal', function() {
    $('.submit').show();
    $duplicate.hide();
  });

  $('#modal', '#modal_wl')
    .on('shown.bs.modal', function (e) {
      $('#new_patient').validator();
      $('#modal_wl').validator();
        })
    .on('hidden.bs.modal', function (e) {
      $('#new_patient').validator('destroy');
      $('#modal_wl').validator('destroy');
      });

  $('.create').click(function() {
    $('#postget').replaceWith('<span id="postget">Create</span>');
    resetForm($('#new_patient'));
    $modal.modal('show');
    data_origin(origin.phones);
    $('#new_patient input.country').val('Belgium');
    $('#new_patient input.phone_prefix').val('+32');
  });

  // $('#edit_user').click(function() {
  //   $('#postget').replaceWith('<span id="postget">Edit</span>');
  //   $modal.modal('show');
  // });

  $('#eId').click(function () {
    $.ajax({
      url: API_BEID,
      type: 'get',
      contentType: 'application/json',
      dataType: "json",
      beforeSend: function () {time_counter = Date.now();},
      success: function(data) {
        if (Object.keys(data).length==0) {
          create_toast(toast_counter,time_counter, 'Status error', 'danger','Cannot read eId informations');
        } else {
          let home_num = data.adresse.match(/\d+/)[0];
          let adresse = data.adresse.replace(/\d+/g,'');
          $('#new_patient input.last_name').val(data.nom);
          $('#new_patient input.first_name').val(data.prenoms);
          $('#new_patient input.dob').val(convertDate(data.date_naissance));
          $('#new_patient input.birth_town').val(data.lieu_naissance);
          $('#new_patient input.nationality').val(data.nationalite);
          $('#new_patient input.home_num').val(home_num);
          $('#new_patient input.address1').val(adresse);
          $('#new_patient input.town').val(data.localite);
          $('#new_patient input.zipcode').val(data.code_postal);
          $('#new_patient input.idc_num').val(data.num_carte);
          $('#new_patient input.ssn').val(data.num_nat);
          let gender = { 'M': '1', 'F':'2' };
          console.log("sexe:",gender[data.sexe]);
          $('input:radio[name=gender]').filter('[value="'+gender[data.sexe]+'"]').prop('checked',true);
          let src = "data:image/jpeg;base64,";
          src += data.photo;
          console.log(src);
          var newImage = document.createElement('img');
          newImage.src = src;
          newImage.width = "140";
          newImage.height = "200";
          document.querySelector('#photo_container').innerHTML = newImage.outerHTML;
          $('#new_patient input.b64img').val(src);
          create_toast(toast_counter,time_counter, 'Status info', 'success','eId informations read');
        }
      },
      error: function () {
        create_toast(toast_counter,time_counter, 'Status error', 'danger','Cannot read eId informations');
      }
    });
});
//not used?
  function edit_user(id) {
    console.log('EDITING USER' + id);
  }

  // procedure count
  $(".btn.counter_down").click(function() {
    value = parseInt($("input.counter").val());
    if (value >= 1) {
      $("input.counter").val(value-1);
    } else {}
  });

  $(".btn.counter_up").click(function() {
    value = parseInt($("input.counter").val());
    if (value >= 0) {
      $("input.counter").val(value+1);
    } else {}
  });

// #table settings and get/post/put functions
// submit modal, post_new_user_form, generate_unique_id, add_membership, check_duplicate

  $modal.find('.submit').click(function(e) {
    if ($('#new_patient .submit').hasClass('disabled')) {
      e.preventDefault();
      return true;
    } else {
      var row = {};
      e.preventDefault(); // on empeche l'envoi du formulaire par le navigateur
      $modal.find('input[name]').each(function() {
        row[$(this).attr('name')] = $(this).val();
      });
      row['gender'] = $('input:radio[name=gender]').filter(':checked').val();
      row['first_name'] = titleCase($('input[name=first_name]').val());
      row['last_name'] = titleCase($('input[name=last_name]').val());
      row['marital'] = '4'; // 4 unknown
      if (membership == '4') {
        row['password'] = randomPassword(8); // don't forget to send password by email later, and encrypt!
      }
      delete row['passwordcheck'];
      generate_unique_id(row); // generate uid and post
    }
  });

  function post_new_user_form(row) {
    let rowMain = row;
    let rowAddress = { 'home_num': row['home_num'], 'box_num': row['box_num'],
      'address1': row['address1'], 'address2': row['address2'],
      'zipcode': row['zipcode'], 'town':row['town'], 'country':row['country'] };
    let rowPhone = {
      'phone_prefix': row['phone_prefix'], 'phone':row['phone'], 'phone_origin':row['phone_origin']
    };
    let rowPhoto = { 'b64img': row['b64img']
    };
    for (let key in rowMain ) {
      if ( key == 'home_num' || key == 'box_num' || key == 'address1' ||
             key == 'address2' ||  key == 'zipcode' ||  key == 'town' || key == 'country' ||
             key == 'phone_prefix' || key == 'phone' || key == 'phone_origin' || key == 'b64img'
            ) {
               delete rowMain[key];
             }
    }
    $.ajax({
      url: API_URL_AUTH,
      type: 'post',
      contentType: 'application/json',
      beforeSend: function () {time_counter = Date.now();},
      data: JSON.stringify(rowMain),
      success: function(text) {
        let id = text.slice(text.indexOf('id(') + 3, text.indexOf(') ***'));
        let result=text.slice(text.indexOf('<Row {')+5,text.indexOf('}>')+1);
        if (result != '{}') {
          result=result.replace(/'/g,'"');
          result=result.replace(/\\xc3\\xaa/g,'ê');
          let objResult = JSON.parse(result);
          let html =['<ul>'];
          for (let code in objResult) {
            html.push('<li>Field:'+code+' Error: '+objResult[code]+'</li>');
          }
          html.push('</ul>');
          $modal.modal('hide');
          create_toast(toast_counter,time_counter, 'Status error', 'danger','<span>Unable to add user!<span>'+html.join(''));
        } else {
          add_membership(id,membership); // default membership is patient
          rowAddress.id_auth_user = id; // add id to post address
          post_address_form(rowAddress,'POST');
          rowPhone.id_auth_user = id;
          post_phone_form(rowPhone, 'POST');
          rowPhoto.id_auth_user = id;
          console.log(rowPhoto);
          post_photo_form(rowPhoto, 'POST');
          $modal.modal('hide');
          resetForm($('#new_patient'));
          $table.bootstrapTable('refresh');
          create_toast(toast_counter,time_counter, 'Status info', 'success','New user #'+id+' successfully added.');
        }
      },
      error: function(text) {
        $modal.modal('hide');
        create_toast(toast_counter,time_counter, 'Status error', 'danger','Unable to add user!');
      }
    });
  }

  function post_address_form(row,req) {
    let API_URL = (req == 'POST' ? API_URL_ADDRESS : API_URL_ADDRESS+'/'+ row.id);
    let mode = (req == 'POST' ? 'add':'edit');
    $.ajax({
      url: API_URL,
      type: req == 'POST' ? 'post':'put',
      beforeSend: function () {time_counter = Date.now();},
      contentType: 'application/json',
      data: JSON.stringify(row),
      success: function (text) {
        id = text.slice(text.indexOf('id(')+3,text.indexOf(') ***'));
        if ( id == 'None') {
          create_toast(toast_counter,time_counter, 'Status', 'danger','Unable to '+mode+' address!');
        } else {
        create_toast(toast_counter,time_counter, 'Status', 'success','Address '+mode+'ed');
        }
      },
      error: function () {
          create_toast(toast_counter,time_counter, 'Status', 'danger','Unable to '+mode+' address!');
      }
    });
  }

  function post_phone_form(row,req) {
    let API_URL = (req == 'POST' ? API_URL_PHONE : API_URL_PHONE+'/'+ row.id);
    let mode = (req == 'POST' ? 'add':'edit');
    $.ajax({
      url: API_URL,
      type: req == 'POST' ? 'post':'put',
      beforeSend: function () {time_counter = Date.now();},
      contentType: 'application/json',
      data: JSON.stringify(row),
      success: function (text) {
        id = text.slice(text.indexOf('id(')+3,text.indexOf(') ***'));
        if ( id == 'None') {
          create_toast(toast_counter,time_counter, 'Status', 'danger','Unable to '+mode+' phone');
        } else {
        create_toast(toast_counter,time_counter, 'Status', 'success','Phone '+mode+'ed');
        }
      },
      error: function () {
          create_toast(toast_counter,time_counter, 'Status', 'danger','Unable to '+mode+' phone');
      }
    });
  }

  function post_photo_form(row,req) {
    let API_URL = (req == 'POST' ? API_URL_PHOTO : API_URL_PHOTO+'/'+ row.id);
    let mode = (req == 'POST' ? 'add':'edit');
    $.ajax({
      url: API_URL,
      type: req == 'POST' ? 'post':'put',
      beforeSend: function () {time_counter = Date.now();},
      contentType: 'application/json',
      data: JSON.stringify(row),
      success: function (text) {
        id = text.slice(text.indexOf('id(')+3,text.indexOf(') ***'));
        if ( id == 'None') {
          create_toast(toast_counter,time_counter, 'Status', 'danger','Unable to '+mode+' photo');
        } else {
        create_toast(toast_counter,time_counter, 'Status', 'success','Photo '+mode+'ed');
        }
      },
      error: function () {
          create_toast(toast_counter,time_counter, 'Status', 'danger','Unable to '+mode+' photo');
      }
    });
  }


  function generate_unique_id(row) { // generate uid and post
    $.getJSON(API_UNIQUE_ID)
      .done(function(json) {
        unique_id = json.uid;
        row['unique_id'] = unique_id;
        if (row['email'] =='') {
          row['email']= shorter5(unique_id)+'@no.email';
        }
        post_new_user_form(row);
        $table.bootstrapTable('refresh');
      })
      .fail(function(jqxhr, textStatus, error) {
        $modal.modal('hide');
        showAlert('Unable to add new patient!', 'danger', 'alert_listing');
      });
  }

  function add_membership(user_id,membership) { // set membership to user_id
    var row = {
      'user_id': user_id,
      'group_id': membership
    };
    $.ajax({
      url: API_URL_MEMBERSHIP,
      type: 'post',
      contentType: 'application/json',
      beforeSend: function () {time_counter = Date.now();},
      data: JSON.stringify(row),
      success: function(text) {
        create_toast(toast_counter,time_counter, 'Status info', 'success','New user #'+row.user_id+' affected to group #'+row.group_id);
      },
      error: function() {
        create_toast(toast_counter,time_counter, 'Status info', 'danger','Unable to affect user #'+row.user_id+' to group #'+row.group_id);
      }
    });
  }

  function check_duplicate(first, last, dob, row) { // check duplicate with first_name last_name dob
    let API_URL = API_URL_USER + encodeURIComponent(first) + '/' + encodeURIComponent(last) + '/' + dob;
    $.ajax({
      url: API_URL,
      type: 'get',
      contentType: 'application/json',
      dataType: "json",
      success: function(data) {
        duplicate_list = data.content;
        if (jQuery.isEmptyObject(duplicate_list) == true) {
          // console.log('Not a duplicate');
          post_new_user_form(row);
        } else {
          // console.log('Duplicate check');
          $duplicate.show();
          $('.submit').hide();
          $('#check_duplicate').click(function() {
            post_new_user_form(row);
            $('.submit').show();
            $duplicate.hide();
          });
        }
      },
      error: function() {
        showAlert('Unable to check if duplicate!', 'danger', 'alert_listing');
      }
    });
  }

// #wl_table settings and get/post/put functions
// date range, modal submit, post_wl_form, set_timers

  $('#search_date .submit').click(function(e){
    e.preventDefault(); // on empeche l'envoi du formulaire par le navigateur
    let date_after= $('#search_date input[name=date_after]').val(); // mettre date d'aujourd'hui par défaut
    let date_before= $('#search_date input[name=date_before]').val();
    $('.today').hide();
    $('.date_selection').show();
    $('.date_selection span.date_after').text(reverseDate(date_after));
    $('.date_selection span.date_before').text(reverseDate(date_before));
    $table_wl.bootstrapTable('refresh', {
      url: API_WL+'?date_after='+date_after+'&date_before='+date_before
    });
  });

  $modal_wl.find('.submit').click(function (e) { // create or edit a worklist item
    if ( $('#form_wl .submit').hasClass('disabled'))
      {
        e.preventDefault();
        $('.alert_lat').text('Class disabled error');
        return true;
      }
    else {
      let row = {}, req;
      e.preventDefault(); // on empeche l'envoi du formulaire par le navigateur
      $('#form_wl').find('input[name]').each(function () {
        row[$(this).attr('name')] = $(this).val();
      });
      $('#form_wl').find('select[name]').each(function () {
        row[$(this).attr('name')] = $(this).val();
      });
      if (!$('input:radio[name=laterality]').filter(':checked').val()) {
        $('.alert_lat').text('Please set laterality');
        return true;
      } else {
      row['laterality']= $('input:radio[name=laterality]').filter(':checked').val();
      }
      if (row['id'] == '') {
        req = 'POST';
        delete row['id'];
        post_wl_form(row,req);
      } else {
        req = 'PUT';
        delete row['id_auth_user'];
        post_wl_form(row,req);
        }
      }
  });

  function post_wl_form(row,req) { // create or edit a wl item in db
    let API_URL = (req == 'POST' ? API_WL+'/worklist/' : API_WL+'/worklist/'+ row.id);
    let mode = (req == 'POST' ? 'add':'edit');
    $.ajax({
      url: API_URL,
      type: req == 'POST' ? 'post':'put',
      contentType: 'application/json',
      beforeSend: function () {time_counter = Date.now();},
      data: JSON.stringify(row),
      success: function (text) {
        id = text.slice(text.indexOf('id(')+3,text.indexOf(') ***'));
        let result=text.slice(text.indexOf('<Row {')+5,text.indexOf('}>')+1);
        if ( (result != '{}') && (req=='POST')) {
          $modal_wl.modal('hide');
          result=result.replace(/'/g,'"');
          result=result.replace(/\\xc3\\xaa/g,'ê');
          let objResult = JSON.parse(result);
          let html =['<ul>'];
          for (let code in objResult) {
            html.push('<li>Field:'+code+' Error: '+objResult[code]+'</li>');
          }
          html.push('</ul>');
          $modal.modal('hide');
          create_toast(toast_counter,time_counter, 'Status error', 'danger','<span>Unable to'+mode+' task #'+(row.id || '')+' to worklist!</span>'+html.join(''));
        } else if ((id !='None')&&(req=='PUT')){
          $modal_wl.modal('hide');
          resetForm($('#form_wl'));
          $table_wl.bootstrapTable('refresh');
          create_toast(toast_counter,time_counter, 'Status info', 'success','Task #'+id+' '+mode+'ed.');
        } else {
        $modal_wl.modal('hide');
        resetForm($('#form_wl'));
        $table_wl.bootstrapTable('refresh');
        create_toast(toast_counter,time_counter, 'Status info', 'success','<span>'+titleCase(mode)+' task #'+(row.id || '')+' to worklist!</span>');
          }
        },
      error: function (text) {
        $modal_wl.modal('hide');
        create_toast(toast_counter,time_counter, 'Status error', 'danger','<span>Unable to'+mode+' task #'+(row.id || '')+' to worklist!</span>');
      }
    });
  }

  $('#wl_table').on('post-body.bs.table', function () {
    set_timers(timer_id);
  });

});
// end document.ready ---------------------------------------------------------------------------------


// functions tools -------------------------------------------------------------------------------------

// converting functions
// getAge, concatFirstLastname, shorter5

function getAge(dateString) { // dob to age
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return (age>1 ? age+' ans' : age+' an');
}

function concatFirstLastname(rows) {
  let items = rows.content;
  let result = {content: []};
  let duplicate = {}; // check for duplicate id (always increasing, so comparaison is thru the list versus previous item)
  $.each(items, function(i) {
    let current = items[i]['id'];
    if (duplicate != current) {
      result['content'].push({
        'id': items[i]['id'],
        'name': items[i]['first_name'] + ' ' + items[i]['last_name']
      });
      duplicate = current;
    } else {}
  });
  return result;
}

function shorter5(str) {
  var res = str.slice(0, 5);
  return res;
}

function data_origin(row) {
  let html = [];
  $.each(row, function (key, value) {
    html.push('<option value="'+row[key]['origin']+'">'+row[key]['origin']+'</option>');
  });
  $('#phone select.phone_origin').html(html.join(''));
  $('#phone select.phone_origin option[value="Cellular"]').attr("selected",true);
  $('#phone input.phone_origin').val('Cellular');
}


// generator functions
// randomPassword, generate_pass, set_timers

function randomPassword(length) {
  var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
  var pass = "";
  for (var x = 0; x < length; x++) {
    var i = Math.floor(Math.random() * chars.length);
    pass += chars.charAt(i);
  }
  return pass;
}

function generate_pass() {
  password_generated = randomPassword(8);
  new_patient.password.value = password_generated;
  new_patient.passwordcheck.value = password_generated;
}

function set_timers(timers) {
  $.each(timers, function(i){
    $(timers[i]).timer({
      seconds: $(timers[i]).text()
    });
  });
  timer_id = [];
}

// form functions
// titleCase, setSelect (dropdown), resetForm

function titleCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function setSelect(id, rows, description, deflt) {
  let items = rows.content;
  html = [];
  $.each(items, function(i) {
    if (items[i]['id']!= deflt){
        html.push('<option value="' + items[i]['id'] + '" data-tokens="' + items[i][description].split(" ", 2) + '">' + items[i][description] + '</option>');
    } else {
      html.push('<option selected ="selected" value="' + items[i]['id'] + '" data-tokens="' + items[i][description].split(" ", 2) + '">' + items[i][description] + '</option>');
    }
  });
  $(id).html(html.join(''));
}

function resetForm($form) { // blank a form
  $form.find('input:text,input:password, input:file, select, textarea').val('');
  $form.find('input:radio, input:checkbox')
    .removeAttr('checked').removeAttr('selected').parent().removeClass('active');
}

function reverseDate(dateStr) {
    var parts = dateStr.split("-");
    date_fr = parts.reverse();
    return date_fr.join('/');
}

function convertDate(dateStr) {
    var parts = dateStr.split("/");
    date_univ = parts.reverse();
    return date_univ.join('-');
}
// css functions

// id: number of toast, start: time at execution, header: text header, flag: bs4 header style, txt: notification msg
// need global vars toast_counter time_counter
// create a #toastContainer at top position of body
// init before starting the action time_counter = Date.now();
// eg create_toast (toast_counter,time_counter, 'Hello World')

function create_toast(id,start,header,flag,txt) {
  let row_id = 'toastRow'+id;
  let dataDelay = 20000;
  // $('toastPosition').css('z-index', '2000');
  $('<div/>').attr('id',row_id).attr('class','my-1 sticky-top').appendTo('#toastContainer');
  $('<div/>').attr('id','col'+id).appendTo('#'+row_id);
  $('<div/>').attr('id','toast'+id).attr('data-autohide','true').attr('data-delay',dataDelay).attr('class','toast').appendTo('#col'+id);
  $('<div/>').attr('id','toastHeader'+id).attr('class','toast-header').appendTo('#toast'+id);
  $("<strong/>").attr('id','statusHeader'+id).attr('class','mr-auto text-'+flag).appendTo('#toastHeader'+id);
  $('#statusHeader'+id).append(header);
  $('<small/>').attr('id','timeHeader'+id).attr('class','text-muted').appendTo('#toastHeader'+id);
  $('#timeHeader'+id).append(time_elapsed(time_counter));
  $('<button/>').attr('id','btnHeader'+id).attr('class','ml-2 mb-1 close').attr('data-dismiss','toast').appendTo('#toastHeader'+id);
  $('#btnHeader'+id).append('&times;');
  $('<div/>').attr('id','txtBody'+id).attr('class','toast-body').appendTo('#toast'+id);
  $('#txtBody'+id).append(txt);
  $('#toast'+id).toast('show');
  toast_counter++;
}

function time_elapsed(from) {
  let current = Date.now();
  let elapsed_ms = current -from;
  let elapsed_sec = (elapsed_ms/1000).toFixed(2);
  let elapsed_min = Math.round((current - from)/1000/60);
  if (elapsed_ms > 1000) {
    return elapsed_sec+'sec';
  } else {
    return elapsed_ms+'ms';
  }
}

function checkdate(format,date) {
  let loc = {
    'US': /^(19|20)\d\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])$/g,
    'FR': /^(0[1-9]|[12][0-9]|3[01])[\/](0[1-9]|1[012])[\/](19|20)\d\d$/g };
  console.log('Regex US:', loc['US']);
  console.log('Regex FR:', loc['FR']);
  if (format == 'US' && date) {
    console.log(date+' in US format: ', loc['US'].test(date));
    return loc['US'].test(date);
  } else if (format == 'FR' && date) {
    console.log(date+' in FR format: ', loc['FR'].test(date));
    return loc['US'].test(date);
  } else {
    console.log('Wrong parameters');
    return false;
  }
}

// showAlert
function showAlert(title, type, div) { // show alert function
  $('.' + div).attr('class', div + ' alert alert-' + type || 'success')
    .html('<i class="fa fa-check"></i> ' + title).show();
  setTimeout(function() {
    $('.' + div).hide();
  }, 5000);
}
