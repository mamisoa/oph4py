// get wl details
function getWlDetails(wlId){
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: HOSTURL+"/myapp/api/worklist/"+wlId+"?@lookup=user!:id_auth_user[id,last_name,first_name,dob]",
            success: function(data) {
                if (data.status != 'error' || data.count) {
                    displayToast('success', 'GET combo exams', 'GET'+data.items[0]['user.first_name']+' '+data.items[0]['user.last_name'],3000);
                } else {
                    displayToast('error', 'GET error', 'Cannot retrieve combo exams');
                }
            }, // success
            error: function (er) {
                console.log(er);
            }
        })
    ); // promise return data
};


getWlDetails(wlId)
    .then(function (data) {
        let html = [];
        let dataWl = data.items[0];
        for (item in dataWl) {
            html.push('<p>Key: '+item+' - Value: '+dataWl[item]+'</p>');
        }
        $('#wldetails').append(html.join(''));
    });


// set counters
// id_count : form id , count_class: tono pachy (counter_tono) 
setCounter('#airRightForm','tono',0.5,0,80);
setCounter('#airRightForm','pachy',2,300,700);

setCounter('#airLeftForm','tono',0.5,0,80);
setCounter('#airLeftForm','pachy',2,300,700);

setCounter('#form_tn','tono',0.5,0,80);
setCounter('#form_tn','pachy',2,300,700);

setCounter('#form_left_apla','tono',0.5,0,80);
setCounter('#form_right_apla','tono',0.5,0,80);



function setCounter (id_count, count_class,step, min, max) {
    $(id_count+' .btn.counter_down_'+count_class).click(function() {
        value = parseFloat($(id_count+' input.counter_'+count_class).val());
        if (value >= (min+step)) {
        $(id_count+' input.counter_'+count_class).val(value-step);
        } else {};
    });
    
    $(id_count+' .btn.counter_up_'+count_class).click(function() {
        value = parseFloat($(id_count+' input.counter_'+count_class).val());
        if (value <= (max-step)) {
        $(id_count+' input.counter_'+count_class).val(value+step);
        } else {};
    });
    }