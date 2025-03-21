/**
 * Service class to handle all API calls
 * @class ApiService
 */
export class ApiService {
	/**
	 * Base URL for API calls
	 * @type {string}
	 */
	static baseUrl = window.HOSTURL + "/" + window.APP_NAME;

	/**
	 * Get user information by ID
	 * @param {string} userId - User ID to fetch information for
	 * @returns {Promise<Object>} User information
	 * @throws {Error} If the API call fails
	 */
	static async getUserInfo(userId) {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/auth_user/${userId}?@lookup=gender!:gender[sex]`
			);
			if (!response.ok) throw new Error("Failed to fetch user info");
			return await response.json();
		} catch (error) {
			console.error("Error fetching user info:", error);
			throw error;
		}
	}

	/**
	 * Add patient to PACS system
	 * @param {Object} patientData - Patient data to add to PACS
	 * @returns {Promise<Object>} Response from PACS system
	 * @throws {Error} If the API call fails
	 */
	static async addPatientToPacs(patientData) {
		try {
			const response = await fetch(`${this.baseUrl}/api/pacs/patient`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(patientData),
			});
			if (!response.ok) throw new Error("Failed to add patient to PACS");
			return await response.json();
		} catch (error) {
			console.error("Error adding patient to PACS:", error);
			throw error;
		}
	}

	/**
	 * Get modality information
	 * @param {string} modalityId - Modality ID to fetch information for
	 * @returns {Promise<Object>} Modality information
	 * @throws {Error} If the API call fails
	 */
	static async getModalityInfo(modalityId) {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/modality/${modalityId}`
			);
			if (!response.ok) throw new Error("Failed to fetch modality info");
			return await response.json();
		} catch (error) {
			console.error("Error fetching modality info:", error);
			throw error;
		}
	}

	/**
	 * Generate UUID for message
	 * @returns {Promise<Object>} UUID information
	 * @throws {Error} If the API call fails
	 */
	static async generateUuid() {
		try {
			const response = await fetch(`${this.baseUrl}/api/uuid`);
			if (!response.ok) throw new Error("Failed to generate UUID");
			return await response.json();
		} catch (error) {
			console.error("Error generating UUID:", error);
			throw error;
		}
	}

	/**
	 * Add or update worklist item
	 * @param {string} action - Action to perform (POST or PUT)
	 * @param {string} id - ID of worklist item (for PUT)
	 * @param {Object} data - Worklist item data
	 * @returns {Promise<Object>} Response from server
	 * @throws {Error} If the API call fails
	 */
	static async handleWorklistItem(action, id, data) {
		try {
			const url =
				action === "PUT"
					? `${this.baseUrl}/api/worklist/${id}`
					: `${this.baseUrl}/api/worklist`;

			const response = await fetch(url, {
				method: action,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) throw new Error(`Failed to ${action} worklist item`);
			return await response.json();
		} catch (error) {
			console.error(`Error ${action} worklist item:`, error);
			throw error;
		}
	}
}
