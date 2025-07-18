// refresh tables
// refreshTables(tablesArr);

// remove class top-fixed from topnav
document.getElementById("topNavbar").classList.remove("fixed-top");

// frequency autocomplete
$("#mxModal input[name=frequency]").autoComplete({
	bootstrapVersion: "4",
	minLength: "1",
	resolverSettings: {
		url: API_AUTODICT + "frequency",
		queryKey: "keyoption.contains",
	},
	events: {
		searchPost: function (res) {
			return res.items;
		},
	},
	formatResult: function (item) {
		return {
			value: item.id,
			text: item.keyoption,
		};
	},
});

// medication autocomplete
$("#mxModal input[name=medication]").autoComplete({
	bootstrapVersion: "4",
	minLength: "1",
	resolver: "custom",
	events: {
		search: function (searchText, callback) {
			$.ajax({
				url: API_MEDICATIONS,
				method: "GET",
				data: { "name.contains": searchText },
				dataType: "json",
			})
				.done(function (response) {
					callback(response && response.items ? response.items : []);
				})
				.fail(function (xhr, status, error) {
					console.warn("Medication autocomplete API error:", error);
					callback([]);
				});
		},
		searchPost: function (res) {
			if (!res || res.length == 0) {
				$("#mxModal input[name=id_medic_ref]").val("");
			}
			return res || [];
		},
	},
	formatResult: function (item) {
		// console.log(item.id);
		$("#mxModal input[name=id_medic_ref]").val(item.id);
		$("#mxModal input[name=delivery]").val([item.delivery]);
		return {
			text: item.name,
		};
	},
});

// agent autocomplete
$("#axModal input[name=agent]").autoComplete({
	bootstrapVersion: "4",
	minLength: "1",
	resolverSettings: {
		url: API_AGENTS,
		queryKey: "name.contains",
	},
	events: {
		searchPost: function (res) {
			if (!res || res.count == 0) {
				$("#axModal input[name=id_agent]").val("");
			}
			return res && res.items ? res.items : [];
		},
	},
	formatResult: function (item) {
		$("#axModal input[name=id_agent]").val(item.id);
		return {
			text: item.name,
		};
	},
});

// disease title autocomplete
$("#mHxModal input[name=title]").autoComplete({
	bootstrapVersion: "4",
	minLength: "1",
	resolverSettings: {
		url: API_DISEASES,
		queryKey: "title.contains",
	},
	events: {
		searchPost: function (res) {
			if (!res || res.count == 0) {
				$("#mHxModal input[name=id_disease_ref]").val("");
				console.log("Disease not in dict");
			}
			return res && res.items ? res.items : [];
		},
	},
	formatResult: function (item) {
		$("#mHxModal input[name=id_disease_ref]").val(item.id);
		return {
			text: item.title,
		};
	},
});

// lens right autocomplete
$("#CxRxFormModal input[name=lensnameR]").autoComplete({
	bootstrapVersion: "4",
	minLength: "1",
	resolverSettings: {
		url: API_LENSES,
		queryKey: "name.contains",
	},
	events: {
		searchPost: function (res) {
			if (!res || res.count == 0) {
				// $('#mxModal input[name=id_medic_ref]').val('');
			}
			return res && res.items ? res.items : [];
		},
	},
	formatResult: function (item) {
		// console.log(item);
		$("#CxRxFormModal input[name=materialR]").val(
			checkIfDataIsNull(item.material, "-")
		);
		$("#CxRxFormModal input[name=designR]").val(
			checkIfDataIsNull(item.design, "-")
		);
		$("#CxRxFormModal input[name=edgeR]").val(
			checkIfDataIsNull(item.edge, "-")
		);
		$("#CxRxFormModal input[name=opticalzoneR]").val(
			checkIfDataIsNull(item.opticalzone, "-")
		);
		$("#CxRxFormModal input[name=basecurveR]").val(
			checkIfDataIsNull(item.basecurve, "-")
		);
		$("#CxRxFormModal input[name=diameterR]").val(
			checkIfDataIsNull(item.diameter, "-")
		);
		if (item.rigidity == "soft") {
			if (item.toricity != true) {
				// console.log('Lens choosen if soft spheric');
				$("#CxRxModal input[name=g1sspheric]")
					.prop("checked", true)
					.trigger("change");
				$("#CxRxModal input[name=g1storic]").prop("checked", false);
			} else {
				// console.log('Lens choosen if soft toric');
				$("#CxRxModal input[name=g1storic]")
					.prop("checked", true)
					.trigger("change");
				$("#CxRxModal input[name=g1sspheric]").prop("checked", false);
			}
		} else {
			// other than soft
			$("#CxRxModal input[name=g1sspheric]")
				.prop("checked", false)
				.trigger("change");
			$("#CxRxModal input[name=g1storic]")
				.prop("checked", false)
				.trigger("change");
		}
		return {
			text: item.name + " (" + item.brand + ")",
		};
	},
});

