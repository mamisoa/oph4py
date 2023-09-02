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
};

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

// click on new/edit mdparams button
$('#btnEditmdParam').click(function () {
    getmdParam(id)
        .then(function (data) {
            document.getElementById("userMd_paramForm").reset();
            if (data.count > 0) {
                let item = data.items[0];
                $('#userMd_paramForm input[name=id]').val(item.id);
                $('#userMd_paramForm input[name=methodmdParamSubmit]').val('PUT');
                $('#userMd_paramModal .modal-title').html('Edit provider informations');
                $('#userMd_paramForm input[name=inami]').val(item.inami);
                $('#userMd_paramForm input[name=email]').val(item.email);
                $('#userMd_paramForm input[name=officename]').val(item.officename);
                $('#userMd_paramForm input[name=officeaddress]').val(item.officeaddress);
                $('#userMd_paramForm input[name=officezip]').val(item.officezip);
                $('#userMd_paramForm input[name=officetown]').val(item.officetown);
                $('#userMd_paramForm input[name=officecountry]').val(item.officecountry);
                $('#userMd_paramForm input[name=officephone]').val(item.officephone);
                $('#userMd_paramForm input[name=officeurl]').val(item.officeurl);
                $('#userMd_paramForm input[name=companynum]').val(item.companynum);
                $('#userMd_paramForm input[name=companyname]').val(item.companyname);
                $('#userMd_paramForm input[name=companyiban]').val(item.companyiban);
            } else {
                $('#userMd_paramForm input[name=methodmdParamSubmit]').val('POST');
            };
            $('#userMd_paramModal').modal('show');
        })
});


function refreshAll(){
    let arr = ['userauth_user','userPhone','userAddress','userMd_param'];
    for (const table of arr) {
        console.log(table);
        refreshList(table);
    };    
};

refreshAll();

// do when promise.success
function refreshList(listName){
    if (listName=='userauth_user') {
        let userData = getUser(id);
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
            $('#patientTitle .patientSSN').html(checkIfDataIsNull('NISS: ' + item.ssn,'NISS: n/a?'));
            // fills list
            $('#ulUserItems').append('<li class="list-group-item">Last name: <span class="text-uppercase fw-bold">' + checkIfDataIsNull(item.last_name) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Maiden name: <span class="text-uppercase fw-bold">' + checkIfDataIsNull(item.maiden_name) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">First name: <span class="fw-bold">' + checkIfDataIsNull(item.first_name) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Email: <span class="fw-bold">' + checkIfDataIsNull(item.email) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Membership: <span class="fw-bold">' + checkIfDataIsNull(item.membership['membership']) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Date of birth: <span class="fw-bold">' + checkIfDataIsNull(item.dob) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Gender: <span class="fw-bold">' + checkIfDataIsNull(item.gender['sex']) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">SSN: <span class="fw-bold">' + checkIfDataIsNull(item.ssn) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Marital status: <span class="fw-bold">' + checkIfDataIsNull(item['marital.marital_status']) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Nationality: <span class="fw-bold">' + checkIfDataIsNull(item.nationality) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Country of birth: <span class="fw-bold">' + checkIfDataIsNull(item.birth_country) + '</span></li>');
            $('#ulUserItems').append('<li class="list-group-item">Notes: <span class="fw-bold">' + checkIfDataIsNull(item.user_notes) + '</span></li>');
        });
    } else if (listName=='userPhone') {
        let userPhone = getUserPhones(id);
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
        let userAddress = getUserAddresses(id);
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
    } else if ( listName=='userMd_param' ) {
        let mdParam = getmdParam(id);
        mdParam.then( function(data){
            if (data.count >0 ){
                let item = data.items[0];
                $('#mdParamItems').append('<li class="list-group-item">Inami: <span class="fw-bold">' + checkIfDataIsNull(item.inami) + '</span></li>');
                $('#mdParamItems').append('<li class="list-group-item">Professional email: <span class="fw-bold">' + checkIfDataIsNull(item.email) + '</span></li>');
                $('#mdParamItems').append('<li class="list-group-item">Office name: <span class="fw-bold">' + checkIfDataIsNull(item.officename) + '</span></li>');
                $('#mdParamItems').append('<li class="list-group-item">Office Address: <span class="fw-bold">' + checkIfDataIsNull(item.officeaddress) + '</span></li>');
                $('#mdParamItems').append('<li class="list-group-item">Office zip: <span class="fw-bold">' + checkIfDataIsNull(item.officezip) + '</span></li>');
                $('#mdParamItems').append('<li class="list-group-item">Office town: <span class="fw-bold">' + checkIfDataIsNull(item.officetown) + '</span></li>');
                $('#mdParamItems').append('<li class="list-group-item">Office country<span class="fw-bold">' + checkIfDataIsNull(item.officecountry) + '</span></li>');
                $('#mdParamItems').append('<li class="list-group-item">Office phone: <span class="fw-bold">' + checkIfDataIsNull(item.officephone) + '</span></li>');
                $('#mdParamItems').append('<li class="list-group-item">Office url: <span class="fw-bold">' + checkIfDataIsNull(item.officeurl) + '</span></li>');
                $('#mdParamItems').append('<li class="list-group-item">Company number: <span class="fw-bold">' + checkIfDataIsNull(item.companynum) + '</span></li>');
                $('#mdParamItems').append('<li class="list-group-item">Company name: <span class="fw-bold">' + checkIfDataIsNull(item.companyname)+'</span></li>');
                $('#mdParamItems').append('<li class="list-group-item">Company IBAN: <span class="fw-bold">' + checkIfDataIsNull(item.companyiban) + '</span></li>');
            };
        });
    } else {};
};

