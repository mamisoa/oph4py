/**
 * Combo Manager - Enhanced Procedure-Modality Management Interface
 *
 * This module provides a modern UI for managing procedure-modality associations
 * while maintaining compatibility with the existing combo system.
 */

class ComboManager {
	constructor() {
		this.procedures = [];
		this.modalities = [];
		this.currentProcedure = null;
		this.currentAssociations = [];
		this.searchTimeout = null;

		this.init();
	}

	async init() {
		console.log("🔧 Initializing Combo Manager...");

		// Set up event listeners
		this.setupEventListeners();

		// Load initial data
		await this.loadInitialData();

		console.log("✅ Combo Manager initialized successfully");
	}

	setupEventListeners() {
		// Procedure search
		$("#procedureSearch").on("input", (e) => {
			clearTimeout(this.searchTimeout);
			this.searchTimeout = setTimeout(() => {
				this.filterProcedures(e.target.value);
			}, 300);
		});

		// Add procedure button
		$("#addProcedureBtn").on("click", () => this.showAddProcedureModal());

		// Save procedure button
		$("#saveProcedureBtn").on("click", () => this.saveNewProcedure());

		// Bulk add modal events
		$("#bulkAddConfirm").on("click", () => this.performBulkAdd());

		// Copy from procedure modal events
		$("#sourceProcedureSelect").on("change", (e) =>
			this.previewSourceModalities(e.target.value)
		);
		$("#copyFromConfirm").on("click", () => this.performCopyFrom());
	}

	async loadInitialData() {
		try {
			console.log("📥 Loading procedures and modalities...");

			// Load procedures and modalities in parallel
			const [proceduresResponse, modalitiesResponse] = await Promise.all([
				fetch(`${API_PROCEDURE}?@count=true&@order=exam_name`),
				fetch(`${API_MODALITY}?@count=true&@order=modality_name`),
			]);

			const proceduresData = await proceduresResponse.json();
			const modalitiesData = await modalitiesResponse.json();

			if (proceduresData.status === "success") {
				this.procedures = proceduresData.items || [];
				console.log(`📋 Loaded ${this.procedures.length} procedures`);
			}

			if (modalitiesData.status === "success") {
				this.modalities = modalitiesData.items || [];
				console.log(`🔧 Loaded ${this.modalities.length} modalities`);
			}

			// Load combo counts for each procedure
			await this.loadProcedureComboCounts();

			// Render the procedure list
			this.renderProcedureList();

			// Populate bulk operation modals
			this.populateModalSelects();
		} catch (error) {
			console.error("❌ Error loading initial data:", error);
			displayToast(
				"error",
				"Error",
				"Failed to load procedures and modalities"
			);
		}
	}

	async loadProcedureComboCounts() {
		try {
			// Get all combo records to count per procedure
			const response = await fetch(`${API_COMBO}?@count=true`);
			const data = await response.json();

			console.log("📊 Raw combo API response:", data);

			if (data.status === "success" && data.items) {
				// Create a map of procedure ID to combo count
				const comboCounts = {};
				data.items.forEach((item) => {
					const procedureId = item.id_procedure;
					comboCounts[procedureId] = (comboCounts[procedureId] || 0) + 1;
				});

				console.log("📊 Combo counts by procedure:", comboCounts);

				// Update procedures with combo counts
				this.procedures.forEach((procedure) => {
					procedure.comboCount = comboCounts[procedure.id] || 0;
				});

				console.log(
					"📊 Updated procedures with counts:",
					this.procedures.map((p) => ({
						name: p.exam_name,
						id: p.id,
						count: p.comboCount,
					}))
				);
			} else {
				console.warn("📊 No combo data found or API error:", data);
			}
		} catch (error) {
			console.error("❌ Error loading combo counts:", error);
			console.error("❌ Error details:", error.message);
			// Continue without counts - not critical
		}
	}

