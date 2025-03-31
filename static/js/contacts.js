// contacts prescriptions
// prescCxObj contains id and options items
// CxRxGlobalObj merges CxRxRight and left

/**
 * Displays a notification message to the user
 *
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, danger, warning, info)
 */
function notifyUser(message, type) {
	// Create alert div
	const alertDiv = document.createElement("div");
	alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
	alertDiv.setAttribute("role", "alert");

	// Add message
	alertDiv.innerHTML = message;

	// Add close button
	const closeButton = document.createElement("button");
	closeButton.type = "button";
	closeButton.className = "btn-close";
	closeButton.setAttribute("data-bs-dismiss", "alert");
	closeButton.setAttribute("aria-label", "Close");

	alertDiv.appendChild(closeButton);

	// Add to notification area
	const notificationArea = document.getElementById("notificationArea");
	notificationArea.appendChild(alertDiv);

	// Auto-dismiss after 5 seconds
	setTimeout(() => {
		alertDiv.remove();
	}, 5000);
}

var prescCxObj = {};

prescCxObj["doctorfirst"] = userObj["first_name"];
prescCxObj["doctorlast"] = userObj["last_name"];
prescCxObj["doctortitle"] =
	"Dr " + userObj["last_name"].toUpperCase() + " " + userObj["first_name"];
prescCxObj["doctorinami"] = usermdObj["inami"]; // keep separations
prescCxObj["doctoremail"] = usermdObj["email"];
prescCxObj["centername"] =
	usermdObj["officename"] +
	"\n" +
	usermdObj["officeaddress"] +
	"\n" +
	usermdObj["officezip"] +
	" " +
	usermdObj["officetown"];
prescCxObj["centerphone"] = usermdObj["officephone"];
prescCxObj["centerurl"] = usermdObj["officeurl"];

prescCxObj["art30yes"] = "[x]";
prescCxObj["art30no"] = "[ ]";
prescCxObj["qrcode"] = "Signed by " + prescCxObj["doctortitle"] + " uuid:";

function vertex2cornea(power, vertex = 0.0125) {
	return round2qter(power / (1 - vertex * power));
}

function glass2lens(sph, cyl) {
	let sph90converted = vertex2cornea(sph - cyl);
	let sphConverted = vertex2cornea(sph);
	let cylConverted = sphConverted - sph90converted;
	return { sphConverted: sphConverted, cylConverted: cylConverted };
}

$("#btnCxRx").click(function () {
	let htmlR = [],
		htmlL = [];
	for (item of rxObj) {
		console.log("Choosen Rx", item);
		// put everything in table
		if (item["laterality"] == "right") {
			let html = [];
			html.push("<tr>"); // row
			html.push("<td>"); // 1st col origin
			html.push(item["rx_origin"]);
			html.push("</td>");
			html.push("<td>"); // 2nd col glass type
			html.push(item["glass_type"]);
			html.push("</td>");
			html.push('<th scope="row">'); // 3rd col rx
			html.push(item["rx_far"] + " Add+" + item["add"]);
			html.push("</td>");
			html.push("<td>"); // 4th col
			html.push(
				'<button type="button" class="btn btn-primary btn-sm print-rx" onclick="rxDataButtonC(this.getAttribute(\'data-rx-obj\'),\'right\');" data-rx-obj=\'' +
					JSON.stringify(item) +
					'\'><i class="fas fa-file-import"></i></button>'
			);
			html.push("</td>");
			html.push("</tr>"); // end row
			htmlR.push(html.join(""));
		} else {
			let html = [];
			html.push("<tr>"); // row
			html.push("<td>"); // 1st col origin
			html.push(item["rx_origin"]);
			html.push("</td>");
			html.push("<td>"); // 2nd col glass type
			html.push(item["glass_type"]);
			html.push("</td>");
			html.push('<th scope="row">'); // 3rd col rx
			html.push(item["rx_far"] + " Add+" + item["add"]);
			html.push("</td>");
			html.push("<td>"); // 4th col
			html.push(
				'<button type="button" class="btn btn-primary btn-sm print-rx" onclick="rxDataButtonC(this.getAttribute(\'data-rx-obj\'),\'left\');" data-rx-obj=\'' +
					JSON.stringify(item) +
					'\'><i class="fas fa-file-import"></i></button>'
			);
			html.push("</td>");
			html.push("</tr>"); // end row
			htmlL.push(html.join(""));
		}
	}
	$("#CxRxRTd").html(htmlR.join(""));
	$("#CxRxLTd").html(htmlL.join(""));
	$("#CxRxModal").modal("show");
});

