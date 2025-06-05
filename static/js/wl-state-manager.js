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
	 * Clear all processed items
	 */
	clearProcessedItems() {
		this.processedItems.clear();
	}

	/**
	 * Generate a unique ID for an item
	 * @returns {String} Unique ID
	 */
	generateUniqueId() {
		return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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
	}

	/**
	 * Add a request to the queue
	 * @param {Function} requestFn - Function to execute
	 * @param {Function} successCallback - Callback on success
	 * @param {Function} errorCallback - Callback on error
	 */
	enqueue(requestFn, successCallback, errorCallback) {
		this.queue.push({
			requestFn,
			successCallback,
			errorCallback,
		});

		if (!this.processing) {
			this.processNext();
		}
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
		const { requestFn, successCallback, errorCallback } = this.queue.shift();

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
