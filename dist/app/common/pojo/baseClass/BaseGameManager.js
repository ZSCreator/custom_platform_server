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
exports.BaseGameManager = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)("server_out", __filename);
const utils_1 = require("../../../utils");
const ServerMaxNumberPlayersDao = require("../../dao/redis/ServerMaxNumberPlayersDao");
const ServerCurrentNumbersPlayersDao = require("../../dao/redis/ServerCurrentNumbersPlayersDao");
const Game_manager_1 = require("../../dao/daoManager/Game.manager");
const Scene_manager_1 = require("../../dao/daoManager/Scene.manager");
const Room_manager_1 = require("../../dao/daoManager/Room.manager");
const SystemRoomBuilder_1 = require("../entity/SystemRoomBuilder");
const SystemRoomDirector_1 = require("../entity/SystemRoomDirector");
const initializeArrayWithRange = (len) => Array.from({ length: len }).map((v, i) => i + 1);
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
class BaseGameManager {
    constructor() {
        this.sceneCount = 1;
        this.roomUserLimit = 1;
        this.sceneList = [];
        this.kind = 1;
    }
    setGameInfo(name, count, whetherToShowScene, whetherToShowGamingInfo = false) {
        this.gameName = name;
        this.roomCount = count;
        this.whetherToShowScene = whetherToShowScene;
        this.whetherToShowGamingInfo = whetherToShowGamingInfo;
    }
    async init() {
        this.serverId = pinus_1.pinus.app.getServerId();
        logger.info(`服务器 ${this.serverId} | 初始化 | 开始`);
        if (typeof this.nid !== "string") {
            logger.error(`服务器 ${this.serverId} | 初始化 | 出错 :传入 nid 异常:${this.nid} `);
            throw new Error(`服务器 ${this.serverId} 初始化场或房间出错,传入 nid 异常:${this.nid} `);
        }
        const gameInfo = await Game_manager_1.default.findOne({ nid: this.nid }, true);
        await this.resetServerCurrentNumberPlayers();
        if (!gameInfo) {
            if (this.serverId.split("").reverse()[0] !== "1") {
                return;
            }
            logger.info(`服务器 ${this.serverId} | 初始化 | 检测 表 system_game 信息 | 数据库 Mongodb 和 Redis 未查询到 nid:${this.nid} 信息 | 开始从 json 读取初始信息`);
            await this._initSystemGame();
            logger.info(`服务器 ${this.serverId} | 初始化 | 表 system_scene :${this.nid} 名称:${this.gameName} | 开始 `);
            await this._initSystemScene();
            await this._initSystemRoom();
            await this.initServerMaxNumberPlayers();
            await this.resetServerCurrentNumberPlayers();
            return;
        }
        const { name, roomCount, whetherToShowScene, roomUserLimit, whetherToShowGamingInfo, } = gameInfo;
        this.roomUserLimit = roomUserLimit;
        this.setGameInfo(name, roomCount, whetherToShowScene, whetherToShowGamingInfo);
    }
    async _initSystemGame() {
        try {
            const gamesJson = require("../../../../config/data/games.json");
            const targetGameJson = gamesJson.find(({ nid }) => nid === this.nid);
            if (!targetGameJson) {
                logger.error(`服务器 ${this.serverId} | 初始化 | 检测 games.json 配置信息 |  未查询到 nid:${this.nid} 配置信息 |system_game 初始化终止`);
                throw new Error(`${this.serverId} games.json 缺少 nid:${this.nid} 的配置信息`);
            }
            const { name, roomCount, whetherToShowGamingInfo, whetherToShowScene, roomUserLimit, } = await Game_manager_1.default.insertOne(targetGameJson);
            if (!roomCount || !roomUserLimit) {
                throw new Error(`games.json 游戏nid: ${this.nid} 参数 roomCount 或 roomUserLimit 缺失`);
            }
            this.kind = targetGameJson.kind || 1;
            this.roomUserLimit = roomUserLimit;
            this.setGameInfo(name, roomCount, whetherToShowScene, whetherToShowGamingInfo);
            logger.info(`服务器 ${this.serverId} | 初始化 | 表 system_game :${this.nid} 名称:${this.gameName} | 完成 `);
        }
        catch (e) {
            logger.error(`gameManager.initSystemGame() 错误: ${e.stack}`);
        }
    }
    async _initSystemScene() {
        var e_1, _a;
        const sceneJsonList = require(`../../../../config/data/scenes/${this.gameName}.json`);
        if (!sceneJsonList) {
            throw new Error(`${this.serverId} 配置文件 config/scenes/${this.gameName}.json 未查询到 ${this.gameName} 场配置信息 | 初始化终止`);
        }
        this.sceneList = sceneJsonList;
        try {
            for (var sceneJsonList_1 = __asyncValues(sceneJsonList), sceneJsonList_1_1; sceneJsonList_1_1 = await sceneJsonList_1.next(), !sceneJsonList_1_1.done;) {
                const info = sceneJsonList_1_1.value;
                const { id: sceneId } = info, rest = __rest(info, ["id"]);
                await Scene_manager_1.default.insertOne(Object.assign({ sceneId }, rest));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (sceneJsonList_1_1 && !sceneJsonList_1_1.done && (_a = sceneJsonList_1.return)) await _a.call(sceneJsonList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        logger.info(`服务器 ${this.serverId} | 初始化 | 表 system_scene :${this.nid} 名称:${this.gameName} | 完成 `);
    }
    async _initSystemRoom() {
        const sceneList = require(`../../../../config/data/scenes/${this.gameName}.json`);
        this.sceneCount = this.whetherToShowScene ? sceneList.length : 1;
        const maxRoomCount = this.sceneCount * this.roomCount * this.kind;
        if (typeof maxRoomCount !== "number" && maxRoomCount === 0) {
            throw new Error(`${this.serverId} 初始化房间出错， 场数量 ${this.sceneCount} | 游戏房间配置数字 roomCount:${this.roomCount} | 总房间数 :${maxRoomCount}`);
        }
        const maxRoomList = initializeArrayWithRange(maxRoomCount).map((v) => (0, utils_1.pad)(v, 3));
        const serverRoomList = chunk(maxRoomList, this.sceneCount * this.roomCount);
        for (let idx = 0; idx < this.kind; idx++) {
            const curServerRoomIdList = serverRoomList[idx];
            logger.info(`服务器 ${pinus_1.pinus.app.getServerId()} | 初始化 | 表 system_room :${this.nid} 名称:${this.gameName} | 场数量: ${this.sceneCount} | 房间数: ${this.roomCount} | 需要创建房间总数: ${maxRoomList.length} | 当前服务器:${this.serverId} 承载房间名称: ${curServerRoomIdList.join(" ")}`);
            const curSceneRoomIdList = chunk(curServerRoomIdList, this.roomCount);
            for (let index = 0; index < sceneList.length; index++) {
                const { id } = sceneList[index];
                const roomList = curSceneRoomIdList[index];
                for (let i = 0; i < roomList.length; i++) {
                    const roomId = roomList[i];
                    const roomBuilder = new SystemRoomBuilder_1.SystemRoomBuilder(this.nid, roomId);
                    const roomDirector = new SystemRoomDirector_1.SystemRoomDirector(roomBuilder);
                    const roomInstance = roomDirector._getRoom(this.serverId, id);
                    roomInstance.createTime = new Date();
                    roomInstance["kind"] = idx;
                    await Room_manager_1.default.insertOne(roomInstance);
                }
            }
            logger.info(`服务器 ${pinus_1.pinus.app.getServerId()} | 初始化 | 表 system_room :${this.nid} 名称:${this.gameName} | 完成 `);
        }
    }
    async initServerMaxNumberPlayers() {
        try {
            const maxNumberPlayers = this.sceneCount * this.roomCount * this.roomUserLimit;
            await ServerMaxNumberPlayersDao.insertOneByServerId(maxNumberPlayers, this.serverId);
            logger.info(` 初始化 | 表 cluster:maxNumberPlayers : ${maxNumberPlayers} | 完成 `);
        }
        catch (e) {
            logger.error(`服务器 ${pinus_1.pinus.app.getServerId()} | 初始化 | 表 cluster:maxNumberPlayers  | 出错: ${e.stack} `);
        }
    }
    async resetServerCurrentNumberPlayers() {
        try {
            console.warn(`重置当前服务器人数 ${this.serverId}`);
            await ServerCurrentNumbersPlayersDao.resetByServerId(this.serverId);
            logger.info(`服务器 ${this.serverId} | 重置在线玩家数 | 键 cluster:currentNumberPlayers  | nid:${this.nid} | 完成`);
        }
        catch (e) {
            logger.error(`服务器 ${pinus_1.pinus.app.getServerId()} | 重置在线玩家数 | 键 cluster:currentNumberPlayers  | nid:${this.nid} | 出错 :${e.stack}`);
        }
    }
}
exports.BaseGameManager = BaseGameManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZUdhbWVNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9wb2pvL2Jhc2VDbGFzcy9CYXNlR2FtZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQTBDO0FBSTFDLCtDQUF5QztBQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELDBDQUFxQztBQUNyQyx1RkFBdUY7QUFDdkYsaUdBQWlHO0FBR2pHLG9FQUErRDtBQUMvRCxzRUFBaUU7QUFDakUsb0VBQStEO0FBRS9ELG1FQUFnRTtBQUNoRSxxRUFBa0U7QUFHbEUsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQy9DLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFbkQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFrQixFQUFFLElBQVksRUFBRSxFQUFFLENBQ2pELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FDNUQsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQ3JDLENBQUM7QUFLSixNQUFhLGVBQWU7SUFBNUI7UUFnQlUsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUUxQixjQUFTLEdBQWEs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