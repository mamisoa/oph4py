// toast 
function displayToast(heading='Information',text="Testing...", sticky= false) {
    if (heading =='Error') {
        icon = 'error',
        color = '#d9534f'
        textColor = 'white'
    } else if (heading =='Success') {
        icon = 'success',
        color = '#5cb85c'
        textColor = 'white'
    } else if (heading =='Warning') {
        icon = 'warning',
        color = '#f0ad4e'
        textColor = 'white'
    } else {
        icon = 'info',
        color = '#5bc0de'
        textColor = 'white'
    }
    $.toast({
        icon: icon,
        heading: heading,
        text: text,
        position: { left: 'auto', right: 50, top: 75, bottom: 'auto' },
        showHideTransition: 'slide',
        loader: true,
        loaderBg: color,
        textColor: textColor
    });
}