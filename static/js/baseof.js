// toast
function displayToast(
	status = "info",
	heading = "Information",
	text = "Testing...",
	hideAfterMs = 5000
) {
	if (status == "error") {
		color = "#d9534f";
		textColor = "white";
	} else if (status == "success") {
		color = "#5cb85c";
		textColor = "white";
	} else if (status == "warning") {
		color = "#f0ad4e";
		textColor = "white";
	} else {
		color = "#5bc0de";
		textColor = "white";
	}

	// Handle different parameter types for backward compatibility
	let hideAfter;
	if (hideAfterMs === false || hideAfterMs === "false") {
		// Never hide (sticky)
		hideAfter = false;
	} else if (hideAfterMs === true || hideAfterMs === "true") {
		// Legacy sticky = true, use default 5 seconds
		hideAfter = 5000;
	} else if (typeof hideAfterMs === "string" && !isNaN(hideAfterMs)) {
		// String number like "3000"
		hideAfter = parseInt(hideAfterMs);
	} else if (typeof hideAfterMs === "number") {
		// Direct number
		hideAfter = hideAfterMs;
	} else {
		// Default fallback
		hideAfter = 5000;
	}

	$.toast({
		icon: status,
		heading: heading,
		text: text,
		position: { left: "auto", right: 50, top: 75, bottom: "auto" },
		showHideTransition: "slide",
		loader: true,
		loaderBg: color,
		textColor: textColor,
		hideAfter: hideAfter,
	});
}
