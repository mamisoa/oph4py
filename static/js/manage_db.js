var toast_counter = 0;
var time_counter = 0;
var filename ="";

function saved(file,flag){
  let txt ="";
  if (flag) {
    txt = "Database saved in "+file;
    create_toast(toast_counter,time_counter,txt);
    // $("#text_result").removeClass().addClass("alert alert-success");
    // $("#text_result").append(txt);
  } else {
    txt = "Error saving database";
    create_toast(toast_counter,time_counter,txt);
  }
  list_csv();
}

function reset(flag){
  let txt="";
  if (flag) {
    txt = "Database reset done";
    create_toast(toast_counter,time_counter,txt);
  } else {
    txt = "Error resetting database";
    create_toast(toast_counter,time_counter,txt);
  }
  list_csv();
}

function restored(file,flag){
  let txt ="";
  if (flag) {
    txt = "Restored database from file: "+file;
    create_toast(toast_counter,time_counter,txt);
    // $("#text_result").removeClass().addClass("alert alert-success");
    // $("#text_result").append(txt);
  } else {
    txt = "Error restoring database";
    create_toast(toast_counter,time_counter,txt);
  }
  list_csv();
}

function confirm_init() {
  time_counter = Date.now();
  ajax(CTRL_SAVE_DB,[], ':eval');
  time_counter = Date.now();
  ajax(CTRL_INITDB, [], ':eval');
  $('#resetModal').modal('hide');
}

function confirm_savedb() {
  time_counter = Date.now();
  ajax(CTRL_SAVE_DB,[], ':eval');
  $('#saveModal').modal('hide');
}

// del button -> show delModal and set global filename = file2del -> ajax call -> hide modal, show toast, refresh list

function confirm_delcsv(datafile) {
  time_counter = Date.now();
  $('#file2del').html(datafile);
  filename=datafile;
  $('#delModal').modal('show');
}

function delcsv(datafile) {
  ajax(CTRL_DELCSV+'?datafile='+datafile,[],':eval');
}

function confirm_restorecsv(datafile) {
  time_counter = Date.now();
  $('#file2restore').html(datafile);
  filename=datafile;
  $('#restoreModal').modal('show');
}

function restoreCsv(datafile) {
  time_counter = Date.now();
  console.log('file in restoreCsv function:'+datafile);
  ajax(CTRL_SAVE_DB,[], ':eval');
  time_counter = Date.now();
  ajax(CTRL_RESTOREDB+'?datafile='+datafile,[],':eval');
  $('#restoreModal').modal('hide');
}

function show_file_deleted(csvfile,flag) {
  let txt="";
  if (flag) {
    txt = "File "+csvfile+" deleted";
    create_toast(toast_counter,time_counter,txt);
  } else {
    txt = "Error deleting "+csvfile+" !";
    create_toast(toast_counter,time_counter,txt);
  }
  $('#delModal').modal('hide');
  list_csv();
}


function list_csv() {
  time_counter = Date.now();
  ajax(CTRL_LISTDIR,[],':eval');
}

function show_csv_dir(arr,flag) {
  // console.log(arr);
  $('#listDir').html('');
  if (flag) {
    if (arr.length >0) {
      for (const i in arr) {
        //console.log(arr[i]);
        displayItem('listDir',i,arr[i]);
      }
    } else {
      console.log('FLAG no file');
      displayItem('listDir','none','No file found');
    }
  } else {
    console.log('flag: FALSE');
    displayItem('listDir','none','No file found');
  }
}

function displayItem (id,index,value) {
  // console.log((value =='init_db.csv')||(typeof(index) =='none'));
  if ((value !='init_db.csv')){
    $('#'+id).append('<li id="csv'+index+'" class="list-group-item"><span class="">'+value+'</span></li>');
    $('#csv'+index).append('<button type="button" data-file="'+value+'" onclick="confirm_delcsv(&apos;'+value+'&apos;);" class="btn btn-danger fas fa-trash-alt float-right ml-1"></button>');
    $('#csv'+index).append('<button type="button" data-file="'+value+'" onclick="confirm_restorecsv(&apos;'+value+'&apos;);" class="btn btn-warning fas fa-trash-restore float-right ml-1"></button>');
  } else {
    $('#'+id).append('<li id="csv'+index+'" class="list-group-item"><span class="">'+value+'</span></li>');
  }
}



function create_toast(id,start,txt) { // id number of toast, start = time at execution, txt = notification msg
  let row_id = 'toastRow'+id;
  //console.log(row_id);
  $("<div/>").attr('id',row_id).attr('class','mb-1').appendTo('#toastContainer');
  $("<div/>").attr('id','col'+id).appendTo('#'+row_id);
  $("<div/>").attr('id','toast'+id).attr('data-autohide','true').attr('data-delay',20000).attr('class','toast').appendTo('#col'+id);
  $("<div/>").attr('id','toastHeader'+id).attr('class','toast-header').appendTo('#toast'+id);
  $("<strong/>").attr('id','statusHeader'+id).attr('class','mr-auto text-primary').appendTo('#toastHeader'+id);
  $('#statusHeader'+id).append('Status');
  $("<small/>").attr('id','timeHeader'+id).attr('class','text-muted').appendTo('#toastHeader'+id);
  $('#timeHeader'+id).append(time_elapsed(time_counter));
  $("<button/>").attr('id','btnHeader'+id).attr('class','ml-2 mb-1 close').attr('data-dismiss','toast').appendTo('#toastHeader'+id);
  $('#btnHeader'+id).append('&times;');
  $("<div/>").attr('id','txtBody'+id).attr('class','toast-body').appendTo('#toast'+id);
  $('#txtBody'+id).append(txt);
  $('#toast'+id).toast('show');
  toast_counter++;
}

function time_elapsed(from) {
  let current = Date.now();
  //console.log('execution time:'+from);
  //console.log('current time:'+current);
  let elapsed_ms = current -from;
  let elapsed_sec = (elapsed_ms/1000).toFixed(2);
  let elapsed_min = Math.round((current - from)/1000/60);
  if (elapsed_ms > 1000) {
    return elapsed_sec+'sec';
  } else {
    return elapsed_ms+'ms';
  }

}
