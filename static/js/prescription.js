

var doctorinami = "012345678912";
var doctorinami_display = "1.23.456.789.123";

JsBarcode("#itf", doctorinami , {
  format: "ITF",
  height: 50,
  displayValue: true,
  text: doctorinami_display
});


var fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
};

var canvas = document.getElementById("itf");
var dataURL = canvas.toDataURL();
// console.log(dataURL);
var name = 'Patient',
    firstname = 'Test',
    dob = '01/01/1970',
    doctorfirst = 'John'
    doctorlast = 'DOE'
    doctorname = 'Dr. DOE John',
    doctorinami = '1-23456-78-910',
    doctoremail = 'info@doctor.com',
    centername = 'Centre Médical \n66 Rue de la Source\n10000 - Eauvive, France',
    centerphone = '+33(0)2/256.00.00',
    centerwww = 'www.doctor.com',
    prescdate = "01/01/2017";

// possible to insert 5 medications x3 lines
var prescription = {
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
                                        text: doctorlast + ' \n' +doctorfirst, fontSize: 8, bold: true, alignment: 'left' }
                                    ]
                            }
                        ],
                        [{ colSpan: 3, border: [false, true , false, true],
                            text: [{ text: 'A REMPLIR PAR LE PRESCRIPTEUR:\n', fontSize: 8, margin: [0,2,0,2] },
                                    { text: 'nom et prénom\ndu bénéficiaire:       ', fontSize: 6},
                                    { text: name + ' ' +firstname, fontSize: 8, bold: true }
                                    ]
                            },
                            {},{}], // end row
                        [
                            {
                            border: [false, true , true, true],
                            stack: [{text: 'Réservé à la vignette du conditionnement', fontSize:6 },{ canvas: [{type: 'rect',x: 0 ,y: 12, w: 1, h: 220, color: 'white'}] }]
                            },
                                {text: 'R/', colSpan: 2 , border: [false, true , false, true]},
                                {}
                        ], // end row
                        [
                            {
                                colSpan:2, rowSpan:2, border: [false, true , true, true], alignment: 'center', margin: [0,2,0,10],
                                stack: [
                                    { text: 'Cachet du prescripteur\n\n', fontSize: 6 },
                                    { text: doctorname+'\n', fontSize: 8, bold: true },
                                    {
                                        fontSize: 6,
                                        text: [{ text: centername+'\n' },{text: 'Tél: '+centerphone+'\n'}, {text: centerwww+'\n', color: 'blue', decoration: 'underline', italics: 'true'}]
                                    }
                                    ]
                                },
                                {},
                                {
                                margin: [0,2,0,10], border: [true, true , false, true],
                                stack: [
                                    {text: 'Date et signature du prescripteur', alignment: 'center', fontSize: 6, margin: [0,2,0,2]},
                                    {text: prescdate, alignment: 'center', fontSize:8, bold: true}
                                    ]
                            }
                        ], // end row
                        [{},{},
                            {
                                margin: [0,2,0,10], border: [true, true , false, true],
                                stack: [
                                    {text: 'Date de fin pour l\'execution\n', alignment: 'center', fontSize: 6, margin: [0,2,0,2]},
                                    {text: prescdate, alignment: 'center', fontSize:8, bold: true}
                                    ]
                            }
                        ], // end row
                        [{text: "PRESCRIPTION DE MEDICAMENTS D'APPLICATION A PARTIR \nDU 1er novembre 2019", colSpan:3, alignment: 'left', bold: true,fontSize: 8, border: [false, true , false, false]},{},{}]
                    ]
            }
        }
    ] // content end
};
