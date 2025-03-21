// add visibility to main modalities
let mainModalityArr = ["MD", "GP"];

// medications table
function responseHandler_mx(res) {
	// used if data-response-handler="responseHandler_mx"
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_worklist: list[i].id_worklist,
			id_medic_ref: list[i]["medication.id"],
			medication_from_id: list[i]["medication.name"],
			medication: list[i]["medication"],
			brand: list[i]["medication.brand"],
			delivery: list[i]["delivery"],
			form: list[i]["medication.form"],
			intake: list[i]["unit_per_intake"],
			frequency: list[i].frequency,
			frequency_h:
				list[i]["unit_per_intake"] +
				" " +
				checkIfNull(list[i]["medication.form"], "") +
				" " +
				list[i].frequency,
			onset: list[i].onset,
			ended: list[i].ended,
			note: list[i].note,
			prescribed: list[i].prescribed,
			modified_by_name:
				list[i]["mod.last_name"] + " " + list[i]["mod.first_name"],
			modified_by: list[i]["mod.id"],
			modified_on: list[i]["modified_on"],
			created_by: list[i]["creator.id"],
			created_by_name:
				list[i]["creator.last_name"] + " " + list[i]["creator.first_name"],
			created_on: list[i]["created_on"],
		});
	});
	return {
		rows: display,
		total: res.count,
	};
}

// allergies table
function responseHandler_ax(res) {
	// used if data-response-handler="responseHandler_ax"
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_agent: list[i]["agentRef.id"],
			agent_from_id: list[i]["agentRef.name"],
			agent: list[i]["agent"],
			typ: list[i]["typ"],
			onset: list[i].onset,
			ended: list[i].ended,
			modified_by_name:
				list[i]["mod.last_name"] + " " + list[i]["mod.first_name"],
			modified_by: list[i]["mod.id"],
			modified_on: list[i]["modified_on"],
			created_by: list[i]["creator.id"],
			created_by_name:
				list[i]["creator.last_name"] + " " + list[i]["creator.first_name"],
			created_on: list[i]["created_on"],
		});
	});
	return {
		rows: display,
		total: res.count,
	};
}

// medical history table
function responseHandler_msHx(res) {
	// used if data-response-handler="responseHandler_ms"
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_disease_ref: list[i]["disease.id"],
			disease_from_id: list[i]["disease.title"],
			id_worklist: list[i]["id_worklist"],
			icd10: list[i]["disease.icd10"],
			title: list[i]["title"],
			site: list[i]["site"],
			note: list[i]["note"],
			onset: list[i].onset,
			ended: list[i].ended,
			category: list[i].category,
			modified_by_name:
				list[i]["mod.last_name"] + " " + list[i]["mod.first_name"],
			modified_by: list[i]["mod.id"],
			modified_on: list[i]["modified_on"],
			created_by: list[i]["creator.id"],
			created_by_name:
				list[i]["creator.last_name"] + " " + list[i]["creator.first_name"],
			created_on: list[i]["created_on"],
		});
	});
	return {
		rows: display,
		total: res.count,
	};
}

var toggle = "";
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
	// console.log('s:',s);
	return s; // remove the first &
}

// add operational icons for medication list
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

// modal button links to edit or remove medication
window.operateEvents_mx = {
	"click .edit": function (e, value, row, index) {
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
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
		$("#mxModal .modal-title").html("Edit allergy #" + row.id);
		$("#mxModal").modal("show");
	},
	"click .remove": function (e, value, row, index) {
		// console.log('You click action DELETE on row: ' + JSON.stringify(row));
		delItem(row.id, "mx", "medication");
	},
};

// add operational icons for allergies list
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

