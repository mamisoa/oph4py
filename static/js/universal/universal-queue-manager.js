/**
 * Universal Queue Manager for Performance Optimization
 *
 * Provides queue bypass functionality for any view to achieve dramatic performance improvements.
 * Based on the proven worklist implementation that achieved 90% performance improvement.
 */

class UniversalRequestQueue {
	constructor(viewType = "Unknown") {
		this.viewType = viewType;
		this.queue = [];
		this.processing = false;
		this.bypassEnabled = true;
		this.performanceMetrics = {
			bypassedOperations: 0,
			queuedOperations: 0,
			totalBypassTime: 0,
			totalQueueTime: 0,
		};

		console.log(`🚀 Universal Queue initialized for ${viewType} view`);
	}

	/**
	 * Determine if an operation should bypass the queue based on view type and operation
	 * @param {Object} options - Operation options
	 * @returns {Boolean} True if operation should bypass queue
	 */
	shouldBypassQueue(options = {}) {
		if (!this.bypassEnabled) {
			console.log(`🔄 Bypass disabled globally for ${this.viewType}`);
			return false;
		}

		const operationType = options.operationType || "unknown";

		// Get view-specific bypass and queue operations
		const { bypassOperations, queueRequiredOperations } =
			this.getViewSpecificOperations();

		console.log(`🔍 ${this.viewType} Bypass Decision for "${operationType}":`, {
			viewType: this.viewType,
			operationType,
			bypassEnabled: this.bypassEnabled,
			explicitBypass: options.bypassQueue,
			inBypassList: bypassOperations.includes(operationType),
			inQueueList: queueRequiredOperations.includes(operationType),
		});

		// Check if explicitly marked as queue-required
		if (
			options.operationType &&
			queueRequiredOperations.includes(options.operationType)
		) {
			console.log(
				`🔄 QUEUE REQUIRED: ${operationType} needs serialization in ${this.viewType}`
			);
			return false;
		}

		// Check if eligible for bypass
		if (
			options.operationType &&
			bypassOperations.includes(options.operationType)
		) {
			console.log(
				`⚡ BYPASS ELIGIBLE: ${operationType} can be fast-tracked in ${this.viewType}`
			);
			return true;
		}

		// Check explicit bypass flag
		if (options.bypassQueue === true) {
			console.log(
				`⚡ EXPLICIT BYPASS: ${operationType} marked for bypass in ${this.viewType}`
			);
			return true;
		}

		// Default behavior varies by view
		return this.getDefaultBypassBehavior(operationType);
	}

	/**
	 * Get view-specific operation classifications
	 * @returns {Object} Operations that can bypass vs must queue
	 */
	getViewSpecificOperations() {
		switch (this.viewType) {
			case "MD":
				return {
					bypassOperations: [
						"POST-mx", // Add medications
						"POST-allergy", // Add allergies
						"POST-agent", // Add agents
						"POST-disease_ref", // Add disease references
						"PUT-patient", // Update patient info
						"DELETE-single", // Single item deletion
						"GET-simple", // Simple data retrieval
						"form-submit", // Simple form submissions
						"table-refresh", // Table refreshes
						"ui-feedback", // User feedback messages
						"status-update", // Simple status changes
						"counter-update", // Counter modifications
					],
					queueRequiredOperations: [
						"batch-import", // Batch medication imports
						"certificate-generation", // Complex certificate creation
						"prescription-workflow", // Multi-step prescription processes
						"multi-table-transaction", // Operations affecting multiple tables
						"complex-validation", // Operations requiring complex validation
					],
				};

			case "DailyTransactions":
			case "BillingSummary":
				return {
					bypassOperations: [
						"GET-transactions", // Load transaction data
						"table-refresh", // Table refreshes
						"filter-application", // Apply filters
						"simple-search", // Search operations
						"summary-calculation", // Summary calculations
						"single-export", // Single file exports
						"ui-feedback", // User feedback
						"status-update", // Status changes
					],
					queueRequiredOperations: [
						"large-export", // Large data exports
						"batch-processing", // Batch operations
						"complex-reporting", // Complex report generation
						"multi-table-operation", // Multi-table operations
						"transaction-critical", // Critical financial operations
					],
				};

			case "Worklist":
				return {
					bypassOperations: [
						"status-update",
						"counter-update",
						"table-refresh",
						"ui-feedback",
						"state-query",
						"simple-crud",
					],
					queueRequiredOperations: [
						"batch-insert",
						"combo-processing",
						"delete-with-confirmation",
						"transaction-critical",
					],
				};

			default:
				return {
					bypassOperations: [
						"table-refresh",
						"ui-feedback",
						"simple-crud",
						"status-update",
					],
					queueRequiredOperations: [
						"batch-operation",
						"transaction-critical",
						"complex-workflow",
					],
				};
		}
	}

	/**
	 * Get default bypass behavior for unknown operations
	 * @param {String} operationType - Operation type
	 * @returns {Boolean} Whether to bypass by default
	 */
	getDefaultBypassBehavior(operationType) {
		// Conservative approach: queue unknown operations for safety
		console.log(
			`🤔 Unknown operation "${operationType}" in ${this.viewType} - defaulting to queue for safety`
		);
		return false;
	}

