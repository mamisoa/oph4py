/**
 * codes_bt.js
 * Bootstrap-table configuration for Belgian healthcare nomenclature codes CRUD
 *
 * Handles server-side pagination, column formatters, detail view, search integration,
 * and action button events for the nomenclature codes table.
 *
 * Dependencies: jQuery (for bootstrap-table), Bootstrap-table, Bootbox
 *
 * Author: [Your Name]
 * Date: [Auto-fill on commit]
 */

// Global variables for search and sorting
var s = "";
var toggle = "";

/**
 * Query params for server-side API - returns object with limit/offset format
 * Simplified to search only by nomenclature code
 * @param {object} params - Bootstrap-table query parameters
 * @returns {object} - Query object for API
 */
function queryParams(params) {
	var queryParams = {
		limit: params.limit,
		offset: params.offset,
	};

	// Simple search by nomenclature code only
	if (params.search && params.search.trim().length >= 2) {
		const searchTerm = params.search.trim();
		queryParams.nomen_code_prefix = searchTerm;
	}

	// Handle sorting
	if (params.sort) {
		queryParams.sort = params.sort;
		queryParams.order = params.order;
	}

	console.log("[codes_bt.js] Search query params:", queryParams);
	return queryParams;
}

/**
 * Response handler to adapt API response to Bootstrap-table format
 * The API returns {data: [...], pagination: {total: ...}} but bootstrap-table expects {rows: [...], total: ...}
 * @param {object} res - API response object
 * @returns {object} - Adapted Bootstrap-table format
 */
function responseHandler(res) {
	return {
		rows: res.data || [],
		total: res.pagination ? res.pagination.total : 0,
	};
}

/**
 * Format French description with truncation and tooltip
 * @param {string} value - The description value
 * @param {object} row - The row data
 * @param {number} index - Row index
 * @returns {string} - Formatted HTML
 */
function frDescFormatter(value, row, index) {
	if (!value) return "-";
	const truncated = value.length > 30 ? value.substring(0, 30) + "..." : value;
	return `<span data-bs-toggle="tooltip" title="${value.replace(
		/"/g,
		"&quot;"
	)}">${truncated}</span>`;
}

/**
 * Format Dutch description with truncation and tooltip
 * @param {string} value - The description value
 * @param {object} row - The row data
 * @param {number} index - Row index
 * @returns {string} - Formatted HTML
 */
function nlDescFormatter(value, row, index) {
	if (!value) return "-";
	const truncated = value.length > 30 ? value.substring(0, 30) + "..." : value;
	return `<span data-bs-toggle="tooltip" title="${value.replace(
		/"/g,
		"&quot;"
	)}">${truncated}</span>`;
}

/**
 * Format currency values
 * @param {number} value - The fee value
 * @param {object} row - The row data
 * @param {number} index - Row index
 * @returns {string} - Formatted currency
 */
function currencyFormatter(value, row, index) {
	if (value === null || value === undefined || value === "") return "-";
	const numValue = parseFloat(value);
	if (isNaN(numValue)) return "-";
	return "€" + numValue.toFixed(2);
}

/**
 * Format action buttons for each row
 * @param {*} value - Not used
 * @param {object} row - The row data
 * @param {number} index - Row index
 * @returns {string} - HTML for action buttons
 */
function actionFormatter(value, row, index) {
	return [
		'<div class="btn-group" role="group">',
		`<button type="button" class="btn btn-sm btn-outline-primary edit-btn" data-code="${row.nomen_code}" title="Edit">`,
		'<i class="bi bi-pencil"></i>',
		"</button>",
		`<button type="button" class="btn btn-sm btn-outline-danger delete-btn" data-code="${row.nomen_code}" title="Delete">`,
		'<i class="bi bi-trash"></i>',
		"</button>",
		"</div>",
	].join("");
}

/**
 * Detail formatter to show additional fields when row is expanded
 * @param {number} index - Row index
 * @param {object} row - Row data
 * @returns {string} - Formatted HTML for detail view
 */
