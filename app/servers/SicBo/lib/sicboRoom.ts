import sicboPlayer from './sicboPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { getLogger } from 'pinus-logger';
import { IResult } from './interface/IRoomRecrod';
import { buildRecordResult, lottery } from "./util/lotteryUtil";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import { PersonalControlPlayer } from "../../../services/newControl";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import * as mailModule from '../../../modules/mailModule';
import SicBoControl from "./control";
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import util = require('../../../utils/index');
import sicboConst = require('./sicboConst');
import sicboService = require('./util/lotteryUtil');
import MessageService = require('../../../services/MessageService');
import JsonConfig = require('../../../pojo/JsonConfig');
import utils = require('../../../utils/index');
import roomManager, { ScRoomManger } from '../lib/SicBoRoomMgr';

const sicboLogger = getLogger('server_out', __filename);

/**
 * 骰宝房间
 * @property killAreas 必杀区域
 * @property control 调控
 * @property realPlayerTotalBet 真人玩家押注
 */
export default class sicboRoom extends SystemRoom<sicboPlayer> {
    entryCond: number;
    lowBet: number;
    /**限红 */
    tallBet: number;
    /**下注面板1 */
    points = ['p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17'];
    /**塞子点数 */
    diceNum = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];
    /**大小单双 */
    bssd = ['big', 'small', 'single', 'double'];
    /**下注面板2 豹子1-6 任意豹子 */
    three = ['t1', 't2', 't3', 't4', 't5', 't6', 'tany'];
    /**两个异号组合 */
    twoGroupD = ['t12', 't13', 't14', 't15', 't16', 't23', 't24', 't25', 't26', 't34', 't35', 't36', 't45', 't46', 't56'];
    /**两个同号组合 */
    twoGroupE = ['t11', 't22', 't33', 't44', 't55', 't66'];
    allBetAreas: string[];
    /**房间状态 NONE默认关闭状态 BETTING下注阶段  */
    status: 'NONE' | 'BETTING' | 'OPENAWARD' | 'PROCESSING' = 'NONE';
    area_bet: {
        [area: string]: {
            playerArr?: {
                uid: string,
                /**总下注 */
                bet: number,
                betList: number[],
                /**重复元素 个数 */
                betRepeat: {
                    element: number;
                    num: number;
                }[]
            }[],
            /**记录区域押注总数 */
            allBet?: number
        }
    };
    /**下注时间 */
    countDown: number;
    sicboHistorys: {
        lotteryResult: number[], winAreas: string[],
        userWin: {
            uid: string,
            nickname: string,
            headurl: string,
            profit: number,
            bets: {
                [area: string]: {
                    bet: number,
                    profit: number
                };
            }
        }[]
    }[] = [];
    allBetNum: number;
    allGains: { isRobot: number, nickname: string, bet: number, num: number }[] = [];
    runTimer: NodeJS.Timer = null;
    /**开奖结果 */
    result: number[];
    /**中奖区域 */
    winAreas: string[];
    openTimer: NodeJS.Timer;
    processingTimer: NodeJS.Timer;
    players: sicboPlayer[] = [];

    startTime: number;
    endTime: number;
    zipResult: string = '';

    killAreas: Set<string> = new Set();
    control: SicBoControl;

    realPlayerTotalBet: number = 0;
    ChipList: number[];

    constructor(opts: any) {
        super(opts)
        this.channel = opts.channel;
        this.ChipList = opts.ChipList;
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.tallBet = opts.tallBet * sicboConst.BET_XIANZHI;
        this.allBetAreas = this.points.concat(this.diceNum).concat(this.bssd).concat(this.three);
        this.area_bet = {};
        this.countDown = sicboConst.BETTING;//下注时间
        this.sicboHistorys = opts.sicboHistorys || [];//开奖历史记录
        this.allBetNum = 0;//总押注
        this.maxCount = JsonConfig.get_games(this.nid).roomUserLimit;//房间运行最多坐多少人
        this.allGains = [];
        this.control = new SicBoControl({ room: this });
        this.ramodHistory();
    }
    /**初始化房间数据 */
    async initRoom() {
        this.allGains = [];
        this.area_bet = {};
        this.countDown = sicboConst.BETTING;//下注时间
        this.allBetNum = 0;
        this.players.map(async m => m.siboInit());//初始化玩家数据

        // 初始化回合id
        this.updateRoundId();
        this.startTime = Date.now();
        this.zipResult = '';
        this.killAreas.clear();
        this.realPlayerTotalBet = 0;

        // 更新真实玩家数量
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

    /**新的一局 */
    async run() {
        await this.initRoom();
        await this.br_kickNoOnline();
        this.status = 'BETTING';
        for (const pl of this.players) {
            const member = this.channel.getMember(pl.uid);
            const opts = { countDown: this.countDown, isRenew: pl.isCanRenew(), roundId: this.roundId };
            member && MessageService.pushMessageByUids('SicBo.start', opts, member);
        }
        roomManager.pushRoomStateMessage(this.roomId, { sceneId: this.sceneId, roomId: this.roomId, roomStatus: this.status, countDown: this.countDown },
        );
        this.runTimer = setInterval(() => {
            this.countDown--;
            if (this.countDown == -1) {
                clearInterval(this.runTimer);
                this.openAward();
            }
        }, 1000);
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

        this.players.push(new sicboPlayer(dbplayer));
        // 添加到消息通道
        this.addMessage(dbplayer);

        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        return true;

    }

    /**玩家离开 */
    leave(playerInfo: sicboPlayer, isOffLine: boolean) {
        //踢出消息通道
        this.kickOutMessage(playerInfo.uid);
        const playerSicbo = this.getPlayer(playerInfo.uid);
        if (isOffLine) {//玩家掉线
            playerSicbo.onLine = false;
            return;
        }
        util.remove(this.players, 'uid', playerInfo.uid);
        this.channelIsPlayer('SicBo.userChange', {
            playerNum: this.players.length,
            rankingList: this.rankingLists().slice(0, 6)
        });


        // 更新真实玩家数量
        this.updateRealPlayersNumber();
    }

    /**获取玩家 */
    getPlayer(uid: string) {
        return this.players.find(m => m && m.uid === uid);
    }

    //开奖
    async openAward() {
        try {
            this.status = 'OPENAWARD';

            const result = await this.control.result();
            //记录开奖结果日志
            try {
                this.players.length && sicboLogger.info(`结果|${this.nid}|${this.roomId}|${result}`);
            } catch (error) {
                console.error(error)
            }
            let { winAreas } = this.getResult_(result);

            this.zipResult = buildRecordResult(result, winAreas);

            //记录开奖历史

            this.recordHistory(result, winAreas);


            this.result = result;
            this.winAreas = winAreas;
            //在线玩家更新金币 
            await this.updateGold();
            //播放跑马灯
            // this.addNote();

            //开奖时间
            this.countDown = sicboConst.KAIJIANG;//开奖时间
            //通知前端开奖
            this.channelIsPlayer('SicBo.result', this.resultStrip());
            roomManager.pushRoomStateMessage(this.roomId, this.resultStrip());

            this.openTimer = setInterval(() => {
                this.countDown--;
                if (this.countDown == -1) {
                    clearInterval(this.openTimer);
                    this.processing();
                }
            }, 1000);
        } catch (error) {
            console.error('sicbo.Room.openAward()==>', error);
        }
    }

    /**获取结果 */
    getResult_(result: number[]) {
        //结算
        let results_ = sicboService.settle(result, this);
        return results_;
    }

    /**包装开奖数据 */
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
                }
            }),
            allBets: this.allBetAreasMoney(),
            countDown: this.countDown//开奖三秒
        }
    }

    /**结算 */
    async processing() {
        //五秒后开始下一局游戏
        this.status = 'PROCESSING';
        this.countDown = sicboConst.JIESUAN;//结算时间
        this.channelIsPlayer('SicBo.processing', {
            room: {
                countDown: this.countDown,//结算八秒
                players: this.players.filter(pl => pl.bet > 0).map(pl => {
                    return { uid: pl.uid, gold: pl.gold };
                })
            }
        });

        //结算时间
        this.processingTimer = setInterval(() => {
            this.countDown--;
            if (this.countDown == -1) {
                clearInterval(this.processingTimer);
                this.run();
            }
        }, 1000);
    }

    /**更新玩家金币 */
    updateGold() {
        return new Promise((resolve, reject) => {
            this.endTime = Date.now();
            Promise.all(this.players.filter(m => m.bet > 0).map(async (pl) => {
                try {
                    // 计算有效押注
                    this.calculateValidBet(pl);
                    // 添加游戏记录以及更新玩家金币
                    const res = await createPlayerRecordService()
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
                    //添加跑马灯结果集
                    this.addResult(pl, pl.profit);
                    //离线玩家发送邮件
                    // !pl.onLine && mailModule.changeGoldsByMail5({}, pl.strip2());
                } catch (error) {
                    console.error(error);
                }
            })).then(data => {
                return resolve({});
            });
        });
    }


    /**
     * 构建玩家的押注详情<报表使用>
     * @param uid
     */
    buildPlayerGameRecord(uid: string): any {
        if (!uid) {
            return {};
        }
        // let winInfo: any = this.sicboHistorys[this.sicboHistorys.length - 1];
        // if (!!winInfo) {
        //     winInfo = winInfo.userWin;
        // }
        // if (!!winInfo) {
        //     winInfo = winInfo[uid];
        // }

        let result = {
            uid,
            area: this.getPlayer(uid).bets,
            settlement_info: this.buildSettlementInfo()
        };

        // try {
        // let userArea = result.area;
        // for (let key in this.area_bet) {
        //     let userBet = this.area_bet[key].playerArr.find(m => m.uid == uid);
        //     if (!!userBet) {
        //         let gain = (!!winInfo.winAreas && !!winInfo.winAreas[key]) ? winInfo.winAreas[key] : (-userBet.bet);
        //         userArea[key] = {
        //             bet: userBet.bet,
        //             gain,
        //         };
        //     }
        // }
        return result
        // } catch (e) {
        //     console.error('骰宝构建报表玩家下注数据出错 uid:' + uid + ' e : ' + (e.stack | e));
        //     return {};
        // }
    }

    /**
     * 构建结算开奖数据<报表使用>
     * @param uid
     */
    buildSettlementInfo(): any {

        try {
            let settlement_info = JSON.parse(JSON.stringify(this.sicboHistorys[this.sicboHistorys.length - 1]));
            delete settlement_info.userWin;
            return settlement_info
        } catch (e) {
            console.error("骰宝构建报表结算数据出错：" + (e.stack | e))
        }
    }

    /**计算本局总亏损isRobot 为true不计算机器人收益 */
    allLoss(isRobot: boolean) {
        let allLossNum = 0;
        for (let pl of this.players) {
            // const player = this.getPlayer(key);
            if (isRobot) {
                pl.isRobot !== 2 && (allLossNum += pl.profit > 0 ? pl.profit + pl.bet : 0);
            } else {
                allLossNum += pl.profit > 0 ? pl.profit + pl.bet : 0;
            }
        }
        return allLossNum;
    }

    /**房间玩家列表 */
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
                }
            }
        });
        stripPlayers.sort((pl1, pl2) => {
            return pl2.winRound - pl1.winRound;
        });
        let copy_player = stripPlayers.shift();
        stripPlayers.sort((pl1, pl2) => {
            return utils.sum(pl2.gold + pl2.totalBet) - utils.sum(pl1.gold + pl2.totalBet)
        });
        stripPlayers.unshift(copy_player);
        return stripPlayers;
    }

    /**查找某个玩家在某个回合的下注情况 */
    userBetAreas(player: sicboPlayer) {
        const userBetAreas: { id: string, selfBet: number, allBet: number }[] = [];
        this.allBetAreas.forEach(k => {
            userBetAreas.push({
                id: k,
                selfBet: !this.area_bet[k] ? 0 :
                    (this.area_bet[k].playerArr.find(m => m.uid === player.uid) ?
                        this.area_bet[k].playerArr.find(m => m.uid === player.uid).bet : 0),
                allBet: !this.area_bet[k] ? 0 : this.area_bet[k].allBet
            })
        });
        return userBetAreas;
    }

    //获取所有区域押注情况
    allBetAreasMoney() {
        let allArea = {};
        this.allBetAreas.forEach(m => {
            allArea[m] = this.area_bet[m] == undefined ? 0 : this.area_bet[m].allBet;
        });
        return allArea;
    }

    /**记录开奖结果 */
    recordHistory(result: number[], winAreas: string[]) {
        if (this.sicboHistorys.length >= 20) {
            this.sicboHistorys.splice(0, 1);
        }
        //记录开奖结果
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
                }
            }),
        });
    }

    /**获取历史记录 */
    getRecird() {
        const result: IResult = {
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
                    return pre
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
                } else
                    nums[id]++;
            });
            return nums;
        }, { big: 0, small: 0, single: 0, double: 0, baozi: 0 });
        result.bssd = nums;// util.objDivide(util.clone(nums), records.length);
        return result;
    }

    /**包装房间数据 */
    roomStrip() {
        return {
            points: this.points,
            diceNum: this.diceNum,
            bssd: this.bssd,
            three: this.three,
            twoGroupD: this.twoGroupD,
            twoGroupE: this.twoGroupE
        }
    }

    /**断线重连获取数据 */
    getOffLineData(player: sicboPlayer) {
        let data = this.resultStrip();
        if (this.status != 'OPENAWARD') {
            data = null;
        }
        return data;
    }

    /**添加跑马灯集合 */
    addResult(player: sicboPlayer, num: number) {
        const minLowBet = 100000;
        if (num >= minLowBet) {
            const zname = JsonConfig.get_games(this.nid).zname;
            //播放跑马灯
            MessageService.sendBigWinNotice(this.nid, player.nickname, num, player.isRobot, player.headurl);
        }
    }

    /**验证下注区域是否正确 */
    betTrue(bets: { area: string, bet: number }) {
        let temp = true;
        !this.allBetAreas.includes(bets.area) && (temp = false);
        return temp;
    }

    /**计算玩家有效押注 */
    calculateValidBet(player: sicboPlayer) {
        const keys = Object.keys(player.bets), calculateArr = [], betAreas = player.bets;
        let count = 0;

        for (let i = 0, len = keys.length; i < len; i++) {
            const area = keys[i];

            // 除了大小单双都跳过
            if (!this.bssd.includes(area)) {
                count += betAreas[area].bet;
                continue;
            }

            const mappingArea = sicboConst.mapping[area];

            // 已经计算的过的跳过 和值跳过
            if (calculateArr.includes(mappingArea))
                continue;

            const areaBet = betAreas[area].bet,
                mappingAreaBet = !!betAreas[mappingArea] ? betAreas[mappingArea].bet : 0;

            count += (Math.max(areaBet, mappingAreaBet) - Math.min(areaBet, mappingAreaBet));
            calculateArr.push(area);
        }

        // 获取复式押注
        const duplexArea = keys.filter(area => sicboConst.diceNum.includes(area));

        if (duplexArea.length === sicboConst.diceNum.length) {
            const conversion = duplexArea.map(area => betAreas[area].bet);
            const num = conversion.reduce((x, y) => x + y);
            const max = Math.max(...conversion);

            count -= (num - max);
        }

        player.validBetCount(count);
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
                roomManager.removePlayer(p);
            } else {
                roomManager.playerAddToChannel(p);
            }

            // 移除玩家在房间房间器中的位置
            roomManager.removePlayerSeat(p.uid);
        });
    }
    /**
     *
     * @param condition 筛选条件 默认为4 0 获取真实玩家的押注 2 获取机器人玩家的押注
     */
    getAllBet(condition: RoleEnum | 4): number {
        if (condition === 4) {
            return this.allBetNum;
        }

        let num: number = 0;
        this.players.forEach(p => {
            if (p.isRobot === condition) {
                num += p.bet;
            }
        });

        return num;
    }

    /**
     * 获取对应调控玩家的押注
     * @param players
     */
    getControlPlayersBet(players: PersonalControlPlayer[]): number {
        return players.reduce((totalBet, player) => {
            return totalBet + this.getPlayer(player.uid).bet;
        }, 0)
    }

    /**
     * 标记调控玩家以及调控状态
     * @param players
     * @param state
     */
    setPlayersState(players: PersonalControlPlayer[], state: CommonControlState) {
        players.forEach(p => {
            const player = this.getPlayer(p.uid);
            player.setControlState(state);
        });
    }

    /**
     * 获取个控玩家收益
     * @param controlPlayers 调控玩家
     * @param result 开奖结果
     */
    getControlPlayersProfit(controlPlayers: PersonalControlPlayer[], result) {
        // 先所有玩家预结算
        sicboService.settle(result, this);

        // 获取玩家收益
        return controlPlayers.reduce((profit, player) => {
            return profit + this.getPlayer(player.uid).profit;
        }, 0)
    }


    /**
     * 获取个控结果
     * @param state 调控状态
     * @param controlPlayers 调控玩家
     */
    personalControlResult(controlPlayers, state: CommonControlState) {
        let result: number[], win: number;

        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        for (let i = 0; i < 100; i++) {
            // 随机一个结果
            result = lottery();

            // 计算收益
            win = this.getControlPlayersProfit(controlPlayers, result);

            if (state === CommonControlState.WIN && win > 0 ||
                state === CommonControlState.LOSS && win <= 0) {
                break;
            }
        }

        return result;
    }

    /**
     * 获取个控玩家收益
     * @param result 开奖结果
     */
    getRealPlayersProfit(result): number {
        // 先所有玩家预结算
        sicboService.settle(result, this);

        return this.players.reduce((totalProfit, player) => {
            return player.isRobot === RoleEnum.REAL_PLAYER ? totalProfit + player.profit : totalProfit;
        }, 0);
    }

    /**
     * 获取场控结果
     * @param state
     * @param isPlatformControl
     */
    sceneControlResult(state: ControlState, isPlatformControl) {
        // 如果真人玩家押注为零或者不调控状态 随机发牌
        if (this.realPlayerTotalBet === 0 || state === ControlState.NONE) {
            return sicboService.randomLottery(this);
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));

        let result: number[], win: number;
        for (let i = 0; i < 100; i++) {
            result = lottery();

            if (sicboService.containKillAreas(this, result)) {
                continue;
            }

            win = this.getRealPlayersProfit(result);

            // 如果是系统赢 则玩家收益小于等于总押注
            if (state === ControlState.SYSTEM_WIN && win <= 0) {
                break;
            }

            // 如果是系统输 则收益大于总押注
            if (state === ControlState.PLAYER_WIN && win > 0) {
                break;
            }
        }

        return result;
    }

    /**
     * 添加必杀区域
     * @param area 必杀的区域
     */
    public addKillArea(area: string): void {
        this.killAreas.add(area);
    }
}
