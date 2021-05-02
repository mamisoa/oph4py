// glasses prescriptions
// prescRxObj contains id and options items
// GxRxGlobalObj merges GxRxRight and left

prescRxObj['doctorfirst']=userObj['first_name'];
prescRxObj['doctorlast']=userObj['last_name'];
prescRxObj['doctortitle']='Dr '+userObj['last_name'].toUpperCase()+' '+userObj['first_name'];
prescRxObj['doctorinami']=usermdObj['inami']; // keep separations
prescRxObj['doctoremail']=usermdObj['email']; 
prescRxObj['centername']=usermdObj['officename']+ '\n'+usermdObj['officeaddress']+'\n'+usermdObj['officezip']+' '+usermdObj['officetown']
prescRxObj['centerphone']=usermdObj['officephone']
prescRxObj['centerurl']=usermdObj['officeurl']

prescRxObj['bifocal']='o';
prescRxObj['art30yes']='[x]';
prescRxObj['art30no']='[ ]';
prescRxObj['qrcode']='Signed by '+prescRxObj['doctortitle']+' uuid:';

// remove unecessary elements
function filterGxRx(dataObj){
    let removeKeysArray = [
        'opto_far','opto_int','opto_close','va_far','va_int','va_close', 'se_far','add','note', 'laterality'
    ];
    for (let key of removeKeysArray){
        delete dataObj[key];
    };
};

$('#btnGxRx').click(function() {
    let htmlR=[], htmlL=[];
    let dataObj= Object.assign([], rxObj);
    // console.log('dataObj', dataObj);
    for (item of dataObj) {
        // remove unecessary keys eg names containing single quotes
        let removeIdKeysArr = ['id','created_by_name','modified_by_name','created_by','modified_by','created_on','modified_on'];
        for (let key of removeIdKeysArr){
            delete item[key];
        };
        console.log('Choosen Rx',item);
        // put everything in table
        if (item['laterality']=='right') {
            let html =[];
            html.push('<tr>'); // row
            html.push('<td>'); // 1st col origin
            html.push(item['rx_origin']);
            html.push('</td>');
            html.push('<td>'); // 2nd col glass type
            html.push(item['glass_type']);
            html.push('</td>');
            html.push('<th scope="row">'); // 3rd col rx
            html.push(item['rx_far']+' Add+'+item['add']);
            html.push('</td>');
            html.push('<td>'); // 4th col
            html.push('<button type="button" class="btn btn-primary btn-sm print-rx" onclick="rxDataButton(this.getAttribute(\'data-rx-obj\'),\'right\');" data-rx-obj=\''+JSON.stringify(item)+'\'><i class="fas fa-file-import"></i></button>');
            html.push('</td>');
            html.push('</tr>'); // end row
            htmlR.push(html.join(''));
        } else {
            let html =[];
            html.push('<tr>'); // row
            html.push('<td>'); // 1st col origin
            html.push(item['rx_origin']);
            html.push('</td>');
            html.push('<td>'); // 2nd col glass type
            html.push(item['glass_type']);
            html.push('</td>');
            html.push('<th scope="row">'); // 3rd col rx
            html.push(item['rx_far']+' Add+'+item['add']);
            html.push('</td>');
            html.push('<td>'); // 4th col
            html.push('<button type="button" class="btn btn-primary btn-sm print-rx" onclick="rxDataButton(this.getAttribute(\'data-rx-obj\'),\'left\');" data-rx-obj=\''+JSON.stringify(item)+'\'><i class="fas fa-file-import"></i></button>');
            html.push('</td>');
            html.push('</tr>'); // end row
            htmlL.push(html.join(''));
        };
    };
    $('#GxRxRTd').html(htmlR.join(''));
    $('#GxRxLTd').html(htmlL.join(''));
    $('#GxRxModal').modal('show');
});

