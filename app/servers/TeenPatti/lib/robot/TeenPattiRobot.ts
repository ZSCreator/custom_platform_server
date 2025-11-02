'use strict';

// 三张牌机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import * as commonUtil from "../../../../utils/lottery/commonUtil";
import zhaJinHuaRobotActionService = require("./TeenPattiRobotActionService");
import gameUtil3 = require('../TeenPatti_logic');
import * as JsonMgr from '../../../../../config/data/JsonMgr';
import utils = require('../../../../utils');
import { ZJH_onFahua_interface } from '../TeenPatti_interface';
import * as TeenPatti_interface from '../TeenPatti_interface';
import * as TeenPatti_logic from '../TeenPatti_logic';
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);

// 土豪场：20，40，100，200
// 大师场：10，20，50，100
// 精英场：5，10，25，50
// 休闲场：1，2，5，10
const bet_arr = [
    [100, 200, 500, 1000],
    [500, 1000, 2500, 5000],
    [1000, 2000, 5000, 10000],
    [2000, 4000, 10000, 20000],
]

export default class ZhaJinHuaRobot extends BaseRobot {
    /**玩牌局数 */
    playRound: number = 0;
    playerGold: number = 0;
    /**座位号 */
    seat: number;
    /**不翻倍的底注 */
    betNum: number;
    /**封顶 */
    multipleLimit: number = 0;
    lowBet: number = 0;
    entryCond: number = 0;
    // status: 'READY' | 'GAME' | 'INWAIT' | 'NONE' = "NONE";
    /**进入房间的初始金币 */
    initGold: number = 0;
    /**有人比牌 */
    bipai_num: number = 0;
    /**真为已看牌 */
    iskanpai: boolean = false;
    apply_kanpai = false;
    zjhConfig: any;
    /**已看牌玩家size */
    Kanpai_size: number = 0;
    /**玩家数量，包括机器人和真实玩家 */
    Player_size: number;
    /**加注次数 */
    Fill_num: number = 0;
    /**跟注次数 */
    cingl_num = 0;
    /**状态 INWAIT.等待 INGAME.游戏中 END.回合结束 */
    room_status: string = 'NONE';
    /**豹子5 > 顺金4 > 金花3 > 顺子2 > 对子1 > 单张0 */
    cards_type: number = 0;
    /**名次 */
    rank: number = 0;
    /**手牌 */
    Holds: number[] = [];
    /**手牌分类，独立于一般的分类 */
    Holds_type: "" | "Y1" | "Y2" | "Y3" | "Y4" | "Y5" | "Y6" | "Y7" = "";
    record_history: { uid: string, oper_type: string, update_time: string }[] = [];
    /**弃牌后 true*/
    isfold: boolean = false;
    isInit: boolean = false;
    /**记录下一把操作 */
    next_action = "";
    rejectBiPai = 0;
    /**可以拒绝几次比牌 */
    rejectBiPai_numb = 0;
    constructor(opts: any) {
        super(opts);
        this.seat = opts.seat;// 座位号
        this.betNum = opts.betNum;
        this.zjhConfig = JsonMgr.get('robot/zjhConfig').datas;
    }

    //加载
    async Loaded() {
        try {
            const loadedData = await this.requestByRoute('TeenPatti.mainHandler.loaded', {});
            this.seat = loadedData.seat;
            // 加载之后，可以准备
            this.room_status = loadedData.room.status;
            this.lowBet = loadedData.lowBet;
            this.playerGold = loadedData.room.players.find(c => c && c.uid == this.uid);
        } catch (error) {
            robotlogger.warn(`TeenPatti|${this.uid}|${JSON.stringify(error)}`);
            return Promise.reject(error);
        }
    }

    // 离开
    async destroy() {
        await this.leaveGameAndReset(false);
        this.zjhConfig = null;
    }

