'use strict';

// 三张牌机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import * as commonUtil from "../../../../utils/lottery/commonUtil";
import zhaJinHuaRobotActionService = require("./GoldenFlowerRobotActionService");
import GoldenFlower_logic = require('../GoldenFlower_logic');
import * as JsonMgr from '../../../../../config/data/JsonMgr';
import utils = require('../../../../utils/index');
import { IZJH_onFahua } from '../GoldenFlower_interface';
import * as GoldenFlower_interface from '../GoldenFlower_interface';
import { getLogger } from 'pinus-logger';
const logger = getLogger('robot_out', __filename);



export default class ZhaJinHuaRobot extends BaseRobot {
    /**座位号 */
    seat: number;
    /**玩家加 跟 金额 */
    betNum: number;
    /**封顶 */
    capBet: number = 0;
    /**底注 */
    lowBet: number = 0;
    // entryCond: number = 0;
    status: 'READY' | 'GAME' | 'INWAIT' | 'NONE' = "NONE";
    /**真为已看牌 */
    iskanpai: boolean = false;
    players: {
        seat: number,
        kanpai: boolean,
        /**对手累计 明注加注  */
        OR: number;
        /**对手累计 明注跟注 */
        OC: number;
        fold: boolean;
    }[] = [];
    /**对手累计 明注加注  */
    OR: number = 0;
    /**对手累计 明注跟注 */
    OC: number = 0;
    /**状态 INWAIT.等待 INGAME.游戏中 END.回合结束 */
    room_status: string = 'NONE';
    /**豹子5 > 顺金4 > 金花3 > 顺子2 > 对子1 > 单张0 */
    cards_type: number = 0;
    /**手牌 */
    Holds: number[] = [];
    /**手牌分类，独立于一般的分类 */
    Holds_type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 = 0;
    /**总看牌人数 */
    total_Player_size = 0;
    bipai_num = 0;
    //标识操作过一次
    OperOne = false;
    constructor(opts: any) {
        super(opts);
        this.seat = opts.seat;// 座位号
        this.betNum = opts.betNum;
    }

    //加载
    async zhaJinHuaLoaded() {
        try {
            const loadedData = await this.requestByRoute('GoldenFlower.mainHandler.loaded', {});
            this.seat = loadedData.seat;
            this.capBet = loadedData.capBet;
            this.lowBet = loadedData.lowBet;
            // 加载之后，可以准备
            // this.room_status = loadedData.room.status;
        } catch (error) {
            logger.warn(`zhaJinHuaLoaded|${this.uid}|${JSON.stringify(error)}`);
            return Promise.reject(error);
        }
    }

    // 离开
    async destroy() {
        await this.leaveGameAndReset(false);
        // this.zjhConfig = null;
    }

    // 注册监听器
    registerListener() {
        // 监听有人操作
        this.Emitter.on("ZJH_onOpts", this.onZhaJinHuaOpts.bind(this));
        // 结算
        this.Emitter.on("ZJH_onSettlement", this.onZhaJinHuaSettle.bind(this));
        // 发话
        this.Emitter.on("ZJH_onFahua", this.msg_GoldenFlower_oper_c.bind(this));

        //监听发牌
        this.Emitter.on("ZJH_onDeal", (data) => {
            this.players = data.players.map(c => {
                return {
                    seat: c.seat,
                    kanpai: false,
                    fold: false,
                    OR: 0,
                    OC: 0
                }
            });
            this.room_status == "INGAME";
        });
    }

    // 监听有人操作
    onZhaJinHuaOpts(optsData) {
        let temp = this.players.find(c => c.seat == optsData.seat);
        if (optsData.type == 'kanpai') {
            if (temp) {
                temp.kanpai = true;
            }
            this.total_Player_size++;
            this.betNum = optsData.betNum;
        }
        else if (optsData.type == 'filling') {
            this.betNum = optsData.betNum;
            if (temp.kanpai) {
                if (optsData.seat != this.seat) {
                    this.OR++;
                }
                temp.OR++;
            }
        }
        else if (optsData.type == 'cingl') {
            if (temp.kanpai) {
                if (optsData.seat != this.seat) {
                    this.OC++;
                }
                temp.OC++;
            }
        }
        else if (optsData.type == 'bipai') {
            if (optsData["iswin"] == false) {
                if (temp) {
                    temp.fold = true;
                }
            } else {
                let other = this.players.find(c => c.seat == optsData.other);
                if (other) {
                    other.fold = true;
                }
                temp.OC++;
            }
            this.OC++;
            if (optsData.seat != this.seat && optsData.other != this.seat) {
                this.bipai_num++;
            }
            this.betNum = optsData.betNum;
        } else if (optsData.type == "allin") {
            this.bipai_num++;
        } else if (optsData.type == "fold") {
            if (temp) {
                temp.fold = true;
            }
        }
    }

