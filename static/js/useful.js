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

// get today's date in string
function getToday() {
    yourDate = new Date();
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    return {'date': yourDate.toISOString().split('T')[0], 'time': yourDate.toISOString().split('T')[1].split('Z')[0] };
}


// diopters to mm
function diopter2mm(diopters) {
    return (337.50/diopters).toFixed(2);
};

// round 2 decimal - default with sign
function round2dec(num,sign=true) {
    num = Math.round(num*100)/100;
    num = num.toFixed(2);
    if (sign == true) {
        num >0? num='+'+num : {};
    };
    return num;
};

// round to closer quarter - default with no sign
function round2qter(num,sign=false) {
    num = (Math.round(num * 4) / 4).toFixed(2);
    if (sign == true) {
        num >0? num='+'+num : {};
    };
    return num;
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

// remove accents but not diacritics?
function removeAccent(str) {
    return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
};

// password generator
function passGen() {
    return Math.random().toString(36)+Math.random().toString(36).toUpperCase().split('').sort(function(){return 0.5-Math.random()}).join('')
};

// convert date string yyyy-mm-dd in dd/mm/yyyy
function datestr2eu(datestr) {
    return datestr.split('-').reverse().join('/');
};

// convert datetime yyyymmdd hh:mm:ss to dd/mm/yyyy hh:mm:ss
function datetime2eu(datetimestr) {
    let datetimelst = datetimestr.split(' ')
    datetimelst[0] = datetimelst[0].split('-').reverse().join('/')
    return datetimelst.join(' ')
}

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
    return (data == null || data =='' || data == 'undefined')? dft : data ; 
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


/**
 * Get user information in JSON format in denormalized format
 * from /api/<tablename/>/<rec_id> endpoint
 *  
 * @param {int} id - user id.
 * @returns {string} JSON string with user informations.
 *
 * @example
 * // Returns xxxx TO FILL xxx
 * const uniqueId = getUserInfo(1);
 */
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

/**
 * Refresh bootrap-table table
 *
 * @returns {string} JSON string with user informations.
 *
 * @example
 * // Returns xxxx TO FILL xxx
 * const uniqueId = getUserInfo(1);
 */
function refreshTables(tblArr) {
    for (tbl of tablesArr) {
      $(tbl).bootstrapTable('refresh');
    }
};

// disable buttons in array
/**
 * disable buttons in from an array of Document identifiers
 * @param {array} : array of button id
 *
 */
function disableBtn(buttonsArr) {
    for (btn of buttonsArr) {
        $(btn).attr('disabled', true);    
    }
};

/**
 * General promise CRUD function
 * from /api/<tablename/>/<rec_id> endpoint
 * 
 * @param {string} table - table name.
 * @param {string} id - row id.
 * @returns {string} JSON string with response status.
 *
 * @module displayToast
 *  to display a toast with the response status
 * 
 * @example
 * // Returns xxxx TO FILL xxx
 * crudp(table,id,req);
 * table = 'table' req = 'POST' without id,  'PUT' 'DELETE' with id, data in string
 */
const crudp = function(table,id='0',req='POST',data) {
    return new Promise((resolve, reject) => {
        // console.log(data);
        let API_URL = ((req == 'POST') || (req == 'PUT')? HOSTURL+"/myapp/api/"+table : HOSTURL+"/myapp/api/"+table+"/"+ id );
        let mode = ( req == 'POST' ? ' added' : (req == 'PUT' ? ' edited': ' deleted'));
        $.ajax({
            url: API_URL,
            data: data,
            contentType: 'application/json',
            dataType: 'json',
            method: req,
            success: function (data) {
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
                    resolve(data); // sent when resolved
                },
            error: function(error) {
                reject(error);
                }
            });
        })
};



// set wlItem status: done processing and counter adjustment
// id is in the dataStr
function setWlItemStatus (dataStr) {
    return crudp('worklist','0','PUT', dataStr);
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

// use to add item to Eyesuite machines
function addPatientEyesuite(machine,id='',lastname='', firstname='',dob='',sex='') {
    sex == 'Female'? sex = 'FEMALE': (sex == 'Male'? sex = 'MALE': sex ='');
    let API_URL = HOSTURL + '/myapp/rest/create_eyesuite_wl/' + machine +'?id=' + id + '?lastname=' + lastname + '&firstname=' + firstname
        + '&sex=' + sex + '&dob=' + dob;
    $.ajax({
        url: API_URL,
        contentType: 'application/json',
        dataType: 'json',
        method: 'GET',
        success: function (data) {
            if (data.result == 'success') {
                displayToast('success', 'add wl to Eyesuite', data.result, '6000');
            } else {
                displayToast('error', 'add wl to Eyesuite', data.result, '6000');
            }
        }
    });
};
