// Import services
import { UiService } from "./services/UiService.js";
import { ApiService } from "./services/ApiService.js";

// Initialize variables
let s_wl = "";
let toggle_wl = "";
let mainModalityArr = ["MD", "GP"];

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalize(string) {
	if (!string) return '';
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function queryParams_wl(params) {
	let search = params.search ? params.search.split(",") : [""];
	if (search == [""]) {
		s_wl = "";
	} else {
		if (search[0] != undefined) {
			s_wl = "id_auth_user.last_name.contains=" + search[0];
		} else {
			s_wl = "";
		}
		if (search[1] != undefined) {
			s_wl += "&id_auth_user.first_name.startswith=" + capitalize(search[1]);
		} else {
			s_wl += "";
		}
		if (search[2] != undefined) {
			s_wl += "&procedure.exam_name.startswith=" + capitalize(search[2]);
		} else {
			s_wl += "";
		}
		if (search[3] != undefined) {
			s_wl +=
				"&modality_dest.modality_name.startswith=" + capitalize(search[3]);
		} else {
			s_wl += "";
		}
	}
	if (params.sort != undefined) {
		if (params.sort == "id") {
			params.sort = "id";
		}
		if (params.sort == "modality") {
			params.sort = "modality_dest";
		}
		if (params.sort == "procedure") {
			params.sort = "procedure";
		}
		if (params.sort == "patient") {
			params.sort = "id_auth_user";
		}
		if (toggle_wl == "") {
			s_wl += "&@order=" + params.sort;
			toggle_wl = "~";
		} else {
			s_wl += "&@order=~" + params.sort;
			toggle_wl = "";
		}
	}
	if (params.offset != "0") {
		console.log(params.offset);
		s_wl += "&@offset=" + params.offset;
	}
	if (params.limit != "0") {
		// console.log(params.offset);
		s_wl += "&@limit=" + params.limit;
	}
	// console.log('s_wl',s_wl);
	return decodeURI(encodeURI(s_wl));
}

function styleTimeslot(ts) {
	let arr = ts.split(" ");
	let res =
		"<strong>" + arr[1] + "</strong> " + arr[0].split("-").reverse().join("/");
	return res;
}

function responseHandler_wl(res) {
	// used if data-response-handler="responseHandler_wl"
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
			id_auth_user: list[i]["id_auth_user.id"],
			sending_facility: list[i]["sending_facility.facility_name"],
			receiving_facility: list[i]["receiving_facility.facility_name"],
			patient:
				list[i]["id_auth_user.last_name"] +
				" " +
				list[i]["id_auth_user.first_name"],
			provider:
				list[i]["provider.last_name"] + " " + list[i]["provider.first_name"],
			senior: list[i]["senior.last_name"] + " " + list[i]["senior.first_name"],
			procedure: list[i]["procedure.exam_name"],
			modality: list[i]["modality.modality_name"],
			laterality: list[i]["laterality"],
			requested_time: styleTimeslot(list[i]["requested_time"]),
			status_flag: list[i]["status_flag"],
			counter: list[i]["counter"],
			warning: list[i]["warning"],
			modified_by:
				list[i]["modified_by.last_name"] +
				" " +
				list[i]["modified_by.first_name"],
			modified_on: list[i]["modified_on"],
			created_by:
				list[i]["created_by.last_name"] +
				" " +
				list[i]["created_by.first_name"],
			created_on: list[i]["created_on"],
		});
	});
	return { rows: display, total: res.count };
}

function operateFormatter_wl(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="edit" href="javascript:void(0)" title="Edit worklist item"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete worklist item"><i class="fas fa-trash-alt"></i></a>'
	);
	if (row.status_flag != "done") {
		html.push(
			'<a class="done ms-1" href="javascript:void(0)" title="Set to process"><i class="fas fa-check"></i></a>'
		);
		html.push(
			'<a class="stopwatch ms-1" href="javascript:void(0)" title="Counter minus 1"><i class="fas fa-stopwatch"></i></a>'
		);
	} else {
		html.push(
			'<a class="unlock ms-1" href="javascript:void(0)" title="Set to process"><i class="fas fa-unlock"></i></a>'
		);
	}
	if (modalityDict[row.modality] != "none") {
		html.push(
			'<a class="modality_ctr ms-1" href="javascript:void(0)" title="Execute task"><i class="fas fa-heartbeat"></i></a>'
		);
	}
	if (mainModalityArr.includes(row.modality) && row.status_flag == "done") {
		html.push(
			'<a class="summary ms-1" href="javascript:void(0)" title="Read summary"><i class="fas fa-th-list"></i></a>'
		);
		html.push(
			'<a class="payments ms-1" href="javascript:void(0)" title="Proceed to payment"><i class="fas fa-euro-sign"></i></a>'
		);
	} else {
	}
	html.push("</div>");
	return html.join("");
}

