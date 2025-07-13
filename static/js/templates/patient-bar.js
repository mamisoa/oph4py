// Patient bar JavaScript
(function () {
	// Initialize patient bar when global variables are available
	function initializePatientBar() {
		// Check if required global variables are available
		if (
			typeof patientObj === "undefined" ||
			typeof wlObj === "undefined" ||
			typeof genderIdObj === "undefined" ||
			typeof providerObj === "undefined" ||
			typeof seniorObj === "undefined"
		) {
			console.warn(
				"Required patient bar variables not available yet, deferring initialization"
			);
			return false;
		}

		// Initialize patient information display
		$("input[name=id_auth_user]").val(patientObj["id"]); // set patient id in forms
		$("input[name=id_worklist]").val(wlObj["worklist"]["id"]); // set worklist id in forms

		// Set patient details
		$("#wlItemDetails .patientName").html(
			patientObj["last_name"].toUpperCase() + " " + patientObj["first_name"]
		);

		// Handle DOB display with age calculation
		if (patientObj["dob"] != null) {
			$("#wlItemDetails .patientDob").html(
				patientObj["dob"].split("-").reverse().join("/") +
					" (" +
					getAge(patientObj["dob"]) +
					"yo)"
			);
		} else {
			$("#wlItemDetails .patientDob").html("DOB: n/a");
		}

		// Set other patient details
		$("#wlItemDetails .patientGender").html(
			"Gender: " + genderIdObj[patientObj["gender"]]
		);
		$("#wlItemDetails .patientSsn").html(
			"NISS #" + checkIfDataIsNull(patientObj["ssn"])
		);
		$("#wlItemDetails .patientCard").html(
			"Card #" + checkIfDataIsNull(patientObj["idc_num"])
		);
		$("#wlItemDetails .patientEmail").html(
			"Email: " + checkIfDataIsNull(patientObj["email"])
		);

		// Display phone number if available
		if (typeof phoneDict !== "undefined" && phoneDict && phoneDict.length > 0) {
			// Use the first phone number if multiple exist
			const phone = phoneDict[0];
			$("#wlItemDetails .patientPhone").html(
				"Phone: +" + phone.phone_prefix + " " + phone.phone
			);
		} else {
			$("#wlItemDetails .patientPhone").html("Phone: n/a");
		}

		$("#wlItemDetails .patientId").html("ID #" + patientObj["id"]);
		$("#wlItemDetails .timeslot").html(
			datetime2eu(wlObj["worklist"]["requested_time"])
		);

		// Display user notes if available
		if (patientObj["user_notes"] != null) {
			$("#wlItemDetails .user_notes").html(patientObj["user_notes"]);
		} else {
			$("#wlItemDetails .user_notes").removeClass("whitebg");
		}

		// Set worklist details
		$("#wlItemDetails .modality").html(wlObj["modality"]["modality_name"]);
		$("#wlItemDetails .laterality").html(wlObj["worklist"]["laterality"]);
		$("#wlItemDetails .provider").html(
			providerObj["first_name"] + " " + providerObj["last_name"]
		);
		$("#wlItemDetails .senior").html(
			seniorObj["first_name"] + " " + seniorObj["last_name"]
		);
		$("#wlItemDetails .status").html(wlObj["worklist"]["status_flag"]);

		// Handle task status controls
		if (wlObj["worklist"]["status_flag"] == "done") {
			$("#btnTaskDone").addClass("visually-hidden");
			// Define buttons to disable only when needed
			const buttonsToDisable = document.querySelectorAll(
				".btn-action, .form-control"
			);
			disableTaskButtons(buttonsToDisable);
		} else {
			$("#btnUnlockTask").addClass("visually-hidden");
		}

		// Display warning if available
		if (wlObj["worklist"]["warning"] != null) {
			$("#wlItemDetails .warning").html(
				'<i class="fas fa-exclamation-circle"></i> ' +
					wlObj["worklist"]["warning"]
			);
		} else {
			$("#wlItemDetails .warning").html("").removeClass("bg-danger text-wrap");
		}

		// Handle patient photo display
		if (patientObj["photob64"] == null) {
			const photoEl = document.getElementById("photoId");
			photoEl.setAttribute("height", 200);
			photoEl.setAttribute("width", 150);

			// Set default avatar based on gender
			const hostUrl = typeof HOSTURL !== "undefined" ? HOSTURL : window.HOSTURL;
			const appName =
				typeof APP_NAME !== "undefined" ? APP_NAME : window.APP_NAME;
			const avatarPath =
				hostUrl + "/" + appName + "/static/images/assets/avatar/";
			const avatarFile =
				genderIdObj[patientObj["gender"]] == "Male"
					? "mini-man.svg"
					: "mini-woman.svg";
			photoEl.setAttribute("src", avatarPath + avatarFile);
		} else {
			document
				.getElementById("photoId")
				.setAttribute("src", patientObj["photob64"]);
		}

		return true;
	}

	// Try to initialize immediately, or defer until DOM ready
	if (!initializePatientBar()) {
		$(document).ready(function () {
			// Try again when DOM is ready
			if (!initializePatientBar()) {
				// If still not available, try after a short delay
				setTimeout(initializePatientBar, 100);
			}
		});
	}

	/**
	 * Enhanced function to safely disable UI elements
	 * @param {NodeList|HTMLElement|Array} elements - Elements to disable
	 */
	function disableTaskButtons(elements) {
		if (!elements) return;

		// Convert input to array regardless of type
		const elementsArray =
			elements instanceof NodeList
				? Array.from(elements)
				: elements instanceof HTMLElement
				? [elements]
				: Array.isArray(elements)
				? elements
				: [];

		// Disable each element
		elementsArray.forEach((el) => {
			if (el && typeof el.disabled !== "undefined") {
				el.disabled = true;
			}
		});
	}

	/**
	 * Fetch worklist details by ID
	 * @param {string|number} wlId - Worklist ID to fetch
	 * @returns {Promise} - Promise resolving to worklist data
	 */
	function getWlDetails(wlId) {
		const apiUrl = HOSTURL + "/" + APP_NAME + "/api/worklist/" + wlId;
		console.log("Fetching worklist details from:", apiUrl);

		return $.ajax({
			type: "GET",
			dataType: "json",
			url: apiUrl,
		})
			.then(function (data) {
				console.log("API Response:", data);

				// Handle different possible response structures
				if (data && !data.error) {
					displayToast(
						"success",
						"Task Status Updated",
						"Successfully retrieved task details",
						3000
					);
					// Return the data in a consistent format
					return { items: [data] };
				} else {
					console.error("API returned error:", data);
					displayToast("error", "GET error", "Cannot retrieve task details");
					throw new Error(
						"API returned error: " + (data.error || "Unknown error")
					);
				}
			})
			.catch(function (er) {
				console.log("Error fetching worklist details:", er);
				displayToast(
					"error",
					"GET error",
					"Cannot retrieve worklist details: " + er.message
				);
				throw er;
			});
	}

	// Set task to done and disable form buttons
	$("#btnTaskDone").click(function () {
		bootbox.confirm({
			message: "Are you sure you want to set this task to DONE?",
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
					let dataObj = {
						laterality: wlObj["worklist"]["laterality"],
						id: wlId,
					};
					let dataStr;
					if (wlObj["worklist"]["status_flag"] != "done") {
						dataObj["status_flag"] = "done";
						dataObj["counter"] = 0;
						// Remove id from payload and use it in the URL
						const id = wlId; // Using wlId directly since it's already available
						delete dataObj.id;
						dataStr = JSON.stringify(dataObj);
						crudp("worklist", id.toString(), "PUT", dataStr)
							.then(function (data) {
								console.log("update result:", data);

								// If the update was successful, directly update the UI
								if (data && data.api_version) {
									// Update the local wlObj
									wlObj["worklist"]["status_flag"] = "done";
									wlObj["worklist"]["counter"] = 0;

									// Update the UI
									$("#wlItemDetails .status").html("done");

									// Disable form buttons
									const buttonsToDisable = document.querySelectorAll(
										".btn-action, .form-control"
									);
									disableTaskButtons(buttonsToDisable);

									displayToast(
										"success",
										"Task Complete",
										"Task has been marked as done",
										3000
									);

									// Redirect to worklist after a short delay
									setTimeout(function () {
										window.location.href = "/" + APP_NAME + "/worklist";
									}, 1500);
								} else {
									console.error("Unexpected update response:", data);
									displayToast(
										"error",
										"Update error",
										"Failed to update task status"
									);
								}
							})
							.catch(function (error) {
								console.error("Error setting task to done:", error);
								displayToast(
									"error",
									"Update error",
									"Failed to set task to done"
								);
							});
					}
				}
			},
		});
	});

	// Unlock task button handler
	$("#btnUnlockTask").click(function () {
		let dataObj = {
			laterality: wlObj["worklist"]["laterality"],
			id: wlObj["worklist"]["id"],
		};

		if (wlObj["worklist"]["status_flag"] == "done") {
			dataObj["status_flag"] = "processing";
			dataObj["counter"] = 1;
			const id = dataObj.id;
			delete dataObj.id;
			const dataStr = JSON.stringify(dataObj);
			crudp("worklist", id.toString(), "PUT", dataStr).then(function () {
				document.location.reload();
			});
		}
	});

	// MD history buttons
	mdHistory.forEach(function (arrayItem) {
		const id = arrayItem.id;
		const ts = arrayItem.requested_time;
		const setbtnclass = id == wlId ? "disabled" : "";

		document.getElementById("mdHistory").innerHTML +=
			'<button class="btn btn-primary btn-sm ' +
			setbtnclass +
			' mx-2 my-1 btnmdHistory" data-mdId="' +
			id +
			'" type="button">' +
			ts +
			"</button>";
	});

	// MD history button click handler
	$(".btnmdHistory").click(function () {
		window.location.href =
			"/" +
			APP_NAME +
			"/modalityCtr/" +
			modalityController +
			"/" +
			this.dataset.mdid +
			"/#cHxDiv";
	});

	// Make the disableTaskButtons function available globally if it's used by other scripts
	// This is safer than exposing a variable
	if (typeof window.patientBarUtils === "undefined") {
		window.patientBarUtils = {
			disableButtons: disableTaskButtons,
		};
	}

	// If there's an existing disableBtn function that other code relies on, map it to our new function
	if (typeof window.disableBtn === "function") {
		const originalDisableBtn = window.disableBtn;
		window.disableBtn = function (elements) {
			// Try our safer implementation first
			try {
				disableTaskButtons(elements);
			} catch (e) {
				// Fall back to original function if something goes wrong
				console.warn("Falling back to original disableBtn due to error:", e);
				originalDisableBtn(elements);
			}
		};
	} else {
		// Define it if it doesn't exist
		window.disableBtn = disableTaskButtons;
	}
})();
