// catch submit userForm
$('#userForm').submit(function(e) {
    e.preventDefault();
    let formStr = $('#userForm').serializeJSON();
    // contains: id card info, phone and address
    formObj = JSON.parse(formStr); // change to object
    delete formObj['passwordCheck']; // remove passwordCheck field
    let mobileObj = {};
    let addressObj ={};
    let infoaddress = 'no';
    let infomobile = 'no';
    formObj['first_name'] = capitalize(formObj['first_name']);
    formObj['last_name'] = capitalize(formObj['last_name']);
    // address only set if btnGetUserId pushed
    // only missing the id_auth_user after post
    if (formObj['ssn'] != '') {
        infoaddress = 'yes';
        let addressStr = formObj['address'];
        console.log(addressStr);
        const regex = /[-]?\d*\.\d+|[-]?\d+/gm;
        addressArr = addressStr.match(regex);
        addressObj['home_num'] = addressArr[0];
        addressObj['box_num'] = addressArr[1] == undefined ? '' : addressArr[1];
        addressObj['address1'] = addressStr.split(addressArr[0])[0];
        addressObj['zipcode'] = formObj['zipcode'];
        addressObj['town'] = formObj['town'];
        addressObj['country'] = 'Belgique';
        addressObj['address_rank'] = '1';
        addressObj['address_origin'] = 'Home';
    } else {};
    if (formObj['phone'] != '' && formObj['prefix'] !='') {
        infomobile = 'yes';
        mobileObj['phone_prefix']=formObj['phone_prefix'];
        mobileObj['phone']=formObj['phone'];
        mobileObj['phone_origin']='Mobile';
        console.log('mobiledata present:',mobileObj);
    } else {
        displayToast('error','Phone not recorded','Fill prefix and mobile phone', 3000);
    };
    delete formObj['phone_prefix'];
    delete formObj['phone'];
    delete formObj['home_num'];
    delete formObj['box_num'];
    delete formObj['address1'];
    delete formObj['zipcode'];
    delete formObj['town'];
    delete formObj['country'];
    delete formObj['address_rank_1'];
    delete formObj['address_origin'];
    delete formObj['id_auth_user'];
    delete formObj['address'];
    formStr = JSON.stringify(formObj); // change to string
    console.log('userdata:',formObj);
    $.ajax({
        url: HOSTURL+'/myapp/api/auth_user',
        data: formStr,
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
                displayToast('error',data.message,errors,'6000');
            };
            if (data.status == "success") { // user added, get the id
                text='User id: '+(data.id)+ 'added';
                console.log('infomobile =', infomobile);
                displayToast('success', 'User added ',text,'6000');
                if (infoaddress == 'yes') { // if id card info available
                    addressObj['id_auth_user'] = data.id;
                    console.log('addressObj: ', addressObj);
                    addressStr = JSON.stringify(addressObj);
                    console.log('address present:',addressObj);
                    crud('address','0','POST',addressStr); 
                } else {
                    console.log('No address recorded');
                };
                if (infomobile == 'yes') {
                    mobileObj['id_auth_user']=data.id;
                    console.log('mobiledata present:',mobileObj);
                    let mobileStr = JSON.stringify(mobileObj);
                    crud('phone','0','POST',mobileStr); 
                } else {
                    console.log('No mobile data recorded');
                }; 
            };
        }) 
    $table.bootstrapTable('refresh');
    $('#newUserModal').modal('toggle');
    return false;
});

function crudNewUser(){
    return Promise.resolve(
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
                    displayToast('success', table+' '+mode,text,'6000');
                };
            }) 
    )
}


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
                crud('auth_user',id,'DELETE');
                $table.bootstrapTable('refresh');
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};


// btn new user before opening modal : clear form, set default generated password
// password should be sent by email in future
$( "#btnNewUser" ).click(function() {
    document.getElementById('userForm').reset();
    pass = passGen();
    document.querySelector("#userForm input[name='password']").value = pass;
    document.querySelector("#userForm input[name='passwordCheck']").value = pass;
    document.querySelector("#userForm input[name='phone_prefix']").value = '32';
    document.getElementById("photoidc").setAttribute("src", "");
    $("#newUserModal .photoDiv").addClass( "visually-hidden" );
});

// autofill username
$('#userForm input[name=first_name]').change(function(){
    console.log('first name changed');
    let t = new Date();
    suffix = $('#userForm input[name=first_name]').val().split(' ').join('')+parseInt(t.getMilliseconds())+parseInt(t.getSeconds());
    $('#userForm input[name=username]').val(suffix);
    $('#userForm input[name=email]').val(suffix+'@gmail.com');
});

// get id from b-eid
$('#btnGetUserId').click(function(e) {
    $.ajax({
        url: LOCAL_BEID+"/myapp/api/beid",
        dataType: 'json',
        type: 'GET',
        success: function (item) {
            console.log(item);
            $("#firstName").val(item.prenoms).trigger('change');
            document.getElementById("lastName").value= item.nom;
            let sex = item.sexe == 'M'? '1':'2';
            document.getElementById("genderSelect").value= checkIfDataIsNull(sex,'Male');
            let dob = item.date_naissance.split('/').reverse().join('-');
            document.getElementById("newUserdob").value= checkIfDataIsNull(dob,'');
            document.getElementById("newUserNationality").value= checkIfDataIsNull(item.nationalite,'');
            document.getElementById("newUserbirthTown").value= checkIfDataIsNull(item.lieu_naissance,'');
            document.getElementById("newUserIdcNum").value= checkIfDataIsNull(item.num_carte,'');
            document.getElementById("newUserSsn").value= checkIfDataIsNull(item.num_nat,'');
            document.getElementById("photoidc").setAttribute("src", "data:image/jpg;base64,"+item.photo);
            document.getElementById("newUserPhoto").value=checkIfDataIsNull("data:image/jpg;base64,"+item.photo,'');
            document.getElementById("newUserAddress").value= item.adresse;
            document.getElementById("newUserZip").value= item.code_postal;
            document.getElementById("newUserTown").value= item.localite;
            $("#newUserModal .photoDiv").removeClass( "visually-hidden" );
        }
    })
});
