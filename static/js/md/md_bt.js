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
	// Add payment button for completed procedures
	if (row.status_flag == "done") {
		html.push(
			'<a class="payment ms-1" href="javascript:void(0)" title="Process payment"><i class="fas fa-dollar-sign"></i></a>'
		);
	}
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
	"click .payment": function (e, value, row, index) {
		let link = HOSTURL + "/" + APP_NAME + "/payment/" + row.id;
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
	if (row.modality == "MD" && row.status_flag == "done") {
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

// responseHandler for refraction table
function responseHandler_rx(res) {
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_worklist: list[i].id_worklist,
			timestamp: list[i]["timestamp"].split("T").join(" "),
			rx_origin: list[i].rx_origin,
			glass_type: list[i].glass_type,
			va_far: list[i].va_far,
			opto_far: list[i].opto_far,
			sph_far: list[i].sph_far,
			cyl_far: list[i].cyl_far,
			axis_far: list[i].axis_far,
			rx_far:
				list[i].sph_far + "(" + list[i].cyl_far + "x" + list[i].axis_far + "°)",
			se_far: (
				parseFloat(list[i].sph_far) +
				0.5 * parseFloat(list[i].cyl_far)
			).toFixed(2),
			va_int: list[i].va_int,
			opto_int: list[i].opto_int,
			sph_int: list[i].sph_int,
			cyl_int: list[i].cyl_int,
			axis_int: list[i].axis_int,
			rx_int:
				list[i].sph_int + "(" + list[i].cyl_int + "x" + list[i].axis_int + "°)",
			va_close: list[i].va_close,
			add: (
				parseFloat(list[i].sph_close) - parseFloat(list[i].sph_far)
			).toFixed(2),
			opto_close: list[i].opto_close,
			sph_close: list[i].sph_close,
			cyl_close: list[i].cyl_close,
			axis_close: list[i].axis_close,
			rx_close:
				list[i].sph_close +
				"(" +
				list[i].cyl_close +
				"x" +
				list[i].axis_close +
				"°)",
			pd05: list[i]["pd05"],
			note: list[i].note,
			laterality: list[i]["laterality"],
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

// add operationnal buttons to rx table
function operateFormatter_rx(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="edit" href="javascript:void(0)" title="Edit ' +
			row.laterality +
			' rx"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="cache" href="javascript:void(0)" title="Cache ' +
			row.laterality +
			' rx"><i class="fas fa-file-import"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

// add button links to edit refraction or add to cache
window.operateEvents_rx = {
	"click .edit": function (e, value, row, index) {
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
		window.location.href =
			"/" + APP_NAME + "/modalityCtr/autorx/" + row.id_worklist;
	},
	"click .cache": function (e, value, row, index) {
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
		rxObj.push(row);
		updateCache(rxObj);
	},
};

// get details from row rx table
function detailFormatter_rx(index, row) {
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
	html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
	html.push(
		'<p class=""><span class="fw-bold">Timestamp: </span>' +
			row.timestamp +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Created on: </span>' +
			row.created_on +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Created by: </span>' +
			row.created_by +
			"</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Origin: </span>' + row.rx_origin + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Type: </span>' + row.glass_type + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Rx far: </span>' + row.rx_far + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Rx int: </span>' + row.rx_int + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">PD: </span>' +
			parseFloat(row.pd05) * 2 +
			"mm</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Rx close: </span>' +
			row.rx_close +
			"(Add+" +
			row.add +
			")</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Note: </span>' + row.note + "</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Va far: </span>' + row.va_far + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Va int: </span>' + row.va_int + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Va close: </span>' +
			row.va_close +
			"</p>"
	);
	html.push("</div>");
	html.push("</div></div>");
	return html.join("");
}

// add style to row in rx table
function rowStyle_type(row) {
	let bg,
		statusColor = {
			cyclo: "#98ff98",
			glass: "papayawhip",
			dil: "#98ff98",
			trial: "#00FF00",
			autorx: "white",
		};
	row.rx_origin != undefined
		? (bg = statusColor[row.rx_origin])
		: (bg = "white");
	return {
		css: { "background-color": bg },
	};
}

// format formula in a cell of rx table
function cellStyle_formula(value, row) {
	let bg,
		statusColor = {
			cyclo: "#98ff98",
			glass: "papayawhip",
			dil: "#98ff98",
			trial: "#00FF00",
			autorx: "white",
		},
		fontColor = "black";
	row.rx_origin != undefined
		? (bg = statusColor[row.rx_origin])
		: (bg = "white");
	row.se_far == 0
		? {}
		: row.se_far < 0
		? (fontColor = "firebrick")
		: (fontColor = "forestgreen");
	return {
		css: {
			color: fontColor,
			"font-weight": "bold",
			"background-color": bg,
		},
	};
}

// format formula in a cell of rx table
function cellStyle_add(value, row) {
	let bg,
		statusColor = {
			cyclo: "#98ff98",
			glass: "papayawhip",
			dil: "#98ff98",
			trial: "#00FF00",
			autorx: "white",
		};
	row.rx_origin != undefined
		? (bg = statusColor[row.rx_origin])
		: (bg = "white");
	return {
		css: {
			"background-color": bg,
			"font-weight": "bold",
		},
	};
}

// responsehandler for km tables
function responseHandler_km(res) {
	// used if data-response-handler="responseHandler_wl"
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_worklist: list[i].id_worklist,
			timestamp: list[i]["timestamp"].split("T").join(" "),
			laterality: list[i]["laterality"],
			k1: list[i].k1,
			axis1: list[i].axis1,
			k2: list[i].k2,
			axis2: list[i].axis2,
			note: list[i].note,
			formulak1: list[i].k1 + "D x" + list[i].axis1 + "°",
			formulak2: list[i].k2 + "D x" + list[i].axis2 + "°",
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

// add operational buttons to rows in km tables
function operateFormatter_km(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="edit" href="javascript:void(0)" title="Edit tono/pachy"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="cache ms-1" href="javascript:void(0)" title="Cache km"><i class="fas fa-file-import"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

// add button links to edit or remove to row in km table
window.operateEvents_km = {
	"click .edit": function (e, value, row, index) {
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
		window.location.href =
			"/" + APP_NAME + "/modalityCtr/autorx/" + row.id_worklist;
	},
	"click .cache": function (e, value, row, index) {
		// todo: to implement
	},
};

// get details from rows in km table
function detailFormatter_km(index, row) {
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">K1: </span>' +
			row.k1 +
			"D x " +
			row.axis1 +
			"°</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">K2: </span>' +
			row.k2 +
			"D x " +
			row.axis2 +
			"°</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Laterality: </span>' +
			row.laterality +
			"</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
	html.push(
		'<p class=""><span class="fw-bold">Timestamp: </span>' +
			row.timestamp +
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

// style rows in km table
function rowStyle_km(row, index) {
	let bg = "white";
	if (index % 2 === 0) {
		bg = "papayawhip";
	}
	return {
		css: { "background-color": bg },
	};
}

// stlying normal/anomalous values in km tables
function cellStyle_k1(value, row) {
	let font = { color: "black", weight: "normal" };
	row.k1 <= 40.5 || row.k1 >= 46.5
		? (font = { color: "red", weight: "bold " })
		: {};
	return {
		css: {
			"font-weight": font.weight,
			color: font.color,
		},
	};
}

// stlying normal/anomalous values in km tables
function cellStyle_k2(value, row) {
	let font = { color: "black", weight: "normal" };
	row.k2 <= 40.5 || row.k2 >= 46.5
		? (font = { color: "red", weight: "bold " })
		: {};
	return {
		css: {
			"font-weight": font.weight,
			color: font.color,
		},
	};
}

// response handler for tono table
// TODO: add search to select techo
function responseHandler_tono(res) {
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_worklist: list[i].id_worklist,
			techno: list[i].techno,
			laterality: list[i]["laterality"],
			tonometry: highlightValue(list[i]["tonometry"], 20, 24),
			pachymetry:
				list[i]["pachymetry"] == null
					? " "
					: highlightValue(list[i]["pachymetry"], 525, 500, "low"),
			timestamp: list[i]["timestamp"].split("T").join(" "),
			modified_by: list[i]["mod.last_name"] + " " + list[i]["mod.first_name"],
			modified_on: list[i]["modified_on"],
			created_by:
				list[i]["creator.last_name"] + " " + list[i]["creator.first_name"],
			created_on: list[i]["created_on"],
		});
	});
	return { rows: display, total: res.count };
}

// query parameters for tono tables
function queryParams_tono(params) {
	var s = "";
	if (params.offset != "0") {
		// console.log(params.offset);
		s += "&@offset=" + params.offset;
	}
	if (params.limit != "0") {
		// console.log(params.offset);
		s += "&@limit=" + params.limit;
	}
	return decodeURI(encodeURI(s.slice(1 - s.length))); // remove the first &
}

// add operational buttons to rows in tono table
function operateFormatter_tono(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="edit" href="javascript:void(0)" title="Edit ' +
			row.laterality +
			' tono"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="cache" href="javascript:void(0)" title="Cache ' +
			row.laterality +
			' tono"><i class="fas fa-file-import"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

// add button link to rows in tono table
window.operateEvents_tono = {
	"click .edit": function (e, value, row, index) {
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
		window.location.href =
			"/" + APP_NAME + "/modalityCtr/tono/" + row.id_worklist;
	},
	"click .cache": function (e, value, row, index) {
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
		tonoObj.push(row);
		// todo: implement tono in cache
		// updateCache(tonoObj);
	},
};

// style to highlight abnormal values in tono table
function highlightValue(str, midthreshold, highthreshold, direction = "high") {
	if (direction == "high") {
		if (parseFloat(str) >= highthreshold) {
			return '<span class="text-danger"><strong>' + str + "<strong><span>";
		} else if (parseFloat(str) >= midthreshold) {
			return '<span class="text-warning"><strong>' + str + "<strong><span>";
		} else {
			return '<span class="text-success">' + str + "<span>";
		}
	} else {
		if (parseFloat(str) <= highthreshold) {
			return '<span class="text-danger"><strong>' + str + "<strong><span>";
		} else if (parseFloat(str) <= midthreshold) {
			return '<span class="text-warning"><strong>' + str + "<strong><span>";
		} else {
			return '<span class="text-success">' + str + "<span>";
		}
	}
}

// get details from rows in tono table
function detailFormatter_tono(index, row) {
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Tono: </span>' + row.tonometry + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Techno: </span>' + row.techno + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Pachy: </span>' + row.pachymetry + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Timestpan: </span>' +
			row.timestamp +
			"</p>"
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

// responseHandler for prescribed glasses table
function responseHandler_gx(res) {
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_worklist: list[i].id_worklist,
			uuid: list[i]["uuid"],
			datestamp: list[i]["datestamp"],
			glass_type: list[i].glass_type,
			sph_farR: list[i].sph_farR,
			cyl_farR: list[i].cyl_farR,
			axis_farR: list[i].axis_farR,
			rx_farR:
				list[i].sph_farR +
				"(" +
				list[i].cyl_farR +
				"x" +
				list[i].axis_farR +
				")",
			formulaR:
				list[i].sph_farR +
				"(" +
				list[i].cyl_farR +
				"x" +
				list[i].axis_farR +
				") Add" +
				(parseFloat(list[i].sph_closeR) - parseFloat(list[i].sph_farR)).toFixed(
					2
				),
			se_farR: (
				parseFloat(list[i].sph_farR) +
				0.5 * parseFloat(list[i].cyl_farR)
			).toFixed(2),
			sph_intR: list[i].sph_intR,
			cyl_intR: list[i].cyl_intR,
			axis_intR: list[i].axis_intR,
			rx_intR:
				list[i].sph_intR +
				"(" +
				list[i].cyl_intR +
				"x" +
				list[i].axis_intR +
				")",
			addR: (
				parseFloat(list[i].sph_close) - parseFloat(list[i].sph_far)
			).toFixed(2),
			sph_closeR: list[i].sph_closeR,
			cyl_closeR: list[i].cyl_closeR,
			axis_closeR: list[i].axis_closeR,
			rx_closeR:
				list[i].sph_closeR +
				"(" +
				list[i].cyl_closeR +
				"x" +
				list[i].axis_closeR +
				")",
			// left eye
			sph_farL: list[i].sph_farL,
			cyl_farL: list[i].cyl_farL,
			axis_farL: list[i].axis_farL,
			rx_farL:
				list[i].sph_farL +
				"(" +
				list[i].cyl_farL +
				"x" +
				list[i].axis_farL +
				")",
			formulaL:
				list[i].sph_farL +
				"(" +
				list[i].cyl_farL +
				"x" +
				list[i].axis_farL +
				") Add" +
				(parseFloat(list[i].sph_closeL) - parseFloat(list[i].sph_farL)).toFixed(
					2
				),
			se_farL: (
				parseFloat(list[i].sph_farL) +
				0.5 * parseFloat(list[i].cyl_farL)
			).toFixed(2),
			sph_intL: list[i].sph_intL,
			cyl_intL: list[i].cyl_intL,
			axis_intL: list[i].axis_intL,
			rx_intL:
				list[i].sph_intL +
				"(" +
				list[i].cyl_intL +
				"x" +
				list[i].axis_intL +
				")",
			addL: (
				parseFloat(list[i].sph_close) - parseFloat(list[i].sph_far)
			).toFixed(2),
			sph_closeL: list[i].sph_closeL,
			cyl_closeL: list[i].cyl_closeL,
			axis_closeL: list[i].axis_closeL,
			rx_closeL:
				list[i].sph_closeL +
				"(" +
				list[i].cyl_closeL +
				"x" +
				list[i].axis_closeL +
				")",
			remarks: list[i].remarks,
			art30: list[i].art30,
			prismL: list[i].prismL,
			prismR: list[i].prismR,
			baseL: list[i].baseL,
			baseR: list[i].baseR,
			tint: list[i].tint,
			photo: list[i].photo,
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

//TODO: check_if_null
// get details from row in prescribed glasses table
function detailFormatter_gx(index, row) {
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
		'<p class=""><span class="fw-bold">Created on: </span>' +
			row.created_on +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Created by: </span>' +
			row.created_by +
			"</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Type: </span>' + row.glass_type + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Rx right: </span>' +
			row.formulaR +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Rx left: </span>' + row.formulaL + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Remarks: </span>' + row.remarks + "</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Prism right: </span>' +
			row.prismR +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Base right: </span>' + row.baseR + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Prism left: </span>' +
			row.prismL +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Base right: </span>' + row.baseL + "</p>"
	);
	html.push("</div>");
	html.push("</div></div>");
	return html.join("");
}

// add operational buttons to rows in prescribed glasses table
function operateFormatter_gx(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete prescription"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push(
		'<a class="print ms-1" href="javascript:void(0)" title="Print glasses prescription"><i class="fas fa-print"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

// add operational buttons to rows in prescribed glasses table
window.operateEvents_gx = {
	"click .remove": function (e, value, row, index) {
		// console.log('You click action DELETE on row: ' + JSON.stringify(row));
		delItem(row.id, "glasses_rx_list", "glasses prescription");
	},
	"click .print": function (e, value, row, index) {
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
		printGxRx("glasses_rx_list", row.id);
	},
};

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

// responseHandler for contacts prescriptions
function responseHandler_cxrx(res) {
	let list = res.items;
	let display = [];
	$.each(list, function (i) {
		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_worklist: list[i].id_worklist,
			uuid: list[i]["uuid"],
			datestamp: list[i]["datestamp"],
			sph_farR: list[i].sph_farR,
			cyl_farR: list[i].cyl_farR,
			axis_farR: list[i].axis_farR,
			formulaR:
				list[i].sphR +
				"(" +
				list[i].cylR +
				"x" +
				list[i].axisR +
				") Add+" +
				list[i].addcR,
			sph_intR: list[i].sph_intR,
			cyl_intR: list[i].cyl_intR,
			axis_intR: list[i].axis_intR,
			addcR: list[i].addcR,
			sph_closeR: list[i].sph_closeR,
			cyl_closeR: list[i].cyl_closeR,
			axis_closeR: list[i].axis_closeR,
			lensnameR: list[i].lensnameR,
			cleaningR: list[i].cleaningR,
			// left eye
			sph_farL: list[i].sph_farL,
			cyl_farL: list[i].cyl_farL,
			axis_farL: list[i].axis_farL,
			formulaL:
				list[i].sphL +
				"(" +
				list[i].cylL +
				"x" +
				list[i].axisL +
				") Add+" +
				list[i].addcL,
			sph_intL: list[i].sph_intL,
			cyl_intL: list[i].cyl_intL,
			axis_intL: list[i].axis_intL,
			addcL: list[i].addcL,
			sph_closeL: list[i].sph_closeL,
			cyl_closeL: list[i].cyl_closeL,
			axis_closeL: list[i].axis_closeL,
			lensnameL: list[i].lensnameL,
			cleaningL: list[i].cleaningL,
			remarks: list[i].remarks,
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

//TODO: check_if_null
// get details from contact prescriptions table
function detailFormatter_cxrx(index, row) {
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
		'<p class=""><span class="fw-bold">Created on: </span>' +
			row.created_on +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Created by: </span>' +
			row.created_by +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Remarks: </span>' + row.remarks + "</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Right lense: </span>' +
			row.lensnameR +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Rx right: </span>' +
			row.formulaR +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Cleaning right: </span>' +
			row.cleaningR +
			"</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Left lense: </span>' +
			row.lensnameL +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Rx left: </span>' + row.formulaL + "</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Cleaning left: </span>' +
			row.cleaningL +
			"</p>"
	);
	html.push("</div>");
	html.push("</div></div>");
	return html.join("");
}

// add operational buttons to row in contacts tables
function operateFormatter_cxrx(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete prescription"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push(
		'<a class="print ms-1" href="javascript:void(0)" title="Print lenses prescription"><i class="fas fa-print"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

// add button links to contacts table
window.operateEvents_cxrx = {
	"click .remove": function (e, value, row, index) {
		// console.log('You click action DELETE on row: ' + JSON.stringify(row));
		delItem(row.id, "contacts_rx_list", "contacts prescription");
	},
	"click .print": function (e, value, row, index) {
		// console.log('You click action EDIT on row: ' + JSON.stringify(row));
		printGxRx("contacts_rx_list", row.id);
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

// ============================================================================
// Billing Functions
// ============================================================================

// billing codes table response handler
function responseHandler_billing(res) {
	console.log("=== responseHandler_billing called ===");
	console.log("Response:", res);
	console.log("Response type:", typeof res);
	console.log("Response keys:", Object.keys(res || {}));

	// Handle both FastAPI format (res.data) and py4web format (res.items)
	let list = [];
	let total = 0;

	if (res && res.data && Array.isArray(res.data)) {
		// FastAPI format: {status: "success", data: [...], meta: {...}}
		console.log("✅ FastAPI format detected - using res.data");
		list = res.data;
		total = res.meta ? res.meta.total_codes : list.length;
	} else if (res && res.items && Array.isArray(res.items)) {
		// py4web format: {items: [...], count: n}
		console.log("✅ py4web format detected - using res.items");
		list = res.items;
		total = res.count || list.length;
	} else if (Array.isArray(res)) {
		// Direct array
		console.log("✅ Direct array format detected");
		list = res;
		total = list.length;
	} else {
		console.error("❌ Unknown response format:", res);
		list = [];
		total = 0;
	}

	console.log(`Processing ${list.length} billing codes`);

	let display = [];
	$.each(list, function (i) {
		// Enhanced fee calculation including secondary fees
		const mainFee = parseFloat(list[i].fee || 0);
		const secondaryFee = parseFloat(list[i].secondary_fee || 0);
		const quantity = parseInt(list[i].quantity || 1);
		const totalFee = (mainFee + secondaryFee) * quantity;

		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_worklist: list[i].id_worklist,
			nomen_code: list[i].nomen_code,
			nomen_desc_fr: list[i].nomen_desc_fr,
			nomen_desc_nl: list[i].nomen_desc_nl,
			fee: list[i].fee ? "€" + parseFloat(list[i].fee).toFixed(2) : "",
			feecode: list[i].feecode,
			// Secondary nomenclature fields
			secondary_nomen_code: list[i].secondary_nomen_code,
			secondary_nomen_desc_fr: list[i].secondary_nomen_desc_fr,
			secondary_nomen_desc_nl: list[i].secondary_nomen_desc_nl,
			secondary_fee: list[i].secondary_fee,
			secondary_feecode: list[i].secondary_feecode,
			// Enhanced total fee calculation
			total_fee: totalFee.toFixed(2),
			laterality: list[i].laterality,
			quantity: list[i].quantity,
			date_performed: list[i].date_performed,
			note: list[i].note,
			status: list[i].status,
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

	console.log(`Processed ${display.length} records for display`);

	// Update billing summary with enhanced calculations
	updateBillingSummary(display);

	return {
		rows: display,
		total: total,
	};
}

// total fee formatter
function totalFeeFormatter(value, row, index) {
	const mainFee = parseFloat(row.fee?.replace("€", "") || 0);
	const secondaryFee = parseFloat(row.secondary_fee || 0);
	const quantity = parseInt(row.quantity || 1);
	const totalFee = (mainFee + secondaryFee) * quantity;

	if (totalFee > 0) {
		// Use enhanced styling for total fee with secondary indicator
		const hasSecondary = row.secondary_nomen_code
			? ' title="Includes secondary fee"'
			: "";
		const badgeClass = row.secondary_nomen_code
			? "total-fee-badge"
			: "bg-primary";
		return `<span class="badge ${badgeClass} fw-bold"${hasSecondary}>€${totalFee.toFixed(
			2
		)}</span>`;
	}
	return '<span class="text-muted">€0.00</span>';
}

// feecode formatter
function feecodeFormatter(value, row, index) {
	return value
		? '<span class="badge bg-info">' + value + "</span>"
		: '<span class="text-muted">-</span>';
}

// formatter for secondary nomenclature code
function secondaryCodeFormatter(value, row, index) {
	return value
		? `<span class="badge secondary-code" title="Secondary nomenclature code">${value}</span>`
		: '<span class="text-muted">—</span>';
}

// formatter for secondary description
function secondaryDescFormatter(value, row, index) {
	if (value) {
		// Truncate long descriptions for table display
		const truncated =
			value.length > 50 ? value.substring(0, 47) + "..." : value;
		return `<span title="${value}">${truncated}</span>`;
	}
	return '<span class="text-muted">—</span>';
}

// formatter for secondary fee
function secondaryFeeFormatter(value, row, index) {
	if (value && parseFloat(value) > 0) {
		return `<span class="badge secondary-fee" title="Secondary procedure fee">€${parseFloat(
			value
		).toFixed(2)}</span>`;
	}
	return '<span class="text-muted">—</span>';
}

// operational icons for billing list
function operateFormatter_billing(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="edit" href="javascript:void(0)" title="Edit billing code"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete billing code"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

// modal button links to edit or remove billing codes
// THIS MUST BE OUTSIDE $(document).ready() TO BE AVAILABLE FOR BOOTSTRAP TABLE INITIALIZATION
window.operateEvents_billing = {
	"click .edit": function (e, value, row, index) {
		console.log("Edit billing code: " + JSON.stringify(row));

		// Reset and populate form
		document.getElementById("billCodeForm").reset();
		$("#billCodeModal [name=id]").val(row.id);
		$("#billCodeModal [name=nomen_code]").val(row.nomen_code);
		$("#billCodeModal [name=nomen_desc_fr]").val(row.nomen_desc_fr);
		$("#billCodeModal [name=fee]").val(row.fee?.replace("€", ""));

		// Populate secondary nomenclature fields if they exist
		if (row.secondary_nomen_code) {
			$("#billCodeModal [name=secondary_nomen_code]").val(
				row.secondary_nomen_code
			);
			$("#billCodeModal [name=secondary_nomen_desc_fr]").val(
				row.secondary_nomen_desc_fr
			);
			$("#billCodeModal [name=secondary_fee]").val(row.secondary_fee);
			$("#billCodeModal [name=secondary_feecode]").val(row.secondary_feecode);
			// Show the clear secondary button
			document.getElementById("clearSecondaryBtn").style.display =
				"inline-block";
		} else {
			// Clear secondary fields and hide clear button
			$("#billCodeModal [name=secondary_nomen_code]").val("");
			$("#billCodeModal [name=secondary_nomen_desc_fr]").val("");
			$("#billCodeModal [name=secondary_fee]").val("");
			$("#billCodeModal [name=secondary_feecode]").val("");
			document.getElementById("clearSecondaryBtn").style.display = "none";
		}

		$('#billCodeModal [name=laterality][value="' + row.laterality + '"]').prop(
			"checked",
			true
		);
		$("#billCodeModal [name=quantity]").val(row.quantity);
		$("#billCodeModal [name=date_performed]").val(row.date_performed);
		$("#billCodeModal [name=status]").val(row.status);
		$("#billCodeModal [name=note]").val(row.note);
		$("#billCodeModal [name=methodBillCodeSubmit]").val("PUT");

		// Update total fee display
		updateTotalFee();

		$("#billCodeModalLabel").html("Edit Billing Code #" + row.id);
		$("#billCodeSubmit").html("Update Code");
		$("#billCodeModal").modal("show");
	},
	"click .remove": function (e, value, row, index) {
		console.log("Delete billing code: " + JSON.stringify(row));
		delItem(row.id, "billing_codes", "billing code");
	},
};

// detail formatter for billing codes
function detailFormatter_billing(index, row) {
	var html = [];
	html.push('<div class="container-fluid">');
	html.push('<div class="row">');

	// Main nomenclature code section
	html.push('<div class="col-md-6">');
	html.push(
		'<h6 class="text-primary"><i class="fas fa-star me-2"></i>Main Nomenclature Code</h6>'
	);
	html.push(
		"<p><strong>Code:</strong> " + checkIfNull(row.nomen_code, "N/A") + "</p>"
	);
	html.push(
		"<p><strong>Description:</strong> " +
			checkIfNull(row.nomen_desc_fr, "N/A") +
			"</p>"
	);
	html.push(
		"<p><strong>Fee:</strong> " + checkIfNull(row.fee, "€0.00") + "</p>"
	);
	html.push(
		"<p><strong>Fee Code:</strong> " + checkIfNull(row.feecode, "N/A") + "</p>"
	);
	html.push("</div>");

	// Secondary nomenclature code section
	html.push('<div class="col-md-6">');
	if (row.secondary_nomen_code) {
		html.push(
			'<h6 class="text-success"><i class="fas fa-plus-circle me-2"></i>Secondary Nomenclature Code</h6>'
		);
		html.push("<p><strong>Code:</strong> " + row.secondary_nomen_code + "</p>");
		html.push(
			"<p><strong>Description:</strong> " +
				checkIfNull(row.secondary_nomen_desc_fr, "N/A") +
				"</p>"
		);
		html.push(
			"<p><strong>Fee:</strong> €" +
				parseFloat(row.secondary_fee || 0).toFixed(2) +
				"</p>"
		);
		html.push(
			"<p><strong>Fee Code:</strong> " +
				checkIfNull(row.secondary_feecode, "N/A") +
				"</p>"
		);
	} else {
		html.push(
			'<h6 class="text-muted"><i class="fas fa-plus-circle me-2"></i>No Secondary Code</h6>'
		);
		html.push(
			'<p class="text-muted">This billing code does not have a secondary nomenclature code.</p>'
		);
	}
	html.push("</div>");

	html.push("</div>"); // end row

	// Additional information row
	html.push('<div class="row mt-3">');
	html.push('<div class="col-md-6">');
	html.push(
		'<h6 class="text-info"><i class="fas fa-info-circle me-2"></i>Additional Information</h6>'
	);
	html.push(
		"<p><strong>Laterality:</strong> " +
			checkIfNull(row.laterality, "N/A") +
			"</p>"
	);
	html.push(
		"<p><strong>Quantity:</strong> " + checkIfNull(row.quantity, "1") + "</p>"
	);
	html.push(
		'<p><strong>Status:</strong> <span class="badge bg-secondary">' +
			checkIfNull(row.status, "draft") +
			"</span></p>"
	);
	html.push(
		"<p><strong>Note:</strong> " + checkIfNull(row.note, "None") + "</p>"
	);
	html.push("</div>");

	// Fee calculation section
	html.push('<div class="col-md-6">');
	html.push(
		'<h6 class="text-warning"><i class="fas fa-calculator me-2"></i>Fee Calculation</h6>'
	);

	const mainFee = parseFloat(row.fee?.replace("€", "") || 0);
	const secondaryFee = parseFloat(row.secondary_fee || 0);
	const quantity = parseInt(row.quantity || 1);
	const totalPerUnit = mainFee + secondaryFee;
	const totalAmount = totalPerUnit * quantity;

	html.push('<div class="card border-light">');
	html.push('<div class="card-body py-2">');
	html.push('<div class="d-flex justify-content-between small">');
	html.push("<span>Main Fee:</span>");
	html.push('<span class="fw-bold">€' + mainFee.toFixed(2) + "</span>");
	html.push("</div>");

	if (secondaryFee > 0) {
		html.push('<div class="d-flex justify-content-between small">');
		html.push("<span>Secondary Fee:</span>");
		html.push('<span class="fw-bold">€' + secondaryFee.toFixed(2) + "</span>");
		html.push("</div>");
		html.push('<hr class="my-1">');
		html.push('<div class="d-flex justify-content-between small">');
		html.push("<span>Per Unit Total:</span>");
		html.push('<span class="fw-bold">€' + totalPerUnit.toFixed(2) + "</span>");
		html.push("</div>");
	}

	if (quantity > 1) {
		html.push('<div class="d-flex justify-content-between small">');
		html.push("<span>Quantity:</span>");
		html.push('<span class="fw-bold">×' + quantity + "</span>");
		html.push("</div>");
		html.push('<hr class="my-1">');
	}

	html.push('<div class="d-flex justify-content-between">');
	html.push('<span class="fw-bold">Total Amount:</span>');
	html.push(
		'<span class="fw-bold text-success">€' + totalAmount.toFixed(2) + "</span>"
	);
	html.push("</div>");
	html.push("</div>");
	html.push("</div>");
	html.push("</div>");

	// Audit information row
	html.push('<div class="col-md-12 mt-3">');
	html.push(
		'<h6 class="text-secondary"><i class="fas fa-history me-2"></i>Audit Information</h6>'
	);
	html.push('<div class="row">');
	html.push('<div class="col-md-6">');
	html.push(
		'<p class="small"><strong>Created by:</strong> ' +
			checkIfNull(row.created_by_name, "N/A") +
			"</p>"
	);
	html.push(
		'<p class="small"><strong>Created on:</strong> ' +
			checkIfNull(row.created_on, "N/A") +
			"</p>"
	);
	html.push("</div>");
	html.push('<div class="col-md-6">');
	html.push(
		'<p class="small"><strong>Modified by:</strong> ' +
			checkIfNull(row.modified_by_name, "N/A") +
			"</p>"
	);
	html.push(
		'<p class="small"><strong>Modified on:</strong> ' +
			checkIfNull(row.modified_on, "N/A") +
			"</p>"
	);
	html.push("</div>");
	html.push("</div>");
	html.push("</div>");

	html.push("</div>"); // end additional info row
	html.push("</div>"); // end container
	return html.join("");
}

// update billing summary
function updateBillingSummary(billingData) {
	let totalCodes = billingData.length;
	let codesWithSecondary = 0;
	let totalMainFees = 0;
	let totalSecondaryFees = 0;

	// Enhanced calculation including secondary fees
	let totalAmount = billingData.reduce((sum, item) => {
		const mainFee = parseFloat(item.fee?.replace("€", "") || 0);
		const secondaryFee = parseFloat(item.secondary_fee || 0);
		const quantity = parseInt(item.quantity || 1);

		// Track separate totals for summary
		totalMainFees += mainFee * quantity;
		totalSecondaryFees += secondaryFee * quantity;

		// Count codes with secondary nomenclature
		if (item.secondary_nomen_code) {
			codesWithSecondary++;
		}

		return sum + (mainFee + secondaryFee) * quantity;
	}, 0);

	// Update main summary display
	$("#totalCodes").text(totalCodes);
	$("#totalAmount").text("€" + totalAmount.toFixed(2));

	// Enhanced summary with secondary code information
	const summaryHtml = `
		<div class="row g-4">
			<div class="col-md-6">
				<div class="card border-0 bg-light">
					<div class="card-body p-4">
						<div class="d-flex flex-column gap-3">
							<div class="d-flex justify-content-between align-items-center">
								<h5 class="mb-0 fw-bold">Total Codes:</h5>
								<span class="badge bg-primary fs-6 px-3 py-2">${totalCodes}</span>
							</div>
							<div class="d-flex justify-content-between align-items-center">
								<h5 class="mb-0 fw-bold">With Secondary:</h5>
								<span class="badge bg-info fs-6 px-3 py-2">${codesWithSecondary}</span>
							</div>
							<div class="d-flex justify-content-between align-items-center">
								<h5 class="mb-0 fw-bold">Total Amount:</h5>
								<span class="badge bg-success fs-5 px-3 py-2">€${totalAmount.toFixed(2)}</span>
							</div>
							<div class="text-center mt-3">
								<a href="${window.location.origin}/${APP_NAME}/payment/${
		typeof wlId !== "undefined" ? wlId : window.wlId || ""
	}" class="btn btn-warning btn-lg shadow-sm">
									<i class="fas fa-dollar-sign me-2"></i>Go to Payment
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="col-md-6">
				<div class="card border-0 bg-light">
					<div class="card-body p-4">
						<h6 class="card-title mb-3 fw-bold text-primary">Fee Breakdown</h6>
						<div class="d-flex justify-content-between mb-2">
							<span class="fw-medium">Main Fees:</span>
							<span class="fw-bold">€${totalMainFees.toFixed(2)}</span>
						</div>
						<div class="d-flex justify-content-between mb-2">
							<span class="fw-medium">Secondary Fees:</span>
							<span class="fw-bold">€${totalSecondaryFees.toFixed(2)}</span>
						</div>
						<hr class="my-3">
						<div class="d-flex justify-content-between mb-3">
							<span class="fw-bold fs-6">Total:</span>
							<span class="fw-bold text-success fs-6">€${totalAmount.toFixed(2)}</span>
						</div>
						<div class="d-grid gap-2">
							<div class="btn-group" role="group">
								<button type="button" class="btn btn-outline-primary"
									onclick="exportBilling('pdf')">
									<i class="fas fa-file-pdf me-1"></i>Export PDF
								</button>
								<button type="button" class="btn btn-outline-success"
									onclick="exportBilling('excel')">
									<i class="fas fa-file-excel me-1"></i>Export Excel
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

	// Update the billing summary container
	$("#billingSummary").html(summaryHtml);
}

// search nomenclature codes
function searchNomenclature(query) {
	console.log("=== searchNomenclature called with query:", query);

	if (!query || query.length < 3) {
		$("#nomenSearchResults").hide();
		return;
	}

	// Determine if query is numeric (code) or text (description)
	const params = new URLSearchParams();
	if (/^\d+$/.test(query)) {
		params.append("code", query);
	} else {
		params.append("description", query);
	}
	params.append("limit", "20");

	const apiUrl =
		HOSTURL + "/" + APP_NAME + "/api/nomenclature/search?" + params.toString();
	console.log("API URL:", apiUrl);

	$.ajax({
		url: apiUrl,
		method: "GET",
		dataType: "json", // Explicitly set expected data type
		success: function (response) {
			console.log("=== API SUCCESS ===");
			console.log("Full response:", response);
			console.log("Response type:", typeof response);
			console.log("Response keys:", Object.keys(response || {}));

			// Extract data from response - Enhanced for the exact API format
			let resultsData = [];

			// Handle the exact format: {"status": "success", "message": "...", "code": 200, "data": [...], "meta": {...}}
			if (response && typeof response === "object") {
				console.log("Analyzing response structure:");
				console.log("- response.status:", response.status);
				console.log("- response.message:", response.message);
				console.log("- response.code:", response.code);
				console.log("- response.data type:", typeof response.data);
				console.log("- response.data is array:", Array.isArray(response.data));
				console.log("- response.meta:", response.meta);

				// Primary format check - exact match for the user's format
				if (response.status === "success" && Array.isArray(response.data)) {
					resultsData = response.data;
					console.log(
						"✅ Success format detected - Using response.data (found " +
							resultsData.length +
							" items)"
					);
					console.log("Response meta:", response.meta);
				}
				// Fallback: check for data field regardless of status
				else if (Array.isArray(response.data)) {
					resultsData = response.data;
					console.log(
						"✅ Data array found - Using response.data (found " +
							resultsData.length +
							" items) [Status: " +
							response.status +
							"]"
					);
				}
				// Fallback: py4web format with items
				else if (Array.isArray(response.items)) {
					resultsData = response.items;
					console.log(
						"✅ py4web format - Using response.items (found " +
							resultsData.length +
							" items)"
					);
				}
				// Fallback: direct array response
				else if (Array.isArray(response)) {
					resultsData = response;
					console.log(
						"✅ Direct array - Using response directly (found " +
							resultsData.length +
							" items)"
					);
				}
				// No valid format found
				else {
					console.error("❌ Could not extract data from response");
					console.log("Response structure debug:");
					console.log("- response type:", typeof response);
					console.log("- response keys:", Object.keys(response));
					console.log("- response.data:", response.data);
					console.log("- response.items:", response.items);
					console.log("- is array:", Array.isArray(response));
					resultsData = [];
				}
			} else {
				console.error("❌ Invalid response - not an object:", response);
				resultsData = [];
			}

			console.log("Final results data:", resultsData);
			console.log(
				"Sample item:",
				resultsData.length > 0 ? resultsData[0] : "No items"
			);
			console.log(
				"About to call displayNomenclatureResults with",
				resultsData.length,
				"items"
			);

			// Call display function with enhanced error handling
			try {
				displayNomenclatureResults(resultsData);
				console.log("✅ displayNomenclatureResults completed successfully");
			} catch (error) {
				console.error("❌ Error in displayNomenclatureResults:", error);
				console.error("Error stack:", error.stack);
			}
		},
		error: function (xhr, status, error) {
			console.error("=== API ERROR ===");
			console.error("Status:", status);
			console.error("Error:", error);
			console.error("Response text:", xhr.responseText);
			console.error("XHR status:", xhr.status);
			console.error("XHR ready state:", xhr.readyState);

			// Try to parse error response
			try {
				const errorResponse = JSON.parse(xhr.responseText);
				console.error("Parsed error response:", errorResponse);
				bootbox.alert(
					"Error searching nomenclature codes: " +
						(errorResponse.message || error)
				);
			} catch (parseError) {
				console.error("Could not parse error response:", parseError);
				bootbox.alert("Error searching nomenclature codes: " + error);
			}
		},
	});
}

// display nomenclature search results
function displayNomenclatureResults(results) {
	console.log("=== displayNomenclatureResults called ===");
	console.log("Results parameter:", results);
	console.log("Results type:", typeof results);
	console.log("Results is array:", Array.isArray(results));
	console.log("Results length:", results ? results.length : "N/A");

	// Ensure we have an array
	if (!Array.isArray(results)) {
		console.error("❌ Results is not an array, converting...");
		results = [];
	}

	// Find table body with multiple strategies
	let tbody = $("#nomenSearchTableBody");
	console.log("Strategy 1 - Direct ID search:", tbody.length);

	if (tbody.length === 0) {
		console.log("Trying alternative DOM search strategies...");

		// Strategy 2: Search within the modal
		tbody = $("#billCodeModal").find("#nomenSearchTableBody");
		console.log("Strategy 2 - Within modal:", tbody.length);

		if (tbody.length === 0) {
			// Strategy 3: Search for any tbody in the modal
			tbody = $("#billCodeModal").find("tbody");
			console.log("Strategy 3 - Any tbody in modal:", tbody.length);

			if (tbody.length === 0) {
				// Strategy 4: Search globally for nomenclature table
				tbody = $("table")
					.find("tbody")
					.filter(function () {
						return (
							$(this)
								.closest("table")
								.find("thead th")
								.text()
								.indexOf("Code") >= 0
						);
					});
				console.log("Strategy 4 - Global search:", tbody.length);

				if (tbody.length === 0) {
					console.error(
						"❌ Could not find table body element with any strategy!"
					);
					console.log("Available elements in modal:");
					$("#billCodeModal")
						.find("*")
						.each(function () {
							if (this.id) console.log("- Element with ID:", this.id);
						});
					return;
				}
			}
		}
	}

	console.log("✅ Found tbody element:", tbody[0]);

	// Clear existing content
	tbody.empty();
	console.log("✅ Cleared tbody content");

	if (results.length === 0) {
		console.log("No results, showing 'No results found' message");
		tbody.append(
			'<tr><td colspan="5" class="text-center text-muted">No results found</td></tr>'
		);
	} else {
		console.log("Processing", results.length, "results...");

		results.forEach(function (item, index) {
			console.log(`Processing item ${index + 1}:`, item);

			// Extract data with enhanced fallbacks for FastAPI format
			const code = item.nomen_code || item.code || "N/A";
			const descFr =
				item.nomen_desc_fr ||
				item.desc_fr ||
				item.description_fr ||
				item.description ||
				"";
			const descNl =
				item.nomen_desc_nl || item.desc_nl || item.description_nl || "";
			const description = descFr || descNl || "No description";
			const fee = item.fee || item.tarif || 0;
			const feecode = item.feecode || item.fee_code || 0;

			console.log(`Item ${index + 1} extracted:`, {
				code,
				description: description.substring(0, 50) + "...",
				fee,
				feecode,
			});

			// Create table row with enhanced data attributes
			const row = $(`
				<tr>
					<td><strong>${code}</strong></td>
					<td title="${description}">${
				description.length > 80
					? description.substring(0, 80) + "..."
					: description
			}</td>
					<td><span class="badge bg-success">${
						fee ? "€" + parseFloat(fee).toFixed(2) : "N/A"
					}</span></td>
					<td><span class="badge bg-info">${feecode}</span></td>
					<td>
						<div class="btn-group" role="group">
							<button class="btn btn-sm btn-primary select-main-code" 
									data-code="${code}" 
									data-desc="${description}" 
									data-fee="${fee || 0}" 
									data-feecode="${feecode || 0}"
									title="Select as main procedure code">
								<i class="fas fa-star"></i> Main
							</button>
							<button class="btn btn-sm btn-outline-secondary select-secondary-code" 
									data-code="${code}" 
									data-desc="${description}" 
									data-fee="${fee || 0}" 
									data-feecode="${feecode || 0}"
									title="Select as secondary procedure code">
								<i class="fas fa-plus"></i> Secondary
							</button>
						</div>
					</td>
				</tr>
			`);

			tbody.append(row);
			console.log(`✅ Added row ${index + 1} to table`);
		});
	}

	// Show results with multiple strategies
	let resultsDiv = $("#nomenSearchResults");
	console.log("Found results div:", resultsDiv.length);

	if (resultsDiv.length === 0) {
		console.log("Trying alternative strategies to find results div...");
		resultsDiv = $("#billCodeModal").find("#nomenSearchResults");
		console.log("Alternative search:", resultsDiv.length);

		if (resultsDiv.length === 0) {
			console.error("❌ Could not find #nomenSearchResults element!");
			console.log("Available elements with 'search' in ID:");
			$("[id*='search']").each(function () {
				console.log("- Found element:", this.id);
			});
			return;
		}
	}

	// Force show the results div
	resultsDiv.show().css("display", "block");
	console.log("✅ Results div should now be visible");
	console.log("Results div display style:", resultsDiv.css("display"));
	console.log("Results div is visible:", resultsDiv.is(":visible"));

	// Scroll to results if needed
	if (resultsDiv.is(":visible")) {
		resultsDiv[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
		console.log("✅ Scrolled to results");
	}

	console.log("=== displayNomenclatureResults completed ===");
}

// DEBUGGING: Test if JavaScript file is loaded
console.log("MD_BT.JS LOADED - billing combo debugging enabled");

// load billing combos
function loadBillingCombos() {
	console.log("=== loadBillingCombos CALLED ===");
	$.ajax({
		url: HOSTURL + "/" + APP_NAME + "/api/billing_combo",
		method: "GET",
		dataType: "json", // Ensure response is parsed as JSON
		data: {
			is_active: true,
			view: "all", // MD view should show all combos for medical usage
		},
		success: function (response) {
			console.log("=== AJAX SUCCESS ===");
			console.log("Full response:", response);
			console.log("response.items:", response.items);
			console.log(
				"About to call displayBillingCombos with:",
				response.items || []
			);
			displayBillingCombos(response.items || []);
		},
		error: function (xhr, status, error) {
			console.error("Error loading billing combos:", error);
			bootbox.alert("Error loading billing combos. Please try again.");
		},
	});
}

// Global variable to store combo data to avoid HTML attribute corruption
let loadedCombos = [];

// display billing combos
function displayBillingCombos(combos) {
	console.log("=== displayBillingCombos START ===");
	console.log("displayBillingCombos called with:", combos);
	console.log(
		"Number of combos received:",
		combos ? combos.length : "undefined"
	);

	// Store combos in global variable for reliable access
	loadedCombos = combos;

	let tbody = $("#comboTableBody");
	console.log("DOM element #comboTableBody found:", tbody.length > 0);
	console.log("DOM element:", tbody);

	tbody.empty();

	if (combos.length === 0) {
		console.log("No combos found, adding 'No active combos found' message");
		tbody.append(
			'<tr><td colspan="4" class="text-center">No active combos found</td></tr>'
		);
	} else {
		console.log("Processing", combos.length, "combos...");
		combos.forEach(function (combo) {
			console.log("Processing combo:", combo);
			console.log("combo.combo_codes raw:", combo.combo_codes);
			console.log("typeof combo.combo_codes:", typeof combo.combo_codes);

			let codes = [];
			try {
				// Use robust parsing logic to handle Python-style JSON
				if (!combo.combo_codes || combo.combo_codes === "[]") {
					codes = [];
				} else if (typeof combo.combo_codes === "string") {
					try {
						// First attempt: direct JSON parse
						codes = JSON.parse(combo.combo_codes);
						console.log("Successfully parsed with JSON.parse:", codes);
					} catch (e) {
						console.log(
							"Direct JSON parse failed, attempting JavaScript evaluation..."
						);

						// Replace Python literals with JavaScript equivalents
						let jsCode = combo.combo_codes
							.replace(/True/g, "true")
							.replace(/False/g, "false")
							.replace(/None/g, "null");

						try {
							// Use eval in a safe way (since this is controlled data from our own database)
							codes = eval("(" + jsCode + ")");
							console.log("Successfully parsed with eval:", codes);
						} catch (evalError) {
							console.error("Eval parsing failed:", evalError);
							throw evalError;
						}
					}
				} else {
					codes = combo.combo_codes;
				}

				// Process codes for display - handle both old and new formats
				let displayCodes = [];
				if (Array.isArray(codes)) {
					codes.forEach((code) => {
						if (typeof code === "number") {
							// Old format: simple integer code
							displayCodes.push(code.toString());
						} else if (typeof code === "object" && code.nomen_code) {
							// New format: object with potential secondary codes
							if (code.secondary_nomen_code) {
								displayCodes.push(
									`${code.nomen_code}+${code.secondary_nomen_code}`
								);
							} else {
								displayCodes.push(code.nomen_code.toString());
							}
						} else {
							// Fallback
							displayCodes.push(code.toString());
						}
					});
					codes = displayCodes;
				}
			} catch (e) {
				console.error(
					"Error parsing combo codes in displayBillingCombos:",
					e,
					"Raw value:",
					combo.combo_codes
				);
				codes = [];
			}

			let row = $("<tr>");
			row.append("<td><strong>" + combo.combo_name + "</strong></td>");
			row.append(
				'<td><span class="badge bg-secondary">' +
					combo.specialty +
					"</span></td>"
			);
			row.append("<td>" + codes.join(", ") + "</td>");

			// Store only the combo ID in data attribute, retrieve full data from loadedCombos array
			row.append(
				'<td><button class="btn btn-sm btn-success select-combo" data-combo-id="' +
					combo.id +
					'">Select</button></td>'
			);
			tbody.append(row);
			console.log("Added row for combo:", combo.combo_name);
		});
		console.log(
			"Finished processing all combos. Final tbody content:",
			tbody.html()
		);
	}
	console.log("=== displayBillingCombos END ===");
}

// apply billing combo
function applyBillingCombo(comboId, note) {
	console.log("=== Starting Combo Application ===");
	console.log("Applying combo ID:", comboId, "with note:", note);

	// Find the combo data from the loadedCombos array
	let combo = loadedCombos.find((c) => c.id == comboId);
	if (!combo) {
		console.error("Could not find combo with ID:", comboId);
		bootbox.alert(
			"Error: Could not find combo data. Please refresh and try again."
		);
		return;
	}

	console.log("Found combo data:", combo);

	// Parse combo codes using the same robust logic as the preview
	let codes = [];
	try {
		let comboCodes = combo.combo_codes;
		console.log("Raw combo codes:", comboCodes);

		if (!comboCodes || comboCodes === "[]") {
			codes = [];
		} else if (typeof comboCodes === "string") {
			try {
				// First attempt: direct JSON parse
				codes = JSON.parse(comboCodes);
				console.log("Successfully parsed codes with JSON.parse:", codes);
			} catch (e) {
				console.log(
					"Direct JSON parse failed, attempting JavaScript evaluation..."
				);

				// Replace Python literals with JavaScript equivalents
				let jsCode = comboCodes
					.replace(/True/g, "true")
					.replace(/False/g, "false")
					.replace(/None/g, "null");

				try {
					// Use eval in a safe way (since this is controlled data from our own database)
					codes = eval("(" + jsCode + ")");
					console.log("Successfully parsed codes with eval:", codes);
				} catch (evalError) {
					console.error("Eval parsing failed:", evalError);
					throw evalError;
				}
			}
		} else {
			codes = comboCodes;
		}
	} catch (e) {
		console.error("Error parsing combo codes:", e);
		bootbox.alert("Error: Could not parse combo codes. Please try again.");
		return;
	}

	if (!Array.isArray(codes) || codes.length === 0) {
		bootbox.alert("Error: No valid codes found in this combo.");
		return;
	}

	console.log("Parsed codes array:", codes);

	// Prepare individual billing code requests
	let billingRequests = [];

	codes.forEach((code, index) => {
		let billingData = {
			id_auth_user: patientId,
			id_worklist: wlId,
			note: note || "",
		};

		// Set date_performed from worklist if available
		if (
			typeof wlObj !== "undefined" &&
			wlObj.worklist &&
			wlObj.worklist.requested_time
		) {
			let wlDate = new Date(wlObj.worklist.requested_time);
			billingData.date_performed = wlDate.toISOString().split("T")[0];
		} else {
			billingData.date_performed = new Date().toISOString().split("T")[0];
		}

		if (typeof code === "number") {
			// Old format: simple integer code
			billingData.nomen_code = code;
		} else if (typeof code === "object" && code.nomen_code) {
			// New format: object with potential secondary codes
			billingData.nomen_code = parseInt(code.nomen_code);
			billingData.nomen_desc_fr = code.nomen_desc_fr || null;

			// Clean and convert fee fields - handle "N/A" values
			billingData.fee =
				code.fee === "N/A" || code.fee === "" || code.fee === undefined
					? null
					: parseFloat(code.fee) || null;
			billingData.feecode =
				code.feecode === "N/A" ||
				code.feecode === "" ||
				code.feecode === undefined
					? null
					: parseInt(code.feecode) || null;

			// Add secondary code fields if present
			if (code.secondary_nomen_code) {
				// Convert secondary_nomen_code to integer
				billingData.secondary_nomen_code = parseInt(code.secondary_nomen_code);
				billingData.secondary_nomen_desc_fr =
					code.secondary_nomen_desc_fr || null;

				// Clean and convert secondary fee fields - handle "N/A" values
				billingData.secondary_fee =
					code.secondary_fee === "N/A" ||
					code.secondary_fee === "" ||
					code.secondary_fee === undefined
						? null
						: parseFloat(code.secondary_fee) || null;
				billingData.secondary_feecode =
					code.secondary_feecode === "N/A" ||
					code.secondary_feecode === "" ||
					code.secondary_feecode === undefined
						? null
						: parseInt(code.secondary_feecode) || null;
			}
		} else {
			// Fallback: treat as simple code
			billingData.nomen_code = parseInt(code);
		}

		console.log(`Prepared billing request ${index + 1}:`, billingData);
		billingRequests.push(billingData);
	});

	console.log("Total billing requests to make:", billingRequests.length);

	// Show progress indication
	let progressMessage = `Applying combo "${combo.combo_name}" with ${billingRequests.length} codes...`;
	console.log("INFO: " + progressMessage);

	// Apply each code individually
	let completedRequests = 0;
	let failedRequests = 0;
	let errors = [];

	billingRequests.forEach((billingData, index) => {
		$.ajax({
			url: HOSTURL + "/" + APP_NAME + "/api/billing_codes",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify(billingData),
			success: function (response) {
				completedRequests++;
				console.log(
					`Successfully applied code ${index + 1}/${billingRequests.length}:`,
					response
				);

				// Check if all requests are complete
				if (completedRequests + failedRequests === billingRequests.length) {
					handleComboApplicationComplete(
						completedRequests,
						failedRequests,
						errors,
						combo.combo_name
					);
				}
			},
			error: function (xhr, status, error) {
				failedRequests++;
				let errorMsg = "Unknown error";
				if (xhr.responseJSON && xhr.responseJSON.message) {
					errorMsg = xhr.responseJSON.message;
				}
				errors.push(`Code ${billingData.nomen_code}: ${errorMsg}`);
				console.error(
					`Failed to apply code ${index + 1}/${billingRequests.length}:`,
					error,
					errorMsg
				);

				// Check if all requests are complete
				if (completedRequests + failedRequests === billingRequests.length) {
					handleComboApplicationComplete(
						completedRequests,
						failedRequests,
						errors,
						combo.combo_name
					);
				}
			},
		});
	});
}

// Handle completion of combo application
function handleComboApplicationComplete(
	completedRequests,
	failedRequests,
	errors,
	comboName
) {
	console.log("=== Combo Application Complete ===");
	console.log("Completed:", completedRequests, "Failed:", failedRequests);

	if (failedRequests === 0) {
		// All codes applied successfully
		console.log(
			'SUCCESS: Successfully applied combo "' +
				comboName +
				'" with ' +
				completedRequests +
				" codes!"
		);
		$("#billComboModal").modal("hide");
		$bill_tbl.bootstrapTable("refresh");
	} else if (completedRequests > 0) {
		// Partial success
		let message = `Combo "${comboName}" partially applied.\n`;
		message += `Success: ${completedRequests} codes\n`;
		message += `Failed: ${failedRequests} codes\n\n`;
		message += "Failed codes:\n" + errors.join("\n");

		bootbox.alert(message, function () {
			$("#billComboModal").modal("hide");
			$bill_tbl.bootstrapTable("refresh");
		});
	} else {
		// Complete failure
		let message = `Failed to apply combo "${comboName}".\n\n`;
		message += "Errors:\n" + errors.join("\n");
		bootbox.alert(message);
	}
}

// export billing data
function exportBilling(format) {
	// Get current billing data from the table
	const tableData = $("#bill_tbl").bootstrapTable("getData");

	if (!tableData || tableData.length === 0) {
		bootbox.alert("No billing data to export!");
		return;
	}

	if (format === "pdf") {
		exportBillingToPDF(tableData);
	} else if (format === "excel") {
		exportBillingToExcel(tableData);
	}
}

/**
 * Export billing data to PDF using pdfmake
 */
function exportBillingToPDF(billingData) {
	try {
		// Prepare data for PDF
		const tableBody = [
			// Header row
			[
				{ text: "Date", style: "tableHeader" },
				{ text: "Main Code", style: "tableHeader" },
				{ text: "Main Description", style: "tableHeader" },
				{ text: "Main Fee", style: "tableHeader" },
				{ text: "Secondary Code", style: "tableHeader" },
				{ text: "Secondary Description", style: "tableHeader" },
				{ text: "Secondary Fee", style: "tableHeader" },
				{ text: "Total Fee", style: "tableHeader" },
				{ text: "Laterality", style: "tableHeader" },
				{ text: "Qty", style: "tableHeader" },
				{ text: "Status", style: "tableHeader" },
			],
		];

		// Add data rows
		billingData.forEach((item) => {
			const mainFee = parseFloat(item.fee?.replace("€", "") || 0);
			const secondaryFee = parseFloat(item.secondary_fee || 0);
			const quantity = parseInt(item.quantity || 1);
			const totalFee = (mainFee + secondaryFee) * quantity;

			tableBody.push([
				item.date_performed || "-",
				item.nomen_code || "-",
				item.nomen_desc_fr || "-",
				item.fee || "€0.00",
				item.secondary_nomen_code || "-",
				item.secondary_nomen_desc_fr || "-",
				secondaryFee > 0 ? `€${secondaryFee.toFixed(2)}` : "-",
				`€${totalFee.toFixed(2)}`,
				item.laterality || "-",
				item.quantity || "1",
				item.status || "draft",
			]);
		});

		// Calculate totals
		const totalAmount = billingData.reduce((sum, item) => {
			const mainFee = parseFloat(item.fee?.replace("€", "") || 0);
			const secondaryFee = parseFloat(item.secondary_fee || 0);
			const quantity = parseInt(item.quantity || 1);
			return sum + (mainFee + secondaryFee) * quantity;
		}, 0);

		const codesWithSecondary = billingData.filter(
			(item) => item.secondary_nomen_code
		).length;

		// PDF document definition
		const docDefinition = {
			pageSize: "A4",
			pageOrientation: "landscape",
			pageMargins: [40, 60, 40, 60],
			content: [
				{
					text: "Billing Summary Report",
					style: "header",
					alignment: "center",
					margin: [0, 0, 0, 20],
				},
				{
					columns: [
						{
							text: `Generated: ${new Date().toLocaleDateString()}`,
							style: "subheader",
						},
						{
							text: `Total Codes: ${billingData.length} | With Secondary: ${codesWithSecondary}`,
							style: "subheader",
							alignment: "right",
						},
					],
					margin: [0, 0, 0, 20],
				},
				{
					table: {
						headerRows: 1,
						widths: [
							"auto",
							"auto",
							"*",
							"auto",
							"auto",
							"*",
							"auto",
							"auto",
							"auto",
							"auto",
							"auto",
						],
						body: tableBody,
					},
					layout: {
						fillColor: function (rowIndex) {
							return rowIndex === 0
								? "#cccccc"
								: rowIndex % 2 === 0
								? "#f9f9f9"
								: null;
						},
					},
				},
				{
					text: `Total Amount: €${totalAmount.toFixed(2)}`,
					style: "total",
					alignment: "right",
					margin: [0, 20, 0, 0],
				},
			],
			styles: {
				header: {
					fontSize: 18,
					bold: true,
				},
				subheader: {
					fontSize: 12,
					bold: true,
				},
				tableHeader: {
					bold: true,
					fontSize: 10,
					color: "black",
				},
				total: {
					fontSize: 14,
					bold: true,
					color: "#2e7d32",
				},
			},
			defaultStyle: {
				fontSize: 8,
			},
		};

		// Generate and download PDF
		if (typeof pdfMake !== "undefined") {
			pdfMake
				.createPdf(docDefinition)
				.download(
					`billing_report_${new Date().toISOString().split("T")[0]}.pdf`
				);
			showNotification("PDF export completed successfully!", "success");
		} else {
			console.error("pdfMake is not loaded");
			bootbox.alert(
				"PDF export library not available. Please ensure pdfMake is loaded."
			);
		}
	} catch (error) {
		console.error("PDF export error:", error);
		bootbox.alert("Error generating PDF: " + error.message);
	}
}

/**
 * Export billing data to Excel/CSV format
 */
function exportBillingToExcel(billingData) {
	try {
		// Prepare CSV data
		const headers = [
			"Date",
			"Main Code",
			"Main Description",
			"Main Fee",
			"Secondary Code",
			"Secondary Description",
			"Secondary Fee",
			"Total Fee",
			"Laterality",
			"Quantity",
			"Status",
			"Note",
		];

		// Convert data to CSV format
		const csvData = [headers];

		billingData.forEach((item) => {
			const mainFee = parseFloat(item.fee?.replace("€", "") || 0);
			const secondaryFee = parseFloat(item.secondary_fee || 0);
			const quantity = parseInt(item.quantity || 1);
			const totalFee = (mainFee + secondaryFee) * quantity;

			csvData.push([
				item.date_performed || "",
				item.nomen_code || "",
				item.nomen_desc_fr || "",
				mainFee.toFixed(2),
				item.secondary_nomen_code || "",
				item.secondary_nomen_desc_fr || "",
				secondaryFee.toFixed(2),
				totalFee.toFixed(2),
				item.laterality || "",
				item.quantity || "1",
				item.status || "draft",
				item.note || "",
			]);
		});

		// Convert to CSV string
		const csvContent = csvData
			.map((row) =>
				row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
			)
			.join("\n");

		// Create and download file
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");

		if (link.download !== undefined) {
			const url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute(
				"download",
				`billing_report_${new Date().toISOString().split("T")[0]}.csv`
			);
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			showNotification("Excel/CSV export completed successfully!", "success");
		} else {
			throw new Error("Browser does not support file download");
		}
	} catch (error) {
		console.error("Excel export error:", error);
		bootbox.alert("Error generating Excel file: " + error.message);
	}
}

// ============================================================================
// Event Handlers for Billing
// ============================================================================

// Global functions needed for billing operations
// These functions must be global to be accessible from operateEvents_billing

/**
 * Update total fee calculation for billing modal
 * This function is global to be accessible from operateEvents_billing
 */
function updateTotalFee() {
	const mainFee = parseFloat(document.getElementById("billFee").value) || 0;
	const secondaryFee =
		parseFloat(document.getElementById("billSecondaryFee").value) || 0;
	const totalFee = mainFee + secondaryFee;

	$("#mainFeeDisplay").text("€" + mainFee.toFixed(2));
	$("#secondaryFeeDisplay").text("€" + secondaryFee.toFixed(2));
	$("#totalFeeDisplay").text("€" + totalFee.toFixed(2));
}

$(document).ready(function () {
	// Test DOM elements on page load
	console.log("Document ready - testing nomenclature elements");
	testNomenclatureElements();

	// Make test functions available globally for manual testing
	window.testNomenclatureElements = testNomenclatureElements;
	window.testWithRealData = testWithRealData;
	window.testAPICall = testAPICall;
	window.testDirectAPI = testDirectAPI;
	window.testWithUserProvidedData = testWithUserProvidedData;
	window.displayNomenclatureResults = displayNomenclatureResults;
	window.searchNomenclature = searchNomenclature;

	console.log("Test functions added to window object. You can call:");
	console.log("- window.testNomenclatureElements() // Test DOM elements");
	console.log("- window.testWithRealData() // Test display with sample data");
	console.log("- window.testAPICall() // Test search with query '105'");
	console.log("- window.testDirectAPI() // Test direct API call");
	console.log(
		"- window.testWithUserProvidedData() // Test with user's exact response"
	);
	console.log("- window.searchNomenclature('105') // Manual search");

	// Nomenclature search with debounce for autocomplete
	$("#nomenSearchBtn").on("click", function () {
		let query = $("#nomenSearchInput").val();
		searchNomenclature(query);
	});

	// Add autocomplete functionality - search after 3 characters with debounce
	let searchTimeout;
	$("#nomenSearchInput").on("input", function () {
		const query = $(this).val().trim();

		// Clear previous timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		// Hide results if less than 3 characters
		if (query.length < 3) {
			$("#nomenSearchResults").hide();
			return;
		}

		// Debounce search to avoid too many API calls
		searchTimeout = setTimeout(function () {
			searchNomenclature(query);
		}, 300);
	});

	$("#nomenSearchInput").on("keypress", function (e) {
		if (e.which === 13) {
			// Enter key
			let query = $(this).val();
			searchNomenclature(query);
		}
	});

	// Select nomenclature code
	$(document).on("click", ".select-nomen", function () {
		let code = $(this).data("code");
		let desc = $(this).data("desc");
		let fee = $(this).data("fee");
		let feecode = $(this).data("feecode");

		$("#billNomenCode").val(code);
		$("#billNomenDesc").val(desc);
		$("#billFee").val(fee);

		// Store feecode in a hidden field if it exists
		if ($("#billFeeCode").length === 0) {
			// Create hidden field for feecode if it doesn't exist
			$("#billCodeForm").append(
				'<input type="hidden" id="billFeeCode" name="feecode">'
			);
		}
		$("#billFeeCode").val(feecode);

		$("#nomenSearchResults").hide();
		$("#nomenSearchInput").val("");
	});

	/**
	 * Select nomenclature code as main procedure
	 * @param {Object} codeData - Nomenclature code data from search
	 */
	function selectMainCode(codeData) {
		document.getElementById("billNomenCode").value = codeData.nomen_code;
		document.getElementById("billNomenDesc").value = codeData.nomen_desc_fr;
		document.getElementById("billFee").value = codeData.fee || "";

		// Store feecode in hidden field
		if ($("#billFeeCode").length === 0) {
			$("#billCodeForm").append(
				'<input type="hidden" id="billFeeCode" name="feecode">'
			);
		}
		$("#billFeeCode").val(codeData.feecode);

		updateTotalFee();
		showNotification("Main code selected", "success");
		$("#nomenSearchResults").hide();
		$("#nomenSearchInput").val("");
	}

	/**
	 * Select nomenclature code as secondary procedure
	 * @param {Object} codeData - Nomenclature code data from search
	 */
	function selectSecondaryCode(codeData) {
		document.getElementById("billSecondaryNomenCode").value =
			codeData.nomen_code;
		document.getElementById("billSecondaryNomenDesc").value =
			codeData.nomen_desc_fr;
		document.getElementById("billSecondaryFee").value = codeData.fee || "";

		// Store secondary feecode in hidden field
		$("#billSecondaryFeeCode").val(codeData.feecode);

		document.getElementById("clearSecondaryBtn").style.display = "inline-block";
		updateTotalFee();
		showNotification("Secondary code selected", "success");
		$("#nomenSearchResults").hide();
		$("#nomenSearchInput").val("");
	}

	/**
	 * Clear secondary nomenclature code
	 */
	function clearSecondaryCode() {
		document.getElementById("billSecondaryNomenCode").value = "";
		document.getElementById("billSecondaryNomenDesc").value = "";
		document.getElementById("billSecondaryFee").value = "";
		document.getElementById("clearSecondaryBtn").style.display = "none";
		$("#billSecondaryFeeCode").val("");

		updateTotalFee();
		showNotification("Secondary code cleared", "info");
	}

	/**
	 * Enhanced form validation
	 */
	function validateBillingForm() {
		const mainCode = document.getElementById("billNomenCode").value;
		const secondaryCode = document.getElementById(
			"billSecondaryNomenCode"
		).value;

		// Main code is required
		if (!mainCode) {
			showNotification("Main nomenclature code is required", "error");
			return false;
		}

		// If secondary code is provided, it must be different from main
		if (secondaryCode && secondaryCode === mainCode) {
			showNotification(
				"Secondary code must be different from main code",
				"error"
			);
			return false;
		}

		return true;
	}

	/**
	 * Show notification message
	 */
	function showNotification(message, type) {
		// Use bootbox for notifications if available, otherwise console log
		if (typeof bootbox !== "undefined") {
			if (type === "error") {
				bootbox.alert(message);
			} else {
				// For success and info, we could use a more subtle notification
				console.log(type + ": " + message);
			}
		} else {
			console.log(type + ": " + message);
		}
	}

	// Load combos when modal opens
	$("#billComboModal").on("show.bs.modal", function () {
		console.log("=== Modal show.bs.modal event triggered ===");
		console.log("jQuery version:", $.fn.jquery);
		console.log("DOM ready:", document.readyState);
		loadBillingCombos();
	});

	// Select combo
	$(document).on("click", ".select-combo", function () {
		console.log("=== Combo Selection Clicked ===");
		let comboId = $(this).data("combo-id");
		console.log("comboId:", comboId);

		// Find the combo data from the loadedCombos array
		let combo = loadedCombos.find((c) => c.id == comboId);
		if (!combo) {
			console.error("Could not find combo with ID:", comboId);
			bootbox.alert(
				"Error: Could not find combo data. Please refresh and try again."
			);
			return;
		}

		console.log("Found combo:", combo);

		let comboName = combo.combo_name;
		let comboDesc = combo.combo_description || "";
		let comboCodes = combo.combo_codes;

		console.log("comboName:", comboName);
		console.log("comboDesc:", comboDesc);
		console.log("comboCodes raw:", comboCodes);
		console.log("typeof comboCodes:", typeof comboCodes);

		$("#selectedComboId").val(comboId);
		$("#comboPreviewTitle").text(comboName);
		$("#comboPreviewDesc").text(comboDesc || "No description available");

		// Display codes
		try {
			// Use robust parsing logic to handle Python-style JSON
			let codes = [];
			if (!comboCodes || comboCodes === "[]") {
				codes = [];
			} else if (typeof comboCodes === "string") {
				try {
					// First attempt: direct JSON parse
					codes = JSON.parse(comboCodes);
					console.log("Successfully parsed codes for preview:", codes);
				} catch (e) {
					console.log(
						"Direct JSON parse failed for preview, attempting JavaScript evaluation..."
					);

					// Replace Python literals with JavaScript equivalents
					let jsCode = comboCodes
						.replace(/True/g, "true")
						.replace(/False/g, "false")
						.replace(/None/g, "null");

					try {
						// Use eval in a safe way (since this is controlled data from our own database)
						codes = eval("(" + jsCode + ")");
						console.log("Successfully parsed preview codes with eval:", codes);
					} catch (evalError) {
						console.error("Eval parsing failed for preview:", evalError);
						throw evalError;
					}
				}
			} else {
				codes = comboCodes;
			}

			// Process codes for preview display - handle both old and new formats
			let displayCodes = [];
			if (Array.isArray(codes)) {
				codes.forEach((code) => {
					if (typeof code === "number") {
						// Old format: simple integer code
						displayCodes.push(code.toString());
					} else if (typeof code === "object" && code.nomen_code) {
						// New format: object with potential secondary codes
						if (code.secondary_nomen_code) {
							displayCodes.push(
								`${code.nomen_code} (+${code.secondary_nomen_code})`
							);
						} else {
							displayCodes.push(code.nomen_code.toString());
						}
					} else {
						// Fallback
						displayCodes.push(code.toString());
					}
				});
			}

			$("#comboPreviewCodes").html(
				"<strong>Codes:</strong> " + displayCodes.join(", ")
			);
		} catch (e) {
			console.error("Error parsing codes for preview:", e);
			console.error("Failed to parse comboCodes for preview:", comboCodes);
			$("#comboPreviewCodes").html("<strong>Codes:</strong> Invalid format");
		}

		console.log("Showing combo preview...");
		$("#comboPreview").show();
		$("#applyComboBtn").prop("disabled", false);
		console.log("=== End Combo Selection ===");
	});

	// Apply combo
	$("#applyComboBtn").on("click", function () {
		let comboId = $("#selectedComboId").val();
		let note = $("#comboNote").val();

		if (!comboId) {
			bootbox.alert("Please select a combo first.");
			return;
		}

		applyBillingCombo(comboId, note);
	});

	// Reset forms when modals close
	$("#billCodeModal").on("hidden.bs.modal", function () {
		document.getElementById("billCodeForm").reset();
		$("#nomenSearchResults").hide();
		$("#nomenSearchInput").val("");
		$("#methodBillCodeSubmit").val("POST");
		$("#billCodeModalLabel").html("Add Billing Code");
		$("#billCodeSubmit").html("Add Code");
	});

	$("#billComboModal").on("hidden.bs.modal", function () {
		document.getElementById("comboApplyForm").reset();
		$("#comboPreview").hide();
		$("#applyComboBtn").prop("disabled", true);
	});

	// Set default date from worklist when modal opens
	$("#billCodeModal").on("show.bs.modal", function () {
		// Set date_performed from worklist requested_time
		if (!$("#billDatePerformed").val()) {
			// Get the worklist requested_time and convert to date format
			if (
				typeof wlObj !== "undefined" &&
				wlObj.worklist &&
				wlObj.worklist.requested_time
			) {
				let wlDate = new Date(wlObj.worklist.requested_time);
				let dateString = wlDate.toISOString().split("T")[0];
				$("#billDatePerformed").val(dateString);
			} else {
				// Fallback to today's date
				$("#billDatePerformed").val(new Date().toISOString().split("T")[0]);
			}
		}
	});

	// Submit billing code form
	$("#billCodeForm").submit(function (e) {
		e.preventDefault();
		let dataStr = $(this).serializeJSON();
		let dataObj = JSON.parse(dataStr);
		let req = dataObj["methodBillCodeSubmit"];

		if (req == "POST") {
			delete dataObj["id"];
		}

		// Ensure required fields
		dataObj["id_auth_user"] = dataObj["id_auth_user"] || patientId;
		dataObj["id_worklist"] = dataObj["id_worklist"] || wlId;

		// Set date_performed from worklist if not set
		if (
			!dataObj["date_performed"] &&
			typeof wlObj !== "undefined" &&
			wlObj.worklist &&
			wlObj.worklist.requested_time
		) {
			let wlDate = new Date(wlObj.worklist.requested_time);
			dataObj["date_performed"] = wlDate.toISOString().split("T")[0];
		}

		// Clean up main fee fields - convert empty strings to null
		if (dataObj["fee"] === "" || dataObj["fee"] === undefined) {
			dataObj["fee"] = null;
		}
		if (dataObj["feecode"] === "" || dataObj["feecode"] === undefined) {
			dataObj["feecode"] = null;
		}

		// Convert main fee to number if it's a non-empty string
		if (dataObj["fee"] !== null && typeof dataObj["fee"] === "string") {
			const parsedMainFee = parseFloat(dataObj["fee"]);
			if (!isNaN(parsedMainFee)) {
				dataObj["fee"] = parsedMainFee;
			} else {
				dataObj["fee"] = null;
			}
		}

		// Convert main feecode to integer if it's a non-empty string
		if (dataObj["feecode"] !== null && typeof dataObj["feecode"] === "string") {
			const parsedMainFeecode = parseInt(dataObj["feecode"], 10);
			if (!isNaN(parsedMainFeecode)) {
				dataObj["feecode"] = parsedMainFeecode;
			} else {
				dataObj["feecode"] = null;
			}
		}

		// Clean up secondary nomenclature fields - convert empty strings to null
		const secondaryFields = [
			"secondary_nomen_code",
			"secondary_nomen_desc_fr",
			"secondary_nomen_desc_nl",
			"secondary_fee",
			"secondary_feecode",
		];

		secondaryFields.forEach((field) => {
			if (dataObj[field] === "" || dataObj[field] === undefined) {
				dataObj[field] = null;
			}
		});

		// Convert secondary_nomen_code to integer if it's a non-empty string
		if (
			dataObj["secondary_nomen_code"] !== null &&
			typeof dataObj["secondary_nomen_code"] === "string"
		) {
			const parsedCode = parseInt(dataObj["secondary_nomen_code"], 10);
			if (!isNaN(parsedCode)) {
				dataObj["secondary_nomen_code"] = parsedCode;
			} else {
				dataObj["secondary_nomen_code"] = null;
			}
		}

		// Convert secondary_fee to number if it's a non-empty string
		if (
			dataObj["secondary_fee"] !== null &&
			typeof dataObj["secondary_fee"] === "string"
		) {
			const parsedFee = parseFloat(dataObj["secondary_fee"]);
			if (!isNaN(parsedFee)) {
				dataObj["secondary_fee"] = parsedFee;
			} else {
				dataObj["secondary_fee"] = null;
			}
		}

		// Convert secondary_feecode to integer if it's a non-empty string
		if (
			dataObj["secondary_feecode"] !== null &&
			typeof dataObj["secondary_feecode"] === "string"
		) {
			const parsedFeecode = parseInt(dataObj["secondary_feecode"], 10);
			if (!isNaN(parsedFeecode)) {
				dataObj["secondary_feecode"] = parsedFeecode;
			} else {
				dataObj["secondary_feecode"] = null;
			}
		}

		delete dataObj["methodBillCodeSubmit"];
		dataStr = JSON.stringify(dataObj);

		// Validate data before submission
		if (!dataObj["nomen_code"]) {
			bootbox.alert("Main nomenclature code is required");
			return;
		}

		// If secondary code is provided, it must be different from main
		if (
			dataObj["secondary_nomen_code"] &&
			dataObj["secondary_nomen_code"] === dataObj["nomen_code"]
		) {
			bootbox.alert("Secondary code must be different from main code");
			return;
		}

		console.log("Submitting billing code data:", dataObj); // Debug log

		// Use crudp function following the same pattern as other forms
		crudp("billing_codes", dataObj["id"] || "0", req, dataStr)
			.then(function () {
				$bill_tbl.bootstrapTable("refresh");
			})
			.catch(function (error) {
				console.error("Error saving billing code:", error);
				bootbox.alert("Error saving billing code. Please try again.");
			});

		document.getElementById("billCodeForm").reset();
		$("#billCodeModal").modal("hide");
	});

	// Select nomenclature code as main
	$(document).on("click", ".select-main-code", function () {
		let code = $(this).data("code");
		let desc = $(this).data("desc");
		let fee = $(this).data("fee");
		let feecode = $(this).data("feecode");

		selectMainCode({
			nomen_code: code,
			nomen_desc_fr: desc,
			fee: fee,
			feecode: feecode,
		});
	});

	// Select nomenclature code as secondary
	$(document).on("click", ".select-secondary-code", function () {
		let code = $(this).data("code");
		let desc = $(this).data("desc");
		let fee = $(this).data("fee");
		let feecode = $(this).data("feecode");

		selectSecondaryCode({
			nomen_code: code,
			nomen_desc_fr: desc,
			fee: fee,
			feecode: feecode,
		});
	});

	// Clear secondary code button
	$(document).on("click", "#clearSecondaryBtn", function () {
		clearSecondaryCode();
	});

	// Add event listeners for fee updates
	$(document).on("input", "#billFee", function () {
		updateTotalFee();
	});

	$(document).on("input", "#billSecondaryFee", function () {
		updateTotalFee();
	});

	// Removed redundant form validation handler - validation is handled in main submit handler
});

// Test function to verify DOM elements
function testNomenclatureElements() {
	console.log("=== Testing Nomenclature DOM Elements ===");
	console.log(
		"Search input:",
		$("#nomenSearchInput").length,
		$("#nomenSearchInput")[0]
	);
	console.log(
		"Search button:",
		$("#nomenSearchBtn").length,
		$("#nomenSearchBtn")[0]
	);
	console.log(
		"Results div:",
		$("#nomenSearchResults").length,
		$("#nomenSearchResults")[0]
	);
	console.log(
		"Results table body:",
		$("#nomenSearchTableBody").length,
		$("#nomenSearchTableBody")[0]
	);
	console.log("Modal:", $("#billCodeModal").length, $("#billCodeModal")[0]);

	// Test if we can show/hide the results div
	console.log("Testing show/hide functionality:");
	let resultsDiv = $("#nomenSearchResults");
	console.log("Initial display state:", resultsDiv.css("display"));
	resultsDiv.show();
	console.log("After show():", resultsDiv.css("display"));
	resultsDiv.hide();
	console.log("After hide():", resultsDiv.css("display"));
	console.log("=== End DOM Test ===");
}

// Manual test function with real API data structure
function testWithRealData() {
	console.log("=== Testing with real API data ===");

	// Use the actual structure from the API response
	const testData = [
		{
			nomen_code: 105755,
			nomen_desc_fr:
				"Consultation au cabinet par un médecin spécialiste en ophtalmologie accrédité",
			nomen_desc_nl:
				"Raadpleging in de spreekkamer door een geaccrediteerde arts-specialist in de oftalmologie",
			fee: 32.85,
			feecode: 0,
		},
		{
			nomen_code: 105092,
			nomen_desc_fr:
				"Consultation avec l'élaboration d'un rapport écrit d'un bilan diagnostique",
			nomen_desc_nl:
				"Raadpleging met het opstellen van een schriftelijk verslag",
			fee: 26.08,
			feecode: 0,
		},
	];

	console.log("Test data:", testData);
	console.log("Calling displayNomenclatureResults with test data...");

	displayNomenclatureResults(testData);

	console.log("=== End real data test ===");
}

// Test API call function
function testAPICall() {
	console.log("=== Testing API Call ===");

	const testQuery = "105";
	console.log("Testing with query:", testQuery);

	searchNomenclature(testQuery);

	console.log("=== API call initiated ===");
}

// Test direct API endpoint
function testDirectAPI() {
	console.log("=== Testing Direct API Call ===");

	const apiUrl =
		HOSTURL + "/" + APP_NAME + "/api/nomenclature/search?code=105755&limit=5";
	console.log("Direct API URL:", apiUrl);

	$.ajax({
		url: apiUrl,
		method: "GET",
		success: function (response) {
			console.log("✅ Direct API success:");
			console.log("Full Response Object:", response);
			console.log("Response Type:", typeof response);
			console.log("Response Keys:", Object.keys(response || {}));

			// Detailed analysis
			console.log("\n=== RESPONSE STRUCTURE ANALYSIS ===");
			console.log("response.status:", response.status);
			console.log("response.data exists:", response.data !== undefined);
			console.log("response.data type:", typeof response.data);
			console.log("response.data is array:", Array.isArray(response.data));
			console.log(
				"response.data length:",
				response.data ? response.data.length : "N/A"
			);
			console.log("response.pagination:", response.pagination);
			console.log("response.filters:", response.filters);

			if (response.data && response.data.length > 0) {
				console.log("First item structure:", response.data[0]);
				console.log("First item keys:", Object.keys(response.data[0] || {}));
			}

			// Test the extraction logic
			console.log("\n=== TESTING EXTRACTION LOGIC ===");
			if (response && response.data && Array.isArray(response.data)) {
				console.log(
					"✅ Extraction would work: Found",
					response.data.length,
					"items"
				);
				console.log("Sample item:", response.data[0]);
			} else {
				console.log("❌ Extraction would fail");
			}
		},
		error: function (xhr, status, error) {
			console.error("❌ Direct API error:");
			console.error("Status:", status);
			console.error("Error:", error);
			console.error("Response:", xhr.responseText);
		},
	});
}

// Test function with the exact FastAPI response format provided by user
function testWithUserProvidedData() {
	console.log("=== Testing with User's Exact Response Data ===");

	// This is the exact response structure the user provided
	const userResponse = {
		status: "success",
		message: "Operation successful",
		code: 200,
		data: [
			{
				nomen_code: 105092,
				nomen_desc_nl:
					"Raadpleging met het opstellen van een schriftelijk verslag van een gespecialiseerd diagnostisch bilan voor wervelkolompathologie door een arts-specialist voor orthopedische heelkunde of neurochirurgie",
				nomen_desc_fr:
					"Consultation avec l'élaboration d'un rapport écrit d'un bilan diagnostique spécialisé pour pathologie de la colonne vertébrale par un médecin spécialiste en chirurgie orthopédique ou en neurochirurgie",
				fee: 26.08,
				feecode: 0,
			},
			{
				nomen_code: 105114,
				nomen_desc_nl:
					"Raadpleging met het opstellen van een schriftelijk verslag van een gespecialiseerd diagnostisch bilan voor wervelkolompathologie door een geaccrediteerde arts-specialist voor orthopedische heelkunde of neurochirurgie",
				nomen_desc_fr:
					"Consultation avec l'élaboration d'un rapport écrit d'un bilan diagnostique spécialisé pour pathologie de la colonne vertébrale par un médecin spécialiste en chirurgie orthopédique ou en neurochirurgie, accrédité",
				fee: 32.84,
				feecode: 0,
			},
		],
		meta: {
			total: 20,
			limit: 20,
			offset: 0,
			has_more: false,
		},
	};

	console.log("User response structure:", userResponse);
	console.log("Testing data extraction logic...");

	// Test the extraction logic exactly as it appears in searchNomenclature
	let resultsData = [];

	if (
		userResponse &&
		userResponse.status === "success" &&
		userResponse.data &&
		Array.isArray(userResponse.data)
	) {
		resultsData = userResponse.data;
		console.log(
			"✅ FastAPI format detected - Using response.data (found " +
				resultsData.length +
				" items)"
		);
		console.log("Response meta:", userResponse.meta);
	} else {
		console.error("❌ Data extraction failed!");
	}

	console.log("Extracted results:", resultsData);
	console.log("Sample item:", resultsData[0]);

	console.log("Now testing displayNomenclatureResults...");
	try {
		displayNomenclatureResults(resultsData);
		console.log("✅ Display function completed");
	} catch (error) {
		console.error("❌ Display function failed:", error);
	}

	console.log("=== End User Data Test ===");
}

// Test function to verify nomenclature search with exact user-provided data
function testWithExactUserData() {
	console.log("=== Testing with exact user-provided API data ===");

	// This is the exact response format provided by the user
	const testResponse = {
		status: "success",
		message: "Operation successful",
		code: 200,
		data: [
			{
				nomen_code: 105092,
				nomen_desc_nl:
					"Raadpleging met het opstellen van een schriftelijk verslag van een gespecialiseerd diagnostisch bilan voor wervelkolompathologie door een arts-specialist voor orthopedische heelkunde of neurochirurgie",
				nomen_desc_fr:
					"Consultation avec l'élaboration d'un rapport écrit d'un bilan diagnostique spécialisé pour pathologie de la colonne vertébrale par un médecin spécialiste en chirurgie orthopédique ou en neurochirurgie",
				dbegin_fee: "2025-01-01 00:00:00",
				dend_fee: "2999-12-31 00:00:00",
				fee_code_cat: 1,
				fee_code_cat_desc_nl: "Honoraria en prijzen",
				fee_code_cat_desc_fr: "Honoraires et prix",
				feecode: 0,
				fee_code_desc_nl: "Honorarium",
				fee_code_desc_fr: "Honoraire",
				fee: 26.08,
				nomen_grp_n: "N01",
				AUTHOR_DOC: "OA2024_400",
				nomen_grp_n_desc_nl: "Raadplegingen, bezoeken en adviezen van artsen",
				nomen_grp_n_desc_fr: "Consultations, visites et avis de médecins",
				dbegin_key_letter_value: "01/01/2025",
				key_letter1: "N",
				key_letter_index1: "N200",
				key_coeff1: "8",
				key_letter1_value: "3,260036",
				key_letter2: null,
				key_letter_index2: null,
				key_coeff2: null,
				key_letter2_value: null,
				key_letter3: null,
				key_letter_index3: null,
				key_coeff3: null,
				key_letter3_value: null,
			},
		],
		meta: {
			total: 20,
			limit: 20,
			offset: 0,
			has_more: false,
		},
	};

	console.log("=== Processing test response ===");
	console.log("Test response:", testResponse);

	// Test the displayNomenclatureResults function with this data
	try {
		displayNomenclatureResults(testResponse.data);
		console.log("✅ Display function completed successfully");
	} catch (error) {
		console.error("❌ Display function failed:", error);
	}

	console.log("=== End exact user data test ===");
}
