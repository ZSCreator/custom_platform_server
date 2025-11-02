import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import mjRoom from "./mjRoom";
import utils = require("../../../utils");
import mj_Logic = require("./mj_Logic");
import { Player_Oper, Imsg_majiang_oper_c } from "./mjConst";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";

/**一个玩家
 * 1、吃：对方出的一张牌，自己手中有两张牌可以与那一张牌拼成一摸牌。例如、有人出了个二万，自己手里有三万、四万，于是你就可以吃
 * 2、碰：对方出的一张牌，自己手中有两张一样的，于是就碰。例如自己手里有两个二万，对方又打了一个，于是你就可以碰；碰了之后如果自己后来又有一张二万，就是一杠。
 * 3、杠：对方出一张牌，自己手里有三个一样的，直接杠。
 * 4、胡：就是赢了。就是手里凑够一对一样的，还有其他的三个三个连着的。
 */
export default class mjPlayer extends PlayerInfo {
    seat: number;
    status: 'NONE' | 'PS_WAIT' | 'PS_OPER' | 'PS_READY' = 'NONE';
    /**当前操作 */
    curr_oper: Player_Oper = Player_Oper.PO_NONE;
    /**上一次操作 */
    pre_oper: Player_Oper = Player_Oper.PO_NONE;
    /**手牌 */
    hand_majiang: number[] = [];
    chu_majiang: number[] = [];
    /**碰的麻将 */
    tai_majiang: number[] = [];
    /**杠的麻将 */
    gang_majiang: number[] = [];
    /**吃的麻将 */
    chi_majiang: number[] = [];
    /**暗杠的麻将 */
    an_gang_majiang: number[] = [];
    /**花牌 */
    hua_majiang: number[] = [];
    /**是否已经胡牌 */
    ishu: boolean = false;
    change_socre: number = 0;
    /**利润 */
    profit: number = 0;

    /**明杠次数 */
    ming_gang_num = 0;
    /**暗杠次数 */
    an_gang_num = 0;
    /**自摸次数 */
    zi_mo_num = 0;
    /**胡其他人 mj*/
    hu_majiang: number[] = [];
    /**申请听牌 */
    apply_ting = false;
    /**是否 听牌状态 */
    ting_status = false;
    /**是否天听 */
    sky_ting = false;
    /**托管 */
    trusteeship = false;
    chi_pos = -1;
    Oper_timeout: NodeJS.Timer = null;
    /**过胡加倍 不可以 变jiao 听牌后才有过胡*/
    pass_hu_num = 0;
    /**巴杠的麻将 */
    gang_mj: number;
    /**操作 吃 碰 杠 胡 集合 */
    oper_data = {
        is_chi: false,
        is_peng: false,
        is_gang: false,
        is_hu: false,
        is_ting: false
    }
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(i: number, opts: any) {
        super(opts);
        this.seat = i;
        this.gold = utils.sum(opts.gold);
        this.initgold = this.gold;
    }

    majiang_oper_c(oper_type: Player_Oper, cmsg: any, roomInfo: mjRoom) {
        let result: any;
        let oper_type_string = "";
        switch (oper_type) {
            // case Player_Oper.PO_READY:
            // result = this.checkCanDeal(oper_type, cmsg, roomInfo);
            // break;
            case Player_Oper.PO_PLAY:
                oper_type_string = "PO_PLAY";
                result = this.handler_play(oper_type, cmsg, roomInfo);
                break;
            case Player_Oper.PO_PASS:
                oper_type_string = "PO_PASS";
                result = this.handler_pass(oper_type, cmsg, roomInfo);
                break;
            case Player_Oper.PO_CHI:
                oper_type_string = "PO_CHI";
                result = this.handler_chi(oper_type, cmsg, roomInfo);
                break;
            case Player_Oper.PO_PENG:
                oper_type_string = "PO_PENG";
                result = this.handler_peng(oper_type, cmsg, roomInfo);
                break;
            case Player_Oper.PO_GANG:
                oper_type_string = "PO_GANG";
                result = this.handler_gang(oper_type, cmsg, roomInfo);
                break;
            case Player_Oper.PO_HU:
                oper_type_string = "PO_HU";
                result = this.handler_hu(oper_type, cmsg, roomInfo);
                break;
            case Player_Oper.PO_TING:
                oper_type_string = "PO_TING";
                result = this.handler_ting(oper_type, cmsg, roomInfo);
                break;
            case Player_Oper.PO_TUOGUAN:
                oper_type_string = "PO_TUOGUAN";
                result = this.handler_tuoguan(oper_type, cmsg, roomInfo);
                break;
            default:
                return { code: 500, error: "oper_type 非法" };
        }
        // console.warn(`majiang_oper_c`, this.nickname, oper_type_string, cmsg, result.code, utils.cDate());
        if (result.code == 200) {
            roomInfo.record_history.oper.push({
                uid: this.uid, oper_type: oper_type,
                oper_type_string, mj: cmsg, update_time: utils.cDate()
            });
        }
        return result;
    }

