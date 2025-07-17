function responseHandler_airPachy(res) {
	// used if data-response-handler="responseHandler_airPachy"
	console.log("🔍 responseHandler_airPachy called with response:", res);
	let list = res.items;
	console.log("📋 airPachy items list:", list);
	let display = [];

	$.each(list, function (i) {
		console.log(`🫁 Processing airPachy item ${i}:`, list[i]);
		console.log(
			`👤 Creator data: creator.last_name="${list[i]["creator.last_name"]}", creator.first_name="${list[i]["creator.first_name"]}"`
		);
		console.log(
			`✏️ Modifier data: mod.last_name="${list[i]["mod.last_name"]}", mod.first_name="${list[i]["mod.first_name"]}"`
		);
		console.log("🔍 Available fields:", Object.keys(list[i]));
		console.log(`🆔 Raw created_by field:`, list[i]["created_by"]);
		console.log(`🆔 Raw modified_by field:`, list[i]["modified_by"]);

		// Extract numeric values from HTML if present
		let tonometryValue = extractNumericValue(list[i]["tonometry"]);
		let pachymetryValue = extractNumericValue(list[i]["pachymetry"]);

		// Debug creator/modifier name construction
		console.log(
			"🏗️ Building creator name:",
			list[i]["creator.last_name"],
			"+",
			list[i]["creator.first_name"]
		);
		console.log(
			"🏗️ Building modifier name:",
			list[i]["mod.last_name"],
			"+",
			list[i]["mod.first_name"]
		);

		let creatorName =
			list[i]["creator.last_name"] && list[i]["creator.first_name"]
				? list[i]["creator.last_name"] + " " + list[i]["creator.first_name"]
				: "N/A";
		let modifierName =
			list[i]["mod.last_name"] && list[i]["mod.first_name"]
				? list[i]["mod.last_name"] + " " + list[i]["mod.first_name"]
				: "N/A";

		console.log("👤 Final creator name:", creatorName);
		console.log("✏️ Final modifier name:", modifierName);

		display.push({
			id: list[i].id,
			id_auth_user: list[i].id_auth_user,
			id_worklist: list[i].id_worklist,
			techno: list[i].techno,
			laterality: list[i]["laterality"],
			tonometry: highlightValue(tonometryValue, 20, 24),
			pachymetry: highlightValue(pachymetryValue, 525, 500, "low"),
			timestamp: list[i]["timestamp"].split("T").join(" "),
			modified_by: modifierName,
			modified_on: list[i]["modified_on"],
			created_by: creatorName,
			created_on: list[i]["created_on"],
		});
		console.log(
			`✅ Final airPachy display object for item ${i}:`,
			display[display.length - 1]
		);
	});
	console.log("📤 Final airPachy display array:", display);
	return { rows: display, total: res.count };
}

// Helper function to extract numeric value from HTML or plain text
function extractNumericValue(value) {
	console.log("🔢 Extracting numeric value from:", value);
	if (typeof value === "string") {
		// If it contains HTML tags, extract the text content
		if (value.includes("<") && value.includes(">")) {
			// Use regex to extract text between tags
			let regex = />([^<]+)</;
			let match = value.match(regex);
			let extracted = match ? match[1].trim() : value;
			console.log("🏷️ Extracted from HTML:", extracted);
			return extracted;
		}
	}
	console.log("🔢 Returning as-is:", value);
	return value;
}

