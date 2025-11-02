'use strict';

// 三张牌机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import * as commonUtil from "../../../../utils/lottery/commonUtil";
import mjConst = require('../mjConst');
import mj_Logic = require('../mj_Logic');
import utils = require('../../../../utils/index');
import ErMahjong_AI from "./ErMahjong_AI";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);


export default class ZhaJinHuaRobot extends BaseRobot {
    /**座位号 */
    seat: number;
    entryCond: number = 0;
    leaveRound: number;
    /**其他玩家出牌 */
    curr_majiang: number;
    /**玩家手牌 */
    hand_mjs: number[] = [];
    Er_AI = new ErMahjong_AI();
    RepertoryCard_len: number = 0;
    /**桌面牌 */
    table_mjs: number[] = [];
    record_history: {
        uid: string,
        oper_type_string: string,
        hand_mjs: string,
        /**出牌麻将 */
        mj: number,
        update_time: string
    }[] = [];
    constructor(opts: any) {
        super(opts);
        this.leaveRound = commonUtil.randomFromRange(3, 15);// 离开轮数
        this.seat = opts.seat;// 座位号
    }

    //加载
    async Loaded() {
        try {
            const loadedData: mjConst.MJ_mainHandler_loaded = await this.requestByRoute('MJ.mainHandler.loaded', {});
            this.seat = loadedData.seat;
        } catch (error) {
            robotlogger.warn(`MJ loaded|${this.uid}|${JSON.stringify(error)}`);
            return Promise.reject(error);
        }
    }

    // 离开
    async destroy() {
        setTimeout(() => {
            this.leaveGameAndReset(false);
        }, utils.random(1, 3) * 10);
    }

    // 注册监听器
    registerListener() {
        this.Emitter.on("MJ_deal", this.MJ_deal.bind(this));
        // 被踢掉
        this.Emitter.on("msg_majiang_mo_majiang_s", this.msg_majiang_mo_majiang_s.bind(this));
        this.Emitter.on("msg_majiang_oper_c", this.msg_majiang_oper_c.bind(this));
        this.Emitter.on("msg_majiang_result_s", this.destroy.bind(this));
        this.Emitter.on("msg_majiang_note_doing_s", this.msg_majiang_note_doing_s.bind(this));
        this.Emitter.on("MJ_deal_bu", this.MJ_deal_bu.bind(this));
    }

    MJ_deal_bu(data: mjConst.IMJ_deal_bu) {
        if (data.uid == this.uid) {
            this.hand_mjs.push(...data.buhua_arr);
            this.hand_mjs = this.hand_mjs.filter(c => ![0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48].includes(c));
            this.hand_mjs.sort((a1, a2) => a1 - a2);
            this.record_history.push({ uid: this.uid, oper_type_string: "MJ_deal_bu", hand_mjs: this.hand_mjs.toString(), mj: null, update_time: utils.cDate() });
            // robotlogger.warn(this.nickname, mj_Logic.getMj_string(this.hand_mjs), this.hand_mjs.length, "MJ_buhua");
        }
        this.RepertoryCard_len -= data.buhua_arr.length;
        this
    }

    async msg_majiang_mo_majiang_s(data: mjConst.Imsg_majiang_mo_majiang_s) {
        this.RepertoryCard_len--;
        if (!data.mj) {
            return;
        }
        this.hand_mjs.push(data.mj);
        this.hand_mjs.sort((a1, a2) => a1 - a2);
        this.record_history.push({ uid: this.uid, oper_type_string: "MJ_mo_mj", hand_mjs: this.hand_mjs.toString(), mj: data.mj, update_time: utils.cDate() });
        // robotlogger.warn(this.nickname, mj_Logic.getMj_string(this.hand_mjs), this.hand_mjs.length, "MJ_mo_mj");
    }

