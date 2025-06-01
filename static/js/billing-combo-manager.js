/**
 * Billing Combo Manager JavaScript
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
		this.selectedCodes = [];
		this.searchTimeout = null;
		this.currentEditId = null;

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

		// Edit modal
		$("#btnUpdateCombo").on("click", () => this.updateCombo());

		// Dynamic events for results
		$(document).on("click", ".add-nomen-code", (e) =>
			this.addNomenclatureCode(e)
		);
		$(document).on("click", ".remove-selected-code", (e) =>
			this.removeSelectedCode(e)
		);
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
			this.showToast("Search failed. Please try again.", "error");
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
			results.forEach((item) => {
				const code = item.nomen_code || item.code;
				const description =
					item.nomen_desc_fr ||
					item.description_fr ||
					item.description ||
					"N/A";
				const feecode = item.feecode || "N/A";
				const fee = item.fee ? parseFloat(item.fee).toFixed(2) : "N/A";

				// Check if code is already selected
				const isSelected = this.selectedCodes.some(
					(selected) => selected.code == code
				);
				const buttonClass = isSelected
					? "btn-secondary disabled"
					: "btn-primary add-nomen-code";
				const buttonText = isSelected ? "Added" : "Add";
				const buttonIcon = isSelected ? "fas fa-check" : "fas fa-plus";

				tbody.append(`
                    <tr>
                        <td><strong>${code}</strong></td>
                        <td>${
													description.length > 50
														? description.substring(0, 50) + "..."
														: description
												}</td>
                        <td><span class="badge bg-info">${feecode}</span></td>
                        <td>€${fee}</td>
                        <td>
                            <button type="button" class="btn btn-sm ${buttonClass}" 
                                    data-code="${code}" 
                                    data-description="${description}" 
                                    data-feecode="${feecode}" 
                                    data-fee="${fee}"
                                    ${isSelected ? "disabled" : ""}>
                                <i class="${buttonIcon}"></i> ${buttonText}
                            </button>
                        </td>
                    </tr>
                `);
			});
		}

		$("#nomenclatureResults").show();
	}

	addNomenclatureCode(event) {
		const button = $(event.currentTarget);
		const code = button.data("code");
		const description = button.data("description");
		const feecode = button.data("feecode");
		const fee = button.data("fee");

		// Check if already selected
		if (this.selectedCodes.some((selected) => selected.code == code)) {
			return;
		}

		// Add to selected codes
		this.selectedCodes.push({
			code: code,
			description: description,
			feecode: feecode,
			fee: fee,
		});

		// Update UI
		this.updateSelectedCodesDisplay();
		this.updateFormState();

		// Update button state
		button
			.removeClass("btn-primary add-nomen-code")
			.addClass("btn-secondary disabled")
			.prop("disabled", true)
			.html('<i class="fas fa-check"></i> Added');

		// Hide search results
		$("#nomenclatureResults").hide();
		$("#nomenclatureSearch").val("");

		this.showToast(`Added code ${code} to combo`, "success");
	}

	removeSelectedCode(event) {
		const button = $(event.currentTarget);
		const code = button.data("code");

		// Remove from selected codes
		this.selectedCodes = this.selectedCodes.filter(
			(selected) => selected.code != code
		);

		// Update UI
		this.updateSelectedCodesDisplay();
		this.updateFormState();

		this.showToast(`Removed code ${code} from combo`, "info");
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
			this.selectedCodes.forEach((code) => {
				html += `
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center bg-white p-2 border rounded">
                            <div>
                                <strong>${code.code}</strong> - ${code.description}
                                <br>
                                <small class="text-muted">
                                    Fee Code: <span class="badge bg-info">${code.feecode}</span> | 
                                    Fee: €${code.fee}
                                </small>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-danger remove-selected-code" 
                                    data-code="${code.code}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
			});
			html += "</div>";
			container.html(html);
		}

		// Update hidden field
		$("#comboCodes").val(JSON.stringify(this.selectedCodes.map((c) => c.code)));
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
			this.showToast("Please add at least one nomenclature code", "error");
			return;
		}

		const formData = {
			combo_name: $("#comboName").val().trim(),
			combo_description: $("#comboDescription").val().trim(),
			specialty: $("#comboSpecialty").val(),
			combo_codes: this.selectedCodes.map((c) => c.code),
		};

		try {
			const response = await fetch(`${API_BASE}/billing_combo`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const result = await response.json();

			if (response.ok && result.status === "success") {
				this.showToast("Billing combo created successfully!", "success");
				this.resetForm();
				$("#billingComboTable").bootstrapTable("refresh");
			} else {
				throw new Error(result.message || "Failed to create combo");
			}
		} catch (error) {
			console.error("Error creating combo:", error);
			this.showToast(`Error: ${error.message}`, "error");
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
	}

	// Edit functionality
	editCombo(id, row) {
		this.currentEditId = id;

		$("#editComboId").val(id);
		$("#editComboName").val(row.combo_name);
		$("#editComboDescription").val(row.combo_description || "");
		$("#editComboSpecialty").val(row.specialty);

		// Parse and display codes
		let codes = [];
		try {
			codes = JSON.parse(row.combo_codes || "[]");
		} catch (e) {
			console.error("Error parsing combo codes:", e);
		}

		let codesHtml = "";
		if (codes.length > 0) {
			codesHtml = codes
				.map((code) => `<span class="badge bg-primary me-1">${code}</span>`)
				.join("");
		} else {
			codesHtml = '<span class="text-muted">No codes defined</span>';
		}
		$("#editSelectedCodes").html(codesHtml);
		$("#editComboCodes").val(row.combo_codes);

		$("#editComboModal").modal("show");
	}

	async updateCombo() {
		const id = $("#editComboId").val();

		const formData = {
			combo_name: $("#editComboName").val().trim(),
			combo_description: $("#editComboDescription").val().trim(),
			specialty: $("#editComboSpecialty").val(),
			combo_codes: $("#editComboCodes").val(),
		};

		try {
			const response = await fetch(`${API_BASE}/billing_combo/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const result = await response.json();

			if (response.ok && result.status === "success") {
				this.showToast("Billing combo updated successfully!", "success");
				$("#editComboModal").modal("hide");
				$("#billingComboTable").bootstrapTable("refresh");
			} else {
				throw new Error(result.message || "Failed to update combo");
			}
		} catch (error) {
			console.error("Error updating combo:", error);
			this.showToast(`Error: ${error.message}`, "error");
		}
	}

	async deleteCombo(id, name) {
		const confirmed = await this.showConfirmDialog(
			`Are you sure you want to delete the combo "${name}"?`,
			"This action cannot be undone."
		);

		if (!confirmed) return;

		try {
			const response = await fetch(`${API_BASE}/billing_combo/${id}`, {
				method: "DELETE",
			});

			const result = await response.json();

			if (response.ok && result.status === "success") {
				this.showToast("Billing combo deleted successfully!", "success");
				$("#billingComboTable").bootstrapTable("refresh");
			} else {
				throw new Error(result.message || "Failed to delete combo");
			}
		} catch (error) {
			console.error("Error deleting combo:", error);
			this.showToast(`Error: ${error.message}`, "error");
		}
	}

	showToast(message, type = "info") {
		const bgClass =
			{
				success: "bg-success",
				error: "bg-danger",
				warning: "bg-warning",
				info: "bg-info",
			}[type] || "bg-info";

		$.toast({
			heading: type.charAt(0).toUpperCase() + type.slice(1),
			text: message,
			position: "top-right",
			loaderBg: "#ff6849",
			icon: type,
			hideAfter: 3000,
			stack: 6,
		});
	}

	showConfirmDialog(title, message) {
		return new Promise((resolve) => {
			bootbox.confirm({
				title: title,
				message: message,
				buttons: {
					confirm: {
						label: "Yes, Delete",
						className: "btn-danger",
					},
					cancel: {
						label: "Cancel",
						className: "btn-secondary",
					},
				},
				callback: (result) => resolve(result),
			});
		});
	}
}

// Bootstrap Table formatters and event handlers
function responseHandler_billingCombo(res) {
	// Handle different response formats
	if (res.status === "success" && res.data) {
		return {
			total: res.meta?.total || res.data.length,
			rows: res.data,
		};
	} else if (res.items) {
		return {
			total: res.count || res.items.length,
			rows: res.items,
		};
	} else if (Array.isArray(res)) {
		return {
			total: res.length,
			rows: res,
		};
	}
	return { total: 0, rows: [] };
}

function specialtyFormatter(value) {
	const badges = {
		ophthalmology: "bg-primary",
		general: "bg-secondary",
		consultation: "bg-info",
	};
	const badgeClass = badges[value] || "bg-secondary";
	return `<span class="badge ${badgeClass}">${
		value?.charAt(0).toUpperCase() + value?.slice(1) || "N/A"
	}</span>`;
}

function codesFormatter(value) {
	try {
		const codes = JSON.parse(value || "[]");
		if (codes.length === 0) {
			return '<span class="text-muted">No codes</span>';
		}
		return (
			codes
				.slice(0, 3)
				.map((code) => `<span class="badge bg-secondary me-1">${code}</span>`)
				.join("") +
			(codes.length > 3 ? ` <small>+${codes.length - 3} more</small>` : "")
		);
	} catch (e) {
		return '<span class="text-muted">Invalid format</span>';
	}
}

function operateFormatter(value, row, index) {
	return `
        <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-primary edit-combo" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-combo" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

// Global event handlers for bootstrap table
window.operateEvents = {
	"click .edit-combo": function (e, value, row, index) {
		billingComboManager.editCombo(row.id, row);
	},
	"click .delete-combo": function (e, value, row, index) {
		billingComboManager.deleteCombo(row.id, row.combo_name);
	},
};

// Initialize when document is ready
let billingComboManager;

$(document).ready(function () {
	console.log("Document ready - initializing billing combo manager");

	// Give the DOM a moment to fully render, then check specialty
	setTimeout(function () {
		const currentSpecialty = $("#comboSpecialty").val();
		console.log("Current specialty value:", currentSpecialty);
		console.log("Specialty options HTML:", $("#comboSpecialty").html());

		// Force set the default specialty if empty
		if (!currentSpecialty || currentSpecialty === "") {
			console.log("Setting default specialty to ophthalmology");
			$("#comboSpecialty").val("ophthalmology");
			// Trigger change event to ensure UI updates
			$("#comboSpecialty").trigger("change");

			// Double-check it worked
			const newValue = $("#comboSpecialty").val();
			console.log("Specialty value after setting:", newValue);
		}
	}, 100);

	billingComboManager = new BillingComboManager();

	// Form validation on input
	$("#comboName, #comboSpecialty").on("input change", function () {
		billingComboManager.updateFormState();
	});
});
