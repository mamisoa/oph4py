/**
 * MD (Medical Data) State Manager with Performance Optimization
 *
 * Manages state for medical data operations with queue bypass capabilities
 * to achieve the same performance improvements as the worklist system.
 */

class MDStateManager {
	constructor() {
		this.pendingItems = new Map();
		this.processingItems = new Map();
		this.htmlElements = new Map();

		console.log("🏥 MD State Manager initialized");
	}

	/**
	 * Add an item to pending state
	 * @param {Object} item - Item data
	 * @returns {String} Unique identifier
	 */
	addItem(item) {
		const uniqueId = this.generateUniqueId();
		this.pendingItems.set(uniqueId, {
			...item,
			uniqueId: uniqueId,
			timestamp: Date.now(),
			type: item.type || "medical-data",
		});

		console.log(`🏥 MD: Added item ${uniqueId} to pending state`);
		return uniqueId;
	}

	/**
	 * Update item status
	 * @param {String} uniqueId - Item identifier
	 * @param {String} status - New status
	 */
	updateItemStatus(uniqueId, status) {
		if (this.pendingItems.has(uniqueId)) {
			const item = this.pendingItems.get(uniqueId);
			item.status = status;
			item.lastModified = Date.now();
			this.pendingItems.set(uniqueId, item);

			console.log(`🏥 MD: Updated item ${uniqueId} status to ${status}`);
		}
	}

	/**
	 * Track processing item
	 * @param {String} id - Database ID
	 * @param {Object} data - Processing data
	 */
	trackProcessingItem(id, data) {
		this.processingItems.set(id, {
			...data,
			startTime: Date.now(),
			status: "processing",
		});

		console.log(`🏥 MD: Tracking processing item ${id}`);
	}

	/**
	 * Clear processing item
	 * @param {String} id - Database ID
	 */
	clearProcessingItem(id) {
		if (this.processingItems.has(id)) {
			this.processingItems.delete(id);
			console.log(`🏥 MD: Cleared processing item ${id}`);
		}
	}

