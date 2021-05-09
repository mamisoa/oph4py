// get item details for put request
function getWlItemDetails(wl_id) {
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: HOSTURL+"/myapp/api/worklist/"+wl_id+"?@lookup=id_auth_user!:id_auth_user[id,first_name,last_name],provider!:provider[id,first_name,last_name],procedure!:procedure,modality!:modality_dest[id,modality_name],receiving_facility!:receiving_facility[id,facility_name],sending_facility!:sending_facility[id,facility_name],senior!:senior[id,first_name,last_name]",
            success: function(data) {
                if (data.status != 'error') {
                    displayToast('success', 'GET wl details', 'GET wl details from id :'+wl_id,6000);
                } else {
                    displayToast('error', 'GET error', 'Cannot retrieve wl details');
                }
            }, // success
            error: function (er) {
                console.log(er);
            }
        })
    ); // promise return data
};

function delWlItem (id) {
    bootbox.confirm({
        message: "Are you sure you want to delete this worklist item?",
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
                crud('worklist',id,'DELETE');
                $table_wl.bootstrapTable('refresh');
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};