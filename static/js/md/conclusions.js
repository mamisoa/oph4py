/**
 * Multiple Conclusions Management
 * Handles dynamic addition, editing, and deletion of conclusions for each laterality
 */

// Global variables for conclusions management
let conclusionCounter = {
	na: 0,
	right: 0,
	left: 0,
};

/**
 * Initialize conclusions management
 */
function initConclusionsManagement() {
	// Set up event listeners for add buttons
	$("#btnAddCcx").on("click", function () {
		addNewConclusion("na", "#ccxList");
	});

	$("#btnAddCcxR").on("click", function () {
		addNewConclusion("right", "#ccxRList");
	});

	$("#btnAddCcxL").on("click", function () {
		addNewConclusion("left", "#ccxLList");
	});

	// Set up event delegation for dynamic form submissions (all form classes)
	$(document).on("submit", ".ccxForm, .ccxRForm, .ccxLForm", function (e) {
		handleConclusionSubmit(e, this);
	});

	// Set up event delegation for delete buttons (all delete button classes)
	$(document).on(
		"click",
		".ccxDeleteBtn, .ccxRDeleteBtn, .ccxLDeleteBtn",
		function (e) {
			handleConclusionDelete(e, this);
		}
	);

	// Auto-save on textarea blur (lose focus) - following existing pattern
	$(document).on(
		"blur",
		".ccxForm textarea, .ccxRForm textarea, .ccxLForm textarea",
		function () {
			const $textarea = $(this);
			const $form = $textarea.closest("form");
			const $submitBtn = $form.find('button[type="submit"]');

			// Only auto-save if there's content and it's not already saving
			if ($textarea.val().trim() !== "" && !$submitBtn.prop("disabled")) {
				// Mark button as changed (red) and trigger save
				$submitBtn
					.removeClass("btn-secondary btn-success")
					.addClass("btn-danger");
				$form.submit();
			}
		}
	);

	// Visual feedback on textarea change - mark button as red when content changes
	$(document).on(
		"input",
		".ccxForm textarea, .ccxRForm textarea, .ccxLForm textarea",
		function () {
			const $textarea = $(this);
			const $form = $textarea.closest("form");
			const $submitBtn = $form.find('button[type="submit"]');

			// Mark button as changed (red) if content exists
			if ($textarea.val().trim() !== "") {
				$submitBtn
					.removeClass("btn-secondary btn-success")
					.addClass("btn-danger");
			} else {
				$submitBtn
					.removeClass("btn-danger btn-success")
					.addClass("btn-secondary");
			}
		}
	);

	// Initialize counters based on existing conclusions
	updateConclusionCounters();

	console.log("Multiple conclusions management initialized");
}

/**
 * Add a new conclusion item to the specified list
 */
function addNewConclusion(laterality, listSelector) {
	const index = conclusionCounter[laterality]++;
	const formClass =
		laterality === "na"
			? "ccxForm"
			: laterality === "right"
			? "ccxRForm"
			: "ccxLForm";
	const submitClass =
		laterality === "na"
			? "ccxFormSubmit"
			: laterality === "right"
			? "ccxRFormSubmit"
			: "ccxLFormSubmit";
	const deleteClass =
		laterality === "na"
			? "ccxDeleteBtn"
			: laterality === "right"
			? "ccxRDeleteBtn"
			: "ccxLDeleteBtn";

	const placeholder =
		laterality === "na"
			? "Enter conclusion..."
			: laterality === "right"
			? "Enter right eye conclusion..."
			: "Enter left eye conclusion...";

	const newConclusionHtml = `
        <div class="conclusion-item mb-3 p-3 border rounded" data-laterality="${laterality}" data-index="${index}">
            <form class="${formClass}" enctype="multipart/form-data" method="POST">
                <div class="input-group mb-2">
                    <button type="submit" class="btn btn-secondary btn-sm ${submitClass}">
                        <i class="fas fa-save me-1"></i>Update
                    </button>
                    <textarea class="form-control" name="description" placeholder="${placeholder}" rows="2"></textarea>
                    <button type="button" class="btn btn-danger btn-sm ${deleteClass}">
                        <i class="fas fa-trash me-1"></i>Delete
                    </button>
                </div>
                <input type="hidden" name="laterality" value="${laterality}" />
                <input type="hidden" name="id" value="" />
                <input type="hidden" name="id_auth_user" value="${patientId}" />
                <input type="hidden" name="id_worklist" value="${wlId}" />
            </form>
        </div>
    `;

	$(listSelector).append(newConclusionHtml);

	// Focus on the new textarea
	$(listSelector + " .conclusion-item:last-child textarea").focus();
}

/**
 * Handle conclusion form submission
 */
