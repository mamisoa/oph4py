// take the value of wlId to get the codes
// amount to pay is calculated
// when payment is recorded, the pay button is dynamically adjusting
// depending on the amount remaining to pay 
// if attestation is canceled, print button is renabled, otherwise it is the duplicate button that is enabled
// use htmx to use confirmation modal 

// refresh tables
const tablesArr = ['#chx_tbl','#ccx_tbl','#fol_tbl','#bil_tbl'];
refreshTables(tablesArr);

function getUser(id) {
    return Promise.resolve(
        $.ajax({
            type: "GET",
            url: API_USER,
            dataType: "json",
            success: function (data) {
                if (data.status == 'error' || data.count == 0) {
                    displayToast('error', 'GET error', 'Cannot retrieve user details', '6000');    
                } else {
                    displayToast('info', 'GET user request', 'GET ' + data.items[0].username, '6000');
                }
            },
            error: function (er) {
                console.log(er);
            }
        }));
};


// do when promise.success
function refreshList(listName){
    if (listName=='userauth_user') {
        let userData = getUser(patientId);
        userData.then(function(userData){
            let item = userData.items[0];
            console.log('item:', item);
            // fills title
            if (item.photob64 != null) {
                $('.photoId').attr("src",checkIfDataIsNull(item.photob64,''));
                $(".photoDiv").removeClass( "visually-hidden" );
            };
            $('#patientTitle .patientName').html(checkIfDataIsNull(item.first_name,'n/a?')+' '+checkIfDataIsNull(item.last_name,'n/a?'));
            $('#patientTitle .patientDob').html(checkIfDataIsNull(item.dob,'n/a?')+' ('+getAge(checkIfDataIsNull(item.dob,''))+' yo)');
            $('#patientTitle .patientId').html('#'+checkIfDataIsNull(item.id,'n/a?'));
            $('#patientTitle .patientSsn').html('NISS #'+checkIfDataIsNull(item.ssn));
            $('#patientTitle .patientCard').html('Card #'+checkIfDataIsNull(item.idc_num));
            $('#patientTitle .patientEmail').html('Email: '+checkIfDataIsNull(item.email));
        });
    } else {};
};
refreshList('userauth_user');

// Function to calculate the sum
function updatePaymentSum() {
    // Retrieve the values from the input fields
    let cardPayment = parseFloat(document.getElementById('cardPayment').value);
    let cashPayment = parseFloat(document.getElementById('cashPayment').value);
    let invoicePayment = parseFloat(document.getElementById('invoicePayment').value);

    // Calculate the sum
    let sum = cardPayment + cashPayment + invoicePayment;

    // Update the button text
    let paymentButton = document.getElementById('recordPayment');
    paymentButton.textContent = 'Record Payment [ ' + sum.toFixed(2) + ' € ]';
}

// Add event listeners to input fields
document.getElementById('cardPayment').addEventListener('input', updatePaymentSum);
document.getElementById('cashPayment').addEventListener('input', updatePaymentSum);
document.getElementById('invoicePayment').addEventListener('input', updatePaymentSum);

// Initialize the button text on page load
updatePaymentSum();

// Generate transaction table
async function updateTransactionTable(headers = ['date', 'price', 'covered_1300', 'covered_1600', 'status', 'note']) {
    console.log("updateTransactionTrable function executing...")
    const container = document.getElementById('transactionTable');
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

    } catch (error) {
        console.error('Error fetching transaction data:', error);
        container.innerHTML = '<p>Error loading transaction data.</p>';
    }
}


// codes table

async function updateCodeTable() {
    try {
        // Fetch data from the API endpoint
        const response = await fetch(API_WLCODES);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Create and insert the table into the #codeTable div
        const table = createTableFromData(data.items);
        document.getElementById('transactionTable').innerHTML = table;

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function createTableFromData(items) {
    let table = '<table class="table table-striped"><thead><tr><th>Date</th><th>Code</th><th>Price</th><th>Covered 1600</th><th>Covered 1300</th></tr></thead><tbody>';

    items.forEach(item => {
        const nomenclature = item.nomenclature;
        const priceList = JSON.parse(nomenclature.price_list);
        const price = priceList[0] * nomenclature.supplement_ratio;

        table += `<tr>
                    <td>${item.date}</td>
                    <td>${nomenclature.code}</td>
                    <td>${round2supint(price).toFixed(2)} €</td>
                    <td>${priceList[1].toFixed(2)} €</td>
                    <td>${priceList[2].toFixed(2)} €</td>
                  </tr>`;
    });

    table += '</tbody></table>';
    return table;
}

// Call the function to update the table
updateCodeTable();