$("#CxRxFormModal input[name=lensnameL]").autoComplete({
	bootstrapVersion: "4",
	minLength: "1",
	resolverSettings: {
		url: API_LENSES,
		queryKey: "name.contains",
	},
	events: {
		searchPost: function (res) {
			if (!res || res.count == 0) {
			}
			return res && res.items ? res.items : [];
		},
	},
	formatResult: function (item) {
		// console.log(item);
		$("#CxRxModal input[name=materialL]").val(
			checkIfDataIsNull(item.material, "-")
		);
		$("#CxRxModal input[name=designL]").val(
			checkIfDataIsNull(item.design, "-")
		);
		$("#CxRxModal input[name=edgeL]").val(checkIfDataIsNull(item.edge, "-"));
		$("#CxRxModal input[name=opticalzoneL]").val(
			checkIfDataIsNull(item.opticalzone, "")
		);
		$("#CxRxModal input[name=basecurveL]").val(
			checkIfDataIsNull(item.basecurve, "")
		);
		$("#CxRxModal input[name=diameterL]").val(
			checkIfDataIsNull(item.diameter, "")
		);
		if (item.rigidity == "soft") {
			if (item.toricity != true) {
				// console.log('Lens choosen if soft spheric');
				$("#CxRxModal input[name=g1sspheric]")
					.prop("checked", true)
					.trigger("change");
				$("#CxRxModal input[name=g1storic]").prop("checked", false);
			} else {
				// console.log('Lens choosen if soft toric');
				$("#CxRxModal input[name=g1storic]")
					.prop("checked", true)
					.trigger("change");
				$("#CxRxModal input[name=g1sspheric]").prop("checked", false);
			}
		} else {
			// other than soft
			$("#CxRxModal input[name=g1sspheric]")
				.prop("checked", false)
				.trigger("change");
			$("#CxRxModal input[name=g1storic]")
				.prop("checked", false)
				.trigger("change");
		}
		return {
			text: item.name + " (" + item.brand + ")",
		};
	},
});

// cleaning solution autocomplete
$("#CxRxFormModal input[name=cleaningR]").autoComplete({
	bootstrapVersion: "4",
	minLength: "1",
	resolverSettings: {
		url: API_CLEANING,
		queryKey: "name.contains",
	},
	events: {
		searchPost: function (res) {
			if (!res || res.count == 0) {
			}
			return res && res.items ? res.items : [];
		},
	},
	formatResult: function (item) {
		$("#CxRxFormModal input[name=cleaningL]")
			.val(item.name + " (" + item.brand + ")")
			.trigger("change");
		return {
			text: item.name + " (" + item.brand + ")",
		};
	},
});

$("#CxRxFormModal input[name=cleaningL]").autoComplete({
	bootstrapVersion: "4",
	minLength: "1",
	resolverSettings: {
		url: API_CLEANING,
		queryKey: "name.contains",
	},
	events: {
		searchPost: function (res) {
			if (!res || res.count == 0) {
			}
			return res && res.items ? res.items : [];
		},
	},
	formatResult: function (item) {
		return {
			text: item.name + " (" + item.brand + ")",
		};
	},
});

// init modal according to the button that called it, before it is shown
// set mHxModal parameters by default: category
// diagnosis associated to a worklist item have a WlId, NOT the others
var mHxmodal = document.getElementById("mHxModal");
mHxmodal.addEventListener("show.bs.modal", function (event) {
	// console.log('mHx modal listener triggered');
	// Button that triggered the modal
	let button = event.relatedTarget;
	if (button != undefined) {
		document.getElementById("mHxFormModal").reset();
		// Extract info from data-*-flag attributes
		let category = button.getAttribute("data-category-flag");
		let mhxFlag = button.getAttribute("data-mhx-flag");
		if (mhxFlag == "code") {
			// set wlId, onset today
			category = "medical";
			$("#mHxModal input[name=id_worklist]").val(wlId);
			let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0, 10);
			$("#mHxModal input[name=onset]").val(today);
		} else {
			$("#mHxModal input[name=id_worklist]").val("");
		}
		$("#mHxModal .modal-title").html("New " + category + " history");
		$("#mHxModal input[name=category]").val([category]);
		$("#mHxModal input[name=site]").val(["systemic"]);
	}
});

