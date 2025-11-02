"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../app/common/pojo/baseClass/BaseRobot");
const url = "127.0.0.1";
const port = 3010;
class tesetrobot extends BaseRobot_1.BaseRobot {
    async destroy() {
        await this.leaveGameAndReset(false);
    }
}
async function test() {
    let obj = new tesetrobot({});
    try {
        await obj.requestGate({ host: url, port: port });
        const dataFromGate = await obj.requestByRoute("gate.mainHandler.login", { id: "16376739434326375" });
        console.warn(JSON.stringify(dataFromGate));
        obj.guestid = dataFromGate.id;
        obj.uid = dataFromGate.uid;
        await obj.requestConnector({ host: dataFromGate.server.host, port: dataFromGate.server.port });
        const response = await obj.requestByRoute("connector.entryHandler.entryHall", {
            uid: dataFromGate.uid,
            token: dataFromGate.token,
        });
        console.warn(JSON.stringify(response));
        let data = await obj.requestByRoute("hall.mainHandler.enterGameOrSelectionList", {
            nid: "22",
            sceneId: 0,
            roomId: "001",
            whetherToShowScene: false,
            whetherToShowRoom: false,
            whetherToShowGamingInfo: true,
        });
        console.warn(JSON.stringify(data));
    }
    catch (error) {
        console.warn(error);
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvdG9tL25ldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHlFQUFzRTtBQVF0RSxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUM7QUFDeEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBRWxCLE1BQU0sVUFBVyxTQUFRLHFCQUFTO0lBRTlCLEtBQUssQ0FBQyxPQUFPO1FBQ1QsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFeEMsQ0FBQztDQUNKO0FBRUQsS0FBSyxVQUFVLElBQUk7SUFFZixJQUFJLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QixJQUFJO1FBSUEsTUFBTSxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUlqRCxNQUFNLFlBQVksR0FBRyxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ3JHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBSzNDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQztRQUM5QixHQUFHLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUM7UUFFM0IsTUFBTSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUdoRyxNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsa0NBQWtDLEVBQUU7WUFDMUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxHQUFHO1lBQ3JCLEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSztTQUM1QixDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUV2QyxJQUFJLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsMkNBQTJDLEVBQUU7WUFDN0UsR0FBRyxFQUFFLElBQUk7WUFDVCxPQUFPLEVBQUUsQ0FBQztZQUNWLE1BQU0sRUFBRSxLQUFLO1lBQ2Isa0JBQWtCLEVBQUUsS0FBSztZQUN6QixpQkFBaUIsRUFBRSxLQUFLO1lBQ3hCLHVCQUF1QixFQUFFLElBQUk7U0FFaEMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FJdEM7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDdkI7QUFHTCxDQUFDO0FBR0QsSUFBSSxFQUFFLENBQUMifQ==