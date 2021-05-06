var prescObj = {};

prescObj['doctorfirst']=userObj['first_name'];
prescObj['doctorlast']=userObj['last_name'];
prescObj['doctortitle']='Dr '+userObj['last_name'].toUpperCase()+' '+userObj['first_name'];
prescObj['doctorinami']=usermdObj['inami']; // keep separations
prescObj['doctoremail']=usermdObj['email']; 
prescObj['centername']=usermdObj['officename']+ '\n'+usermdObj['officeaddress']+'\n'+usermdObj['officezip']+' '+usermdObj['officetown']
prescObj['centerphone']=usermdObj['officephone']
prescObj['centerurl']=usermdObj['officeurl']

// return barcode in canvas dataURL
function renderBarCode() {
    // set canvas #itf
    JsBarcode("#itf", prescObj['doctorinami'].split('-').join('')+'0' , {
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

// medical prescriptions
// list all prescribed medications and prints
// set medications to prescribed

// fill the mxRxModal prescription module
$('#btnMxRx').click(function(){
  // get medications from current wl and not prescribed
  getWlItemData('mx',wlId,'','&prescribed=False&@lookup=medic!:id_medic_ref')
      .then(function(data){
          prescObj['name']=patientObj['last_name'];
          prescObj['firstname']=patientObj['first_name'];
          let contentAggregate="";
          let dataObj=data.items;
          console.log(data);
          if (data.count > 0 && data.status != 'error') {
              let html = [];
              for (item of dataObj) {
                  prescObj['onset']=item['onset'];
                  prescObj['ended']=item['ended'];
                  let content = renderMedicObj(item);
                  contentAggregate += content;
                  html.push('<tr>');
                      html.push('<th scope"row">'+item.medication+'</th>');
                      let posology=item['unit_per_intake']+' '+checkIfDataIsNull(item['medic.form'],'unit(s)')+' '+item.frequency;
                      html.push('<td>'+posology+'</td>');
                      html.push('<td>'+item.onset+'</td>');
                      html.push('<td>'+item.ended+'</td>');
                  html.push('<tr>');
              };
              prescObj['content']=contentAggregate;
              $('#mxRxTd').html(html.join(''));
              $('#mxRxModal').modal('show');
          } else {
              displayToast('error','Medication list empty', 'No medication to prescribe',6000);
          }
      });
});


$('#mxRxModalPrint').click(function(){
  // get medications from current wl and not prescribed
  getWlItemData('mx',wlId,'','&prescribed=False')
      .then(function(data){
            let dataObj=data.items;
            console.log(data);
            if (data.count > 0 && data.status != 'error') {
                // crud medications in medical_rx_list
                let mxIdArray = [], mxNameArray = [];
                for (item of dataObj) {
                    // push medic in mxArray
                    mxIdArray.push(item['id_medic_ref']);
                    mxNameArray.push(item['medication']);
                    // set medication as prescribed
                    item['prescribed'] = 'True';
                    delete item['mod.first_name'];
                    delete item['mod.id'];
                    delete item['mod.last_name'];
                    delete item['modified_on'];
                    delete item['created_by'];
                    delete item['created_on'];
                    console.log('item:',item);
                    let dataStr = JSON.stringify(item);
                    crud('mx','0','PUT',dataStr);
                }; // end for loop
                console.log('prescObj:',prescObj);
                var presc = {
                    content: [
                        { canvas: [{type: 'rect',x: 0 ,y: 0, w: 1, h: 50, color: 'white'}] },
                        {
                            table: {
                                widths: [ 80, 25, 130 ], // widths of each 3 columns
                                body: [
                                        [
                                            {
                                                image: dataURL, width: 110, alignment: 'center', colSpan:2, border: [false, true , true, true] },
                                            {},
                                            {
                                                border: [true, true , false, true],
                                                text: [
                                                    {
                                                        text: 'Nom et prénom du\nprescripteur\n\n', fontSize: 6, alignment: 'left' },
                                                    {
                                                        margin: [15,0,0,0],
                                                        text: prescObj.doctorlast + ' \n' +prescObj.doctorfirst, fontSize: 8, bold: true, alignment: 'left' }
                                                ]
                                            }
                                        ],
                                        [
                                            {
                                                colSpan: 3,
                                                border: [false, true , false, true],
                                                text: [
                                                        { text: 'A REMPLIR PAR LE PRESCRIPTEUR:\n', fontSize: 8, margin: [0,2,0,2] },
                                                        { text: 'nom et prénom\ndu bénéficiaire:       ', fontSize: 6},
                                                        { text: prescObj['name'] + ' ' +prescObj['firstname'], fontSize: 8, bold: true }
                                                    ]
                                            },
                                            {},{}], // end row
                                        [
                                            {
                                                border: [false, true , true, true],
                                                stack: [
                                                    {
                                                        text: 'Réservé à la vignette du conditionnement', fontSize:6 },
                                                        {
                                                            canvas: [
                                                                { type: 'rect',x: 0 ,y: 12, w: 1, h: 220, color: 'white'}
                                                            ] 
                                                        }
                                                ]
                                            },
                                            {
                                                text: prescObj['content'],
                                                colSpan: 2 ,
                                                border: [false, true , false, true]
                                            },{}
                                        ], // end row
                                        [
                                            {
                                                colSpan:2,
                                                rowSpan:2,
                                                border: [false, true , true, true],
                                                alignment: 'center',
                                                margin: [0,2,0,10],
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
                                                margin: [0,2,0,10],
                                                border: [true, true , false, true],
                                                stack: [
                                                        {text: 'Date et signature du prescripteur', alignment: 'center', fontSize: 6, margin: [0,2,0,2]},
                                                        {text: prescObj['onset'], alignment: 'center', fontSize:8, bold: true}
                                                    ]
                                            }
                                        ], // end row
                                        [
                                            {},{},
                                            {
                                                margin: [0,2,0,10], border: [true, true , false, true],
                                                stack: [
                                                    {text: 'Date de fin pour l\'execution\n', alignment: 'center', fontSize: 6, margin: [0,2,0,2]},
                                                    {text: prescObj['ended'], alignment: 'center', fontSize:8, bold: true}
                                                    ]
                                            }
                                        ], // end row
                                        [
                                            {text: "PRESCRIPTION DE MEDICAMENTS D'APPLICATION A PARTIR \nDU 1er novembre 2019", colSpan:3, alignment: 'left', bold: true,fontSize: 8, border: [false, true , false, false]},
                                            {},{}
                                        ]
                                    ]
                                }
                            }
                        ] // content end
                    };
                    let pdf= pdfMake.createPdf(presc);
                    pdf.print();
                    let medicRxObj={};
                    medicRxObj['id_auth_user']=patientId;
                    medicRxObj['id_mx_ref']=mxIdArray.join(' | ');
                    medicRxObj['mx_names']=mxNameArray.join(' | ');
                    medicRxObj['id_worklist']=wlId;
                    medicRxObj['pdf_report']=JSON.stringify(presc);
                    // console.log('medicRxObj',medicRxObj);
                    let medicRxStr = JSON.stringify(medicRxObj);
                    crud('medical_rx_list','0','POST',medicRxStr);
                    $('#mxrx_tbl').bootstrapTable('refresh');
                    $('#mxRxModal').modal('hide');
                } else {
                    displayToast('error','Medication list empty', 'No medication to prescribe',3000);
                }
                $mxWl_tbl.bootstrapTable('refresh');
                $mx_tbl.bootstrapTable('refresh');
                });
            }); // end prescription module