	/**
	 * Generate unique identifier
	 * @returns {String} Unique ID
	 */
	generateUniqueId() {
		return `md_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Clean up all state maps
	 */
	cleanupState() {
		this.pendingItems.clear();
		this.processingItems.clear();
		this.htmlElements.clear();
		console.log("🏥 MD: State cleaned up");
	}

	/**
	 * Get state statistics
	 * @returns {Object} State statistics
	 */
	getStateStats() {
		return {
			pendingItems: this.pendingItems.size,
			processingItems: this.processingItems.size,
			htmlElements: this.htmlElements.size,
		};
	}
}

/**
 * MD UI Manager for user interface operations
 */
class MDUIManager {
	constructor() {
		this.lockedElements = new Set();
		console.log("🏥 MD UI Manager initialized");
	}

	/**
	 * Lock UI element
	 * @param {String} selector - Element selector
	 */
	lockUI(selector) {
		const element = document.querySelector(selector);
		if (element) {
			element.disabled = true;
			element.classList.add("loading");
			this.lockedElements.add(selector);
			console.log(`🏥 MD: Locked UI element ${selector}`);
		}
	}

	/**
	 * Unlock UI element
	 * @param {String} selector - Element selector
	 */
	unlockUI(selector) {
		const element = document.querySelector(selector);
		if (element) {
			element.disabled = false;
			element.classList.remove("loading");
			this.lockedElements.delete(selector);
			console.log(`🏥 MD: Unlocked UI element ${selector}`);
		}
	}

	/**
	 * Show feedback message (placeholder for MD-specific feedback)
	 * @param {String} type - Message type
	 * @param {String} message - Message content
	 */
	showFeedback(type, message) {
		// MD view might use different feedback mechanism
		console.log(`🏥 MD: ${type.toUpperCase()}: ${message}`);

		// You can integrate with existing MD toast/notification system here
		if (typeof showToast !== "undefined") {
			showToast(message, type);
		}
	}
}

// Initialize MD state management
if (typeof window !== "undefined") {
	// Create universal queue for MD operations
	const mdQueue = new UniversalRequestQueue("MD");

	// Initialize MD state and UI managers
	const mdStateManager = new MDStateManager();
	const mdUIManager = new MDUIManager();

	// Export MD state management objects
	window.MDState = {
		Manager: mdStateManager,
		Queue: mdQueue,
		UI: mdUIManager,
	};

	// Create MD-specific queue function with proper operation type detection
	window.mdCrudp = function (
		table,
		id = "0",
		req = "POST",
		data,
		options = {}
	) {
		// Determine operation type based on table and request
		let operationType = `${req}-${table}`;

		// Override with specific operation types for better classification
		if (options.operationType) {
			operationType = options.operationType;
		} else {
			// Auto-detect operation types for common MD operations
			switch (table) {
				case "mx":
					operationType = "POST-mx";
					break;
				case "allergy":
					operationType = "POST-allergy";
					break;
				case "agent":
					operationType = "POST-agent";
					break;
				case "disease_ref":
					operationType = "POST-disease_ref";
					break;
				case "auth_user":
					operationType = req === "PUT" ? "PUT-patient" : `${req}-${table}`;
					break;
				default:
					operationType = `${req}-${table}`;
			}
		}

		// Set bypass flag for simple operations
		options.operationType = operationType;
		options.bypassQueue = options.bypassQueue !== false; // Default to bypass unless explicitly disabled

		console.log(`🏥 MD: Executing ${operationType} operation`);

		// Use the queue system
		return mdQueue.enqueue(
			() => crudp(table, id, req, data),
			(result) => {
				console.log(`🏥 MD: ${operationType} completed successfully`);
				return result;
			},
			(error) => {
				console.error(`🏥 MD: ${operationType} failed:`, error);
				throw error;
			},
			options
		);
	};

	// Enhanced table refresh function with queue optimization
	window.mdRefreshTable = function (
		tableSelector,
		operationType = "table-refresh"
	) {
		console.log(`🏥 MD: Refreshing table ${tableSelector}`);

		return mdQueue.enqueue(
			() => {
				const table = $(tableSelector);
				if (table.length && table.bootstrapTable) {
					table.bootstrapTable("refresh");
					return true;
				}
				return false;
			},
			(result) => {
				console.log(`🏥 MD: Table ${tableSelector} refreshed successfully`);
			},
			(error) => {
				console.error(`🏥 MD: Table ${tableSelector} refresh failed:`, error);
			},
			{
				operationType: operationType,
				bypassQueue: true, // Table refreshes should always bypass
			}
		);
	};

	// MD-specific performance monitoring function
	window.showMDPerformance = function () {
		const stats = mdQueue.getPerformanceStats();

		// Also get profiler data if available
		let profilerData = {};
		if (
			typeof PerformanceProfiler !== "undefined" &&
			PerformanceProfiler.getStats
		) {
			profilerData = PerformanceProfiler.getStats();
		}

		const header = "🏥 MD View Performance Statistics:";
		const separator = "=".repeat(60);
		const targetStatus =
			stats.averageBypassTime < 50 ? "✅ TARGET ACHIEVED" : "⚠️ IN PROGRESS";

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
			"Target: <50ms for bypassed operations\n" +
			"Status: " +
			targetStatus +
			"\n" +
			separator;

		console.log(message);

		// Show user-friendly feedback
		if (window.MDState && window.MDState.UI) {
			const summaryMessage = `MD Performance: ${
				stats.bypassedOperations
			} bypassed ops averaging ${stats.averageBypassTime.toFixed(
				1
			)}ms (${stats.performanceImprovement.toFixed(1)}% improvement)`;
			window.MDState.UI.showFeedback("info", summaryMessage);
		}

		return stats;
	};

	console.log(
		"🏥 MD State management initialized with performance optimization"
	);
	console.log(
		"🎯 Use showMDPerformance() to view MD-specific performance metrics"
	);
	console.log("🎯 Use mdCrudp() instead of crudp() for optimized operations");
	console.log("🎯 Use mdRefreshTable() for optimized table refreshes");
}
