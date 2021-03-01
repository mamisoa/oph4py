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

var s="";

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
    console.log(s);
    return s;
}