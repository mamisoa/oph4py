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

// Capitalize first character
function capitalize(str) {
    return str.trim().replace(/^\w/, (c) => c.toUpperCase());
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
            s = "last_name.startswith=" + capitalize(search[0]);
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

// catch submit userForm
$('#userForm').submit(function(e) {
    e.preventDefault();
    var formData = $('#userForm').serializeJSON();
    formData = JSON.parse(formData); // change to object
    delete formData['passwordCheck']; // remove passwordCheck field
    formData = JSON.stringify(formData); // change to string
    $.ajax({
        url: HOSTURL+"/myapp/api/auth_user",
        data: formData,
        contentType: 'application/json',
        dataType: 'json',
        method: 'POST'
        })
        .done(function(data) {
            console.log(data);
            status = data.status;
            message = data.message;
            errors = "";
            if (data.status == "error") {
                for (i in data.errors) {
                    errors += data.errors[i]+'</br>';
                };
                text = errors;
                displayToast('error',data.message,errors,true);
            };
            if (data.status == "success") {
                text='Added user id: '+data.id;
                displayToast('success','User added',text,true);
            };
        });
    $('#newUserModal').modal('toggle');
    return false;
});

