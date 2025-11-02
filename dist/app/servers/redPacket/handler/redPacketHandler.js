"use strict";
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
exports.RedPacketHandler = void 0;
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const ApiResultDTO_1 = require("../../../common/pojo/dto/ApiResultDTO");
const GameStatusEnum_1 = require("../lib/enum/GameStatusEnum");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const RedPacketGameStatusEnum_1 = require("../lib/enum/RedPacketGameStatusEnum");
const ChannelEventEnum_1 = require("../lib/enum/ChannelEventEnum");
const sessionService = require("../../../services/sessionService");
const ApiResult_1 = require("../../../common/pojo/ApiResult");
const langsrv = require("../../../services/common/langsrv");
const PlayerGameStatusEnum_1 = require("../lib/enum/PlayerGameStatusEnum");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const RedPacketTenantRoomManager_1 = require("../lib/RedPacketTenantRoomManager");
function default_1(app) {
    return new RedPacketHandler(app);
}
exports.default = default_1;
function check(sceneId, roomId, uid) {
    const roomInfo = RedPacketTenantRoomManager_1.default.searchRoom(sceneId, roomId);
    if (!roomInfo)
        return { err: '房间不存在' };
    const player = roomInfo.getPlayer(uid);
    if (!player)
        return { err: '玩家不存在' };
    player.update_time();
    return { roomInfo, player };
}
class RedPacketHandler {
    constructor(app) {
        this.app = app;
        this.app = app;
        this.logger = logger;
    }
    async loaded({}, session) {
        let apiResult = new ApiResultDTO_1.default();
        let language = null;
        const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
        try {
            const { err, roomInfo, player: currPlayer } = check(sceneId, roomId, uid);
            if (err) {
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_1201);
                this.logger.warn(`红包扫雷|加载游戏|用户:${uid}|加载场:${sceneId},房间号:${roomId}|异常分支:${err}`);
            }
            if (!err)
                language = currPlayer.language;
            if (apiResult['msg'].length === 0) {
                const player = currPlayer.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER ?
                    await Player_manager_1.default.findOne({ uid }, false) :
                    roomInfo.getPlayer(uid);
                const offline = currPlayer.onLine ? roomInfo.getOffLineData(currPlayer) : undefined;
                const handOutRedPacket = roomInfo.redPackQueue && roomInfo.redPackQueue.length > 0 && roomInfo.redPackQueue[0].status === RedPacketGameStatusEnum_1.RedPacketGameStatusEnum.GAME ? roomInfo.redPackQueue[0] : {};
                if (Object.keys(handOutRedPacket).length > 0) {
                    const playerInRoom = roomInfo.getPlayer(player.uid);
                    Object.assign(handOutRedPacket, { headurl: playerInRoom.headurl, });
                }
                currPlayer.gold = player.gold;
                return {
                    code: 200,
                    handOutRedPacket,
                    redPackQueue: roomInfo.redPackQueue,
                    room: roomInfo.getCurrentInformationAboutRoom(),
                    currentPlayer: {
                        uid,
                        gold: player.gold,
                        gain: currPlayer.gain,
                        nickname: currPlayer.nickname,
                        headurl: currPlayer.headurl,
                        status: currPlayer.status
                    },
                    playerList: roomInfo.currentGraberQueue.filter(graber => graber.hasGrabed).map(({ grabUid: uid, gold, nickname, headurl }) => ({ uid, gold, nickname, headurl })),
                    offLine: offline,
                    sceneId: roomInfo.sceneId,
                    roundId: roomInfo.roundId,
                    redParketNum: roomInfo.redParketNum,
                    playerCount: roomInfo.players.length
                };
            }
        }
        catch (e) {
            this.logger.error(`红包扫雷|加载出错|房间:${roomId}|场:${sceneId}|用户:${uid}|`, e);
            apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_1201);
        }
        return apiResult;
    }
    async grabRedPacket({}, session) {
        let apiResult = new ApiResultDTO_1.default();
        const { uid, roomId, sceneId, isRobot } = sessionService.sessionInfo(session);
        let language = null;
        try {
            const { err, roomInfo, player } = check(sceneId, roomId, uid);
            if (err) {
                if (isRobot === RoleEnum_1.RoleEnum.ROBOT) {
                    return ApiResult_1.ApiResult.SUCCESS();
                }
                this.logger.error('红包扫雷|抢红包|获取用户信息出错', err);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8100);
                return apiResult;
            }
            language = player.language;
            if (roomInfo.status !== GameStatusEnum_1.GameStatusEnum.READY) {
                player.isRobot === 0 && this.logger.warn(`红包扫雷|抢红包失败|房间当前状态不能抢红包|room status:${roomInfo.status}`);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8101);
                return apiResult;
            }
            if (roomInfo.redPackQueue.length === 0) {
                player.isRobot === 0 && this.logger.warn(`红包扫雷|抢红包失败|红包队列为空:${roomInfo.redPackQueue.length}`);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8102);
                return apiResult;
            }
            if (roomInfo.currentGraberQueue.filter(redPacketInfo => redPacketInfo.hasGrabed).length === roomInfo.sceneInfo.redParketNum) {
                player.isRobot === 0 && this.logger.info(`红包扫雷|抢红包失败|红包已抢完，请等待下一局|用户:${player.uid}`);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8103);
                return apiResult;
            }
            if (roomInfo.currentGraberQueue.filter(redPacketInfo => redPacketInfo.grabUid === uid).length > 0) {
                player.isRobot === 0 && this.logger.info(`红包扫雷|抢红包失败|已抢得红包，不可再抢|用户:${player.uid}`);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8100);
                return apiResult;
            }
            if (roomInfo.status === GameStatusEnum_1.GameStatusEnum.READY && roomInfo.tmp_countDown <= 0) {
                this.logger.info(`红包扫雷|抢红包失败|抢红包超时|用户id:${player.uid}`);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8104);
                return apiResult;
            }
            const currentPlayer = player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER ?
                await Player_manager_1.default.findOne({ uid }, false) :
                roomInfo.getPlayer(uid);
            if (roomInfo.redPackQueue[0].amount * roomInfo.sceneInfo.lossRation > currentPlayer.gold) {
                this.logger.info(`红包扫雷|抢红包失败|用户金额不足赔付|红包金额:${roomInfo.redPackQueue[0].amount}|赔率:${roomInfo.sceneInfo.lossRation}|用户金额:${player.gold}`);
                sceneId === 0 ?
                    apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8105) :
                    apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8117);
                return apiResult;
            }
            if (currentPlayer.isRobot === 2 && roomInfo.allowedRobotGrab()) {
                apiResult.code = 81001;
                apiResult['msg'] = '机器人:不超过可抢最大数 - 抢红包失败';
                return apiResult;
            }
            const apiResultOrBoolean = await roomInfo.grabRedPacket(player.uid);
            if (apiResultOrBoolean instanceof ApiResult_1.ApiResult) {
                return apiResultOrBoolean;
            }
            const redPacketIdx = roomInfo.currentGraberQueue.findIndex(graberRedPacket => graberRedPacket.grabUid === player.uid);
            const result = roomInfo.currentGraberQueue
                .filter(graberRedPacketInfo => graberRedPacketInfo.hasGrabed)
                .map(redPacketInfo => {
                const { grabUid, redPacketAmount, nickname, grabTime, headurl } = redPacketInfo, rest = __rest(redPacketInfo, ["grabUid", "redPacketAmount", "nickname", "grabTime", "headurl"]);
                return {
                    uid: grabUid,
                    headurl,
                    nickname,
                    grabTime,
                };
            })
                .sort((a, b) => a.grabTime - b.grabTime);
            roomInfo.channelIsPlayer(ChannelEventEnum_1.ChannelEventEnum.grab, {
                result
            });
            let _a = roomInfo.currentGraberQueue[redPacketIdx], { redPacketAmount } = _a, res = __rest(_a, ["redPacketAmount"]);
            return Object.assign({ code: 200, redPacketAmount }, res);
        }
        catch (e) {
            this.logger.error(`红包扫雷|抢红包|房间:${roomId}|场:${sceneId}|用户:${uid}|出错:`, e);
            apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8100);
            return apiResult;
        }
    }
    async applyForHandOutRedPacket({}, session) {
        let apiResult = new ApiResultDTO_1.default();
        const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
        let language = null;
        try {
            const { err, roomInfo, player } = check(sceneId, roomId, uid);
            if (err) {
                this.logger.error('红包扫雷|申请发红包|获取用户信息|出错:', err);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8106);
                return apiResult;
            }
            language = player.language;
            if (roomInfo.status === GameStatusEnum_1.GameStatusEnum.NONE) {
                this.logger.warn(`红包扫雷|发红包|房间 ${roomId} 状态异常|用户${uid}|发红包时还未处于为运行状态`);
                roomInfo.changeGameStatues(GameStatusEnum_1.GameStatusEnum.WAIT);
                roomInfo.init();
                roomInfo.run();
            }
            return {
                code: 200,
                redPacketList: roomInfo.redPackQueue
            };
        }
        catch (e) {
            this.logger.error(`红包扫雷|申请发红包|房间:${roomId}|场:${sceneId}|用户:${uid}|出错:`, e);
            apiResult.msg = langsrv.getlanguage(language, langsrv.Net_Message.id_8107);
        }
        return apiResult;
    }
    async handOutRedPacket({ amount, mineNumber }, session) {
        let apiResult = new ApiResultDTO_1.default();
        const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
        let language = null;
        try {
            amount = parseFloat(amount);
            mineNumber = parseInt(mineNumber);
            if (!Number.isInteger(amount) || !Number.isInteger(mineNumber) || amount <= 0) {
                this.logger.warn(`红包扫雷|发红包|前端传入参数异常:amount:${amount},mineNumber:${mineNumber}`);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8106);
                return apiResult;
            }
            const { err, roomInfo, player } = check(sceneId, roomId, uid);
            if (err) {
                if (err !== "玩家不存在")
                    this.logger.error('红包扫雷|发红包|获取用户信息|出错:', err);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8106);
                return apiResult;
            }
            language = player.language;
            const isRobot = player.isRobot === 2;
            if (roomInfo.status === GameStatusEnum_1.GameStatusEnum.NONE) {
                this.logger.warn(`红包扫雷|发红包|房间 ${roomId} 状态异常|${isRobot ? '机器人' : '用户'}${uid}|发红包时还未处于为运行状态`);
                roomInfo.changeGameStatues(GameStatusEnum_1.GameStatusEnum.WAIT);
                roomInfo.init();
                roomInfo.run();
            }
            if (roomInfo.redPackQueue.findIndex(redPacketInfo => redPacketInfo.owner_uid === player.uid) >= 0) {
                this.logger.info(`红包扫雷|发红包|${isRobot ? '机器人' : '用户'}:${player.uid}|金额:${amount}|雷号:${mineNumber}|异常分支:同一时间同个红包队列能发一个红包。`);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8108);
                return apiResult;
            }
            if (player.status === PlayerGameStatusEnum_1.PlayerGameStatusEnum.GAME) {
                const curPlayer = roomInfo.currentGraberQueue.find(({ grabUid }) => grabUid === player.uid);
                if (curPlayer && curPlayer.isStepInMine && roomInfo.redPackQueue[0].amount + (isRobot ? amount : amount * 100) > player.gold) {
                    this.logger.warn(`红包扫雷|发红包失败|${isRobot ? '机器人' : '用户'}金额不足|红包金额:${isRobot ? amount : amount * 100}|用户金额:${player.gold}`);
                    apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8109);
                    return apiResult;
                }
            }
            if (amount > player.gold) {
                this.logger.warn(`红包扫雷|发红包失败|${isRobot ? '机器人' : '用户'}金额不足|红包金额:${amount}|用户金额:${player.gold}`);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8109);
                return apiResult;
            }
            amount = isRobot ? amount : amount * 100;
            const redPackQueue = roomInfo.handOutRedPacket(player.uid, amount, mineNumber);
            return {
                code: 200,
                redPacketList: redPackQueue
            };
        }
        catch (e) {
            this.logger.error(`红包扫雷|发红包|房间:${roomId}|场:${sceneId}|用户:${uid}|出错:`, e);
        }
        return apiResult;
    }
    async cancelHandOutRedPacket({}, session) {
        let apiResult = new ApiResultDTO_1.default();
        const { uid, roomId, sceneId } = sessionService.sessionInfo(session);
        let language = null;
        try {
            const { err, roomInfo, player } = check(sceneId, roomId, uid);
            if (err) {
                this.logger.error('红包扫雷|发红包|获取用户信息|出错:', err);
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_8110);
                return apiResult;
            }
            language = player.language;
            if (roomInfo.status === GameStatusEnum_1.GameStatusEnum.NONE) {
                this.logger.warn(`红包扫雷|取消发红包|房间 ${roomId} 状态异常|用户${uid}|发红包时还未处于为运行状态`);
                roomInfo.changeGameStatues(GameStatusEnum_1.GameStatusEnum.WAIT);
                roomInfo.init();
                roomInfo.run();
            }
            const redPacketList = roomInfo.redPackQueue.filter(redPacket => redPacket.owner_uid === player.uid);
            if (redPacketList[0].status === RedPacketGameStatusEnum_1.RedPacketGameStatusEnum.GAME) {
                apiResult.msg = langsrv.getlanguage(language, langsrv.Net_Message.id_8111);
                return apiResult;
            }
            roomInfo.cancelHandOutRedPacket(player.uid);
            apiResult.code = 200;
        }
        catch (e) {
            this.logger.error(`红包扫雷|取消发红包|房间:${roomId}|场:${sceneId}|用户:${uid}|出错:`, e);
        }
        return apiResult;
    }
}
exports.RedPacketHandler = RedPacketHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkUGFja2V0SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3JlZFBhY2tldC9oYW5kbGVyL3JlZFBhY2tldEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFDQSwrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNuRCx3RUFBaUU7QUFDakUsK0RBQTREO0FBRTVELGtGQUE2RTtBQUM3RSxpRkFBOEU7QUFDOUUsbUVBQWdFO0FBQ2hFLG1FQUFvRTtBQUNwRSw4REFBMkQ7QUFDM0QsNERBQTZEO0FBQzdELDJFQUF3RTtBQUN4RSx1RUFBb0U7QUFFcEUsa0ZBQTREO0FBRTVELG1CQUF5QixHQUFnQjtJQUN2QyxPQUFPLElBQUksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUZELDRCQUVDO0FBRUQsU0FBUyxLQUFLLENBQUMsT0FBZSxFQUFFLE1BQWMsRUFBRSxHQUFXO0lBQ3pELE1BQU0sUUFBUSxHQUFHLG9DQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUMsUUFBUTtRQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDdkMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2QyxJQUFJLENBQUMsTUFBTTtRQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDckMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDOUIsQ0FBQztBQUVELE1BQWEsZ0JBQWdCO0lBSTNCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxH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