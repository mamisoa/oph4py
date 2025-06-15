/**
 * Transaction State Manager with Performance Optimization
 *
 * Manages state for billing and transaction operations with queue bypass capabilities
 * to achieve the same performance improvements as the worklist system.
 */

class TransactionStateManager {
	constructor() {
		this.filters = new Map();
		this.cachedData = new Map();
		this.processingOperations = new Map();

		console.log("💰 Transaction State Manager initialized");
	}

	/**
	 * Store filter state
	 * @param {String} filterName - Filter identifier
	 * @param {Object} filterData - Filter data
	 */
	setFilter(filterName, filterData) {
		this.filters.set(filterName, {
			...filterData,
			timestamp: Date.now(),
		});

		console.log(`💰 Transaction: Set filter ${filterName}`, filterData);
	}

	/**
	 * Get filter state
	 * @param {String} filterName - Filter identifier
	 * @returns {Object} Filter data
	 */
	getFilter(filterName) {
		return this.filters.get(filterName);
	}

	/**
	 * Cache data for performance
	 * @param {String} key - Cache key
	 * @param {Object} data - Data to cache
	 * @param {Number} ttl - Time to live in milliseconds
	 */
	cacheData(key, data, ttl = 300000) {
		// 5 minutes default
		this.cachedData.set(key, {
			data: data,
			timestamp: Date.now(),
			ttl: ttl,
		});

		console.log(`💰 Transaction: Cached data for ${key}`);
	}

	/**
	 * Get cached data
	 * @param {String} key - Cache key
	 * @returns {Object|null} Cached data or null if expired
	 */
	getCachedData(key) {
		const cached = this.cachedData.get(key);
		if (!cached) return null;

		const now = Date.now();
		if (now - cached.timestamp > cached.ttl) {
			this.cachedData.delete(key);
			console.log(`💰 Transaction: Cache expired for ${key}`);
			return null;
		}

		console.log(`💰 Transaction: Retrieved cached data for ${key}`);
		return cached.data;
	}

	/**
	 * Track processing operation
	 * @param {String} operationId - Operation identifier
	 * @param {Object} data - Operation data
	 */
	trackOperation(operationId, data) {
		this.processingOperations.set(operationId, {
			...data,
			startTime: Date.now(),
			status: "processing",
		});

		console.log(`💰 Transaction: Tracking operation ${operationId}`);
	}

	/**
	 * Clear processing operation
	 * @param {String} operationId - Operation identifier
	 */
	clearOperation(operationId) {
		if (this.processingOperations.has(operationId)) {
			this.processingOperations.delete(operationId);
			console.log(`💰 Transaction: Cleared operation ${operationId}`);
		}
	}

	/**
	 * Get state statistics
	 * @returns {Object} State statistics
	 */
	getStateStats() {
		return {
			filters: this.filters.size,
			cachedItems: this.cachedData.size,
			processingOperations: this.processingOperations.size,
		};
	}

	/**
	 * Clean up expired cache entries
	 */
	cleanupCache() {
		const now = Date.now();
		let cleaned = 0;

		for (const [key, cached] of this.cachedData.entries()) {
			if (now - cached.timestamp > cached.ttl) {
				this.cachedData.delete(key);
				cleaned++;
			}
		}

		if (cleaned > 0) {
			console.log(
				`💰 Transaction: Cleaned up ${cleaned} expired cache entries`
			);
		}
	}
}

/**
 * Transaction UI Manager for user interface operations
 */
class TransactionUIManager {
	constructor() {
		this.loadingElements = new Set();
		console.log("💰 Transaction UI Manager initialized");
	}

	/**
	 * Show loading state
	 * @param {String} selector - Element selector
	 */
	showLoading(selector) {
		const element = document.querySelector(selector);
		if (element) {
			element.classList.add("loading");
			this.loadingElements.add(selector);
			console.log(`💰 Transaction: Showing loading for ${selector}`);
		}
	}

	/**
	 * Hide loading state
	 * @param {String} selector - Element selector
	 */
	hideLoading(selector) {
		const element = document.querySelector(selector);
		if (element) {
			element.classList.remove("loading");
			this.loadingElements.delete(selector);
			console.log(`💰 Transaction: Hidden loading for ${selector}`);
		}
	}

	/**
	 * Update summary display
	 * @param {Object} summaryData - Summary data
	 */
	updateSummary(summaryData) {
		console.log("💰 Transaction: Updating summary display", summaryData);

		// This can be customized based on the actual summary display elements
		if (typeof updateSummaryCards === "function") {
			updateSummaryCards(summaryData);
		}
	}

	/**
	 * Show feedback message
	 * @param {String} type - Message type
	 * @param {String} message - Message content
	 */
	showFeedback(type, message) {
		console.log(`💰 Transaction: ${type.toUpperCase()}: ${message}`);

		// Integrate with existing transaction feedback system
		if (typeof showNotification === "function") {
			showNotification(message, type);
		}
	}
}