var GxRxRightObj ={};
var GxRxLeftObj ={};
function rxDataButton(dataStr, lat) {
    let dataObj = JSON.parse(dataStr);
    // console.log(dataObj);
    let html=[];
    html.push('<tr>'); // row
    html.push('<td>'); // 1st col origin
    html.push(dataObj['rx_origin']);
    html.push('</td>');
    html.push('<td>'); // 2nd col glass type
    html.push(dataObj['glass_type']);
    html.push('</td>');
    html.push('<th scope="row">'); // 3rd col rx
    html.push(dataObj['rx_far']+' Add+'+dataObj['add']);
    html.push('</td>');
    html.push('<td>'); // 4th col
    html.push('</td>');
    html.push('</tr>'); // end row
    $('#GxRx'+lat).html(html.join(''));
    lat =='right'? GxRxRightObj=dataObj: GxRxLeftObj=dataObj;
};

// convert numbers to strings and set options in report
function globalRx2presc(rxObj) { 
    let delkeyArr = ['id_auth_user','id_worklist'];
    for (key of delkeyArr) {
        delete rxObj['key'];
    };
    if (rxObj['art30'] == 'False') {
        rxObj['art30no'] ='[x]';
        rxObj['art30yes'] ='[ ]';
    } else {
        rxObj['art30yes'] ='[x]';
        rxObj['art30no'] ='[ ]';
    };
    delete rxObj['art30'];
    // default no tint
    rxObj['tintnonmed'] ='o';
    rxObj['tintmed'] ='o';
    if (rxObj['tint'] == '') {
        rxObj['tint'] ='o';
    } else if (rxObj['tint'] == 'False') { // non med tint
        rxObj['tint'] ='X';
        rxObj['tintnonmed'] ='X';
    } else if (rxObj['tint'] == 'True'){ // med tint
        rxObj['tint'] ='X';
        rxObj['tintmed'] ='X';
    } else {rxObj['tint'] == 'o'};
    rxObj['photononmed'] ='o';
    rxObj['photomed'] ='o';
    if (rxObj['photo'] == '') {
        rxObj['photo'] ='o';
    } else if (rxObj['photo'] == 'False') { // non med photo
        rxObj['photo'] ='X';
        rxObj['photononmed'] ='X';
    } else if (rxObj['photo'] == 'True'){ // med photo
        rxObj['photo'] ='X';
        rxObj['photomed'] ='X';
    } else {rxObj['photo']='o'};
    // add addition cell
    let addR = rxObj['sph_closeR']-rxObj['sph_farR'];
    let addL = rxObj['sph_closeL']-rxObj['sph_farL'];
    rxObj['add_closeR']=addR;
    rxObj['add_closeL']=addL;
    // default glass_type: monofocal
    rxObj['monofocal'] ='X';
    rxObj['multifocal'] ='o';
    rxObj['progressive'] ='o';
    rxObj['degressive'] ='o';
    rxObj['bifocal'] ='o';
    if (rxObj['glass_type'] == 'progressive') {
        rxObj['monofocal'] ='o';
        rxObj['multifocal'] ='X';
        rxObj['progressive'] ='X';
    } else if (rxObj['glass_type'] == 'bifocal') { // non med photo
        rxObj['monofocal'] ='o';
        rxObj['multifocal'] ='X';
        rxObj['bifocal'] ='o';
    } else if (rxObj['glass_type'] == 'degressive'){ // med photo
        rxObj['monofocal'] ='o';
        rxObj['multifocal'] ='X';
        rxObj['degressive'] ='X';
    } else {
        // monofocal -> delete sph cyl axis int and close
        if (rxObj['glass_type'] == ('monofocalfar')) {
            rxObj['sph_intR']=rxObj['cyl_intR']=rxObj['cyl_intR']=rxObj['axis_intR']='-';
            rxObj['sph_closeR']=rxObj['cyl_closeR']=rxObj['cyl_closeR']=rxObj['axis_closeR']='-';
            rxObj['sph_intL']=rxObj['cyl_intL']=rxObj['cyl_intL']=rxObj['axis_intL']='-';
            rxObj['sph_closeL']=rxObj['cyl_closeL']=rxObj['cyl_closeL']=rxObj['axis_closeL']='-';
        } else if (rxObj['glass_type'] == 'monofocalclose') {
            rxObj['sph_intR']=rxObj['cyl_intR']=rxObj['cyl_intR']=rxObj['axis_intR']='-';
            rxObj['sph_farR']=rxObj['cyl_farR']=rxObj['cyl_farR']=rxObj['axis_farR']='-';
            rxObj['sph_intL']=rxObj['cyl_intL']=rxObj['cyl_intL']=rxObj['axis_intL']='-';
            rxObj['sph_farL']=rxObj['cyl_farL']=rxObj['cyl_farL']=rxObj['axis_farL']='-';
        };
        rxObj['add_closeR']=rxObj['add_closeL']='-';
    };
    // change everything in string, and check for empty or null values
    for (const key in rxObj) {
        if (typeof rxObj[key] == 'number') {
            if (rxObj[key]>0 && key.startsWith('ax') != true) {
                rxObj[key]=round2dec(rxObj[key]);
                rxObj[key] = checkIfDataIsNull(rxObj[key].toString(),'');    
            } else {
                rxObj[key] = checkIfDataIsNull(rxObj[key].toString(),'');
            }
        } else {
            rxObj[key] = checkIfDataIsNull(rxObj[key],'');
        }
    };
};
// todo get the prescription to glasses prescription table
// todo: table
// then print
$('#GxRxFormModal').submit(function(e) {
    let GxRxGlobalObj= {};
    e.preventDefault();
    let formObj = {};
    let formStr = $(this).serializeJSON();
    formObj=JSON.parse(formStr);
    // formObj is from form
    // GxRxRight, GxRxLeft is from rx selection
    // GxRxGlobalObj is the prescription object
    // already done before
    // filterGxRx(GxRxRightObj);
    // filterGxRx(GxRxLeftObj);
    console.log('GxRxRightObj:',GxRxRightObj);
    console.log('GxRxLeftObj:',GxRxRightObj);
    console.log('GxRxdataObj:',formObj);
    let GxRxArr = [
        'sph_far','cyl_far','axis_far',
        'sph_int','cyl_int','axis_int',
        'sph_close','cyl_close','axis_close'];
    let GxRxArrC = [
        'id_auth_user','id_worklist',
        'glass_type','prismL','baseL','prismL','baseL',
        'prismR','baseR','prismR','baseR',
        'tint','photo','art30','remarks'];
    for (key of GxRxArr) {
        GxRxGlobalObj[key+'R']=GxRxRightObj[key];
    };
    for (key of GxRxArr) {
        GxRxGlobalObj[key+'L']=GxRxLeftObj[key];
    };
    for (key of GxRxArrC) {
        GxRxGlobalObj[key]=formObj[key];
    };
    let today = new Date().addHours(timeOffsetInHours).toJSON().slice(0,10);
    GxRxGlobalObj['datestamp']=today;
    let finalDbObj = Object.assign({}, GxRxGlobalObj);
    fetch(HOSTURL+"/myapp/api/uuid", {method:"GET"})
        .then(response => response.json())
        .then(data =>
            {
                // clone prescRxObj
                // add all keys and values from GxRxGlobalObj
                // modify the value of art30 tint photo prism
                console.log(prescRxObj);
                let finalRxObj = Object.assign({}, prescRxObj);
                // filter numbers to strings and add options in report
                globalRx2presc(GxRxGlobalObj);
                // add all keys to finalRxObj
                for (const key in GxRxGlobalObj) {
                    finalRxObj[key] = GxRxGlobalObj[key];
                };
                finalRxObj['qrcode'] = finalRxObj['qrcode']+data.unique_id; // already string
                finalRxObj['first_name'] = wlItemObj['patient.first_name'];
                finalRxObj['last_name'] = wlItemObj['patient.last_name'];
                finalRxObj['dob'] = wlItemObj['patient.dob'].split('-').reverse().join('/');
                // temporarly: do not display the intermediate distance
                finalRxObj['sph_intR']=finalRxObj['cyl_intR']=finalRxObj['cyl_intR']=finalRxObj['axis_intR']='-';
                finalRxObj['sph_intL']=finalRxObj['cyl_intL']=finalRxObj['cyl_intL']=finalRxObj['axis_intL']='-';
                console.log('FinalRxObj',finalRxObj);
                // const finalPresc = rxprescription;
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
                            text: [
                                'Annexe 15',
                                { text: 'bis\n', italics: true },
                                'PRESCRIPTION MEDICALE POUR VERRES DE LUNETTES ET/OU ACCESSOIRES'
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
                            margin: [0, 20, 0, 0],
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
                            style: 'tabo',
                            table: {
                                widths: [ 50,'*', '*', '*'],
                                headerRows: 1,
                                alignement: 'center',
                                body: [
                                        [
                                            { text: ''                                            
                                            }, // spacer
                                            {
                                                rowSpan: 3,
                                                image: axe64,
                                                fit: [100, 100]                                                
                                            }, // axe64 gauche
                                            {
                                                canvas: [
                                                    {
                                                        type: 'ellipse',
                                                        x: 42, y: 20,
                                                        color: 'black',
                                                        fillOpacity: 0.5,
                                                        r1: 30, r2: 20
                                                    },
                                                    {
                                                        type: 'ellipse',
                                                        x: 42, y: 20,
                                                        color: 'white',
                                                        fillOpacity: 0.5,
                                                        r1: 20, r2: 15
                                                    },
                                                    {
                                                        type: 'rect',
                                                        x: 12,
                                                        y: 20,
                                                        w: 60,
                                                        h: 20,
                                                        color: 'white'
                                                    } // hidder
                                                ]
                                            },  // canvas end
                                            {
                                                rowSpan: 3,
                                                image: axe64,
                                                fit: [100, 100]                                                
                                            }
                                        ], // 4 columns
                                        [   
                                            { text: ''                                            
                                            }, // spacer
                                            '',{ text: 'TABO', bold: true, alignement: 'right' }, ''], // 4 columns
                                        [
                                            { text: ''                                            
                                            }, // spacer
                                            '', { canvas: [{type: 'rect',x: 10,y: 0, w: 10, h: 35, color: 'white'}]}, ''] // spacer to keep height
                                    ] // body table end
                                },
                            layout: 'noBorders'
                        }, // 'tabo' table end
                        {
                            margin: [0, 5, 0, 0],
                            style: 'tableExample', // table prescription
                            table: {
                                headerRows: 1,
                                widths: [ '*', '*', '*', '*', '*', '*', 2 ,'*', '*', '*', '*', '*', '*' ],
                                body: [
                                        [ 
                                            { text: 'D', bold: true, border: [false, false, true, true] },
                                            { style: 'tableHeader', text: 'Sph' } , 
                                            { text: 'Cyl', style: 'tableHeader' } ,
                                            { text: 'Axis', style: 'tableHeader' } ,
                                            { text: 'PRISM', style: 'tableHeader' },
                                            { text: 'BASE', style: 'tableHeader'},
                                            { text: '',border: [false, false, false, false] }, // spacer
                                            { text: 'G', bold: true, border: [false, false, true, true] },
                                            { text: 'Sph', style: 'tableHeader'} ,
                                            { text: 'Cyl', style: 'tableHeader'},
                                            { text: 'Axis', style: 'tableHeader'} ,
                                            { text: 'PRISM', style: 'tableHeader'},
                                            { text: 'BASE',style: 'tableHeader'}
                                        ], // end table header 13 columns
                                        [   {text: 'Loin'},
                                            {text: finalRxObj['sph_farR'] }, 
                                            {text: finalRxObj['cyl_farR'] },
                                            {text: finalRxObj['axis_farR']},
                                            {text: finalRxObj['prismR']},
                                            {text: finalRxObj['baseR']},
                                            {text: '',border: [false, false, false, false] }, // spacer - 6 col ok
                                            {text: 'Loin'},
                                            {text: finalRxObj['sph_farL'] }, 
                                            {text: finalRxObj['cyl_farL'] },
                                            {text: finalRxObj['axis_farL']},
                                            {text: finalRxObj['prismL']},
                                            {text: finalRxObj['baseL']},
                                        ],
                                        [   {text: 'Inter'},
                                            {text: finalRxObj['sph_intR'] }, 
                                            {text: finalRxObj['cyl_intR'] },
                                            {text: finalRxObj['axis_intR']},
                                            {text: ''},
                                            {text: ''},
                                            {text: '',border: [false, false, false, false] }, // spacer - 6 col ok
                                            {text: 'Inter'},
                                            {text: finalRxObj['sph_intL'] }, 
                                            {text: finalRxObj['cyl_intL'] },
                                            {text: finalRxObj['axis_intL']},
                                            {text: ''},
                                            {text: ''},
                                        ],
                                        [   {text: 'Près'},
                                            {text: finalRxObj['sph_closeR'] }, 
                                            {text: finalRxObj['cyl_closeR'] },
                                            {text: finalRxObj['axis_closeR']},
                                            {text: ''},
                                            {text: ''},
                                            {text: '',border: [false, false, false, false] }, // spacer - 6 col ok
                                            {text: 'Près'},
                                            {text: finalRxObj['sph_closeL'] }, 
                                            {text: finalRxObj['cyl_closeL'] },
                                            {text: finalRxObj['axis_closeL']},
                                            {text: ''},
                                            {text: ''},
                                        ]
                                ] // end of body
                            } // end of table
                          }, // end of row
                          {
                            style: 'add',
                            margin: [80, 2, 10, 2],
                            table: {
                                body: [
                                        [
                                            {text:'ADD'},
                                            {text: finalRxObj['add_closeR']} ,
                                            { canvas: [{type: 'rect',x: 0,y: 0, w: 230, h: 5, color: 'white'}],border: [true, false, true, false]},
                                            {text:'ADD'}, 
                                            {text: finalRxObj['add_closeL']}
                                        ]
                                ] // end of body
                            } // end of row
                        }, // tableau prescription fin
                        {
                            alignment: 'left',
                            fontSize: 9,
                            text: [
                                    {text: 'REMARQUES: ', bold : true},
                                    {text: '\n', italics: true}
                                ]
                        }, // end of row
                        { 
                            alignment: 'left',
                            fontSize: 8 ,
                            margin: [10,0,0,0],
                            text: [
                                    { text: '\tLunettes vertex : 12.5mm (standard=12mm)\n'},
                                    {text:'Note: '} ,{text: finalRxObj['remarks']+'\n', italics: true} 
                                ]
                        }, // end of row
                        { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1 },
                            {type: 'rect',x: 0,y: 12, w: 515, h: 2, color: 'white'} ] // spacer
                        },
                        {
                            text: 'EQUIPEMENT',
                            bold: true,
                            alignment: 'left',
                            fontSize: 9
                        }, // end of row
                        {
			                alignment: 'left',
                            fontSize: 8,
                            margin : [10,2,10,2],
			                columns: [
				                [
                                    {
					                    text: [{ text: finalRxObj['monofocal']+' UNIFOCAL\n'},{ text: finalRxObj['multifocal']+' MULTIFOCAL'}]
				                    },
                                    {
                                        margin: [15,0,10,2],
                                        text: [
                                            { text: finalRxObj['bifocal']+' Bifocaux\n'},
                                            { text: finalRxObj['progressive']+' Progressifs\n'},
                                            { text: finalRxObj['degressive']+' Dégressifs\n'}]
				                    },
                                    {
					                    text: [{ text: finalRxObj['tint']+' TEINTE FIXE'}]
				                    },
                                    {
                                        margin: [15,0,10,2],
					                    text: [{ text: finalRxObj['tintnonmed']+' Sans filtre médical\n'},
                                        { text: finalRxObj['tintmed']+' Avec filtre médical(*) - Type '},
                                        { text: '' , italics: true}]
                                    },
                                    {
					                    text: [{ text: finalRxObj['photo']+' PHOTOCHROMIQUE'}]
				                    },
                                    {
                                        margin: [15,0,10,2],
					                    text: [{ text: finalRxObj['photononmed']+' Sans filtre médical\n'},
                                        { text: finalRxObj['photomed']+' Avec filtre médical(*) - Type '},{ text: '' , italics: true}]
				                    }
                                ], // left column
                                [
                                    {
                                        text: [{ text: 'o'+' PRISME'}]
				                    },
                                    {
                                        margin: [15,0,10,2],
					                    text: [
                                            { text: 'o'+' Taillé dans le verre - Diplopie      '},
                                            { text: '[ ]'+' OUI '},
                                            { text: '[ ]'+' NON\n'},
                                            { text: '[ ]'+' FRESNEL\n\n'}]
				                    },
                                    {
					                    text: [{ text: 'o'+' OBTURATEUR'}]
				                    },
                                    {
                                        margin: [15,0,10,2],
					                    text: [{ text: 'o'+' Avec coquille et ventouse\n'},{ text: 'o'+' Avec micropores\n\n'}]
				                    },
                                    {
					                text: [{ text: 'o'+' FILTRE DE RYSER - Calibrage(densité): '},{ text: '' , italics: true}]
				                    }
                                ] // right column
			                ]
		                }, // EQUIPEMENT fin
                        { 
                            canvas: [
                                        { type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1 },
                                        {type: 'rect',x: 0,y: 12, w: 515, h: 2, color: 'white'} // spacer
                                ]
                        },
                        {
                            alignment: 'left',
                            fontSize: 8,
                            columns: [
                                [
                                    {
                                        text: '(*) INDICATION MEDICALE selon Art.30 de la nomenclature\n(POUR FILTRE MEDICAL AVEC ABSORPTION PREDETERMINEE DE LA\nLUMIERE BLEUE ET FILTRE MEDICAL AVEC TEINTE FIXE)'
                                    }
                                ], // left column
                                [ 
                                    { 
                                        margin: [15,0,10,2],
                                        text: [{ text: finalRxObj['art30yes']+' OUI '},
                                        { text: finalRxObj['art30no']+' NON\n'}]
                                    }
                                ] // right column
                            ] // end 2 columns table
                        }, // art.30 end
                        {
                            style: 'tableExample',
                            margin: [0,30,0,10],
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
                        }, // stamp end
                        {
                            alignment: 'left',
                            fontSize: 8,
                            text: [{text:'Email du prescripteur: '},{text: usermdObj['email'], color: 'blue', decoration: 'underline' }]
                        },
                        {
                            alignment: 'left',
                            fontSize: 8,
                            text: [{text:'Email de l\'opticien: '},{text: '', color: 'blue', decoration: 'underline' }]
                        },
                        {
                            alignment: 'left',
                            fontSize: 8,
                            text: [{text:'Remarques de l\'opticien: '},{text: '', bold:true }]
                        }
                    ] // content end
            }; // end of template
            finalDbObj['uuid']=data.unique_id;
            finalDbObj['pdf_report'] = JSON.stringify(finalPresc);
            let finalDbStr = JSON.stringify(finalDbObj);
            console.log('finalDbObj:',finalDbObj);
            crud('glasses_rx_list','0','POST',finalDbStr);
            let pdf= pdfMake.createPdf(finalPresc);
            // pdf.download('rx');
            pdf.print()
            // document.getElementById('GxRxFormModal').reset();
            $gxrx.bootstrapTable('refresh');
            $('#GxRxModal').modal('hide');
        });
});



console.log('prescRxObj:',prescRxObj);