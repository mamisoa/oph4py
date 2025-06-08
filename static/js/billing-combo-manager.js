/**
 * Billing Combo Manager JavaScript
 * Enhanced for Secondary Nomenclature Code Support
 * Handles the creation, editing, and management of billing code combinations
 */

// Fallback API_BASE definition if not already defined
if (typeof API_BASE === "undefined") {
	window.API_BASE =
		typeof HOSTURL !== "undefined" && typeof APP_NAME !== "undefined"
			? HOSTURL + "/" + APP_NAME + "/api"
			: "/api"; // fallback
}

class BillingComboManager {
	constructor() {
		// Enhanced structure: each entry has nomen_code, description, feecode, fee, and optional secondary_*
		this.selectedCodes = [];
		this.searchTimeout = null;
		this.secondarySearchTimeout = null;
		this.currentEditId = null;
		this.isEditMode = false;

		// Ensure API_BASE is defined
		if (typeof API_BASE === "undefined") {
			console.error(
				"API_BASE is not defined. Please ensure the base template variables are loaded."
			);
			return;
		}

		this.initializeEventHandlers();
	}

	initializeEventHandlers() {
		// Search functionality
		$("#nomenclatureSearch").on("input", (e) =>
			this.handleNomenclatureSearch(e)
		);
		$("#btnSearchNomen").on("click", () => this.searchNomenclature());

		// Form handling
		$("#newBillingComboForm").on("submit", (e) => this.handleFormSubmit(e));
		$("#btnResetForm").on("click", () => this.resetForm());
		$("#btnCancelEdit").on("click", () => this.cancelEdit());

		// Dynamic events for results and secondary code management
		$(document).on("click", ".add-nomen-code", (e) =>
			this.addNomenclatureCode(e)
		);
		$(document).on("click", ".remove-selected-code", (e) =>
			this.removeSelectedCode(e)
		);
		$(document).on("click", ".add-secondary-code", (e) =>
			this.addSecondaryCode(e)
		);
		$(document).on("click", ".remove-secondary-code", (e) =>
			this.removeSecondaryCode(e)
		);

		// Secondary code modal handlers
		$("#secondaryNomenclatureSearch").on("input", (e) =>
			this.handleSecondaryNomenclatureSearch(e)
		);
		$("#btnSearchSecondaryNomen").on("click", () =>
			this.searchSecondaryNomenclature()
		);
		$(document).on("click", ".add-secondary-nomen-code", (e) =>
			this.selectSecondaryNomenclatureCode(e)
		);
		$("#btnClearSecondarySelection").on("click", () =>
			this.clearSecondarySelection()
		);
		$("#btnSaveSecondaryCode").on("click", () => this.saveSecondaryCode());
	}

	handleNomenclatureSearch(event) {
		const query = event.target.value.trim();

		// Clear previous timeout
		if (this.searchTimeout) {
			clearTimeout(this.searchTimeout);
		}

		// Hide results if less than 3 characters
		if (query.length < 3) {
			$("#nomenclatureResults").hide();
			return;
		}

		// Debounce search to avoid too many API calls
		this.searchTimeout = setTimeout(() => {
			this.searchNomenclature(query);
		}, 300);
	}

	async searchNomenclature(query = null) {
		if (!query) {
			query = $("#nomenclatureSearch").val().trim();
		}

		if (query.length < 3) {
			return;
		}

		try {
			const params = new URLSearchParams();

			// Determine if query is numeric (code) or text (description)
			if (/^\d+$/.test(query)) {
				params.append("code", query);
			} else {
				params.append("description", query);
			}
			params.append("limit", "20");

			const response = await fetch(`${API_BASE}/nomenclature/search?${params}`);
			const data = await response.json();

			if (data.status === "success" && data.data) {
				this.displayNomenclatureResults(data.data);
			} else {
				this.displayNomenclatureResults([]);
			}
		} catch (error) {
			console.error("Nomenclature search failed:", error);
			displayToast(
				"error",
				"Search Failed",
				"Search failed. Please try again.",
				5000
			);
			this.displayNomenclatureResults([]);
		}
	}

