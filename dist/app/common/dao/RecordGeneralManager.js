"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordGeneralManager = void 0;
const commonUtil_1 = require("../../utils/lottery/commonUtil");
const GameNidEnum_1 = require("../constant/game/GameNidEnum");
const GameCommissionTargetObjectEnum_1 = require("../constant/hall/GameCommissionTargetObjectEnum");
const GameCommissionWayEnum_1 = require("../constant/hall/GameCommissionWayEnum");
const RoleEnum_1 = require("../constant/player/RoleEnum");
const Player_entity_1 = require("./mysql/entity/Player.entity");
const GameRecordStatus_enum_1 = require("./mysql/enum/GameRecordStatus.enum");
const GameCommission_manager_1 = require("../dao/daoManager/GameCommission.manager");
const AlarmEventThing_mysql_dao_1 = require("./mysql/AlarmEventThing.mysql.dao");
const Player_manager_1 = require("./daoManager/Player.manager");
const SystemConfig_manager_1 = require("./daoManager/SystemConfig.manager");
const redisManager_1 = require("./redis/lib/redisManager");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const AlarmEventThing_redis_dao_1 = require("./redis/AlarmEventThing.redis.dao");
const GameRecordDateTable_mysql_dao_1 = require("./mysql/GameRecordDateTable.mysql.dao");
const connectionManager_1 = require("./mysql/lib/connectionManager");
const Game_manager_1 = require("./daoManager/Game.manager");
const constants_1 = require("../../services/newControl/constants");
const hallConst_1 = require("../../consts/hallConst");
const gameTypeList = [
    { type: 1, nids: ['1', '7', '10', '11', '12', '41', '44', '52', '54', '15'] },
    { type: 2, nids: ['17', '19', '42', '43', '49', '51', '53', '58', '82', '14', '14', '8', '9', '3', '85', '23'] },
    { type: 3, nids: ['2', '13', '16', '20', '40', '45', '46', '47', '50', '83', '84', '21', '81', '4'] },
    { type: 4, nids: ['6'] },
];
class RecordOptionalProps {
    constructor() {
        this.roundId = "";
        this.playersNumber = 0;
        this.seat = -1;
        this.game_Records_live_result = null;
        this.result = null;
        this.playerHadUpdateForBattleGame = false;
        this.redPacketGold = 0;
    }
}
class RecordRequiredProps extends RecordOptionalProps {
    constructor() {
        super(...arguments);
        this.way = GameCommissionWayEnum_1.GameCommissionWayEnum.None;
        this.targetCharacter = GameCommissionTargetObjectEnum_1.GameCommissionTargetObjectEnum.None;
        this.bet_commission = 0;
        this.win_commission = 0;
        this.settle_commission = 0;
        this.controlType = constants_1.ControlKinds.NONE;
        this.openUnlimited = false;
        this.iplRebate = 0;
        this.unlimitedList = [];
    }
}
class CommissionTool {
    constructor(manager) {
        this.manager = manager;
    }
    beforeUpdatePlayerCommission() {
    }
    setBasedOnWater() {
        const { bet, win, nid } = this.manager;
        this.manager.win = win;
        this.manager.playerRealWin = win;
    }
    updateBetFlow(player) {
        const { bet, validBet } = this.manager;
        if (bet <= 0) {
            return;
        }
        if (player.maxBetGold < validBet) {
            player.maxBetGold = Math.floor(validBet);
        }
        player.flowCount = player.flowCount ? Math.floor(player.flowCount + validBet) : Math.floor(validBet);
        player.dailyFlow = player.dailyFlow ? Math.floor(player.dailyFlow + validBet) : Math.floor(validBet);
    }
    async updatePlayerCommission() {
        const { nid } = this.manager;
        const gameCommissionOnMysql = await GameCommission_manager_1.default.findOne({ nid: nid });
        if (!gameCommissionOnMysql || gameCommissionOnMysql.open == false) {
            return (0, commonUtil_1.fixNoRound)(this.manager.playerRealWin);
        }
        return nid === GameNidEnum_1.GameNidEnum.redPacket ? this.redPacketCommission() : this.commonGameCommission();
    }
    async afterUpdatePlayerCommission(player, zname) {
        const { playerRealWin, validBet, nid, sceneId } = this.manager;
        if (player.dayMaxWin < playerRealWin) {
            player.dayMaxWin = playerRealWin;
        }
        player.instantNetProfit = player.instantNetProfit ? Math.floor(player.instantNetProfit + playerRealWin) : Math.floor(playerRealWin);
        player.oneWin = player.oneWin ? Math.floor(player.oneWin + playerRealWin) : Math.floor(playerRealWin);
        let num = 0;
        const { inputGoldThan, winGoldThan, winAddRmb, unlimitedList, openUnlimited, iplRebate } = await SystemConfig_manager_1.default.findOne({});
        this.manager.openUnlimited = openUnlimited;
        this.manager.unlimitedList = unlimitedList;
        this.manager.iplRebate = iplRebate;
        if (inputGoldThan && inputGoldThan != 0 && validBet >= inputGoldThan) {
            num += 1;
            this.addAlarm_event_thing(1, player, playerRealWin, validBet, nid, sceneId, zname);
        }
        if (winGoldThan && winGoldThan != 0 && (player.addDayTixian + player.gold - player.addDayRmb) >= winGoldThan) {
            num += 1;
            this.addAlarm_event_thing(2, player, playerRealWin, validBet, nid, sceneId, zname);
        }
        if (winAddRmb && winAddRmb != 0 && player.oneWin / player.oneAddRmb >= winAddRmb) {
            num += 1;
            this.addAlarm_event_thing(3, player, playerRealWin, validBet, nid, sceneId, zname);
        }
        if (num > 0) {
            await AlarmEventThing_redis_dao_1.default.addLength({ length: num });
        }
    }
    async addAlarm_event_thing(type, player, playerRealWin, validBet, nid, sceneId, zname) {
        const alarm_event = {
            uid: player.uid,
            thirdUid: player.thirdUid ? player.thirdUid : '',
            gameName: zname,
            nid: nid,
            thingType: 1,
            type: type,
            status: 0,
            input: validBet,
            win: playerRealWin,
            oneWin: player.oneWin,
            oneAddRmb: player.oneAddRmb,
            dayWin: player.addDayTixian + player.gold - player.addDayRmb,
            sceneId: sceneId,
            managerId: ''
        };
        AlarmEventThing_mysql_dao_1.default.insertOne(alarm_event);
    }
    async commonGameCommission() {
        const { nid, isDealer, bet, win, playerRealWin } = this.manager;
        let gameCommission = await GameCommission_manager_1.default.findOne({ nid });
        if (!gameCommission) {
            return this.manager.playerRealWin;
        }
        const { way, targetCharacter, bet: bet_commission, win: win_commission, settle: settle_commission } = gameCommission;
        if (targetCharacter === GameCommissionTargetObjectEnum_1.GameCommissionTargetObjectEnum.None) {
            return this.manager.playerRealWin;
        }
        if (isDealer && targetCharacter === GameCommissionTargetObjectEnum_1.GameCommissionTargetObjectEnum.Player) {
            return this.manager.playerRealWin;
        }
        if (!isDealer && targetCharacter === GameCommissionTargetObjectEnum_1.GameCommissionTargetObjectEnum.Dealer) {
            return this.manager.playerRealWin;
        }
        if (way === GameCommissionWayEnum_1.GameCommissionWayEnum.None) {
            return this.manager.playerRealWin;
        }
        if (bet_commission > 0 &&
            (way === GameCommissionWayEnum_1.GameCommissionWayEnum.BET || way === GameCommissionWayEnum_1.GameCommissionWayEnum.WIN_BET)) {
            this.manager.bet_commission = bet * bet_commission;
            this.manager.playerRealWin -= this.manager.bet_commission;
        }
        if (win_commission > 0 &&
            (way === GameCommissionWayEnum_1.GameCommissionWayEnum.Win || way === GameCommissionWayEnum_1.GameCommissionWayEnum.WIN_BET)) {
            this.manager.win_commission = win * win_commission;
            this.manager.playerRealWin -= this.manager.win_commission;
        }
        if (settle_commission > 0 && way === GameCommissionWayEnum_1.GameCommissionWayEnum.SETTLE) {
            if (win > 0) {
                this.manager.settle_commission = Math.abs(win) * settle_commission;
                if (this.manager.playerRealWin > 0) {
                    this.manager.playerRealWin -= this.manager.settle_commission;
                }
                else {
                    this.manager.playerRealWin += this.manager.settle_commission;
                }
            }
        }
        return (0, commonUtil_1.fixNoRound)(this.manager.playerRealWin, 3);
    }
    async redPacketCommission() {
        const { nid, isDealer, bet, win } = this.manager;
        const realWin = win + bet;
        const { way, targetCharacter, bet: bet_commission, win: win_commission } = await GameCommission_manager_1.default.findOne({ nid: GameNidEnum_1.GameNidEnum.redPacket });
        this.manager.way = way;
        this.manager.targetCharacter = targetCharacter;
        if (isDealer) {
            if (bet_commission > 0 &&
                (way === GameCommissionWayEnum_1.GameCommissionWayEnum.BET || way === GameCommissionWayEnum_1.GameCommissionWayEnum.WIN_BET)) {
                this.manager.bet_commission = bet * bet_commission;
            }
            if (win_commission > 0 &&
                (way === GameCommissionWayEnum_1.GameCommissionWayEnum.Win || way === GameCommissionWayEnum_1.GameCommissionWayEnum.WIN_BET)) {
                this.manager.win_commission = realWin * win_commission;
            }
            this.manager.playerRealWin -= Math.floor(this.manager.win_commission);
            return Math.round(this.manager.playerRealWin);
        }
        if (win_commission > 0) {
            if (win < 0) {
                this.manager.win_commission = realWin * win_commission;
            }
            else {
                this.manager.win_commission = win * win_commission;
                this.manager.bet = win;
                this.manager.validBet = win;
            }
            this.manager.playerRealWin -= Math.floor(this.manager.win_commission);
        }
        return Math.round(this.manager.playerRealWin);
    }
}
class BonusPoolTool {
    constructor(manager) {
        this.manager = manager;
    }
    changeBonusPool(playerRealWin) {
        if (this.manager.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
            return;
        }
        let type = constants_1.ControlTypes.none;
        switch (this.manager.controlType) {
            case constants_1.ControlKinds.PERSONAL:
                type = playerRealWin < 0 ? constants_1.ControlTypes.personalControlWin : constants_1.ControlTypes.personalControlLoss;
                break;
            case constants_1.ControlKinds.PLATFORM:
                type = playerRealWin < 0 ? constants_1.ControlTypes.platformControlWin : constants_1.ControlTypes.platformControlLoss;
                break;
            case constants_1.ControlKinds.SCENE:
                type = playerRealWin < 0 ? constants_1.ControlTypes.sceneControlWin : constants_1.ControlTypes.sceneControlLoss;
                break;
            default:
                break;
        }
        const commission = this.manager.bet_commission + this.manager.win_commission + this.manager.settle_commission;
        (0, gameControlService_1.changeControlData)({
            nid: this.manager.nid,
            sceneId: this.manager.sceneId,
            betGold: this.manager.validBet,
            profit: playerRealWin,
            uid: this.manager.uid,
            groupRemark: this.manager.player.groupRemark,
            platformId: this.manager.player.group_id,
            serviceCharge: commission,
            controlType: type,
        });
    }
}
class RecordGeneralManager extends RecordRequiredProps {
    constructor() {
        super();
        this.cTool = new CommissionTool(this);
        this.bpTool = new BonusPoolTool(this);
    }
    setPlayerBaseInfo(uid, privateRoom, isRobot, robotGold = 0) {
        if (isRobot == RoleEnum_1.RoleEnum.ROBOT) {
            this.robotGold = robotGold;
        }
        else {
            this.robotGold = 0;
        }
        this.uid = uid;
        this.privateRoom = privateRoom;
        this.isRobot = isRobot;
        return this;
    }
    setGameInfo(nid, sceneId, roomId) {
        this.nid = nid;
        this.sceneId = sceneId;
        this.roomId = roomId;
        return this;
    }
    setControlType(type) {
        this.controlType = type;
        return this;
    }
    setGameRoundInfo(roundId = "-1", playersNumber = -1, seat = -1) {
        this.roundId = roundId;
        this.playersNumber = playersNumber;
        this.seat = seat;
        return this;
    }
    isInStepMine(stepMine = false) {
        this.stepMine = stepMine;
        return this;
    }
    redPacketAmountWithOutGrab(gold = 0) {
        this.redPacketGold = gold;
        return this;
    }
    setGameRecordInfo(bet, validBet, win, isDealer = false) {
        this.bet = bet;
        this.validBet = validBet;
        this.win = win;
        this.isDealer = isDealer;
        return this;
    }
    setGameRecordLivesResult(result = null) {
        if (this.isRobot !== RoleEnum_1.RoleEnum.REAL_PLAYER) {
            return this;
        }
        this.game_Records_live_result = result;
        return this;
    }
    addResult(result = null) {
        if (this.isRobot !== RoleEnum_1.RoleEnum.REAL_PLAYER) {
            return this;
        }
        this.result = result;
        return this;
    }
    async sendToDB(gameRecordStatus, updatePlayerGold = true) {
        if (this.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
            return this.sendToDBForBattleByRobot();
        }
        this.cTool.setBasedOnWater();
        const _lock = await (0, redisManager_1.lock)(this.uid);
        const playerInfo = await Player_manager_1.default.findOne({ uid: this.uid });
        if (!playerInfo) {
            throw new Error(`未查询到当前玩家: ${this.uid} 信息或游戏: ${this.nid} 配置信息`);
        }
        const playerRep = connectionManager_1.default.getRepository(Player_entity_1.Player);
        const player = playerRep.create(playerInfo);
        this.player = player;
        let playerRealWin = await this.cTool.updatePlayerCommission();
        this.cTool.updateBetFlow(player);
        let updateGold = 0;
        let beResetGold = false;
        if (updatePlayerGold) {
            const _val = parseFloat((player.gold + playerRealWin).toFixed(3));
            if (playerRealWin > 0) {
                player.gold = _val;
                updateGold = playerRealWin;
            }
            else {
                player.gold = _val;
                updateGold = playerRealWin;
                if (player.gold < 0) {
                    beResetGold = true;
                    player.gold = 0;
                    console.error(`玩家: ${this.uid} | 金币不足`);
                }
            }
            if (this.redPacketGold > 0) {
                updateGold = parseFloat((updateGold + this.redPacketGold).toFixed(3));
                playerRealWin += this.redPacketGold;
            }
        }
        this.bpTool.changeBonusPool(playerRealWin);
        let game = await Game_manager_1.default.findOne({ nid: this.nid });
        let gameName = game ? game.zname : null;
        if (gameRecordStatus == GameRecordStatus_enum_1.GameRecordStatusEnum.DeductingPoundage) {
            gameName = `${gameName}-下庄扣费`;
        }
        await this.cTool.afterUpdatePlayerCommission(player, gameName);
        try {
            const { uid, nid, sceneId, roomId, roundId, isDealer, bet, validBet, win, bet_commission, win_commission, settle_commission, game_Records_live_result, } = this;
            let withdrawalChips = 0;
            if (player.withdrawalChips !== 0 && player.language === hallConst_1.LANGUAGE.Portugal) {
                if (player.withdrawalChips > 0) {
                    withdrawalChips = player.withdrawalChips - validBet;
                }
                else {
                    withdrawalChips = -1;
                }
            }
            await Player_manager_1.default.updateOneForRecordGeneral(uid, {
                gold: updateGold,
                instantNetProfit: player.instantNetProfit,
                oneWin: player.oneWin,
                maxBetGold: player.maxBetGold,
                flowCount: player.flowCount,
                dailyFlow: player.dailyFlow,
                withdrawalChips,
            }, beResetGold);
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER) {
                const { thirdUid, groupRemark, gold, group_id } = player;
                const multiple = bet > 0 ? parseInt((win / bet).toFixed(3)) : 0;
                let gameOrder = null;
                let time = Date.now();
                if (group_id) {
                    gameOrder = `${group_id}-${uid}-${time}`;
                }
                else {
                    gameOrder = `888-${uid}-${time}`;
                }
                let gameType = null;
                for (let key of gameTypeList) {
                    const item = key.nids.find(x => x == nid);
                    if (item) {
                        gameType = key.type;
                        break;
                    }
                }
                const gameRecord = {
                    uid,
                    thirdUid: thirdUid,
                    group_id: group_id ? group_id : null,
                    nid,
                    gameName: gameName,
                    sceneId,
                    roomId,
                    roundId,
                    gameType,
                    input: bet,
                    validBet,
                    profit: playerRealWin,
                    bet_commission,
                    win_commission,
                    settle_commission,
                    gameOrder: gameOrder,
                    gold,
                    status: gameRecordStatus,
                    multiple,
                    groupRemark: groupRemark,
                    isDealer,
                    result: this.result,
                    game_Records_live_result,
                    createTimeDate: new Date()
                };
                const { tableName, insertId } = await GameRecordDateTable_mysql_dao_1.default.insertOne(gameRecord);
                this.gameRecordId = insertId;
                this.tableName = tableName;
            }
            const lastP = await Player_manager_1.default.findOne({ uid });
            if (this.redPacketGold > 0) {
                playerRealWin -= this.redPacketGold;
            }
            let gold = lastP ? lastP.gold : 0;
            return { playerRealWin, gameRecordId: this.gameRecordId, gold: gold, tableName: this.tableName, beResetGold };
        }
        catch (e) {
            console.error(`游戏: ${this.nid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${this.uid}记录更新出错:${e.stack}`);
            return Promise.reject();
        }
        finally {
            await (0, redisManager_1.unlock)(_lock);
        }
    }
    async experienceSettlement(gold, updatePlayerGold = true) {
        this.cTool.setBasedOnWater();
        let playerRealWin = await this.cTool.updatePlayerCommission();
        if (updatePlayerGold) {
            if (playerRealWin > 0) {
                gold = gold + playerRealWin;
            }
            else {
                gold += playerRealWin;
                if (gold < 0) {
                    gold = 0;
                }
            }
        }
        return { playerRealWin, gameRecordId: this.gameRecordId, gold: gold };
    }
    async Later_updateRecord(result) {
        this.game_Records_live_result = result;
        if (this.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
            return;
        }
        try {
            const gameRecord = {
                game_Records_live_result: this.game_Records_live_result
            };
            GameRecordDateTable_mysql_dao_1.default.updateOne(this.tableName, { id: this.gameRecordId }, gameRecord);
            return;
        }
        catch (e) {
            console.error(`游戏: ${this.nid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${this.uid}记录更新出错:${e.stack}`);
            return Promise.reject();
        }
    }
    async sendToDBForBattleByRobot(updatePlayerGold = true) {
        this.cTool.setBasedOnWater();
        let playerRealWin = await this.cTool.updatePlayerCommission();
        let beResetGold = false;
        if (updatePlayerGold) {
            if (playerRealWin > 0) {
                this.robotGold = this.robotGold + playerRealWin;
            }
            else {
                const temp_gold = this.robotGold;
                this.robotGold += playerRealWin;
                if (this.robotGold < 0) {
                    this.robotGold = 0;
                    beResetGold = true;
                    console.warn(`机器人: ${this.uid} | 金币不足|${this.bet}|${temp_gold}|${playerRealWin}|${this.isDealer}`);
                }
            }
        }
        return { playerRealWin, gold: this.robotGold, beResetGold };
        try {
        }
        catch (e) {
            return Promise.reject();
        }
    }
}
exports.RecordGeneralManager = RecordGeneralManager;
RecordGeneralManager.queryRunner = null;
function createPlayerRecordService() {
    return new RecordGeneralManager();
}
exports.default = createPlayerRecordService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3JkR2VuZXJhbE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9SZWNvcmRHZW5lcmFsTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrREFBNEQ7QUFDNUQsOERBQTJEO0FBQzNELG9HQUFpRztBQUNqRyxrRkFBK0U7QUFDL0UsMERBQXVEO0FBQ3ZELGdFQUFzRDtBQUN0RCw4RUFBMEU7QUFDMUUscUZBQTZFO0FBQzdFLGlGQUF3RTtBQUN4RSxnRUFBd0Q7QUFDeEQsNEVBQW9FO0FBQ3BFLDJEQUF3RDtBQUN4RCxxRkFBd0c7QUFDeEcsaUZBQTBFO0FBQzFFLHlGQUFnRjtBQUNoRixxRUFBOEQ7QUFDOUQsNERBQW9EO0FBQ3BELG1FQUFpRjtBQUNqRixzREFBa0Q7QUFLbEQsTUFBTSxZQUFZLEdBQUc7SUFDakIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFO0lBQzdFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTtJQUNoSCxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElB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