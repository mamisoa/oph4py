/**
 * Service class to handle UI-specific operations
 * @class UiService
 */
export class UiService {
	/**
	 * Append a worklist item to the table
	 * @param {string} dataStr - JSON string of item data
	 * @param {number} counter - Row counter
	 * @param {string} [modalityName] - Optional modality name
	 */
	static appendWlItem(dataStr, counter, modalityName) {
		const itemData = {
			From: document.getElementById("sendingFacilitySelect").selectedOptions[0]
				.text,
			To: document.getElementById("receivingFacilitySelect").selectedOptions[0]
				.text,
			Procedure:
				document.getElementById("procedureSelect").selectedOptions[0].text,
			Provider:
				document.getElementById("providerSelect").selectedOptions[0].text,
			Senior: document.getElementById("seniorSelect").selectedOptions[0].text,
			Timeslot: document.getElementById("requested_time").value,
			Modality:
				modalityName ||
				document.getElementById("modality_destSelect").selectedOptions[0].text,
			Status: document.querySelector('input[name="status_flag"]:checked').value,
			Counter: document.querySelector('input[name="counter"]').value,
			warning: document.querySelector('input[name="warning"]').value,
		};

		// Create table header
		const headerRow = document.createElement("tr");
		Object.keys(itemData).forEach((key) => {
			const th = document.createElement("th");
			th.scope = "col";
			th.textContent = key;
			headerRow.appendChild(th);
		});
		document.getElementById("theadItems").innerHTML = "";
		document.getElementById("theadItems").appendChild(headerRow);

		// Create table row
		const row = document.createElement("tr");
		row.id = `wlItem${counter}`;

		// Add data cells
		Object.values(itemData).forEach((value) => {
			const td = document.createElement("td");
			td.textContent = value;
			row.appendChild(td);
		});

		// Add delete button
		const actionTd = document.createElement("td");
		actionTd.className = "list-group-item";
		actionTd.innerHTML = `
            <button type="button" class="btn btn-danger btn-sm" onclick="delWlItemModal('${counter}');" data-index="${counter}">
                <i class="far fa-trash-alt"></i>
            </button>
        `;
		row.appendChild(actionTd);

		// Store JSON data
		row.dataset.json = dataStr;

		// Append row to table
		document.getElementById("tbodyItems").appendChild(row);
	}

	/**
	 * Toggle visibility of an element
	 * @param {string} elementId - ID of the element
	 * @param {string} className - Class to toggle
	 * @param {string} action - 'add' or 'remove'
	 */
	static toggleVisibility(elementId, className, action) {
		const element = document.querySelector(elementId);
		if (element) {
			action === "add"
				? element.classList.add(className)
				: element.classList.remove(className);
		}
	}

	/**
	 * Show worklist modal for a user
	 * @param {string} userId - User ID
	 */
	static showWorklistModal(userId) {
		// Reset form
		window.resetWlForm();

		// Show required divs
		["wlItemAddDiv", "wlItemsDiv"].forEach((id) => {
			this.toggleVisibility(`#${id}`, "visually-hidden", "remove");
		});

		// Clear table and set patient ID
		document.getElementById("tbodyItems").innerHTML = "";
		document.getElementById("idPatientWl").value = userId;

		// Show modal
		const modal = new bootstrap.Modal(
			document.getElementById("newWlItemModal")
		);
		modal.show();
	}

	/**
	 * Show edit worklist modal
	 * @param {string} wlId - Worklist ID
	 */
	static async showEditWorklistModal(wlId) {
		// Reset form and counter
		window.resetWlForm();
		window.wlItemsCounter = 0;

		// Hide and show appropriate divs
		["wlItemAddDiv", "wlItemsDiv"].forEach((id) => {
			this.toggleVisibility(`#${id}`, "visually-hidden", "add");
		});
		this.toggleVisibility("#modality_destDiv", "visually-hidden", "add");
		this.toggleVisibility("#modality_destPutDiv", "visually-hidden", "remove");

		// Update modal title
		document.querySelector(
			"#newWlItemModal h5.modal-title"
		).textContent = `Edit worklist item #${wlId}`;

		try {
			// Fetch worklist details
			const response = await fetch(
				`${window.HOSTURL}/${window.APP_NAME}/api/worklist/${wlId}?@lookup=id_auth_user!:id_auth_user[id,first_name,last_name],provider!:provider[id,first_name,last_name],procedure!:procedure,modality!:modality_dest[id,modality_name],receiving_facility!:receiving_facility[id,facility_name],sending_facility!:sending_facility[id,facility_name],senior!:senior[id,first_name,last_name]`
			);
			const data = await response.json();

			if (data.status === "error") {
				throw new Error("Cannot retrieve worklist details");
			}

			const field = data.items[0];

			// Reset form and populate fields
			const form = document.getElementById("newWlItemForm");
			form.reset();

			// Set form values
			this.setFormValues(form, field);

			// Show modal
			const modal = new bootstrap.Modal(
				document.getElementById("newWlItemModal")
			);
			modal.show();
		} catch (error) {
			console.error("Error showing edit modal:", error);
			alert("Error loading worklist details. Please try again.");
		}
	}

	/**
	 * Set form values for edit modal
	 * @private
	 * @param {HTMLFormElement} form - The form element
	 * @param {Object} field - Field data
	 */
	static setFormValues(form, field) {
		// Set select values
		form.querySelector("#sendingFacilitySelect").value =
			field["sending_facility.id"];
		form.querySelector("#receivingFacilitySelect").value =
			field["receiving_facility.id"];
		form.querySelector("#procedureSelect").value = field["procedure.id"];
		form.querySelector("#providerSelect").value = field["provider.id"];
		form.querySelector("#seniorSelect").value = field["senior.id"];
		form.querySelector("#modality_destSelectPut").value = field["modality.id"];

		// Set other values
		form.querySelector("#requested_time").value = field["requested_time"]
			.split(" ")
			.join("T");
		form.querySelector(
			`[name=laterality][value=${field.laterality}]`
		).checked = true;
		form.querySelector(
			`[name=status_flag][value=${field.status_flag}]`
		).checked = true;
		form.querySelector("[name=counter]").value = field.counter;
		form.querySelector("#warning").value = field.warning;
		form.querySelector("#idPatientWl").value = field["id_auth_user.id"];
		form.querySelector("#idWl").value = field.id;
		form.querySelector("#methodWlItemSubmit").value = "PUT";
	}
}
