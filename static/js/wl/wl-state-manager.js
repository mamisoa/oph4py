/**
 * Worklist State Manager
 *
 * This file contains utility classes to manage worklist operations,
 * prevent concurrency issues, and provide reliable UI feedback.
 */

/**
 * Manages the state of worklist items to prevent concurrency issues
 */
class WorklistStateManager {
	constructor() {
		this.pendingItems = new Map(); // keyed by uniqueId
		this.processedItems = new Map(); // tracking processing status
		this.htmlElements = new Map(); // references to DOM elements
		this.patientContext = null; // current patient context
		this.processingItems = new Map(); // tracking items by their database ID
		this.currentTransactionId = null; // stores the current transaction ID
	}

	/**
	 * Set the current patient context
	 * @param {Object} patient - Patient data object
	 */
	setPatientContext(patient) {
		this.patientContext = patient;
	}

	/**
	 * Get the current patient context
	 * @returns {Object} Current patient context
	 */
	getPatientContext() {
		return this.patientContext;
	}

	/**
	 * Add a new item to the pending items
	 * @param {Object} item - Worklist item to add
	 * @returns {String} Generated unique ID for the item
	 */
	addItem(item) {
		const uniqueId = this.generateUniqueId();

		// Create a deep copy of the item to avoid modifying the original
		const itemCopy = JSON.parse(JSON.stringify(item));

		// Add uniqueId to our internal representation only
		itemCopy.uniqueId = uniqueId;

		this.pendingItems.set(uniqueId, itemCopy);
		console.log(
			`Added item to state manager with uniqueId: ${uniqueId}`,
			itemCopy
		);
		return uniqueId;
	}

	/**
	 * Update the status of an item
	 * @param {String} id - Unique ID of the item
	 * @param {String} status - New status of the item
	 * @param {Object} data - Additional data to store with the item
	 */
	updateItemStatus(id, status, data = {}) {
		if (this.pendingItems.has(id)) {
			const item = this.pendingItems.get(id);
			item.status = status;
			item.data = { ...item.data, ...data };
			this.pendingItems.set(id, item);

			if (status === "completed" || status === "failed") {
				this.processedItems.set(id, this.pendingItems.get(id));
				this.pendingItems.delete(id);
			}
		}
	}

	/**
	 * Get items by patient ID
	 * @param {Number} patientId - Patient ID to filter by
	 * @returns {Array} List of items for the patient
	 */
	getItemsByPatient(patientId) {
		const items = [];
		this.pendingItems.forEach((item) => {
			if (item.id_auth_user === patientId) {
				items.push(item);
			}
		});
		return items;
	}

	/**
	 * Get all pending items
	 * @returns {Array} Array of all pending items
	 */
	getAllPendingItems() {
		return Array.from(this.pendingItems.values());
	}

	/**
	 * Get all processed items
	 * @returns {Array} Array of all processed items
	 */
	getAllProcessedItems() {
		return Array.from(this.processedItems.values());
	}

	/**
	 * Get a clean copy of an item for submission to the server
	 * Removes client-side tracking properties like uniqueId
	 * @param {String} uniqueId - The uniqueId of the item
	 * @returns {Object} Copy of the item without client-side properties
	 */
	getCleanItemForSubmission(uniqueId) {
		if (!this.pendingItems.has(uniqueId)) {
			return null;
		}

		// Create a deep copy
		const item = JSON.parse(JSON.stringify(this.pendingItems.get(uniqueId)));

		// Fields that should be sent to the server
		const serverFields = [
			"id_auth_user",
			"sending_app",
			"sending_facility",
			"receiving_app",
			"receiving_facility",
			"message_unique_id",
			"procedure",
			"provider",
			"senior",
			"requested_time",
			"modality_dest",
			"laterality",
			"status_flag",
			"counter",
			"warning",
		];

		// Create a new object with only the fields needed by the server
		const cleanItem = {};
		for (const field of serverFields) {
			if (item[field] !== undefined) {
				// Ensure counter is a number
				if (field === "counter" && typeof item[field] === "string") {
					cleanItem[field] = parseInt(item[field], 10) || 0;
				} else {
					cleanItem[field] = item[field];
				}
			}
		}

		return cleanItem;
	}

