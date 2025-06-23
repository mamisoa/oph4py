// Add script reference to wl-state-manager.js
// This needs to be added in the HTML template that includes wl.js

// init worklist form

// change modality options on procedure select
$("#procedureSelect").change(function () {
	setModalityOptions(this.value);
});
// reset form
resetWlForm();

$(".btn.counter_down").click(function () {
	value = parseInt($("input.counter").val());
	if (value >= 1) {
		$("input.counter").val(value - 1);
	} else {
	}
});
$(".btn.counter_up").click(function () {
	value = parseInt($("input.counter").val());
	if (value >= 0) {
		$("input.counter").val(value + 1);
	} else {
	}
});

// set modality options
function setModalityOptions(procedureId) {
	console.log("🎯 Setting modality options for procedure ID:", procedureId);
	
	if (!procedureId || procedureId === "" || procedureId === "undefined") {
		console.warn("⚠️ Invalid procedure ID provided:", procedureId);
		displayToast("warning", "Warning", "No procedure selected", "3000");
		$("#modality_destSelect").html('<option value="">Select a procedure first</option>');
		return;
	}
	
	let modalityOptions = getModalityOptions(procedureId);
	modalityOptions.then(function (data) {
		if (data.status != "error") {
			let items = data.items;
			console.log("🔍 Raw items data:", items);
			console.log("🔍 First item structure:", items[0]);
			console.log("🔍 Item keys:", items[0] ? Object.keys(items[0]) : "No items");
			
			let html = "";
			for (let item of items) {
				console.log("🔍 Processing item:", item);
				
				// Check if the lookup data exists (flattened with dot notation)
				if (item['id_modality.id'] && item['id_modality.modality_name']) {
					console.log("✅ Found flattened modality fields with dot notation");
					html +=
						'<option value="' + item['id_modality.id'] + '">' + item['id_modality.modality_name'] + "</option>";
				} else if (item.id_modality) {
					console.log("✅ Found nested id_modality:", item.id_modality);
					html +=
						'<option value="' + item.id_modality.id + '">' + item.id_modality.modality_name + "</option>";
				} else if (item.modality) {
					console.log("✅ Found modality field:", item.modality);
					html +=
						'<option value="' + item.modality.id + '">' + item.modality.modality_name + "</option>";
				} else {
					console.warn("⚠️ Cannot determine modality structure for item:", item);
					console.log("Available keys:", Object.keys(item));
				}
			}
			console.log("📋 Generated HTML options:", html);
			$("#modality_destSelect").html(html);
		}
	}).catch(function (error) {
		console.error("❌ Error loading modality options:", error);
		displayToast(
			"error",
			"Error",
			"Failed to load modality options",
			"6000"
		);
	});
}

// get json data for modality options
function getModalityOptions(procedureId) {
	return new Promise((resolve, reject) => {
		// Use procedure_family table to get modalities for a specific procedure
		const apiUrl = 
			HOSTURL +
			"/" +
			APP_NAME +
			"/api/procedure_family/?id_procedure.eq=" +
			procedureId +
			"&@lookup=id_modality!:id_modality[id,modality_name]";
		
		console.log("🔗 API URL:", apiUrl);
		
		$.ajax({
			type: "GET",
			url: apiUrl,
			dataType: "json",
			beforeSend: function(xhr) {
				// Add any required headers
				xhr.setRequestHeader('Accept', 'application/json');
			},
			success: function (data) {
				console.log("✅ API Response:", data);
				if (data.status == "error" || data.count == 0) {
					displayToast(
						"error",
						"GET error",
						"Cannot retrieve modality options",
						"6000"
					);
					reject(new Error("Cannot retrieve modality options"));
				} else {
					displayToast(
						"info",
						"GET success",
						"modality options for " + procedureId,
						"6000"
					);
					resolve(data);
				}
			},
			error: function (xhr, status, error) {
				console.error("🚨 AJAX error:", xhr, status, error);
				console.error("🚨 Response text:", xhr.responseText);
				console.error("🚨 Status code:", xhr.status);
				reject(new Error(`Failed to fetch modality options: ${error}`));
			},
		});
	});
}

// reset add new item in worklist modal
function resetWlForm() {
	console.log("🔄 resetWlForm() called");
	// set default value for form
	$("#requested_time").val(
		new Date().addHours(timeOffsetInHours).toJSON().slice(0, 16)
	); // or 19
	$("[name=laterality]").val(["both"]);
	$("[name=status_flag]").val(["requested"]);
	$("[name=warning]").val([""]);
	
	// Get the selected procedure and add debugging
	let choice = $("select#procedureSelect option:checked").val();
	console.log("🔍 Reset form - selected procedure choice:", choice);
	console.log("🔍 Procedure select element:", $("select#procedureSelect")[0]);
	console.log("🔍 Procedure select options:", $("select#procedureSelect option").length);
	
	// Only try to set modality options if we have a valid procedure selected
	if (choice && choice !== "" && choice !== "undefined") {
		setModalityOptions(choice);
	} else {
		console.log("⚠️ No valid procedure selected, skipping modality options");
		$("#modality_destSelect").html('<option value="">Select a procedure first</option>');
	}

	// Clear the state manager's pending items
	WorklistState.Manager.clearPendingItems();
}

// Replace the global variables with the state manager
// var wlItemsJson = [];
// var wlItemsHtml = [];
var wlItemsCounter = 0;
var temp;

// Add new item in worklist format
document.getElementById("btnWlItemAdd").addEventListener("click", async function () {
	// Lock the button during processing
	const button = this;
	button.disabled = true;
	button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Adding...';

	try {
		let formDataStr = $("#newWlItemForm").serializeJSON();
		let formDataObj = JSON.parse(formDataStr);

		// Clean up form data - remove fields that shouldn't be sent to the server
		delete formDataObj["modality_destPut"]; // used for PUT request
		delete formDataObj["idWl"]; // no Id when new Item
		delete formDataObj["id"]; // Remove empty ID field
		delete formDataObj["methodWlItemSubmit"]; // Remove method field

		// Check if this is a multiple modality selection
		if (formDataObj["modality_dest"] == multiplemod) {
			// KEEP QUEUE SYSTEM FOR COMBO OPERATIONS (COMPLEX)
			await handleComboInsertion(formDataObj, button);
		} else {
			// CONVERT TO DIRECT CRUDP FOR SINGLE ITEMS (SIMPLE)
			await handleSingleItemInsertion(formDataObj);
		}
	} catch (error) {
		console.error("Error adding item:", error);
		displayToast('error', 'Error', `Error adding item: ${error.message}`);
	} finally {
		// Unlock UI
		button.disabled = false;
		button.innerHTML = '<i class="fa fa-plus"></i> Add Item';
	}
});

