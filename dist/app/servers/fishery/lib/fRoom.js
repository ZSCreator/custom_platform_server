"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fPlayer_1 = require("./fPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const control_1 = require("./control");
const recordUtil_1 = require("./util/recordUtil");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const utils = require("../../../utils/index");
const fisheryConst = require("./fisheryConst");
const MessageService = require("../../../services/MessageService");
const JsonConfig = require("../../../pojo/JsonConfig");
const utils_1 = require("../../../utils");
const BET_TIME = 14;
const AWAIT = 3;
const JIESUAN = 11;
class fisheryRoom extends SystemRoom_1.SystemRoom {
    constructor(opts, roomManager) {
        super(opts);
        this.roomStatus = 'NONE';
        this.countDown = 0;
        this.result = '';
        this.killAreas = new Set();
        this.roomManager = roomManager;
        this.players = [];
        this.channel = opts.channel;
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.ChipList = opts.ChipList;
        this.brine = {
            self: { allbet: 0, allPeople: [] },
            shoalSater: {
                self: { allbet: 0, allPeople: [] },
                fish1: { allbet: 0, allPeople: [] },
                fish2: { allbet: 0, allPeople: [] },
                fish3: { allbet: 0, allPeople: [] }
            },
            deepwater: {
                self: { allbet: 0, allPeople: [] },
                fish4: { allbet: 0, allPeople: [] },
                fish5: { allbet: 0, allPeople: [] },
                fish6: { allbet: 0, allPeople: [] }
            }
        };
        this.freshWater = { self: { allbet: 0, allPeople: [] } };
        this.fightFlood = {
            self: { allbet: 0, allPeople: [] },
            watch: {
                self: { allbet: 0, allPeople: [] },
                fish7: { allbet: 0, allPeople: [] },
                fish8: { allbet: 0, allPeople: [] },
                fish9: { allbet: 0, allPeople: [] }
            },
            rare: {
                self: { allbet: 0, allPeople: [] },
                fish10: { allbet: 0, allPeople: [] },
                fish11: { allbet: 0, allPeople: [] },
                fish12: { allbet: 0, allPeople: [] }
            }
        };
        this.DownTimer = null;
        this.maxCount = JsonConfig.get_games(this.nid).roomUserLimit;
        this.control = new control_1.default({ room: this });
        this.fisheryHistory = opts.fisheryHistory || [];
        this.period = opts.period || 10000;
    }
    run() {
        const num = (0, utils_1.random)(10, 20);
        for (let i = 0; i < num; i++) {
            this.addResultRecord(this.randomResult());
        }
        this.runFishery();
    }
    close() {
        clearInterval(this.DownTimer);
        this.sendRoomCloseMessage();
        this.roomManager = null;
        this.players = [];
    }
    initFishery() {
        this.result = '';
        if (this.period >= 100000) {
            this.period = 10000;
        }
        else {
            this.period++;
        }
        this.brine = {
            self: { allbet: 0, allPeople: [] },
            shoalSater: {
                self: { allbet: 0, allPeople: [] },
                fish1: { allbet: 0, allPeople: [] },
                fish2: { allbet: 0, allPeople: [] },
                fish3: { allbet: 0, allPeople: [] }
            },
            deepwater: {
                self: { allbet: 0, allPeople: [] },
                fish4: { allbet: 0, allPeople: [] },
                fish5: { allbet: 0, allPeople: [] },
                fish6: { allbet: 0, allPeople: [] }
            }
        };
        this.freshWater = { self: { allbet: 0, allPeople: [] } };
        this.fightFlood = {
            self: { allbet: 0, allPeople: [] },
            watch: {
                self: { allbet: 0, allPeople: [] },
                fish7: { allbet: 0, allPeople: [] },
                fish8: { allbet: 0, allPeople: [] },
                fish9: { allbet: 0, allPeople: [] }
            },
            rare: {
                self: { allbet: 0, allPeople: [] },
                fish10: { allbet: 0, allPeople: [] },
                fish11: { allbet: 0, allPeople: [] },
                fish12: { allbet: 0, allPeople: [] }
            }
        };
        this.killAreas.clear();
        for (const pl of this.players) {
            pl.initPlayer();
        }
        this.updateRoundId();
        this.updateRealPlayersNumber();
    }
    async runFishery() {
        await this.br_kickNoOnline();
        this.startTime = Date.now();
        this.initFishery();
        this.currTime = this.startTime;
        this.countDown = BET_TIME + AWAIT;
        this.channelIsPlayer('onStartFishery', {
            countDown: this.countDown * 1000,
            roundId: this.roundId,
        });
        this.roomStatus = 'BETTING';
        const opts = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            roomStatus: this.roomStatus,
            countDown: this.countDown,
        };
        this.roomManager.pushRoomStateMessage(this.roomId, opts);
        this.DownTimer = setInterval(() => {
            this.countDown -= 1;
            if (this.countDown == -1) {
                clearTimeout(this.DownTimer);
                this.harvest();
            }
        }, 1000);
    }
    async harvest() {
        this.roomStatus = `PROCESSING`;
        const result = await this.control.result();
        this.result = result;
        this.addResultRecord(result);
        this.zipResult = (0, recordUtil_1.buildRecordResult)(result);
        await this.Settlement(result);
        this.countDown = JIESUAN;
        this.channelIsPlayer('onHarvest', {
            result: result,
            players: this.players.map(pl => {
                return {
                    uid: pl.uid,
                    gold: pl.gold,
                    profit: pl.profit,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    allWinArea: pl.allWinArea
                };
            }),
            countDown: this.countTime()
        });
        const opts = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            roomStatus: this.roomStatus,
            countDown: this.countDown,
            result: result,
            fisheryHistory: this.fisheryHistory.slice(-20)
        };
        this.roomManager.pushRoomStateMessage(this.roomId, opts);
        this.DownTimer = setInterval(() => {
            this.countDown -= 1;
            if (this.countDown == -1) {
                clearInterval(this.DownTimer);
                this.runFishery();
            }
        }, 1000);
    }
    countTime() {
        let time = BET_TIME * 1000 - (Date.now() - this.currTime);
        return time > 0 ? time : 0;
    }
    addResultRecord(result) {
        if (this.fisheryHistory.length >= fisheryConst.RESULT_NUM) {
            this.fisheryHistory.shift();
        }
        this.fisheryHistory.push({
            periods: this.period,
            fishType: result,
            brine: fisheryConst.FISHTYPE[result].brine,
            fightFlood: fisheryConst.FISHTYPE[result].fightFlood,
            shoalSater: fisheryConst.FISHTYPE[result].shoalSater,
            deepwater: fisheryConst.FISHTYPE[result].deepwater,
            watch: fisheryConst.FISHTYPE[result].watch,
            rare: fisheryConst.FISHTYPE[result].rare
        });
    }
    predictWin(result, players) {
        let fishType = fisheryConst.SEAT[result];
        let isTemp = fishType.indexOf('-');
        let fishArr = fishType.split('-');
        let win = 0;
        players.filter(pl => pl.isRobot !== 2).forEach(pl => {
            if (isTemp >= 0) {
                if (pl[fishArr[0]][fishArr[1]][fishArr[2]].bet) {
                    win += pl[fishArr[0]][fishArr[1]][fishArr[2]].bet * fisheryConst.COMPENSATE[fishType];
                }
                if (pl[fishArr[0]][fishArr[1]].self.bet) {
                    win += pl[fishArr[0]][fishArr[1]].self.bet * fisheryConst.COMPENSATE[fishArr[1]];
                }
                if (pl[fishArr[0]].self) {
                    win += pl[fishArr[0]].self.bet * fisheryConst.COMPENSATE[fishArr[0]];
                }
            }
            else {
                if (pl[fishType].self.bet) {
                    win += pl[fishType].self.bet * fisheryConst.COMPENSATE[fishType];
                }
            }
        });
        return win;
    }
    Settlement(result) {
        let fishType = fisheryConst.SEAT[result];
        let isTemp = fishType.indexOf('-');
        let fishArr = fishType.split('-');
        const currObj = utils.exchangeObj(fisheryConst.SEAT);
        return new Promise((resolve) => {
            Promise.all(this.players.filter(pl => pl && pl.bet > 0).map(async (pl) => {
                try {
                    if (isTemp >= 0) {
                        const fish0 = fishArr[0];
                        const fish1 = fishArr[1];
                        const fish2 = fishArr[2];
                        let allFish;
                        if (pl[fish0][fish1][fish2].bet) {
                            let currValue = pl[fish0][fish1][fish2].bet * fisheryConst.COMPENSATE[fishType];
                            pl.profit += currValue;
                            allFish = fish0 + '-' + fish1 + '-' + fish2;
                            !pl.allWinArea.find(a => a.area == currObj[allFish]) && pl.allWinArea.push({
                                area: currObj[allFish],
                                num: currValue
                            });
                        }
                        if (pl[fish0][fish1].self.bet) {
                            let currValue = pl[fish0][fish1].self.bet * fisheryConst.COMPENSATE[fish1];
                            pl.profit += currValue;
                            allFish = fish0 + '-' + fish1;
                            !pl.allWinArea.find(a => a.area == currObj[allFish]) && pl.allWinArea.push({
                                area: currObj[allFish],
                                num: currValue
                            });
                        }
                        if (pl[fish0].self) {
                            let currValue = pl[fish0].self.bet * fisheryConst.COMPENSATE[fish0];
                            pl.profit += currValue;
                            allFish = fish0;
                            !pl.allWinArea.find(a => a.area == currObj[allFish]) && pl.allWinArea.push({
                                area: currObj[allFish],
                                num: currValue
                            });
                        }
                    }
                    else {
                        if (pl[fishType].self.bet) {
                            let currValue = pl[fishType].self.bet * fisheryConst.COMPENSATE[fishType];
                            pl.profit += currValue;
                            !pl.allWinArea.find(a => a.area == currObj[fishType]) && pl.allWinArea.push({
                                area: currObj[fishType],
                                num: currValue
                            });
                        }
                    }
                    this.calculateValidBet(pl);
                    const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
                        .setPlayerBaseInfo(pl.uid, false, pl.isRobot, pl.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRoundInfo(this.roundId, this.players.filter(pl => pl && pl.isRobot == 0).length)
                        .addResult(this.zipResult)
                        .setControlType(pl.controlType)
                        .setGameRecordLivesResult(this.buildPlayerGameRecord(pl, result))
                        .setGameRecordInfo(pl.bet, pl.validBet, pl.profit - pl.bet, false)
                        .sendToDB(1);
                    pl.profit = playerRealWin;
                    this.addNote(pl);
                    pl.gold = gold;
                }
                catch (error) {
                    console.error('渔场大亨结算出错', this.roomId, error);
                }
            })).then(() => {
                return resolve({});
            });
        });
    }
    async br_kickNoOnline() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players, 5, 3);
        offlinePlayers.forEach(p => {
            this.leave(p, false);
            if (!p.onLine) {
                this.roomManager.removePlayer(p);
                this.roomManager.playerAddToChannel(p);
            }
            this.roomManager.removePlayerSeat(p.uid);
        });
    }
    buildPlayerGameRecord(player, resultType) {
        if (!player) {
            return {};
        }
        console.log(JSON.stringify(player.allWinArea));
        let fishType = fisheryConst.SEAT[resultType];
        let fishArr = fishType.split('-');
        let settlementInfo = [];
        const currObj = utils.exchangeObj(fisheryConst.SEAT);
        settlementInfo.push(currObj[fishType]);
        if (fishArr.length > 1) {
            const fish0 = fishArr[0];
            const fish1 = fishArr[1];
            settlementInfo.push(currObj[fish0]);
            settlementInfo.push(currObj[fish0 + "-" + fish1]);
        }
        let result = {
            uid: player.uid,
            area: {},
            settlement_info: settlementInfo
        };
        try {
            let userArea = result.area;
            for (let key in player.betAreas) {
                let bet = player.betAreas[key];
                let winArea = player.allWinArea.find(a => a.area == key);
                let gain = -bet;
                if (!!winArea) {
                    gain = winArea.num;
                }
                userArea[key] = {
                    bet,
                    gain,
                };
            }
            return result;
        }
        catch (e) {
            console.error('渔场大亨构建报表玩家下注数据出错 uid:' + player.uid + ' e : ' + (e.stack | e));
            return {};
        }
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
        this.players.push(new fPlayer_1.default(dbplayer));
        this.addMessage(dbplayer);
        this.updateRealPlayersNumber();
        return true;
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            console.log('渔场大亨掉线', playerInfo.uid);
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);
        this.channelIsPlayer('changeFishery', {
            playerNum: this.players.length,
            list: this.rankingLists().slice(6)
        });
        this.updateRealPlayersNumber();
    }
    stipRoom() {
        return {
            brine: this.brine,
            freshWater: this.freshWater,
            fightFlood: this.fightFlood,
        };
    }
    fisheryBet_(gold, seat_, player) {
        this.channelIsPlayer('fisheryBet', {
            seat: seat_,
            uid: player.uid,
            gold: gold,
            selfGold: utils.sum(player.gold),
        });
    }
    continueBets_(player) {
        const continueBet = [];
        for (let x in player.allSeat) {
            let ob = {
                seat: x,
                uid: player.uid,
                gold: player.allSeat[x]
            };
            continueBet.push(ob);
        }
        this.channelIsPlayer('continueBets', {
            allSeat: continueBet,
            selfGold: utils.sum(player.gold)
        });
    }
    addNote(playerInfo) {
        if (playerInfo.profit < 100000)
            return;
        MessageService.sendBigWinNotice(this.nid, playerInfo.nickname, playerInfo.profit, playerInfo.isRobot, playerInfo.headurl);
    }
    calculateValidBet(player) {
        const keys = Object.keys(player.betAreas), calculateArr = [], betAreas = player.betAreas;
        let count = 0;
        for (let i = 0, len = keys.length; i < len; i++) {
            const area = keys[i];
            if (!fisheryConst.validArea.includes(area)) {
                count += betAreas[area];
                continue;
            }
            const mappingArea = fisheryConst.mapping[area];
            if (calculateArr.includes(mappingArea))
                continue;
            const areaBet = betAreas[area], mappingAreaBet = !!betAreas[mappingArea] ? betAreas[mappingArea] : 0;
            count += (Math.max(areaBet, mappingAreaBet) - Math.min(areaBet, mappingAreaBet));
            calculateArr.push(area);
        }
        const repeatBets = keys.filter(area => fisheryConst.repeatBetsArea.includes(area));
        if (repeatBets.length === fisheryConst.repeatBetsArea.length) {
            const conversion = repeatBets.map(area => betAreas[area]);
            if (conversion.every(number => number === conversion[0])) {
                const num = conversion.reduce((x, y) => x + y);
                const maxNumber = Math.max(...conversion);
                count -= (num - maxNumber);
            }
        }
        player.validBetCount(count);
    }
    randomResult() {
        const result = utils.sortProbability(Math.random(), fisheryConst.FISH).name;
        let fishType = fisheryConst.SEAT[result];
        let isTemp = fishType.indexOf('-');
        let fishArr = fishType.split('-');
        if (!isTemp) {
            if (this.killAreas.has(fishType)) {
                return this.randomResult();
            }
        }
        else {
            if (this.killAreas.has(fishArr[2]) || this.killAreas.has(fishArr[1]) || this.killAreas.has(fishArr[0])) {
                return this.randomResult();
            }
        }
        return result;
    }
    personalControlResult(state, controlPlayers) {
        const players = controlPlayers.map(p => p.uid).map(uid => this.players.find(p => p.uid === uid));
        const allBet = players.reduce((num, p) => p.bet + num, 0);
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        let result;
        for (let i = 0; i < 100; i++) {
            result = this.randomResult();
            const win = this.predictWin(result, players);
            if (state === commonConst_1.CommonControlState.LOSS && win <= allBet) {
                break;
            }
            if (state === commonConst_1.CommonControlState.WIN && win > allBet) {
                break;
            }
        }
        return result;
    }
    sceneControlResult(sceneState, isPlatformControl) {
        if (this.players.every(p => p.isRobot === 2) || sceneState === constants_1.ControlState.NONE) {
            return this.randomResult();
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));
        const players = this.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER);
        const allBet = players.reduce((num, p) => p.bet + num, 0);
        let result;
        for (let i = 0; i < 100; i++) {
            result = this.randomResult();
            const win = this.predictWin(result, players);
            if (sceneState === constants_1.ControlState.SYSTEM_WIN && win < allBet) {
                break;
            }
            if (sceneState === constants_1.ControlState.PLAYER_WIN && win > allBet) {
                break;
            }
        }
        return result;
    }
    rankingLists() {
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold - pl.bet,
                    bet: pl.bet,
                    profit: pl.profit,
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
            return utils.sum(pl2.gold) - utils.sum(pl1.gold);
        });
        stripPlayers.unshift(copy_player);
        return stripPlayers;
    }
    setKillAreas(killAreas) {
        this.killAreas = killAreas;
    }
}
exports.default = fisheryRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZlJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9maXNoZXJ5L2xpYi9mUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUFnQztBQUNoQyx1RUFBb0U7QUFFcEUsa0ZBQXNGO0FBQ3RGLHNFQUFvRjtBQUNwRix1RUFBb0U7QUFDcEUsdUNBQWdDO0FBQ2hDLGtEQUFzRDtBQUN0RCxtRkFBaUY7QUFDakYsOENBQStDO0FBQy9DLCtDQUFnRDtBQUNoRCxtRUFBb0U7QUFDcEUsdURBQXdEO0FBRXhELDBDQUFzQztBQUV0QyxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDcEIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztBQVduQixNQUFxQixXQUFZLFNBQVEsdUJBQW1CO0lBc0V4RCxZQUFZLElBQVMsRUFBRSxXQUErQjtRQUNsRCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUE3Q2hCLGVBQVUsR0FBc0MsTUFBTSxDQUFDO1FBc0N2RCxjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUNwQixjQUFTLEdBQWdCLElBQUksR0FBRyxFQUFFLENBQUM7UUFNL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUc7WUFDVCxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7WUFDbEMsVUFBVSxFQUFFO2dCQUNSLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtnQkFDbEMsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO2dCQUNuQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7Z0JBQ25DLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTthQUN0QztZQUNELFNBQVMsRUFBRTtnQkFDUCxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7Z0JBQ2xDLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtnQkFDbkMsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO2dCQUNuQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7YUFDdEM7U0FDSixDQUFDO1FBQ0YsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDekQsSUFBSSxDQUFDLFVBQVUsR0FBRztZQUNkLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtZQUNsQyxLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO2dCQUNsQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxF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