// Import services
import { WorklistService } from "./services/WorklistService.js";
import { ApiService } from "./services/ApiService.js";
import { UiService } from "./services/UiService.js";
import { ModalityService } from "./services/ModalityService.js";

// Helper functions
/**
 * Check if value is null and return a default value, else return value
 * @param {*} value - Value to check
 * @param {*} resultStrIfNullorUndefined - Default value to return if value is null or undefined
 * @returns {*} - The value or default value
 */
function checkIfNull(value, resultStrIfNullorUndefined) {
	if (value == null || value === undefined) {
		return resultStrIfNullorUndefined;
	} else {
		return value;
	}
}

/**
 * Formats a timestamp into a more readable format
 * @param {string} ts - Timestamp string in format "YYYY-MM-DD HH:MM:SS"
 * @returns {string} - Formatted timestamp HTML
 */
function styleTimeslot(ts) {
	let arr = ts.split(" ");
	// arr[1] is time arr[0] is date
	let res =
		"<strong>" + arr[0].split("-").reverse().join("/") + "</strong> " + arr[1];
	return res;
}

// Table response handlers
/**
 * Response handler for medications table
 * @param {Object} res - API response
 * @returns {Object} - Formatted data for bootstrap-table
 */
function responseHandler_mx(res) {
	let list = res.items;
	let display = [];
	list.forEach(function (item) {
		display.push({
			id: item.id,
			id_auth_user: item.id_auth_user,
			id_worklist: item.id_worklist,
			id_medic_ref: item["medication.id"],
			medication_from_id: item["medication.name"],
			medication: item["medication"],
			brand: item["medication.brand"],
			delivery: item["delivery"],
			form: item["medication.form"],
			intake: item["unit_per_intake"],
			frequency: item.frequency,
			frequency_h:
				item["unit_per_intake"] +
				" " +
				checkIfNull(item["medication.form"], "") +
				" " +
				item.frequency,
			onset: item.onset,
			ended: item.ended,
			note: item.note,
			prescribed: item.prescribed,
			modified_by_name: item["mod.last_name"] + " " + item["mod.first_name"],
			modified_by: item["mod.id"],
			modified_on: item["modified_on"],
			created_by: item["creator.id"],
			created_by_name:
				item["creator.last_name"] + " " + item["creator.first_name"],
			created_on: item["created_on"],
		});
	});
	return {
		rows: display,
		total: res.count,
	};
}

/**
 * Response handler for allergies table
 * @param {Object} res - API response
 * @returns {Object} - Formatted data for bootstrap-table
 */
function responseHandler_ax(res) {
	let list = res.items;
	let display = [];
	list.forEach(function (item) {
		display.push({
			id: item.id,
			id_auth_user: item.id_auth_user,
			id_agent: item["agentRef.id"],
			agent_from_id: item["agentRef.name"],
			agent: item["agent"],
			typ: item["typ"],
			onset: item.onset,
			ended: item.ended,
			modified_by_name: item["mod.last_name"] + " " + item["mod.first_name"],
			modified_by: item["mod.id"],
			modified_on: item["modified_on"],
			created_by: item["creator.id"],
			created_by_name:
				item["creator.last_name"] + " " + item["creator.first_name"],
			created_on: item["created_on"],
		});
	});
	return {
		rows: display,
		total: res.count,
	};
}

/**
 * Response handler for medical/surgical history table
 * @param {Object} res - API response
 * @returns {Object} - Formatted data for bootstrap-table
 */
function responseHandler_msHx(res) {
	let list = res.items;
	let display = [];
	list.forEach(function (item) {
		display.push({
			id: item.id,
			id_auth_user: item.id_auth_user,
			id_disease_ref: item["disease.id"],
			disease_from_id: item["disease.title"],
			id_worklist: item["id_worklist"],
			icd10: item["disease.icd10"],
			title: item["title"],
			site: item["site"],
			note: item["note"],
			onset: item.onset,
			ended: item.ended,
			category: item.category,
			modified_by_name: item["mod.last_name"] + " " + item["mod.first_name"],
			modified_by: item["mod.id"],
			modified_on: item["modified_on"],
			created_by: item["creator.id"],
			created_by_name:
				item["creator.last_name"] + " " + item["creator.first_name"],
			created_on: item["created_on"],
		});
	});
	return {
		rows: display,
		total: res.count,
	};
}

// Query params handling
let toggle = "";

/**
 * Query parameters handler for general tables
 * @param {Object} params - Bootstrap table parameters
 * @returns {string} - Query string for API
 */
