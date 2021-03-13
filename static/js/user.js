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
            $('#userPhoneModal h5.modal-title').html('New phone for <span class="fw-bold">'+ checkIfDataIsNull(userData.items[0].first_name) + ' '+ checkIfDataIsNull(userData.items[0].last_name)+'</span>')
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
            for (const item of userData.items) {
                $('#ulUserPhones').append('<li class="list-group-item phone" data-phone-id="'+item.id+'">' + checkIfDataIsNull(item.phone_origin) + ': <span class="fw-bold">+' + checkIfDataIsNull(item.phone_prefix,'') +'-' + checkIfDataIsNull(item.phone) + '</span></li>');
            }
        });
    } else if (listName=='userAddress') {
        userAddress = getUserAddresses(id);
        userAddress.then(function (userData) {
            for (const item of userData.items) {
                $('#ulUserAddresses').append('<li class="list-group-item address" data-address-id="' + item.id + '">'+ checkIfDataIsNull(item.address_origin, '') + ' : <span class="fw-bold"> ' + checkIfDataIsNull(item.home_num, '') + ' ' + checkIfDataIsNull(item.address1) + ', ' + checkIfDataIsNull(item.country) + '</span></li>');
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


// userPhoneForm //

$('#btnNewPhone').click(function() {
    $('#userPhoneModal').modal('show');
})

// catch submit userPhoneForm
$('#userPhoneForm').submit(function(e) {
    e.preventDefault();
    var formData = $('#userPhoneForm').serializeJSON();
    formData = JSON.parse(formData); // change to object
    formData['id_auth_user']=id;
    formData = JSON.stringify(formData); // change to string
    console.log(formData);
    crud('phone','0','POST',data=formData); // already sending an info toast
    $('#userPhoneModal').modal('toggle');
    return false;
});


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
                refreshList('userPhone');
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
