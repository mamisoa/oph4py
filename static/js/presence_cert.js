// contacts prescriptions
// certPresenceObj contains id and options items
// CxRxGlobalObj merges CxRxRight and left

var certPresenceObj = {};

certPresenceObj['doctorfirst']=userObj['first_name'];
certPresenceObj['doctorlast']=userObj['last_name'];
certPresenceObj['doctortitle']='Dr '+userObj['last_name'].toUpperCase()+' '+userObj['first_name'];
certPresenceObj['doctorinami']=usermdObj['inami']; // keep separations
certPresenceObj['doctoremail']=usermdObj['email']; 
certPresenceObj['centername']=usermdObj['officename']+ '\n'+usermdObj['officeaddress']+'\n'+usermdObj['officezip']+' '+usermdObj['officetown']
certPresenceObj['centerphone']=usermdObj['officephone']
certPresenceObj['centerurl']=usermdObj['officeurl']

certPresenceObj['qrcode']='Signed by '+certPresenceObj['doctortitle']+' uuid:';

function presenceCert(){
    let certdefault=['<p>Je, soussigné Docteur en Médecine, certifie avoir examiné '];
    certdefault.push('<strong>'+wlItemObj['patient.last_name']+' '+wlItemObj['patient.first_name']+' DN'+wlItemObj['patient.dob'].split('-').reverse().join('/')+'</strong>')
    let today = new Date().addHours(timeOffsetInHours).toJSON().slice(11,19);
    let creationstamp = new Date(wlItemObj['created_on']).addHours(timeOffsetInHours);
    let datecreation = creationstamp.toJSON().slice(0,10).split('-').reverse().join('/');
    let timecreation = creationstamp.toJSON().slice(11,19);
    certdefault.push(' ce '+ datecreation + ' de ' + timecreation +' à '+ today+'.');
    certdefault.push('</p>');
    certdefault.push('<p>Je reste à votre disposition pour toute information complémentaire.</p>');
    return certdefault.join('');
}

var certPresenceModal = document.getElementById('certPresenceModal')
certPresenceModal.addEventListener('show.bs.modal', function (event) {
    let certdefault = ['<div style="text-align:left">'];
    let btn = event.relatedTarget;
    if ($(btn).data('certFlag') == "presence") {
        console.log('presence cert!');
        certdefault.push(presenceCert());
    } else {
        console.log('NOT a presence cert!');
        certdefault.push('<p>Not a presence cert</p>');
    };
    $('#certPresenceFormModal input[name=category]').val($(btn).data('certFlag'));
    // set default text
    certdefault.push('</div>');
    let certhtml= certdefault.join('');
    console.log('certhtml:',certhtml);
    tinymce.get('certPresenceContent').setContent(certhtml);
});