	/**
	 * Execute operation directly without queuing
	 * @param {Function} requestFn - Function to execute
	 * @param {Function} successCallback - Success callback
	 * @param {Function} errorCallback - Error callback
	 * @param {Object} options - Operation options
	 */
	executeDirectly(requestFn, successCallback, errorCallback, options = {}) {
		const startTime = performance.now();
		const operationType = options.operationType || "unknown";

		console.log(
			`⚡ ${this.viewType}: Bypassing queue for ${operationType} operation`
		);

		try {
			const result = requestFn();

			if (result && typeof result.then === "function") {
				// Handle promises
				result
					.then((data) => {
						const duration = performance.now() - startTime;
						this.recordBypassMetrics(duration, options);

						if (successCallback) successCallback(data);
						console.log(
							`✅ ${
								this.viewType
							}: Bypass operation completed in ${duration.toFixed(2)}ms`
						);
					})
					.catch((error) => {
						const duration = performance.now() - startTime;
						this.recordBypassMetrics(duration, options, true);

						if (errorCallback) errorCallback(error);
						console.warn(
							`❌ ${
								this.viewType
							}: Bypass operation failed in ${duration.toFixed(2)}ms:`,
							error
						);
					});
			} else {
				// Handle synchronous results
				const duration = performance.now() - startTime;
				this.recordBypassMetrics(duration, options);

				if (successCallback) successCallback(result);
				console.log(
					`✅ ${
						this.viewType
					}: Bypass operation completed synchronously in ${duration.toFixed(
						2
					)}ms`
				);
			}
		} catch (error) {
			const duration = performance.now() - startTime;
			this.recordBypassMetrics(duration, options, true);

			if (errorCallback) errorCallback(error);
			console.warn(
				`❌ ${
					this.viewType
				}: Bypass operation failed synchronously in ${duration.toFixed(2)}ms:`,
				error
			);
		}
	}

	/**
	 * Record performance metrics for bypass operations
	 * @param {Number} duration - Operation duration in milliseconds
	 * @param {Object} options - Operation options
	 * @param {Boolean} isError - Whether operation resulted in error
	 */
	recordBypassMetrics(duration, options, isError = false) {
		this.performanceMetrics.bypassedOperations++;
		this.performanceMetrics.totalBypassTime += duration;

		// Log performance improvements
		const avgBypassTime =
			this.performanceMetrics.totalBypassTime /
			this.performanceMetrics.bypassedOperations;
		if (this.performanceMetrics.bypassedOperations % 10 === 0) {
			console.log(
				`📊 ${this.viewType} Bypass Performance: Avg ${avgBypassTime.toFixed(
					2
				)}ms per operation (${
					this.performanceMetrics.bypassedOperations
				} operations)`
			);
		}
	}

	/**
	 * Add a request to the queue or execute directly
	 * @param {Function} requestFn - Function to execute
	 * @param {Function} successCallback - Callback on success
	 * @param {Function} errorCallback - Callback on error
	 * @param {Object} options - Operation options
	 */
	enqueue(requestFn, successCallback, errorCallback, options = {}) {
		// Check if operation should bypass the queue
		if (this.shouldBypassQueue(options)) {
			return this.executeDirectly(
				requestFn,
				successCallback,
				errorCallback,
				options
			);
		}

		// Use traditional queue for complex operations
		const operationType = options.operationType || "unknown";
		console.log(`🔄 ${this.viewType}: Queuing ${operationType} operation`);
		const startTime = performance.now();

		this.queue.push({
			requestFn,
			successCallback: (data) => {
				const duration = performance.now() - startTime;
				this.recordQueueMetrics(duration, options);
				if (successCallback) successCallback(data);
			},
			errorCallback: (error) => {
				const duration = performance.now() - startTime;
				this.recordQueueMetrics(duration, options, true);
				if (errorCallback) errorCallback(error);
			},
			options,
		});

		if (!this.processing) {
			this.processNext();
		}
	}

	/**
	 * Record performance metrics for queued operations
	 * @param {Number} duration - Operation duration in milliseconds
	 * @param {Object} options - Operation options
	 * @param {Boolean} isError - Whether operation resulted in error
	 */
	recordQueueMetrics(duration, options, isError = false) {
		this.performanceMetrics.queuedOperations++;
		this.performanceMetrics.totalQueueTime += duration;
	}

	/**
	 * Process the next item in the queue
	 */
	async processNext() {
		if (this.queue.length === 0) {
			this.processing = false;
			return;
		}

		this.processing = true;
		const { requestFn, successCallback, errorCallback, options } =
			this.queue.shift();

		try {
			const result = requestFn();

			if (result && typeof result.then === "function") {
				// Handle promises
				result
					.then(successCallback)
					.catch(errorCallback)
					.finally(() => {
						setTimeout(() => this.processNext(), 0);
					});
			} else {
				// Handle synchronous results
				successCallback(result);
				setTimeout(() => this.processNext(), 0);
			}
		} catch (error) {
			errorCallback(error);
			setTimeout(() => this.processNext(), 0);
		}
	}

	/**
	 * Get performance statistics
	 * @returns {Object} Performance metrics
	 */
	getPerformanceStats() {
		const avgBypassTime =
			this.performanceMetrics.bypassedOperations > 0
				? this.performanceMetrics.totalBypassTime /
				  this.performanceMetrics.bypassedOperations
				: 0;
		const avgQueueTime =
			this.performanceMetrics.queuedOperations > 0
				? this.performanceMetrics.totalQueueTime /
				  this.performanceMetrics.queuedOperations
				: 0;

		return {
			viewType: this.viewType,
			bypassedOperations: this.performanceMetrics.bypassedOperations,
			queuedOperations: this.performanceMetrics.queuedOperations,
			averageBypassTime: avgBypassTime,
			averageQueueTime: avgQueueTime,
			performanceImprovement:
				avgQueueTime > 0
					? ((avgQueueTime - avgBypassTime) / avgQueueTime) * 100
					: 0,
		};
	}
}

// Export for global use
window.UniversalRequestQueue = UniversalRequestQueue;
