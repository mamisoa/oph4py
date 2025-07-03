/**
 * Legacy Combo Management Functions
 *
 * This file contains the original combo form submission logic.
 * The new enhanced interface is handled by combo-manager.js
 *
 * Keeping this for backward compatibility and any legacy functionality.
 */

// Legacy form submission handler (if old form elements exist)
$(document).ready(function () {
	// Only bind if the old form exists (for backward compatibility)
	if ($("#newComboForm").length > 0) {
		$("#newComboForm").submit(function (e) {
			e.preventDefault();
			let procedure = $("#newComboForm select[name=id_procedure]").val();
			let modalities = $("#newComboForm select[name=id_modality]").val();
			console.log("procedure:", procedure);
			console.log("modalities:", modalities);
			for (modality of modalities) {
				let dataObj = {};
				dataObj["id_procedure"] = procedure;
				dataObj["id_modality"] = modality;
				dataStr = JSON.stringify(dataObj);
				console.log("dataStr:", dataStr);
				crudp("combo", "0", "POST", dataStr);
			}
		});
	}
});

// Export any utility functions that might be used by the new system
window.ComboLegacy = {
	// Add any legacy functions here if needed
};
