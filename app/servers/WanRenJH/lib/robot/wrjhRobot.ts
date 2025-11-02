/*
                   _ooOoo_
                  o8888888o
                  88" . "88
                  (| -_- |)
                  O\  =  /O
               ____/`---'\____
             .'  \\|     |//  `.
            /  \\|||  :  |||//  \
           /  _||||| -:- |||||-  \
           |   | \\\  -  /// |   |
           | \_|  ''\---/''  |   |
           \  .-\__  `-`  ___/-. /
         ___`. .'  /--.--\  `. . __
      ."" '<  `.___\_<|>_/___.'  >'"".
     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
     \  \ `-.   \_ __\ /__ _/   .-` /  /
======`-.____`-.___\_____/___.-`____.-'======
                   `=---='
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            佛祖保佑       永无BUG
*/
'use strict';
// 万人金花机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import utils = require("../../../../utils");
import * as commonUtil from "../../../../utils/lottery/commonUtil";
import RobotManagerDao from "../../../../common/dao/daoManager/Robot.manager";
import robotBetUtil = require('../../../../utils/robot/robotBetUtil');
import mathUtil = require("../../../../utils/lottery/mathUtil");
import { WanRenZJH_mainHandler_loaded } from "../interface/wrjh_interface";
import * as wrjh_interface from "../interface/wrjh_interface";
import { get as getConfiguration } from "../../../../../config/data/JsonMgr";
import roomManager, { IsceneMgr } from '../WanrenMgr';
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);

/**庄家钱是否够赔付 */
let pl_totalBets: { uid: string, roomId: string, totalBet: number, flag: false }[] = [];

export default class Robot extends BaseRobot {
    sumBets: number[];
    /**当前轮数 */
    nowLun: number = 0;
    /**离开轮数 */
    roundLun = utils.random(10, 50);
    bianlichishu: number = 0;
    isLeave: boolean;
    /**是否庄家 */
    isBanker = false;
    /**是否申请过庄家 */
    isApply = false;
    /**排队上庄人数 */
    ApplyCont = 0;
    gold: number;
    curBetNums: any;
    lowBet: number;
    compensate: number;
    /**上庄条件 */
    upZhuangCond: number;
    zj_sData: wrjh_interface.Iwr_onUpdateZhuangInfo = null;
    ChipList: number[];
    constructor(opts: any) {
        super(opts);
        this.sumBets = [0, 0, 0, 0];
        this.isLeave = false;
    }