    handler_play(oper_type: Player_Oper, cmsg: number, roomInfo: mjRoom) {
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
        let opts: Imsg_majiang_oper_c = {
            oper_type,
            uid: this.uid,
            seat: this.seat,
            other_seat: roomInfo.curr_doing_seat,
            roomId: roomInfo.roomId,
            hand_mj: cmsg,
        }
        roomInfo.note_players_oper(opts);
        if (this.apply_ting && mj_Logic.is_jiao(this.hand_majiang).length > 0) {
            this.note_ting(roomInfo);
            this.ting_status = true;
            if (roomInfo.record_history.oper.length == 0 ||
                roomInfo.record_history.oper.every(c => c.oper_type == Player_Oper.PO_TING)) {
                this.sky_ting = true;
            }
        }
        clearTimeout(this.Oper_timeout);
        this.apply_ting = false;
        this.pre_oper = Player_Oper.PO_PLAY;
        this.curr_oper = Player_Oper.PO_PLAY;
        this.status = "PS_WAIT";
        this.hand_majiang.sort((a1, a2) => a1 - a2);
        roomInfo.curr_majiang = cmsg;
        roomInfo.handler_pass(this);
        roomInfo.handler_wait_oper();
        return { code: 200 };
    }

    handler_pass(oper_type: Player_Oper, cmsg: any, roomInfo: mjRoom) {
        if (roomInfo.curr_majiang == null) {
            return { code: 500, error: "handler_pass 非法" };
        }
        if (roomInfo.curr_doing_seat == this.seat) {
            return { code: 500, error: "该你操作 不能弃牌" };
        }
        if (this.ting_status && this.oper_data.is_hu) {
            this.pass_hu_num++;
        }
        this.curr_oper = Player_Oper.PO_PASS;
        clearTimeout(this.Oper_timeout);
        roomInfo.handler_wait_oper();
        return { code: 200 };
    }

