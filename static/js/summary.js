
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


// do when promise.success
function refreshList(listName){
    if (listName=='userauth_user') {
        let userData = getUser(id);
        userData.then(function(userData){
            let item = userData.items[0];
            console.log('item:', item);
            // fills title
            if (item.photob64 != null) {
                $('.photoId').attr("src",checkIfDataIsNull(item.photob64,''));
                $(".photoDiv").removeClass( "visually-hidden" );
            };
            $('#patientTitle .patientName').html(checkIfDataIsNull(item.first_name,'n/a?')+' '+checkIfDataIsNull(item.last_name,'n/a?'));
            $('#patientTitle .patientDob').html(checkIfDataIsNull(item.dob,'n/a?')+' ('+getAge(checkIfDataIsNull(item.dob,''))+' yo)');
            $('#patientTitle .patientId').html('#'+checkIfDataIsNull(item.id,'n/a?'));
            $('#patientTitle .patientSsn').html('NISS #'+checkIfDataIsNull(item.ssn));
            $('#patientTitle .patientCard').html('Card #'+checkIfDataIsNull(item.idc_num));
            $('#patientTitle .patientEmail').html('Email: '+checkIfDataIsNull(item.email));
        });
    } else {};
};
refreshList('userauth_user');