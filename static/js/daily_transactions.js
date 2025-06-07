/**
 * Daily Transactions Bootstrap Table Implementation
 * Handles filtering, pagination, and summary calculations for transaction data
 */

// Global variables for bootstrap table (API_TRANSACTIONS_BASE and TODAY_DATE are defined in the template)
let s_transactions = "";
let toggle_transactions = "";

/**
 * Build query parameters for bootstrap table API requests
 * @param {Object} params - Bootstrap table parameters
 * @returns {String} URL-encoded query string
 */
function queryParams_transactions(params) {
	let query = "";

	// Get filter values
	const selectedDate = document.getElementById("filterDate").value;
	const selectedSenior = document.getElementById("selectSenior").value;

	// Date filtering
	if (selectedDate) {
		const startDate = selectedDate + " 00:00:00";
		const endDate = selectedDate + " 23:59:59";
		query += `&transaction_date.ge=${encodeURIComponent(
			startDate
		)}&transaction_date.lt=${encodeURIComponent(endDate)}`;
	}

	// Senior filtering temporarily disabled for testing
	// if (selectedSenior) {
	//	query += `&id_worklist.senior.id=${selectedSenior}`;
	// }

	// Search functionality
	if (params.search && params.search.trim() !== "") {
		const searchTerms = params.search.split(",");
		if (searchTerms[0] && searchTerms[0].trim() !== "") {
			query += `&id_auth_user.last_name.contains=${encodeURIComponent(
				searchTerms[0].trim()
			)}`;
		}
		if (searchTerms[1] && searchTerms[1].trim() !== "") {
			query += `&id_auth_user.first_name.contains=${encodeURIComponent(
				searchTerms[1].trim()
			)}`;
		}
	}

	// Sorting
	if (params.sort !== undefined) {
		let sortField = params.sort;

		// Map frontend field names to backend field names
		if (sortField === "patient_name") {
			sortField = "id_auth_user";
		} else if (sortField === "procedure_name") {
			sortField = "id_worklist.procedure";
		} else if (sortField === "senior_name") {
			sortField = "id_worklist.senior";
		} else if (sortField === "transaction_time") {
			sortField = "transaction_date";
		}

		const sortDirection = toggle_transactions === "" ? "" : "~";
		query += `&@order=${sortDirection}${sortField}`;
		toggle_transactions = toggle_transactions === "" ? "~" : "";
	}

	// Pagination
	if (params.offset && params.offset !== "0") {
		query += `&@offset=${params.offset}`;
	}
	if (params.limit && params.limit !== "0") {
		query += `&@limit=${params.limit}`;
	}

	// Add basic lookups following py4web documentation format
	const lookups = "@lookup=id_auth_user[first_name,last_name,email]";
	query += `&${lookups}`;

	// Add count for pagination
	query += "&@count=true";

	console.log("Query params:", query);
	return query.substring(1); // Remove leading &
}

/**
 * Handle API response for bootstrap table
 * @param {Object} res - API response
 * @returns {Object} Formatted response for bootstrap table
 */
function responseHandler_transactions(res) {
	console.log("Raw API response:", res);

	let formattedData = {
		total: 0,
		rows: [],
	};

	// Handle PyDAL RestAPI response format
	if (res && res.items && Array.isArray(res.items)) {
		formattedData.total = res.count || res.items.length;
		formattedData.rows = res.items.map(formatTransactionRow);
	} else if (res && Array.isArray(res)) {
		formattedData.total = res.length;
		formattedData.rows = res.map(formatTransactionRow);
	} else {
		console.warn("Unknown response format:", res);
		formattedData = res;
	}

	// Update summary cards with current data
	updateSummaryCards(formattedData.rows);

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
		procedure_name: "N/A", // Simplified for testing
		senior_name: "N/A", // Simplified for testing
		laterality: "N/A", // Simplified for testing
		amount_card: formatCurrency(transaction.amount_card),
		amount_cash: formatCurrency(transaction.amount_cash),
		amount_invoice: formatCurrency(transaction.amount_invoice),
		total_amount: formatCurrency(transaction.total_amount, "success"),
		payment_status: formatPaymentStatus(transaction.payment_status),
		remaining_balance: formatBalance(transaction.remaining_balance),
		notes: formatNotes(transaction.notes),
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
 * @returns {String} Formatted patient name with email
 */
function formatPatientName(patient) {
	if (!patient || (!patient.first_name && !patient.last_name)) {
		return "Unknown Patient";
	}

	const name = `${patient.first_name || ""} ${patient.last_name || ""}`.trim();
	const email = patient.email
		? `<br><small class="text-muted">${patient.email}</small>`
		: "";

	return `<div class="fw-semibold text-dark">${name}</div>${email}`;
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
 * Update summary cards with current data
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
		// Extract numeric values from formatted strings or use raw values
		const cardAmount = extractNumericValue(transaction.amount_card);
		const cashAmount = extractNumericValue(transaction.amount_cash);
		const invoiceAmount = extractNumericValue(transaction.amount_invoice);
		const totalTransactionAmount = extractNumericValue(
			transaction.total_amount
		);

		totalCard += cardAmount;
		totalCash += cashAmount;
		totalInvoice += invoiceAmount;
		totalAmount += totalTransactionAmount;

		// Count payment statuses
		const status = extractStatusFromBadge(transaction.payment_status);
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
 * Build filter query string for API requests
 * @returns {String} Filter query string
 */
function buildFilterQuery() {
	let query = "";

	const selectedDate = document.getElementById("filterDate").value;
	const selectedSenior = document.getElementById("selectSenior").value;

	if (selectedDate) {
		const startDate = selectedDate + " 00:00:00";
		const endDate = selectedDate + " 23:59:59";
		query += `&transaction_date.ge=${encodeURIComponent(
			startDate
		)}&transaction_date.lt=${encodeURIComponent(endDate)}`;
	}

	if (selectedSenior) {
		query += `&id_worklist.senior.id=${selectedSenior}`;
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
	});

	// Set up filter event handlers
	$("#filterDate, #selectSenior").change(function () {
		console.log("Filter changed");

		// Just refresh the table - queryParams_transactions will handle the filtering
		$("#table-transactions").bootstrapTable("refresh");

		// Update current date display
		const selectedDate = document.getElementById("filterDate").value;
		document.getElementById("currentDateDisplay").textContent =
			selectedDate || "All dates";
	});

	// Today's transactions button
	$("#btnTodayTransactions").click(function () {
		document.getElementById("filterDate").value = window.TODAY_DATE;
		$("#filterDate").trigger("change");

		// Update button states
		$(this).removeClass("btn-outline-dark").addClass("btn-dark");
		$("#btnAllTransactions")
			.removeClass("btn-dark")
			.addClass("btn-outline-dark");
	});

	// All transactions button
	$("#btnAllTransactions").click(function () {
		document.getElementById("filterDate").value = "";
		$("#filterDate").trigger("change");

		// Update button states
		$(this).removeClass("btn-outline-dark").addClass("btn-dark");
		$("#btnTodayTransactions")
			.removeClass("btn-dark")
			.addClass("btn-outline-dark");
	});

	// Load today's transactions by default
	$("#btnTodayTransactions").click();
}

// Initialize when document is ready
$(document).ready(function () {
	initDailyTransactions();
});