// KEEP QUEUE SYSTEM FOR COMBO OPERATIONS (COMPLEX)
async function handleComboInsertion(formDataObj, button) {
	// Store patient context for combo operations
	WorklistState.Manager.setPatientContext({
		id: formDataObj["id_auth_user"],
		sending_facility: $("#sendingFacilitySelect :selected").text(),
		receiving_facility: $("#receivingFacilitySelect :selected").text(),
	});

	let formDataObjMultiple = [];

	// Create a task function for the request queue
	const comboTask = function () {
		return getCombo(formDataObj["procedure"]).then(function (data) {
			let arr = [];
			for (let i in data.items) {
				arr[data.items[i]["id_modality.modality_name"]] =
					data.items[i]["id_modality.id"];
			}

			// For combo selection, we don't add the original 'multiple' item
			// Instead, we add each specific modality item
			for (let a in arr) {
				// Create a new clean object with only the fields needed
				let o = {
					id_auth_user: formDataObj.id_auth_user,
					procedure: formDataObj.procedure,
					provider: formDataObj.provider,
					senior: formDataObj.senior,
					requested_time: formDataObj.requested_time,
					sending_facility: formDataObj.sending_facility || 1,
					receiving_facility: formDataObj.receiving_facility || 1,
					laterality: formDataObj.laterality,
					status_flag: formDataObj.status_flag,
					counter: formDataObj.counter
						? parseInt(formDataObj.counter, 10)
						: 0,
					warning: formDataObj.warning || "",
					modality_dest: arr[a],
					modality_name: a, // only used for display
				};

				// For MD modality, set counter to 1
				if (a == "MD") {
					o.counter = 1;
				}

				// Add each item to state manager using standardized function
				const modalityItemId = addItemWithTracking(o);

				// Store uniqueId from the return value of addItemWithTracking()
				const itemUniqueId = modalityItemId;

				// Store for later reference in UI
				o._uniqueId = itemUniqueId;
				formDataObjMultiple.push(o);
			}

			// Validate patient consistency before proceeding
			if (!WorklistState.Manager.validatePatientConsistency()) {
				displayToast('error', 'Error', 'Items belong to different patients');
				return Promise.reject("Patient consistency validation failed");
			}

			// Process the items for UI display
			for (let f in formDataObjMultiple) {
				let modalityName = formDataObjMultiple[f]["modality_name"];

				// Get the uniqueId we stored earlier
				const uniqueId = formDataObjMultiple[f]._uniqueId;
				delete formDataObjMultiple[f]._uniqueId;

				// Create a UI display version with the uniqueId
				const itemWithUniqueId = { ...formDataObjMultiple[f], uniqueId };
				let formDataObjMultipleStr = JSON.stringify(itemWithUniqueId);

				// Update status to reflect processing
				WorklistState.Manager.updateItemStatus(uniqueId, "pending");

				appendWlItem(formDataObjMultipleStr, wlItemsCounter++, modalityName);
			}

			return formDataObjMultiple;
		});
	};

	// Use queue system for combo operations (KEEP THIS)
	return new Promise((resolve, reject) => {
		WorklistState.Queue.enqueue(
			comboTask,
			function (result) {
				// Success callback
				displayToast('success', 'Success', 'Multiple items added to worklist successfully');
				resolve(result);
			},
			function (error) {
				// Error callback
				console.error("Error in combo processing:", error);
				displayToast('error', 'Error', `Error adding items: ${error}`);
				reject(error);
			},
			{
				operationType: "combo-processing",
				description: "Process multiple modality items from combo selection",
			}
		);
	});
}

// CONVERT TO DIRECT CRUDP FOR SINGLE ITEMS (SIMPLE)
async function handleSingleItemInsertion(formDataObj) {
	// Clean up fields for single item
	delete formDataObj["modality_name"]; // only for display

	// Ensure counter is a number
	if (typeof formDataObj.counter === "string") {
		formDataObj.counter = parseInt(formDataObj.counter, 10) || 0;
	}

	// Add directly to UI with simple uniqueId (NO STATE MANAGER NEEDED)
	const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
	formDataObj.uniqueId = uniqueId;
	const formDataStr = JSON.stringify(formDataObj);
	
	// Add to UI immediately - NO QUEUE
	appendWlItem(formDataStr, wlItemsCounter++);
	
	displayToast('success', 'Success', 'Item added to worklist successfully');
	
	return { success: true, uniqueId: uniqueId };
}

