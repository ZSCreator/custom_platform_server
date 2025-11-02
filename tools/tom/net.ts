import * as WebSocket from 'ws';
import { BaseRobot } from "../../app/common/pojo/baseClass/BaseRobot";
import * as  utils from "../../app/utils/index"
// import { BaseRobot } from "../..common/pojo/baseClass/BaseRobot";
import { sslOpts } from '../../preload';

// const url = "api.suphie.com";
// const port = 63010;

const url = "127.0.0.1";
const port = 3010;

class tesetrobot extends BaseRobot {
    // 离开
    async destroy() {
        await this.leaveGameAndReset(false);
        // this.zjhConfig = null;
    }
}

async function test() {
    // sslOpts.run = true;
    let obj = new tesetrobot({});
    try {
        // 注册监听器
        // obj.registerListener();
        // 先和 gate 建立连接
        await obj.requestGate({ host: url, port: port });
        // 游客登录
        // {"code":200,"id":"16361655216031288","uid":"52712880","token":"48420797142322cf1b20d757dbad5adadd06bfc1699742636e5f9cb6405ecb56","cellPhone":"","server":{"host":"https://gate.zcmy38.com","port":63201}}
        // const data22 = await obj.requestByRoute("gate.mainHandler.guest", {});
        const dataFromGate = await obj.requestByRoute("gate.mainHandler.login", { id: "16376739434326375" });
        console.warn(JSON.stringify(dataFromGate));
        // obj.disconnect();
        // await utils.delay(500);


        obj.guestid = dataFromGate.id;
        obj.uid = dataFromGate.uid;
        //再和 connector 建立连接
        await obj.requestConnector({ host: dataFromGate.server.host, port:  dataFromGate.server.port });
        // 调用 connector 的接口
        // console.warn("机器人登陆到大厅");
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
            // param
        });
        console.warn(JSON.stringify(data));
        // console.warn("baijia.mainHandler.loaded");
        // data = await obj.requestByRoute("baijia.mainHandler.loaded", {});
        // console.warn(JSON.stringify(data));
    } catch (error) {
        console.warn(error);
    }


}


test();
// const socket = new WebSocket(url);
// socket.binaryType = 'arraybuffer';

// socket.onopen = (event) => {
//     console.warn("onopen");

// };

// socket.onmessage = (event) => {
//     console.warn("onmessage");
// };

// socket.onerror = (error) => {
//     console.warn("onerror");
// };

// socket.onclose = (event) => {
//     console.warn("onclose");
// };