    /**显示玩家 */
    async loaded() {
        try {
            const sceneInfo: IsceneMgr = getConfiguration('scenes/WanRenJH').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            if (!pl_totalBets.find(m => m.uid == this.uid)) {
                pl_totalBets.push({ uid: this.uid, roomId: this.roomId, totalBet: 0, flag: false });
            }
            let res: WanRenZJH_mainHandler_loaded = await this.requestByRoute("WanRenJH.mainHandler.loaded", {});
            this.compensate = res.room.compensate;
            this.lowBet = res.room.lowBet;
            this.upZhuangCond = res.room.upZhuangCond;
            this.gold = res.players.gold;
            let data: wrjh_interface.Iwr_start = {
                downTime: res.room.countdownTime,
                status: res.room.status,
                isRenew: 0
            };
            if (data.status == "BETTING") {
                this.compBet(data);
            }
            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async destroy() {
        this.isLeave = true
        await this.leaveGameAndReset()
        pl_totalBets = pl_totalBets.filter(m => m.uid != this.uid);
    }

    /**收到通知后处理 */
    registerListener() {
        this.Emitter.on("wr_onSettlement", this.onSettlement.bind(this))
        this.Emitter.on("wr_onBeting", this.onBet.bind(this));
        this.Emitter.on("wr_start", this.compBet.bind(this));
        this.Emitter.on("wr_onUpdateZhuangInfo", this.onUpdateZhuangInfo.bind(this))
    }

    onSettlement(data: { uid: string, gold: number }[]) {
        let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
        if (pl_totalBet) {
            pl_totalBet.totalBet = 0;
            pl_totalBet.flag = false;
        }
        const Me = data.find(c => c.uid == this.uid);
        if (Me) {
            this.gold = Me.gold;
        }
    }

    /**计算押注信息
     */
    async compBet(data: wrjh_interface.Iwr_start) {
        try {
            if (this.isLeave) {
                return;
            }
            this.nowLun++;
            this.bianlichishu = 0;
            if (this.nowLun > this.roundLun) {
                this.destroy();
                return;
            }
            // let  robot  = await RobotManagerDao.findOne({ uid: this.uid, });
            // this.gold = robot.gold;
            if (this.ApplyCont <= 3) {
                let ranLess = utils.random(1, 100);
                if (this.gold > this.upZhuangCond && ranLess <= 30 &&
                    !this.isApply && !this.isBanker) {
                    if (this.sceneId == 0 || (this.sceneId == 1 && this.gold >= this.lowBet * 300)) {
                        this.isApply = true;
                        let data = await this.requestByRoute("WanRenJH.mainHandler.applyUpzhuang", {})
                    }
                }
            }
            // 停止下注的时间戳：开奖前 1 秒
            const stopBetTimeOut = Date.now() + data.downTime * 1000 - 1000;
            let randomFactor = utils.random(1, 100);
            // 获取下注信息
            const { betArea, betArr } = robotBetUtil.getBullFightBetInfo(randomFactor,
                this.gold - this.lowBet, (this.zj_sData && this.zj_sData.zhuangInfo) ? this.zj_sData.zhuangInfo.gold : 0, this.ChipList);
            // 没有随机到下注金币，离开
            if (commonUtil.isNullOrUndefined(betArea) || commonUtil.isNullOrUndefined(betArr) || !betArr.length) {
                return await this.destroy();
            }

            let delayTime = commonUtil.randomFromRange(5000, 8000);
            const delayArr = mathUtil.divideSumToNumArr(data.downTime * 1000 - delayTime, betArr.length);
            // 第一次的延迟时间放在数组的头部
            delayArr.unshift(delayTime);
            let sumCount = 0;//已经下注金额


            /**如果是非系统庄家,则机器人下注金额不超过庄家可赔付金币的80% */
            if (this.zj_sData && this.zj_sData.zhuangInfo) {
                let delay = 1000;
                let zj_gold_peifu = this.zj_sData.zhuangInfo.gold / this.compensate * 0.6;
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
                // 如果 当前时间+随机的延迟时间 超过了下注截止时间、或者不是下注状态，或者不是庄家，则停止下注
                if (Date.now() + delayTime >= stopBetTimeOut || this.isBanker) {
                    break;
                }
                if (i > betArr.length - 1) {
                    break;
                }
                /**不超过自己金币 */
                sumCount = sumCount + betArr[i];
                if (sumCount * this.compensate > this.gold)
                    continue;

                try {
                    // 延迟下注
                    await this.delayRequest('WanRenJH.mainHandler.bet', {
                        betNum: betArr[i],
                        area: betArea
                    }, delayTime)
                    // 减金币
                    this.gold -= betArr[i];
                } catch (error) {
                    robotlogger.info(`wrjh|${this.isBanker}|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
                    break;
                }
            }
        } catch (error) {
            robotlogger.error(error);
        }
    }

    async onUpdateZhuangInfo(data: wrjh_interface.Iwr_onUpdateZhuangInfo) {
        this.ApplyCont = data.applyZhuangs.length;
        this.zj_sData = data;
        if (data.zhuangInfo && data.zhuangInfo.uid == this.uid) {
            this.isBanker = true;
            this.isApply = false;
        } else {
            this.isBanker = false;
        }
    }

    //监听押注事件
    async onBet(res) {
        if (res.sumBets) {
            this.sumBets = res.sumBets;
            this.curBetNums = res.sumBets;
        }
    }
}