var CxRxRightObj = {};
var CxRxLeftObj = {};
function rxDataButtonC(dataStr, lat) {
	let dataObj = JSON.parse(dataStr);
	console.log(dataObj);
	let html = [];
	html.push("<tr>"); // row
	html.push("<td>"); // 1st col origin
	html.push(dataObj["rx_origin"]);
	html.push("</td>");
	html.push("<td>"); // 2nd col glass type
	html.push(dataObj["glass_type"]);
	html.push("</td>");
	html.push('<th scope="row">'); // 3rd col rx
	html.push(dataObj["rx_far"] + " Add+" + dataObj["add"]);
	html.push("</td>");
	html.push("<td>"); // 4th col
	html.push("</td>");
	html.push("</tr>"); // end row
	$("#CxRx" + lat).html(html.join(""));
	lat == "right" ? (CxRxRightObj = dataObj) : (CxRxLeftObj = dataObj);
	// set suggested conversion
	let conversionObj = glass2lens(dataObj["sph_far"], dataObj["cyl_far"]);
	console.log(conversionObj);
	let side = lat == "right" ? "R" : "L";
	$("#CxRxFormModal input[name=sph" + side + "]").val(
		conversionObj["sphConverted"]
	);
	$("#CxRxFormModal input[name=cyl" + side + "]").val(
		conversionObj["cylConverted"]
	);
	$("#CxRxFormModal input[name=axis" + side + "]").val(dataObj["axis_far"]);
}

// remove unecessary elements
function filterCxRx(dataObj) {
	let removeKeysArray = [
		"id",
		"created_by_name",
		"modified_by_name",
		"created_by",
		"modified_by",
		"created_on",
		"modified_on",
		"opto_far",
		"opto_int",
		"opto_close",
		"va_far",
		"va_int",
		"va_close",
		"se_far",
		"note",
		"laterality",
	];
	for (let key of removeKeysArray) {
		delete dataObj[key];
	}
}

// if one group is selected in form, others are disabled
$("#CxRxFormModal #group-1 input").change(function () {
	if (this.checked) {
		$("#CxRxFormModal #group-2 input").attr("disabled", true);
		$("#CxRxFormModal #group-3 input").attr("disabled", true);
	} else {
		// checks if one or more box are still checked before disabling other groups
		if (
			!(
				$("#CxRxFormModal #group-1 input[name=g1sspheric]:checked").val() ==
					"on" ||
				$("#CxRxFormModal #group-1 input[name=g1storic]:checked").val() ==
					"on" ||
				$("#CxRxFormModal #group-1 input[name=g1rspheric]:checked").val() ==
					"on" ||
				$("#CxRxFormModal #group-1 input[name=g1rtoric]:checked").val() == "on"
			)
		) {
			$("#CxRxFormModal #group-2 input").attr("disabled", false);
			$("#CxRxFormModal #group-3 input").attr("disabled", false);
		} else {
			// don't re-enable
		}
	}
});

$("#CxRxFormModal #group-2 input").change(function () {
	if (this.checked) {
		$("#CxRxFormModal #group-1 input").attr("disabled", true);
		$("#CxRxFormModal #group-3 input").attr("disabled", true);
	} else {
		// checks if one or more box are still checked before disabling other groups
		if (
			!(
				$("#CxRxFormModal #group-2 input[name=g2soft]:checked").val() == "on" ||
				$("#CxRxFormModal #group-2 input[name=g2rigidc]:checked").val() ==
					"on" ||
				$("#CxRxFormModal #group-2 input[name=g2rigidcs]:checked").val() ==
					"on" ||
				$("#CxRxFormModal #group-2 input[name=g2rigids]:checked").val() == "on"
			)
		) {
			$("#CxRxFormModal #group-1 input").attr("disabled", false);
			$("#CxRxFormModal #group-3 input").attr("disabled", false);
		} else {
			// don't re-enable
		}
	}
});

$("#CxRxFormModal #group-3 input").change(function () {
	if (this.checked) {
		$("#CxRxFormModal #group-1 input").attr("disabled", true);
		$("#CxRxFormModal #group-2 input").attr("disabled", true);
	} else {
		// checks if one or more box are still checked before disabling other groups
		if (
			!(
				$("#CxRxFormModal #group-3 input[name=g3iris]:checked").val() == "on" ||
				$("#CxRxFormModal #group-3 input[name=g3pupil]:checked").val() == "on"
			)
		) {
			$("#CxRxFormModal #group-1 input").attr("disabled", false);
			$("#CxRxFormModal #group-2 input").attr("disabled", false);
		} else {
			// don't re-enable
		}
	}
});

// set strings in checkbox in report
function checkboxReport(rxarr, rxObj) {
	for (let group of rxarr) {
		if (rxObj[group] == true) {
			rxObj[group] = "X";
		} else {
			rxObj[group] = "o";
		}
	}
}

