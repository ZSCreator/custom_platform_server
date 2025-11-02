import fPlayer from './fPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { PersonalControlPlayer } from "../../../services/newControl";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import Control from "./control";
import { buildRecordResult } from "./util/recordUtil";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";
import utils = require('../../../utils/index');
import fisheryConst = require('./fisheryConst');
import MessageService = require('../../../services/MessageService');
import JsonConfig = require('../../../pojo/JsonConfig');
import {FisheryRoomManager} from "./FisheryRoomManagerImpl";
import {random} from "../../../utils";

const BET_TIME = 14;//下注时间
const AWAIT = 3;//下注时间
const JIESUAN = 11;//结算时间


/**
 * 渔场大亨实现类
 * @property fisheryHistory 渔场大亨开奖记录
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩开奖结果
 * @property result 开奖结果
 */
export default class fisheryRoom extends SystemRoom<fPlayer> {
    startTime: number;
    endTime: number;
    zipResult: string;
    entryCond: number;
    lowBet: number;
    fisheryHistory: {
        periods: number,
        /**鱼种类 */
        fishType: number,
        /**深海区 */
        brine: boolean,
        /**淡水区 */
        fightFlood: boolean,
        /**小型鱼 */
        shoalSater: boolean,
        /**大型鱼 */
        deepwater: boolean,
        /**观赏鱼 */
        watch: boolean,
        /**食用鱼 */
        rare: boolean
    }[];
    period: number;

    /**RUN运行状态 BETTING 下注中 PROCESSING 结算中*/
    roomStatus: 'NONE' | 'BETTING' | 'PROCESSING' = 'NONE';
    brine: { //海水区
        self: { allbet: number; allPeople: any[]; };
        shoalSater: {
            self: { allbet: number; allPeople: any[]; };
            fish1: { allbet: number; allPeople: any[]; };
            fish2: { allbet: number; allPeople: any[]; };
            fish3: { allbet: number; allPeople: any[]; };
        };
        deepwater: {
            self: { allbet: number; allPeople: any[]; };
            fish4: { allbet: number; allPeople: any[]; };
            fish5: { allbet: number; allPeople: any[]; };
            fish6: { allbet: number; allPeople: any[]; };
        };
    };
    freshWater: { self: { allbet: number; allPeople: any[]; }; };
    fightFlood: { //淡水区
        self: { allbet: number; allPeople: any[]; };
        watch: {
            self: { allbet: number; allPeople: any[]; };
            fish7: { allbet: number; allPeople: any[]; };
            fish8: { allbet: number; allPeople: any[]; };
            fish9: { allbet: number; allPeople: any[]; };
        };
        rare: {
            self: { allbet: number, allPeople: any[] },
            fish10: { allbet: number, allPeople: any[] },
            fish11: { allbet: number, allPeople: any[] },
            fish12: { allbet: number, allPeople: any[] }
        };
    };
    // reStartTimer: NodeJS.Timer;
    DownTimer: NodeJS.Timer;
    currTime: number;
    players: fPlayer[];
    control: Control;
    /**倒计时 */
    countDown = 0;
    result: string = '';
    killAreas: Set<string> = new Set();
    roomManager: FisheryRoomManager;
    ChipList: number[];

