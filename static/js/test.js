
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
    console.log('Hello');
    crudUser('0','POST',data=formData);
    $('#newUserModal').modal('toggle');
    return false;
});

// crudUser(id,req): req = 'POST' without id,  'PUT' 'DELETE' with id
function crudUser(id='0',req='POST',data) {
    console.log(data);
    var API_URL = (req == 'POST'? HOSTURL+"/myapp/api/auth_user" : HOSTURL+"/myapp/api/auth_user/"+ id );
    var mode = ( req == 'POST' ? ' added' : (req == 'PUT' ? ' edited': ' deleted'));
    $.ajax({
        url: API_URL,
        data: data,
        contentType: 'application/json',
        dataType: 'json',
        method: req
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
                text='User id: '+(req == 'DELETE'? id : data.id)+mode;
                displayToast('success','User '+mode,text,true);
            };
        });
}


function operateFormatter(value, row, index) {
    return [
      '<a class="edit" href="javascript:void(0)" title="Edit user">',
      '<i class="fas fa-edit"></i>',
      '</a>  ',
      '<a class="remove" href="javascript:void(0)" title="Remove">',
      '<i class="fas fa-trash-alt"></i>',
      '</a>'
    ].join('')
  };

window.operateEvents = {
    'click .like': function (e, value, row, index) {
      alert('You click like action, row: ' + JSON.stringify(row))
    },
    'click .remove': function (e, value, row, index) {
        delUser(row.id);
    }
  };

function delUser (id) {
    bootbox.confirm({
        message: "Are you sure you want to delete this user?",
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
                crudUser(id,req='DELETE');
                console.log('Row.id deleted:'+id);
                $table.bootstrapTable('refresh');
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
}


// btn new user before opening modal : clear form, set default generated password
// password should be sent by email in future
$( "#btnNewUser" ).click(function() {
    document.getElementById('userForm').reset();
    pass = passGen();
    document.querySelector("#userForm input[name='password']").value = pass;
    document.querySelector("#userForm input[name='passwordCheck']").value = pass;
});


// useful functions //

// normalize accented characters
function norm(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Capitalize first character
function capitalize(str) {
    return str.trim().replace(/^\w/, (c) => c.toUpperCase());
}

// password generator
function passGen() {
    return Math.random().toString(36)+Math.random().toString(36).toUpperCase().split('').sort(function(){return 0.5-Math.random()}).join('')
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