// set mxModal parameters by default:
// medications associated to a worklist item have a WlId, NOT the others
var mxModal = document.getElementById("mxModal");
mxModal.addEventListener("show.bs.modal", function (event) {
	// console.log('mx modal listener triggered');
	// Button that triggered the modal
	let button = event.relatedTarget;
	if (button != undefined) {
		// reset the form on opening
		document.getElementById("mxFormModal").reset();
		// Extract info from data-*-flag attributes
		let mxFlag = button.getAttribute("data-mx-flag");
		if (mxFlag == "mxWl") {
			// console.log('data flag:','mxWl');
			// set wlId, onset today
			$("#mxModal input[name=id_worklist]").val(wlId);
			let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0, 10);
			$("#mxModal input[name=onset]").val(today);
			// set end of prescription 3 months later
			let end = new Date().addHours(2160).toJSON().slice(0, 10);
			$("#mxModal input[name=ended]").val(end);
			$("#mxModal input[name=prescribed]").val("False");
		} else {
			// console.log('data flag:','NOT a mxWl');
			$("#mxModal input[name=id_worklist]").val("");
		}
		$("#mxModal input[name=delivery]").val(["PO"]);
	}
});

// submit mxFormModal (medications)
$("#mxFormModal").submit(function (e) {
	e.preventDefault();
	let dataStr = $(this).serializeJSON();
	let dataObj = JSON.parse(dataStr);
	let req = dataObj["methodMxModalSubmit"];
	if (req == "POST") {
		delete dataObj["id"];
	} else {
	}
	dataObj["id_auth_user"] == ""
		? (dataObj["id_auth_user"] = patientObj["id"])
		: {};
	dataObj["medication"] = capitalize(dataObj["medication"]);
	delete dataObj["methodMxModalSubmit"];
	dataStr = JSON.stringify(dataObj);
	// console.log("dataForm",dataObj);
	if (dataObj["id_medic_ref"] == "") {
		let newMedicObj = {};
		newMedicObj["name"] = dataObj["medication"];
		newMedicObj["delivery"] = dataObj["delivery"];
		newMedicStr = JSON.stringify(newMedicObj);
		crudp("medic_ref", "0", "POST", newMedicStr);
	}
	crudp("mx", "0", req, dataStr).then(function () {
		$mx_tbl.bootstrapTable("refresh");
		$mxWl_tbl.bootstrapTable("refresh");
	});
	document.getElementById("mxFormModal").reset();
	$("#mxModal").modal("hide");
});

$("#axFormModal").submit(function (e) {
	e.preventDefault();
	let dataStr = $(this).serializeJSON();
	let dataObj = JSON.parse(dataStr);
	let req = dataObj["methodAxModalSubmit"];
	if (req == "POST") {
		delete dataObj["id"];
	} else {
	}
	dataObj["id_auth_user"] == ""
		? (dataObj["id_auth_user"] = patientObj["id"])
		: {};
	dataObj["agent"] = capitalize(dataObj["agent"]);
	delete dataObj["methodAxModalSubmit"];
	dataStr = JSON.stringify(dataObj);
	// console.log("dataForm",dataObj);
	if (dataObj["id_agent"] == "") {
		let newMedicObj = {};
		newMedicObj["name"] = dataObj["agent"];
		newMedicStr = JSON.stringify(newMedicObj);
		crudp("agent", "0", "POST", newMedicStr);
	}
	crudp("allergy", "0", req, dataStr).then((data) =>
		$ax_tbl.bootstrapTable("refresh")
	);
	document.getElementById("axFormModal").reset();
	$("#axModal").modal("hide");
});

