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
    leaveRound: number;
    playerGold: number = 0;
    /**座位号 */
    seat: number;
    betNum: number;
    /**封顶 */
    capBet: number = 0;
    lowBet: number = 0;
    entryCond: number = 0;
    status: 'READY' | 'GAME' | 'INWAIT' | 'NONE' = "NONE";
    /**进入房间的初始金币 */
    initGold: number = 0;
    /**有人比牌 */
    bipai_num: number = 0;
    /**真为已看牌 */
    iskanpai: boolean = false;
    zjhConfig: any;
    /**已看牌玩家size */
    PlayerKanpai_size: number = 0;
    /**玩家数量，包括机器人和真实玩家 */
    Player_size: number;
    /**加注次数 */
    isPlayerFill: number = 0;
    /**状态 INWAIT.等待 INGAME.游戏中 END.回合结束 */
    room_status: string = 'NONE';
    /**豹子5 > 顺金4 > 金花3 > 顺子2 > 对子1 > 单张0 */
    cards_type: number = 0;
    /**名次 */
    rank: number = 0;
    /**手牌 */
    Holds: number[] = [];
    /**手牌分类，独立于一般的分类 */
    Holds_type: number = 0;
    constructor(opts: any) {
        super(opts);
        this.leaveRound = commonUtil.randomFromRange(3, 15);// 离开轮数
        this.seat = opts.seat;// 座位号
        this.betNum = opts.betNum;
        this.zjhConfig = JsonMgr.get('robot/zjhConfig').datas;
    }

    //加载
    async zhaJinHuaLoaded() {
        try {
            const loadedData = await this.requestByRoute('GoldenFlower.mainHandler.loaded', {});
            this.seat = loadedData.seat;
            this.capBet = loadedData.capBet;
            // 加载之后，可以准备
            this.room_status = loadedData.room.status;
        } catch (error) {
            logger.warn(`zhaJinHuaLoaded|${this.uid}|${JSON.stringify(error)}`);
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
        this.Emitter.on("ZJH_onOpts", this.onZhaJinHuaOpts.bind(this));
        // 结算
        this.Emitter.on("ZJH_onSettlement", this.onZhaJinHuaSettle.bind(this));
        // 发话
        this.Emitter.on("ZJH_onFahua", this.msg_GoldenFlower_oper_c.bind(this));

        //监听发牌
        this.Emitter.on("ZJH_onDeal", (data) => {
            data.players.forEach(m => {
                if (m.seat == this.seat && m.bet != 0) {
                    this.status = "GAME";
                }
            });
            this.room_status == "INGAME"
        });
    }

    // 监听有人操作
    onZhaJinHuaOpts(optsData) {
        if (optsData.type === 'kanpai') {
            this.PlayerKanpai_size++;
        }
        else if (optsData.type === 'filling') {
            this.isPlayerFill++;
        }
        else if (optsData.type === 'bipai') {
            this.bipai_num++;
        }
    }

    /**结算 */
    onZhaJinHuaSettle(settleData: GoldenFlower_interface.IZJH_onSettlement) {
        this.clear_delayRequest_time();
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }

    //加载所有牌信息
    async zhaJinHuaGetInning() {
        let inIngData;
        try {
            inIngData = await this.requestByRoute('GoldenFlower.mainHandler.getInning', {});
            if (!inIngData || !Array.isArray(inIngData.Holds)) {
                return;
            }
            for (let stripRobot of inIngData.Holds) {
                if (stripRobot && stripRobot.cards != null) {
                    this.Player_size++;
                }
            }
            for (let stripRobot of inIngData.Holds) {
                if (stripRobot && this.uid == stripRobot.uid) {
                    this.cards_type = stripRobot.cardType;
                    this.Holds = stripRobot.cards;
                    break;
                }
            }
            this.rank = 1;
            for (let stripRobot of inIngData.Holds) {
                if (stripRobot && stripRobot.cards != null && this.uid !== stripRobot.uid) {
                    let ret = GoldenFlower_logic.bipaiSole({ "cardType": this.cards_type, "cards": this.Holds }, { "cardType": stripRobot.cardType, "cards": stripRobot.cards });
                    let whoWin = ret > 0 ? { "cardType": this.cards_type, "cards": this.Holds } : { "cardType": stripRobot.cardType, "cards": stripRobot.cards };

                    if (whoWin.cards.toString() != this.Holds.toString()) {
                        this.rank++;
                    }
                }
            }
            for (let stripRobot of inIngData.Holds) {
                if (stripRobot && stripRobot.cards != null && 0 == stripRobot.isRobot) {
                    if (this.rank == 1) {
                        console.log(this.uid);
                    }
                    break;
                }
            }
            this.Holds_type = 0;//豹子5 > 顺金4 > 金花3 > 顺子2 > 对子1 > 单张0
            if (this.cards_type == 5) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 1;
                } else {
                    this.Holds_type = 2;
                }
            } else if (this.cards_type == 4) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 3;
                } else {
                    this.Holds_type = 4;
                }
            } else if (this.cards_type == 3) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 5;
                } else {
                    this.Holds_type = 6;
                }
            } else if (this.cards_type == 2) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 7;
                } else {
                    this.Holds_type = 8;
                }
            } else if (this.cards_type == 1) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 9;
                } else {
                    this.Holds_type = 10;
                }
            } else if (this.cards_type == 0) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 11;
                } else {
                    this.Holds_type = 12;
                }
            }
        } catch (error) {
            logger.error(`zhaJinHuaGetInning|${this.uid}|${JSON.stringify(error)}`);
        }
    }

    //发话
    async msg_GoldenFlower_oper_c(onfa: IZJH_onFahua) {
        this.betNum = onfa.betNum;
        /**封顶封顶 */
        let flag = this.capBet / 2 == this.betNum ? true : false;
        // 发话人不是自己
        if (onfa.fahuaIdx !== this.seat) {
            if (onfa.canBipai == true && this.iskanpai == false) {
                let actionState = zhaJinHuaRobotActionService.Nokanpai_NewPlayerType(onfa.roundTimes, this.PlayerKanpai_size,
                    this.rank, this.Holds_type, this.Player_size, this.cards_type, flag);
                if (onfa.canKanpai && actionState == "kanpai") {
                    await this.zhaJinHuaKanPai();
                }
            }
            return;
        }
        // 获取所有人牌信息
        if (onfa.roundTimes === 1) {
            await this.zhaJinHuaGetInning();
        }

        if (this.iskanpai) {
            return this.afterSee(onfa);
        }

        let actionState = zhaJinHuaRobotActionService.Nokanpai_NewPlayerType(onfa.roundTimes, this.PlayerKanpai_size,
            this.rank, this.Holds_type, this.Player_size, this.cards_type, flag);
        if (actionState == "bipai" && onfa.canBipai == false) {
            actionState = "Cingl";
        }
        if (actionState == "kanpai" && onfa.canKanpai == false)
            actionState = "Cingl";
        // 跟注
        switch (actionState) {
            case "Cingl":
                if (this.playerGold < this.betNum * (onfa.member_num + 1)) {
                    await this.zhaJinHuaApplyAndBiPai(onfa);
                } else {
                    await this.zhaJinHuaCingl(commonUtil.randomFromRange(1000, 3000));
                }
                break;
            case "kanpai":  // 看牌
                await this.zhaJinHuaKanPai(); // 看牌之后 1-3 秒调用 afterSee
                setTimeout(() => {
                    this.afterSee(onfa);
                }, commonUtil.randomFromRange(3000, 5000));
                break;
            case "bipai":  // 申请比牌，然后比牌
                await this.zhaJinHuaApplyAndBiPai(onfa);
                break;
            case "Fold":// 弃牌
                await this.zhaJinHuaFold();
                break;
            case "filling":
                /**
                * @date 2019年7月4日 顾明提出机器人新的补充策略
                * @description 当“机器人金币”数量[小于][当前比牌金额]乘以 对局剩余人数+1 时，该机器人的行为如果按照当前逻辑输出的结果是[跟注]或者[加注]，将其变更为[比牌]
                */
                if (this.playerGold < this.betNum * (onfa.member_num + 1)) {
                    await this.zhaJinHuaApplyAndBiPai(onfa);
                } else if (this.betNum >= this.capBet / 2) {
                    // 如果上一个人已经是顶注，只能跟注
                    await this.zhaJinHuaCingl(commonUtil.randomFromRange(1000, 3000));
                } else {
                    // 还可以加注
                    let bet = bet_arr[this.sceneId].filter(gold => gold > this.capBet);
                    let multiple = Math.min(...bet, this.capBet);
                    await this.zhaJinHuaFilling(multiple);
                }
                break;
            default:
                console.warn("----1111");
                break;
        }
    }

    // 看牌后的操作
    async afterSee(onfa: IZJH_onFahua) {
        let flag = this.capBet / 2 == this.betNum ? true : false;
        let aseeState = zhaJinHuaRobotActionService.kanpai_NewPlayerType(onfa.roundTimes, this.PlayerKanpai_size
            , this.rank, this.Holds_type, this.Player_size, this.cards_type, flag, this.nid, this.sceneId);
        if (aseeState == "bipai" && onfa.canBipai == false) {
            aseeState = "Cingl";
        }
        if (onfa.allin) {
            aseeState = "bipai";
        }
        switch (aseeState) {
            case "Cingl":// 跟注
                if (this.playerGold < this.betNum * (onfa.member_num + 1) * 2) {
                    await this.zhaJinHuaApplyAndBiPai(onfa);
                } else {
                    await this.zhaJinHuaCingl(commonUtil.randomFromRange(1000, 3000));
                }
                break;
            case "bipai":
                // 申请比牌，然后比牌
                await this.zhaJinHuaApplyAndBiPai(onfa);
                break;
            case "Fold":
                // 弃牌
                await this.zhaJinHuaFold();
                break;
            case "filling":
                /**
                * @date 2019年7月4日 顾明提出机器人新的补充策略
                * @description 当“机器人金币”数量[小于][当前比牌金额]乘以 对局剩余人数+1 时，该机器人的行为如果按照当前逻辑输出的结果是[跟注]或者[加注]，将其变更为[比牌]
                */
                if (this.playerGold < this.betNum * (onfa.member_num + 1) * 2) {
                    await this.zhaJinHuaApplyAndBiPai(onfa);
                } else if (this.betNum >= this.capBet) {
                    // 如果上一个人已经是顶注，只能跟注
                    await this.zhaJinHuaCingl(commonUtil.randomFromRange(1000, 3000));
                } else {
                    // 还可以加注
                    let bet = bet_arr[this.sceneId].filter(gold => gold > this.capBet);
                    let multiple = Math.min(...bet, this.capBet);
                    await this.zhaJinHuaFilling(multiple);
                }
                break;
            default:
                console.warn("----0000");
                break;
        }
    }

    /**看牌 */
    async zhaJinHuaKanPai() {
        try {
            const delayTime = commonUtil.randomFromRange(1000, 5000);
            await this.delayRequest('GoldenFlower.mainHandler.kanpai', {}, delayTime);
            this.iskanpai = true;
        } catch (error) {
            logger.info(`zhaJinHuaKanPai|${this.uid}|${JSON.stringify(error)}`);
        }
    }

    /**跟注 */
    async zhaJinHuaCingl(delayTime: number) {
        try {
            const cinglRoute = 'GoldenFlower.mainHandler.cingl';
            let res = await this.delayRequest(cinglRoute, {}, delayTime);
            this.playerGold -= res.betNum;
        } catch (error) {
            logger.warn(`zhaJinHuaCingl|${this.uid}|${this.roomId}|${JSON.stringify(error)}`);
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
                const ran = commonUtil.randomFromRange(0, res.list.length - 1);
                await this.delayRequest("GoldenFlower.mainHandler.bipai", { seat: res.list[ran] }, delayTime);
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
            this.playerGold -= res.betNum;
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