/**
 * Set worklist item status
 * @param {string} dataStr - JSON string containing the data to update
 * @returns {Promise} Promise resolving with the API response
 */
async function setWlItemStatus(dataStr) {
	try {
		const response = await fetch(window.HOSTURL + "/oph4py/api/worklist/" + JSON.parse(dataStr).id, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: dataStr
		});
		
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}
		
		return await response.json();
	} catch (error) {
		console.error("Error updating worklist item status:", error);
		throw error;
	}
}

/**
 * Event handlers for worklist operations
 */
const operateEvents_wl = {
	"click .edit": function (e, value, row, index) {
		console.log("You click action EDIT on row: " + JSON.stringify(row));
		UiService.showEditWorklistModal(row.id);
	},
	"click .remove": function (e, value, row, index) {
		if (confirm("Are you sure you want to delete this worklist item?")) {
			ApiService.handleWorklistItem("DELETE", row.id)
				.then(() => {
					document.querySelector(".bootstrap-table").refresh();
				})
				.catch((error) => {
					console.error("Error deleting worklist item:", error);
					alert("Error deleting worklist item");
				});
		}
	},
	"click .stopwatch": function (e, value, row, index) {
		let dataObj = { laterality: row.laterality, id: row.id };
		let dataStr;
		if (row.counter > 0 && row.status_flag != "cancelled") {
			if (row.counter == 1) {
				dataObj["status_flag"] = "done";
				dataObj["counter"] = 0;
			} else if (row.counter > 1) {
				dataObj["counter"] = row.counter - 1;
				dataObj["status_flag"] = "processing";
			}
			dataStr = JSON.stringify(dataObj);
			setWlItemStatus(dataStr).then(function () {
				window.$table_wl.bootstrapTable("refresh");
			});
		}
	},
	"click .done": function (e, value, row, index) {
		let dataObj = { laterality: row.laterality, id: row.id };
		let dataStr;
		if (row.status_flag != "done") {
			dataObj["status_flag"] = "done";
			dataObj["counter"] = 0;
			dataStr = JSON.stringify(dataObj);
			setWlItemStatus(dataStr).then(function () {
				window.$table_wl.bootstrapTable("refresh");
			});
		}
	},
	"click .modality_ctr": function (e, value, row, index) {
		let dataObj = { laterality: row.laterality, id: row.id };
		let dataStr;
		if (row.status_flag == "requested") {
			dataObj["status_flag"] = "processing";
			dataObj["counter"] = row.counter;
			dataStr = JSON.stringify(dataObj);
			setWlItemStatus(dataStr).then(function () {
				window.$table_wl.bootstrapTable("refresh");
			});
		}
		const APP_NAME = "oph4py"; // Set app name constant
		const controller = window.modalityDict[row.modality];
		const link = window.HOSTURL + "/" + APP_NAME + "/modalityCtr/" + controller + "/" + row.id;
		window.location.href = link;
	},
	"click .summary": function (e, value, row, index) {
		const APP_NAME = "oph4py"; // Set app name constant
		const link = window.HOSTURL + "/" + APP_NAME + "/billing/summary/" + row.id_auth_user;
		window.location.href = link;
	},
	"click .payments": function (e, value, row, index) {
		const APP_NAME = "oph4py"; // Set app name constant
		const link = window.HOSTURL + "/" + APP_NAME + "/billing/payments/" + row.id;
		window.location.href = link;
	},
	"click .unlock": function (e, value, row, index) {
		let dataObj = { laterality: row.laterality, id: row.id };
		let dataStr;
		if (row.status_flag == "done") {
			dataObj["status_flag"] = "processing";
			dataObj["counter"] = 1;
			dataStr = JSON.stringify(dataObj);
			setWlItemStatus(dataStr).then(function () {
				window.$table_wl.bootstrapTable("refresh");
			});
		}
	}
};

function rowStyle_wl(row, value) {
	let statusColor = {
		requested: "#ffcc99",
		processing: "papayawhip",
		done: "#98ff98",
		cancelled: "#ff9999",
		doctorDone: "#00FF00",
	};
	let bg;
	if (mainModalityArr.includes(row.modality) && row.status_flag == "done") {
		bg = statusColor["doctorDone"];
	} else {
		bg = statusColor[row.status_flag];
	}
	return {
		css: { "background-color": bg },
	};
}

