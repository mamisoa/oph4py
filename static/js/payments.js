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
        console.log("transactions", item);
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
    console.log('WL transaction: ', items);
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
    document.getElementById('sum').textContent = item.price;
    document.getElementById('remainPayment').textContent = item.price;

    return table;
}

// Call the function to update the table
updateBreakdownTable();

// wlPayments table
async function updatePaymentsTable() {
    try {
        // Fetch data from the API endpoint
        const response = await fetch(API_WL_PAYMENTS);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Create and insert the table into the #codeTable div
        const table = createPaymentsTableFromData(data.items);
        document.getElementById('paymentsTable').innerHTML = table;

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function createPaymentsTableFromData(items) {
    let table;
    console.log("Payments:",items)
    if (items.length >0) {
        table = `
        <table class="table table-striped">
        <tr>
            <th>Date</th>
            <th>Paid</th>
            <th>Card</th>
            <th>Card type</th>
            <th>Cash</th>
            <th>Invoice</th>
            <th>Invoice type</th>
            <th>Note</th>
            <th>Action</th>
        </tr>
        `;

        items.forEach(item => {
            console.log("payments", item);
            let paid = item.card_payment + item.cash_payment + item.invoice_payment ;
            table += `
                <tr>
                    <td>${item.date}</td>
                    <td>${paid || ''} €</td>
                    <td>${item.card_payment || '0'} €</td>
                    <td>${item.card_type  || ''}</td>
                    <td>${item.cash_payment || '0'} €</td>
                    <td>${item.invoice_payment  || '0'} €</td>
                    <td>${item.invoice_type  || ''}</td>
                    <td>${item.note || ''}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" data-wlPaymentsId="${item.id}"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-danger btn-sm" data-wlPaymentsId="${item.id}"><i class="bi bi-x-square"></i></button>
                    </td>
                </tr>
                `;
        });

        table += '</tbody></table>';
    } else {
        table = "No record found."
    }
    
    return table;
}
// Call the function to update the table
updatePaymentsTable();

document.getElementById('recordPayment').addEventListener('click', function() {
    // Get the form element
    let form = document.getElementById('paymentFormModal');

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

    // Log the object to the console
    console.log(formData);

    // Send the formData to the endpoint 'API_WL_PAYMENTS'
    fetch(HOSTURL + "/" + APP_NAME + "/api/wl_payments", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        
        // Reset the form values to their default state
        form.querySelector('#cardPayment').value = 0;
        form.querySelector('#cashPayment').value = 0;
        form.querySelector('#invoicePayment').value = 0;
        form.querySelector('#cardType').value = 'bc';
        form.querySelector('#invoiceType').value = 'council';
    })
    .then(() => {
        updatePaymentsTable(); // Ensure this function exists and does what you intend
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