function queryParams(params) {
	let s = "";
	if (params.offset != "0") {
		s == ""
			? (s += "@offset=" + params.offset)
			: (s += "&@offset=" + params.offset);
	}
	if (params.limit != "0") {
		s == ""
			? (s += "@limit=" + params.limit)
			: (s += "&@limit=" + params.limit);
	}
	if (params.sort != undefined) {
		switch (params.sort) {
			case "onset":
				params.sort = "onset";
				break;
			case "medication":
				params.sort = "medication";
				break;
			case "typ":
				params.sort = "typ";
				break;
			case "agent":
				params.sort = "agent";
				break;
			case "title":
				params.sort = "title";
				break;
			case "timestamp":
				params.sort = "timestamp";
				break;
			case "rx_origin":
				params.sort = "rx_origin";
				break;
			case "va_far":
				params.sort = "va_far";
				break;
			case "tonometry":
				params.sort = "tonometry";
				break;
			case "pachymetry":
				params.sort = "pachymetry";
				break;
			case "techno":
				params.sort = "techno";
				break;
			case "category":
				params.sort = "category";
				break;
		}
		if (toggle == "") {
			s += "&@order=" + params.sort;
			toggle = "~";
		} else {
			s += "&@order=~" + params.sort;
			toggle = "";
		}
	}
	return s;
}

// Formatters and event handlers for medications
/**
 * Format operation buttons for medication list
 * @param {*} value - Cell value
 * @param {Object} row - Row data
 * @param {number} index - Row index
 * @returns {string} - HTML for operation buttons
 */
function operateFormatter_mx(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="edit" href="javascript:void(0)" title="Edit rx"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete rx"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

/**
 * Event handlers for medication operations
 */
const operateEvents_mx = {
	"click .edit": async function (e, value, row, index) {
		document.getElementById("mxFormModal").reset();
		$("#mxFormModal [name=id]").val(row.id);
		$("#mxFormModal [name=id_medic_ref]").val(row.id_medic_ref);
		$("#mxFormModal [name=id_auth_user]").val(row.id_auth_user);
		$("#mxFormModal [name=onset]").val(row.onset);
		$("#mxFormModal [name=ended]").val(row.ended);
		$("#mxFormModal [name=delivery]").val([row.delivery]);
		$("#mxFormModal [name=intake]").val(row.intake);
		$("#mxFormModal [name=frequency]").val(row.frequency);
		$("#mxFormModal [name=medication]").val(row.medication);
		$("#mxFormModal [name=note]").val(row.note);
		$("#mxFormModal [name=prescribed]").val(row.prescribed);
		$("#mxFormModal [name=id_worklist]").val(row.id_worklist);
		$("#mxFormModal [name=methodMxModalSubmit]").val("PUT");
		$("#mxModal .modal-title").html("Edit medication #" + row.id);
		$("#mxModal").modal("show");
	},
	"click .remove": async function (e, value, row, index) {
		try {
			if (confirm(`Are you sure you want to delete this medication?`)) {
				await ApiService.deleteItem(row.id, "mx");
				$("#mx_tbl").bootstrapTable("refresh");
			}
		} catch (error) {
			console.error("Error deleting medication:", error);
			UiService.showError("Failed to delete medication", error);
		}
	},
};

// Formatters and event handlers for allergies
/**
 * Format operation buttons for allergy list
 * @param {*} value - Cell value
 * @param {Object} row - Row data
 * @param {number} index - Row index
 * @returns {string} - HTML for operation buttons
 */
function operateFormatter_ax(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="edit" href="javascript:void(0)" title="Edit allergy"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete allergy"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

/**
 * Event handlers for allergy operations
 */
const operateEvents_ax = {
	"click .edit": async function (e, value, row, index) {
		document.getElementById("axFormModal").reset();
		$("#axFormModal [name=id]").val(row.id);
		$("#axFormModal [name=id_agent]").val(row.id_agent);
		$("#axFormModal [name=id_auth_user]").val(row.id_auth_user);
		$("#axFormModal [name=agent]").val(row.agent);
		$("#axFormModal [name=onset]").val(row.onset);
		$("#axFormModal [name=ended]").val(row.ended);
		$('#axFormModal [name=typ][value="' + row.typ + '"]').prop("checked", true);
		$("#axFormModal [name=methodAxModalSubmit]").val("PUT");
		$("#axModal .modal-title").html("Edit allergy #" + row.id);
		$("#axModal").modal("show");
	},
	"click .remove": async function (e, value, row, index) {
		try {
			if (confirm(`Are you sure you want to delete this allergy?`)) {
				await ApiService.deleteItem(row.id, "allergies");
				$("#ax_tbl").bootstrapTable("refresh");
			}
		} catch (error) {
			console.error("Error deleting allergy:", error);
			UiService.showError("Failed to delete allergy", error);
		}
	},
};

// Format operation buttons for medical/surgical history
/**
 * Format operation buttons for medical/surgical history list
 * @param {*} value - Cell value
 * @param {Object} row - Row data
 * @param {number} index - Row index
 * @returns {string} - HTML for operation buttons
 */
function operateFormatter_msHx(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="edit" href="javascript:void(0)" title="Edit history"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete history"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

/**
 * Event handlers for medical/surgical history operations
 */
const operateEvents_msHx = {
	"click .edit": async function (e, value, row, index) {
		document.getElementById("mHxFormModal").reset();
		// Update form with row data
		$("#mHxFormModal [name=id]").val(row.id);
		$("#mHxFormModal [name=id_disease_ref]").val(row.id_disease_ref);
		$("#mHxFormModal [name=id_auth_user]").val(row.id_auth_user);
		$("#mHxFormModal [name=title]").val(row.title);
		$("#mHxFormModal [name=icd10]").val(row.icd10);
		$("#mHxFormModal [name=onset]").val(row.onset);
		$("#mHxFormModal [name=ended]").val(row.ended);
		$("#mHxFormModal [name=category]").val(row.category);
		$("#mHxFormModal [name=site]").val(row.site);
		$("#mHxFormModal [name=note]").val(row.note);
		$("#mHxFormModal [name=methodHxModalSubmit]").val("PUT");

		// Update modal title based on category
		if (row.category === "medical") {
			$("#mHxModal .modal-title").html("Edit medical history #" + row.id);
		} else if (row.category === "surgical") {
			$("#mHxModal .modal-title").html("Edit surgical history #" + row.id);
		} else {
			$("#mHxModal .modal-title").html("Edit history #" + row.id);
		}

		$("#mHxModal").modal("show");
	},
	"click .remove": async function (e, value, row, index) {
		try {
			if (confirm(`Are you sure you want to delete this history item?`)) {
				await ApiService.deleteItem(row.id, "phistory");

				// Refresh the appropriate table based on category
				if (row.category === "medical") {
					$("#mHx_tbl").bootstrapTable("refresh");
				} else if (row.category === "surgical") {
					$("#sHx_tbl").bootstrapTable("refresh");
				} else {
					$("#oHx_tbl").bootstrapTable("refresh");
				}
			}
		} catch (error) {
			console.error("Error deleting history item:", error);
			UiService.showError("Failed to delete history item", error);
		}
	},
};

// Detail formatters
/**
 * Format detail view for medication items
 * @param {number} index - Row index
 * @param {Object} row - Row data
 * @returns {string} - HTML for detail view
 */
function detailFormatter_mx(index, row) {
	// Implementation omitted for brevity, keeping the existing implementation
	// ...

	// This contains the HTML for the detail view
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Created on: </span>' +
			row.created_on +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Created by: </span>' +
			row.created_by_name +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Note: </span>' + row.note + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Prescribed: </span>' +
			row.prescribed +
			"</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Modified on: </span>' +
			row.modified_on +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Modified by: </span>' +
			row.modified_by_name +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Form: </span>' + row.form + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Brand: </span>' + row.brand + "</p>"
	);
	html.push("</div></div></div>");
	return html.join("");
}

// Worklist-specific functions
let s_wl = "";
let toggle_wl = "";
let mainModalityArr = ["MD", "GP"];

/**
 * Query parameters handler for worklist table
 * @param {Object} params - Bootstrap table parameters
 * @returns {string} - Query string for API
 */
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
		s_wl += "&@offset=" + params.offset;
	}
	if (params.limit != "0") {
		s_wl += "&@limit=" + params.limit;
	}
	return decodeURI(encodeURI(s_wl));
}

/**
 * Response handler for worklist table
 * @param {Object} res - API response
 * @returns {Object} - Formatted data for bootstrap-table
 */