$('#certPresenceFormModal').submit(function(e) {
    e.preventDefault();
    let formStr = $(this).serializeJSON();
    let formObj = JSON.parse(formStr);
    let presenceContent = tinyMCE.get('certPresenceContent').getContent();
    console.log('content:', presenceContent);
    let fromTinyMce=htmlToPdfmake(presenceContent);
    console.log('from tinyMCE:', fromTinyMce);
    fetch(HOSTURL+"/myapp/api/uuid", {method:"GET"})
        .then(response => response.json())
        .then(data =>
            {
                // clone certPresenceObj
                console.log('certPresenceObj',certPresenceObj);
                let finalRxObj = Object.assign({}, certPresenceObj);
                let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0,10);
                finalRxObj['datestamp']=today;
                finalRxObj['qrcode'] = finalRxObj['qrcode']+data.unique_id; // already string
                finalRxObj['first_name'] = wlItemObj['patient.first_name'];
                finalRxObj['last_name'] = wlItemObj['patient.last_name'];
                finalRxObj['dob'] = wlItemObj['patient.dob'].split('-').reverse().join('/');
                let finalPresc = {
                    watermark: {text: '', color: 'red', opacity: 0.2, bold: false, italics: false},
                    pageSize: 'A4',
                    pageMargins: [ 25, 60, 40, 30 ],
                    styles: {
                            header: {
                                fontSize: 9,
                                margin: [10,2, 10, 0]
                            },
                            footer: {
                                italics: true,
                                fontSize: 7,
                                margin: [10,2, 10, 0]
                            },
                            title: {
                                bold: true
                            },
                            idtable: {
                                fontSize: 9,
                                alignment: 'left'
                            },
                            tableExample: {
                                fontSize: 8
                            },
                            tableHeader: {
                                bold: true,
                                color: 'black',
                                fillColor: '#eeeeee',
                                fontSize: 8
                            },
                            tabo: {
                                alignment: 'center'
                            }
                        },
                    defaultStyle: {
                            alignment: 'center',
                            fontSize: 10
                            },
                    header: {
                        style: 'header',
                        margin: [200, 10, 150, 5],
                        columns: [
                            {
                                image: logo64,
                                width: 50
                            },
                            {
                                margin: [10, 0, 0, 0],
                                text: ['Centre Médical Bruxelles-Schuman\n',{ text: '66 Avenue de Cortenbergh\n1000 Bruxelles, Belgique\n+32(0)2/256.90.83 - info@ophtalmologiste.be\n', fontSize: 7 },
                                { text: 'www.ophtalmologiste.be', fontSize: 7, color: 'blue', decoration: 'underline' }],
                                width: '*',
                                alignment: 'center'
                            }
                        ] // end of 2 columns
                    }, // end header
                    footer: {
                        style: 'footer',
                        margin: [10, 10, 0, 0],
                        alignment: 'center',
                        text : [ 
                            {text: usermdObj['companyname'], decoration: 'underline'},
                            {text: ' - '+ usermdObj['companyaddress']+'\n'+' '+usermdObj['companynum']+' - '+usermdObj['companyiban']}
                        ] // end of text 
                    }, // end of footer
                    content: [
                        {   style: 'title',
                            margin: [0, 20, 0, 20],
                            alignment: 'center',
                            fontSize: 14,
                            text: [
                                'CERTIFICAT MEDICAL'
                                ]
                        },
                        {   canvas: [
                                { type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5 },
                                {type: 'rect',x: 0,y: 12, w: 515, h: 1, color: 'white'} // spacer
                        ] }, // end of canvas
                        {   text: 'VIGNETTE O.A', alignment: 'left'},
                        { canvas: [
                                { type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5 },
                                {type: 'rect',x: 0,y: 7, w: 515, h: 2, color: 'white'} // spacer
                        ] }, // end of canvas
                        {
                            style: 'idtable',
                            margin: [0, 10, 0, 0],
                            table: {
                                widths: ['*','*'],
                                body: [
                                      [ {text: [{ text: 'NOM: '},{ text: finalRxObj['last_name'], bold: true}] },
                                        {text: [{ text: 'PRENOM: '},{ text: finalRxObj['first_name'], bold: true}]} ],
                                      [ {text: [{ text: 'DATE DE NAISSANCE: '},{ text: finalRxObj['dob'], bold: true}] },
                                      '']  
                                ],
                            }, // end of table
                            layout: 'noBorders' // end of body, 2 columns
                        }, // end of row
                        { canvas: [
                            { type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1 },
                            {type: 'rect',x: 0,y: 12, w: 515, h: 2, color: 'white'} // spacer
                            ]
                        }, // end of canvas
                        {   
                            style: 'title',
                            margin: [0, 20, 0, 20],
                            text: 'A QUI DE DROIT',
                            alignment: 'left',
                            bold: true,
                            fontSize: 12,
                            decoration: 'underline'
                        },
                        { 
                            margin: [20,20,20,20],
                            columns: [
                                fromTinyMce ]
                        },
                        {
                            style: 'tableExample',
                            margin: [0,20,0,20],
                            table: {
                            widths: ['*', '*'],
                            body: [
                                [
                                    [ // left column
                                        {
                                         text: [{fontSize: 6, alignment: 'left', text: 'Cachet du prescripteur:'}]
                                        },
                                        {
                                            margin: [0,2,0,0],
                                            fontSize: 8,
                                            text: [{ text: finalRxObj['doctortitle']+'\n', bold: true },{text: finalRxObj['doctorinami']}]
                                        },
                                        {
                                            fontSize: 6,
                                            text: [{ text: finalRxObj['centername']+'\n' },{text: 'Tél: '+finalRxObj['centerphone']+'\n'},
                                            {text: finalRxObj['centerurl']+'\n', color: 'blue', decoration: 'underline', italics: 'true'}]
                                        }
                                    ], // left column end
                                    [{
                                        border: [true, false, false, false],
                                        text: [
                                            {fontSize: 6, alignment: 'left', text: 'Date et signature: \n'},
                                            {fontSize: 8, alignment: 'left', text: finalRxObj['datestamp'].split('-').reverse().join('/')+'\n', bold: true},
                                            ]
                                    },{qr: finalRxObj['qrcode'], fit: 50, alignment: 'center'}
                                    ]
                                ] // right column end
                            ] // end of body
                            } // end of table
                        } // stamp end
                    ] // content end
            }; // end of template
            // finalDbObj contains uuid + blob pdfreport
            let finalDbObj = {};
            finalDbObj['uuid']=data.unique_id;
            finalDbObj['id_auth_user']=wlItemObj['patient.id'];
            finalDbObj['id_worklist']=wlItemObj['id'];
            finalDbObj['datestamp']=today;
            finalDbObj['category']=formObj['category'];
            finalDbObj['pdf_report'] = JSON.stringify(finalPresc);
            let finalDbStr = JSON.stringify(finalDbObj);
            console.log('finalDbObj:',finalDbObj);
            crud('certificates','0','POST',finalDbStr);
            let pdf= pdfMake.createPdf(finalPresc);
            pdf.print();
            $('#cert_tbl').bootstrapTable('refresh');
            $('#certPresenceModal').modal('hide');
        });
});
