/**
 * Daily Transactions Bootstrap Table Implementation
 * Handles filtering, pagination, and summary calculations for transaction data
 */

// Global variables for bootstrap table (API_TRANSACTIONS_BASE and TODAY_DATE are defined in the template)
let s_transactions = "";
let toggle_transactions = "";
let filterTimeout = null; // For debouncing filter changes

/**
 * Build query parameters for custom daily transactions API
 * @param {Object} params - Bootstrap table parameters
 * @returns {String} URL-encoded query string
 */
function queryParams_transactions(params) {
	let query = "";

	// Get filter values
	const selectedStartDate = document.getElementById("filterStartDate").value;
	const selectedEndDate = document.getElementById("filterEndDate").value;
	const selectedSenior = document.getElementById("selectSenior").value;

	// Date range filtering - use custom parameter format
	if (selectedStartDate) {
		const startDate = selectedStartDate + " 00:00:00";
		query += `&date_start=${encodeURIComponent(startDate)}`;
	}
	if (selectedEndDate) {
		const endDate = selectedEndDate + " 23:59:59";
		query += `&date_end=${encodeURIComponent(endDate)}`;
	}

	// Senior filtering - now properly supported server-side
	if (selectedSenior) {
		query += `&senior_id=${selectedSenior}`;
	}

	// Search functionality - simplified format for custom API
	if (params.search && params.search.trim() !== "") {
		query += `&search=${encodeURIComponent(params.search.trim())}`;
	}

	// Sorting - use custom parameter format
	if (params.sort !== undefined) {
		let sortField = params.sort;
		const sortDirection = toggle_transactions === "" ? "asc" : "desc";

		query += `&order=${sortField}&order_dir=${sortDirection}`;
		toggle_transactions = toggle_transactions === "" ? "desc" : "";
	}

	// Pagination - use custom parameter format
	if (params.offset) {
		query += `&offset=${params.offset}`;
	}
	if (params.limit) {
		query += `&limit=${params.limit}`;
	}

	console.log("Query params for custom API:", query);
	return query.substring(1); // Remove leading &
}

/**
 * Handle API response for bootstrap table
 * @param {Object} res - API response
 * @returns {Object} Formatted response for bootstrap table
 */
function responseHandler_transactions(res) {
	console.log("Raw API response:", res);

	// Hide loading indicators
	hideLoadingState();

	let formattedData = {
		total: 0,
		rows: [],
	};

	try {
		// Handle PyDAL RestAPI response format
		if (res && res.items && Array.isArray(res.items)) {
			formattedData.total = res.count || res.items.length;
			formattedData.rows = res.items.map(formatTransactionRow);
		} else if (res && Array.isArray(res)) {
			formattedData.total = res.length;
			formattedData.rows = res.map(formatTransactionRow);
		} else if (res && res.error) {
			// Handle API error response
			console.error("API Error:", res.error);
			showErrorState(res.error);
			return { total: 0, rows: [] };
		} else {
			console.warn("Unknown response format:", res);
			formattedData = res || { total: 0, rows: [] };
		}

		// ENHANCEMENT: Update summary cards from backend summary (not visible rows)
		if (res.summary) {
			updateSummaryCardsFromBackend(res.summary);
		} else {
			// Fallback: Use client-side calculation if backend summary not available
			updateSummaryCards(formattedData.rows);
		}

		// Show empty state if no data
		if (formattedData.rows.length === 0) {
			showEmptyState();
		}
	} catch (error) {
		console.error("Error processing response:", error);
		showErrorState("Error processing data");
		return { total: 0, rows: [] };
	}

	return formattedData;
}

/**
 * Format individual transaction row for display
 * @param {Object} transaction - Raw transaction data
 * @returns {Object} Formatted transaction row
 */