    /**结算 */
    onZhaJinHuaSettle(settleData: GoldenFlower_interface.IZJH_onSettlement) {
        this.clear_delayRequest_time();
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
    //发话
    async msg_GoldenFlower_oper_c(data: IZJH_onFahua) {
        /**活者得场人数 */
        const delayTime = commonUtil.randomFromRange(1000, 3000);
        this.betNum = data.betNum;
        let rand = commonUtil.randomFromRange(1, 100);
        const rand2 = commonUtil.randomFromRange(1, 100);
        if (data.fahuaIdx !== this.seat) {
            if (this.OperOne && !this.iskanpai && rand <= 20) {
                await this.zhaJinHuaKanPai();
            }
            return;
        }
        this.OperOne = true;
        if (data.roundTimes == 1) {
            if (this.betNum == this.lowBet) {
                if (rand <= 80) {
                    await this.zhaJinHuaCingl(delayTime);
                    return;
                } else {
                    // 还可以加注
                    if (rand2 <= 85) {
                        await this.zhaJinHuaFilling(this.lowBet * 2);
                        return;
                    } else if (rand2 <= 95) {
                        await this.zhaJinHuaFilling(this.lowBet * 5);
                        return;
                    }
                    await this.zhaJinHuaFilling(this.lowBet * 10);
                    return;
                }
            } else if (this.betNum == this.lowBet * 2) {
                if (rand <= 90) {
                    await this.zhaJinHuaCingl(delayTime);
                    return;
                } else {
                    // 还可以加注
                    if (rand2 <= 50) {
                        await this.zhaJinHuaFilling(this.lowBet * 5);
                        return;
                    }
                    await this.zhaJinHuaFilling(this.lowBet * 10);
                    return;
                }
            } else if (this.betNum == this.lowBet * 5) {
                if (rand <= 95) {
                    await this.zhaJinHuaCingl(delayTime);
                    return;
                } else {
                    await this.zhaJinHuaFilling(this.lowBet * 10);
                    return;
                }
            }
            if (this.betNum > this.lowBet) {
                await this.zhaJinHuaCingl(delayTime);
                return;
            }
        }
        /**正式阶段 */
        if (this.total_Player_size == 0) {//①　无人看牌 情况
            // let rand = commonUtil.randomFromRange(1, 100);
            if (rand <= 20) {
                await this.zhaJinHuaCingl(delayTime);
                return;
            } else if (rand > 20 && rand <= 25) {
                if (this.betNum == this.lowBet) {
                    await this.zhaJinHuaFilling(this.lowBet * 2);
                    return;
                } else if (this.betNum == 2 * this.lowBet) {
                    await this.zhaJinHuaFilling(this.lowBet * 5);
                    return;
                }
                await this.zhaJinHuaCingl(delayTime);
                return;
            } else {
                await this.zhaJinHuaKanPai();
            }
        }
        /**本轮无明注（无人看牌后跟注或加注） */
        if (!this.iskanpai) {
            if (rand <= 10) {
                return this.fn1([0, 100, 0, 0], data);
            } else if (rand > 10 && rand <= 15) {
                return this.fn1([0, 0, 100, 0], data);
            } else {
                await this.zhaJinHuaKanPai();
            }
        }
        // F C R S
        // 弃 跟 加 比
        let action_ran = [0, 0, 0, 100];
        let ret = this.rule1(data);
        if (ret != null) {
            return this.fn1(ret, data);
        }
        let ret2 = this.rule2(data);
        let ret3 = this.rule3(data);
        if (ret2 != null) {
            if (ret3[0] > 0) {
                action_ran = ret3;
            } else {
                action_ran = ret2;
            }
        } else {
            action_ran = ret3;
        }
        if (data['max_uid'] == this.uid) {
            action_ran[0] = 0;
            action_ran[1] += 10;
        }
        return this.fn1(action_ran, data);
    }
    rule1(data: IZJH_onFahua) {
        //第三轮开始 只剩两家暗牌则比牌
        //5个人玩，就剩你我还在闷，其他都弃牌了
        // const pl = this.players.find(pl => pl && pl.seat == this.seat);
        if (data.roundTimes >= 3) {
            if (this.players.filter(pl => pl && !pl.kanpai).length >= 2) {
                let action_ran = [0, 0, 0, 50];
                return action_ran;
            }
        }
        return null
    }

    rule2(data: IZJH_onFahua) {
        // F C R S
        // 弃 跟 加 比
        let action_ran = [0, 0, 0, 100];
        const pls = this.players.filter(pl => pl && pl.kanpai == true && pl.seat != this.seat);
        for (const pl of pls) {
            if ([1, 2, 3].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 1) {
                    return action_ran;
                }
            } else if ([4].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 2) {
                    return action_ran;
                }
            } else if ([5].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 3) {
                    return action_ran;
                }
            } else if ([6].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 5) {
                    return action_ran;
                }
            } else if ([7].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 8) {
                    return action_ran;
                }
            } else if ([8].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 12) {
                    return action_ran;
                }
            } else if ([9].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 16) {
                    return action_ran;
                }
            } else {
            }
        }
        return null;
    }
    rule3(data: IZJH_onFahua) {
        // F C R S
        // 弃 跟 加 比
        let action_ran = [0, 0, 0, 100];
        if (this.players.length == 2) {
            if ([1].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [90, 5, 5, 0];
                    // } else if (this.OR == 0 && this.OC >= 2) {
                    // action_ran = [100, 0, 0, 0];
                    // } else if (this.OC > 2) {
                    // action_ran = [100, 0, 0, 0];
                } else {
                    action_ran = [100, 0, 0, 0];
                }
            } else if ([2].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [5, 40, 40, 20];
                    // } else if (this.OR == 0 && (this.OC == 1 || this.OC == 2)) {
                    // action_ran = [10, 20, 10, 60];
                    // } else if (this.OC > 2) {
                    // action_ran = [50, 0, 0, 50];
                } else {
                    action_ran = [60, 0, 0, 40];
                }
            } else if ([3].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                    // } else if (this.OR == 0 && (this.OC == 1 || this.OC == 2)) {
                    // action_ran = [0, 30, 0, 70];
                    // } else if (this.OC > 2) {
                    // action_ran = [0, 0, 0, 100];
                } else {
                    action_ran = [0, 20, 20, 60];
                }
            } else {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                    // } else if (this.OR == 0 && (this.OC == 1 || this.OC == 2)) {
                    // action_ran = [0, 50, 50, 0];
                } else if (this.OC > 1) {
                    action_ran = [0, 50, 50, 0];
                } else if (this.OR >= 1) {
                    action_ran = [0, 50, 50, 0];
                }
            }
        } else if (this.players.length == 3) {
            if ([1, 2].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [90, 5, 5, 0];
                } else if (this.OR == 0 && this.OC >= 2) {
                    action_ran = [100, 0, 0, 0];
                } else if (this.OC > 2) {
                    action_ran = [100, 0, 0, 0];
                } else {
                    action_ran = [50, 0, 0, 50];
                }
            } else if ([3].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 60, 20, 20];
                } else if (this.OR == 0 && (this.OC == 1 || this.OC == 2)) {
                    action_ran = [10, 20, 10, 60];
                } else if (this.OC > 2) {
                    action_ran = [50, 0, 0, 50];
                } else {
                    action_ran = [50, 0, 0, 50];
                }
            } else if ([4].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                } else if (this.OR == 0 && (this.OC == 1 || this.OC == 2)) {
                    action_ran = [0, 30, 0, 70];
                } else if (this.OC > 2) {
                    action_ran = [0, 0, 0, 100];
                } else {
                    action_ran = [0, 20, 20, 60];
                }
            } else {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                } else if (this.OR == 0 && (this.OC == 2 || this.OC == 3)) {
                    action_ran = [0, 50, 50, 0];
                } else if (this.OC > 3) {
                    action_ran = [0, 100, 0, 0];
                } else {
                    action_ran = [0, 50, 50, 0];
                }
            }
        } else if (this.players.length == 4) {
            if ([1, 2].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC < 1) {
                    action_ran = [90, 5, 5, 0];
                } else if (this.OR == 0 && [1, 2].includes(this.OC)) {
                    action_ran = [100, 0, 0, 0];
                } else if (this.OC > 2) {
                    action_ran = [100, 0, 0, 0];
                } else if (this.OR >= 1) {
                    action_ran = [100, 0, 0, 0];
                }
            } else if ([3].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC < 1) {
                    action_ran = [0, 50, 5, 45];
                } else if (this.OR == 0 && [1, 2].includes(this.OC)) {
                    action_ran = [10, 10, 0, 80];
                } else if (this.OC > 2) {
                    action_ran = [80, 0, 0, 20];
                } else if (this.OR >= 1) {
                    action_ran = [80, 0, 0, 20];
                }
            } else if ([4].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                } else if (this.OR == 0 && [1, 2, 3].includes(this.OC)) {
                    action_ran = [0, 30, 0, 70];
                } else if (this.OC > 3) {
                    action_ran = [0, 0, 0, 100];
                } else if (this.OR >= 1) {
                    action_ran = [0, 20, 20, 60];
                }
            } else {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                } else if (this.OR == 0 && [2, 3].includes(this.OC)) {
                    action_ran = [0, 50, 50, 0];
                } else if (this.OC > 3) {
                    action_ran = [0, 100, 0, 0];
                } else if (this.OR >= 1) {
                    action_ran = [0, 50, 50, 0];
                }
            }
        } else if (this.players.length == 5) {
            if ([1, 2].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC < 1) {
                    action_ran = [90, 5, 5, 0];
                } else if (this.OR == 0 && [1, 2].includes(this.OC)) {
                    action_ran = [100, 0, 0, 0];
                } else if (this.OC > 2) {
                    action_ran = [100, 0, 0, 0];
                } else if (this.OR >= 1) {
                    action_ran = [100, 0, 0, 0];
                }
            } else if ([3].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC < 1) {
                    action_ran = [0, 50, 5, 45];
                } else if (this.OR == 0 && [1, 2].includes(this.OC)) {
                    action_ran = [10, 10, 0, 80];
                } else if (this.OC > 2) {
                    action_ran = [80, 0, 0, 20];
                } else if (this.OR >= 1) {
                    action_ran = [80, 0, 0, 20];
                }
            } else if ([4].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                } else if (this.OR == 0 && [1, 2, 3].includes(this.OC)) {
                    action_ran = [0, 30, 0, 70];
                } else if (this.OC > 3) {
                    action_ran = [0, 0, 0, 100];
                } else if (this.OR >= 1) {
                    action_ran = [0, 20, 20, 60];
                }
            } else {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                } else if (this.OR == 0 && [2, 3].includes(this.OC)) {
                    action_ran = [0, 50, 50, 0];
                } else if (this.OC > 3) {
                    action_ran = [0, 100, 0, 0];
                } else if (this.OR >= 1) {
                    action_ran = [0, 50, 50, 0];
                }
            }
        }
        return action_ran;
    }

    /**
     * 
     * 传入概率 下注
     * F C R S
     * 弃 跟 加 比
     */
    fn1(action_ran: number[], data: IZJH_onFahua) {

        let action: "" | "F" | "C" | "R" | "S" = "";
        let sum = action_ran.reduce((res, val) => res + val, 0);
        let rand = commonUtil.randomFromRange(1, sum);
        const delayTime = commonUtil.randomFromRange(1000, 3000);
        let weightIndex = 0;
        while (sum > 0) {
            sum = sum - action_ran[weightIndex];
            if (sum < rand) {
                if (weightIndex == 0) action = "F";
                if (weightIndex == 1) action = "C";
                if (weightIndex == 2) action = "R";
                if (weightIndex == 3) action = "S";
                break;
            }
            weightIndex = weightIndex + 1;
        }
        if (data['max_uid'] == this.uid) {
            if (action == "F") {
                action = "C";
            }
        }
        if (action == "F") {
            return this.zhaJinHuaFold();
        } else if (action == "C") {
            return this.zhaJinHuaCingl(delayTime);
        } else if (action == "R") {
            if (this.betNum == this.lowBet) {
                return this.zhaJinHuaFilling(this.lowBet * 2);
            } else if (this.betNum == 2 * this.lowBet) {
                return this.zhaJinHuaFilling(this.lowBet * 5);
            } else if (this.betNum == 5 * this.lowBet) {
                return this.zhaJinHuaFilling(this.lowBet * 10);
            }
            return this.zhaJinHuaCingl(delayTime);
        } else if (action == "S") {
            return this.zhaJinHuaApplyAndBiPai(data);
        }
        console.warn("GoldenFlower_sss", `${this.players.length}|Holds_type:${this.Holds_type}`);
        console.warn(`rand:${rand},OR:${this.OR}, OC:${this.OC}`, action_ran.toString());
    }


    /**看牌 */
    async zhaJinHuaKanPai() {
        try {
            const delayTime = commonUtil.randomFromRange(1000, 5000);
            const data = await this.delayRequest('GoldenFlower.mainHandler.kanpai', {}, delayTime);
            this.Holds = data.holds.cards;
            this.cards_type = data.holds.type;
            this.iskanpai = true;
            this.Holds_type = GoldenFlower_logic.getAi_type(this.Holds, this.cards_type);
        } catch (error) {
            logger.info(`zhaJinHuaKanPai|${this.uid}|${JSON.stringify(error)}`);
        }
    }

    /**跟注 */
    async zhaJinHuaCingl(delayTime: number) {
        try {
            const cinglRoute = 'GoldenFlower.mainHandler.cingl';
            let res = await this.delayRequest(cinglRoute, {}, delayTime);
            // this.playerGold -= res.betNum;
        } catch (error) {
            // logger.warn(`zhaJinHuaCingl|${this.uid}|${this.roomId}|${JSON.stringify(error)}`);
            const res = await this.delayRequest("GoldenFlower.mainHandler.Allfighting", {}, 500);
        }
    }

    // 申请比牌后再比牌
    async zhaJinHuaApplyAndBiPai(onfa: IZJH_onFahua) {
        try {
            const delayTime = commonUtil.randomFromRange(1000, 3000);
            if (onfa.allin) {
                const res = await this.delayRequest("GoldenFlower.mainHandler.Allfighting", {}, delayTime);
            } else {
                const res = await this.delayRequest("GoldenFlower.mainHandler.applyBipai", {}, delayTime);
                if (!res || !Array.isArray(res.list) || !res.list.length) {
                    return;
                }
                // 比牌
                let ran = res.list.find(c => c.holdStatus == 1);
                if (!ran) {
                    ran = commonUtil.randomFromRange(0, res.list.length - 1);
                    ran = res.list[ran];
                }
                await this.delayRequest("GoldenFlower.mainHandler.bipai", { seat: ran.seat }, 500);
            }
        } catch (error) {
            logger.warn(`zhaJinHuaApplyBipai|${this.uid}|${JSON.stringify(error)}|${onfa.allin}|${onfa.canBipai}`);
        }
    }

    // 加注
    async zhaJinHuaFilling(multiple: number) {
        let res;
        try {
            let delayTime = commonUtil.randomFromRange(1000, 3000);
            res = await this.delayRequest("GoldenFlower.mainHandler.filling", { multiple }, delayTime);
            this.betNum = res.betNum;
            // this.playerGold -= res.betNum;
        } catch (error) {
            logger.info(`zhaJinHuaFilling|${this.uid}|${JSON.stringify(error)}`);
            // 加注失败，跟注
            res = await this.zhaJinHuaCingl(0);
        }
    }

    // 弃牌
    async zhaJinHuaFold() {
        const delayTime = commonUtil.randomFromRange(1000, 3000);
        try {
            if (!this.iskanpai) {
                await this.zhaJinHuaKanPai(); // 看牌之后 1-3 秒调用 afterSee
            }
            const cinglRoute = 'GoldenFlower.mainHandler.fold';
            if (delayTime) {
                await this.delayRequest(cinglRoute, {}, delayTime);
            } else {
                await this.requestByRoute(cinglRoute, {});
            }
            this.status = 'NONE';
        } catch (error) {
            logger.warn(`zhaJinHuaFold|${this.uid}|${JSON.stringify(error)}`);
        }
    }
}