// convert numbers to strings and set options in report
function globalRx2presc2(rxObj) {
	let delkeyArr = ["id_auth_user", "id_worklist"];
	for (key of delkeyArr) {
		delete rxObj["key"];
	}
	if (rxObj["art30"] == "False") {
		rxObj["art30no"] = "[x]";
		rxObj["art30yes"] = "[ ]";
	} else {
		rxObj["art30yes"] = "[x]";
		rxObj["art30no"] = "[ ]";
	}
	delete rxObj["art30"];
	// set checkbox groups
	let groupArr = [
		"g1sspheric",
		"g1storic",
		"g1rspheric",
		"g1rtoric",
		"g2soft",
		"g2rigidc",
		"g2rigidcs",
		"g2rigids",
		"g3iris",
		"g3pupil",
	];
	checkboxReport(groupArr, rxObj);
	console.log("rxObj before filtering null values:", rxObj);
	// change everything in string, and check for empty or null values
	for (const key in rxObj) {
		if (typeof rxObj[key] == "number") {
			if (rxObj[key] > 0 && key.startsWith("ax") != true) {
				rxObj[key] = round2dec(rxObj[key]);
				rxObj[key] = checkIfDataIsNull(rxObj[key].toString(), "-");
			} else {
				rxObj[key] = checkIfDataIsNull(rxObj[key].toString(), "-");
			}
		} else {
			rxObj[key] = checkIfDataIsNull(rxObj[key], "-");
		}
	}
}

// If email button is clicked, set actionType to "email"
$("#emailCxRxBtn").click(function () {
	// Check if patient has a valid email before submitting
	if (
		!patientObj["email"] ||
		patientObj["email"].trim() === "" ||
		!patientObj["email"].includes("@")
	) {
		notifyUser(
			"Impossible d'envoyer l'email: adresse email du patient manquante ou invalide",
			"danger"
		);
		return;
	}

	$("#CxRxactionType").val("email");
	$("#btnCxRxModalSubmit").click();
});

