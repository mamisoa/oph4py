function getUser(id) {
    return Promise.resolve(
        $.ajax({
            type: "GET",
            url: API_USER,
            dataType: "json",
            success: function (data) {
                if (data.status == 'error' || data.count == 0) {
                    displayToast('error', 'GET error', 'Cannot retrieve user details', '6000');    
                } else {
                    displayToast('info', 'GET user request', 'GET ' + data.items[0].username, '6000');
                }
            },
            error: function (er) {
                console.log(er);
            }
        }));
}

function getUserPhones(id) {
    return Promise.resolve(
        $.ajax({
            type: "GET",
            url: API_USER_PHONE,
            dataType: "json",
            success: function (data) {
                console.log(data); if (data.status == 'error' || data.count == 0) {
                    displayToast('error', 'GET error', 'Cannot retrieve phones', '6000');
                } else {
                    displayToast('info', 'GET phone request', 'GET ' + data.items[0].id_auth_user['username'], '6000')
                }
            },
            error: function (er) {
                console.log(er);
            }
        }));
}

function getUserAddresses(id) {
    return Promise.resolve(
        $.ajax({
            type: "GET",
            url: API_USER_ADDRESS,
            dataType: "json",
            success: function (data) {
                console.log(data); if (data.status == 'error' || data.count == 0) {
                    displayToast('error', 'GET error', 'Cannot retrieve addresses', '6000');
                } else {
                    displayToast('info', 'GET address request', 'GET ' + data.items[0].id_auth_user['username'], '6000')
                }
            },
            error: function (er) {
                console.log(er);
            }
        }));
}

function checkIfDataIsNull(data, dft='n/a') {
    return data == null? dft : data ; 
}

var userData, userPhone, userAddress;

refreshAll();

function refreshAll(){
    arr = ['userData','userPhone','userAddress'];
    for (const table of arr) {
        console.log(table);
        refreshList(table);
    };    
}

