/**
 * Worklist State Manager
 * 
 * This file contains utility classes to manage worklist operations,
 * prevent concurrency issues, and provide reliable UI feedback.
 */

/**
 * Manages the state of worklist items to prevent concurrency issues
 */
class WorklistStateManager {
    constructor() {
        this.pendingItems = new Map();  // keyed by uniqueId
        this.processedItems = new Map(); // tracking processing status
        this.htmlElements = new Map();   // references to DOM elements
        this.patientContext = null;      // current patient context
    }
    
    /**
     * Set the current patient context
     * @param {Object} patient - Patient data object
     */
    setPatientContext(patient) {
        this.patientContext = patient;
    }
    
    /**
     * Get the current patient context
     * @returns {Object} Current patient context
     */
    getPatientContext() {
        return this.patientContext;
    }
    
    /**
     * Add a new item to the pending items
     * @param {Object} item - Worklist item to add
     * @returns {String} Generated unique ID for the item
     */
    addItem(item) {
        const uniqueId = this.generateUniqueId();
        item.uniqueId = uniqueId;
        this.pendingItems.set(uniqueId, item);
        return uniqueId;
    }
    
    /**
     * Update the status of an item
     * @param {String} id - Unique ID of the item
     * @param {String} status - New status of the item
     * @param {Object} data - Additional data to store with the item
     */
    updateItemStatus(id, status, data = {}) {
        if (this.pendingItems.has(id)) {
            const item = this.pendingItems.get(id);
            item.status = status;
            item.data = { ...item.data, ...data };
            this.pendingItems.set(id, item);
            
            if (status === 'completed' || status === 'failed') {
                this.processedItems.set(id, this.pendingItems.get(id));
                this.pendingItems.delete(id);
            }
        }
    }
    
    /**
     * Get items by patient ID
     * @param {Number} patientId - Patient ID to filter by
     * @returns {Array} List of items for the patient
     */
    getItemsByPatient(patientId) {
        const items = [];
        this.pendingItems.forEach(item => {
            if (item.id_auth_user === patientId) {
                items.push(item);
            }
        });
        return items;
    }
    
    /**
     * Get all pending items
     * @returns {Array} Array of all pending items
     */
    getAllPendingItems() {
        return Array.from(this.pendingItems.values());
    }
    
    /**
     * Get all processed items
     * @returns {Array} Array of all processed items
     */
    getAllProcessedItems() {
        return Array.from(this.processedItems.values());
    }
    
    /**
     * Clear all pending items
     */
    clearPendingItems() {
        this.pendingItems.clear();
    }
    
    /**
     * Clear all processed items
     */
    clearProcessedItems() {
        this.processedItems.clear();
    }
    
    /**
     * Generate a unique ID for an item
     * @returns {String} Unique ID
     */
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    /**
     * Validate that all items belong to the same patient
     * @returns {Boolean} True if all items belong to the same patient
     */
    validatePatientConsistency() {
        if (this.pendingItems.size === 0) return true;
        
        const items = this.getAllPendingItems();
        const firstPatientId = items[0].id_auth_user;
        
        return items.every(item => item.id_auth_user === firstPatientId);
    }
}

/**
 * Manages a queue of requests to prevent race conditions
 */
class RequestQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }
    
    /**
     * Add a request to the queue
     * @param {Function} requestFn - Function to execute
     * @param {Function} successCallback - Callback on success
     * @param {Function} errorCallback - Callback on error
     */
    enqueue(requestFn, successCallback, errorCallback) {
        this.queue.push({
            requestFn,
            successCallback,
            errorCallback
        });
        
        if (!this.processing) {
            this.processNext();
        }
    }
    
    /**
     * Process the next request in the queue
     */
    processNext() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }
        
        this.processing = true;
        const { requestFn, successCallback, errorCallback } = this.queue.shift();
        
        try {
            const result = requestFn();
            
            // Handle both Promise and non-Promise results
            if (result instanceof Promise) {
                result
                    .then(data => {
                        if (successCallback) successCallback(data);
                        this.processNext();
                    })
                    .catch(error => {
                        if (errorCallback) errorCallback(error);
                        this.processNext();
                    });
            } else {
                if (successCallback) successCallback(result);
                this.processNext();
            }
        } catch (error) {
            if (errorCallback) errorCallback(error);
            this.processNext();
        }
    }
    
    /**
     * Clear all pending requests
     */
    clear() {
        this.queue = [];
        this.processing = false;
    }
    
    /**
     * Get the number of pending requests
     * @returns {Number} Number of pending requests
     */
    size() {
        return this.queue.length;
    }
}

/**
 * Manages UI state during request processing
 */
class UIManager {
    constructor() {
        this.lockedElements = new Set();
    }
    
    /**
     * Lock a UI element to prevent user interaction
     * @param {String|Element} element - Element or selector to lock
     * @param {String} loadingMessage - Optional loading message
     */
    lockUI(element, loadingMessage = 'Processing...') {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;
        
        // Store original state
        el._originalState = {
            disabled: el.disabled,
            html: el.innerHTML
        };
        
        // Disable element
        el.disabled = true;
        
        // Add loading indicator if it's a button
        if (el.tagName === 'BUTTON') {
            el.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${loadingMessage}`;
        }
        
        this.lockedElements.add(el);
    }
    
    /**
     * Unlock a previously locked UI element
     * @param {String|Element} element - Element or selector to unlock
     */
    unlockUI(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el || !this.lockedElements.has(el)) return;
        
        // Restore original state
        if (el._originalState) {
            el.disabled = el._originalState.disabled;
            el.innerHTML = el._originalState.html;
            delete el._originalState;
        } else {
            el.disabled = false;
        }
        
        this.lockedElements.delete(el);
    }
    
    /**
     * Show feedback to the user
     * @param {String} status - Status type (success, error, warning, info)
     * @param {String} message - Message to display
     * @param {String} containerId - ID of the container to show the message in
     */
    showFeedback(status, message, containerId = 'feedbackContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const alertClass = `alert-${status === 'error' ? 'danger' : status}`;
        
        const alertElement = document.createElement('div');
        alertElement.className = `alert ${alertClass} alert-dismissible fade show`;
        alertElement.setAttribute('role', 'alert');
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        container.appendChild(alertElement);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.classList.remove('show');
                setTimeout(() => {
                    if (alertElement.parentNode) {
                        alertElement.parentNode.removeChild(alertElement);
                    }
                }, 150);
            }
        }, 5000);
    }
    
    /**
     * Update the display of an item
     * @param {String} id - ID of the item
     * @param {String} status - Status to display
     */
    updateItemDisplay(id, status) {
        const itemElement = document.getElementById(`item-${id}`);
        if (!itemElement) return;
        
        // Remove existing status classes
        itemElement.classList.remove('status-pending', 'status-processing', 'status-success', 'status-error');
        
        // Add new status class
        itemElement.classList.add(`status-${status}`);
        
        // Update status text if there's a status indicator
        const statusIndicator = itemElement.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
    }
}

// Export the classes for use in other files
window.WorklistState = {
    Manager: new WorklistStateManager(),
    Queue: new RequestQueue(),
    UI: new UIManager()
}; 