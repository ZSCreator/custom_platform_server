"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sicboPlayer_1 = require("./sicboPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const pinus_logger_1 = require("pinus-logger");
const lotteryUtil_1 = require("./util/lotteryUtil");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_1 = require("../../../services/newControl/constants");
const control_1 = require("./control");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const util = require("../../../utils/index");
const sicboConst = require("./sicboConst");
const sicboService = require("./util/lotteryUtil");
const MessageService = require("../../../services/MessageService");
const JsonConfig = require("../../../pojo/JsonConfig");
const utils = require("../../../utils/index");
const SicBoRoomMgr_1 = require("../lib/SicBoRoomMgr");
const sicboLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class sicboRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.points = ['p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17'];
        this.diceNum = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];
        this.bssd = ['big', 'small', 'single', 'double'];
        this.three = ['t1', 't2', 't3', 't4', 't5', 't6', 'tany'];
        this.twoGroupD = ['t12', 't13', 't14', 't15', 't16', 't23', 't24', 't25', 't26', 't34', 't35', 't36', 't45', 't46', 't56'];
        this.twoGroupE = ['t11', 't22', 't33', 't44', 't55', 't66'];
        this.status = 'NONE';
        this.sicboHistorys = [];
        this.allGains = [];
        this.runTimer = null;
        this.players = [];
        this.zipResult = '';
        this.killAreas = new Set();
        this.realPlayerTotalBet = 0;
        this.channel = opts.channel;
        this.ChipList = opts.ChipList;
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.tallBet = opts.tallBet * sicboConst.BET_XIANZHI;
        this.allBetAreas = this.points.concat(this.diceNum).concat(this.bssd).concat(this.three);
        this.area_bet = {};
        this.countDown = sicboConst.BETTING;
        this.sicboHistorys = opts.sicboHistorys || [];
        this.allBetNum = 0;
        this.maxCount = JsonConfig.get_games(this.nid).roomUserLimit;
        this.allGains = [];
        this.control = new control_1.default({ room: this });
        this.ramodHistory();
    }
    async initRoom() {
        this.allGains = [];
        this.area_bet = {};
        this.countDown = sicboConst.BETTING;
        this.allBetNum = 0;
        this.players.map(async (m) => m.siboInit());
        this.updateRoundId();
        this.startTime = Date.now();
        this.zipResult = '';
        this.killAreas.clear();
        this.realPlayerTotalBet = 0;
        this.updateRealPlayersNumber();
    }
    close() {
        clearInterval(this.runTimer);
        this.sendRoomCloseMessage();
        this.players = [];
    }
    ramodHistory() {
        let numberOfTimes = 20;
        do {
            let lotterys = sicboService.randomLottery(this);
            let { winAreas } = this.getResult_(lotterys);
            this.recordHistory(lotterys, winAreas);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }
    async run() {
        await this.initRoom();
        await this.br_kickNoOnline();
        this.status = 'BETTING';
        for (const pl of this.players) {
            const member = this.channel.getMember(pl.uid);
            const opts = { countDown: this.countDown, isRenew: pl.isCanRenew(), roundId: this.roundId };
            member && MessageService.pushMessageByUids('SicBo.start', opts, member);
        }
        SicBoRoomMgr_1.default.pushRoomStateMessage(this.roomId, { sceneId: this.sceneId, roomId: this.roomId, roomStatus: this.status, countDown: this.countDown });
        this.runTimer = setInterval(() => {
            this.countDown--;
            if (this.countDown == -1) {
                clearInterval(this.runTimer);
                this.openAward();
            }
        }, 1000);
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
        this.players.push(new sicboPlayer_1.default(dbplayer));
        this.addMessage(dbplayer);
        this.updateRealPlayersNumber();
        return true;
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        const playerSicbo = this.getPlayer(playerInfo.uid);
        if (isOffLine) {
            playerSicbo.onLine = false;
            return;
        }
        util.remove(this.players, 'uid', playerInfo.uid);
        this.channelIsPlayer('SicBo.userChange', {
            playerNum: this.players.length,
            rankingList: this.rankingLists().slice(0, 6)
        });
        this.updateRealPlayersNumber();
    }
    getPlayer(uid) {
        return this.players.find(m => m && m.uid === uid);
    }
    async openAward() {
        try {
            this.status = 'OPENAWARD';
            const result = await this.control.result();
            try {
                this.players.length && sicboLogger.info(`结果|${this.nid}|${this.roomId}|${result}`);
            }
            catch (error) {
                console.error(error);
            }
            let { winAreas } = this.getResult_(result);
            this.zipResult = (0, lotteryUtil_1.buildRecordResult)(result, winAreas);
            this.recordHistory(result, winAreas);
            this.result = result;
            this.winAreas = winAreas;
            await this.updateGold();
            this.countDown = sicboConst.KAIJIANG;
            this.channelIsPlayer('SicBo.result', this.resultStrip());
            SicBoRoomMgr_1.default.pushRoomStateMessage(this.roomId, this.resultStrip());
            this.openTimer = setInterval(() => {
                this.countDown--;
                if (this.countDown == -1) {
                    clearInterval(this.openTimer);
                    this.processing();
                }
            }, 1000);
        }
        catch (error) {
            console.error('sicbo.Room.openAward()==>', error);
        }
    }
    getResult_(result) {
        let results_ = sicboService.settle(result, this);
        return results_;
    }
    resultStrip() {
        return {
            sceneId: this.sceneId,
            roomId: this.roomId,
            roomStatus: this.status,
            getRecird: this.getRecird(),
            result: this.result,
            winAreas: this.winAreas,
            userWin: this.players.filter(pl => pl.bet > 0).map(pl => {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    profit: pl.profit,
                    bets: pl.bets
                };
            }),
            allBets: this.allBetAreasMoney(),
            countDown: this.countDown
        };
    }
    async processing() {
        this.status = 'PROCESSING';
        this.countDown = sicboConst.JIESUAN;
        this.channelIsPlayer('SicBo.processing', {
            room: {
                countDown: this.countDown,
                players: this.players.filter(pl => pl.bet > 0).map(pl => {
                    return { uid: pl.uid, gold: pl.gold };
                })
            }
        });
        this.processingTimer = setInterval(() => {
            this.countDown--;
            if (this.countDown == -1) {
                clearInterval(this.processingTimer);
                this.run();
            }
        }, 1000);
    }
    updateGold() {
        return new Promise((resolve, reject) => {
            this.endTime = Date.now();
            Promise.all(this.players.filter(m => m.bet > 0).map(async (pl) => {
                try {
                    this.calculateValidBet(pl);
                    const res = await (0, RecordGeneralManager_1.default)()
                        .setPlayerBaseInfo(pl.uid, false, pl.isRobot, pl.initgold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRoundInfo(this.roundId, this.realPlayersNumber, 0)
                        .setGameRecordInfo(pl.bet, pl.validBet, pl.profit)
                        .addResult(this.zipResult)
                        .setControlType(pl.controlType)
                        .setGameRecordLivesResult(this.buildPlayerGameRecord(pl.uid))
                        .sendToDB(1);
                    pl.profit = res.playerRealWin;
                    pl.gold = res.gold;
                    pl.initgold = pl.gold;
                    this.addResult(pl, pl.profit);
                }
                catch (error) {
                    console.error(error);
                }
            })).then(data => {
                return resolve({});
            });
        });
    }
    buildPlayerGameRecord(uid) {
        if (!uid) {
            return {};
        }
        let result = {
            uid,
            area: this.getPlayer(uid).bets,
            settlement_info: this.buildSettlementInfo()
        };
        return result;
    }
    buildSettlementInfo() {
        try {
            let settlement_info = JSON.parse(JSON.stringify(this.sicboHistorys[this.sicboHistorys.length - 1]));
            delete settlement_info.userWin;
            return settlement_info;
        }
        catch (e) {
            console.error("骰宝构建报表结算数据出错：" + (e.stack | e));
        }
    }
    allLoss(isRobot) {
        let allLossNum = 0;
        for (let pl of this.players) {
            if (isRobot) {
                pl.isRobot !== 2 && (allLossNum += pl.profit > 0 ? pl.profit + pl.bet : 0);
            }
            else {
                allLossNum += pl.profit > 0 ? pl.profit + pl.bet : 0;
            }
        }
        return allLossNum;
    }
    rankingLists() {
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold - pl.bet,
                    winRound: pl.winRound,
                    totalBet: pl.bet,
                    totalProfit: utils.sum(pl.totalProfit),
                };
            }
        });
        stripPlayers.sort((pl1, pl2) => {
            return pl2.winRound - pl1.winRound;
        });
        let copy_player = stripPlayers.shift();
        stripPlayers.sort((pl1, pl2) => {
            return utils.sum(pl2.gold + pl2.totalBet) - utils.sum(pl1.gold + pl2.totalBet);
        });
        stripPlayers.unshift(copy_player);
        return stripPlayers;
    }
    userBetAreas(player) {
        const userBetAreas = [];
        this.allBetAreas.forEach(k => {
            userBetAreas.push({
                id: k,
                selfBet: !this.area_bet[k] ? 0 :
                    (this.area_bet[k].playerArr.find(m => m.uid === player.uid) ?
                        this.area_bet[k].playerArr.find(m => m.uid === player.uid).bet : 0),
                allBet: !this.area_bet[k] ? 0 : this.area_bet[k].allBet
            });
        });
        return userBetAreas;
    }
    allBetAreasMoney() {
        let allArea = {};
        this.allBetAreas.forEach(m => {
            allArea[m] = this.area_bet[m] == undefined ? 0 : this.area_bet[m].allBet;
        });
        return allArea;
    }
    recordHistory(result, winAreas) {
        if (this.sicboHistorys.length >= 20) {
            this.sicboHistorys.splice(0, 1);
        }
        this.sicboHistorys.push({
            lotteryResult: result,
            winAreas,
            userWin: this.players.filter(pl => pl.bet > 0).map(pl => {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    profit: pl.profit,
                    bets: pl.bets,
                };
            }),
        });
    }
    getRecird() {
        const result = {
            results: [],
            bssd: {
                big: 0,
                small: 0,
                single: 0,
                double: 0,
                baozi: 0
            }
        };
        const sicboHistory = this.sicboHistorys;
        const nums = sicboHistory.reduce((nums, record, index) => {
            const lottery = record.lotteryResult;
            if (index < 20) {
                let baozi = record.winAreas.reduce((pre, area) => {
                    if (this.three.includes(area))
                        pre += 1;
                    return pre;
                }, 0);
                result.results.push({
                    lottery,
                    properties: record.winAreas.includes('small') ? 'small' : record.winAreas.includes('big') ? 'big' : null,
                    oddEven: record.winAreas.includes('single') ? 'single' : record.winAreas.includes('double') ? 'double' : null,
                    baozi: baozi > 0 ? baozi : null
                });
            }
            record.winAreas.filter(areaId => this.bssd.concat(this.three).includes(areaId)).forEach(id => {
                if (this.three.includes(id)) {
                    nums['baozi']++;
                }
                else
                    nums[id]++;
            });
            return nums;
        }, { big: 0, small: 0, single: 0, double: 0, baozi: 0 });
        result.bssd = nums;
        return result;
    }
    roomStrip() {
        return {
            points: this.points,
            diceNum: this.diceNum,
            bssd: this.bssd,
            three: this.three,
            twoGroupD: this.twoGroupD,
            twoGroupE: this.twoGroupE
        };
    }
    getOffLineData(player) {
        let data = this.resultStrip();
        if (this.status != 'OPENAWARD') {
            data = null;
        }
        return data;
    }
    addResult(player, num) {
        const minLowBet = 100000;
        if (num >= minLowBet) {
            const zname = JsonConfig.get_games(this.nid).zname;
            MessageService.sendBigWinNotice(this.nid, player.nickname, num, player.isRobot, player.headurl);
        }
    }
    betTrue(bets) {
        let temp = true;
        !this.allBetAreas.includes(bets.area) && (temp = false);
        return temp;
    }
    calculateValidBet(player) {
        const keys = Object.keys(player.bets), calculateArr = [], betAreas = player.bets;
        let count = 0;
        for (let i = 0, len = keys.length; i < len; i++) {
            const area = keys[i];
            if (!this.bssd.includes(area)) {
                count += betAreas[area].bet;
                continue;
            }
            const mappingArea = sicboConst.mapping[area];
            if (calculateArr.includes(mappingArea))
                continue;
            const areaBet = betAreas[area].bet, mappingAreaBet = !!betAreas[mappingArea] ? betAreas[mappingArea].bet : 0;
            count += (Math.max(areaBet, mappingAreaBet) - Math.min(areaBet, mappingAreaBet));
            calculateArr.push(area);
        }
        const duplexArea = keys.filter(area => sicboConst.diceNum.includes(area));
        if (duplexArea.length === sicboConst.diceNum.length) {
            const conversion = duplexArea.map(area => betAreas[area].bet);
            const num = conversion.reduce((x, y) => x + y);
            const max = Math.max(...conversion);
            count -= (num - max);
        }
        player.validBetCount(count);
    }
    async br_kickNoOnline() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players, 5, 3);
        offlinePlayers.forEach(p => {
            this.leave(p, false);
            if (!p.onLine) {
                SicBoRoomMgr_1.default.removePlayer(p);
            }
            else {
                SicBoRoomMgr_1.default.playerAddToChannel(p);
            }
            SicBoRoomMgr_1.default.removePlayerSeat(p.uid);
        });
    }
    getAllBet(condition) {
        if (condition === 4) {
            return this.allBetNum;
        }
        let num = 0;
        this.players.forEach(p => {
            if (p.isRobot === condition) {
                num += p.bet;
            }
        });
        return num;
    }
    getControlPlayersBet(players) {
        return players.reduce((totalBet, player) => {
            return totalBet + this.getPlayer(player.uid).bet;
        }, 0);
    }
    setPlayersState(players, state) {
        players.forEach(p => {
            const player = this.getPlayer(p.uid);
            player.setControlState(state);
        });
    }
    getControlPlayersProfit(controlPlayers, result) {
        sicboService.settle(result, this);
        return controlPlayers.reduce((profit, player) => {
            return profit + this.getPlayer(player.uid).profit;
        }, 0);
    }
    personalControlResult(controlPlayers, state) {
        let result, win;
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        for (let i = 0; i < 100; i++) {
            result = (0, lotteryUtil_1.lottery)();
            win = this.getControlPlayersProfit(controlPlayers, result);
            if (state === commonConst_1.CommonControlState.WIN && win > 0 ||
                state === commonConst_1.CommonControlState.LOSS && win <= 0) {
                break;
            }
        }
        return result;
    }
    getRealPlayersProfit(result) {
        sicboService.settle(result, this);
        return this.players.reduce((totalProfit, player) => {
            return player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER ? totalProfit + player.profit : totalProfit;
        }, 0);
    }
    sceneControlResult(state, isPlatformControl) {
        if (this.realPlayerTotalBet === 0 || state === constants_1.ControlState.NONE) {
            return sicboService.randomLottery(this);
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));
        let result, win;
        for (let i = 0; i < 100; i++) {
            result = (0, lotteryUtil_1.lottery)();
            if (sicboService.containKillAreas(this, result)) {
                continue;
            }
            win = this.getRealPlayersProfit(result);
            if (state === constants_1.ControlState.SYSTEM_WIN && win <= 0) {
                break;
            }
            if (state === constants_1.ControlState.PLAYER_WIN && win > 0) {
                break;
            }
        }
        return result;
    }
    addKillArea(area) {
        this.killAreas.add(area);
    }
}
exports.default = sicboRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ljYm9Sb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvU2ljQm8vbGliL3NpY2JvUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUF3QztBQUN4Qyx1RUFBb0U7QUFDcEUsK0NBQXlDO0FBRXpDLG9EQUFnRTtBQUNoRSx1RUFBb0U7QUFFcEUsa0ZBQXNGO0FBQ3RGLHNFQUFvRjtBQUVwRix1Q0FBcUM7QUFDckMsbUZBQWlGO0FBQ2pGLDZDQUE4QztBQUM5QywyQ0FBNEM7QUFDNUMsbURBQW9EO0FBQ3BELG1FQUFvRTtBQUNwRSx1REFBd0Q7QUFDeEQsOENBQStDO0FBQy9DLHNEQUFnRTtBQUVoRSxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBUXhELE1BQXFCLFNBQVUsU0FBUSx1QkFBdUI7SUEyRTFELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUF0RWYsV0FBTSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXRHLFlBQU8sR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFL0MsU0FBSSxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFNUMsVUFBSyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7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