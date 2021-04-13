var axe_img64 = '[[=axe_img64]]',
    name = 'Patient',
    firstname = 'Test',
    dob = '01/01/1975',
    rem = '',
    vertex = '13mm',
    note = '2 paires séparées',
    teinte = 'ambre',
    photochromique = 'UV 3',
    ryser = '1/10',
    doctorname = 'Dr. ANDRIANTAFIKA R.M',
    doctorinami = '1-89506-32-370',
    doctoremail = 'info@ophtalmologiste.be',
    centername = 'Centre Médical Bruxelles-Schuman\n66 Av. de Cortenbergh\n1000 - Bruxelles, Belgique',
    centerphone = '+32(0)2/256.90.83',
    centerwww = 'www.ophtalmologiste.be',
    prescdate = "01/01/2017",
    sprlname = 'Dr. ANDRIANTAFIKA Mamisoa SPRL',
    sprladdress = '154 Rue du Rouge Bouton B-1460 Virginal-Samme',
    sprliban = 'ING IBAN BE29 3630 2433 0064 SWIFT BBRUBEBB',
    sprlbce = '0893.588.051',
    optoemail = 'unknown',
    optorem = 'none',
    qrcode = 'signed by '+ doctorname
    logo_img64 = '[[=logo_img64]]';

