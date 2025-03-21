/**
 * Test module for bootstrap-table with ES modules
 */

// Import any services you need
// import { ApiService } from './services/ApiService.js';

// Sample data for testing
const sampleData = {
	total: 2,
	rows: [
		{
			id: 1,
			procedure: "Exam A",
			patient: "John Doe",
			status_flag: "processing",
		},
		{
			id: 2,
			procedure: "Exam B",
			patient: "Jane Smith",
			status_flag: "done",
		},
	],
};

/**
 * Format the operation buttons for each row
 */
function operateFormatter_wl(value, row, index) {
	console.log("Formatter called for row:", row);
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="edit" href="javascript:void(0)" title="Edit"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Remove"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

/**
 * Handle events for the operation buttons
 */
const operateEvents_wl = {
	"click .edit": function (e, value, row, index) {
		console.log("Edit clicked for row:", row);
		alert("You clicked edit on: " + row.id);
	},
	"click .remove": function (e, value, row, index) {
		console.log("Remove clicked for row:", row);
		alert("You clicked remove on: " + row.id);
	},
};

/**
 * Initialize the table
 */
function initTable() {
	console.log("Initializing table with sample data");
	console.log("App name:", window.APP_NAME);
	console.log("Host URL:", window.HOSTURL);
	console.log("Time offset:", window.timeOffset);
	console.log("ENV status:", window.ENV_STATUS);

	// Check if jQuery and bootstrap-table are available
	if (typeof $ === "undefined") {
		console.error("jQuery is not available!");
		return;
	}

	if (typeof $.fn.bootstrapTable === "undefined") {
		console.error("bootstrap-table is not available!");
		return;
	}

	console.log("jQuery and bootstrap-table are available");

	// Expose the formatter and events to the global scope
	// THIS IS THE KEY PART - bootstrap-table needs these in the window/global scope
	window.operateFormatter_wl = operateFormatter_wl;
	window.operateEvents_wl = operateEvents_wl;

	console.log("Exposed table functions to global scope:");
	console.log(
		"- operateFormatter_wl is in window:",
		typeof window.operateFormatter_wl === "function"
	);
	console.log(
		"- operateEvents_wl is in window:",
		typeof window.operateEvents_wl === "object"
	);

	const $table = $("#table-wl");
	if ($table.length === 0) {
		console.error("Table element not found!");
		return;
	}

	console.log("Table element found");

	// Log events during initialization
	$table.on("post-header.bs.table", function () {
		console.log("Table header rendered");
	});

	$table.on("post-body.bs.table", function () {
		console.log("Table body rendered");
	});

	$table.on("load-success.bs.table", function (data) {
		console.log("Table load success:", data);
	});

	$table.on("load-error.bs.table", function (status) {
		console.error("Table load error:", status);
	});

	// Check if the table is already initialized
	if ($table.data("bootstrap.table")) {
		console.log("Table already initialized, updating data only");
		$table.bootstrapTable("load", sampleData);
	} else {
		// Initialize the bootstrap-table
		try {
			$table.bootstrapTable({
				data: sampleData,
			});
			console.log("Table initialized successfully");
		} catch (error) {
			console.error("Error initializing table:", error);
		}
	}
}

// Initialize when the document is ready
document.addEventListener("DOMContentLoaded", function () {
	console.log("DOM content loaded, initializing test module");
	try {
		initTable();
	} catch (error) {
		console.error("Error in initialization:", error);
	}
});

// Export functions that might be needed elsewhere
export { initTable, operateFormatter_wl, operateEvents_wl };
