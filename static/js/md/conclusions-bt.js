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
 * Enhanced markdown renderer for conclusions
 * Supports: **bold**, *italic*, ~~strikethrough~~, `code`, [links](url)
 * @param {string} text - The markdown text to render
 * @returns {string} - HTML string
 */
function renderMarkdown(text) {
	if (!text) return "";

	// For conclusions table, we expect plain text (no existing HTML badges)
	// So we can apply standard markdown processing
	return applyMarkdownToText(text);
}

/**
 * Apply markdown formatting to plain text (with HTML escaping)
 * @param {string} text - Plain text to format
 * @returns {string} - HTML string with markdown applied
 */
function applyMarkdownToText(text) {
	if (!text) return "";

	// Escape HTML first to prevent XSS
	let html = text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

	// Apply markdown formatting (using more compatible regex patterns)
	html = html
		// Bold: **text** or __text__
		.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
		.replace(/__(.*?)__/g, "<strong>$1</strong>")
		// Strikethrough: ~~text~~ (process before italic to avoid conflicts)
		.replace(/~~(.*?)~~/g, "<del>$1</del>")
		// Italic: *text* or _text_ (more conservative patterns for browser compatibility)
		.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
		.replace(/\b_([^_\n]+?)_\b/g, "<em>$1</em>")
		// Inline code: `text`
		.replace(/`([^`]+?)`/g, "<code>$1</code>")
		// Links: [text](url)
		.replace(
			/\[([^\]]+?)\]\(([^)]+?)\)/g,
			'<a href="$2" target="_blank">$1</a>'
		)
		// Line breaks
		.replace(/\n/g, "<br>");

	return html;
}

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

	// Initialize bootstrap table manually with proper column configuration
	$conclusionsTable = $("#conclusionsTable").bootstrapTable({
		columns: [
			{
				field: "conclusion",
				title: "Conclusion",
				sortable: true,
				width: "60%",
				widthUnit: "%",
				formatter: conclusionMarkdownFormatter,
			},
			{
				field: "laterality",
				title: "Laterality",
				sortable: true,
				width: "20%",
				widthUnit: "%",
				formatter: lateralityBadgeFormatter,
			},
			{
				field: "actions",
				title: "Actions",
				width: "20%",
				widthUnit: "%",
				align: "center",
				formatter: conclusionActionsFormatter,
			},
		],
		sidePagination: "client",
		pagination: false,
		search: false,
		showRefresh: false,
		showToggle: false,
		showColumns: false,
		sortName: "id",
		sortOrder: "desc",
		classes: "table table-striped table-hover",
		rowStyle: conclusionRowStyle,
		formatNoMatches: function () {
			return "No conclusions found";
		},
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
		conclusion_raw: item.description || "", // Keep raw markdown for editing
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
		na: "Both",
		right: "Right Eye",
		left: "Left Eye",
		general: "Both", // Legacy support for old data
	};
	return lateralityMap[laterality] || "Both";
}

/**
 * Format laterality with colored badges
 */
function lateralityBadgeFormatter(value, row, index) {
	const laterality = row.laterality_code || row.laterality;

	if (laterality === "right") {
		return '<span class="badge" style="background-color: white; color: #0056b3; border: 1px solid #0056b3;">Right Eye</span>';
	} else if (laterality === "left") {
		return '<span class="badge" style="background-color: white; color: #dc3545; border: 1px solid #dc3545;">Left Eye</span>';
	} else {
		return '<span class="badge" style="background-color: white; color: #6c757d; border: 1px solid #6c757d;">Both</span>';
	}
}

/**
 * Bootstrap-table row style formatter
 */
function conclusionRowStyle(row, index) {
	// Add laterality-based row background styling
	if (row.laterality_code === "right") {
		return {
			css: { "background-color": "#D5E3EE" }, // Blue background for right eye
		};
	} else if (row.laterality_code === "left") {
		return {
			css: { "background-color": "#EED9D5" }, // Pink background for left eye
		};
	} else {
		return {
			css: { "background-color": "white" }, // White background for both
		};
	}
}

/**
 * Bootstrap-table actions formatter
 */
function conclusionActionsFormatter(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="btn-edit-conclusion" href="javascript:void(0)" title="Edit conclusion" ' +
			'data-id="' +
			row.id +
			'" ' +
			'data-conclusion="' +
			escapeHtml(row.conclusion_raw || row.conclusion) +
			'" ' +
			'data-laterality="' +
			row.laterality_code +
			'"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="btn-delete-conclusion ms-1" href="javascript:void(0)" title="Delete conclusion" ' +
			'data-id="' +
			row.id +
			'"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

/**
 * Conclusion column formatter with markdown support
 */
function conclusionMarkdownFormatter(value, row, index) {
	const renderedHtml = renderMarkdown(value || "");

	// Wrap in a div with markdown-specific styling
	return `<div class="markdown-content" style="line-height: 1.4; word-wrap: break-word;">${renderedHtml}</div>`;
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

			// Check for API error responses (PyDAL RestAPI format)
			if (
				response &&
				(response.status === "error" ||
					(response.errors && Object.keys(response.errors).length > 0) ||
					response.success === false)
			) {
				const errorMessage = response.message || "Error adding conclusion";
				console.error("API returned error:", response);
				showToast(errorMessage, "error");
			} else if (response && (response.id || response.status === "success")) {
				showToast("Conclusion added successfully", "success");
				$("#newConclusionForm")[0].reset();
				$("#newConclusionLaterality").val("na"); // Reset to default
				loadConclusionsData(); // Reload table
			} else {
				console.error("Unexpected response format:", response);
				showToast("Unexpected response from server", "error");
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
	$("#editConclusionLaterality").val(laterality || "na");

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

			// Check for API error responses (PyDAL RestAPI format)
			if (
				response &&
				(response.status === "error" ||
					(response.errors && Object.keys(response.errors).length > 0) ||
					response.success === false)
			) {
				const errorMessage = response.message || "Error updating conclusion";
				console.error("API returned error:", response);
				showToast(errorMessage, "error");
			} else if (response && (response.id || response.status === "success")) {
				showToast("Conclusion updated successfully", "success");
				$("#editConclusionModal").modal("hide");
				loadConclusionsData(); // Reload table
			} else {
				console.error("Unexpected response format:", response);
				showToast("Unexpected response from server", "error");
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

			// Check for API error responses (PyDAL RestAPI format)
			if (
				response &&
				(response.status === "error" ||
					(response.errors && Object.keys(response.errors).length > 0) ||
					response.success === false)
			) {
				const errorMessage = response.message || "Error deleting conclusion";
				console.error("API returned error:", response);
				showToast(errorMessage, "error");
			} else {
				showToast("Conclusion deleted successfully", "success");
				loadConclusionsData(); // Reload table
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
