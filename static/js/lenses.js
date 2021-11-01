// refresh tables
const tablesArr = ['#lens_tbl'];
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
                crudp(table,id,'DELETE').then( data => refreshTables(tablesArr));
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};

$('#lensFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodlensModalSubmit'];
    if (req == 'POST') {
        delete dataObj['id'];
    } else {};
    delete dataObj['methodlensModalSubmit'];
    dataObj['toricity']=$('#lensFormModal input[name=toricity]').prop('checked');
    dataStr= JSON.stringify(dataObj);
    console.log("dataForm",dataObj);
    crudp('cl','0',req,dataStr).then( data => $lens_tbl.bootstrapTable('refresh'));
    $('#lensModal').modal('hide');
    $('#lensModal .modal-title').html('New lens');
    document.getElementById("lensFormModal").reset(); 
});
