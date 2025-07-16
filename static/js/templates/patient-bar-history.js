/**
 * PatientBarHistoryManager
 *
 * Manages consultation history modal functionality within the patient bar context.
 * This class handles loading and displaying patient consultation history in a modal
 * when triggered from the patient bar's History button.
 *
 * Features:
 * - Modal-only display (no inline table)
 * - Integration with existing patient bar global variables
 * - Pagination support within modal
 * - Loading states and error handling
 * - Responsive design
 */

class PatientBarHistoryManager {
	/**
	 * Initialize the history manager with patient context
	 * @param {Object} options - Configuration options
	 * @param {number} options.patientId - Patient ID from patientObj
	 * @param {string} options.hostUrl - Host URL for API calls
	 * @param {string} options.appName - Application name for API endpoints
	 */
	constructor(options = {}) {
		this.patientId = options.patientId;
		this.hostUrl = options.hostUrl;
		this.appName = options.appName;
		this.offset = 0;
		this.limit = 10;
		this.totalConsultations = 0;
		this.currentConsultations = 0;
		this.isLoading = false;

		// DOM elements for modal functionality
		this.elements = {
			// Modal trigger
			historyButton: document.getElementById("btnPatientHistory"),

			// Modal elements
			modal: document.getElementById("md-summary-modal"),
			modalLoading: document.getElementById("md-summary-modal-loading"),
			modalError: document.getElementById("md-summary-modal-error"),
			modalContent: document.getElementById("md-summary-modal-content"),
			modalBody: document.getElementById("md-summary-modal-body"),
			modalStats: document.getElementById("md-summary-modal-stats"),
			modalTotal: document.getElementById("md-summary-modal-total"),
			modalEmpty: document.getElementById("md-summary-modal-empty"),
			retryButton: document.getElementById("retry-md-summary-modal-btn"),
		};

		this.init();
	}

	/**
	 * Initialize event listeners and setup
	 */
	init() {
		if (!this.validateSetup()) {
			console.warn(
				"PatientBarHistoryManager: Invalid setup, skipping initialization"
			);
			return;
		}

		this.setupEventListeners();
		console.log(
			"PatientBarHistoryManager initialized for patient:",
			this.patientId
		);
	}

	/**
	 * Validate that all required elements and data are available
	 * @returns {boolean} True if setup is valid
	 */
	validateSetup() {
		if (!this.patientId) {
			console.error("PatientBarHistoryManager: Patient ID is required");
			return false;
		}

		if (!this.hostUrl || !this.appName) {
			console.error(
				"PatientBarHistoryManager: Host URL and App Name are required"
			);
			return false;
		}

		if (!this.elements.historyButton) {
			console.error("PatientBarHistoryManager: History button not found");
			return false;
		}

		if (!this.elements.modal) {
			console.error("PatientBarHistoryManager: Modal elements not found");
			return false;
		}

		return true;
	}

	/**
	 * Set up event listeners for button clicks and modal events
	 */
	setupEventListeners() {
		// History button click - open modal and load data
		this.elements.historyButton.addEventListener("click", () => {
			this.openHistoryModal();
		});

		// Retry button click
		if (this.elements.retryButton) {
			this.elements.retryButton.addEventListener("click", () => {
				this.loadConsultationHistory();
			});
		}

		// Modal shown event - load data when modal opens
		if (this.elements.modal) {
			this.elements.modal.addEventListener("shown.bs.modal", () => {
				if (this.currentConsultations === 0) {
					this.loadConsultationHistory();
				}
			});
		}
	}

	/**
	 * Open the consultation history modal
	 */
	openHistoryModal() {
		if (this.elements.modal) {
			const modal = new bootstrap.Modal(this.elements.modal);
			modal.show();
		}
	}

