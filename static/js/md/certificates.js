// contacts prescriptions
// certificateObj contains id and options items
// CxRxGlobalObj merges CxRxRight and left

// Custom notification function as fallback when $.notify isn't available
function notifyUser(message, type) {
	// Check if $.notify is available
	if (typeof $.notify === "function") {
		try {
			$.notify(
				{
					message: message,
				},
				{
					type: type || "info",
					placement: {
						from: "bottom",
						align: "right",
					},
				}
			);
			return;
		} catch (e) {
			console.error("Error using $.notify:", e);
		}
	}

	// Fallback to a simple alert or toast if available
	if (
		typeof bootstrap !== "undefined" &&
		typeof bootstrap.Toast !== "undefined"
	) {
		// Create a Bootstrap toast
		const toastEl = document.createElement("div");
		toastEl.className = `toast align-items-center text-white bg-${
			type || "primary"
		} border-0`;
		toastEl.setAttribute("role", "alert");
		toastEl.setAttribute("aria-live", "assertive");
		toastEl.setAttribute("aria-atomic", "true");

		toastEl.innerHTML = `
			<div class="d-flex">
				<div class="toast-body">
					${message}
				</div>
				<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
			</div>
		`;

		document.body.appendChild(toastEl);
		const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
		toast.show();

		// Remove from DOM after hiding
		toastEl.addEventListener("hidden.bs.toast", function () {
			document.body.removeChild(toastEl);
		});
	} else {
		// Last resort: alert
		alert(message);
	}
}

var certificateObj = {};

certificateObj["doctorfirst"] = userObj["first_name"];
certificateObj["doctorlast"] = userObj["last_name"];
certificateObj["doctortitle"] =
	"Dr " + userObj["last_name"].toUpperCase() + " " + userObj["first_name"];
certificateObj["doctorinami"] = usermdObj["inami"]; // keep separations
certificateObj["doctoremail"] = usermdObj["email"];
certificateObj["centername"] =
	usermdObj["officename"] +
	"\n" +
	usermdObj["officeaddress"] +
	"\n" +
	usermdObj["officezip"] +
	" " +
	usermdObj["officetown"];
certificateObj["centerphone"] = usermdObj["officephone"];
certificateObj["centerurl"] = usermdObj["officeurl"];

certificateObj["qrcode"] =
	"Signed by " + certificateObj["doctortitle"] + " uuid:";

var reportObj = {};

// autoRx variable
var autorxObjFill = {
	sphR: "",
	cylR: "",
	axisR: "",
	vafR: "",
	sphL: "",
	cylL: "",
	axisL: "",
	vafR: "",
};
// gets all autoRx
function getRightAutoRx() {
	return $.get(API_RXRIGHT + "&rx_origin.eq=autorx");
}
function getLeftAutoRx() {
	return $.get(API_RXLEFT + "&rx_origin.eq=autorx");
}
$.when(getRightAutoRx(), getLeftAutoRx()).done(function (
	autorxRight,
	autorxLeft
) {
	// console.log(autorxRight['items']);
	if (autorxRight["items"] && autorxRight["items"].length > 0) {
		// console.log(autorxRight['items']);
		autorxObjFill["sphR"] = autorxRight["items"][0]["sph_far"];
		autorxObjFill["cylR"] = autorxRight["items"][0]["cyl_far"];
		autorxObjFill["axisR"] = autorxRight["items"][0]["axis_far"];
		// console.log('right:',autorxRight['items'][0]['sph_far']); // gets NEWEST autorx
	}
	if (autorxLeft["items"] && autorxLeft["items"].length > 0) {
		autorxObjFill["sphL"] = autorxLeft["items"][0]["sph_far"];
		autorxObjFill["cylL"] = autorxLeft["items"][0]["cyl_far"];
		autorxObjFill["axisL"] = autorxLeft["items"][0]["axis_far"];
		//console.log('right:',autorxLeft['items'][0]['sph_far']);
	}
	console.log(autorxObjFill);
});

// cycloRx variable
var cyclorxObjFill = {
	sphR: "",
	cylR: "",
	axisR: "",
	vafR: "",
	sphL: "",
	cylL: "",
	axisL: "",
	vafL: "",
};
// gets all autoRx
function getRightCycloRx() {
	return $.get(API_RXRIGHT + "&rx_origin.eq=cyclo");
}
function getLeftCycloRx() {
	return $.get(API_RXLEFT + "&rx_origin.eq=cyclo");
}
$.when(getRightCycloRx(), getLeftCycloRx()).done(function (
	cyclorxRight,
	cyclorxLeft
) {
	// console.log(cyclorxRight['items']);
	if (cyclorxRight["items"] && cyclorxRight["items"].length > 0) {
		// console.log(cyclorxRight['items']);
		cyclorxObjFill["sphR"] = cyclorxRight["items"][0]["sph_far"];
		cyclorxObjFill["cylR"] = cyclorxRight["items"][0]["cyl_far"];
		cyclorxObjFill["axisR"] = cyclorxRight["items"][0]["axis_far"];
		// console.log('right:',cyclorxRight['items'][0]['sph_far']); // gets NEWEST autorx
	}
	if (cyclorxLeft["items"] && cyclorxLeft["items"].length > 0) {
		cyclorxObjFill["sphL"] = cyclorxLeft["items"][0]["sph_far"];
		cyclorxObjFill["cylL"] = cyclorxLeft["items"][0]["cyl_far"];
		cyclorxObjFill["axisL"] = cyclorxLeft["items"][0]["axis_far"];
		//console.log('right:',cyclorxLeft['items'][0]['sph_far']);
	}
	console.log(cyclorxObjFill);
});

