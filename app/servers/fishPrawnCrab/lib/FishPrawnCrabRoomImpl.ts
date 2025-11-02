import { FishPrawnCrabPlayerImpl, FishPrawnCrabPlayerImpl as Player } from './FishPrawnCrabPlayerImpl';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { getLogger } from 'pinus-logger';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { pinus } from 'pinus';
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import { PersonalControlPlayer } from "../../../services/newControl";
import * as FishPrawnCrabConst from './FishPrawnCrabConst';
import * as FishPrawnCrab_logic from './FishPrawnCrab_logic';
import { genLotteryResult } from './FishPrawnCrab_logic';
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import Control from "./control";
import utils = require('../../../utils');
import MessageService = require('../../../services/MessageService');
import { FishPrawnCrabRoomManager } from "./FishPrawnCrabRoomManager";

const baijiaLogger = getLogger('server_out', __filename);
/** 准备中  */
let READY = { name: 'READY', time: 3 };
/**下注倒计时（发牌，下注） */
let BETTING = { name: 'BETTING', time: 15 };
/**  开奖中 */
let OPEN_AWARD = { name: 'OPEN_AWARD', time: 4 };
/** 派奖中 */
let SEND_AWARD = { name: 'SEND_AWARD', time: 3 };

/**
 * 鱼虾蟹 - 游戏房间
 */
export class FishPrawnCrabRoomImpl extends SystemRoom<Player> {
    /**状态 BETTING.下注阶段 OPEN_AWARD.开奖阶段 SEND_AWARD.结算中 */
    status: 'NONE' | 'READY' | 'BETTING' | 'OPEN_AWARD' | 'SEND_AWARD' = 'NONE';
    /**记录最后一次的倒计时 时间 */
    lastCountdownTime: number = 0;
    area_bet: any = { // 下注区域

    };
    /**开奖结果 */
    result: string[] = [];
    /** 中奖区域 */
    winArea: string[] = [];
    /** 中奖区域以及赔率 */
    winAreaOdds: any = [];
    /** 假的筹码 */
    fake_area_bet: any = {};
    /**历史纪录 */
    historys: any = [];

    /**房间内玩家总投注 */
    allBets: number = 0;
    // /**记录玩家投注 */
    // betList: { uid: string, area: string, bet: number }[] = [];
    /**房间内玩家赢取的利润 */
    playerProfitList: any = [];
    runInterval: NodeJS.Timer = null;
    countdown: number;
    players: Player[] = [];
    // 必杀区域
    killAreas: Set<string>;
    // 调控逻辑
    backendServerId: string;

    startTime: number;
    endTime: number;
    zipResult: string = '';
    playerLength: number = 0;
    /**鱼虾蟹押注限红*/
    twainUpperLimit: any = {};
    control: Control = new Control({ room: this });
    lowBet: number;
    roomManager: FishPrawnCrabRoomManager;
    ChipList: number[];
    constructor(opts: any, roomManager: FishPrawnCrabRoomManager) {
        super(opts);
        this.roomManager = roomManager;
        this.backendServerId = pinus.app.getServerId();
        this.lowBet = opts.lowBet;
        this.twainUpperLimit = opts.twainUpperLimit;
        this.ChipList = opts.ChipList;
        this.area_bet = {// 下注区域
            one: { area: [{ "ONE": 0 }], betUpperLimit: FishPrawnCrabConst.XIAN_HONG.one, allSunBet: 0 }, // 围骰
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
            }, // 组合骰宝
            three: {
                area: {
                    "HL": 0,
                    "PX": 0,
                    "FISH": 0,
                    "GOLD": 0,
                    "JI": 0,
                    "XIA": 0,
                }, betUpperLimit: FishPrawnCrabConst.XIAN_HONG.three, allSunBet: 0
            }, // 独立骰宝
        };

