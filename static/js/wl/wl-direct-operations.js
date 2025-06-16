/**
 * Direct Worklist Operations
 * 
 * This file contains direct CRUDP operations that bypass the queue system
 * for simple, individual operations. The queue system is reserved only 
 * for complex operations like combo insertions.
 */

/**
 * Direct CRUDP operation with toast notification
 * @param {string} table - Database table name
 * @param {string} id - Record ID
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} data - Data to send
 * @param {string} successMessage - Success message for toast
 * @param {string} errorMessage - Error message for toast
 * @returns {Promise}
 */
async function crudpWithToast(table, id = "0", method = "POST", data, successMessage, errorMessage) {
    try {
        const result = await crudp(table, id, method, data);
        
        if (successMessage) {
            displayToast('success', 'Success', successMessage);
        }
        
        return result;
    } catch (error) {
        console.error(`CRUDP operation failed:`, error);
        
        const message = errorMessage || `Error with ${method} ${table}: ${error.message}`;
        displayToast('error', 'Error', message);
        
        throw error;
    }
}

/**
 * Delete worklist item with confirmation and toast (DIRECT - NO QUEUE)
 * @param {Object} row - Row data from table
 * @returns {Promise}
 */
async function deleteWorklistItemDirect(row) {
    return new Promise((resolve, reject) => {
        bootbox.confirm({
            message: "Are you sure you want to delete this worklist item?",
            closeButton: false,
            buttons: {
                confirm: { label: "Yes", className: "btn-success" },
                cancel: { label: "No", className: "btn-danger" }
            },
            callback: async function (result) {
                if (result) {
                    try {
                        await crudpWithToast(
                            "worklist", 
                            row.id, 
                            "DELETE", 
                            null,
                            `Worklist item ID: ${row.id} deleted successfully`,
                            `Error deleting worklist item ID: ${row.id}`
                        );
                        
                        // Refresh table after successful deletion
                        setTimeout(() => {
                            $table_wl.bootstrapTable("refresh");
                        }, 100);
                        
                        resolve();
                    } catch (error) {
                        // Handle 404 as success (item already deleted)
                        if (error.status === 404) {
                            displayToast('info', 'Information', 'Item was already deleted');
                            setTimeout(() => {
                                $table_wl.bootstrapTable("refresh");
                            }, 100);
                            resolve();
                        } else {
                            reject(error);
                        }
                    }
                } else {
                    resolve(); // User cancelled
                }
            }
        });
    });
}

/**
 * Update worklist item status directly (DIRECT - NO QUEUE)
 * @param {Object} dataObj - Data object with status updates
 * @param {string} successMessage - Success message to display
 * @returns {Promise}
 */
async function updateWorklistStatusDirect(dataObj, successMessage) {
    const dataStr = JSON.stringify(dataObj);
    
    try {
        const result = await setWlItemStatusWithoutToast(dataStr);
        
        displayToast('success', 'Success', successMessage || result.message);
        
        // Refresh table after successful update
        setTimeout(() => {
            $table_wl.bootstrapTable("refresh");
        }, 100);
        
        return result;
    } catch (error) {
        console.error('Status update failed:', error);
        displayToast('error', 'Error', `Error updating status: ${error.message}`);
        throw error;
    }
}

/**
 * Add single worklist item directly (DIRECT - NO QUEUE)
 * @param {Object} formDataObj - Form data object
 * @returns {Promise}
 */
async function addSingleWorklistItemDirect(formDataObj) {
    try {
        // Clean up fields for single item
        delete formDataObj["modality_name"];
        
        // Ensure counter is a number
        if (typeof formDataObj.counter === "string") {
            formDataObj.counter = parseInt(formDataObj.counter, 10) || 0;
        }

        // Add directly to UI with simple uniqueId
        const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        formDataObj.uniqueId = uniqueId;
        const formDataStr = JSON.stringify(formDataObj);
        
        // Add to UI immediately
        appendWlItem(formDataStr, wlItemsCounter++);
        
        displayToast('success', 'Success', 'Item added to worklist successfully');
        
        return { success: true, uniqueId: uniqueId };
    } catch (error) {
        console.error('Single item addition failed:', error);
        displayToast('error', 'Error', `Error adding item: ${error.message}`);
        throw error;
    }
}

/**
 * Lock/unlock UI button with visual feedback
 * @param {HTMLElement} button - Button element to lock/unlock
 * @param {boolean} lock - True to lock, false to unlock
 * @param {string} lockText - Text to show when locked
 * @param {string} originalHTML - Original button HTML to restore
 */
function toggleButtonLock(button, lock, lockText = 'Processing...', originalHTML = null) {
    if (lock) {
        button.disabled = true;
        button.dataset.originalHTML = button.innerHTML;
        button.innerHTML = `<i class="fa fa-spinner fa-spin"></i> ${lockText}`;
    } else {
        button.disabled = false;
        button.innerHTML = originalHTML || button.dataset.originalHTML || button.innerHTML.replace(/<i class="fa fa-spinner fa-spin"><\/i>\s*/, '');
        delete button.dataset.originalHTML;
    }
}

// Export functions to global scope for use in other files
window.WorklistDirectOps = {
    crudpWithToast: crudpWithToast,
    deleteWorklistItemDirect: deleteWorklistItemDirect,
    updateWorklistStatusDirect: updateWorklistStatusDirect,
    addSingleWorklistItemDirect: addSingleWorklistItemDirect,
    toggleButtonLock: toggleButtonLock
}; 