// trialRx variable
var trialrxObjFill = {
	sphR: "",
	cylR: "",
	axisR: "",
	vafR: "",
	sphL: "",
	cylL: "",
	axisL: "",
	vafL: "",
};
function getRightTrialRx() {
	return $.get(API_RXRIGHT + "&rx_origin.eq=trial");
}
function getLeftTrialRx() {
	return $.get(API_RXLEFT + "&rx_origin.eq=trial");
}
$.when(getRightTrialRx(), getLeftTrialRx()).done(function (
	trialrxRight,
	trialrxLeft
) {
	// console.log(trialrxRight['items']);
	if (trialrxRight["items"] && trialrxRight["items"].length > 0) {
		// console.log(trialrxRight['items']);
		trialrxObjFill["sphR"] = trialrxRight["items"][0]["sph_far"];
		trialrxObjFill["cylR"] = trialrxRight["items"][0]["cyl_far"];
		trialrxObjFill["axisR"] = trialrxRight["items"][0]["axis_far"];
		trialrxObjFill["vafR"] = trialrxRight["items"][0]["va_far"].toFixed(2);
		// console.log('right:',trialrxRight['items'][0]['sph_far']); // gets NEWEST autorx
	}
	if (trialrxLeft["items"] && trialrxLeft["items"].length > 0) {
		trialrxObjFill["sphL"] = trialrxLeft["items"][0]["sph_far"];
		trialrxObjFill["cylL"] = trialrxLeft["items"][0]["cyl_far"];
		trialrxObjFill["axisL"] = trialrxLeft["items"][0]["axis_far"];
		trialrxObjFill["vafL"] = trialrxLeft["items"][0]["va_far"].toFixed(2);
		//console.log('right:',trialrxLeft['items'][0]['sph_far']);
	}
	console.log(trialrxObjFill);
});

// tono variable
var tonoObjFill = {
	tonoR: "",
	pachyR: "",
	tonoL: "",
	pachyL: "",
};
function getRightTono() {
	return $.get(API_TONORIGHT);
}
function getLeftTono() {
	return $.get(API_TONOLEFT);
}
$.when(getRightTono(), getLeftTono()).done(function (tonoRight, tonoLeft) {
	// console.log(tonoRight['items']);
	if (tonoRight["items"] && tonoRight["items"].length > 0) {
		// console.log(tonoRight['items']);
		tonoObjFill["tonoR"] = tonoRight["items"][0]["tonometry"];
		tonoObjFill["pachyR"] = tonoRight["items"][0]["pachymetry"];
		// console.log('right:',tonoRight['items'][0]['tonometry']); // gets NEWEST tono
	}
	if (tonoLeft["items"] && tonoLeft["items"].length > 0) {
		// console.log(tonoLeft['items']);
		tonoObjFill["tonoL"] = tonoLeft["items"][0]["tonometry"];
		tonoObjFill["pachyL"] = tonoLeft["items"][0]["pachymetry"];
		// console.log('right:',tonoLeft['items'][0]['tonometry']); // gets NEWEST tono
	}
	console.log(tonoObjFill);
});

function presenceCert() {
	let certdefault = [
		"<p>Je, soussigné Docteur en Médecine, certifie avoir examiné: </p>",
	];
	certdefault.push(
		"<p><strong>" +
			patientObj["last_name"] +
			" " +
			patientObj["first_name"] +
			" DN" +
			patientObj["dob"].split("-").reverse().join("/") +
			" NN" +
			checkIfDataIsNull(patientObj["ssn"], "(n/a)") +
			"</strong></p>"
	);
	let today = new Date().addHours(timeOffsetInHours).toJSON().slice(11, 19);
	let creationstamp = new Date(wlObj["worklist"]["created_on"]).addHours(
		timeOffsetInHours * 2
	);
	let datecreation = creationstamp
		.toJSON()
		.slice(0, 10)
		.split("-")
		.reverse()
		.join("/");
	let timecreation = creationstamp.toJSON().slice(11, 19);
	certdefault.push(
		"<p> ce " + datecreation + " de " + timecreation + " à " + today + ".</p>"
	);
	certdefault.push(
		"<p>Je reste à votre disposition pour toute information complémentaire.</p>"
	);
	return certdefault.join("");
}

