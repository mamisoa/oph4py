// refresh tables
const tablesArr = ['#medic_tbl'];
refreshTables(tablesArr);

function delItem (id,table,desc) {
    bootbox.confirm({
        message: "Are you sure you want to delete this "+desc+" ?",
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
                crudp(table,id,'DELETE').then(data => refreshTables(tablesArr));
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};

$('#medicFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodMedicModalSubmit'];
    let id = dataObj.id;
    delete dataObj.id;
    delete dataObj['methodMedicModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    console.log("dataForm",dataObj);
    crudp('medic_ref',id,req,dataStr).then (data => $medic_tbl.bootstrapTable('refresh'));
    $('#medicModal').modal('hide');
    $('#medicModal .modal-title').html('New medication');
    document.getElementById("medicFormModal").reset(); 
});

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

setCounter('#medicModal .intake_modal', 'intake', 0.25,0.25,100);