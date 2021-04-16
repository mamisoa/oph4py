var toast_counter = 0;
var time_counter = 0;
var filename ="";

// throw an ajax request to update list of backup files
function list_csv() {
  time_counter = Date.now();
  displayToast('success',time_counter,'Listing csv files...');
  $.ajax({
    url: CTRL_LISTDIR,
    success: function(result) {
    show_csv_dir(result.split(" "));
    displayToast('success','Listing generated','Listing generated');
    }
  });
}

function list_tables(){
  let html = [], counter = 1;
  for (table of TABLES_LIST) {
    html.push('<tr>');
    html.push('<td>'+parseInt(counter)+'</td>');
    html.push('<td>'+table+'</td>');
    html.push('<td><button type="button" class="btn btn-primary btn-sm" onclick="save_table(\''+table+'\');"><i class="fas fa-save"></i></button></td>');
    html.push('<td><button type="button" class="btn btn-warning btn-sm" onclick="restore_table(\''+table+'\');"><i class="fas fa-trash-restore-alt"></i></button></td>');
    html.push('</tr>');
    counter +=1;
  };
  $('#listTables').html(html.join(''));
};

function save_table(table) {
  console.log(table);
  $.ajax({
    url: CTRL_SAVE_TABLE+'/'+table,
    success: function(result) {
      if (result[1]==true) {
        displayToast('success','Table '+result[0],'Table '+result[0]+' saved');
      } else {
        displayToast('error','Error '+result[2],'Table '+result[0]+' NOT saved!');
      };
      list_csv();
    }
  });
};

function show_csv_dir(arr) { // arr is a python list of filenames
  var flag=arr.pop(); // last item from array  
  $('#listDir').html('');
  if (flag) {
    if (arr.length >0) {
      for (const i in arr) {
        displayItem('listDir',i,arr[i]);
      }
    } else {
      console.log('FLAG no file');
      displayItem('listDir','-1','No file found');
    }
  } else {
    console.log('flag: FALSE');
    displayItem('listDir','-1','No file found');
  }
}

// throw an ajax request to make a csv backup file after modal confirmation in view
function confirm_savedb() {
    time_counter = Date.now();
    displayToast('success',time_counter,'Saving DB...');
    $.ajax({
      url: CTRL_SAVE_DB,
      success: function(result) {
        arr = result;
        if (arr[1] == 'True') {
            displayToast('success',time_counter,'DB saved');
        } else {
            displayToast('error',time_counter,'Error ' + arr[0]+ ' trying to save DB!');
        }
      }
    });
    $('#saveModal').modal('hide');
    list_csv();
}

// throw an ajax request 1) to backup DB and if successful 2) clear/reset DB - after modal confirmation in view
function confirm_init() {
  time_counter = Date.now();
  displayToast('success',time_counter,'Saving DB...');
  $.ajax({
      url: CTRL_SAVE_DB,
      success: function(result) {
        console.log(result);
        arr = result;
        if (arr[1] == 'True') {
            displayToast('success',time_counter,'DB saved, resetting DB...');
            $.ajax({
              url: CTRL_INIT_DB,
              success: function(result) {
                arr = result.split(" ");
                if (arr[1] == 'True') {
                  displayToast('success',time_counter,'DB blanked');
                } else {
                  displayToast('error',time_counter,'Error trying to blank DB!');
                }
              }
            });
        } else {
          displayToast('error',time_counter,'Error trying to save DB!');
        }
      }
    });
    time_counter = Date.now();
  $('#resetModal').modal('hide');
  list_csv();
};

// open modal for restore confirmation
function confirm_restorecsv(datafile) {
  time_counter = Date.now();
  $('#file2restore').html(datafile);
  filename=datafile;
  $('#restoreModal').modal('show');
}

// throw an ajax request to restore a csv backup file after modal confirmation in view
function restoreCsv(datafile) {
    time_counter = Date.now();
    console.log('file in restoreCsv function:'+datafile);
    displayToast('success',time_counter,'Saving DB...');
    $.ajax({
        url: CTRL_SAVE_DB,
        success: function(result) {
            arr = result;
            if ('True') {
              displayToast('success',time_counter,'DB saved, beginning restore...');
              time_counter = Date.now();
            $.ajax({
                url: CTRL_RESTORE_DB+'?datafile='+datafile,
                success: function(result) {
                    $('#delModal').modal('hide');
                    arr = result.split(" ");
                    if (arr[1] == 'True') {
                      displayToast('success',time_counter,'DB '+arr[0]+' restored');
                    } else {
                      displayToast('error',time_counter,"Couldn't restore "+arr[0]+' file!');
                    }
                }
            });
            } else {
              displayToast('error',time_counter,'Error trying to save DB!');
            };
        list_csv();
        }
    });
    $('#restoreModal').modal('hide');
};

