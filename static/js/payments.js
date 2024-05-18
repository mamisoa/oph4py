// take the value of wlId to get the codes
// amount to pay is calculated
// when payment is recorded, the pay button is dynamically adjusting
// depending on the amount remaining to pay 
// if attestation is canceled, print button is renabled, otherwise it is the duplicate button that is enabled
// use htmx to use confirmation modal 

// refresh tables
const tablesArr = ['#paymentsBsTable'];
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
            // console.log('item:', item);
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

// list current wl transactions
async function listCurrentWlTransaction() {
    try {
        // Fetch data from the API endpoint
        const response = await fetch(API_WL_TRANSACTION);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        let remainingToPay = data.items[0].price - data.items[0].paid;
        document.getElementById('remainingToPay').textContent = remainingToPay;
        document.getElementById('remainingToPayModal').textContent = remainingToPay;
        return data;

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
};

async function handleTransaction() {
    try {
      let remainingToPay = await listCurrentWlTransaction();
      console.log('Remaining to pay:', remainingToPay);
    } catch (error) {
      console.error('Error handling transaction:', error);
    }
  }
  
  handleTransaction();
  
// list current wl transactions
async function listCurrentWlPayments() {
    try {
        // Fetch data from the API endpoint
        const response = await fetch(API_WL_PAYMENTS);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
};

// sum all payments (array) made for a wl transaction
function sumPaymentTypes(payments) {
    // Initialize the sums for each payment type
    const sumPayments = {
        sumCard_payments: 0,
        sumCash_payments: 0,
        sumInvoice_payments: 0,
        sumPaid: 0
    };

    // Iterate through each payment item and accumulate the totals
    payments.forEach(payment => {
        sumPayments.sumCard_payments += payment.card_payment;
        sumPayments.sumCash_payments += payment.cash_payment;
        sumPayments.sumInvoice_payments += payment.invoice_payment;
    });

    sumPayments.sumPaid = sumPayments.sumCard_payments + sumPayments.sumCash_payments + sumPayments.sumInvoice_payments;

    return sumPayments;
};


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
        const table = createCodesTableFromData(data.items);
        document.getElementById('codesTable').innerHTML = table;

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function createCodesTableFromData(items) {
    let table = '<table class="table table-striped"><thead><tr><th>Date</th><th>Code</th><th>Price</th><th>Covered 1600</th><th>Covered 1300</th></tr></thead><tbody>';

    items.forEach(item => {
        const nomenclature = item.nomenclature;
        const priceList = JSON.parse(nomenclature.price_list);
        const price = priceList[0] * nomenclature.supplement_ratio + priceList[3];

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

// transactions table

async function updateTransactionsTable() {
    try {
        // Fetch data from the API endpoint
        const response = await fetch(API_TRANSACTIONS);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Create and insert the table into the #codeTable div
        const table = createTransactionsTableFromData(data.items);
        document.getElementById('transactionsTable').innerHTML = table;

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function createTransactionsTableFromData(items) {
    let table = '<table class="table table-striped"><thead><tr><th>Date</th><th>Price</th><th>Paid</th><th>Card</th><th>Cash</th><th>Invoice</th><th>Note</th></tr></thead><tbody>';

    items.forEach(item => {
        // console.log("transactions", item);
        let paid = item.card_payment + item.cash_payment + item.invoice_payment ;
        table += `<tr>
                    <td>${item.date}</td>
                    <td>${item.price} €</td>
                    <td>${paid} €</td>
                    <td>${item.card_payment} €</td>
                    <td>${item.cash_payment} €</td>
                    <td>${item.invoice_payment} €</td>
                    <td>${item.note || ""}</td>
                  </tr>`;
    });

    table += '</tbody></table>';
    return table;
}
// Call the function to update the table
updateTransactionsTable();

// breakdown table
async function updateBreakdownTable() {
    try {
        // Fetch data from the API endpoint
        const response = await fetch(API_WL_TRANSACTION);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Create and insert the table into the #codeTable div
        const table = createBreakdownTableFromData(data.items);
        document.getElementById('breakdownTable').innerHTML = table;

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// FIXME: error 500 when no transaction on payments view
function createBreakdownTableFromData(items) {
    // console.log('WL transaction: ', items);
    let item = items[0];
    let supplements = {"1600": item.price - item.uncovered - item.covered_1600, "1300": item.price - item.uncovered - item.covered_1300};
    let table = `
        <table class="table table-striped">
            <tr>
                <th>Date</th>
                <td>${item.date}</td>
                <td>Action</td>
            </tr>
            <tr>
                <th>INAMI</th>
                <td>${item.covered_1600} € / ${item.covered_1300} €</td>
                <td><button type="button" class="btn btn-primary" style="--bs-btn-padding-y: .20rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .65rem;">Print Attestation</button></td>
            </tr>
            <tr>
                <th>Supplements</th>
                <td>${supplements[1600]} € / ${supplements[1300]} €</td>
                <td></td>
            </tr>
            <tr>
                <th>Not covered</th>
                <td>${item.uncovered}  €</td>
                <td><button type="button" class="btn btn-secondary" style="--bs-btn-padding-y: .20rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .65rem;">Print bill</button></td>
            </tr>    
        </table>
        `;
    document.getElementById('remainPayment').textContent = item.price;

    return table;
}

// Call the function to update the table
updateBreakdownTable();

// add a wl payment
document.getElementById('recordPayment').addEventListener('click', function() {
    // Get the form element
    let form = document.getElementById('paymentFormModal');

    // request type
    let req = form.querySelector('#reqPayment').value;
    let id = form.querySelector('#idPayment').value;
    // console.log('req:', req, 'id:', id);

    // Create a function to format the date
    function formatDate(date) {
        let year = date.getFullYear();
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let day = String(date.getDate()).padStart(2, '0');
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        let seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    // Create an object to hold the form data
    let formData = {
        date: formatDate(new Date()),
        id_auth_user: parseInt(form.querySelector('#authUserId').value),
        id_worklist: parseInt(form.querySelector('#wlId').value),
        card_payment: parseFloat(form.querySelector('#cardPayment').value),
        cash_payment: parseFloat(form.querySelector('#cashPayment').value),
        invoice_payment: parseFloat(form.querySelector('#invoicePayment').value),
        card_type: form.querySelector('#cardType').value,
        invoice_type: form.querySelector('#invoiceType').value
    };


    let url_req = req == 'POST' ? HOSTURL + "/" + APP_NAME + "/api/wl_payments" : HOSTURL + "/" + APP_NAME + "/api/wl_payments/" + id ;
    // console.log(url_req);
    // Send the formData to the endpoint 'API_WL_PAYMENTS'
    fetch(url_req , {
        method: req,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                return Promise.all([listCurrentWlTransaction(), listCurrentWlPayments()]);
            })
            .then(([transactionData, paymentsData]) => {
                let currentTransaction = transactionData.items.length > 0 ? transactionData.items[0] : {}, paymentsArr = paymentsData.items;
                let paymentsSum = sumPaymentTypes(paymentsArr);
                console.log('Current transactions:', currentTransaction);
                console.log('Payments list:', paymentsArr);
                console.log('Sum:', paymentsSum);
                let updateTransaction = currentTransaction;
                if (currentTransaction != {}) {
                    let id = currentTransaction.id;
                    delete updateTransaction.id;
                    updateTransaction.card_payment = paymentsSum.sumCard_payments;
                    updateTransaction.cash_payment = paymentsSum.sumCash_payments;
                    updateTransaction.invoice_payment = paymentsSum.sumInvoice_payments;
                    updateTransaction.paid = paymentsSum.sumPaid;
                    remainToPay = updateTransaction.price - updateTransaction.paid;
                    let removeKeys =  ['creator.id', 'creator.last_name', 'modified_on', 'mod.id', 'creator.first_name', 'mod.last_name', 'mod.first_name', 'created_on'];
                    removeKeys.forEach( removeKey => {
                        delete updateTransaction[removeKey];
                    });
                    console.log('Modified transaction:', updateTransaction);
                    crudp('transactions',id,'PUT', JSON.stringify(updateTransaction))
                        .then(() => {
                            refreshTables(tablesArr);
                            updateTransactionsTable();
                            document.getElementById('remainingToPay').textContent = remainToPay;
                            document.getElementById('remainingToPayModal').textContent = remainToPay;
                            document.getElementById("paymentFormModal").reset();
                        })
                } else {
                    console.log('No existing transaction!');
                }

            })
            .catch((error) => {
                console.error('Error:', error);
            });
});