function sickCert(onset, ended, exit) {
	let certdefault = [
		"<p>Je, soussigné Docteur en Médecine, certifie avoir examiné: </p>",
	];
	certdefault.push(
		"<p><strong>" +
			patientObj["last_name"] +
			" " +
			patientObj["first_name"] +
			" DN" +
			patientObj["dob"].split("-").reverse().join("/") +
			" NN" +
			checkIfDataIsNull(patientObj["ssn"], "(n/a)") +
			"</strong></p>"
	);
	let today = new Date().addHours(timeOffsetInHours).toJSON().slice(11, 19);
	let creationstamp = new Date(wlObj["worklist"]["created_on"]).addHours(
		timeOffsetInHours * 2
	);
	let datecreation = creationstamp
		.toJSON()
		.slice(0, 10)
		.split("-")
		.reverse()
		.join("/");
	let timecreation = creationstamp.toJSON().slice(11, 19);
	certdefault.push(
		"<p> ce " + datecreation + " de " + timecreation + " à " + today + ".</p>"
	);
	let start = onset.split("-").reverse().join("/"),
		end = ended.split("-").reverse().join("/");
	certdefault.push(
		"<p> Ce patient est inapte au travail du <strong>" +
			start +
			" au " +
			end +
			" inclus</strong>.</p>"
	);
	if (exit == "no") {
		certdefault.push(
			"<p>Les sorties <strong>ne sont pas autorisées</strong>.</p>"
		);
	} else {
		certdefault.push("<p>Les sorties sont <strong>autorisées</strong>.</p>");
	}
	certdefault.push(
		"<p>Je reste à votre disposition pour toute information complémentaire.</p>"
	);
	return certdefault.join("");
}

var sickModal = document.getElementById("sickModal");
sickModal.addEventListener("show.bs.modal", function (e) {
	let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0, 10);
	$("#onsetsick").val(today);
	$("#endedsick").val(today);
});

function freeCert() {
	let certdefault = [];
	certdefault.push("<p>J'ai examiné: </p>");
	certdefault.push(
		"<p><strong>" +
			patientObj["last_name"] +
			" " +
			patientObj["first_name"] +
			" DN" +
			patientObj["dob"].split("-").reverse().join("/") +
			" NN" +
			checkIfDataIsNull(patientObj["ssn"], "(n/a)") +
			"</strong></p>"
	);
	let creationstamp = new Date(wlObj["worklist"]["created_on"]).addHours(
		timeOffsetInHours * 2
	);
	let datecreation = creationstamp
		.toJSON()
		.slice(0, 10)
		.split("-")
		.reverse()
		.join("/");
	let timecreation = creationstamp.toJSON().slice(11, 19);
	certdefault.push("<p> ce " + datecreation + " à " + timecreation + ".</p>");
	certdefault.push(
		"<p>Je reste à votre disposition pour toute information complémentaire.</p>"
	);
	certdefault.push("<p>Cordialement,</p>");
	certdefault.push(
		"<p><strong>Dr." +
			userObj["last_name"].toUpperCase() +
			" " +
			userObj["first_name"] +
			" " +
			"</strong></p>"
	);
	return certdefault.join("");
}

