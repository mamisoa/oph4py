// globals

var userData, userPhone, userAddress;

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
                console.log(data);
                if (data.status == 'error' || data.count == 0) {
                    displayToast('error', 'GET error', 'Cannot retrieve phones', '6000');
                } else {
                    displayToast('info', 'GET phone request', 'GET ' + data.items[0].id_auth_user['username'], '6000')
                }
            },
            error: function (er) {
                console.log(er);
            }
        }));
};

function getUserAddresses(id) {
    return Promise.resolve(
        $.ajax({
            type: "GET",
            url: API_USER_ADDRESS,
            dataType: "json",
            success: function (data) {
                console.log(data); 
                if (data.status == 'error' || data.count == 0) {
                    displayToast('error', 'GET error', 'Cannot retrieve addresses', '6000');
                } else {
                    displayToast('info', 'GET address request', 'GET ' + data.items[0].id_auth_user['username'], '6000')
                }
            },
            error: function (er) {
                console.log(er);
            }
        }));
};

function refreshAll(){
    arr = ['userauth_user','userPhone','userAddress'];
    for (const table of arr) {
        console.log(table);
        refreshList(table);
    };    
};

refreshAll();

// do when promise.success
function refreshList(listName){
    if (listName=='userauth_user') {
        userData = getUser(id);
        userData.then(function(userData){
            let item = userData.items[0];
            console.log('item:', item);
            $('#ulUserTitle').html('');
            $('#ulUserItems').html('');
            $('#userDetailsModal h5.modal-title').html('Edit patient: <span class="fw-bold">'+ checkIfDataIsNull(item.first_name) + ' '+ checkIfDataIsNull(item.last_name)+'</span>');
            $('#userPhoneModal h5.modal-title').html('New phone for: <span class="fw-bold">' + checkIfDataIsNull(item.first_name) + ' ' + checkIfDataIsNull(item.last_name) + '</span>');
            $('#userAddressModal h5.modal-title').html('New address for: <span class="fw-bold">' + checkIfDataIsNull(item.first_name) + ' ' + checkIfDataIsNull(item.last_name) + '</span>');
            // fills title
            if (item.photob64 != null) {
                $('.photoId').attr("src",checkIfDataIsNull(item.photob64,''));
                $(".photoDiv").removeClass( "visually-hidden" );
            };
            $('#patientTitle .patientName').html(checkIfDataIsNull(item.first_name,'n/a?')+' '+checkIfDataIsNull(item.last_name,'n/a?'));
            $('#patientTitle .patientDob').html(checkIfDataIsNull(item.dob,'n/a?')+' ('+getAge(checkIfDataIsNull(item.dob,''))+' yo)');
            // fills list
            $('#ulUserItems').append('<li class="list-group-item">Last name: <span class="text-uppercase fw-bold">' + checkIfDataIsNull(item.last_name) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Maiden name: <span class="text-uppercase fw-bold">' + checkIfDataIsNull(item.maiden_name) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">First name: <span class="fw-bold">' + checkIfDataIsNull(item.first_name) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Email: <span class="fw-bold">' + checkIfDataIsNull(item.email) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Membership: <span class="fw-bold">' + checkIfDataIsNull(item.membership['membership']) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Date of birth: <span class="fw-bold">' + checkIfDataIsNull(item.dob) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Gender: <span class="fw-bold">' + checkIfDataIsNull(item.gender['sex']) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Marital status: <span class="fw-bold">' + checkIfDataIsNull(item.marital['marital_status']) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Nationality: <span class="fw-bold">' + checkIfDataIsNull(item.nationality) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Country of birth: <span class="fw-bold">' + checkIfDataIsNull(item.birth_country) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Notes: <span class="fw-bold">' + checkIfDataIsNull(item.user_notes) + '</span></li>');
        });
    } else if (listName=='userPhone') {
        userPhone = getUserPhones(id);
        userPhone.then(function(userData){
            $('#ulUserPhones').html('');
            for (const item of userData.items) {
                let listElement ='';
                listElement += '<li class="list-group-item phone d-flex w-100 justify-content-between align-items-center" data-phone-id="'+item.id+'">';
                listElement += '<span class="">' + checkIfDataIsNull(item.phone_origin) + ': <span class="fw-bold">+' + checkIfDataIsNull(item.phone_prefix,'') + '-' + checkIfDataIsNull(item.phone) + '</span></span>';
                let funcEdit = "confirmEdit(\'"+item.id+"\',\'phone\');";
                let funcDel = "confirmDel(\'"+item.id+"\',\'phone\');";
                listElement += '<span class=""><button type="button" onclick="'+funcDel+'" class="btn btn-danger btn-sm m-2"><i class="fas fa-trash-alt"></i></button><button type="button" onclick="'+funcEdit+'" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></button></span></li>';
                $('#ulUserPhones').append(listElement);
            };
        });
    } else if (listName=='userAddress') {
        userAddress = getUserAddresses(id);
        $('#ulUserAddresses').html('');
        userAddress.then(function (userData) {
            for (const item of userData.items) {
                let funcEdit = "confirmEdit(\'"+item.id+"\',\'address\');";
                let funcDel = "confirmDel(\'"+item.id+"\',\'address\');";
                let html = '<li class="list-group-item address" data-address-id="' + item.id + '">';
                html += checkIfDataIsNull(item.address_origin, '') + ' : <br><span class="fw-bold"> ' + checkIfDataIsNull(item.home_num, '') +' '+ checkIfDataIsNull(item.box_num, '') +' '
                html += checkIfDataIsNull(item.address1,'') + ' ' +checkIfDataIsNull(item.address2,'') + '<br>' + checkIfDataIsNull(item.zipcode,'') + ', ' + checkIfDataIsNull(item.town,'')+ '<br>' + checkIfDataIsNull(item.country,'') + '</span>';
                html += '<span class="float-end"><button type="button" onclick="'+funcDel+'" class="btn btn-danger btn-sm me-2"><i class="fas fa-trash-alt"></i></button><button type="button" onclick="'+funcEdit+'" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></button></span>';
                html +='</li>';
                $('#ulUserAddresses').append(html);
            }
        });
    } else { };
};