async function getCombo(id_procedure) {
	try {
		const response = await fetch(
			`${HOSTURL}/${APP_NAME}/api/combo?@lookup=id_procedure!:id_procedure[exam_name],id_modality!:id_modality&@count=true&id_procedure=${id_procedure}`
		);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		if (data.status !== "error" || data.count) {
			displayToast(
				"success",
				"GET combo exams",
				"GET " + data.items[0]["id_procedure.exam_name"]
			);
		} else {
			displayToast("error", "GET error", "Cannot retrieve combo exams");
		}
		return data;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

/**
 * Appends a worklist item to the table display and registers it with the state manager.
 *
 * @param {string} dataStr - JSON string containing the worklist item data
 * @param {number} cnt - Counter/row index used for uniquely identifying the row
 * @param {string} [modalityName] - Optional name of the modality if different from selected
 * @returns {void}
 */
function appendWlItem(dataStr, cnt, modalityName) {
	// Create a new object for UI display
	const wlItemsHtml = {};

	// Parse the data string to an object for manipulation
	const parsedData = JSON.parse(dataStr);

	// Remove the uniqueId field before storing back to data-json
	const uniqueId = parsedData.uniqueId;
	delete parsedData.uniqueId;

	// Convert back to string for storage
	const cleanDataStr = JSON.stringify(parsedData);

	// Get form values using vanilla JS
	wlItemsHtml["From"] = document.getElementById(
		"sendingFacilitySelect"
	).options[
		document.getElementById("sendingFacilitySelect").selectedIndex
	].text;
	wlItemsHtml["To"] = document.getElementById(
		"receivingFacilitySelect"
	).options[
		document.getElementById("receivingFacilitySelect").selectedIndex
	].text;
	wlItemsHtml["Procedure"] =
		document.getElementById("procedureSelect").options[
			document.getElementById("procedureSelect").selectedIndex
		].text;
	wlItemsHtml["Provider"] =
		document.getElementById("providerSelect").options[
			document.getElementById("providerSelect").selectedIndex
		].text;
	wlItemsHtml["Senior"] =
		document.getElementById("seniorSelect").options[
			document.getElementById("seniorSelect").selectedIndex
		].text;
	wlItemsHtml["Timeslot"] = document.getElementById("requested_time").value;

	if (modalityName !== undefined) {
		wlItemsHtml["Modality"] = modalityName;
	} else {
		wlItemsHtml["Modality"] = document.getElementById(
			"modality_destSelect"
		).options[
			document.getElementById("modality_destSelect").selectedIndex
		].text;
	}

	wlItemsHtml["Status"] = document.querySelector(
		'input[name="status_flag"]:checked'
	).value;
	wlItemsHtml["Counter"] = document.querySelector(
		'input[name="counter"]'
	).value;
	wlItemsHtml["warning"] = document.querySelector(
		'input[name="warning"]'
	).value;

	// Build HTML string for table row
	let html = `<tr id="wlItem${cnt}">`;

	// Add cells in the exact order of headers: From, To, Procedure, Provider, Senior, Timeslot, Modality, Status, Counter, Action
	html += `<td class="text-center">${wlItemsHtml["From"]}</td>`;
	html += `<td class="text-center">${wlItemsHtml["To"]}</td>`;
	html += `<td class="text-center">${wlItemsHtml["Procedure"]}</td>`;
	html += `<td class="text-center">${wlItemsHtml["Provider"]}</td>`;
	html += `<td class="text-center">${wlItemsHtml["Senior"]}</td>`;
	html += `<td class="text-center">${wlItemsHtml["Timeslot"]}</td>`;
	html += `<td class="text-center">${wlItemsHtml["Modality"]}</td>`;

	// Status with badge styling
	const statusClass = getStatusBadgeClass(wlItemsHtml["Status"]);
	html += `<td class="text-center"><span class="badge ${statusClass}">${wlItemsHtml["Status"]}</span></td>`;

	html += `<td class="text-center">${wlItemsHtml["Counter"]}</td>`;
	html += `<td class="text-center"><button type="button" class="btn btn-danger btn-sm" onclick="delWlItemModal('${cnt}');" data-index=${cnt} title="Remove item"><i class="far fa-trash-alt"></i></button></td>`;
	html += "</tr>";

	// Update DOM - hide empty state and add the new row
	const emptyRow = document.getElementById("emptyItemsRow");
	if (emptyRow) {
		emptyRow.style.display = "none";
	}

	const tbodyItems = document.getElementById("tbodyItems");
	tbodyItems.insertAdjacentHTML("beforeend", html);

	// Set data attribute with cleaned JSON
	const rowElement = document.getElementById(`wlItem${cnt}`);
	rowElement.dataset.json = cleanDataStr;

	// Store reference to HTML element in state manager using original uniqueId
	if (uniqueId) {
		WorklistState.Manager.htmlElements.set(uniqueId, rowElement);

		// Store the mapping between row index and uniqueId for later reference
		rowElement.dataset.uniqueId = uniqueId;
	}

	wlItemsCounter += 1;
}

/**
 * Returns the appropriate Bootstrap badge class for a status
 * @param {string} status - The status value
 * @returns {string} - Bootstrap badge class
 */
function getStatusBadgeClass(status) {
	switch (status?.toLowerCase()) {
		case "requested":
			return "bg-warning text-dark";
		case "processing":
			return "bg-info text-dark";
		case "done":
			return "bg-success";
		case "cancelled":
			return "bg-secondary";
		default:
			return "bg-secondary";
	}
}

// delete item in item worklist to append
async function delWlItemModal(itemId) {
	const element = document.getElementById("wlItem" + itemId);
	if (!element) {
		console.warn(`Element wlItem${itemId} not found`);
		return;
	}

	const uniqueId = element.dataset.uniqueId;

	// Validate uniqueId before proceeding
	if (!uniqueId || uniqueId === "undefined" || uniqueId === "null") {
		console.error(
			`🚨 Cannot delete item ${itemId}: invalid uniqueId (${uniqueId})`
		);
		WorklistState.UI.showFeedback(
			"error",
			"Cannot delete item: Invalid ID",
			"feedbackContainer"
		);
		return;
	}

	try {
		// Step 1: Atomic state cleanup
		const cleanupSuccess = WorklistState.Manager.atomicCleanupItem(
			uniqueId,
			itemId
		);
		if (!cleanupSuccess) {
			throw new Error("State cleanup failed");
		}

		// Step 2: DOM removal
		element.remove();

		// Step 3: UI state updates
		const remainingRows = document.querySelectorAll(
			"#tbodyItems tr:not(#emptyItemsRow)"
		);
		if (remainingRows.length === 0) {
			const emptyRow = document.getElementById("emptyItemsRow");
			if (emptyRow) emptyRow.style.display = "";
		}

		// Step 4: Success feedback
		WorklistState.UI.showFeedback(
			"success",
			"Item removed successfully",
			"feedbackContainer"
		);
	} catch (error) {
		console.error(`🚨 Error in delWlItemModal:`, error);
		WorklistState.UI.showFeedback(
			"error",
			`Error removing item: ${error.message}`,
			"feedbackContainer"
		);
	}
}

/**
 * Adds a patient to the worklist by preparing and showing the worklist modal
 *
 * @param {string|number} userId - The ID of the patient to add to worklist
 * @description
 * This function:
 * 1. Resets the worklist form
 * 2. Shows necessary UI elements
 * 3. Clears existing items
 * 4. Sets the patient ID in the form
 * 5. Updates the WorklistState manager
 * 6. Shows the modal dialog
 */
function addToWorklist(userId) {
	// Initialize form
	resetWlForm();

	// Show all required input elements
	const showElements = ["wlItemAddDiv", "wlItemsDiv"];
	showElements.forEach((elementId) => {
		const element = document.getElementById(elementId);
		if (element) {
			element.classList.remove("visually-hidden");
		}
	});

	// Clear existing items and show empty state
	const tbodyItems = document.getElementById("tbodyItems");
	if (tbodyItems) {
		tbodyItems.innerHTML = `
			<tr id="emptyItemsRow">
				<td colspan="10" class="text-center text-muted py-4">
					<i class="fas fa-inbox fa-2x mb-2 d-block"></i>
					No worklist items selected
				</td>
			</tr>
		`;
	}

	// Set patient ID in form
	const patientIdInput = document.getElementById("idPatientWl");
	if (patientIdInput) {
		patientIdInput.value = userId;
	}

	// Update state manager with patient context
	WorklistState.Manager.setPatientContext({
		id: userId,
	});

	// Show modal using Bootstrap
	const modal = document.getElementById("newWlItemModal");
	if (modal) {
		const bootstrapModal = new bootstrap.Modal(modal);
		bootstrapModal.show();
	}
}

/**
 * Toggles a CSS class on a DOM element
 * @param {string} elementId - The ID of the DOM element without '#' prefix
 * @param {string} className - The CSS class name to toggle
 * @param {string} action - The action to perform: 'add' or 'remove'
 */
function hideDiv(elementId, className, action) {
	const element = document.getElementById(elementId.replace("#", ""));
	if (element) {
		action === "add"
			? element.classList.add(className)
			: element.classList.remove(className);
	}
}

// get item details for put request
function getWlItemDetails(wl_id) {
	return Promise.resolve(
		$.ajax({
			type: "GET",
			dataType: "json",
			url:
				HOSTURL +
				"/" +
				APP_NAME +
				"/api/worklist/" +
				wl_id +
				"?@lookup=id_auth_user!:id_auth_user[id,first_name,last_name],provider!:provider[id,first_name,last_name],procedure!:procedure,modality!:modality_dest[id,modality_name],receiving_facility!:receiving_facility[id,facility_name],sending_facility!:sending_facility[id,facility_name],senior!:senior[id,first_name,last_name]",
			success: function (data) {
				if (data.status != "error") {
					displayToast(
						"success",
						"GET wl details",
						"GET wl details from id :" + wl_id,
						6000
					);
				} else {
					displayToast("error", "GET error", "Cannot retrieve wl details");
				}
			}, // success
			error: function (er) {
				console.log(er);
			},
		})
	); // promise return data
}

/**
 * Sets up and displays a modal for editing a worklist item
 * @param {number} wlId - The ID of the worklist item to edit
 * @returns {Promise<void>}
 */
async function putWlModal(wlId) {
	// Initialize form
	resetWlForm();
	wlItemsCounter = 0;

	// Hide unnecessary elements
	const hideElements = ["wlItemAddDiv", "wlItemsDiv"];
	hideElements.forEach((id) => hideDiv(id, "visually-hidden", "add"));

	// Update modal title
	const modalTitle = document.querySelector("#newWlItemModal h5.modal-title");
	if (modalTitle) {
		modalTitle.textContent = `Edit worklist item #${wlId}`;
	}

	// Toggle visibility of modality sections
	hideDiv("modality_destDiv", "visually-hidden", "add");
	hideDiv("modality_destPutDiv", "visually-hidden", "remove");

	try {
		const data = await getWlItemDetails(wlId);
		const field = data.items[0];

		// Reset form
		const form = document.getElementById("newWlItemForm");
		form.reset();

		// Update form fields
		const formUpdates = {
			sendingFacilitySelect: field["sending_facility.id"],
			receivingFacilitySelect: field["receiving_facility.id"],
			procedureSelect: field["procedure.id"],
			providerSelect: field["provider.id"],
			seniorSelect: field["senior.id"],
			requested_time: field["requested_time"].split(" ").join("T"),
			modality_destSelectPut: field["modality.id"],
			warning: field["warning"],
			idPatientWl: field["id_auth_user.id"],
			idWl: wlId,
			methodWlItemSubmit: "PUT",
		};

		// Apply updates to form elements
		Object.entries(formUpdates).forEach(([id, value]) => {
			const element = document.getElementById(id);
			if (element) element.value = value;
		});

		// Update radio buttons
		document.querySelectorAll("[name=laterality]").forEach((radio) => {
			radio.checked = radio.value === field.laterality;
		});
		document.querySelectorAll("[name=status_flag]").forEach((radio) => {
			radio.checked = radio.value === field.status_flag;
		});
		document.querySelectorAll("[name=counter]").forEach((radio) => {
			radio.checked = radio.value === field.counter;
		});

		// Show modal
		const modal = document.getElementById("newWlItemModal");
		if (modal && typeof bootstrap !== "undefined") {
			const modalInstance = new bootstrap.Modal(modal);
			modalInstance.show();
		}
	} catch (error) {
		console.error("Error fetching worklist item details:", error);
	}
}

// submit each wl items in wlItemsJson
$("#newWlItemForm").submit(function (e) {
	e.preventDefault();
	let req = $("#methodWlItemSubmit").val();
	let seniorSelect =
		document.getElementById("seniorSelect").options[
			document.getElementById("seniorSelect").selectedIndex
		].text;
	let providerSelect =
		document.getElementById("providerSelect").options[
			document.getElementById("providerSelect").selectedIndex
		].text;
	let patientId = document.getElementById("idPatientWl").value;
	// not to use ? let wlIdEl = document.getElementById('idWl').value;
	// constructing studyData
	let studyData = {};
	studyData.ReferringPhysicianName = seniorSelect.replace(/,/g, "^");
	studyData.ScheduledPerformingPhysicianName = providerSelect.replace(
		/,/g,
		"^"
	);

	// Handle PUT request (edit existing item)
	if (req == "PUT") {
		let itemDataPutStr = $("#newWlItemForm").serializeJSON();
		let itemDataPutObj = JSON.parse(itemDataPutStr);
		delete itemDataPutObj["methodWlItemSubmit"];
		delete itemDataPutObj["modality_dest"];
		itemDataPutObj["modality_dest"] = itemDataPutObj["modality_destPut"];
		delete itemDataPutObj["modality_destPut"];
		// Extract ID before deleting it from the payload
		const id = itemDataPutObj.id;
		delete itemDataPutObj.id; // Remove ID from payload
		itemDataPutStr = JSON.stringify(itemDataPutObj);
		// Use the ID in the URL instead of the payload
		crudp("worklist", id, "PUT", itemDataPutStr);
		hideDiv("#modality_destPutDiv", "visually-hidden", "add");
		hideDiv("#modality_destDiv", "visually-hidden", "remove");
		$table_wl.bootstrapTable("refresh");
		$("#newWlItemModal").modal("hide");
		return;
	}

	// For POST requests (new items), use batch submission
	if (req == "POST") {
		// Show loading indicator
		WorklistState.UI.lockUI("#newWlItemFormSubmit", "Submitting...");

		// Debug: Log state before submission
		console.log("=== Pre-submission Debug ===");
		debugWorklistState();

		// Log the number of pending items
		const pendingItems = WorklistState.Manager.getAllPendingItems();
		console.log(`Submitting ${pendingItems.length} pending items`);

		// Check if we have any items to submit
		if (pendingItems.length === 0) {
			WorklistState.UI.unlockUI("#newWlItemFormSubmit");
			WorklistState.UI.showFeedback(
				"error",
				"No items to submit. Please add items first.",
				"feedbackContainer"
			);
			return;
		}

		// create patient in dicom
		let patientInfo = getUserInfo(patientId);
		patientInfo
			.then((patient) => {
				// Set up patient data for PACS
				let patientData = {};
				patientData.PatientID = patient["items"][0]["id"];
				patientData.PatientName =
					patient["items"][0]["last_name"] +
					"^" +
					patient["items"][0]["first_name"];
				patientData.PatientBirthDate = patient["items"][0]["dob"].replace(
					/-/g,
					""
				);
				patientData.PatientSex = patient["items"][0]["gender.sex"]
					.charAt(0)
					.toUpperCase();
				studyData.PatientID = patient["items"][0]["id"];

				// Add patient to PACS
				let postPatientPacs = addPatientPacs(patientData);
				postPatientPacs
					.then(() => {
						// Use batch submission for all items in the worklist
						console.log("Calling submitBatch()...");
						WorklistState.Manager.submitBatch()
							.then((items) => {
								console.log(
									`Batch submission successful, processing ${items.length} items`
								);
								// Process each created item for various systems (L80, eyesuite, etc.)
								const processingPromises = [];

								items.forEach((item) => {
									// Create a processing promise for each item
									const processPromise = getTableInfo(
										"modality",
										item.modality_dest
									)
										.then(function (modality) {
											const modalityLowCase =
												modality["items"][0]["modality_name"].toLowerCase();
											console.log(
												`Processing item with modality: ${modalityLowCase}`
											);

											studyData.ScheduledProcedureStepStartDate =
												item.requested_time.substring(0, 10).replace(/-/g, "");
											studyData.ScheduledProcedureStepStartTime =
												item.requested_time.substring(11, 16).replace(/:/, "");
											studyData.RequestedProcedureDescription =
												"Opthalmology Procedure";

											// L80/Visionix processing
											if (modalityLowCase == "l80") {
												console.log("L80 detected");
												let firstname = removeAccent(
													patient["items"][0]["first_name"]
												);
												let lastname = removeAccent(
													patient["items"][0]["last_name"]
												);
												let dob = patient["items"][0]["dob"];
												let id = patient["items"][0]["id"];
												let sex = patient["items"][0]["gender.sex"];

												return addPatientVisionix(
													"vx100",
													id,
													lastname,
													firstname,
													dob,
													sex
												)
													.then(() =>
														addPatientVisionix(
															"l80",
															id,
															lastname,
															firstname,
															dob,
															sex
														)
													)
													.catch((error) =>
														console.error(
															"Error adding patient to Visionix/L80:",
															error
														)
													);
											}

											// Octopus/Lenstar processing
											if (
												modalityLowCase == "octopus 900" ||
												modalityLowCase == "lenstar"
											) {
												console.log(modalityLowCase, " detected");
												let firstname = removeAccent(
													patient["items"][0]["first_name"]
												);
												let lastname = removeAccent(
													patient["items"][0]["last_name"]
												);
												let dob = patient["items"][0]["dob"];
												let id = patient["items"][0]["id"];
												let sex = patient["items"][0]["gender.sex"];
												let machineType =
													modalityLowCase === "octopus 900"
														? "PERIMETRY_STATIC"
														: "BIOM_MEASUREMENT";

												return addPatientEyesuite(
													machineType,
													id,
													lastname,
													firstname,
													dob,
													sex
												).catch((error) =>
													console.error(
														"Error adding patient to Eyesuite:",
														error
													)
												);
											}

											// Anterion processing
											if (modalityLowCase == "anterion") {
												console.log("modality is", modalityLowCase);
												studyData.StudyDescription = "Anterior OCT";
												studyData.ScheduledStationAETitle = "ANTERION";

												return addStudyMwl(studyData).catch((error) =>
													console.error("Error adding Anterion to MWL:", error)
												);
											}

											// Pentacam processing
											if (modalityLowCase == "pentacam") {
												console.log("modality is", modalityLowCase);
												studyData.StudyDescription = "Scheimpflug topography";
												studyData.ScheduledStationAETitle = "PENTACAM";

												return addStudyMwl(studyData).catch((error) =>
													console.error("Error adding Pentacam to MWL:", error)
												);
											}

											// MD processing
											if (modalityLowCase == "md") {
												console.log("modality is", modalityLowCase);
												studyData.StudyDescription =
													"Non mydriatic retinography";
												studyData.ScheduledStationAETitle = "CR1";

												return addStudyMwl(studyData).catch((error) =>
													console.error("Error adding CR1 to MWL:", error)
												);
											}

											return Promise.resolve(); // Default return for other modalities
										})
										.catch((error) => {
											console.error(
												`Error getting modality information for item ${item.id}:`,
												error
											);
											return Promise.resolve(); // Continue with other items
										});

									processingPromises.push(processPromise);
								});

								// Wait for all processing to complete
								return Promise.all(processingPromises).then(() => items);
							})
							.then((items) => {
								console.log("All items processed successfully");
								// Update UI and complete the operation
								WorklistState.UI.unlockUI("#newWlItemFormSubmit");
								WorklistState.UI.showFeedback(
									"success",
									"Items added successfully",
									"feedbackContainer"
								);

								// Clear all pending items
								WorklistState.Manager.clearPendingItems();

								// Clear the displayed items and show empty state
								document.getElementById("tbodyItems").innerHTML = `
					<tr id="emptyItemsRow">
						<td colspan="10" class="text-center text-muted py-4">
							<i class="fas fa-inbox fa-2x mb-2 d-block"></i>
							No worklist items selected
						</td>
					</tr>
				`;

								// Refresh the worklist table
								$table_wl.bootstrapTable("refresh");

								// Hide the modal
								$("#newWlItemModal").modal("hide");
							})
							.catch((error) => {
								console.error("Error submitting items in batch:", error);
								WorklistState.UI.unlockUI("#newWlItemFormSubmit");
								WorklistState.UI.showFeedback(
									"error",
									"Error submitting items: " + error,
									"feedbackContainer"
								);

								// Even if we encounter an error, refresh the table since some items may have been created
								$table_wl.bootstrapTable("refresh");
							});
					})
					.catch((error) => {
						console.error("Error adding patient to PACS:", error);
						WorklistState.UI.unlockUI("#newWlItemFormSubmit");
						WorklistState.UI.showFeedback(
							"error",
							"Error adding patient to PACS: " + error,
							"feedbackContainer"
						);
					});
			})
			.catch((error) => {
				console.error("Error getting patient information:", error);
				WorklistState.UI.unlockUI("#newWlItemFormSubmit");
				WorklistState.UI.showFeedback(
					"error",
					"Error getting patient information: " + error,
					"feedbackContainer"
				);
			});
	}
});

function delWlItem(id) {
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
				crudp("worklist", id, "DELETE").then((data) =>
					$table_wl.bootstrapTable("refresh")
				);
			} else {
				console.log("This was logged in the callback: " + result);
			}
		},
	});
}

