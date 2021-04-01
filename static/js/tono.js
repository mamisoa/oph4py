
// useful functions 

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
};

// Convert seconds to hh:mm:ss
// Allow for -ve time values
function secondsToHMS(secs) {
    function z(n){return (n<10?'0':'') + n;}
    var sign = secs < 0? '-':'';
    secs = Math.abs(secs);
    return sign + z(secs/3600 |0) + ':' + z((secs%3600) / 60 |0) + ':' + z(secs%60);
};

// Convert H:M:S to seconds
// Seconds are optional (i.e. n:n is treated as h:s)
function hmsToSeconds(s) {
    var b = s.split(':');
    return b[0]*3600 + b[1]*60 + (+b[2] || 0);
};

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

let wlItemObj;

getWlDetails(wlId)
    .then(function (data) {
        console.log(data.items[0]);
        let html = [];
        let dataWl = data.items[0];
        for (item in dataWl) {
            html.push('<p>Key: '+item+' - Value: '+dataWl[item]+'</p>');
        }
        $('#wldetails').append(html.join(''));
        return data.items[0];
    })
    .then(function (itemObj){ // set patient ID in top bar
        wlItemObj = Object.assign({},itemObj); // clone wltitemobj in global        
        $('#patientName').html(itemObj['user.first_name']+' '+itemObj['user.last_name']);
        $('#patientDob').html(itemObj['user.dob']);
        $('#wlTimeslot').html(itemObj['requested_time'].split('T').join(' '));
    })


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

// submit airPachy
$('#airRightForm').submit(function(e){
    e.preventDefault();
    tonoPachyInsert(this,'right');
});

$('#airLeftForm').submit(function(e){
    e.preventDefault();
    tonoPachyInsert(this,'left');
})

// domId eg #airRightForm , laterality eg 'right'
function tonoPachyInsert(domId,laterality, techno='air') {
    let dataStr = $(domId).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let o ={};
    o['tonometry'] = dataObj['air'+capitalize(laterality)];
    o['pachymetry'] = dataObj['pachy'+capitalize(laterality)];
    o['id_auth_user'] = wlItemObj['user.id'];
    o['id_worklist'] = wlItemObj['id'];
    o['laterality'] = laterality;
    o['techno'] = techno;
    o['timestamp']= new Date().addHours(timeOffsetInHours).toJSON().slice(0,16);
    console.log(o['timestamp']);
    console.log('o',o);
    oStr = JSON.stringify(o);
    crud('tono','0','POST', oStr);
    $('#airPachy'+capitalize(laterality)+'_tbl').bootstrapTable('refresh');
}

// crud(table,id,req): table = 'table' req = 'POST' without id,  'PUT' 'DELETE' with id, data in string
function crud(table,id='0',req='POST',data) {
    console.log(data);
    var API_URL = ((req == 'POST') || (req == 'PUT')? HOSTURL+"/myapp/api/"+table : HOSTURL+"/myapp/api/"+table+"/"+ id );
    var mode = ( req == 'POST' ? ' added' : (req == 'PUT' ? ' edited': ' deleted'));
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
        });
}

// Capitalize first character
function capitalize(str) {
    return str.trim().replace(/^\w/, (c) => c.toUpperCase());
}