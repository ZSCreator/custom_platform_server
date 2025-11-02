"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../app/common/pojo/baseClass/BaseRobot");
const utils = require("../../app/utils/index");
const preload_1 = require("../../preload");
const url = "http://127.0.0.1:3150";
class tesetrobot extends BaseRobot_1.BaseRobot {
    async destroy() {
        await this.leaveGameAndReset(false);
    }
}
async function test() {
    preload_1.sslOpts.run = true;
    let obj = new tesetrobot({});
    try {
        await obj.requestGate({ host: "gate.zcmy38.com", port: 63010 });
        const dataFromGate = await obj.requestByRoute("gate.mainHandler.login", { id: "16377596822880947" });
        console.warn(JSON.stringify(dataFromGate));
        obj.disconnect();
        await utils.delay(500);
        obj.guestid = dataFromGate.id;
        obj.uid = dataFromGate.uid;
        await obj.requestConnector({ host: "gate.zcmy38.com", port: dataFromGate.server.port });
        const response = await obj.requestByRoute("connector.entryHandler.entryHall", {
            uid: dataFromGate.uid,
            token: dataFromGate.token,
        });
        console.warn(JSON.stringify(response));
    }
    catch (error) {
        console.warn(error);
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0MjIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy90b20vbmV0MjIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx5RUFBc0U7QUFDdEUsK0NBQStDO0FBRS9DLDJDQUF3QztBQUN4QyxNQUFNLEdBQUcsR0FBRyx1QkFBdUIsQ0FBQztBQUVwQyxNQUFNLFVBQVcsU0FBUSxxQkFBUztJQUU5QixLQUFLLENBQUMsT0FBTztRQUNULE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXhDLENBQUM7Q0FDSjtBQUVELEtBQUssVUFBVSxJQUFJO0lBQ2YsaUJBQU8sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ25CLElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzdCLElBQUk7UUFJQSxNQUFNLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFNaEUsTUFBTSxZQUFZLEdBQUcsTUFBTSxHQUFHLENBQUMsY0FBYyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsRUFBRSxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQztRQUNyRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMzQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDakIsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBR3ZCLEdBQUcsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQztRQUM5QixHQUFHLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUM7UUFFM0IsTUFBTSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUd4RixNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsa0NBQWtDLEVBQUU7WUFDMUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxHQUFHO1lBQ3JCLEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSztTQUM1QixDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztLQWUxQztJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN2QjtBQUdMLENBQUM7QUFHRCxJQUFJLEVBQUUsQ0FBQyJ9