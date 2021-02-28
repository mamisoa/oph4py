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

function queryParams(params) {
    search = params.search.split(",");
    console.log('Initial');
    console.log(search);
    if (search[0] == "") {
        params.search="";
    } else if (search[1] == undefined) {
        params.search="last_name.startswith="+search[0]
        console.log("1 undefined:" + params.search);
    } else if (search[2] == undefined) {
        params.search="last_name.startswith="+search[0]+"&first_name.startswith="+search[1]
    } else {
        params.search="last_name.startswith="+search[0]+"&first_name.startswith="+search[1]+"&(gender.sex).startwith="+search[2];
    }
    return params.search;
}