// Initialize Transaction state management
if (typeof window !== "undefined") {
	// Determine view type (could be DailyTransactions or BillingSummary)
	const viewType = window.location.pathname.includes("daily_transactions")
		? "DailyTransactions"
		: "BillingSummary";

	// Create universal queue for transaction operations
	const transactionQueue = new UniversalRequestQueue(viewType);

	// Initialize transaction state and UI managers
	const transactionStateManager = new TransactionStateManager();
	const transactionUIManager = new TransactionUIManager();

	// Export transaction state management objects
	window.TransactionState = {
		Manager: transactionStateManager,
		Queue: transactionQueue,
		UI: transactionUIManager,
	};

	// Create transaction-specific optimized functions
	window.transactionApiCall = function (
		endpoint,
		method = "GET",
		data = null,
		options = {}
	) {
		// Determine operation type based on endpoint and method
		let operationType = `${method}-${endpoint}`;

		if (options.operationType) {
			operationType = options.operationType;
		} else {
			// Auto-detect operation types for common transaction operations
			if (endpoint.includes("transaction")) {
				operationType = "GET-transactions";
			} else if (method === "GET" && endpoint.includes("billing")) {
				operationType = "GET-billing";
			} else if (endpoint.includes("export")) {
				operationType = "single-export";
			} else if (endpoint.includes("summary")) {
				operationType = "summary-calculation";
			}
		}

		// Set bypass flag for simple operations
		options.operationType = operationType;
		options.bypassQueue = options.bypassQueue !== false; // Default to bypass unless explicitly disabled

		console.log(`💰 Transaction: Executing ${operationType} operation`);

		// Use the queue system
		return transactionQueue.enqueue(
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
				console.log(`💰 Transaction: ${operationType} completed successfully`);
				return result;
			},
			(error) => {
				console.error(`💰 Transaction: ${operationType} failed:`, error);
				throw error;
			},
			options
		);
	};

	// Enhanced table refresh function with queue optimization
	window.transactionRefreshTable = function (
		tableSelector,
		operationType = "table-refresh"
	) {
		console.log(`💰 Transaction: Refreshing table ${tableSelector}`);

		return transactionQueue.enqueue(
			() => {
				const table = $(tableSelector);
				if (table.length && table.bootstrapTable) {
					table.bootstrapTable("refresh");
					return true;
				}
				return false;
			},
			(result) => {
				console.log(
					`💰 Transaction: Table ${tableSelector} refreshed successfully`
				);
			},
			(error) => {
				console.error(
					`💰 Transaction: Table ${tableSelector} refresh failed:`,
					error
				);
			},
			{
				operationType: operationType,
				bypassQueue: true, // Table refreshes should always bypass
			}
		);
	};

	// Enhanced filter application with queue optimization
	window.transactionApplyFilter = function (
		filterData,
		operationType = "filter-application"
	) {
		console.log(`💰 Transaction: Applying filter`, filterData);

		// Store filter state
		transactionStateManager.setFilter("current", filterData);

		return transactionQueue.enqueue(
			() => {
				// Apply the filter logic
				const table = $("#transactionsTable");
				if (table.length && table.bootstrapTable) {
					table.bootstrapTable("refresh");
					return true;
				}
				return false;
			},
			(result) => {
				console.log(`💰 Transaction: Filter applied successfully`);
			},
			(error) => {
				console.error(`💰 Transaction: Filter application failed:`, error);
			},
			{
				operationType: operationType,
				bypassQueue: true, // Filter applications should bypass
			}
		);
	};

	// Transaction-specific performance monitoring function
	window.showTransactionPerformance = function () {
		const stats = transactionQueue.getPerformanceStats();

		// Also get profiler data if available
		let profilerData = {};
		if (
			typeof PerformanceProfiler !== "undefined" &&
			PerformanceProfiler.getStats
		) {
			profilerData = PerformanceProfiler.getStats();
		}

		const header = `💰 ${viewType} Performance Statistics:`;
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
			"Target: <100ms for bypassed operations (transactions may be slower than MD/worklist)\n" +
			"Status: " +
			targetStatus +
			"\n" +
			separator;

		console.log(message);

		// Show user-friendly feedback
		if (window.TransactionState && window.TransactionState.UI) {
			const summaryMessage = `${viewType} Performance: ${
				stats.bypassedOperations
			} bypassed ops averaging ${stats.averageBypassTime.toFixed(
				1
			)}ms (${stats.performanceImprovement.toFixed(1)}% improvement)`;
			window.TransactionState.UI.showFeedback("info", summaryMessage);
		}

		return stats;
	};

	// Cleanup expired cache entries every 5 minutes
	setInterval(() => {
		transactionStateManager.cleanupCache();
	}, 300000);

	console.log(
		`💰 ${viewType} state management initialized with performance optimization`
	);
	console.log(
		"🎯 Use showTransactionPerformance() to view transaction-specific performance metrics"
	);
	console.log("🎯 Use transactionApiCall() for optimized API calls");
	console.log("🎯 Use transactionRefreshTable() for optimized table refreshes");
	console.log(
		"🎯 Use transactionApplyFilter() for optimized filter applications"
	);
}