    // 注册监听器
    registerListener() {
        // 监听有人操作
        this.Emitter.on("TeenPatti_onOpts", this.onZhaJinHuaOpts.bind(this));
        // 结算
        this.Emitter.on("TeenPatti_onSettlement", this.onZhaJinHuaSettle.bind(this));
        // 发话
        this.Emitter.on("TeenPatti_onFahua", this.msg_jh_oper_c.bind(this));

        //监听发牌
        this.Emitter.on("TeenPatti_onDeal", (data) => {
            // 获取所有人牌信息
            // this.zhaJinHuaGetInning();
        });
        this.Emitter.on("TeenPatti_test", (data) => {
            // robotlogger.warn(this.data.fahuaIdx, this.seat);
            // for (const oper of this.record_history) {
            //     robotlogger.warn(`${oper.uid}|${oper.oper_type}|${oper.update_time}`);
            // }
        });
    }

    // 监听有人操作
    onZhaJinHuaOpts(optsData) {
        if (optsData.type == 'kanpai') {
            this.Kanpai_size++;
            if (optsData.seat == this.seat) {
                this.iskanpai = true;
            }
        }
        else if (optsData.type == 'filling') {
            this.Fill_num++;
        }
        else if (optsData.type == 'applyBipai') {
            /**收到比牌申请 */
            if (optsData.other == this.seat) {
                let type = 0;
                let ran = commonUtil.randomFromRange(1, 100);
                if (this.Holds_type == 'Y2' ||
                    this.Holds_type == 'Y3') {

                } else if ((this.Holds_type == "Y4" || this.Holds_type == "Y5") && ran <= 50) {
                    type = 1;
                } else if (this.Holds_type == "Y6" || this.Holds_type == "Y7") {
                    this.rejectBiPai_numb--;
                    if (this.rejectBiPai_numb == 0 && ran <= 50) {
                        type = 1;
                    }
                }

                this.handler_agreeBiPai(type);
            }
            this.bipai_num++;
        }
        else if (optsData.type == "rejectBiPai") {
            /**收到比牌申请 */
            if (optsData.other == this.seat) {
                this.rejectBiPai++;
                if (this.Holds_type == 'Y2' ||
                    this.Holds_type == 'Y3') {
                    this.next_action = "Fold";
                }
                else if (this.rejectBiPai >= 2 && (this.Holds_type == "Y4" || this.Holds_type == "Y5")) {
                    this.next_action = "Fold";
                }
            }
            this.bipai_num++;
        } else if (optsData.type == "cingl") {
            this.cingl_num++;
        }
    }

    /**结算 */
    onZhaJinHuaSettle(settleData: TeenPatti_interface.IZJH_onSettlement) {
        this.clear_delayRequest_time();
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }

    /**发话 */
    async msg_jh_oper_c(data_: ZJH_onFahua_interface) {
        const time = `${utils.random(0, 9)}${utils.random(0, 9)}${utils.random(0, 9)}${utils.random(0, 9)}`;
        // this.record_history.push({ uid: this.uid, oper_type: `oper_c|${time}|${data_.fahuaIdx}|${this.seat}|${this.iskanpai}`, update_time: utils.cDate() });
        let ran = commonUtil.randomFromRange(1, 100);
        if (this.isfold) return;
        this.betNum = data_.betNum;
        let flag = this.multipleLimit / 2 == this.betNum ? true : false;
        // 发话人不是自己
        if (data_.fahuaIdx !== this.seat) {
            // if (data_.canBipai == true) {
            if (data_.canKanpai && ran <= 50) {
                await this.handler_kanpai(data_, 1, time);
            }
            // }
            return;
        }
        if (data_['max_uid'] == this.uid && data_.isControl) {
            this.Holds_type = "Y7";
        }
        if (this.iskanpai) {
            return this.afterSee(data_, time);
        }
        /**暗牌阶段 */
        // 无人看牌和无人跟注
        if (this.Kanpai_size == 0 && this.Fill_num == 0 && this.cingl_num == 0) {
            if (ran <= 30) {
                return this.handler_Cingl(time);
            } else if (ran >= 31 && ran <= 40) {
                return this.handler_Filling();
            } else {
                await this.handler_kanpai(data_, 2, null); // 看牌之后 1-3 秒调用 afterSee
                return this.afterSee(data_, time);
            }
        } else {
            // 有人看牌跟注
            if (ran <= 5) {
                return this.handler_Cingl(time);
            } else if (ran >= 6 && ran <= 10) {
                return this.handler_Filling();
            } else {
                await this.handler_kanpai(data_, 2, null); // 看牌之后 1-3 秒调用 afterSee
                return this.afterSee(data_, time);
            }
        }
    }
    // 看牌后的操作
    async afterSee(data: ZJH_onFahua_interface, time: string) {
        let flag = this.multipleLimit / 2 == this.betNum ? true : false;
        let ran = commonUtil.randomFromRange(1, 100);
        let actionState = "";
        if (this.Holds_type == "Y1") {
            actionState = "Fold";
        } else if (this.Holds_type == "Y2") {
            if (this.bipai_num > 0) {
                actionState = "Fold";
            } else {
                if (this.Fill_num + this.cingl_num > 0 && ran <= 50) {
                    actionState = "Fold";
                } else {
                    actionState = "bipai";
                }
            }
        } else if (this.Holds_type == "Y3") {
            if (this.bipai_num >= 2) {
                actionState = ran >= 50 ? "Fold" : "bipai";
            } else if (this.Fill_num > 0) {
                actionState = ran >= 50 ? "Fold" : "bipai";
            } else if (this.cingl_num >= 3) {
                actionState = "Fold";
            } else {
                actionState = "bipai";
            }
        } else if (this.Holds_type == "Y4") {
            if (this.bipai_num >= 2 || this.Fill_num >= 0 || this.cingl_num >= 3 ||
                data.totalBet >= this.lowBet * 16) {
                actionState = "bipai";
            } else {
                actionState = ran >= 50 ? "Fold" : "bipai";
                if (data.max_uid == this.uid) {
                    actionState = "bipai";
                }
            }
        } else if (this.Holds_type == "Y5") {
            if (this.Kanpai_size >= 4 || data.totalBet >= this.lowBet * 32) {
                actionState = "bipai";
            } else {
                actionState = ran >= 50 ? "Cingl" : "filling";
            }
        } else if (this.Holds_type == "Y6") {
            if (data.totalBet >= this.lowBet * 32) {
                actionState = "bipai";
            } else {
                actionState = ran >= 50 ? "Cingl" : "filling";
            }
        } else if (this.Holds_type == "Y7") {
            actionState = ran >= 50 ? "Cingl" : "filling";
        }

        if (actionState == "bipai" && data.canBipai == false) {
            actionState = "Cingl";
        }
        if (this.next_action != "" && data.max_uid != this.uid) {
            actionState = this.next_action;
        }
        if (data.max_uid == this.uid && actionState == "Fold") {
            actionState = "bipai";
        }
        // console.warn("actionState", this.uid, actionState);
        switch (actionState) {
            case "Cingl":// 跟注
                if (this.playerGold < this.betNum * (data.member_num + 1) * 2) {
                    await this.handler_ApplyAndBiPai(time);
                } else {
                    await this.handler_Cingl(time);
                }
                break;
            case "bipai":
                // 申请比牌，然后比牌
                await this.handler_ApplyAndBiPai(time);
                break;
            case "Fold":
                // 弃牌
                await this.handler_Fold(commonUtil.randomFromRange(1050, 3000));
                break;
            case "filling":
                if (this.playerGold < this.betNum * (data.member_num + 1) * 2) {
                    await this.handler_ApplyAndBiPai(time);
                } else if (this.betNum >= this.multipleLimit * this.lowBet) {
                    // 如果上一个人已经是顶注，只能跟注
                    await this.handler_Cingl(time);
                } else {
                    // 还可以加注
                    await this.handler_Filling();
                }
                break;
            default:
                console.warn("actionState", 1000000, this.isInit, this.Holds_type, utils.cDate());
                break;
        }
    }