	renderProcedureList(searchTerm = "") {
		const procedureList = $("#procedureList");

		// Filter procedures if search term provided
		let filteredProcedures = this.procedures;
		if (searchTerm) {
			filteredProcedures = this.procedures.filter((proc) =>
				proc.exam_name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		if (filteredProcedures.length === 0) {
			procedureList.html(`
                <div class="empty-state">
                    <i class="fas fa-search fa-2x mb-3"></i>
                    <h6>No procedures found</h6>
                    <p>Try adjusting your search terms.</p>
                </div>
            `);
			return;
		}

		const html = filteredProcedures
			.map(
				(procedure) => `
            <div class="procedure-item" data-procedure-id="${procedure.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="procedure-name">${procedure.exam_name}</span>
                    <span class="procedure-count">${
											procedure.comboCount || 0
										}</span>
                </div>
            </div>
        `
			)
			.join("");

		procedureList.html(html);

		// Add click handlers
		$(".procedure-item").on("click", (e) => {
			const procedureId = $(e.currentTarget).data("procedure-id");
			this.selectProcedure(procedureId);
		});
	}

	filterProcedures(searchTerm) {
		this.renderProcedureList(searchTerm);
	}

	async selectProcedure(procedureId) {
		try {
			// Update UI to show selection
			$(".procedure-item").removeClass("active");
			$(`.procedure-item[data-procedure-id="${procedureId}"]`).addClass(
				"active"
			);

			// Find the procedure
			this.currentProcedure = this.procedures.find((p) => p.id == procedureId);
			if (!this.currentProcedure) {
				console.error("❌ Procedure not found:", procedureId);
				return;
			}

			console.log(`📋 Selected procedure: ${this.currentProcedure.exam_name}`);

			// Load current associations
			await this.loadCurrentAssociations(procedureId);

			// Render modality panel
			this.renderModalityPanel();
		} catch (error) {
			console.error("❌ Error selecting procedure:", error);
			displayToast("error", "Error", "Failed to load procedure details");
		}
	}

	async loadCurrentAssociations(procedureId) {
		try {
			const response = await fetch(
				`${API_COMBO}?id_procedure.eq=${procedureId}&@lookup=id_modality!:id_modality[id,modality_name]&@count=true&@order=id_modality.modality_name`
			);
			const data = await response.json();

			if (data.status === "success") {
				this.currentAssociations = data.items || [];
				console.log(
					`🔗 Loaded ${this.currentAssociations.length} associations for procedure ${procedureId}`
				);
			} else {
				this.currentAssociations = [];
			}
		} catch (error) {
			console.error("❌ Error loading associations:", error);
			this.currentAssociations = [];
		}
	}

	renderModalityPanel() {
		if (!this.currentProcedure) {
			return;
		}

		// Get associated modality IDs for quick lookup
		const associatedModalityIds = new Set(
			this.currentAssociations.map((assoc) => assoc["id_modality.id"])
		);

		// Separate associated and available modalities
		const associatedModalities = this.currentAssociations.map((assoc) => ({
			id: assoc["id_modality.id"],
			name: assoc["id_modality.modality_name"],
			comboId: assoc.id,
		}));

		const availableModalities = this.modalities.filter(
			(modality) => !associatedModalityIds.has(modality.id)
		);

		const html = `
            <div class="modality-header mb-4">
                <h4>${this.currentProcedure.exam_name}</h4>
                <p class="text-muted">Manage modality associations for this procedure</p>
                <div class="d-flex gap-2 mb-3">
                    <button type="button" class="btn btn-outline-primary btn-sm" onclick="comboManager.showBulkAddModal()">
                        <i class="fas fa-plus"></i> Add Multiple
                    </button>
                    <button type="button" class="btn btn-outline-secondary btn-sm" onclick="comboManager.showCopyFromModal()">
                        <i class="fas fa-copy"></i> Copy From Other
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="comboManager.deleteProcedure()">
                        <i class="fas fa-trash"></i> Delete Procedure
                    </button>
                </div>
            </div>
            
            <div class="modality-section">
                <h6 class="text-success">
                    <i class="fas fa-check-circle"></i> 
                    Current Associations (${associatedModalities.length})
                </h6>
                <div class="associated-modalities mb-4">
                    ${
											associatedModalities.length > 0
												? associatedModalities
														.map(
															(modality) => `
                            <div class="modality-item associated">
                                <span class="modality-name">
                                    <i class="fas fa-check text-success me-2"></i>
                                    ${modality.name}
                                </span>
                                <div class="modality-actions">
                                    <button type="button" class="btn btn-outline-danger btn-sm" 
                                            onclick="comboManager.removeAssociation(${modality.comboId}, '${modality.name}')">
                                        <i class="fas fa-times"></i> Remove
                                    </button>
                                </div>
                            </div>
                        `
														)
														.join("")
												: '<p class="text-muted fst-italic">No modalities associated with this procedure.</p>'
										}
                </div>
            </div>
            
            <div class="modality-section">
                <h6 class="text-primary">
                    <i class="fas fa-plus-circle"></i> 
                    Available to Add (${availableModalities.length})
                </h6>
                <div class="available-modalities">
                    ${
											availableModalities.length > 0
												? availableModalities
														.map(
															(modality) => `
                            <div class="modality-item">
                                <span class="modality-name">
                                    <i class="fas fa-circle text-muted me-2"></i>
                                    ${modality.modality_name}
                                </span>
                                <div class="modality-actions">
                                    <button type="button" class="btn btn-outline-success btn-sm" 
                                            onclick="comboManager.addAssociation(${modality.id}, '${modality.modality_name}')">
                                        <i class="fas fa-plus"></i> Add
                                    </button>
                                </div>
                            </div>
                        `
														)
														.join("")
												: '<p class="text-muted fst-italic">All available modalities are already associated.</p>'
										}
                </div>
            </div>
        `;

		$("#modalityContent").html(html);
	}

	async addAssociation(modalityId, modalityName) {
		try {
			console.log(
				`➕ Adding association: ${this.currentProcedure.exam_name} → ${modalityName}`
			);

			const data = {
				id_procedure: this.currentProcedure.id,
				id_modality: modalityId,
			};

			const result = await crudp("combo", "0", "POST", JSON.stringify(data));

			if (result.status === "success") {
				// Reload associations and refresh display
				await this.loadCurrentAssociations(this.currentProcedure.id);
				this.renderModalityPanel();

				// Update procedure count in sidebar
				this.updateProcedureCount(this.currentProcedure.id, 1);

				displayToast(
					"success",
					"Association Added",
					`${modalityName} added to ${this.currentProcedure.exam_name}`
				);
			}
		} catch (error) {
			console.error("❌ Error adding association:", error);
			displayToast("error", "Error", "Failed to add modality association");
		}
	}

	async removeAssociation(comboId, modalityName) {
		bootbox.confirm({
			message: `Are you sure you want to remove <strong>${modalityName}</strong> from <strong>${this.currentProcedure.exam_name}</strong>?`,
			buttons: {
				confirm: {
					label: "Yes, Remove",
					className: "btn-danger",
				},
				cancel: {
					label: "Cancel",
					className: "btn-secondary",
				},
			},
			callback: async (result) => {
				if (result) {
					try {
						console.log(
							`➖ Removing association: ${this.currentProcedure.exam_name} → ${modalityName}`
						);

						const deleteResult = await crudp(
							"combo",
							comboId.toString(),
							"DELETE"
						);

						if (deleteResult.status === "success") {
							// Reload associations and refresh display
							await this.loadCurrentAssociations(this.currentProcedure.id);
							this.renderModalityPanel();

							// Update procedure count in sidebar
							this.updateProcedureCount(this.currentProcedure.id, -1);

							displayToast(
								"success",
								"Association Removed",
								`${modalityName} removed from ${this.currentProcedure.exam_name}`
							);
						}
					} catch (error) {
						console.error("❌ Error removing association:", error);
						displayToast(
							"error",
							"Error",
							"Failed to remove modality association"
						);
					}
				}
			},
		});
	}

	updateProcedureCount(procedureId, delta) {
		// Update the count in our data
		const procedure = this.procedures.find((p) => p.id == procedureId);
		if (procedure) {
			procedure.comboCount = Math.max(0, (procedure.comboCount || 0) + delta);

			// Update the UI
			$(
				`.procedure-item[data-procedure-id="${procedureId}"] .procedure-count`
			).text(procedure.comboCount);
		}
	}

	showBulkAddModal() {
		if (!this.currentProcedure) return;

		// Get available modalities (not currently associated)
		const associatedModalityIds = new Set(
			this.currentAssociations.map((assoc) => assoc["id_modality.id"])
		);

		const availableModalities = this.modalities.filter(
			(modality) => !associatedModalityIds.has(modality.id)
		);

		$("#bulkProcedureName").text(this.currentProcedure.exam_name);

		const modalityListHtml = availableModalities
			.map(
				(modality) => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${modality.id}" id="bulk_${modality.id}">
                <label class="form-check-label" for="bulk_${modality.id}">
                    ${modality.modality_name}
                </label>
            </div>
        `
			)
			.join("");

		$("#bulkModalityList").html(modalityListHtml);

		// Show modal
		const modal = new bootstrap.Modal(document.getElementById("bulkAddModal"));
		modal.show();
	}

	async performBulkAdd() {
		try {
			const selectedModalityIds = [];
			$("#bulkModalityList input:checked").each(function () {
				selectedModalityIds.push(parseInt($(this).val()));
			});

			if (selectedModalityIds.length === 0) {
				displayToast(
					"warning",
					"No Selection",
					"Please select at least one modality to add"
				);
				return;
			}

			console.log(
				`📦 Bulk adding ${selectedModalityIds.length} modalities to ${this.currentProcedure.exam_name}`
			);

			// Add each association
			const promises = selectedModalityIds.map((modalityId) => {
				const data = {
					id_procedure: this.currentProcedure.id,
					id_modality: modalityId,
				};
				return crudp("combo", "0", "POST", JSON.stringify(data));
			});

			const results = await Promise.all(promises);
			const successCount = results.filter((r) => r.status === "success").length;

			if (successCount > 0) {
				// Reload associations and refresh display
				await this.loadCurrentAssociations(this.currentProcedure.id);
				this.renderModalityPanel();

				// Update procedure count
				this.updateProcedureCount(this.currentProcedure.id, successCount);

				displayToast(
					"success",
					"Bulk Add Complete",
					`Added ${successCount} modalities to ${this.currentProcedure.exam_name}`
				);
			}

			// Hide modal
			bootstrap.Modal.getInstance(
				document.getElementById("bulkAddModal")
			).hide();
		} catch (error) {
			console.error("❌ Error in bulk add:", error);
			displayToast("error", "Error", "Failed to add modalities");
		}
	}

	showCopyFromModal() {
		if (!this.currentProcedure) return;

		$("#copyToProcedureName").text(this.currentProcedure.exam_name);

		// Reset modal state
		$("#sourceProcedureSelect").val("");
		$("#sourceModalityPreview").hide();
		$("#copyFromConfirm").prop("disabled", true);

		// Show modal
		const modal = new bootstrap.Modal(document.getElementById("copyFromModal"));
		modal.show();
	}

	async previewSourceModalities(sourceProcedureId) {
		if (!sourceProcedureId) {
			$("#sourceModalityPreview").hide();
			$("#copyFromConfirm").prop("disabled", true);
			return;
		}

		try {
			// Load associations for source procedure
			const response = await fetch(
				`${API_COMBO}?id_procedure.eq=${sourceProcedureId}&@lookup=id_modality!:id_modality[modality_name]&@count=true`
			);
			const data = await response.json();

			if (data.status === "success" && data.items) {
				const sourceModalities = data.items.map(
					(item) => item["id_modality.modality_name"]
				);

				$("#sourceModalityList").html(
					sourceModalities
						.map(
							(name) => `<span class="badge bg-secondary me-1">${name}</span>`
						)
						.join("")
				);
				$("#sourceModalityPreview").show();
				$("#copyFromConfirm").prop("disabled", false);
			}
		} catch (error) {
			console.error("❌ Error loading source modalities:", error);
		}
	}

	async performCopyFrom() {
		const sourceProcedureId = $("#sourceProcedureSelect").val();
		if (!sourceProcedureId || !this.currentProcedure) return;

		try {
			// Get source procedure associations
			const response = await fetch(
				`${API_COMBO}?id_procedure.eq=${sourceProcedureId}&@lookup=id_modality!:id_modality[id]&@count=true`
			);
			const data = await response.json();

			if (data.status === "success" && data.items) {
				// Get current associations to avoid duplicates
				const currentModalityIds = new Set(
					this.currentAssociations.map((assoc) => assoc["id_modality.id"])
				);

				// Filter out already associated modalities
				const modalityIdsToAdd = data.items
					.map((item) => item["id_modality.id"])
					.filter((id) => !currentModalityIds.has(id));

				if (modalityIdsToAdd.length === 0) {
					displayToast(
						"info",
						"No New Associations",
						"All modalities from source procedure are already associated"
					);
					return;
				}

				console.log(
					`📋 Copying ${modalityIdsToAdd.length} modalities from source procedure`
				);

				// Add each new association
				const promises = modalityIdsToAdd.map((modalityId) => {
					const data = {
						id_procedure: this.currentProcedure.id,
						id_modality: modalityId,
					};
					return crudp("combo", "0", "POST", JSON.stringify(data));
				});

				const results = await Promise.all(promises);
				const successCount = results.filter(
					(r) => r.status === "success"
				).length;

				if (successCount > 0) {
					// Reload associations and refresh display
					await this.loadCurrentAssociations(this.currentProcedure.id);
					this.renderModalityPanel();

					// Update procedure count
					this.updateProcedureCount(this.currentProcedure.id, successCount);

					displayToast(
						"success",
						"Copy Complete",
						`Copied ${successCount} modalities to ${this.currentProcedure.exam_name}`
					);
				}

				// Hide modal
				bootstrap.Modal.getInstance(
					document.getElementById("copyFromModal")
				).hide();
			}
		} catch (error) {
			console.error("❌ Error copying modalities:", error);
			displayToast("error", "Error", "Failed to copy modalities");
		}
	}

	populateModalSelects() {
		// Populate source procedure select in copy modal
		const procedureOptions = this.procedures
			.map((proc) => `<option value="${proc.id}">${proc.exam_name}</option>`)
			.join("");

		$("#sourceProcedureSelect").append(procedureOptions);
	}

	showAddProcedureModal() {
		// Reset form
		$("#addProcedureForm")[0].reset();

		// Populate modality checkboxes
		const modalityCheckboxHtml = this.modalities
			.map(
				(modality) => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${modality.id}" id="new_modal_${modality.id}">
                <label class="form-check-label" for="new_modal_${modality.id}">
                    ${modality.modality_name}
                </label>
            </div>
        `
			)
			.join("");

		$("#modalityCheckboxList").html(modalityCheckboxHtml);

		// Show modal
		const modal = new bootstrap.Modal(
			document.getElementById("addProcedureModal")
		);
		modal.show();
	}

	async saveNewProcedure() {
		try {
			// Get form data
			const procedureName = $("#procedureName").val().trim();
			const procedureDescription = $("#procedureDescription").val().trim();

			// Validate required fields
			if (!procedureName) {
				displayToast(
					"warning",
					"Validation Error",
					"Procedure name is required"
				);
				$("#procedureName").focus();
				return;
			}

			// Check for duplicate names
			const existingProcedure = this.procedures.find(
				(p) => p.exam_name.toLowerCase() === procedureName.toLowerCase()
			);
			if (existingProcedure) {
				displayToast(
					"warning",
					"Duplicate Name",
					"A procedure with this name already exists"
				);
				$("#procedureName").focus();
				return;
			}

			console.log(`➕ Creating new procedure: ${procedureName}`);

			// Create procedure data
			const procedureData = {
				exam_name: procedureName,
				exam_description: procedureDescription || "",
			};

			// Create the procedure
			const result = await crudp(
				"procedure",
				"0",
				"POST",
				JSON.stringify(procedureData)
			);

			if (result.status === "success") {
				console.log(`✅ Procedure created with ID: ${result.id}`);

				// Get selected modalities
				const selectedModalityIds = [];
				$("#modalityCheckboxList input:checked").each(function () {
					selectedModalityIds.push(parseInt($(this).val()));
				});

				// Create modality associations if any were selected
				if (selectedModalityIds.length > 0) {
					console.log(
						`🔗 Creating ${selectedModalityIds.length} modality associations...`
					);

					const associationPromises = selectedModalityIds.map((modalityId) => {
						const comboData = {
							id_procedure: result.id,
							id_modality: modalityId,
						};
						return crudp("combo", "0", "POST", JSON.stringify(comboData));
					});

					const associationResults = await Promise.all(associationPromises);
					const successfulAssociations = associationResults.filter(
						(r) => r.status === "success"
					).length;

					console.log(
						`✅ Created ${successfulAssociations} modality associations`
					);
				}

				// Reload the data to refresh the interface
				await this.loadInitialData();

				// Auto-select the new procedure
				setTimeout(() => {
					this.selectProcedure(result.id);
				}, 500);

				// Hide modal
				bootstrap.Modal.getInstance(
					document.getElementById("addProcedureModal")
				).hide();

				displayToast(
					"success",
					"Procedure Created",
					`${procedureName} has been created${
						selectedModalityIds.length > 0
							? ` with ${selectedModalityIds.length} modality associations`
							: ""
					}`
				);
			} else {
				throw new Error(result.message || "Failed to create procedure");
			}
		} catch (error) {
			console.error("❌ Error creating procedure:", error);
			displayToast("error", "Error", "Failed to create procedure");
		}
	}

	deleteProcedure() {
		if (!this.currentProcedure) {
			displayToast(
				"warning",
				"No Selection",
				"Please select a procedure to delete"
			);
			return;
		}

		const procedureName = this.currentProcedure.exam_name;
		const procedureId = this.currentProcedure.id;
		const associationCount = this.currentProcedure.comboCount || 0;

		// Configure bootbox to position below nav bar
		const originalBackdropCallback = bootbox.setDefaults;

		// Custom styling for bootbox positioning
		const customBootboxOptions = {
			className: "positioned-below-nav",
			backdrop: true,
			closeButton: false,
			animate: true,
			centerVertical: false,
		};

		let confirmMessage = `Are you sure you want to delete the procedure <strong>"${procedureName}"</strong>?`;

		if (associationCount > 0) {
			confirmMessage += `<br><br><div class="alert alert-warning mt-2">
				<i class="fas fa-exclamation-triangle"></i> 
				<strong>Warning:</strong> This procedure has <strong>${associationCount} modality association(s)</strong> 
				that will also be deleted.
			</div>`;
		}

		confirmMessage += `<br><small class="text-muted">This action cannot be undone.</small>`;

		bootbox.confirm({
			...customBootboxOptions,
			title: '<i class="fas fa-trash text-danger"></i> Delete Procedure',
			message: confirmMessage,
			buttons: {
				confirm: {
					label: '<i class="fas fa-trash"></i> Yes, Delete',
					className: "btn-danger",
				},
				cancel: {
					label: '<i class="fas fa-times"></i> Cancel',
					className: "btn-secondary",
				},
			},
			callback: async (result) => {
				if (result) {
					await this.performProcedureDeletion(
						procedureId,
						procedureName,
						associationCount
					);
				}
			},
		});

		// Add custom CSS to position bootbox below nav bar
		setTimeout(() => {
			$(".positioned-below-nav .modal").css({
				"padding-top": "80px",
			});
		}, 50);
	}

	async performProcedureDeletion(procedureId, procedureName, associationCount) {
		try {
			console.log(
				`🗑️ Deleting procedure: ${procedureName} (ID: ${procedureId})`
			);

			// First delete all associated combo records
			if (associationCount > 0) {
				console.log(`🗑️ Deleting ${associationCount} modality associations...`);

				// Get all combo records for this procedure
				const comboResponse = await fetch(
					`${API_COMBO}?id_procedure.eq=${procedureId}&@count=true`
				);
				const comboData = await comboResponse.json();

				if (comboData.status === "success" && comboData.items) {
					// Delete each combo record
					const deletePromises = comboData.items.map((combo) =>
						crudp("combo", combo.id.toString(), "DELETE")
					);

					const deleteResults = await Promise.all(deletePromises);
					const successfulDeletes = deleteResults.filter(
						(r) => r.status === "success"
					).length;

					console.log(`✅ Deleted ${successfulDeletes} modality associations`);
				}
			}

			// Now delete the procedure itself
			console.log(`🗑️ Deleting procedure: ${procedureName}`);
			const result = await crudp("procedure", procedureId.toString(), "DELETE");

			if (result.status === "success") {
				console.log(`✅ Procedure deleted successfully`);

				// Clear current selection
				this.currentProcedure = null;
				this.currentAssociations = [];

				// Reload the data to refresh the interface
				await this.loadInitialData();

				// Reset the right panel to empty state
				$("#modalityContent").html(`
					<div class="empty-state">
						<i class="fas fa-check-circle fa-2x mb-3 text-success"></i>
						<h5>Procedure Deleted</h5>
						<p>The procedure "${procedureName}" has been successfully deleted.</p>
						<p class="text-muted">Select another procedure from the list to manage its modalities.</p>
					</div>
				`);

				let successMessage = `Procedure "${procedureName}" has been deleted successfully`;
				if (associationCount > 0) {
					successMessage += ` along with ${associationCount} modality association(s)`;
				}

				displayToast("success", "Procedure Deleted", successMessage);
			} else {
				throw new Error(result.message || "Failed to delete procedure");
			}
		} catch (error) {
			console.error("❌ Error deleting procedure:", error);
			displayToast(
				"error",
				"Error",
				`Failed to delete procedure: ${error.message}`
			);
		}
	}
}

// Initialize the combo manager when document is ready
let comboManager;

$(document).ready(function () {
	console.log("🚀 Initializing Combo Management Interface...");
	comboManager = new ComboManager();
});

// Export for global access
window.comboManager = comboManager;