function responseHandler_wl(res) {
	let list = res.items;
	let display = [];
	list.forEach(function (item) {
		display.push({
			id: item.id,
			id_auth_user: item["id_auth_user.id"],
			sending_facility: item["sending_facility.facility_name"],
			receiving_facility: item["receiving_facility.facility_name"],
			patient:
				item["id_auth_user.last_name"] + " " + item["id_auth_user.first_name"],
			provider: item["provider.last_name"] + " " + item["provider.first_name"],
			senior: item["senior.last_name"] + " " + item["senior.first_name"],
			procedure: item["procedure.exam_name"],
			modality: item["modality.modality_name"],
			laterality: item["laterality"],
			requested_time: styleTimeslot(item["requested_time"]),
			status_flag: item["status_flag"],
			counter: item["counter"],
			warning: item["warning"],
			modified_by:
				item["modified_by.last_name"] + " " + item["modified_by.first_name"],
			modified_on: item["modified_on"],
			created_by:
				item["created_by.last_name"] + " " + item["created_by.first_name"],
			created_on: item["created_on"],
		});
	});
	return { rows: display, total: res.count };
}

/**
 * Format counter for worklist table
 * @param {*} value - Cell value
 * @param {Object} row - Row data
 * @returns {string} - HTML for counter
 */
function counterFormatter_wl(value, row) {
	let html = "";
	if (row.status_flag === "processing") {
		html =
			'<span class="timer" data-timestamp="' +
			value +
			'" data-status="' +
			row.status_flag +
			'">' +
			value +
			"</span>";
	} else {
		html = value;
	}
	return html;
}

/**
 * Format row style for worklist table
 * @param {Object} row - Row data
 * @returns {Object} - Row style properties
 */
function rowStyle_wl(row) {
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

/**
 * Initialize the module by exposing functions to the global scope
 */
export function init() {
	console.log("Initializing MD Bootstrap Table Module");

	// Expose functions to global scope for bootstrap-table
	window.checkIfNull = checkIfNull;
	window.styleTimeslot = styleTimeslot;
	window.responseHandler_mx = responseHandler_mx;
	window.responseHandler_ax = responseHandler_ax;
	window.responseHandler_msHx = responseHandler_msHx;
	window.queryParams = queryParams;

	window.operateFormatter_mx = operateFormatter_mx;
	window.operateEvents_mx = operateEvents_mx;
	window.operateFormatter_ax = operateFormatter_ax;
	window.operateEvents_ax = operateEvents_ax;
	window.operateFormatter_msHx = operateFormatter_msHx;
	window.operateEvents_msHx = operateEvents_msHx;
	window.detailFormatter_mx = detailFormatter_mx;

	window.queryParams_wl = queryParams_wl;
	window.responseHandler_wl = responseHandler_wl;
	window.rowStyle_wl = rowStyle_wl;
	window.counterFormatter_wl = counterFormatter_wl;

	// Additional function exposures would go here...

	// Register various event handlers
	registerEventHandlers();
}

/**
 * Register event handlers for various UI elements
 */
function registerEventHandlers() {
	// Common delete function for items
	window.delItem = async function (id, table, desc) {
		try {
			if (confirm(`Are you sure you want to delete this ${desc}?`)) {
				await ApiService.deleteItem(id, table);
				$(`#${table}_tbl`).bootstrapTable("refresh");
			}
		} catch (error) {
			console.error(`Error deleting ${desc}:`, error);
			UiService.showError(`Failed to delete ${desc}`, error);
		}
	};

	// Set worklist item status
	window.setWlItemStatus = async function (dataStr) {
		try {
			const data = JSON.parse(dataStr);
			await WorklistService.updateWorklistItem(data.id, data);
			return true;
		} catch (error) {
			console.error("Error updating worklist item status:", error);
			UiService.showError("Failed to update worklist item status", error);
			return false;
		}
	};

	// Update transaction table
	window.updateTransactionTable = async function (
		headers = [
			"date",
			"price",
			"covered_1300",
			"covered_1600",
			"status",
			"note",
		]
	) {
		try {
			const response = await fetch(window.API_TRANSACTIONS);
			if (!response.ok) throw new Error("Failed to fetch transaction data");

			const data = await response.json();
			if (!data || !data.items || data.items.length === 0) {
				document.getElementById("transactionsDiv").innerHTML =
					"<p>No transactions found</p>";
				return;
			}

			// Process transactions and update UI
			// Implementation omitted for brevity
		} catch (error) {
			console.error("Error updating transaction table:", error);
			UiService.showError("Failed to update transaction table", error);
		}
	};

	// Refresh tables
	window.refreshTables = function (tablesArr) {
		if (!tablesArr || !Array.isArray(tablesArr)) return;

		tablesArr.forEach((tableId) => {
			try {
				$(tableId).bootstrapTable("refresh");
			} catch (error) {
				console.error(`Error refreshing table ${tableId}:`, error);
			}
		});
	};
}

// Helper function to capitalize first letter
function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