// set timers
function set_timers(timers) {
	$.each(timers, function (i) {
		$(timers[i]).timer({
			seconds: $(timers[i]).text(),
		});
	});
	timer_id = [];
}

/**
 * Transaction Recovery UI
 */
function initTransactionRecovery() {
	// Add a transaction recovery button to the toolbar
	const toolbarContainer = document.getElementById("toolbar-wl");
	if (toolbarContainer) {
		const recoveryButton = document.createElement("button");
		recoveryButton.type = "button";
		recoveryButton.className = "btn btn-info btn-sm ms-2";
		recoveryButton.id = "transactionManagerBtn";
		recoveryButton.innerHTML =
			'<i class="fas fa-history"></i> Transaction Manager';
		recoveryButton.addEventListener("click", showTransactionManager);
		toolbarContainer.appendChild(recoveryButton);
	}

	// Set up event handlers
	document
		.getElementById("refreshTransactionsBtn")
		.addEventListener("click", loadTransactionHistory);
}

/**
 * Show the transaction manager modal
 */
function showTransactionManager() {
	loadTransactionHistory();
	$("#transactionRecoveryModal").modal("show");
}

/**
 * Load transaction history from local storage and fetch current status
 */
function loadTransactionHistory() {
	const transactions = WorklistState.Manager.getRecentTransactions();
	const tableBody = document.querySelector("#transactionHistoryTable tbody");

	if (!transactions || transactions.length === 0) {
		tableBody.innerHTML =
			'<tr><td colspan="5" class="text-center">No transactions found</td></tr>';
		return;
	}

	// Clear the table
	tableBody.innerHTML = "";

	// Add loading indicator
	transactions.forEach((transaction, index) => {
		const row = document.createElement("tr");
		row.id = `transaction-row-${transaction.id}`;
		row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${new Date(transaction.timestamp).toLocaleString()}</td>
            <td>${transaction.itemCount}</td>
            <td><span class="badge badge-info">Loading...</span></td>
            <td>
                <button class="btn btn-sm btn-outline-info view-transaction" data-transaction-id="${
									transaction.id
								}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning retry-transaction" data-transaction-id="${
									transaction.id
								}" disabled>
                    <i class="fas fa-redo"></i>
                </button>
            </td>
        `;
		tableBody.appendChild(row);

		// Fetch current status from server
		fetchTransactionStatus(transaction.id);
	});

	// Add event listeners for view and retry buttons
	document.querySelectorAll(".view-transaction").forEach((button) => {
		button.addEventListener("click", function () {
			const transactionId = this.getAttribute("data-transaction-id");
			viewTransactionDetails(transactionId);
		});
	});

	document.querySelectorAll(".retry-transaction").forEach((button) => {
		button.addEventListener("click", function () {
			const transactionId = this.getAttribute("data-transaction-id");
			retryTransaction(transactionId);
		});
	});
}

/**
 * Fetch transaction status from the server
 * @param {String} transactionId - The transaction ID to check
 */
function fetchTransactionStatus(transactionId) {
	const statusCell = document.querySelector(
		`#transaction-row-${transactionId} td:nth-child(4)`
	);
	const retryButton = document.querySelector(
		`#transaction-row-${transactionId} .retry-transaction`
	);

	WorklistState.Manager.checkTransactionStatus(transactionId)
		.then((data) => {
			let statusClass = "badge-success";
			let status = data.status;

			// Update the status badge
			if (status === "failed") {
				statusClass = "badge-danger";
				if (retryButton) retryButton.disabled = false;
			} else if (status === "partial") {
				statusClass = "badge-warning";
				if (retryButton) retryButton.disabled = false;
			} else if (status === "in_progress") {
				statusClass = "badge-info";
			}

			if (statusCell) {
				statusCell.innerHTML = `<span class="badge ${statusClass}">${status}</span>`;
			}

			// Update local storage
			const transactions = WorklistState.Manager.getRecentTransactions();
			const updatedTransactions = transactions.map((t) => {
				if (t.id === transactionId) {
					t.status = status;
				}
				return t;
			});
			localStorage.setItem(
				"worklist_transactions",
				JSON.stringify(updatedTransactions)
			);
		})
		.catch((error) => {
			console.error("Error fetching transaction status:", error);
			if (statusCell) {
				statusCell.innerHTML = '<span class="badge badge-danger">Error</span>';
			}
		});
}

