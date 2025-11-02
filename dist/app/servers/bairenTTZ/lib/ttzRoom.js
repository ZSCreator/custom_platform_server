'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_logger_1 = require("pinus-logger");
const ttzPlayer_1 = require("./ttzPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_1 = require("../../../services/newControl/constants");
const ttzlogic_1 = require("./ttzlogic");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const langsrv = require("../../../services/common/langsrv");
const control_1 = require("./control");
const recordUtil_1 = require("./util/recordUtil");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const MessageService = require("../../../services/MessageService");
const ttzConst = require("./ttzConst");
const utils = require("../../../utils/index");
const ttzlogic = require("./ttzlogic");
const ttzRoomMgr_1 = require("../lib/ttzRoomMgr");
const robotCommonOp_1 = require("../../../services/robotService/overallController/robotCommonOp");
const log_logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const LOTTERY_COUNTDOWN = 5;
const SETTLE_COUNTDOWN = 10;
class ttzRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.totalBet = 0;
        this.situations = [];
        this._numbers = [];
        this.lotterys = [];
        this.status = "NONE";
        this.zj_queues = [];
        this.zipResult = '';
        this.timerInterval = null;
        this.players = [];
        this.countdown = 0;
        this.xiaZhuangUid = null;
        this.killAreas = new Set();
        this.lowBet = opts.lowBet;
        this.ChipList = opts.ChipList;
        this.allinMaxNum = opts.allinMaxNum || 0;
        this.upZhuangCond = opts.upZhuangCond || 200000;
        this.ttzHistory = opts.ttzHistory || [];
        this.zhuangInfo = {
            uid: null,
            hasRound: -1,
            money: 0
        };
        this.ramodHistory();
        this.control = new control_1.default({ room: this });
        let AddCount = 0;
        do {
            let pl = (0, robotCommonOp_1.GetOnePl)();
            pl.gold = utils.random(this.upZhuangCond, this.upZhuangCond * 2);
            this.addPlayerInRoom(pl);
            let ply = this.players[AddCount];
            this.zj_queues.push(ply);
            AddCount++;
            ply.updatetime += AddCount * 2 * 60;
        } while (AddCount < 3);
    }
    close() {
        clearInterval(this.timerInterval);
        this.sendRoomCloseMessage();
        this.players = [];
    }
    ramodHistory() {
        let numberOfTimes = 20;
        do {
            let lotterys = [
                { area: `center`, iswin: true, result: [], type: 0, Points: 0 },
                { area: `east`, iswin: false, result: [], type: 0, Points: 0 },
                { area: `north`, iswin: false, result: [], type: 0, Points: 0 },
                { area: `west`, iswin: false, result: [], type: 0, Points: 0 },
                { area: `south`, iswin: false, result: [], type: 0, Points: 0 }
            ];
            for (const iterator of lotterys) {
                iterator.iswin = false;
                let randomIndex = utils.random(0, 1);
                if (randomIndex == 0) {
                    iterator.iswin = true;
                }
            }
            let opts = {
                nid: this.nid,
                sceneId: this.sceneId,
                roomId: this.roomId,
                res: lotterys.filter(m => m.area != "center").map(m => { return { area: m.area, isWin: m.iswin }; }),
            };
            this.ttzHistory.push(opts);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }
    async Initialization() {
        this.totalBet = 0;
        this.players.forEach(pl => pl && pl.playerInit(this));
        await this.br_kickNoOnline();
        this.situations = [];
        this._numbers = [];
        this.lotterys = [
            { area: `center`, iswin: true, result: [], type: 0, Points: 0 },
            { area: `east`, iswin: false, result: [], type: 0, Points: 0 },
            { area: `north`, iswin: false, result: [], type: 0, Points: 0 },
            { area: `west`, iswin: false, result: [], type: 0, Points: 0 },
            { area: `south`, iswin: false, result: [], type: 0, Points: 0 }
        ];
        this.updateRoundId();
        this.killAreas.clear();
        return true;
    }
    noticeZhuangInfo() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        const opts = {
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            applyZhuangs: this.zj_queues.map(pl => {
                return {
                    uid: pl.uid,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    gold: pl.gold,
                    isRobot: pl.isRobot
                };
            }),
            applyZhuangsNum: this.zj_queues.length
        };
        this.channelIsPlayer("bairenTTZ_zj_info", opts);
    }
    async check_zjList() {
        do {
            if (this.zhuangInfo.uid) {
                this.zhuangInfo.hasRound--;
                const zj_pl = this.getPlayer(this.zhuangInfo.uid);
                if (zj_pl && zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('ttz_onKickZhuang', { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1218) }, member);
                    this.zhuangInfo.uid = null;
                }
                if (!zj_pl || this.zhuangInfo.hasRound <= 0) {
                    this.zhuangInfo.uid = null;
                }
                if (zj_pl && this.zhuangInfo.uid == this.xiaZhuangUid) {
                    this.xiaZhuangUid = '';
                    this.zhuangInfo.uid = null;
                    if (this.zhuangInfo.money > 0) {
                        let profit = -this.zhuangInfo.money * 0.4;
                        const res = await (0, RecordGeneralManager_1.default)()
                            .setPlayerBaseInfo(zj_pl.uid, false, zj_pl.isRobot, zj_pl.gold)
                            .setGameInfo(this.nid, this.sceneId, this.roomId)
                            .setGameRecordInfo(0, 0, profit, false)
                            .sendToDB(2);
                        zj_pl.gold = res.gold;
                    }
                }
                if (this.zhuangInfo.uid) {
                    break;
                }
            }
            if (this.zhuangInfo.uid == null) {
                let queue_one = this.zj_queues.shift() || null;
                if (!queue_one) {
                    break;
                }
                let zj_pl = queue_one ? this.getPlayer(queue_one.uid) : null;
                if (!zj_pl || (zj_pl && zj_pl.onLine == false)) {
                    continue;
                }
                if (zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('ttz_onKickZhuang', { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1219) }, member);
                    continue;
                }
                this.zhuangInfo.uid = zj_pl.uid;
                this.zhuangInfo.hasRound = zj_pl ? ttzConst.ZHUANG_NUM : -1;
                this.zhuangInfo.money = 0;
                break;
            }
        } while (true);
        this.noticeZhuangInfo();
    }
    addPlayerInRoom(dbplayer) {
        const currPlayer = this.getPlayer(dbplayer.uid);
        if (currPlayer) {
            currPlayer.gold = dbplayer.gold;
            currPlayer.onLine = true;
            this.addMessage(currPlayer);
            return true;
        }
        try {
            this.addMessage(dbplayer);
            this.players.push(new ttzPlayer_1.default(dbplayer));
            return true;
        }
        catch (error) {
            log_logger.log("addPlayer=", dbplayer);
            return false;
        }
    }
    leave(playerInfo, droORclo = false) {
        this.kickOutMessage(playerInfo.uid);
        if (droORclo == true) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);
        let index = this.zj_queues.findIndex(m => m.uid == playerInfo.uid);
        if (index !== 0 && index !== -1) {
            this.zj_queues.splice(index, 1);
        }
        this.playersChange();
    }
    playersChange() {
        const opts = {
            playerNum: this.players.length,
            rankingList: this.rankingLists().slice(0, 6),
        };
        this.channelIsPlayer('bairenTTZ_playersChange', opts);
    }
    bankerIsRealMan() {
        const banker = this.getPlayer(this.zhuangInfo.uid);
        return !!banker && banker.isRobot === 0;
    }
    rankingLists() {
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold,
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
    async runRoom() {
        try {
            await this.Initialization();
            await this.check_zjList();
            this._numbers = ttzlogic.shuffle_cards();
            this.countdown = LOTTERY_COUNTDOWN;
            this.startTime = Date.now();
            for (const lottery of this.lotterys) {
                lottery.result.push(this._numbers.shift());
            }
            for (const pl of this.players) {
                const member = this.channel.getMember(pl.uid);
                const opts = {
                    countdown: this.countdown,
                    lotterys: this.lotterys,
                    isRenew: pl.isCanRenew(),
                    roundId: this.roundId,
                    robotNum: this.zj_queues.filter(pl => pl.isRobot == 2).length,
                    gold: pl.gold
                };
                member && MessageService.pushMessageByUids('TTZ_Start', opts, member);
            }
            this.playersChange();
            this.status = `Licensing`;
            clearInterval(this.timerInterval);
            this.timerInterval = setInterval(async () => {
                this.countdown -= 1;
                if (this.countdown <= 0) {
                    clearInterval(this.timerInterval);
                    this.startBetting();
                }
            }, 1000);
        }
        catch (err) {
            log_logger.error(`ttz开始运行房间报错 错误信息 ==> ${err}`);
            this.status = "NONE";
            return;
        }
    }
    startBetting() {
        this.status = "BETTING";
        clearInterval(this.timerInterval);
        this.countdown = 15;
        this.channelIsPlayer("TTZ_BETTING", { countdown: this.countdown });
        let opts = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            downTime: this.countdown
        };
        ttzRoomMgr_1.default.pushRoomStateMessage(this.roomId, opts);
        this.timerInterval = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                clearInterval(this.timerInterval);
                this.openAward();
            }
        }, 1000);
    }
    async openAward() {
        try {
            this.status = "OPENAWARD";
            this.endTime = Date.now();
            log_logger.info(`OPENAWARD|${this.roomId}`);
            let { winArea } = await this.control.result();
            this.zipResult = (0, recordUtil_1.buildRecordResult)(this.lotterys);
            await this.onSettlement();
            let list = this.players.filter(pl => pl.bet > 0);
            if (this.zhuangInfo.uid) {
                list.push(this.getPlayer(this.zhuangInfo.uid));
            }
            let opts = {
                lotterys: this.lotterys,
                winArea,
                userWin: list.map(pl => {
                    return {
                        uid: pl.uid,
                        gold: pl.gold,
                        bets: pl.betList,
                        profit: pl.profit,
                        bet: pl.bet
                    };
                }),
                countdown: SETTLE_COUNTDOWN
            };
            this.channelIsPlayer("TTZ_Lottery", opts);
            {
                let opts = {
                    nid: this.nid,
                    sceneId: this.sceneId,
                    roomId: this.roomId,
                    res: this.lotterys.filter(m => m.area != "center").map(m => { return { area: m.area, isWin: m.iswin }; }),
                };
                this.ttzHistory.push(opts);
                if (this.ttzHistory.length > 20)
                    this.ttzHistory.shift();
                ttzRoomMgr_1.default.pushRoomStateMessage(this.roomId, {
                    nid: this.nid,
                    sceneId: this.sceneId,
                    roomId: this.roomId,
                    status: this.status,
                    historyData: this.ttzHistory
                });
            }
            this.countdown = SETTLE_COUNTDOWN;
            clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                this.countdown -= 1;
                if (this.countdown === 0) {
                    clearInterval(this.timerInterval);
                    this.runRoom();
                }
            }, 1000);
        }
        catch (e) {
            log_logger.error(e);
            return;
        }
    }
    async onSettlement() {
        let zj_profit = 0;
        for (const pl of this.players) {
            if (pl && pl.bet) {
                await pl.addGold(this);
                zj_profit += pl.profit > 0 ? -pl.profit : Math.abs(pl.profit);
            }
        }
        if (this.zhuangInfo.uid) {
            let zj_pl = this.getPlayer(this.zhuangInfo.uid);
            zj_pl.bet = Math.abs(zj_profit);
            zj_pl.profit = zj_profit;
            this.zhuangInfo.money += zj_profit;
            await zj_pl.addGold(this);
        }
    }
    async br_kickNoOnline() {
        const players = this.players.filter(p => p.uid !== this.zhuangInfo.uid);
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(players, 5, 3);
        offlinePlayers.forEach(p => {
            this.leave(p, false);
            if (!p.onLine) {
                ttzRoomMgr_1.default.removePlayer(p);
            }
            else {
                ttzRoomMgr_1.default.playerAddToChannel(p);
            }
            ttzRoomMgr_1.default.removePlayerSeat(p.uid);
        });
    }
    personalControlLottery(controlPlayers, state) {
        let areas;
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        for (let i = 0; i < 100; i++) {
            const { winArea } = this.randomLottery();
            areas = winArea;
            const win = this.statisticalControlPlayersProfit(controlPlayers);
            if (state === commonConst_1.CommonControlState.WIN && win > 0) {
                break;
            }
            if (state === commonConst_1.CommonControlState.LOSS && win < 0) {
                break;
            }
        }
        return { winArea: areas };
    }
    statisticalControlPlayersProfit(controlPlayer) {
        let totalProfit = 0;
        controlPlayer.forEach(p => {
            const player = this.getPlayer(p.uid);
            totalProfit += player.profit;
        });
        return totalProfit;
    }
    randomLottery() {
        for (const lottery of this.lotterys) {
            lottery.result = [lottery.result[0]];
        }
        return (0, ttzlogic_1.settle_zhuang)(this, this.players);
    }
    sceneControlLottery(sceneControlState, isPlatformControl) {
        if (sceneControlState === constants_1.ControlState.NONE && this.killAreas.size === 0) {
            return this.randomLottery();
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));
        const statisticalType = this.bankerIsRealMan() ? RoleEnum_1.RoleEnum.ROBOT : RoleEnum_1.RoleEnum.REAL_PLAYER;
        let areas;
        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            let { win, winArea } = (0, ttzlogic_1.controlLottery)(this, this.players, statisticalType);
            areas = winArea;
            if (this.killAreas.size) {
                if (winArea.find(area => this.killAreas.has(area))) {
                    continue;
                }
                else if (sceneControlState === constants_1.ControlState.NONE) {
                    break;
                }
            }
            if (this.bankerIsRealMan()) {
                if (sceneControlState === constants_1.ControlState.SYSTEM_WIN && win >= 0) {
                    break;
                }
                if (sceneControlState === constants_1.ControlState.PLAYER_WIN && win <= 0) {
                    break;
                }
            }
            else {
                if (sceneControlState === constants_1.ControlState.SYSTEM_WIN && win <= 0) {
                    break;
                }
                if (sceneControlState === constants_1.ControlState.PLAYER_WIN && win >= 0) {
                    break;
                }
            }
        }
        return { winArea: areas };
    }
    bankerControlLottery(bankerWin) {
        let areas;
        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            const { win, winArea } = (0, ttzlogic_1.controlLottery)(this, this.players, RoleEnum_1.RoleEnum.ROBOT);
            areas = winArea;
            if (bankerWin && win < 0) {
                break;
            }
            if (!bankerWin && win > 0) {
                break;
            }
        }
        return { winArea: areas };
    }
    markKillArea(killAreas) {
        killAreas.forEach(area => this.killAreas.add(area));
    }
}
exports.default = ttzRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHR6Um9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2JhaXJlblRUWi9saWIvdHR6Um9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7O0FBQ1osK0NBQXlDO0FBQ3pDLDJDQUFvQztBQUNwQyx1RUFBb0U7QUFFcEUsa0ZBQXNGO0FBQ3RGLHNFQUFvRjtBQUNwRix5Q0FBMkQ7QUFDM0QsdUVBQW9FO0FBQ3BFLDREQUE0RDtBQUM1RCx1Q0FBb0M7QUFDcEMsa0RBQXNEO0FBQ3RELG1GQUFpRjtBQUNqRixtRUFBb0U7QUFDcEUsdUNBQXdDO0FBQ3hDLDhDQUErQztBQUMvQyx1Q0FBd0M7QUFDeEMsa0RBQWdFO0FBQ2hFLGtHQUEwRjtBQUUxRixNQUFNLFVBQVUsR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBSXZELE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBRTVCLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBTzVCLE1BQXFCLE9BQVEsU0FBUSx1QkFBcUI7SUFzRHRELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUE3Q2hCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFFckIsZUFBVSxHQUFpRyxFQUFFLENBQUM7UUFDOUcsYUFBUSxHQUFhLEVBQUUsQ0FBQztRQUV4QixhQUFRLEdBUUYsRUFBRSxDQUFDO1FBRVQsV0FBTSxHQUFtRCxNQUFNLENBQUM7UUFHaEUsY0FBUyxHQUFnQixFQUFFLENBQUM7UUFJNUIsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQVd2QixrQkFBYSxHQUFpQixJQUFJLENBQUM7UUFFbkMsWUFBTyxHQUFnQixFQUFFLENBQUM7UUFFMUIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUV0QixpQkFBWSxHQUFXLElBQUksQ0FBQztRQUU1QixjQUFTLEdBQWdCLElBQUksR0FBRyxF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