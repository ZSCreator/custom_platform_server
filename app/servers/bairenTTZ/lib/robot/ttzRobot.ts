
// 推筒子 或 推筒子庄 的机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import utils = require("../../../../utils");
import commonUtil = require("../../../../utils/lottery/commonUtil");
import robotBetUtil = require("../../../../utils/robot/robotBetUtil");
import RobotManagerDao from "../../../../common/dao/daoManager/Robot.manager";
import ttzConst = require('../ttzConst');
import mathUtil = require("../../../../utils/lottery/mathUtil");
import { get as getConfiguration } from "../../../../../config/data/JsonMgr";
import roomManager, { IsceneMgr } from '../ttzRoomMgr';
// 推筒子下注条件
/**庄家钱是否够赔付 */
const pl_totalBets: { roomId: string, totalBet: number, flag: false }[] = [];




export default class TTZRobot extends BaseRobot {
    playerGold: number = 0;
    playRound: number;
    leaveRound: number;
    richRobotUid: string;
    robotListLength: number;
    /**上庄条件 */
    upZhuangCond: number;
    /**是否庄家 */
    isBanker = false;
    /**上庄列表玩家数 */
    bankerLength: number = 0;
    /**最低下注要求 */
    lowBet: number;
    /**庄家信息 */
    zhuangInfo: ttzConst.IbairenTTZ_zj_info = null;
    ChipList: number[];
    constructor(opts) {
        super(opts);
        // this.playerGold = 0;
        this.playRound = 0;                                     // 当前轮数
        this.leaveRound = commonUtil.randomFromRange(50, 100);  // 离开轮数
        this.richRobotUid = '';                                 // 金币最多的机器人的 uid
        this.robotListLength = 0;                               // 房间中机器人的数量
    }

    // 加载
    async ttzLoaded() {
        try {
            const sceneInfo: IsceneMgr = getConfiguration('scenes/bairenTTZ').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            const data: ttzConst.IbairenTTZ_mainHandler_loaded = await this.requestByRoute(`bairenTTZ.mainHandler.loaded`, {});
            if (data.roomInfo.status == 'BETTING') {
            }
            this.upZhuangCond = data.roomInfo.upZhuangCond;
            this.lowBet = data.roomInfo.lowBet;
            if (!pl_totalBets.find(m => m.roomId == this.roomId)) {
                pl_totalBets.push({ roomId: this.roomId, totalBet: 0, flag: false });
            }
            this.playerGold = data.pl.gold;
            if (data.roomInfo.status == "BETTING") {
                const result: ttzConst.ITTZ_Start = { countdown: data.roomInfo.countdown, lotterys: null, isRenew: null, roundId: null, robotNum: null, gold: null }
                this.onTTZStartBet(result);
            }
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // 离开推筒子游戏
    async destroy() {
        await this.leaveGameAndReset(false);
    }

    // 检查是否离开
    checkLeave() {
        if (this.isBanker) {
            return false;
        }
        if (this.playerGold < this.lowBet || this.playRound > this.leaveRound) {
            return true;
        }
        // 如果当前机器人是钱最多的，离开
        return this.richRobotUid === this.uid;
    }

    /**收到通知后处理 */
    registerListener() {
        // 开始下注
        this.Emitter.on(`TTZ_BETTING`, this.onTTZStartBet.bind(this));
        this.Emitter.on("TTZ_Start", this.onTTZ_Start.bind(this));
        this.Emitter.on(`TTZ_OtherBets`, (data) => {
            if (data && data.uid == this.uid) {
                this.playerGold = data.gold;
            }
        });
        this.Emitter.on(`bairenTTZ_zj_info`, (data: ttzConst.IbairenTTZ_zj_info) => {
            if (data.zhuangInfo && data.zhuangInfo.uid == this.uid) {
                this.isBanker = true;
            } else {
                this.isBanker = false;
            }
            this.bankerLength = data.applyZhuangsNum;
            this.zhuangInfo = data;
        });
        this.Emitter.on("TTZ_Lottery", this.onSettlement.bind(this));
    }

    async onTTZ_Start(data: ttzConst.ITTZ_Start) {
        this.playerGold = data.gold;
        if (this.checkLeave()) {
            return this.destroy();
        }
        // 尝试申请上庄 
        this.checkBanker();
    }

    onSettlement() {
        let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
        if (pl_totalBet) {
            pl_totalBet.totalBet = 0;
            pl_totalBet.flag = false;
        }
    }
    // 推筒子下注
    async onTTZStartBet(data: ttzConst.ITTZ_Start) {
        if (this.isBanker) return;
        const betCountdown = data.countdown;
        const stopBetTimeStamp = Date.now() + betCountdown * 1000;

        const randomFactor = commonUtil.randomFromRange(1, 100);
        const { betArea, betArr } = robotBetUtil.getTTZBetInfo(randomFactor, this.sceneId, this.playerGold, this.ChipList);

        let delayTime = commonUtil.randomFromRange(400, 1000);
        const delayArr = mathUtil.divideSumToNumArr(betCountdown * 1000 - delayTime, betArr.length).filter(num => num >= 1000);
        // 第一次的延迟时间放在数组的头部
        delayArr.unshift(delayTime);

        /**如果是非系统庄家,则机器人下注金额不超过庄家可赔付金币的80% */
        if (this.zhuangInfo && this.zhuangInfo.zhuangInfo) {
            let delay = 1000;
            let zj_gold_peifu = this.zhuangInfo.zhuangInfo.gold * 0.6;
            let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
            pl_totalBet.totalBet += utils.sum(betArr);
            if (pl_totalBet.totalBet > zj_gold_peifu) {
                delay = 2000;
            }
            for (let idx = 0; idx < delayArr.length; idx++) {
                delayArr[idx] = delayArr[idx] + delay;
            }
        }

        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];

            if (Date.now() + delayTime >= stopBetTimeStamp) {
                break;
            }
            if (i > betArr.length - 1 || this.playerGold < betArr[i]) {
                continue;
            }
            try {
                let bets = { area: betArea, bet: betArr[i] };
                let res = await this.delayRequest(`bairenTTZ.mainHandler.userBet`, bets, delayTime);
                this.playerGold -= betArr[i];
            } catch (error) {
                break;
            }
        }
        this.playRound++;
    }

    /**
    *  是否申请上庄 上庄列表机器人数量
    */
    async checkBanker() {
        if (this.isBanker) {
            return;
        }

        const ranLess = commonUtil.randomFromRange(1, 100) <= 30;
        if (this.playerGold > this.upZhuangCond && ranLess && this.bankerLength <= 3) {
            try {
                // 满足条件申请上庄，申请过后不是立马当庄
                let res = await this.requestByRoute(`bairenTTZ.mainHandler.applyZhuang`, { apply: true });
            } catch (error) {
            }
        }
    }
}
