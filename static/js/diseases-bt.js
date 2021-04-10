function responseHandler_disease(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'title': list[i]['title'],
            'category': list[i]['category'],
            'icd10': list[i]['icd10'],
            'description': list[i]['description'],
            'modified_by_name': list[i]['mod.last_name'] + ' ' + list[i]['mod.first_name'],
            'modified_by': list[i]['mod.id'],
            'modified_on': list[i]['modified_on'],
            'created_by': list[i]['creator.id'],
            'created_by_name': list[i]['creator.last_name'] + ' ' + list[i]['creator.first_name'],
            'created_on': list[i]['created_on']
        });
    });
    return {
        rows: display,
        total: res.count,
    };
};

var toggle ='';
function queryParams(params) {
    let s = '';
    if (params.offset != "0") {
        s =="" ? s += "@offset=" + params.offset : s += "&@offset=" + params.offset;
    }
    if (params.limit != "0") {
        s =="" ? s += "@limit=" + params.limit: s += "&@limit=" + params.limit
    }
    if (params.sort != undefined) {
        switch (params.sort) {
            case "id":
                params.sort = "id";
                break;
            case "name":
                params.sort = "category";
                break;
            case "code":
                params.sort = "title";
                break;
        }
        if (toggle=="") {
            s += "&@order="+params.sort;
            toggle="~";
        } else {
            s += "&@order=~"+params.sort;
            toggle="";
        }
    }
    return s; // remove the first &
};

function operateFormatter_disease(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit disease"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Delete disease"><i class="fas fa-trash-alt"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents_disease = {
    'click .edit': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        document.getElementById("diseaseFormModal").reset();
        $('#diseaseFormModal [name=id]').val(row.id); 
        $('#diseaseFormModal [name=title]').val([row.title]);
        $('#diseaseFormModal [name=category]').val([row.category]);
        $('#diseaseFormModal [name=icd10]').val(row.icd10);
        $('#diseaseFormModal [name=description]').val(row.description);
        $('#diseaseFormModal [name=methodDiseaseModalSubmit]').val('PUT');
        $('#diseaseModal .modal-title').html('Edit disease #'+row.id);
        $('#diseaseModal').modal('show');
    },
    'click .remove': function (e, value, row, index) {
        console.log('You click action DELETE on row: ' + JSON.stringify(row));
        delItem(row.id, 'disease_ref', 'disease');
    }
};
