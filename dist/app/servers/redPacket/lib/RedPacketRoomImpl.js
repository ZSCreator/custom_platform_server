"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const GameStatusEnum_1 = require("./enum/GameStatusEnum");
const PlayerGameStatusEnum_1 = require("./enum/PlayerGameStatusEnum");
const StateNoneAction_1 = require("./expansion/roomExpansion/StateNoneAction");
const StateWaitAction_1 = require("./expansion/roomExpansion/StateWaitAction");
const StateReadyAction_1 = require("./expansion/roomExpansion/StateReadyAction");
const StateGameAction_1 = require("./expansion/roomExpansion/StateGameAction");
const StateEndAction_1 = require("./expansion/roomExpansion/StateEndAction");
const ChannelForPlayerAction_1 = require("./expansion/channelExpansion/ChannelForPlayerAction");
const ChannelForRobotAction_1 = require("./expansion/channelExpansion/ChannelForRobotAction");
const RedPacketPlayerImpl_1 = require("./RedPacketPlayerImpl");
const RedPacketGameStatusEnum_1 = require("./enum/RedPacketGameStatusEnum");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const utils = require("../../../utils/index");
const ChannelEventEnum_1 = require("./enum/ChannelEventEnum");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const redPacketControl_1 = require("./redPacketControl");
const GameCommission_manager_1 = require("../../../common/dao/daoManager/GameCommission.manager");
const moment = require("moment");
const MessageService_1 = require("../../../services/MessageService");
const langsrv = require("../../../services/common/langsrv");
const apiResultDTO_1 = require("../../../common/classes/apiResultDTO");
const logger = (0, pinus_1.getLogger)("server_out", __filename);
class RedPacketRoomImpl extends SystemRoom_1.SystemRoom {
    constructor(opt, roomManager) {
        super(opt);
        this.robotGrabRedPacketMax = 8;
        this.robotGrabRedPacketMin = 3;
        this.robotGrabRedPacketLimit = 0;
        this.robotGrabRedPacketCount = 0;
        this.roundTimes = 1;
        this.status = GameStatusEnum_1.GameStatusEnum.NONE;
        this.totalAmount = 0;
        this.waitCountDown = 5000;
        this.grabCountDown = 4000;
        this.settleCountDown = 4000;
        this.opened = false;
        this.tmp_countDown = 0;
        this.process = false;
        this.hadRunning = false;
        this.baseCorrectedValue = 0.1;
        this.redPackQueue = [];
        this.currentCommissionBetRatio = 0;
        this.currentGraberQueue = [];
        this.players = [];
        this.zipResult = "";
        this.processInterval = null;
        this.timer = null;
        this.noneAction = new StateNoneAction_1.default(this);
        this.waitAction = new StateWaitAction_1.default(this);
        this.readyAction = new StateReadyAction_1.default(this);
        this.gameAction = new StateGameAction_1.default(this);
        this.endAction = new StateEndAction_1.default(this);
        this.channelForPlayerAction = new ChannelForPlayerAction_1.default(this);
        this.channelForRobotAction = new ChannelForRobotAction_1.default(this);
        const sceneList = require(`../../../../config/data/scenes/redPacket.json`);
        this.sceneInfo = sceneList.find(info => info.id === this.sceneId);
        this.redParketNum = opt["redParketNum"];
        this.control = new redPacketControl_1.default({ room: this });
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.grabPlayerSet = new Set();
        this.roomManager = roomManager;
    }
    async changeGameStatues(status) {
        try {
            this.status = status;
        }
        catch (e) {
            logger.error(`红包扫雷|改变房间状态|出错:${e.stack}`);
            this.status = status;
        }
    }
    changeStatusInRedPacketQueue(status) {
        this.redPackQueue[0].status = status;
    }
    findPlayerByUidInRoom(uid) {
        return this.players.find((playerInfo) => playerInfo && playerInfo.uid === uid);
    }
    async init() {
        this.process = true;
        const gameCommissionSetting = await GameCommission_manager_1.default.findOne({ nid: this.nid });
        if (gameCommissionSetting && gameCommissionSetting.open) {
            this.currentCommissionBetRatio = gameCommissionSetting.bet;
        }
        else {
            this.currentCommissionBetRatio = 0;
        }
        this.kickAllOffLinePlayer();
        this.updateRealPlayersNumber();
        this.updateRoundId();
        for (let player of this.players) {
            player.initGame();
        }
        this.totalAmount = 0;
        this.redPackQueue = [];
        this.currentGraberQueue = [];
        this.opened = true;
    }
    run() {
        if (!this.hadRunning) {
            this.lastCountDownTime = Date.now();
            this.hadRunning = !this.hadRunning;
        }
        this.processInterval = setInterval(() => this.gameProcess.apply(this), 1000);
    }
    async gameProcess() {
        try {
            if (!this.process)
                return;
            if (this.status !== GameStatusEnum_1.GameStatusEnum.NONE && this.tmp_countDown >= 0)
                this.tmp_countDown -= 1000;
            switch (this.status) {
                case GameStatusEnum_1.GameStatusEnum.NONE:
                    this.noneAction.startBefore();
                    break;
                case GameStatusEnum_1.GameStatusEnum.WAIT:
                    this.waitAction.initBeforeGame();
                    const isBeginingGrabFlag = this.waitAction.checkRedPacketQueue();
                    if (isBeginingGrabFlag) {
                        this.changeStatusInRedPacketQueue(RedPacketGameStatusEnum_1.RedPacketGameStatusEnum.GAME);
                        await this.gameAction.checkRedPacketListOnReady();
                        const handOutRedPacketUid = this.redPackQueue[0].owner_uid;
                        this.getPlayer(handOutRedPacketUid).changePlayerStatus(PlayerGameStatusEnum_1.PlayerGameStatusEnum.GAME);
                        this.players
                            .filter(p => p.status === PlayerGameStatusEnum_1.PlayerGameStatusEnum.GAME && p.uid !== handOutRedPacketUid)
                            .forEach(p => {
                            p.status = PlayerGameStatusEnum_1.PlayerGameStatusEnum.READY;
                            p.initControlType();
                        });
                        this.channelForRobotAction.graberRedPacketToAllRobot();
                        await this.changeGameStatues(GameStatusEnum_1.GameStatusEnum.READY);
                        this.tmp_countDown = this.grabCountDown;
                        this.startTime = Date.now();
                        this.channelForPlayerAction.roomReadyForGrabToAllPlayer();
                    }
                    break;
                case GameStatusEnum_1.GameStatusEnum.READY:
                    const hasGrabedFlag = this.readyAction.checkGrabRedPacketQueue();
                    if (!hasGrabedFlag) {
                        break;
                    }
                    await this.changeGameStatues(GameStatusEnum_1.GameStatusEnum.GAME);
                    this.readyAction.clearCountDown();
                case GameStatusEnum_1.GameStatusEnum.GAME:
                    if (!this.gameAction.canBeSettled())
                        break;
                    await this.changeGameStatues(GameStatusEnum_1.GameStatusEnum.END);
                    this.endTime = Date.now();
                    this.endAction.initSettleTime();
                case GameStatusEnum_1.GameStatusEnum.END:
                    this.process = false;
                    const settledResult = await this.endAction.settedCurrentGame2();
                    this.channelForPlayerAction.beInRedPacketQueueToPlayerInQueue();
                    this.redPackQueue.splice(0, 1);
                    this.channelForPlayerAction.redPacketQueueWithUpdateToAllPlayer();
                    await this.checkOffLinePlayersBeforeGaming();
                    this.channelForPlayerAction.afterSettledToAllPlayer(settledResult);
                    this.timer = setTimeout(() => {
                        this.channelForPlayerAction.gameOverToAllPlayer(true);
                        this.endAction.nextGameRound();
                    }, 1000);
                    this.updateRoundId();
                    await this.changeGameStatues(GameStatusEnum_1.GameStatusEnum.WAIT);
                    break;
            }
        }
        catch (e) {
            logger.error(`运行进程出错: ${e.stack}`);
        }
    }
    addPlayerInRoom(dbplayer) {
        const playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }
        if (this.isFull())
            return false;
        const newPlayer = new RedPacketPlayerImpl_1.default(dbplayer);
        newPlayer.onLine = true;
        this.players.push(newPlayer);
        this.addMessage(dbplayer);
        this.updateRealPlayersNumber();
        this.channelForPlayerAction.playerListWithUpdate(this.players.length);
        return true;
    }
    getOffLineData(player) {
        let data = { onLine: null, toResultBack: null };
        if (player.onLine) {
            data.onLine = player.onLine;
        }
        return data;
    }
    getCurrentInformationAboutRoom() {
        return {
            roomId: this.roomId,
            redPackQueue: this.redPackQueue,
            roomStatus: this.status,
            countDown: this.tmp_countDown,
        };
    }
    leaveRoom(uid, isOffLine) {
        if (isOffLine) {
            this.kickOutMessage(uid);
            this.getPlayer(uid).onLine = false;
            return;
        }
        if (this.redPackQueue.findIndex((redPacket) => redPacket.owner_uid === uid) === 0 && this.redPackQueue[0].status === RedPacketGameStatusEnum_1.RedPacketGameStatusEnum.GAME) {
            return langsrv.getlanguage(this.getPlayer(uid).language, langsrv.Net_Message.id_8112);
        }
        const grabQueueIdx = this.currentGraberQueue.findIndex((graber) => graber.grabUid === uid);
        if (grabQueueIdx >= 0 && this.redPackQueue[0] && this.redPackQueue[0].status === RedPacketGameStatusEnum_1.RedPacketGameStatusEnum.GAME) {
            return langsrv.getlanguage(this.getPlayer(uid).language, langsrv.Net_Message.id_8113);
        }
        if (this.redPackQueue.find((redPacket) => redPacket.owner_uid === uid)) {
            this.redPackQueue = this.redPackQueue.filter((redPacket) => redPacket.owner_uid !== uid);
            this.channelForPlayerAction.redPacketQueueWithUpdateToAllPlayer();
        }
        this.kickOutMessage(uid);
        this.updateRealPlayersNumber();
        this.channelForPlayerAction.playerListWithUpdate(this.players.length);
        if (isOffLine) {
            return;
        }
        utils.remove(this.players, "uid", uid);
        return null;
    }
    kickAllOffLinePlayer() {
        for (const pl of this.players) {
            if (pl.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
                if (Math.round(moment().valueOf() / 1000) - pl.updatetime > 3 * 60) {
                    pl.onLine = false;
                }
            }
            else {
                if (!pl.onLine) {
                    this.roomManager.removePlayer(pl);
                }
                if (Math.round(moment().valueOf() / 1000) - pl.updatetime > 45) {
                    pl.onLine = false;
                }
            }
            if (!pl.onLine && !this.redPackQueue.some((redPacket) => redPacket.owner_uid === pl.uid)) {
                const member = this.channel.getMember(pl.uid);
                !!member && (0, MessageService_1.pushMessageByUids)(ChannelEventEnum_1.ChannelEventEnum.timeout, {}, member);
                this.kickOutMessage(pl.uid);
                utils.remove(this.players, "uid", pl.uid);
                this.kickingPlayer(pinus_1.pinus.app.getServerId(), [pl]);
            }
        }
    }
    async grabRedPacket(uid) {
        const redPacketOwnerIdx = this.players.findIndex((player) => player.uid === this.redPackQueue[0].owner_uid);
        const isRobotForRedPacketOwner = this.players[redPacketOwnerIdx].isRobot === 2;
        const graberIdx = this.players.findIndex((player) => player.uid === uid);
        const graberPlayer = this.players[graberIdx];
        const isRobotForGraber = graberPlayer.isRobot === 2;
        graberPlayer.changePlayerStatus(PlayerGameStatusEnum_1.PlayerGameStatusEnum.GAME);
        if (this.grabPlayerSet.has(uid)) {
            return new apiResultDTO_1.default({ code: 500, msg: langsrv.getlanguage(this.players[redPacketOwnerIdx].language, langsrv.Net_Message.id_8100) });
        }
        this.grabPlayerSet.add(uid);
        if (this.players[redPacketOwnerIdx].uid === graberPlayer.uid) {
            if (isRobotForGraber) {
                this.addRobotGrabRedPacketCount();
            }
            return this.gameAction.getRedPacketByRandom(uid);
        }
        const currentProbability = utils.random(0, 100);
        if (isRobotForRedPacketOwner) {
            if (!isRobotForGraber) {
                const isControl = await this.control.isControl(graberPlayer);
                return isControl ? this.gameAction.getHasMineInRedPacket(uid) : this.gameAction.getRedPacketByRandom(uid);
            }
            else {
                const realPlayerList = this.players.filter(p => p.isRobot === 0);
                const redPacketTotalCount = this.currentRedPacketList.length;
                const remainingRedPacketCount = redPacketTotalCount - this.robotGrabRedPacketCount;
                if (realPlayerList.length > 0) {
                    this.addRobotGrabRedPacketCount();
                    if (remainingRedPacketCount > 3) {
                        return this.gameAction.getNotHasMineInRedPacket(uid);
                    }
                    else {
                        return this.gameAction.getHasMineInRedPacket(uid);
                    }
                }
                this.addRobotGrabRedPacketCount();
                return this.gameAction.getRedPacketByRandom(uid);
            }
        }
        if (isRobotForGraber) {
            this.addRobotGrabRedPacketCount();
            return this.players[redPacketOwnerIdx].controlState ===
                commonConst_1.CommonControlState.LOSS
                ? this.gameAction.getNotHasMineInRedPacket(uid)
                : this.gameAction.getRedPacketByRandom(uid);
        }
        return this.gameAction.getRedPacketByRandom(uid);
    }
    async grabRedPacketForRobot(uid) {
        const redPacketOwnerIdx = this.players.findIndex((player) => player.uid === this.redPackQueue[0].owner_uid);
        const isRobotForRedPacketOwner = this.players[redPacketOwnerIdx].isRobot === 2;
        const graberIdx = this.players.findIndex((player) => player.uid === uid);
        const graberPlayer = this.players[graberIdx];
        const isRobotForGraber = graberPlayer.isRobot === 2;
        graberPlayer.changePlayerStatus(PlayerGameStatusEnum_1.PlayerGameStatusEnum.GAME);
        if (isRobotForRedPacketOwner === isRobotForGraber) {
            this.gameAction.getRedPacketByRandom(uid);
            return true;
        }
        const isSuccess = this.gameAction.getNotHasMineInRedPacket(uid);
        if (!isSuccess) {
            logger.warn(`房间:${this.roomId}|游戏第 ${this.roundTimes} 轮|玩家埋雷 机器人:${uid}抢|红包队列里已没有无雷红包|当前还剩${this.currentGraberQueue.filter((redPacket) => !redPacket.hasGrabed)
                .length}个红包（雷)`);
            graberPlayer.changePlayerStatus(PlayerGameStatusEnum_1.PlayerGameStatusEnum.READY);
            return false;
        }
        return true;
    }
    allowedRobotGrab() {
        return this.robotGrabRedPacketCount >= this.robotGrabRedPacketLimit;
    }
    addRobotGrabRedPacketCount() {
        this.robotGrabRedPacketCount += 1;
    }
    handOutRedPacket(uid, amount, mineNumber) {
        const redPacket = {
            owner_uid: uid,
            mineNumber,
            amount,
            nickname: this.getPlayer(uid).nickname,
            isRobot: this.getPlayer(uid).isRobot === 2,
            status: RedPacketGameStatusEnum_1.RedPacketGameStatusEnum.WAIT,
        };
        this.gameAction.addRedPacketToRedPackQueue(redPacket);
        const currentPlayer = this.getPlayer(uid);
        this.channelIsPlayer(ChannelEventEnum_1.ChannelEventEnum.handout, {
            roomStatus: RedPacketGameStatusEnum_1.RedPacketGameStatusEnum[this.status],
            hadAddRedPacket: Object.assign({}, currentPlayer.sendPlayerInfoForFrontEnd(), { amount }),
        });
        return this.redPackQueue;
    }
    cancelHandOutRedPacket(uid) {
        this.gameAction.deleteRedPacketFromRedPacketQueue(uid);
        this.channelForPlayerAction.redPacketQueueWithUpdateToAllPlayer();
    }
    async checkOffLinePlayersBeforeGaming() {
        this.kickAllOffLinePlayer();
        if (this.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER).length === 0) {
            this.canBeDestroy = true;
        }
        if (this.roundTimes % 15 === 0) {
            try {
            }
            catch (e) {
                logger.warn(`${this.backendServerId} | 场 ${this.sceneId} | 房间 ${this.roomId} | 清理 redis users和players出错: ${e.stack}`);
            }
            finally {
                this.channelForPlayerAction.playerListWithUpdate(this.players.length);
            }
        }
        return;
    }
    destroy() {
        clearInterval(this.processInterval);
        clearTimeout(this.timer);
        this.noneAction = null;
        this.waitAction = null;
        this.readyAction = null;
        this.gameAction = null;
        this.endAction = null;
        this.channelForPlayerAction = null;
        this.channelForRobotAction = null;
        this.sendRoomCloseMessage();
        this.grabPlayerSet = null;
    }
    close() {
        this.roomManager = null;
        clearInterval(this.processInterval);
        clearTimeout(this.timer);
        this.noneAction = null;
        this.waitAction = null;
        this.readyAction = null;
        this.gameAction = null;
        this.endAction = null;
        this.channelForPlayerAction = null;
        this.channelForRobotAction = null;
        this.grabPlayerSet = null;
        this.control = null;
    }
}
exports.default = RedPacketRoomImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkUGFja2V0Um9vbUltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9yZWRQYWNrZXQvbGliL1JlZFBhY2tldFJvb21JbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQXlDO0FBQ3pDLHVFQUFvRTtBQUNwRSwwREFBdUQ7QUFDdkQsc0VBQW1FO0FBQ25FLCtFQUF3RTtBQUN4RSwrRUFBd0U7QUFDeEUsaUZBQTBFO0FBQzFFLCtFQUF3RTtBQUN4RSw2RUFBc0U7QUFDdEUsZ0dBQXlGO0FBQ3pGLDhGQUF1RjtBQUd2RiwrREFBMkM7QUFJM0MsNEVBQXlFO0FBQ3pFLGtGQUFzRjtBQUN0Riw4Q0FBK0M7QUFDL0MsOERBQTJEO0FBQzNELHVFQUFvRTtBQUNwRSx5REFBa0Q7QUFDbEQsa0dBQTBGO0FBQzFGLGlDQUFpQztBQUNqQyxxRUFBcUU7QUFDckUsNERBQTZEO0FBQzdELHVFQUFnRTtBQUdoRSxNQUFNLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBcUJuRCxNQUFxQixpQkFBa0IsU0FBUSx1QkFBa0I7SUF1RC9ELFlBQVksR0FBa0IsRUFBRSxXQUF1QztRQUNyRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFyREcsMEJBQXFCLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLDBCQUFxQixHQUFHLENBQUMsQ0FBQztRQUNuQyw0QkFBdUIsR0FBVyxDQUFDLENBQUM7UUFDcEMsNEJBQXVCLEdBQVcsQ0FBQyxDQUFDO1FBRTNDLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFFdkIsV0FBTSxHQUFtQiwrQkFBYyxDQUFDLElBQUksQ0FBQztRQVc3QyxnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixrQkFBYSxHQUFXLElBQUksQ0FBQztRQUM3QixrQkFBYSxHQUFXLElBQUksQ0FBQztRQUM3QixvQkFBZSxHQUFXLElBQUksQ0FBQztRQUMv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