$("#mHxFormModal").submit(function (e) {
	e.preventDefault();
	let dataStr = $(this).serializeJSON();
	let dataObj = JSON.parse(dataStr);
	let req = dataObj["methodmHxModalSubmit"];
	if (req == "POST") {
		delete dataObj["id"];
	} else {
	}
	dataObj["id_auth_user"] == ""
		? (dataObj["id_auth_user"] = patientObj["id"])
		: {};
	dataObj["title"] = capitalize(dataObj["title"]);
	delete dataObj["methodmHxModalSubmit"];
	dataStr = JSON.stringify(dataObj);
	// console.log("dataForm",dataObj);
	if (dataObj["id_disease_ref"] == "") {
		let newMedicObj = {};
		newMedicObj["title"] = dataObj["title"];
		newMedicObj["category"] = dataObj["category"];
		newMedicStr = JSON.stringify(newMedicObj);
		// console.log("newMedicObj",newMedicObj);
		crudp("disease_ref", "0", "POST", newMedicStr);
	}
	crudp("phistory", "0", req, dataStr).then(function () {
		$mHx_tbl.bootstrapTable("refresh");
		$sHx_tbl.bootstrapTable("refresh");
		$oHx_tbl.bootstrapTable("refresh");
		$coding.bootstrapTable("refresh");
	});
	document.getElementById("mHxFormModal").reset();
	$("#mHxModal").modal("hide");
});

function delItem(id, table, desc) {
	bootbox.confirm({
		message: "Are you sure you want to delete this " + desc + " ?",
		closeButton: false,
		buttons: {
			confirm: {
				label: "Yes",
				className: "btn-success",
			},
			cancel: {
				label: "No",
				className: "btn-danger",
			},
		},
		callback: function (result) {
			if (result == true) {
				crudp(table, id, "DELETE").then((data) => refreshTables(tablesArr));
			} else {
				console.log("This was logged in the callback: " + result);
			}
		},
	});
}

// set intake counter
function setCounter(id_count, count_class, step, min, max) {
	$(id_count + " .btn.counter_down_" + count_class).click(function () {
		value = parseFloat($(id_count + " input.counter_" + count_class).val());
		if (value >= min + step) {
			$(id_count + " input.counter_" + count_class).val(value - step);
		} else {
		}
	});

	$(id_count + " .btn.counter_up_" + count_class).click(function () {
		value = parseFloat($(id_count + " input.counter_" + count_class).val());
		if (value <= max - step) {
			$(id_count + " input.counter_" + count_class).val(value + step);
		} else {
		}
	});
}

setCounter("#mxFormModal", "intake", 0.25, 0.25, 100);

// set wlItem status: done processing and counter adjustment
// id is in the dataStr
function setWlItemStatus(dataStr) {
	// console.log('dataStrPut:',dataStr);
	crudp("worklist", "0", "PUT", dataStr).then((data) =>
		$table_wl.bootstrapTable("refresh")
	);
}

// set timers
function set_timers(timers) {
	$.each(timers, function (i) {
		$(timers[i]).timer({
			seconds: $(timers[i]).text(),
		});
	});
	timer_id = [];
}

// set timers in wl when completely rendered
// Fires after the table body is rendered and available in the DOM, the parameters contain data
$("#table-wl").on("post-body.bs.table", function () {
	set_timers(timer_id);
});

// update cache
function updateCache(cacheObj) {
	let domId = "#offcanvasCache .rxTd";
	let html = [],
		typeContent = "",
		rxContent = "";
	$.each(cacheObj, function (i) {
		// console.log(cacheObj[i]);
		// content
		// if true: rxContent no add, write monofocal or nothing
		if (
			cacheObj[i]["rx_origin"] == "autorx" ||
			cacheObj[i]["rx_origin"] == "dil" ||
			cacheObj[i]["rx_origin"] == "cyclo" ||
			cacheObj[i]["glass_type"] == "monofocal"
		) {
			rxContent = cacheObj[i]["rx_far"];
			cacheObj[i]["glass_type"] == "monofocal"
				? (typeContent =
						'<span class="badge bg-secondary rounded-pill mx-1">' +
						capitalize(cacheObj[i]["glass_type"]) +
						"</span>")
				: (typeContent = "-");
		} else {
			typeContent =
				'<span class="badge bg-secondary rounded-pill mx-1">' +
				capitalize(cacheObj[i]["glass_type"]) +
				"</span>";
			rxContent = cacheObj[i]["rx_far"] + " Add+" + cacheObj[i]["add"];
		}
		html.push("<tr>"); // row
		html.push("<td>"); // 1st col origin
		html.push(cacheObj[i]["rx_origin"]);
		html.push("</td>");
		html.push("<td>"); // 2nd col glass type
		html.push(typeContent);
		html.push("</td>");
		html.push('<th scope="row">'); // 3rd col rx
		html.push(rxContent);
		html.push("</td>");
		html.push("</tr>"); // end row
	});
	$(domId).html(html.join(""));
}
// clear cache button
$("#clearCache").click(function () {
	$("#offcanvasCache .rxTd").html("");
	rxObj = [];
});

