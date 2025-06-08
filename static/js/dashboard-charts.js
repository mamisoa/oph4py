/**
 * Dashboard Charts Manager
 * Handles Chart.js charts for new patients and worklists data
 */

class DashboardCharts {
	constructor() {
		this.charts = {};
		this.currentPeriods = {
			patients: 6, // Default to 6 months
			worklists: 6,
			md_worklists: 6,
		};
		this.colors = {
			patients: {
				border: "rgb(75, 192, 192)",
				background: "rgba(75, 192, 192, 0.2)",
				movingAvg: "rgb(23, 87, 118)", // Darker blue for better visibility
			},
			worklists: {
				border: "rgb(255, 99, 132)",
				background: "rgba(255, 99, 132, 0.2)",
				movingAvg: "rgb(185, 24, 63)", // Darker red for better visibility
			},
			md_worklists: {
				border: "rgb(255, 193, 7)",
				background: "rgba(255, 193, 7, 0.2)",
				movingAvg: "rgb(204, 102, 0)", // Darker amber for better visibility
			},
		};

		this.init();
	}

	init() {
		// Initialize charts when DOM is ready
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => this.initCharts());
		} else {
			this.initCharts();
		}
	}

	initCharts() {
		// Initialize all charts
		this.initChart("patients");
		this.initChart("worklists");
		this.initChart("md_worklists");

		// Setup period selectors
		this.setupPeriodSelectors();

		// Load initial data
		this.loadChartData("patients", this.currentPeriods.patients);
		this.loadChartData("worklists", this.currentPeriods.worklists);
		this.loadChartData("md_worklists", this.currentPeriods.md_worklists);
	}

	initChart(chartType) {
		const canvasId = `${chartType}Chart`;
		const canvas = document.getElementById(canvasId);

		if (!canvas) {
			console.warn(`Canvas element ${canvasId} not found`);
			return;
		}

		const ctx = canvas.getContext("2d");

		this.charts[chartType] = new Chart(ctx, {
			type: "line",
			data: {
				labels: [],
				datasets: [
					{
						label: `New ${this.formatChartLabel(chartType)}`,
						data: [],
						borderColor: this.colors[chartType].border,
						backgroundColor: this.colors[chartType].background,
						borderWidth: 2,
						fill: true,
						tension: 0.1,
					},
					{
						label: "Moving Average",
						data: [],
						borderColor: this.colors[chartType].movingAvg,
						backgroundColor: "transparent",
						borderWidth: 3,
						fill: false,
						tension: 0.4,
						pointRadius: 0,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: true,
						text: `New ${this.formatChartLabel(chartType)} Over Time`,
						font: {
							size: 16,
							weight: "bold",
						},
					},
					legend: {
						display: true,
						position: "top",
					},
				},
				scales: {
					x: {
						display: true,
						title: {
							display: true,
							text: "Date",
						},
						type: "time",
						time: {
							parser: "YYYY-MM-DD",
							tooltipFormat: "MMM DD, YYYY",
							displayFormats: {
								day: "MMM DD",
								week: "MMM DD",
								month: "MMM YYYY",
							},
						},
					},
					y: {
						display: true,
						title: {
							display: true,
							text: "Count",
						},
						beginAtZero: true,
						ticks: {
							precision: 0,
						},
					},
				},
				interaction: {
					mode: "index",
					intersect: false,
				},
				elements: {
					point: {
						radius: 3,
						hoverRadius: 6,
					},
				},
			},
		});
	}

	setupPeriodSelectors() {
		["patients", "worklists", "md_worklists"].forEach((chartType) => {
			const buttons = document.querySelectorAll(
				`[data-chart="${chartType}"][data-period]`
			);

			buttons.forEach((button) => {
				button.addEventListener("click", (e) => {
					e.preventDefault();
					const period = parseInt(button.dataset.period);
					this.changePeriod(chartType, period);

					// Update active button state
					buttons.forEach((btn) => btn.classList.remove("active"));
					button.classList.add("active");
				});
			});

			// Set initial active state
			const defaultButton = document.querySelector(
				`[data-chart="${chartType}"][data-period="${this.currentPeriods[chartType]}"]`
			);
			if (defaultButton) {
				defaultButton.classList.add("active");
			}
		});
	}

	changePeriod(chartType, period) {
		this.currentPeriods[chartType] = period;
		this.loadChartData(chartType, period);
	}

	async loadChartData(chartType, period) {
		try {
			// Show loading state
			this.setLoadingState(chartType, true);

			// Construct URL with proper app name
			const baseUrl = window.HOSTURL || location.origin;
			const appName = window.APP_NAME || "oph4py";
			const url = `${baseUrl}/${appName}/api/chart_data/${chartType}/${period}`;

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.error) {
				throw new Error(data.error);
			}

			this.updateChart(chartType, data);
			this.updateSummary(chartType, data);
		} catch (error) {
			console.error(`Error loading chart data for ${chartType}:`, error);
			this.showError(
				chartType,
				`Failed to load ${chartType} data: ${error.message}`
			);
		} finally {
			this.setLoadingState(chartType, false);
		}
	}

	updateChart(chartType, data) {
		const chart = this.charts[chartType];
		if (!chart) return;

		chart.data.labels = data.labels;

		// Handle both new format (with datasets) and old format (with data)
		if (data.datasets && data.datasets.length > 0) {
			// New format with multiple datasets
			data.datasets.forEach((dataset, index) => {
				if (chart.data.datasets[index]) {
					chart.data.datasets[index].data = dataset.data;
					chart.data.datasets[index].label = dataset.label;

					// Update colors and styling to match our theme
					if (index === 0) {
						chart.data.datasets[index].borderColor =
							this.colors[chartType].border;
						chart.data.datasets[index].backgroundColor =
							this.colors[chartType].background;
					} else if (index === 1) {
						chart.data.datasets[index].borderColor =
							this.colors[chartType].movingAvg;
						chart.data.datasets[index].backgroundColor = "transparent";
						chart.data.datasets[index].borderWidth = 3;
						chart.data.datasets[index].pointRadius = 0;
						chart.data.datasets[index].tension = 0.4;
						chart.data.datasets[index].fill = false;
					}
				}
			});
		} else {
			// Backward compatibility with old format
			chart.data.datasets[0].data = data.data;
			chart.data.datasets[1].data = []; // Clear moving average if not provided
		}

		chart.update("resize");
	}

	formatChartLabel(chartType) {
		switch (chartType) {
			case "md_worklists":
				return "MD Worklists";
			case "worklists":
				return "Worklists";
			case "patients":
				return "Patients";
			default:
				return chartType.charAt(0).toUpperCase() + chartType.slice(1);
		}
	}

	updateSummary(chartType, data) {
		const summaryElement = document.getElementById(`${chartType}Summary`);
		if (summaryElement) {
			const periodText = this.getPeriodText(data.period);
			summaryElement.innerHTML = `
                <div class="chart-summary">
                    <span class="total-count">${data.total_count}</span>
                    <span class="period-text">new ${chartType} in the last ${periodText}</span>
                </div>
            `;
		}
	}

	getPeriodText(months) {
		const periodTexts = {
			3: "3 months",
			6: "6 months",
			12: "1 year",
			24: "2 years",
			60: "5 years",
			84: "7 years",
			120: "10 years",
		};
		return periodTexts[months] || `${months} months`;
	}

	setLoadingState(chartType, isLoading) {
		const chartContainer = document.getElementById(
			`${chartType}ChartContainer`
		);
		if (chartContainer) {
			if (isLoading) {
				chartContainer.classList.add("loading");
			} else {
				chartContainer.classList.remove("loading");
			}
		}
	}

	showError(chartType, message) {
		const errorElement = document.getElementById(`${chartType}Error`);
		if (errorElement) {
			errorElement.textContent = message;
			errorElement.style.display = "block";
		}
	}

	// Public method to refresh all charts
	refresh() {
		Object.keys(this.charts).forEach((chartType) => {
			this.loadChartData(chartType, this.currentPeriods[chartType]);
		});
	}
}

// Initialize dashboard charts when the script loads
let dashboardCharts;

// Ensure Chart.js is loaded before initializing
if (typeof Chart !== "undefined") {
	dashboardCharts = new DashboardCharts();
} else {
	console.error(
		"Chart.js library not found. Please ensure Chart.js is loaded before dashboard-charts.js"
	);
}

// Export for global access
window.DashboardCharts = DashboardCharts;
window.dashboardCharts = dashboardCharts;
