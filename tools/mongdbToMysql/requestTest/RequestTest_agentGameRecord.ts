
const payUtilAgentRecord  = require('../../../app/utils/payUtil');
const encryptionAgentRecord = require('../../../app/common/encryption');
let   SuccessNumAgentRecord = 0;
let   loseNumAgentRecord = 0;
let   allTimeAgentRecord = 0;
let   chaoshiNum = 0;
async function cleanAgentRecord() {

    let num = 500; //并发500次请求
    let questList = [];
    for(let i = 0 ; i < num ; i++){
        let timestamp = 1589338001560 ;
        let agent = "a5b08";
        let param = { startTime: 1629424806000, endTime : 1629425406000 };
        let encrpParam = encryptionAgentRecord.httpUrlEnCryPtionForParam(param);
        let key = encryptionAgentRecord.MD5KEY(agent,timestamp);
        let body = {
            agent: agent,
            param: encrpParam,
            key : key,
            timestamp : timestamp,
        };
        questList.push(loginAgentRecord(body))
    }
    const startTime = Date.now();
    await  Promise.all(questList);
    const endTime =  Date.now();
    allTimeAgentRecord = endTime - startTime;
    console.warn(`拉取游戏记录总并发请求:${num}, 总耗时：${allTimeAgentRecord}毫秒, 超时：${chaoshiNum} ,成功：${SuccessNumAgentRecord} ,失败：${loseNumAgentRecord}, 平均耗时：${allTimeAgentRecord/num}毫秒`)
    process.exit();
}




async  function loginAgentRecord(body : any){
    let httpData: any = {
        parameter: body,//http请求参数
        domainName: "nethttp.suphie.com",//http请求域名
        port: null,//htt请求端口
        path: "third/getGameRecord",
        isJson: null
    }
    const startTime = Date.now();
    const data = await payUtilAgentRecord.httpPostSendJson(httpData);
    const endTime =  Date.now();
    if(endTime - startTime > 5000){
        chaoshiNum = chaoshiNum + 1;
    }
    console.warn(`返回的code:${data.d.code}`)
    if(data.d.code == 0){
        SuccessNumAgentRecord = SuccessNumAgentRecord + 1;
    }else{
        loseNumAgentRecord = loseNumAgentRecord + 1;
    }

}
setTimeout(cleanAgentRecord, 2000);