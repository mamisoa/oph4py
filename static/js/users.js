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
    crud('auth_user','0','POST',formData);
    $table.bootstrapTable('refresh');
    $('#newUserModal').modal('toggle');
    return false;
});

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
});

