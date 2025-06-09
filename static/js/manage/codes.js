// codes.js - Main logic for nomenclature codes CRUD (modal and event handling)

// API Configuration
const API_BASE_URL = "https://nomen.c66.ovh";

/**
 * API wrapper functions for nomenclature codes operations
 */
const CodesAPI = {
	/**
	 * Search codes with basic nomenclature code filtering
	 * @param {object} params - Search parameters {limit, offset, search}
	 * @returns {Promise} - API response
	 */
	async searchCodes(params = {}) {
		try {
			const queryParams = new URLSearchParams();

			// Basic pagination
			queryParams.append("limit", params.limit || 20);
			queryParams.append("offset", params.offset || 0);

			// Simple search by nomenclature code only
			if (params.search && params.search.trim().length >= 2) {
				const searchTerm = params.search.trim();
				queryParams.append("nomen_code_prefix", searchTerm);
			}

			// Sorting
			if (params.sort) {
				queryParams.append("sort", params.sort);
				queryParams.append("order", params.order || "asc");
			}

			const url = `${API_BASE_URL}/tarifs/search?${queryParams.toString()}`;
			console.log("[CodesAPI] Search URL:", url);

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log("[CodesAPI] Search response:", data);
			return data;
		} catch (error) {
			console.error("[CodesAPI] Search error:", error);
			throw error;
		}
	},

	/**
	 * Create a new nomenclature code
	 * @param {object} codeData - Code data object
	 * @returns {Promise} - API response
	 */
	async createCode(codeData) {
		try {
			const response = await fetch(`${API_BASE_URL}/tarifs/codes`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(codeData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.detail || `HTTP error! status: ${response.status}`
				);
			}

			return await response.json();
		} catch (error) {
			console.error("[CodesAPI] Create error:", error);
			throw error;
		}
	},

	/**
	 * Update an existing nomenclature code
	 * @param {string} nomenCode - The nomenclature code to update
	 * @param {object} codeData - Updated code data
	 * @returns {Promise} - API response
	 */
	async updateCode(nomenCode, codeData) {
		try {
			const response = await fetch(
				`${API_BASE_URL}/tarifs/codes/${nomenCode}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(codeData),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.detail || `HTTP error! status: ${response.status}`
				);
			}

			return await response.json();
		} catch (error) {
			console.error("[CodesAPI] Update error:", error);
			throw error;
		}
	},

	/**
	 * Delete a nomenclature code
	 * @param {string} nomenCode - The nomenclature code to delete
	 * @returns {Promise} - API response
	 */
	async deleteCode(nomenCode) {
		try {
			const response = await fetch(
				`${API_BASE_URL}/tarifs/codes/${nomenCode}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.detail || `HTTP error! status: ${response.status}`
				);
			}

			return await response.json();
		} catch (error) {
			console.error("[CodesAPI] Delete error:", error);
			throw error;
		}
	},
};

/**
 * Utility functions for form validation and UI management
 */
const CodesUtils = {
	/**
	 * Validate form data before submission
	 * @param {FormData} formData - Form data to validate
	 * @returns {object} - {isValid: boolean, errors: array}
	 */
	validateForm(formData) {
		const errors = [];

		// Required: nomenclature code
		const nomenCode = formData.get("nomen_code");
		if (!nomenCode || nomenCode.trim() === "") {
			errors.push("Nomenclature code is required");
		} else if (!/^\d+$/.test(nomenCode.trim())) {
			errors.push("Nomenclature code must be numeric");
		}

		// Required: at least one description
		const descFr = formData.get("nomen_desc_fr");
		const descNl = formData.get("nomen_desc_nl");
		if (
			(!descFr || descFr.trim() === "") &&
			(!descNl || descNl.trim() === "")
		) {
			errors.push("At least one description (French or Dutch) is required");
		}

		return {
			isValid: errors.length === 0,
			errors: errors,
		};
	},

	/**
	 * Display toast notification
	 * @param {string} message - Message to display
	 * @param {string} type - Type of notification (success, error, info)
	 */
	displayToast(message, type = "info") {
		// Check if displayToast function exists globally (from common templates)
		if (typeof window.displayToast === "function") {
			window.displayToast(message, type);
		} else {
			// Fallback to console and simple alert
			console.log(`[${type.toUpperCase()}] ${message}`);
			if (type === "error") {
				alert(`Error: ${message}`);
			}
		}
	},

	/**
	 * Refresh the bootstrap table
	 */
	refreshTable() {
		$("#codes-table").bootstrapTable("refresh");
	},
};

// Make CodesUtils available globally
window.CodesUtils = CodesUtils;

