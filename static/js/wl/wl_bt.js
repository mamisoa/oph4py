// set parameters for ajax request from bootstrap-table
let s_wl = "";
let toggle_wl = "";
// add visibility to main modalities
let mainModalityArr = ["MD", "GP"];

// Make sure this object is defined immediately to avoid bootstrap-table initialization errors
window.operateEvents_wl = {};

// Make sure we're integrated with the state management system
// This assumes wl-state-manager.js is loaded before this file
if (typeof WorklistState === "undefined") {
	console.error(
		"WorklistState not found! Make sure wl-state-manager.js is loaded first."
	);
}

function styleTimeslot(ts) {
	let now = new Date().getTime();
	let ts_time = new Date(ts).getTime();
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

// A custom wrapper for crudp that doesn't display toasts
function crudpWithoutToast(table, id = "0", req = "POST", data) {
	return new Promise((resolve, reject) => {
		// Fix URL construction for PUT requests with ID
		let API_URL = HOSTURL + "/" + APP_NAME + "/api/" + table;
		if ((req === "PUT" || req === "DELETE") && id !== "0") {
			API_URL += "/" + id;
		}

		$.ajax({
			url: API_URL,
			data: data,
			contentType: "application/json",
			dataType: "json",
			method: req,
			success: function (data) {
				console.log("CRUDP Response:", data);
				if (data.status == "error") {
					let errors = "";
					for (let i in data.errors) {
						errors += data.errors[i] + "</br>";
					}
					reject(errors);
				} else {
					resolve(data);
				}
			},
			error: function (error) {
				console.error("CRUDP Error:", error);
				reject(error);
			},
		});
	});
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
	// Handle summary and payment buttons for MD modality with new logic
	if (row.modality == "MD") {
		if (row.status_flag != "done") {
			// MD not done: show summary button, no payment button
			html.push(
				'<a class="summary ms-1" href="javascript:void(0)" title="Read summary"><i class="fas fa-th-list"></i></a>'
			);
		} else {
			// MD done: show payment button, no summary button
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
	} else if (
		mainModalityArr.includes(row.modality) &&
		row.status_flag == "done"
	) {
		// For other main modalities (GP), show summary when done
		html.push(
			'<a class="summary ms-1" href="javascript:void(0)" title="Read summary"><i class="fas fa-th-list"></i></a>'
		);
	}
	html.push("</div>");
	return html.join("");
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

// Update the window.operateEvents_wl object with all the event handlers
window.operateEvents_wl = {
	"click .edit": function (e, value, row, index) {
		console.log("You click action EDIT on row: " + JSON.stringify(row));
		putWlModal(row.id);
	},
	"click .remove": function (e, value, row, index) {
		// REVERTED TO SIMPLE SYNC APPROACH - NO RACE CONDITIONS
		bootbox.confirm({
			message: "Are you sure you want to delete this worklist item?",
			closeButton: false,
			buttons: {
				confirm: {
					label: "Yes",
					className: "btn-success",
				},
				cancel: {
					label: "No",
					className: "btn-danger",
				},
			},
			callback: function (result) {
				if (result == true) {
					crudp("worklist", row.id, "DELETE").then((data) =>
						$table_wl.bootstrapTable("refresh")
					);
				}
			},
		});
	},
	"click .stopwatch": function (e, value, row, index) {
		// REVERTED TO SIMPLE SYNC APPROACH - NO RACE CONDITIONS
		let dataObj = { laterality: row.laterality, id: row.id };

		if (row.counter > 0 && row.status_flag != "cancelled") {
			if (row.counter == 1) {
				dataObj["status_flag"] = "done";
				dataObj["counter"] = 0;
			} else if (row.counter > 1) {
				dataObj["counter"] = row.counter - 1;
				dataObj["status_flag"] = "processing";
			}

			let dataStr = JSON.stringify(dataObj);
			setWlItemStatus(dataStr).then((data) =>
				$table_wl.bootstrapTable("refresh")
			);
		} else {
			displayToast(
				"warning",
				"Warning",
				"Counter is already at zero or item is cancelled"
			);
		}
	},
	"click .done": function (e, value, row, index) {
		// REVERTED TO SIMPLE SYNC APPROACH - NO RACE CONDITIONS
		if (row.status_flag != "done") {
			let dataObj = {
				laterality: row.laterality,
				id: row.id,
				status_flag: "done",
				counter: 0,
			};
			let dataStr = JSON.stringify(dataObj);
			setWlItemStatus(dataStr).then((data) =>
				$table_wl.bootstrapTable("refresh")
			);
		} else {
			displayToast("info", "Information", "Item is already marked as done");
		}
	},
	"click .modality_ctr": function (e, value, row, index) {
		// Lock UI during processing
		WorklistState.UI.lockUI(".modality_ctr", "Processing...");

		let dataObj = { laterality: row.laterality, id: row.id };

		if (row.status_flag == "requested") {
			dataObj["status_flag"] = "processing";
			dataObj["counter"] = row.counter;

			const dataStr = JSON.stringify(dataObj);

			// This is a simple status update operation - can bypass queue
			WorklistState.Queue.enqueue(
				function () {
					// Track the item being processed
					WorklistState.Manager.trackProcessingItem(row.id);

					return setWlItemStatusWithoutToast(dataStr);
				},
				function (result) {
					// Success callback with proper state cleanup
					console.log(`✅ Item ${row.id} started processing successfully`);

					// Item is now in processing state, track it
					WorklistState.Manager.trackProcessingItem(row.id);

					// Wait a moment for database transaction to complete, then refresh and navigate
					setTimeout(() => {
						$table_wl.bootstrapTable("refresh");

						// Navigate to the controller page after status is updated
						let controller = modalityDict[row.modality];
						let link =
							HOSTURL +
							"/" +
							APP_NAME +
							"/modalityCtr/" +
							controller +
							"/" +
							row.id;
						window.location.href = link;
					}, 100);
				},
				function (error) {
					// Error callback
					console.error("Status update failed:", error);
					WorklistState.UI.showFeedback(
						"error",
						"Error updating status: " + error,
						"feedbackContainer"
					);
					WorklistState.UI.unlockUI(".modality_ctr");
				},
				{
					operationType: "status-update",
					itemId: row.id,
					description: "Start modality processing",
					bypassQueue: true, // Force bypass for simple status update
				}
			);
		} else {
			// If already processing, just navigate
			let controller = modalityDict[row.modality];
			let link =
				HOSTURL + "/" + APP_NAME + "/modalityCtr/" + controller + "/" + row.id;
			window.location.href = link;
		}
	},
	"click .summary": function (e, value, row, index) {
		let link =
			HOSTURL + "/" + APP_NAME + "/billing/summary/" + row.id_auth_user;
		window.location.href = link;
	},
	"click .unlock": function (e, value, row, index) {
		// REVERTED TO SIMPLE SYNC APPROACH - NO RACE CONDITIONS
		if (row.status_flag == "done") {
			let dataObj = {
				laterality: row.laterality,
				id: row.id,
				status_flag: "processing",
				counter: 1,
			};
			let dataStr = JSON.stringify(dataObj);
			setWlItemStatus(dataStr).then((data) =>
				$table_wl.bootstrapTable("refresh")
			);
		} else {
			displayToast(
				"info",
				"Information",
				"Item is not in done status, cannot unlock"
			);
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

// A modified version of setWlItemStatus that doesn't display toasts
function setWlItemStatusWithoutToast(dataStr) {
	// Parse the data to extract the ID
	const data = JSON.parse(dataStr);
	const id = data.id;

	// Remove the ID from the data object since it will be in the URL
	delete data.id;

	// Convert back to JSON string without the ID
	const cleanDataStr = JSON.stringify(data);

	return new Promise((resolve, reject) => {
		crudpWithoutToast("worklist", id, "PUT", cleanDataStr)
			.then((data) => {
				resolve({
					message: "Worklist status updated successfully for ID: " + id,
					data: data,
				});
			})
			.catch((error) => {
				reject(error);
			});
	});
}

// Hook into bootstrap table events to update payment button colors
$(document).ready(function () {
	// Wait for table to be initialized, then bind events
	setTimeout(function () {
		if (typeof $table_wl !== "undefined" && $table_wl.length) {
			// Listen for table refresh events
			$table_wl.on("post-body.bs.table", function () {
				// Update payment button colors after table content is loaded
				setTimeout(updatePaymentButtonColors, 100);
			});

			// Also update colors on initial load
			$table_wl.on("load-success.bs.table", function () {
				setTimeout(updatePaymentButtonColors, 100);
			});
		}
	}, 1000);
});

/**
 * Enhanced table refresh with operation consistency checking
 * This prevents items from reverting when auto-refresh occurs
 */
function enhancedTableRefresh(source = "manual") {
	console.log(`🔄 Enhanced table refresh triggered by: ${source}`);

	// Store current table state before refresh
	const currentData = $table_wl.bootstrapTable("getData");
	const currentItemStates = new Map();
	currentData.forEach((item) => {
		currentItemStates.set(item.id, {
			status_flag: item.status_flag,
			counter: item.counter,
		});
	});

	// Perform the refresh
	$table_wl.bootstrapTable("refresh");

	// After refresh, check for inconsistencies
	setTimeout(() => {
		validateOperationConsistency(currentItemStates, source);
	}, 1000);
}

/**
 * Validate that recent operations are reflected in the refreshed table
 * @param {Map} previousStates - Map of item states before refresh
 * @param {string} source - Source of the refresh (for logging)
 */
function validateOperationConsistency(previousStates, source) {
	try {
		const storedOps = JSON.parse(
			localStorage.getItem("worklistOperations") || "[]"
		);
		const recentOps = storedOps.filter(
			(op) => Date.now() - op.timestamp < 30000
		); // Last 30 seconds

		if (recentOps.length === 0) return;

		const currentData = $table_wl.bootstrapTable("getData");
		const currentStates = new Map();
		currentData.forEach((item) => {
			currentStates.set(item.id, {
				status_flag: item.status_flag,
				counter: item.counter,
			});
		});

		let inconsistenciesFound = 0;

		recentOps.forEach((op) => {
			const currentState = currentStates.get(op.itemId);
			const previousState = previousStates.get(op.itemId);

			if (!currentState) {
				console.warn(
					`⚠️ Item ${op.itemId} missing after refresh (operation: ${op.operation})`
				);
				return;
			}

			// Check for operation reversion
			if (op.operation === "mark_done" && currentState.status_flag !== "done") {
				console.warn(
					`⚠️ INCONSISTENCY: Item ${op.itemId} was marked done but shows as ${currentState.status_flag}`
				);
				inconsistenciesFound++;

				// Show user notification about inconsistency
				WorklistState.UI.showFeedback(
					"warning",
					`Item ${op.itemId} status may have reverted. Please verify the change was saved.`,
					"feedbackContainer",
					5000
				);
			}

			if (
				op.operation === "unlock_item" &&
				currentState.status_flag === "done"
			) {
				console.warn(
					`⚠️ INCONSISTENCY: Item ${op.itemId} was unlocked but still shows as done`
				);
				inconsistenciesFound++;

				WorklistState.UI.showFeedback(
					"warning",
					`Item ${op.itemId} unlock may have reverted. Please verify the change was saved.`,
					"feedbackContainer",
					5000
				);
			}
		});

		if (inconsistenciesFound > 0) {
			console.error(
				`🚨 Found ${inconsistenciesFound} operation inconsistencies after ${source} refresh`
			);
		} else {
			console.log(
				`✅ All recent operations consistent after ${source} refresh`
			);
		}
	} catch (e) {
		console.warn("Could not validate operation consistency:", e);
	}
}

/**
 * Setup enhanced table refresh listeners
 * This replaces basic auto-refresh with intelligent coordination
 */
function setupEnhancedRefresh() {
	// Listen for table refresh events
	$("#table-wl").on("refresh.bs.table", function () {
		console.log("📊 Table refresh event detected");
	});

	// Listen for table load success to validate consistency
	$("#table-wl").on("load-success.bs.table", function () {
		console.log("📊 Table load success - data refreshed");
	});

	// Add navigation state detection
	$(window).on("focus", function () {
		console.log("🔍 Window gained focus - checking for navigation return");
		// User may have returned from payment view, schedule consistency check
		setTimeout(() => {
			enhancedTableRefresh("navigation-return");
		}, 500);
	});

	console.log("🎯 Enhanced refresh system initialized");
}
