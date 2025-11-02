const payUtillowerGold = require('../../../app/utils/payUtil');
const encryptionlowerGold = require('../../../app/common/encryption');
const jsonlowerGold = require('../requestTest/test.json');
let SuccessNumlowerGold = 0;
let loseNumlowerGold = 0;
let allTimelowerGold = 0;
let chaoshiNumlowerGold = 0;
async function cleanlowerGold() {
    let accountData = jsonlowerGold;
    let num = 500;
    let questList = [];
    for (let i = 0; i < num; i++) {
        let item = accountData[i];
        let timestamp = 1589338001560;
        let agent = item.agent;
        let account = item.account;
        let param = { account: account, orderid: agent + Date.now() + account, money: 1000 };
        let encrpParam = encryptionlowerGold.httpUrlEnCryPtionForParam(param);
        let key = encryptionlowerGold.MD5KEY(agent, timestamp);
        let body = {
            agent: agent,
            param: encrpParam,
            key: key,
            timestamp: timestamp,
        };
        questList.push(loginlowerGold(body));
    }
    const startTime = Date.now();
    await Promise.all(questList);
    const endTime = Date.now();
    allTimelowerGold = endTime - startTime;
    console.warn(`下分总并发请求:${num}, 总耗时：${allTimelowerGold}毫秒, 超时：${chaoshiNumlowerGold} ,成功：${SuccessNumlowerGold} ,失败：${loseNumlowerGold}, 平均耗时：${allTimelowerGold / num}毫秒`);
    process.exit();
}
async function loginlowerGold(body) {
    let httpData = {
        parameter: body,
        domainName: "nethttp.suphie.com",
        port: null,
        path: "third/lowerPlayerMoney",
        isJson: null
    };
    const startTime = Date.now();
    const data = await payUtillowerGold.httpPostSendJson(httpData);
    const endTime = Date.now();
    if (endTime - startTime > 5000) {
        chaoshiNumlowerGold = chaoshiNumlowerGold + 1;
    }
    console.warn(`返回的code:${data.d.code}`);
    if (data.d.code == 0) {
        SuccessNumlowerGold = SuccessNumlowerGold + 1;
    }
    else {
        loseNumlowerGold = loseNumlowerGold + 1;
    }
}
setTimeout(cleanlowerGold, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdFRlc3RfbG93ZXJHb2xkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9yZXF1ZXN0VGVzdC9SZXF1ZXN0VGVzdF9sb3dlckdvbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsTUFBTSxnQkFBZ0IsR0FBSSxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUNoRSxNQUFNLG1CQUFtQixHQUFLLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ3hFLE1BQU0sYUFBYSxHQUFJLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQzNELElBQU0sbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLElBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLElBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLElBQU0sbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLEtBQUssVUFBVSxjQUFjO0lBRXpCLElBQUksV0FBVyxHQUFHLGFBQWEsQ0FBQztJQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDZCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRyxDQUFDLEVBQUUsRUFBQztRQUMxQixJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxTQUFTLEdBQUcsYUFBYSxDQUFFO1FBQy9CLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdkIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUMzQixJQUFJLEtBQUssR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsT0FBTyxFQUFHLEtBQUssRUFBRyxJQUFJLEVBQUUsQ0FBQztRQUN4RixJQUFJLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0RSxJQUFJLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RELElBQUksSUFBSSxHQUFHO1lBQ1AsS0FBSyxFQUFFLEtBQUs7WUFDWixLQUFLLEVBQUUsVUFBVTtZQUNqQixHQUFHLEVBQUcsR0FBRztZQUNULFNBQVMsRUFBRyxTQUFTO1NBQ3hCLENBQUM7UUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ3ZDO0lBQ0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzdCLE1BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5QixNQUFNLE9BQU8sR0FBSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDNUIsZ0JBQWdCLEdBQUcsT0FBTyxHQUFHLFNBQVMsQ0FBQztJQUN2QyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLGdCQUFnQixVQUFVLG1CQUFtQixRQUFRLG1CQUFtQixRQUFRLGdCQUFnQixVQUFVLGdCQUFnQixHQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7SUFDdkssT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFLRCxLQUFLLFVBQVcsY0FBYyxDQUFDLElBQVU7SUFDckMsSUFBSSxRQUFRLEdBQVE7UUFDaEIsU0FBUyxFQUFFLElBQUk7UUFDZixVQUFVLEVBQUUsb0JBQW9CO1FBQ2hDLElBQUksRUFBRSxJQUFJO1FBQ1YsSUFBSSxFQUFFLHdCQUF3QjtRQUM5QixNQUFNLEVBQUUsSUFBSTtLQUNmLENBQUE7SUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvRCxNQUFNLE9BQU8sR0FBSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDNUIsSUFBRyxPQUFPLEdBQUcsU0FBUyxHQUFHLElBQUksRUFBQztRQUMxQixtQkFBbUIsR0FBRyxtQkFBbUIsR0FBRyxDQUFDLENBQUM7S0FDakQ7SUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ3RDLElBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFDO1FBQ2hCLG1CQUFtQixHQUFHLG1CQUFtQixHQUFHLENBQUMsQ0FBQztLQUNqRDtTQUFJO1FBQ0QsZ0JBQWdCLEdBQUcsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0tBQzNDO0FBQ0wsQ0FBQztBQUNELFVBQVUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUMifQ==