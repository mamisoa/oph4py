function responseHandler_medic(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'delivery': list[i]['delivery'],
            'medication': list[i]['name'],
            'brand': list[i]['brand'],
            'form': list[i]['medication.form'],
            'dosage': list[i]['dosage'],
            'packaging': list[i]['packaging'],
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
    let search = params.search.split(",");
    if (search == [""]) {
        s =""
    } else {
        if (search[0]!= undefined) {
            s = "name.startswith=" + capitalize(search[0]);
        } else {
            // s +="";
        };
    }
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
            case "delivery":
                params.sort = "delivery";
                break;
            case "medication":
                params.sort = "name";
                break;
            case "form":
                params.sort = "form";
                break;
            case "brand":
                params.sort = "brand";
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

function operateFormatter_medic(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit medication"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Delete medication"><i class="fas fa-trash-alt"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents_medic = {
    'click .edit': function (e, value, row, index) {
        // console.log('You click action EDIT on row: ' + JSON.stringify(row));
        document.getElementById("medicFormModal").reset();
        $('#medicFormModal [name=id]').val(row.id); 
        $('#medicFormModal [name=delivery]').val([row.delivery]);
        $('#medicFormModal [name=name]').val(row.name);
        $('#medicFormModal [name=active_ingredient]').val(row.active_ingredient);
        $('#medicFormModal [name=dosage]').val(row.dosage);
        $('#medicFormModal [name=brand]').val(row.brand);
        $('#medicFormModal [name=form]').val(row.form);
        $('#medicFormModal [name=methodMedicModalSubmit]').val('PUT');
        $('#medicModal .modal-title').html('Edit medication #'+row.id);
        $('#medicModal').modal('show');
    },
    'click .remove': function (e, value, row, index) {
        // console.log('You click action DELETE on row: ' + JSON.stringify(row));
        delItem(row.id, 'medic_ref', 'medication');
    }
};

function detailFormatter_medic(index, row) {
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Delivery: </span>' + row.delivery + '</p>');
    html.push('<p class=""><span class="fw-bold">Name: </span>' + row.medication + '</p>');
    html.push('<p class=""><span class="fw-bold">Brand: </span>' + row.brand +'</p>');
    html.push('<p class=""><span class="fw-bold">Packaging: </span>' + row.packaging +'</p>');
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
    html.push('<p class=""><span class="fw-bold">Created by: </span>' + row.created_by_name + ' on ' + row.created_on + '</p>');
    html.push('<p class=""><span class="fw-bold">Modified by: </span>' + row.modified_by_name + ' on ' + row.modified_on + '</p>');
    html.push('</div>');
    html.push('</div></div>');
    return html.join('');
};