/**
 * View transaction details
 * @param {String} transactionId - The transaction ID to view
 */
function viewTransactionDetails(transactionId) {
	const detailsContainer = document.getElementById(
		"transactionDetailsContainer"
	);
	const detailsContent = document.getElementById("transactionDetails");

	detailsContent.innerHTML =
		'<div class="text-center"><div class="spinner-border" role="status"></div><p>Loading transaction details...</p></div>';
	detailsContainer.style.display = "block";

	WorklistState.Manager.checkTransactionStatus(transactionId)
		.then((data) => {
			// Handle missing or incomplete data
			if (!data || typeof data !== "object") {
				throw new Error("Invalid response data from server");
			}

			// Log the full response for debugging
			console.log("Transaction details response:", data);

			// Set default values for missing data
			const transaction_id = data.transaction_id || transactionId;
			const status = data.status || "unknown";
			const item_count = data.item_count || 0;

			let html = `
                <h5>Transaction ${transaction_id}</h5>
                <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(
									status
								)}">${status}</span></p>
                <p><strong>Items:</strong> ${item_count}</p>
            `;

			// Add debug info if there's an error
			if (status === "error" || status === "failed") {
				html += `
                    <div class="alert alert-warning">
                        <p><strong>Debug Information:</strong></p>
                        <pre style="max-height: 100px; overflow-y: auto; font-size: 12px;">${JSON.stringify(
													data,
													null,
													2
												)}</pre>
                    </div>
                `;
			}

			html += `
                <h6>Worklist Items</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Patient</th>
                                <th>Procedure</th>
                                <th>Modality</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

			// Look for worklist items in various possible locations in the response
			let worklist_items = null;

			if (data.worklist_items && Array.isArray(data.worklist_items)) {
				worklist_items = data.worklist_items;
			} else if (data.items && Array.isArray(data.items)) {
				worklist_items = data.items;
			} else if (
				data.data &&
				data.data.items &&
				Array.isArray(data.data.items)
			) {
				worklist_items = data.data.items;
			}

			if (worklist_items && worklist_items.length > 0) {
				worklist_items.forEach((item) => {
					html += `
                        <tr>
                            <td>${item.id || "N/A"}</td>
                            <td>${getPatientName(item)}</td>
                            <td>${
															item.procedure || item.procedure_id || "N/A"
														}</td>
                            <td>${
															item.modality_dest || item.modality || "N/A"
														}</td>
                            <td><span class="badge ${getStatusBadgeClass(
															item.status_flag || item.status
														)}">${
						item.status_flag || item.status || "unknown"
					}</span></td>
                        </tr>
                    `;
				});
			} else {
				html +=
					'<tr><td colspan="5" class="text-center">No items found</td></tr>';
			}

			html += `
                        </tbody>
                    </table>
                </div>
                
                <h6>Audit Records</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Operation</th>
                                <th>Status</th>
                                <th>Record ID</th>
                                <th>Error</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

			// Look for audit records in various possible locations in the response
			let audit_records = null;

			if (data.audit_records && Array.isArray(data.audit_records)) {
				audit_records = data.audit_records;
			} else if (data.audits && Array.isArray(data.audits)) {
				audit_records = data.audits;
			} else if (
				data.data &&
				data.data.audits &&
				Array.isArray(data.data.audits)
			) {
				audit_records = data.data.audits;
			}

			if (audit_records && audit_records.length > 0) {
				audit_records.forEach((record) => {
					html += `
                        <tr>
                            <td>${record.operation || "N/A"}</td>
                            <td><span class="badge ${getStatusBadgeClass(
															record.status
														)}">${record.status || "unknown"}</span></td>
                            <td>${record.record_id || record.id || "-"}</td>
                            <td>${
															record.error_message || record.error || "-"
														}</td>
                        </tr>
                    `;
				});
			} else {
				html +=
					'<tr><td colspan="4" class="text-center">No audit records found</td></tr>';
			}

			html += `
                        </tbody>
                    </table>
                </div>
            `;

			detailsContent.innerHTML = html;
		})
		.catch((error) => {
			console.error("Error fetching transaction details:", error);
			detailsContent.innerHTML = `
                <div class="alert alert-danger">
                    <h5>Transaction ${transactionId}</h5>
                    <p><strong>Status:</strong> <span class="badge bg-danger">error</span></p>
                    <p>Error loading transaction details: ${
											error.message || "Unknown error"
										}</p>
                    <p>This may indicate that the transaction record doesn't exist or the connection failed.</p>
                </div>
            `;
		});
}