function docCert() {
	let certdefault = [];
	certdefault.push("<p>Cher Confrère, chère Consoeur, </p>");
	certdefault.push(
		"<p>J'ai examiné: <strong>" +
			patientObj["last_name"] +
			" " +
			patientObj["first_name"] +
			" DN" +
			patientObj["dob"].split("-").reverse().join("/") +
			" NN" +
			checkIfDataIsNull(patientObj["ssn"], "(n/a)") +
			"</strong> "
	);
	let creationstamp = new Date(wlObj["worklist"]["created_on"]).addHours(
		timeOffsetInHours * 2
	);
	let datecreation = creationstamp
		.toJSON()
		.slice(0, 10)
		.split("-")
		.reverse()
		.join("/");
	let timecreation = creationstamp.toJSON().slice(11, 19);
	certdefault.push("ce " + datecreation + " à " + timecreation + ".</p>");
	certdefault.push("<p>L'examen montre:");
	certdefault.push("<ul>");
	certdefault.push("<li>une acuité visuelle avec la correction optimale:</li>");
	certdefault.push("<ul>");
	certdefault.push(
		`<li> Oeil droit (OD) : ${trialrxObjFill["vafR"]} ${trialrxObjFill["sphR"]}(${trialrxObjFill["cylR"]} x ${trialrxObjFill["axisR"]}°)</li>`
	);
	certdefault.push(
		`<li> Oeil gauche (OG): ${trialrxObjFill["vafL"]} ${trialrxObjFill["sphL"]}(${trialrxObjFill["cylL"]} x ${trialrxObjFill["axisL"]} °)</li>`
	);
	certdefault.push("</ul>");
	certdefault.push("</li>");
	certdefault.push(
		`<li>une tension oculaire mesurée à l\'air pulsé respective de OD: ${tonoObjFill["tonoR"]}mmHg/${tonoObjFill["pachyR"]}µm et OG: ${tonoObjFill["tonoL"]}mmHg/${tonoObjFill["pachyL"]}µm </li>`
	);
	certdefault.push("<li>une biomicroscopie antérieure:");
	certdefault.push("<ul>");
	certdefault.push("<li>OD: sans particularité</li>");
	certdefault.push("<li>OG: sans particularité</li>");
	certdefault.push("</ul>");
	certdefault.push("</li>");
	certdefault.push("<li>une biomicroscopie postérieure:");
	certdefault.push("<ul>");
	certdefault.push("<li>OD: sans particularité</li>");
	certdefault.push("<li>OG: sans particularité</li>");
	certdefault.push("</ul>");
	certdefault.push("</li>");
	certdefault.push("</ul>");
	certdefault.push("</p>");
	certdefault.push("<p><strong>En conclusion:</strong>");
	certdefault.push("<ol>");
	certdefault.push("<li>Conclusion 1</li>");
	certdefault.push("<li>Conclusion 2</li>");
	certdefault.push("</ol>");
	certdefault.push("</p>");
	certdefault.push("<p>Un contrôle annuel est souhaitable.</p>");
	certdefault.push(
		"<p>Je reste à votre disposition pour toute information complémentaire.</p>"
	);
	certdefault.push("<p>Cordialement,</p>");
	certdefault.push(
		"<p><strong>Dr." +
			userObj["last_name"].toUpperCase() +
			" " +
			userObj["first_name"] +
			" " +
			"</strong></p>"
	);
	return certdefault.join("");
}

function orthoCert() {
	let orthodefault = [];
	orthodefault.push("<p>Cher Confrère, chère Consoeur, </p>");
	orthodefault.push(
		"<p>J'ai examiné: <strong>" +
			patientObj["last_name"] +
			" " +
			patientObj["first_name"] +
			" DN" +
			patientObj["dob"].split("-").reverse().join("/") +
			" NN" +
			checkIfDataIsNull(patientObj["ssn"], "(n/a)") +
			"</strong> "
	);
	let dbstamp = new Date(wlObj["worklist"]["created_on"]);
	let creationstamp = dbstamp.addHours(timeOffsetInHours * 2);
	let datecreation = creationstamp
		.toJSON()
		.slice(0, 10)
		.split("-")
		.reverse()
		.join("/");
	let timecreation = creationstamp.toJSON().slice(11, 19);
	orthodefault.push("ce " + datecreation + " à " + timecreation + ".</p>");
	orthodefault.push(
		"<p>Il/Elle nécessite une <strong>rééducation orthoptique de 10 séances (771536)</strong> à raison de <strong>2 fois par semaine</strong>, "
	);
	orthodefault.push(
		"pour une <strong>insuffisance de convergence</strong>, dans le but d'<strong>améliorer son amplitude de fusion</strong>.<p>"
	);
	orthodefault.push(
		"<p>Je reste à votre disposition pour toute information complémentaire.</p>"
	);
	orthodefault.push("<p>Cordialement,</p>");
	orthodefault.push(
		"<p><strong>Dr." +
			userObj["last_name"].toUpperCase() +
			" " +
			userObj["first_name"] +
			" " +
			"</strong></p>"
	);
	return orthodefault.join("");
}

