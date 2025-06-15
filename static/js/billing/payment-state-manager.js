/**
 * Payment State Manager with Performance Optimization
 *
 * Manages state for payment operations with queue bypass capabilities
 * to achieve fast transaction history updates and payment processing.
 */

class PaymentStateManager {
	constructor() {
		this.transactions = new Map();
		this.processingPayments = new Map();
		this.cachedBillingData = new Map();
		this.refreshTimers = new Map();

		console.log("💳 Payment State Manager initialized");
	}

	/**
	 * Store transaction in state
	 * @param {String} transactionId - Transaction identifier
	 * @param {Object} transactionData - Transaction data
	 */
	addTransaction(transactionId, transactionData) {
		this.transactions.set(transactionId, {
			...transactionData,
			timestamp: Date.now(),
			status: "active",
		});

		console.log(`💳 Payment: Added transaction ${transactionId} to state`);
	}

	/**
	 * Update transaction status
	 * @param {String} transactionId - Transaction identifier
	 * @param {String} status - New status
	 */
	updateTransactionStatus(transactionId, status) {
		if (this.transactions.has(transactionId)) {
			const transaction = this.transactions.get(transactionId);
			transaction.status = status;
			transaction.lastModified = Date.now();
			this.transactions.set(transactionId, transaction);

			console.log(
				`💳 Payment: Updated transaction ${transactionId} status to ${status}`
			);
		}
	}

	/**
	 * Track processing payment
	 * @param {String} paymentId - Payment identifier
	 * @param {Object} data - Payment data
	 */
	trackProcessingPayment(paymentId, data) {
		this.processingPayments.set(paymentId, {
			...data,
			startTime: Date.now(),
			status: "processing",
		});

		console.log(`💳 Payment: Tracking processing payment ${paymentId}`);
	}

	/**
	 * Clear processing payment
	 * @param {String} paymentId - Payment identifier
	 */
	clearProcessingPayment(paymentId) {
		if (this.processingPayments.has(paymentId)) {
			this.processingPayments.delete(paymentId);
			console.log(`💳 Payment: Cleared processing payment ${paymentId}`);
		}
	}

	/**
	 * Cache billing data for performance
	 * @param {String} worklistId - Worklist identifier
	 * @param {Object} data - Billing data
	 * @param {Number} ttl - Time to live in milliseconds
	 */
	cacheBillingData(worklistId, data, ttl = 60000) {
		// 1 minute default
		this.cachedBillingData.set(worklistId, {
			data: data,
			timestamp: Date.now(),
			ttl: ttl,
		});

		console.log(`💳 Payment: Cached billing data for worklist ${worklistId}`);
	}

	/**
	 * Get cached billing data
	 * @param {String} worklistId - Worklist identifier
	 * @returns {Object|null} Cached data or null if expired
	 */
	getCachedBillingData(worklistId) {
		const cached = this.cachedBillingData.get(worklistId);
		if (!cached) return null;

		const now = Date.now();
		if (now - cached.timestamp > cached.ttl) {
			this.cachedBillingData.delete(worklistId);
			console.log(`💳 Payment: Cache expired for worklist ${worklistId}`);
			return null;
		}

		console.log(
			`💳 Payment: Retrieved cached billing data for worklist ${worklistId}`
		);
		return cached.data;
	}

	/**
	 * Schedule transaction history refresh
	 * @param {Number} delay - Delay in milliseconds
	 */
	scheduleTransactionRefresh(delay = 1000) {
		// Clear existing timer
		if (this.refreshTimers.has("transaction-history")) {
			clearTimeout(this.refreshTimers.get("transaction-history"));
		}

		// Schedule new refresh
		const timerId = setTimeout(() => {
			if (
				typeof window.PaymentState !== "undefined" &&
				window.PaymentState.Queue
			) {
				console.log("💳 Payment: Auto-refreshing transaction history");
				window.paymentRefreshTransactions();
			}
		}, delay);

		this.refreshTimers.set("transaction-history", timerId);
		console.log(`💳 Payment: Scheduled transaction refresh in ${delay}ms`);
	}

	/**
	 * Get state statistics
	 * @returns {Object} State statistics
	 */
	getStateStats() {
		return {
			transactions: this.transactions.size,
			processingPayments: this.processingPayments.size,
			cachedBillingData: this.cachedBillingData.size,
			activeTimers: this.refreshTimers.size,
		};
	}

	/**
	 * Clean up expired cache entries
	 */
	cleanupCache() {
		const now = Date.now();
		let cleaned = 0;

		for (const [key, cached] of this.cachedBillingData.entries()) {
			if (now - cached.timestamp > cached.ttl) {
				this.cachedBillingData.delete(key);
				cleaned++;
			}
		}

		if (cleaned > 0) {
			console.log(`💳 Payment: Cleaned up ${cleaned} expired cache entries`);
		}
	}