$(function () {
	// Initialize Bootstrap 5 modal instance
	window.codeModal = new bootstrap.Modal(document.getElementById("codeModal"), {
		backdrop: "static",
		keyboard: false,
	});

	// Ensure modal is hidden on page load
	$("#codeModal").on("shown.bs.modal", function () {
		// Autofocus first input if needed
		$("#nomen_code").trigger("focus");
	});

	$("#codeModal").on("hidden.bs.modal", function () {
		// Reset form when modal is closed
		$("#code-form")[0].reset();
		// Reset modal title for next use
		$("#codeModalLabel").html(
			'<i class="bi bi-plus-circle me-2"></i>Create/Edit Nomenclature Code'
		);
		// Clear validation errors
		$(".is-invalid").removeClass("is-invalid");
		$(".invalid-feedback").remove();
	});

	// Listen for create button
	$("#btn-create-code").on("click", function () {
		$("#code-form")[0].reset();
		$("#codeModalLabel").html(
			'<i class="bi bi-plus-circle me-2"></i>Create New Code'
		);
		$("#code-form").removeAttr("data-edit-code");
		window.codeModal.show();
	});

	// Form submission handler
	$("#code-form").on("submit", async function (e) {
		e.preventDefault();

		const formData = new FormData(this);
		const validation = CodesUtils.validateForm(formData);

		// Clear previous validation errors
		$(".is-invalid").removeClass("is-invalid");
		$(".invalid-feedback").remove();

		if (!validation.isValid) {
			// Display validation errors
			validation.errors.forEach((error) => {
				CodesUtils.displayToast(error, "error");
			});
			return;
		}

		// Prepare data object
		const codeData = {
			nomen_code: parseInt(formData.get("nomen_code")),
			nomen_desc_fr: formData.get("nomen_desc_fr") || null,
			nomen_desc_nl: formData.get("nomen_desc_nl") || null,
			fee: parseFloat(formData.get("fee")) || 0.0,
			fee_code_cat: parseInt(formData.get("fee_code_cat")) || 4,
			feecode: parseInt(formData.get("feecode")) || 1600,
			dbegin_fee:
				formData.get("dbegin_fee") || new Date().toISOString().split("T")[0],
			dend_fee: formData.get("dend_fee") || "2099-12-31",
			nomen_grp_n: formData.get("nomen_grp_n") || "",
		};

		try {
			// Show loading state
			const submitBtn = $(this).find('button[type="submit"]');
			const originalText = submitBtn.html();
			submitBtn
				.html('<i class="bi bi-hourglass-split"></i> Saving...')
				.prop("disabled", true);

			const isEdit = $(this).attr("data-edit-code");
			let result;

			if (isEdit) {
				// Update existing code
				result = await CodesAPI.updateCode(isEdit, codeData);
				CodesUtils.displayToast("Code updated successfully!", "success");
			} else {
				// Create new code
				result = await CodesAPI.createCode(codeData);
				CodesUtils.displayToast("Code created successfully!", "success");
			}

			// Close modal and refresh table
			window.codeModal.hide();
			CodesUtils.refreshTable();
		} catch (error) {
			CodesUtils.displayToast(error.message, "error");
		} finally {
			// Restore button state
			const submitBtn = $(this).find('button[type="submit"]');
			submitBtn.html("Save Code").prop("disabled", false);
		}
	});

	// Listen for edit event from codes_bt.js
	$(document).on("editCode", function (e, codeId) {
		// TODO: Load code data by codeId and fill form
		$("#codeModalLabel").html(
			'<i class="bi bi-pencil me-2"></i>Edit Code #' + codeId
		);
		$("#code-form").attr("data-edit-code", codeId);
		window.codeModal.show();
	});

	// Listen for delete event (to be implemented)
	$(document).on("deleteCode", function (e, codeId) {
		// Implement delete logic with confirmation dialog
		if (typeof bootbox !== "undefined") {
			bootbox.confirm({
				title: "Delete Nomenclature Code",
				message: `Are you sure you want to delete code ${codeId}? This action cannot be undone.`,
				buttons: {
					confirm: {
						label: '<i class="bi bi-trash"></i> Delete',
						className: "btn-danger",
					},
					cancel: {
						label: '<i class="bi bi-x-circle"></i> Cancel',
						className: "btn-secondary",
					},
				},
				callback: async function (result) {
					if (result) {
						try {
							await CodesAPI.deleteCode(codeId);
							CodesUtils.displayToast("Code deleted successfully!", "success");
							CodesUtils.refreshTable();
						} catch (error) {
							CodesUtils.displayToast(error.message, "error");
						}
					}
				},
			});
		} else {
			// Fallback to native confirm
			if (confirm(`Are you sure you want to delete code ${codeId}?`)) {
				CodesAPI.deleteCode(codeId)
					.then(() => {
						CodesUtils.displayToast("Code deleted successfully!", "success");
						CodesUtils.refreshTable();
					})
					.catch((error) => {
						CodesUtils.displayToast(error.message, "error");
					});
			}
		}
	});
});

console.log(
	"[codes.js] Main application logic loaded with enhanced search functionality."
);
