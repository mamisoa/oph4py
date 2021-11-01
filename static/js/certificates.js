// contacts prescriptions
// certificateObj contains id and options items
// CxRxGlobalObj merges CxRxRight and left

var certificateObj = {};

certificateObj['doctorfirst']=userObj['first_name'];
certificateObj['doctorlast']=userObj['last_name'];
certificateObj['doctortitle']='Dr '+userObj['last_name'].toUpperCase()+' '+userObj['first_name'];
certificateObj['doctorinami']=usermdObj['inami']; // keep separations
certificateObj['doctoremail']=usermdObj['email']; 
certificateObj['centername']=usermdObj['officename']+ '\n'+usermdObj['officeaddress']+'\n'+usermdObj['officezip']+' '+usermdObj['officetown']
certificateObj['centerphone']=usermdObj['officephone']
certificateObj['centerurl']=usermdObj['officeurl']

certificateObj['qrcode']='Signed by '+certificateObj['doctortitle']+' uuid:';

var reportObj = {};

function getRightAutoRx(){
    return $.get(API_RXRIGHT+'&rx_origin.eq=autorx');
};

function getLeftAutoRx(){
    return $.get(API_RXLEFT+'&rx_origin.eq=autorx');
};

$.when(getRightAutoRx(),getLeftAutoRx()).done(function(autorx1,autorx2){
    console.log('right:',autorx1[0]['items'][0]['sph_far']);
    console.log('left:',autorx2[0]['items'][0]['sph_far']);
});

function presenceCert(){
    let certdefault=['<p>Je, soussigné Docteur en Médecine, certifie avoir examiné: </p>'];
    certdefault.push('<p><strong>'+patientObj['last_name']+' '+patientObj['first_name']+' DN'+patientObj['dob'].split('-').reverse().join('/')+' NN'+ checkIfDataIsNull(patientObj['ssn'],'(n/a)')+'</strong></p>')
    let today = new Date().addHours(timeOffsetInHours).toJSON().slice(11,19);
    let creationstamp = new Date(wlObj['worklist']['created_on']).addHours(timeOffsetInHours*2);
    let datecreation = creationstamp.toJSON().slice(0,10).split('-').reverse().join('/');
    let timecreation = creationstamp.toJSON().slice(11,19);
    certdefault.push('<p> ce '+ datecreation + ' de ' + timecreation +' à '+ today+'.</p>');
    certdefault.push('<p>Je reste à votre disposition pour toute information complémentaire.</p>');
    return certdefault.join('');
};

function sickCert(onset,ended,exit) {
    let certdefault=['<p>Je, soussigné Docteur en Médecine, certifie avoir examiné: </p>'];
    certdefault.push('<p><strong>'+patientObj['last_name']+' '+patientObj['first_name']+' DN'+patientObj['dob'].split('-').reverse().join('/')+' NN'+ checkIfDataIsNull(patientObj['ssn'],'(n/a)')+'</strong></p>')
    let today = new Date().addHours(timeOffsetInHours).toJSON().slice(11,19);
    let creationstamp = new Date(wlObj['worklist']['created_on']).addHours(timeOffsetInHours*2);
    let datecreation = creationstamp.toJSON().slice(0,10).split('-').reverse().join('/');
    let timecreation = creationstamp.toJSON().slice(11,19);
    certdefault.push('<p> ce '+ datecreation + ' de ' + timecreation +' à '+ today+'.</p>');
    let start = onset.split('-').reverse().join('/'), end = ended.split('-').reverse().join('/');
    certdefault.push('<p> Ce patient est inapte au travail du <strong>'+start+' au '+ end +' inclus</strong>.</p>');
    if (exit == 'no') {
        certdefault.push('<p>Les sorties <strong>ne sont pas autorisées</strong>.</p>');
    } else {
        certdefault.push('<p>Les sorties sont <strong>autorisées</strong>.</p>');
    };
    certdefault.push('<p>Je reste à votre disposition pour toute information complémentaire.</p>');
    return certdefault.join('');
};

var sickModal = document.getElementById('sickModal');
sickModal.addEventListener('show.bs.modal', function(e){
    let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0,10);
    $('#onsetsick').val(today);
    $('#endedsick').val(today);
});

function freeCert() {
    let certdefault =[];
    certdefault.push('<p>J\'ai examiné: </p>');
    certdefault.push('<p><strong>'+patientObj['last_name']+' '+patientObj['first_name']+' DN'+patientObj['dob'].split('-').reverse().join('/')+' NN'+ checkIfDataIsNull(patientObj['ssn'],'(n/a)')+'</strong></p>')
    let creationstamp = new Date(wlObj['worklist']['created_on']).addHours(timeOffsetInHours*2);
    let datecreation = creationstamp.toJSON().slice(0,10).split('-').reverse().join('/');
    let timecreation = creationstamp.toJSON().slice(11,19);
    certdefault.push('<p> ce '+ datecreation + ' à ' + timecreation+'.</p>');
    certdefault.push('<p>Je reste à votre disposition pour toute information complémentaire.</p>');
    certdefault.push('<p>Cordialement,</p>');
    certdefault.push('<p><strong>Dr.'+userObj['last_name'].toUpperCase()+' '+userObj['first_name']+' '+'</strong></p>');
    return certdefault.join('');
};

