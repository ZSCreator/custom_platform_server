"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FishPrawnCrabRoomImpl = void 0;
const FishPrawnCrabPlayerImpl_1 = require("./FishPrawnCrabPlayerImpl");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const pinus_logger_1 = require("pinus-logger");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const pinus_1 = require("pinus");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const FishPrawnCrabConst = require("./FishPrawnCrabConst");
const FishPrawnCrab_logic = require("./FishPrawnCrab_logic");
const FishPrawnCrab_logic_1 = require("./FishPrawnCrab_logic");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const control_1 = require("./control");
const utils = require("../../../utils");
const MessageService = require("../../../services/MessageService");
const baijiaLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
let READY = { name: 'READY', time: 3 };
let BETTING = { name: 'BETTING', time: 15 };
let OPEN_AWARD = { name: 'OPEN_AWARD', time: 4 };
let SEND_AWARD = { name: 'SEND_AWARD', time: 3 };
class FishPrawnCrabRoomImpl extends SystemRoom_1.SystemRoom {
    constructor(opts, roomManager) {
        super(opts);
        this.status = 'NONE';
        this.lastCountdownTime = 0;
        this.area_bet = {};
        this.result = [];
        this.winArea = [];
        this.winAreaOdds = [];
        this.fake_area_bet = {};
        this.historys = [];
        this.allBets = 0;
        this.playerProfitList = [];
        this.runInterval = null;
        this.players = [];
        this.zipResult = '';
        this.playerLength = 0;
        this.twainUpperLimit = {};
        this.control = new control_1.default({ room: this });
        this.roomManager = roomManager;
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.lowBet = opts.lowBet;
        this.twainUpperLimit = opts.twainUpperLimit;
        this.ChipList = opts.ChipList;
        this.area_bet = {
            one: { area: [{ "ONE": 0 }], betUpperLimit: FishPrawnCrabConst.XIAN_HONG.one, allSunBet: 0 },
            two: {
                area: {
                    "FISH_XIA": 0,
                    "XIA_HL": 0,
                    "HL_PX": 0,
                    "FISH_HL": 0,
                    "XIA_GOLD": 0,
                    "HL_JI": 0,
                    "XIA_PX": 0,
                    "GOLD_PX": 0,
                    "FISH_PX": 0,
                    "GOLD_JI": 0,
                    "XIA_JI": 0,
                    "FISH_JI": 0,
                    "HL_GOLD": 0,
                    "PX_JI": 0,
                    "FISH_GOLD": 0,
                }, betUpperLimit: FishPrawnCrabConst.XIAN_HONG.two, allSunBet: 0
            },
            three: {
                area: {
                    "HL": 0,
                    "PX": 0,
                    "FISH": 0,
                    "GOLD": 0,
                    "JI": 0,
                    "XIA": 0,
                }, betUpperLimit: FishPrawnCrabConst.XIAN_HONG.three, allSunBet: 0
            },
        };
        this.result = [];
        this.killAreas = new Set();
        this.historys = [];
    }
    close() {
        clearInterval(this.runInterval);
        this.sendRoomCloseMessage();
        this.roomManager = null;
        this.players = [];
    }
    addPlayerInRoom(dbplayer) {
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }
        if (this.isFull())
            return false;
        this.players.push(new FishPrawnCrabPlayerImpl_1.FishPrawnCrabPlayerImpl(dbplayer));
        this.addMessage(dbplayer);
        this.updateRealPlayersNumber();
        return true;
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);
        this.updateRealPlayersNumber();
    }
    getCountdownTime() {
        const time = Date.now() - this.lastCountdownTime;
        if (this.status === READY.name)
            return Math.max((READY.time) * 1000 - time, 500);
        if (this.status === BETTING.name)
            return Math.max((BETTING.time) * 1000 - time, 500);
        if (this.status === OPEN_AWARD.name)
            return Math.max((OPEN_AWARD.time) * 1000 - time, 500);
        if (this.status === SEND_AWARD.name)
            return Math.max((SEND_AWARD.time) * 1000 - time, 500);
        return 0;
    }
    run() {
        this.lastCountdownTime = Date.now();
        this.initRoom();
        this.openTimer();
        this.randomHistory();
    }
    randomHistory() {
        for (let i = 0; i < 20; i++) {
            let resultList = [];
            for (let j = 0; j < 3; j++) {
                const list = FishPrawnCrabConst.DICE_AREA;
                const result = list[Math.floor(Math.random() * list.length)];
                resultList.push(result);
            }
            this.historys.push(resultList);
        }
    }
    async Initialization() {
        await this.br_kickNoOnline();
        this.initRoom();
    }
    openTimer() {
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
    }
    fakeBets() {
        let ALL_AREA = FishPrawnCrabConst.ALL_AREA;
        let fake_area = utils.getArrayItems(ALL_AREA, utils.random(5, 15));
        let fake_area_bet = {};
        for (let key of fake_area) {
            let random = utils.random(50, 100) * 100;
            fake_area_bet[key] = random;
            if (this.fake_area_bet[key]) {
                this.fake_area_bet[key] += random;
            }
            else {
                this.fake_area_bet[key] = random;
            }
        }
        return fake_area_bet;
    }
    update() {
        --this.countdown;
        if (this.status == BETTING.name && Math.floor(this.countdown % 2) == 1) {
            this.channelIsPlayer('FishPrawnCrab_fakeBets', {
                fake_area_bet: this.fakeBets(),
            });
        }
        if (this.countdown > 0) {
            return;
        }
        this.lastCountdownTime = Date.now();
        switch (this.status) {
            case BETTING.name:
                this.openAward();
                break;
            case OPEN_AWARD.name:
                this.sendAward();
                break;
            case SEND_AWARD.name:
                this.Initialization();
                break;
            case READY.name:
                this.bettingAward();
                break;
        }
        this.roomManager.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            countdown: this.countdown,
            status: this.status,
            history: this.historys
        });
    }
    initRoom() {
        this.countdown = READY.time;
        this.status = "READY";
        this.playerLength = this.players.length + utils.random(20, 40);
        this.updateRoundId();
        this.channelIsPlayer('FishPrawnCrab_READY', {
            countdown: this.countdown,
            roundId: this.roundId,
            status: this.status,
            playerLength: this.playerLength,
        });
        this.allBets = 0;
        this.fake_area_bet = {};
        this.playerProfitList = [];
        this.killAreas.clear();
        this.players.forEach(pl => pl.initGame());
        for (let key in this.area_bet) {
            this.area_bet[key].allSunBet = 0;
            this.area_bet[key].betUpperLimit = FishPrawnCrabConst.XIAN_HONG[key];
            let areaList = this.area_bet[key].area;
            for (let item in areaList) {
                areaList[item] = 0;
            }
        }
        this.startTime = Date.now();
        this.zipResult = '';
    }
    async bettingAward() {
        this.countdown = BETTING.time;
        this.status = 'BETTING';
        this.channelIsPlayer('FishPrawnCrab_BETTING', {
            countdown: this.countdown,
            status: this.status,
        });
    }
    async openAward() {
        this.countdown = OPEN_AWARD.time;
        this.status = 'OPEN_AWARD';
        const lotteryResult = await this.control.result();
        this.result = lotteryResult.result;
        this.winArea = lotteryResult.winArea;
        this.winAreaOdds = lotteryResult.winAreaOdds;
        this.channelIsPlayer('FishPrawnCrab_OPEN_AWARD', {
            countdown: this.countdown,
            status: this.status,
            result: this.result,
            winArea: this.winArea,
        });
        let opts2 = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            countdown: this.countdown
        };
    }
    async sendAward() {
        this.countdown = SEND_AWARD.time;
        this.status = 'SEND_AWARD';
        let list = [];
        let result = list.concat(this.historys);
        if (result.length === 20) {
            this.historys.pop();
        }
        this.historys.unshift(this.result);
        this.zipResult = FishPrawnCrab_logic.buildRecordResult(this.result);
        await this.updateGold();
        this.channelIsPlayer('FishPrawnCrab_SEND_AWARD', {
            countdown: this.countdown,
            status: this.status,
            historys: this.historys,
            playerProfitList: this.playerProfitList
        });
        let opts2 = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            countdown: this.countdown,
            history: this.historys,
        };
        await this.addPlayerNoBet();
    }
    updateGold() {
        return new Promise((resolve, reject) => {
            Promise.all(this.players.filter(m => m.bet > 0).map(async (pl) => {
                try {
                    pl.settlement(this.winAreaOdds);
                    let record = {
                        uid: pl.uid,
                        result: this.result,
                        betResult: pl.betResult,
                        profit: pl.profit,
                    };
                    const result = await (0, RecordGeneralManager_1.default)()
                        .setPlayerBaseInfo(pl.uid, false, pl.isRobot, pl.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRoundInfo(this.roundId, -1, -1)
                        .addResult(this.zipResult)
                        .setControlType(pl.controlType)
                        .setGameRecordLivesResult(record)
                        .setGameRecordInfo(pl.bet, pl.bet, pl.profit - pl.bet, false)
                        .sendToDB(1);
                    pl.gold = result.gold;
                    pl.profit = pl.bet + result.playerRealWin;
                    if (pl.profit > 100000) {
                        this.sendMaleScreen(pl);
                    }
                    this.addNote(pl, pl.profit);
                    if (pl.profit > 0 && pl.isRobot == 0 && pl.onLine && this.status == "SEND_AWARD") {
                        MessageService.pushMessageByUids('FishPrawnCrab_addCoin', { profit: pl.profit, gold: pl.gold }, [{ uid: pl.uid, sid: pl.sid }]);
                        this.playerProfitList.push({ uid: pl.uid, profit: pl.profit, gold: pl.gold });
                    }
                }
                catch (error) {
                    baijiaLogger.error('鱼虾蟹结算日志记录失败', error);
                }
            })).then(data => {
                return resolve({});
            });
        });
    }
    sendMaleScreen(player) {
        MessageService.sendBigWinNotice(this.nid, player.nickname, player.profit, player.isRobot, player.headurl);
    }
    addPlayerNoBet() {
        return new Promise((resolve, reject) => {
            Promise.all(this.players.filter(m => m.bet == 0 && m.isRobot == 0).map(async (pl) => {
                pl.standbyRounds += 1;
            })).then(data => {
                return resolve({});
            });
        });
    }
    checkGold(currPlayer, bet) {
        if (currPlayer.gold < currPlayer.bet + bet) {
            return true;
        }
        return false;
    }
    onBeting(currPlayer, type, area, bet) {
        this.fishPrawnCrabBet(currPlayer, type, area, bet);
        this.fishPrawnCrabBet_onBeting(currPlayer, area, bet);
    }
    checkOverrunBet(type, bet) {
        if (this.area_bet[type].betUpperLimit < this.area_bet[type].allSunBet + bet) {
            return true;
        }
        return false;
    }
    fishPrawnCrabBet(player, type, area, bet) {
        !player.recordBets && (player.recordBets = {});
        player.recordBets[area] = (player.recordBets[area] || 0) + bet;
        player.bet += bet;
        if (player.bets[area] == null) {
            player.bets[area] = bet;
        }
        else {
            player.bets[area] += bet;
        }
        this.area_bet[type].allSunBet += bet;
        player.standbyRounds = 0;
        this.allBets += bet;
        this.area_bet[type].area[area] += bet;
    }
    fishPrawnCrabBet_onBeting(currPlayer, area, bet) {
        this.channelIsPlayer('FishPrawnCrab_onBeting', {
            uid: currPlayer.uid,
            gold: currPlayer.gold - currPlayer.bet,
            area: area,
            bet: bet,
            bets: currPlayer.bets[area],
        });
    }
    fishPrawnCrabOnGoonBet(player) {
        for (let key in player.recordBetsRemark) {
            let type = null;
            if (FishPrawnCrabConst.DICE_AREA.includes(key)) {
                type = 'three';
            }
            else if (FishPrawnCrabConst.DOUBLE_AREA.includes(key)) {
                type = 'two';
            }
            else {
                type = 'one';
            }
            let bet = player.recordBetsRemark[key];
            this.fishPrawnCrabBet(player, type, key, bet);
        }
        this.channelIsPlayer('FishPrawnCrab_onGoonBet', {
            uid: player.uid,
            gold: player.gold - player.bet,
            betNums: player.bet,
            area_bet: player.bets,
        });
    }
    strip() {
        return {
            roomId: this.roomId,
            status: this.status,
            countdownTime: this.getCountdownTime(),
            area_bet: this.area_bet,
            fake_area_bet: this.fake_area_bet,
            historys: this.historys,
            playerLength: this.players.length + 10,
        };
    }
    getOffLineData(player) {
        let data = { onLine: false, bets: player.bets, };
        if (player.onLine) {
            data.onLine = player.onLine;
        }
        return data;
    }
    addNote(currPlayer, profit) {
        if (profit >= 100000) {
            MessageService.sendBigWinNotice(this.nid, currPlayer.nickname, profit, currPlayer.isRobot, currPlayer.headurl);
        }
    }
    async br_kickNoOnline() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players, 5, 3);
        offlinePlayers.forEach(p => {
            this.leave(p, false);
            if (!p.onLine) {
                this.roomManager.removePlayer(p);
            }
            else {
                this.roomManager.playerAddToChannel(p);
            }
            this.roomManager.removePlayerSeat(p.uid);
        });
    }
    getPlayersTotalProfit(players, winAreaOdds) {
        return players.reduce((totalProfit, p) => p.calculateProfit(winAreaOdds), 0);
    }
    personalControlResult(controlPlayers, state) {
        const players = controlPlayers.map(p => this.getPlayer(p.uid));
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        let lotteryResult;
        for (let i = 0; i < 100; i++) {
            lotteryResult = (0, FishPrawnCrab_logic_1.genLotteryResult)();
            const totalProfit = this.getPlayersTotalProfit(players, lotteryResult.winAreaOdds);
            if (state === commonConst_1.CommonControlState.WIN && totalProfit > 0) {
                break;
            }
            else if (state === commonConst_1.CommonControlState.LOSS && totalProfit < 0) {
                break;
            }
        }
        return lotteryResult;
    }
    sceneControlResult(sceneControlState, isPlatformControl) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return this.randomLotteryResult();
        }
        const players = this.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER);
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        players.forEach(p => p.setControlType(type));
        let lotteryResult;
        for (let i = 0; i < 100; i++) {
            lotteryResult = (0, FishPrawnCrab_logic_1.genLotteryResult)();
            if (lotteryResult.winArea.find(area => this.killAreas.has(area))) {
                continue;
            }
            const totalProfit = this.getPlayersTotalProfit(players, lotteryResult.winAreaOdds);
            if (sceneControlState === constants_1.ControlState.SYSTEM_WIN && totalProfit < 0) {
                break;
            }
            else if (sceneControlState === constants_1.ControlState.PLAYER_WIN && totalProfit > 0) {
                break;
            }
        }
        return lotteryResult;
    }
    setKillAreas(areas) {
        this.killAreas = areas;
    }
    randomLotteryResult() {
        let result;
        for (let i = 0; i < 100; i++) {
            result = (0, FishPrawnCrab_logic_1.genLotteryResult)();
            if (result.winArea.find(area => this.killAreas.has(area))) {
                continue;
            }
            break;
        }
        return result;
    }
}
exports.FishPrawnCrabRoomImpl = FishPrawnCrabRoomImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlzaFByYXduQ3JhYlJvb21JbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZmlzaFByYXduQ3JhYi9saWIvRmlzaFByYXduQ3JhYlJvb21JbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVFQUF1RztBQUN2Ryx1RUFBb0U7QUFDcEUsK0NBQXlDO0FBQ3pDLGtGQUFzRjtBQUN0RixpQ0FBOEI7QUFDOUIsbUZBQWlGO0FBRWpGLDJEQUEyRDtBQUMzRCw2REFBNkQ7QUFDN0QsK0RBQXlEO0FBQ3pELHNFQUFvRjtBQUNwRix1RUFBb0U7QUFDcEUsdUNBQWdDO0FBQ2hDLHdDQUF5QztBQUN6QyxtRUFBb0U7QUFHcEUsTUFBTSxZQUFZLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUV6RCxJQUFJLEtBQUssR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBRXZDLElBQUksT0FBTyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFFNUMsSUFBSSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUVqRCxJQUFJLFVBQVUsR0FBRyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBS2pELE1BQWEscUJBQXNCLFNBQVEsdUJBQWtCO0lBMkN6RCxZQUFZLElBQVMsRUFBRSxXQUFxQztRQUN4RCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUExQ2hCLFdBQU0sR0FBK0QsTUFBTSxDQUFDO1FBRTVFLHNCQUFpQixHQUFXLENBQUMsQ0FBQztRQUM5QixhQUFRLEdBQVEsRUFFZixDQUFDO1FBRUYsV0FBTSxHQUFhLEVBQUUsQ0FBQztRQUV0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