    constructor(opts: any, roomManager: FisheryRoomManager) {
        super(opts);
        this.roomManager = roomManager;
        this.players = [];
        this.channel = opts.channel;
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.ChipList=opts.ChipList;
        this.brine = {//海水区
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
        this.freshWater = { self: { allbet: 0, allPeople: [] } };//灾祸区
        this.fightFlood = {//淡水区
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
        this.maxCount = JsonConfig.get_games(this.nid).roomUserLimit;//房间运行最多坐多少人
        this.control = new Control({ room: this });
        this.fisheryHistory = opts.fisheryHistory || [];
        this.period = opts.period || 10000;
    }

    /**
     * 运行房间
     */
    run() {
        // 生成盘路
        const num = random(10, 20);
        for (let i = 0; i < num; i++) {
            this.addResultRecord(this.randomResult());
        }

        this.runFishery();
    }

    /**
     * 关闭房间
     */
    close() {
        clearInterval(this.DownTimer);
        this.sendRoomCloseMessage();
        this.roomManager = null;
        this.players = [];
    }

    //初始化房间信息
    initFishery() {
        this.result = '';
        if (this.period >= 100000) {
            this.period = 10000;
        } else {
            this.period++;
        }

        this.brine = {//海水区
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
        this.freshWater = { self: { allbet: 0, allPeople: [] } };//灾祸区
        this.fightFlood = {//淡水区
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
        // 更新真实玩家数量
        this.updateRealPlayersNumber();
    }


    /**运行渔场大亨 */
    async runFishery() {
        await this.br_kickNoOnline()

        // 回合开始时间
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
        }


        this.roomManager.pushRoomStateMessage(this.roomId, opts);
        this.DownTimer = setInterval(() => {
            this.countDown -= 1;
            if (this.countDown == -1) {
                clearTimeout(this.DownTimer);
                //倒计时结束收获
                this.harvest();
            }
        }, 1000);
    }

    /**倒计时结束，收获开奖 */
    async harvest() {
        // 获取调控结果
        this.roomStatus = `PROCESSING`;
        const result = await this.control.result();
        this.result = result;

        //记录开奖记录到机器列表
        this.addResultRecord(result);

        // 构造压缩结果
        this.zipResult = buildRecordResult(result);

        //结算
        await this.Settlement(result);
        //通知前端开奖
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
                }
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
        }
        this.roomManager.pushRoomStateMessage(this.roomId, opts);
        this.DownTimer = setInterval(() => {
            this.countDown -= 1;
            if (this.countDown == -1) {
                clearInterval(this.DownTimer);
                this.runFishery();
            }
        }, 1000);
    }

    /**计算时间差 */
    countTime() {
        let time = BET_TIME * 1000 - (Date.now() - this.currTime);
        return time > 0 ? time : 0;
    }

    /**添加开奖记录 */
    addResultRecord(result) {
        //记录开奖记录

        // 删除最后一个元素
        if (this.fisheryHistory.length >= fisheryConst.RESULT_NUM) {
            this.fisheryHistory.shift();
        }

        // 添加到记录
        this.fisheryHistory.push({
            periods: this.period,//开奖期数
            fishType: result,//鱼种类
            brine: fisheryConst.FISHTYPE[result].brine,//深海区
            fightFlood: fisheryConst.FISHTYPE[result].fightFlood,//淡水区
            shoalSater: fisheryConst.FISHTYPE[result].shoalSater,//小型鱼
            deepwater: fisheryConst.FISHTYPE[result].deepwater,//大型鱼
            watch: fisheryConst.FISHTYPE[result].watch,//观赏鱼
            rare: fisheryConst.FISHTYPE[result].rare//食用鱼
        });
    }

    //除机器人以外的预结算

    /**
     * 对部分玩家预结算
     * @param result
     * @param players
     */
    predictWin(result: string, players: fPlayer[]) {
        let fishType = fisheryConst.SEAT[result];
        let isTemp = fishType.indexOf('-');
        let fishArr: string[] = fishType.split('-');
        let win = 0;
        players.filter(pl => pl.isRobot !== 2).forEach(pl => {
            if (isTemp >= 0) {
                if (pl[fishArr[0]][fishArr[1]][fishArr[2]].bet) {//小鱼区
                    win += pl[fishArr[0]][fishArr[1]][fishArr[2]].bet * fisheryConst.COMPENSATE[fishType];
                }
                if (pl[fishArr[0]][fishArr[1]].self.bet) {//中区
                    win += pl[fishArr[0]][fishArr[1]].self.bet * fisheryConst.COMPENSATE[fishArr[1]];
                }
                if (pl[fishArr[0]].self) {//大区
                    win += pl[fishArr[0]].self.bet * fisheryConst.COMPENSATE[fishArr[0]];
                }
            } else {
                if (pl[fishType].self.bet) {
                    win += pl[fishType].self.bet * fisheryConst.COMPENSATE[fishType];
                }
            }

        });
        return win;
    }

    /**结算 */
    Settlement(result: string) {
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
                        if (pl[fish0][fish1][fish2].bet) {//小鱼区
                            let currValue = pl[fish0][fish1][fish2].bet * fisheryConst.COMPENSATE[fishType];
                            pl.profit += currValue;
                            allFish = fish0 + '-' + fish1 + '-' + fish2;
                            !pl.allWinArea.find(a => a.area == currObj[allFish]) && pl.allWinArea.push({
                                area: currObj[allFish],
                                num: currValue
                            });
                        }
                        if (pl[fish0][fish1].self.bet) {//中区
                            let currValue = pl[fish0][fish1].self.bet * fisheryConst.COMPENSATE[fish1];
                            pl.profit += currValue;
                            allFish = fish0 + '-' + fish1;
                            !pl.allWinArea.find(a => a.area == currObj[allFish]) && pl.allWinArea.push({
                                area: currObj[allFish],
                                num: currValue
                            });
                        }
                        if (pl[fish0].self) {//大区
                            let currValue = pl[fish0].self.bet * fisheryConst.COMPENSATE[fish0];
                            pl.profit += currValue;
                            allFish = fish0;
                            !pl.allWinArea.find(a => a.area == currObj[allFish]) && pl.allWinArea.push({
                                area: currObj[allFish],
                                num: currValue
                            });
                        }
                    } else {
                        if (pl[fishType].self.bet) {
                            let currValue = pl[fishType].self.bet * fisheryConst.COMPENSATE[fishType];
                            pl.profit += currValue;
                            !pl.allWinArea.find(a => a.area == currObj[fishType]) && pl.allWinArea.push({
                                area: currObj[fishType],
                                num: currValue
                            });
                        }
                    }

                    // 计算真实押注
                    this.calculateValidBet(pl);

                    //添加战绩
                    const { playerRealWin, gold } = await createPlayerRecordService()
                        .setPlayerBaseInfo(pl.uid, false, pl.isRobot , pl.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRoundInfo(this.roundId, this.players.filter(pl => pl && pl.isRobot == 0).length,)
                        .addResult(this.zipResult)
                        .setControlType(pl.controlType)
                        .setGameRecordLivesResult(this.buildPlayerGameRecord(pl, result))
                        .setGameRecordInfo(pl.bet, pl.validBet, pl.profit - pl.bet, false)
                        .sendToDB(1);


                    pl.profit = playerRealWin;
                    //播放跑马灯
                    this.addNote(pl);
                    pl.gold = gold;
                    //给离线玩家发送邮件
                    // !pl.onLine && mailModule.changeGoldsByMail18({}, pl.mailStrip());
                } catch (error) {
                    console.error('渔场大亨结算出错', this.roomId, error);
                }
            })).then(() => {
                return resolve({});
            });
        })
    }
    /**踢掉离线玩家 */
    async br_kickNoOnline() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players,
            5, 3);

        offlinePlayers.forEach(p => {
            this.leave(p, false)

            // 不在线则从租户列表中删除 如果在线则是踢到大厅则不进行删除
            if (!p.onLine) {
                // 删除玩家
                this.roomManager.removePlayer(p);
                this.roomManager.playerAddToChannel(p);
            }

            // 移除玩家在房间房间器中的位置
            this.roomManager.removePlayerSeat(p.uid);
        });
    }
    /**
     * 构建玩家的押注详情<报表使用>
     * @param player
     * @param resultType
     */
    buildPlayerGameRecord(player: fPlayer, resultType: string): any {
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
            return result
        } catch (e) {
            console.error('渔场大亨构建报表玩家下注数据出错 uid:' + player.uid + ' e : ' + (e.stack | e));
            return {};
        }
    }

    /**添加玩家进入渔场房间 */
    addPlayerInRoom(dbplayer) {
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }
        if (this.isFull()) return false;
        this.players.push(new fPlayer(dbplayer));
        // 添加到消息通道
        this.addMessage(dbplayer);

        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        return true;
    }

    /**玩家离开渔场游戏 */
    leave(playerInfo: fPlayer, isOffLine: boolean) {
        this.kickOutMessage(playerInfo.uid);
        //玩家掉线离开
        if (isOffLine) {
            console.log('渔场大亨掉线', playerInfo.uid);
            playerInfo.onLine = false;
            return;
        }
        // this.players.remove('uid', uid);
        utils.remove(this.players, 'uid', playerInfo.uid);
        this.channelIsPlayer('changeFishery', {
            playerNum: this.players.length,
            list: this.rankingLists().slice(6)
        });

        // 更新真实玩家数量
        this.updateRealPlayersNumber();
    }

    /**包装房间信息 */
    stipRoom() {
        return {
            brine: this.brine,
            freshWater: this.freshWater,
            fightFlood: this.fightFlood,
        }
    }

    /**下注通知 */
    fisheryBet_(gold, seat_, player) {
        this.channelIsPlayer( 'fisheryBet', {
            seat: seat_,
            uid: player.uid,
            gold: gold,
            selfGold: utils.sum(player.gold),
        });
    }

    /**续押通知 */
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
        this.channelIsPlayer( 'continueBets', {
            allSeat: continueBet,
            selfGold: utils.sum(player.gold)
        });
    }

    /**播放跑马灯 */
    addNote(playerInfo: fPlayer) {
        if (playerInfo.profit < 100000) return;
        MessageService.sendBigWinNotice(this.nid, playerInfo.nickname, playerInfo.profit, playerInfo.isRobot, playerInfo.headurl);
    }

    /**计算玩家有效押注 */
    calculateValidBet(player) {
        const keys = Object.keys(player.betAreas), calculateArr = [], betAreas = player.betAreas;
        let count = 0;

        for (let i = 0, len = keys.length; i < len; i++) {
            const area = keys[i];

            // 不参与对押限制的区域跳过
            if (!fisheryConst.validArea.includes(area)) {
                count += betAreas[area];
                continue;
            }

            const mappingArea = fisheryConst.mapping[area];

            // 已经计算的过的跳过 和值跳过
            if (calculateArr.includes(mappingArea))
                continue;


            const
                areaBet = betAreas[area],
                mappingAreaBet = !!betAreas[mappingArea] ? betAreas[mappingArea] : 0;

            count += (Math.max(areaBet, mappingAreaBet) - Math.min(areaBet, mappingAreaBet));
            calculateArr.push(area);
        }

        // 大型鱼，小型鱼 观赏鱼 食用鱼区域如果全选 0 - 9号且押注金额相同只能算一个有效押注
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

    /**
     * 随机结果
     */
    randomResult(): string {
        const result = utils.sortProbability(Math.random(), fisheryConst.FISH).name;

        let fishType = fisheryConst.SEAT[result];
        let isTemp = fishType.indexOf('-');
        let fishArr: string[] = fishType.split('-');

        if (!isTemp) {
            if (this.killAreas.has(fishType)) {
                return this.randomResult();
            }
        } else {
            if (this.killAreas.has(fishArr[2]) || this.killAreas.has(fishArr[1]) || this.killAreas.has(fishArr[0])) {
                return this.randomResult();
            }
        }


        return result;
    }

    /**
     * 获取个控结果
     * @param state 调控状态
     * @param controlPlayers 调控的玩家
     */
    personalControlResult(state: CommonControlState, controlPlayers: PersonalControlPlayer[]) {
        // 被调控的玩家
        const players: fPlayer[] = controlPlayers.map(p => p.uid).map(uid => this.players.find(p => p.uid === uid));
        // 总押注
        const allBet = players.reduce((num, p) => p.bet + num, 0);

        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        let result: string;
        for (let i = 0; i < 100; i++) {
            // 获取一个随机结果
            result = this.randomResult();
            // 预先算出收益
            const win = this.predictWin(result, players);

            // 如果调控状态是让玩家输 则玩家的收益跟小于等于押注额 因为我们有抽水 就算持平我们也是盈利
            if (state === CommonControlState.LOSS && win <= allBet) {
                break;
            }

            // 如果赢则收益必须大于押注额
            if (state === CommonControlState.WIN && win > allBet) {
                break;
            }
        }

        return result;
    }

    /**
     * 场控发牌
     * @param  sceneState 场控状态
     * @param  isPlatformControl
     */
    sceneControlResult(sceneState: ControlState, isPlatformControl) {
        // 如果房间里面全是机器人 且场控状态为不调控则随机开奖
        if (this.players.every(p => p.isRobot === 2) || sceneState === ControlState.NONE) {
            return this.randomResult();
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));

        // 过滤出真人
        const players: fPlayer[] = this.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER);
        // 总押注
        const allBet = players.reduce((num, p) => p.bet + num, 0);

        let result;
        for (let i = 0; i < 100; i++) {
            // 获取一个随机结果
            result = this.randomResult();
            // 预先算出收益
            const win = this.predictWin(result, players);

            // 如果调控状态是让系统赢 则玩家的收益跟小于等于押注额 因为我们有抽水 就算持平我们也是盈利
            if (sceneState === ControlState.SYSTEM_WIN && win < allBet) {
                break;
            }

            // 如果赢则收益必须大于押注额
            if (sceneState === ControlState.PLAYER_WIN && win > allBet) {
                break;
            }
        }

        return result;
    }
    /**获取房间列表 会返回胜率 以及上局收益 只取50条 */
    rankingLists() {
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold - pl.bet,
                    bet: pl.bet,
                    // bets: pl.bets,
                    profit: pl.profit,
                    winRound: pl.winRound,
                    totalBet: pl.bet,
                    totalProfit: utils.sum(pl.totalProfit),
                }
            }
        });
        stripPlayers.sort((pl1, pl2) => {
            return pl2.winRound - pl1.winRound;
        });
        let copy_player = stripPlayers.shift();
        stripPlayers.sort((pl1, pl2) => {
            return utils.sum(pl2.gold) - utils.sum(pl1.gold)
        });
        stripPlayers.unshift(copy_player);
        return stripPlayers;
    }

    /**
     * 设置必杀区域
     * @param killAreas
     */
    setKillAreas(killAreas: Set<string>) {
        this.killAreas = killAreas;
    }
}
