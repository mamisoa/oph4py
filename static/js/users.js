// catch submit userForm
$('#userForm').submit(function(e) {
    console.log('Form submission started - users.js handler');
    e.preventDefault();
    
    // Check if validation.js has run and validated the form
    if (typeof window.formValidationPassed === 'boolean' && !window.formValidationPassed) {
        console.warn('Form validation failed in validation.js');
        return false;
    }
    
    // Check basic form validity
    const form = this;
    console.log('Form validity check:', form.checkValidity());
    
    // If the form doesn't pass HTML5 validation, show invalid fields
    if (!form.checkValidity()) {
        console.error('Form validation failed');
        
        // Find all invalid fields
        const invalidFields = [];
        Array.from(form.elements).forEach(input => {
            if (!input.checkValidity()) {
                invalidFields.push({
                    name: input.name,
                    id: input.id,
                    validationMessage: input.validationMessage
                });
            }
        });
        
        console.error('Invalid fields:', invalidFields);
        
        // Add explicit error message to the form
        const errorMsg = document.createElement('div');
        errorMsg.className = 'alert alert-danger';
        errorMsg.textContent = 'Please fix the form errors before submitting';
        
        if (!document.querySelector('#userForm .alert.alert-danger')) {
            form.prepend(errorMsg);
            
            // Remove the error after 3 seconds
            setTimeout(() => {
                if (errorMsg.parentNode) {
                    errorMsg.parentNode.removeChild(errorMsg);
                }
            }, 3000);
        }
        
        // Force the browser to show validation messages
        form.reportValidity();
        return false;
    }
    
    // Check if jQuery is loaded
    console.log('jQuery version:', $.fn.jquery);
    console.log('Bootstrap version:', (typeof bootstrap !== 'undefined' ? 'loaded' : 'not loaded'));
    
    // Ensure required functions exist
    if (typeof capitalize !== 'function') {
        console.log('capitalize function not found, creating fallback');
        // Define capitalize function if not available
        window.capitalize = function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        };
    }
    
    if (typeof displayToast !== 'function') {
        console.log('displayToast function not found, creating fallback');
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
        console.log('crudp function not found, creating fallback');
        // Define simple crudp function if not available
        window.crudp = function(table, id, method, data) {
            console.log(`CRUD operation: ${method} on ${table} with ID ${id}`);
            return Promise.resolve({});
        };
    }
    
    let formStr, formObj;
    
    // Check if serializeJSON is available
    if (typeof $.fn.serializeJSON === 'function') {
        console.log('serializeJSON is available');
        formStr = $('#userForm').serializeJSON();
        console.log('Raw serialized form:', formStr);
        formObj = JSON.parse(formStr);
    } else {
        console.warn("serializeJSON not available, using fallback");
        formObj = {};
        const form = document.getElementById('userForm');
        console.log('Form element found:', !!form);
        const formData = new FormData(form);
        
        for (const [key, value] of formData.entries()) {
            formObj[key] = value;
            console.log(`Form field: ${key} = ${value}`);
        }
        formStr = JSON.stringify(formObj);
    }
    
    // Remove passwordCheck field
    delete formObj['passwordCheck'];
    
    // Remove empty fields to prevent API validation errors
    for (const key in formObj) {
        if (formObj[key] === null || formObj[key] === undefined || 
            (typeof formObj[key] === 'string' && formObj[key].trim() === '')) {
            console.log(`Removing empty field: ${key}`);
            delete formObj[key];
        }
    }
    
    let mobileObj = {};
    let addressObj = {};
    let infoaddress = 'no';
    let infomobile = 'no';
    formObj['first_name'] = capitalize(formObj['first_name']);
    formObj['last_name'] = capitalize(formObj['last_name']);
    
    console.log('Form data after capitalization:', {
        first_name: formObj['first_name'],
        last_name: formObj['last_name']
    });
    
    // address only set if btnGetUserId pushed
    // only missing the id_auth_user after post
    if (formObj['ssn'] != '') {
        console.log('SSN present, processing address');
        infoaddress = 'yes';
        let addressStr = formObj['address'];
        console.log('Address string:', addressStr);
        const regex = /[-]?\d*\.\d+|[-]?\d+/gm;
        let addressArr = addressStr.match(regex);
        console.log('Address regex matches:', addressArr);
        
        if (addressArr && addressArr.length > 0) {
            addressObj['home_num'] = addressArr[0];
            addressObj['box_num'] = addressArr[1] == undefined ? '' : addressArr[1];
            addressObj['address1'] = addressStr.split(addressArr[0])[0];
        } else {
            console.log('No regex matches, using full address string');
            addressObj['home_num'] = '';
            addressObj['box_num'] = '';
            addressObj['address1'] = addressStr;
        }
        
        addressObj['zipcode'] = formObj['zipcode'];
        addressObj['town'] = formObj['town'];
        addressObj['country'] = 'Belgique';
        addressObj['address_rank'] = '1';
        addressObj['address_origin'] = 'Home';
        console.log('Processed address object:', addressObj);
    } else {
        console.log('No SSN present, skipping address processing');
    }
    
    if (formObj['phone'] != '' && formObj['phone_prefix'] !='') {
        console.log('Phone data present');
        infomobile = 'yes';
        mobileObj['phone_prefix'] = formObj['phone_prefix'];
        mobileObj['phone'] = formObj['phone'];
        mobileObj['phone_origin'] = 'Mobile';
        console.log('Mobile data:', mobileObj);
    } else {
        console.log('Phone not recorded: prefix or phone missing');
        console.log('Phone:', formObj['phone']);
        console.log('Phone prefix:', formObj['phone_prefix']);
    }
    
    // Clean up form object - remove fields we've already processed
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
    
    // Reserialize after cleanup
    formStr = JSON.stringify(formObj);
    console.log('Final form data to submit:', formObj);
    
    try {
        // Get app name and host URL
        console.log('Checking app name and host URL');
        const app_name = (typeof APP_NAME !== 'undefined') ? APP_NAME : 
            window.location.pathname.split('/')[1] || 'oph4py';
        console.log('Using app_name:', app_name);
        
        if (typeof HOSTURL === 'undefined') {
            console.warn('HOSTURL is undefined, using window.location.origin');
            window.HOSTURL = window.location.origin;
        }
        console.log('Using HOSTURL:', HOSTURL);
        
        const apiUrl = HOSTURL + '/' + app_name + '/api/auth_user';
        console.log('API URL for submission:', apiUrl);
        
        // Prevent modal from closing prematurely
        $('#newUserModal').data('bs.modal')._config.backdrop = 'static';
        $('#newUserModal').data('bs.modal')._config.keyboard = false;
        
        console.log('Starting AJAX request...');
        $.ajax({
            url: apiUrl,
            data: formStr,
            contentType: 'application/json',
            dataType: 'json',
            method: 'POST',
            beforeSend: function(xhr) {
                console.log('AJAX request starting, adding loading message');
                $('#newUserModal .modal-content').append('<div class="alert alert-info">Processing, please wait...</div>');
            }
        })
        .done(function(data) {
            console.log('AJAX request completed successfully');
            console.log('Response data:', data);
            
            let status = data.status;
            let message = data.message;
            let errors = "";
            
            console.log('Response status:', status);
            
            if (data.status == "error") {
                console.log('Error response received');
                console.log('Error details:', data.errors);
                
                for (let i in data.errors) {
                    errors += data.errors[i]+'</br>';
                }
                
                displayToast('error', data.message, errors, '6000');
                console.log('Error toast displayed');
                
                // Remove static backdrop to allow closing
                $('#newUserModal').data('bs.modal')._config.backdrop = true;
                $('#newUserModal').data('bs.modal')._config.keyboard = true;
                
                // Remove processing message
                $('#newUserModal .alert').remove();
            } else if (data.status == "success") {
                console.log('Success response with ID:', data.id);
                
                let text = 'User id: ' + (data.id) + ' added';
                console.log('Success message:', text);
                console.log('infomobile =', infomobile);
                displayToast('success', 'User added', text, '6000');
                
                if (infoaddress == 'yes') {
                    console.log('Adding address data for user ID:', data.id);
                    addressObj['id_auth_user'] = data.id;
                    let addressStr = JSON.stringify(addressObj);
                    console.log('Address object to submit:', addressObj);
                    crudp('address', '0', 'POST', addressStr)
                        .then(function(result) {
                            console.log('Address created result:', result);
                        })
                        .catch(function(err) {
                            console.error('Address creation error:', err);
                        });
                } else {
                    console.log('No address recorded');
                }
                
                if (infomobile == 'yes') {
                    console.log('Adding mobile data for user ID:', data.id);
                    mobileObj['id_auth_user'] = data.id;
                    let mobileStr = JSON.stringify(mobileObj);
                    console.log('Mobile object to submit:', mobileObj);
                    crudp('phone', '0', 'POST', mobileStr)
                        .then(function(result) {
                            console.log('Phone created result:', result);
                        })
                        .catch(function(err) {
                            console.error('Phone creation error:', err);
                        });
                } else {
                    console.log('No mobile data recorded');
                }
                
                // Refresh table if it exists
                if (typeof $table !== 'undefined' && $table && $table.bootstrapTable) {
                    console.log('Refreshing table');
                    $table.bootstrapTable('refresh');
                } else {
                    console.warn('$table not available or not a bootstrap table');
                }
                
                // Remove processing message
                $('#newUserModal .alert').remove();
                
                // Reset static backdrop setting
                $('#newUserModal').data('bs.modal')._config.backdrop = true;
                $('#newUserModal').data('bs.modal')._config.keyboard = true;
                
                console.log('Closing modal');
                $('#newUserModal').modal('hide');
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('AJAX request failed');
            console.error('Status:', textStatus);
            console.error('Error:', errorThrown);
            console.error('Response:', jqXHR.responseText);
            
            // Try to parse error response for more information
            let errorMessage = errorThrown;
            try {
                const errorData = JSON.parse(jqXHR.responseText);
                if (errorData.message) {
                    errorMessage = errorData.message;
                    console.error('Error message from server:', errorMessage);
                }
            } catch (e) {
                console.error('Could not parse error response as JSON');
            }
            
            // Remove processing message
            $('#newUserModal .alert').remove();
            
            // Reset static backdrop setting
            $('#newUserModal').data('bs.modal')._config.backdrop = true;
            $('#newUserModal').data('bs.modal')._config.keyboard = true;
            
            displayToast('error', 'Form submission failed', 'Server error: ' + errorMessage, '6000');
        });
    } catch (error) {
        console.error('Error in form submission process:', error);
        console.error('Error stack:', error.stack);
        displayToast('error', 'Form submission error', error.message, '6000');
    }
    
    console.log('Form handler completed, preventing default form submission');
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

// Add direct handler for the submit button
$(document).ready(function() {
    console.log('Document ready, setting up handlers');
    
    // Test serializeJSON functionality
    console.log('Testing serializeJSON plugin availability');
    if (typeof $.fn.serializeJSON === 'function') {
        console.log('serializeJSON plugin found');
        
        // Create a test form with a simple field
        const testForm = $('<form><input name="test" value="value"></form>');
        
        try {
            const serialized = testForm.serializeJSON();
            console.log('serializeJSON test result:', serialized);
            
            // Parse the result to see if it's valid JSON
            try {
                const parsed = JSON.parse(serialized);
                console.log('JSON parse successful:', parsed);
                if (parsed.test === 'value') {
                    console.log('serializeJSON working correctly');
                } else {
                    console.warn('serializeJSON output has unexpected structure');
                }
            } catch (parseError) {
                console.error('Failed to parse serializeJSON output:', parseError);
                console.log('Raw output:', serialized);
                
                // Patch jQuery.fn.serializeJSON with a simple implementation
                $.fn.serializeJSON = function() {
                    console.log('Using fallback serializeJSON implementation');
                    const formData = {};
                    const formArray = this.serializeArray();
                    
                    $.each(formArray, function() {
                        formData[this.name] = this.value;
                    });
                    
                    return JSON.stringify(formData);
                };
            }
        } catch (serializeError) {
            console.error('serializeJSON call failed:', serializeError);
            
            // Implement a fallback
            $.fn.serializeJSON = function() {
                console.log('Using fallback serializeJSON after error');
                const formData = {};
                const formArray = this.serializeArray();
                
                $.each(formArray, function() {
                    formData[this.name] = this.value;
                });
                
                return JSON.stringify(formData);
            };
        }
    } else {
        console.warn('serializeJSON plugin not found, implementing fallback');
        
        // Implement a simple version
        $.fn.serializeJSON = function() {
            console.log('Using fallback serializeJSON implementation');
            const formData = {};
            const formArray = this.serializeArray();
            
            $.each(formArray, function() {
                formData[this.name] = this.value;
            });
            
            return JSON.stringify(formData);
        };
        
        // Test the fallback
        const testForm = $('<form><input name="test" value="value"></form>');
        const serialized = testForm.serializeJSON();
        console.log('Fallback serializeJSON test result:', serialized);
    }
    
    // Check if the label and form submit button exist
    const submitLabel = document.getElementById('labelSubmit');
    const submitButton = document.getElementById('btnNewUserSubmit');
    
    console.log('Submit label exists:', !!submitLabel);
    console.log('Submit button exists:', !!submitButton);
    
    if (submitLabel) {
        console.log('Adding click handler to submit label');
        $(submitLabel).on('click', function(e) {
            console.log('Submit label clicked');
            // Trigger the actual form submission
            if (submitButton) {
                console.log('Triggering form submission');
                $(submitButton).trigger('click');
            } else {
                console.error('Submit button not found');
                $('#userForm').trigger('submit');
            }
        });
    }
    
    // Check the modal events to see if they're working
    $('#newUserModal').on('show.bs.modal', function () {
        console.log('Modal show event triggered');
    });
    
    $('#newUserModal').on('shown.bs.modal', function () {
        console.log('Modal shown event triggered');
    });
    
    $('#newUserModal').on('hide.bs.modal', function (e) {
        console.log('Modal hide event triggered');
        // If form is currently submitting, prevent hiding
        if ($('#newUserModal .alert.alert-info').length > 0) {
            console.log('Submission in progress, preventing hide');
            e.preventDefault();
            return false;
        }
    });
    
    $('#newUserModal').on('hidden.bs.modal', function () {
        console.log('Modal hidden event triggered');
    });
    
    // Add direct submit event to the form
    $('#userForm').on('submit', function() {
        console.log('Direct form submit handler triggered');
    });
});

// Debug function to verify form data
window.debugFormData = function() {
    console.log('Debugging form data:');
    const form = document.getElementById('userForm');
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
    
    // Check required fields
    const requiredFields = ['first_name', 'last_name', 'username', 'password', 'dob', 'gender', 'membership'];
    let missingFields = [];
    
    for (const field of requiredFields) {
        if (!formData.get(field) || formData.get(field).trim() === '') {
            missingFields.push(field);
        }
    }
    
    if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
    } else {
        console.log('All required fields present');
    }
    
    return {
        valid: missingFields.length === 0,
        missingFields: missingFields
    };
};