function preopCert() {
	let preopdefault = [];
	preopdefault.push("<p>Cher Confrère, chère Consoeur, </p>");
	preopdefault.push(
		"<p>J'ai examiné: <strong>" +
			patientObj["last_name"] +
			" " +
			patientObj["first_name"] +
			" DN" +
			patientObj["dob"].split("-").reverse().join("/") +
			" NN" +
			checkIfDataIsNull(patientObj["ssn"], "(n/a)") +
			"</strong> "
	);
	let dbstamp = new Date(wlObj["worklist"]["created_on"]);
	let creationstamp = dbstamp.addHours(timeOffsetInHours * 2);
	let datecreation = creationstamp
		.toJSON()
		.slice(0, 10)
		.split("-")
		.reverse()
		.join("/");
	let timecreation = creationstamp.toJSON().slice(11, 19);
	preopdefault.push("ce " + datecreation + " à " + timecreation + " ");
	preopdefault.push(
		"dans le cadre d'un examen préopératoire à une <strong>chirurgie réfractive de l'oeil droit et de l'oeil gauche</strong> prévue le <strong>" +
			datecreation +
			"</strong>.</p>"
	);
	preopdefault.push("<p>L'examen montre:");
	preopdefault.push("<ul>");
	preopdefault.push(
		"<li>la réfraction objective suivante sous <strong>cyloplégie</strong>:</li>"
	);
	preopdefault.push("<ul>");
	preopdefault.push(
		`<li> Oeil droit (OD) : ${cyclorxObjFill["sphR"]}(${cyclorxObjFill["cylR"]} x ${cyclorxObjFill["axisR"]}°)</li>`
	);
	preopdefault.push(
		`<li> Oeil gauche (OG): ${cyclorxObjFill["sphL"]}(${cyclorxObjFill["cylL"]} x ${cyclorxObjFill["axisL"]} °)</li>`
	);
	preopdefault.push("</ul>");
	preopdefault.push("</li>");
	preopdefault.push(
		"<li>une acuité visuelle <strong>avec la correction optimale</strong>:</li>"
	);
	preopdefault.push("<ul>");
	preopdefault.push(`<li> OD: ${trialrxObjFill["vafR"]}</li>`);
	preopdefault.push(`<li> OG: ${trialrxObjFill["vafL"]}</li>`);
	preopdefault.push("</ul>");
	preopdefault.push("</li>");
	preopdefault.push("</ul>");
	preopdefault.push("</p>");
	preopdefault.push("<p>Je joins à ce certificat le devis n° .</p>");
	preopdefault.push(
		"<p>Je reste à votre disposition pour toute information complémentaire.</p>"
	);
	preopdefault.push("<p>Cordialement,</p>");
	preopdefault.push(
		"<p><strong>Dr." +
			userObj["last_name"].toUpperCase() +
			" " +
			userObj["first_name"] +
			" " +
			"</strong></p>"
	);
	return preopdefault.join("");
}

function postopCert() {
	let postopdefault = [];
	postopdefault.push("<p>Cher Confrère, chère Consoeur, </p>");
	postopdefault.push(
		"<p>J'ai examiné: <strong>" +
			patientObj["last_name"] +
			" " +
			patientObj["first_name"] +
			" DN" +
			patientObj["dob"].split("-").reverse().join("/") +
			" NN" +
			checkIfDataIsNull(patientObj["ssn"], "(n/a)") +
			"</strong> "
	);
	let dbstamp = new Date(wlObj["worklist"]["created_on"]);
	let creationstamp = dbstamp.addHours(timeOffsetInHours * 2);
	let datecreation = creationstamp
		.toJSON()
		.slice(0, 10)
		.split("-")
		.reverse()
		.join("/");
	let timecreation = creationstamp.toJSON().slice(11, 19);
	postopdefault.push("ce " + datecreation + " à " + timecreation + " ");
	postopdefault.push(
		"dans le cadre d'un examen postopératoire à une <strong>chirurgie réfractive de l'oeil droit et de l'oeil gauche</strong> ayant eu lieu le <strong>" +
			datecreation +
			"</strong>.</p>"
	);
	postopdefault.push("<p>L'examen préopératoire <strong>du 01/01/2025</strong> montrait:");
	postopdefault.push("<ul>");
	postopdefault.push("<li>la réfraction cycloplégique suivante:</li>");
	postopdefault.push("<ul>");
	postopdefault.push(
		`<li> Oeil droit (OD) : ${autorxObjFill["sphR"]}(${autorxObjFill["cylR"]} x ${autorxObjFill["axisR"]}°)</li>`
	);
	postopdefault.push(
		`<li> Oeil gauche (OG): ${autorxObjFill["sphL"]}(${autorxObjFill["cylL"]} x ${autorxObjFill["axisL"]} °)</li>`
	);
	postopdefault.push("</ul>");
	postopdefault.push("</li>");
	postopdefault.push("<p>L'examen de ce jour montre:");
	postopdefault.push("<ul>");
	postopdefault.push("<li>la réfraction objective suivante:</li>");
	postopdefault.push("<ul>");
	postopdefault.push(
		`<li> Oeil droit (OD) : ${autorxObjFill["sphR"]}(${autorxObjFill["cylR"]} x ${autorxObjFill["axisR"]}°)</li>`
	);
	postopdefault.push(
		`<li> Oeil gauche (OG): ${autorxObjFill["sphL"]}(${autorxObjFill["cylL"]} x ${autorxObjFill["axisL"]} °)</li>`
	);
	postopdefault.push("</ul>");
	postopdefault.push("</li>");
	postopdefault.push(
		"<li>une acuité visuelle <strong>sans correction</strong>:</li>"
	);
	postopdefault.push("<ul>");
	postopdefault.push(`<li> OD: 1.0</li>`);
	postopdefault.push(`<li> OG: 1.0</li>`);
	postopdefault.push("</ul>");
	postopdefault.push("</li>");
	postopdefault.push("</ul>");
	postopdefault.push("</p>");
	postopdefault.push("<p>Je joins à ce certificat la facture n° .</p>");
	postopdefault.push(
		"<p>Je reste à votre disposition pour toute information complémentaire.</p>"
	);
	postopdefault.push("<p>Cordialement,</p>");
	postopdefault.push(
		"<p><strong>Dr." +
			userObj["last_name"].toUpperCase() +
			" " +
			userObj["first_name"] +
			" " +
			"</strong></p>"
	);
	return postopdefault.join("");
}

