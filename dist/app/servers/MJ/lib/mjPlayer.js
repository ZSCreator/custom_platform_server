"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const utils = require("../../../utils");
const mj_Logic = require("./mj_Logic");
const mjConst_1 = require("./mjConst");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class mjPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts) {
        super(opts);
        this.status = 'NONE';
        this.curr_oper = mjConst_1.Player_Oper.PO_NONE;
        this.pre_oper = mjConst_1.Player_Oper.PO_NONE;
        this.hand_majiang = [];
        this.chu_majiang = [];
        this.tai_majiang = [];
        this.gang_majiang = [];
        this.chi_majiang = [];
        this.an_gang_majiang = [];
        this.hua_majiang = [];
        this.ishu = false;
        this.change_socre = 0;
        this.profit = 0;
        this.ming_gang_num = 0;
        this.an_gang_num = 0;
        this.zi_mo_num = 0;
        this.hu_majiang = [];
        this.apply_ting = false;
        this.ting_status = false;
        this.sky_ting = false;
        this.trusteeship = false;
        this.chi_pos = -1;
        this.Oper_timeout = null;
        this.pass_hu_num = 0;
        this.oper_data = {
            is_chi: false,
            is_peng: false,
            is_gang: false,
            is_hu: false,
            is_ting: false
        };
        this.initgold = 0;
        this.seat = i;
        this.gold = utils.sum(opts.gold);
        this.initgold = this.gold;
    }
    majiang_oper_c(oper_type, cmsg, roomInfo) {
        let result;
        let oper_type_string = "";
        switch (oper_type) {
            case mjConst_1.Player_Oper.PO_PLAY:
                oper_type_string = "PO_PLAY";
                result = this.handler_play(oper_type, cmsg, roomInfo);
                break;
            case mjConst_1.Player_Oper.PO_PASS:
                oper_type_string = "PO_PASS";
                result = this.handler_pass(oper_type, cmsg, roomInfo);
                break;
            case mjConst_1.Player_Oper.PO_CHI:
                oper_type_string = "PO_CHI";
                result = this.handler_chi(oper_type, cmsg, roomInfo);
                break;
            case mjConst_1.Player_Oper.PO_PENG:
                oper_type_string = "PO_PENG";
                result = this.handler_peng(oper_type, cmsg, roomInfo);
                break;
            case mjConst_1.Player_Oper.PO_GANG:
                oper_type_string = "PO_GANG";
                result = this.handler_gang(oper_type, cmsg, roomInfo);
                break;
            case mjConst_1.Player_Oper.PO_HU:
                oper_type_string = "PO_HU";
                result = this.handler_hu(oper_type, cmsg, roomInfo);
                break;
            case mjConst_1.Player_Oper.PO_TING:
                oper_type_string = "PO_TING";
                result = this.handler_ting(oper_type, cmsg, roomInfo);
                break;
            case mjConst_1.Player_Oper.PO_TUOGUAN:
                oper_type_string = "PO_TUOGUAN";
                result = this.handler_tuoguan(oper_type, cmsg, roomInfo);
                break;
            default:
                return { code: 500, error: "oper_type 非法" };
        }
        if (result.code == 200) {
            roomInfo.record_history.oper.push({
                uid: this.uid, oper_type: oper_type,
                oper_type_string, mj: cmsg, update_time: utils.cDate()
            });
        }
        return result;
    }
    handler_play(oper_type, cmsg, roomInfo) {
        if (!this.hand_majiang.includes(cmsg)) {
            return { code: 500, error: `play card 非法 ${cmsg}`, data: this.hand_majiang };
        }
        if (this.status != "PS_OPER") {
            return { code: 500, error: `not PS_OPER`, data: this.hand_majiang };
        }
        if (this.ting_status) {
            let mj = this.hand_majiang[this.hand_majiang.length - 1];
            if (mj != cmsg) {
                cmsg = mj;
            }
            if (this.oper_data.is_hu) {
                this.pass_hu_num++;
            }
        }
        this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, cmsg, 1);
        this.chu_majiang.push(cmsg);
        let opts = {
            oper_type,
            uid: this.uid,
            seat: this.seat,
            other_seat: roomInfo.curr_doing_seat,
            roomId: roomInfo.roomId,
            hand_mj: cmsg,
        };
        roomInfo.note_players_oper(opts);
        if (this.apply_ting && mj_Logic.is_jiao(this.hand_majiang).length > 0) {
            this.note_ting(roomInfo);
            this.ting_status = true;
            if (roomInfo.record_history.oper.length == 0 ||
                roomInfo.record_history.oper.every(c => c.oper_type == mjConst_1.Player_Oper.PO_TING)) {
                this.sky_ting = true;
            }
        }
        clearTimeout(this.Oper_timeout);
        this.apply_ting = false;
        this.pre_oper = mjConst_1.Player_Oper.PO_PLAY;
        this.curr_oper = mjConst_1.Player_Oper.PO_PLAY;
        this.status = "PS_WAIT";
        this.hand_majiang.sort((a1, a2) => a1 - a2);
        roomInfo.curr_majiang = cmsg;
        roomInfo.handler_pass(this);
        roomInfo.handler_wait_oper();
        return { code: 200 };
    }
    handler_pass(oper_type, cmsg, roomInfo) {
        if (roomInfo.curr_majiang == null) {
            return { code: 500, error: "handler_pass 非法" };
        }
        if (roomInfo.curr_doing_seat == this.seat) {
            return { code: 500, error: "该你操作 不能弃牌" };
        }
        if (this.ting_status && this.oper_data.is_hu) {
            this.pass_hu_num++;
        }
        this.curr_oper = mjConst_1.Player_Oper.PO_PASS;
        clearTimeout(this.Oper_timeout);
        roomInfo.handler_wait_oper();
        return { code: 200 };
    }
    handler_chi(oper_type, cmsg, roomInfo) {
        if (roomInfo.curr_majiang == null) {
            return { code: 500, error: "handler_chi 非法" };
        }
        if (this.curr_oper != mjConst_1.Player_Oper.PO_NONE) {
            return { code: 500, error: `handler_peng not PO_CHI|${cmsg}`, data: this.hand_majiang };
        }
        let is_chi = mj_Logic.is_can_chi(this.hand_majiang, roomInfo.curr_majiang);
        if (!is_chi) {
            return { code: 500, error: `chi 没有满足条件的牌|${cmsg}`, data: this.hand_majiang };
        }
        this.curr_oper = mjConst_1.Player_Oper.PO_CHI;
        let opts = {
            oper_type,
            uid: this.uid,
            seat: this.seat,
            other_seat: roomInfo.curr_doing_seat,
            roomId: roomInfo.roomId,
            hand_mj: roomInfo.curr_majiang,
            cmsg
        };
        roomInfo.note_players_oper(opts);
        clearTimeout(this.Oper_timeout);
        this.chi_pos = cmsg;
        roomInfo.handler_wait_oper();
        return { code: 200 };
    }
    handler_peng(oper_type, cmsg, roomInfo) {
        if (this.ting_status) {
            return { code: 500, error: `handler_peng in ting|${cmsg}`, data: this.hand_majiang };
        }
        let ret = mj_Logic.is_can_peng(this.hand_majiang, roomInfo.curr_majiang);
        if (!ret) {
            return { code: 500, error: `peng 没有满足条件的牌|${cmsg}`, data: this.hand_majiang };
        }
        if (this.curr_oper != mjConst_1.Player_Oper.PO_NONE) {
            return { code: 500, error: `handler_peng not PO_NONE|${cmsg}`, data: this.hand_majiang };
        }
        this.pre_oper = mjConst_1.Player_Oper.PO_PENG;
        this.curr_oper = mjConst_1.Player_Oper.PO_PENG;
        let opts = {
            oper_type,
            uid: this.uid,
            seat: this.seat,
            other_seat: roomInfo.curr_doing_seat,
            roomId: roomInfo.roomId,
            hand_mj: roomInfo.curr_majiang
        };
        roomInfo.note_players_oper(opts);
        clearTimeout(this.Oper_timeout);
        roomInfo.handler_wait_oper();
        return { code: 200 };
    }
    handler_gang(oper_type, cmsg, roomInfo) {
        if (roomInfo.RepertoryCard.length == 0) {
            return { code: 500, error: `handler_gang not majiang mo` };
        }
        if (this.curr_oper != mjConst_1.Player_Oper.PO_NONE) {
            return { code: 500, error: `handler_gang not PO_NONE|${cmsg}`, data: this.hand_majiang };
        }
        if (cmsg == roomInfo.curr_majiang) {
            if (!mj_Logic.is_can_gang(this.hand_majiang, roomInfo.curr_majiang)) {
                return { code: 500, error: `gang 没有满足条件的牌|${cmsg}`, data: this.hand_majiang };
            }
        }
        else {
            if (!this.hand_majiang.includes(cmsg) && !this.tai_majiang.includes(cmsg)) {
                return { code: 500, error: `gang mj 非法|${cmsg}`, data: this.hand_majiang };
            }
            if (!mj_Logic.is_can_gang(this.hand_majiang, cmsg) && !mj_Logic.is_can_gang(this.tai_majiang, cmsg)) {
                return { code: 500, error: `gang 没有满足条件的牌|${cmsg}`, data: this.hand_majiang };
            }
        }
        if (this.ting_status) {
            if (cmsg != roomInfo.curr_majiang && !this.tai_majiang.includes(cmsg)) {
                return { code: 500, error: `handler_gang in ting|${cmsg}`, data: this.hand_majiang };
            }
        }
        this.curr_oper = mjConst_1.Player_Oper.PO_GANG;
        let opts = {
            oper_type,
            uid: this.uid,
            seat: this.seat,
            other_seat: roomInfo.curr_doing_seat,
            roomId: roomInfo.roomId,
            hand_mj: cmsg
        };
        roomInfo.note_players_oper(opts);
        clearTimeout(this.Oper_timeout);
        this.gang_mj = cmsg;
        if (cmsg == roomInfo.curr_majiang) {
            roomInfo.handler_wait_oper();
        }
        else {
            if (this.tai_majiang.includes(cmsg)) {
                this.curr_oper = mjConst_1.Player_Oper.PO_BA_GANG;
                roomInfo.handler_pass(this);
                roomInfo.handler_wait_oper();
            }
            else {
                this.logic_gang(roomInfo, cmsg);
                if (roomInfo.handler_mo())
                    roomInfo.handle_buhua();
            }
        }
        return { code: 200 };
    }
    handler_hu(oper_type, cmsg, roomInfo) {
        if (this.curr_oper != mjConst_1.Player_Oper.PO_NONE) {
            return { code: 500, error: `handler_gang not PO_NONE|${cmsg}`, data: this.hand_majiang };
        }
        let ret = mj_Logic.is_can_hu(this.hand_majiang, roomInfo.curr_majiang);
        if (!ret) {
            return { code: 500, error: `hu 没有满足条件的牌|${roomInfo.curr_majiang}` };
        }
        this.curr_oper = mjConst_1.Player_Oper.PO_HU;
        let opts = {
            oper_type,
            uid: this.uid,
            seat: this.seat,
            other_seat: roomInfo.curr_doing_seat,
            roomId: roomInfo.roomId,
            hand_mj: cmsg
        };
        roomInfo.note_players_oper(opts);
        clearTimeout(this.Oper_timeout);
        setTimeout(() => {
            this.logic_hu(roomInfo, roomInfo.curr_majiang);
            roomInfo.status = "END";
            roomInfo.handler_complete();
        }, 200);
        return { code: 200 };
    }
    handler_ting(oper_type, cmsg, roomInfo) {
        if (this.ting_status == false) {
            if (roomInfo.record_history.oper.length == 0 &&
                roomInfo.ply_zj.uid != this.uid &&
                mj_Logic.is_jiao(this.hand_majiang).length > 0) {
                this.sky_ting = true;
                this.ting_status = true;
                this.note_ting(roomInfo);
                return { code: 200, cmsg };
            }
            this.apply_ting = [true, false].includes(cmsg) ? cmsg : false;
            return { code: 200, cmsg };
        }
        return { code: 500, cmsg };
    }
    handler_tuoguan(oper_type, cmsg, roomInfo) {
        this.trusteeship = [true, false].includes(cmsg) ? cmsg : false;
        if (this.trusteeship) {
            if (this.status == "PS_OPER" && roomInfo.curr_majiang == null)
                roomInfo.auto_play(this);
        }
        return { code: 200, cmsg };
    }
    note_ting(roomInfo) {
        let opts = {
            oper_type: mjConst_1.Player_Oper.PO_TING,
            uid: this.uid,
            seat: this.seat,
            other_seat: roomInfo.curr_doing_seat,
            roomId: roomInfo.roomId,
        };
        roomInfo.note_players_oper(opts);
    }
    logic_peng(roomInfo, target) {
        let curr_player = roomInfo.players.find(pl => pl.seat == roomInfo.curr_doing_seat);
        curr_player.chu_majiang = mj_Logic.arr_erase_one(curr_player.chu_majiang, roomInfo.curr_majiang, 1);
        this.tai_majiang.push(roomInfo.curr_majiang);
        roomInfo.curr_doing_seat = this.seat;
        this.pre_oper = mjConst_1.Player_Oper.PO_PENG;
        let erase_num = 0;
        for (let idx = 0; idx < this.hand_majiang.length; idx++) {
            const mj = this.hand_majiang[idx];
            if (mj == roomInfo.curr_majiang) {
                this.tai_majiang.push(mj);
                erase_num++;
                if (erase_num >= 2)
                    break;
            }
        }
        this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang, 2);
    }
    logic_hu(roomInfo, target) {
        this.ishu = true;
        if (target == null) {
            this.zi_mo_num++;
        }
        else {
            this.hand_majiang.push(target);
            this.hu_majiang.push(target);
        }
    }
    logic_gang(roomInfo, target) {
        let curr_player = roomInfo.players.find(pl => pl.seat == roomInfo.curr_doing_seat);
        curr_player.chu_majiang = mj_Logic.arr_erase_one(curr_player.chu_majiang, target, 1);
        if (target == roomInfo.curr_majiang && roomInfo.curr_majiang != null) {
            this.ming_gang_num++;
            this.gang_majiang.push(target);
            for (let idx = 0; idx < this.hand_majiang.length; idx++) {
                if (target == this.hand_majiang[idx])
                    this.gang_majiang.push(target);
            }
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, target, 4);
        }
        else {
            if (this.curr_oper == mjConst_1.Player_Oper.PO_BA_GANG) {
                this.ming_gang_num++;
                this.gang_majiang.push(...[target, target, target, target]);
                this.tai_majiang = mj_Logic.arr_erase_one(this.tai_majiang, target, 4);
                this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, target, 4);
            }
            else {
                this.an_gang_num++;
                let erase_num = 0;
                for (let idx = 0; idx < this.hand_majiang.length; idx++) {
                    if (this.hand_majiang[idx] == target) {
                        this.an_gang_majiang.push(target);
                        erase_num++;
                        if (erase_num >= 4)
                            break;
                    }
                }
                this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, target, 4);
            }
        }
    }
    logic_chi(roomInfo, target) {
        this.pre_oper = mjConst_1.Player_Oper.PO_CHI;
        let curr_player = roomInfo.players.find(pl => pl.seat == roomInfo.curr_doing_seat);
        curr_player.chu_majiang = mj_Logic.arr_erase_one(curr_player.chu_majiang, roomInfo.curr_majiang, 1);
        let temp_mj_arr = [];
        temp_mj_arr.push(roomInfo.curr_majiang);
        if (this.chi_pos == 0) {
            temp_mj_arr.push(roomInfo.curr_majiang + 1);
            temp_mj_arr.push(roomInfo.curr_majiang + 2);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang + 1, 1);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang + 2, 1);
        }
        if (this.chi_pos == 1) {
            temp_mj_arr.push(roomInfo.curr_majiang - 1);
            temp_mj_arr.push(roomInfo.curr_majiang + 1);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang - 1, 1);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang + 1, 1);
        }
        if (this.chi_pos == 2) {
            temp_mj_arr.push(roomInfo.curr_majiang - 1);
            temp_mj_arr.push(roomInfo.curr_majiang - 2);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang - 1, 1);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang - 2, 1);
        }
        temp_mj_arr.sort((a, b) => a - b);
        this.chi_majiang.push(...temp_mj_arr);
    }
    async settlement(roomInfo) {
        const res = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, false)
            .setGameRecordLivesResult(roomInfo.record_history)
            .sendToDB(1);
        this.gold = res.gold;
        this.initgold = this.gold;
    }
    strip() {
        return {
            uid: this.uid,
            seat: this.seat
        };
    }
    deal_strip() {
        return {
            uid: this.uid,
            seat: this.seat,
            hand_mjs: this.hand_majiang
        };
    }
    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat
        };
    }
    loaded_strip(uid) {
        return {
            uid: this.uid,
            nickname: this.nickname,
            status: this.status,
            gold: this.gold,
            seat: this.seat,
            headurl: this.headurl,
            hand_mjs: uid == this.uid ? this.hand_majiang : this.hand_majiang.map(mj => mj = 0x99),
            chu_majiang: this.chu_majiang,
            tai_majiang: this.tai_majiang,
            gang_majiang: this.gang_majiang,
            chi_majiang: this.chi_majiang,
            an_gang_majiang: this.an_gang_majiang,
            hua_majiang: this.hua_majiang,
            ting_status: this.ting_status,
            trusteeship: this.trusteeship,
            oper_data: this.oper_data
        };
    }
    possible_max_fan(roomInfo) {
        let res_fan_arr = [];
        let majiang_arr = [];
        majiang_arr.push(...this.hand_majiang);
        for (const c of this.chi_majiang) {
            majiang_arr.push(c);
        }
        for (const c of this.tai_majiang) {
            majiang_arr.push(c);
        }
        for (const c of this.an_gang_majiang) {
            majiang_arr.push(c);
        }
        for (const c of this.gang_majiang) {
            majiang_arr.push(c);
        }
        majiang_arr.sort((a, b) => a - b);
        let fengke_num = 0;
        let feng_j_num = 0;
        let zike_num = 0;
        let jianke_num = 0;
        let jian_j_num = 0;
        let is_7dui = false;
        let tongshun_num = 0;
        let tongkezi_num = 0;
        let total_kezi = 0;
        let an_total_kezi = 0;
        let all_TileType = [...this.hand_majiang];
        let AI_all_TileType = new mj_Logic.HuPaiSuanFa();
        AI_all_TileType.AnaTileType(all_TileType, null);
        let temp_chi_majiang = this.chi_majiang.slice();
        let chi_shunzi_arr = [];
        while (temp_chi_majiang.length >= 3) {
            chi_shunzi_arr.push([temp_chi_majiang.shift(), temp_chi_majiang.shift(), temp_chi_majiang.shift()]);
        }
        while (AI_all_TileType.shunzi_arr.length >= 1) {
            chi_shunzi_arr.push(AI_all_TileType.shunzi_arr.shift());
        }
        for (const temp_shunzi of chi_shunzi_arr) {
            let cc = chi_shunzi_arr.filter(c => c.toString() == temp_shunzi.toString()).length;
            if (cc == 3) {
                tongshun_num = 3;
            }
            if (cc == 4) {
                tongshun_num = 4;
            }
        }
        let temp_tai_majiang = this.tai_majiang.slice();
        let peng_kezi_arr = [];
        while (temp_tai_majiang.length >= 3) {
            peng_kezi_arr.push([temp_tai_majiang.shift(), temp_tai_majiang.shift(), temp_tai_majiang.shift()]);
        }
        const temp_jiejiegao = [];
        temp_jiejiegao.push(...AI_all_TileType.kezi_arr);
        temp_jiejiegao.push(...peng_kezi_arr);
        temp_jiejiegao.sort((a, b) => a[0] - b[0]);
        for (let index = 0; index < temp_jiejiegao.length; index++) {
            let data1 = temp_jiejiegao[index][0];
            let tempArr = [data1];
            for (let j = index + 1; j < temp_jiejiegao.length; j++) {
                const data2 = temp_jiejiegao[j][0];
                if (data1 < 0x9 && data1 + 1 == data2) {
                    tempArr.push(data2);
                    data1 = data2;
                }
                else {
                    break;
                }
            }
            let flag = true;
            if (tempArr.length == 3 && flag) {
                tongkezi_num = 3;
            }
            if (tempArr.length == 4 && flag) {
                tongkezi_num = 4;
            }
        }
        for (let i = 0; i < temp_jiejiegao.length; i++) {
            const temp_kezi = temp_jiejiegao[i];
            const temp_mj = temp_kezi[0];
            if (temp_mj >= 0x31 && temp_mj <= 0x34) {
                fengke_num++;
            }
            if (temp_mj >= 0x31 && temp_mj <= 0x37) {
                zike_num++;
            }
            if (temp_mj >= 0x35 && temp_mj <= 0x37) {
                jianke_num++;
            }
            total_kezi++;
        }
        if (AI_all_TileType.jiang_pai >= 0x31 && AI_all_TileType.jiang_pai <= 0x34) {
            feng_j_num++;
        }
        if (AI_all_TileType.jiang_pai >= 0x35 && AI_all_TileType.jiang_pai <= 0x37) {
            jian_j_num++;
        }
        let AI_an_TileType = new mj_Logic.HuPaiSuanFa();
        AI_an_TileType.AnaTileType(this.hand_majiang.slice(), null);
        an_total_kezi = AI_an_TileType.kezi_arr.length;
        let AI_normal_TileType = new mj_Logic.HuPaiSuanFa();
        AI_normal_TileType.AnaTileType(this.hand_majiang, null);
        is_7dui = AI_normal_TileType.is_mht_qd();
        {
            if (utils.isContain(majiang_arr, [0x31, 0x31, 0x31, 0x32, 0x32, 0x32, 0x33, 0x33, 0x33, 0x34, 0x34, 0x34])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_1, fan: 88 });
            }
            if (utils.isContain(majiang_arr, [0x35, 0x35, 0x35, 0x36, 0x36, 0x36, 0x37, 0x37, 0x37])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_2, fan: 88 });
            }
            if (utils.isContain(this.hand_majiang, [0x1, 0x1, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0x9, 0x9])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_3, fan: 88 });
            }
            if (majiang_arr.every(c => [0x6, 0x7, 0x8, 0x9].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_4, fan: 88 });
            }
            if (majiang_arr.every(c => [0x1, 0x2, 0x3, 0x4].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_5, fan: 88 });
            }
            if (utils.isContain([0x31, 0x31, 0x32, 0x32, 0x33, 0x33, 0x34, 0x34, 0x35, 0x35, 0x36, 0x36, 0x37, 0x37], majiang_arr)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_6, fan: 88 });
            }
            let ret1 = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7].toString();
            let ret2 = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8].toString();
            let ret3 = [3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9].toString();
            let ret = majiang_arr.toString();
            if (ret1 == ret || ret2 == ret || ret3 == ret) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_7, fan: 88 });
            }
            if (this.an_gang_num + this.ming_gang_num == 4) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_8, fan: 88 });
            }
            let other = roomInfo.record_history.oper.filter(c => c.uid != this.uid).filter(c => c.oper_type != mjConst_1.Player_Oper.PO_TING);
            let MeOper = roomInfo.record_history.oper.filter(c => c.uid == this.uid).filter(c => c.oper_type != mjConst_1.Player_Oper.PO_TING);
            if (other.length == 0 && MeOper.length == 1 && MeOper[0].oper_type == mjConst_1.Player_Oper.PO_HU) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_9, fan: 88 });
            }
            if (other.length == 1 && other[0].oper_type == mjConst_1.Player_Oper.PO_PLAY &&
                MeOper.length == 1 && MeOper[0].oper_type == mjConst_1.Player_Oper.PO_HU &&
                this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_10, fan: 88 });
            }
        }
        {
            if (fengke_num == 3 && feng_j_num == 1) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_1, fan: 64 });
            }
            if (jianke_num == 2 && jian_j_num == 1) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_2, fan: 64 });
            }
            {
                let ret1 = [0x1, 0x2, 0x3, 0x1, 0x2, 0x3, 0x5, 0x5, 0x7, 0x8, 0x9, 0x7, 0x8, 0x9];
                if (utils.isContain(majiang_arr, ret1)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_3, fan: 64 });
                }
            }
            if (majiang_arr.every(c => [0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_4, fan: 64 });
            }
            if (this.an_gang_majiang.length / 4 + an_total_kezi == 4) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_5, fan: 64 });
            }
            let other = roomInfo.record_history.oper.filter(c => c.uid != this.uid);
            let MeOper = roomInfo.record_history.oper.filter(c => c.uid == this.uid);
            if (MeOper.length == 1 && MeOper[0].oper_type == mjConst_1.Player_Oper.PO_HU &&
                other.length == 1 && other[0].oper_type == mjConst_1.Player_Oper.PO_PLAY && this.zi_mo_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_6, fan: 64 });
            }
        }
        {
            if (is_7dui && utils.isContain(majiang_arr, [0x35, 0x35, 0x36, 0x36, 0x37, 0x37])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_48_1, fan: 48 });
            }
            if (is_7dui && utils.isContain(majiang_arr, [0x31, 0x31, 0x32, 0x32, 0x33, 0x33, 0x34, 0x34])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_48_2, fan: 48 });
            }
            {
                let ret1 = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
                let ret2 = [2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5];
                let ret3 = [3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6];
                let ret4 = [4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7];
                let ret5 = [5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9];
                let ret6 = [6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9];
                if (utils.isContain(majiang_arr, ret1) || utils.isContain(majiang_arr, ret2) ||
                    utils.isContain(majiang_arr, ret3) || utils.isContain(majiang_arr, ret4) ||
                    utils.isContain(majiang_arr, ret5) || utils.isContain(majiang_arr, ret6)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_48_3, fan: 48 });
                }
            }
            if (tongshun_num == 4) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_48_4, fan: 48 });
            }
        }
        {
            let res1 = [
                [0x1, 0x2, 0x3, 0x3, 0x4, 0x5, 0x5, 0x6, 0x7, 0x7, 0x8, 0x9],
                [0x1, 0x2, 0x3, 0x2, 0x3, 0x4, 0x3, 0x4, 0x5, 0x4, 0x5, 0x6],
                [0x2, 0x3, 0x4, 0x3, 0x4, 0x5, 0x4, 0x5, 0x6, 0x5, 0x6, 0x7],
                [0x3, 0x4, 0x5, 0x4, 0x5, 0x6, 0x5, 0x6, 0x7, 0x6, 0x7, 0x8],
                [0x4, 0x5, 0x6, 0x5, 0x6, 0x7, 0x6, 0x7, 0x8, 0x7, 0x8, 0x9],
            ];
            if (res1.some(c => utils.isContain(majiang_arr, c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_32_1, fan: 32 });
            }
            if (utils.isContain(majiang_arr, [0x1, 0x1, 0x1, 0x9, 0x9, 0x9]) &&
                majiang_arr.every(c => [0x1, 0x9, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_32_2, fan: 32 });
            }
            {
                if (this.an_gang_num + this.ming_gang_num == 3) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_32_3, fan: 32 });
                }
            }
            if (this.sky_ting) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_32_4, fan: 32 });
            }
        }
        {
            if (fengke_num == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_1, fan: 24 });
            }
            if (is_7dui) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_2, fan: 24 });
            }
            if (zike_num == 4) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_3, fan: 24 });
            }
            if (tongkezi_num == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_4, fan: 24 });
            }
            if (tongshun_num == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_5, fan: 24 });
            }
        }
        {
            if (utils.isContain(majiang_arr, [1, 2, 3, 4, 5, 6, 7, 8, 9])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_16_1, fan: 16 });
            }
            let res1 = [
                [[1, 2, 3], [3, 4, 5], [5, 6, 7]],
                [[2, 3, 4], [4, 5, 6], [6, 7, 8]],
                [[3, 4, 5], [5, 6, 7], [7, 8, 9]],
            ];
            const shunzi_arr = [];
            shunzi_arr.push(...chi_shunzi_arr);
            shunzi_arr.push(...AI_all_TileType.shunzi_arr);
            let flag = true;
            for (const cc of res1) {
                for (const ccc of cc) {
                    if (!shunzi_arr.some(c => c.toString() == ccc.toString())) {
                        flag = false;
                    }
                }
            }
            if (flag) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_16_2, fan: 16 });
            }
            if (an_total_kezi == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_16_4, fan: 16 });
            }
            if (majiang_arr.every(c => c >= 0x1 && c <= 0x9)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_16_5, fan: 16 });
            }
        }
        {
            if (roomInfo.RepertoryCard.length == 0 && this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_8_1, fan: 8 });
            }
            if (roomInfo.RepertoryCard.length == 0 && this.zi_mo_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_8_2, fan: 8 });
            }
            let ret = roomInfo.record_history.oper.filter(c => c.uid == this.uid);
            if (ret.length >= 2 && ret[ret.length - 2].oper_type == mjConst_1.Player_Oper.PO_GANG && this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_8_3, fan: 8 });
            }
            {
                let ishu_false_ply = roomInfo.players.find(pl => pl.ishu == false);
                if (ishu_false_ply.curr_oper == mjConst_1.Player_Oper.PO_BA_GANG && this.zi_mo_num == 0) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_8_4, fan: 8 });
                }
            }
        }
        {
            if (fengke_num == 2 && feng_j_num == 1) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_1, fan: 6 });
            }
            if (jianke_num == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_2, fan: 6 });
            }
            if (total_kezi == 4 && majiang_arr.length == 14) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_3, fan: 6 });
            }
            if (this.an_gang_majiang.length / 4 == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_4, fan: 6 });
            }
            {
                if (majiang_arr.some(c => c <= 0x9) &&
                    majiang_arr.some(c => c >= 0x31 && c <= 0x37) &&
                    majiang_arr.every(c => c <= 0x9 || (c >= 0x31 && c <= 0x37))) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_5, fan: 6 });
                }
            }
            if (this.hand_majiang.length == 2 && this.zi_mo_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_6, fan: 6 });
            }
        }
        {
            let AI = new mj_Logic.HuPaiSuanFa();
            if (AI.quandaiyao(this.hand_majiang)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_4_1, fan: 4 });
            }
            if (this.ming_gang_num == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_4_2, fan: 4 });
            }
            if (this.tai_majiang.length == 0 && this.an_gang_majiang.length == 0 && this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_4_3, fan: 4 });
            }
            {
                let arr1 = [];
                for (const pl of roomInfo.players) {
                    arr1.push(...pl.chu_majiang);
                    arr1.push(...pl.tai_majiang);
                    arr1.push(...pl.an_gang_majiang);
                    arr1.push(...pl.chi_majiang);
                }
                if (arr1.filter(c => c == this.hand_majiang[this.hand_majiang.length - 1]).length == 3) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_4_4, fan: 4 });
                }
            }
        }
        {
            if (this.ting_status) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_1, fan: 2 });
            }
            if (this.tai_majiang.length == 0 && this.an_gang_majiang.length == 0 && this.zi_mo_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_2, fan: 2 });
            }
            if (this.an_gang_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_3, fan: 2 });
            }
            if (an_total_kezi == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_4, fan: 2 });
            }
            if (majiang_arr.filter(c => c == 0x1 || c == 0x9).length == 0 && majiang_arr.every(c => [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_5, fan: 2 });
            }
            if (this.hand_majiang.some(c => c && this.hand_majiang.filter(t => t == c).length == 4) &&
                this.an_gang_num == 0 && this.ming_gang_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_6, fan: 2 });
            }
            let AI = new mj_Logic.HuPaiSuanFa();
            if (AI.handler_ZhuanHuan_Arr(this.hand_majiang, null)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_7, fan: 2 });
            }
            if (jianke_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_8, fan: 2 });
            }
        }
        {
            if (this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_1, fan: 1 });
            }
            {
                let hu_mj = this.hand_majiang[this.hand_majiang.length - 1];
                let AI = new mj_Logic.HuPaiSuanFa();
                AI.handler_qian_bian_zhang(this.hand_majiang, 0);
                let arr = AI.shunzi_arr.filter(c => c.includes(hu_mj));
                if (arr.length > 0 && (arr[0][1] == hu_mj)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_2, fan: 1 });
                }
            }
            {
                let hu_mj = this.hand_majiang[this.hand_majiang.length - 1];
                let AI = new mj_Logic.HuPaiSuanFa();
                AI.handler_qian_bian_zhang(this.hand_majiang, 1);
                let arr = AI.shunzi_arr.filter(c => c.includes(hu_mj));
                if (arr.length > 0 && (arr[0][0] == hu_mj || arr[0][2] == hu_mj)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_3, fan: 1 });
                }
            }
            if (this.ming_gang_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_4, fan: 1 });
            }
            if (this.hua_majiang.length > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_5, fan: this.hua_majiang.length });
            }
            let res1 = [
                [1, 2, 3, 4, 5, 6],
                [2, 3, 4, 5, 6, 7],
                [3, 4, 5, 6, 7, 8],
                [4, 5, 6, 7, 8, 9],
            ];
            if (res1.some(c => utils.isContain(majiang_arr, c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_6, fan: 1 });
            }
            if (utils.isContain(majiang_arr, [1, 2, 3, 7, 8, 9])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_7, fan: 1 });
            }
            let AI = new mj_Logic.HuPaiSuanFa();
            if (AI.handler_yibangao(this.hand_majiang, null)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_8, fan: 1 });
            }
        }
        {
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_3);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_6)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_48_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_48_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_64_4);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_7)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_5);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_8)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_32_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_4);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_7);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_7);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_32_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_3);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_5)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_6);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_32_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_6);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_7);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_32_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_32_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_4);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_5)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_16_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_6);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_7);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_16_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_4);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_16_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_8_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_8_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_4);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_6_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_6_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_3);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_4_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_4_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_4);
            }
        }
        return res_fan_arr;
    }
}
exports.default = mjPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWpQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9NSi9saWIvbWpQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1RUFBb0U7QUFFcEUsd0NBQXlDO0FBQ3pDLHVDQUF3QztBQUN4Qyx1Q0FBNkQ7QUFDN0QsbUZBQWlGO0FBUWpGLE1BQXFCLFFBQVMsU0FBUSx1QkFBVTtJQTBENUMsWUFBWSxDQUFTLEVBQUUsSUFBUztRQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUF6RGhCLFdBQU0sR0FBZ0QsTUFBTSxDQUFDO1FBRTdELGNBQVMsR0FBZ0IscUJBQVcsQ0FBQyxPQUFPLENBQUM7UUFFN0MsYUFBUSxHQUFnQixxQkFBVyxDQUFDLE9BQU8sQ0FBQztRQUU1QyxpQkFBWSxHQUFhLEVBQUUsQ0FBQztRQUM1QixnQkFBVyxHQUFhLEVBQUUsQ0FBQztRQUUzQixnQkFBVyxHQUFhLEVBQUUsQ0FBQztRQUUzQixpQkFBWSxHQUFhLEVBQUUsQ0FBQztRQUU1QixnQkFBVyxHQUFhLEVBQUUsQ0FBQztRQUUzQixvQkFBZSxHQUFhLEVBQUUsQ0FBQztRQUUvQixnQkFBVyxHQUFhLEVBQUUsQ0FBQztRQUUzQixTQUFJLEdBQVksS0FBSyxDQUFDO1FBQ3RCLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBRXpCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFHbkIsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFFbEIsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFFaEIsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUVkLGVBQVUsR0FBYSxFQUFFLENBQUM7UUFFMUIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUVuQixnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUVwQixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWpCLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLFlBQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztR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LFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDdEYsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNyRTtZQUVELElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDdkcsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNyRTtZQUVELElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFELFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDckU7WUFFRCxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMxRCxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxFQUFFO2dCQUNwSCxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakUsSUFBSSxHQUFHLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pDLElBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUU7Z0JBQzNDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDckU7WUFFRCxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLEVBQUU7Z0JBQzVDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDckU7WUFFRCxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLHFCQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEgsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxF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RixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQ7Z0JBQ0ksSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUM7b0JBQ3hFLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQztvQkFDeEUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQzFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQ3JFO2FBQ0o7WUFFRCxJQUFJLFlBQVksSUFBSSxDQUFDLEVBQUU7Z0JBQ25CLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDckU7U0FDSjtRQUVEO1lBRUksSUFBSSxJQUFJLEdBQUc7Z0JBQ1AsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDNUQsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDNUQsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDNUQsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDNUQsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQzthQUMvRCxDQUFDO1lBQ0YsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDakQsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNyRTtZQUVELElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM1RCxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMxRixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQ7Z0JBQ0ksSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxFQUFFO29CQUM1QyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUNyRTthQUNKO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNmLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDckU7U0FDSjtRQUVEO1lBRUksSUFBSSxVQUFVLElBQUksQ0FBQyxFQUFFO2dCQUNqQixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsSUFBSSxPQUFPLEVBQUU7Z0JBQ1QsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNyRTtZQUVELElBQUksUUFBUSxJQUFJLENBQUMsRUFBRTtnQkFDZixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsSUFBSSxZQUFZLElBQUksQ0FBQyxFQUFFO2dCQUNuQixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsSUFBSSxZQUFZLElBQUksQ0FBQyxFQUFFO2dCQUNuQixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1NBQ0o7UUFFRDtZQUVJLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzNELFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDckU7WUFFRCxJQUFJLElBQUksR0FBRztnQkFDUCxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVB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