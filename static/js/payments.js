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