var dd = {
    watermark: {text: 'duplicata', color: 'red', opacity: 0.2, bold: false, italics: false},
    pageSize: 'A4',
    pageMargins: [ 50, 60, 40, 30 ],
    header: {
         style: 'header',
         margin: [200, 10, 150, 5],
         columns: [
            {
                image: logo_img64,
                width: 50
            },
            {
                margin: [10, 0, 0, 0],
                text: ['Centre Médical Bruxelles-Schuman\n',{ text: '66 Avenue de Cortenbergh\n1000 Bruxelles, Belgique\n+32(0)2/256.90.83 - info@ophtalmologiste.be\n', fontSize: 7 },
                       { text: 'www.ophtalmologiste.be', fontSize: 7, color: 'blue', decoration: 'underline' }],
                width: '*',
                alignment: 'center'
            }
        ]
      },
    footer: {
        style: 'footer',
        text : [ { text: sprlname, decoration: 'underline'},{text: ' - '+ sprladdress+'\n'+'BCE '+sprlbce+' - '+sprliban}
            ]
    },
    content: [
        {   style: 'title',
            margin: [0, 20, 0, 20],
            text: [
             'Annexe 15',
             { text: 'bis\n', italics: true },
             'PRESCRIPTION MEDICALE POUR VERRES DE LUNETTES ET/OU ACCESSOIRES'
           ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5 },
                   {type: 'rect',x: 0,y: 12, w: 515, h: 1, color: 'white'} // spacer
                  ] },
        {
            text: 'VIGNETTE O.A', alignment: 'left'},
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5 },
                   {type: 'rect',x: 0,y: 7, w: 515, h: 2, color: 'white'} // spacer
                  ] },
        {
          style: 'idtable',
          margin: [0, 20, 0, 0],
		  table: {
             widths: ['*','*'],
             body: [
                    [ {text: [{ text: 'NOM: '},{ text: name, bold: true}] } , {text: [{ text: 'PRENOM: '},{ text: firstname, bold: true}]} ],
					[ {text: [{ text: 'DATE DE NAISSANCE: '},{ text: dob, bold: true}] }, '']
                   ]
				},
          layout: 'noBorders'
		},
        { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1 },
                   {type: 'rect',x: 0,y: 12, w: 515, h: 2, color: 'white'} // spacer
                  ] },
        {
            style: 'tabo',
            table: {
                        widths: [ '*', '*', '*'],
                        headerRows: 1,
                        body: [
                                    [
                                        {
                                            rowSpan: 3,
                                            image: axe_img64,
                                            fit: [100, 100],
                                        },
                                        {
                                            canvas:
                                              [
                                                {
                                                    type: 'ellipse',
                                                    x: 82, y: 20,
                                                    color: 'black',
                                                    fillOpacity: 0.5,
                                                    r1: 30, r2: 20
                                                },
                                                {
                                                    type: 'ellipse',
                                                    x: 82, y: 20,
                                                    color: 'white',
                                                    fillOpacity: 0.5,
                                                    r1: 20, r2: 15
                                                },
                                                {
                                                    type: 'rect',
                                                    x: 52,
                                                    y: 20,
                                                    w: 60,
                                                    h: 20,
                                                    color: 'white'
                                                }
                                             ]
                                        },  // canvas end
                                       {
                                           rowSpan: 3,
                                            image: axe_img64,
                                            fit: [100, 100],
                                        }],
                                    ['', { text: 'TABO', bold: true, alignement: 'center' }, ''],
                                    ['', { canvas: [{type: 'rect',x: 10,y: 0, w: 10, h: 35, color: 'white'}]}, ''] // spacer to keep height
                              ] // body table end
                    },
            layout: 'noBorders'
        }, // table end
        {
          margin: [0, 5, 0, 0],
          style: 'tableExample', // table prescription
          table: {
            headerRows: 1,
            widths: [ '*', '*', '*', '*', '*', '*', 2 ,'*', '*', '*', '*', '*', '*' ],
            body: [
              [ { text: 'D', bold: true, border: [false, false, true, true] }, { style: 'tableHeader', text: 'Sph' } , { text: 'Cyl', style: 'tableHeader' } ,{ text: 'Axis', style: 'tableHeader' } , { text: 'PRISM', style: 'tableHeader' }, { text: 'BASE', style: 'tableHeader'},
                { text: '',border: [false, false, false, false] },
                { text: 'G', bold: true, border: [false, false, true, true] }, { text: 'Sph', style: 'tableHeader'} , { text: 'Cyl', style: 'tableHeader' } ,{ text: 'Axis', style: 'tableHeader'} , { text: 'PRISM', style: 'tableHeader'}, { text: 'BASE',style: 'tableHeader'}],
              [ 'Loin', prescRxObj['sph_farR'], prescRxObj['cyl_farR'], prescRxObj['axis_farR'], '--', '--',{ text: '',border: [false, false, false, false] },
              'Loin', prescRxObj['sph_farL'], prescRxObj['cyl_farL'], prescRxObj['axis_farL'], '--', '--'],
              [ 'Inter', prescRxObj['sph_intR'], prescRxObj['cyl_intR'], prescRxObj['axis_intR'], '--', '--', { text: '',border: [false, false, false, false] },
              'Inter', prescRxObj['sph_intL'], prescRxObj['cyl_intR'], prescRxObj['axis_farL'], '--', '--'],
              [ 'Près', prescRxObj['sph_closeR'], prescRxObj['cyl_closeR'], prescRxObj['axis_closeR'], '--', '--', { text: '',border: [false, false, false, false] },
              'Près', prescRxObj['sph_closeL'], prescRxObj['cyl_closeR'], prescRxObj['axis_closeL'], '--', '--']
            ]
          }
        },
        {
						style: 'tableExample',
                        margin: [80, 2, 10, 2],
						table: {
								body: [
										['ADD', prescRxObj['add_closeR'],{ canvas: [{type: 'rect',x: 0,y: 0, w: 230, h: 5, color: 'white'}],border: [true, false, true, false],},'ADD', prescRxObj['add_closeL']]
								]
						}
		}, // tableau prescription fin
        { alignment: 'left', fontSize: 9, text: [{text: 'REMARQUES: ', bold : true},{text: rem+'\n', italics: true}]},
        { alignment: 'left', fontSize: 8 ,margin: [10,0,0,0],  text: [{ text: '\tLunettes vertex : '+vertex+' (standard=12mm)\n'},'Note: ' ,{text: note+'\n', italics: true} ]},
        { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1 },
                   {type: 'rect',x: 0,y: 12, w: 515, h: 2, color: 'white'} // spacer
                  ] },
        {text: 'EQUIPEMENT', bold: true, alignment: 'left', fontSize: 9},
        {
			alignment: 'left',
            fontSize: 8,
            margin : [10,2,10,2],
			columns: [
				[{
					text: [{ text: 'o'+' UNIFOCAL\n'},{ text: 'o'+' MULTIFOCAL'}]
				},
                 {
                    margin: [15,0,10,2],
					text: [{ text: 'o'+' Bifocal\n'},{ text: 'o'+' Progressif\n'},{ text: 'o'+' Trifocal\n'},{ text: 'o'+' Non spécifié\n'}]
				},
                 {
					text: [{ text: 'o'+' TEINTE FIXE'}]
				},
                 {
                    margin: [15,0,10,2],
					text: [{ text: 'o'+' Sans filtre médical\n'},{ text: 'o'+' Avec filtre médical(*) - Type '},{ text: teinte , italics: true}]
				},
                 {
					text: [{ text: 'o'+' PHOTOCHROMIQUE'}]
				},
                 {
                    margin: [15,0,10,2],
					text: [{ text: 'o'+' Sans filtre médical\n'},{ text: 'o'+' Avec filtre médical(*) - Type '},{ text: photochromique , italics: true}]
				}
                ], // left column
                [{
					text: [{ text: 'o'+' PRISME'}]
				},
                 {
                    margin: [15,0,10,2],
					text: [{ text: 'o'+' Taillé dans le verre - Diplopie      '},{ text: '[x]'+' OUI '},{ text: '[ ]'+' NON\n'},{ text: '[ ]'+' FRESNEL\n\n'}]
				},
                 {
					text: [{ text: 'o'+' OBTURATEUR'}]
				},
                 {
                    margin: [15,0,10,2],
					text: [{ text: 'o'+' Avec coquille et ventouse\n'},{ text: 'o'+' Avec micropores\n\n'}]
				},
                 {
					text: [{ text: 'o'+' FILTRE DE RYSER - Calibrage(densité): '},{ text: ryser , italics: true}]
				},
                ] // right column
			]
		}, // EQUIPEMENT fin
        { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1 },
                   {type: 'rect',x: 0,y: 12, w: 515, h: 2, color: 'white'} // spacer
                  ] },
        {
			alignment: 'left',
            fontSize: 8,
			columns: [
				[{
					text: '(*) INDICATION MEDICALE selon Art.30 de la nomenclature\n(POUR FILTRE MEDICAL AVEC ABSORPTION PREDETERMINEE DE LA\nLUMIERE BLEUE ET FILTRE MEDICAL AVEC TEINTE FIXE)'
				}
                ], // left column
				[ { margin: [15,0,10,2],text: [{ text: '[x]'+' OUI '},{ text: '[ ]'+' NON\n'}]
                 }
                ] // right column
			]
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
                                    text: [{ text: doctorname+'\n', bold: true },{text: doctorinami}]
                                    },
                                   {
                                    fontSize: 6,
                                    text: [{ text: centername+'\n' },{text: 'Tél: '+centerphone+'\n'}, {text: centerwww+'\n', color: 'blue', decoration: 'underline', italics: 'true'}]
                                    }
                                 ], // left column end
                                      { border: [true, false, false, false],
                                    text: [{fontSize: 6, alignment: 'left', text: 'Date et signature: '},{fontSize: 8, alignment: 'left', text: prescdate, bold: true}],
                                    }
                                ]
                        ]
			}
		}, // stamp end
        {
            alignment: 'left',
            fontSize: 8,
            text: [{text:'Email du prescripteur: '},{text: doctoremail, color: 'blue', decoration: 'underline' }]
        },
        {
            alignment: 'left',
            fontSize: 8,
            text: [{text:'Email de l\'opticien: '},{text: optoemail, color: 'blue', decoration: 'underline' }]
        },
        {
            alignment: 'left',
            fontSize: 8,
            text: [{text:'Remarques de l\'opticien: '},{text: optorem, bold:true }]
        },
        {qr: sprlname, fit: 30, alignment: 'right'}
      ], // content end
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
            },
        },
        defaultStyle: {
            alignment: 'center',
            fontSize: 10
        }
};