	/**
	 * Load consultation history from API
	 * @param {boolean} loadMore - Whether to append data (pagination)
	 */
	async loadConsultationHistory(loadMore = false) {
		if (this.isLoading) return;
		this.isLoading = true;

		// Show loading state
		if (!loadMore) {
			this.offset = 0;
			this.currentConsultations = 0;
			this.elements.modalBody.innerHTML = "";
			this.showModalLoading();
		}

		try {
			const url = `${this.hostUrl}/${this.appName}/api/patient/${this.patientId}/md_summary/${this.offset}`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.status !== "success") {
				throw new Error(
					result.message || "Failed to load consultation history"
				);
			}

			const data = result.data;

			if (data && data.items) {
				this.renderConsultationHistory(data.items);
				this.totalConsultations = data.total_count;
				this.currentConsultations += data.items.length;
				this.updateModalStats();

				if (this.totalConsultations === 0) {
					this.showModalEmpty();
				} else {
					this.showModalContent();
				}
			} else {
				throw new Error("Invalid data structure from API");
			}
		} catch (error) {
			console.error("Error loading consultation history:", error);
			this.showModalError(error.message);
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Render consultation history items into the modal table
	 * @param {Array} items - Array of consultation records
	 */
	renderConsultationHistory(items) {
		const fragment = document.createDocumentFragment();

		items.forEach((item) => {
			const row = document.createElement("tr");
			row.innerHTML = `
                <td>${
									item.requested_time
										? new Date(item.requested_time).toLocaleString()
										: "-"
								}</td>
                <td title="${this.escapeHtml(item.procedure)}">${
				item.procedure || "-"
			}</td>
                <td title="${this.escapeHtml(
									item.history
								)}">${this.truncateText(item.history, 100)}</td>
                <td title="${this.stripHtml(item.conclusion)}">
                    <div class="markdown-content">${
											this.renderMarkdown(item.conclusion) || "-"
										}</div>
                </td>
                <td title="${this.escapeHtml(
									item.followup
								)}">${this.truncateText(item.followup, 100)}</td>
                <td title="${this.escapeHtml(
									item.billing_desc
								)}">${this.truncateText(item.billing_desc, 80)}</td>
                <td title="${this.escapeHtml(item.billing_codes)}">${
				item.billing_codes || "-"
			}</td>
            `;
			fragment.appendChild(row);
		});

		this.elements.modalBody.appendChild(fragment);
		this.offset += items.length;
	}

	/**
	 * Update modal statistics display
	 */
	updateModalStats() {
		if (this.elements.modalTotal) {
			this.elements.modalTotal.textContent = this.totalConsultations;
		}
	}

	/**
	 * Show modal loading state
	 */
	showModalLoading() {
		this.elements.modalLoading.style.display = "block";
		this.elements.modalContent.style.display = "none";
		this.elements.modalError.style.display = "none";
		this.elements.modalEmpty.style.display = "none";
	}

	/**
	 * Show modal content
	 */
	showModalContent() {
		this.elements.modalLoading.style.display = "none";
		this.elements.modalContent.style.display = "block";
		this.elements.modalError.style.display = "none";
		this.elements.modalEmpty.style.display = "none";
	}

	/**
	 * Show modal error state
	 * @param {string} message - Error message to display
	 */
	showModalError(message = "Unable to load consultation history") {
		this.elements.modalLoading.style.display = "none";
		this.elements.modalContent.style.display = "none";
		this.elements.modalError.style.display = "block";
		this.elements.modalEmpty.style.display = "none";

		// Update error message if there's a specific container for it
		const errorMsg = this.elements.modalError.querySelector(".alert-danger");
		if (errorMsg) {
			errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i><strong>Error:</strong> ${message}`;
		}
	}

	/**
	 * Show modal empty state
	 */
	showModalEmpty() {
		this.elements.modalLoading.style.display = "none";
		this.elements.modalContent.style.display = "none";
		this.elements.modalError.style.display = "none";
		this.elements.modalEmpty.style.display = "block";
	}

	/**
	 * Escape HTML to prevent XSS
	 * @param {string} text - Text to escape
	 * @returns {string} Escaped text
	 */
	escapeHtml(text) {
		if (!text) return "";
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	/**
	 * Truncate text to specified length
	 * @param {string} text - Text to truncate
	 * @param {number} maxLength - Maximum length
	 * @returns {string} Truncated text
	 */
	truncateText(text, maxLength) {
		if (!text) return "";
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + "...";
	}

	/**
	 * Strip HTML tags from text
	 * @param {string} html - HTML content
	 * @returns {string} Plain text
	 */
	stripHtml(html) {
		if (!html) return "";
		const div = document.createElement("div");
		div.innerHTML = html;
		return div.textContent || div.innerText || "";
	}

	/**
	 * Enhanced markdown renderer for consultation history conclusions
	 * Handles existing laterality badges and applies markdown formatting
	 * Supports: **bold**, *italic*, ~~strikethrough~~, `code`, [links](url)
	 * @param {string} text - The text/HTML to render with markdown
	 * @returns {string} - HTML string
	 */
	renderMarkdown(text) {
		if (!text || text === "-") return "";

		// If text is already HTML (contains <span class="badge"), handle it carefully
		if (text.includes('<span class="badge"')) {
			// Split by <br> to handle each conclusion line separately
			const lines = text.split("<br>");
			const processedLines = lines.map((line) => {
				// Extract badge HTML and text content separately
				const badgeMatch = line.match(
					/^(<span class="badge"[^>]*>[^<]*<\/span>)\s*(.*)/
				);
				if (badgeMatch) {
					const badge = badgeMatch[1];
					const content = badgeMatch[2];
					// Apply markdown to content only, preserve badge HTML
					return badge + " " + this.applyMarkdownToText(content);
				} else {
					// No badge, apply markdown to entire line
					return this.applyMarkdownToText(line);
				}
			});
			// Wrap each line in a div for better spacing between badges
			return processedLines
				.map((line) => `<div class="conclusion-line">${line}</div>`)
				.join("");
		} else {
			// Plain text, apply markdown normally
			return this.applyMarkdownToText(text);
		}
	}

	/**
	 * Apply markdown formatting to plain text (with HTML escaping)
	 * @param {string} text - Plain text to format
	 * @returns {string} - HTML string with markdown applied
	 */
	applyMarkdownToText(text) {
		if (!text) return "";

		// Escape HTML first to prevent XSS
		let html = text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");

		// Apply markdown formatting (using browser-compatible regex patterns)
		html = html
			// Bold: **text** or __text__
			.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
			.replace(/__(.*?)__/g, "<strong>$1</strong>")
			// Strikethrough: ~~text~~ (process before italic to avoid conflicts)
			.replace(/~~(.*?)~~/g, "<del>$1</del>")
			// Italic: *text* or _text_ (more conservative patterns for browser compatibility)
			.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
			.replace(/\b_([^_\n]+?)_\b/g, "<em>$1</em>")
			// Inline code: `text`
			.replace(/`([^`]+?)`/g, "<code>$1</code>")
			// Links: [text](url)
			.replace(
				/\[([^\]]+?)\]\(([^)]+?)\)/g,
				'<a href="$2" target="_blank">$1</a>'
			)
			// Line breaks
			.replace(/\n/g, "<br>");

		return html;
	}
}

// Utility function to initialize the manager when patient bar globals are available
function initializePatientBarHistory() {
	// Check if required global variables are available
	if (typeof patientObj === "undefined" || !patientObj.id) {
		console.warn("PatientBarHistoryManager: Patient object not available yet");
		return false;
	}

	if (typeof HOSTURL === "undefined" || typeof APP_NAME === "undefined") {
		console.warn(
			"PatientBarHistoryManager: Global URL variables not available yet"
		);
		return false;
	}

	// Initialize the history manager
	window.patientBarHistoryManager = new PatientBarHistoryManager({
		patientId: patientObj.id,
		hostUrl: HOSTURL,
		appName: APP_NAME,
	});

	return true;
}

// Export for module use if needed
if (typeof module !== "undefined" && module.exports) {
	module.exports = { PatientBarHistoryManager, initializePatientBarHistory };
}
