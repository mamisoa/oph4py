var prescObj = {};

prescObj['doctorfirst']=userObj['first_name'];
prescObj['doctorlast']=userObj['last_name'];
prescObj['doctortitle']='Dr '+userObj['last_name'].toUpperCase()+' '+userObj['first_name'];
prescObj['doctorinami']=usermdObj['inami']; // keep separations
prescObj['doctoremail']=usermdObj['email']; 
prescObj['centername']=usermdObj['officename']+ '\n'+usermdObj['officeaddress']+' '+usermdObj['officezip']+usermdObj['officetown']+usermdObj['officetown']
prescObj['centerphone']=usermdObj['officephone']

// return barcode in canvas dataURL
function renderBarCode() {
    // set canvas #itf
    JsBarcode("#itf", '0'+prescObj['doctorinami'].split('-').join('') , {
        format: "ITF",
        height: 50,
        displayValue: true,
        text: prescObj['doctorinami']
      });
    var canvas = document.getElementById("itf");
    return canvas.toDataURL();
};

var dataURL = renderBarCode();

var fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
};


// possible to insert 5 medications x3 lines
var prescTemplate = {
    content: [
        { canvas: [{type: 'rect',x: 0 ,y: 0, w: 1, h: 50, color: 'white'}] },
        {
            table: {
                widths: [ 80, 25, 130 ], // widths of each 3 columns
                body: [
                        [{image: dataURL, width: 110, alignment: 'center', colSpan:2, border: [false, true , true, true] },{},
                            { border: [true, true , false, true],
                            text: [{ text: 'Nom et prénom du\nprescripteur\n\n', fontSize: 6, alignment: 'left' },
                                    {
                                        margin: [15,0,0,0],
                                        text: prescObj.doctorlast + ' \n' +prescObj.doctorfirst, fontSize: 8, bold: true, alignment: 'left' }
                                    ]
                            }
                        ],
                        [{ colSpan: 3, border: [false, true , false, true],
                            text: [{ text: 'A REMPLIR PAR LE PRESCRIPTEUR:\n', fontSize: 8, margin: [0,2,0,2] },
                                    { text: 'nom et prénom\ndu bénéficiaire:       ', fontSize: 6},
                                    { text: prescObj['name'] + ' ' +prescObj['firstname'], fontSize: 8, bold: true }
                                    ]
                            },
                            {},{}], // end row
                        [
                            {
                            border: [false, true , true, true],
                            stack: [{text: 'Réservé à la vignette du conditionnement', fontSize:6 },{ canvas: [{type: 'rect',x: 0 ,y: 12, w: 1, h: 220, color: 'white'}] }]
                            },
                                {text: prescObj['content'], colSpan: 2 , border: [false, true , false, true]},
                                {}
                        ], // end row
                        [
                            {
                                colSpan:2, rowSpan:2, border: [false, true , true, true], alignment: 'center', margin: [0,2,0,10],
                                stack: [
                                    { text: 'Cachet du prescripteur\n\n', fontSize: 6 },
                                    { text: prescObj['doctortitle']+'\n', fontSize: 8, bold: true },
                                    {
                                        fontSize: 6,
                                        text: [{ text: prescObj['centername']+'\n' },{text: 'Tél: '+prescObj['centerphone']+'\n'}, {text: prescObj['centerurl']+'\n', color: 'blue', decoration: 'underline', italics: 'true'}]
                                    }
                                    ]
                                },
                                {},
                                {
                                margin: [0,2,0,10], border: [true, true , false, true],
                                stack: [
                                    {text: 'Date et signature du prescripteur', alignment: 'center', fontSize: 6, margin: [0,2,0,2]},
                                    {text: prescObj['onset'], alignment: 'center', fontSize:8, bold: true}
                                    ]
                            }
                        ], // end row
                        [{},{},
                            {
                                margin: [0,2,0,10], border: [true, true , false, true],
                                stack: [
                                    {text: 'Date de fin pour l\'execution\n', alignment: 'center', fontSize: 6, margin: [0,2,0,2]},
                                    {text: prescObj['ended'], alignment: 'center', fontSize:8, bold: true}
                                    ]
                            }
                        ], // end row
                        [{text: "PRESCRIPTION DE MEDICAMENTS D'APPLICATION A PARTIR \nDU 1er novembre 2019", colSpan:3, alignment: 'left', bold: true,fontSize: 8, border: [false, true , false, false]},{},{}]
                    ]
            }
        }
    ] // content end
};
