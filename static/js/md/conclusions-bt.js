/**
 * Bootstrap-Table Conclusions Management
 * Handles conclusions display and management using bootstrap-table
 *
 * This replaces the previous form-based conclusions.js with a cleaner
 * bootstrap-table approach following project patterns.
 */

// Global variables for conclusions management
let $conclusionsTable;
let conclusionsInitialized = false;

/**
 * Initialize conclusions bootstrap-table management
 */
function initConclusionsBootstrapTable() {
	console.log("Initializing conclusions bootstrap-table interface");

	// Prevent double initialization
	if (conclusionsInitialized) {
		console.log("Conclusions already initialized, skipping...");
		return;
	}

	// Check if table exists
	if (!$("#conclusionsTable").length) {
		console.error("Conclusions table element not found");
		return;
	}

	// Check if table is already initialized by data-toggle="table"
	const tableData = $("#conclusionsTable").data("bootstrap.table");
	if (tableData) {
		console.log(
			"Table already initialized by data-toggle, using existing instance"
		);
		$conclusionsTable = $("#conclusionsTable");
	} else {
		// Initialize bootstrap table manually
		$conclusionsTable = $("#conclusionsTable").bootstrapTable({
			formatSearch: function () {
				return "Search conclusions...";
			},
			onLoadingTemplate: function () {
				return '<div class="text-center p-3"><i class="fas fa-spinner fa-spin"></i> Loading conclusions...</div>';
			},
			onLoadError: function (status) {
				console.error("Error loading conclusions:", status);
				showToast("Error loading conclusions", "error");
			},
			onRefresh: function () {
				loadConclusionsData();
			},
		});
	}

	conclusionsInitialized = true;

	// Load initial data
	loadConclusionsData();

	// Initialize form handlers
	initConclusionFormHandlers();
}

/**
 * Load conclusions data from API using PyDAL RestAPI pattern
 */
function loadConclusionsData() {
	// Add debugging for global variables - check both direct and window object
	console.log("Global variables check:");
	console.log(
		"wlId:",
		typeof wlId !== "undefined"
			? wlId
			: typeof window.wlId !== "undefined"
			? window.wlId
			: "undefined"
	);
	console.log(
		"patientId:",
		typeof patientId !== "undefined"
			? patientId
			: typeof window.patientId !== "undefined"
			? window.patientId
			: "undefined"
	);
	console.log(
		"HOSTURL:",
		typeof HOSTURL !== "undefined"
			? HOSTURL
			: typeof window.HOSTURL !== "undefined"
			? window.HOSTURL
			: "undefined"
	);
	console.log(
		"APP_NAME:",
		typeof APP_NAME !== "undefined"
			? APP_NAME
			: typeof window.APP_NAME !== "undefined"
			? window.APP_NAME
			: "undefined"
	);
	console.log("typeof wlId:", typeof wlId);
	console.log("typeof patientId:", typeof patientId);

	// Get variables with fallbacks to window object
	const worklistId = typeof wlId !== "undefined" ? wlId : window.wlId;
	const patId = typeof patientId !== "undefined" ? patientId : window.patientId;
	const hostUrl = typeof HOSTURL !== "undefined" ? HOSTURL : window.HOSTURL;
	const appName = typeof APP_NAME !== "undefined" ? APP_NAME : window.APP_NAME;

	// Check for required global variables
	if (!worklistId) {
		console.error("Worklist ID not available or invalid:", worklistId);
		showToast("Worklist ID not available", "error");
		return;
	}

	if (!patId) {
		console.error("Patient ID not available or invalid:", patId);
		showToast("Patient ID not available", "error");
		return;
	}

	if (!hostUrl || !appName) {
		console.error(
			"Required global variables (HOSTURL, APP_NAME) not available"
		);
		console.error("HOSTURL:", hostUrl, "APP_NAME:", appName);
		showToast("Application configuration error", "error");
		return;
	}

	// Construct API URL following project's PyDAL RestAPI pattern
	const apiUrl = `${hostUrl}/${appName}/api/ccx?id_worklist.eq=${worklistId}&@lookup=mod!:modified_by[id,first_name,last_name],creator!:created_by[id,first_name,last_name]&@count=true&@order=~id`;

	console.log("Loading conclusions from:", apiUrl);

	$.ajax({
		url: apiUrl,
		method: "GET",
		success: function (response) {
			console.log("Conclusions API response:", response);

			// Handle PyDAL RestAPI response format
			if (response && response.items) {
				const formattedData = formatConclusionsData(response.items);
				$conclusionsTable.bootstrapTable("load", formattedData);
			} else if (Array.isArray(response)) {
				// Fallback for direct array response
				const formattedData = formatConclusionsData(response);
				$conclusionsTable.bootstrapTable("load", formattedData);
			} else {
				console.error("Unexpected response format:", response);
				showToast("Error loading conclusions data", "error");
			}
		},
		error: function (xhr, status, error) {
			console.error("AJAX error loading conclusions:", error);
			console.error("Response:", xhr.responseText);
			showToast("Failed to load conclusions", "error");
		},
	});
}