function formatTransactionRow(transaction) {
	console.log("Formatting transaction:", transaction);

	// Handle different response structures
	const worklist = transaction.id_worklist || {};
	const patient = transaction.id_auth_user || {};
	const procedure = worklist.procedure || {};
	const senior = worklist.senior || {};

	return {
		id: transaction.id,
		transaction_time: transaction.transaction_date
			? formatTime(transaction.transaction_date)
			: "N/A",
		patient_name: formatPatientName(patient),
		senior_name: formatSeniorName(senior),
		amount_card: formatCurrency(transaction.amount_card),
		amount_cash: formatCurrency(transaction.amount_cash),
		amount_invoice: formatCurrency(transaction.amount_invoice),
		total_amount: formatCurrency(transaction.total_amount, "success"),
		payment_status: formatPaymentStatus(transaction.payment_status),
		remaining_balance: formatBalance(transaction.remaining_balance),
		notes: formatNotes(transaction.notes),
		// Store raw values for summary calculations
		_raw_amount_card: transaction.amount_card || 0,
		_raw_amount_cash: transaction.amount_cash || 0,
		_raw_amount_invoice: transaction.amount_invoice || 0,
		_raw_total_amount: transaction.total_amount || 0,
		_raw_payment_status: transaction.payment_status || "unknown",
		// Store detail data (removed from main table view)
		_detail_procedure_name: procedure.exam_name || `WL-${worklist.id || "N/A"}`,
		_detail_laterality: formatLaterality(worklist.laterality),
		_detail_worklist_id: worklist.id || "N/A",
		_detail_patient_auth_id: patient.id || "N/A",
		_detail_procedure_raw: procedure,
		_detail_worklist_raw: worklist,
	};
}

/**
 * Format time from datetime string
 * @param {String} datetime - Datetime string
 * @returns {String} Formatted time
 */
function formatTime(datetime) {
	try {
		const date = new Date(datetime);
		return date.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	} catch (e) {
		return "N/A";
	}
}

/**
 * Format patient name
 * @param {Object} patient - Patient object
 * @returns {String} Formatted patient name
 */
function formatPatientName(patient) {
	if (!patient || (!patient.first_name && !patient.last_name)) {
		return "Unknown Patient";
	}

	const name = `${patient.first_name || ""} ${patient.last_name || ""}`.trim();

	return `<div class="fw-semibold text-dark">${name}</div>`;
}

/**
 * Format senior doctor name
 * @param {Object} senior - Senior doctor object
 * @returns {String} Formatted senior name
 */
function formatSeniorName(senior) {
	if (!senior || (!senior.first_name && !senior.last_name)) {
		return "N/A";
	}

	return `${senior.first_name || ""} ${senior.last_name || ""}`.trim();
}

/**
 * Format laterality with badge
 * @param {String} laterality - Laterality value
 * @returns {String} Formatted laterality badge
 */
function formatLaterality(laterality) {
	if (!laterality) return "N/A";

	return `<span class="badge bg-secondary bg-opacity-10 text-dark border">${
		laterality.charAt(0).toUpperCase() + laterality.slice(1)
	}</span>`;
}

/**
 * Format currency amount
 * @param {Number} amount - Amount to format
 * @param {String} colorClass - Bootstrap color class
 * @returns {String} Formatted currency
 */
function formatCurrency(amount, colorClass = "") {
	const value = parseFloat(amount) || 0;

	if (value === 0) {
		return '<span class="text-muted">-</span>';
	}

	const colorClassString = colorClass ? ` text-${colorClass}` : "";
	return `<span class="fw-semibold${colorClassString}">€${value.toFixed(
		2
	)}</span>`;
}

/**
 * Format payment status with appropriate badge
 * @param {String} status - Payment status
 * @returns {String} Formatted status badge
 */
function formatPaymentStatus(status) {
	const statusMap = {
		complete: "bg-success",
		partial: "bg-warning",
		overpaid: "bg-info",
		refunded: "bg-secondary",
	};

	const badgeClass = statusMap[status] || "bg-secondary";
	const displayStatus = status
		? status.charAt(0).toUpperCase() + status.slice(1)
		: "Unknown";

	return `<span class="badge ${badgeClass}">${displayStatus}</span>`;
}

/**
 * Format remaining balance with appropriate styling
 * @param {Number} balance - Remaining balance
 * @returns {String} Formatted balance
 */
function formatBalance(balance) {
	const value = parseFloat(balance) || 0;

	if (value > 0) {
		return `<span class="fw-semibold text-danger">€${value.toFixed(2)}</span>`;
	} else if (value < 0) {
		return `<span class="fw-semibold text-info">€${Math.abs(value).toFixed(
			2
		)} credit</span>`;
	} else {
		return '<span class="fw-semibold text-success">€0.00</span>';
	}
}

/**
 * Format transaction notes
 * @param {String} notes - Transaction notes
 * @returns {String} Formatted notes
 */
function formatNotes(notes) {
	if (!notes || notes.trim() === "") {
		return '<span class="text-muted">-</span>';
	}

	const maxLength = 30;
	const truncated =
		notes.length > maxLength ? notes.substring(0, maxLength) + "..." : notes;

	return `<span class="text-truncate d-inline-block" style="max-width: 150px;" title="${notes}">${truncated}</span>`;
}