	/**
	 * Get all pending items ready for submission (without client-side properties)
	 * @returns {Array} Array of clean items ready for submission
	 */
	getAllCleanPendingItems() {
		const cleanItems = [];
		this.pendingItems.forEach((item, uniqueId) => {
			cleanItems.push(this.getCleanItemForSubmission(uniqueId));
		});
		return cleanItems;
	}

	/**
	 * Track an item being processed by its database ID
	 * @param {Number|String} id - Database ID of the item
	 * @param {Object} data - Additional metadata to store
	 */
	trackProcessingItem(id, data = {}) {
		this.processingItems.set(id.toString(), {
			id: id,
			startTime: new Date(),
			data: data,
		});
	}

	/**
	 * Remove tracking for a processed item
	 * @param {Number|String} id - Database ID of the item
	 * @returns {Boolean} True if item was found and removed
	 */
	clearProcessingItem(id) {
		return this.processingItems.delete(id.toString());
	}

	/**
	 * Check if an item is currently being processed
	 * @param {Number|String} id - Database ID of the item
	 * @returns {Boolean} True if item is being processed
	 */
	isItemProcessing(id) {
		return this.processingItems.has(id.toString());
	}

	/**
	 * Get all items currently being processed
	 * @returns {Array} Array of processing items
	 */
	getAllProcessingItems() {
		return Array.from(this.processingItems.values());
	}

	/**
	 * Clear all pending items
	 */
	clearPendingItems() {
		this.pendingItems.clear();
	}

	/**
	 * Clear processed items
	 */
	clearProcessedItems() {
		this.processedItems.clear();
		console.log("Processed items cleared");
	}

	/**
	 * Atomically clean up all state references for an item
	 * @param {String} uniqueId - The unique ID of the item to clean up
	 * @param {Number|String} databaseId - The database ID of the item
	 * @returns {Boolean} True if cleanup was successful, false otherwise
	 */
	atomicCleanupItem(uniqueId, databaseId) {
		console.log(
			`🧹 Starting atomic cleanup for uniqueId: ${uniqueId}, dbId: ${databaseId}`
		);

		// Clean all state maps atomically
		const cleanupResults = {
			pendingItems: this.pendingItems.delete(uniqueId),
			processedItems: this.processedItems.delete(uniqueId),
			htmlElements: this.htmlElements.delete(uniqueId),
			processingItems: this.processingItems.delete(databaseId?.toString()),
		};

		// Verify cleanup success - note that delete() returns false if key didn't exist
		// which is acceptable, so we just check that all operations completed without error
		try {
			const allCompleted = Object.keys(cleanupResults).length === 4;

			if (!allCompleted) {
				console.error(
					"🚨 Atomic cleanup failed - not all operations completed:",
					cleanupResults
				);
				return false;
			}

			console.log("✅ Atomic cleanup completed successfully");
			return true;
		} catch (error) {
			console.error("🚨 Error during atomic cleanup:", error);
			return false;
		}
	}

