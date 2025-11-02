"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDynamicRoomManager = exports.RoomType = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const utils_1 = require("../../../../utils");
const GameRoomBuilder_1 = require("./GameRoomBuilder");
const GameRoomDirector_1 = require("./GameRoomDirector");
const RoleEnum_1 = require("../../../constant/player/RoleEnum");
const utils_2 = require("../../../../utils");
const BlackJackPlayerRoleEnum_1 = require("../../../../servers/BlackJack/lib/enum/BlackJackPlayerRoleEnum");
const Game_manager_1 = require("../../../dao/daoManager/Game.manager");
const Scene_manager_1 = require("../../../dao/daoManager/Scene.manager");
const IsolationRoomPool_redis_dao_1 = require("../../../dao/redis/IsolationRoomPool.redis.dao");
const ShareTenantRoomSituation_redis_dao_1 = require("../../../dao/redis/ShareTenantRoomSituation.redis.dao");
const initializeArrayWithRange = (len) => Array.from({ length: len }).map((v, i) => i + 1);
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
var RoomType;
(function (RoomType) {
    RoomType[RoomType["battle"] = 0] = "battle";
    RoomType[RoomType["Br"] = 1] = "Br";
})(RoomType = exports.RoomType || (exports.RoomType = {}));
class BaseDynamicRoomMnager {
    constructor(parameter) {
        this.serverId = null;
        this.nid = null;
        this.gameName = null;
        this.roomUserLimit = 0;
        this.currentRoomKind = 0;
        this.type = null;
        this.configDataPath = null;
        this.hasBeenInitializ = false;
        this.sceneList = [];
        this.roomPool = [[]];
        this.logger = (0, pinus_logger_1.getLogger)("server_out", __filename);
        const { nid, type } = parameter;
        this.nid = nid;
        this.type = type;
        this.serverId = pinus_1.pinus.app.getServerId();
        this.roomPool = [[]];
    }
    _logger(msg, logLever = "info") {
        if (pinus_1.pinus.app.get("env") === "development") {
            this.logger[logLever](msg);
        }
    }
    async init() {
        if (this.hasBeenInitializ) {
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 初始化 | 已重复并终止`);
            return;
        }
        await this.initGameInfo();
        await this.initSceneList();
        this.hasBeenInitializ = true;
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 初始化 | 完成`);
        return this;
    }
    async initGameInfo() {
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 游戏配置信息 | 初始化`);
        const gamesJson = require("../../../../../config/data/games.json");
        const { roomUserLimit, name, roomCount, whetherToShowScene } = gamesJson.find(({ nid }) => nid === this.nid);
        this.gameName = name;
        this.roomUserLimit = roomUserLimit;
        this.createRoomCoreInfo = {
            whetherToShowScene,
            sceneCount: 0,
            roomCount
        };
        const gameInfo = await Game_manager_1.default.findOne({ nid: this.nid }, true);
        if (!gameInfo) {
            const targetGameJson = gamesJson.find(({ nid }) => nid === this.nid);
            await Game_manager_1.default.insertOne(targetGameJson);
        }
    }
    async initSceneList() {
        var e_1, _a;
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 场配置信息 | 初始化 `);
        const sceneList = require(`../../../../../config/data/scenes/${this.gameName}.json`);
        this.sceneList = sceneList.map((sceneInfo) => {
            sceneInfo.roomList = [];
            sceneInfo.wait_queue = [];
            return sceneInfo;
        });
        this.createRoomCoreInfo.sceneCount = this.createRoomCoreInfo.whetherToShowScene ? this.sceneList.length : 1;
        const mysqlSceneList = await Scene_manager_1.default.findList({ nid: this.nid }, true);
        if (mysqlSceneList.length == 0 || mysqlSceneList.length !== sceneList.length) {
            try {
                for (var sceneList_1 = __asyncValues(sceneList), sceneList_1_1; sceneList_1_1 = await sceneList_1.next(), !sceneList_1_1.done;) {
                    const info = sceneList_1_1.value;
                    const { id: sceneId } = info, rest = __rest(info, ["id"]);
                    await Scene_manager_1.default.delete({ nid: this.nid, sceneId: sceneId });
                    await Scene_manager_1.default.insertOne(Object.assign({ sceneId }, rest));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (sceneList_1_1 && !sceneList_1_1.done && (_a = sceneList_1.return)) await _a.call(sceneList_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    }
    createRoomInfo(roomId, sceneId) {
        const { nid, gameName, roomUserLimit } = this;
        const roomBuilder = new GameRoomBuilder_1.GameRoomBuilder(nid, roomId);
        const roomDirector = new GameRoomDirector_1.GameRoomDirector(roomBuilder);
        const roomBaseInfo = roomDirector.getRoomInstance({ gameName, sceneId, roomUserLimit }, this.sceneList[sceneId]);
        return roomBaseInfo;
    }
    addRoomInfoInRoomPool(roomInfo, targetIdx = -1) {
        if (targetIdx >= 0) {
            this.roomPool[targetIdx].push(roomInfo);
            return;
        }
        const kindIdxOfRoomLength = this.roomPool.length;
        const totalRoomCountForRoomList = this.createRoomCoreInfo.roomCount * this.sceneList.length;
        if (this.roomPool[kindIdxOfRoomLength - 1].length === totalRoomCountForRoomList) {
            this.roomPool.push([]);
            this.roomPool[kindIdxOfRoomLength].push(roomInfo);
        }
        if (this.roomPool[kindIdxOfRoomLength - 1].length < totalRoomCountForRoomList) {
            this.roomPool[kindIdxOfRoomLength - 1].push(roomInfo);
        }
    }
    totalNumberRooms() {
        const totalNumber = this.roomPool.reduce((num, roomList) => {
            num += roomList.length;
            return num;
        }, 0);
        return totalNumber;
    }
    dynamicIncreaseRoom() {
        this.currentRoomKind++;
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 动态增加房间 | 场数量: ${this.createRoomCoreInfo.sceneCount} |  单场房间数量: ${this.createRoomCoreInfo.roomCount}`);
        const totalNumber = this.totalNumberRooms();
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 动态增加房间 | 场数量: ${this.createRoomCoreInfo.sceneCount} |  单场房间数量: ${this.createRoomCoreInfo.roomCount} | 当前房间数: ${totalNumber}`);
        const { sceneCount, roomCount } = this.createRoomCoreInfo;
        const createRoomCount = sceneCount * roomCount;
        let beginRoomId = 0;
        let notHadRoomInfoForRoomListIdx = this.roomPool.findIndex(roomList => roomList.length === 0);
        if (notHadRoomInfoForRoomListIdx >= 0) {
            beginRoomId = createRoomCount * notHadRoomInfoForRoomListIdx;
        }
        else {
            beginRoomId = totalNumber;
        }
        const roomIdList = initializeArrayWithRange(createRoomCount)
            .map((v) => (0, utils_1.pad)(v + beginRoomId, 3));
        const curSceneRoomIdList = chunk(roomIdList, roomCount);
        for (let index = 0; index < this.sceneList.length; index++) {
            this.currentRoomKind++;
            const { id } = this.sceneList[index];
            const roomList = curSceneRoomIdList[index];
            for (let i = 0; i < roomList.length; i++) {
                const roomId = roomList[i];
                const roomInfo = this.createRoomInfo(roomId, id);
                this.addRoomInfoInRoomPool(roomInfo, notHadRoomInfoForRoomListIdx);
                roomInfo.robotRunning = true;
            }
        }
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 动态增加房间 | 场数量: ${this.createRoomCoreInfo.sceneCount} | 单场房间数量: ${this.createRoomCoreInfo.roomCount} | 完成 |当前房间数: ${this.totalNumberRooms()}`);
        return roomIdList;
    }
    getRoomInfo(roomId) {
        const idx = this.getRoomKindIdxFromRoomPool(roomId);
        if (idx === null) {
            return idx;
        }
        const roomList = this.roomPool[idx];
        const room = roomList.find(({ roomId: rid }) => rid === roomId);
        return room;
    }
    getRoomInfoList() {
        return this.roomPool.reduce((list, roomList) => {
            list.push(...roomList);
            return list;
        }, []);
    }
    getRoomKindIdxFromRoomPool(roomId) {
        const roomTwoList = this.roomPool;
        let roomPoolIdx = null;
        for (let kIdx = 0; kIdx < roomTwoList.length; kIdx++) {
            const roomList = roomTwoList[kIdx];
            const roomInfo = roomList.find(info => info.roomId === roomId);
            if (!!roomInfo) {
                roomPoolIdx = kIdx;
                break;
            }
        }
        if (roomPoolIdx === null) {
            return roomPoolIdx;
        }
        if (roomPoolIdx < 0) {
            throw new Error(`获取指定房间号所在RoomPool里指定场具体的下标位置 | 游戏 ${this.nid} 未查询到房间号 ${roomId} `);
        }
        return roomPoolIdx;
    }
}
class IDynamicRoomManager extends BaseDynamicRoomMnager {
    constructor(parameter) {
        super(parameter);
        this.isolationPool = {};
        this.desestroyTime = 30e3;
        this.timerPool = {};
        const { configDataPath } = parameter;
        !!configDataPath && (this.configDataPath = configDataPath);
    }
    getSceneInfo(sceneId) {
        return this.sceneList.find((sceneInfo) => sceneInfo.id === sceneId);
    }
    getRoomListByPlayerInfo(rootUid, parantUid) {
        rootUid = !!rootUid ? rootUid : "-1";
        parantUid = !!parantUid ? parantUid : "-1";
        let result = [];
        this.beRoomAvailableInIsolationPool(rootUid, parantUid);
        const roomListIdxList = this.isolationPool[rootUid][parantUid];
        const lastIdx = roomListIdxList.length - 1;
        const roomListIdx = this.isolationPool[rootUid][parantUid][lastIdx];
        for (let i = 0; i < this.roomPool[roomListIdx].length; i++) {
            const { roomId, sceneId } = this.roomPool[roomListIdx][i];
            result.push({
                roomId,
                sceneId
            });
        }
        return result;
    }
    searchAndEntryRoom(sceneId, roomId, player) {
        try {
            if (player.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
                const roomInfo = this.getRoomInfo(roomId);
                let status = false;
                if (roomInfo) {
                    status = roomInfo.addPlayerInRoom(player);
                }
                return { status, roomInfo };
            }
            roomId = this.filterConditionalRoom(sceneId, roomId, player);
            const roomInfo = this.getRoomInfo(roomId);
            let status = false;
            if (roomInfo) {
                if (roomInfo.canBeDestroy) {
                    roomInfo.canBeDestroy = false;
                }
                status = roomInfo.addPlayerInRoom(player);
            }
            return { status, roomInfo };
        }
        catch (error) {
            return { error };
        }
    }
    filterConditionalRoom(sceneId, roomId, player) {
        const { group_id: rootUid, lineCode: parantUid } = player;
        this.beRoomAvailableInIsolationPool(rootUid, parantUid);
        const roomList = [];
        const list = this.getRoomList(rootUid, parantUid);
        list.filter(room => room.sceneId === sceneId)
            .forEach(room => {
            const subRoomList = this.subFileterConditionalRoom(room, player);
            roomList.push(...subRoomList);
        });
        if (roomList.length > 0) {
            if (!!roomId && roomList.find(({ roomId: rid }) => rid == roomId)) {
                return roomId;
            }
            const hasRobotRoomList = roomList.filter(m => m.players.find(p => !!p));
            if (hasRobotRoomList.length != 0) {
                let randomIndex = (0, utils_2.random)(0, hasRobotRoomList.length - 1);
                return hasRobotRoomList[randomIndex].roomId;
            }
            let randomIndex = (0, utils_2.random)(0, roomList.length - 1);
            return roomList[randomIndex].roomId;
        }
        if (roomList.length === 0) {
            this._logger(`房间动态管理类 | 无可用房间 | 新增房间组 `);
            this.dynamicIncreaseRoom();
            this.updateTenantRoomSituation();
            this.addRoomListIdxInRoomPool(rootUid, parantUid);
            const idx = this.roomPool.length - 1;
            const roomIdList = this.roomPool[idx]
                .filter(room => room.sceneId === sceneId)
                .map(room => room.roomId);
            return roomIdList[(0, utils_2.random)(0, roomList.length - 1)];
        }
        throw new Error(`房间动态管理类 | 未查询到可用的房间号`);
        return null;
    }
    subFileterConditionalRoom(roomInfo, player) {
        const subRoomList = [];
        if (this.type === RoomType.Br &&
            this.checkRoomRulesForPlayer(roomInfo, player)) {
            subRoomList.push(roomInfo);
        }
        else if (this.type === RoomType.battle) {
            if (!!roomInfo.getPlayer(player.uid)) {
                subRoomList.push(roomInfo);
            }
            const condition1 = this.checkRoomRulesForPlayer(roomInfo, player);
            const condition2 = roomInfo['status'] === "INWAIT";
            if (condition1 && condition2) {
                subRoomList.push(roomInfo);
            }
        }
        return subRoomList;
    }
    checkRoomRulesForPlayer(roomInfo, player) {
        if (roomInfo.getPlayer(player.uid)) {
            return true;
        }
        if (!["6"].includes(this.nid)) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER && this.type == RoomType.battle) {
                if (roomInfo.players.some(c => !!c && c.isRobot == 0 && c.uid !== player.uid)) {
                    return false;
                }
            }
        }
        if (roomInfo.isFull()) {
            return false;
        }
        const ipSwitch = require("../../../../../config/data/ipSwitch.json");
        const isRestrictIP = ipSwitch && ipSwitch.open;
        if (!isRestrictIP) {
            return true;
        }
        return !(roomInfo.players.some(user => {
            return !!user && user.isRobot !== RoleEnum_1.RoleEnum.ROBOT && user.ip === player.ip && user.uid !== player.uid;
        }));
    }
    getRoomList(rootUid, parantUid) {
        rootUid = !!rootUid ? rootUid : "-1";
        parantUid = !!parantUid ? parantUid : "-1";
        if (!rootUid || rootUid === "") {
            const idxList = this.isolationPool["-1"]["-1"];
            return idxList.reduce((list, roomListIdx) => {
                this.roomPool[roomListIdx].map(roomInfo => {
                    list.push(roomInfo);
                });
                return list;
            }, []);
        }
        const idxList = this.isolationPool[rootUid][parantUid];
        return idxList.reduce((list, roomListIdx) => {
            this.roomPool[roomListIdx].map(roomInfo => {
                list.push(roomInfo);
            });
            return list;
        }, []);
    }
    beRoomAvailableInIsolationPool(rootUid, parantUid) {
        rootUid = !!rootUid ? rootUid : "-1";
        parantUid = !!parantUid ? parantUid : "-1";
        if (!rootUid || rootUid === "") {
            const flag = !!this.isolationPool["-1"] || !!this.isolationPool["-1"]["-1"];
            if (flag) {
                if (this.isolationPool["-1"]["-1"].length === 0) {
                    this.dynamicIncreaseRoom();
                    this.updateTenantRoomSituation();
                    this.addRoomListIdxInRoomPool("-1", "-1");
                }
            }
            return true;
        }
        if (!this.isolationPool[rootUid] || !this.isolationPool[rootUid][parantUid]) {
            this.dynamicIncreaseRoom();
            this.updateTenantRoomSituation();
            this.addRoomListIdxInRoomPool(rootUid, parantUid);
            return true;
        }
        if (this.isolationPool[rootUid][parantUid].length === 0) {
            let notHadRoomInfoForRoomListIdx = this.roomPool.findIndex(roomList => roomList.length === 0);
            this.dynamicIncreaseRoom();
            this.updateTenantRoomSituation();
            this.addRoomListIdxInRoomPool(rootUid, parantUid, notHadRoomInfoForRoomListIdx);
        }
        return true;
    }
    addRoomListIdxInRoomPool(rootUid, parantUid, roomListIdx = -1) {
        if (!this.isolationPool[rootUid]) {
            this.isolationPool[rootUid] = {};
        }
        if (!this.isolationPool[rootUid][parantUid]) {
            this.isolationPool[rootUid][parantUid] = [];
        }
        if (roomListIdx < 0) {
            const roomListIdx = this.roomPool.length - 1;
            this.isolationPool[rootUid][parantUid].push(roomListIdx);
        }
        else {
            this.isolationPool[rootUid][parantUid].push(roomListIdx);
        }
    }
    async entryRoomInIsolationPool(rootUid, parantUid, roomId) {
        rootUid = !!rootUid ? rootUid : "-1";
        parantUid = !!parantUid ? parantUid : "-1";
        const playerNum = await IsolationRoomPool_redis_dao_1.default.findOneByRootUidAndParantUid(rootUid, parantUid, this.serverId);
        await IsolationRoomPool_redis_dao_1.default.increaseByRootUidAndParantUid(rootUid, parantUid, this.serverId);
        this.updateTenantRoomSituation();
        if (playerNum === 0) {
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 该代理玩家数从无到有，检测是否有房间销毁任务正在执行`);
            const HadDestoryTask = this.checkDestroyTask(rootUid, parantUid);
            if (HadDestoryTask) {
                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 该代理有房间销毁任务`);
                clearTimeout(this.timerPool[rootUid][parantUid]);
                this.timerPool[rootUid][parantUid] = null;
                delete this.timerPool[rootUid][parantUid];
                delete this.timerPool[rootUid];
                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 该代理有房间销毁任务 | 已销毁延迟期任务`);
            }
        }
    }
    async leaveRoomInIsolationPool(rootUid, parantUid, roomId = "-1") {
        rootUid = !!rootUid ? rootUid : "-1";
        parantUid = !!parantUid ? parantUid : "-1";
        const playerNum = await IsolationRoomPool_redis_dao_1.default.findOneByRootUidAndParantUid(rootUid, parantUid, this.serverId);
        if (playerNum >= 1)
            await IsolationRoomPool_redis_dao_1.default.decreaseByRootUidAndParantUid(rootUid, parantUid, this.serverId);
        if (playerNum <= 1) {
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 开始   `);
            if (roomId !== "-1") {
                const roomInfo = this.getRoomInfo(roomId);
                const realPlayerList = roomInfo.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER);
                if (this.nid === "17") {
                    const p = realPlayerList.filter(p => p.role !== BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Dealer);
                    if (p.length === 0 && !roomInfo.canBeDestroy) {
                        roomInfo.canBeDestroy = true;
                    }
                }
                else if (realPlayerList.length === 0 && !roomInfo.canBeDestroy) {
                    roomInfo.canBeDestroy = true;
                }
            }
            else {
                const roomListIdx = this.isolationPool[rootUid][parantUid];
                roomListIdx.forEach(idx => {
                    const roomList = this.roomPool[idx];
                    roomList.forEach((roomInfo, i) => {
                        const realPlayerList = roomInfo.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER);
                        if (this.nid === "17") {
                            const p = realPlayerList.filter(p => p.role !== BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Dealer);
                            if (p.length === 0 && !roomInfo.canBeDestroy) {
                                roomInfo.canBeDestroy = true;
                            }
                        }
                        else if (realPlayerList.length === 0 && !roomInfo.canBeDestroy) {
                            roomInfo.canBeDestroy = true;
                        }
                    });
                });
            }
            if (!!this.timerPool[rootUid] && !!this.timerPool[rootUid][parantUid]) {
                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 已有任务正在执行`);
                return;
            }
            if (!this.timerPool[rootUid]) {
                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 添加平台编号`);
                this.timerPool[rootUid] = {};
            }
            if (!this.timerPool[rootUid][parantUid]) {
                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 添加分代编号`);
                this.timerPool[rootUid][parantUid] = setTimeout(() => {
                    this.destroyRoomTask(rootUid, parantUid);
                }, this.desestroyTime);
            }
        }
    }
    checkDestroyTask(rootUid, parantUid) {
        if (!this.timerPool[rootUid] || !this.timerPool[rootUid][parantUid]) {
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 该代理没有房间销毁任务`);
            return false;
        }
        return true;
    }
    destroyRoomTask(rootUid, parantUid) {
        const idxList = this.isolationPool[rootUid][parantUid];
        const listLen = idxList.length;
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 有 ${listLen} 组房间正在运行`);
        let taskFlag = false;
        for (let i = 0; i < idxList.length; i++) {
            const roomIdx = idxList[i];
            const roomList = this.roomPool[roomIdx];
            if (roomList.length === 0) {
                if (this.isolationPool[rootUid][parantUid].includes(roomIdx)) {
                    this.isolationPool[rootUid][parantUid] = this.isolationPool[rootUid][parantUid].filter(v => v !== roomIdx);
                }
                else {
                    this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 房间组下标 ${roomIdx} | 房间组为空 | 异常情况，应清理 isolationPool 标识位而未清理`, "error");
                }
                continue;
            }
            const canBeDestroy = roomList.every(roomInfo => roomInfo.canBeDestroy);
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 房间组下标 ${roomIdx} | 可销毁状态 ${canBeDestroy ? "是" : "否"}`);
            if (canBeDestroy) {
                taskFlag = true;
                roomList.forEach((roomInfo, i) => {
                    const { roomId, sceneId, players } = roomInfo;
                    roomInfo.destroy();
                    const channelName = `${this.gameName}${sceneId}${roomId}`;
                    pinus_1.pinus.app.channelService.destroyChannel(`${channelName}`);
                    pinus_1.pinus.app.channelService.destroyChannel(`${channelName}Bet`);
                    !!roomInfo.event && roomInfo.event.removeAllListeners();
                    this.roomPool[roomIdx][i] = null;
                });
                this.roomPool[roomIdx] = [];
                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 房间组下标 ${roomIdx} | 房间销毁完成`);
                this.isolationPool[rootUid][parantUid][i] = null;
            }
        }
        if (taskFlag) {
            this.isolationPool[rootUid][parantUid] = this.isolationPool[rootUid][parantUid].filter(value => typeof value === "number");
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 完成房间清理任务`);
            this.clearTimerPoolAfterDestroyRoom(rootUid, parantUid);
            this.updateTenantRoomSituation();
        }
        else {
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 未完成房间清理任务 | 房间销毁状态没变，进入下一次销毁任务`);
            if (!rootUid || !parantUid) {
                return;
            }
            if (!this.timerPool[rootUid]) {
                this.timerPool[rootUid] = {};
            }
            if (this.timerPool[rootUid][parantUid]) {
                clearTimeout(this.timerPool[rootUid][parantUid]);
            }
            this.timerPool[rootUid][parantUid] = setTimeout(() => {
                this.destroyRoomTask(rootUid, parantUid);
            }, this.desestroyTime);
        }
    }
    async clearTimerPoolAfterDestroyRoom(rootUid, parantUid) {
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 定时器后置清理任务`);
        const idxList = this.isolationPool[rootUid][parantUid];
        const listLen = idxList.length;
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 定时器后置清理任务 | 还有 ${listLen} 组房间`);
        if (!!this.timerPool[rootUid] && !!this.timerPool[rootUid][parantUid]) {
            clearTimeout(this.timerPool[rootUid][parantUid]);
            this.timerPool[rootUid][parantUid] = null;
        }
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 定时器后置清理任务 | 清理定时器 | 完成`);
        if (!!this.timerPool[rootUid] && !!this.timerPool[rootUid][parantUid])
            delete this.timerPool[rootUid][parantUid];
        if (!!this.timerPool[rootUid])
            delete this.timerPool[rootUid];
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 定时器后置清理任务 | 清理timerPool | 完成`);
    }
    changDesestroyTime(time) {
        this.desestroyTime = time;
        return this;
    }
    async updateTenantRoomSituation() {
        const running = Object.keys(this.isolationPool)
            .reduce((num, platform, idx) => {
            const lineCodeList = Object.keys(this.isolationPool[platform]);
            lineCodeList.forEach(lineCode => {
                const len = this.isolationPool[platform][lineCode].length;
                if (len > 0) {
                    num += len;
                }
            });
            return num;
        }, 0);
        const idleRoomCodeCount = this.roomPool.reduce((idleRoomCodeCount, list) => {
            if (list.length > 0) {
                ++idleRoomCodeCount;
            }
            return idleRoomCodeCount;
        }, 0);
        await ShareTenantRoomSituation_redis_dao_1.default.insertOne(this.nid, JSON.stringify({
            running,
            idle: idleRoomCodeCount - running,
            memory: process.memoryUsage(),
            idleRoomCodeCount: idleRoomCodeCount,
        }));
    }
}
exports.IDynamicRoomManager = IDynamicRoomManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSUR5bmFtaWNSb29tTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vcG9qby9iYXNlQ2xhc3MvRHluYW1pY1Jvb20vSUR5bmFtaWNSb29tTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNQSxpQ0FBc0M7QUFDdEMsK0NBQXlDO0FBSXpDLDZDQUFnRDtBQUNoRCx1REFBb0Q7QUFDcEQseURBQXNEO0FBRXRELGdFQUE2RDtBQUM3RCw2Q0FBMkM7QUFDM0MsNEdBQXlHO0FBQ3pHLHVFQUFrRTtBQUNsRSx5RUFBb0U7QUFDcEUsZ0dBQXVGO0FBQ3ZGLDhHQUFxRztBQUVyRyxNQUFNLHdCQUF3QixHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FDN0MsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQVFyRCxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQWtCLEVBQUUsSUFBWSxFQUFFLEVBQUUsQ0FDL0MsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUMxRCxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FDdkMsQ0FBQztBQUtOLElBQVksUUFLWDtBQUxELFdBQVksUUFBUTtJQUVoQiwyQ0FBTSxDQUFBO0lBRU4sbUNBQUUsQ0FBQTtBQUNOLENBQUMsRUFMVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFB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