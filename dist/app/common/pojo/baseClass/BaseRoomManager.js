"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomType = void 0;
const pinus_1 = require("pinus");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const PositionEnum_1 = require("../../constant/player/PositionEnum");
const RoleEnum_1 = require("../../constant/player/RoleEnum");
const utils = require("../../../utils");
const Player_manager_1 = require("../../dao/daoManager/Player.manager");
const Room_manager_1 = require("../../dao/daoManager/Room.manager");
const PlayersInRoom_redis_dao_1 = require("../../dao/redis/PlayersInRoom.redis.dao");
const Scene_manager_1 = require("../../dao/daoManager/Scene.manager");
var RoomType;
(function (RoomType) {
    RoomType[RoomType["battle"] = 0] = "battle";
    RoomType[RoomType["Br"] = 1] = "Br";
})(RoomType = exports.RoomType || (exports.RoomType = {}));
class BaseRoomManager {
    constructor(parameter) {
        this.sceneList = [];
        this.roomUserLimit = 0;
        this.nid = parameter.nid;
        this.type = parameter.type;
        if (parameter['configDataPath']) {
            this.initSceneList(parameter['configDataPath']);
        }
    }
    initSceneList(configDataPath) {
        this.sceneList = (0, JsonMgr_1.get)(configDataPath).datas.map((sceneInfo) => {
            sceneInfo.roomList = [];
            sceneInfo.wait_queue = [];
            return sceneInfo;
        });
        const gamesJson = require("../../../../config/data/games.json");
        const targetGameJson = gamesJson.find(({ nid }) => nid === this.nid);
        this.roomUserLimit = targetGameJson.roomUserLimit;
    }
    get_sceneList() {
        return this.sceneList;
    }
    getRoomList() {
        let roomList = [];
        let sceneList = this.sceneList;
        for (const sceneInfo of sceneList) {
            for (const roomInfo of sceneInfo.roomList) {
                roomList.push(roomInfo);
            }
        }
        roomList = roomList.sort((a, b) => parseInt(a.roomId) - parseInt(b.roomId));
        return roomList;
    }
    get_sceneInfo(sceneId) {
        return this.sceneList.find((sceneInfo) => sceneInfo.id === sceneId);
    }
    detectionAllRoom(uid, sceneId, roomId) {
        for (const sceneInfo of this.sceneList) {
            for (const roomInfo of sceneInfo.roomList) {
                if (roomInfo.channel && roomInfo.channel.getMembers().includes(uid)) {
                    roomInfo.kickOutMessage(uid);
                }
            }
        }
    }
    async initAfterServerStart(app) {
        const sceneListInRedis = await Scene_manager_1.default.findList({ nid: this.nid }, true);
        if (sceneListInRedis.length !== this.get_sceneList().length) {
            console.warn(`游戏场: ${this.nid} 未初始化成功`);
            return;
        }
        let roomList = await Room_manager_1.default.findList({ serverId: pinus_1.pinus.app.getServerId() }, true);
        if (!roomList.length) {
            console.warn(`游戏房间: ${this.nid} 未初始化成功`);
            return;
        }
        for (const sceneInfo of this.get_sceneList()) {
            const roomListWithSameSceneId = roomList.filter((room) => room.sceneId === sceneInfo.id);
            for (const room of roomListWithSameSceneId) {
                await PlayersInRoom_redis_dao_1.default.deleteAll(room.serverId, room.roomId);
                await this.createRoom(app, sceneInfo.id, room.roomId);
            }
        }
        ;
    }
    async beforeShutdown() {
        for (const sceneInfo of this.sceneList) {
            for (const roomInfo of sceneInfo.roomList) {
                for (const pl of roomInfo.players) {
                    const p = await Player_manager_1.default.findOne({ uid: pl.uid });
                    if (!p) {
                        continue;
                    }
                    await Player_manager_1.default.updateOne({ uid: pl.uid }, {
                        position: PositionEnum_1.PositionEnum.HALL,
                        abnormalOffline: false,
                        kickedOutRoom: true
                    });
                }
            }
        }
    }
    getUseableRoomForRemote(sceneId, roomId, player) {
        try {
            let sceneInfo = this.get_sceneInfo(sceneId);
            let roomList = sceneInfo.roomList;
            roomList = [];
            for (const system_room of sceneInfo.roomList) {
                if (this.type == RoomType.Br) {
                    if (this.canPlayerEnterRoom(this.nid, system_room, this.roomUserLimit, player)) {
                        roomList.push(system_room);
                    }
                }
                else if (this.type == RoomType.battle) {
                    if (system_room.getPlayer(player.uid)) {
                        return system_room.roomId;
                    }
                    let ret1 = this.canPlayerEnterRoom(this.nid, system_room, this.roomUserLimit, player);
                    let ret2 = system_room['status'] == "INWAIT";
                    if (ret1 && ret2) {
                        roomList.push(system_room);
                    }
                }
            }
            if (roomList.length != 0) {
                if (!!roomId && roomList.find(c => c.roomId == roomId)) {
                    return roomId;
                }
                const hasRealplRoomList = roomList.filter(m => m.players.find(p => !!p && p.isRobot !== 2));
                if (hasRealplRoomList.length != 0) {
                    let randomIndex = utils.random(0, hasRealplRoomList.length - 1);
                    return hasRealplRoomList[randomIndex].roomId;
                }
                let hasRobotRoomList = roomList.filter(m => m.players.find(p => !!p));
                if (hasRobotRoomList.length != 0) {
                    let randomIndex = utils.random(0, hasRobotRoomList.length - 1);
                    return hasRobotRoomList[randomIndex].roomId;
                }
                let randomIndex = utils.random(0, roomList.length - 1);
                return roomList[randomIndex].roomId;
            }
            return null;
        }
        catch (e) {
            return null;
        }
    }
    match_and_reconnection(sceneId, roomId, dbplayer) {
        let sceneInfo = this.get_sceneInfo(sceneId);
        for (const system_room of sceneInfo.roomList) {
            if (system_room.players.find(pl => pl && pl.uid == dbplayer.uid)) {
                return system_room.roomId;
            }
        }
        if (!sceneInfo.wait_queue.find(c => c.uid == dbplayer.uid)) {
            sceneInfo.wait_queue.push(dbplayer);
        }
        return null;
    }
    canPlayerEnterRoom(nid, room, roomUserLimit, player) {
        if (room.getPlayer(player.uid)) {
            return true;
        }
        if (player.isRobot == RoleEnum_1.RoleEnum.REAL_PLAYER && this.type == RoomType.battle) {
            if (room.players.some(c => c && c.isRobot == 0 &&
                (c.groupRemark != player.groupRemark || c.group_id != player.group_id))) {
                return false;
            }
        }
        if (room.isFull()) {
            return false;
        }
        if (player.isRobot === RoleEnum_1.RoleEnum.ROBOT || this.type === RoomType.Br) {
            return true;
        }
        let ipSwitch = (0, JsonMgr_1.get)('ipSwitch').datas.find(m => m.id === nid);
        const isRestrictIP = ipSwitch && ipSwitch.open;
        if (!isRestrictIP) {
            return true;
        }
        return !(room.players.some(user => {
            return !!user && user.isRobot !== RoleEnum_1.RoleEnum.ROBOT && user.ip === player.ip && user.uid !== player.uid;
        }));
    }
    ;
}
exports.default = BaseRoomManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVJvb21NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9wb2pvL2Jhc2VDbGFzcy9CYXNlUm9vbU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQW9EO0FBQ3BELDZEQUF1RTtBQUd2RSxxRUFBa0U7QUFDbEUsNkRBQTBEO0FBQzFELHdDQUF5QztBQUV6Qyx3RUFBbUU7QUFDbkUsb0VBQStEO0FBRS9ELHFGQUF1RTtBQUN2RSxzRUFBOEQ7QUFvQjlELElBQVksUUFLWDtBQUxELFdBQVksUUFBUTtJQUVsQiwyQ0FBTSxDQUFBO0lBRU4sbUNBQUUsQ0FBQTtBQUNKLENBQUMsRUFMVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQUtuQjtBQXFCRCxNQUE4QixlQUFlO0lBUzNDLFlBQVksU0FBK0I7UUFQakMsY0FBUyxHQUFhLEVBQUUsQ0FBQztRQUNuQyxrQkFBYSxHQUFXLENBQUMsQ0FBQztRQU94QixJQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUM7UUFDekIsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBRTNCLElBQUksU0FBUyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDL0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1NBQ2pEO0lBQ0gsQ0FBQztJQUVELGFBQWEsQ0FBQyxjQUFzQjtRQUNsQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUEsYUFBYSxFQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFZLEVBQUUsRUFBRTtZQUN4RSxTQUFTLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUN4QixTQUFTLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUMxQixPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDLENB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