// 3 functions for with multiple fields:
// 1) Submit: check for PUT, capitalize, crud
// 2) on focus: check in DB if field has changed
// 3) on change: if field value has changed then submit

// promise to get item wl fields value
function getWlItemData(table, wlId, lat = "", options = "") {
	let WURL,
		lookup = "mod!:modified_by[id,first_name,last_name]",
		filters = options.split("@lookup=");
	// TODO: what if filter is undefined?
	if (filters[1] != undefined) {
		lookup += "," + filters[1].split("&")[0];
		filters[1].split("&")[1] != undefined
			? (options = filters[0] + filters[1].split("&")[1])
			: (options = filters[0]);
	}
	console.log("lookup", lookup);
	console.log("options", options);
	// check if laterality
	if (lat == "") {
		WURL =
			HOSTURL +
			"/" +
			APP_NAME +
			"/api/" +
			table +
			"?@lookup=" +
			lookup +
			"&id_worklist.eq=" +
			wlId +
			"&" +
			options;
	} else {
		WURL =
			HOSTURL +
			"/" +
			APP_NAME +
			"/api/" +
			table +
			"?@lookup=mod!:modified_by[id,first_name,last_name]&id_worklist.eq=" +
			wlId +
			"&laterality.eq=" +
			lat +
			"&" +
			options;
	}
	return Promise.resolve(
		$.ajax({
			type: "GET",
			dataType: "json",
			url: WURL,
			success: function (data) {
				if (data.status != "error" && parseInt(data.count) > 0) {
					displayToast(
						"success",
						"Item exists",
						"Count is " + data.count,
						3000
					);
				} else if (data.count == 0) {
					displayToast(
						"warning",
						"Item not found",
						"Items does not exist.",
						3000
					);
				} else {
					displayToast("error", "GET error", "Request to check failed.");
				}
			}, // success
			error: function (er) {
				console.log(er);
			},
		})
	);
}

// set submit forms
var antFieldsArr = ["outer", "cornea", "ant_chamb", "iris", "lens", "other"],
	postFieldsArr = [
		"post_chamb",
		"vitreous",
		"retina",
		"macula",
		"papil",
		"other",
	];

function setSubmit(domId, table, fieldsArr, lat) {
	$(domId).submit(function (e) {
		e.preventDefault();
		let dataStr = $(this).serializeJSON();
		let dataObj = JSON.parse(dataStr);
		let req;
		getWlItemData(table, wlId, lat).then(function (data) {
			if (data.count != 0) {
				req = "PUT";
			} else {
				req = "POST";
				delete dataObj["id"];
			}
			// console.log('setSubmit request:',req, 'data.count:',data.count);
			dataObj["id_auth_user"] == ""
				? (dataObj["id_auth_user"] = patientObj["id"])
				: {};
			dataObj["id_worklist"] == "" ? (dataObj["id_worklist"] = wlId) : {};
			// capitalize fields
			for (field of fieldsArr) {
				if (dataObj[field] != "") {
					// console.log('capitalize:', field ,dataObj[field]);
					dataObj[field] = capitalize(dataObj[field]); // capitalize text objects
					$(domId + " input[name=" + field + "]").val(dataObj[field]); // update fields
				} else {
				}
			}
			dataStr = JSON.stringify(dataObj);
			// console.log("dataForm from setSubmit",dataObj);
			crudp(table, "0", req, dataStr);
			$(domId + "Submit")
				.removeClass("btn-danger")
				.addClass("btn-secondary");
			getWlItemData(table, wlId, lat).then(function (data) {
				if (data.count != 0) {
					$(domId + " input[name=id]").val(data.items[0].id);
				} else {
				}
			});
		});
	});
}

setSubmit("#antRightForm", "ant_biom", antFieldsArr, "right");
setSubmit("#antLeftForm", "ant_biom", antFieldsArr, "left");
setSubmit("#postRightForm", "post_biom", postFieldsArr, "right");
setSubmit("#postLeftForm", "post_biom", postFieldsArr, "left");