// do when promise.success
function refreshList(listName){
    if (listName=='userData') {
        userData = getUser(id);
        userData.then(function(userData){
            $('#ulUserTitle').html('');
            $('#ulUserItems').html('');
            $('#userModal h5.modal-title').html('New phone for <span class="fw-bold">'+ checkIfDataIsNull(userData.items[0].first_name) + ' '+ checkIfDataIsNull(userData.items[0].last_name)+'</span>')
            // fills lists
            $('#ulUserTitle').append('<li class="list-group-item">Last name: <span class="text-uppercase fw-bold">' + checkIfDataIsNull(userData.items[0].last_name)+'</span></li>');
            $('#ulUserTitle').append('<li class="list-group-item">First name: <span class="fw-bold">' + checkIfDataIsNull(userData.items[0].first_name)+'</span></li>');
            $('#ulUserTitle').append('<li class="list-group-item">Date of birth: <span class="fw-bold">' + checkIfDataIsNull(userData.items[0].dob)+'</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Last name: <span class="text-uppercase fw-bold">' + checkIfDataIsNull(userData.items[0].last_name) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Maiden name: <span class="text-uppercase fw-bold">' + checkIfDataIsNull(userData.items[0].maiden_name) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">First name: <span class="fw-bold">' + checkIfDataIsNull(userData.items[0].first_name) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Date of birth: <span class="fw-bold">' + checkIfDataIsNull(userData.items[0].dob) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Gender: <span class="fw-bold">' + checkIfDataIsNull(userData.items[0].gender['sex']) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Country of birth: <span class="fw-bold">' + checkIfDataIsNull(userData.items[0].birth_country) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Nationality: <span class="fw-bold">' + checkIfDataIsNull(userData.items[0].nationality) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Email: <span class="fw-bold">' + checkIfDataIsNull(userData.items[0].email) + '</span></li>');
        });
    } else if (listName=='userPhone') {
        userPhone = getUserPhones(id);
        userPhone.then(function(userData){
            $('#ulUserPhones').html('');
            $('#userPhoneModal h5.modal-title').html('New phone for <span class="fw-bold">'+ checkIfDataIsNull(userData.items[0].id_auth_user.first_name) + ' '+ checkIfDataIsNull(userData.items[0].id_auth_user.last_name)+'</span>')
            for (const item of userData.items) {
                let listElement ='';
                listElement += '<li class="list-group-item phone d-flex w-100 justify-content-between align-items-center" data-phone-id="'+item.id+'">';
                listElement += '<span class="">' + checkIfDataIsNull(item.phone_origin) + ': <span class="fw-bold">+' + checkIfDataIsNull(item.phone_prefix,'') + '-' + checkIfDataIsNull(item.phone) + '</span></span>';
                let funcEdit = "confirmEdit(\'"+item.id+"\',\'phone\');";
                let funcDel = "confirmDel(\'"+item.id+"\',\'phone\');";
                listElement += '<span class=""><button type="button" onclick="'+funcDel+'" class="btn btn-danger btn-sm m-2"><i class="fas fa-trash-alt"></i></button><button type="button" onclick="'+funcEdit+'" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></button></span></li>';
                $('#ulUserPhones').append(listElement);
            }
        });
    } else if (listName=='userAddress') {
        userAddress = getUserAddresses(id);
        $('#ulUserAddresses').html('');
        userAddress.then(function (userData) {
            $('#userAddressModal h5.modal-title').html('New address for <span class="fw-bold">'+ checkIfDataIsNull(userData.items[0].id_auth_user.first_name) + ' '+ checkIfDataIsNull(userData.items[0].id_auth_user.last_name)+'</span>')
            for (const item of userData.items) {
                let funcEdit = "confirmEdit(\'"+item.id+"\',\'address\');";
                let funcDel = "confirmDel(\'"+item.id+"\',\'address\');";
                let html = '<li class="list-group-item address" data-address-id="' + item.id + '">';
                html += checkIfDataIsNull(item.address_origin, '') + ' : <br><span class="fw-bold"> ' + checkIfDataIsNull(item.home_num, '') + ' ' + checkIfDataIsNull(item.address1) + '<br>' + checkIfDataIsNull(item.zipcode) + ', ' + checkIfDataIsNull(item.town)+ '<br>' + checkIfDataIsNull(item.country) + '</span>';
                html += '<span class="float-end"><button type="button" onclick="'+funcDel+'" class="btn btn-danger btn-sm me-2"><i class="fas fa-trash-alt"></i></button><button type="button" onclick="'+funcEdit+'" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></button></span>';
                html +='</li>';
                $('#ulUserAddresses').append(html);
            }
        });
    } else { }
}


// catch submit userForm
$('#userForm').submit(function(e) {
    e.preventDefault();
    var formData = $('#userForm').serializeJSON();
    formData = JSON.parse(formData); // change to object
    delete formData['passwordCheck']; // remove passwordCheck field
    formData['first_name'] = capitalize(formData['first_name']);
    formData['last_name'] = capitalize(formData['last_name']);
    formData = JSON.stringify(formData); // change to string
    console.log(formData);
    crud('auth_user','0','POST',data=formData);
    $('#newUserModal').modal('toggle');
    return false;
});


// userAddressForm //

$('#btnNewAddress').click(function() {
    $('#userAddressModal').modal('show');
})

// catch submit userAddressForm
$('#userAddressForm').submit(function(e) {
    e.preventDefault();
    var rec = '0';
    var formData = $('#userAddressForm').serializeJSON();
    formData = JSON.parse(formData); // change to object
    var req = formData['methodAddressSubmit']; // get method
    formData['id_auth_user']=id;
    if (formData['methodAddressSubmit'] =='PUT') {
        formData['id'] = parseInt(formData['idAddressSubmit']); // add id field if put
        rec = formData['id'];
    }
    delete formData['methodAddressSubmit']; 
    delete formData['idAddressSubmit'];
    formData = JSON.stringify(formData); // change to string
    console.log(formData);
    crud('address',rec,req,data=formData); // already sending an info toast and reset form
    $('#userAddressModal').modal('toggle');
    return false;
});


// confirm address DELETION
function confirmDelAddress(id='0',req='') {
    bootbox.confirm({
        message: "Are you sur you want to delete this address?",
        closeButton: false ,
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-danger'
            },
            cancel: {
                label: 'No',
                className: 'btn-primary'
            }
        },
        callback: function (result) {
            if (result == false) {
                console.log(id.toString()+' not deleted');
            } else {
                crud('address',id,'DELETE');
                console.log(id.toString()+' DELETED');
            }
        }
    });
}

// userPhoneForm //

$('#btnNewPhone').click(function() {
    refreshList('userPhone');
    $('#userPhoneModal').modal('show');
})

// catch submit userPhoneForm
$('#userPhoneForm').submit(function(e) {
    e.preventDefault();
    var rec = '0';
    var formData = $('#userPhoneForm').serializeJSON();
    formData = JSON.parse(formData); // change to object
    var req = formData['methodPhoneSubmit']; // get method
    formData['id_auth_user']=id;
    if (formData['methodPhoneSubmit'] =='PUT') {
        formData['id'] = parseInt(formData['idPhoneSubmit']); // add id field if put
        rec = formData['id'];
    }
    delete formData['methodPhoneSubmit']; 
    delete formData['idPhoneSubmit'];
    formData = JSON.stringify(formData); // change to string
    // console.log(formData);
    crud('phone',rec,req,data=formData); // already sending an info toast and reset form
    $('#userPhoneModal').modal('toggle');
    return false;
});

// confirm phone DELETION
function confirmDelPhone(id='0',req='') {
    bootbox.confirm({
        message: "Are you sur you want to delete this phone number?",
        closeButton: false ,
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-danger'
            },
            cancel: {
                label: 'No',
                className: 'btn-primary'
            }
        },
        callback: function (result) {
            if (result == false) {
                console.log(id.toString()+' not deleted');
            } else {
                crud('phone',id,'DELETE');
                console.log(id.toString()+' DELETED');
            }
        }
    });
}

// COMMON confirm DELETION
function confirmDel(id='0', table) {
    bootbox.confirm({
        message: "Are you sur you want to delete this "+table+"?",
        closeButton: false ,
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-danger'
            },
            cancel: {
                label: 'No',
                className: 'btn-primary'
            }
        },
        callback: function (result) {
            if (result == false) {
                console.log(id.toString()+' not deleted');
            } else {
                crud(table,id,'DELETE');
                console.log(id.toString()+' DELETED');
            }
        }
    });
}


// COMMON confirm edition form
function confirmEdit(recid, table) {
    console.log(recid);
    $.ajax({
        url: HOSTURL+"/myapp/api/"+table+"/"+recid+"?@lookup=name!:id_auth_user[first_name,last_name]",
        dataType: 'json',
        type: 'GET',
        success: function (data) {
            if (data.status != 'error' || data.count != 0) {
                item = data.items[0];
                console.log(item.id);
                $("#user"+capitalize(table)+"Modal h5.modal-title").html('Edit '+table+' for '+item['name.first_name']+' '+item['name.last_name']);
                document.getElementById("user"+capitalize(table)+"Form").reset();
                if (table == 'phone') {
                    document.getElementById("originPhoneSelect").value= item.phone_origin;
                    document.getElementById("phone_prefix").value= item.phone_prefix;
                    document.getElementById("phone").value= item.phone;
                    
                } else if (table == 'address') {
                    document.getElementById("originAddressSelect").value= item.address_origin;
                    document.getElementById("address_rank").value= item.address_rank;
                    document.getElementById("home_num").value= item.home_num;
                    document.getElementById("address1").value= item.address1;
                    document.getElementById("address2").value= item.address2;
                    document.getElementById("zipcode").value= item.zipcode;
                    document.getElementById("town").value= item.town;
                    document.getElementById("country").value= item.country;
                }
                document.getElementById("method"+capitalize(table)+"Submit").value= 'PUT';
                document.getElementById("id"+capitalize(table)+"Submit").value= item.id;
                $("#user"+capitalize(table)+"Modal").modal('show');
            }
        }
    });
}


// crud(table,id,req): table = 'table' req = 'POST' without id,  'PUT' 'DELETE' with id
function crud(table,id='0',req='POST',data) {
    console.log(data);
    var API_URL = (req == 'POST'? HOSTURL+"/myapp/api/"+table : HOSTURL+"/myapp/api/"+table+"/"+ id );
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
                displayToast('error',data.message,errors,'6000');
            };
            if (data.status == "success") {
                text='User id: '+(req == 'DELETE'? id : data.id)+mode;
                refreshList('user'+capitalize(table));
                document.getElementById('user'+capitalize(table)+'Form').reset(); // reset form to default
                displayToast('success', table+' '+mode,text,'6000');
            };
        });
}

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
