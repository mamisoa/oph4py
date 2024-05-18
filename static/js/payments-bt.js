// check if value is null and return a default value, else return value
function checkIfNull(value, resultStrIfNullorUndefined) { 
    if (value == null || value === undefined) {
        return resultStrIfNullorUndefined;
    } else {
        return value;
    }
};

function styleTimeslot(ts) {
    let arr = ts.split(' ');
    // arr[1] is time arr[0] is date
    let res = '<strong>'+arr[0].split('-').reverse().join('/')+'</strong> '+arr[1];
    return res;
};


function responseHandler_wlPayments(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    // console.log('bt list:',list);
    let display = [];
    $.each(list, function (i) {
        display.push({
            'id': list[i].id,
            'id_auth_user': list[i].id_auth_user,
            'id_worklist': list[i].id_worklist,
            'date': list[i].date,
            'paid': Math.round((list[i].cash_payment + list[i].card_payment + list[i].invoice_payment)*100)/100 + ' €' ,
            'card': list[i].card_payment + ' € ('+ list[i].card_type +')',
            'card_payment': list[i].card_payment,
            'card_type': list[i].card_type,
            'cash_payment': list[i].cash_payment,
            'cash': list[i].cash_payment + ' €',
            'invoice': list[i].invoice_payment + ' € ('+ checkIfNull(list[i].invoice_type,'other') + ')',
            'invoice_payment': list[i].invoice_payment,
            'invoice_type': list[i].invoice_type,
            'note': list[i].note,
            'modified_by_name': list[i]['mod.last_name'] + ' ' + list[i]['mod.first_name'],
            'modified_by': list[i]['mod.id'],
            'modified_on': list[i]['modified_on'],
            'created_by': list[i]['creator.id'],
            'created_by_name': list[i]['creator.last_name'] + ' ' + list[i]['creator.first_name'],
            'created_on': list[i]['created_on']
        });
    });
    return {
        rows: display,
        total: res.count,
    };
};


var toggle ='';
function queryParams(params) {
    let s = '';
    if (params.offset != "0") {
        s =="" ? s += "@offset=" + params.offset : s += "&@offset=" + params.offset;
    }
    if (params.limit != "0") {
        s =="" ? s += "@limit=" + params.limit: s += "&@limit=" + params.limit
    }
    if (params.sort != undefined) {
        switch (params.sort) {
            case "timestamp":
                params.sort = "timestamp";
                break;
        }
        if (toggle=="") {
            s += "&@order="+params.sort;
            toggle="~";
        } else {
            s += "&@order=~"+params.sort;
            toggle="";
        }
    }
    return s; // remove the first &
};

function detailFormatter_wlPayments(index, row) {
    let html = ['<div class="container-fluid"><div class="row">'];
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Worklist # </span>'+ row.id_worklist+'</p>');
    html.push('<p class=""><span class="fw-bold">Patient # </span>'+ row.id_auth_user+'</p>');
    html.push('<p class=""><span class="fw-bold">ID: </span>'+ row.id);
    html.push('<p class=""><span class="fw-bold">Cash: </span>'+ row.cash_payment);
    html.push('<p class=""><span class="fw-bold">Card: </span>'+ row.card_payment + " (" + row.card_type+ ")");
    html.push('<p class=""><span class="fw-bold">Card: </span>'+ row.invoice_payment + " (" + row.invoice_type+ ")");
    html.push('<p class=""><span class="fw-bold">Note: </span>'+ row.note);
    html.push('</div>');
    html.push('<div class="text-start col">');
    html.push('<p class=""><span class="fw-bold">Created on: </span>'+ row.created_on+'<p>');
    html.push('<p class=""><span class="fw-bold">Created by: </span>'+ row.created_by_name+'</p>');
    html.push('<p class=""><span class="fw-bold">Modified on: </span>'+ row.modified_on+'<p>');
    html.push('<p class=""><span class="fw-bold">Modified by: </span>'+ row.modified_by_name+'</p>');
    html.push('</div>');
    html.push('</div></div>');
    return html.join('');
};

// add operational buttons to rows in payments tables
function operateFormatter_wlPayments(value, row, index) {
    let html = ['<div class="d-flex justify-content-between">'];
    html.push('<a class="edit" href="javascript:void(0)" title="Edit payment"><i class="fas fa-edit"></i></a>');
    html.push('<a class="delete" href="javascript:void(0)" title="Delete payment"><i class="fas fa-remove"></i></a>');
    html.push('</div>');
    return html.join('');
  };

// add button links to edit or remove to row in km table
window.operateEvents_wlPayments = {
    'click .edit': function (e, value, row, index) {
        console.log('You click action EDIT on row: ' + JSON.stringify(row));
        document.getElementById("paymentFormModal").reset();
        //
        document.getElementById('reqPayment').value = 'PUT';
        document.getElementById('idPayment').value = row.id;

        document.getElementById('authUserId').value = row.id_auth_user;
        document.getElementById('wlId').value = row.id_worklist;

        document.getElementById('cardPayment').value = row.card_payment;
        document.getElementById('cashPayment').value = row.cash_payment;
        document.getElementById('invoicePayment').value = row.invoice_payment;

        document.getElementById('cardType').value = row.card_type;
        document.getElementById('invoiceType').value = row.invoice_type;

        updatePaymentSum();

        new bootstrap.Modal(document.getElementById('paymentModal')).show();
    },
    'click .delete': function (e, value, row, index) {
        // console.log('You click action REMOVE on row: ' + JSON.stringify(row));
        delPayment(row.id);
    }
};

// sum all payments (array) made for a wl transaction
function sumPaymentTypes(payments) {
    // Initialize the sums for each payment type
    const sumPayments = {
        sumCard_payments: 0,
        sumCash_payments: 0,
        sumInvoice_payments: 0
    };

    // Iterate through each payment item and accumulate the totals
    payments.forEach(payment => {
        sumPayments.sumCard_payments += payment.card_payment;
        sumPayments.sumCash_payments += payment.cash_payment;
        sumPayments.sumInvoice_payments += payment.invoice_payment;
    });

    return sumPayments;
};

// delete wl payment
function delPayment (id) {
    bootbox.confirm({
        message: "Are you sure you want to delete this payment?",
        closeButton: false ,
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-success'
            },
            cancel: {
                label: 'No',
                className: 'btn-danger'
            }
        },
        callback: function (result) {
            if (result == true) {
                crudp('wl_payments', id, 'DELETE')
                    .then(data => {
                        refreshTables(tablesArr); 
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
                            updateTransaction.card_payment -= paymentsSum.sumCard_payments;
                            updateTransaction.cash_payment -= paymentsSum.sumCash_payments;
                            updateTransaction.invoice_payment -= paymentsSum.sumInvoice_payments;
                            console.log('Modified transaction:', updateTransaction);
                        } else {
                            console.log('No existing transaction!');
                        }

                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            } else {
                console.log('This was logged in the callback: ' + result);
            }
        }
    });
};