    handler_chi(oper_type: Player_Oper, cmsg: any, roomInfo: mjRoom) {
        if (roomInfo.curr_majiang == null) {
            return { code: 500, error: "handler_chi 非法" };
        }
        if (this.curr_oper != Player_Oper.PO_NONE) {
            return { code: 500, error: `handler_peng not PO_CHI|${cmsg}`, data: this.hand_majiang };
        }
        let is_chi = mj_Logic.is_can_chi(this.hand_majiang, roomInfo.curr_majiang);
        if (!is_chi) {
            return { code: 500, error: `chi 没有满足条件的牌|${cmsg}`, data: this.hand_majiang };
        }
        this.curr_oper = Player_Oper.PO_CHI;
        let opts: Imsg_majiang_oper_c = {
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

    handler_peng(oper_type: Player_Oper, cmsg: any, roomInfo: mjRoom) {
        if (this.ting_status) {
            return { code: 500, error: `handler_peng in ting|${cmsg}`, data: this.hand_majiang };
        }
        let ret = mj_Logic.is_can_peng(this.hand_majiang, roomInfo.curr_majiang);
        if (!ret) {
            return { code: 500, error: `peng 没有满足条件的牌|${cmsg}`, data: this.hand_majiang };
        }
        if (this.curr_oper != Player_Oper.PO_NONE) {
            return { code: 500, error: `handler_peng not PO_NONE|${cmsg}`, data: this.hand_majiang };
        }
        this.pre_oper = Player_Oper.PO_PENG;
        this.curr_oper = Player_Oper.PO_PENG;
        let opts: Imsg_majiang_oper_c = {
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

    handler_gang(oper_type: Player_Oper, cmsg: any, roomInfo: mjRoom) {
        if (roomInfo.RepertoryCard.length == 0) {
            return { code: 500, error: `handler_gang not majiang mo` };
        }
        if (this.curr_oper != Player_Oper.PO_NONE) {
            return { code: 500, error: `handler_gang not PO_NONE|${cmsg}`, data: this.hand_majiang };
        }
        /**点杠 */
        if (cmsg == roomInfo.curr_majiang) {
            if (!mj_Logic.is_can_gang(this.hand_majiang, roomInfo.curr_majiang)) {
                return { code: 500, error: `gang 没有满足条件的牌|${cmsg}`, data: this.hand_majiang };
            }
        }/**暗杠 */
        else {
            if (!this.hand_majiang.includes(cmsg) && !this.tai_majiang.includes(cmsg)) {
                return { code: 500, error: `gang mj 非法|${cmsg}`, data: this.hand_majiang };
            }
            if (!mj_Logic.is_can_gang(this.hand_majiang, cmsg) && !mj_Logic.is_can_gang(this.tai_majiang, cmsg)) {
                return { code: 500, error: `gang 没有满足条件的牌|${cmsg}`, data: this.hand_majiang };
            }
        }
        if (this.ting_status) {
            if (cmsg != roomInfo.curr_majiang && !this.tai_majiang.includes(cmsg)) {/**点杠 */
                return { code: 500, error: `handler_gang in ting|${cmsg}`, data: this.hand_majiang };
            }
        }

        this.curr_oper = Player_Oper.PO_GANG;
        let opts: Imsg_majiang_oper_c = {
            oper_type,
            uid: this.uid,
            seat: this.seat,
            other_seat: roomInfo.curr_doing_seat,
            roomId: roomInfo.roomId,
            hand_mj: cmsg
        }
        roomInfo.note_players_oper(opts);
        clearTimeout(this.Oper_timeout);
        this.gang_mj = cmsg;
        /**点杠 */
        if (cmsg == roomInfo.curr_majiang) {
            roomInfo.handler_wait_oper();
        }/**暗杠 */
        else {
            if (this.tai_majiang.includes(cmsg)) {//巴杠
                this.curr_oper = Player_Oper.PO_BA_GANG;
                roomInfo.handler_pass(this);
                roomInfo.handler_wait_oper();
            } else {//自摸的暗杠
                this.logic_gang(roomInfo, cmsg);
                if (roomInfo.handler_mo())
                    roomInfo.handle_buhua();
            }
        }
        return { code: 200 };
    }

    handler_hu(oper_type: Player_Oper, cmsg: any, roomInfo: mjRoom) {
        if (this.curr_oper != Player_Oper.PO_NONE) {
            return { code: 500, error: `handler_gang not PO_NONE|${cmsg}`, data: this.hand_majiang };
        }
        let ret = mj_Logic.is_can_hu(this.hand_majiang, roomInfo.curr_majiang);
        if (!ret) {
            return { code: 500, error: `hu 没有满足条件的牌|${roomInfo.curr_majiang}` };
        }
        this.curr_oper = Player_Oper.PO_HU;
        let opts: Imsg_majiang_oper_c = {
            oper_type,
            uid: this.uid,
            seat: this.seat,
            other_seat: roomInfo.curr_doing_seat,
            roomId: roomInfo.roomId,
            hand_mj: cmsg
        }
        roomInfo.note_players_oper(opts);
        clearTimeout(this.Oper_timeout);
        setTimeout(() => {
            this.logic_hu(roomInfo, roomInfo.curr_majiang);
            roomInfo.status = "END";
            roomInfo.handler_complete();
        }, 200);
        return { code: 200 };
    }

    handler_ting(oper_type: Player_Oper, cmsg: any, roomInfo: mjRoom) {
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

    handler_tuoguan(oper_type: Player_Oper, cmsg: any, roomInfo: mjRoom) {
        this.trusteeship = [true, false].includes(cmsg) ? cmsg : false;
        if (this.trusteeship) {
            if (this.status == "PS_OPER" && roomInfo.curr_majiang == null)
                roomInfo.auto_play(this);
        }
        return { code: 200, cmsg };
    }
    note_ting(roomInfo: mjRoom) {
        let opts: Imsg_majiang_oper_c = {
            oper_type: Player_Oper.PO_TING,
            uid: this.uid,
            seat: this.seat,
            other_seat: roomInfo.curr_doing_seat,
            roomId: roomInfo.roomId,
            // hand_mj: cmsg,
        }
        roomInfo.note_players_oper(opts);
    }
    logic_peng(roomInfo: mjRoom, target: number) {
        let curr_player = roomInfo.players.find(pl => pl.seat == roomInfo.curr_doing_seat);
        curr_player.chu_majiang = mj_Logic.arr_erase_one(curr_player.chu_majiang, roomInfo.curr_majiang, 1);

        this.tai_majiang.push(roomInfo.curr_majiang);
        roomInfo.curr_doing_seat = this.seat;
        this.pre_oper = Player_Oper.PO_PENG;
        let erase_num = 0;
        for (let idx = 0; idx < this.hand_majiang.length; idx++) {
            const mj = this.hand_majiang[idx];
            if (mj == roomInfo.curr_majiang) {
                this.tai_majiang.push(mj);
                erase_num++;
                if (erase_num >= 2)
                    break
            }
        }
        this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang, 2);
    }

    logic_hu(roomInfo: mjRoom, target: number) {
        this.ishu = true;
        if (target == null) {
            this.zi_mo_num++;
        } else {
            this.hand_majiang.push(target);
            this.hu_majiang.push(target);
        }
    }

    logic_gang(roomInfo: mjRoom, target: number) {
        let curr_player = roomInfo.players.find(pl => pl.seat == roomInfo.curr_doing_seat);
        curr_player.chu_majiang = mj_Logic.arr_erase_one(curr_player.chu_majiang, target, 1);
        //点杠
        if (target == roomInfo.curr_majiang && roomInfo.curr_majiang != null) {
            this.ming_gang_num++;
            this.gang_majiang.push(target);//other手牌里面
            for (let idx = 0; idx < this.hand_majiang.length; idx++) {
                if (target == this.hand_majiang[idx])
                    this.gang_majiang.push(target);
            }
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, target, 4);
            // console.warn(this.uid, "点杠");
        } else {
            //巴杠
            if (this.curr_oper == Player_Oper.PO_BA_GANG) {
                this.ming_gang_num++;
                this.gang_majiang.push(...[target, target, target, target]);//手牌里面
                this.tai_majiang = mj_Logic.arr_erase_one(this.tai_majiang, target, 4);
                this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, target, 4);
                // console.warn(this.uid, "巴杠");
            } else {
                //暗杠
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
                // console.warn(this.uid, "暗杠");
            }
        }
    }

    logic_chi(roomInfo: mjRoom, target: number) {
        this.pre_oper = Player_Oper.PO_CHI;
        let curr_player = roomInfo.players.find(pl => pl.seat == roomInfo.curr_doing_seat);
        curr_player.chu_majiang = mj_Logic.arr_erase_one(curr_player.chu_majiang, roomInfo.curr_majiang, 1);
        let temp_mj_arr: number[] = [];
        temp_mj_arr.push(roomInfo.curr_majiang);
        if (this.chi_pos == 0) {//{t,0,0}
            temp_mj_arr.push(roomInfo.curr_majiang + 1);
            temp_mj_arr.push(roomInfo.curr_majiang + 2);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang + 1, 1);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang + 2, 1);
        }
        if (this.chi_pos == 1) {//{0,t,0}
            temp_mj_arr.push(roomInfo.curr_majiang - 1);
            temp_mj_arr.push(roomInfo.curr_majiang + 1);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang - 1, 1);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang + 1, 1);
        }
        if (this.chi_pos == 2) {//{0,0,t}
            temp_mj_arr.push(roomInfo.curr_majiang - 1);
            temp_mj_arr.push(roomInfo.curr_majiang - 2);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang - 1, 1);
            this.hand_majiang = mj_Logic.arr_erase_one(this.hand_majiang, roomInfo.curr_majiang - 2, 1);
        }
        temp_mj_arr.sort((a, b) => a - b);
        this.chi_majiang.push(...temp_mj_arr);
    }

    async settlement(roomInfo: mjRoom) {
        const res = await createPlayerRecordService()
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
        }
    }

    deal_strip() {
        return {
            uid: this.uid,
            seat: this.seat,
            hand_mjs: this.hand_majiang
        }
    }

    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat
        }
    }
    loaded_strip(uid: string) {
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
        }
    }


    possible_max_fan(roomInfo: mjRoom) {
        let res_fan_arr: { type: mj_Logic.Mj_Hu_Type, fan: number }[] = [];
        /**手牌 吃 碰 杠得 所有牌 */
        let majiang_arr: number[] = [];
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

        /**风刻数量 */
        let fengke_num = 0;
        /**风将牌数 */
        let feng_j_num = 0;
        /**字刻数量 */
        let zike_num = 0;
        /**箭刻数量 */
        let jianke_num = 0;
        /**箭将牌数 */
        let jian_j_num = 0;
        /**是否七对 */
        let is_7dui = false;
        /**同花色顺刻数量 */
        let tongshun_num = 0;
        /**同花色顺刻数量 */
        let tongkezi_num = 0;
        /**总刻子 */
        let total_kezi = 0;
        /**暗刻子 */
        let an_total_kezi = 0;

        let all_TileType = [...this.hand_majiang];

        let AI_all_TileType = new mj_Logic.HuPaiSuanFa();
        AI_all_TileType.AnaTileType(all_TileType, null);

        //三同顺 四同顺，包含吃牌和手牌
        let temp_chi_majiang = this.chi_majiang.slice();
        let chi_shunzi_arr: number[][] = [];
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
        //三节高 四节高，包含碰牌和手牌
        let temp_tai_majiang = this.tai_majiang.slice();
        let peng_kezi_arr: number[][] = [];
        while (temp_tai_majiang.length >= 3) {
            peng_kezi_arr.push([temp_tai_majiang.shift(), temp_tai_majiang.shift(), temp_tai_majiang.shift()]);
        }
        /**暗刻+碰 */
        const temp_jiejiegao: number[][] = [];
        temp_jiejiegao.push(...AI_all_TileType.kezi_arr);
        temp_jiejiegao.push(...peng_kezi_arr);
        temp_jiejiegao.sort((a, b) => a[0] - b[0]);
        for (let index = 0; index < temp_jiejiegao.length; index++) {
            let data1 = temp_jiejiegao[index][0];
            let tempArr: number[] = [data1];
            for (let j = index + 1; j < temp_jiejiegao.length; j++) {
                const data2 = temp_jiejiegao[j][0];
                if (data1 < 0x9 && data1 + 1 == data2) {
                    tempArr.push(data2);
                    data1 = data2;
                } else {
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
            feng_j_num++;//东南西北(风)
        }
        if (AI_all_TileType.jiang_pai >= 0x35 && AI_all_TileType.jiang_pai <= 0x37) {
            jian_j_num++;//中发白(箭)
        }

        let AI_an_TileType = new mj_Logic.HuPaiSuanFa();
        AI_an_TileType.AnaTileType(this.hand_majiang.slice(), null);
        an_total_kezi = AI_an_TileType.kezi_arr.length;
        /**通常 */
        let AI_normal_TileType = new mj_Logic.HuPaiSuanFa();
        AI_normal_TileType.AnaTileType(this.hand_majiang, null);
        is_7dui = AI_normal_TileType.is_mht_qd();
        //88番
        {
            /**1.大四喜：胡牌时由四副风牌刻子或杠牌加一对将牌组成牌型。 */
            if (utils.isContain(majiang_arr, [0x31, 0x31, 0x31, 0x32, 0x32, 0x32, 0x33, 0x33, 0x33, 0x34, 0x34, 0x34])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_1, fan: 88 });
            }
            /**2.大三元：胡牌时手牌里有中、發、白三幅刻子。 */
            if (utils.isContain(majiang_arr, [0x35, 0x35, 0x35, 0x36, 0x36, 0x36, 0x37, 0x37, 0x37])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_2, fan: 88 });
            }
            /**3.九莲宝灯：由同种花色序数牌按1112345678999组成的特定牌型，见同花色任何一张序数牌即成和牌。 */
            if (utils.isContain(this.hand_majiang, [0x1, 0x1, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0x9, 0x9])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_3, fan: 88 });
            }
            /**4.大于五：胡牌时手牌全是由序数牌6-9萬组成的顺子、刻子、将牌。 */
            if (majiang_arr.every(c => [0x6, 0x7, 0x8, 0x9].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_4, fan: 88 });
            }
            /**5.小于五：胡牌时手牌全是由序数牌1-4萬组成的顺子、刻子、将牌。 */
            if (majiang_arr.every(c => [0x1, 0x2, 0x3, 0x4].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_5, fan: 88 });
            }
            /**6.大七星：胡牌时手牌是由“東南西北中發白”组成的七对。 */
            if (utils.isContain([0x31, 0x31, 0x32, 0x32, 0x33, 0x33, 0x34, 0x34, 0x35, 0x35, 0x36, 0x36, 0x37, 0x37], majiang_arr)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_6, fan: 88 });
            }
            /**7.连七对：胡牌时手牌是由同种花色序数牌且序数相连的七个对子。 */
            let ret1 = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7].toString();
            let ret2 = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8].toString();
            let ret3 = [3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9].toString();
            let ret = majiang_arr.toString();
            if (ret1 == ret || ret2 == ret || ret3 == ret) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_7, fan: 88 });
            }
            /**8.四杠：胡牌时手牌里有四副杠牌，明杠、暗杠均可。 */
            if (this.an_gang_num + this.ming_gang_num == 4) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_8, fan: 88 });
            }
            /**9.天胡，庄家在发完牌时就胡牌。如果庄家有补花，在补完花后就胡牌也算天胡。如果庄家在发完牌后有暗杠，那么不算天和。 */
            let other = roomInfo.record_history.oper.filter(c => c.uid != this.uid).filter(c => c.oper_type != Player_Oper.PO_TING);
            let MeOper = roomInfo.record_history.oper.filter(c => c.uid == this.uid).filter(c => c.oper_type != Player_Oper.PO_TING);
            if (other.length == 0 && MeOper.length == 1 && MeOper[0].oper_type == Player_Oper.PO_HU) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_9, fan: 88 });
            }
            /**10.地胡：闲家摸到第一张牌就胡牌,称为地胡。如果闲家抓的第一张牌是花牌，那么补花之后和牌也算地胡。如果闲家抓牌前有人吃碰杠（包括暗杠），那么不算地和。 */
            if (other.length == 1 && other[0].oper_type == Player_Oper.PO_PLAY &&
                MeOper.length == 1 && MeOper[0].oper_type == Player_Oper.PO_HU &&
                this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_10, fan: 88 });
            }
        }
        //64番
        {
            /**1.小四喜：胡牌时手牌里有风牌的三幅刻子以及将牌。 */
            if (fengke_num == 3 && feng_j_num == 1) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_1, fan: 64 });
            }
            /**2.小三元：胡牌时授牌里有箭牌的两幅刻子以及将牌。 */
            if (jianke_num == 2 && jian_j_num == 1) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_2, fan: 64 });
            }
            /**3.双龙会：胡牌时手牌里有同花色的两个老少副，5为将牌。 */
            {
                let ret1 = [0x1, 0x2, 0x3, 0x1, 0x2, 0x3, 0x5, 0x5, 0x7, 0x8, 0x9, 0x7, 0x8, 0x9];
                if (utils.isContain(majiang_arr, ret1)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_3, fan: 64 });
                }
            }
            /**4.字一色：胡牌时手牌全是字牌 */
            if (majiang_arr.every(c => [0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_4, fan: 64 });
            }

            /**5.四暗刻：胡牌时手牌里有四副暗刻或暗杠。 */
            if (this.an_gang_majiang.length / 4 + an_total_kezi == 4) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_5, fan: 64 });
            }
            /**6.人胡：庄家打出的第一张牌闲家就胡牌称为人胡.如果庄家出牌前有暗杠，那么不算人胡。 */
            let other = roomInfo.record_history.oper.filter(c => c.uid != this.uid);
            let MeOper = roomInfo.record_history.oper.filter(c => c.uid == this.uid);
            if (MeOper.length == 1 && MeOper[0].oper_type == Player_Oper.PO_HU &&
                other.length == 1 && other[0].oper_type == Player_Oper.PO_PLAY && this.zi_mo_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_6, fan: 64 });
            }
        }
        //48番
        {
            /**1.三元七对：七对胡牌，且包括“中、發、白”三个对子。 */
            if (is_7dui && utils.isContain(majiang_arr, [0x35, 0x35, 0x36, 0x36, 0x37, 0x37])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_48_1, fan: 48 });
            }

            /**2.四喜七对：七对胡牌，且包括“東、南、西、北”四个对子。 */
            if (is_7dui && utils.isContain(majiang_arr, [0x31, 0x31, 0x32, 0x32, 0x33, 0x33, 0x34, 0x34])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_48_2, fan: 48 });
            }
            /**3.四节高：胡牌时牌里有同种花色且序数依次递增一位数的4副刻子（或杠子）。 */
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
            /**4.四同顺：胡牌时，牌里有同种花色且序数相同的4副顺子。 */
            if (tongshun_num == 4) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_48_4, fan: 48 });
            }
        }
        //32番
        {
            /**1.四步高：胡牌时，牌里有同种花色四副依次递增一位数或依次递增二位数的顺子。 */
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
            /**2.混幺九：胡牌时，由字牌和序数牌一、九的刻子及字牌将牌组成的牌型。 */
            if (utils.isContain(majiang_arr, [0x1, 0x1, 0x1, 0x9, 0x9, 0x9]) &&
                majiang_arr.every(c => [0x1, 0x9, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_32_2, fan: 32 });
            }
            /**3.三杠：胡牌时，牌里有3副杠，明暗杠均可。 */
            {
                if (this.an_gang_num + this.ming_gang_num == 3) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_32_3, fan: 32 });
                }
            }
            /**4.天听：庄家打出第一张牌时报听称为天听；发完牌后闲家便报听也称为天听。天听要在胡牌后 */
            if (this.sky_ting) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_32_4, fan: 32 });
            }
        }
        //24番
        {
            /**1.大三风：胡牌时手牌里有三幅风刻。 */
            if (fengke_num == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_1, fan: 24 });
            }
            /**2.七对：胡牌的牌型是七对将牌。 */
            if (is_7dui) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_2, fan: 24 });
            }
            /**3.四字刻：四副字刻加一对将牌的胡牌牌型。 */
            if (zike_num == 4) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_3, fan: 24 });
            }
            /**4.三节高：胡牌时，牌里有一种花色且依次递增一位数字的三副刻子。 */
            if (tongkezi_num == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_4, fan: 24 });
            }
            /**5.三同顺：胡牌时，牌里有一种花色且序数相同的3副顺子。 */
            if (tongshun_num == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_5, fan: 24 });
            }
        }
        //16番
        {
            /**1.清龙：胡牌时，有同花色1-9相连的序数牌即可。 */
            if (utils.isContain(majiang_arr, [1, 2, 3, 4, 5, 6, 7, 8, 9])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_16_1, fan: 16 });
            }
            /**2.三步高：胡牌时，牌里有同种花色三副依次递增一位数或依次递增二位数的顺子。 */
            let res1 = [
                [[1, 2, 3], [3, 4, 5], [5, 6, 7]],
                [[2, 3, 4], [4, 5, 6], [6, 7, 8]],
                [[3, 4, 5], [5, 6, 7], [7, 8, 9]],
            ];
            const shunzi_arr: number[][] = [];
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
            /**4.三暗刻：胡牌时，手牌里有三个暗刻。 */
            if (an_total_kezi == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_16_4, fan: 16 });
            }
            /**5.清一色：胡牌时只有一种花色的牌且无字牌。 */
            if (majiang_arr.every(c => c >= 0x1 && c <= 0x9)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_16_5, fan: 16 });
            }
        }
        //8番
        {
            /**1.妙手回春：摸牌墙上最后一张牌自摸胡牌。 */
            if (roomInfo.RepertoryCard.length == 0 && this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_8_1, fan: 8 });
            }
            /**2.海底捞月：胡打出的最后一张牌。 */
            if (roomInfo.RepertoryCard.length == 0 && this.zi_mo_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_8_2, fan: 8 });
            }
            /**3.杠上开花：杠后自摸（不包含补花）。 */
            let ret = roomInfo.record_history.oper.filter(c => c.uid == this.uid);
            if (ret.length >= 2 && ret[ret.length - 2].oper_type == Player_Oper.PO_GANG && this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_8_3, fan: 8 });
            }
            /**4.抢杠胡：胡别人杠的牌。 */
            {
                let ishu_false_ply = roomInfo.players.find(pl => pl.ishu == false);
                if (ishu_false_ply.curr_oper == Player_Oper.PO_BA_GANG && this.zi_mo_num == 0) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_8_4, fan: 8 });
                }
            }
        }
        //6番
        {
            /**1.小三风：胡牌时手牌里有两副风牌刻子和一副风牌将牌。 */
            if (fengke_num == 2 && feng_j_num == 1) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_1, fan: 6 });
            }
            /**2.双箭刻：胡牌时手牌里有两副箭刻（杠）。 */
            if (jianke_num == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_2, fan: 6 });
            }
            /**3.碰碰胡：四副刻子或杠牌加一副将牌组成的基本胡牌牌型。 */
            if (total_kezi == 4 && majiang_arr.length == 14) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_3, fan: 6 });
            }
            /**4.双暗杠：胡牌时牌里有两副暗杠。 */
            if (this.an_gang_majiang.length / 4 == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_4, fan: 6 });
            }
            /**5.混一色：胡牌时手牌由同种花色的序数牌加字牌组成。 */
            {
                if (majiang_arr.some(c => c <= 0x9) &&
                    majiang_arr.some(c => c >= 0x31 && c <= 0x37) &&
                    majiang_arr.every(c => c <= 0x9 || (c >= 0x31 && c <= 0x37))) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_5, fan: 6 });
                }
            }
            /**6.全求人 全靠吃牌、碰牌(明杠也可以，暗杠不算)、单钓别人打出的牌和牌。不计单钓将。简称"全求"。 */
            if (this.hand_majiang.length == 2 && this.zi_mo_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_6, fan: 6 });
            }
        }
        //4番
        {
            /**1.全带幺：胡牌时，手牌里的顺子刻子都必须带有幺九牌 */
            let AI = new mj_Logic.HuPaiSuanFa();
            if (AI.quandaiyao(this.hand_majiang)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_4_1, fan: 4 });
            }
            /**2.双明杠：胡牌时牌里有两副明杠。 */
            if (this.ming_gang_num == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_4_2, fan: 4 });
            }
            /**3.不求人：玩家没有进行吃牌、碰牌、明杠就自摸胡牌了。 */
            if (this.tai_majiang.length == 0 && this.an_gang_majiang.length == 0 && this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_4_3, fan: 4 });
            }
            /**4.胡绝张：桌面和牌池里已亮明三张牌，胡第四张牌（抢杠胡不计胡绝张）。 */
            {
                let arr1: number[] = [];
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
        //2番
        {
            /**1.报听：选择听牌。 */
            if (this.ting_status) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_1, fan: 2 });
            }
            /**2.门前清：点胡，没有吃、碰、明杠操作 */
            if (this.tai_majiang.length == 0 && this.an_gang_majiang.length == 0 && this.zi_mo_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_2, fan: 2 });
            }
            /**3.暗杠：用自己手中四张相同的牌开杠 */
            if (this.an_gang_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_3, fan: 2 });
            }
            /**4.双暗刻：两副暗刻。 */
            if (an_total_kezi == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_4, fan: 2 });
            }
            /**5.断幺九：胡牌时，手牌里没有幺九牌。 */
            if (majiang_arr.filter(c => c == 0x1 || c == 0x9).length == 0 && majiang_arr.every(c => [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_5, fan: 2 });
            }
            /**6.四归一：胡牌时，手牌里有四张相同的牌但没有开杠。 */
            if (this.hand_majiang.some(c => c && this.hand_majiang.filter(t => t == c).length == 4) &&
                this.an_gang_num == 0 && this.ming_gang_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_6, fan: 2 });
            }
            /**7.平胡：四副顺子加一副序数牌将牌的胡牌牌型。 */
            let AI = new mj_Logic.HuPaiSuanFa();
            if (AI.handler_ZhuanHuan_Arr(this.hand_majiang, null)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_7, fan: 2 });
            }
            /**8.箭刻：一副中、發、白任意之一的刻子。 */
            if (jianke_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_8, fan: 2 });
            }
        }
        //1番
        {
            /**1.自摸：自己从牌墙摸进牌胡牌。 */
            if (this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_1, fan: 1 });
            }
            /**2.嵌张：胡两张序数牌之间的序数 */
            {
                let hu_mj = this.hand_majiang[this.hand_majiang.length - 1];
                let AI = new mj_Logic.HuPaiSuanFa();
                AI.handler_qian_bian_zhang(this.hand_majiang, 0);
                let arr = AI.shunzi_arr.filter(c => c.includes(hu_mj));
                if (arr.length > 0 && (arr[0][1] == hu_mj)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_2, fan: 1 });
                }
            }
            /**3.边张：单胡序数牌123的3或789的7 */
            {
                let hu_mj = this.hand_majiang[this.hand_majiang.length - 1];
                let AI = new mj_Logic.HuPaiSuanFa();
                AI.handler_qian_bian_zhang(this.hand_majiang, 1);
                let arr = AI.shunzi_arr.filter(c => c.includes(hu_mj));
                if (arr.length > 0 && (arr[0][0] == hu_mj || arr[0][2] == hu_mj)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_3, fan: 1 });
                }
            }
            /**4.明杠：自己手里有刻子杠别人的出牌或者碰别人的出牌再自己摸到相同的牌开杠，凑齐四张相同的牌   */
            if (this.ming_gang_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_4, fan: 1 });
            }
            /**5.花牌：每张花牌计一番，未胡牌则不计。 */
            if (this.hua_majiang.length > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_5, fan: this.hua_majiang.length });
            }
            /**6.连六：同花色六张序数相连的顺子。 */
            let res1 = [
                [1, 2, 3, 4, 5, 6],
                [2, 3, 4, 5, 6, 7],
                [3, 4, 5, 6, 7, 8],
                [4, 5, 6, 7, 8, 9],
            ]
            if (res1.some(c => utils.isContain(majiang_arr, c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_6, fan: 1 });
            }
            /**7.老少副：序数牌123和789的两副顺子。 */
            if (utils.isContain(majiang_arr, [1, 2, 3, 7, 8, 9])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_7, fan: 1 });
            }
            /**8.一般高：两副相同的顺子。 */
            let AI = new mj_Logic.HuPaiSuanFa();
            if (AI.handler_yibangao(this.hand_majiang, null)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_8, fan: 1 });
            }
        }
        {
            /**不计番：大三风、小三风、碰碰胡、四字刻。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_3);
            }
            /**不计番：双箭刻、箭刻。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_8);
            }
            /**不计番：清一色、门前清、自摸。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            /**不计番：七对、三元七对、四喜七对、全带幺、门前清、自摸、字一色。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_6)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_48_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_48_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_64_4);
            }
            /**不计番：七对、门前清、自摸、清一色。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_7)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_5);
            }
            /**不计番：三杠、双明杠、明杠。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_8)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_32_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_4);
            }
            /**不计番：大三风、小三风。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_1);
            }
            /**不计番：双箭刻、箭刻。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_8);
            }
            /**不计番：一般高、七对、老少副、平胡。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_7);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_7);
            }
            /**不计番：碰碰胡、全带幺、混幺九、四字刻。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_32_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_3);
            }
            /**不计番：三暗刻、双暗刻、碰碰胡、门前清、自摸 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_5)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            /**不计番：七对、门前清、自摸。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            /**不计番：七对、门前清、自摸 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            /**不计番：三节高、三同顺、碰碰胡、一般高。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            /**不计番：三节高、三同顺、七对、四归一、一般高。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_6);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            /**不计番：三步高、连六、老少副。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_32_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_6);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_7);
            }
            /**不计番：全带幺、碰碰胡。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_32_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
            }
            /**不计番：双明杠、明杠。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_32_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_4);
            }
            /**不计番：门前清、自摸。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            /**不计番：门前清、自摸。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            /**不计番：碰碰胡。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
            }
            /**不计番：三同顺、一般高。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            /**不计番：三节高、一般高。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_5)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            /**不计番：连六、老少副。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_16_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_6);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_7);
            }
            /**不计番：双暗刻。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_16_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_4);
            }
            /**不计番：自摸。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_16_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            /**不计番：自摸。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_8_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            /**不计番：胡绝张。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_8_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_4);
            }
            /**不计番：箭刻。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_6_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_8);
            }
            /**不计番：双暗刻、暗杠。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_6_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_3);
            }
            /**不计番：门前清、自摸。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_4_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            /**不计番：明杠。 */
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_4_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_4);
            }

        }
        return res_fan_arr;
    }
}
