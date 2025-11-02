"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const BaseRobot_1 = require("./base/BaseRobot");
const RobotNet = require("./base/RobotNet");
class testRbot extends BaseRobot_1.BaseRobot {
    destroy() {
        throw new Error('Method not implemented.');
    }
}
async function test() {
    let obj = new testRbot({});
    try {
        let parameter = {
            id: "16534813391215436",
        };
        let url = "https://gate.suphie.com/login";
        let env = "dev";
        if (env == "dev" || 1 == 1) {
            url = "http://127.0.0.1:35000/login";
            parameter = {
                id: "16505427287546120"
            };
            RobotNet.sslOpts.run = false;
        }
        const { status, data } = await axios_1.default.post(url, parameter);
        let result = await obj.enterHall(parameter, data);
        result = await obj.enterGameOrSelectionList('33', 0, '01');
        result = await obj.requestByRoute("CandyMoney.mainHandler.initGame", {});
        console.warn("initGame", JSON.stringify(result));
        result = await obj.requestByRoute("CandyMoney.mainHandler.start", { betNum: 100, detonatorCount: 1 });
        console.warn("start", JSON.stringify(result));
        if (result.result['freeSpinResult'].length == 0) {
            do {
                result = await obj.requestByRoute("CandyMoney.mainHandler.start", { betNum: 100, detonatorCount: 1 });
                console.warn("start", result.result['freeSpinResult'].length);
            } while (result.result['freeSpinResult'].length == 0);
            console.warn("start====", JSON.stringify(result));
        }
    }
    catch (error) {
        console.warn(error);
    }
}
async function regiset() {
    try {
        let parameter = {
            userId: "PciUQb5BEzMxgYND3eXAnlo2RJm1"
        };
        let url = "http://127.0.0.1:35000/thirdLoginPortugal";
        const { status, data } = await axios_1.default.post(url, parameter);
        console.warn(status, data);
    }
    catch (error) {
        console.warn(error);
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdG9vbHMvdG9tL2dhbWUvdGVzdFJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0EsaUNBQTBCO0FBRTFCLGdEQUE2QztBQUM3Qyw0Q0FBNEM7QUFDNUMsTUFBTSxRQUFTLFNBQVEscUJBQVM7SUFDNUIsT0FBTztRQUNILE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBRUo7QUFFRCxLQUFLLFVBQVUsSUFBSTtJQUNmLElBQUksR0FBRyxHQUFHLElBQUksUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzFCLElBQUk7UUFDQSxJQUFJLFNBQVMsR0FBRztZQUNaLEVBQUUsRUFBRSxtQkFBbUI7U0FFMUIsQ0FBQTtRQUNELElBQUksR0FBRyxHQUFHLCtCQUErQixDQUFDO1FBQzFDLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztRQUNoQixJQUFJLEdBQUcsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN4QixHQUFHLEdBQUcsOEJBQThCLENBQUM7WUFDckMsU0FBUyxHQUFHO2dCQUNSLEVBQUUsRUFBRSxtQkFBbUI7YUFDMUIsQ0FBQTtZQUNELFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztTQUNoQztRQUNELE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxlQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUcxRCxJQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBR2xELE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRzNELE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsaUNBQWlDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekUsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRWpELE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsOEJBQThCLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM5QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQzdDLEdBQUc7Z0JBQ0MsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLGNBQWMsQ0FBQyw4QkFBOEIsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNqRSxRQUFRLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBRXRELE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUNyRDtLQVNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFHWixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3ZCO0FBQ0wsQ0FBQztBQUNELEtBQUssVUFBVSxPQUFPO0lBQ2xCLElBQUk7UUFDQSxJQUFJLFNBQVMsR0FBRztZQUNaLE1BQU0sRUFBRSw4QkFBOEI7U0FDekMsQ0FBQTtRQUVELElBQUksR0FBRyxHQUFHLDJDQUEyQyxDQUFDO1FBQ3RELE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxlQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM5QjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN2QjtBQUNMLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyJ9