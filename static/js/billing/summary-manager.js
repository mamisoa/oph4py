/**
 * Summary Manager for Patient Consultation History
 * Handles patient info display and MD consultation history summary
 */
class SummaryManager {
	constructor() {
		this.patientId = window.id;
		this.hostUrl = window.HOSTURL;
		this.appName = window.APP_NAME;
		this.baseUrl = `${this.hostUrl}/${this.appName}`;

		console.log("SummaryManager initialized:", {
			patientId: this.patientId,
			baseUrl: this.baseUrl,
		});

		this.init();
	}

	init() {
		this.loadPatientInfo();
		this.loadMDSummary();
		this.attachEventListeners();
	}

	attachEventListeners() {
		// View More button
		document
			.getElementById("view-more-md-summary-btn")
			?.addEventListener("click", () => {
				this.showMDSummaryModal();
			});

		// Retry buttons
		document
			.getElementById("retry-md-summary-btn")
			?.addEventListener("click", () => {
				this.loadMDSummary();
			});

		document
			.getElementById("retry-md-summary-modal-btn")
			?.addEventListener("click", () => {
				this.loadMDSummaryModal();
			});

		// Quick action buttons
		document
			.querySelector(".patient-actions .btn-outline-info")
			?.addEventListener("click", () => {
				this.printSummary();
			});
	}

	async loadPatientInfo() {
		try {
			console.log("Loading patient info for ID:", this.patientId);

			const response = await fetch(
				`${this.baseUrl}/api/auth_user?id.eq=${this.patientId}`
			);
			const result = await response.json();

			if (
				result.status === "success" &&
				result.items &&
				result.items.length > 0
			) {
				this.populatePatientInfo(result.items[0]);
			} else {
				console.error(
					"Failed to load patient info:",
					result.message || "Unknown error"
				);
				this.showPatientInfoError();
			}
		} catch (error) {
			console.error("Error loading patient info:", error);
			this.showPatientInfoError();
		}
	}

	populatePatientInfo(patient) {
		// Basic patient info
		const nameElement = document.querySelector(".patientName");
		if (nameElement) {
			nameElement.innerHTML = `<i class="fas fa-user me-2"></i>${
				patient.first_name || ""
			} ${patient.last_name || ""}`;
		}

		// Date of birth and age
		const dobElement = document.querySelector(".patientDob");
		const ageElement = document.querySelector(".patientAge");
		if (patient.dob) {
			const dob = new Date(patient.dob);
			const formattedDob = dob.toLocaleDateString("en-GB");
			if (dobElement) dobElement.textContent = formattedDob;

			// Calculate age
			const age = this.calculateAge(dob);
			if (ageElement) ageElement.textContent = `${age} years`;
		} else {
			if (dobElement) dobElement.textContent = "--";
			if (ageElement) ageElement.textContent = "-- years";
		}

		// Gender (API returns number: 1=M, 2=F)
		const genderElement = document.querySelector(".patientGender");
		if (genderElement) {
			const genderText =
				patient.gender === 1 ? "Male" : patient.gender === 2 ? "Female" : "--";
			genderElement.textContent = genderText;
		}

		// Patient identifiers
		const idElement = document.querySelector(".patientId");
		if (idElement) {
			idElement.textContent = patient.id || "--";
		}

		const ssnElement = document.querySelector(".patientSsn");
		if (ssnElement) {
			ssnElement.textContent = patient.ssn || "--";
		}

		const cardElement = document.querySelector(".patientCard");
		if (cardElement) {
			cardElement.textContent = patient.idc_num || "--";
		}

		// Contact info
		const emailElement = document.querySelector(".patientEmail");
		if (emailElement) {
			emailElement.textContent = patient.email || "--";
		}

		// Patient photo
		this.loadPatientPhoto(patient);

		// Patient since date
		const patientSinceElement = document.querySelector(".patient-since");
		if (patient.created_on && patientSinceElement) {
			const createdDate = new Date(patient.created_on);
			patientSinceElement.textContent = createdDate.getFullYear();
		}

		console.log("Patient info populated successfully");
	}

	loadPatientPhoto(patient) {
		const photoElement = document.querySelector(".photoId");
		if (!photoElement) return;

		// Prioritize base64 photo if available
		if (patient.photob64 && patient.photob64.startsWith("data:image")) {
			photoElement.src = patient.photob64;
			console.log("Patient photo loaded from base64 data.");
			return;
		}

		console.log("Base64 photo not found, falling back to URL sources.");
		// Fallback to trying different URL sources
		const photoSources = [
			patient.photo_url, // If there's a photo URL field, assuming it's a full URL or correct relative path
			patient.gender === 2
				? `${this.baseUrl}/static/images/assets/avatar/mini-woman.svg`
				: `${this.baseUrl}/static/images/assets/avatar/mini-man.svg`, // Gender-based default (1=M, 2=F)
		].filter(Boolean);

		this.tryLoadPhoto(photoElement, photoSources, 0);
	}