/**
 * Format conclusions data for bootstrap-table
 */
function formatConclusionsData(data) {
	return data.map((item) => ({
		id: item.id,
		conclusion: item.description || "",
		laterality: formatLateralityDisplay(item.laterality),
		laterality_code: item.laterality, // Keep original for editing
		actions: "", // Will be handled by formatter
	}));
}

/**
 * Format laterality for display
 */
function formatLateralityDisplay(laterality) {
	const lateralityMap = {
		general: "Both",
		right: "Right Eye",
		left: "Left Eye",
		na: "Both", // Legacy support
	};
	return lateralityMap[laterality] || "Both";
}

/**
 * Bootstrap-table row style formatter
 */
function conclusionRowStyle(row, index) {
	const classes = ["conclusion-row"];

	// Add laterality-based styling
	if (row.laterality_code === "right") {
		classes.push("table-warning");
	} else if (row.laterality_code === "left") {
		classes.push("table-info");
	} else {
		classes.push("table-light");
	}

	return {
		classes: classes.join(" "),
	};
}

/**
 * Bootstrap-table actions formatter
 */
function conclusionActionsFormatter(value, row, index) {
	return `
        <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-primary btn-edit-conclusion" 
                    data-id="${row.id}" 
                    data-conclusion="${escapeHtml(row.conclusion)}"
                    data-laterality="${row.laterality_code}"
                    title="Edit conclusion">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-outline-danger btn-delete-conclusion" 
                    data-id="${row.id}"
                    title="Delete conclusion">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

/**
 * Initialize form handlers
 */
function initConclusionFormHandlers() {
	// New conclusion form handler
	$("#newConclusionForm").on("submit", function (e) {
		e.preventDefault();
		handleAddConclusion();
	});

	// Edit conclusion handlers (using event delegation)
	$(document).on("click", ".btn-edit-conclusion", function () {
		const id = $(this).data("id");
		const conclusion = $(this).data("conclusion");
		const laterality = $(this).data("laterality");

		openEditModal(id, conclusion, laterality);
	});

	// Delete conclusion handlers (using event delegation)
	$(document).on("click", ".btn-delete-conclusion", function () {
		const id = $(this).data("id");
		confirmDeleteConclusion(id);
	});

	// Save edited conclusion
	$("#saveEditedConclusion").on("click", function () {
		handleSaveEditedConclusion();
	});
}

/**
 * Handle adding new conclusion using PyDAL RestAPI
 */
function handleAddConclusion() {
	const conclusionText = $("#newConclusionText").val().trim();
	const laterality = $("#newConclusionLaterality").val();

	if (!conclusionText) {
		showToast("Please enter a conclusion", "warning");
		return;
	}

	// Get variables with fallbacks to window object
	const worklistId = typeof wlId !== "undefined" ? wlId : window.wlId;
	const patId = typeof patientId !== "undefined" ? patientId : window.patientId;
	const hostUrl = typeof HOSTURL !== "undefined" ? HOSTURL : window.HOSTURL;
	const appName = typeof APP_NAME !== "undefined" ? APP_NAME : window.APP_NAME;

	if (!worklistId) {
		showToast("Worklist ID not available", "error");
		return;
	}

	if (!patId) {
		showToast("Patient ID not available", "error");
		return;
	}

	const data = {
		description: conclusionText,
		laterality: laterality,
		id_worklist: worklistId,
		id_auth_user: patId,
	};

	// Use PyDAL RestAPI endpoint
	const apiUrl = `${hostUrl}/${appName}/api/ccx`;

	$.ajax({
		url: apiUrl,
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify(data),
		success: function (response) {
			console.log("Add conclusion response:", response);

			if (response && response.success !== false) {
				showToast("Conclusion added successfully", "success");
				$("#newConclusionForm")[0].reset();
				$("#newConclusionLaterality").val("general"); // Reset to default
				loadConclusionsData(); // Reload table
			} else {
				showToast(response.message || "Error adding conclusion", "error");
			}
		},
		error: function (xhr, status, error) {
			console.error("Error adding conclusion:", error);
			console.error("Response:", xhr.responseText);
			showToast("Failed to add conclusion", "error");
		},
	});
}

/**
 * Open edit modal
 */
function openEditModal(id, conclusion, laterality) {
	$("#editConclusionId").val(id);
	$("#editConclusionText").val(conclusion);
	$("#editConclusionLaterality").val(laterality || "general");

	$("#editConclusionModal").modal("show");
}

/**
 * Handle saving edited conclusion using PyDAL RestAPI
 */
function handleSaveEditedConclusion() {
	const id = $("#editConclusionId").val();
	const conclusionText = $("#editConclusionText").val().trim();
	const laterality = $("#editConclusionLaterality").val();

	if (!conclusionText) {
		showToast("Please enter a conclusion", "warning");
		return;
	}

	// Get variables with fallbacks to window object
	const hostUrl = typeof HOSTURL !== "undefined" ? HOSTURL : window.HOSTURL;
	const appName = typeof APP_NAME !== "undefined" ? APP_NAME : window.APP_NAME;

	const data = {
		description: conclusionText,
		laterality: laterality,
	};

	// Use PyDAL RestAPI endpoint
	const apiUrl = `${hostUrl}/${appName}/api/ccx/${id}`;

	$.ajax({
		url: apiUrl,
		method: "PUT",
		contentType: "application/json",
		data: JSON.stringify(data),
		success: function (response) {
			console.log("Update conclusion response:", response);

			if (response && response.success !== false) {
				showToast("Conclusion updated successfully", "success");
				$("#editConclusionModal").modal("hide");
				loadConclusionsData(); // Reload table
			} else {
				showToast(response.message || "Error updating conclusion", "error");
			}
		},
		error: function (xhr, status, error) {
			console.error("Error updating conclusion:", error);
			console.error("Response:", xhr.responseText);
			showToast("Failed to update conclusion", "error");
		},
	});
}

/**
 * Confirm and delete conclusion
 */
function confirmDeleteConclusion(id) {
	if (typeof bootbox !== "undefined") {
		bootbox.confirm({
			title: "Delete Conclusion",
			message:
				"Are you sure you want to delete this conclusion? This action cannot be undone.",
			buttons: {
				confirm: {
					label: '<i class="fas fa-trash"></i> Delete',
					className: "btn-danger",
				},
				cancel: {
					label: '<i class="fas fa-times"></i> Cancel',
					className: "btn-secondary",
				},
			},
			callback: function (confirmed) {
				if (confirmed) {
					deleteConclusion(id);
				}
			},
		});
	} else {
		// Fallback to native confirm
		if (confirm("Are you sure you want to delete this conclusion?")) {
			deleteConclusion(id);
		}
	}
}

/**
 * Delete conclusion using PyDAL RestAPI
 */
function deleteConclusion(id) {
	// Get variables with fallbacks to window object
	const hostUrl = typeof HOSTURL !== "undefined" ? HOSTURL : window.HOSTURL;
	const appName = typeof APP_NAME !== "undefined" ? APP_NAME : window.APP_NAME;

	// Use PyDAL RestAPI endpoint
	const apiUrl = `${hostUrl}/${appName}/api/ccx/${id}`;

	$.ajax({
		url: apiUrl,
		method: "DELETE",
		success: function (response) {
			console.log("Delete conclusion response:", response);

			if (response && response.success !== false) {
				showToast("Conclusion deleted successfully", "success");
				loadConclusionsData(); // Reload table
			} else {
				showToast(response.message || "Error deleting conclusion", "error");
			}
		},
		error: function (xhr, status, error) {
			console.error("Error deleting conclusion:", error);
			console.error("Response:", xhr.responseText);
			showToast("Failed to delete conclusion", "error");
		},
	});
}

/**
 * Utility function to escape HTML
 */
function escapeHtml(text) {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
	// Try to use existing toast system if available
	if (typeof $.toast === "function") {
		$.toast({
			heading: type.charAt(0).toUpperCase() + type.slice(1),
			text: message,
			icon: type,
			position: "top-right",
			hideAfter: 3000,
		});
	} else if (typeof toastr !== "undefined") {
		toastr[type](message);
	} else {
		// Fallback to console and alert
		console.log(`${type.toUpperCase()}: ${message}`);
		if (type === "error") {
			alert(message);
		}
	}
}

// Initialize when document is ready
$(document).ready(function () {
	// Check if we're on a page that should have conclusions
	if ($("#conclusionsTable").length > 0) {
		initConclusionsBootstrapTable();
	}
});
