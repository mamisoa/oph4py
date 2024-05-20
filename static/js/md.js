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
	resolverSettings: {
		url: API_MEDICATIONS,
		queryKey: "name.contains",
	},
	events: {
		searchPost: function (res) {
			if (res.count == 0) {
				$("#mxModal input[name=id_medic_ref]").val("");
			}
			return res.items;
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
			if (res.count == 0) {
				$("#axModal input[name=id_agent]").val("");
			}
			return res.items;
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
			if (res.count == 0) {
				$("#mHxModal input[name=id_disease_ref]").val("");
				console.log("Disease not in dict");
			}
			return res.items;
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
			if (res.count == 0) {
				// $('#mxModal input[name=id_medic_ref]').val('');
			}
			return res.items;
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
			if (res.count == 0) {
			}
			return res.items;
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
			if (res.count == 0) {
			}
			return res.items;
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
			if (res.count == 0) {
			}
			return res.items;
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
$('#mxFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodMxModalSubmit'];
    let id = dataObj.id;
    delete dataObj.id;
    dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=patientObj['id']:{};
    dataObj['medication']=capitalize(dataObj['medication']);
    delete dataObj['methodMxModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    // console.log("dataForm",dataObj);
    if (dataObj['id_medic_ref'] == "") { // if no med ref, add new medication to the medication db
        let newMedicObj = {};
        newMedicObj['name']=dataObj['medication'];
        newMedicObj['delivery']=dataObj['delivery'];
        newMedicStr = JSON.stringify(newMedicObj);
        crudp('medic_ref','0','POST',newMedicStr);
    };
    crudp('mx',id,req,dataStr).then(function () {
        $mx_tbl.bootstrapTable('refresh');
        $mxWl_tbl.bootstrapTable('refresh');
    });
    document.getElementById('mxFormModal').reset();
    $('#mxModal').modal('hide');
});

$('#axFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodAxModalSubmit'];
    let id = dataObj.id;
    delete dataObj.id;
    dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=patientObj['id']:{};
    dataObj['agent']=capitalize(dataObj['agent']);
    delete dataObj['methodAxModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    // console.log("dataForm",dataObj);
    if (dataObj['id_agent'] == "") { // if no agent ref, add new agent to the agent db
        let newMedicObj = {};
        newMedicObj['name']=dataObj['agent'];
        newMedicStr = JSON.stringify(newMedicObj);
        crudp('agent','0','POST',newMedicStr);
    };    
    crudp('allergy',id,req,dataStr).then( data => $ax_tbl.bootstrapTable('refresh'));
    document.getElementById('axFormModal').reset();
    $('#axModal').modal('hide'); 
});

$('#mHxFormModal').submit(function(e){
    e.preventDefault();
    let dataStr = $(this).serializeJSON();
    let dataObj = JSON.parse(dataStr);
    let req = dataObj['methodmHxModalSubmit'];
    let id = dataObj.id;
    delete dataObj.id;
    dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=patientObj['id']:{};
    dataObj['title']=capitalize(dataObj['title']);
    delete dataObj['methodmHxModalSubmit'];
    dataStr= JSON.stringify(dataObj);
    // console.log("dataForm",dataObj);
    if (dataObj['id_disease_ref'] == "") { // if no disease ref, add new disease to the disease db
        let newMedicObj = {};
        newMedicObj['title']=dataObj['title'];
        newMedicObj['category']=dataObj['category'];
        newMedicStr = JSON.stringify(newMedicObj);
        // console.log("newMedicObj",newMedicObj);
        crudp('disease_ref','0','POST',newMedicStr);
    };    
    crudp('phistory',id,req,dataStr).then( function() {
        $mHx_tbl.bootstrapTable('refresh'); 
        $sHx_tbl.bootstrapTable('refresh');
        $oHx_tbl.bootstrapTable('refresh');
        $coding.bootstrapTable('refresh');
    });
    document.getElementById('mHxFormModal').reset();
    $('#mHxModal').modal('hide'); 
});

