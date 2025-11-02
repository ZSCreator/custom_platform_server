const payUtilAgentRecord = require('../../../app/utils/payUtil');
const encryptionAgentRecord = require('../../../app/common/encryption');
let SuccessNumAgentRecord = 0;
let loseNumAgentRecord = 0;
let allTimeAgentRecord = 0;
let chaoshiNum = 0;
async function cleanAgentRecord() {
    let num = 500;
    let questList = [];
    for (let i = 0; i < num; i++) {
        let timestamp = 1589338001560;
        let agent = "a5b08";
        let param = { startTime: 1629424806000, endTime: 1629425406000 };
        let encrpParam = encryptionAgentRecord.httpUrlEnCryPtionForParam(param);
        let key = encryptionAgentRecord.MD5KEY(agent, timestamp);
        let body = {
            agent: agent,
            param: encrpParam,
            key: key,
            timestamp: timestamp,
        };
        questList.push(loginAgentRecord(body));
    }
    const startTime = Date.now();
    await Promise.all(questList);
    const endTime = Date.now();
    allTimeAgentRecord = endTime - startTime;
    console.warn(`拉取游戏记录总并发请求:${num}, 总耗时：${allTimeAgentRecord}毫秒, 超时：${chaoshiNum} ,成功：${SuccessNumAgentRecord} ,失败：${loseNumAgentRecord}, 平均耗时：${allTimeAgentRecord / num}毫秒`);
    process.exit();
}
async function loginAgentRecord(body) {
    let httpData = {
        parameter: body,
        domainName: "nethttp.suphie.com",
        port: null,
        path: "third/getGameRecord",
        isJson: null
    };
    const startTime = Date.now();
    const data = await payUtilAgentRecord.httpPostSendJson(httpData);
    const endTime = Date.now();
    if (endTime - startTime > 5000) {
        chaoshiNum = chaoshiNum + 1;
    }
    console.warn(`返回的code:${data.d.code}`);
    if (data.d.code == 0) {
        SuccessNumAgentRecord = SuccessNumAgentRecord + 1;
    }
    else {
        loseNumAgentRecord = loseNumAgentRecord + 1;
    }
}
setTimeout(cleanAgentRecord, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdFRlc3RfYWdlbnRHYW1lUmVjb3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9yZXF1ZXN0VGVzdC9SZXF1ZXN0VGVzdF9hZ2VudEdhbWVSZWNvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsTUFBTSxrQkFBa0IsR0FBSSxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUNsRSxNQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ3hFLElBQU0scUJBQXFCLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLElBQU0sa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLElBQU0sa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLElBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNyQixLQUFLLFVBQVUsZ0JBQWdCO0lBRTNCLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNkLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUNuQixLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUcsR0FBRyxFQUFHLENBQUMsRUFBRSxFQUFDO1FBQzFCLElBQUksU0FBUyxHQUFHLGFBQWEsQ0FBRTtRQUMvQixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUM7UUFDcEIsSUFBSSxLQUFLLEdBQUcsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRyxhQUFhLEVBQUUsQ0FBQztRQUNsRSxJQUFJLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4RSxJQUFJLEdBQUcsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hELElBQUksSUFBSSxHQUFHO1lBQ1AsS0FBSyxFQUFFLEtBQUs7WUFDWixLQUFLLEVBQUUsVUFBVTtZQUNqQixHQUFHLEVBQUcsR0FBRztZQUNULFNBQVMsRUFBRyxTQUFTO1NBQ3hCLENBQUM7UUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDekM7SUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDN0IsTUFBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sT0FBTyxHQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixrQkFBa0IsR0FBRyxPQUFPLEdBQUcsU0FBUyxDQUFDO0lBQ3pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsa0JBQWtCLFVBQVUsVUFBVSxRQUFRLHFCQUFxQixRQUFRLGtCQUFrQixVQUFVLGtCQUFrQixHQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7SUFDMUssT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFLRCxLQUFLLFVBQVcsZ0JBQWdCLENBQUMsSUFBVTtJQUN2QyxJQUFJLFFBQVEsR0FBUTtRQUNoQixTQUFTLEVBQUUsSUFBSTtRQUNmLFVBQVUsRUFBRSxvQkFBb0I7UUFDaEMsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUscUJBQXFCO1FBQzNCLE1BQU0sRUFBRSxJQUFJO0tBQ2YsQ0FBQTtJQUNELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM3QixNQUFNLElBQUksR0FBRyxNQUFNLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sT0FBTyxHQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixJQUFHLE9BQU8sR0FBRyxTQUFTLEdBQUcsSUFBSSxFQUFDO1FBQzFCLFVBQVUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0tBQy9CO0lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUN0QyxJQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBQztRQUNoQixxQkFBcUIsR0FBRyxxQkFBcUIsR0FBRyxDQUFDLENBQUM7S0FDckQ7U0FBSTtRQUNELGtCQUFrQixHQUFHLGtCQUFrQixHQUFHLENBQUMsQ0FBQztLQUMvQztBQUVMLENBQUM7QUFDRCxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMifQ==