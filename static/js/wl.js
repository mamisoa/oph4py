import { WorklistService } from "./services/WorklistService.js";
import { UiService } from "./services/UiService.js";

// Initialize worklist form
document.addEventListener("DOMContentLoaded", () => {
	// Set default time offset if not defined
	window.timeOffsetInHours = window.timeOffsetInHours || 0;
	
	// Initialize form
	initializeForm();

	// Add event listeners
	addEventListeners();
});

/**
 * Initialize the worklist form
 */
function initializeForm() {
	resetWlForm();
}

/**
 * Add event listeners to form elements
 */
function addEventListeners() {
	// Procedure select change
	document
		.getElementById("procedureSelect")
		.addEventListener("change", function () {
			setModalityOptions(this.value);
		});

	// Counter buttons
	document.querySelectorAll(".btn.counter_down").forEach((button) => {
		button.addEventListener("click", () => {
			const input = document.querySelector("input.counter");
			const value = parseInt(input.value);
			if (value >= 1) {
				input.value = value - 1;
			}
		});
	});

	document.querySelectorAll(".btn.counter_up").forEach((button) => {
		button.addEventListener("click", () => {
			const input = document.querySelector("input.counter");
			const value = parseInt(input.value);
			if (value >= 0) {
				input.value = value + 1;
			}
		});
	});

	// Form submission
	document
		.getElementById("newWlItemForm")
		.addEventListener("submit", async (e) => {
			e.preventDefault();
			try {
				await WorklistService.submitWorklistForm(e.target);
			} catch (error) {
				console.error("Error submitting form:", error);
				// Show error to user
				alert("Error submitting form. Please try again.");
			}
		});
}

/**
 * Reset the worklist form to default values
 */
function resetWlForm() {
	try {
		const now = new Date();
		// Use a default offset of 0 if timeOffsetInHours is not defined
		const offset = window.timeOffsetInHours || 0;
		now.setHours(now.getHours() + offset);

		const requestedTimeInput = document.getElementById("requested_time");
		if (requestedTimeInput) {
			requestedTimeInput.value = now.toJSON().slice(0, 16);
		}

		const lateralityInput = document.querySelector("[name=laterality][value=both]");
		if (lateralityInput) {
			lateralityInput.checked = true;
		}

		const statusInput = document.querySelector("[name=status_flag][value=requested]");
		if (statusInput) {
			statusInput.checked = true;
		}

		const warningInput = document.querySelector("[name=warning]");
		if (warningInput) {
			warningInput.value = "";
		}

		const procedureSelect = document.getElementById("procedureSelect");
		if (procedureSelect) {
			setModalityOptions(procedureSelect.value);
		}
	} catch (error) {
		console.error("Error resetting form:", error);
	}
}

/**
 * Set modality options based on procedure
 * @param {string} procedureId - ID of the selected procedure
 */
async function setModalityOptions(procedureId) {
	try {
		const response = await fetch(
			`${window.HOSTURL}/${window.APP_NAME}/api/modality?id_modality.procedure_family.id_procedure.eq=${procedureId}`
		);
		const data = await response.json();

		if (data.status === "error" || data.count === 0) {
			throw new Error("Cannot retrieve modality options");
		}

		const html = data.items
			.map(
				(item) => `<option value="${item.id}">${item.modality_name}</option>`
			)
			.join("");

		document.getElementById("modality_destSelect").innerHTML = html;
	} catch (error) {
		console.error("Error setting modality options:", error);
		alert("Error loading modality options. Please try again.");
	}
}

/**
 * Add new item to worklist
 */
document.getElementById("btnWlItemAdd").addEventListener("click", () => {
	const form = document.getElementById("newWlItemForm");
	const formData = new FormData(form);
	const formDataObj = Object.fromEntries(formData.entries());

	// Clean up data
	delete formDataObj.modality_destPut;
	delete formDataObj.idWl;

	if (formDataObj.modality_dest === window.multiplemod) {
		handleMultipleModalities(formDataObj);
	} else {
		delete formDataObj.modality_name;
		delete formDataObj.id;
		UiService.appendWlItem(JSON.stringify(formDataObj), window.wlItemsCounter);
	}
});

/**
 * Handle multiple modalities case
 * @param {Object} formDataObj - Form data object
 */
async function handleMultipleModalities(formDataObj) {
	try {
		const response = await fetch(
			`${window.HOSTURL}/${window.APP_NAME}/api/combo?@lookup=id_procedure!:id_procedure[exam_name],id_modality!:id_modality&@count=true&id_procedure=${formDataObj.procedure}`
		);
		const data = await response.json();

		if (data.status === "error" || !data.count) {
			throw new Error("Cannot retrieve combo exams");
		}

		const modalityMap = {};
		data.items.forEach((item) => {
			modalityMap[item["id_modality.modality_name"]] = item["id_modality.id"];
		});

		Object.entries(modalityMap).forEach(([modalityName, modalityId]) => {
			const itemData = { ...formDataObj };
			itemData.modality_dest = modalityId;

			if (modalityName === "MD") {
				itemData.counter = 1;
			}

			UiService.appendWlItem(
				JSON.stringify(itemData),
				window.wlItemsCounter,
				modalityName
			);
		});
	} catch (error) {
		console.error("Error handling multiple modalities:", error);
		alert("Error processing multiple modalities. Please try again.");
	}
}

/**
 * Delete worklist item
 * @param {string} itemId - ID of the item to delete
 */
function delWlItemModal(itemId) {
	document.getElementById(`wlItem${itemId}`).remove();
}

// Export functions that need to be accessed globally
window.delWlItemModal = delWlItemModal;
window.resetWlForm = resetWlForm;
