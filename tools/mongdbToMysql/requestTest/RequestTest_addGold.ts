
const payUtilAddGold  = require('../../../app/utils/payUtil');
const encryptionAddGold  = require('../../../app/common/encryption');
const jsonAddGold = require('../requestTest/test.json');
let   SuccessNumAddGold = 0;
let   loseNumAddGold = 0;
let   allTimeAddGold = 0;
let chaoshiNumAddGold = 0;
async function cleanAddGold() {

    let accountData = jsonAddGold;
    let num = 500; //并发500次请求
    let questList = [];
    for(let i = 0 ; i < num ; i++){
        let item = accountData[i];
        let timestamp = 1589338001560 ;
        let agent = item.agent;
        let account = item.account;
        let param = { account: account, orderid : agent + Date.now() + account  ,money : 1000 };
        let encrpParam = encryptionAddGold.httpUrlEnCryPtionForParam(param);
        let key = encryptionAddGold.MD5KEY(agent,timestamp);
        let body = {
            agent: agent,
            param: encrpParam,
            key : key,
            timestamp : timestamp,
        };
        questList.push(loginAddGold(body))
    }
    const startTime = Date.now();
    await  Promise.all(questList);
    const endTime =  Date.now();
    allTimeAddGold = endTime - startTime;
    console.warn(`上分总并发请求:${num}, 总耗时：${allTimeAddGold}毫秒, 超时：${chaoshiNumAddGold} ,成功：${SuccessNumAddGold} ,失败：${loseNumAddGold}, 平均耗时：${allTimeAddGold/num}毫秒`)
    process.exit();
}




async  function loginAddGold(body : any){
    let httpData: any = {
        parameter: body,//http请求参数
        domainName: "nethttp.suphie.com",//http请求域名
        port: null,//htt请求端口
        path: "third/addPlayerMoney",
        isJson: null
    }
    const startTime = Date.now();
    const data = await payUtilAddGold.httpPostSendJson(httpData);
    const endTime =  Date.now();
    if(endTime - startTime > 6000){
        chaoshiNumAddGold = chaoshiNumAddGold + 1;
    }
    console.warn(`返回的code:${data.d.code}`)
    if(data.d.code == 0){
        SuccessNumAddGold = SuccessNumAddGold + 1;
    }else{
        loseNumAddGold = loseNumAddGold + 1;
    }
}
setTimeout(cleanAddGold, 2000);