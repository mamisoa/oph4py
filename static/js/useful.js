// useful functions 

// get age
function getAge(dateString) {
    if (isNaN(Date.parse(dateString))) {
        return '?';
    } else { 
        let today = new Date();
        let birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        let m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
};

// diopters to mm
function diopter2mm(diopters) {
    return (337.50/diopters).toFixed(2);
};

// round 2 decimal
function round2dec(num) {
    num = Math.round(num*100)/100;
    num = num.toFixed(2);
    num >0? num='+'+num : {};
    return num;
};

// round 2 decimal unsigned
function round2decunsigned(num) {
    num = Math.round(num*100)/100;
    num = num.toFixed(2);
    return num;
};

// round to closer quarter
function round2qter(num) {
    return (Math.round(num * 4) / 4).toFixed(2);
};

// round to closer quarter signed
function round2qtersigned(num) {
    num = (Math.round(num * 4) / 4).toFixed(2);
    num >0? num='+'+num : {};
    return num ;
};

// Capitalize first character
function capitalize(str) {
    let res='';
    str != ''? res =str.trim().replace(/^\w/, (c) => c.toUpperCase()):{};
    return res;
};

// normalize accented characters
function norm(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// password generator
function passGen() {
    return Math.random().toString(36)+Math.random().toString(36).toUpperCase().split('').sort(function(){return 0.5-Math.random()}).join('')
};

// set tz info
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

// check if datastr is null
function checkIfDataIsNull(data, dft='n/a') {
    return (data == null || data =='')? dft : data ; 
};

function removeAccent(str) {
    return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
};

function getUuid() {
    return Promise.resolve(
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: HOSTURL+"/myapp/api/uuid",
            success: function(data) {
                if (data.unique_id != undefined) {
                    console.log('uuid generated');
                    // displayToast('success', 'GET uuid', 'GET uuid:'+data['unique_id'],6000);
                } else {
                    displayToast('error', 'GET error', 'Cannot retrieve uuid');
                }
            }, // success
            error: function (er) {
                console.log(er);
            }
        })
    ); // promise return data
};

function getTableInfo(table,id) {
    let API_URL = HOSTURL+'/myapp/api/'+table+'/'+id;
    return Promise.resolve(
        $.ajax({
            url: API_URL,
            contentType: 'application/json',
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                // console.log(data['items']);
                // if modality = l80
                // call 
            }
        })
    );
};

function getUserInfo(id) {
    let API_URL = HOSTURL + '/myapp/api/auth_user/' + id +'?@lookup=gender!:gender[sex]';
    return Promise.resolve(
        $.ajax({
            url: API_URL,
            contentType: 'application/json',
            dataType: 'json',
            method: 'GET',
            success: function (data) {
                // console.log(data['items']);
                // if modality = l80
                // call 
            }
        })
    );
};

// refreshTables in array
function refreshTables(tblArr) {
    for (tbl of tablesArr) {
      $(tbl).bootstrapTable('refresh');
    }
};

// disable buttons in array
function disableBtn(buttonsArr) {
    for (btn of buttonsArr) {
        $(btn).attr('disabled', true);    
    }
};

// crud(table,id,req): table = 'table' req = 'POST' without id,  'PUT' 'DELETE' with id, data in string
function crud(table,id='0',req='POST',data) {
    // console.log(data);
    let API_URL = ((req == 'POST') || (req == 'PUT')? HOSTURL+"/myapp/api/"+table : HOSTURL+"/myapp/api/"+table+"/"+ id );
    let mode = ( req == 'POST' ? ' added' : (req == 'PUT' ? ' edited': ' deleted'));
    $.ajax({
        url: API_URL,
        data: data,
        contentType: 'application/json',
        dataType: 'json',
        method: req
        })
        .done(function(data) {
            console.log(data);
            // status = data.status;
            // message = data.message;
            errors = "";
            if (data.status == "error") {
                for (i in data.errors) {
                    errors += data.errors[i]+'</br>';
                };
                text = errors;
                displayToast('error',data.message,errors,'3000');
            };
            if (data.status == "success") {
                text='User id: '+(req == 'DELETE'? id : data.id)+mode;
                displayToast('success', table+' '+mode,text,'3000');
            };
            return data;
        });
};

// set wlItem status: done processing and counter adjustment
// id is in the dataStr
function setWlItemStatus (dataStr) {
    // console.log('dataStrPut:',dataStr);
    crud('worklist','0','PUT', dataStr);
};

//  use as promise
function getVisionixData(machine="l80",lastname="",firstname="") {
    let API_URL = HOSTURL+'/myapp/rest/machines/'+machine+'?lastname='+lastname+'&firstname='+firstname;
    return Promise.resolve(
        $.ajax({
            url: API_URL,
            contentType: 'application/json',
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                // console.log(data);
            }
        })
    );
};

// use to populate patient in L80 or VX100
function addPatientVisionix(machine,id='',lastname='', firstname='',dob='',sex='') {
    sex == 'Female'? sex = 'f': (sex == 'Male'? sex = 'm': sex ='');
    let API_URL = HOSTURL + '/myapp/rest/create_visionix/' + machine + '?lastname=' + lastname + '&firstname=' + firstname
        + '&id=' + id + '&sex=' + sex + '&dob=' + dob;
    $.ajax({
        url: API_URL,
        contentType: 'application/json',
        dataType: 'json',
        method: 'GET',
        success: function (data) {
            if (data.result == 'success') {
                displayToast('success', 'add L80/VX100', data.result, '3000');
            } else {
                displayToast('error', 'add L80/VX100', data.result, '3000');
            }
        }
    });
};
