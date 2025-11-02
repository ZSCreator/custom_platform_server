


import axios from 'axios';
import { exit } from 'process';
import { BaseRobot } from "./base/BaseRobot";
import *as  RobotNet from "./base/RobotNet";
class testRbot extends BaseRobot {
    destroy() {
        throw new Error('Method not implemented.');
    }

}

async function test() {
    let obj = new testRbot({})
    try {
        let parameter = {
            id: "16534813391215436",
            // id: "16505427287546120"
        }
        let url = "https://gate.suphie.com/login";
        let env = "dev";
        if (env == "dev" || 1 == 1) {
            url = "http://127.0.0.1:35000/login";
            parameter = {
                id: "16505427287546120"
            }
            RobotNet.sslOpts.run = false;
        }
        const { status, data } = await axios.post(url, parameter);
        // console.warn(status, data);

        let result = await obj.enterHall(parameter, data);
        // console.warn(JSON.stringify(result));
        // result = await obj.requestByRoute("activity.activityHandler.receiveRelief", {});
        result = await obj.enterGameOrSelectionList('33', 0, '01');
        // console.warn(result);

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
        // exit;
        // result = await obj.requestByRoute("MineGame.mainHandler.open", { x: 1, y: 1 });
        // console.warn("open", JSON.stringify(result));

        // result = await obj.requestByRoute("MineGame.mainHandler.settlement", {});
        // console.warn("settlement", JSON.stringify(result));

        // console.warn("open", JSON.stringify(result));
    } catch (error) {
        // let result = await obj.requestByRoute("MineGame.mainHandler.settlement", { betNum: 1, betOdd: 10 });
        // console.warn("settlement", JSON.stringify(result));
        console.warn(error);
    }
}
async function regiset() {
    try {
        let parameter = {
            userId: "PciUQb5BEzMxgYND3eXAnlo2RJm1"
        }
        // let url = "https://api.mozbrgame.com/gate/thirdLoginPortugal";
        let url = "http://127.0.0.1:35000/thirdLoginPortugal";
        const { status, data } = await axios.post(url, parameter);
        console.warn(status, data);
    } catch (error) {
        console.warn(error);
    }
}

test();