        this.result = [];// 结果
        this.killAreas = new Set();
        this.historys = [];
    }

    /**
     * 房间关闭
     */
    close(): void {
        clearInterval(this.runInterval);
        this.sendRoomCloseMessage();
        this.roomManager = null;
        this.players = [];
    }


    /**添加一个玩家 */
    addPlayerInRoom(dbplayer) {
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }
        if (this.isFull()) return false;
        this.players.push(new Player(dbplayer));
        // 添加到消息通道
        this.addMessage(dbplayer);
        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        return true;
    }

    /**有玩家离开
     *@param isOffLine true 离线
     */
    leave(playerInfo: FishPrawnCrabPlayerImpl, isOffLine: boolean) {
        //提出消息通道
        this.kickOutMessage(playerInfo.uid);
        //玩家掉线离开
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);
        // 更新真实玩家数量
        this.updateRealPlayersNumber();
    }



    /**获取当前状态的倒计时 时间 */
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



    /**运行游戏 */
    run() {
        this.lastCountdownTime = Date.now();
        this.initRoom();
        //开启定时器
        this.openTimer();
        //产生一些随机得结果集
        this.randomHistory();
    }
    //产生一些随机得结果集
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
        this.initRoom();//初始化房间信息
    }


    //开始倒计时
    openTimer() {
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
    }

    //随机产生一些筹码
    fakeBets() {
        let ALL_AREA = FishPrawnCrabConst.ALL_AREA;
        let fake_area = utils.getArrayItems(ALL_AREA, utils.random(5, 15));
        let fake_area_bet = {};
        for (let key of fake_area) {
            let random = utils.random(50, 100) * 100;
            fake_area_bet[key] = random;
            if (this.fake_area_bet[key]) {
                this.fake_area_bet[key] += random;
            } else {
                this.fake_area_bet[key] = random;
            }
        }
        return fake_area_bet;
    }

    // 一秒执行一次
    update() {
        // console.warn(`鱼虾蟹当前状态:${this.status},剩余倒计时：${this.getCountdownTime()},this.countdown:${this.countdown}`);
        --this.countdown;
        //如果是下注阶段就随机产生一些筹码
        if (this.status == BETTING.name && Math.floor(this.countdown % 2) == 1) {
            //将随机的筹码发送给前端
            this.channelIsPlayer('FishPrawnCrab_fakeBets', {
                fake_area_bet: this.fakeBets(),
            });
        }

        if (this.countdown > 0) {
            return;
        }
        this.lastCountdownTime = Date.now();
        switch (this.status) {
            case BETTING.name:// 如果是下注阶段 下个阶段开始准备开奖
                this.openAward();
                break;
            case OPEN_AWARD.name:// 如果是开奖阶段，下个阶段就是开奖阶段
                this.sendAward();
                break;
            case SEND_AWARD.name:// 如果是派奖阶段，下个阶段就是准备阶段
                this.Initialization();
                break;
            case READY.name:   // 如果是准备阶段 等待三秒就变成押注阶段
                // this.Initialization();
                this.bettingAward();
                break;
        }

        //给前端发送通知
        this.roomManager.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            countdown: this.countdown,
            status: this.status,
            history: this.historys
        });

    }

    /**初始化 */
    initRoom() {
        this.countdown = READY.time;
        this.status = "READY";
        this.playerLength = this.players.length + utils.random(20, 40);
        // 初始化回合id
        this.updateRoundId();
        //通知玩家准备阶段
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
            let areaList = this.area_bet[key].area; //子集押注sumBet 归零
            for (let item in areaList) {
                areaList[item] = 0;
            }
        }


        // 更新真实玩家数量
        // this.updateRealPlayersNumber();
        this.startTime = Date.now();
        this.zipResult = '';
    }



    /**下注中 */
    async bettingAward() {
        this.countdown = BETTING.time;
        this.status = 'BETTING';
        this.channelIsPlayer('FishPrawnCrab_BETTING', {
            countdown: this.countdown,
            status: this.status,
        });


    }
    /**开奖中 */
    async openAward() {
        this.countdown = OPEN_AWARD.time;
        this.status = 'OPEN_AWARD';

        const lotteryResult: LotteryResult = await this.control.result();
        this.result = lotteryResult.result;     //开奖结果
        // console.warn(`开奖结果：${this.result}`);
        this.winArea = lotteryResult.winArea; //中奖区域
        // console.warn(`中奖区域：${this.winArea}`);
        this.winAreaOdds = lotteryResult.winAreaOdds; //中奖区域
        // console.warn(`中奖区域以及赔率：${this.winArea}`);
        this.channelIsPlayer('FishPrawnCrab_OPEN_AWARD', {
            countdown: this.countdown,
            status: this.status,
            result: this.result,
            winArea: this.winArea,
        });
        //通知前端开奖结果和房间状态
        let opts2 = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            countdown: this.countdown
        };

    }

    /**派奖中 */
    async sendAward() {
        // 压缩开奖结果
        this.countdown = SEND_AWARD.time;
        this.status = 'SEND_AWARD';
        let list = [];
        let result = list.concat(this.historys);
        if (result.length === 20) {
            this.historys.pop();
        }
        // @ts-ignore
        this.historys.unshift(this.result);
        this.zipResult = FishPrawnCrab_logic.buildRecordResult(this.result);
        // 执行加钱 - 在线的
        await this.updateGold();
        this.channelIsPlayer('FishPrawnCrab_SEND_AWARD', {
            countdown: this.countdown,
            status: this.status,
            historys: this.historys,
            playerProfitList: this.playerProfitList
        });
        //派奖中得时候通知前端
        let opts2 = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            countdown: this.countdown,
            history: this.historys,
        };

        // 记录玩家没有下注
        await this.addPlayerNoBet();
    }

    /**更新玩家金币 */
    updateGold() {
        return new Promise((resolve, reject) => {
            //只对有下注和在线的玩家结算
            Promise.all(this.players.filter(m => m.bet > 0).map(async (pl) => {
                try {
                    pl.settlement(this.winAreaOdds);

                    let record = {
                        uid: pl.uid,
                        result: this.result,
                        betResult: pl.betResult,
                        profit: pl.profit,
                    };

                    const result = await createPlayerRecordService()
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

                    //发送走马灯
                    if (pl.profit > 100000) {
                        this.sendMaleScreen(pl);
                    }

                    //添加跑马灯集合
                    this.addNote(pl, pl.profit);
                    // (pl.isRobot == 0) && !pl.onLine && pl.toSettlementInfoByMail();
                    //如果玩家在线通知玩家不是机器人发通知消息给单个玩家赢取金币
                    if (pl.profit > 0 && pl.isRobot == 0 && pl.onLine && this.status == "SEND_AWARD") {
                        MessageService.pushMessageByUids('FishPrawnCrab_addCoin', { profit: pl.profit, gold: pl.gold }, [{ uid: pl.uid, sid: pl.sid }]);
                        this.playerProfitList.push({ uid: pl.uid, profit: pl.profit, gold: pl.gold })
                    }

                } catch (error) {
                    baijiaLogger.error('鱼虾蟹结算日志记录失败', error);
                }
            })).then(data => {
                return resolve({});
            });
        });
    }

    /**
     * 发送走马灯
     */
    sendMaleScreen(player: FishPrawnCrabPlayerImpl ) {
        MessageService.sendBigWinNotice(this.nid, player.nickname, player.profit, player.isRobot, player.headurl);
    }


    /**记录玩家没有下注*/
    addPlayerNoBet() {
        return new Promise((resolve, reject) => {
            Promise.all(this.players.filter(m => m.bet == 0 && m.isRobot == 0).map(async (pl) => {
                pl.standbyRounds += 1;
            })).then(data => {
                return resolve({});
            });
        });
    }


    /**检查金币是否不足 */
    checkGold(currPlayer: Player, bet): boolean {
        if (currPlayer.gold < currPlayer.bet + bet) {
            return true;
        }
        return false;
    }

    /**下注 */
    onBeting(currPlayer: Player, type, area, bet) {
        //添加下注区域
        this.fishPrawnCrabBet(currPlayer, type, area, bet);
        this.fishPrawnCrabBet_onBeting(currPlayer, area, bet);
    }

    /**
     * 检查是否押注超限
     */

    checkOverrunBet(type, bet): boolean {
        if (this.area_bet[type].betUpperLimit < this.area_bet[type].allSunBet + bet) {
            return true;
        }
        return false;
    }



    /**下注 */
    fishPrawnCrabBet(player: Player, type, area, bet) {
        // 记录需押
        !player.recordBets && (player.recordBets = {});
        player.recordBets[area] = (player.recordBets[area] || 0) + bet;
        //玩家下注记录
        player.bet += bet;
        if (player.bets[area] == null) {
            player.bets[area] = bet;
        } else {
            player.bets[area] += bet;
        }
        this.area_bet[type].allSunBet += bet;
        player.standbyRounds = 0;  //下注了将为下注局数清0
        //房间下注记录
        this.allBets += bet;
        this.area_bet[type].area[area] += bet;
    }

    /**下注推送 */
    fishPrawnCrabBet_onBeting(currPlayer: Player, area, bet) {
        this.channelIsPlayer('FishPrawnCrab_onBeting', {
            uid: currPlayer.uid,
            gold: currPlayer.gold - currPlayer.bet,
            area: area,
            bet: bet, //单次下注
            bets: currPlayer.bets[area], // 总下注金额
        });
    }

    /**需押 */
    fishPrawnCrabOnGoonBet(player: Player) {
        for (let key in player.recordBetsRemark) {
            let type = null;
            if (FishPrawnCrabConst.DICE_AREA.includes(key)) {
                type = 'three';
            } else if (FishPrawnCrabConst.DOUBLE_AREA.includes(key)) {
                type = 'two';
            } else {
                type = 'one';
            }
            let bet = player.recordBetsRemark[key];
            //续压加入到续压记录里面
            this.fishPrawnCrabBet(player, type, key, bet)
        }
        this.channelIsPlayer('FishPrawnCrab_onGoonBet', {
            uid: player.uid,
            gold: player.gold - player.bet,
            betNums: player.bet, // 下注金额
            area_bet: player.bets,
        });
    }


    /**
     * 获取房间相关信息
     */
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



    //断线重连获取数据
    getOffLineData(player: Player) {
        let data = { onLine: false, bets: player.bets, };
        //当前正是这个玩家说话
        if (player.onLine) {
            data.onLine = player.onLine;
        }
        return data;
    }

    /**跑马灯 */
    addNote(currPlayer: Player, profit: number) {
        // const currResult = { isRobot: currPlayer.isRobot, nickname: currPlayer.nickname, bet: currPlayer.bet, num: profit };

        if (profit >= 100000) {
            //播放跑马灯
            MessageService.sendBigWinNotice(this.nid, currPlayer.nickname, profit, currPlayer.isRobot, currPlayer.headurl);
        }
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
            } else {
                this.roomManager.playerAddToChannel(p);
            }

            // 移除玩家在房间房间器中的位置
            this.roomManager.removePlayerSeat(p.uid);
        });
    }




    /**
     * 根据开奖结果计算列表玩家的纯利润总和
     * @param players
     * @param winAreaOdds
     */
    getPlayersTotalProfit(players: Player[], winAreaOdds: { name: string, odds: number }[]): number {
        return players.reduce((totalProfit, p) => p.calculateProfit(winAreaOdds), 0);
    }

    /**
     * 玩家个人调控
     * @param controlPlayers 调控玩家
     * @param state 调控状态 WIN 则是让玩家赢 LOSS 则是让玩家输
     */
    personalControlResult(controlPlayers: PersonalControlPlayer[], state: CommonControlState): LotteryResult {
        const players = controlPlayers.map(p => this.getPlayer(p.uid));
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        let lotteryResult: LotteryResult;

        for (let i = 0; i < 100; i++) {
            lotteryResult = genLotteryResult();

            // 获取纯利润
            const totalProfit = this.getPlayersTotalProfit(players, lotteryResult.winAreaOdds);

            // 如果是玩家赢 纯利润大于0即可 玩家输 纯利润小于零即可
            if (state === CommonControlState.WIN && totalProfit > 0) {
                break;
            } else if (state === CommonControlState.LOSS && totalProfit < 0) {
                break
            }
        }

        return lotteryResult;
    }

    /**
     * 场控
     * @param sceneControlState 场控状态
     * @param isPlatformControl
     */
    sceneControlResult(sceneControlState: ControlState, isPlatformControl): LotteryResult {
        // 不调控则随机开奖
        if (sceneControlState === ControlState.NONE) {
            return this.randomLotteryResult();
        }

        // 选出真人玩家
        const players = this.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER);

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        players.forEach(p => p.setControlType(type));

        let lotteryResult: LotteryResult;

        for (let i = 0; i < 100; i++) {
            lotteryResult = genLotteryResult();

            // 如果包含中奖区域就跳过
            if (lotteryResult.winArea.find(area => this.killAreas.has(area))) {
                continue;
            }

            // 获取纯利润
            const totalProfit = this.getPlayersTotalProfit(players, lotteryResult.winAreaOdds);

            // 如果是系统赢 真人玩家的纯利润小于等于0即可 玩家赢纯利润大于零即可
            if (sceneControlState === ControlState.SYSTEM_WIN && totalProfit < 0) {
                break
            } else if (sceneControlState === ControlState.PLAYER_WIN && totalProfit > 0) {
                break;
            }
        }

        return lotteryResult;
    }

    /**
     * 设置必杀区域
     * @param areas
     */
    setKillAreas(areas: Set<string>) {
        this.killAreas = areas;
    }


    /**
     * 随机开奖
     */
    randomLotteryResult(): LotteryResult {
        let result;

        for (let i = 0; i < 100; i++) {
            result = genLotteryResult();

            // 不能包含必杀区域
            if (result.winArea.find(area => this.killAreas.has(area))) {
                continue;
            }

            break;
        }

        return result;
    }

}