/**
 * Extract patient name from item data in different possible formats
 * @param {Object} item - The worklist item
 * @returns {String} Formatted patient name or placeholder
 */
function getPatientName(item) {
	// Handle different ways the patient data might be structured
	if (item.patient_name) {
		return item.patient_name;
	}

	if (item.patient) {
		return item.patient;
	}

	if (
		item.id_auth_user_details &&
		(item.id_auth_user_details.first_name ||
			item.id_auth_user_details.last_name)
	) {
		return `${item.id_auth_user_details.last_name || ""}, ${
			item.id_auth_user_details.first_name || ""
		}`;
	}

	if (item.id_auth_user) {
		return `ID: ${item.id_auth_user}`;
	}

	return "N/A";
}

/**
 * Get appropriate Bootstrap badge class for a status
 * @param {String} status - The status value
 * @returns {String} The badge class to use
 */
function getStatusBadgeClass(status) {
	if (!status) return "bg-secondary";

	switch (status.toLowerCase()) {
		case "complete":
		case "completed":
		case "done":
			return "bg-success";
		case "failed":
		case "error":
			return "bg-danger";
		case "partial":
		case "warning":
			return "bg-warning";
		case "in_progress":
		case "processing":
		case "requested":
			return "bg-info";
		case "cancelled":
			return "bg-secondary";
		default:
			return "bg-secondary";
	}
}