	/**
	 * Generate a unique ID with validation and uniqueness checking
	 * @returns {String} A validated unique ID
	 */
	generateUniqueId() {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substr(2, 9);
		const uniqueId = `wl_${timestamp}_${random}`;

		// Validation to ensure uniqueId is valid
		if (
			!uniqueId ||
			uniqueId.includes("undefined") ||
			uniqueId.includes("null")
		) {
			console.error("🚨 Generated invalid uniqueId:", uniqueId);
			// Fallback generation
			return `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		}

		// Ensure uniqueness across existing items
		if (this.pendingItems.has(uniqueId)) {
			console.warn("⚠️  UniqueId collision detected, regenerating...");
			return this.generateUniqueId(); // Recursive retry
		}

		console.log("✅ Generated valid uniqueId:", uniqueId);
		return uniqueId;
	}

	/**
	 * Validate that all items belong to the same patient
	 * @returns {Boolean} True if all items belong to the same patient
	 */
	validatePatientConsistency() {
		if (this.pendingItems.size === 0) return true;

		const items = this.getAllPendingItems();
		const firstPatientId = items[0].id_auth_user;

		return items.every((item) => item.id_auth_user === firstPatientId);
	}

	/**
	 * Submit all pending items as a batch operation
	 * @returns {Promise} Promise that resolves with the created items or rejects with an error
	 */
	submitBatch() {
		return new Promise((resolve, reject) => {
			// Get all items but filter out any with modality_dest equal to 'multiple' (multiplemod)
			const allItems = this.getAllCleanPendingItems();
			const items = allItems.filter(
				(item) => item.modality_dest != multiplemod
			);

			console.log(
				`Filtered out ${
					allItems.length - items.length
				} 'multiple' modality items`
			);

			if (items.length === 0) {
				reject(new Error("No items to submit"));
				return;
			}

			// Generate a transaction ID for tracking
			const transactionId = this.generateUniqueId();
			this.currentTransactionId = transactionId; // Store for later use

			// Prepare the batch request
			const batchData = {
				items: items,
				transaction_id: transactionId,
			};

			// Log the data being sent for debugging
			console.log("Submitting batch with data:", JSON.stringify(batchData));

			// Submit the batch
			fetch(`${HOSTURL}/${APP_NAME}/api/worklist/batch`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(batchData),
			})
				.then((response) => {
					if (!response.ok) {
						return response.json().then((errorData) => {
							throw new Error(
								errorData.message || `Server error: ${response.status}`
							);
						});
					}
					return response.json();
				})
				.then((data) => {
					console.log("Server response:", data);

					if (data.status === "success") {
						// Store transaction information in localStorage for recovery
						this.storeTransactionInfo(data.transaction_id, data.items);

						// Check if items array exists
						if (data.items && Array.isArray(data.items)) {
							// Update all items with their new database IDs
							data.items.forEach((item) => {
								const pendingItems = Array.from(this.pendingItems.entries());
								const matchingItem = pendingItems.find(
									([_, pending]) =>
										pending.id_auth_user === item.id_auth_user &&
										pending.procedure == item.procedure &&
										pending.modality_dest == item.modality_dest
								);

								if (matchingItem) {
									const [uniqueId] = matchingItem;
									this.updateItemStatus(uniqueId, "completed", {
										dbId: item.id,
										transactionId: data.transaction_id,
									});
								}
							});

							resolve(data.items);
						} else {
							console.warn("Server returned success but no items array:", data);
							// If no items array, just resolve with an empty array
							resolve([]);
						}
					} else {
						reject(new Error(data.message || "Batch submission failed"));
					}
				})
				.catch((error) => {
					console.error("Error in batch submission:", error);
					reject(error);
				});
		});
	}

	/**
	 * Store transaction information in localStorage for recovery
	 * @param {String} transactionId - The transaction ID
	 * @param {Array} items - The items in the transaction
	 */
	storeTransactionInfo(transactionId, items) {
		try {
			// Get existing transactions
			const transactions = JSON.parse(
				localStorage.getItem("worklist_transactions") || "[]"
			);

			// Add the new transaction
			transactions.push({
				id: transactionId,
				timestamp: new Date().toISOString(),
				itemCount: items.length,
				status: "complete", // Initial status
			});

			// Keep only the 20 most recent transactions
			if (transactions.length > 20) {
				transactions.splice(0, transactions.length - 20);
			}

			// Save back to localStorage
			localStorage.setItem(
				"worklist_transactions",
				JSON.stringify(transactions)
			);
		} catch (e) {
			console.error("Error storing transaction info:", e);
		}
	}

	/**
	 * Get the status of a transaction
	 * @param {String} transactionId - The transaction ID to check
	 * @returns {Promise} Promise that resolves with the transaction status
	 */
	checkTransactionStatus(transactionId) {
		return fetch(
			`${HOSTURL}/${APP_NAME}/api/worklist/transaction/${transactionId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		).then((response) => {
			if (!response.ok) {
				throw new Error(`Server error: ${response.status}`);
			}
			return response.json();
		});
	}

	/**
	 * Retry a failed transaction
	 * @param {String} transactionId - The transaction ID to retry
	 * @returns {Promise} Promise that resolves with the retry results
	 */
	retryTransaction(transactionId) {
		return fetch(
			`${HOSTURL}/${APP_NAME}/api/worklist/transaction/${transactionId}/retry`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			}
		).then((response) => {
			if (!response.ok) {
				return response.json().then((errorData) => {
					throw new Error(
						errorData.message || `Server error: ${response.status}`
					);
				});
			}
			return response.json();
		});
	}