/**
 * Row styling for bootstrap table
 * @param {Object} row - Row data
 * @param {Number} index - Row index
 * @returns {Object} Row styling
 */
function rowStyle_transactions(row, index) {
	return {
		classes: "align-middle",
	};
}

/**
 * Detail formatter for transaction rows
 * Shows procedure and laterality information in expandable section
 * @param {Number} index - Row index
 * @param {Object} row - Row data
 * @returns {String} HTML content for detail view
 */
function detailFormatter_transactions(index, row) {
	// Create detail content with procedure, laterality, and patient information
	const procedureName = row._detail_procedure_name || "Not specified";
	const laterality = row._detail_laterality || "Not specified";
	const worklistId = row._detail_worklist_id || "N/A";
	const patientAuthId = row._detail_patient_auth_id || "N/A";

	return `
		<div class="container-fluid p-3 bg-light">
			<div class="row">
				<div class="col-md-12">
					<h6 class="text-primary mb-3">
						<i class="fas fa-info-circle me-2"></i>
						Additional Transaction Details
					</h6>
				</div>
			</div>
			<div class="row">
				<div class="col-md-3 mb-3">
					<div class="card border-light shadow-sm">
						<div class="card-body p-3">
							<h6 class="card-title text-muted mb-2">
								<i class="fas fa-stethoscope me-2"></i>
								Procedure
							</h6>
							<p class="card-text fw-semibold text-dark mb-0">${procedureName}</p>
						</div>
					</div>
				</div>
				<div class="col-md-3 mb-3">
					<div class="card border-light shadow-sm">
						<div class="card-body p-3">
							<h6 class="card-title text-muted mb-2">
								<i class="fas fa-eye me-2"></i>
								Laterality
							</h6>
							<p class="card-text fw-semibold text-dark mb-0">${laterality}</p>
						</div>
					</div>
				</div>
				<div class="col-md-3 mb-3">
					<div class="card border-light shadow-sm">
						<div class="card-body p-3">
							<h6 class="card-title text-muted mb-2">
								<i class="fas fa-list-alt me-2"></i>
								Worklist ID
							</h6>
							<p class="card-text fw-semibold text-dark mb-0">WL-${worklistId}</p>
						</div>
					</div>
				</div>
				<div class="col-md-3 mb-3">
					<div class="card border-light shadow-sm">
						<div class="card-body p-3">
							<h6 class="card-title text-muted mb-2">
								<i class="fas fa-user-circle me-2"></i>
								Patient ID
							</h6>
							<p class="card-text fw-semibold text-dark mb-0">${patientAuthId}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;
}

/**
 * ENHANCEMENT: Update summary cards from backend-calculated summary data
 * This function uses server-calculated totals for ALL filtered records, not just visible rows
 * @param {Object} summary - Backend summary object with pre-calculated totals
 */
function updateSummaryCardsFromBackend(summary) {
	console.log("Updating summary cards from backend data:", summary);

	// Update summary card values using backend totals
	document.getElementById("totalTransactions").textContent =
		summary.count_total || 0;
	document.getElementById("totalAmount").textContent = `€${(
		summary.total_amount || 0
	).toFixed(2)}`;
	document.getElementById("totalCard").textContent = `€${(
		summary.total_amount_card || 0
	).toFixed(2)}`;
	document.getElementById("totalCash").textContent = `€${(
		summary.total_amount_cash || 0
	).toFixed(2)}`;

	// Update breakdown values
	document.getElementById("cardBreakdown").textContent = `€${(
		summary.total_amount_card || 0
	).toFixed(2)}`;
	document.getElementById("cashBreakdown").textContent = `€${(
		summary.total_amount_cash || 0
	).toFixed(2)}`;
	document.getElementById("invoiceBreakdown").textContent = `€${(
		summary.total_amount_invoice || 0
	).toFixed(2)}`;

	// Update status breakdown using backend counts
	const statusCounts = {
		complete: summary.count_paid || 0,
		pending: summary.count_pending || 0,
		cancelled: summary.count_cancelled || 0,
		partial: summary.count_partial || 0,
		overpaid: summary.count_overpaid || 0,
		refunded: summary.count_refunded || 0,
	};

	updateStatusBreakdown(statusCounts);
}

/**
 * Update summary cards with current data (FALLBACK METHOD)
 * This is the original client-side calculation method used as fallback
 * @param {Array} transactions - Array of transaction data
 */
function updateSummaryCards(transactions) {
	if (!transactions || !Array.isArray(transactions)) {
		return;
	}

	let totalTransactions = transactions.length;
	let totalAmount = 0;
	let totalCard = 0;
	let totalCash = 0;
	let totalInvoice = 0;
	let statusCounts = {};

	transactions.forEach((transaction) => {
		// Use raw values if available, otherwise extract from formatted strings
		const cardAmount =
			transaction._raw_amount_card !== undefined
				? transaction._raw_amount_card
				: extractNumericValue(transaction.amount_card);
		const cashAmount =
			transaction._raw_amount_cash !== undefined
				? transaction._raw_amount_cash
				: extractNumericValue(transaction.amount_cash);
		const invoiceAmount =
			transaction._raw_amount_invoice !== undefined
				? transaction._raw_amount_invoice
				: extractNumericValue(transaction.amount_invoice);
		const totalTransactionAmount =
			transaction._raw_total_amount !== undefined
				? transaction._raw_total_amount
				: extractNumericValue(transaction.total_amount);

		totalCard += cardAmount;
		totalCash += cashAmount;
		totalInvoice += invoiceAmount;
		totalAmount += totalTransactionAmount;

		// Count payment statuses using raw values if available
		const status =
			transaction._raw_payment_status !== undefined
				? transaction._raw_payment_status.toLowerCase()
				: extractStatusFromBadge(transaction.payment_status);
		statusCounts[status] = (statusCounts[status] || 0) + 1;
	});

	// Update summary card values
	document.getElementById("totalTransactions").textContent = totalTransactions;
	document.getElementById("totalAmount").textContent = `€${totalAmount.toFixed(
		2
	)}`;
	document.getElementById("totalCard").textContent = `€${totalCard.toFixed(2)}`;
	document.getElementById("totalCash").textContent = `€${totalCash.toFixed(2)}`;

	// Update breakdown values
	document.getElementById("cardBreakdown").textContent = `€${totalCard.toFixed(
		2
	)}`;
	document.getElementById("cashBreakdown").textContent = `€${totalCash.toFixed(
		2
	)}`;
	document.getElementById(
		"invoiceBreakdown"
	).textContent = `€${totalInvoice.toFixed(2)}`;

	// Update status breakdown
	updateStatusBreakdown(statusCounts);
}

/**
 * Extract numeric value from formatted currency string
 * @param {String|Number} value - Formatted currency or numeric value
 * @returns {Number} Numeric value
 */
function extractNumericValue(value) {
	if (typeof value === "number") {
		return value;
	}

	if (typeof value === "string") {
		// Extract number from formatted string like "€12.34" or "<span>€12.34</span>"
		const match = value.match(/€?(\d+\.?\d*)/);
		return match ? parseFloat(match[1]) : 0;
	}

	return 0;
}

/**
 * Extract status from badge HTML
 * @param {String} badgeHtml - Badge HTML string
 * @returns {String} Status text
 */
function extractStatusFromBadge(badgeHtml) {
	if (typeof badgeHtml === "string" && badgeHtml.includes("<span")) {
		const match = badgeHtml.match(/>([^<]+)</);
		return match ? match[1].toLowerCase() : "unknown";
	}
	return badgeHtml ? badgeHtml.toLowerCase() : "unknown";
}

/**
 * Update status breakdown display
 * @param {Object} statusCounts - Status count object
 */
function updateStatusBreakdown(statusCounts) {
	const statusContainer = document.getElementById("statusBreakdown");

	if (Object.keys(statusCounts).length === 0) {
		statusContainer.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-info-circle text-muted me-2"></i>
                <span class="text-muted">No transactions found</span>
            </div>
        `;
		return;
	}

	let html = '<div class="row g-2">';

	Object.entries(statusCounts).forEach(([status, count]) => {
		const badgeClass =
			{
				complete: "bg-success",
				partial: "bg-warning",
				overpaid: "bg-info",
				refunded: "bg-secondary",
			}[status] || "bg-secondary";

		html += `
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                    <span class="text-capitalize fw-medium">${status}</span>
                    <span class="badge ${badgeClass}">${count}</span>
                </div>
            </div>
        `;
	});

	html += "</div>";
	statusContainer.innerHTML = html;
}

