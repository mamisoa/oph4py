// toast 
function displayToast(status='info', heading='Information',text="Testing...", sticky= false) {
    if (status =='error') {
        color = '#d9534f'
        textColor = 'white'
    } else if (status =='success') {
        color = '#5cb85c'
        textColor = 'white'
    } else if (status =='warning') {
        color = '#f0ad4e'
        textColor = 'white'
    } else {
        color = '#5bc0de'
        textColor = 'white'
    }
    $.toast({
        icon: status,
        heading: heading,
        text: text,
        position: { left: 'auto', right: 50, top: 75, bottom: 'auto' },
        showHideTransition: 'slide',
        loader: true,
        loaderBg: color,
        textColor: textColor,
        hideAfter: sticky
    });
}