	displayNomenclatureResults(results) {
		const tbody = $("#nomenclatureResultsBody");
		tbody.empty();

		if (results.length === 0) {
			tbody.append(`
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fas fa-info-circle"></i> No results found
                    </td>
                </tr>
            `);
		} else {
			results.forEach((item, index) => {
				const code = item.nomen_code || item.code;
				const description =
					item.nomen_desc_fr ||
					item.description_fr ||
					item.description ||
					"N/A";
				const feecode = item.feecode || "N/A";
				// Show "0.00" instead of "N/A" for fees and ensure proper formatting
				const fee = item.fee ? parseFloat(item.fee).toFixed(2) : "0.00";

				// Check if code is already used (as main or secondary)
				const isUsed = this.isCodeAlreadyUsed(code);
				const buttonClass = isUsed
					? "btn-secondary disabled"
					: "btn-primary add-nomen-code";
				const buttonText = isUsed ? "Used" : "Add as Main";
				const buttonIcon = isUsed ? "fas fa-check" : "fas fa-plus";

				tbody.append(`
                    <tr>
                        <td><strong>${code}</strong></td>
                        <td>${
													description.length > 50
														? description.substring(0, 50) + "..."
														: description
												}</td>
                        <td><span class="badge bg-info">${feecode}</span></td>
                        <td>
                            <div class="input-group input-group-sm" style="max-width: 120px;">
                                <span class="input-group-text">€</span>
                                <input type="number" 
                                       class="form-control editable-fee" 
                                       value="${fee}" 
                                       step="0.01" 
                                       min="0" 
                                       data-original-fee="${fee}"
                                       data-result-index="${index}"
                                       ${isUsed ? "disabled" : ""}>
                            </div>
                        </td>
                        <td>
                            <button type="button" class="btn btn-sm ${buttonClass}" 
                                    data-code="${code}" 
                                    data-description="${description}" 
                                    data-feecode="${feecode}" 
                                    data-fee="${fee}"
                                    data-result-index="${index}"
                                    ${isUsed ? "disabled" : ""}>
                                <i class="${buttonIcon}"></i> ${buttonText}
                            </button>
                        </td>
                    </tr>
                `);
			});
		}

		$("#nomenclatureResults").show();
	}

	isCodeAlreadyUsed(code) {
		return this.selectedCodes.some(
			(selected) =>
				selected.nomen_code == code || selected.secondary_nomen_code == code
		);
	}

	addNomenclatureCode(event) {
		const button = $(event.currentTarget);
		const code = button.data("code");
		const description = button.data("description");
		const feecode = button.data("feecode");
		const resultIndex = button.data("result-index");

		// Get the current fee value from the editable input field
		const feeInput = button.closest("tr").find(".editable-fee");
		const fee = feeInput.val() || "0.00";

		// Check if already used
		if (this.isCodeAlreadyUsed(code)) {
			return;
		}

		// Add to selected codes (enhanced structure for secondary code support)
		this.selectedCodes.push({
			nomen_code: code,
			nomen_desc_fr: description,
			feecode: feecode,
			fee: fee,
			// Secondary fields (optional)
			secondary_nomen_code: null,
			secondary_nomen_desc_fr: null,
			secondary_feecode: null,
			secondary_fee: null,
		});

		// Update UI
		this.updateSelectedCodesDisplay();
		this.updateFormState();

		// Update button state
		button
			.removeClass("btn-primary add-nomen-code")
			.addClass("btn-secondary disabled")
			.prop("disabled", true)
			.html('<i class="fas fa-check"></i> Used');

		// Disable the fee input as well
		feeInput.prop("disabled", true);

		// Hide search results
		$("#nomenclatureResults").hide();
		$("#nomenclatureSearch").val("");

		this.showToast(
			`Added main code ${code} with fee €${fee} to combo`,
			"success"
		);
	}

	addSecondaryCode(event) {
		const button = $(event.currentTarget);
		const mainIndex = button.data("main-index");

		// Show a modal or inline form to select secondary code
		this.showSecondaryCodeSelector(mainIndex);
	}

	showSecondaryCodeSelector(mainIndex) {
		const mainCode = this.selectedCodes[mainIndex];
		if (!mainCode) return;

		// Store the main index for later use
		$("#selectedMainIndex").val(mainIndex);

		// Display main code info in modal
		$("#mainCodeDisplay").text(
			`${mainCode.nomen_code} - ${mainCode.nomen_desc_fr}`
		);

		// Reset modal state
		this.resetSecondaryModal();

		// Show the modal
		$("#secondaryCodeModal").modal("show");
	}