var certificateModal = document.getElementById("certificateModal");
certificateModal.addEventListener("show.bs.modal", function (event) {
	let certdefault = ['<div style="text-align:left">'];
	let btn = event.relatedTarget;
	// set default form values
	let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0, 10);
	$("#certificateOnset").val(today);
	$("#certificateEnded").val(today);
	$("#certificateDest").val("A QUI DE DROIT");
	$("#certificateTitle").val("CERTIFICAT MEDICAL");
	// Add hidden input for actionType with default "print"
	$("#certificateActionType").val("print");
	// check certificate category
	if ($(btn).data("certFlag") == "presence") {
		console.log("presence cert!");
		certdefault.push(presenceCert());
	} else if ($(btn).data("certFlag") == "sick") {
		console.log("sick leave cert!");
		let onset = $("#onsetsick").val(),
			ended = $("#endedsick").val(),
			exit = $("#sickFormModal input[name=exit]:checked").val();
		$("#certificateOnset").val(onset);
		$("#certificateEnded").val(ended);
		certdefault.push(sickCert(onset, ended, exit));
	} else if ($(btn).data("certFlag") == "doc") {
		console.log("doc cert!");
		$("#certificateDest").val("AU MEDECIN DE DROIT");
		$("#certificateTitle").val("RAPPORT MEDICAL");
		certdefault.push(docCert());
	} else if ($(btn).data("certFlag") == "ortho") {
		$("#certificateDest").val("AU MEDECIN CONSEIL");
		$("#certificateTitle").val("PRESCRIPTION");
		certdefault.push(orthoCert());
	} else if ($(btn).data("certFlag") == "preop") {
		$("#certificateDest").val("AU MEDECIN CONSEIL");
		$("#certificateTitle").val("RAPPORT MEDICAL");
		certdefault.push(preopCert());
	} else if ($(btn).data("certFlag") == "postop") {
		$("#certificateDest").val("AU MEDECIN CONSEIL");
		$("#certificateTitle").val("RAPPORT MEDICAL");
		certdefault.push(postopCert());
	} else {
		console.log("free cert");
		certdefault.push(freeCert());
	}
	$("#certificateFormModal input[name=category]").val($(btn).data("certFlag"));
	// set default text
	certdefault.push("</div>");
	let certhtml = certdefault.join("");
	console.log("certhtml:", certhtml);
	tinymce.get("certificateContent").setContent(certhtml);
});

// Add event listener for the email button
$(document).on("click", "#emailCertificateBtn", function () {
	// Set the action type to email
	$("#certificateActionType").val("email");

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

	// Add debug logging
	console.log(
		"Email button clicked, actionType set to:",
		$("#certificateActionType").val()
	);
	console.log("Patient email:", patientObj["email"]);

	// Trigger the form submission
	$("#btncertificateModalSubmit").click();
});

// Add event listener for modal show to pre-populate email
$("#certificateModal").on("show.bs.modal", function (e) {
	// Pre-populate email field with patient's email
	$("#certificateEmailInput").val(patientObj.email || "");
});