/**
 * Build filter query string for API requests (now uses custom API format)
 * @returns {String} Filter query string
 */
function buildFilterQuery() {
	let query = "";

	const selectedDate = document.getElementById("filterDate").value;
	const selectedSenior = document.getElementById("selectSenior").value;

	if (selectedDate) {
		const startDate = selectedDate + " 00:00:00";
		const endDate = selectedDate + " 23:59:59";
		query += `&date_start=${encodeURIComponent(
			startDate
		)}&date_end=${encodeURIComponent(endDate)}`;
	}

	// Senior filtering now properly supported
	if (selectedSenior) {
		query += `&senior_id=${selectedSenior}`;
	}

	return query;
}

/**
 * Initialize the daily transactions interface
 */
function initDailyTransactions() {
	console.log("Initializing daily transactions interface");

	// Initialize bootstrap table (following worklist pattern)
	// The URL and parameters will be built by queryParams_transactions function
	$("#table-transactions").bootstrapTable({
		url: window.API_TRANSACTIONS_BASE,
		formatSearch: function () {
			return "Last name, first name, procedure";
		},
		onLoadingStarted: function () {
			showLoadingState();
		},
		onLoadError: function (status) {
			console.error("Bootstrap table load error:", status);
			showErrorState(`HTTP ${status}: Failed to load data`);
		},
		onRefresh: function () {
			showLoadingState();
		},
	});

	// Initialize date range inputs to today by default
	const today = window.TODAY_DATE || new Date().toISOString().split("T")[0];
	document.getElementById("filterStartDate").value = today;
	document.getElementById("filterEndDate").value = today;

	// Set up filter event handlers with debouncing for performance
	$("#filterStartDate, #filterEndDate, #selectSenior").change(function () {
		console.log("Filter changed");

		// Validate date range
		const startDate = document.getElementById("filterStartDate").value;
		const endDate = document.getElementById("filterEndDate").value;

		if (startDate && endDate && startDate > endDate) {
			// If start date is after end date, set end date to start date
			document.getElementById("filterEndDate").value = startDate;
		}

		// Clear previous timeout
		if (filterTimeout) {
			clearTimeout(filterTimeout);
		}

		// Show loading state immediately for better UX
		showLoadingState();

		// Update current date display immediately
		const selectedStartDate = document.getElementById("filterStartDate").value;
		const selectedEndDate = document.getElementById("filterEndDate").value;
		const selectedSenior = document.getElementById("selectSenior").value;
		const seniorText = selectedSenior
			? $("#selectSenior option:selected").text()
			: "All seniors";

		// Create date range display text
		let dateRangeText = "";
		if (selectedStartDate && selectedEndDate) {
			if (selectedStartDate === selectedEndDate) {
				dateRangeText = `${selectedStartDate}`;
			} else {
				dateRangeText = `${selectedStartDate} to ${selectedEndDate}`;
			}
		} else if (selectedStartDate) {
			dateRangeText = `From: ${selectedStartDate}`;
		} else if (selectedEndDate) {
			dateRangeText = `Until: ${selectedEndDate}`;
		} else {
			dateRangeText = "All dates";
		}

		document.getElementById(
			"currentDateDisplay"
		).textContent = `${dateRangeText} (${seniorText})`;

		// Debounce the actual API call to avoid excessive requests
		filterTimeout = setTimeout(function () {
			$("#table-transactions").bootstrapTable("refresh");
		}, 300); // 300ms delay
	});

	// Trigger initial load with today's date range
	$("#filterStartDate").trigger("change");
}