	tryLoadPhoto(imgElement, sources, index) {
		if (index >= sources.length) {
			// All sources failed, use default
			imgElement.src = `${this.baseUrl}/static/images/assets/avatar/mini-man.svg`;
			return;
		}

		const img = new Image();
		img.onload = () => {
			imgElement.src = sources[index];
		};
		img.onerror = () => {
			this.tryLoadPhoto(imgElement, sources, index + 1);
		};
		img.src = sources[index];
	}

	calculateAge(birthDate) {
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}

		return age;
	}

	showPatientInfoError() {
		const nameElement = document.querySelector(".patientName");
		if (nameElement) {
			nameElement.innerHTML =
				'<i class="fas fa-exclamation-triangle me-2"></i>Error loading patient info';
			nameElement.classList.add("text-danger");
		}
	}

	async loadMDSummary() {
		try {
			this.showLoading();

			console.log("Loading MD summary for patient:", this.patientId);

			const response = await fetch(
				`${this.baseUrl}/api/patient/${this.patientId}/md_summary`
			);
			const result = await response.json();

			if (result.status === "success") {
				this.populateMDSummary(result.data);
				this.updateConsultationStats(result.data.total_count);
			} else {
				this.showError(result.message || "Failed to load consultation history");
			}
		} catch (error) {
			console.error("Error loading MD summary:", error);
			this.showError("Network error loading consultation history");
		}
	}

	updateConsultationStats(totalCount) {
		const totalElement = document.getElementById("total-consultations");
		if (totalElement) {
			totalElement.textContent = totalCount || 0;
		}

		// Update last visit date if we have consultations
		if (totalCount > 0) {
			// This would be populated from the first item in the summary
			// For now, we'll leave it as is since we'd need the actual data
		}
	}

	populateMDSummary(data) {
		console.log("Populating MD summary with data:", data);

		if (!data.items || data.items.length === 0) {
			this.showEmpty();
			return;
		}

		const tbody = document.getElementById("md-summary-body");
		if (!tbody) {
			console.error("MD summary table body not found");
			return;
		}

		tbody.innerHTML = "";

		data.items.forEach((item) => {
			const row = this.createSummaryRow(item);
			tbody.appendChild(row);
		});

		// Update stats
		const showingElement = document.getElementById("md-summary-showing");
		const totalElement = document.getElementById("md-summary-total");

		if (showingElement) showingElement.textContent = data.items.length;
		if (totalElement) totalElement.textContent = data.total_count;

		// Show/hide "View More" button
		const viewMoreBtn = document.getElementById("view-more-md-summary-btn");
		if (viewMoreBtn) {
			viewMoreBtn.style.display = data.has_more ? "inline-block" : "none";
		}

		// Update last visit in patient bar
		if (data.items.length > 0) {
			const lastVisitElement = document.querySelector(".lastVisit");
			if (lastVisitElement && data.items[0].requested_time) {
				const lastVisitDate = new Date(data.items[0].requested_time);
				lastVisitElement.textContent = this.formatDate(lastVisitDate);
			}
		}

		this.showContent();
	}

	createSummaryRow(item) {
		const row = document.createElement("tr");

		// Format date
		const dateCell = document.createElement("td");
		dateCell.textContent = item.requested_time
			? this.formatDateTime(new Date(item.requested_time))
			: "--";
		row.appendChild(dateCell);

		// Procedure
		const procedureCell = document.createElement("td");
		procedureCell.textContent = this.truncateText(item.procedure || "--", 25);
		procedureCell.title = item.procedure || "--";
		row.appendChild(procedureCell);

		// History
		const historyCell = document.createElement("td");
		historyCell.textContent = this.truncateText(item.history || "--", 40);
		historyCell.title = item.history || "--";
		row.appendChild(historyCell);

		// Conclusion
		const conclusionCell = document.createElement("td");
		conclusionCell.textContent = this.truncateText(item.conclusion || "--", 40);
		conclusionCell.title = item.conclusion || "--";
		row.appendChild(conclusionCell);

		// Follow-up
		const followupCell = document.createElement("td");
		followupCell.textContent = this.truncateText(item.followup || "--", 35);
		followupCell.title = item.followup || "--";
		row.appendChild(followupCell);

		// Billing description
		const billingCell = document.createElement("td");
		billingCell.textContent = this.truncateText(item.billing_desc || "--", 25);
		billingCell.title = item.billing_desc || "--";
		row.appendChild(billingCell);

		// Billing codes
		const codesCell = document.createElement("td");
		codesCell.textContent = this.truncateText(item.billing_codes || "--", 30);
		codesCell.title = item.billing_codes || "--";
		if (item.billing_codes && item.billing_codes !== "--") {
			codesCell.classList.add("fw-bold", "text-success");
		}
		row.appendChild(codesCell);

		return row;
	}

	formatDateTime(date) {
		return (
			date.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "2-digit",
			}) +
			", " +
			date.toLocaleTimeString("en-GB", {
				hour: "2-digit",
				minute: "2-digit",
			})
		);
	}

	formatDate(date) {
		return date.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	}

	truncateText(text, maxLength) {
		if (!text || text.length <= maxLength) return text;
		return text.substring(0, maxLength - 3) + "...";
	}

	showMDSummaryModal() {
		const modal = new bootstrap.Modal(
			document.getElementById("md-summary-modal")
		);
		modal.show();
		this.loadMDSummaryModal();
	}

	async loadMDSummaryModal() {
		try {
			this.showModalLoading();

			const response = await fetch(
				`${this.baseUrl}/api/patient/${this.patientId}/md_summary_modal`
			);
			const result = await response.json();

			if (result.status === "success") {
				this.populateMDSummaryModal(result.data);
			} else {
				this.showModalError(
					result.message || "Failed to load complete consultation history"
				);
			}
		} catch (error) {
			console.error("Error loading MD summary modal:", error);
			this.showModalError("Network error loading consultation history");
		}
	}

	populateMDSummaryModal(data) {
		if (!data.items || data.items.length === 0) {
			this.showModalEmpty();
			return;
		}

		const tbody = document.getElementById("md-summary-modal-body");
		if (!tbody) return;

		tbody.innerHTML = "";

		data.items.forEach((item) => {
			const row = this.createSummaryRow(item);
			tbody.appendChild(row);
		});

		const totalElement = document.getElementById("md-summary-modal-total");
		if (totalElement) totalElement.textContent = data.total_count;

		this.showModalContent();
	}

	// UI State Management
	showLoading() {
		document.getElementById("md-summary-loading").style.display = "block";
		document.getElementById("md-summary-error").style.display = "none";
		document.getElementById("md-summary-content").style.display = "none";
	}

	showError(message) {
		document.getElementById("md-summary-loading").style.display = "none";
		document.getElementById("md-summary-error").style.display = "block";
		document.getElementById("md-summary-content").style.display = "none";

		const errorElement = document.getElementById("md-summary-error");
		if (errorElement && message) {
			const messageElement = errorElement.querySelector("strong").nextSibling;
			if (messageElement) messageElement.textContent = " " + message;
		}
	}

	showContent() {
		document.getElementById("md-summary-loading").style.display = "none";
		document.getElementById("md-summary-error").style.display = "none";
		document.getElementById("md-summary-content").style.display = "block";
	}

	showEmpty() {
		document.getElementById("md-summary-loading").style.display = "none";
		document.getElementById("md-summary-error").style.display = "none";
		document.getElementById("md-summary-content").style.display = "block";
		document.getElementById("md-summary-empty").style.display = "block";
	}

	// Modal state management
	showModalLoading() {
		document.getElementById("md-summary-modal-loading").style.display = "block";
		document.getElementById("md-summary-modal-error").style.display = "none";
		document.getElementById("md-summary-modal-content").style.display = "none";
	}

	showModalError(message) {
		document.getElementById("md-summary-modal-loading").style.display = "none";
		document.getElementById("md-summary-modal-error").style.display = "block";
		document.getElementById("md-summary-modal-content").style.display = "none";
	}

	showModalContent() {
		document.getElementById("md-summary-modal-loading").style.display = "none";
		document.getElementById("md-summary-modal-error").style.display = "none";
		document.getElementById("md-summary-modal-content").style.display = "block";
	}

	showModalEmpty() {
		document.getElementById("md-summary-modal-loading").style.display = "none";
		document.getElementById("md-summary-modal-error").style.display = "none";
		document.getElementById("md-summary-modal-content").style.display = "block";
		document.getElementById("md-summary-modal-empty").style.display = "block";
	}

	// Quick action handlers
	printSummary() {
		console.log("Print summary clicked");
		// TODO: Print consultation summary
		window.print();
	}
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
	console.log("DOM loaded, initializing SummaryManager");
	new SummaryManager();
});