// userDetailsForm //
$('#btnEditUser').click(function() {
    $.ajax({
        url: HOSTURL+"/"+APP_NAME+"/api/auth_user/"+id+"?@lookup=gender!:gender,marital!:marital,ethny!:ethny,membership!:membership",
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
// $('#btnGetUserId').click(function(e) {
//     $.ajax({
//         url: LOCAL_BEID,
//         dataType: 'json',
//         type: 'GET',
//         success: function (item) {
//             console.log(item);
//             document.getElementById("firstName").value= item.prenoms;
//             document.getElementById("lastName").value= item.nom;
//             let sex = item.sexe == 'M'? '1':'2';
//             document.getElementById("genderSelect").value= checkIfDataIsNull(sex,'Male');
//             let dob = item.date_naissance.split('/').reverse().join('-');
//             document.getElementById("dob").value= checkIfDataIsNull(dob,'');
//             document.getElementById("nationality").value= checkIfDataIsNull(item.nationalite,'');
//             document.getElementById("birthTown").value= checkIfDataIsNull(item.lieu_naissance,'');
//             document.getElementById("idcNum").value= checkIfDataIsNull(item.num_carte,'');
//             document.getElementById("ssn").value= checkIfDataIsNull(item.num_nat,'');
//             document.getElementById("photo").setAttribute("src", "data:image/jpg;base64,"+item.photo);
//             document.getElementById("photob64").value=checkIfDataIsNull("data:image/jpg;base64,"+item.photo,'');
//             document.getElementById("zipcode").value= item.code_postal;
//             document.getElementById("town").value= item.localite;
//             let addressStr = item.adresse;
//             const regex = /[-]?\d*\.\d+|[-]?\d+/gm;
//             addressArr = addressStr.match(regex);
//             document.getElementById("home_num").value = addressArr[0];
//             document.getElementById("box_num").value = addressArr[1] == undefined ? '' : addressArr[1];
//             document.getElementById("address1").value = addressStr.split(addressArr[0])[0];
//             $("#userDetailsModal .photoDiv").removeClass( "visually-hidden" );
//         }
//     })
// });

document.getElementById('btnGetUserId').addEventListener('click', async function(e) {
    try {
        let response = await fetch(LOCAL_BEID);
        let item = await response.json();
        if (item['success'] == true) {
                displayToast('success', item.success , 'Retrieving data from EID' ,'6000');
                console.log('item', item);
                document.getElementById("firstName").value= item.firstnames;
                document.getElementById("lastName").value= item.surname;
                let sex = item.gender == 'M'? '1':'2';
                document.getElementById("genderSelect").value= checkIfDataIsNull(sex,'Male');
                let dob = transformDateBeid(item.date_of_birth);
                document.getElementById("dob").value= checkIfDataIsNull(dob,'');
                document.getElementById("nationality").value= checkIfDataIsNull(item.nationality,'');
                document.getElementById("birthTown").value= checkIfDataIsNull(item.location_of_birth,'');
                document.getElementById("idcNum").value= checkIfDataIsNull(item.card_number,'');
                document.getElementById("ssn").value= checkIfDataIsNull(item.national_number,'');
                document.getElementById("photo").setAttribute("src", "data:image/jpg;base64,"+item.PHOTO_FILE);
                document.getElementById("photob64").value=checkIfDataIsNull("data:image/jpg;base64,"+item.PHOTO_FILE,'');
                document.getElementById("zipcode").value= item.address_zip;
                document.getElementById("town").value= item.address_municipality;
                let addressStr = item.address_street_and_number;
                const regex = /[-]?\d*\.\d+|[-]?\d+/gm;
                addressArr = addressStr.match(regex);
                document.getElementById("home_num").value = addressArr[0];
                document.getElementById("box_num").value = addressArr[1] == undefined ? '' : addressArr[1];
                document.getElementById("address1").value = addressStr.split(addressArr[0])[0];
                $("#userDetailsModal .photoDiv").removeClass( "visually-hidden" );
        } else {
            displayToast('error','Error: ','format ?','6000');
        }
      } catch (error) {
        displayToast('error','Error: ',error,'6000');
        console.error('Error:', error);
      }
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
    crudp('auth_user',id,'PUT',formData).then( data => refreshList('userauth_user'));
    $('#userDetailsModal').modal('toggle');
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
    crudp(table,rec,req,data=formData).then( data => refreshList('user'+capitalize(table)));
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
                crudp(table,id,'DELETE').then( data => refreshList('user'+capitalize(table)));
                console.log(id.toString()+' DELETED');
            }
        }
    });
};

// COMMON confirm EDITION
// don't need user id as it is edition
function confirmEdit(recid, table) {
    console.log(recid);
    $.ajax({
        url: HOSTURL+"/"+APP_NAME+"/api/"+table+"/"+recid+"?@lookup=name!:id_auth_user[first_name,last_name]",
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

// md params
function getmdParam(id) {
    return Promise.resolve(
        $.ajax({
            type: "GET",
            url: API_MDPARAM,
            dataType: "json",
            success: function (data) {
                console.log(data);
                if (data.status == 'error' || data.count == 0) {
                    displayToast('error', 'GET error', 'Cannot retrieve medical registration infos', '6000');
                } else {
                    displayToast('info', 'GET request', 'GET MD registration info' + data.items[0].id_auth_user['username'], '6000');
                }
            },
            error: function (er) {
                console.log(er);
            }
        }));
};

// catch submit userMd_Form
$('#userMd_paramForm').submit(function(e) {
    e.preventDefault();
    let formData = $('#userMd_paramForm').serializeJSON();
    formData = JSON.parse(formData); // change to object
    formData['id_auth_user'] = id;
    formData['companyname'] = capitalize(formData['companyname']);
    formData['officename'] = capitalize(formData['officename']);
    let req = formData['methodmdParamSubmit'];
    req == 'POST'? delete formData['id']: {};
    delete formData['methodmdParamSubmit'];
    for (let [key,value] of Object.entries(formData)) { // delete other empty keys to avoid resetting existing fields
        if (value == '') {
            console.log(key,':empty');
            delete formData[key];
        }
    };
    formStr = JSON.stringify(formData); // change to string
    console.log(formData);
    console.log('method',req);
    crudp('md_params',id,req,formStr).then( data => refreshList('userMd_param'));
    $('#userMd_paramModal').modal('hide');
    return false;
});
