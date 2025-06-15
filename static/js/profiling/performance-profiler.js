/**
 * Performance Profiler for Worklist/MD View Operations
 *
 * This script instruments the existing codebase to measure performance
 * without modifying the core functionality.
 */

window.PerformanceProfiler = {
	// Storage for performance data - persist in sessionStorage
	metrics: {
		queue: [],
		crudp: [],
		stateManager: [],
		ui: [],
	},

	// Configuration
	config: {
		enabled: true,
		logToConsole: true,
		maxEntries: 1000,
		persistData: true,
		storageKey: "performanceProfilerData",
		debugMode: false,
	},

	// Track initialization to detect resets
	initCount: 0,
	lastInitTime: null,

	// Initialize profiling
	init: function () {
		if (!this.config.enabled) return;

		this.initCount++;
		this.lastInitTime = Date.now();

		// Load existing data if available
		this.loadData();

		// Debug mode logging
		if (this.config.debugMode) {
			console.log(
				`🔍 Performance Profiler init #${
					this.initCount
				} at ${new Date().toLocaleTimeString()}`
			);
			if (this.initCount > 1) {
				console.warn(
					`⚠️ Multiple initializations detected! This might be causing data resets.`
				);
			}
		}

		console.log("🚀 Performance Profiler initialized");
		this.instrumentQueue();
		this.instrumentCrudp();
		this.instrumentStateManager();
		this.instrumentUI();

		// Add keyboard shortcut to view results (Ctrl+Shift+P)
		document.addEventListener("keydown", (e) => {
			if (e.ctrlKey && e.shiftKey && e.key === "P") {
				this.showReport();
			}
		});

		// Detect page refresh/reload events
		this.setupPageEventListeners();

		console.log("📊 Use Ctrl+Shift+P to view performance report");
	},

	// Record a metric
	record: function (category, operation, duration, metadata = {}) {
		if (!this.config.enabled) return;

		const entry = {
			timestamp: Date.now(),
			operation: operation,
			duration: duration,
			metadata: metadata,
		};

		this.metrics[category].push(entry);

		// Limit entries to prevent memory issues
		if (this.metrics[category].length > this.config.maxEntries) {
			this.metrics[category].shift();
		}

		// Auto-save data if persistence is enabled
		if (this.config.persistData) {
			this.saveData();
		}

		if (this.config.logToConsole) {
			console.log(
				`⏱️ ${category}:${operation} - ${duration.toFixed(2)}ms`,
				metadata
			);
		}
	},

	// Load data from storage
	loadData: function () {
		if (!this.config.persistData) return;

		try {
			const stored = sessionStorage.getItem(this.config.storageKey);
			if (stored) {
				const data = JSON.parse(stored);
				if (data.metrics) {
					// Merge stored data with current metrics
					Object.keys(data.metrics).forEach((category) => {
						if (this.metrics[category]) {
							this.metrics[category] = [
								...this.metrics[category],
								...data.metrics[category],
							];
							// Trim to max entries
							if (this.metrics[category].length > this.config.maxEntries) {
								this.metrics[category] = this.metrics[category].slice(
									-this.config.maxEntries
								);
							}
						}
					});

					if (this.config.debugMode) {
						const totalEntries = Object.values(this.metrics).reduce(
							(sum, arr) => sum + arr.length,
							0
						);
						console.log(
							`📥 Loaded ${totalEntries} performance entries from storage`
						);
					}
				}
			}
		} catch (error) {
			console.warn("Failed to load performance data from storage:", error);
		}
	},

	// Save data to storage
	saveData: function () {
		if (!this.config.persistData) return;

		try {
			const data = {
				timestamp: Date.now(),
				initCount: this.initCount,
				lastInitTime: this.lastInitTime,
				metrics: this.metrics,
			};
			sessionStorage.setItem(this.config.storageKey, JSON.stringify(data));
		} catch (error) {
			if (this.config.debugMode) {
				console.warn("Failed to save performance data to storage:", error);
			}
		}
	},

	// Setup page event listeners to detect refreshes
	setupPageEventListeners: function () {
		// Detect beforeunload to save data
		window.addEventListener("beforeunload", () => {
			this.saveData();
			if (this.config.debugMode) {
				console.log("💾 Saved performance data before page unload");
			}
		});

		// Detect page visibility changes (table refreshes might cause this)
		document.addEventListener("visibilitychange", () => {
			if (this.config.debugMode) {
				console.log(
					`👁️ Page visibility changed: ${
						document.hidden ? "hidden" : "visible"
					}`
				);
			}
		});

		// Monitor for table refreshes specifically
		if (typeof $ !== "undefined") {
			$(document).on("refresh.bs.table", (e) => {
				if (this.config.debugMode) {
					console.log("🔄 Bootstrap table refresh detected:", e.target.id);
				}
			});

			$(document).on("post-body.bs.table", (e) => {
				if (this.config.debugMode) {
					console.log("📋 Bootstrap table post-body event:", e.target.id);
				}
			});
		}
	},

	// Instrument the RequestQueue
	instrumentQueue: function () {
		if (typeof WorklistState === "undefined" || !WorklistState.Queue) {
			console.warn(
				"⚠️ WorklistState.Queue not found, skipping queue instrumentation"
			);
			return;
		}

		const originalEnqueue = WorklistState.Queue.enqueue;
		const originalProcessNext = WorklistState.Queue.processNext;

		WorklistState.Queue.enqueue = (
			requestFn,
			successCallback,
			errorCallback
		) => {
			const startTime = performance.now();
			const queueSize = WorklistState.Queue.queue.length;

			return originalEnqueue.call(
				WorklistState.Queue,
				requestFn,
				function (result) {
					const duration = performance.now() - startTime;
					PerformanceProfiler.record("queue", "enqueue", duration, {
						queueSize: queueSize,
						result: result ? "success" : "no-result",
					});
					if (successCallback) successCallback(result);
				},
				function (error) {
					const duration = performance.now() - startTime;
					PerformanceProfiler.record("queue", "enqueue-error", duration, {
						queueSize: queueSize,
						error: error?.message || "unknown",
					});
					if (errorCallback) errorCallback(error);
				}
			);
		};

		WorklistState.Queue.processNext = function () {
			const startTime = performance.now();
			const queueSize = this.queue.length;

			const result = originalProcessNext.call(this);

			const duration = performance.now() - startTime;
			PerformanceProfiler.record("queue", "processNext", duration, {
				queueSize: queueSize,
				processing: this.processing,
			});

			return result;
		};

		console.log("✅ Queue instrumentation complete");
	},

	// Instrument CRUDP operations
	instrumentCrudp: function () {
		if (typeof crudp === "undefined") {
			console.warn(
				"⚠️ crudp function not found, skipping crudp instrumentation"
			);
			return;
		}

		const originalCrudp = window.crudp;

		window.crudp = function (table, id = "0", req = "POST", data) {
			const startTime = performance.now();
			const operation = `${req}-${table}`;

			return originalCrudp(table, id, req, data)
				.then((result) => {
					const duration = performance.now() - startTime;
					PerformanceProfiler.record("crudp", operation, duration, {
						table: table,
						method: req,
						id: id,
						status: result?.status || "unknown",
						hasData: !!data,
					});
					return result;
				})
				.catch((error) => {
					const duration = performance.now() - startTime;
					PerformanceProfiler.record("crudp", `${operation}-error`, duration, {
						table: table,
						method: req,
						id: id,
						error: error?.message || "unknown",
					});
					throw error;
				});
		};

		// Also instrument crudpWithoutToast if it exists
		if (typeof crudpWithoutToast !== "undefined") {
			const originalCrudpWithoutToast = window.crudpWithoutToast;

			window.crudpWithoutToast = function (
				table,
				id = "0",
				req = "POST",
				data
			) {
				const startTime = performance.now();
				const operation = `${req}-${table}-no-toast`;

				return originalCrudpWithoutToast(table, id, req, data)
					.then((result) => {
						const duration = performance.now() - startTime;
						PerformanceProfiler.record("crudp", operation, duration, {
							table: table,
							method: req,
							id: id,
							status: result?.status || "unknown",
							noToast: true,
						});
						return result;
					})
					.catch((error) => {
						const duration = performance.now() - startTime;
						PerformanceProfiler.record(
							"crudp",
							`${operation}-error`,
							duration,
							{
								table: table,
								method: req,
								id: id,
								error: error?.message || "unknown",
							}
						);
						throw error;
					});
			};
		}

		console.log("✅ CRUDP instrumentation complete");
	},

	// Instrument State Manager operations
	instrumentStateManager: function () {
		if (typeof WorklistState === "undefined" || !WorklistState.Manager) {
			console.warn(
				"⚠️ WorklistState.Manager not found, skipping state manager instrumentation"
			);
			return;
		}

		const manager = WorklistState.Manager;
		const operations = [
			"addItem",
			"updateItemStatus",
			"trackProcessingItem",
			"submitBatch",
		];

		operations.forEach((op) => {
			if (typeof manager[op] === "function") {
				const original = manager[op];
				manager[op] = function (...args) {
					const startTime = performance.now();
					const result = original.apply(this, args);
					const duration = performance.now() - startTime;

					PerformanceProfiler.record("stateManager", op, duration, {
						args: args.length,
						pendingItems: this.pendingItems?.size || 0,
						processingItems: this.processingItems?.size || 0,
					});

					return result;
				};
			}
		});

		console.log("✅ State Manager instrumentation complete");
	},

	// Instrument UI operations
	instrumentUI: function () {
		if (typeof WorklistState === "undefined" || !WorklistState.UI) {
			console.warn(
				"⚠️ WorklistState.UI not found, skipping UI instrumentation"
			);
			return;
		}

		const ui = WorklistState.UI;
		const operations = ["lockUI", "unlockUI", "showFeedback"];

		operations.forEach((op) => {
			if (typeof ui[op] === "function") {
				const original = ui[op];
				ui[op] = function (...args) {
					const startTime = performance.now();
					const result = original.apply(this, args);
					const duration = performance.now() - startTime;

					PerformanceProfiler.record("ui", op, duration, {
						args: args.length,
						selector: args[0] || "unknown",
					});

					return result;
				};
			}
		});

		console.log("✅ UI instrumentation complete");
	},

	// Generate performance statistics
	getStats: function (category = null) {
		const categories = category ? [category] : Object.keys(this.metrics);
		const stats = {};

		categories.forEach((cat) => {
			const data = this.metrics[cat];
			if (data.length === 0) {
				stats[cat] = { operations: {}, total: 0 };
				return;
			}

			const operations = {};

			data.forEach((entry) => {
				if (!operations[entry.operation]) {
					operations[entry.operation] = [];
				}
				operations[entry.operation].push(entry.duration);
			});

			// Calculate statistics for each operation
			Object.keys(operations).forEach((op) => {
				const durations = operations[op];
				operations[op] = {
					count: durations.length,
					min: Math.min(...durations),
					max: Math.max(...durations),
					avg: durations.reduce((a, b) => a + b, 0) / durations.length,
					median: this.calculateMedian(durations),
					p95: this.calculatePercentile(durations, 95),
					total: durations.reduce((a, b) => a + b, 0),
				};
			});

			stats[cat] = {
				operations: operations,
				total: data.length,
			};
		});

		return stats;
	},

	// Helper function to calculate median
	calculateMedian: function (arr) {
		const sorted = [...arr].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 !== 0
			? sorted[mid]
			: (sorted[mid - 1] + sorted[mid]) / 2;
	},

	// Helper function to calculate percentile
	calculatePercentile: function (arr, percentile) {
		const sorted = [...arr].sort((a, b) => a - b);
		const index = Math.ceil((percentile / 100) * sorted.length) - 1;
		return sorted[index];
	},

	// Display performance report
	showReport: function () {
		const stats = this.getStats();

		console.group("📊 Performance Report");

		Object.keys(stats).forEach((category) => {
			const categoryStats = stats[category];
			if (categoryStats.total === 0) return;

			console.group(
				`📈 ${category.toUpperCase()} (${categoryStats.total} operations)`
			);

			Object.keys(categoryStats.operations).forEach((op) => {
				const opStats = categoryStats.operations[op];
				console.log(`${op}:`, {
					count: opStats.count,
					avg: `${opStats.avg.toFixed(2)}ms`,
					min: `${opStats.min.toFixed(2)}ms`,
					max: `${opStats.max.toFixed(2)}ms`,
					median: `${opStats.median.toFixed(2)}ms`,
					p95: `${opStats.p95.toFixed(2)}ms`,
				});
			});

			console.groupEnd();
		});

		console.groupEnd();

		// Also create a visual report
		this.createVisualReport(stats);
	},

	// Create a visual HTML report
	createVisualReport: function (stats) {
		const reportWindow = window.open("", "_blank", "width=800,height=600");
		const html = this.generateReportHTML(stats);
		reportWindow.document.write(html);
		reportWindow.document.close();
	},

	// Generate HTML for the report
	generateReportHTML: function (stats) {
		let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Performance Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .category { margin-bottom: 30px; }
                .category h2 { color: #333; border-bottom: 2px solid #007bff; }
                .operation { margin: 10px 0; padding: 10px; background: #f8f9fa; border-left: 4px solid #007bff; }
                .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-top: 10px; }
                .stat { text-align: center; padding: 5px; background: white; border-radius: 4px; }
                .slow { border-left-color: #dc3545; background-color: #f8d7da; }
                .medium { border-left-color: #ffc107; background-color: #fff3cd; }
                .fast { border-left-color: #28a745; background-color: #d4edda; }
            </style>
        </head>
        <body>
            <h1>📊 Performance Report</h1>
            <p>Generated at: ${new Date().toLocaleString()}</p>
        `;

		Object.keys(stats).forEach((category) => {
			const categoryStats = stats[category];
			if (categoryStats.total === 0) return;

			html += `<div class="category">
                <h2>${category.toUpperCase()} (${
				categoryStats.total
			} operations)</h2>`;

			Object.keys(categoryStats.operations).forEach((op) => {
				const opStats = categoryStats.operations[op];
				const avgTime = opStats.avg;
				const performanceClass =
					avgTime > 1000 ? "slow" : avgTime > 100 ? "medium" : "fast";

				html += `<div class="operation ${performanceClass}">
                    <h3>${op}</h3>
                    <div class="stats">
                        <div class="stat"><strong>${
													opStats.count
												}</strong><br>Count</div>
                        <div class="stat"><strong>${opStats.avg.toFixed(
													2
												)}ms</strong><br>Average</div>
                        <div class="stat"><strong>${opStats.min.toFixed(
													2
												)}ms</strong><br>Min</div>
                        <div class="stat"><strong>${opStats.max.toFixed(
													2
												)}ms</strong><br>Max</div>
                        <div class="stat"><strong>${opStats.median.toFixed(
													2
												)}ms</strong><br>Median</div>
                        <div class="stat"><strong>${opStats.p95.toFixed(
													2
												)}ms</strong><br>95th %ile</div>
                    </div>
                </div>`;
			});

			html += "</div>";
		});

		html += `
            <script>
                // Auto-refresh every 30 seconds
                setTimeout(() => window.location.reload(), 30000);
            </script>
        </body>
        </html>
        `;

		return html;
	},

	// Export data for further analysis
	exportData: function () {
		const data = {
			timestamp: Date.now(),
			config: this.config,
			metrics: this.metrics,
			stats: this.getStats(),
		};

		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `performance-data-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	},

	// Clear collected data
	clear: function () {
		Object.keys(this.metrics).forEach((key) => {
			this.metrics[key] = [];
		});
		console.log("🧹 Performance data cleared");
	},

	// Quick start function for testing
	startProfiling: function () {
		this.clear();
		this.init();
		console.log("🎯 Profiling started. Perform your operations now...");
		console.log(
			"📊 Use Ctrl+Shift+P to view results, or call PerformanceProfiler.showReport()"
		);
	},

	// Start profiling with debug mode to identify reset causes
	startDebugging: function () {
		this.config.debugMode = true;
		this.config.logToConsole = true;
		this.startProfiling();
		console.log("🔍 Debug mode enabled! Watch console for reset warnings...");
		console.log("📋 Monitor table refresh events and initialization patterns");

		// Add periodic status reporting
		this.debugInterval = setInterval(() => {
			const totalEntries = Object.values(this.metrics).reduce(
				(sum, arr) => sum + arr.length,
				0
			);
			console.log(
				`📊 Status: ${totalEntries} total entries, init count: ${
					this.initCount
				}, last init: ${new Date(this.lastInitTime).toLocaleTimeString()}`
			);
		}, 30000); // Every 30 seconds
	},

	// Stop debugging mode
	stopDebugging: function () {
		this.config.debugMode = false;
		if (this.debugInterval) {
			clearInterval(this.debugInterval);
			this.debugInterval = null;
		}
		console.log("🔍 Debug mode disabled");
	},

	// Get diagnostic information
	getDiagnostics: function () {
		const totalEntries = Object.values(this.metrics).reduce(
			(sum, arr) => sum + arr.length,
			0
		);
		const diagnostics = {
			initCount: this.initCount,
			lastInitTime: this.lastInitTime
				? new Date(this.lastInitTime).toLocaleString()
				: "Never",
			totalEntries: totalEntries,
			entriesByCategory: Object.fromEntries(
				Object.entries(this.metrics).map(([cat, arr]) => [cat, arr.length])
			),
			persistenceEnabled: this.config.persistData,
			debugMode: this.config.debugMode,
			sessionStorageSize: this.getStorageSize(),
		};

		console.table(diagnostics);
		return diagnostics;
	},

	// Get storage size information
	getStorageSize: function () {
		try {
			const stored = sessionStorage.getItem(this.config.storageKey);
			return stored ? `${Math.round(stored.length / 1024)}KB` : "0KB";
		} catch (error) {
			return "Error reading storage";
		}
	},
};

// Manual initialization to prevent data resets
// Auto-initialization disabled to prevent conflicts with table refreshes
// Use PerformanceProfiler.startProfiling() or PerformanceProfiler.startDebugging() to begin

// Uncomment below ONLY if you want automatic initialization (may cause data resets):
// if (document.readyState === "loading") {
// 	document.addEventListener("DOMContentLoaded", () => {
// 		setTimeout(() => PerformanceProfiler.init(), 1000);
// 	});
// } else {
// 	setTimeout(() => PerformanceProfiler.init(), 1000);
// }
