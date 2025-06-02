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
		console.log("Initializing Payment Manager for worklist:", this.worklistId);

		try {
			// Load all data
			await this.loadPaymentSummary();
			await this.loadBillingCodes();
			await this.loadTransactionHistory();

			// Set dropdown default value
			const feecodeSelect = document.getElementById("feecode-select");
			if (feecodeSelect) {
				feecodeSelect.value = this.currentFeecode;
			}

			// Bind events
			this.bindEvents();

			console.log("Payment Manager initialized successfully");
		} catch (error) {
			console.error("Error initializing Payment Manager:", error);
			this.showAlert("Error loading payment data: " + error.message, "danger");
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
	 * Load transaction history
	 */
	async loadTransactionHistory() {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/worklist/${this.worklistId}/transactions`
			);
			const result = await response.json();

			if (result.status === "success" && result.data) {
				this.displayTransactionHistory(result.data);
			} else {
				throw new Error(result.message || "Failed to load transaction history");
			}
		} catch (error) {
			console.error("Error loading transaction history:", error);
			// Don't throw error for transaction history as it's not critical
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
	}

	/**
	 * Display transaction history
	 */
	displayTransactionHistory(transactions) {
		const tbody = document.getElementById("transaction-history-body");
		if (!tbody) return;

		if (transactions.length === 0) {
			tbody.innerHTML =
				'<tr><td colspan="7" class="text-center text-muted">No transactions found</td></tr>';
			return;
		}

		let html = "";
		transactions.forEach((transaction) => {
			const date = new Date(transaction.transaction_date).toLocaleDateString();
			html += `
                <tr>
                    <td>${date}</td>
                    <td>€${transaction.amount_card.toFixed(2)}</td>
                    <td>€${transaction.amount_cash.toFixed(2)}</td>
                    <td>€${transaction.amount_invoice.toFixed(2)}</td>
                    <td class="fw-bold">€${transaction.total_amount.toFixed(
											2
										)}</td>
                    <td><span class="badge ${this.getStatusBadgeClass(
											transaction.payment_status
										)}">${this.getStatusText(
				transaction.payment_status
			)}</span></td>
                    <td>${transaction.processed_by}</td>
                </tr>
            `;
		});

		tbody.innerHTML = html;
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
			this.showAlert("No payment required. Balance is already paid.", "info");
			return;
		}

		// Set amount to pay
		document.getElementById("amount-to-pay").textContent = balance.toFixed(2);

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
	 * Process payment transaction
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
		};

		if (
			paymentData.amount_card +
				paymentData.amount_cash +
				paymentData.amount_invoice <=
			0
		) {
			this.showAlert("Please enter a valid payment amount", "danger");
			return;
		}

		try {
			// Disable confirm button
			const confirmBtn = document.getElementById("confirm-payment-btn");
			confirmBtn.disabled = true;
			confirmBtn.innerHTML =
				'<i class="fas fa-spinner fa-spin me-1"></i>Processing...';

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
				// Close modal
				const modal = bootstrap.Modal.getInstance(
					document.getElementById("payment-modal")
				);
				modal.hide();

				// Show success message
				this.showAlert(
					result.data.message || "Payment processed successfully",
					"success"
				);

				// Refresh data
				await this.loadPaymentSummary();
				await this.loadTransactionHistory();
				this.updatePaymentButton();
			} else {
				throw new Error(result.message || "Failed to process payment");
			}
		} catch (error) {
			console.error("Error processing payment:", error);
			this.showAlert("Error processing payment: " + error.message, "danger");
		} finally {
			// Re-enable confirm button
			const confirmBtn = document.getElementById("confirm-payment-btn");
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
	 * Show alert message
	 */
	showAlert(message, type = "info") {
		const alertContainer = document.getElementById("alert-container");
		if (!alertContainer) {
			console.warn("Alert container not found");
			return;
		}

		const alertId = "alert-" + Date.now();
		const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show alert-floating" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

		alertContainer.insertAdjacentHTML("beforeend", alertHtml);

		// Auto-dismiss after 5 seconds
		setTimeout(() => {
			const alertElement = document.getElementById(alertId);
			if (alertElement) {
				const alert = bootstrap.Alert.getInstance(alertElement);
				if (alert) {
					alert.close();
				}
			}
		}, 5000);
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