	/**
	 * Clear all timers
	 */
	clearAllTimers() {
		this.refreshTimers.forEach((timerId) => clearTimeout(timerId));
		this.refreshTimers.clear();
		console.log("💳 Payment: Cleared all refresh timers");
	}
}

/**
 * Payment UI Manager for user interface operations
 */
class PaymentUIManager {
	constructor() {
		this.loadingElements = new Set();
		console.log("💳 Payment UI Manager initialized");
	}

	/**
	 * Show loading state for payment operations
	 * @param {String} selector - Element selector
	 */
	showPaymentLoading(selector) {
		const element = document.querySelector(selector);
		if (element) {
			element.classList.add("payment-loading");
			element.disabled = true;
			this.loadingElements.add(selector);
			console.log(`💳 Payment: Showing loading for ${selector}`);
		}
	}

	/**
	 * Hide loading state for payment operations
	 * @param {String} selector - Element selector
	 */
	hidePaymentLoading(selector) {
		const element = document.querySelector(selector);
		if (element) {
			element.classList.remove("payment-loading");
			element.disabled = false;
			this.loadingElements.delete(selector);
			console.log(`💳 Payment: Hidden loading for ${selector}`);
		}
	}

	/**
	 * Update transaction history UI
	 * @param {Array} transactions - Transaction data
	 */
	updateTransactionHistory(transactions) {
		console.log("💳 Payment: Updating transaction history UI", transactions);

		// This can be customized based on the actual transaction history display elements
		if (typeof updateTransactionHistoryUI === "function") {
			updateTransactionHistoryUI(transactions);
		}
	}

	/**
	 * Show payment feedback message
	 * @param {String} type - Message type
	 * @param {String} message - Message content
	 */
	showPaymentFeedback(type, message) {
		console.log(`💳 Payment: ${type.toUpperCase()}: ${message}`);

		// Integrate with existing payment feedback system
		if (typeof showPaymentNotification === "function") {
			showPaymentNotification(message, type);
		}
	}
}