function delItem(id, table, desc) {
	bootbox.confirm({
		centerVertical: true,
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
// id is removed from the dataStr
function setWlItemStatus (dataStr) {
    let dataJson = JSON.parse(dataStr);
    let id = dataJson.id;
    delete dataJson.id;
    console.log('dataStr: ', dataJson,' Type:', typeof dataJson);
    crudp('worklist', id ,'PUT', JSON.stringify(dataJson))
        .then( data => $table_wl.bootstrapTable('refresh'));    
};

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

function setSubmit(domId,table, fieldsArr,lat) {
    $(domId).submit(function(e){
        e.preventDefault();
        let dataStr = $(this).serializeJSON();
        let dataObj = JSON.parse(dataStr);
        let req ;
        getWlItemData(table,wlId,lat)
            .then(function(data){
                let id = dataObj['id'];
                delete dataObj['id'];
                if (data.count != 0) {
                    req = 'PUT';
                } else {
                    req = 'POST';
                };
                // console.log('setSubmit request:',req, 'data.count:',data.count);
                dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=patientObj['id']:{};
                dataObj['id_worklist'] == "" ? dataObj['id_worklist']=wlId:{};
                // capitalize fields
                for (field of fieldsArr) {
                    if (dataObj[field] != "") {
                        // console.log('capitalize:', field ,dataObj[field]);
                        dataObj[field]=capitalize(dataObj[field]); // capitalize text objects
                        $(domId+' input[name='+field+']').val(dataObj[field]); // update fields
                    } else {};
                };
                dataStr= JSON.stringify(dataObj);
                // console.log("dataForm from setSubmit",dataObj);
                crudp(table,id,req,dataStr);
                $(domId+'Submit').removeClass('btn-danger').addClass('btn-secondary');
                getWlItemData(table,wlId,lat)
                    .then(function(data) {
                        if (data.count != 0) {
                            $(domId+' input[name=id]').val(data.items[0].id);
                        } else {};
                    })
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
        '#cHxForm': 'current_hx','#motForm':'motility', '#phoForm':'phoria', '#pupForm':'pupils',
        '#ccxForm':'ccx', '#ccxRForm':'ccx','#ccxLForm':'ccx','#folForm':'followup','#bilForm':'billing' };

function setOneSubmit(domId,table,lat) {
    $(domId).submit(function(e){
        e.preventDefault();
        let dataStr = $(this).serializeJSON();
        let dataObj = JSON.parse(dataStr);
        let req ;
        getWlItemData(table,wlId,lat)
            .then(function(data){
                let id = dataObj.id;
                if (data.count !=0) {
                    req = 'PUT';
                } else {
                    req = 'POST';
                };
                delete dataObj['id'];
                dataObj['id_auth_user'] == "" ? dataObj['id_auth_user']=patientObj['id']:{};
                dataObj['id_worklist'] == "" ? dataObj['id_worklist']=wlId:{};
                dataObj['description']=capitalize(dataObj['description']);
                dataStr= JSON.stringify(dataObj);
                // console.log("dataForm",dataObj);
                crudp(table,id,req,dataStr);
                $(domId+'Submit').removeClass('btn-danger').addClass('btn-secondary');            
            })
    });    
};

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

////////////////////////////////////////////////////////////////
// BILLING
////////////////////////////////////////////////////////////////

let currentCodeObj = {};
let codesToBillObj = []; // list of codes to bill

// billing autocomplete
$("#codeSelection input[name=code]").autoComplete({
	bootstrapVersion: "4",
	minLength: "1",
	resolverSettings: {
		url: API_NOMENCLATURE,
		queryKey: "code.contains",
	},
	events: {
		searchPost: function (res) {
			if (res.count == 0) {
			}
			return res.items;
		},
	},
	formatResult: function (item) {
		// Get the div where the table will be placed
		const codeDescriptionDiv = document.getElementById("listCodeDescription");

		// Create a table element
		const table = document.createElement("table");
		table.classList.add("table"); // Add Bootstrap class for styling

		// Create the header row
		const thead = document.createElement("thead");
		const headerRow = document.createElement("tr");
		const headers = ["Code", "Description", "Price", "Covered"];
		headers.forEach((header) => {
			const th = document.createElement("th");
			th.textContent = header;
			headerRow.appendChild(th);
		});
		thead.appendChild(headerRow);
		table.appendChild(thead);

		// Create the body row
		const tbody = document.createElement("tbody");
		const bodyRow = document.createElement("tr");
		bodyRow.innerHTML = `
                    <td>${item.code ?? ""}</td>
                    <td>${item.code_desc ?? ""}</td>
                    <td>${round2supint(JSON.parse(item.price_list)[0] * item.supplement_ratio) ?? ""}</td>
                    <td>${JSON.parse(item.price_list)[1] ?? ""}</td>
                `; // <td>${new Date().toLocaleDateString()}</td>
		tbody.appendChild(bodyRow);
		table.appendChild(tbody);
		// Clear any existing content and add the new table
		codeDescriptionDiv.innerHTML = "";
		codeDescriptionDiv.appendChild(table);
		return {
			text: item.code,
		};
	},
});

// text code autocomplete
$("#codeTextSelection input[name=codeText]").autoComplete({
	bootstrapVersion: "4",
	minLength: "4",
	resolverSettings: {
		url: API_NOMENCLATURE,
		queryKey: "code_desc.contains",
	},
	events: {
		searchPost: function (res) {
			if (res.count == 0) {
			}
			return res.items;
		},
	},
	formatResult: function (item) {
		// console.log('item autocomplete:',item)
		// Get the div where the table will be placed
		const codeDescriptionDiv = document.getElementById("listCodeDescription");

		// Create a table element
		const table = document.createElement("table");
		table.classList.add("table"); // Add Bootstrap class for styling

		// Create the header row
		const thead = document.createElement("thead");
		const headerRow = document.createElement("tr");
		const headers = ["Code", "Description", "Price", "Covered"];
		headers.forEach((header) => {
			const th = document.createElement("th");
			th.textContent = header;
			headerRow.appendChild(th);
		});
		thead.appendChild(headerRow);
		table.appendChild(thead);

		// Create the body row
		const tbody = document.createElement("tbody");
		const bodyRow = document.createElement("tr");
		// console.log("item price_list:", JSON.parse(item.price_list)[0] * item.supplement_ratio);
		bodyRow.innerHTML = `
                    <td>${item.code ?? ""}</td>
                    <td>${item.code_desc ?? ""}</td>
                    <td>${round2supint(JSON.parse(item.price_list)[0] * item.supplement_ratio) ?? ""}</td>
                    <td>${JSON.parse(item.price_list)[1] ?? ""}</td>
                `; // <td>${new Date().toLocaleDateString()}</td>
		tbody.appendChild(bodyRow);
		table.appendChild(tbody);
		// Clear any existing content and add the new table
		codeDescriptionDiv.innerHTML = "";
		codeDescriptionDiv.appendChild(table);
		return {
			text: item.code_desc,
		};
	},
});

$("#codeSelection input[name=code]").on(
	"autocomplete.select",
	function (evt, item) {
		console.log("code", item);
		currentCodeObj = item;
	}
);

$("#codeTextSelection input[name=codeText]").on(
	"autocomplete.select",
	function (evt, item) {
		console.log("desc item", item);
		currentCodeObj = item;
	}
);

// combo codes
const combos = comboObj; // Replace with the actual JSON data
const comboCodeSelect = document.getElementById("comboCodeSelect");
const codeListTable = document.querySelector("#combo_listcode tbody");

// Populate combo options
combos.forEach((combo) => {
	const option = document.createElement("option");
	option.value = combo.id;
	option.textContent = combo.combo;
	comboCodeSelect.appendChild(option);
});

// Function to update the table based on the selected combo
function updateTable(selectedComboId) {
	const selectedComboData = combos.find((combo) => combo.id == selectedComboId);

	// Update the table with the selected combo's details
	codeListTable.innerHTML = "";
	if (selectedComboData && selectedComboData.nomenclatures) {
		selectedComboData.nomenclatures.forEach((nomenclature) => {
			const row = document.createElement("tr");
			row.innerHTML = `
                <td>${nomenclature.code ?? ""}</td>
                <td>${nomenclature.code_desc.substring(0, 30) ?? ""}</td>
                <td>${round2supint(JSON.parse(nomenclature.price_list)[0] *	nomenclature.supplement_ratio) ?? ""}</td>
                <td>${JSON.parse(nomenclature.price_list)[1] ?? ""}</td>
            `; // <td>${new Date().toLocaleDateString()}</td>
			codeListTable.appendChild(row);
		});
	}
}

// Update table when the selection changes
comboCodeSelect.addEventListener("change", function () {
	updateTable(this.value);
});

// add combo codes to the table
addComboBtn.addEventListener("click", function () {
	const selectedComboId = comboCodeSelect.value;
	const selectedComboData = combos.find((combo) => combo.id == selectedComboId);
	// console.log('selectedComboId:',selectedComboId);

	if (selectedComboData && selectedComboData.nomenclatures) {
		let addComboCodesObj = selectedComboData.nomenclatures;
		let checkedValue = document.querySelector(
			'#codeSideSelect input[name="site"]:checked'
		)?.value;
		addComboCodesObj.forEach((object) => {
			object.date = getIsoCurrentDateTime();
			object.laterality = checkedValue;
		});

		// Filter out objects that are already present in codesToBillObj based on their 'id'
		const filteredComboCodes = addComboCodesObj.filter(
			(comboCode) =>
				!codesToBillObj.some((billCode) => billCode.id === comboCode.id)
		);

		// Remove the keys 'modified_by', 'created_by', 'is_active' from each object
		const cleanedComboCodes = filteredComboCodes.map((comboCode) => {
			delete comboCode.modified_by;
			delete comboCode.created_by;
			delete comboCode.is_active;
			comboCode.combo_id = selectedComboId;
			console.log("comboCode", comboCode);
			return comboCode;
		});

		codesToBillObj.push(...cleanedComboCodes);
		updateCodesTables(codesToBillObj);
	}
});

// Automatically select the first option by default and update the table
if (combos.length > 0) {
	comboCodeSelect.value = combos[0].id;
	updateTable(combos[0].id);
}

// Add ONE code button functionality
addCodeBtn.addEventListener("click", function () {
	if (!isEmptyObject(currentCodeObj)) {
		let checkedValue = document.querySelector(
			'#codeSideSelect input[name="site"]:checked'
		)?.value;
		currentCodeObj["laterality"] = checkedValue;
		currentCodeObj["date"] = getIsoCurrentDateTime();

		// Check if codesToBillObj already contains an object with the same id
		const isExisting = codesToBillObj.some(
			(obj) => obj.id === currentCodeObj.id
		);

		if (!isExisting) {
			codesToBillObj.push(currentCodeObj);
			updateCodesTables(codesToBillObj);
		} else {
			console.log("Code with this ID already exists in the billing list.");
			// Optionally, you can add some user feedback here
		}
	}
});

function updateCodesTables(dataArray) {
	const container = document.getElementById("codesSelected");
	container.innerHTML = ""; // Reset the content of the div
	// Create a table element
	const table = document.createElement("table");
	table.className = "table table-striped"; // Bootstrap table classes

	// Create the header
	const thead = document.createElement("thead");
	thead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Code</th>
            <th>Laterality</th>
            <th>Price List</th>
            <th>Action</th>
        </tr>`;
	table.appendChild(thead);

	// Create the body
	const tbody = document.createElement("tbody");

	dataArray.forEach((item, index) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
            <td>${new Date().toLocaleDateString()}</td>
            <td>${item.code}</td>
            <td>${item.laterality}</td>
            <td>${item.price_list}</td>
            <td>
                <button class="delCodeBtn btn btn-danger" data-code-index="${index}">
                <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>`;
		tbody.appendChild(tr);
	});

	table.appendChild(tbody);
	container.appendChild(table);
	// Add event listener to the table for delegation
	table.addEventListener("click", function (event) {
		if (event.target.closest(".delCodeBtn")) {
			const index = event.target
				.closest(".delCodeBtn")
				.getAttribute("data-code-index");
			dataArray.splice(index, 1); // Remove the item at the clicked index
			updateCodesTables(dataArray); // Refresh the table
		}
	});
}

function transformObject(obj) {
	// Destructure the object to separate out keys to be removed or renamed
	// converts to the expected format from database
	const {
		"creator.first_name": _creatorFirstName, // prefixed with '_' to indicate unused variables
		"creator.id": _creatorId,
		"creator.last_name": _creatorLastName,
		"mod.first_name": _modFirstName,
		"mod.id": _modId,
		"mod.last_name": _modLastName,
		"add_documents": _add_documents,
		"code": _code,
		"code_desc": _codeDesc,
		"covered": _covered,
		"creator.id": _creator_Id,
		"max_age": _max_Age,
		"min_age": _min_Age,
		"min_reccurency": _minReccurency,
		"modified_on": _modifiedon,
		"not_compatible": _notCompatible,
		"price_list": _price_list,
		"supplement_ratio": _supplementRatio,
		"created_on": _createdOn,
		...rest
	} = obj;

	// Return the new object with some keys renamed
	return {
		...rest,
		status: -1, // initial "status to validate"
	};
}

const submitLabel = document.getElementById("billingModalSubmit");
const idAuthUser = document.getElementById("idPatientbilling").value;
const idWorklist = document.getElementById("idBillingWl").value;

submitLabel.addEventListener("click", async function (event) {
	event.preventDefault(); // Prevents the default form submission action

	let codesToPostArr = codesToBillObj.map((obj) => {
		// Rename 'id' to 'nomenclature_id' and keep the rest of the properties
		const { id: nomenclature_id, ...rest } = obj;
		return {
			...rest,
			nomenclature_id,
			id_auth_user: idAuthUser,
			id_worklist: idWorklist,
		};
	});

	console.log("Code to post (received after submit codes modal): ",codesToPostArr); // OK = list

	for (const dataObj of codesToPostArr) {
		try {
			convertedObj = transformObject(dataObj);
			console.log(convertedObj);
			dataStr = JSON.stringify(convertedObj);
			console.log("dataStr1: ", dataStr);

			// add wl_codes list to wl
			await crudp("wl_codes", "0", "POST", dataStr);
			console.log("dataobj:", dataObj);

			const response = await fetch(API_TRANSACTIONS);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log("fetch data:", data);
			let currentTransactionObj = data.items[0];
			console.log("response data -->", data.items[0]);

			await onTransactionAddUpdate(currentTransactionObj, dataObj);

			// Reset the content of the div
			const container = document.getElementById("codesSelected");
			container.innerHTML = "";
			codesToBillObj = []; // reset codesToBill
		} catch (error) {
			console.error("Error:", error);
		}
	}

});

/*
This function updates the worklist transaction prices
*/
async function onTransactionAddUpdate(currentTransactionObj, newDataObj) {
	let req = "POST";
	let id = "0";
	if (currentTransactionObj === undefined ) {
		// create an initial transaction -> req = "POST"
		console.log("CurrentTransactionObj is {}");

		// Create a new Date object
		let currentDate = new Date();

		// Get the current date and time components
		let year = currentDate.getFullYear();
		let month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because getMonth() returns zero-based month index
		let day = ('0' + currentDate.getDate()).slice(-2);
		let hours = ('0' + currentDate.getHours()).slice(-2);
		let minutes = ('0' + currentDate.getMinutes()).slice(-2);
		let seconds = ('0' + currentDate.getSeconds()).slice(-2);
		// Format the date and time
		var currentDateTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;

		currentTransactionObj = {
			"id_auth_user": newDataObj.id_auth_user, 
			"id_worklist": newDataObj.id_worklist,
			"date": currentDateTime,
			"price": 0,
			"price_covered": 0,
			"covered_1600": 0,
			"covered_1300": 0,
			"uncovered": 0,
			"cash_payment": 0,
			"card_payment": 0,
			//"card_type": "bc",
			"invoice_payment": 0,
			// "invoice_type": 'other',
			"paid": 0,
			"status": -1,
			"note": "",
			"description":""};
	} else {
		console.log("Existing transaction:", currentTransactionObj)
		// existing transaction is available
		req = "PUT";
		id = currentTransactionObj.id;
		delete currentTransactionObj.id;
	}
	let newTransactionObj = { ...currentTransactionObj };
	console.log("newTransactionObj to add before update: ", newTransactionObj);
	let codeObj = newDataObj;
	let pricesArr = JSON.parse(codeObj["price_list"]);
	console.log("priceArr:", pricesArr)
	newTransactionObj["price"] = currentTransactionObj.price + (Math.round(pricesArr[0] * codeObj["supplement_ratio"]) * 100) / 100  + pricesArr[3];
	newTransactionObj["covered_1600"] = currentTransactionObj.covered_1600 + pricesArr[1];
	newTransactionObj["covered_1300"] = currentTransactionObj.covered_1300 + pricesArr[2];
	newTransactionObj["uncovered"] = pricesArr[3];
	newTransactionObj["price_covered"] = pricesArr[0];
    // newTransactionObj["status"] = -1;
	console.log("newTransactionObj before posting:", newTransactionObj);

	try {
		await crudp(
			"transactions",
			id,
			req,
			JSON.stringify(transformObject(newTransactionObj))
		);
		console.log("Transaction updated successfully");
	} catch (error) {
		console.error("Error updating transaction:", error);
	};
    await updateTransactionTable();
    refreshTables(["#wlCodes_tbl"]);
}

// Generate transaction table
async function updateTransactionTable(headers = ['date', 'price', 'covered_1300', 'covered_1600', 'status', 'note']) {
    console.log("updateTransactionTable function executing...")
    const container = document.getElementById('transactionTable');
    const btnConfirm = document.getElementById('btnConfirmTransaction');
    const btnUnlock = document.getElementById('btnUnlockTransaction');
    const transactionDiv = document.getElementById('transactionRow');
    if (!container) {
        console.error('Transaction table container not found');
        return;
    }

    try {
        const response = await fetch(API_TRANSACTIONS);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const transactionData = await response.json();

        if (transactionData.items.length === 0) {
            container.innerHTML = '<p>No transaction data available.</p>';
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        // Create a table element with Bootstrap classes
        const table = document.createElement('table');
        table.classList.add('table', 'table-striped', 'table-hover', 'table-responsive');

        // Create the body of the table
        const tbody = document.createElement('tbody');
        const item = transactionData.items[0]; // Get the first (and only) item
		// update current transactionObj and noteModal
		// let noteTransactionsModal = document.getElementById("noteTransactionsModal");
		document.getElementById("transactionId").textContent = item.id;
		document.addEventListener("DOMContentLoaded", function() {
			document.getElementById("transactionId").textContent = item.id;
			document.querySelector("#noteTransactionsModal input[name=id_worklist]").value = item.id_worklist;
			document.querySelector("#noteTransactionsModal input[name=id_auth_user]").value = item.id_auth_user;
			document.querySelector("#noteTransactionsModal input[name=note]").value = item.note;
		});
		
		currentTransactionObj = item;
        console.log("transaction item: ",item);
        headers.forEach(header => {
            const row = document.createElement('tr');
            const tdKey = document.createElement('td');
            tdKey.innerHTML = `<strong>${header}</strong>`; // Key in bold
            row.appendChild(tdKey);
            const tdValue = document.createElement('td');
            let value = item[header];
            let valueElement = document.createTextNode(value); // Default text node

            if ((header === 'price' || header === 'covered_1600' || header === 'covered_1300') && value != null) {
                value = `${value.toFixed(2)} €`; // Format with 2 decimals and append '€'
                if (header === 'price') {
                    // Create a span for price and style it
                    valueElement = document.createElement('span');
                    valueElement.textContent = value;
                    valueElement.style.fontWeight = 'bold';
                    valueElement.style.border = '1px solid black'; // Add border
                    valueElement.style.padding = '2px'; // Add some padding
                }
            } else {
                value = value !== null && value !== undefined ? value : '';
            }

            if (header !== 'price') {
                tdValue.textContent = value;
            } else {
                tdValue.appendChild(valueElement); // Append the styled span for price
            }
            row.appendChild(tdValue);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        // Append the table to the container
        container.appendChild(table);
        if (item.status >= 0) { // confirmed -> show bntUnlock, hide btnConfirm
            if (btnUnlock.classList.contains('d-none')) {
                btnUnlock.classList.remove('d-none'); 
            }
            if (!btnConfirm.classList.contains('d-none')) {
                btnConfirm.classList.add('d-none');
            }
        } else { // to validate -> show bntConfirm, hide btnUnlock
            if (btnConfirm.classList.contains('d-none')) {
                btnConfirm.classList.remove('d-none'); 
            }
            if (!btnUnlock.classList.contains('d-none')) {
                btnUnlock.classList.add('d-none');
            }
        }
        if (item.price <=0) {
            if (!transactionDiv.classList.contains('d-none')) {
                transactionDiv.classList.add('d-none');
            }
        } else {
            transactionDiv.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Error fetching transaction data:', error);
        container.innerHTML = '<p>Error loading transaction data.</p>';
    }
}

async function confirmTransaction() {
    try {
        const keysToRemove = ['created_on', 'modified_on', 'modified_by', 'created_by'];

        // Fetch wl_codes items
        const API_CODES = HOSTURL + "/"+APP_NAME+"/api/wl_codes?id_auth_user.eq="+patientId+"&id_worklist.eq="+wlId;
        let response = await fetch(API_CODES);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let wlCodesData = await response.json();
        console.log("wldata: ",wlCodesData);

        // Update status of each wl_codes item to 1
        for (const item of wlCodesData.items) {
            item.status = 1;
			let id = item.id;
            console.log("wlitem: ",item);
            keysToRemove.forEach(key => delete item[key]);
			delete item.id;
            await crudp('wl_codes', id, 'PUT', JSON.stringify(item));
        }

        // Fetch the transaction
        const API_TRANS = HOSTURL + "/"+APP_NAME+"/api/transactions?id_auth_user.eq="+patientId+"&id_worklist.eq="+wlId;
        response = await fetch(API_TRANS);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let transactionData = await response.json();

        // Assuming there is only one transaction, update its status to 0
        if (transactionData.count > 0) {
            const transaction = transactionData.items[0];
			let id = transaction.id;
            transaction.status = 0;
            keysToRemove.forEach(key => delete transaction[key]);
			delete transaction.id;
            await crudp('transactions', id, 'PUT', JSON.stringify(transaction));
            refreshTables(['#wlCodes_tbl', '#transactions_tbl']);
            await updateTransactionTable();

        }
    } catch (error) {
        console.error('Error in confirmTransaction:', error);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const btnConfirmTransaction = document.getElementById('btnConfirmTransaction');

    if (btnConfirmTransaction) {
        btnConfirmTransaction.addEventListener('click', confirmTransaction);
    } else {
        console.error('Button with ID #btnConfirmTransaction not found');
    }
});

// add note transaction
document.getElementById('noteTransactionsModalSubmit').addEventListener('click', function() {
    // Update the global object
    currentTransactionObj.note = document.getElementById('noteTransactionsContent').value;

	let transactionIdSpan =  document.getElementById("transactionId");
	transactionIdSpan.textContent = 1;

    // Prepare data string for crudp function
    let dataStr = JSON.stringify({
        // id: currentTransactionObj.id, not need for PUT
        note: currentTransactionObj.note
    });

    // Execute the crudp promise function
    crudp('transactions', currentTransactionObj.id, 'PUT', dataStr)
        .then(() => {
            // Execute updateTransactionTable
            return updateTransactionTable();
        })
        .then(() => {
            // Close the modal
            $('#noteTransactionsModal').modal('hide');
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