function detailFormatter_wl(index, row) {
	let lastmodif = Date.parse(row.created_on);
	var rightnow = new Date();
	let elapse = Math.round((rightnow - lastmodif) / 1000) - (window.timeOffset || 0);
	let waiting = secondsToHMS(elapse);
	timer_id.push("#waiting_" + row.id);
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Created on: </span>' +
			row.created_on +
			'<span class="badge rounded-pill bg-light text-dark">' +
			waiting +
			"</span></p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Created by: </span>' +
			row.created_by +
			"</p>"
	);
	html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
	html.push(
		'<p class=""><span class="fw-bold">Sending: </span>' +
			row.sending_facility +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Receiving: </span>' +
			row.receiving_facility +
			"</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Patient: </span>' + row.patient + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Provider: </span>' +
			row.provider +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Procedure: </span>' +
			row.procedure +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Modality: </span>' +
			row.modality +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Laterality: </span>' +
			row.laterality +
			"</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Timeslot: </span>' +
			row.requested_time +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Status: </span>' +
			row.status_flag +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Counter: </span>' + row.counter + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Warning: </span>' + row.counter + "</p>"
	);
	html.push("</div>");
	html.push("</div></div>");
	return html.join("");
}

function counterFormatter_wl(value, row) {
	let html = [];
	let lastmodif = Date.parse(row.modified_on);
	var rightnow = new Date();
	// console.log('Rightnow:'+row.id,rightnow);
	// console.log('Lastmodif:'+row.id,lastmodif);
	let elapse = Math.round((rightnow - lastmodif) / 1000) - (window.timeOffset || 0);
	// console.log('elapse:'+row.id,elapse);
	let elapsestyle = "bg-light text-dark";
	if (elapse >= 30 * 60 && elapse <= 45 * 60) {
		elapsestyle = "bg-warning text-dark";
	} else if (elapse > 45 * 60) {
		elapsestyle = "bg-danger";
	}
	timer_id.push("#timer_" + row.id);
	// console.log('row.status=',row.status_flag);
	html.push(
		'<div class="d-flex justify-content-between"><span class="badge rounded-pill bg-primary mx-1">' +
			row.counter +
			"</span>"
	);
	// if over 1 day, elapse counter is not shown
	if (elapse < 24 * 60 * 60 && row.status_flag != "done") {
		html.push(
			'<span id="timer_' +
				row.id +
				'" class="badge rounded-pill ' +
				elapsestyle +
				' mx-1">' +
				elapse +
				"</span>"
		);
	}
	html.push("</div>");
	return html.join("");
}

function rowAttributes_wl(row, index) {
	// set tooltip values
	row.created_by == ""
		? (createdby = "created by <strong>unknown</strong>")
		: (createdby = "created by <strong>" + row.created_by + "</strong>");
	row.created_on == ""
		? (createdon = " on <strong>unknown date</strong>")
		: (createdon = " on <strong>" + row.created_on + "</strong>");
	row.modified_by == ""
		? (modifiedby = " modified by <strong>unknown</strong>")
		: (modifiedby = " modified by <strong>" + row.modified_by + "</strong>");
	row.modified_on == ""
		? (modifiedon = " on <strong>unknown date</strong>")
		: (modifiedon = " on <strong>" + row.modified_on + "</strong>");
	let html = ['<div class="container"><div class="row">'];
	html.push(['<div class="col">' + createdby + createdon + "</div>"]);
	html.push(['<div class="col">' + modifiedby + modifiedon + "</div>"]);
	html.push("</div></div>");
	html.join("");
	return {
		"data-bs-html": html,
		"data-bs-toggle": "tooltip",
	};
}

/**
 * Set timers for worklist items
 * @param {Array} timerIds - Array of timer IDs to initialize
 */
function set_timers(timerIds) {
	if (!timerIds || !Array.isArray(timerIds)) {
		console.warn('No timer IDs provided or invalid format');
		return;
	}

	timerIds.forEach(timerId => {
		const element = document.querySelector(timerId);
		if (element) {
			const currentValue = parseInt(element.textContent);
			if (!isNaN(currentValue)) {
				element.textContent = secondsToHMS(currentValue);
			}
		}
	});
}

/**
 * Convert seconds to HH:MM:SS format
 * @param {number} secs - Number of seconds to convert
 * @returns {string} Time in HH:MM:SS format
 */