	async fetchSecondaryCodeDetails(mainIndex, secondaryCode) {
		try {
			const response = await fetch(
				`${API_BASE}/nomenclature/code/${secondaryCode}`
			);
			const data = await response.json();

			if (data.status === "success" && data.data) {
				const details = data.data;

				// Update the main code entry with secondary details
				this.selectedCodes[mainIndex].secondary_nomen_code = secondaryCode;
				this.selectedCodes[mainIndex].secondary_nomen_desc_fr =
					details.description_fr || details.description;
				this.selectedCodes[mainIndex].secondary_feecode = details.feecode;
				this.selectedCodes[mainIndex].secondary_fee = details.fee;

				this.updateSelectedCodesDisplay();
				this.showToast(`Added secondary code ${secondaryCode}`, "success");
			} else {
				this.showToast("Could not fetch secondary code details", "warning");
				// Allow manual entry
				this.selectedCodes[mainIndex].secondary_nomen_code = secondaryCode;
				this.updateSelectedCodesDisplay();
			}
		} catch (error) {
			console.error("Error fetching secondary code details:", error);
			this.showToast("Error fetching secondary code details", "error");
		}
	}

	removeSecondaryCode(event) {
		const button = $(event.currentTarget);
		const mainIndex = button.data("main-index");

		if (this.selectedCodes[mainIndex]) {
			const secondaryCode = this.selectedCodes[mainIndex].secondary_nomen_code;

			// Clear secondary fields
			this.selectedCodes[mainIndex].secondary_nomen_code = null;
			this.selectedCodes[mainIndex].secondary_nomen_desc_fr = null;
			this.selectedCodes[mainIndex].secondary_feecode = null;
			this.selectedCodes[mainIndex].secondary_fee = null;

			this.updateSelectedCodesDisplay();
			this.showToast(`Removed secondary code ${secondaryCode}`, "info");
		}
	}

	removeSelectedCode(event) {
		const button = $(event.currentTarget);
		const index = button.data("index");

		if (this.selectedCodes[index]) {
			const removedCode = this.selectedCodes[index];

			// Remove from selected codes
			this.selectedCodes.splice(index, 1);

			// Update UI
			this.updateSelectedCodesDisplay();
			this.updateFormState();

			this.showToast(
				`Removed code ${removedCode.nomen_code} from combo`,
				"info"
			);
		}
	}

	updateSelectedCodesDisplay() {
		const container = $("#selectedCodesList");
		const noCodesMessage = $("#noCodesMessage");

		if (this.selectedCodes.length === 0) {
			container.hide();
			noCodesMessage.show();
		} else {
			noCodesMessage.hide();
			container.show();

			let html = '<div class="row g-2">';
			this.selectedCodes.forEach((code, index) => {
				const hasSecondary = code.secondary_nomen_code !== null;
				const mainFee = this.safeParseFloat(code.fee, 0);
				const secondaryFee = this.safeParseFloat(code.secondary_fee, 0);
				const totalFee = mainFee + secondaryFee;

				html += `
                    <div class="col-12">
                        <div class="card border-primary">
                            <div class="card-body p-3">
                                <!-- Main Code -->
                                <div class="d-flex justify-content-between align-items-start">
                                    <div class="flex-grow-1">
                                        <h6 class="card-title mb-2">
                                            <i class="fas fa-star text-primary"></i> 
                                            <strong>${
																							code.nomen_code
																						}</strong> - ${code.nomen_desc_fr}
                                        </h6>
                                        <div class="row">
                                            <div class="col-md-4">
                                                <small class="text-muted">Fee Code:</small>
                                                <span class="badge bg-info">${
																									code.feecode
																								}</span>
                                            </div>
                                            <div class="col-md-4">
                                                <small class="text-muted">Fee:</small>
                                                <strong>€${mainFee.toFixed(
																									2
																								)}</strong>
                                            </div>
                                            <div class="col-md-4">
                                                ${
																									!hasSecondary
																										? `
                                                    <button type="button" class="btn btn-sm btn-outline-success add-secondary-code" 
                                                            data-main-index="${index}">
                                                        <i class="fas fa-plus"></i> Add Secondary
                                                    </button>
                                                `
																										: ""
																								}
                                            </div>
                                        </div>
                                        
                                        ${
																					hasSecondary
																						? `
                                            <!-- Secondary Code -->
                                            <hr class="my-2">
                                            <div class="bg-light p-2 rounded">
                                                <h6 class="mb-2">
                                                    <i class="fas fa-plus-circle text-secondary"></i> 
                                                    Secondary: <strong>${
																											code.secondary_nomen_code
																										}</strong> - ${
																								code.secondary_nomen_desc_fr ||
																								"N/A"
																						  }
                                                </h6>
                                                <div class="row">
                                                    <div class="col-md-3">
                                                        <small class="text-muted">Fee Code:</small>
                                                        <span class="badge bg-secondary">${
																													code.secondary_feecode ||
																													"N/A"
																												}</span>
                                                    </div>
                                                    <div class="col-md-3">
                                                        <small class="text-muted">Fee:</small>
                                                        <strong>€${secondaryFee.toFixed(
																													2
																												)}</strong>
                                                    </div>
                                                    <div class="col-md-3">
                                                        <small class="text-muted">Total:</small>
                                                        <strong class="text-success">€${totalFee.toFixed(
																													2
																												)}</strong>
                                                    </div>
                                                    <div class="col-md-3">
                                                        <button type="button" class="btn btn-sm btn-outline-danger remove-secondary-code" 
                                                                data-main-index="${index}">
                                                            <i class="fas fa-times"></i> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        `
																						: ""
																				}
                                    </div>
                                    <button type="button" class="btn btn-sm btn-outline-danger remove-selected-code ms-2" 
                                            data-index="${index}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
			});
			html += "</div>";
			container.html(html);
		}

		// Update hidden field with enhanced structure for API
		$("#comboCodes").val(JSON.stringify(this.selectedCodes));
	}

	updateFormState() {
		const hasName = $("#comboName").val().trim().length > 0;
		const hasSpecialty = $("#comboSpecialty").val().length > 0;
		const hasCodes = this.selectedCodes.length > 0;

		$("#btnSaveCombo").prop("disabled", !(hasName && hasSpecialty && hasCodes));
	}

	async handleFormSubmit(event) {
		event.preventDefault();

		if (this.selectedCodes.length === 0) {
			displayToast(
				"error",
				"Validation Error",
				"Please add at least one nomenclature code",
				5000
			);
			return;
		}

		const formData = {
			combo_name: $("#comboName").val().trim(),
			combo_description: $("#comboDescription").val().trim(),
			specialty: $("#comboSpecialty").val(),
			combo_codes: this.selectedCodes, // Send enhanced structure directly
		};

		try {
			let response, successMessage;

			if (this.isEditMode && this.currentEditId) {
				// Update existing combo
				response = await fetch(
					`${API_BASE}/billing_combo/${this.currentEditId}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(formData),
					}
				);
				successMessage = "Billing combo updated successfully!";
			} else {
				// Create new combo
				response = await fetch(`${API_BASE}/billing_combo`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				});
				successMessage = "Billing combo created successfully!";
			}

