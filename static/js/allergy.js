// refresh tables
const tablesArr = ['#agents_tbl'];
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
                crud(table,id,'DELETE');
                refreshTables(tablesArr);
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};

$('#agentsFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodAgentsModalSubmit'];
    if (req == 'POST') {
        delete dataObj['id'];
    } else {};
    dataObj['name']=capitalize(dataObj['name']);
    delete dataObj['methodAgentsModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    console.log("dataForm",dataObj);
    crud('agent','0',req,dataStr); 
    $agents_tbl.bootstrapTable('refresh'); 
    $('#agentsModal').modal('hide'); 
});
