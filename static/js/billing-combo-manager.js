/**
 * Billing Combo Manager JavaScript
 * Enhanced for Secondary Nomenclature Code Support
 * Handles the creation, editing, and management of billing code combinations
 */

// Add CSS styles for fee editing
if (!document.querySelector("#billing-combo-fee-styles")) {
	const style = document.createElement("style");
	style.id = "billing-combo-fee-styles";
	style.textContent = `
		.editable-combo-fee {
			transition: all 0.3s ease;
		}
		
		.editable-combo-fee:focus {
			border-color: #007bff;
			box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
		}
		
		.fee-modified {
			background-color: #fff3cd !important;
			border-color: #ffc107 !important;
			animation: fee-highlight 1s ease-out;
		}
		
		@keyframes fee-highlight {
			0% { background-color: #d4edda; border-color: #28a745; }
			100% { background-color: #fff3cd; border-color: #ffc107; }
		}
		
		.total-fee-display {
			transition: color 0.5s ease;
		}
	`;
	document.head.appendChild(style);
}

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
		this.initializeTableEvents();
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
		$("#btnCreateNewCombo").on("click", () => this.createNewCombo());

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

		// Fee editing handlers
		$(document).on("input change", ".editable-combo-fee", (e) =>
			this.handleComboFeeChange(e)
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

		// Multi-selection export handlers
		$("#btnExportSelected").on("click", () => this.exportSelectedCombos());

		// Import handlers
		$("#btnImportCombo").on("click", () => this.showImportModal());
		$("#importFileInput").on("change", (e) => this.handleFileSelection(e));
		$("#btnStartImport").on("click", () => this.startImport());
		$("#btnNewImport").on("click", () => this.resetImportModal());
	}

	initializeTableEvents() {
		// Initialize table events after table is loaded
		$(document).ready(() => {
			// Wait for table to initialize, then set up events
			setTimeout(() => {
				$("#billingComboTable").on(
					"check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table",
					() => {
						this.updateExportButtonState();
					}
				);
			}, 1000);
		});
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

	handleComboFeeChange(event) {
		const input = $(event.currentTarget);
		const codeIndex = parseInt(input.data("code-index"));
		const feeType = input.data("fee-type");
		const newFee = parseFloat(input.val()) || 0;

		// Validate fee
		if (newFee < 0) {
			input.val("0.00");
			this.showToast("Fee cannot be negative", "warning");
			return;
		}

		// Update the selected code data
		if (this.selectedCodes[codeIndex]) {
			if (feeType === "main") {
				this.selectedCodes[codeIndex].fee = newFee;
			} else if (feeType === "secondary") {
				this.selectedCodes[codeIndex].secondary_fee = newFee;
			}

			// Update totals display
			this.updateTotalFeeDisplay(codeIndex);

			// Update hidden field for form submission
			$("#comboCodes").val(JSON.stringify(this.selectedCodes));

			// Show visual feedback
			input.addClass("fee-modified");
			setTimeout(() => {
				input.removeClass("fee-modified");
			}, 1000);
		}
	}

	updateTotalFeeDisplay(codeIndex) {
		const code = this.selectedCodes[codeIndex];
		if (!code) return;

		const mainFee = this.safeParseFloat(code.fee, 0);
		const secondaryFee = this.safeParseFloat(code.secondary_fee, 0);
		const totalFee = mainFee + secondaryFee;

		// Find the total display element for this code and update it
		const codeCard = $(
			`.editable-combo-fee[data-code-index="${codeIndex}"]`
		).closest(".card");
		const totalDisplay = codeCard.find(".total-fee-display");

		if (totalDisplay.length) {
			totalDisplay.text(`€${totalFee.toFixed(2)}`);

			// Add visual feedback for total change
			totalDisplay.addClass("text-warning").removeClass("text-success");
			setTimeout(() => {
				totalDisplay.removeClass("text-warning").addClass("text-success");
			}, 500);
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
                                                <div class="input-group input-group-sm" style="max-width: 120px;">
                                                    <span class="input-group-text">€</span>
                                                    <input type="number" 
                                                           class="form-control editable-combo-fee" 
                                                           value="${mainFee.toFixed(
																															2
																														)}" 
                                                           step="0.01" 
                                                           min="0" 
                                                           data-code-index="${index}"
                                                           data-fee-type="main"
                                                           title="Click to edit fee">
                                                </div>
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
                                                        <div class="input-group input-group-sm" style="max-width: 120px;">
                                                            <span class="input-group-text">€</span>
                                                            <input type="number" 
                                                                   class="form-control editable-combo-fee" 
                                                                   value="${secondaryFee.toFixed(
																																			2
																																		)}" 
                                                                   step="0.01" 
                                                                   min="0" 
                                                                   data-code-index="${index}"
                                                                   data-fee-type="secondary"
                                                                   title="Click to edit secondary fee">
                                                        </div>
                                                    </div>
                                                    <div class="col-md-3">
                                                        <small class="text-muted">Total:</small>
                                                        <strong class="text-success total-fee-display">€${totalFee.toFixed(
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

		// Enable "Create New Combo" button only in edit mode with valid data
		if (this.isEditMode) {
			$("#btnCreateNewCombo").prop(
				"disabled",
				!(hasName && hasSpecialty && hasCodes)
			);
		}
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
		$("#originalComboName").val(row.combo_name);

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
		$("#btnCreateNewCombo").show();
		$("#editModeAlert").show();
	}

	exitEditMode() {
		this.isEditMode = false;
		this.currentEditId = null;
		$("#formTitle").text("Create New Billing Combo");
		$("#saveButtonText").text("Save Billing Combo");
		$("#btnSaveCombo").removeClass("btn-warning").addClass("btn-primary");
		$("#btnCreateNewCombo").hide();
		$("#editModeAlert").hide();
		$("#editComboId").val("");
		$("#originalComboName").val("");
	}

	cancelEdit() {
		this.resetForm();
		this.showToast("Edit cancelled", "info");
	}

	async createNewCombo() {
		if (this.selectedCodes.length === 0) {
			displayToast(
				"error",
				"Validation Error",
				"Please add at least one nomenclature code",
				5000
			);
			return;
		}

		// Get current form values
		let comboName = $("#comboName").val().trim();
		const originalName = $("#originalComboName").val();
		const comboDescription = $("#comboDescription").val().trim();
		const specialty = $("#comboSpecialty").val();

		// If name hasn't been changed, append "(copy)"
		if (comboName === originalName) {
			comboName = comboName + " (copy)";
			$("#comboName").val(comboName);
		}

		const formData = {
			combo_name: comboName,
			combo_description: comboDescription,
			specialty: specialty,
			combo_codes: this.selectedCodes, // Send enhanced structure directly
		};

		try {
			// Always create new combo (not update)
			const response = await fetch(`${API_BASE}/billing_combo`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const result = await response.json();

			if (response.ok && result.status === "success") {
				displayToast(
					"success",
					"Create Success",
					`New billing combo "${comboName}" created successfully!`,
					5000
				);
				this.resetForm();
				$("#billingComboTable").bootstrapTable("refresh");
			} else {
				throw new Error(result.message || "Failed to create new combo");
			}
		} catch (error) {
			console.error("Error creating new combo:", error);
			displayToast("error", "Create Failed", `Error: ${error.message}`, 6000);
		}
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

	// Multi-selection export methods
	getSelectedCombos() {
		return $("#billingComboTable").bootstrapTable("getSelections");
	}

	updateExportButtonState() {
		const selectedCombos = this.getSelectedCombos();
		const selectedCount = selectedCombos.length;

		const exportBtn = $("#btnExportSelected");
		const exportText = $("#exportSelectedText");
		const selectionInfo = $("#selectionInfo");

		if (selectedCount > 0) {
			exportBtn.prop("disabled", false);
			exportText.text(`Export Selected (${selectedCount})`);
			selectionInfo.text(
				`${selectedCount} combo${selectedCount > 1 ? "s" : ""} selected`
			);
		} else {
			exportBtn.prop("disabled", true);
			exportText.text("Export Selected");
			selectionInfo.text("No combos selected");
		}
	}

	async exportSelectedCombos() {
		const selectedCombos = this.getSelectedCombos();

		if (selectedCombos.length === 0) {
			displayToast(
				"warning",
				"No Selection",
				"Please select at least one combo to export",
				4000
			);
			return;
		}

		// Extract combo IDs from selected rows
		const comboIds = selectedCombos.map((combo) => combo.id);
		const comboNames = selectedCombos
			.map((combo) => combo.combo_name)
			.join(", ");

		// Debug logging
		console.log("Selected combos:", selectedCombos);
		console.log("Combo IDs to export:", comboIds);
		console.log("Combo names:", comboNames);

		try {
			displayToast(
				"info",
				"Export Started",
				`Exporting ${selectedCombos.length} combo${
					selectedCombos.length > 1 ? "s" : ""
				}: ${
					comboNames.length > 100
						? comboNames.substring(0, 100) + "..."
						: comboNames
				}`,
				4000
			);

			const response = await fetch(
				`${API_BASE}/billing_combo/export_multiple`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						combo_ids: comboIds,
					}),
				}
			);

			const result = await response.json();

			// Debug logging for response
			console.log("Export response:", result);
			console.log("Total combos exported:", result.meta?.total_combos_exported);
			console.log("Missing combos:", result.meta?.missing_combo_ids);

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

				// Show success message with details
				let successMessage = `Successfully exported ${result.meta.total_combos_exported} combos with ${result.meta.total_codes} total codes`;

				// Show warning if some combos were missing
				if (result.meta.missing_count > 0) {
					successMessage += ` (Warning: ${result.meta.missing_count} combos not found)`;
				}

				displayToast("success", "Export Complete", successMessage, 6000);

				// Clear selection after successful export
				$("#billingComboTable").bootstrapTable("uncheckAll");
				this.updateExportButtonState();
			} else {
				throw new Error(result.message || "Failed to export combos");
			}
		} catch (error) {
			console.error("Error exporting selected combos:", error);
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
				backdrop: true,
				closeButton: false,
				size: "normal",
				centerVertical: false,
				className: "bootbox-confirm-delete",
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

	// =============================================================================
	// Import Functionality
	// =============================================================================

	showImportModal() {
		this.resetImportModal();
		$("#importComboModal").modal("show");
		this.setupDragAndDrop();
	}

	resetImportModal() {
		// Reset all sections to initial state
		$("#fileUploadSection").show();
		$("#importPreviewSection").hide();
		$("#importProgressSection").hide();
		$("#importResultsSection").hide();

		// Reset form elements
		$("#importFileInput").val("");
		$("#btnStartImport").hide();
		$("#btnNewImport").hide();

		// Clear any stored data
		this.importData = null;
		this.importFormat = null;
	}

	setupDragAndDrop() {
		const dropZone = $("#dropZone")[0];

		// Prevent default drag behaviors
		["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
			dropZone.addEventListener(eventName, this.preventDefaults, false);
			document.body.addEventListener(eventName, this.preventDefaults, false);
		});

		// Highlight drop zone when item is dragged over it
		["dragenter", "dragover"].forEach((eventName) => {
			dropZone.addEventListener(
				eventName,
				() => this.highlight(dropZone),
				false
			);
		});

		["dragleave", "drop"].forEach((eventName) => {
			dropZone.addEventListener(
				eventName,
				() => this.unhighlight(dropZone),
				false
			);
		});

		// Handle dropped files
		dropZone.addEventListener("drop", (e) => this.handleDrop(e), false);
	}

	preventDefaults(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	highlight(element) {
		element.style.borderColor = "#007bff";
		element.style.backgroundColor = "#f8f9fa";
	}

	unhighlight(element) {
		element.style.borderColor = "#dee2e6";
		element.style.backgroundColor = "transparent";
	}

	handleDrop(e) {
		const dt = e.dataTransfer;
		const files = dt.files;

		if (files.length > 0) {
			this.processFile(files[0]);
		}
	}

	handleFileSelection(e) {
		const file = e.target.files[0];
		if (file) {
			this.processFile(file);
		}
	}

	async processFile(file) {
		// Validate file type
		if (!file.name.toLowerCase().endsWith(".json")) {
			this.showToast("Please select a JSON file", "error");
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			this.showToast("File size too large. Maximum 10MB allowed.", "error");
			return;
		}

		try {
			const content = await this.readFileAsText(file);
			const jsonData = JSON.parse(content);

			this.importData = jsonData;
			this.detectImportFormat(jsonData);
			this.showImportPreview();
		} catch (error) {
			console.error("File processing error:", error);
			this.showToast(
				"Invalid JSON file. Please check the file format.",
				"error"
			);
		}
	}

	readFileAsText(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = (e) => reject(e);
			reader.readAsText(file);
		});
	}

	detectImportFormat(jsonData) {
		// Detect format based on JSON structure
		if (jsonData.combo_data) {
			this.importFormat = "single";
		} else if (jsonData.combos && Array.isArray(jsonData.combos)) {
			this.importFormat = "multi";
		} else {
			throw new Error("Unknown import format");
		}
	}

	showImportPreview() {
		$("#fileUploadSection").hide();
		$("#importPreviewSection").show();
		$("#btnStartImport").show();

		// Show format info
		const formatText =
			this.importFormat === "single" ? "Single Combo" : "Multiple Combos";
		const comboCount =
			this.importFormat === "single" ? 1 : this.importData.combos.length;

		$("#importInfo").html(`
			<i class="fas fa-info-circle"></i>
			<strong>Format:</strong> ${formatText} 
			<strong>Count:</strong> ${comboCount} combo(s)
		`);

		if (this.importFormat === "single") {
			this.showSingleComboPreview();
		} else {
			this.showMultiComboPreview();
		}
	}

	showSingleComboPreview() {
		const combo = this.importData.combo_data;

		$("#previewComboName").text(combo.combo_name);
		$("#previewSpecialty").text(combo.specialty);
		$("#previewDescription").text(combo.combo_description || "No description");
		$("#previewCodeCount").text(`${combo.combo_codes.length} codes`);

		$("#singleComboPreview").show();
		$("#multiComboPreview").hide();
	}

	showMultiComboPreview() {
		const tbody = $("#multiComboPreviewBody");
		tbody.empty();

		this.importData.combos.forEach((combo) => {
			const codeCount = combo.combo_codes.length;
			const row = $(`
				<tr>
					<td>${combo.combo_name}</td>
					<td><span class="badge bg-secondary">${combo.specialty}</span></td>
					<td>${codeCount} codes</td>
					<td><span class="badge bg-info">Ready</span></td>
				</tr>
			`);
			tbody.append(row);
		});

		$("#singleComboPreview").hide();
		$("#multiComboPreview").show();
	}

	async startImport() {
		$("#importPreviewSection").hide();
		$("#importProgressSection").show();
		$("#btnStartImport").hide();

		try {
			this.updateProgress(10, "Preparing import...");

			// Prepare import data
			const importPayload = {
				import_data: this.importData,
			};

			this.updateProgress(30, "Validating data...");

			// Send import request
			const response = await fetch(`${API_BASE}/billing_combo/import`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(importPayload),
			});

			this.updateProgress(70, "Processing import...");

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const result = await response.json();

			this.updateProgress(100, "Import complete!");

			// Show results
			setTimeout(() => {
				this.showImportResults(result);
			}, 500);
		} catch (error) {
			console.error("Import error:", error);
			this.showImportError(error.message);
		}
	}

	updateProgress(percentage, status) {
		$("#importProgressBar")
			.css("width", `${percentage}%`)
			.attr("aria-valuenow", percentage)
			.text(`${percentage}%`);

		$("#importStatus").text(status);
	}

	showImportResults(result) {
		$("#importProgressSection").hide();
		$("#importResultsSection").show();
		$("#btnNewImport").show();

		if (result.status === "success") {
			this.showSuccessResults(result);
		} else {
			this.showErrorResults(result);
		}

		// Refresh the main table to show new combos
		$("#billingComboTable").bootstrapTable("refresh");
	}

	showSuccessResults(result) {
		const data = result.data;
		let summaryClass = "alert-success";
		let summaryText = "";

		if (data.format_detected === "single") {
			const importedCombo = data.results[0];
			summaryText = `<i class="fas fa-check-circle"></i> Successfully imported: <strong>${importedCombo.final_name}</strong>`;
			if (importedCombo.final_name !== importedCombo.original_name) {
				summaryText += `<br><small class="text-muted">Original name was modified to avoid conflicts</small>`;
			}
		} else {
			const successCount = data.imported_count;
			const totalCount = data.total_count;

			if (successCount === totalCount) {
				summaryText = `<i class="fas fa-check-circle"></i> Successfully imported all <strong>${successCount}</strong> combos`;
			} else {
				summaryClass = "alert-warning";
				summaryText = `<i class="fas fa-exclamation-triangle"></i> Imported <strong>${successCount}/${totalCount}</strong> combos`;
			}
		}

		$("#importSummary")
			.removeClass()
			.addClass(`alert ${summaryClass}`)
			.html(summaryText);

		// Show detailed results
		this.showDetailedResults(data);
	}

	showErrorResults(result) {
		$("#importSummary")
			.removeClass()
			.addClass("alert alert-danger")
			.html(
				`<i class="fas fa-times-circle"></i> Import failed: ${result.message}`
			);

		if (result.details) {
			$("#importDetails").html(
				`<pre class="text-danger">${JSON.stringify(
					result.details,
					null,
					2
				)}</pre>`
			);
		}
	}

	showDetailedResults(data) {
		let detailsHtml = "";

		if (data.format_detected === "single") {
			const importedCombo = data.results[0];
			detailsHtml = `
				<div class="list-group">
					<div class="list-group-item">
						<div class="d-flex w-100 justify-content-between">
							<h6 class="mb-1">${importedCombo.final_name}</h6>
							<span class="badge bg-success">Imported</span>
						</div>
						<small>Codes: ${importedCombo.codes_count}</small>
					</div>
				</div>
			`;
		} else {
			detailsHtml = "<div class='list-group'>";

			// Show all results
			data.results.forEach((result) => {
				const badgeClass =
					result.status === "imported" ? "bg-success" : "bg-danger";
				const statusText = result.status === "imported" ? "Imported" : "Failed";

				detailsHtml += `
					<div class="list-group-item">
						<div class="d-flex w-100 justify-content-between">
							<h6 class="mb-1">${result.final_name || result.original_name}</h6>
							<span class="badge ${badgeClass}">${statusText}</span>
						</div>
						${result.message ? `<p class="mb-1 text-muted">${result.message}</p>` : ""}
						${result.codes_count ? `<small>Codes: ${result.codes_count}</small>` : ""}
					</div>
				`;
			});

			detailsHtml += "</div>";
		}

		$("#importDetails").html(detailsHtml);
	}

	showImportError(message) {
		$("#importProgressSection").hide();
		$("#importResultsSection").show();
		$("#btnNewImport").show();

		$("#importSummary")
			.removeClass()
			.addClass("alert alert-danger")
			.html(`<i class="fas fa-times-circle"></i> Import failed: ${message}`);
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
