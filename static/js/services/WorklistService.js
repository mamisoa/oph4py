import { ApiService } from "./ApiService.js";
import { ModalityService } from "./ModalityService.js";

/**
 * Service class to handle worklist operations
 * @class WorklistService
 */
export class WorklistService {
	/**
	 * Transform form data to patient data object
	 * @param {Object} patientInfo - Raw patient information
	 * @returns {Object} Transformed patient data
	 */
	static transformPatientData(patientInfo) {
		const patient = patientInfo.items[0];
		return {
			PatientID: patient.id,
			PatientName: `${patient.last_name}^${patient.first_name}`,
			PatientBirthDate: patient.dob.replace(/-/g, ""),
			PatientSex: patient["gender.sex"].charAt(0).toUpperCase(),
			id: patient.id,
			lastname: patient.last_name,
			firstname: patient.first_name,
			dob: patient.dob,
			sex: patient["gender.sex"],
		};
	}

	/**
	 * Transform form data to study data object
	 * @param {string} seniorName - Senior doctor name
	 * @param {string} providerName - Provider name
	 * @param {string} patientId - Patient ID
	 * @param {string} requestedTime - Requested time for the study
	 * @returns {Object} Study data object
	 */
	static createStudyData(seniorName, providerName, patientId, requestedTime) {
		return {
			ReferringPhysicianName: seniorName.replace(/,/g, "^"),
			ScheduledPerformingPhysicianName: providerName.replace(/,/g, "^"),
			PatientID: patientId,
			ScheduledProcedureStepStartDate: requestedTime
				.substring(0, 10)
				.replace(/-/g, ""),
			ScheduledProcedureStepStartTime: requestedTime
				.substring(11, 16)
				.replace(":", ""),
			RequestedProcedureDescription: "Ophthalmology Procedure",
		};
	}

	/**
	 * Process a single worklist item
	 * @param {Object} itemData - Worklist item data
	 * @param {Object} patientData - Patient data
	 * @param {Object} studyData - Study data
	 * @returns {Promise<void>}
	 */
	static async processWorklistItem(itemData, patientData, studyData) {
		try {
			// Get UUID for the message
			const uuid = await ApiService.generateUuid();
			itemData.message_unique_id = uuid.unique_id;

			// Save worklist item
			const savedItem = await ApiService.handleWorklistItem(
				"POST",
				null,
				itemData
			);

			// Get modality information
			const modalityInfo = await ApiService.getModalityInfo(
				itemData.modality_dest
			);
			const modalityType = modalityInfo.items[0].modality_name.toLowerCase();

			// Process modality-specific operations
			await ModalityService.processModality(
				modalityType,
				patientData,
				studyData
			);
		} catch (error) {
			console.error("Error processing worklist item:", error);
			throw error;
		}
	}

	/**
	 * Submit worklist form
	 * @param {HTMLFormElement} form - The form element
	 * @returns {Promise<void>}
	 */
	static async submitWorklistForm(form) {
		try {
			const formData = new FormData(form);
			const method = formData.get("methodWlItemSubmit");

			if (method === "POST") {
				await this.handlePost(form);
			} else if (method === "PUT") {
				await this.handlePut(form);
			}

			// Refresh worklist table and close modal
			document.querySelector(".bootstrap-table").refresh();
			const modal = document.getElementById("newWlItemModal");
			const bootstrapModal = bootstrap.Modal.getInstance(modal);
			bootstrapModal.hide();
		} catch (error) {
			console.error("Error submitting worklist form:", error);
			throw error;
		}
	}

	/**
	 * Handle POST request for new worklist items
	 * @private
	 * @param {HTMLFormElement} form - The form element
	 * @returns {Promise<void>}
	 */
	static async handlePost(form) {
		// Get form data
		const patientId = form.querySelector("#idPatientWl").value;
		const seniorSelect = form.querySelector("#seniorSelect");
		const providerSelect = form.querySelector("#providerSelect");
		const seniorName = seniorSelect.options[seniorSelect.selectedIndex].text;
		const providerName =
			providerSelect.options[providerSelect.selectedIndex].text;

		try {
			// Get patient information
			const patientInfo = await ApiService.getUserInfo(patientId);
			const patientData = this.transformPatientData(patientInfo);

			// Add patient to PACS
			await ApiService.addPatientToPacs(patientData);

			// Create study data
			const studyData = this.createStudyData(
				seniorName,
				providerName,
				patientId,
				form.querySelector("#requested_time").value
			);

			// Process each worklist item
			const worklistItems = document.querySelectorAll('[id^="wlItem"]');
			for (const item of worklistItems) {
				const itemData = JSON.parse(item.dataset.json);
				await this.processWorklistItem(itemData, patientData, studyData);
				item.remove(); // Remove processed item from DOM
			}
		} catch (error) {
			console.error("Error in POST handling:", error);
			throw error;
		}
	}

	/**
	 * Handle PUT request for updating worklist items
	 * @private
	 * @param {HTMLFormElement} form - The form element
	 * @returns {Promise<void>}
	 */
	static async handlePut(form) {
		try {
			const formData = new FormData(form);
			const data = Object.fromEntries(formData.entries());

			// Clean up data
			delete data.methodWlItemSubmit;
			delete data.modality_dest;
			data.modality_dest = data.modality_destPut;
			delete data.modality_destPut;

			const id = data.id;
			delete data.id;

			// Update worklist item
			await ApiService.handleWorklistItem("PUT", id, data);

			// Update UI
			document
				.querySelector("#modality_destPutDiv")
				.classList.add("visually-hidden");
			document
				.querySelector("#modality_destDiv")
				.classList.remove("visually-hidden");
		} catch (error) {
			console.error("Error in PUT handling:", error);
			throw error;
		}
	}
}
