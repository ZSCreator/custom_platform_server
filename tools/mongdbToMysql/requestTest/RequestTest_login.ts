
const payUtil  = require('../../../app/utils/payUtil');
const encryption  = require('../../../app/common/encryption');
const json = require('../requestTest/test.json');
let SuccessNum = 0;
let loseNum = 0;
let allTime = 0;
let chaoshiNumLogin = 0;
async function clean() {

    let accountData = json;
    let num = 500; //并发500次请求
    let questList = [];
    for(let i = 0 ; i < num ; i++){
        let item = accountData[i];
        let timestamp = 1589338001560 ;
        let agent = item.agent;
        let account = item.account;
        let param = { account: account ,  KindID : "1" , language : 'chinese_zh' };
        let encrpParam = encryption.httpUrlEnCryPtionForParam(param);
        let key = encryption.MD5KEY(agent,timestamp);
        let body = {
            agent: agent,
            param: encrpParam,
            key : key,
            timestamp : timestamp,
        };
        questList.push(login(body))
    }
    const startTime = Date.now();
    await  Promise.all(questList);
    const endTime =  Date.now();
    allTime = endTime - startTime;
    console.warn(`登陆总并发请求:${num}, 总耗时：${allTime}毫秒, 超时：${chaoshiNumLogin} ,成功：${SuccessNum} ,失败：${loseNum}, 平均耗时：${allTime/num}毫秒`)
    process.exit();
}




async  function login(body : any){
    let httpData: any = {
        parameter: body,//http请求参数
        domainName: "nethttp.suphie.com",//http请求域名
        port: null,//htt请求端口
        path: "third/login",
        isJson: null
    }
    const startTime = Date.now();
    const data = await payUtil.httpPostSendJson(httpData);
    const endTime =  Date.now();
    if(endTime - startTime > 5000){
        chaoshiNumLogin = chaoshiNumLogin + 1;
    }
    console.warn(`返回的code:${data.d.code}`)
    if(data.d.code == 0){
        SuccessNum = SuccessNum + 1;
    }else{
        loseNum = loseNum + 1;
    }
}
setTimeout(clean, 2000);