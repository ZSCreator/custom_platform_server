"use strict";
import robotServerController = require('../../app/servers/robot/lib/robotServerController');
import robotCommonOp = require('../../app/services/robotService/overallController/robotCommonOp');
import { Scene } from "../../app/common/dao/mysql/entity/Scene.entity"
import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
/** Mysql */
import GameManagerDao from "../../app/common/dao/daoManager/Game.manager";
import SceneManagerDao from "../../app/common/dao/daoManager/Scene.manager";
import RoomManagerDao from "../../app/common//dao/daoManager/Room.manager";
RDSClient.demoInit();

// node app.js arg1 arg2 arg3,获取 app.js 后的三个参数，可以使用 process.argv 获取。

//process是一个全局对象，argv返回的是一组包含命令行参数的数组
const args = process.argv.splice(2)
console.log(args);
if (args.length == 0) {
    console.warn("传入参数  nid=10  则 输入 10即可");
    process.exit();
}
const nid = args[0];
console.warn(`游戏 nid=${nid}`);

function init() {
    if (nid == "all") {
        All_clean();
    } else {
        clean();
    }
}

async function clean() {
    await GameManagerDao.delete({ nid });

    const sceneList = await SceneManagerDao.findList({ nid });
    for (const sceneInfo of sceneList) {
        const scene = await SceneManagerDao.delete({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId });
    }
    const roomList = await RoomManagerDao.findList({ nid });
    for (const roomInfo of roomList) {
        const room = await RoomManagerDao.delete({ serverId: roomInfo.serverId, roomId: roomInfo.roomId });
    }
    console.log("clear all ok!!!!");
    process.exit();
}

async function All_clean() {
    let gamesList = await GameManagerDao.findList({}, true);
    console.warn(gamesList.map(c => c.nid));
    for (const game of gamesList) {
        const nid = game.nid;
        await GameManagerDao.delete({ nid });

        const sceneList = await SceneManagerDao.findList({ nid }, true);
        for (const sceneInfo of sceneList) {
            const scene = await SceneManagerDao.delete({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId });
        }
        const roomList = await RoomManagerDao.findList({ nid }, true);
        for (const roomInfo of roomList) {
            const room = await RoomManagerDao.delete({ serverId: roomInfo.serverId, roomId: roomInfo.roomId });
        }
        console.log("clear all ok!!!!", nid);
    }

    process.exit();
}

setTimeout(init, 2000);