function detailFormatter(index, row) {
	var html = [];

	// Start detail container
	html.push('<div class="detail-view p-3">');
	html.push('<div class="row">');

	// Left column - Validity and Categories
	html.push('<div class="col-md-6">');
	html.push('<h6 class="text-primary mb-2">Validity & Categories</h6>');
	html.push('<table class="table table-sm table-borderless">');

	// Validity dates
	html.push("<tr>");
	html.push("<td><strong>Begin Date:</strong></td>");
	html.push("<td>" + (row.dbegin_fee || "-") + "</td>");
	html.push("</tr>");
	html.push("<tr>");
	html.push("<td><strong>End Date:</strong></td>");
	html.push("<td>" + (row.dend_fee || "-") + "</td>");
	html.push("</tr>");

	// Fee categories
	html.push("<tr>");
	html.push("<td><strong>Fee Code Category:</strong></td>");
	html.push("<td>" + (row.fee_code_cat || "-") + "</td>");
	html.push("</tr>");
	html.push("<tr>");
	html.push("<td><strong>Fee Code:</strong></td>");
	html.push("<td>" + (row.feecode || "-") + "</td>");
	html.push("</tr>");

	// Nomenclature group
	html.push("<tr>");
	html.push("<td><strong>Nomenclature Group:</strong></td>");
	html.push("<td>" + (row.nomen_grp_n || "-") + "</td>");
	html.push("</tr>");

	html.push("</table>");
	html.push("</div>");

	// Right column - Key Letters and Values
	html.push('<div class="col-md-6">');
	html.push('<h6 class="text-primary mb-2">Key Letters & Coefficients</h6>');
	html.push('<table class="table table-sm table-borderless">');

	// Key letters 1-3 with coefficients and values
	for (let i = 1; i <= 3; i++) {
		const keyLetter = row["key_letter" + i];
		const coeff = row["coeff" + i];
		const value = row["value" + i];

		if (keyLetter || coeff || value) {
			html.push("<tr>");
			html.push("<td><strong>Key Letter " + i + ":</strong></td>");
			html.push("<td>" + (keyLetter || "-") + "</td>");
			html.push("</tr>");
			html.push("<tr>");
			html.push("<td><strong>Coefficient " + i + ":</strong></td>");
			html.push("<td>" + (coeff || "-") + "</td>");
			html.push("</tr>");
			html.push("<tr>");
			html.push("<td><strong>Value " + i + ":</strong></td>");
			html.push("<td>" + (value || "-") + "</td>");
			html.push("</tr>");
		}
	}

	// Author document
	if (row.AUTHOR_DOC) {
		html.push("<tr>");
		html.push("<td><strong>Author Document:</strong></td>");
		html.push("<td>" + row.AUTHOR_DOC + "</td>");
		html.push("</tr>");
	}

	html.push("</table>");
	html.push("</div>");
	html.push("</div>");
	html.push("</div>");

	return html.join("");
}

/**
 * Event handlers for action buttons
 */
window.actionEvents = {
	"click .edit-btn": function (e, value, row, index) {
		console.log("[codes_bt.js] Edit clicked for code:", row.nomen_code);
		// Trigger custom event that will be handled by codes.js
		$(document).trigger("editCode", [row.nomen_code]);
	},
	"click .delete-btn": function (e, value, row, index) {
		console.log("[codes_bt.js] Delete clicked for code:", row.nomen_code);
		// Trigger custom event that will be handled by codes.js
		$(document).trigger("deleteCode", [row.nomen_code]);
	},
};

// Initialize tooltips after table loads
$(document).ready(function () {
	console.log("[codes_bt.js] Document ready, initializing table...");

	var $table = $("#codes-table");

	// Check if table element exists
	if ($table.length === 0) {
		console.error("[codes_bt.js] Table element #codes-table not found!");
		return;
	}

	// Check if bootstrapTable function is available
	if (typeof $table.bootstrapTable !== "function") {
		console.error("[codes_bt.js] Bootstrap-table plugin not loaded!");
		return;
	}

	try {
		$table.bootstrapTable({
			sidePagination: "server",
			pagination: true,
			pageSize: 20,
			pageList: "[10, 20, 50, 100]",
			search: true,
			showRefresh: true,
			showColumns: true,
			toolbar: "#codes-toolbar",
			detailView: true,
			detailFormatter: detailFormatter,
			url: "https://nomen.c66.ovh/tarifs/search",
			queryParams: queryParams,
			responseHandler: responseHandler,
			ajaxOptions: {
				beforeSend: function (xhr) {
					console.log("[codes_bt.js] AJAX request starting...");
					$table.bootstrapTable("showLoading");
				},
				complete: function () {
					console.log("[codes_bt.js] AJAX request completed");
					$table.bootstrapTable("hideLoading");
				},
				error: function (xhr, status, error) {
					console.error("[codes_bt.js] AJAX error:", status, error);
					// Show user-friendly error message
					if (typeof window.displayToast === "function") {
						window.displayToast(
							"Error loading data. Please check your internet connection.",
							"error"
						);
					} else {
						alert("Error loading data. Please check your internet connection.");
					}
				},
			},
			onLoadError: function (status) {
				console.error("[codes_bt.js] Bootstrap-table onLoadError:", status);
				// Fallback: show empty table with message
				$table.bootstrapTable("load", []);
			},
		});

		console.log("[codes_bt.js] Bootstrap-table initialized successfully");
	} catch (error) {
		console.error("[codes_bt.js] Error initializing bootstrap-table:", error);
		// Show user-friendly error message
		if (
			typeof window.CodesUtils !== "undefined" &&
			window.CodesUtils.displayToast
		) {
			window.CodesUtils.displayToast(
				"Error initializing table. Please refresh the page.",
				"error"
			);
		}
		return;
	}

	// Re-initialize tooltips after table renders
	$table.on("post-body.bs.table", function () {
		$('[data-bs-toggle="tooltip"]').tooltip();
	});

	// Debug loading events
	$(document).on("load-success.bs.table", "#codes-table", function (e, data) {
		console.log("[codes_bt.js] Table load success:", data);
	});

	$(document).on("load-error.bs.table", "#codes-table", function (e, status) {
		console.error("[codes_bt.js] Table load error:", status);
	});

	$(document).on("refresh.bs.table", "#codes-table", function () {
		console.log("[codes_bt.js] Table refresh event");
	});
});

console.log("[codes_bt.js] Bootstrap-table configuration loaded.");