// userDetailsForm //
$('#btnEditUser').click(function() {
    $.ajax({
        url: HOSTURL+"/myapp/api/auth_user/"+id+"?@lookup=gender!:gender,marital!:marital,ethny!:ethny,membership!:membership",
        dataType: 'json',
        type: 'GET',
        success: function(data) {
            if (data.status != 'error' || data.count != 0) {
                item = data.items[0];
                console.log(item);
                document.getElementById("userAuth_userForm").reset();
                document.getElementById("photob64").setAttribute("src",checkIfDataIsNull(item.photob64,''));
                document.getElementById("firstName").value= item.first_name;
                document.getElementById("lastName").value= item.last_name;
                document.getElementById("maidenName").value= checkIfDataIsNull(item.maiden_name,'');
                document.getElementById("email").value= item.email;
                document.getElementById("membershipSelect").value= checkIfDataIsNull(item['membership.id'],'6');
                document.getElementById("genderSelect").value= checkIfDataIsNull(item['gender.id'],'Male');
                document.getElementById("maritalSelect").value= checkIfDataIsNull(item['marital.id'],'1');
                document.getElementById("dob").value= checkIfDataIsNull(item.dob,'');
                document.getElementById("nationality").value= checkIfDataIsNull(item.nationality,'');
                document.getElementById("birthCountry").value= checkIfDataIsNull(item.birth_country,'');
                document.getElementById("birthTown").value= checkIfDataIsNull(item.birth_town,'');
                document.getElementById("ethnySelect").value= checkIfDataIsNull(item['ethny.id'],'1');
                document.getElementById("idcNum").value= checkIfDataIsNull(item.idc_num,'');
                document.getElementById("noblecondition").value= checkIfDataIsNull(item.noblecondition,'');
                document.getElementById("specialstatus").value= checkIfDataIsNull(item.specialstatus,'');
                document.getElementById("ssn").value= checkIfDataIsNull(item.ssn,'');
                document.getElementById("user_notes").value= checkIfDataIsNull(item.user_notes,'');
                document.getElementById("username").value= item.username;
            }
        }
    });
    $('#userDetailsModal').modal('show');
});

