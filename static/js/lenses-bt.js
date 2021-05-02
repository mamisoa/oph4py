function responseHandler_lens(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'lens': list[i]['name'],
            'brand': list[i]['brand'],
            'material': list[i]['material'],
            'design': list[i]['design'],
            'opticalzone': list[i]['opticalzone'],
            'basecurve': list[i]['basecurve'],
            'diameter': list[i]['diameter'],
            'rigidity': list[i]['rigidity'],
            'toricity': list[i]['toricity'],
            'minsph': list[i]['minsph'],
            'maxsph': list[i]['maxsph'],
            'mincyl': list[i]['mincyl'],
            'maxcyl': list[i]['maxcyl'],
            'water': list[i]['water'],
            'wear': list[i]['wear'],
            'replacement': list[i]['replacement'],
            'packaging': list[i]['packaging'],
            'misc': list[i]['misc'],
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
            case "lens":
                params.sort = "name";
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

function operateFormatter_lens(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit lens"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Delete lens"><i class="fas fa-trash-alt"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents_lens = {
    'click .edit': function (e, value, row, index) {
        // console.log('You click action EDIT on row: ' + JSON.stringify(row));
        document.getElementById("lensFormModal").reset();
        $('#lensFormModal [name=id]').val(row.id); 
        $('#lensFormModal [name=name]').val(row.name);
        $('#lensFormModal [name=material]').val(row.material);
        $('#lensFormModal [name=brand]').val(row.brand);
        $('#lensFormModal [name=packaging]').val(row.packaging);
        $('#lensFormModal [name=opticalzone]').val(row.opticalzone);
        $('#lensFormModal [name=design]').val(row.design);
        $('#lensFormModal [name=edge]').val(row.edge);
        $('#lensFormModal [name=basecurve]').val(row.basecurve);
        $('#lensFormModal [name=diameter]').val(row.diameter);
        $('#lensFormModal [name=rigidity]').val(row.rigidity);
        $('#lensFormModal [name=toricity]').val(row.toricity);
        $('#lensFormModal [name=minsph]').val(row.minsph);
        $('#lensFormModal [name=maxsph]').val(row.maxsph);
        $('#lensFormModal [name=mincyl]').val(row.mincyl);
        $('#lensFormModal [name=maxcyl]').val(row.maxcyl);
        $('#lensFormModal [name=water]').val(row.water);
        $('#lensFormModal [name=dk]').val(row.dk);
        $('#lensFormModal [name=wear]').val(row.wear);
        $('#lensFormModal [name=replacement]').val(row.replacement);
        $('#lensFormModal [name=misc]').val(row.misc);
        $('#lensFormModal input[name=toricity]').prop('checked',row.toricity);
        $('#lensFormModal [name=methodlensModalSubmit]').val('PUT');
        $('#lensModal .modal-title').html('Edit lens #'+row.id);
        $('#lensModal').modal('show');
    },
    'click .remove': function (e, value, row, index) {
        // console.log('You click action DELETE on row: ' + JSON.stringify(row));
        delItem(row.id, 'cl', 'lens');
    }
};

function detailFormatter_lens(index, row) {
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Delivery: </span>' + row.delivery + '</p>');
    html.push('<p class=""><span class="fw-bold">Lens: </span>' + row.name + '</p>');
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