    async msg_majiang_oper_c(data: mjConst.Imsg_majiang_oper_c) {
        if (data.oper_type == mjConst.Player_Oper.PO_PLAY) {
            this.table_mjs.push(data.hand_mj);
        } else if (data.oper_type == mjConst.Player_Oper.PO_PENG) {
            this.table_mjs.push(...[data.hand_mj, data.hand_mj]);
        } else if (data.oper_type == mjConst.Player_Oper.PO_GANG) {
            this.table_mjs.push(...[data.hand_mj, data.hand_mj, data.hand_mj, data.hand_mj]);
        }
        if (data.uid != this.uid && data.oper_type == mjConst.Player_Oper.PO_PLAY) {
            let opts = { oper_type: mjConst.Player_Oper.PO_HU, cmsg: this.curr_majiang };
            let delayTime = utils.random(2000, 5000);
            try {
                this.curr_majiang = data.hand_mj;
                let is_peng = mj_Logic.is_can_peng(this.hand_mjs, this.curr_majiang);
                let is_gang = mj_Logic.is_can_gang(this.hand_mjs, this.curr_majiang);
                let is_hu = mj_Logic.is_can_hu(this.hand_mjs, this.curr_majiang);
                let is_chi = mj_Logic.is_can_chi(this.hand_mjs, this.curr_majiang);
                if (is_hu) {
                    await this.delayRequest('MJ.mainHandler.majiang_oper_c', opts, delayTime);
                    return;
                }
                if (is_gang && this.RepertoryCard_len > 0) {
                    opts = { oper_type: mjConst.Player_Oper.PO_GANG, cmsg: this.curr_majiang };
                    await this.delayRequest('MJ.mainHandler.majiang_oper_c', opts, delayTime);
                    this.hand_mjs = mj_Logic.arr_erase_one(this.hand_mjs, this.curr_majiang, 4);
                    this.record_history.push({ uid: this.uid, oper_type_string: "PO_GANG", hand_mjs: this.hand_mjs.toString(), mj: this.curr_majiang, update_time: utils.cDate() });
                    // robotlogger.warn(this.nickname, mj_Logic.getMj_string(this.hand_mjs), this.hand_mjs.length, "PO_GANG");
                    return;
                }
                if (is_peng) {
                    opts = { oper_type: mjConst.Player_Oper.PO_PENG, cmsg: this.curr_majiang };
                    await this.delayRequest('MJ.mainHandler.majiang_oper_c', opts, delayTime);
                    this.hand_mjs = mj_Logic.arr_erase_one(this.hand_mjs, this.curr_majiang, 2);
                    this.record_history.push({ uid: this.uid, oper_type_string: "PO_PENG", hand_mjs: this.hand_mjs.toString(), mj: this.curr_majiang, update_time: utils.cDate() });
                    // robotlogger.warn(this.nickname, mj_Logic.getMj_string(this.hand_mjs), this.hand_mjs.length, "PO_PENG");
                    return;
                }
                if (is_chi) {
                    opts = { oper_type: mjConst.Player_Oper.PO_PASS, cmsg: this.curr_majiang };
                    await this.delayRequest('MJ.mainHandler.majiang_oper_c', opts, delayTime);
                    // this.hand_mjs = mj_Logic.arr_erase_one(this.hand_mjs, this.curr_majiang, 4);
                    this.record_history.push({ uid: this.uid, oper_type_string: "PO_PASS", hand_mjs: this.hand_mjs.toString(), mj: this.curr_majiang, update_time: utils.cDate() });
                    // robotlogger.warn(this.nickname, mj_Logic.getMj_string(this.hand_mjs), this.hand_mjs.length, "PO_GANG");
                }
            } catch (error) {
                robotlogger.warn(`robot1|${this.nickname}|${JSON.stringify(opts)}|${JSON.stringify(this.hand_mjs)}|${JSON.stringify(error)}}`);
            }
        }
    }

    MJ_deal(data: mjConst.IMJ_deal) {
        this.hand_mjs = data.players.find(pl => pl.uid == this.uid).hand_mjs;
        this.hand_mjs.sort((a1, a2) => a1 - a2);
        this.RepertoryCard_len = 45;
        this.record_history.push({ uid: this.uid, oper_type_string: "MJ_deal", hand_mjs: this.hand_mjs.toString(), mj: null, update_time: utils.cDate() });
    }

    async msg_majiang_note_doing_s(data: mjConst.Imsg_majiang_note_doing_s) {
        if (data.uid == this.uid) {
            let hand_mjs: number[] = data['hand_mjs'];
            hand_mjs.sort((a1, a2) => a1 - a2);
            if (hand_mjs.toString() != this.hand_mjs.toString()) {
                robotlogger.warn("server1", hand_mjs.toString());
                robotlogger.warn("server2", this.hand_mjs.toString());
                for (const c of this.record_history) {
                    robotlogger.warn(c.uid, c.oper_type_string, c.hand_mjs, c.mj);
                }
                this.hand_mjs = hand_mjs;
            }
            let delayTime = utils.random(2000, 5000);
            let opts = {};
            try {
                if (mj_Logic.is_can_hu(this.hand_mjs, null)) {
                    opts = { oper_type: mjConst.Player_Oper.PO_HU, cmsg: null };
                    await this.delayRequest('MJ.mainHandler.majiang_oper_c', opts, delayTime);
                    return;
                }
                let mj = mj_Logic.find_gang(this.hand_mjs);
                if (mj) {
                    opts = { oper_type: mjConst.Player_Oper.PO_GANG, cmsg: mj };
                    await this.delayRequest('MJ.mainHandler.majiang_oper_c', opts, delayTime);
                    this.hand_mjs = mj_Logic.arr_erase_one(this.hand_mjs, mj, 4);
                    this.record_history.push({ uid: this.uid, oper_type_string: "PO_GANG", hand_mjs: this.hand_mjs.toString(), mj: mj, update_time: utils.cDate() });
                    // robotlogger.warn(this.nickname, mj_Logic.getMj_string(this.hand_mjs), this.hand_mjs.length, "PO_GANG");
                    return;
                }
                {
                    let table_mjs: number[] = [];
                    table_mjs.push(...this.table_mjs);
                    table_mjs.push(...this.hand_mjs);
                    let res = this.Er_AI.PlayLogic(this.hand_mjs, this.table_mjs, []);
                    // robotlogger.warn(this.nickname, JSON.stringify(res), this.table_mjs.toString());
                    let mj = res.playId;
                    opts = { oper_type: mjConst.Player_Oper.PO_PLAY, cmsg: mj };
                    await this.delayRequest('MJ.mainHandler.majiang_oper_c', opts, delayTime);
                    this.hand_mjs = mj_Logic.arr_erase_one(this.hand_mjs, mj, 1);
                    this.record_history.push({ uid: this.uid, oper_type_string: "PO_PLAY", hand_mjs: this.hand_mjs.toString(), mj: mj, update_time: utils.cDate() });
                    // robotlogger.warn(this.nickname, mj_Logic.getMj_string(this.hand_mjs), this.hand_mjs.length, "PO_PLAY");
                }
            } catch (error) {
                robotlogger.warn(`robot2|${this.nickname}|${JSON.stringify(opts)}|${JSON.stringify(this.hand_mjs)}|${JSON.stringify(error)}}`);
            }
        }
    }
}