    /**看牌 */
    async handler_kanpai(data: ZJH_onFahua_interface, flag: number, time: string) {
        let delayTime = commonUtil.randomFromRange(1050, 3000);
        if (flag == 1) delayTime = 10;
        if (this.apply_kanpai) return;
        this.apply_kanpai = true;
        try {
            const res = await this.delayRequest('TeenPatti.mainHandler.kanpai', {}, delayTime);
            const { holds, type } = res;
            this.iskanpai = true;
            this.Holds = holds.cards;
            this.cards_type = holds.type;
            this.Holds_type = TeenPatti_logic.getAi_type(this.Holds, this.cards_type);
            if (data['max_uid'] == this.uid && data.isControl) {
                this.Holds_type = "Y7";
            }
            if (this.Holds_type == "Y6") {
                this.rejectBiPai_numb = 1;
            } else if (this.Holds_type == "Y7") {
                this.rejectBiPai_numb = 2;
            }
            this.record_history.push({ uid: this.uid, oper_type: `kanpai|${time}|${flag}`, update_time: utils.cDate() });
        } catch (error) {
            robotlogger.warn(`TeenPatti|KanPai|${this.uid}|${this.iskanpai}|${data.roundTimes}|${JSON.stringify(error)}`);
            for (const oper of this.record_history) {
                robotlogger.warn(`${oper.uid}|${oper.oper_type}|${oper.update_time}`);
            }
        }
    }

    /**跟注 */
    async handler_Cingl(time: string) {
        const delayTime = commonUtil.randomFromRange(1000, 3000)
        try {
            let res = await this.delayRequest("TeenPatti.mainHandler.cingl", {}, delayTime);
            this.record_history.push({ uid: this.uid, oper_type: `cingl_2|${time}`, update_time: utils.cDate() });
            this.playerGold = res.gold;
        } catch (error) {
            robotlogger.warn(`TeenPatti|Cingl|${this.uid}|${JSON.stringify(error)}`);
        }
    }

    // 申请比牌后再比牌
    async handler_ApplyAndBiPai(time: string) {
        try {
            const delayTime = commonUtil.randomFromRange(1000, 3000);
            const res = await this.delayRequest("TeenPatti.mainHandler.applyBipai", {}, delayTime);
            this.record_history.push({ uid: this.uid, oper_type: `applyBipai_2|${time}`, update_time: utils.cDate() });
        } catch (error) {
            robotlogger.warn(`TeenPatti|applyBipai|${this.uid}|${JSON.stringify(error)}`);
            // 弃牌
            await this.handler_Cingl("");
        }
    }

    // 加注
    async handler_Filling() {
        try {
            let delayTime = commonUtil.randomFromRange(1000, 3000);
            let res = await this.delayRequest("TeenPatti.mainHandler.filling", {}, delayTime);
            this.record_history.push({ uid: this.uid, oper_type: 'filling', update_time: utils.cDate() });
            this.betNum = res.betNum;
            this.playerGold = res.gold;
        } catch (error) {
            robotlogger.warn(`TeenPatti|Filling|${this.uid}|${JSON.stringify(error)}`);
        }
    }

    // 弃牌
    async handler_Fold(delayTime: number) {
        try {
            const cinglRoute = 'TeenPatti.mainHandler.fold';
            await this.delayRequest(cinglRoute, { roomId: this.roomId }, delayTime);
            this.record_history.push({ uid: this.uid, oper_type: `fold|${delayTime}`, update_time: utils.cDate() });
            this.isfold = true;
        } catch (error) {
            robotlogger.warn(`TeenPatti|Fold|${this.uid}|${JSON.stringify(error)}`);
        }
    }
    /**type 0同意比牌 1拒绝比牌 */
    async handler_agreeBiPai(type: number) {
        let delayTime = utils.random(1000, 3000);
        this.delayRequest("TeenPatti.mainHandler.agreeBiPai", { type: type }, delayTime);
    }
}

