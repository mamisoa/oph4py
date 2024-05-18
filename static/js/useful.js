// useful functions

// sleep function
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// get age
function getAge(dateString) {
	if (isNaN(Date.parse(dateString))) {
		return "?";
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
}

// get today's date in string
function getToday() {
	yourDate = new Date();
	const offset = yourDate.getTimezoneOffset();
	yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
	return {
		date: yourDate.toISOString().split("T")[0],
		time: yourDate.toISOString().split("T")[1].split("Z")[0],
	};
}

// diopters to mm
function diopter2mm(diopters) {
	return (337.5 / diopters).toFixed(2);
}

// round 2 decimal - default with sign
function round2dec(num, sign = true) {
	num = Math.round(num * 100) / 100;
	num = num.toFixed(2);
	if (sign == true) {
		num > 0 ? (num = "+" + num) : {};
	}
	return num;
}

// round to closer quarter - default with no sign
function round2qter(num, sign = false) {
	num = (Math.round(num * 4) / 4).toFixed(2);
	if (sign == true) {
		num > 0 ? (num = "+" + num) : {};
	}
	return num;
}

// round float to upper integer
function round2supint(num) {
    return Math.ceil(num);
}

// Capitalize first character
function capitalize(str) {
	let res = "";
	str != "" ? (res = str.trim().replace(/^\w/, (c) => c.toUpperCase())) : {};
	return res;
}

// normalize accented characters
function norm(str) {
	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// remove accents but not diacritics?
function removeAccent(str) {
	return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// password generator
function passGen() {
	return (
		Math.random().toString(36) +
		Math.random()
			.toString(36)
			.toUpperCase()
			.split("")
			.sort(function () {
				return 0.5 - Math.random();
			})
			.join("")
	);
}

// convert date string yyyy-mm-dd in dd/mm/yyyy
function datestr2eu(datestr) {
	return datestr.split("-").reverse().join("/");
}

// convert datetime yyyymmdd hh:mm:ss to dd/mm/yyyy hh:mm:ss
function datetime2eu(datetimestr) {
	let datetimelst = datetimestr.split(" ");
	datetimelst[0] = datetimelst[0].split("-").reverse().join("/");
	return datetimelst.join(" ");
}

// set tz info
Date.prototype.addHours = function (h) {
	this.setTime(this.getTime() + h * 60 * 60 * 1000);
	return this;
};

// Convert seconds to hh:mm:ss
// Allow for -ve time values
function secondsToHMS(secs) {
	function z(n) {
		return (n < 10 ? "0" : "") + n;
	}
	var sign = secs < 0 ? "-" : "";
	secs = Math.abs(secs);
	return (
		sign +
		z((secs / 3600) | 0) +
		":" +
		z(((secs % 3600) / 60) | 0) +
		":" +
		z(secs % 60)
	);
}

// Convert H:M:S to seconds
// Seconds are optional (i.e. n:n is treated as h:s)
function hmsToSeconds(s) {
	var b = s.split(":");
	return b[0] * 3600 + b[1] * 60 + (+b[2] || 0);
}

// Function to format the current date and time
function getIsoCurrentDateTime() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	const seconds = String(now.getSeconds()).padStart(2, "0");

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// check if datastr is null
function checkIfDataIsNull(data, dft = "n/a") {
	return data == null || data == "" || data == "undefined" ? dft : data;
}

// check if an object is empty
function isEmptyObject(obj) {
	return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function getUuid() {
	return Promise.resolve(
		$.ajax({
			type: "GET",
			dataType: "json",
			url: HOSTURL + "/" + APP_NAME + "/api/uuid",
			success: function (data) {
				if (data.unique_id != undefined) {
					console.log("uuid generated");
					// displayToast('success', 'GET uuid', 'GET uuid:'+data['unique_id'],6000);
				} else {
					displayToast("error", "GET error", "Cannot retrieve uuid");
				}
			}, // success
			error: function (er) {
				console.log(er);
			},
		})
	); // promise return data
}

function getTableInfo(table, id) {
	let API_URL = HOSTURL + "/" + APP_NAME + "/api/" + table + "/" + id;
	return Promise.resolve(
		$.ajax({
			url: API_URL,
			contentType: "application/json",
			dataType: "json",
			method: "GET",
			success: function (data) {
				// console.log(data['items']);
				// if modality = l80
				// call
			},
		})
	);
}

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
	let API_URL =
		HOSTURL +
		"/" +
		APP_NAME +
		"/api/auth_user/" +
		id +
		"?@lookup=gender!:gender[sex]";
	return Promise.resolve(
		$.ajax({
			url: API_URL,
			contentType: "application/json",
			dataType: "json",
			method: "GET",
			success: function (data) {
				// console.log(data['items']);
				// if modality = l80
				// call
			},
		})
	);
}

/**
 * Refresh bootrap-table table
 *
 * @returns {string} JSON string with user informations.
 *
 * @example
 * // Returns xxxx TO FILL xxx
 * const uniqueId = getUserInfo(1);
 */

function refreshTables(tablesArr) {
	console.log('tablesArr: ', tablesArr);
	for (let tbl of tablesArr) {
		// Check if 'bootstrapTable' function is defined for the current element
		if (typeof $(tbl).bootstrapTable === "function") {
			$(tbl).bootstrapTable("refresh");
		} else {
			// Handle the case where 'bootstrapTable' is not defined
			console.error("bootstrapTable function not defined for", tbl);
			// Continue with the next iteration if desired
		}
	}
}

/**
 * disable buttons in from an array of Document identifiers
 * @param {array} : array of button id
 *
 */
function disableBtn(buttonsArr) {
	for (btn of buttonsArr) {
		$(btn).attr("disabled", true);
	}
}

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
const crudp = function(table, id='0', req='POST', data) {
    return new Promise((resolve, reject) => {
        // Construire API_URL pour inclure l'id dans les cas PUT et DELETE
        let API_URL = ((req == 'POST') ? HOSTURL + "/" + APP_NAME + "/api/" + table : HOSTURL + "/" + APP_NAME + "/api/" + table + "/" + id);

        // Supprimer l'id du payload data si req est PUT et si id existe dans data
        if (req === 'PUT' && data && data.id) {
            delete data.id;
        }

        console.log("API URL:", API_URL); // Log l'URL pour vérifier

        let mode = (req == 'POST' ? ' added' : (req == 'PUT' ? ' edited' : ' deleted'));
        $.ajax({
            url: API_URL,
            data: data,
            contentType: 'application/json',
            dataType: 'json',
            method: req,
            success: function (data) {
                console.log(data);
                let errors = "";
                if (data.status == "error") {
                    for (let i in data.errors) {
                        errors += data.errors[i] + '</br>';
                    };
                    let text = errors;
                    displayToast('error', data.message, errors, '6000');
                };
                if (data.status == "success") {
                    let text = 'User id: ' + (req == 'DELETE' ? id : data.id) + mode;
                    displayToast('success', table + ' ' + mode, text, '3000');
                };
                resolve(data); // Sent when resolved
            },
            error: function(error) {
                reject(error);
            }
        });
    })
};

/**
 * used to set a task in worklist to DONE and counter tasks to 0
 * @param {string} : dataStr - contains all the data including id
 * @module crudp
 */
function setWlItemStatus (dataStr) {
    let dataJson = JSON.parse(dataStr);
    let id = dataJson.id;
    delete dataJson.id;
    console.log('dataStr: ', dataJson,' Type:', typeof dataJson);
    return crudp('worklist', id ,'PUT', JSON.stringify(dataJson));
};

//  use as promise
async function getVisionixData(machine = "l80", lastname = "", firstname = "") {
	let API_URL =
		HOSTURL +
		"/" +
		APP_NAME +
		"/rest/machines/" +
		machine +
		"?lastname=" +
		lastname +
		"&firstname=" +
		firstname;
	return Promise.resolve(
		$.ajax({
			url: API_URL,
			contentType: "application/json",
			dataType: "json",
			method: "GET",
			success: function (data) {
				// console.log(data);
			},
		})
	);
}

// use to populate patient in L80 or VX100
async function addPatientVisionix(
	machine,
	id = "",
	lastname = "",
	firstname = "",
	dob = "",
	sex = ""
) {
	sex == "Female" ? (sex = "f") : sex == "Male" ? (sex = "m") : (sex = "");
	let API_URL =
		HOSTURL +
		"/" +
		APP_NAME +
		"/rest/create_visionix/" +
		machine +
        "?lastname=" + lastname +
		"&firstname=" + firstname +
		"&id=" + id +
		"&sex=" + sex +
		"&dob=" + dob;
	$.ajax({
		url: API_URL,
		contentType: "application/json",
		dataType: "json",
		method: "GET",
		success: function (data) {
			if (data.result == "success") {
				displayToast("success", "add L80/VX100", data.result, "3000");
			} else {
				displayToast("error", "add L80/VX100", data.result, "6000");
				console.log("error message: ", data.result);
			}
		},
	});
}

// use to add item to Eyesuite machines
async function addPatientEyesuite(
	machine,
	id = "",
	lastname = "",
	firstname = "",
	dob = "",
	sex = ""
) {
	let API_URL =
		HOSTURL +"/" + APP_NAME + "/rest/create_eyesuite_wl/" +machine +
        "?id=" +id +
		"&lastname=" + lastname +
		"&firstname=" +	firstname +
		"&sex=" + sex +
		"&dob=" + dob;
	console.log(API_URL);
	$.ajax({
		url: API_URL,
		contentType: "application/json",
		dataType: "json",
		method: "POST",
		success: function (data) {
			if (data.result == "success") {
				displayToast("success", "add wl to Eyesuite", data.result, "6000");
			} else {
				displayToast("error", "add wl to Eyesuite", data.result, "6000");
				console.log("error message: ", data.result);
			}
			console.log(data.result);
		},
	});
}

// mapping month with beid
// example transformDate("08   JAN    1975"));  // Output: 1975-01-08
function transformDateBeid(inputDate) {
	var monthMap = {
		// French
		JAN: "01",
		FEV: "02",
		MARS: "03",
		AVR: "04",
		MAI: "05",
		JUIN: "06",
		JUIL: "07",
		AOUT: "08",
		SEPT: "09",
		OCT: "10",
		NOV: "11",
		DEC: "12",
		// Dutch
		JAN: "01",
		FEB: "02",
		MAAR: "03",
		APR: "04",
		MEI: "05",
		JUN: "06",
		JUL: "07",
		AUG: "08",
		SEP: "09",
		OKT: "10",
		NOV: "11",
		DEC: "12",
		// German
		JAN: "01",
		FEB: "02",
		MÄR: "03",
		APR: "04",
		MAI: "05",
		JUN: "06",
		JUL: "07",
		AUG: "08",
		SEP: "09",
		OKT: "10",
		NOV: "11",
		DEZ: "12",
	};

	// Split inputDate by spaces and remove empty elements
	var dateParts = inputDate.split(" ").filter(function (e) {
		return e.trim().length > 0;
	});
	var day = dateParts[0];
	var month = monthMap[dateParts[1].trim().toUpperCase()];
	var year = dateParts[2];

	return year + "-" + month + "-" + day;
}

// use to add or update patient to dcm4chee
async function addPatientPacs(data, dicom = false) {
	let API_URL = HOSTURL + "/" + APP_NAME + "/rest/dcm4chee/patient/create";
	if (dicom == true) {
		fetch(API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
			.then((response) => {
				if (response.status == "success") {
					displayToast(
						"success",
						"add patient to PACS",
						response.message,
						"3000"
					);
				} else {
					displayToast(
						"error",
						"error posting patient to PACS",
						response.message,
						"6000"
					);
				}
			})
			.then((json) => console.log("Patient added"))
			.catch((error) => console.error("An error occurred:", error));
	}
}

// use to add or update patient to dcm4chee
async function addStudyMwl(data, dicom = false) {
	let API_URL = HOSTURL + "/" + APP_NAME + "/rest/dcm4chee/mwl/create";
	if (dicom == true) {
		fetch(API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
			.then((response) => {
				if (response.status == "success") {
					displayToast(
						"success",
						"add patient to MWL",
						response.message,
						"3000"
					);
				} else {
					displayToast("error", "add patient to MWL", response.message, "6000");
				}
			})
			.then((json) => console.log("Added to MWL"))
			.catch((error) => console.error("An error occurred:", error));
	}
}