function handleConclusionSubmit(e, form) {
	e.preventDefault();

	const $form = $(form);
	const $submitBtn = $form.find('button[type="submit"]');
	const $conclusionItem = $form.closest(".conclusion-item");

	let dataStr = $form.serializeJSON();
	let dataObj = JSON.parse(dataStr);

	// Determine if this is a new conclusion or an update
	let req = dataObj.id && dataObj.id !== "" ? "PUT" : "POST";

	// Clean up data
	if (req === "POST") {
		delete dataObj.id;
	}

	// Ensure required fields are set
	dataObj.id_auth_user = dataObj.id_auth_user || patientId;
	dataObj.id_worklist = dataObj.id_worklist || wlId;
	dataObj.description = capitalize(dataObj.description);

	// Show loading state
	$submitBtn.prop("disabled", true);
	$submitBtn
		.removeClass("btn-secondary btn-danger btn-success")
		.addClass("btn-warning");
	$submitBtn.html('<i class="fas fa-spinner fa-spin me-1"></i>Saving...');

	dataStr = JSON.stringify(dataObj);

	// Submit the conclusion
	crudp("ccx", dataObj.id || "0", req, dataStr)
		.then(function (response) {
			console.log("Conclusion saved successfully:", response);

			// Update the form with the returned ID if it's a new conclusion
			if (req === "POST" && response && response.id) {
				$form.find('input[name="id"]').val(response.id);
			}

			// Show success state
			$submitBtn.removeClass("btn-warning btn-danger").addClass("btn-success");
			$submitBtn.html('<i class="fas fa-check me-1"></i>Saved');

			// Reset to normal state after 2 seconds
			setTimeout(function () {
				$submitBtn.prop("disabled", false);
				$submitBtn
					.removeClass("btn-success btn-warning btn-danger")
					.addClass("btn-secondary");
				$submitBtn.html('<i class="fas fa-save me-1"></i>Update');
			}, 2000);
		})
		.catch(function (error) {
			console.error("Error saving conclusion:", error);

			// Show error state
			$submitBtn.removeClass("btn-warning btn-success").addClass("btn-danger");
			$submitBtn.html('<i class="fas fa-exclamation-triangle me-1"></i>Error');

			// Reset to normal state after 3 seconds
			setTimeout(function () {
				$submitBtn.prop("disabled", false);
				$submitBtn
					.removeClass("btn-danger btn-warning btn-success")
					.addClass("btn-secondary");
				$submitBtn.html('<i class="fas fa-save me-1"></i>Update');
			}, 3000);
		});
}

/**
 * Handle conclusion deletion
 */
function handleConclusionDelete(e, button) {
	e.preventDefault();

	const $button = $(button);
	const $form = $button.closest("form");
	const $conclusionItem = $button.closest(".conclusion-item");
	const conclusionId = $form.find('input[name="id"]').val();
	const description = $form.find('textarea[name="description"]').val();

	// If this is a new conclusion (no ID), just remove the item
	if (!conclusionId || conclusionId === "") {
		$conclusionItem.fadeOut(300, function () {
			$(this).remove();
		});
		return;
	}

	// Show confirmation dialog for existing conclusions
	const confirmMessage =
		description.length > 50
			? `Are you sure you want to delete this conclusion?\n\n"${description.substring(
					0,
					50
			  )}..."`
			: `Are you sure you want to delete this conclusion?\n\n"${description}"`;

	bootbox.confirm({
		message: confirmMessage,
		buttons: {
			confirm: {
				label: "Yes, Delete",
				className: "btn-danger",
			},
			cancel: {
				label: "Cancel",
				className: "btn-secondary",
			},
		},
		callback: function (result) {
			if (result) {
				// Show loading state
				$button.prop("disabled", true);
				$button.html('<i class="fas fa-spinner fa-spin me-1"></i>Deleting...');

				// Delete the conclusion
				crudp("ccx", conclusionId, "DELETE", "")
					.then(function (response) {
						console.log("Conclusion deleted successfully:", response);

						// Remove the item with animation
						$conclusionItem.fadeOut(300, function () {
							$(this).remove();
						});
					})
					.catch(function (error) {
						console.error("Error deleting conclusion:", error);

						// Show error state
						$button.removeClass("btn-danger").addClass("btn-warning");
						$button.html(
							'<i class="fas fa-exclamation-triangle me-1"></i>Error'
						);

						// Reset to normal state after 3 seconds
						setTimeout(function () {
							$button.prop("disabled", false);
							$button.removeClass("btn-warning").addClass("btn-danger");
							$button.html('<i class="fas fa-trash me-1"></i>Delete');
						}, 3000);
					});
			}
		},
	});
}

/**
 * Update conclusion counters based on existing items
 */
function updateConclusionCounters() {
	conclusionCounter.na = $("#ccxList .conclusion-item").length;
	conclusionCounter.right = $("#ccxRList .conclusion-item").length;
	conclusionCounter.left = $("#ccxLList .conclusion-item").length;
}

/**
 * Capitalize first letter of string
 */
function capitalize(str) {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize when document is ready
$(document).ready(function () {
	// Check if we're on a page with conclusions
	if ($("#cc-container").length > 0) {
		initConclusionsManagement();
	}
});
