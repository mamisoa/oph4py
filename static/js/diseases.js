// refresh tables
const tablesArr = ['#diseases_tbl'];
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

$('#diseaseFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodDiseaseModalSubmit'];
    if (req == 'POST') {
        delete dataObj['id'];
    } else {};
    dataObj['title']=capitalize(dataObj['title']);
    delete dataObj['methodDiseaseModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    console.log("dataForm",dataObj);
    crud('disease_ref','0',req,dataStr); 
    $diseases_tbl.bootstrapTable('refresh');
    $('#diseaseModal').modal('hide'); 
    $('#diseaseModal .modal-title').html('New disease');
    document.getElementById("diseaseFormModal").reset();
});