			const result = await response.json();

			if (response.ok && result.status === "success") {
				displayToast("success", "Save Success", successMessage, 5000);
				this.resetForm();
				$("#billingComboTable").bootstrapTable("refresh");
			} else {
				throw new Error(result.message || "Failed to save combo");
			}
		} catch (error) {
			console.error("Error saving combo:", error);
			displayToast("error", "Save Failed", `Error: ${error.message}`, 6000);
		}
	}

	resetForm() {
		$("#newBillingComboForm")[0].reset();
		// Restore default specialty selection
		$("#comboSpecialty").val("ophthalmology");
		this.selectedCodes = [];
		this.updateSelectedCodesDisplay();
		this.updateFormState();
		$("#nomenclatureResults").hide();
		$("#nomenclatureSearch").val("");

		// Reset edit mode
		this.exitEditMode();
	}

	// Enhanced edit functionality - now handles secondary codes
	editCombo(id, row) {
		this.currentEditId = id;
		this.isEditMode = true;

		// Update UI to show edit mode
		this.enterEditMode();

		// Populate form fields
		$("#comboName").val(row.combo_name);
		$("#comboDescription").val(row.combo_description || "");
		$("#comboSpecialty").val(row.specialty);
		$("#editComboId").val(id);

		// Parse and load selected codes with enhanced structure support
		// Use the same robust parsing logic as the enhancedCodesFormatter
		let codes = [];
		try {
			console.log("Parsing combo codes for edit:", row.combo_codes);

			if (!row.combo_codes || row.combo_codes === "[]") {
				codes = [];
			} else if (typeof row.combo_codes === "string") {
				try {
					// First attempt: direct JSON parse
					codes = JSON.parse(row.combo_codes);
					console.log("Successfully parsed with JSON.parse:", codes);
				} catch (e) {
					console.log(
						"Direct JSON parse failed, attempting JavaScript evaluation..."
					);

					// Replace Python literals with JavaScript equivalents
					let jsCode = row.combo_codes
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
				codes = row.combo_codes;
			}
		} catch (e) {
			console.error(
				"Error parsing combo codes for edit:",
				e,
				"Raw value:",
				row.combo_codes
			);
			codes = [];
		}

		// Convert codes array to enhanced structure for editing
		// Support both old format (integers) and new format (objects with secondary codes)
		this.selectedCodes = codes.map((code) => {
			if (typeof code === "number") {
				// Old format: simple integer code
				return {
					nomen_code: code,
					nomen_desc_fr: `Code ${code}`, // Simplified description for editing
					feecode: "N/A",
					fee: 0,
					secondary_nomen_code: null,
					secondary_nomen_desc_fr: null,
					secondary_feecode: null,
					secondary_fee: null,
				};
			} else if (typeof code === "object" && code.nomen_code) {
				// New format: object with potential secondary codes
				return {
					nomen_code: code.nomen_code,
					nomen_desc_fr: code.nomen_desc_fr || `Code ${code.nomen_code}`,
					feecode: code.feecode || "N/A",
					fee: code.fee || 0,
					secondary_nomen_code: code.secondary_nomen_code || null,
					secondary_nomen_desc_fr: code.secondary_nomen_desc_fr || null,
					secondary_feecode: code.secondary_feecode || null,
					secondary_fee: code.secondary_fee || null,
				};
			} else {
				// Fallback for unexpected format
				console.warn("Unexpected code format:", code);
				return {
					nomen_code: code,
					nomen_desc_fr: `Code ${code}`,
					feecode: "N/A",
					fee: 0,
					secondary_nomen_code: null,
					secondary_nomen_desc_fr: null,
					secondary_feecode: null,
					secondary_fee: null,
				};
			}
		});

		console.log("Loaded selectedCodes for editing:", this.selectedCodes);

		// Update displays
		this.updateSelectedCodesDisplay();
		this.updateFormState();

		// Scroll to form
		document.getElementById("newBillingComboForm").scrollIntoView({
			behavior: "smooth",
			block: "start",
		});

		this.showToast(`Editing combo: ${row.combo_name}`, "info");
	}

	enterEditMode() {
		this.isEditMode = true;
		$("#formTitle").text("Edit Billing Combo");
		$("#saveButtonText").text("Update Combo");
		$("#btnSaveCombo").removeClass("btn-primary").addClass("btn-warning");
		$("#editModeAlert").show();
	}

	exitEditMode() {
		this.isEditMode = false;
		this.currentEditId = null;
		$("#formTitle").text("Create New Billing Combo");
		$("#saveButtonText").text("Save Billing Combo");
		$("#btnSaveCombo").removeClass("btn-warning").addClass("btn-primary");
		$("#editModeAlert").hide();
		$("#editComboId").val("");
	}

	cancelEdit() {
		this.resetForm();
		this.showToast("Edit cancelled", "info");
	}

	async exportCombo(id, name) {
		try {
			displayToast(
				"info",
				"Export Started",
				`Exporting combo "${name}"...`,
				3000
			);

			const response = await fetch(`${API_BASE}/billing_combo/${id}/export`);
			const result = await response.json();

			if (response.ok && result.status === "success") {
				// Create and download the JSON file
				const dataStr = JSON.stringify(result.data, null, 2);
				const dataBlob = new Blob([dataStr], { type: "application/json" });

				// Create download link
				const downloadLink = document.createElement("a");
				downloadLink.href = window.URL.createObjectURL(dataBlob);
				downloadLink.download = result.meta.filename;

				// Trigger download
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);

				// Clean up object URL
				window.URL.revokeObjectURL(downloadLink.href);

				displayToast(
					"success",
					"Export Complete",
					`Successfully exported "${name}" with ${result.meta.codes_count} codes`,
					5000
				);
			} else {
				throw new Error(result.message || "Failed to export combo");
			}
		} catch (error) {
			console.error("Error exporting combo:", error);
			displayToast(
				"error",
				"Export Failed",
				`Export failed: ${error.message}`,
				6000
			);
		}
	}

	async deleteCombo(id, name) {
		const confirmed = await this.showConfirmDialog(
			"Delete Billing Combo",
			`Are you sure you want to delete the combo "${name}"?<br><br><strong>This action cannot be undone!</strong>`
		);

		if (confirmed) {
			try {
				const response = await fetch(`${API_BASE}/billing_combo/${id}`, {
					method: "DELETE",
				});

				const result = await response.json();

				if (response.ok && result.status === "success") {
					displayToast(
						"success",
						"Delete Success",
						"Billing combo deleted successfully!",
						5000
					);
					$("#billingComboTable").bootstrapTable("refresh");
				} else {
					throw new Error(result.message || "Failed to delete combo");
				}
			} catch (error) {
				console.error("Error deleting combo:", error);
				displayToast("error", "Delete Failed", `Error: ${error.message}`, 6000);
			}
		}
	}

	showToast(message, type = "info") {
		// Create toast with auto-dismiss
		const toastId = "toast-" + Date.now();
		const bgClass =
			{
				success: "bg-success",
				error: "bg-danger",
				warning: "bg-warning",
				info: "bg-info",
			}[type] || "bg-info";

		const toast = $(`
            <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `);

		$("#toast-container").append(toast);
		const toastEl = new bootstrap.Toast(toast[0]);
		toastEl.show();

		// Auto-remove after toast hides
		toast.on("hidden.bs.toast", () => toast.remove());
	}

	showConfirmDialog(title, message) {
		return new Promise((resolve) => {
			bootbox.confirm({
				title: title,
				message: message,
				buttons: {
					cancel: {
						label: "<i class='fas fa-times'></i> Cancel",
						className: "btn-secondary",
					},
					confirm: {
						label: "<i class='fas fa-check'></i> Confirm",
						className: "btn-danger",
					},
				},
				callback: (result) => resolve(result),
			});
		});
	}

	// New methods for secondary code modal functionality
	resetSecondaryModal() {
		$("#secondaryNomenclatureSearch").val("");
		$("#secondaryNomenclatureResults").hide();
		$("#selectedSecondaryForm").hide();
		$("#btnSaveSecondaryCode").hide();
		$("#selectedSecondaryCode").val("");
		$("#selectedSecondaryDescription").val("");
		$("#selectedSecondaryFeeCode").val("");
		$("#selectedSecondaryFee").val("");
	}

	handleSecondaryNomenclatureSearch(event) {
		const query = event.target.value.trim();

		// Clear timeout if it exists
		if (this.secondarySearchTimeout) {
			clearTimeout(this.secondarySearchTimeout);
		}

		// Only search if query is 3+ characters
		if (query.length >= 3) {
			this.secondarySearchTimeout = setTimeout(() => {
				this.searchSecondaryNomenclature(query);
			}, 300);
		} else {
			$("#secondaryNomenclatureResults").hide();
		}
	}

	async searchSecondaryNomenclature(query = null) {
		query = query || $("#secondaryNomenclatureSearch").val().trim();

		if (query.length < 3) {
			this.showToast("Please enter at least 3 characters to search", "warning");
			return;
		}

		try {
			// Determine if query is numeric (code) or text (description)
			const isNumeric = /^\d+$/.test(query);
			const params = new URLSearchParams();

			if (isNumeric) {
				params.append("code", query);
			} else {
				params.append("description", query);
			}

			const response = await fetch(`${API_BASE}/nomenclature/search?${params}`);
			const data = await response.json();

			let results = [];
			if (data.status === "success" && data.data) {
				results = data.data;
			} else if (Array.isArray(data)) {
				results = data;
			}

			this.displaySecondaryNomenclatureResults(results);
		} catch (error) {
			console.error("Error searching secondary nomenclature:", error);
			this.showToast("Error searching nomenclature codes", "error");
		}
	}

	displaySecondaryNomenclatureResults(results) {
		const tbody = $("#secondaryNomenclatureResultsBody");
		const container = $("#secondaryNomenclatureResults");

		if (!results || results.length === 0) {
			tbody.html(
				'<tr><td colspan="5" class="text-center text-muted">No results found</td></tr>'
			);
			container.show();
			return;
		}

		const mainIndex = parseInt($("#selectedMainIndex").val());
		const mainCode = this.selectedCodes[mainIndex];

		let html = "";
		results.forEach((item, index) => {
			const code = item.nomen_code || item.code;
			const description =
				item.nomen_desc_fr ||
				item.desc_fr ||
				item.description_fr ||
				item.description ||
				"N/A";
			const feecode = item.feecode || "N/A";
			// Show "0.00" instead of "N/A" for fees
			const fee = item.fee ? parseFloat(item.fee).toFixed(2) : "0.00";

			// Check if this code is already used or is the same as main code
			const isDisabled =
				this.isCodeAlreadyUsed(code) || code == mainCode.nomen_code;
			const buttonClass = isDisabled
				? "btn-secondary disabled"
				: "btn-primary add-secondary-nomen-code";
			const buttonText = isDisabled ? "Cannot Use" : "Select";

			html += `
				<tr>
					<td><strong>${code}</strong></td>
					<td>${
						description.length > 50
							? description.substring(0, 50) + "..."
							: description
					}</td>
					<td><span class="badge bg-info">${feecode}</span></td>
					<td>
						<div class="input-group input-group-sm" style="max-width: 120px;">
							<span class="input-group-text">€</span>
							<input type="number" 
								   class="form-control editable-secondary-fee" 
								   value="${fee}" 
								   step="0.01" 
								   min="0" 
								   data-original-fee="${fee}"
								   data-result-index="${index}"
								   ${isDisabled ? "disabled" : ""}>
						</div>
					</td>
					<td>
						<button type="button" class="${buttonClass}" 
								data-code="${code}" 
								data-description="${description}" 
								data-feecode="${feecode}" 
								data-fee="${fee}"
								data-result-index="${index}"
								${isDisabled ? "disabled" : ""}>
							${buttonText}
						</button>
					</td>
				</tr>
			`;
		});

		tbody.html(html);
		container.show();
	}

	selectSecondaryNomenclatureCode(event) {
		const button = $(event.currentTarget);
		const code = button.data("code");
		const description = button.data("description");
		const feecode = button.data("feecode");
		const resultIndex = button.data("result-index");

		// Get the current fee value from the editable input field
		const feeInput = button.closest("tr").find(".editable-secondary-fee");
		const fee = parseFloat(feeInput.val() || "0.00");

		// Populate the selection form
		$("#selectedSecondaryCode").val(code);
		$("#selectedSecondaryDescription").val(description);
		$("#selectedSecondaryFeeCode").val(feecode);
		$("#selectedSecondaryFee").val(fee.toFixed(2));

		// Show the form and save button
		$("#selectedSecondaryForm").show();
		$("#btnSaveSecondaryCode").show();

		// Hide search results
		$("#secondaryNomenclatureResults").hide();
		$("#secondaryNomenclatureSearch").val("");

		this.showToast(
			`Selected secondary code ${code} with fee €${fee.toFixed(2)}`,
			"success"
		);
	}

	clearSecondarySelection() {
		$("#selectedSecondaryForm").hide();
		$("#btnSaveSecondaryCode").hide();
		this.resetSecondaryModal();
	}

	saveSecondaryCode() {
		const mainIndex = parseInt($("#selectedMainIndex").val());
		const code = $("#selectedSecondaryCode").val();
		const description = $("#selectedSecondaryDescription").val();
		const feecode = $("#selectedSecondaryFeeCode").val();
		const fee = parseFloat($("#selectedSecondaryFee").val() || 0);

		if (!code || mainIndex < 0 || !this.selectedCodes[mainIndex]) {
			this.showToast("Invalid selection", "error");
			return;
		}

		// Update the main code entry with secondary details
		this.selectedCodes[mainIndex].secondary_nomen_code = code;
		this.selectedCodes[mainIndex].secondary_nomen_desc_fr = description;
		this.selectedCodes[mainIndex].secondary_feecode = feecode;
		this.selectedCodes[mainIndex].secondary_fee = fee;

		// Update display and hide modal
		this.updateSelectedCodesDisplay();
		$("#secondaryCodeModal").modal("hide");

		this.showToast(`Added secondary code ${code}`, "success");
	}

	// Helper function to safely parse fees and avoid NaN
	safeParseFloat(value, defaultValue = 0) {
		if (value === null || value === undefined || value === "") {
			return defaultValue;
		}
		const parsed = parseFloat(value);
		return isNaN(parsed) ? defaultValue : parsed;
	}
}