$("#certificateFormModal").submit(function (e) {
	e.preventDefault();
	let formStr = $(this).serializeJSON();
	let formObj = JSON.parse(formStr);
	console.log("Certificate form data:", formObj); // Log form data including actionType
	let certContent = tinyMCE.get("certificateContent").getContent();
	console.log("content:", certContent);
	let fromTinyMce = htmlToPdfmake(certContent);
	console.log("from tinyMCE:", fromTinyMce);

	// Get the action type - default to print if not specified
	let actionType = formObj["actionType"] || "print";
	console.log("Action type:", actionType);

	fetch(HOSTURL + "/" + APP_NAME + "/api/uuid", { method: "GET" })
		.then((response) => response.json())
		.then((data) => {
			// clone certificateObj
			console.log("certificateObj", certificateObj);
			let finalRxObj = Object.assign({}, certificateObj);
			let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0, 10);
			finalRxObj["datestamp"] = today;
			finalRxObj["qrcode"] = finalRxObj["qrcode"] + data.unique_id; // already string
			finalRxObj["first_name"] = patientObj["first_name"];
			finalRxObj["last_name"] = patientObj["last_name"];
			finalRxObj["dob"] = patientObj["dob"].split("-").reverse().join("/");
			finalRxObj["destination"] = formObj["destination"];
			finalRxObj["title"] = formObj["title"];
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
						margin: [0, 20, 0, 20],
						alignment: "center",
						fontSize: 14,
						text: [finalRxObj["title"]],
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
						style: "title",
						margin: [0, 20, 0, 20],
						text: finalRxObj["destination"],
						alignment: "left",
						bold: true,
						fontSize: 12,
						decoration: "underline",
					},
					{
						margin: [20, 20, 20, 20],
						columns: [fromTinyMce],
					},
					{
						style: "tableExample",
						margin: [0, 20, 0, 20],
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
													fontSize: 6,
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
				], // content end
			}; // end of template
			// finalDbObj contains uuid + blob pdfreport
			let finalDbObj = {};
			finalDbObj["uuid"] = data.unique_id;
			finalDbObj["id_auth_user"] = patientId;
			finalDbObj["id_worklist"] = wlId;
			finalDbObj["onset"] = formObj["onset"];
			finalDbObj["ended"] = formObj["ended"];
			finalDbObj["datestamp"] = today;
			finalDbObj["category"] = formObj["category"];
			finalDbObj["pdf_report"] = JSON.stringify(finalPresc);
			let finalDbStr = JSON.stringify(finalDbObj);
			console.log("finalDbObj:", finalDbObj);

			// Save certificate to database first
			crudp("certificates", "0", "POST", finalDbStr)
				.then((data) => {
					console.log("Certificate saved to database:", data);
					$cert_tbl.bootstrapTable("refresh");

					// Handle action based on type
					if (actionType === "print") {
						console.log("Printing certificate...");
						try {
							const pdfDocGenerator = pdfMake.createPdf(finalPresc);
							pdfDocGenerator.print();
							$("#certificateModal").modal("hide");
						} catch (printError) {
							console.error("Error printing PDF:", printError);
							notifyUser(
								"Erreur lors de l'impression du PDF: " + printError.message,
								"danger"
							);
							$("#certificateModal").modal("hide");
						}
					} else if (actionType === "email") {
						console.log("Preparing certificate for email...");
						
						// Get email from input field
						const emailAddress = $("#certificateEmailInput").val().trim();
						
						// Validate email
						if (!emailAddress || !emailAddress.includes("@")) {
							console.error("Invalid email address provided");
							notifyUser("Veuillez fournir une adresse email valide", "danger");
							$("#certificateModal").modal("hide");
							return;
						}

						try {
							console.log("Creating PDF for email...");
							const pdfDocGenerator = pdfMake.createPdf(finalPresc);
							pdfDocGenerator.getBase64((base64Data) => {
								if (!base64Data) {
									throw new Error("PDF conversion failed - no data returned");
								}

								// Prepare email data
								const titleWords = finalRxObj["title"].toLowerCase().split(" ");
								const capitalizedTitle = titleWords
									.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
									.join(" ");

								const emailData = {
									recipient: emailAddress,
									subject: `${capitalizedTitle} de ${patientObj[
										"last_name"
									].toUpperCase()} ${
										patientObj["first_name"]
									} | Centre Médical Bruxelles-Schuman`,
									content: `<p>Cher/Chère ${patientObj["first_name"]} ${
										patientObj["last_name"]
									},</p>
											<p>Veuillez trouver ci-joint votre ${finalRxObj["title"].toLowerCase()}.</p>`,
									attachmentName: `${today.substring(2, 4)}${today.substring(
										5,
										7
									)}${today.substring(8, 10)}_${finalRxObj["title"]
										.toLowerCase()
										.replace(/\s+/g, "_")}_${patientObj[
										"last_name"
									].toUpperCase()}_${
										patientObj["first_name"]
									}_Centre_Médical_Bruxelles-Schuman.pdf`,
									attachmentData: base64Data,
									attachmentType: "application/pdf",
								};

								// Send email
								fetch(
									HOSTURL + "/" + APP_NAME + "/api/email/send_with_attachment",
									{
										method: "POST",
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify(emailData),
									}
								)
									.then((response) => {
										if (!response.ok) {
											throw new Error(
												`Network response error: ${response.status} ${response.statusText}`
											);
										}
										return response.json();
									})
									.then((data) => {
										console.log("Email sent successfully");
										notifyUser("Email envoyé avec succès", "success");
										$("#certificateModal").modal("hide");
									})
									.catch((error) => {
										console.error("Error sending email:", error);
										notifyUser(
											"Erreur lors de l'envoi de l'email: " + error.message,
											"danger"
										);
										$("#certificateModal").modal("hide");
									});
							});
						} catch (error) {
							console.error("Error preparing PDF for email:", error);
							notifyUser(
								"Erreur lors de la préparation du PDF: " + error.message,
								"danger"
							);
							$("#certificateModal").modal("hide");
						}
					}
				})
				.catch((error) => {
					console.error("Error saving certificate:", error);
					notifyUser(
						"Erreur lors de la sauvegarde du certificat: " + error.message,
						"danger"
					);
					$("#certificateModal").modal("hide");
				});
		});
});