function secondsToHMS(secs) {
	const hours = Math.floor(secs / 3600);
	const minutes = Math.floor((secs % 3600) / 60);
	const seconds = Math.floor(secs % 60);
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Style the timeslot cell
 * @param {string} value - The cell value
 * @param {Object} row - The row data
 * @param {number} index - The row index
 * @returns {Object} CSS styles for the cell
 */
function cellStyle_timeslot(value, row, index) {
	return {
		css: {
			'white-space': 'nowrap',
			'font-weight': 'bold'
		}
	};
}

/**
 * Fill select elements with options from dictionaries
 */
function fillSelect() {
	// Fill practitioner select
	const practitionerSelect = $('#selectPractitioner');
	if (practitionerSelect.length && window.practitionerDict) {
		practitionerSelect.empty();
		practitionerSelect.append('<option value="">No filter</option>');
		Object.entries(window.practitionerDict).forEach(([id, name]) => {
			practitionerSelect.append(`<option value="${id}">${name}</option>`);
		});
	}

	// Fill provider select
	const providerSelect = $('#selectProvider');
	if (providerSelect.length && window.providerDict) {
		providerSelect.empty();
		providerSelect.append('<option value="">No filter</option>');
		Object.entries(window.providerDict).forEach(([id, name]) => {
			providerSelect.append(`<option value="${id}">${name}</option>`);
		});
	}
}

/**
 * Get filter status from select elements
 * @returns {string} Query string with filter parameters
 */
function getFilterStatus() {
	let key = '';
	const practitioner = $('#selectPractitioner').val();
	const provider = $('#selectProvider').val();
	
	if (practitioner) {
		key += `&senior.id.eq=${practitioner}`;
	}
	if (provider) {
		key += `&provider.id.eq=${provider}`;
	}
	return key;
}

// Initialize and expose functions to global scope
function init() {
	console.log("Initializing wl_bt.js");

	// Expose functions to global scope for bootstrap-table
	window.queryParams_wl = queryParams_wl;
	window.responseHandler_wl = responseHandler_wl;
	window.operateFormatter_wl = operateFormatter_wl;
	window.operateEvents_wl = operateEvents_wl;  // Direct assignment, not calling a function
	window.rowStyle_wl = rowStyle_wl;
	window.detailFormatter_wl = detailFormatter_wl;
	window.counterFormatter_wl = counterFormatter_wl;
	window.rowAttributes_wl = rowAttributes_wl;
	window.cellStyle_timeslot = cellStyle_timeslot;
	window.set_timers = set_timers;
	window.secondsToHMS = secondsToHMS;
	window.getFilterStatus = getFilterStatus;
	window.setWlItemStatus = setWlItemStatus;

	// Add debug logging
	console.log("Function exports check:");
	console.log("operateEvents_wl:", typeof window.operateEvents_wl, window.operateEvents_wl);
	console.log("All functions exposed successfully");

	// Initialize event handlers after exposing functions
	$('#btnFullList').click(function () {
		let key = getFilterStatus();
		console.log("key: ", key)
		$('#table-wl').bootstrapTable('refreshOptions', {
			url: window.API_PROCEDURE_LIST + key
		})
	});

	$('#btnTodaysList').click(function () {
		let key = getFilterStatus();
		console.log("key: ", key)
		$('#table-wl').bootstrapTable('refreshOptions', {
			url: window.API_PROCEDURE_LIST_TODAY + key
		})
	});

	$('#selectPractitioner').change(function () {
		console.log('select senior change:', $(this).val());
		let key = getFilterStatus();
		console.log("key: ", key);
		$('#table-wl').bootstrapTable('refreshOptions', {
			url: window.API_PROCEDURE_LIST_TODAY + key
		})
	});

	$('#selectProvider').change(function () {
		console.log('select provider change:', $(this).val());
		let key = getFilterStatus();
		console.log("key: ", key);
		$('#table-wl').bootstrapTable('refreshOptions', {
			url: window.API_PROCEDURE_LIST_TODAY + key
		})
	});

	// Initialize modality controllers
	window.modalityDict = window.modalityDict || {};
	window.multiplemod = window.multiplemod || [];

	// Initialize practitioner and provider dictionaries
	window.practitionerDict = window.practitionerDict || {};
	window.providerDict = window.providerDict || {};

	// Initialize select options
	fillSelect();
}

// Export functions
export {
	init,
	queryParams_wl,
	responseHandler_wl,
	operateFormatter_wl,
	operateEvents_wl,
	rowStyle_wl,
	detailFormatter_wl,
	counterFormatter_wl,
	rowAttributes_wl,
	cellStyle_timeslot,
	fillSelect,
	getFilterStatus,
	setWlItemStatus
};
