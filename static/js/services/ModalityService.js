/**
 * Service class to handle modality-specific operations
 * @class ModalityService
 */
export class ModalityService {
	/**
	 * Process modality based on its type
	 * @param {string} modalityType - Type of modality
	 * @param {Object} patientData - Patient information
	 * @param {Object} studyData - Study information
	 * @returns {Promise<void>}
	 */
	static async processModality(modalityType, patientData, studyData) {
		const modalityHandlers = {
			l80: async () => await this.handleL80(patientData),
			"octopus 900": async () =>
				await this.handleEyesuite(patientData, "PERIMETRY_STATIC"),
			lenstar: async () =>
				await this.handleEyesuite(patientData, "BIOM_MEASUREMENT"),
			anterion: async () => await this.handleAnterion(studyData),
			pentacam: async () => await this.handlePentacam(studyData),
			md: async () => await this.handleMD(studyData),
		};

		const handler = modalityHandlers[modalityType.toLowerCase()];
		if (handler) {
			try {
				await handler();
			} catch (error) {
				console.error(`Error processing modality ${modalityType}:`, error);
				throw error;
			}
		} else {
			console.log(`No handler for modality type: ${modalityType}`);
		}
	}

	/**
	 * Handle L80 modality
	 * @private
	 * @param {Object} patientData - Patient information
	 * @returns {Promise<void>}
	 */
	static async handleL80(patientData) {
		const { id, lastname, firstname, dob, sex } = patientData;
		try {
			await this.addPatientVisionix("vx100", id, lastname, firstname, dob, sex);
			await this.addPatientVisionix("l80", id, lastname, firstname, dob, sex);
		} catch (error) {
			console.error("Error handling L80:", error);
			throw error;
		}
	}

	/**
	 * Handle Eyesuite modalities (Octopus 900 and Lenstar)
	 * @private
	 * @param {Object} patientData - Patient information
	 * @param {string} machineType - Type of machine
	 * @returns {Promise<void>}
	 */
	static async handleEyesuite(patientData, machineType) {
		const { id, lastname, firstname, dob, sex } = patientData;
		try {
			await this.addPatientEyesuite(
				machineType,
				id,
				lastname,
				firstname,
				dob,
				sex
			);
		} catch (error) {
			console.error("Error handling Eyesuite:", error);
			throw error;
		}
	}

	/**
	 * Handle Anterion modality
	 * @private
	 * @param {Object} studyData - Study information
	 * @returns {Promise<void>}
	 */
	static async handleAnterion(studyData) {
		try {
			const anterionData = {
				...studyData,
				StudyDescription: "Anterior OCT",
				ScheduledStationAETitle: "ANTERION",
			};
			await this.addStudyMwl(anterionData);
		} catch (error) {
			console.error("Error handling Anterion:", error);
			throw error;
		}
	}

	/**
	 * Handle Pentacam modality
	 * @private
	 * @param {Object} studyData - Study information
	 * @returns {Promise<void>}
	 */
	static async handlePentacam(studyData) {
		try {
			const pentacamData = {
				...studyData,
				StudyDescription: "Scheimpflug topography",
				ScheduledStationAETitle: "PENTACAM",
			};
			await this.addStudyMwl(pentacamData);
		} catch (error) {
			console.error("Error handling Pentacam:", error);
			throw error;
		}
	}

	/**
	 * Handle MD modality
	 * @private
	 * @param {Object} studyData - Study information
	 * @returns {Promise<void>}
	 */
	static async handleMD(studyData) {
		try {
			const mdData = {
				...studyData,
				StudyDescription: "Non mydriatic retinography",
				ScheduledStationAETitle: "CR1",
			};
			await this.addStudyMwl(mdData);
		} catch (error) {
			console.error("Error handling MD:", error);
			throw error;
		}
	}

	/**
	 * Add patient to Visionix system
	 * @private
	 * @param {string} system - System type (vx100 or l80)
	 * @param {string} id - Patient ID
	 * @param {string} lastname - Patient last name
	 * @param {string} firstname - Patient first name
	 * @param {string} dob - Patient date of birth
	 * @param {string} sex - Patient sex
	 * @returns {Promise<void>}
	 */
	static async addPatientVisionix(system, id, lastname, firstname, dob, sex) {
		// Implementation would depend on your Visionix API
		// This is a placeholder for the actual implementation
	}

	/**
	 * Add patient to Eyesuite system
	 * @private
	 * @param {string} machineType - Type of machine
	 * @param {string} id - Patient ID
	 * @param {string} lastname - Patient last name
	 * @param {string} firstname - Patient first name
	 * @param {string} dob - Patient date of birth
	 * @param {string} sex - Patient sex
	 * @returns {Promise<void>}
	 */
	static async addPatientEyesuite(
		machineType,
		id,
		lastname,
		firstname,
		dob,
		sex
	) {
		// Implementation would depend on your Eyesuite API
		// This is a placeholder for the actual implementation
	}

	/**
	 * Add study to MWL (Modality Worklist)
	 * @private
	 * @param {Object} studyData - Study information
	 * @returns {Promise<void>}
	 */
	static async addStudyMwl(studyData) {
		// Implementation would depend on your MWL API
		// This is a placeholder for the actual implementation
	}
}