/**
 * Export filtered transactions to CSV
 */
function exportToCSV() {
	const selectedStartDate = document.getElementById("filterStartDate").value;
	const selectedEndDate = document.getElementById("filterEndDate").value;
	const selectedSenior = document.getElementById("selectSenior").value;
	const seniorText = selectedSenior
		? $("#selectSenior option:selected").text()
		: "all-seniors";

	// Build filename based on filters
	let dateText = "all-dates";
	if (selectedStartDate && selectedEndDate) {
		if (selectedStartDate === selectedEndDate) {
			dateText = selectedStartDate;
		} else {
			dateText = `${selectedStartDate}-to-${selectedEndDate}`;
		}
	} else if (selectedStartDate) {
		dateText = `from-${selectedStartDate}`;
	} else if (selectedEndDate) {
		dateText = `until-${selectedEndDate}`;
	}

	const filename = `daily-transactions-${dateText}-${seniorText
		.replace(/\s+/g, "-")
		.toLowerCase()}.csv`;

	// Use bootstrap table's built-in export functionality
	$("#table-transactions").bootstrapTable("export", {
		type: "csv",
		fileName: filename,
		ignoreColumn: ["actions"], // If we add action buttons later
	});
}

/**
 * Print the current view
 */
function printTransactions() {
	window.print();
}