// set events handlers to update fields
function updateHandlersFields(table, domId, fieldsArr, lat = "") {
	for (const field of fieldsArr) {
		$(domId + " input[name=" + field + "]").focus(function () {
			getWlItemData(table, wlId, lat).then(function (data) {
				// console.log("from update fields "+field+" :",data, data.count);
				if (data.count != 0) {
					let item = data.items[0];
					$(domId + " input[name=id]").val(item["id"]);
					// console.log('input value: ', domId+' input[name='+field+']');
					if (
						$(domId + " input[name=" + field + "]").val() != item[field] &&
						item[field] != "None"
					) {
						// console.log(capitalize(field)+' changed');
						// inform if field has changed
						let modder =
							item["mod.first_name"] +
							" " +
							item["mod.last_name"] +
							" on " +
							item["modified_on"];
						displayToast(
							"warning",
							capitalize(field) + " was changed",
							capitalize(field) + " was changed by " + modder,
							6000
						);
						// update input field
						$(domId + " input[name=" + field + "]").val(item[field]);
					} else {
					}
				} else {
				}
			});
		});
	}
}

updateHandlersFields("ant_biom", "#antRightForm", antFieldsArr, "right");
updateHandlersFields("ant_biom", "#antLeftForm", antFieldsArr, "left");
updateHandlersFields("post_biom", "#postRightForm", postFieldsArr, "right");
updateHandlersFields("post_biom", "#postLeftForm", postFieldsArr, "left");

// trigger change at each value change
function monitorValueChange(domId, fieldsArr) {
	for (field of fieldsArr) {
		$(domId + " input[name=" + field + "]").change(function () {
			$(domId + "FormSubmit")
				.removeClass("btn-secondary")
				.addClass("btn-danger");
			$(domId).submit();
		});
	}
}

monitorValueChange("#antRightForm", antFieldsArr);
monitorValueChange("#antLeftForm", antFieldsArr);
monitorValueChange("#postRightForm", postFieldsArr);
monitorValueChange("#postLeftForm", postFieldsArr);

// motility

// set form submit with 1 field 'description', not laterality
// domId = formId eg #motForm

// todo: to implement
// key is domId, value is table
oneFieldObj = {
	"#cHxForm": "current_hx",
	"#motForm": "motility",
	"#phoForm": "phoria",
	"#pupForm": "pupils",
	"#folForm": "followup",
	"#bilForm": "billing",
};

function setOneSubmit(domId, table, lat) {
	$(domId).submit(function (e) {
		e.preventDefault();
		let dataStr = $(this).serializeJSON();
		let dataObj = JSON.parse(dataStr);
		let req;
		getWlItemData(table, wlId, lat).then(function (data) {
			if (data.count != 0) {
				req = "PUT";
			} else {
				req = "POST";
				delete dataObj["id"];
			}
			dataObj["id_auth_user"] == ""
				? (dataObj["id_auth_user"] = patientObj["id"])
				: {};
			dataObj["id_worklist"] == "" ? (dataObj["id_worklist"] = wlId) : {};
			dataObj["description"] = capitalize(dataObj["description"]);
			dataStr = JSON.stringify(dataObj);
			// console.log("dataForm",dataObj);
			crudp(table, "0", req, dataStr);
			$(domId + "Submit")
				.removeClass("btn-danger")
				.addClass("btn-secondary");
		});
	});
}

setOneSubmit("#cHxForm", "current_hx");
setOneSubmit("#motForm", "motility");
setOneSubmit("#phoForm", "phoria");
setOneSubmit("#pupForm", "pupils");
setOneSubmit("#ccxForm", "ccx", "na");
setOneSubmit("#ccxRForm", "ccx", "right");
setOneSubmit("#ccxLForm", "ccx", "left");
setOneSubmit("#folForm", "followup");
setOneSubmit("#bilForm", "billing");

// using focusout to update will trigger too much ajax call
// button in red if field updated
// trigger change at each value change

function updateHandlersOneField(domId) {
	$(domId + " textarea").change(function () {
		$(domId + "Submit")
			.removeClass("btn-secondary")
			.addClass("btn-danger");
		$(domId).submit();
	});
}

updateHandlersOneField("#cHxForm");
updateHandlersOneField("#motForm");
updateHandlersOneField("#phoForm");
updateHandlersOneField("#pupForm");
updateHandlersOneField("#ccxForm");
updateHandlersOneField("#ccxRForm");
updateHandlersOneField("#ccxLForm");
updateHandlersOneField("#folForm");
updateHandlersOneField("#bilForm");

