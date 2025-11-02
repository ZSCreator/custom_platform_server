
const payUtillowerGold  = require('../../../app/utils/payUtil');
const encryptionlowerGold   = require('../../../app/common/encryption');
const jsonlowerGold  = require('../requestTest/test.json');
let   SuccessNumlowerGold = 0;
let   loseNumlowerGold = 0;
let   allTimelowerGold = 0;
let   chaoshiNumlowerGold = 0;
async function cleanlowerGold() {

    let accountData = jsonlowerGold;
    let num = 500; //并发500次请求
    let questList = [];
    for(let i = 0 ; i < num ; i++){
        let item = accountData[i];
        let timestamp = 1589338001560 ;
        let agent = item.agent;
        let account = item.account;
        let param = { account: account, orderid : agent + Date.now() + account  ,money : 1000 };
        let encrpParam = encryptionlowerGold.httpUrlEnCryPtionForParam(param);
        let key = encryptionlowerGold.MD5KEY(agent,timestamp);
        let body = {
            agent: agent,
            param: encrpParam,
            key : key,
            timestamp : timestamp,
        };
        questList.push(loginlowerGold(body))
    }
    const startTime = Date.now();
    await  Promise.all(questList);
    const endTime =  Date.now();
    allTimelowerGold = endTime - startTime;
    console.warn(`下分总并发请求:${num}, 总耗时：${allTimelowerGold}毫秒, 超时：${chaoshiNumlowerGold} ,成功：${SuccessNumlowerGold} ,失败：${loseNumlowerGold}, 平均耗时：${allTimelowerGold/num}毫秒`)
    process.exit();
}




async  function loginlowerGold(body : any){
    let httpData: any = {
        parameter: body,//http请求参数
        domainName: "nethttp.suphie.com",//http请求域名
        port: null,//htt请求端口
        path: "third/lowerPlayerMoney",
        isJson: null
    }
    const startTime = Date.now();
    const data = await payUtillowerGold.httpPostSendJson(httpData);
    const endTime =  Date.now();
    if(endTime - startTime > 5000){
        chaoshiNumlowerGold = chaoshiNumlowerGold + 1;
    }
    console.warn(`返回的code:${data.d.code}`)
    if(data.d.code == 0){
        SuccessNumlowerGold = SuccessNumlowerGold + 1;
    }else{
        loseNumlowerGold = loseNumlowerGold + 1;
    }
}
setTimeout(cleanlowerGold, 2000);