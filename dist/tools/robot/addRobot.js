"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const robotServerController = require("../../app/services/robotService/overallController/robotServerController");
const robotCommonOp = require("../../app/services/robotService/overallController/robotCommonOp");
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
RDSClient_1.RDSClient.demoInit();
async function addR(num) {
    try {
        let res = await robotServerController.getAllRobot();
        console.log(`已经存在${res.length}个机器人`);
        for (let i = 0; i < num - res.length; i++) {
            let userAndPlayer = await robotCommonOp.createUserAndPlayerForRobot();
            console.log(`生成机器人: ${i}, 头像：${JSON.stringify(userAndPlayer.headurl)}`);
        }
    }
    catch (err) {
        console.log(err);
    }
    console.log('完毕');
    process.exit();
}
setTimeout(() => {
    addR(17000).catch(res => process.exit());
}, 500);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUm9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9yb2JvdC9hZGRSb2JvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBQ2IsaUhBQWtIO0FBQ2xILGlHQUFrRztBQUVsRyx3RUFBcUU7QUFFckUscUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUVyQixLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQVc7SUFDM0IsSUFBSTtRQUNBLElBQUksR0FBRyxHQUFHLE1BQU0scUJBQXFCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN2QyxJQUFJLGFBQWEsR0FBRyxNQUFNLGFBQWEsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQ3RFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzNFO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEI7SUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsVUFBVSxDQUFDLEdBQUcsRUFBRTtJQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM3QyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMifQ==