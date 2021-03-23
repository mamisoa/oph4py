// set parameters for ajax request from bootstrap-table
var s_wl="";
var toggle_wl=""
function queryParams_wl(params) {
    search = params.search.split(",");
    if (search == [""]) {
        s_wl =""
    } else {
        if (search[0]!= undefined) {
            s_wl = "exam2do.exam_name.startswith=" + capitalize(search[0]);
        } else {
            s_wl = "";
        }
        if (search[1]!= undefined) {
            s_wl += "&provider.last_name.startswith=" + capitalize(search[1]);
        } else {
            s_wl +="";
        }
    }
    if (params.sort != undefined) {
        if (params.sort == "id") {
            params.sort = "id";
        }
        if (toggle=="") {
            s += "&@order="+params.sort;
            toggle="~";
        } else {
            s += "&@order=~"+params.sort;
            toggle="";
        }
    }
    if (params.offset != "0") {
        console.log(params.offset);
        s_wl += "&@offset="+params.offset;
    }
    if (params.limit != "0") {
        console.log(params.offset);
        s_wl += "&@limit="+params.limit;
    }
    console.log(s_wl);
    return decodeURI(encodeURI(s_wl));
}

function responseHandler_wl(res) { // used if data-response-handler="responseHandler_wl"
    let list = res.items;
    let nbrows = Object.keys(list).length;
    let display = [];
    $.each(list, function (i) {
        // console.log('id',list[i].id);
        display.push({
            'id': list[i].id,
            'sending_facility': list[i]['sending_facility.facility_name'],
            'receiving_facility': list[i]['receiving_facility.facility_name'],
            'provider': list[i]['provider.last_name']+' '+list[i]['provider.first_name'],
            'procedure': list[i]['exam2do.exam_name'],
            'modality': list[i]['modality.modality_name'],
            'laterality': list[i]['laterality'],
            'requested_time': list[i]['requested_time'],
            'status_flag': list[i]['status_flag'],
            'counter': list[i]['counter'],
            'warning': list[i]['warning'],
        });
    });
    console.log('display',display);
    let test = [{"total": res.count, "items": display}];
    console.log('test',test);
    console.log(test[0]['items']);
    return {    rows: display, 
                total: res.count,
                };
}