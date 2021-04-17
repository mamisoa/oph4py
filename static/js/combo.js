// submit newComboForm
$('#newComboForm').submit(function(e) {
    e.preventDefault();
    let procedure = $('#newComboForm select[name=id_procedure]').val();
    let modalities = $('#newComboForm select[name=id_modality]').val();
    console.log('procedure:',procedure);
    console.log('modalities:',modalities);
    for (modality of modalities) {
        let dataObj = {};
        dataObj['id_procedure']=procedure;
        dataObj['id_modality']=modality;
        dataStr = JSON.stringify(dataObj);
        console.log('dataStr:',dataStr);
        crud('combo','0','POST',dataStr);
    }
});