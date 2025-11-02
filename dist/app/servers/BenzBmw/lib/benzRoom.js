'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_logger_1 = require("pinus-logger");
const benzPlayer_1 = require("./benzPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const control_1 = require("./control");
const recordUtil_1 = require("./util/recordUtil");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const MessageService = require("../../../services/MessageService");
const benzConst = require("./benzConst");
const utils = require("../../../utils/index");
const benzlogic = require("./benzlogic");
const benzRoomMgr_1 = require("../lib/benzRoomMgr");
const log_logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const LOTTERY_COUNTDOWN = 5;
const SETTLE_COUNTDOWN = 15;
class benzRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.totalBet = 0;
        this.situations = [];
        this.lotterys = null;
        this.status = "NONE";
        this.zipResult = '';
        this.timerInterval = null;
        this.players = [];
        this.countdown = 0;
        this.motorcade_ran = 0;
        this.killAreas = new Set();
        this.lowBet = opts.lowBet;
        this.record_historys = opts.record_historys || [];
        this.ChipList = opts.ChipList;
        this.control = new control_1.default({ room: this });
        this.ramodHistory();
        this.lotterys = null;
    }
    async Initialization() {
        this.totalBet = 0;
        this.players.forEach(pl => pl && pl.playerInit());
        await this.br_kickNoOnline();
        this.situations = [];
        this.lotterys = null;
        this.updateRoundId();
        this.killAreas.clear();
        return true;
    }
    close() {
        clearInterval(this.timerInterval);
        this.sendRoomCloseMessage();
        this.players = [];
    }
    ramodHistory() {
        let numberOfTimes = 20;
        do {
            this.lotterys = benzlogic.getRanomByWeight().area;
            let opts = {
                nid: this.nid,
                sceneId: this.sceneId,
                roomId: this.roomId,
                lotterys: this.lotterys,
            };
            this.record_historys.push(opts);
            if (this.record_historys.length > 20)
                this.record_historys.shift();
            numberOfTimes--;
        } while (numberOfTimes > 0);
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
            this.players.push(new benzPlayer_1.default(dbplayer));
            return true;
        }
        catch (error) {
            log_logger.log("addPlayer=", dbplayer);
            return false;
        }
    }
    leave(playerInfo, droORclo = false) {
        if (!playerInfo) {
            log_logger.error(`ttz房间中未找到玩家${playerInfo.uid}`);
            return;
        }
        this.kickOutMessage(playerInfo.uid);
        if (droORclo == true) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);
        this.playersChange();
    }
    playersChange() {
        const opts = {
            playerNum: this.players.length,
            rankingList: this.rankingLists().slice(0, 6),
        };
        this.channelIsPlayer('BenzBmw.playersChange', opts);
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
    async runRoom() {
        try {
            await this.Initialization();
            this.countdown = LOTTERY_COUNTDOWN;
            this.startTime = Date.now();
            for (const pl of this.players) {
                const member = this.channel.getMember(pl.uid);
                const opts = {
                    countdown: this.countdown,
                    roundId: this.roundId,
                    isRenew: pl.isCanRenew(),
                    gold: pl.gold
                };
                member && MessageService.pushMessageByUids('Benz.Start', opts, member);
            }
            this.playersChange();
            this.status = `Licensing`;
            clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
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
        this.channelIsPlayer("Benz.BETTING", { countdown: this.countdown });
        let opts = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            downTime: this.countdown
        };
        benzRoomMgr_1.default.pushRoomStateMessage(this.roomId, opts);
        this.timerInterval = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= -1) {
                clearInterval(this.timerInterval);
                this.openAward();
            }
        }, 1000);
    }
    async openAward() {
        try {
            this.status = "OPENAWARD";
            this.endTime = Date.now();
            await this.control.runControl();
            this.zipResult = (0, recordUtil_1.buildRecordResult)(this);
            await this.onSettlement();
            let list = this.players.filter(pl => pl.bet > 0);
            let opts = {
                lotterys: this.lotterys,
                motorcade_ran: this.motorcade_ran,
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
            this.channelIsPlayer("Benz.Lottery", opts);
            {
                let opts = {
                    nid: this.nid,
                    sceneId: this.sceneId,
                    roomId: this.roomId,
                    lotterys: this.lotterys,
                };
                this.record_historys.push(opts);
                if (this.record_historys.length > 20)
                    this.record_historys.shift();
                benzRoomMgr_1.default.pushRoomStateMessage(this.roomId, {
                    nid: this.nid,
                    sceneId: this.sceneId,
                    roomId: this.roomId,
                    status: this.status,
                    historyData: this.record_historys
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
        for (const pl of this.players) {
            if (pl && pl.bet) {
                await pl.addGold(this);
            }
        }
    }
    async br_kickNoOnline() {
        const players = this.players;
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(players, 5, 3);
        offlinePlayers.forEach(p => {
            this.leave(p, false);
            if (!p.onLine) {
                benzRoomMgr_1.default.removePlayer(p);
            }
            else {
                benzRoomMgr_1.default.playerAddToChannel(p);
            }
            benzRoomMgr_1.default.removePlayerSeat(p.uid);
        });
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
        this.lotterys = benzlogic.getRanomByWeight().area;
        const ran = benzConst.points.findIndex(c => c.area == this.lotterys);
        const name = benzConst.points[ran].area;
        let ran_num = utils.random(1, 10);
        let index = 0;
        if (this.killAreas.has(benzConst.points[ran].area)) {
            return this.randomLottery();
        }
        do {
            const c = benzConst.motorcade[index];
            if (c == name) {
                ran_num--;
            }
            if (ran_num == 0) {
                this.motorcade_ran = index;
                break;
            }
            index++;
            if (index >= benzConst.motorcade.length)
                index = 0;
        } while (true);
        return benzlogic.settle_zhuang(this, this.players);
    }
    setKillAreas(areas) {
        this.killAreas = areas;
    }
    personalControl(state, controlPlayers) {
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            const profit = this.statisticalPlayersProfit(controlPlayers);
            if (state === commonConst_1.CommonControlState.LOSS && profit < 0) {
                break;
            }
            if (state === commonConst_1.CommonControlState.WIN && profit >= 0) {
                break;
            }
        }
    }
    sceneControl(state, isPlatformControl) {
        if (state === constants_1.ControlState.NONE) {
            return this.randomLottery();
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));
        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            const profit = this.statisticalRealPlayersProfit();
            if (state === constants_1.ControlState.SYSTEM_WIN && profit < 0) {
                break;
            }
            if (state === constants_1.ControlState.PLAYER_WIN && profit >= 0) {
                break;
            }
        }
    }
    statisticalPlayersProfit(players) {
        return players.reduce((total, p) => {
            const player = this.getPlayer(p.uid);
            total += player.profit;
            return total;
        }, 0);
    }
    statisticalRealPlayersProfit() {
        return this.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER).reduce((total, p) => {
            total += p.profit;
            return total;
        }, 0);
    }
}
exports.default = benzRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuelJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CZW56Qm13L2xpYi9iZW56Um9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7O0FBQ1osK0NBQXlDO0FBQ3pDLDZDQUFzQztBQUN0Qyx1RUFBb0U7QUFFcEUsdUNBQW9DO0FBQ3BDLGtEQUFzRDtBQUV0RCxrRkFBc0Y7QUFDdEYsc0VBQW9GO0FBQ3BGLHVFQUFvRTtBQUNwRSxtRUFBb0U7QUFDcEUseUNBQTBDO0FBQzFDLDhDQUErQztBQUMvQyx5Q0FBMEM7QUFDMUMsb0RBQWlFO0FBQ2pFLE1BQU0sVUFBVSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFJdkQsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFFNUIsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFPNUIsTUFBcUIsUUFBUyxTQUFRLHVCQUFzQjtJQTRCeEQsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQXhCaEIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUdyQixlQUFVLEdBQWlHLEVBQUUsQ0FBQztRQUU5RyxhQUFRLEdBQXVCLElBQUksQ0FBQztRQUVwQyxXQUFNLEdBQW1ELE1BQU0sQ0FBQztRQUdoRSxjQUFTLEdBQVcsRUFBRSxDQUFDO1FBRXZCLGtCQUFhLEdBQWlCLElBQUksQ0FBQztRQUVuQyxZQUFPLEdBQWlCLEVBQUUsQ0FBQztRQUUzQixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBRXRCLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBR2xCLGNBQVMsR0FBa0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUlqQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxJQUFJLEVB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