// =============================================================================
// Global Functions for Bootstrap Table
// =============================================================================

function responseHandler_billingCombo(res) {
	console.log("Raw API response:", res); // Debug logging

	// Handle PyDAL RestAPI response format
	if (res && res.status === "success" && res.items) {
		console.log("Using PyDAL format - items:", res.items.length);
		return {
			total: res.count || res.items.length,
			rows: res.items,
		};
	}
	// Handle FastAPI response format
	else if (res && res.status === "success" && res.data) {
		console.log("Using FastAPI format - data:", res.data.length);
		return {
			total: res.data.length,
			rows: res.data,
		};
	}
	// Handle direct array response
	else if (Array.isArray(res)) {
		console.log("Using array format - length:", res.length);
		return {
			total: res.length,
			rows: res,
		};
	}
	// Handle legacy py4web format
	else if (res && res.items) {
		console.log("Using legacy format - items:", res.items.length);
		return res;
	}

	console.warn("Unknown response format:", res);
	return res;
}

function specialtyFormatter(value) {
	const specialtyLabels = {
		ophthalmology: "Ophthalmology",
		general: "General Medicine",
		consultation: "Consultation",
	};

	const label = specialtyLabels[value] || value;
	const badgeClass = value === "ophthalmology" ? "bg-primary" : "bg-secondary";

	return `<span class="badge ${badgeClass}">${label}</span>`;
}