// Initialize Payment state management
if (typeof window !== "undefined") {
	// Create universal queue for payment operations
	const paymentQueue = new UniversalRequestQueue("Payment");

	// Initialize payment state and UI managers
	const paymentStateManager = new PaymentStateManager();
	const paymentUIManager = new PaymentUIManager();

	// Export payment state management objects
	window.PaymentState = {
		Manager: paymentStateManager,
		Queue: paymentQueue,
		UI: paymentUIManager,
	};

	// Create payment-specific optimized functions
	window.paymentApiCall = function (
		endpoint,
		method = "GET",
		data = null,
		options = {}
	) {
		// Determine operation type based on endpoint and method
		let operationType = `${method}-payment`;

		if (options.operationType) {
			operationType = options.operationType;
		} else {
			// Auto-detect operation types for common payment operations
			if (endpoint.includes("transaction")) {
				operationType = "GET-transactions";
			} else if (endpoint.includes("billing")) {
				operationType = "GET-billing";
			} else if (endpoint.includes("payment")) {
				operationType = method === "POST" ? "POST-payment" : "GET-payment";
			} else if (endpoint.includes("worklist")) {
				operationType = "GET-worklist-data";
			}
		}

		// Set bypass flag for simple operations
		options.operationType = operationType;
		options.bypassQueue = options.bypassQueue !== false; // Default to bypass unless explicitly disabled

		console.log(`💳 Payment: Executing ${operationType} operation`);

		// Use the queue system
		return paymentQueue.enqueue(
			() => {
				// Perform the actual API call
				const url = endpoint;
				const requestOptions = {
					method: method,
					headers: {
						"Content-Type": "application/json",
					},
				};

				if (data && method !== "GET") {
					requestOptions.body = JSON.stringify(data);
				}

				return fetch(url, requestOptions).then((response) => response.json());
			},
			(result) => {
				console.log(`💳 Payment: ${operationType} completed successfully`);
				return result;
			},
			(error) => {
				console.error(`💳 Payment: ${operationType} failed:`, error);
				throw error;
			},
			options
		);
	};

	// Enhanced transaction history refresh function with queue optimization
	window.paymentRefreshTransactions = function (
		operationType = "GET-transactions"
	) {
		console.log(`💳 Payment: Refreshing transaction history`);

		return paymentQueue.enqueue(
			() => {
				// Check if PaymentManager exists and has refresh method
				if (
					typeof PaymentManager !== "undefined" &&
					PaymentManager.refreshTransactionHistory
				) {
					return PaymentManager.refreshTransactionHistory();
				} else {
					console.warn(
						"💳 Payment: PaymentManager not available for transaction refresh"
					);
					return Promise.resolve(false);
				}
			},
			(result) => {
				console.log(`💳 Payment: Transaction history refreshed successfully`);
				// No automatic cascade refresh - only refresh when explicitly needed
			},
			(error) => {
				console.error(`💳 Payment: Transaction history refresh failed:`, error);
			},
			{
				operationType: operationType,
				bypassQueue: true, // Transaction refreshes should always bypass
			}
		);
	};

	// Enhanced payment processing function with queue optimization
	window.paymentProcessPayment = function (
		paymentData,
		operationType = "POST-payment"
	) {
		console.log(`💳 Payment: Processing payment`, paymentData);

		const paymentId = `payment_${Date.now()}`;
		paymentStateManager.trackProcessingPayment(paymentId, paymentData);

		return paymentQueue.enqueue(
			() => {
				// Use existing PaymentManager for actual payment processing
				if (
					typeof PaymentManager !== "undefined" &&
					PaymentManager.processPayment
				) {
					return PaymentManager.processPayment(paymentData);
				} else {
					console.error("💳 Payment: PaymentManager not available");
					return Promise.reject(new Error("PaymentManager not available"));
				}
			},
			(result) => {
				console.log(`💳 Payment: Payment processed successfully`);
				paymentStateManager.clearProcessingPayment(paymentId);

				// Schedule immediate transaction refresh after successful payment
				paymentStateManager.scheduleTransactionRefresh(500); // 500ms delay
				return result;
			},
			(error) => {
				console.error(`💳 Payment: Payment processing failed:`, error);
				paymentStateManager.clearProcessingPayment(paymentId);
				throw error;
			},
			{
				operationType: operationType,
				bypassQueue: false, // Payment processing should use queue for safety
			}
		);
	};

	// Payment-specific performance monitoring function
	window.showPaymentPerformance = function () {
		const stats = paymentQueue.getPerformanceStats();

		// Also get profiler data if available
		let profilerData = {};
		if (
			typeof PerformanceProfiler !== "undefined" &&
			PerformanceProfiler.getStats
		) {
			profilerData = PerformanceProfiler.getStats();
		}

		const header = "💳 Payment View Performance Statistics:";
		const separator = "=".repeat(65);
		const targetStatus =
			stats.averageBypassTime < 100 ? "✅ TARGET ACHIEVED" : "⚠️ IN PROGRESS";

		const message =
			header +
			"\n" +
			separator +
			"\n" +
			"🎯 Bypassed Operations: " +
			stats.bypassedOperations +
			"\n" +
			"🔄 Queued Operations: " +
			stats.queuedOperations +
			"\n" +
			"⚡ Average Bypass Time: " +
			stats.averageBypassTime.toFixed(2) +
			"ms\n" +
			"🐌 Average Queue Time: " +
			stats.averageQueueTime.toFixed(2) +
			"ms\n" +
			"🚀 Performance Improvement: " +
			stats.performanceImprovement.toFixed(1) +
			"%\n\n" +
			"Target: <100ms for bypassed operations (payments may involve more processing)\n" +
			"Status: " +
			targetStatus +
			"\n" +
			separator;

		console.log(message);

		// Show user-friendly feedback
		if (window.PaymentState && window.PaymentState.UI) {
			const summaryMessage = `Payment Performance: ${
				stats.bypassedOperations
			} bypassed ops averaging ${stats.averageBypassTime.toFixed(
				1
			)}ms (${stats.performanceImprovement.toFixed(1)}% improvement)`;
			window.PaymentState.UI.showPaymentFeedback("info", summaryMessage);
		}

		return stats;
	};

	// No auto-refresh on page load - only refresh after payment processing
	document.addEventListener("DOMContentLoaded", () => {
		console.log(
			"💳 Payment: Page loaded - transaction history will only refresh after payments"
		);
	});

	// Cleanup expired cache entries every 2 minutes
	setInterval(() => {
		paymentStateManager.cleanupCache();
	}, 120000);

	// Cleanup timers on page unload
	window.addEventListener("beforeunload", () => {
		paymentStateManager.clearAllTimers();
	});

	console.log(
		"💳 Payment state management initialized with performance optimization"
	);
	console.log(
		"🎯 Use showPaymentPerformance() to view payment-specific performance metrics"
	);
	console.log("🎯 Use paymentApiCall() for optimized API calls");
	console.log(
		"🎯 Use paymentRefreshTransactions() for optimized transaction refreshes"
	);
	console.log(
		"🎯 Use paymentProcessPayment() for optimized payment processing"
	);
}