// get id from b-eid
$('#btnGetUserId').click(function(e) {
    $.ajax({
        url: LOCAL_BEID+"/myapp/api/beid",
        dataType: 'json',
        type: 'GET',
        success: function (item) {
            console.log(item);
            document.getElementById("firstName").value= item.prenoms;
            document.getElementById("lastName").value= item.nom;
            let sex = item.sexe == 'M'? 'Male':'Female';
            document.getElementById("genderSelect").value= checkIfDataIsNull(sex,'Male');
            let dob = item.date_naissance.split('/').reverse().join('-');
            document.getElementById("dob").value= checkIfDataIsNull(dob,'');
            document.getElementById("nationality").value= checkIfDataIsNull(item.nationale,'');
            document.getElementById("birthTown").value= checkIfDataIsNull(item.lieu_naissance,'');
            document.getElementById("idcNum").value= checkIfDataIsNull(item.num_carte,'');
            document.getElementById("ssn").value= checkIfDataIsNull(item.num_nat,'');
            document.getElementById("photo").setAttribute("src", "data:image/jpg;base64,"+item.photo);
            document.getElementById("photob64").value=checkIfDataIsNull("data:image/jpg;base64,"+item.photo,'');
            document.getElementById("zipcode").value= item.code_postal;
            document.getElementById("town").value= item.localite;
            let addressStr = item.adresse;
            const regex = /[-]?\d*\.\d+|[-]?\d+/gm;
            addressArr = addressStr.match(regex);
            document.getElementById("home_num").value = addressArr[0];
            document.getElementById("box_num").value = addressArr[1] == undefined ? '' : addressArr[1];
            document.getElementById("address1").value = addressStr.split(addressArr[0])[0];
            $("#userDetailsModal .photoDiv").removeClass( "visually-hidden" );
        }
    })
});

// catch submit userAuth_userForm
$('#userAuth_userForm').submit(function(e) {
    e.preventDefault();
    var formData = $('#userAuth_userForm').serializeJSON();
    formData = JSON.parse(formData); // change to object
    formData['first_name'] = capitalize(formData['first_name']);
    formData['last_name'] = capitalize(formData['last_name']);
    for (let [key,value] of Object.entries(formData)) { // to avoid resetting existing fields
        if (value == '') {
            console.log(key,':empty');
            delete formData[key];
        }
    };
    formData['id']=id;
    formData = JSON.stringify(formData); // change to string
    console.log(formData);
    crud('auth_user',id,'PUT',formData);
    $('#userDetailsModal').modal('toggle');
    refreshList('userauth_user');
    return false;
});


// userAddressForm //

$('#btnNewAddress').click(function() {
    $('#userAddressModal').modal('show');
})

$('#userAddressForm').submit(function(e) {
    e.preventDefault();
    userFormSubmit('address');
});


// userPhoneForm //

$('#btnNewPhone').click(function() {
    refreshList('userPhone');
    $('#userPhoneModal').modal('show');
});

// catch submit userPhoneForm
$('#userPhoneForm').submit(function(e) {
    e.preventDefault();
    userFormSubmit('phone');
});

// COMMON catching submit
function userFormSubmit(table) {
    var rec = '0'; // default
    var formData = $('#user'+capitalize(table)+'Form').serializeJSON();
    formData = JSON.parse(formData); // change to object
    var req = formData['method'+capitalize(table)+'Submit']; // get method
    formData['id_auth_user']=id;
    if (formData['method'+capitalize(table)+'Submit'] =='PUT') {
        formData['id'] = parseInt(formData['id'+capitalize(table)+'Submit']); // add id field if put
        rec = formData['id'];
    }
    delete formData['method'+capitalize(table)+'Submit']; 
    delete formData['id'+capitalize(table)+'Submit'];
    formData = JSON.stringify(formData); // change to string
    console.log(formData);
    crud(table,rec,req,data=formData); // already sending an info toast and reset form
    refreshList('user'+capitalize(table));
    document.getElementById('user'+capitalize(table)+'Form').reset(); // reset form to default
    $('#user'+capitalize(table)+'Modal').modal('toggle');
    return false;
};

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
                refreshList('user'+capitalize(table));
                console.log(id.toString()+' DELETED');
            }
        }
    });
};

// COMMON confirm EDITION
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
                    document.getElementById("box_num").value= item.box_num;
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
};
