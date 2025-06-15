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
		captureConsoleLogs: true,
		maxConsoleEntries: 500,
		viewType: "Unknown", // Will be set by each view (Worklist, MD, DailyTransactions, etc.)
		trackViewSpecificOperations: true,
	},

	// Track initialization to detect resets
	initCount: 0,
	lastInitTime: null,
	consoleLogs: [],

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

		// Setup console log capturing
		if (this.config.captureConsoleLogs) {
			this.setupConsoleCapture();
		}

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

		// Add view type to metadata
		if (this.config.trackViewSpecificOperations) {
			entry.metadata.viewType = this.config.viewType;
			entry.metadata.pageUrl = window.location.pathname;
		}

		// Auto-save data if persistence is enabled
		if (this.config.persistData) {
			this.saveData();
		}

		if (this.config.logToConsole) {
			console.log(
				`⏱️ [${
					this.config.viewType
				}] ${category}:${operation} - ${duration.toFixed(2)}ms`,
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

					// Load console logs if available
					if (data.consoleLogs && Array.isArray(data.consoleLogs)) {
						this.consoleLogs = [...this.consoleLogs, ...data.consoleLogs];
						// Trim to max entries
						if (this.consoleLogs.length > this.config.maxConsoleEntries) {
							this.consoleLogs = this.consoleLogs.slice(
								-this.config.maxConsoleEntries
							);
						}
					}

					if (this.config.debugMode) {
						const totalEntries = Object.values(this.metrics).reduce(
							(sum, arr) => sum + arr.length,
							0
						);
						console.log(
							`📥 Loaded ${totalEntries} performance entries and ${this.consoleLogs.length} console logs from storage`
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
				consoleLogs: this.consoleLogs,
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

	// Setup console log capturing
	setupConsoleCapture: function () {
		const originalConsole = {
			log: console.log,
			warn: console.warn,
			error: console.error,
			info: console.info,
		};

		const captureLog = (level, originalMethod) => {
			return function (...args) {
				// Call original method first
				originalMethod.apply(console, args);

				// Capture the log entry
				if (PerformanceProfiler.config.captureConsoleLogs) {
					const logEntry = {
						timestamp: Date.now(),
						level: level,
						message: args
							.map((arg) =>
								typeof arg === "object" ? JSON.stringify(arg) : String(arg)
							)
							.join(" "),
						stack: level === "error" ? new Error().stack : null,
					};

					PerformanceProfiler.consoleLogs.push(logEntry);

					// Limit console log entries
					if (
						PerformanceProfiler.consoleLogs.length >
						PerformanceProfiler.config.maxConsoleEntries
					) {
						PerformanceProfiler.consoleLogs.shift();
					}
				}
			};
		};

		// Override console methods
		console.log = captureLog("log", originalConsole.log);
		console.warn = captureLog("warn", originalConsole.warn);
		console.error = captureLog("error", originalConsole.error);
		console.info = captureLog("info", originalConsole.info);

		// Store original methods for potential restoration
		this.originalConsole = originalConsole;

		if (this.config.debugMode) {
			console.log("📝 Console log capturing enabled");
		}
	},

	// Instrument the RequestQueue (view-aware)
	instrumentQueue: function () {
		// Check for different view types and their queue systems
		let queueState = null;
		let viewName = "Unknown";

		if (typeof WorklistState !== "undefined" && WorklistState.Queue) {
			queueState = WorklistState.Queue;
			viewName = "Worklist";
		} else if (typeof PaymentState !== "undefined" && PaymentState.Queue) {
			queueState = PaymentState.Queue;
			viewName = "Payment";
		} else if (
			typeof window.PaymentState !== "undefined" &&
			window.PaymentState.Queue
		) {
			queueState = window.PaymentState.Queue;
			viewName = "Payment";
		} else if (typeof MDState !== "undefined" && MDState.Queue) {
			queueState = MDState.Queue;
			viewName = "MD";
		} else if (
			typeof TransactionState !== "undefined" &&
			TransactionState.Queue
		) {
			queueState = TransactionState.Queue;
			viewName = "Transaction";
		}

		if (!queueState) {
			console.warn(
				`⚠️ No queue found for ${this.config.viewType} view, skipping queue instrumentation`
			);
			return;
		}

		console.log(`✅ Found ${viewName} queue system, instrumenting...`);
		const originalEnqueue = queueState.enqueue;
		const originalProcessNext = queueState.processNext;

		// Fix: Forward ALL parameters including the options parameter
		queueState.enqueue = function (
			requestFn,
			successCallback,
			errorCallback,
			options = {} // <- Add the missing options parameter
		) {
			const startTime = performance.now();
			const queueSize = this.queue.length;
			const operationType = options.operationType || "unknown";

			// Check if operation will be bypassed for accurate tracking
			const willBypass =
				this.shouldBypassQueue && this.shouldBypassQueue(options);
			const trackingCategory = willBypass ? "bypass" : "queue";
			const trackingOperation = willBypass ? "bypass-execute" : "enqueue";

			// Enhanced callback wrapper that ensures original callback is always called
			const wrappedSuccessCallback = successCallback
				? function (result) {
						console.log(
							`🎯 Profiler: Success callback for ${operationType} (bypassed: ${willBypass})`
						);
						try {
							const duration = performance.now() - startTime;
							PerformanceProfiler.record(
								trackingCategory,
								trackingOperation,
								duration,
								{
									queueSize: queueSize,
									operationType: operationType,
									result: result ? "success" : "no-result",
									bypassed: willBypass,
								}
							);
						} catch (profilerError) {
							console.warn("⚠️ Profiler recording error:", profilerError);
						}

						// ALWAYS call the original callback
						console.log(
							`📞 Profiler: Calling original success callback for ${operationType}`
						);
						successCallback(result);
				  }
				: null;

			const wrappedErrorCallback = errorCallback
				? function (error) {
						try {
							const duration = performance.now() - startTime;
							PerformanceProfiler.record(
								trackingCategory,
								`${trackingOperation}-error`,
								duration,
								{
									queueSize: queueSize,
									operationType: operationType,
									error: error?.message || "unknown",
									bypassed: willBypass,
								}
							);
						} catch (profilerError) {
							console.warn("⚠️ Profiler recording error:", profilerError);
						}

						// ALWAYS call the original callback
						errorCallback(error);
				  }
				: null;

			// Forward ALL parameters to the original method
			return originalEnqueue.call(
				this, // Use proper 'this' context
				requestFn,
				wrappedSuccessCallback,
				wrappedErrorCallback,
				options // <- Forward the options parameter!
			);
		};

		queueState.processNext = function () {
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

		console.log("✅ Queue instrumentation complete (with bypass support)");
	},

	// Instrument CRUDP operations (safe mode for Payment view)
	instrumentCrudp: function () {
		if (typeof crudp === "undefined") {
			console.warn(
				"⚠️ crudp function not found, skipping crudp instrumentation"
			);
			return;
		}

		// Skip CRUDP instrumentation for Payment view to avoid interfering with payment operations
		if (this.config.viewType === "Payment") {
			console.log(
				"ℹ️ Skipping CRUDP instrumentation for Payment view to avoid interference"
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

	// Instrument State Manager operations (view-aware)
	instrumentStateManager: function () {
		// Check for different view types and their state managers
		let stateManager = null;
		let viewName = "Unknown";

		if (typeof WorklistState !== "undefined" && WorklistState.Manager) {
			stateManager = WorklistState.Manager;
			viewName = "Worklist";
		} else if (typeof PaymentState !== "undefined" && PaymentState.Manager) {
			stateManager = PaymentState.Manager;
			viewName = "Payment";
		} else if (
			typeof window.PaymentState !== "undefined" &&
			window.PaymentState.Manager
		) {
			stateManager = window.PaymentState.Manager;
			viewName = "Payment";
		} else if (typeof MDState !== "undefined" && MDState.Manager) {
			stateManager = MDState.Manager;
			viewName = "MD";
		} else if (
			typeof TransactionState !== "undefined" &&
			TransactionState.Manager
		) {
			stateManager = TransactionState.Manager;
			viewName = "Transaction";
		}

		if (!stateManager) {
			console.warn(
				`⚠️ No state manager found for ${this.config.viewType} view, skipping state manager instrumentation`
			);
			return;
		}

		console.log(`✅ Found ${viewName} state manager, instrumenting...`);
		const manager = stateManager;
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

	// Instrument UI operations (view-aware)
	instrumentUI: function () {
		// Check for different view types and their UI managers
		let uiManager = null;
		let viewName = "Unknown";

		if (typeof WorklistState !== "undefined" && WorklistState.UI) {
			uiManager = WorklistState.UI;
			viewName = "Worklist";
		} else if (typeof PaymentState !== "undefined" && PaymentState.UI) {
			uiManager = PaymentState.UI;
			viewName = "Payment";
		} else if (
			typeof window.PaymentState !== "undefined" &&
			window.PaymentState.UI
		) {
			uiManager = window.PaymentState.UI;
			viewName = "Payment";
		} else if (typeof MDState !== "undefined" && MDState.UI) {
			uiManager = MDState.UI;
			viewName = "MD";
		} else if (typeof TransactionState !== "undefined" && TransactionState.UI) {
			uiManager = TransactionState.UI;
			viewName = "Transaction";
		}

		if (!uiManager) {
			console.warn(
				`⚠️ No UI manager found for ${this.config.viewType} view, skipping UI instrumentation`
			);
			return;
		}

		console.log(`✅ Found ${viewName} UI manager, instrumenting...`);
		const ui = uiManager;
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
            <div style="margin: 20px 0; text-align: center;">
                <button onclick="exportCompleteReport()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    💾 Export Complete Report & Logs
                </button>
                <button onclick="exportPerformanceOnly()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    📊 Export Performance Only
                </button>
            </div>
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
                // Export functions
                function exportCompleteReport() {
                    if (window.opener && window.opener.PerformanceProfiler) {
                        window.opener.PerformanceProfiler.exportCompleteReport();
                    } else {
                        alert('Unable to access parent window. Use the console method instead.');
                    }
                }
                
                function exportPerformanceOnly() {
                    if (window.opener && window.opener.PerformanceProfiler) {
                        window.opener.PerformanceProfiler.exportData();
                    } else {
                        alert('Unable to access parent window. Use the console method instead.');
                    }
                }
                
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

	// Export complete report including performance data and console logs
	exportCompleteReport: function () {
		const timestamp = Date.now();
		const dateStr = new Date(timestamp)
			.toISOString()
			.slice(0, 19)
			.replace(/:/g, "-");

		const data = {
			exportInfo: {
				timestamp: timestamp,
				dateGenerated: new Date(timestamp).toLocaleString(),
				version: "1.0",
				description: "Complete performance report with console logs",
			},
			systemInfo: {
				userAgent: navigator.userAgent,
				url: window.location.href,
				timestamp: timestamp,
				initCount: this.initCount,
				lastInitTime: this.lastInitTime,
				sessionStorageSize: this.getStorageSize(),
			},
			config: this.config,
			performance: {
				metrics: this.metrics,
				stats: this.getStats(),
				summary: this.generateSummary(),
			},
			consoleLogs: {
				total: this.consoleLogs.length,
				logs: this.consoleLogs,
				recentLogs: this.consoleLogs.slice(-50), // Last 50 logs for quick review
				errorLogs: this.consoleLogs.filter((log) => log.level === "error"),
				warningLogs: this.consoleLogs.filter((log) => log.level === "warn"),
			},
			diagnostics: this.getDiagnostics(),
		};

		// Create comprehensive report
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `complete-performance-report-${dateStr}.json`;
		a.click();
		URL.revokeObjectURL(url);

		// Also create a readable text summary
		const textSummary = this.generateTextReport(data);
		const textBlob = new Blob([textSummary], { type: "text/plain" });
		const textUrl = URL.createObjectURL(textBlob);
		const textA = document.createElement("a");
		textA.href = textUrl;
		textA.download = `performance-summary-${dateStr}.txt`;
		textA.click();
		URL.revokeObjectURL(textUrl);

		console.log("📁 Complete report exported:", {
			jsonFile: `complete-performance-report-${dateStr}.json`,
			textFile: `performance-summary-${dateStr}.txt`,
			totalMetrics: Object.values(this.metrics).reduce(
				(sum, arr) => sum + arr.length,
				0
			),
			totalConsoleLogs: this.consoleLogs.length,
		});
	},

	// Generate performance summary
	generateSummary: function () {
		const stats = this.getStats();
		const summary = {
			totalOperations: Object.values(this.metrics).reduce(
				(sum, arr) => sum + arr.length,
				0
			),
			categoriesWithData: Object.keys(stats).filter(
				(cat) => stats[cat].total > 0
			),
			slowestOperations: [],
			fastestOperations: [],
			averageResponseTimes: {},
			viewBreakdown: this.getViewBreakdown(),
			currentView: this.config.viewType,
		};

		// Find slowest and fastest operations
		Object.keys(stats).forEach((category) => {
			const operations = stats[category].operations;
			Object.keys(operations).forEach((op) => {
				const opStats = operations[op];
				summary.slowestOperations.push({
					operation: `${category}:${op}`,
					avgTime: opStats.avg,
					maxTime: opStats.max,
					count: opStats.count,
				});
				summary.averageResponseTimes[`${category}:${op}`] = opStats.avg;
			});
		});

		// Sort by average time
		summary.slowestOperations.sort((a, b) => b.avgTime - a.avgTime);
		summary.fastestOperations = [...summary.slowestOperations].reverse();

		// Keep top 10 of each
		summary.slowestOperations = summary.slowestOperations.slice(0, 10);
		summary.fastestOperations = summary.fastestOperations.slice(0, 10);

		return summary;
	},

	// Get performance breakdown by view type
	getViewBreakdown: function () {
		const breakdown = {};

		Object.values(this.metrics).forEach((categoryMetrics) => {
			categoryMetrics.forEach((entry) => {
				const viewType = entry.metadata?.viewType || "Unknown";
				if (!breakdown[viewType]) {
					breakdown[viewType] = {
						count: 0,
						totalDuration: 0,
						avgDuration: 0,
						operations: {},
					};
				}

				breakdown[viewType].count++;
				breakdown[viewType].totalDuration += entry.duration;

				if (!breakdown[viewType].operations[entry.operation]) {
					breakdown[viewType].operations[entry.operation] = 0;
				}
				breakdown[viewType].operations[entry.operation]++;
			});
		});

		// Calculate averages
		Object.keys(breakdown).forEach((viewType) => {
			if (breakdown[viewType].count > 0) {
				breakdown[viewType].avgDuration =
					breakdown[viewType].totalDuration / breakdown[viewType].count;
			}
		});

		return breakdown;
	},

	// Generate readable text report
	generateTextReport: function (data) {
		const d = data;
		let report = "";

		report += "=".repeat(60) + "\n";
		report += "           PERFORMANCE ANALYSIS REPORT\n";
		report += "=".repeat(60) + "\n";
		report += `Generated: ${d.exportInfo.dateGenerated}\n`;
		report += `URL: ${d.systemInfo.url}\n`;
		report += `User Agent: ${d.systemInfo.userAgent}\n\n`;

		// Performance Summary
		report += "PERFORMANCE SUMMARY\n";
		report += "-".repeat(30) + "\n";
		report += `Current View: ${d.performance.summary.currentView}\n`;
		report += `Total Operations: ${d.performance.summary.totalOperations}\n`;
		report += `Categories with Data: ${d.performance.summary.categoriesWithData.join(
			", "
		)}\n`;
		report += `Console Logs Captured: ${d.consoleLogs.total}\n`;
		report += `Errors: ${d.consoleLogs.errorLogs.length}\n`;
		report += `Warnings: ${d.consoleLogs.warningLogs.length}\n\n`;

		// View Breakdown
		if (
			d.performance.summary.viewBreakdown &&
			Object.keys(d.performance.summary.viewBreakdown).length > 0
		) {
			report += "PERFORMANCE BY VIEW\n";
			report += "-".repeat(30) + "\n";
			Object.entries(d.performance.summary.viewBreakdown).forEach(
				([viewType, data]) => {
					report += `${viewType}:\n`;
					report += `  Operations: ${data.count}\n`;
					report += `  Avg Duration: ${data.avgDuration.toFixed(2)}ms\n`;
					report += `  Total Duration: ${data.totalDuration.toFixed(2)}ms\n`;
					const topOps = Object.entries(data.operations)
						.sort(([, a], [, b]) => b - a)
						.slice(0, 3)
						.map(([op, count]) => `${op}(${count})`)
						.join(", ");
					report += `  Top Operations: ${topOps}\n\n`;
				}
			);
		}

		// Slowest Operations
		if (d.performance.summary.slowestOperations.length > 0) {
			report += "SLOWEST OPERATIONS\n";
			report += "-".repeat(30) + "\n";
			d.performance.summary.slowestOperations.forEach((op, i) => {
				report += `${i + 1}. ${op.operation}\n`;
				report += `   Average: ${op.avgTime.toFixed(2)}ms\n`;
				report += `   Max: ${op.maxTime.toFixed(2)}ms\n`;
				report += `   Count: ${op.count}\n\n`;
			});
		}

		// Recent Errors
		if (d.consoleLogs.errorLogs.length > 0) {
			report += "RECENT ERRORS\n";
			report += "-".repeat(30) + "\n";
			d.consoleLogs.errorLogs.slice(-10).forEach((log, i) => {
				report += `${i + 1}. [${new Date(log.timestamp).toLocaleString()}] ${
					log.message
				}\n`;
			});
			report += "\n";
		}

		// Recent Warnings
		if (d.consoleLogs.warningLogs.length > 0) {
			report += "RECENT WARNINGS\n";
			report += "-".repeat(30) + "\n";
			d.consoleLogs.warningLogs.slice(-10).forEach((log, i) => {
				report += `${i + 1}. [${new Date(log.timestamp).toLocaleString()}] ${
					log.message
				}\n`;
			});
			report += "\n";
		}

		// Diagnostics
		report += "SYSTEM DIAGNOSTICS\n";
		report += "-".repeat(30) + "\n";
		Object.entries(d.diagnostics).forEach(([key, value]) => {
			report += `${key}: ${value}\n`;
		});

		return report;
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
