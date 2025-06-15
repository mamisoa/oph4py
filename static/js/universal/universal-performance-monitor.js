/**
 * Universal Performance Monitor
 *
 * Provides unified performance monitoring across all views (Worklist, MD, Transactions)
 * Consolidates queue performance data and provides comprehensive analytics.
 */

window.UniversalPerformanceMonitor = {
	/**
	 * Get all available queue systems
	 * @returns {Array} Array of queue objects with metadata
	 */
	getAllQueues: function () {
		const queues = [];

		// Worklist Queue
		if (typeof WorklistState !== "undefined" && WorklistState.Queue) {
			queues.push({
				name: "Worklist",
				queue: WorklistState.Queue,
				icon: "📋",
				manager: WorklistState.Manager,
				ui: WorklistState.UI,
			});
		}

		// MD Queue
		if (typeof MDState !== "undefined" && MDState.Queue) {
			queues.push({
				name: "MD",
				queue: MDState.Queue,
				icon: "🏥",
				manager: MDState.Manager,
				ui: MDState.UI,
			});
		}

		// Transaction Queue
		if (typeof TransactionState !== "undefined" && TransactionState.Queue) {
			queues.push({
				name: "Transaction",
				queue: TransactionState.Queue,
				icon: "💰",
				manager: TransactionState.Manager,
				ui: TransactionState.UI,
			});
		}

		return queues;
	},

	/**
	 * Get consolidated performance statistics across all views
	 * @returns {Object} Consolidated performance data
	 */
	getConsolidatedStats: function () {
		const queues = this.getAllQueues();
		const consolidated = {
			summary: {
				totalBypassedOperations: 0,
				totalQueuedOperations: 0,
				totalBypassTime: 0,
				totalQueueTime: 0,
				averageBypassTime: 0,
				averageQueueTime: 0,
				overallImprovement: 0,
				activeViews: queues.length,
			},
			byView: {},
			topPerformers: [],
			needsAttention: [],
		};

		// Collect stats from each queue
		queues.forEach(({ name, queue, icon }) => {
			const stats = queue.getPerformanceStats();

			consolidated.byView[name] = {
				...stats,
				icon: icon,
			};

			// Add to totals
			consolidated.summary.totalBypassedOperations += stats.bypassedOperations;
			consolidated.summary.totalQueuedOperations += stats.queuedOperations;
			consolidated.summary.totalBypassTime +=
				stats.totalBypassTime ||
				stats.averageBypassTime * stats.bypassedOperations;
			consolidated.summary.totalQueueTime +=
				stats.totalQueueTime || stats.averageQueueTime * stats.queuedOperations;

			// Identify top performers and views needing attention
			if (stats.bypassedOperations > 0) {
				if (stats.averageBypassTime < 50) {
					consolidated.topPerformers.push({ name, stats, icon });
				} else if (stats.averageBypassTime > 100) {
					consolidated.needsAttention.push({ name, stats, icon });
				}
			}
		});

		// Calculate overall averages
		if (consolidated.summary.totalBypassedOperations > 0) {
			consolidated.summary.averageBypassTime =
				consolidated.summary.totalBypassTime /
				consolidated.summary.totalBypassedOperations;
		}
		if (consolidated.summary.totalQueuedOperations > 0) {
			consolidated.summary.averageQueueTime =
				consolidated.summary.totalQueueTime /
				consolidated.summary.totalQueuedOperations;
		}

		// Calculate overall improvement
		if (consolidated.summary.averageQueueTime > 0) {
			consolidated.summary.overallImprovement =
				((consolidated.summary.averageQueueTime -
					consolidated.summary.averageBypassTime) /
					consolidated.summary.averageQueueTime) *
				100;
		}

		return consolidated;
	},

	/**
	 * Enhanced showQueuePerformance function that works across all views
	 * @param {String} specificView - Optional: show only specific view ('Worklist', 'MD', 'Transaction')
	 * @returns {Object} Performance statistics
	 */
	showQueuePerformance: function (specificView = null) {
		const consolidated = this.getConsolidatedStats();

		if (specificView && consolidated.byView[specificView]) {
			// Show specific view performance
			const viewStats = consolidated.byView[specificView];
			const header = `${viewStats.icon} ${specificView} Performance Statistics:`;
			const separator = "=".repeat(Math.max(60, header.length));
			const targetStatus =
				viewStats.averageBypassTime < 50
					? "✅ TARGET ACHIEVED"
					: "⚠️ IN PROGRESS";

			const message =
				header +
				"\n" +
				separator +
				"\n" +
				"🎯 Bypassed Operations: " +
				viewStats.bypassedOperations +
				"\n" +
				"🔄 Queued Operations: " +
				viewStats.queuedOperations +
				"\n" +
				"⚡ Average Bypass Time: " +
				viewStats.averageBypassTime.toFixed(2) +
				"ms\n" +
				"🐌 Average Queue Time: " +
				viewStats.averageQueueTime.toFixed(2) +
				"ms\n" +
				"🚀 Performance Improvement: " +
				viewStats.performanceImprovement.toFixed(1) +
				"%\n\n" +
				"Target: <50ms for bypassed operations\n" +
				"Status: " +
				targetStatus +
				"\n" +
				separator;

			console.log(message);
			return viewStats;
		} else {
			// Show consolidated performance across all views
			const header = "🚀 Universal Queue Performance Statistics (All Views):";
			const separator = "=".repeat(80);
			const overallStatus =
				consolidated.summary.averageBypassTime < 50
					? "✅ EXCELLENT"
					: "⚠️ OPTIMIZING";

			let message =
				header +
				"\n" +
				separator +
				"\n" +
				"📊 OVERALL PERFORMANCE:\n" +
				"Active Views: " +
				consolidated.summary.activeViews +
				"\n" +
				"Total Bypassed Operations: " +
				consolidated.summary.totalBypassedOperations +
				"\n" +
				"Total Queued Operations: " +
				consolidated.summary.totalQueuedOperations +
				"\n" +
				"Average Bypass Time: " +
				consolidated.summary.averageBypassTime.toFixed(2) +
				"ms\n" +
				"Average Queue Time: " +
				consolidated.summary.averageQueueTime.toFixed(2) +
				"ms\n" +
				"Overall Performance Improvement: " +
				consolidated.summary.overallImprovement.toFixed(1) +
				"%\n\n" +
				"Status: " +
				overallStatus +
				"\n\n";

			// Add breakdown by view
			message += "📋 PERFORMANCE BY VIEW:\n";
			message += "─".repeat(50) + "\n";
			Object.entries(consolidated.byView).forEach(([viewName, stats]) => {
				const efficiency =
					stats.bypassedOperations > 0
						? (
								(stats.bypassedOperations /
									(stats.bypassedOperations + stats.queuedOperations)) *
								100
						  ).toFixed(1)
						: 0;
				message += `${stats.icon} ${viewName}: ${
					stats.bypassedOperations
				} bypass ops (${efficiency}% efficiency) - Avg: ${stats.averageBypassTime.toFixed(
					1
				)}ms\n`;
			});

			// Add top performers
			if (consolidated.topPerformers.length > 0) {
				message += "\n🏆 TOP PERFORMERS (< 50ms average):\n";
				consolidated.topPerformers.forEach(({ name, stats, icon }) => {
					message += `${icon} ${name}: ${stats.averageBypassTime.toFixed(
						1
					)}ms average\n`;
				});
			}

			// Add views needing attention
			if (consolidated.needsAttention.length > 0) {
				message += "\n⚠️ NEEDS OPTIMIZATION (> 100ms average):\n";
				consolidated.needsAttention.forEach(({ name, stats, icon }) => {
					message += `${icon} ${name}: ${stats.averageBypassTime.toFixed(
						1
					)}ms average - Consider optimization\n`;
				});
			}

			message += "\n" + separator + "\n";
			message +=
				"💡 Use showQueuePerformance('ViewName') for specific view details\n";
			message +=
				"💡 Available views: " +
				Object.keys(consolidated.byView).join(", ") +
				"\n";
			message += separator;

			console.log(message);
			return consolidated;
		}
	},

	/**
	 * Export comprehensive performance report
	 * @returns {String} Formatted report
	 */
	exportPerformanceReport: function () {
		const consolidated = this.getConsolidatedStats();
		const timestamp = new Date().toISOString();

		let report = `UNIVERSAL QUEUE PERFORMANCE REPORT\n`;
		report += `Generated: ${timestamp}\n`;
		report += `=`.repeat(80) + "\n\n";

		// Executive Summary
		report += `EXECUTIVE SUMMARY:\n`;
		report += `- Active Views: ${consolidated.summary.activeViews}\n`;
		report += `- Total Operations: ${
			consolidated.summary.totalBypassedOperations +
			consolidated.summary.totalQueuedOperations
		}\n`;
		report += `- Bypass Efficiency: ${(
			(consolidated.summary.totalBypassedOperations /
				(consolidated.summary.totalBypassedOperations +
					consolidated.summary.totalQueuedOperations)) *
			100
		).toFixed(1)}%\n`;
		report += `- Performance Improvement: ${consolidated.summary.overallImprovement.toFixed(
			1
		)}%\n\n`;

		// Detailed breakdown
		report += `DETAILED BREAKDOWN BY VIEW:\n`;
		report += `-`.repeat(50) + "\n";
		Object.entries(consolidated.byView).forEach(([viewName, stats]) => {
			report += `\n${viewName.toUpperCase()} VIEW:\n`;
			report += `  Bypassed Operations: ${stats.bypassedOperations}\n`;
			report += `  Queued Operations: ${stats.queuedOperations}\n`;
			report += `  Average Bypass Time: ${stats.averageBypassTime.toFixed(
				2
			)}ms\n`;
			report += `  Average Queue Time: ${stats.averageQueueTime.toFixed(
				2
			)}ms\n`;
			report += `  Performance Improvement: ${stats.performanceImprovement.toFixed(
				1
			)}%\n`;
		});

		console.log("📄 Performance report generated");
		return report;
	},

	/**
	 * Start monitoring all views (enhanced initialization)
	 */
	initializeMonitoring: function () {
		const queues = this.getAllQueues();

		console.log(`🚀 Universal Performance Monitor initialized`);
		console.log(
			`📊 Monitoring ${queues.length} view(s): ${queues
				.map((q) => q.icon + q.name)
				.join(", ")}`
		);

		console.log(
			"🎯 Use showQueuePerformance() for consolidated performance stats"
		);
		console.log(
			'🎯 Use showQueuePerformance("ViewName") for specific view details'
		);
		console.log(
			"🎯 Use UniversalPerformanceMonitor.exportPerformanceReport() for detailed reports"
		);
	},
};

// Replace the global showQueuePerformance function with the universal one
window.showQueuePerformance = function (specificView = null) {
	return window.UniversalPerformanceMonitor.showQueuePerformance(specificView);
};

// Auto-initialize when loaded
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		setTimeout(
			() => window.UniversalPerformanceMonitor.initializeMonitoring(),
			1000
		);
	});
} else {
	setTimeout(
		() => window.UniversalPerformanceMonitor.initializeMonitoring(),
		1000
	);
}
