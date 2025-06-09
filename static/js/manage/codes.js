// codes.js - Main logic for nomenclature codes CRUD (modal and event handling)
$(function () {
	// Initialize Bootstrap 5 modal instance
	window.codeModal = new bootstrap.Modal(document.getElementById("codeModal"), {
		backdrop: "static",
		keyboard: false,
	});

	// Ensure modal is hidden on page load
	$("#codeModal").on("shown.bs.modal", function () {
		// Autofocus first input if needed
		$("#nomen_code").trigger("focus");
	});
	$("#codeModal").on("hidden.bs.modal", function () {
		// Reset form when modal is closed
		$("#code-form")[0].reset();
		// Reset modal title for next use
		$("#codeModalLabel").html(
			'<i class="bi bi-plus-circle me-2"></i>Create/Edit Nomenclature Code'
		);
	});

	// Listen for create button
	$("#btn-create-code").on("click", function () {
		$("#code-form")[0].reset();
		$("#codeModalLabel").html(
			'<i class="bi bi-plus-circle me-2"></i>Create New Code'
		);
		window.codeModal.show();
	});

	// Listen for edit event from codes_bt.js
	$(document).on("editCode", function (e, codeId) {
		// TODO: Load code data by codeId and fill form
		$("#codeModalLabel").html(
			'<i class="bi bi-pencil me-2"></i>Edit Code #' + codeId
		);
		window.codeModal.show();
	});

	// Listen for delete event (to be implemented)
	$(document).on("deleteCode", function (e, codeId) {
		// TODO: Implement delete logic with confirmation dialog
		console.log("Delete code:", codeId);
	});
});