/**
 * Show loading state
 */
function showLoadingState() {
	// Update summary cards with loading state
	document.getElementById("totalTransactions").innerHTML =
		'<i class="fas fa-spinner fa-spin"></i>';
	document.getElementById("totalAmount").innerHTML =
		'<i class="fas fa-spinner fa-spin"></i>';
	document.getElementById("totalCard").innerHTML =
		'<i class="fas fa-spinner fa-spin"></i>';
	document.getElementById("totalCash").innerHTML =
		'<i class="fas fa-spinner fa-spin"></i>';

	// Update breakdown with loading state
	document.getElementById("cardBreakdown").innerHTML =
		'<i class="fas fa-spinner fa-spin"></i>';
	document.getElementById("cashBreakdown").innerHTML =
		'<i class="fas fa-spinner fa-spin"></i>';
	document.getElementById("invoiceBreakdown").innerHTML =
		'<i class="fas fa-spinner fa-spin"></i>';

	// Update status breakdown
	document.getElementById("statusBreakdown").innerHTML = `
		<div class="text-center py-3">
			<i class="fas fa-spinner fa-spin text-primary me-2"></i>
			<span class="text-muted">Loading transaction data...</span>
		</div>
	`;
}

/**
 * Hide loading state
 */
function hideLoadingState() {
	// This will be overridden by updateSummaryCards when data loads
	// Just ensure we're not showing loading state indefinitely
}

/**
 * Show error state
 * @param {String} error - Error message
 */
function showErrorState(error) {
	// Update summary cards with error state
	const errorDisplay =
		'<i class="fas fa-exclamation-triangle text-danger"></i>';
	document.getElementById("totalTransactions").innerHTML = errorDisplay;
	document.getElementById("totalAmount").innerHTML = errorDisplay;
	document.getElementById("totalCard").innerHTML = errorDisplay;
	document.getElementById("totalCash").innerHTML = errorDisplay;

	// Update breakdown with error state
	document.getElementById("cardBreakdown").innerHTML = errorDisplay;
	document.getElementById("cashBreakdown").innerHTML = errorDisplay;
	document.getElementById("invoiceBreakdown").innerHTML = errorDisplay;

	// Update status breakdown
	document.getElementById("statusBreakdown").innerHTML = `
		<div class="text-center py-3">
			<i class="fas fa-exclamation-triangle text-danger me-2"></i>
			<span class="text-danger">Error loading data: ${error}</span>
		</div>
	`;

	// Show toast notification if available
	if (typeof showToast === "function") {
		showToast("Error", `Failed to load transaction data: ${error}`, "error");
	}
}

/**
 * Show empty state when no transactions found
 */
function showEmptyState() {
	// Reset summary cards to zero
	document.getElementById("totalTransactions").textContent = "0";
	document.getElementById("totalAmount").textContent = "€0.00";
	document.getElementById("totalCard").textContent = "€0.00";
	document.getElementById("totalCash").textContent = "€0.00";

	// Reset breakdown values
	document.getElementById("cardBreakdown").textContent = "€0.00";
	document.getElementById("cashBreakdown").textContent = "€0.00";
	document.getElementById("invoiceBreakdown").textContent = "€0.00";

	// Update status breakdown
	document.getElementById("statusBreakdown").innerHTML = `
		<div class="text-center py-3">
			<i class="fas fa-info-circle text-muted me-2"></i>
			<span class="text-muted">No transactions found for the selected filters</span>
		</div>
	`;
}

/**
 * Add retry functionality for failed requests
 * @param {Function} callback - Function to retry
 * @param {Number} maxRetries - Maximum number of retries (default: 3)
 */
function retryRequest(callback, maxRetries = 3) {
	let retryCount = 0;

	function attempt() {
		if (retryCount < maxRetries) {
			retryCount++;
			console.log(`Retry attempt ${retryCount}/${maxRetries}`);
			callback();
		} else {
			showErrorState("Maximum retry attempts reached");
		}
	}

	return attempt;
}

// Initialize when document is ready
$(document).ready(function () {
	initDailyTransactions();
});
