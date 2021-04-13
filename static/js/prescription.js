var prescObj = {};

prescObj['doctorfirst']=userObj['first_name'];
prescObj['doctorlast']=userObj['last_name'];
prescObj['doctortitle']='Dr '+userObj['last_name'].toUpperCase()+' '+userObj['first_name'];
prescObj['doctorinami']=usermdObj['inami']; // keep separations
prescObj['doctoremail']=usermdObj['email']; 
prescObj['centername']=usermdObj['officename']+ '\n'+usermdObj['officeaddress']+' '+usermdObj['officezip']+usermdObj['officetown']+usermdObj['officetown']
prescObj['centerphone']=usermdObj['officephone']
prescObj['centerurl']=usermdObj['officeurl']

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
