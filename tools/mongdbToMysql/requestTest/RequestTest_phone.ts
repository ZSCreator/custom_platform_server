import RoomGroup from "../../../app/common/classes/subclass/roomGroup";

const httpRequest  = require('../../../app/utils/payUtil');


async  function phoneTest(body : any){
    try {

        const paramsAppend = new URLSearchParams();
        paramsAppend.append('mobile', "9218423512");
        paramsAppend.append('templateId', "16369");
        paramsAppend.append('paramType',  "json");
        paramsAppend.append('internationalCode',  "63");   //印度91

        paramsAppend.append('params',  JSON.stringify({code:"100000",time:"20180816"}) );

        let params : any = {} ;
        params.mobile = "9218423512";
        params.templateId = "16369";
        params.params = JSON.stringify({code:"100000",time:"20180816"}) ;
        params.paramType =  "json";
        params.internationalCode =  "63";


        const result = await httpRequest.authCodeHttpRequestForYiDun(params ,paramsAppend);

        console.warn(`返回的result:${JSON.stringify(result)}`)

    }catch (e) {
        console.warn("e",e)
        return false
    }
        process.exit();
}






setTimeout(phoneTest, 2000);