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
        let userData = getUser(id);
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