$("#CxRxFormModal").submit(function (e) {
	e.preventDefault();
	let CxRxGlobalObj = {},
		formObj = {};
	let formStr = $(this).serializeJSON();
	formObj = JSON.parse(formStr);
	// console.log('Initial formObj',formObj);
	// formObj is from form
	// CxRxRight, CxRxLeft is from rx selection
	// CxRxGlobalObj is the prescription object
	// set CxRxGlobalObj from CxRxRight, CxRxLeft
	// set soft or rigid rx
	if (
		formObj["g1rspheric"] == true ||
		formObj["g1rtoric"] == true ||
		formObj["g2rigidc"] == true ||
		formObj["g2rigidcs"] == true ||
		formObj["g2rigids"] == true
	) {
		formObj["rxsoft"] = "o";
		formObj["rxrigid"] = "X";
	} else {
		formObj["rxsoft"] = "X";
		formObj["rxrigid"] = "o";
	}
	// set group 1
	if (formObj["g1sspheric"] == true || formObj["g1storic"] == true) {
		formObj["g1soft"] = "X";
		formObj["g1rigid"] = "o";
	} else if (formObj["g1rspheric"] == true || formObj["g1rtoric"] == true) {
		formObj["g1soft"] = "o";
		formObj["g1rigid"] = "X";
	} else {
		formObj["g1soft"] = "o";
		formObj["g1rigid"] = "o";
	}
	filterCxRx(CxRxRightObj);
	filterCxRx(CxRxLeftObj);
	// console.log('CxRxRightObj:',CxRxRightObj);
	// console.log('CxRxLeftObj:',CxRxLeftObj);
	// console.log('formObj:',formObj);
	let CxRxArr = [
		"sph_far",
		"cyl_far",
		"axis_far",
		"sph_int",
		"cyl_int",
		"axis_int",
		"sph_close",
		"cyl_close",
		"axis_close",
		"add",
	];
	let CxRxArrC = [
		"id_auth_user",
		"id_worklist",
		"prismL",
		"baseL",
		"prismL",
		"baseL",
		"prismR",
		"baseR",
		"prismR",
		"baseR",
		"sphR",
		"cylR",
		"axisR",
		"lensnameR",
		"materialR",
		"basecurveR",
		"diameterR",
		"designR",
		"edgeR",
		"opticalzoneR",
		"addcR",
		"sphL",
		"cylL",
		"axisL",
		"lensnameL",
		"materialL",
		"basecurveL",
		"diameterL",
		"designL",
		"edgeL",
		"opticalzoneL",
		"addcL",
		"g1soft",
		"g1rigid",
		"g1sspheric",
		"g1storic",
		"g1rspheric",
		"g1rtoric",
		"g2soft",
		"g2rigidc",
		"g2rigidcs",
		"g2rigids",
		"rxsoft",
		"rxrigid",
		"cleaningR",
		"cleaningL",
		"g3iris",
		"g3pupil",
		"art30",
		"remarks",
	];
	for (key of CxRxArr) {
		CxRxGlobalObj[key + "R"] = CxRxRightObj[key];
	}
	for (key of CxRxArr) {
		CxRxGlobalObj[key + "L"] = CxRxLeftObj[key];
	}
	for (key of CxRxArrC) {
		CxRxGlobalObj[key] = formObj[key];
	}
	let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0, 10);
	CxRxGlobalObj["datestamp"] = today;
	// console.log('CxRxGlobalObj',CxRxGlobalObj);
	let finalDbObj = Object.assign({}, CxRxGlobalObj);
	// parameters unecessary in db, only for reporting
	let notForDbArr = ["g1soft", "g1rigid", "rxsoft", "rxrigid", "addR", "addL"];
	for (key of notForDbArr) {
		delete finalDbObj[key];
	}
	// get uuid
	fetch(HOSTURL + "/" + APP_NAME + "/api/uuid", { method: "GET" })
		.then((response) => response.json())
		.then((data) => {
			// clone prescCxObj
			// add all keys and values from CxRxGlobalObj
			// modify the value of art30
			console.log("prescCxObj", prescCxObj);
			let finalRxObj = Object.assign({}, prescCxObj);
			// filter numbers to strings and add options in report
			globalRx2presc2(CxRxGlobalObj);
			// add all keys to finalRxObj
			for (const key in CxRxGlobalObj) {
				finalRxObj[key] = CxRxGlobalObj[key];
			}
			finalRxObj["qrcode"] = finalRxObj["qrcode"] + data.unique_id; // already string
			finalRxObj["first_name"] = patientObj["first_name"];
			finalRxObj["last_name"] = patientObj["last_name"];
			finalRxObj["dob"] = patientObj["dob"].split("-").reverse().join("/");
			// temporarly: do not display the intermediate distance
			finalRxObj["sph_intR"] =
				finalRxObj["cyl_intR"] =
				finalRxObj["cyl_intR"] =
				finalRxObj["axis_intR"] =
					"-";
			finalRxObj["sph_intL"] =
				finalRxObj["cyl_intL"] =
				finalRxObj["cyl_intL"] =
				finalRxObj["axis_intL"] =
					"-";
			// console.log('FinalRxObj',finalRxObj);
			// const finalPresc = rxprescription;
			let finalPresc = {
				watermark: {
					text: "",
					color: "red",
					opacity: 0.2,
					bold: false,
					italics: false,
				},
				pageSize: "A4",
				pageMargins: [25, 60, 40, 30],
				styles: {
					header: {
						fontSize: 9,
						margin: [10, 2, 10, 0],
					},
					footer: {
						italics: true,
						fontSize: 7,
						margin: [10, 2, 10, 0],
					},
					title: {
						bold: true,
					},
					idtable: {
						fontSize: 9,
						alignment: "left",
					},
					tableExample: {
						fontSize: 8,
					},
					tableHeader: {
						bold: true,
						color: "black",
						fillColor: "#eeeeee",
						fontSize: 8,
					},
					tabo: {
						alignment: "center",
					},
				},
				defaultStyle: {
					alignment: "center",
					fontSize: 10,
				},
				header: {
					style: "header",
					margin: [200, 10, 150, 5],
					columns: [
						{
							image: logo64,
							width: 50,
						},
						{
							margin: [10, 0, 0, 0],
							text: [
								"Centre Médical Bruxelles-Schuman\n",
								{
									text: "66 Avenue de Cortenbergh\n1000 Bruxelles, Belgique\n+32(0)2/256.90.83 - info@ophtalmologiste.be\n",
									fontSize: 7,
								},
								{
									text: "www.ophtalmologiste.be",
									fontSize: 7,
									color: "blue",
									decoration: "underline",
								},
							],
							width: "*",
							alignment: "center",
						},
					], // end of 2 columns
				}, // end header
				footer: {
					style: "footer",
					margin: [10, 10, 0, 0],
					alignment: "center",
					text: [
						{ text: usermdObj["companyname"], decoration: "underline" },
						{
							text:
								" - " +
								usermdObj["companyaddress"] +
								"\n" +
								" " +
								usermdObj["companynum"] +
								" - " +
								usermdObj["companyiban"],
						},
					], // end of text
				}, // end of footer
				content: [
					{
						style: "title",
						margin: [0, 10, 0, 10],
						alignment: "center",
						text: [
							"Annexe 15",
							{ text: "ter\n", italics: true },
							"PRESCRIPTION MEDICALE POUR LENTILLES DE CONTACT",
						],
					},
					{
						canvas: [
							{ type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5 },
							{ type: "rect", x: 0, y: 12, w: 515, h: 1, color: "white" }, // spacer
						],
					}, // end of canvas
					{ text: "VIGNETTE O.A", alignment: "left" },
					{
						canvas: [
							{ type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5 },
							{ type: "rect", x: 0, y: 7, w: 515, h: 2, color: "white" }, // spacer
						],
					}, // end of canvas
					{
						style: "idtable",
						margin: [0, 10, 0, 0],
						table: {
							widths: ["*", "*"],
							body: [
								[
									{
										text: [
											{ text: "NOM: " },
											{ text: finalRxObj["last_name"], bold: true },
										],
									},
									{
										text: [
											{ text: "PRENOM: " },
											{ text: finalRxObj["first_name"], bold: true },
										],
									},
								],
								[
									{
										text: [
											{ text: "DATE DE NAISSANCE: " },
											{ text: finalRxObj["dob"], bold: true },
										],
									},
									"",
								],
							],
						}, // end of table
						layout: "noBorders", // end of body, 2 columns
					}, // end of row
					{
						canvas: [
							{ type: "line", x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1 },
							{ type: "rect", x: 0, y: 12, w: 515, h: 2, color: "white" }, // spacer
						],
					}, // end of canvas
					{
						text: "Réfraction des verres lunettes ( à remplir obligatoirement – vertex : 12mm )",
						alignment: "left",
					},
					{
						margin: [0, 5, 0, 0],
						style: "tableExample", // table prescription
						table: {
							headerRows: 1,
							widths: [
								"*",
								"*",
								"*",
								"*",
								"*",
								"*",
								2,
								"*",
								"*",
								"*",
								"*",
								"*",
								"*",
							],
							body: [
								[
									{ text: "D", bold: true, border: [false, false, true, true] },
									{ style: "tableHeader", text: "Sph" },
									{ text: "Cyl", style: "tableHeader" },
									{ text: "Axis", style: "tableHeader" },
									{ text: "PRISM", style: "tableHeader" },
									{ text: "BASE", style: "tableHeader" },
									{ text: "", border: [false, false, false, false] }, // spacer
									{ text: "G", bold: true, border: [false, false, true, true] },
									{ text: "Sph", style: "tableHeader" },
									{ text: "Cyl", style: "tableHeader" },
									{ text: "Axis", style: "tableHeader" },
									{ text: "PRISM", style: "tableHeader" },
									{ text: "BASE", style: "tableHeader" },
								], // end table header 13 columns
								[
									{ text: "Loin" },
									{ text: finalRxObj["sph_farR"] },
									{ text: finalRxObj["cyl_farR"] },
									{ text: finalRxObj["axis_farR"] },
									{ text: finalRxObj["prismR"] },
									{ text: finalRxObj["baseR"] },
									{ text: "", border: [false, false, false, false] }, // spacer - 6 col ok
									{ text: "Loin" },
									{ text: finalRxObj["sph_farL"] },
									{ text: finalRxObj["cyl_farL"] },
									{ text: finalRxObj["axis_farL"] },
									{ text: finalRxObj["prismL"] },
									{ text: finalRxObj["baseL"] },
								],
								[
									{ text: "Inter" },
									{ text: finalRxObj["sph_intR"] },
									{ text: finalRxObj["cyl_intR"] },
									{ text: finalRxObj["axis_intR"] },
									{ text: "" },
									{ text: "" },
									{ text: "", border: [false, false, false, false] }, // spacer - 6 col ok
									{ text: "Inter" },
									{ text: finalRxObj["sph_intL"] },
									{ text: finalRxObj["cyl_intL"] },
									{ text: finalRxObj["axis_intL"] },
									{ text: "" },
									{ text: "" },
								],
								[
									{ text: "Près" },
									{ text: finalRxObj["sph_closeR"] },
									{ text: finalRxObj["cyl_closeR"] },
									{ text: finalRxObj["axis_closeR"] },
									{ text: "" },
									{ text: "" },
									{ text: "", border: [false, false, false, false] }, // spacer - 6 col ok
									{ text: "Inter" },
									{ text: finalRxObj["sph_closeL"] },
									{ text: finalRxObj["cyl_closeL"] },
									{ text: finalRxObj["axis_closeL"] },
									{ text: "" },
									{ text: "" },
								],
							], // end of body
						}, // end of table
					}, // end of row
					{
						style: "add",
						margin: [80, 2, 10, 2],
						table: {
							body: [
								[
									{ text: "ADD" },
									{ text: finalRxObj["addR"] },
									{
										canvas: [
											{
												type: "rect",
												x: 0,
												y: 0,
												w: 230,
												h: 5,
												color: "white",
											},
										],
										border: [true, false, true, false],
									},
									{ text: "ADD" },
									{ text: finalRxObj["addL"] },
								],
							], // end of body
						}, // end of row
					}, // tableau prescription fin
					{
						text: "EQUIPEMENT",
						bold: true,
						alignment: "left",
						fontSize: 9,
					}, // end of row
					{
						alignment: "left",
						fontSize: 8,
						margin: [10, 2, 10, 2],
						columns: [
							[
								{
									text: "LENTILLES DE CONTACT OPTIQUE (Groupe 1)",
								},
								{
									margin: [15, 0, 10, 2],
									text: [
										{ text: finalRxObj["g1soft"] + " Lentilles souples " },
										{ text: finalRxObj["g1sspheric"] + " Spheriques " },
										{ text: finalRxObj["g1storic"] + " Toriques " },
									],
								},
								{
									margin: [15, 0, 10, 2],
									text: [
										{ text: finalRxObj["g1rigid"] + " Lentilles rigides " },
										{ text: finalRxObj["g1rspheric"] + " Spheriques " },
										{ text: finalRxObj["g1rtoric"] + " Toriques " },
									],
								},
								{
									text: "LENTILLES DE CONTACT SPECIFIQUES pour CORNEE IRREGULIERE (Groupe 2)",
								},
								{
									margin: [15, 0, 10, 2],
									text: [
										{ text: finalRxObj["g2soft"] + " souples ou hybrides " },
										{ text: finalRxObj["g2rigidc"] + " rigides cornéennes " },
										{
											text:
												finalRxObj["g2rigidcs"] + " rigides cornéo-sclérales ",
										},
										{
											text:
												finalRxObj["g2rigids"] + " rigides sclérales optiques",
										},
									],
								},
								{
									text: "LENTILLES DE CONTACT PARTICULIERES FAITES SUR MESURE (Groupe 3)",
								},
								{
									margin: [15, 0, 10, 2],
									text: [
										{ text: finalRxObj["g3iris"] + " souple à iris opaque " },
										{
											text: finalRxObj["g3pupil"] + " souple à pupille opaque ",
										},
									],
								},
							],
						],
					},
					{
						text: "Remarques: " + finalRxObj["remarks"],
						alignment: "left",
						fontSize: 8,
						bold: true,
						margin: [0, 2, 0, 2],
					}, // EQUIPEMENT fin
					{
						alignment: "left",
						fontSize: 8,
						columns: [
							[
								{
									text: "INDICATION MEDICALE selon Art.30 de la nomenclature\n",
								},
							], // left column
							[
								{
									margin: [15, 0, 10, 2],
									text: [
										{ text: finalRxObj["art30yes"] + " OUI " },
										{ text: finalRxObj["art30no"] + " NON\n" },
									],
								},
							], // right column
						], // end 2 columns table
					}, // art.30 end
					{
						style: "tableExample",
						margin: [0, 5, 0, 5],
						table: {
							widths: ["*", "*"],
							body: [
								[
									[
										// left column
										{
											text: [
												{
													fontSize: 6,
													alignment: "left",
													text: "Cachet du prescripteur:",
												},
											],
										},
										{
											margin: [0, 2, 0, 0],
											fontSize: 8,
											text: [
												{ text: finalRxObj["doctortitle"] + "\n", bold: true },
												{ text: finalRxObj["doctorinami"] },
											],
										},
										{
											fontSize: 6,
											text: [
												{ text: finalRxObj["centername"] + "\n" },
												{ text: "Tél: " + finalRxObj["centerphone"] + "\n" },
												{
													text: finalRxObj["centerurl"] + "\n",
													color: "blue",
													decoration: "underline",
													italics: "true",
												},
											],
										},
									], // left column end
									[
										{
											border: [true, false, false, false],
											text: [
												{
													fontSize: 6,
													alignment: "left",
													text: "Date et signature: \n",
												},
												{
													fontSize: 8,
													alignment: "left",
													text:
														finalRxObj["datestamp"]
															.split("-")
															.reverse()
															.join("/") + "\n",
													bold: true,
												},
											],
										},
										{ qr: finalRxObj["qrcode"], fit: 45, alignment: "center" },
										{
											margin: [0, 1, 0, 0],
											fontSize: 6,
											alignment: "center",
											text: "Signature électronique avancée\nconforme au Règlement (UE) n°910/2014 (eIDAS) \n",
										}, // TODO: add pki
									],
								], // right column end
							], // end of body
						}, // end of table
					}, // stamp end
					{
						alignment: "left",
						fontSize: 8,
						text: [
							{ text: "Email du prescripteur: " },
							{
								text: usermdObj["email"],
								color: "blue",
								decoration: "underline",
							},
						],
					},
					{
						text: "Réfraction des lentilles de contact (à remplir obligatoirement par l'adapateur des lentilles)",
						bold: true,
						alignment: "left",
						fontSize: 9,
					}, // end of row
					{
						margin: [0, 5, 0, 0],
						style: "tableExample", // table prescription
						table: {
							headerRows: 1,
							widths: [
								"*",
								"*",
								"*",
								"*",
								"*",
								"*",
								"*",
								"*",
								"*",
								"*",
								"*",
								"*",
							], // table 12 columns
							body: [
								[
									{ text: "D", bold: true, border: [false, false, true, true] },
									{ style: "tableHeader", text: "Sph" },
									{ text: "Cyl", style: "tableHeader" },
									{ text: "Axis", style: "tableHeader" },
									{ text: "BC", style: "tableHeader" },
									{ text: "DIA", style: "tableHeader" },
									{ text: "G", bold: true, border: [false, false, true, true] },
									{ text: "Sph", style: "tableHeader" },
									{ text: "Cyl", style: "tableHeader" },
									{ text: "Axis", style: "tableHeader" },
									{ text: "BC", style: "tableHeader" },
									{ text: "DIA", style: "tableHeader" },
								], // end table header 13 columns
								[
									{ text: "Loin" },
									{ text: finalRxObj["sphR"] },
									{ text: finalRxObj["cylR"] },
									{ text: finalRxObj["axisR"] },
									{ text: finalRxObj["basecurveR"] },
									{ text: finalRxObj["diameterR"] },
									{ text: "Loin" },
									{ text: finalRxObj["sphL"] },
									{ text: finalRxObj["cylL"] },
									{ text: finalRxObj["axisL"] },
									{ text: finalRxObj["basecurveL"] },
									{ text: finalRxObj["diameterL"] },
								],
								[
									{ text: "ADD" },
									{ text: finalRxObj["addcR"] },
									{ text: "", border: [false, false, false, false] },
									{ text: "", border: [false, false, false, false] },
									{ text: "", border: [false, false, false, false] },
									{ text: "", border: [false, false, false, false] },
									{ text: "ADD" },
									{ text: finalRxObj["addcL"] },
									{ text: "", border: [false, false, false, false] },
									{ text: "", border: [false, false, false, false] },
									{ text: "", border: [false, false, false, false] },
									{ text: "", border: [false, false, false, false] },
								],
							], // end of body
						}, // end of table
					}, //end of row
					{
						text: "SPECIFICATIONS LENTILLES DE CONTACT adaptées par: [X] OPHTALMOLOGUE [ ] OPTICIEN",
						alignment: "center",
						fontSize: 8,
						margin: [0, 2, 0, 2],
					}, // end of row
					{
						text:
							finalRxObj["rxsoft"] +
							" Lentilles de contact souples " +
							finalRxObj["rxrigid"] +
							" Lentilles de contact rigides ",
						alignment: "left",
						fontSize: 8,
					},
					{
						margin: [0, 0, 0, 0],
						style: "tableExample", // table contacts parameters
						table: {
							headerRows: 1,
							widths: ["*", "*", "*"],
							body: [
								[{ text: "" }, { text: "DROITE" }, { text: "GAUCHE" }], // end table header 3 columns
								[
									{ text: "Materiau" },
									{ text: finalRxObj["materialR"] },
									{ text: finalRxObj["materialL"] },
								],
								[
									{ text: "Design" },
									{ text: finalRxObj["designR"] },
									{ text: finalRxObj["designL"] },
								],
								[
									{ text: "Finition de bord" },
									{ text: finalRxObj["edgeR"] },
									{ text: finalRxObj["edgeL"] },
								],
								[
									{ text: "", border: [false, false, false, false] },
									{ text: "", border: [false, false, false, false] },
									{ text: "", border: [false, false, false, false] },
								], // end spacer
								[
									{ text: "Optical Zone" },
									{ text: finalRxObj["opticalzoneR"] },
									{ text: finalRxObj["opticalzoneL"] },
								],
								[
									{ text: "Base curve" },
									{ text: finalRxObj["basecurveR"] },
									{ text: finalRxObj["basecurveL"] },
								],
								[
									{ text: "Diamètre total" },
									{ text: finalRxObj["diameterR"] },
									{ text: finalRxObj["diameterL"] },
								],
								[
									{ text: "Paramètres supplémentaires" },
									{
										text:
											finalRxObj["lensnameR"] + "\n" + finalRxObj["cleaningR"],
									},
									{
										text:
											finalRxObj["lensnameL"] + "\n" + finalRxObj["cleaningL"],
									},
								],
							], // end of body
						}, // end of table
					}, //end of row
					{
						style: "tableExample",
						margin: [0, 5, 0, 5],
						table: {
							widths: ["*", "*"],
							body: [
								[
									[
										// left column
										{
											text: [
												{
													fontSize: 6,
													alignment: "left",
													text: "Cachet du prescripteur:",
												},
											],
										},
										{
											margin: [0, 2, 0, 0],
											fontSize: 8,
											text: [
												{ text: finalRxObj["doctortitle"] + "\n", bold: true },
												{ text: finalRxObj["doctorinami"] },
											],
										},
										{
											fontSize: 6,
											text: [
												{ text: finalRxObj["centername"] + "\n" },
												{ text: "Tél: " + finalRxObj["centerphone"] + "\n" },
												{
													text: finalRxObj["centerurl"] + "\n",
													color: "blue",
													decoration: "underline",
													italics: "true",
												},
											],
										},
									], // left column end
									[
										{
											border: [true, false, false, false],
											text: [
												{
													fontSize: 6,
													alignment: "left",
													text: "Date et signature: \n",
												},
												{
													fontSize: 8,
													alignment: "left",
													text:
														finalRxObj["datestamp"]
															.split("-")
															.reverse()
															.join("/") + "\n",
													bold: true,
												},
											],
										},
										{ qr: finalRxObj["qrcode"], fit: 45, alignment: "center" },
										{
											margin: [0, 1, 0, 0],
											fontSize: 6,
											alignment: "center",
											text: "Signature électronique avancée\nconforme au Règlement (UE) n°910/2014 (eIDAS) \n",
										}, // TODO: add pki
									],
								], // right column end
							], // end of body
						}, // end of table
					}, // stamp end
					{
						alignment: "left",
						fontSize: 8,
						text: [
							{ text: "Email de l'opticien: " },
							{ text: "", color: "blue", decoration: "underline" },
						],
					},
				], // content end
			}; // end of template
			// finalDbObj contains CxRxGlobalObj + uuid + blob pdfreport
			finalDbObj["uuid"] = data.unique_id;
			finalDbObj["pdf_report"] = JSON.stringify(finalPresc);
			let finalDbStr = JSON.stringify(finalDbObj);
			// console.log('finalDbObj:',finalDbObj);
			crudp("contacts_rx_list", "0", "POST", finalDbStr).then((data) =>
				$cxrx_tbl.bootstrapTable("refresh")
			);

			// Check actionType for email or print
			if (formObj["actionType"] === "email") {
				// Email functionality
				notifyUser("Sending email...", "info");

				// First create the PDF
				let pdf = pdfMake.createPdf(finalPresc);

				// Then get the base64 data
				pdf.getBase64((base64Data) => {
					// Prepare email data with the base64 data
					let emailData = {
						recipient: patientObj.email,
						subject: `Prescription de lentilles de ${patientObj.last_name.toUpperCase()} ${
							patientObj.first_name
						} | Centre Médical Bruxelles-Schuman`,
						content: `<p>Cher/Chère ${patientObj["first_name"]} ${patientObj["last_name"]},</p>
						<p>Veuillez trouver ci-joint votre prescription de lentilles de contact.</p>`,
						attachmentName: `prescription_lentilles_${patientObj.last_name}_${patientObj.first_name}.pdf`,
						attachmentData: base64Data,
						attachmentType: "application/pdf",
					};

					fetch(HOSTURL + "/" + APP_NAME + "/api/email/send_with_attachment", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(emailData),
					})
						.then((response) => response.json())
						.then((data) => {
							if (data.status === "success") {
								notifyUser("Email sent successfully", "success");
							} else {
								notifyUser("Failed to send email: " + data.message, "error");
							}
							// Close modal after email is sent
							$("#CxRxModal").modal("hide");
						})
						.catch((error) => {
							notifyUser("Error sending email: " + error, "error");
						});
				});
			} else {
				// Print functionality (original behavior)
				let pdf = pdfMake.createPdf(finalPresc);
				pdf.print();
				// Close modal after print
				$("#CxRxModal").modal("hide");
			}

			// Reset actionType to 'print' for next use
			$("#CxRxactionType").val("print");
			// document.getElementById('CxRxFormModal').reset();
			// Only close modal here if we're not sending email (handled in the email callback)
		});
});
