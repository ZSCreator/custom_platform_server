import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import bairenConst = require('./constant/bairenConst');
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { BaiRenRoomImpl } from './BaiRenRoomImpl';
import * as mailModule from '../../../modules/mailModule';
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
// 一个玩家
export class BaiRenPlayerImpl extends PlayerInfo {
    /**回合盈利 */
    profit: number = 0;
    /**进入房间的总盈利 */
    totalProfit: number[] = [];
    /**当局下注 */
    bet: number = 0;
    /**回合总下注 */
    totalBet: number[] = [];
    /**续压用 */
    lastBets: { area: number, bet: number }[] = [];
    /**中奖区域 */
    regions_chang_gold: { area: number, chang_gold: number }[] = [];
    // 玩家调控状态
    controlState: CommonControlState = CommonControlState.RANDOM;
    /**20局 胜利 回合 */
    winRound = 0;
    /**待机轮数 */
    standbyRounds = 0;
    betList: { area: number; bet: number; profit: number; }[];
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(opts) {
        super(opts);
        this.initgold = this.gold;
        this.Initialization();
    }

    Initialization() {
        /**天地玄黄 对应下注 */
        this.betList = [
            { area: 0, bet: 0, profit: 0 },
            { area: 1, bet: 0, profit: 0 },
            { area: 2, bet: 0, profit: 0 },
            { area: 3, bet: 0, profit: 0 }
        ];
    }

    // 初始游戏信息
    initGame(roomInfo: BaiRenRoomImpl) {
        this.standbyRounds++;
        if (this.bet) {
            this.totalProfit.push(this.profit > 0 ? this.profit : 0);
            this.totalBet.push(this.bet);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.lastBets = [];
            for (const situation of roomInfo.situations) {
                for (const c of situation.betList) {
                    if (c.uid == this.uid) {
                        this.lastBets.push({ area: situation.area, bet: c.bet });
                    }
                }
            }
            this.standbyRounds = 0;
        }
        if (roomInfo.zhuangInfo.uid == this.uid || roomInfo.zj_queues.find(c => c.uid == this.uid)) {
            this.standbyRounds = 0;
        }

        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
        this.Initialization();
        this.regions_chang_gold = [];
        this.profit = 0;// 当前收益
        this.bet = 0;//当前押注
        this.controlState = CommonControlState.RANDOM;
        this.initControlType();
    }

    /**结算 */
    settlementBairenPlayer(regions: bairenConst.IBaiRenRegions[]) {
        for (let i = this.betList.length - 1; i >= 0; i--) {
            if (this.betList[i].bet > 0) {
                this.betList[i].profit = (regions[i].isWin ? 1 : -1) * (regions[i].multiple * this.betList[i].bet);
                this.profit += this.betList[i].profit;
                this.regions_chang_gold.push({ area: this.betList[i].area, chang_gold: this.betList[i].profit });
            }
        }
    }

    /**结算信息 - 参与发送邮件 */
    toSettlementInfoByMail() {
        return {
            uid: this.uid,
            profit: this.profit,
            bet: this.bet,
            bets: this.betList
        }
    }

    // 返回给前端
    result() {
        return {
            uid: this.uid,
            gold: this.gold,
            profit: this.profit,
            bet: this.bet,
            nickname: this.nickname,
            headurl: this.headurl,
            bets: this.betList,
        };
    }

    strip(hasRound) {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            gold: this.gold,
            profit: this.profit,
            hasRound: hasRound,
        };
    }

    strip1() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            bet: this.bet,
            gold: this.gold,
            isRobot: this.isRobot,
        };
    }

    //排行榜数据包装
    strip2() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            profit: this.profit,
            bets: this.betList,
        };
    }

    /**是否可以续压 */
    isCanRenew() {
        if (this.isRobot == 2) {
            return 0;
        }
        let tatalBet = this.lastBets.reduce((total, Value) => {
            total += Value.bet;
            return total;
        }, 0);
        if (tatalBet > this.gold) {
            return 0;
        }
        return this.lastBets.length;
    }
    loadedStrip() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            bet: this.bet,
            gold: this.gold,
        };
    }

    /**玩家投注 */
    handler_bet(roomInfo: BaiRenRoomImpl, RecordBets: { area: number, bet: number }[]) {
        for (const RecordBet of RecordBets) {
            this.betList[RecordBet.area].bet += RecordBet.bet;
            this.bet += RecordBet.bet;

            let situation = roomInfo.situations.find(m => m.area == RecordBet.area);
            if (!situation) {
                roomInfo.situations.push({ area: RecordBet.area, betList: [], totalBet: 0 });
                situation = roomInfo.situations.find(m => m.area == RecordBet.area);
            }
            situation.betList.push({
                uid: this.uid,
                bet: RecordBet.bet,
                updatetime: new Date().getTime() / 1000
            });
            situation.totalBet += RecordBet.bet;
        }
        let opts = {
            uid: this.uid,
            betList: RecordBets,
            list: roomInfo.rankingLists().slice(0, 6)
        }
        roomInfo.channelIsPlayer('br_onBeting', opts);
    }

    /**
     * 获取超限押注
     * @param params
     */
    checkOverrunBet(params: { condition: number }): CommonControlState[] {
        return this.betList.map(betNumber => {
            return betNumber.bet >= params.condition * 100 ? CommonControlState.LOSS : CommonControlState.RANDOM;
        });
    }

    /**
     * 设置玩家调控状态
     */
    setControlState(params: { state: CommonControlState }): void {
        this.controlState = params.state;
    }

    /**
     * 过滤掉被杀的区域
     * @param killAreas 必杀区域
     */
    filterBetNum(killAreas: Set<number>) {
        let bet = 0;

        this.betList.forEach((area, index) => {
            if (!killAreas.has(index)) {
                bet += area.bet;
            }
        });

        return bet;
    }

    /**更新玩家金币 */
    async updateGold(roomInfo: BaiRenRoomImpl) {
        if (this.uid != roomInfo.zhuangInfo.uid && this.bet == 0) {
            return;
        }
        if (this.uid == roomInfo.zhuangInfo.uid) {
            this.bet = Math.abs(this.profit);
        }
        let validBet = this.bet;
        if (Math.abs(this.profit) > this.bet && this.profit < 0) {
            validBet = Math.abs(this.profit);
        }
        let result = {
            uid: this.uid,
            banker: (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == this.uid) ? true : false,
            area: this.betList,
            Kaijiang_area: roomInfo.lotterys,
            zhuangResult: roomInfo.zhuangResult,
            regions_chang_gold: this.regions_chang_gold
        };

        const res = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .addResult(roomInfo.zipResult)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.bet), validBet, this.profit, roomInfo.zhuangInfo.uid === this.uid)
            .setGameRecordLivesResult(result)
            .sendToDB(1);
        this.profit = res.playerRealWin;
        this.gold = res.gold;
        this.initgold = this.gold;
        //记录庄家累计收益
        if (roomInfo.zhuangInfo.uid === this.uid) {
            roomInfo.zhuangInfo.money += this.profit;
        }
        //添加跑马灯
        this.profit > 0 && roomInfo.addNote(this);

        //给离线玩家发送邮件
        // !this.onLine && mailModule.changeGoldsByMail(roomInfo, this);
    }
}
