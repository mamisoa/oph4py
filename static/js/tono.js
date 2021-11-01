refreshTables(tablesArr);

// remove class top-fixed from topnav
document.getElementById('topNavbar').classList.remove('fixed-top');

// hide pachy when techno is apla
// if val(), change by chaining trigger("change")
$('#tonoPachyForm [name=techno]').change(function() {
    pachyCache = $('#tonoPachyForm [name=pachymetry]').val();
    if ($('#tonoPachyForm [name=techno]:checked').val() == 'apla') {
        $('#pachyDiv').addClass('visually-hidden');
    } else {
        $('#pachyDiv').removeClass('visually-hidden');
    }
});

// set counters
// id_count : form id , count_class: tono pachy (counter_tono) 

counterArr = ['#airRightForm', '#airLeftForm', '#aplaRightForm', '#aplaLeftForm', '#tonoPachyForm','#form_right_apla','#form_left_apla'];

for (let counter of counterArr) {
    setCounter(counter,'tono',0.5,0,80);
    setCounter(counter,'pachy',2,300,700);    
};

function setCounter (id_count, count_class,step, min, max) {
    $(id_count+' .btn.counter_down_'+count_class).click(function() {
        value = parseFloat($(id_count+' input.counter_'+count_class).val());
        if (value >= (min+step)) {
        $(id_count+' input.counter_'+count_class).val(value-step);
        } else {};
    });
    
    $(id_count+' .btn.counter_up_'+count_class).click(function() {
        value = parseFloat($(id_count+' input.counter_'+count_class).val());
        if (value <= (max-step)) {
        $(id_count+' input.counter_'+count_class).val(value+step);
        } else {};
    });
};

// submit airPachy and apla forms
$('#airRightForm').submit(function(e){
    e.preventDefault();
    tonoPachyInsert(this,'right');
});

$('#airLeftForm').submit(function(e){
    e.preventDefault();
    tonoPachyInsert(this,'left');
})

$('#aplaRightForm').submit(function(e){
    e.preventDefault();
    tonoPachyInsert(this,'right','apla');
});

$('#aplaLeftForm').submit(function(e){
    e.preventDefault();
    tonoPachyInsert(this,'left','apla');
});

// domId eg #airRightForm , laterality eg 'right'
function tonoPachyInsert(domId,laterality, techno='air') {
    let dataStr = $(domId).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let o ={};
    o['tonometry'] = dataObj[techno+capitalize(laterality)];
    techno == 'air'? o['pachymetry'] = dataObj['pachy'+capitalize(laterality)] : o['pachymetry'] = '';
    o['id_auth_user'] = patientObj['id'];
    o['id_worklist'] = wlObj['worklist']['id'];
    o['laterality'] = laterality;
    o['techno'] = techno;
    o['timestamp']= new Date().addHours(timeOffsetInHours).toJSON().slice(0,16);
    // console.log('o',o);
    oStr = JSON.stringify(o);
    crudp('tono','0','POST', oStr).then(data => refreshTables());
    techno == 'air'? $('#airPachy'+capitalize(laterality)+'_tbl').bootstrapTable('refresh') : $('#apla'+capitalize(laterality)+'_tbl').bootstrapTable('refresh');
};

function refreshTables() {
    $table_airRight.bootstrapTable('refresh');
    $table_airLeft.bootstrapTable('refresh');
    $table_aplaRight.bootstrapTable('refresh');
    $table_aplaLeft.bootstrapTable('refresh');
};

function delTonoPachy (id) {
    bootbox.confirm({
        message: "Are you sure you want to delete this tono/pachy?",
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
                crudp('tono',id,'DELETE').then(data => refreshTables());
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};

$('#tonoPachyForm').submit(function (e){
    e.preventDefault();
    let dataStr = $('#tonoPachyForm').serializeJSON();
    let dataObj = JSON.parse(dataStr);
    console.log(dataObj);
    let req = dataObj['methodTonoPachySubmit'];
    delete dataObj['methodTonoPachySubmit'];
    dataStr = JSON.stringify(dataObj);
    crudp('tono','0',req,dataStr).then(data => refreshTables());
    $('#tonoPachyModal').modal('hide');
});

// delete tono
function delTonoPachy (id) {
    bootbox.confirm({
        message: "Are you sure you want to delete this tono/pachy?",
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
                crudp('tono',id,'DELETE').then(data => refreshTables());
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};
