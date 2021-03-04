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

// normalize accented characters
function norm(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


// set parameters for ajax request from bootstrap-table
var s="";
var toggle=""
function queryParams(params) {
    search = params.search.split(",");
    if (search == [""]) {
        s =""
    } else {
        if (search[0]!= undefined) {
            s = "last_name.startswith=" + search[0];
        } else {
            s = "";
        }
        if (search[1]!= undefined) {
            s += "&first_name.startswith=" + search[1];
        } else {
            s +="";
        }
        if (search[2] != undefined) {
            s += "&gender.sex.startswith=" + search[2];
        } else {
            s += "";
        }
    }
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
    }
    if (params.offset != "0") {
        console.log(params.offset);
        s += "&@offset="+params.offset;
    }

    if (params.limit != "0") {
        console.log(params.offset);
        s += "&@limit="+params.limit;
    }
    console.log(s);
    return decodeURI(encodeURI(s));
}