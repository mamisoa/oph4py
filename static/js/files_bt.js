// set parameters for ajax request from bootstrap-table
var s_wl = "";
var toggle_wl = "";
let mainModalityArr = ["MD", "GP"];

function queryParams_wl(params) {
	search = params.search.split(",");
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
		"<strong>" + arr[0].split("-").reverse().join("/") + "</strong> " + arr[1];
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
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete worklist item"><i class="fas fa-trash-alt"></i></a>'
	);
	if (row.status_flag != "done") {
		html.push(
			'<a class="done ms-1" href="javascript:void(0)" title="Set to process"><i class="fas fa-check"></i></a>'
		);
	} else {
		html.push(
			'<a class="unlock ms-1" href="javascript:void(0)" title="Set to process"><i class="fas fa-unlock"></i></a>'
		);
	}
	html.push(
		'<a class="modality_ctr ms-1" href="javascript:void(0)" title="Execute task"><i class="fas fa-heartbeat"></i></a>'
	);
	if (mainModalityArr.includes(row.modality) && row.status_flag == "done") {
		html.push(
			'<a class="summary ms-1" href="javascript:void(0)" title="Read summary"><i class="fas fa-th-list"></i></a>'
		);
	} else {
	}
	// Add payment button for completed MD procedures only
	if (row.status_flag == "done" && row.modality == "MD") {
		// Determine payment button color based on payment status
		let paymentStyle = 'style="color: #dc143c; font-weight: bold;"'; // Bright red (unpaid/incomplete)
		let titleText = "Process payment";
		let buttonClass = "payment payment-unpaid";

		// Check if payment status is available in row data
		if (row.payment_status) {
			if (row.payment_status === "complete") {
				paymentStyle = 'style="color: #ffd700; font-weight: bold;"'; // Gold for complete
				titleText = "View payment details";
				buttonClass = "payment payment-complete";
			} else if (row.payment_status === "partial") {
				paymentStyle = 'style="color: #ff8c00; font-weight: bold;"'; // Orange for partial
				titleText = "Complete payment";
				buttonClass = "payment payment-partial";
			}
		}

		html.push(
			'<a class="' +
				buttonClass +
				' ms-1" href="javascript:void(0)" title="' +
				titleText +
				'" ' +
				paymentStyle +
				' data-worklist-id="' +
				row.id +
				'"><i class="fas fa-dollar-sign"></i></a>'
		);
	}
	html.push("</div>");
	return html.join("");
}

window.operateEvents_wl = {
	"click .remove": function (e, value, row, index) {
		delWlItem(row.id);
	},
	"click .done": function (e, value, row, index) {
		let dataObj = { laterality: row.laterality, id: row.id };
		let dataStr;
		if (row.status_flag != "done") {
			dataObj["status_flag"] = "done";
			dataObj["counter"] = 0;
			dataStr = JSON.stringify(dataObj);
			setWlItemStatus(dataStr).then(function () {
				$table_wl.bootstrapTable("refresh");
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
				$table_wl.bootstrapTable("refresh");
			});
		}
		let controller = modalityDict[row.modality];
		let link =
			HOSTURL + "/" + APP_NAME + "/modalityCtr/" + controller + "/" + row.id;
		window.location.href = link;
	},
	"click .summary": function (e, value, row, index) {
		let link =
			HOSTURL + "/" + APP_NAME + "/billing/summary/" + row.id_auth_user;
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
				$table_wl.bootstrapTable("refresh");
			});
		} else {
		}
	},
	"click .payment": function (e, value, row, index) {
		let link = HOSTURL + "/" + APP_NAME + "/payment/" + row.id;
		window.location.href = link;
	},
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
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
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
	html.push(
		'<div class="d-flex justify-content-between"><span class="badge rounded-pill bg-primary mx-1">' +
			row.counter +
			"</span>"
	);
	html.push("</div>");
	return html.join("");
}

function cellStyle_timeslot(value, row) {
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
		css: {
			"font-weight": "bold",
			"background-color": bg,
		},
	};
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
 * Update payment button colors based on actual payment status
 * This function checks payment status for each worklist item and updates button appearance
 */
async function updatePaymentButtonColors() {
	// Get all payment buttons
	const paymentButtons = document.querySelectorAll(
		".payment[data-worklist-id]"
	);

	if (paymentButtons.length === 0) return;

	// Create array of promises to check payment status for each worklist item
	const statusPromises = Array.from(paymentButtons).map(async (button) => {
		const worklistId = button.getAttribute("data-worklist-id");
		if (!worklistId) return null;

		try {
			const baseUrl =
				(window.HOSTURL || location.origin) +
				"/" +
				(window.APP_NAME || "oph4py");
			const response = await fetch(
				`${baseUrl}/api/worklist/${worklistId}/payment_summary`
			);

			if (!response.ok) return null;

			const result = await response.json();
			if (result.status === "success" && result.data) {
				return {
					button: button,
					worklistId: worklistId,
					paymentStatus: result.data.payment_status,
					remainingBalance: result.data.remaining_balance || 0,
				};
			}
		} catch (error) {
			console.warn(
				`Failed to check payment status for worklist ${worklistId}:`,
				error
			);
		}
		return null;
	});

	// Wait for all status checks to complete
	const results = await Promise.allSettled(statusPromises);

	// Update button appearance based on payment status
	results.forEach((result) => {
		if (result.status === "fulfilled" && result.value) {
			const { button, paymentStatus, remainingBalance } = result.value;

			let newStyle, newTitle, newClass;

			if (paymentStatus === "complete" || remainingBalance <= 0) {
				newStyle = "color: #ffd700; font-weight: bold;"; // Gold for complete
				newTitle = "View payment details";
				newClass = "payment payment-complete ms-1";
			} else if (paymentStatus === "partial") {
				newStyle = "color: #ff8c00; font-weight: bold;"; // Orange for partial
				newTitle = "Complete payment";
				newClass = "payment payment-partial ms-1";
			} else {
				// Keep default red for unpaid
				newStyle = "color: #dc143c; font-weight: bold;"; // Bright red for unpaid
				newTitle = "Process payment";
				newClass = "payment payment-unpaid ms-1";
			}

			// Update button attributes
			button.setAttribute("style", newStyle);
			button.setAttribute("title", newTitle);
			button.className = newClass;
		}
	});
}

// Note: Bootstrap table event handlers are managed in the HTML template
// to avoid conflicts with existing event bindings