// Detail formatter for tonometry tables
function detailFormatter_airPachy(index, row) {
	let html = ['<div class="container-fluid"><div class="row">'];
	html.push('<div class="text-start col">');
	html.push(
		'<p class=""><span class="fw-bold">Tono: </span>' +
			extractNumericValue(row.tonometry) +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Techno: </span>' + row.techno + "</p>"
	);
	if (row.techno === "air") {
		html.push(
			'<p class=""><span class="fw-bold">Pachy: </span>' +
				extractNumericValue(row.pachymetry) +
				"</p>"
		);
	}
	html.push(
		'<p class=""><span class="fw-bold">Timestamp: </span>' +
			row.timestamp +
			"</p>"
	);
	html.push("</div>");
	html.push('<div class="text-start col">');
	html.push('<p class=""><span class="fw-bold">ID: </span>' + row.id);
	html.push(
		'<p class=""><span class="fw-bold">PatientID: </span>' +
			row.id_auth_user +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Worklist ID: </span>' +
			row.id_worklist +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Created by: </span>' +
			row.created_by +
			" on " +
			row.created_on +
			"</p>"
	);
	html.push(
		'<p class=""><span class="fw-bold">Modified by: </span>' +
			row.modified_by +
			" on " +
			row.modified_on +
			"</p>"
	);
	html.push("</div>");
	html.push("</div></div>");
	return html.join("");
}

function queryParams_airPachy(params) {
	var s = "";
	if (params.offset != "0") {
		// console.log(params.offset);
		s += "&@offset=" + params.offset;
	}
	if (params.limit != "0") {
		// console.log(params.offset);
		s += "&@limit=" + params.limit;
	}
	return decodeURI(encodeURI(s.slice(1 - s.length))); // remove the first &
}

function operateFormatter_airPachy(value, row, index) {
	let html = ['<div class="d-flex justify-content-between">'];
	html.push(
		'<a class="edit" href="javascript:void(0)" title="Edit tono/pachy"><i class="fas fa-edit"></i></a>'
	);
	html.push(
		'<a class="remove ms-1" href="javascript:void(0)" title="Delete tono/pachy"><i class="fas fa-trash-alt"></i></a>'
	);
	html.push("</div>");
	return html.join("");
}

window.operateEvents_airPachy = {
	"click .edit": function (e, value, row, index) {
		console.log("You click action EDIT on row: " + JSON.stringify(row));
		document.getElementById("tonoPachyForm").reset();
		$("#tonoPachyForm [name=id]").val([row.id]);
		$("#tonoPachyForm [name=id_auth_user]").val([row.id_auth_user]);
		$("#tonoPachyForm [name=id_worklist]").val([row.id_worklist]);
		$("#tonoPachyForm [name=laterality]").val([row.laterality]); // put in an array to set radio
		$("#tonoPachyForm [name=techno]").val([row.techno]).trigger("change"); // chain trigger to hide/show pachy
		// Extract numeric values from HTML-formatted data
		let pachy =
			row.techno == "air"
				? parseFloat(extractNumericValue(row.pachymetry))
				: 550;
		console.log("pachy:", pachy);
		let tono = parseFloat(extractNumericValue(row.tonometry));
		$("#tonoPachyForm [name='pachymetry']").val(pachy);
		$("#tonoPachyForm [name='tonometry']").val(tono);
		$("#tonoPachyForm [name='timestamp']").val(
			row.timestamp.split(" ").join("T")
		); // to ISO
		$("#methodTonoPachySubmit").val("PUT");
		$("#tonoPachyModal").modal("show");
	},
	"click .remove": function (e, value, row, index) {
		delTonoPachy(row.id);
	},
};

// highlight abnormal values
function highlightValue(str, midthreshold, highthreshold, direction = "high") {
	if (direction == "high") {
		if (parseFloat(str) >= highthreshold) {
			return '<span class="text-danger"><strong>' + str + "</strong></span>";
		} else if (parseFloat(str) >= midthreshold) {
			return '<span class="text-warning"><strong>' + str + "</strong></span>";
		} else {
			return '<span class="text-success">' + str + "</span>";
		}
	} else {
		if (parseFloat(str) <= highthreshold) {
			return '<span class="text-danger"><strong>' + str + "</strong></span>";
		} else if (parseFloat(str) <= midthreshold) {
			return '<span class="text-warning"><strong>' + str + "</strong></span>";
		} else {
			return '<span class="text-success">' + str + "</span>";
		}
	}
}