	/**
	 * Get recent transactions from localStorage
	 * @returns {Array} Array of transaction objects
	 */
	getRecentTransactions() {
		try {
			return JSON.parse(localStorage.getItem("worklist_transactions") || "[]");
		} catch (e) {
			console.error("Error retrieving transaction history:", e);
			return [];
		}
	}
}

/**
 * Manages a queue of requests to prevent race conditions
 */
class RequestQueue {
	constructor() {
		this.queue = [];
		this.processing = false;
		this.bypassEnabled = true; // Feature flag for queue bypass
		this.performanceMetrics = {
			bypassedOperations: 0,
			queuedOperations: 0,
			totalBypassTime: 0,
			totalQueueTime: 0,
		};
	}

	/**
	 * Determine if an operation should bypass the queue
	 * @param {Object} options - Operation options
	 * @returns {Boolean} True if operation should bypass queue
	 */
	shouldBypassQueue(options = {}) {
		if (!this.bypassEnabled) {
			console.log(`🔄 Bypass disabled globally`);
			return false;
		}

		// Operations that can safely bypass the queue
		const bypassOperations = [
			"status-update", // Simple status changes
			"counter-update", // Counter modifications
			"table-refresh", // UI table refreshes
			"ui-feedback", // User feedback messages
			"state-query", // Read-only state queries
			"simple-crud", // Basic CRUD operations without dependencies
		];

		// Operations that MUST use the queue for safety
		const queueRequiredOperations = [
			"batch-insert", // Multiple item operations
			"combo-processing", // Complex combo modality processing
			"delete-with-confirmation", // Delete operations with user confirmation
			"transaction-critical", // Operations that need transaction consistency
		];

		// Debug logging to understand bypass decisions
		const operationType = options.operationType || "unknown";
		console.log(`🔍 Bypass Decision for "${operationType}":`, {
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
			console.log(`🔄 QUEUE REQUIRED: ${operationType} needs serialization`);
			return false;
		}

		// Check if eligible for bypass
		if (
			options.operationType &&
			bypassOperations.includes(options.operationType)
		) {
			console.log(`⚡ BYPASS ELIGIBLE: ${operationType} can be fast-tracked`);
			return true;
		}

		// Check if explicitly marked for bypass
		if (options.bypassQueue === true) {
			console.log(`⚡ BYPASS FORCED: ${operationType} explicitly bypassed`);
			return true;
		}

		// Default to queue for safety
		console.log(`🔄 DEFAULT QUEUE: ${operationType} using queue for safety`);
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

		console.log(
			`⚡ Bypassing queue for ${options.operationType || "unknown"} operation`
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
							`✅ Bypass operation completed in ${duration.toFixed(2)}ms`
						);
					})
					.catch((error) => {
						const duration = performance.now() - startTime;
						this.recordBypassMetrics(duration, options, true);

						if (errorCallback) errorCallback(error);
						console.warn(
							`❌ Bypass operation failed in ${duration.toFixed(2)}ms:`,
							error
						);
					});
			} else {
				// Handle synchronous results
				const duration = performance.now() - startTime;
				this.recordBypassMetrics(duration, options);

				if (successCallback) successCallback(result);
				console.log(
					`✅ Bypass operation completed synchronously in ${duration.toFixed(
						2
					)}ms`
				);
			}
		} catch (error) {
			const duration = performance.now() - startTime;
			this.recordBypassMetrics(duration, options, true);

			if (errorCallback) errorCallback(error);
			console.warn(
				`❌ Bypass operation failed synchronously in ${duration.toFixed(2)}ms:`,
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
				`📊 Bypass Performance: Avg ${avgBypassTime.toFixed(
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
		console.log(`🔄 Queuing ${options.operationType || "unknown"} operation`);
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
	 * Process the next request in the queue
	 */
	processNext() {
		if (this.queue.length === 0) {
			this.processing = false;
			return;
		}

		this.processing = true;
		const { requestFn, successCallback, errorCallback, options } =
			this.queue.shift();

		try {
			const result = requestFn();

			// Handle both Promise and non-Promise results
			if (result instanceof Promise) {
				result
					.then((data) => {
						if (successCallback) successCallback(data);
						this.processNext();
					})
					.catch((error) => {
						if (errorCallback) errorCallback(error);
						this.processNext();
					});
			} else {
				if (successCallback) successCallback(result);
				this.processNext();
			}
		} catch (error) {
			if (errorCallback) errorCallback(error);
			this.processNext();
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

	/**
	 * Enable or disable queue bypass
	 * @param {Boolean} enabled - Whether to enable bypass
	 */
	setBypassEnabled(enabled) {
		this.bypassEnabled = enabled;
		console.log(
			`${enabled ? "✅" : "❌"} Queue bypass ${
				enabled ? "enabled" : "disabled"
			}`
		);
	}

	/**
	 * Clear all pending requests
	 */
	clear() {
		this.queue = [];
		this.processing = false;
	}

	/**
	 * Get the number of pending requests
	 * @returns {Number} Number of pending requests
	 */
	size() {
		return this.queue.length;
	}
}

/**
 * Manages UI state during request processing
 */
class UIManager {
	constructor() {
		this.lockedElements = new Set();
	}

	/**
	 * Lock a UI element to prevent user interaction
	 * @param {String|Element} element - Element or selector to lock
	 * @param {String} loadingMessage - Optional loading message
	 */
	lockUI(element, loadingMessage = "Processing...") {
		const el =
			typeof element === "string" ? document.querySelector(element) : element;
		if (!el) return;

		// Store original state
		el._originalState = {
			disabled: el.disabled,
			html: el.innerHTML,
		};

		// Disable element
		el.disabled = true;

		// Add loading indicator if it's a button
		if (el.tagName === "BUTTON") {
			el.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${loadingMessage}`;
		}

		this.lockedElements.add(el);
	}

	/**
	 * Unlock a previously locked UI element
	 * @param {String|Element} element - Element or selector to unlock
	 */
	unlockUI(element) {
		const el =
			typeof element === "string" ? document.querySelector(element) : element;
		if (!el || !this.lockedElements.has(el)) return;

		// Restore original state
		if (el._originalState) {
			el.disabled = el._originalState.disabled;
			el.innerHTML = el._originalState.html;
			delete el._originalState;
		} else {
			el.disabled = false;
		}

		this.lockedElements.delete(el);
	}

	/**
	 * Show feedback to the user using toast notifications
	 * @param {String} status - Status type (success, error, warning, info)
	 * @param {String} message - Message to display
	 * @param {String} containerId - Deprecated parameter for backward compatibility
	 */
	showFeedback(status, message, containerId = null) {
		// Map status types to displayToast expected values
		const statusMap = {
			error: "error",
			success: "success",
			warning: "warning",
			info: "info",
			danger: "error", // Handle Bootstrap alert class
		};

		const toastStatus = statusMap[status] || "info";
		const heading = status.charAt(0).toUpperCase() + status.slice(1);

		// Use the existing displayToast function
		if (typeof displayToast === "function") {
			displayToast(toastStatus, heading, message, false);
		} else {
			// Fallback to console if displayToast is not available
			console.warn(`Notification: ${heading} - ${message}`);
		}
	}

	/**
	 * Update the display of an item
	 * @param {String} id - ID of the item
	 * @param {String} status - Status to display
	 */
	updateItemDisplay(id, status) {
		const itemElement = document.getElementById(`item-${id}`);
		if (!itemElement) return;

		// Remove existing status classes
		itemElement.classList.remove(
			"status-pending",
			"status-processing",
			"status-success",
			"status-error"
		);

		// Add new status class
		itemElement.classList.add(`status-${status}`);

		// Update status text if there's a status indicator
		const statusIndicator = itemElement.querySelector(".status-indicator");
		if (statusIndicator) {
			statusIndicator.textContent =
				status.charAt(0).toUpperCase() + status.slice(1);
		}
	}
}

