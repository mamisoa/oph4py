// set parameters for ajax request from bootstrap-table
var s="";
var toggle=""

function queryParams(params) {
    search = params.search.split(",");
    if (search == [""]) {
        s =""
    } else {
        if (search[0]!= undefined) {
            s = "last_name.contains=" + search[0];
        } else {
            s = "";
        }
        if (search[1]!= undefined) {
            s += "&first_name.startswith=" + capitalize(search[1]);
        } else {
            s +="";
        }
        if (search[2] != undefined) {
            s += "&gender.sex.startswith=" + capitalize(search[2]);
        } else {
            s += "";
        }
    };
    if (params.sort != undefined) {
        if (params.sort == "gender.sex") {
            params.sort = "gender";
        }
        if (toggle=="") {
            s += "&@order="+params.sort;
            toggle="~";
        } else {
            s += "&@order=~"+params.sort;
            toggle="";
        }
    };
    if (params.offset != "0") {
        console.log(params.offset);
        s += "&@offset="+params.offset;
    };
    if (params.limit != "0") {
        console.log(params.offset);
        s += "&@limit="+params.limit;
    };
    // console.log('s',s);
    return decodeURI(encodeURI(s));
};

function operateFormatter(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit user"><i class="fas fa-edit"></i></a>');
    html.push('<a class="remove ms-1" href="javascript:void(0)" title="Remove"><i class="fas fa-trash-alt"></i></a>');
    html.push('<a class="summary ms-1" href="javascript:void(0)" title="Read summary"><i class="fas fa-th-list"></i></a>');
    html.push('<a class="worklist ms-2" href="javascript:void(0)" title="Worklist"><i class="fas fa-list"></i></a>');
    html.push('</div>');
    return html.join('');
};

window.operateEvents = {
    'click .edit': function (e, value, row, index) {
    //   console.log('You click like action, row: ' + JSON.stringify(row));
      window.location.href = HOSTURL+"/myapp/user/"+row.id;

    },
    'click .remove': function (e, value, row, index) {
        delUser(row.id);
    },
    'click .worklist': function (e, value, row, index) {
        addToWorklist(row.id);
    },
    'click .summary': function (e, value, row, index) {
        let link = HOSTURL+'/myapp/billing/summary/'+row.id;
        window.location.href = link;
    }
};

function ageFormatter(value, row) {
    if ( row.dob==null )
    {
        return 'n/a';
    } else {
        return getAge(row.dob)+' yo';
    }
}

/// Bootstrap-table options not used here

function responseHandler(res) { // used if data-response-handler="responseHandler"
list = res.items;
nbrows = Object.keys(list).length;
display = [];
$.each(list, function (i) {
    display.push({
        'id': list[i].id,
        'uid': list[i].uid,
        'first_name': list[i].first_name,
        'last_name': list[i].last_name,
        'dob': list[i]['dob'],
        'gender': list[i]['gender.sex'],
    });
});
return display;
}

// use:
// data-ajax="ajaxRequest"
// data-side-pagination="client"
// to be able to use search in javascript
// or just use: data-query-params=""
function ajaxRequest(params) {
$.ajax({
    type: "GET",
    url: API_USER_LIST,
    dataType: "json",
    success: function (data) { 
        console.log(data);
        params.success({ 
        "rows": data.items, 
        "total": data.items.length 
        }) 
    }, 
    error: function (er) {
        params.error(er);
    }
});
}