/**
 * Retry a failed transaction
 * @param {String} transactionId - The transaction ID to retry
 */
function retryTransaction(transactionId) {
	const retryButton = document.querySelector(
		`#transaction-row-${transactionId} .retry-transaction`
	);
	const statusCell = document.querySelector(
		`#transaction-row-${transactionId} td:nth-child(4)`
	);

	if (retryButton) {
		retryButton.disabled = true;
		retryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
	}

	if (statusCell) {
		statusCell.innerHTML = '<span class="badge badge-info">Retrying...</span>';
	}

	WorklistState.Manager.retryTransaction(transactionId)
		.then((data) => {
			WorklistState.UI.showFeedback(
				"success",
				`Transaction recovery ${data.status}: ${data.message}`,
				"feedbackContainer"
			);

			// Refresh the transaction status
			fetchTransactionStatus(transactionId);

			// If details are open, refresh them
			if (
				document.getElementById("transactionDetailsContainer").style.display !==
				"none"
			) {
				viewTransactionDetails(transactionId);
			}

			if (retryButton) {
				retryButton.innerHTML = '<i class="fas fa-redo"></i>';
			}
		})
		.catch((error) => {
			console.error("Error retrying transaction:", error);
			WorklistState.UI.showFeedback(
				"error",
				`Transaction recovery failed: ${error.message}`,
				"feedbackContainer"
			);

			if (statusCell) {
				statusCell.innerHTML =
					'<span class="badge badge-danger">Retry Failed</span>';
			}

			if (retryButton) {
				retryButton.disabled = false;
				retryButton.innerHTML = '<i class="fas fa-redo"></i>';
			}
		});
}

