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
 * @param {object} params - Bootstrap-table query parameters
 * @returns {object} - Query object for API
 */
function queryParams(params) {
	var queryParams = {
		limit: params.limit,
		offset: params.offset,
	};
	if (params.search && params.search.trim().length >= 3) {
		queryParams.nomen_code_prefix = params.search.trim();
	}
	if (params.sort) {
		queryParams.sort = params.sort;
		queryParams.order = params.order;
	}
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
 * Event handlers for action buttons
 */
window.actionEvents = {
	"click .edit-btn": function (e, value, row, index) {
		console.log("[codes_bt.js] Edit clicked for code:", row.nomen_code);
		alert("Edit functionality will be implemented in codes.js");
	},
	"click .delete-btn": function (e, value, row, index) {
		console.log("[codes_bt.js] Delete clicked for code:", row.nomen_code);
		alert("Delete functionality will be implemented in codes.js");
	},
};

// Initialize tooltips after table loads
$(document).ready(function () {
	var $table = $("#codes-table");

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
		url: "https://nomen.c66.ovh/tarifs/search",
		queryParams: queryParams,
		responseHandler: responseHandler,
		ajaxOptions: {
			beforeSend: function (xhr) {
				$table.bootstrapTable("showLoading");
			},
			complete: function () {
				$table.bootstrapTable("hideLoading");
			},
		},
	});

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