// open modal for delete confirmation
function confirm_delcsv(datafile) {
  time_counter = Date.now();
  $('#file2del').html(datafile);
  filename=datafile;
  $('#delModal').modal('show');
}

// throw an ajax request to delete a csv backup file after modal confirmation in view
function delcsv(datafile) {
  displayToast('warning',time_counter,'Deleting backup...');
  $.ajax({
      url: CTRL_DELCSV+'?datafile='+datafile,
      success: function(result) {
        $('#delModal').modal('hide');
        arr = result.split(" ");
        if (arr[1] == 'True') {
          displayToast('success',time_counter,'DB '+arr[0]+' backup DELETED');
        } else {
          displayToast('error',time_counter,"Couldn't delete "+arr[0]+' file!');
        }
        list_csv();
      }
  });
};

// add one row in the table list of files
// difficult to append a cell at the right place ...
function displayItem (id,index,value) {
  filenum = parseInt(index)+1;
  $('#'+id).append('<tr id="row'+filenum+'">');
  $('#row'+filenum).append('<td scope="row">'+filenum+'</td>');
  $('#row'+filenum).append('<td class="csv">'+value+'</td>');
  $('#row'+filenum).append('<td data-file="'+value+'" >');
  if ((value !='init_db.csv')&&(filenum != 0)){
    $('#row'+filenum+' td[data-file="'+value+'"]').append('<button type="button" onclick="confirm_delcsv(&apos;'+value+'&apos;);" class="btn btn-danger m-2"><i class="fas fa-trash-alt"></i></button>');
    $('#row'+filenum+' td[data-file="'+value+'"]').append('<button type="button" onclick="confirm_restorecsv(&apos;' +value+ '&apos;);" class="btn btn-warning m-2"><i class="fas fa-trash-restore-alt"></i></button>');
  } else {
    $('#row'+filenum+' td[data-file="'+value+'"]').append('<button type="button" onclick="confirm_delcsv(&apos;'+value+'&apos;);" disabled class="btn btn-danger m-2"><i class="fas fa-trash-alt"></i></button>');
    $('#row'+filenum+' td[data-file="'+value+'"]').append('<button type="button" onclick="confirm_restorecsv(&apos;' +value+ '&apos;);" class="btn btn-warning m-2"><i class="fas fa-trash-restore-alt"></i></button>');
  };
  $('#row'+filenum).append('</td>');
  $('#'+id).append('</tr>');
}

// jQuery toast - to update 
function create_toast(id,start,txt) { // id number of toast, start = time at execution, txt = notification msg
  let row_id = 'toastRow'+id;
  //console.log(row_id);
  $("<div/>").attr('id',row_id).attr('class','mb-1').appendTo('#toastContainer');
  $("<div/>").attr('id','col'+id).appendTo('#'+row_id);
  $("<div/>").attr('id','toast'+id).attr('data-autohide','true').attr('data-delay',10000).attr('class','toast').appendTo('#col'+id);
  $("<div/>").attr('id','toastHeader'+id).attr('class','toast-header d-flex').appendTo('#toast'+id);
  $("<span/>").attr('id','statusHeader'+id).attr('class','text-primary flex-fill align-self-center').appendTo('#toastHeader'+id);
  $('#statusHeader'+id).append('<strong>Status</strong>');
  $("<span/>").attr('id','timeHeader'+id).attr('class','text-muted align-self-center pr-2').appendTo('#toastHeader'+id);
  $('#timeHeader'+id).append('<small>'+time_elapsed(time_counter)+'</small>');
  $("<button/>").attr('id','btnHeader'+id).attr('class','btn-close align-self-center').attr('data-dismiss','toast').appendTo('#toastHeader'+id);
  $("<div/>").attr('id','txtBody'+id).attr('class','toast-body').appendTo('#toast'+id);
  $('#txtBody'+id).append(txt);
  $('#toast'+id).toast('show');
  toast_counter++;
}

// time elaspe between initialisation with 
// time_counter = Date.now(); to function call
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
};