let emailInfoModal = document.getElementById("emailInfoModal");
emailInfoModal.addEventListener("show.bs.modal", function (event) {
	let btn = event.relatedTarget;
	let emaildefault = ['<div style="text-align:left">'];
	emaildefault.push("<p>Chère Patiente, Cher Patient,</p>");
	emaildefault.push(
		"<p>Voici un lien qui contient des informations en complément de votre dernière consultation.</p>"
	);
	emaildefault.push(
		'<p><a href="https://ophtalmologiste.be/chirurgie/chirurgie-refractive/">https://ophtalmologiste.be/chirurgie/chirurgie-refractive/</a></p>'
	);
	emaildefault.push(
		'<p><a href="https://ophtalmologiste.be/medical/glaucome/">https://ophtalmologiste.be/medical/glaucome/</a></p>'
	);
	emaildefault.push(
		'<p><a href="https://ophtalmologiste.be/tech/laser_yag/#iridotomy">https://ophtalmologiste.be/tech/laser_yag/#iridotomy</a></p>'
	);
	emaildefault.push(
		'<p><a href="https://ophtalmologiste.be/tech/laser_yag/#slt">https://ophtalmologiste.be/tech/laser_yag/#slt</a></p>'
	);
	emaildefault.push(
		"<p>Si vous avez des questions complémentaires, vous pouvez répondre à cet email.</p>"
	);
	emaildefault.push("<p></p>");
	emaildefault.push("<p>Chère Patiente, Cher Patient,</p>");
	emaildefault.push(
		"<p>Vous avez récemment été examiné dans notre Centre Médical Bruxelles-Schuman lors d'une visite ophtalmologique.</p>"
	);
	emaildefault.push(
		"<p>Si vous l'avez appréciée, vous pouvez laisser votre avis sur le lien suivant:</p>"
	);
	emaildefault.push(
		'<a href="https://g.page/r/CacxcDCleFcoEAg/review">https://g.page/r/CacxcDCleFcoEAg/review</a>'
	);
	emaildefault.push(
		"<p>Nous vous remercions d'avance pour le temps que vous nous avez consacré.</p>"
	);
	emaildefault.push(
		"<p>----------------------------------------------------</p>"
	);
	emaildefault.push("<p>Dear Patient,</p>");
	emaildefault.push(
		"<p>You've done a recent visit at the Brussels-Schuman Medical Center for a medical eye check.</p>"
	);
	emaildefault.push(
		"<p>If you did appreciate it, please leave your review on the following link:</p>"
	);
	emaildefault.push(
		'<a href="https://g.page/r/CacxcDCleFcoEAg/review">https://g.page/r/CacxcDCleFcoEAg/review</a>'
	);
	emaildefault.push(
		"<p>We thank you already for the time you spent on this evaluation.</p>"
	);
	emaildefault.push("</div>");
	$("#emailInfoFormModal input[name=category]").val($(btn).data("certFlag"));
	// set default text
	emaildefault.push("</div>");
	let emailhtml = emaildefault.join("");
	console.log("emailhtml: ", emailhtml);
	tinymce.get("emailContent").setContent(emailhtml);
});

$("#emailInfoFormModal").submit(function (e) {
	let formStr = $(this).serializeJSON();
	let formObj = JSON.parse(formStr);
	console.log("Email info form data:", formObj); // Log form data
	e.preventDefault();
	let emailContent = tinyMCE.get("emailContent").getContent();
	console.log("Email content length:", emailContent.length); // Log content length

	console.log(
		"Sending regular email to API:",
		HOSTURL + "/" + APP_NAME + "/api/email/send"
	);
	fetch(HOSTURL + "/" + APP_NAME + "/api/email/send", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			recipient: patientObj["email"],
			content: emailContent,
		}),
	})
		.then((response) => {
			console.log("Regular email API response status:", response.status);
			let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0, 10);
			$("#emailInfoModal").modal("hide");
			let finalDbObj = {};
			let responseBlob = new Blob([response], {
				type: "application/json",
			});
			finalDbObj["id_auth_user"] = patientId;
			finalDbObj["id_worklist"] = wlId;
			finalDbObj["datestamp"] = today;
			finalDbObj["category"] = formObj["category"];
			finalDbObj["pdf_report"] = JSON.stringify(response);
			let finalDbStr = JSON.stringify(finalDbObj);
			console.log("finalDbObj for regular email:", finalDbObj);
			crudp("certificates", "0", "POST", finalDbStr).then((data) => {
				console.log("Certificate record created for regular email");
				$cert_tbl.bootstrapTable("refresh");
			});
			return response.json();
		})
		.then((data) => {
			console.log("Regular email API response data:", data);
		})
		.catch((error) => {
			console.error(
				"There was a problem with the regular email fetch operation:",
				error.message
			);
		});
});
