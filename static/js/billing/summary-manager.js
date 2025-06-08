/**
 * Manages the patient summary page, including loading patient information
 * and their consultation history with "load more" functionality.
 *
 * This class handles:
 * - Fetching patient details for the information card.
 * - Loading the initial set of 10 consultation history records.
 * - Appending subsequent sets of 10 records when the user clicks "View More".
 * - Displaying loading, error, and empty states for the consultation history.
 */

// Helper function to calculate age
function calculateAge(dob) {
	if (!dob) return null;
	const birthDate = new Date(dob);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}

// Helper function to escape HTML for use in attributes
function escapeHtml(text) {
	if (!text) return "";
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

// Helper function to truncate text
function truncateText(text, maxLength) {
	if (!text) return "-";
	return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

class SummaryManager {
	/**
	 * @param {number} patientId - The ID of the patient.
	 * @param {object} options - Configuration options.
	 * @param {string} options.hostUrl - The base URL of the application.
	 * @param {string} options.appName - The name of the py4web application.
	 */
	constructor(patientId, options = {}) {
		this.patientId = patientId;
		this.options = options;
		this.offset = 0;
		this.limit = 10;
		this.totalConsultations = 0;
		this.currentConsultations = 0;
		this.isLoading = false;

		this.elements = {
			// Patient card elements
			patientName: document.querySelector(".patientName"),
			patientDob: document.querySelector(".patientDob"),
			patientAge: document.querySelector(".patientAge"),
			patientGender: document.querySelector(".patientGender"),
			patientId: document.querySelector(".patientId"),
			patientSsn: document.querySelector(".patientSsn"),
			patientCard: document.querySelector(".patientCard"),
			patientEmail: document.querySelector(".patientEmail"),
			lastVisit: document.querySelector(".lastVisit"),
			totalConsultations: document.getElementById("total-consultations"),
			patientSince: document.querySelector(".patient-since"),
			photoId: document.querySelector(".photoId"),

			// MD Summary elements
			summaryContent: document.getElementById("md-summary-content"),
			summaryBody: document.getElementById("md-summary-body"),
			summaryLoading: document.getElementById("md-summary-loading"),
			summaryError: document.getElementById("md-summary-error"),
			summaryEmpty: document.getElementById("md-summary-empty"),
			summaryStats: document.getElementById("md-summary-stats"),
			summaryShowing: document.getElementById("md-summary-showing"),
			summaryTotal: document.getElementById("md-summary-total"),
			viewMoreContainer: document.getElementById(
				"md-summary-view-more-container"
			),
			viewMoreButton: document.getElementById("btn-md-summary-view-more"),
			retryButton: document.getElementById("retry-md-summary-btn"),
		};
	}

	/**
	 * Initializes the summary manager by loading data and setting up event listeners.
	 */
	init() {
		console.log("SummaryManager initialized for patient:", this.patientId);
		this.loadPatientInfo();
		this.loadSummary();
		this.setupEventListeners();
	}

	/**
	 * Fetches and displays the main patient information in the top card.
	 */
	async loadPatientInfo() {
		if (!this.patientId) return;

		try {
			// Add @lookup=gender to fetch the gender text representation directly.
			const response = await fetch(
				`/${this.options.appName}/api/auth_user?id.eq=${this.patientId}&@lookup=gender`
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const result = await response.json();
			const patient =
				result.items && result.items.length > 0 ? result.items[0] : null;

			if (patient) {
				this.displayPatientInfo(patient);
				this.loadPatientPhoto(patient);
			} else {
				this.handlePatientInfoError("Patient not found.");
			}
		} catch (error) {
			console.error("Error loading patient info:", error);
			this.handlePatientInfoError(error.message);
		}
	}

	/**
	 * Populates the patient information card with data from the API.
	 * @param {object} patient - The patient data object.
	 */
	displayPatientInfo(patient) {
		this.elements.patientName.textContent = `${patient.first_name || ""} ${
			patient.last_name || ""
		}`;
		this.elements.patientDob.textContent = patient.dob
			? new Date(patient.dob).toLocaleDateString()
			: "--";
		this.elements.patientAge.textContent = patient.dob
			? `${calculateAge(patient.dob)} years`
			: "-- years";
		// Handle gender object from @lookup parameter, using the correct 'sex' key.
		this.elements.patientGender.textContent =
			patient.gender && typeof patient.gender === "object" && patient.gender.sex
				? patient.gender.sex
				: "--";
		this.elements.patientId.textContent = patient.id || "--";
		this.elements.patientSsn.textContent = patient.ssn || "--";
		this.elements.patientCard.textContent = patient.idc_num || "--"; // Correct field for card number
		this.elements.patientEmail.textContent = patient.email || "--";
		this.elements.patientSince.textContent = patient.created_on
			? new Date(patient.created_on).getFullYear()
			: "--";
	}

	/**
	 * Displays an error state in the patient information card.
	 * @param {string} message - The error message to display.
	 */
	handlePatientInfoError(message) {
		this.elements.patientName.textContent = "Error";
		this.elements.patientName.classList.add("text-danger");
		console.error("Failed to load patient info:", message);
	}

	/**
	 * Loads the patient's photo, handling base64 data and gender-based fallbacks.
	 * @param {object} patient - The patient data object.
	 */
	loadPatientPhoto(patient) {
		const baseUrl = `${this.options.hostUrl}/${this.options.appName}`;
		// The gender property is now an object from the lookup, so we access its ID for the fallback logic.
		const genderId =
			patient.gender && patient.gender.id ? patient.gender.id : null;
		const defaultAvatar =
			genderId === 1
				? `${baseUrl}/images/assets/avatar/mini-man.svg`
				: `${baseUrl}/images/assets/avatar/mini-woman.svg`;

		if (patient.photob64) {
			// Check if the base64 string already includes the data URI prefix.
			if (patient.photob64.startsWith("data:image")) {
				this.elements.photoId.src = patient.photob64;
			} else {
				// If not, add the prefix.
				this.elements.photoId.src = `data:image/jpeg;base64,${patient.photob64}`;
			}
		} else {
			this.elements.photoId.src = defaultAvatar;
		}

		this.elements.photoId.onerror = () => {
			this.elements.photoId.src = defaultAvatar;
		};
	}

	/**
	 * Loads the consultation history from the API.
	 * Handles both the initial load and subsequent "View More" clicks.
	 * @param {boolean} loadMore - If true, appends data; otherwise, clears and loads.
	 */
	async loadSummary(loadMore = false) {
		if (this.isLoading) return;
		this.isLoading = true;

		if (!loadMore) {
			this.offset = 0;
			this.currentConsultations = 0;
			this.elements.summaryBody.innerHTML = ""; // Clear existing data for initial load
			this.elements.summaryLoading.style.display = "block";
			this.elements.summaryContent.style.display = "none";
			this.elements.summaryError.style.display = "none";
			this.elements.viewMoreContainer.style.display = "none";
		} else {
			this.elements.viewMoreButton.disabled = true;
			this.elements.viewMoreButton.innerHTML =
				'<i class="fas fa-spinner fa-spin me-1"></i>Loading...';
		}

		try {
			const url = `/${this.options.appName}/api/patient/${this.patientId}/md_summary/${this.offset}`;
			const response = await fetch(url);
			if (!response.ok)
				throw new Error(`HTTP error! status: ${response.status}`);

			const result = await response.json();
			const data = result.data;

			if (data && data.items) {
				// On initial load, set the last visit date from the most recent consultation.
				if (!loadMore) {
					if (data.items.length > 0 && data.items[0].requested_time) {
						this.elements.lastVisit.textContent = new Date(
							data.items[0].requested_time
						).toLocaleDateString();
					} else {
						this.elements.lastVisit.textContent = "N/A";
					}
				}

				this.renderSummary(data.items);
				this.totalConsultations = data.total_count;
				this.currentConsultations += data.items.length;
				this.updateSummaryStats();

				if (data.has_more) {
					this.elements.viewMoreContainer.style.display = "block";
				} else {
					this.elements.viewMoreContainer.style.display = "none";
				}

				if (this.totalConsultations === 0) {
					this.elements.summaryEmpty.style.display = "block";
				}
			} else {
				throw new Error("Invalid data structure from API");
			}
		} catch (error) {
			console.error("Error loading MD summary:", error);
			this.elements.summaryError.style.display = "block";
		} finally {
			this.isLoading = false;
			this.elements.summaryLoading.style.display = "none";
			this.elements.summaryContent.style.display = "block";

			if (loadMore) {
				this.elements.viewMoreButton.disabled = false;
				this.elements.viewMoreButton.innerHTML =
					'<i class="fas fa-plus me-1"></i>View More';
			}
		}
	}

	/**
	 * Renders the fetched consultation history into the table.
	 * @param {Array<object>} items - An array of consultation records.
	 */
	renderSummary(items) {
		if (items.length === 0 && this.offset === 0) {
			this.elements.summaryEmpty.style.display = "block";
			this.elements.summaryStats.style.display = "none";
			return;
		}

		const fragment = document.createDocumentFragment();
		items.forEach((item) => {
			const row = document.createElement("tr");
			row.innerHTML = `
				<td>${
					item.requested_time
						? new Date(item.requested_time).toLocaleString()
						: "-"
				}</td>
				<td title="${escapeHtml(item.procedure)}">${truncateText(
				item.procedure,
				50
			)}</td>
				<td title="${escapeHtml(item.history)}">${truncateText(item.history, 80)}</td>
				<td title="${escapeHtml(item.conclusion)}">${truncateText(
				item.conclusion,
				80
			)}</td>
				<td title="${escapeHtml(item.followup)}">${truncateText(item.followup, 70)}</td>
				<td title="${escapeHtml(item.billing_desc)}">${truncateText(
				item.billing_desc,
				50
			)}</td>
				<td title="${escapeHtml(item.billing_codes)}">${item.billing_codes || "-"}</td>
			`;
			fragment.appendChild(row);
		});
		this.elements.summaryBody.appendChild(fragment);
		this.offset += items.length; // Increment offset
	}

	/**
	 * Updates the summary statistics display.
	 */
	updateSummaryStats() {
		this.elements.summaryStats.style.display = "block";
		this.elements.summaryShowing.textContent = this.currentConsultations;
		this.elements.summaryTotal.textContent = this.totalConsultations;
		this.elements.totalConsultations.textContent = this.totalConsultations;
	}

	/**
	 * Sets up event listeners for interactive elements.
	 */
	setupEventListeners() {
		this.elements.viewMoreButton.addEventListener("click", () =>
			this.loadSummary(true)
		);
		this.elements.retryButton.addEventListener("click", () =>
			this.loadSummary()
		);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	// Retrieve globals from window object
	const patientId = window.id;
	const hostUrl = window.HOSTURL;
	const appName = window.APP_NAME;

	if (patientId) {
		const summaryManager = new SummaryManager(patientId, { hostUrl, appName });
		summaryManager.init();
	} else {
		console.error(
			"Patient ID not found. SummaryManager cannot be initialized."
		);
		// Optionally, display an error message to the user on the page
		const errorDiv = document.getElementById("md-summary-error");
		if (errorDiv) {
			errorDiv.innerHTML =
				"<strong>Error:</strong> No patient ID provided. Cannot load summary.";
			errorDiv.style.display = "block";
			document.getElementById("md-summary-loading").style.display = "none";
		}
	}
});