// modal button links to edit or remove allergies
window.operateEvents_ax = {
	"click .edit": function (e, value, row, index) {
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
		document.getElementById("axFormModal").reset();
		$("#axFormModal [name=id]").val(row.id);
		$("#axFormModal [name=id_agent]").val(row.id_agent);
		$("#axFormModal [name=id_auth_user]").val(row.id_auth_user);
		$("#axFormModal [name=onset]").val(row.onset);
		$("#axFormModal [name=ended]").val(row.ended);
		$("#axFormModal [name=typ]").val([row.typ]);
		$("#axFormModal [name=agent]").val(row.agent);
		$("#axFormModal [name=methodAxModalSubmit]").val("PUT");
		$("#axModal .modal-title").html("Edit allergy #" + row.id);
		$("#axModal").modal("show");
	},
	"click .remove": function (e, value, row, index) {
		// console.log('You click action DELETE on row: ' + JSON.stringify(row));
		delItem(row.id, "allergy", "allergy");
	},
};

// check if value is null and return a default value, else return value
function checkIfNull(value, resultStrIfNull) {
	if (value == null) {
		return resultStrIfNull;
	} else {
		return value;
	}
}

// add operational icons for medical history list
function operateFormatter_msHx(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="edit" href="javascript:void(0)" title="Edit past history"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete past history"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

// modal button links to edit or remove medical history
window.operateEvents_msHx = {
	"click .edit": function (e, value, row, index) {
		let modalFormId = "#mHxFormModal",
			modalId = "#mHxModal";
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
		document.getElementById(modalFormId.split("#").join("")).reset();
		$(modalFormId + " [name=id]").val(row.id);
		$(modalFormId + " [name=id_auth_user]").val(row.id_auth_user);
		$(modalFormId + " [name=id_disease_ref]").val(row.id_disease_ref);
		$(modalFormId + " [name=onset]").val(row.onset);
		$(modalFormId + " [name=ended]").val(row.ended);
		$(modalFormId + " [name=category]").val([row.category]);
		$(modalFormId + " [name=site]").val([row.site]);
		$(modalFormId + " [name=title]").val(row.title);
		$(modalFormId + " [name=id_worklist]").val(row.id_worklist);
		$(modalFormId + " [name=note]").val(row.note);
		$(modalFormId + " [name=methodmHxModalSubmit]").val("PUT");
		$(modalId + " .modal-title").html("Edit past history #" + row.id);
		$(modalId).modal("show");
	},
	"click .remove": function (e, value, row, index) {
		// console.log('You click action DELETE on row: ' + JSON.stringify(row));
		delItem(row.id, "phistory", "past history");
	},
};

// get details for medication item
function detailFormatter_mx(index, row) {
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Intake: </span>' + row.intake + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Frequency: </span>' +
			row.frequency +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Name: </span>' + row.medication + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Brand: </span>' +
			checkIfNull(row.brand, "-") +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Delivery: </span>' +
			row.delivery +
			"</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Prescribed: </span>' +
			row.prescribed +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Onset: </span>' + row.onset + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Ended: </span>' + row.ended + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Note: </span>' + row.note + "</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push('<p class=""><span class="fw-bold">Mx ID: </span>' + row.id);
	html.push(
		'<p class=""><span class="fw-bold">PatientID: </span>' +
			row.id_auth_user +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Worklist ID: </span>' +
			row.id_worklist +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Created by: </span>' +
			row.created_by_name +
			" on " +
			row.created_on +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Modified by: </span>' +
			row.modified_by_name +
			" on " +
			row.modified_on +
			"</p>"
	);
	html.push("</div>");
	html.push("</div></div>");
	return html.join("");
}

// get details for allergy item
function detailFormatter_ax(index, row) {
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Type: </span>' + row.typ + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Agent: </span>' + row.agent + "</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Onset: </span>' + row.onset + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Ended: </span>' + row.ended + "</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
	html.push(
		'<p class=""><span class="fw-bold">PatientID: </span>' +
			row.id_auth_user +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Created by: </span>' +
			row.created_by_name +
			" on " +
			row.created_on +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Modified by: </span>' +
			row.modified_by_name +
			" on " +
			row.modified_on +
			"</p>"
	);
	html.push("</div>");
	html.push("</div></div>");
	return html.join("");
}

// get details for medical history item
function detailFormatter_msHx(index, row) {
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Title: </span>' + row.title + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Site: </span>' + row.site + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Note: </span>' + row.note + "</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Category: </span>' +
			row.category +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Onset: </span>' + row.onset + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Ended: </span>' + row.ended + "</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
	html.push(
		'<p class=""><span class="fw-bold">PatientID: </span>' +
			row.id_auth_user +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Worklist ID: </span>' +
			row.id_worklist +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Created by: </span>' +
			row.created_by_name +
			" on " +
			row.created_on +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Modified by: </span>' +
			row.modified_by_name +
			" on " +
			row.modified_on +
			"</p>"
	);
	html.push("</div>");
	html.push("</div></div>");
	return html.join("");
}

// styling allergies row
function rowStyle_ax(row, value) {
	let statusColor = {
		atopy: "lightblue",
		intolerance: "papayawhip",
		allergy: "#ff9999",
	};
	return {
		css: { "background-color": statusColor[row.typ] },
	};
}

// set parameters for worklist table
var s_wl = "";
var toggle_wl = "";

function queryParams_wl(params) {
	search = params.search.split(",");
	if (search == [""]) {
		s_wl = "";
	} else {
		if (search[0] != undefined) {
			s_wl = "procedure.exam_name.startswith=" + capitalize(search[0]);
		} else {
			s_wl = "";
		}
		if (search[1] != undefined) {
			s_wl +=
				"&modality_dest.modality_name.startswith=" + capitalize(search[1]);
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
		if (toggle_wl == "") {
			s_wl += "&@order=" + params.sort;
			toggle_wl = "~";
		} else {
			s_wl += "&@order=~" + params.sort;
			toggle_wl = "";
		}
	}
	if (params.offset != "0") {
		// console.log(params.offset);
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
	// arr[1] is time arr[0] is date
	let res =
		"<strong>" + arr[0].split("-").reverse().join("/") + "</strong> " + arr[1];
	return res;
}

// respondhandler for worklist table
function responseHandler_wl(res) {
	// used if data-response-handler="responseHandler_wl"
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
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

// add operational icons for worklist rows
function operateFormatter_wl(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="modality_ctr ms-1" href="javascript:void(0)" title="Execute task"><i class="fas fa-heartbeat"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

// add button link for worklist table
window.operateEvents_wl = {
	"click .modality_ctr": function (e, value, row, index) {
		let dataObj = { laterality: row.laterality, id: row.id };
		let dataStr;
		if (row.status_flag == "requested") {
			dataObj["status_flag"] = "processing";
			dataObj["counter"] = row.counter;
			dataStr = JSON.stringify(dataObj);
			setWlItemStatus(dataStr);
		}
		let controller = modalityDict[row.modality];
		link =
			HOSTURL + "/" + APP_NAME + "/modalityCtr/" + controller + "/" + row.id;
		window.location.href = link;
	},
};

// style rows in worklist table
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

// get details from worklist items
function detailFormatter_wl(index, row) {
	let lastmodif = Date.parse(row.created_on);
	var rightnow = new Date();
	let elapse = Math.round((rightnow - lastmodif) / 1000) - timeOffset;
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

// add time elapsed pill to worklist rows
function counterFormatter_wl(value, row) {
	let html = [];
	let lastmodif = Date.parse(row.modified_on);
	var rightnow = new Date();
	// console.log('Rightnow:'+row.id,rightnow);
	// console.log('Lastmodif:'+row.id,lastmodif);
	let elapse = Math.round((rightnow - lastmodif) / 1000) - timeOffset;
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
	if (elapse < 24 * 60 * 60) {
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

// add tooltip row to worklist table
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

// responseHandler to medical prescriptions table
function responseHandler_mxrx(res) {
	// used if data-response-handler="responseHandler_mxrx"
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_worklist: list[i].id_worklist,
			id_mx_ref:
				list[i]["id_mx_ref"] == null
					? "n/a"
					: list[i]["id_mx_ref"].split("|").join(","),
			mx_names:
				list[i]["mx_names"] == null
					? "n/a"
					: list[i]["mx_names"].split("|").join(","),
			modified_by_name:
				list[i]["mod.last_name"] + " " + list[i]["mod.first_name"],
			modified_by: list[i]["mod.id"],
			modified_on: list[i]["modified_on"],
			created_by: list[i]["creator.id"],
			created_by_name:
				list[i]["creator.last_name"] + " " + list[i]["creator.first_name"],
			created_on: list[i]["created_on"].split("T").join(" "),
		});
	});
	return {
		rows: display,
		total: res.count,
	};
}

// get details from row in medical prescriptions table
function detailFormatter_mxrx(index, row) {
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
	html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
	html.push(
		'<p class=""><span class="fw-bold">Patient ID: </span>' + row.id_auth_user
	);
	html.push(
		'<p class=""><span class="fw-bold">Wl ID: </span>' + row.id_worklist
	);
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
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Medications: </span>' +
			row.mx_names +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Medications ids: </span>' +
			row.id_mx_ref +
			"</p>"
	);
	html.push("</div>");
	html.push("</div></div>");
	return html.join("");
}

// add operational buttons to row in medical prescriptions table
function operateFormatter_mxrx(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete rx"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push(
		'<a class="print ms-1" href="javascript:void(0)" title="Print medical prescription"><i class="fas fa-print"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

// add button links to row in medical prescriptions table
window.operateEvents_mxrx = {
	"click .print": function (e, value, row, index) {
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
		printRx("medical_rx_list", row.id);
	},
	"click .remove": function (e, value, row, index) {
		// console.log('You click action DELETE on row: ' + JSON.stringify(row));
		delItem(row.id, "medical_rx_list", "prescription");
	},
};

// responseHandler for certificates table
function responseHandler_cert(res) {
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_worklist: list[i].id_worklist,
			uuid: list[i]["uuid"],
			datestamp: list[i]["datestamp"],
			category: list[i].category,
			onset: list[i].onset,
			ended: list[i].ended,
			modified_by_name:
				list[i]["mod.last_name"] + " " + list[i]["mod.first_name"],
			modified_by: list[i]["mod.id"],
			modified_on: list[i]["modified_on"],
			created_by: list[i]["creator.id"],
			created_by_name:
				list[i]["creator.last_name"] + " " + list[i]["creator.first_name"],
			created_on: list[i]["created_on"],
		});
	});
	return { rows: display, total: res.count };
}

// TODO: check_if_null
// get details from row in certificates table
function detailFormatter_cert(index, row) {
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
	html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
	html.push('<p class=""><span class="fw-bold">Unique id: </span>' + row.uuid);
	html.push(
		'<p class=""><span class="fw-bold">Datestamp: </span>' +
			row.datestamp +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Onset: </span>' + row.onset + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Ended: </span>' + row.ended + "</p>"
	);
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
		'<p class=""><span class="fw-bold">Category: </span>' +
			row.category +
			"</p>"
	);
	html.push("</div>");
	html.push("</div></div>");
	return html.join("");
}

// add operational buttons to rows in certificates table
function operateFormatter_cert(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete certificate"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push(
		'<a class="print ms-1" href="javascript:void(0)" title="Print certificate"><i class="fas fa-print"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

// add button links to rows in certificates table
window.operateEvents_cert = {
	"click .remove": function (e, value, row, index) {
		// console.log('You click action DELETE on row: ' + JSON.stringify(row));
		delItem(row.id, "certificates", "certificate");
	},
	"click .print": function (e, value, row, index) {
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
		printGxRx("certificates", row.id);
	},
};