// Initialize transaction recovery when the page loads
document.addEventListener("DOMContentLoaded", function () {
	// Initialize transaction recovery after the main worklist is initialized
	if (typeof initWorklist === "function") {
		const originalInitWorklist = initWorklist;
		initWorklist = function () {
			originalInitWorklist();
			initTransactionRecovery();
		};
	} else {
		// If initWorklist doesn't exist yet, check again later
		setTimeout(function () {
			if (typeof initWorklist === "function") {
				const originalInitWorklist = initWorklist;
				initWorklist = function () {
					originalInitWorklist();
					initTransactionRecovery();
				};
			} else {
				console.error(
					"initWorklist function not found, cannot initialize transaction recovery"
				);
			}
		}, 1000);
	}
});

// Enhanced debugging function for better analysis
function debugWorklistState() {
	const pending = WorklistState.Manager.getAllPendingItems();
	const bootstrapTableData = $table_wl
		? $table_wl.bootstrapTable("getData")
		: [];
	const pendingTableRows = document.querySelectorAll(
		"#tbodyItems tr:not(#emptyItemsRow)"
	);

	console.log("=== Enhanced Worklist State Debug ===");
	console.log(`Pending items in state manager: ${pending.length}`);
	console.log(`Bootstrap table data rows: ${bootstrapTableData.length}`);
	console.log(`DOM pending rows: ${pendingTableRows.length}`);

	// Check pending items (client-side only) for uniqueIds
	let invalidPendingUniqueIds = 0;
	pendingTableRows.forEach((row, index) => {
		const uniqueId = row.dataset.uniqueId;
		if (!uniqueId || uniqueId === "undefined" || uniqueId === "null") {
			invalidPendingUniqueIds++;
			console.warn(
				`⚠️  Pending Row ${index}: uniqueId is invalid (${uniqueId})`
			);
		} else {
			console.log(`✅ Pending Row ${index}: uniqueId = ${uniqueId}`);
		}
	});

	// Bootstrap table data (server data) should NOT have uniqueIds - this is expected
	console.log(
		`📊 Server data rows (no uniqueIds expected): ${bootstrapTableData.length}`
	);

	if (invalidPendingUniqueIds > 0) {
		console.error(
			`🚨 Found ${invalidPendingUniqueIds} pending rows with invalid uniqueIds - deletion will fail!`
		);
		console.log(
			"🔧 These are PENDING items that need proper uniqueId assignment"
		);
	} else {
		console.log("✅ All pending items have valid uniqueIds");
	}

	// State manager pending items analysis
	pending.forEach((item, index) => {
		console.log(
			`State Manager Item ${index}: uniqueId = ${item.uniqueId}, modality = ${item.modality_dest}, patient = ${item.id_auth_user}`
		);
	});

	// Count analysis
	const totalUIItems = bootstrapTableData.length + pendingTableRows.length;
	const stateTotal = pending.length;

	console.log(
		`📊 Total UI items: ${totalUIItems} (${bootstrapTableData.length} server + ${pendingTableRows.length} pending)`
	);
	console.log(`📊 State manager items: ${stateTotal}`);

	if (stateTotal !== pendingTableRows.length) {
		console.warn(
			`⚠️  MISMATCH: State manager (${stateTotal}) and pending DOM rows (${pendingTableRows.length}) don't match!`
		);
	} else {
		console.log("✅ State manager and pending items counts match");
	}

	console.log("=== End Enhanced Debug ===");
}

// Make debug function available globally for testing
window.debugWorklistState = debugWorklistState;

// Helper function for testing - available in browser console
window.testWorklistFunctions = function () {
	console.log("=== Worklist Testing Functions ===");
	console.log("Available test functions:");
	console.log("- debugWorklistState(): Check current state");
	console.log(
		"- WorklistState.Manager.getAllPendingItems(): Get pending items"
	);
	console.log(
		"- WorklistState.Manager.pendingItems: Direct access to pending items map"
	);
	console.log(
		'- document.querySelectorAll("#tbodyItems tr"): Get visible table rows'
	);
	console.log("===================================");

	// Run initial debug
	debugWorklistState();
};

// Helper function for consistent item addition with tracking
function addItemWithTracking(itemData) {
	const uniqueId = WorklistState.Manager.addItem(itemData);
	WorklistState.Manager.updateItemStatus(uniqueId, "pending");
	console.log(`Item added with tracking: uniqueId = ${uniqueId}`);
	return uniqueId;
}