// update field on focus and highlight if changed
function monitorValueChangeOneField(domId, table, lat) {
	$(domId + " textarea").focus(function () {
		getWlItemData(table, wlId, lat).then(function (data) {
			if (data.count != 0) {
				let item = data.items[0];
				$(domId + " input[name=id]").val(item["id"]);
				if ($(domId + " textarea").val() != item["description"]) {
					// console.log('Description changed');
					let modder =
						item["mod.first_name"] +
						" " +
						item["mod.last_name"] +
						" on " +
						item["modified_on"];
					displayToast(
						"warning",
						"Description was changed",
						"Item was changed by " + modder,
						6000
					);
					$(domId + " textarea").val(item.description);
				} else {
				}
			} else {
			}
		});
	});
}

monitorValueChangeOneField("#cHxForm", "current_hx");
monitorValueChangeOneField("#motForm", "motility");
monitorValueChangeOneField("#phoForm", "phoria");
monitorValueChangeOneField("#pupForm", "pupils");
monitorValueChangeOneField("#ccxForm", "ccx", "na");
monitorValueChangeOneField("#ccxRForm", "ccx", "right");
monitorValueChangeOneField("#ccxLForm", "ccx", "left");
monitorValueChangeOneField("#folForm", "followup");
monitorValueChangeOneField("#bilForm", "billing");

// function to prepare pdf content of prescription
function renderMedicObj(medicObj) {
	let content = ["R/"];
	content.push(medicObj["medication"] + "\n");
	content.push(
		"DT n°I " + checkIfDataIsNull(medicObj["medic.packaging"], " ") + "\n"
	);
	let posology =
		item["unit_per_intake"] +
		" " +
		checkIfDataIsNull(medicObj["medic.form"], "unit(s)") +
		" " +
		medicObj["frequency"];
	content.push("S/" + posology + "\n");
	return content.join("");
}

// testing pdf blob to download file on server
function testpdf() {
	let text = {
		content: [
			"First paragraph",
			"Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines",
			usermdObj["companyname"],
		],
	};
	let pdf = pdfMake.createPdf(text);
	let form = new FormData();
	// pdf.getBuffer((blob) => {
	//     console.log('blob uploading...');
	//     form.append('upload', blob, 'test.pdf');
	//     fetch(HOSTURL+"/"+APP_NAME+"/upload", {method:"POST", body:form})
	//     .then(response => console.log(response));
	// });
	pdf.getBlob((blob) => {
		// console.log('blob uploading...');
		form.append("upload", blob, "test.pdf");
		fetch(HOSTURL + "/" + APP_NAME + "/upload", { method: "POST", body: blob })
			.then((response) => response.text())
			.then((data) => console.log(data));
	});
	pdf.download();
}

function printRx(table, id) {
	$.ajax({
		type: "GET",
		url: HOSTURL + "/" + APP_NAME + "/api/" + table + "?id.eq=" + id,
		dataType: "json",
		success: function (data) {
			// console.log(data);
			let item = data.items[0];
			if (data.status == "error" || data.count == 0) {
				displayToast(
					"error",
					"GET error",
					"Cannot retrieve prescription",
					"3000"
				);
			} else {
				displayToast(
					"info",
					"GET success",
					"Prescription retrieved #" + id,
					"3000"
				);
				let pdfObj = JSON.parse(item["pdf_report"]);
				let pdf = pdfMake.createPdf(pdfObj);
				pdf.print();
			}
		},
		error: function (er) {
			console.log(er);
		},
	});
}

function printGxRx(table, id) {
	$.ajax({
		type: "GET",
		url: HOSTURL + "/" + APP_NAME + "/api/" + table + "?id.eq=" + id,
		dataType: "json",
		success: function (data) {
			// console.log(data);
			let item = data.items[0];
			if (data.status == "error" || data.count == 0) {
				displayToast(
					"error",
					"GET error",
					"Cannot retrieve prescription",
					"3000"
				);
			} else {
				displayToast(
					"info",
					"GET success",
					"Prescription retrieved #" + id,
					"3000"
				);
				let pdfObj = JSON.parse(item["pdf_report"]);
				pdfObj["watermark"]["text"] = "Duplicata";
				// console.log('pdfObj:',pdfObj);
				let pdf = pdfMake.createPdf(pdfObj);
				pdf.print();
			}
		},
		error: function (er) {
			console.log(er);
		},
	});
}