// Enhanced codes formatter with secondary code support
function enhancedCodesFormatter(value) {
	try {
		console.log("Formatting codes value:", value); // Debug logging

		// Handle empty or null values
		if (!value || value === "[]") {
			return '<span class="text-muted">No codes</span>';
		}

		let codes;

		// Try to parse the value
		if (typeof value === "string") {
			try {
				// First attempt: direct JSON parse
				codes = JSON.parse(value);
			} catch (e) {
				console.log(
					"Direct JSON parse failed, attempting JavaScript evaluation..."
				);

				// Replace Python literals with JavaScript equivalents
				let jsCode = value
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
			codes = value;
		}

		if (!Array.isArray(codes) || codes.length === 0) {
			return '<span class="text-muted">No codes</span>';
		}

		let html = '<div class="codes-list">';
		let totalMainFees = 0;
		let totalSecondaryFees = 0;
		let codesWithSecondary = 0;

		// Helper function to safely parse fees
		const safeParseFloat = (value, defaultValue = 0) => {
			if (
				value === null ||
				value === undefined ||
				value === "" ||
				value === "N/A"
			) {
				return defaultValue;
			}
			const parsed = parseFloat(value);
			return isNaN(parsed) ? defaultValue : parsed;
		};

		codes.forEach((code, index) => {
			if (typeof code === "number") {
				// Old format: simple integer code
				html += `<span class="badge bg-primary me-1 mb-1">${code}</span>`;
			} else if (typeof code === "object" && code.nomen_code) {
				// New format: object with potential secondary codes
				const mainFee = safeParseFloat(code.fee, 0);
				const hasSecondary =
					code.secondary_nomen_code && code.secondary_nomen_code !== null;
				const secondaryFee = safeParseFloat(code.secondary_fee, 0);

				totalMainFees += mainFee;
				if (hasSecondary) {
					totalSecondaryFees += secondaryFee;
					codesWithSecondary++;
				}

				html += `<div class="mb-1">`;
				html += `<span class="badge bg-primary">${code.nomen_code}</span>`;

				if (hasSecondary) {
					html += ` <span class="badge bg-secondary">+${code.secondary_nomen_code}</span>`;
				}

				if (index < codes.length - 1) {
					html += `<br>`;
				}
				html += `</div>`;
			} else {
				// Fallback for unexpected format
				html += `<span class="badge bg-warning me-1 mb-1">${code}</span>`;
			}
		});

		html += "</div>";

		// Add summary if there are secondary codes
		if (codesWithSecondary > 0) {
			const totalFees = totalMainFees + totalSecondaryFees;
			html += `<small class="text-muted d-block mt-1">`;
			html += `${codes.length} codes (${codesWithSecondary} with secondary)<br>`;
			html += `Total: €${totalFees.toFixed(2)}`;
			html += `</small>`;
		}

		return html;
	} catch (e) {
		console.error("Error formatting codes:", e, "Value:", value);
		// Return a simplified fallback that just shows "Complex format"
		return '<span class="text-warning">Complex format - Edit to view details</span>';
	}
}

function operateFormatter(value, row, index) {
	return `
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-outline-success export-combo" 
                    data-id="${row.id}" data-name="${row.combo_name}" title="Export">
                <i class="fas fa-download"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-primary edit-combo" 
                    data-id="${row.id}" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger delete-combo" 
                    data-id="${row.id}" data-name="${row.combo_name}" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

// Global event handlers for table operations
window.operateEvents = {
	"click .export-combo": function (e, value, row, index) {
		window.billingComboManager.exportCombo(row.id, row.combo_name);
	},
	"click .edit-combo": function (e, value, row, index) {
		window.billingComboManager.editCombo(row.id, row);
	},
	"click .delete-combo": function (e, value, row, index) {
		window.billingComboManager.deleteCombo(row.id, row.combo_name);
	},
};

// =============================================================================
// Initialize on Document Ready
// =============================================================================

$(document).ready(function () {
	// Initialize the billing combo manager
	window.billingComboManager = new BillingComboManager();

	console.log(
		"Enhanced Billing Combo Manager initialized with secondary code support"
	);
});
