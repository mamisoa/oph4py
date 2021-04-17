// catch submit userForm
$('#userForm').submit(function(e) {
    e.preventDefault();
    let formStr = $('#userForm').serializeJSON();
    formObj = JSON.parse(formStr); // change to object
    delete formObj['passwordCheck']; // remove passwordCheck field
    let mobileObj = Object.assign({}, formObj);
    formObj['first_name'] = capitalize(formObj['first_name']);
    delete mobileObj['first_name'];
    delete mobileObj['last_name'];
    formObj['last_name'] = capitalize(formObj['last_name']);
    mobileObj['phone_prefix']=formObj['phone_prefix'];
    delete formObj['phone_prefix'];
    mobileObj['phone']=formObj['phone'];
    delete formObj['phone'];
    delete mobileObj['email'];
    delete mobileObj['gender'];
    delete mobileObj['username'];
    delete mobileObj['password'];
    delete mobileObj['membership'];
    mobileObj['phone_origin']='Mobile';
    mobileStr = JSON.stringify(mobileObj);
    formStr = JSON.stringify(formObj); // change to string
    console.log('userdata:',formObj);
    if (mobileObj['phone'] != '' || mobileObj['prefix'] =='') {
        // console.log('mobiledata present:',mobileObj);
        crud('phone','0','POST',mobileStr); 
    } else {
        displayToast('error','Phone not recorded','Fill prefix and mobile phone', 3000);
    };
    crud('auth_user','0','POST',formStr); 
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
    document.querySelector("#userForm input[name='phone_prefix']").value = '32';
});

$('#userForm input[name=first_name]').change(function(){
    console.log('first name changed');
    let t = new Date();
    suffix = $('#userForm input[name=first_name]').val()+parseInt(t.getMilliseconds())+parseInt(t.getSeconds());
    $('#userForm input[name=username]').val(suffix);
});