function docCert() {
    let certdefault =[];
    certdefault.push('<p>Cher Confrère, chère Consoeur, </p>');
    certdefault.push('<p>J\'ai examiné: </p>');
    certdefault.push('<p><strong>'+patientObj['last_name']+' '+patientObj['first_name']+' DN'+patientObj['dob'].split('-').reverse().join('/')+' NN'+ checkIfDataIsNull(patientObj['ssn'],'(n/a)')+'</strong></p>')
    let creationstamp = new Date(wlObj['worklist']['created_on']).addHours(timeOffsetInHours*2);
    let datecreation = creationstamp.toJSON().slice(0,10).split('-').reverse().join('/');
    let timecreation = creationstamp.toJSON().slice(11,19);
    certdefault.push('<p> ce '+ datecreation + ' à ' + timecreation+'.</p>');
    certdefault.push('<p>Je reste à votre disposition pour toute information complémentaire.</p>');
    certdefault.push('<p>Cordialement,</p>');
    certdefault.push('<p><strong>Dr.'+userObj['last_name'].toUpperCase()+' '+userObj['first_name']+' '+'</strong></p>');
    return certdefault.join('');
};

function reportCert() {
    let certdefault =[];
    certdefault.push('<p>Cher Confrère, chère Consoeur, </p>');
    certdefault.push('<p>J\'ai examiné: </p>');
    certdefault.push('<p><strong>'+patientObj['last_name']+' '+patientObj['first_name']+' DN'+patientObj['dob'].split('-').reverse().join('/')+' NN'+ checkIfDataIsNull(patientObj['ssn'],'(n/a)')+'</strong></p>')
    let dbstamp = new Date(wlObj['worklist']['created_on']);
    let creationstamp = dbstamp.addHours(timeOffsetInHours*2);
    let datecreation = creationstamp.toJSON().slice(0,10).split('-').reverse().join('/');
    let timecreation = creationstamp.toJSON().slice(11,19);
    certdefault.push('<p> ce '+ datecreation + ' à ' + timecreation+'.</p>');
    certdefault.push('<p> L\'examen montre: <br/>');
    certdefault.push('<p>Je reste à votre disposition pour toute information complémentaire.</p>');
    certdefault.push('<p>Cordialement,</p>');
    certdefault.push('<p><strong>Dr.'+userObj['last_name'].toUpperCase()+' '+userObj['first_name']+' '+'</strong></p>');
    return certdefault.join('');
};

var certificateModal = document.getElementById('certificateModal')
certificateModal.addEventListener('show.bs.modal', function (event) {
    let certdefault = ['<div style="text-align:left">'];
    let btn = event.relatedTarget;
    // set default form values
    let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0,10);
    $('#certificateOnset').val(today);
    $('#certificateEnded').val(today);
    $('#certificateDest').val('A QUI DE DROIT');
    $('#certificateTitle').val('CERTIFICAT MEDICAL');
    // check certificate category
    if ($(btn).data('certFlag') == "presence") {
        console.log('presence cert!');
        certdefault.push(presenceCert());
    } else if ($(btn).data('certFlag') == "sick") {
        console.log('sick leave cert!');
        let onset = $('#onsetsick').val(), ended = $('#endedsick').val(), exit = $('#sickFormModal input[name=exit]:checked').val();
        $('#certificateOnset').val(onset);
        $('#certificateEnded').val(ended);
        certdefault.push(sickCert(onset,ended,exit));
    } else if ($(btn).data('certFlag') == "doc") {
        console.log('doc cert!');
        $('#certificateDest').val('AU MEDECIN DE DROIT');
        $('#certificateTitle').val('RAPPORT MEDICAL');
        certdefault.push(docCert());
    } else {
        console.log('free cert');
        certdefault.push(freeCert());
    };
    $('#certificateFormModal input[name=category]').val($(btn).data('certFlag'));
    // set default text
    certdefault.push('</div>');
    let certhtml= certdefault.join('');
    console.log('certhtml:',certhtml);
    tinymce.get('certificateContent').setContent(certhtml);
});


$('#certificateFormModal').submit(function(e) {
    e.preventDefault();
    let formStr = $(this).serializeJSON();
    let formObj = JSON.parse(formStr);
    let certContent = tinyMCE.get('certificateContent').getContent();
    console.log('content:', certContent);
    let fromTinyMce=htmlToPdfmake(certContent);
    console.log('from tinyMCE:', fromTinyMce);
    fetch(HOSTURL+"/myapp/api/uuid", {method:"GET"})
        .then(response => response.json())
        .then(data =>
            {
                // clone certificateObj
                console.log('certificateObj',certificateObj);
                let finalRxObj = Object.assign({}, certificateObj);
                let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0,10);
                finalRxObj['datestamp']=today;
                finalRxObj['qrcode'] = finalRxObj['qrcode']+data.unique_id; // already string
                finalRxObj['first_name'] = patientObj['first_name'];
                finalRxObj['last_name'] = patientObj['last_name'];
                finalRxObj['dob'] = patientObj['dob'].split('-').reverse().join('/');
                finalRxObj['destination'] = formObj['destination'];
                finalRxObj['title'] = formObj['title'];
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
                                finalRxObj['title']
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
                            text: finalRxObj['destination'],
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
            finalDbObj['id_auth_user']=patientId;
            finalDbObj['id_worklist']=wlId;
            finalDbObj['onset']=formObj['onset'];
            finalDbObj['ended']=formObj['ended'];
            finalDbObj['datestamp']=today;
            finalDbObj['category']=formObj['category'];
            finalDbObj['pdf_report'] = JSON.stringify(finalPresc);
            let finalDbStr = JSON.stringify(finalDbObj);
            // console.log('finalDbObj:',finalDbObj);
            crudp('certificates','0','POST',finalDbStr).then( data => $cert_tbl.bootstrapTable('refresh'));
            let pdf= pdfMake.createPdf(finalPresc);
            pdf.print();
            // document.getElementById('certificateFormModal').reset();
            $('#certificateModal').modal('hide');
        });
});
