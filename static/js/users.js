// catch submit userForm
$('#userForm').submit(function(e) {
    e.preventDefault();
    
    // Ensure required functions exist
    if (typeof capitalize !== 'function') {
        // Define capitalize function if not available
        window.capitalize = function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        };
    }
    
    if (typeof displayToast !== 'function') {
        // Define displayToast function if not available
        window.displayToast = function(type, title, message, duration) {
            console.log(`Toast (${type}): ${title} - ${message}`);
            // Fallback to alert for critical errors
            if (type === 'error') {
                alert(`${title}: ${message}`);
            }
        };
    }
    
    if (typeof crudp !== 'function') {
        // Define simple crudp function if not available
        window.crudp = function(table, id, method, data) {
            console.log(`CRUD operation: ${method} on ${table} with ID ${id}`);
            return Promise.resolve({});
        };
    }
    
    let formStr, formObj;
    
    // Check if serializeJSON is available
    if (typeof $.fn.serializeJSON === 'function') {
        formStr = $('#userForm').serializeJSON();
        formObj = JSON.parse(formStr);
    } else {
        // Fallback to manual form data collection
        console.warn("serializeJSON not available, using fallback");
        formObj = {};
        const form = document.getElementById('userForm');
        const formData = new FormData(form);
        
        for (const [key, value] of formData.entries()) {
            formObj[key] = value;
        }
        formStr = JSON.stringify(formObj);
    }
    
    // Remove passwordCheck field
    delete formObj['passwordCheck'];
    
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
        addressObj['address1'] = addressArr == null ? addressStr : addressStr.split(addressArr[0])[0];
        addressObj['zipcode'] = formObj['zipcode'];
        addressObj['town'] = formObj['town'];
        addressObj['country'] = 'Belgique';
        addressObj['address_rank'] = '1';
        addressObj['address_origin'] = 'Home';
    } else {};
    if (formObj['phone'] != '' && formObj['phone_prefix'] !='') {
        infomobile = 'yes';
        mobileObj['phone_prefix']=formObj['phone_prefix'];
        mobileObj['phone']=formObj['phone'];
        mobileObj['phone_origin']='Mobile';
        console.log('mobiledata present:',mobileObj);
    } else {
        console.log('Phone not recorded: prefix or phone missing');
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
    
    try {
        // Ensure APP_NAME is defined, if not extract from current path
        const app_name = (typeof APP_NAME !== 'undefined') ? APP_NAME : 
            window.location.pathname.split('/')[1] || 'oph4py';
            
        $.ajax({
            url: HOSTURL + '/' + app_name + '/api/auth_user',
            data: formStr,
            contentType: 'application/json',
            dataType: 'json',
            method: 'POST'
            })
            .done(function(data) {
                console.log('Response data:', data);
                let status = data.status;
                let message = data.message;
                let errors = "";
                if (data.status == "error") {
                    for (let i in data.errors) {
                        errors += data.errors[i]+'</br>';
                    };
                    displayToast('error',data.message,errors,'6000');
                } else if (data.status == "success") { // user added, get the id
                    let text='User id: '+(data.id)+ ' added';
                    console.log('infomobile =', infomobile);
                    displayToast('success', 'User added', text, '6000');
                    if (infoaddress == 'yes') { // if id card info available
                        addressObj['id_auth_user'] = data.id;
                        console.log('addressObj: ', addressObj);
                        let addressStr = JSON.stringify(addressObj);
                        console.log('address present:',addressObj);
                        crudp('address','0','POST',addressStr); 
                    } else {
                        console.log('No address recorded');
                    };
                    if (infomobile == 'yes') {
                        mobileObj['id_auth_user']=data.id;
                        console.log('mobiledata present:',mobileObj);
                        let mobileStr = JSON.stringify(mobileObj);
                        crudp('phone','0','POST',mobileStr); 
                    } else {
                        console.log('No mobile data recorded');
                    };
                    
                    // Refresh table and close modal
                    if (typeof $table !== 'undefined') {
                        $table.bootstrapTable('refresh');
                    }
                    $('#newUserModal').modal('hide');
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error:', textStatus, errorThrown);
                displayToast('error', 'Form submission failed', 'Server error: ' + errorThrown, '6000');
            });
    } catch (error) {
        console.error('Error in form submission:', error);
        displayToast('error', 'Form submission error', error.message, '6000');
    }
    
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


function delUser (id , name) {
    bootbox.confirm({
        message: "Are you sure you want to delete this user: <strong>"+name+"</strong> ?",
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
                crudp('auth_user',id,'DELETE').then($table.bootstrapTable('refresh'));
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
    $('#userForm input[name=email]').val(suffix+'@nomail.com');
});

// // get id from b-eid
// $('#btnGetUserId').click(function(e) {
//     $.ajax({
//         url: LOCAL_BEID,
//         dataType: 'json',
//         type: 'GET',
//         success: function (item) {
//             console.log(item);
//             $("#firstName").val(item.prenoms).trigger('change');
//             document.getElementById("lastName").value= item.nom;
//             let sex = item.sexe == 'M'? '1':'2';
//             document.getElementById("genderSelect").value= checkIfDataIsNull(sex,'Male');
//             let dob = item.date_naissance.split('/').reverse().join('-');
//             document.getElementById("newUserdob").value= checkIfDataIsNull(dob,'');
//             document.getElementById("newUserNationality").value= checkIfDataIsNull(item.nationalite,'');
//             document.getElementById("newUserbirthTown").value= checkIfDataIsNull(item.lieu_naissance,'');
//             document.getElementById("newUserIdcNum").value= checkIfDataIsNull(item.num_carte,'');
//             document.getElementById("newUserSsn").value= checkIfDataIsNull(item.num_nat,'');
//             document.getElementById("photoidc").setAttribute("src", "data:image/jpg;base64,"+item.photo);
//             document.getElementById("newUserPhoto").value=checkIfDataIsNull("data:image/jpg;base64,"+item.photo,'');
//             document.getElementById("newUserAddress").value= item.adresse;
//             document.getElementById("newUserZip").value= item.code_postal;
//             document.getElementById("newUserTown").value= item.localite;
//             $("#newUserModal .photoDiv").removeClass( "visually-hidden" );
//         }
//     })
// });

// get id from b-eid
document.getElementById('btnGetUserId').addEventListener('click', async function(e) {
    try {
        let response = await fetch(LOCAL_BEID);
        let item = await response.json();
        if (item['success'] == true) {
                displayToast('success', item.success , 'Retrieving data from EID' ,'6000');
                console.log('item', item);
                $("#firstName").val(item.firstnames).trigger('change');
                document.getElementById("lastName").value = item.surname;
                let sex = item.gender == 'M'? '1':'2';
                document.getElementById("genderSelect").value= checkIfDataIsNull(sex,'Male');
                let dob = transformDateBeid(item.date_of_birth);
                document.getElementById("newUserdob").value= checkIfDataIsNull(dob,'');
                document.getElementById("newUserNationality").value= checkIfDataIsNull(item.nationality,'');
                document.getElementById("newUserbirthTown").value= checkIfDataIsNull(item.location_of_birth,'');
                document.getElementById("newUserIdcNum").value= checkIfDataIsNull(item.card_number,'');
                document.getElementById("newUserSsn").value= checkIfDataIsNull(item.national_number,'');
                document.getElementById("photoidc").setAttribute("src", "data:image/jpg;base64,"+item.PHOTO_FILE);
                document.getElementById("newUserPhoto").value=checkIfDataIsNull("data:image/jpg;base64,"+item.PHOTO_FILE,'');
                document.getElementById("newUserAddress").value= item.address_street_and_number;
                document.getElementById("newUserZip").value= item.address_zip;
                document.getElementById("newUserTown").value= item.address_municipality;
                $("#newUserModal .photoDiv").removeClass( "visually-hidden" );
        } else {
            displayToast('error','Error: ','format ?','6000');
        }
      } catch (error) {
        displayToast('error','Error: ',error,'6000');
        console.error('Error:', error);
      }
});

document.getElementById('btnCheckUser').addEventListener('click', async function(e) {
    try {
        let response = await fetch(LOCAL_BEID);
        let item = await response.json();
        displayToast('success', item.success , 'Retrieving data from EID' ,'6000');
        if (item['success'] == true) {
            // Supprimer les espaces et les tirets, et prendre le premier prénom et nom
            let sanitizedFirstName = item.firstnames.replace(/[\s-].*$/, '');
            let sanitizedLastName = item.surname.replace(/[\s-].*$/, '');

            let search = sanitizedLastName + ',' + sanitizedFirstName;
            
            console.log("search",search);
            // Mettre la valeur de "search" dans l'input
            let searchInput = document.querySelector('#userTable .search-input');
            searchInput.value = search;

            // Donner le focus à l'élément input
            searchInput.focus();

            // Simuler la saisie d'une lettre pour déclencher la recherche
            let keyPressEvent = new KeyboardEvent('keyup', { key: 'a' });
            searchInput.dispatchEvent(keyPressEvent);
            
            
        } else {
            displayToast('error','Error: ','format ?','6000');
        }
      } catch (error) {
        displayToast('error','Error: ',error,'6000');
        console.error('Error:', error);
      }
});
