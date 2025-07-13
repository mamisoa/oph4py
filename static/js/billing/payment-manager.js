/**
 * Payment Manager
 * Handles all payment-related functionality for the worklist payment system
 */

class PaymentManager {
	constructor(worklistId) {
		this.worklistId = worklistId;
		this.currentFeecode = 1300; // Default to 1300 (first valid Belgian feecode)
		this.billingCodes = [];
		this.paymentSummary = {};

		// Get HOSTURL and APP_NAME from global variables
		this.baseUrl =
			(window.HOSTURL || location.origin) + "/" + (window.APP_NAME || "oph4py");

		// Initialize when DOM is ready
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => this.init());
		} else {
			this.init();
		}
	}

	/**
	 * Initialize payment interface
	 */
	async init() {
		// console.log("Initializing Payment Manager for worklist:", this.worklistId);

		// Show loading state for transaction history
		this.showTransactionHistoryLoading();

		try {
			// Load payment summary and billing codes in parallel (independent)
			const [summaryResult, billingResult] = await Promise.allSettled([
				this.loadPaymentSummary(),
				this.loadBillingCodes(),
			]);

			// Handle payment summary result
			if (summaryResult.status === "rejected") {
				console.error("Failed to load payment summary:", summaryResult.reason);
				displayToast(
					"warning",
					"Payment Summary Error",
					"Failed to load payment summary: " + summaryResult.reason.message,
					6000
				);
			}

			// Handle billing codes result
			if (billingResult.status === "rejected") {
				console.error("Failed to load billing codes:", billingResult.reason);
				displayToast(
					"warning",
					"Billing Codes Error",
					"Failed to load billing codes: " + billingResult.reason.message,
					6000
				);
			}

			// Load transaction history only after payment summary is available (needed for calculations)
			if (summaryResult.status === "fulfilled") {
				try {
					await this.loadTransactionHistory();
				} catch (error) {
					console.error("Error loading transaction history:", error);
					this.showTransactionHistoryError(
						"Failed to load transaction history: " + error.message
					);
				}
			} else {
				this.showTransactionHistoryError(
					"Cannot load transaction history without payment summary"
				);
			}

			// Load MD Summary
			try {
				await this.loadMDSummary();
			} catch (error) {
				console.error("Error loading MD Summary:", error);
				this.showMDSummaryError(
					"Failed to load consultation history: " + error.message
				);
			}

			// Set dropdown default value
			const feecodeSelect = document.getElementById("feecode-select");
			if (feecodeSelect) {
				feecodeSelect.value = this.currentFeecode;
			}

			// Bind events
			this.bindEvents();

			// console.log("Payment Manager initialized successfully");
		} catch (error) {
			console.error("Error initializing Payment Manager:", error);
			displayToast(
				"error",
				"Initialization Error",
				"Error loading payment data: " + error.message,
				6000
			);
			this.showTransactionHistoryError("Failed to initialize payment system");
		}
	}

	/**
	 * Bind event handlers
	 */
	bindEvents() {
		// Fee code selection change
		const feecodeSelect = document.getElementById("feecode-select");
		if (feecodeSelect) {
			feecodeSelect.addEventListener("change", async (e) => {
				await this.onFeecodeChange(parseInt(e.target.value));
			});
		}

		// Process payment button
		const processPaymentBtn = document.getElementById("process-payment-btn");
		if (processPaymentBtn) {
			processPaymentBtn.addEventListener("click", () => {
				this.openPaymentModal();
			});
		}

		// Payment input fields
		const paymentInputs = document.querySelectorAll(".payment-input");
		paymentInputs.forEach((input) => {
			input.addEventListener("input", () => {
				this.updatePaymentTotal();
			});
		});

		// Confirm payment button
		const confirmPaymentBtn = document.getElementById("confirm-payment-btn");
		if (confirmPaymentBtn) {
			confirmPaymentBtn.addEventListener("click", async () => {
				await this.processPayment();
			});
		}

		// Confirm cancel transaction button
		const confirmCancelBtn = document.getElementById(
			"confirm-cancel-transaction-btn"
		);
		if (confirmCancelBtn) {
			confirmCancelBtn.addEventListener("click", async () => {
				await this.cancelTransaction();
			});
		}

		// Refresh transactions button
		const refreshTransactionsBtn = document.getElementById(
			"refresh-transactions-btn"
		);
		if (refreshTransactionsBtn) {
			refreshTransactionsBtn.addEventListener("click", async () => {
				await this.loadTransactionHistory();
			});
		}

		// MD Summary view more button
		const viewMoreMDSummaryBtn = document.getElementById(
			"view-more-md-summary-btn"
		);
		if (viewMoreMDSummaryBtn) {
			viewMoreMDSummaryBtn.addEventListener("click", () => {
				this.openMDSummaryModal();
			});
		}

		// MD Summary retry button
		const retryMDSummaryBtn = document.getElementById("retry-md-summary-btn");
		if (retryMDSummaryBtn) {
			retryMDSummaryBtn.addEventListener("click", async () => {
				await this.loadMDSummary();
			});
		}

		// MD Summary modal retry button
		const retryMDSummaryModalBtn = document.getElementById(
			"retry-md-summary-modal-btn"
		);
		if (retryMDSummaryModalBtn) {
			retryMDSummaryModalBtn.addEventListener("click", async () => {
				await this.loadMDSummaryModal();
			});
		}
	}

	/**
	 * Load payment summary data
	 */
	async loadPaymentSummary() {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/worklist/${this.worklistId}/payment_summary`
			);
			const result = await response.json();

			if (result.status === "success" && result.data) {
				this.paymentSummary = result.data;
				this.updateSummaryDisplay();
			} else {
				throw new Error(result.message || "Failed to load payment summary");
			}
		} catch (error) {
			console.error("Error loading payment summary:", error);
			throw error;
		}
	}

	/**
	 * Load billing codes with reimbursement calculations
	 */
	async loadBillingCodes() {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/worklist/${this.worklistId}/billing_breakdown?feecode=${this.currentFeecode}`
			);
			const result = await response.json();

			if (result.status === "success" && result.data) {
				this.billingCodes = result.data;
				this.displayBillingCodes();
				this.updatePaymentButton();
			} else {
				throw new Error(result.message || "Failed to load billing codes");
			}
		} catch (error) {
			console.error("Error loading billing codes:", error);
			throw error;
		}
	}

	/**
	 * Load transaction history with pagination support
	 * @param {number} limit - Number of transactions per page (default: 10)
	 * @param {number} offset - Number of transactions to skip (default: 0)
	 * @param {boolean} append - Whether to append results to existing table (default: false)
	 */
	async loadTransactionHistory(limit = 10, offset = 0, append = false) {
		try {
			const url = new URL(
				`${this.baseUrl}/api/worklist/${this.worklistId}/transactions`
			);
			url.searchParams.set("limit", limit.toString());
			url.searchParams.set("offset", offset.toString());

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const result = await response.json();
			// console.log("Raw API response for transactions:", result);

			if (result.status === "success" && result.data) {
				// Handle both old and new API response formats
				let transactions, pagination;

				if (Array.isArray(result.data)) {
					// Old format: result.data is directly the transactions array
					transactions = result.data;
					pagination = null;
				} else if (result.data.transactions) {
					// New format: result.data contains {transactions: [...], pagination: {...}}
					transactions = result.data.transactions;
					pagination = result.data.pagination;
				} else {
					console.error("Unexpected API response format:", result.data);
					throw new Error("Invalid API response format");
				}

				this.displayTransactionHistory(transactions, pagination, append);
			} else {
				throw new Error(result.message || "Failed to load transaction history");
			}
		} catch (error) {
			console.error("Error loading transaction history:", error);
			console.error("Error details:", {
				url: url.toString(),
				error: error,
				stack: error.stack,
			});
			this.showTransactionHistoryError(
				"Error loading transactions: " + error.message
			);
			throw error; // Re-throw so calling code can handle it
		}
	}

	/**
	 * Update summary display
	 */
	updateSummaryDisplay() {
		const summary = this.paymentSummary;

		// Update procedure and provider info
		document.getElementById("procedure-name").textContent =
			summary.worklist?.procedure || "Not specified";
		document.getElementById("provider-name").textContent =
			summary.worklist?.provider || "Not specified";

		// Update financial summary
		document.getElementById("total-due").textContent =
			summary.total_fee?.toFixed(2) || "0.00";
		document.getElementById("total-paid").textContent =
			summary.total_paid?.toFixed(2) || "0.00";
		document.getElementById("remaining-balance").textContent =
			summary.remaining_balance?.toFixed(2) || "0.00";

		// Update payment status badge
		const statusElement = document.getElementById("payment-status");
		if (statusElement) {
			statusElement.textContent = this.getStatusText(summary.payment_status);
			statusElement.className = `badge ${this.getStatusBadgeClass(
				summary.payment_status
			)}`;
		}
	}

	/**
	 * Display billing codes table
	 */
	displayBillingCodes() {
		const tbody = document.getElementById("billing-codes-body");
		if (!tbody) return;

		if (this.billingCodes.length === 0) {
			tbody.innerHTML =
				'<tr><td colspan="7" class="text-center text-muted">No billing codes found</td></tr>';
			// Update totals for empty state
			this.updateBillingTotals();
			return;
		}

		let html = "";
		this.billingCodes.forEach((billing) => {
			html += `
                <tr>
                    <td>${billing.nomen_code}</td>
                    <td>${billing.description}</td>
                    <td>${billing.quantity}</td>
                    <td class="fee-total">€${billing.fee.toFixed(2)}</td>
                    <td class="reimbursement-amount">€${billing.reimbursement.toFixed(
											2
										)}</td>
                    <td class="patient-pays">€${billing.patient_pays.toFixed(
											2
										)}</td>
                    <td><span class="badge bg-info">${
											billing.laterality
										}</span></td>
                </tr>
            `;

			// Add secondary code row if present
			if (billing.secondary_code) {
				html += `
                    <tr class="table-secondary">
                        <td>${billing.secondary_code}</td>
                        <td><em>${billing.secondary_description}</em></td>
                        <td>${billing.quantity}</td>
                        <td class="fee-total">€${billing.secondary_fee.toFixed(
													2
												)}</td>
                        <td class="reimbursement-amount">€${billing.secondary_reimbursement.toFixed(
													2
												)}</td>
                        <td class="patient-pays">€${billing.secondary_patient_pays.toFixed(
													2
												)}</td>
                        <td><span class="badge bg-info">${
													billing.laterality
												}</span></td>
                    </tr>
                `;
			}
		});

		tbody.innerHTML = html;

		// Update totals after displaying billing codes
		this.updateBillingTotals();
	}

	/**
	 * Calculate and display billing totals
	 */
	updateBillingTotals() {
		let totalFee = 0;
		let totalReimbursement = 0;
		let totalPatientPays = 0;

		// Calculate totals from billing codes
		this.billingCodes.forEach((billing) => {
			totalFee += billing.fee;
			totalReimbursement += billing.reimbursement;
			totalPatientPays += billing.patient_pays;

			// Add secondary code amounts if present
			if (billing.secondary_code) {
				totalFee += billing.secondary_fee;
				totalReimbursement += billing.secondary_reimbursement;
				totalPatientPays += billing.secondary_patient_pays;
			}
		});

		// Update the totals display
		const totalFeeElement = document.getElementById("total-fee");
		const totalReimbursementElement = document.getElementById(
			"total-reimbursement"
		);
		const totalPatientPaysElement =
			document.getElementById("total-patient-pays");

		if (totalFeeElement) {
			totalFeeElement.textContent = totalFee.toFixed(2);
		}
		if (totalReimbursementElement) {
			totalReimbursementElement.textContent = totalReimbursement.toFixed(2);
		}
		if (totalPatientPaysElement) {
			totalPatientPaysElement.textContent = totalPatientPays.toFixed(2);
		}

		// Show/hide footer based on whether there are billing codes
		const footer = document.getElementById("billing-codes-footer");
		if (footer) {
			footer.style.display = this.billingCodes.length > 0 ? "" : "none";
		}
	}

	/**
	 * Display transaction history with cancel options and pagination
	 * @param {Array} transactions - Array of transaction objects
	 * @param {Object} pagination - Pagination metadata
	 * @param {boolean} append - Whether to append to existing table content
	 */
	displayTransactionHistory(transactions, pagination = null, append = false) {
		const tbody = document.getElementById("transaction-history-body");
		if (!tbody) return;

		// Handle null, undefined, or empty transactions
		if (!transactions || !Array.isArray(transactions)) {
			console.error("Invalid transactions data:", transactions);
			tbody.innerHTML =
				'<tr><td colspan="8" class="text-center text-danger">Error: Invalid transaction data format</td></tr>';
			return;
		}

		if (transactions.length === 0) {
			tbody.innerHTML =
				'<tr><td colspan="8" class="text-center text-muted">No transactions found</td></tr>';
			return;
		}

		// Safety check for payment summary
		if (!this.paymentSummary || this.paymentSummary.total_fee === undefined) {
			console.warn(
				"Payment summary not available for transaction history calculations"
			);
			tbody.innerHTML =
				'<tr><td colspan="8" class="text-center text-warning">Loading payment summary...</td></tr>';
			return;
		}

		// Sort transactions by date (newest first for display)
		// The API already provides correct remaining_balance for each transaction
		const displayTransactions = [...transactions].sort(
			(a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
		);

		let html = "";
		displayTransactions.forEach((transaction) => {
			const date = new Date(transaction.transaction_date).toLocaleDateString();

			// Determine row styling based on transaction status
			const rowClass =
				transaction.transaction_status === "cancelled"
					? "table-secondary text-muted"
					: "";
			const amountStyle =
				transaction.transaction_status === "cancelled"
					? "text-decoration-line-through"
					: "";

			// Create cancel button for active transactions
			let actionButton = "";
			if (transaction.can_cancel === true) {
				actionButton = `<button class="btn btn-sm btn-outline-danger cancel-transaction-btn" 
					data-transaction-id="${transaction.id}" 
					data-amount="${transaction.total_amount}" 
					data-date="${transaction.transaction_date}"
					data-card="${transaction.amount_card}"
					data-cash="${transaction.amount_cash}"
					data-invoice="${transaction.amount_invoice}"
					title="Cancel Transaction">
					<i class="fas fa-ban"></i>
				</button>`;
			} else {
				actionButton = '<span class="text-muted">Cancelled</span>';
			}

			// Use the balance from the API response
			const balanceToShow = transaction.remaining_balance;

			html += `
                <tr class="${rowClass}">
                    <td>${date}</td>
                    <td class="${amountStyle}">€${transaction.amount_card.toFixed(
				2
			)}</td>
                    <td class="${amountStyle}">€${transaction.amount_cash.toFixed(
				2
			)}</td>
                    <td class="${amountStyle}">€${transaction.amount_invoice.toFixed(
				2
			)}</td>
                    <td class="fw-bold ${amountStyle}">€${transaction.total_amount.toFixed(
				2
			)}</td>
                    <td>
						<span class="badge ${this.getStatusBadgeClass(
							transaction.payment_status
						)}">${this.getStatusText(transaction.payment_status)}</span>
						${
							transaction.transaction_status === "cancelled"
								? '<br><small class="text-danger">CANCELLED</small>'
								: ""
						}
						<br><small class="text-muted">Balance: €${balanceToShow.toFixed(2)}</small>
					</td>
                    <td>${transaction.processed_by}</td>
                    <td>${actionButton}</td>
                </tr>
            `;
		});

		// Update table content - append or replace
		if (append && tbody.innerHTML.trim() !== "") {
			tbody.insertAdjacentHTML("beforeend", html);
		} else {
			// Remove optimistic transactions before replacing with real data
			const optimisticRows = tbody.querySelectorAll(".optimistic-transaction");
			optimisticRows.forEach((row) => row.remove());

			// Set the new content
			tbody.innerHTML = html;
		}

		// Update pagination controls if pagination metadata is provided
		if (pagination) {
			this.updatePaginationControls(pagination);
		}

		// Bind cancel button events
		this.bindCancelButtonEvents();
	}

	/**
	 * Update pagination controls for transaction history
	 * @param {Object} pagination - Pagination metadata from API
	 */
	updatePaginationControls(pagination) {
		const paginationContainer = document.getElementById(
			"transaction-pagination"
		);
		if (!paginationContainer) return;

		const { total, limit, offset, has_more, current_page, total_pages } =
			pagination;

		let html = "";
		if (total > limit) {
			html = `
				<div class="d-flex justify-content-between align-items-center mt-3">
					<span class="text-muted">
						Showing ${offset + 1}-${Math.min(
				offset + limit,
				total
			)} of ${total} transactions
					</span>
					<div>
						${
							has_more
								? `
							<button class="btn btn-sm btn-outline-primary load-more-transactions" 
									data-offset="${offset + limit}" data-limit="${limit}">
								<i class="fas fa-plus me-1"></i>Load More
							</button>
						`
								: ""
						}
						${
							total_pages > 1
								? `
							<span class="text-muted ms-2">Page ${current_page} of ${total_pages}</span>
						`
								: ""
						}
					</div>
				</div>
			`;
		}

		paginationContainer.innerHTML = html;

		// Bind load more button
		const loadMoreBtn = paginationContainer.querySelector(
			".load-more-transactions"
		);
		if (loadMoreBtn) {
			loadMoreBtn.addEventListener("click", async (e) => {
				const offset = parseInt(e.target.dataset.offset);
				const limit = parseInt(e.target.dataset.limit);

				e.target.disabled = true;
				e.target.innerHTML =
					'<i class="fas fa-spinner fa-spin me-1"></i>Loading...';

				try {
					await this.loadTransactionHistory(limit, offset, true); // append = true
				} catch (error) {
					console.error("Error loading more transactions:", error);
					displayToast(
						"warning",
						"Loading Error",
						"Failed to load more transactions: " + error.message,
						6000
					);
				} finally {
					e.target.disabled = false;
					e.target.innerHTML = '<i class="fas fa-plus me-1"></i>Load More';
				}
			});
		}
	}

	/**
	 * Refresh transaction history data
	 */

	/**
	 * Bind cancel button events
	 */
	bindCancelButtonEvents() {
		const cancelButtons = document.querySelectorAll(".cancel-transaction-btn");
		cancelButtons.forEach((button) => {
			button.addEventListener("click", (e) => {
				const transactionId = e.currentTarget.dataset.transactionId;
				const amount = e.currentTarget.dataset.amount;
				const date = e.currentTarget.dataset.date;
				const cardAmount = e.currentTarget.dataset.card;
				const cashAmount = e.currentTarget.dataset.cash;
				const invoiceAmount = e.currentTarget.dataset.invoice;

				this.openCancelTransactionModal(transactionId, {
					amount,
					date,
					cardAmount,
					cashAmount,
					invoiceAmount,
				});
			});
		});
	}

	/**
	 * Open cancel transaction modal
	 */
	openCancelTransactionModal(transactionId, transactionData) {
		// Populate modal with transaction data
		document.getElementById("cancel-transaction-date").textContent = new Date(
			transactionData.date
		).toLocaleDateString();
		document.getElementById("cancel-transaction-amount").textContent =
			parseFloat(transactionData.amount).toFixed(2);

		// Build payment methods string
		const methods = [];
		if (parseFloat(transactionData.cardAmount) > 0) {
			methods.push(
				`Card: €${parseFloat(transactionData.cardAmount).toFixed(2)}`
			);
		}
		if (parseFloat(transactionData.cashAmount) > 0) {
			methods.push(
				`Cash: €${parseFloat(transactionData.cashAmount).toFixed(2)}`
			);
		}
		if (parseFloat(transactionData.invoiceAmount) > 0) {
			methods.push(
				`Invoice: €${parseFloat(transactionData.invoiceAmount).toFixed(2)}`
			);
		}
		document.getElementById("cancel-transaction-methods").textContent =
			methods.join(", ") || "No payment method details";

		// Clear cancellation reason
		document.getElementById("cancellation-reason").value = "";

		// Store transaction ID for confirmation
		this.cancelTransactionId = transactionId;

		// Show modal
		const modal = new bootstrap.Modal(
			document.getElementById("cancel-transaction-modal")
		);
		modal.show();
	}

	/**
	 * Cancel a transaction - simplified direct approach
	 */
	async cancelTransaction() {
		if (!this.cancelTransactionId) {
			displayToast(
				"error",
				"Cancellation Error",
				"No transaction selected for cancellation",
				5000
			);
			return;
		}

		const reason = document.getElementById("cancellation-reason").value.trim();
		const confirmBtn = document.getElementById(
			"confirm-cancel-transaction-btn"
		);

		try {
			// Disable button and show processing state
			confirmBtn.disabled = true;
			confirmBtn.innerHTML =
				'<i class="fas fa-spinner fa-spin me-1"></i>Cancelling...';

			// Submit cancellation directly to API
			const response = await fetch(
				`${this.baseUrl}/api/worklist/${this.worklistId}/transactions/${this.cancelTransactionId}/cancel`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ reason }),
				}
			);

			const result = await response.json();

			if (result.status === "success" && result.data) {
				// Close modal
				const modal = bootstrap.Modal.getInstance(
					document.getElementById("cancel-transaction-modal")
				);
				modal.hide();

				// Show success notification
				displayToast(
					"success",
					"Transaction Cancelled",
					result.data.message || "Transaction cancelled successfully",
					5000
				);

				// Refresh data directly
				await this.loadPaymentSummary();
				await this.loadTransactionHistory();
				this.updatePaymentButton();
			} else {
				throw new Error(result.message || "Failed to cancel transaction");
			}
		} catch (error) {
			console.error("Error cancelling transaction:", error);
			displayToast(
				"error",
				"Cancellation Error",
				"Error cancelling transaction: " + error.message,
				6000
			);
		} finally {
			// Re-enable button
			confirmBtn.disabled = false;
			confirmBtn.innerHTML =
				'<i class="fas fa-ban me-1"></i>Cancel Transaction';
		}
	}

	/**
	 * Handle fee code selection change
	 */
	async onFeecodeChange(feecode) {
		this.currentFeecode = feecode;
		await this.loadBillingCodes();
	}

	/**
	 * Open payment modal
	 */
	openPaymentModal() {
		const balance = this.paymentSummary.remaining_balance || 0;
		if (balance <= 0) {
			displayToast(
				"info",
				"Payment Information",
				"No payment required. Balance is already paid.",
				5000
			);
			return;
		}

		// Set amount to pay
		document.getElementById("amount-to-pay").textContent = balance.toFixed(2);

		// Set procedure name in modal
		const procedureName = document.getElementById("procedure-name").textContent;
		const modalProcedureName = document.getElementById("modal-procedure-name");
		if (modalProcedureName && procedureName && procedureName !== "Loading...") {
			modalProcedureName.textContent = procedureName;
		}

		// Set current datetime as default for payment datetime
		const paymentDatetime = document.getElementById("payment-datetime");
		if (paymentDatetime) {
			const now = new Date();
			// Format as YYYY-MM-DDTHH:MM for datetime-local input
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, "0");
			const day = String(now.getDate()).padStart(2, "0");
			const hours = String(now.getHours()).padStart(2, "0");
			const minutes = String(now.getMinutes()).padStart(2, "0");
			paymentDatetime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
		}

		// Clear payment inputs
		document.getElementById("amount-card").value = "";
		document.getElementById("amount-cash").value = "";
		document.getElementById("amount-invoice").value = "";
		document.getElementById("payment-notes").value = "";

		// Reset validation
		this.updatePaymentTotal();

		// Show modal
		const modal = new bootstrap.Modal(document.getElementById("payment-modal"));
		modal.show();
	}

	/**
	 * Update payment total and validation
	 */
	updatePaymentTotal() {
		const cardAmount =
			parseFloat(document.getElementById("amount-card").value) || 0;
		const cashAmount =
			parseFloat(document.getElementById("amount-cash").value) || 0;
		const invoiceAmount =
			parseFloat(document.getElementById("amount-invoice").value) || 0;

		const total = cardAmount + cashAmount + invoiceAmount;
		const balance = this.paymentSummary.remaining_balance || 0;

		document.getElementById("payment-total").textContent = total.toFixed(2);

		const confirmBtn = document.getElementById("confirm-payment-btn");
		const validationMsg = document.getElementById("payment-validation-message");

		if (total <= 0) {
			confirmBtn.disabled = true;
			validationMsg.textContent = "Please enter a payment amount";
			validationMsg.style.display = "block";
		} else if (total > balance + 0.01) {
			// Allow small rounding differences
			confirmBtn.disabled = true;
			validationMsg.textContent = `Payment amount (€${total.toFixed(
				2
			)}) exceeds balance (€${balance.toFixed(2)})`;
			validationMsg.style.display = "block";
		} else {
			confirmBtn.disabled = false;
			validationMsg.style.display = "none";
		}
	}

	/**
	 * Process payment transaction - simplified direct approach
	 */
	async processPayment() {
		const paymentData = {
			amount_card:
				parseFloat(document.getElementById("amount-card").value) || 0,
			amount_cash:
				parseFloat(document.getElementById("amount-cash").value) || 0,
			amount_invoice:
				parseFloat(document.getElementById("amount-invoice").value) || 0,
			feecode_used: this.currentFeecode,
			notes: document.getElementById("payment-notes").value.trim(),
			payment_datetime:
				document.getElementById("payment-datetime").value || null,
		};

		const totalAmount =
			paymentData.amount_card +
			paymentData.amount_cash +
			paymentData.amount_invoice;

		if (totalAmount <= 0) {
			displayToast(
				"error",
				"Payment Validation",
				"Please enter a valid payment amount",
				5000
			);
			return;
		}

		const confirmBtn = document.getElementById("confirm-payment-btn");

		try {
			// Disable button and show processing state
			confirmBtn.disabled = true;
			confirmBtn.innerHTML =
				'<i class="fas fa-spinner fa-spin me-1"></i>Processing...';

			// Submit payment directly to API
			const response = await fetch(
				`${this.baseUrl}/api/worklist/${this.worklistId}/payment`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(paymentData),
				}
			);

			const result = await response.json();

			if (result.status === "success" && result.data) {
				// Close payment modal
				const modal = bootstrap.Modal.getInstance(
					document.getElementById("payment-modal")
				);
				modal.hide();

				// Show success notification
				displayToast(
					"success",
					"Payment Processed",
					result.data.message ||
						`Payment of €${totalAmount.toFixed(2)} processed successfully`,
					5000
				);

				// Refresh data directly
				await this.loadPaymentSummary();
				await this.loadTransactionHistory();
				this.updatePaymentButton();
			} else {
				throw new Error(result.message || "Failed to process payment");
			}
		} catch (error) {
			console.error("Error processing payment:", error);
			displayToast(
				"error",
				"Payment Error",
				"Error processing payment: " + error.message,
				6000
			);
		} finally {
			// Re-enable button
			confirmBtn.disabled = false;
			confirmBtn.innerHTML = '<i class="fas fa-check me-1"></i>Confirm Payment';
		}
	}

	/**
	 * Update payment button state
	 */
	updatePaymentButton() {
		const paymentBtn = document.getElementById("process-payment-btn");
		if (!paymentBtn) return;

		const balance = this.paymentSummary.remaining_balance || 0;

		if (balance <= 0) {
			paymentBtn.disabled = true;
			paymentBtn.innerHTML = '<i class="fas fa-check me-1"></i>Paid in Full';
		} else {
			paymentBtn.disabled = false;
			paymentBtn.innerHTML =
				'<i class="fas fa-credit-card me-1"></i>Process Payment';
		}
	}

	/**
	 * Get status text
	 */
	getStatusText(status) {
		const statusMap = {
			unpaid: "Unpaid",
			partial: "Partial",
			complete: "Complete",
			overpaid: "Overpaid",
			refunded: "Refunded",
		};
		return statusMap[status] || status;
	}

	/**
	 * Get status badge class
	 */
	getStatusBadgeClass(status) {
		const classMap = {
			unpaid: "bg-danger",
			partial: "bg-warning",
			complete: "bg-success",
			overpaid: "bg-info",
			refunded: "bg-secondary",
		};
		return classMap[status] || "bg-secondary";
	}

	/**
	 * Show transaction history loading state
	 */
	showTransactionHistoryLoading() {
		const tbody = document.getElementById("transaction-history-body");
		if (tbody) {
			tbody.innerHTML = `
				<tr>
					<td colspan="8" class="text-center">
						<div class="d-flex align-items-center justify-content-center">
							<div class="spinner-border spinner-border-sm text-primary me-2" role="status">
								<span class="visually-hidden">Loading...</span>
							</div>
							Loading transaction history...
						</div>
					</td>
				</tr>
			`;
		}
	}

	/**
	 * Show transaction history error
	 */
	showTransactionHistoryError(message) {
		const tbody = document.getElementById("transaction-history-body");
		if (tbody) {
			tbody.innerHTML = `
				<tr>
					<td colspan="8" class="text-center text-danger">
						<div class="d-flex align-items-center justify-content-center">
							<i class="fas fa-exclamation-triangle me-2"></i>
							${message}
						</div>
						<div class="mt-2">
							<button class="btn btn-sm btn-outline-primary" onclick="location.reload()">
								<i class="fas fa-refresh me-1"></i>Reload Page
							</button>
						</div>
					</td>
				</tr>
			`;
		}
	}

	/**
	 * Load MD Summary data (last 5 consultations)
	 */
	async loadMDSummary() {
		try {
			this.showMDSummaryLoading();

			const response = await fetch(
				`${this.baseUrl}/api/worklist/${this.worklistId}/md_summary`
			);
			const result = await response.json();

			if (result.status === "success" && result.data) {
				this.displayMDSummary(result.data);
			} else {
				throw new Error(
					result.message || "Failed to load consultation history"
				);
			}
		} catch (error) {
			console.error("Error loading MD Summary:", error);
			this.showMDSummaryError(
				"Failed to load consultation history: " + error.message
			);
			throw error;
		}
	}

	/**
	 * Display MD Summary table
	 */
	displayMDSummary(data) {
		const loadingDiv = document.getElementById("md-summary-loading");
		const errorDiv = document.getElementById("md-summary-error");
		const contentDiv = document.getElementById("md-summary-content");
		const emptyDiv = document.getElementById("md-summary-empty");

		// Hide loading and error states
		if (loadingDiv) loadingDiv.style.display = "none";
		if (errorDiv) errorDiv.style.display = "none";

		if (!data.items || data.items.length === 0) {
			// Show empty state
			if (contentDiv) contentDiv.style.display = "none";
			if (emptyDiv) emptyDiv.style.display = "block";
			return;
		}

		// Show content
		if (contentDiv) contentDiv.style.display = "block";
		if (emptyDiv) emptyDiv.style.display = "none";

		// Update stats
		const showingSpan = document.getElementById("md-summary-showing");
		const totalSpan = document.getElementById("md-summary-total");
		if (showingSpan) showingSpan.textContent = data.items.length;
		if (totalSpan)
			totalSpan.textContent = data.total_count || data.items.length;

		// Populate table
		const tbody = document.getElementById("md-summary-body");
		if (tbody) {
			tbody.innerHTML = data.items
				.map(
					(item) => `
				<tr>
					<td>${this.formatDateTime(item.requested_time)}</td>
					<td title="${item.procedure || "-"}">${item.procedure || "-"}</td>
					<td title="${item.history || "-"}">${this.truncateText(
						item.history || "-",
						40
					)}</td>
					<td title="${this.stripHtml(item.conclusion || "-")}">${
						item.conclusion || "-"
					}</td>
					<td title="${item.followup || "-"}">${this.truncateText(
						item.followup || "-",
						20
					)}</td>
					<td title="${item.billing_desc || "-"}">${this.truncateText(
						item.billing_desc || "-",
						15
					)}</td>
					<td title="${item.billing_codes || "-"}">${item.billing_codes || "-"}</td>
				</tr>
			`
				)
				.join("");
		}
	}

	/**
	 * Open MD Summary modal with complete history
	 */
	async openMDSummaryModal() {
		const modal = new bootstrap.Modal(
			document.getElementById("md-summary-modal")
		);
		modal.show();

		// Load modal data
		await this.loadMDSummaryModal();
	}

	/**
	 * Load MD Summary modal data (up to 50 consultations)
	 */
	async loadMDSummaryModal() {
		try {
			this.showMDSummaryModalLoading();

			const response = await fetch(
				`${this.baseUrl}/api/worklist/${this.worklistId}/md_summary_modal`
			);
			const result = await response.json();

			if (result.status === "success" && result.data) {
				this.displayMDSummaryModal(result.data);
			} else {
				throw new Error(
					result.message || "Failed to load complete consultation history"
				);
			}
		} catch (error) {
			console.error("Error loading MD Summary modal:", error);
			this.showMDSummaryModalError(
				"Failed to load complete consultation history: " + error.message
			);
			throw error;
		}
	}

	/**
	 * Display MD Summary modal table
	 */
	displayMDSummaryModal(data) {
		const loadingDiv = document.getElementById("md-summary-modal-loading");
		const errorDiv = document.getElementById("md-summary-modal-error");
		const contentDiv = document.getElementById("md-summary-modal-content");
		const emptyDiv = document.getElementById("md-summary-modal-empty");

		// Hide loading and error states
		if (loadingDiv) loadingDiv.style.display = "none";
		if (errorDiv) errorDiv.style.display = "none";

		if (!data.items || data.items.length === 0) {
			// Show empty state
			if (contentDiv) contentDiv.style.display = "none";
			if (emptyDiv) emptyDiv.style.display = "block";
			return;
		}

		// Show content
		if (contentDiv) contentDiv.style.display = "block";
		if (emptyDiv) emptyDiv.style.display = "none";

		// Update stats
		const totalSpan = document.getElementById("md-summary-modal-total");
		if (totalSpan)
			totalSpan.textContent = data.total_count || data.items.length;

		// Populate table
		const tbody = document.getElementById("md-summary-modal-body");
		if (tbody) {
			tbody.innerHTML = data.items
				.map(
					(item) => `
				<tr>
					<td>${this.formatDateTime(item.requested_time)}</td>
					<td title="${item.procedure || "-"}">${item.procedure || "-"}</td>
					<td title="${item.history || "-"}">${this.truncateText(
						item.history || "-",
						40
					)}</td>
					<td title="${this.stripHtml(item.conclusion || "-")}">${
						item.conclusion || "-"
					}</td>
					<td title="${item.followup || "-"}">${item.followup || "-"}</td>
					<td title="${item.billing_desc || "-"}">${item.billing_desc || "-"}</td>
					<td title="${item.billing_codes || "-"}">${item.billing_codes || "-"}</td>
				</tr>
			`
				)
				.join("");
		}
	}

	/**
	 * Show MD Summary loading state
	 */
	showMDSummaryLoading() {
		const loadingDiv = document.getElementById("md-summary-loading");
		const errorDiv = document.getElementById("md-summary-error");
		const contentDiv = document.getElementById("md-summary-content");

		if (loadingDiv) loadingDiv.style.display = "block";
		if (errorDiv) errorDiv.style.display = "none";
		if (contentDiv) contentDiv.style.display = "none";
	}

	/**
	 * Show MD Summary error state
	 */
	showMDSummaryError(message) {
		const loadingDiv = document.getElementById("md-summary-loading");
		const errorDiv = document.getElementById("md-summary-error");
		const contentDiv = document.getElementById("md-summary-content");

		if (loadingDiv) loadingDiv.style.display = "none";
		if (contentDiv) contentDiv.style.display = "none";
		if (errorDiv) {
			errorDiv.style.display = "block";
			// Update error message if element exists
			const errorText = errorDiv.querySelector("strong");
			if (errorText && errorText.nextSibling) {
				errorText.nextSibling.textContent = " " + message;
			}
		}
	}

	/**
	 * Show MD Summary modal loading state
	 */
	showMDSummaryModalLoading() {
		const loadingDiv = document.getElementById("md-summary-modal-loading");
		const errorDiv = document.getElementById("md-summary-modal-error");
		const contentDiv = document.getElementById("md-summary-modal-content");

		if (loadingDiv) loadingDiv.style.display = "block";
		if (errorDiv) errorDiv.style.display = "none";
		if (contentDiv) contentDiv.style.display = "none";
	}

	/**
	 * Show MD Summary modal error state
	 */
	showMDSummaryModalError(message) {
		const loadingDiv = document.getElementById("md-summary-modal-loading");
		const errorDiv = document.getElementById("md-summary-modal-error");
		const contentDiv = document.getElementById("md-summary-modal-content");

		if (loadingDiv) loadingDiv.style.display = "none";
		if (contentDiv) contentDiv.style.display = "none";
		if (errorDiv) {
			errorDiv.style.display = "block";
			// Update error message if element exists
			const errorText = errorDiv.querySelector("strong");
			if (errorText && errorText.nextSibling) {
				errorText.nextSibling.textContent = " " + message;
			}
		}
	}

	/**
	 * Format date/time for display
	 */
	formatDateTime(dateString) {
		if (!dateString) return "-";
		try {
			const date = new Date(dateString);
			return (
				date.toLocaleDateString() +
				" " +
				date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
			);
		} catch (error) {
			return dateString;
		}
	}

	/**
	 * Truncate text with ellipsis
	 */
	truncateText(text, maxLength) {
		if (!text || text === "-") return text;
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength - 3) + "...";
	}

	/**
	 * Strip HTML tags from a string and convert badges to readable text
	 */
	stripHtml(html) {
		if (!html) return "";

		// Convert custom badge HTML to readable text for tooltips
		let text = html
			.replace(
				/<span class="badge" style="background-color: #D5E3EE; color: #0056b3; border: 1px solid #0056b3;">right<\/span>/g,
				"[right]"
			)
			.replace(
				/<span class="badge" style="background-color: #EED9D5; color: #dc3545; border: 1px solid #dc3545;">left<\/span>/g,
				"[left]"
			)
			.replace(
				/<span class="badge" style="background-color: white; color: #6c757d; border: 1px solid #6c757d;">both<\/span>/g,
				"[both]"
			);

		// Strip remaining HTML tags
		const div = document.createElement("div");
		div.innerHTML = text;
		return div.textContent || div.innerText || "";
	}
}

// Initialize payment manager when script loads
if (typeof window.worklistId !== "undefined") {
	new PaymentManager(window.worklistId);
} else {
	console.error(
		"Worklist ID not found. Payment manager cannot be initialized."
	);
}