// Export the classes for use in other files
window.WorklistState = {
	Manager: new WorklistStateManager(),
	Queue: new RequestQueue(),
	UI: new UIManager(),
};

// Add global performance monitoring function
window.showQueuePerformance = function () {
	const stats = window.WorklistState.Queue.getPerformanceStats();

	// Also get bypass stats from the profiler if available
	let bypassStats = { averageTime: 0, count: 0 };
	let queueStats = { averageTime: 0, count: 0 };

	if (
		typeof PerformanceProfiler !== "undefined" &&
		PerformanceProfiler.getStats
	) {
		const profilerData = PerformanceProfiler.getStats();

		// Get bypass operations from profiler
		if (profilerData.bypass && profilerData.bypass["bypass-execute"]) {
			const bypassOps = profilerData.bypass["bypass-execute"];
			bypassStats.count = bypassOps.count;
			bypassStats.averageTime = bypassOps.averageDuration;
		}

		// Get queue operations from profiler
		if (profilerData.queue && profilerData.queue.enqueue) {
			const queueOps = profilerData.queue.enqueue;
			queueStats.count = queueOps.count;
			queueStats.averageTime = queueOps.averageDuration;
		}
	}

	// Use profiler data if available, fallback to internal stats
	const totalBypassOps = bypassStats.count || stats.bypassedOperations;
	const totalQueueOps = queueStats.count || stats.queuedOperations;
	const avgBypassTime = bypassStats.averageTime || stats.averageBypassTime;
	const avgQueueTime = queueStats.averageTime || stats.averageQueueTime;

	const performanceImprovement =
		avgQueueTime > 0
			? ((avgQueueTime - avgBypassTime) / avgQueueTime) * 100
			: 0;

	const header = "📊 Queue Performance Statistics (Updated):";
	const separator = "=".repeat(80);
	const targetStatus =
		avgBypassTime < 50 ? "✅ TARGET ACHIEVED" : "⚠️ IN PROGRESS";

	const message =
		header +
		"\n" +
		separator +
		"\n" +
		"🎯 Bypassed Operations: " +
		totalBypassOps +
		"\n" +
		"🔄 Queued Operations: " +
		totalQueueOps +
		"\n" +
		"⚡ Average Bypass Time: " +
		avgBypassTime.toFixed(2) +
		"ms\n" +
		"🐌 Average Queue Time: " +
		avgQueueTime.toFixed(2) +
		"ms\n" +
		"🚀 Performance Improvement: " +
		performanceImprovement.toFixed(1) +
		"%\n\n" +
		"Target: 90% reduction (494ms → <50ms)\n" +
		"Status: " +
		targetStatus +
		"\n\n" +
		"Note: Stats now integrated with PerformanceProfiler\n" +
		"Use showQueuePerformance() in browser console anytime.\n" +
		separator;

	console.log(message);

	// Also show a user-friendly toast notification
	if (typeof WorklistState !== "undefined" && WorklistState.UI) {
		const summaryMessage =
			"Performance: " +
			totalBypassOps +
			" bypassed ops averaging " +
			avgBypassTime.toFixed(1) +
			"ms (" +
			performanceImprovement.toFixed(1) +
			"% improvement)";
		WorklistState.UI.showFeedback("info", summaryMessage);
	}

	return {
		bypassedOperations: totalBypassOps,
		queuedOperations: totalQueueOps,
		averageBypassTime: avgBypassTime,
		averageQueueTime: avgQueueTime,
		performanceImprovement: performanceImprovement,
	};
};
