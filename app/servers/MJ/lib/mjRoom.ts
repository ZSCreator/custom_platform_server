import { Application, Channel, pinus } from 'pinus';
import { getLogger } from "pinus-logger";
import mjPlayer from './mjPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import offLineService = require('../../../services/hall/offLineService');
import utils = require('../../../utils');
import mj_Logic = require("./mj_Logic");
// import kickingPlayerService = require('../../../services/scenceGame/kickingPlayerService');
import MessageService = require('../../../services/MessageService');
import {
    Player_Oper, Imsg_majiang_record, Imsg_majiang_result_s, Imsg_majiang_mo_majiang_s, Imsg_majiang_oper_c,
    Imsg_majiang_note_doing_s
} from "./mjConst";
import mjConst = require("./mjConst");
import * as langsrv from "../../../services/common/langsrv";
import ErMahjong_AI from "./robot/ErMahjong_AI";
import roomManager, { mjRoomManger } from '../lib/mjGameManger';
const Logger = getLogger('server_out', __filename);


/**发话时间 */
const AUTO_TIME = 25000;
/**
 * SparrowHZ
 * 游戏房间
 */
export default class mjRoom extends SystemRoom<mjPlayer> {
    players: mjPlayer[] = new Array(2).fill(null);// 玩家列表;
    /**状态 INWAIT.等待 INGAME.游戏中 END.回合结束 */
    status: 'NONE' | 'INWAIT' | 'INGAME' | 'END' = 'INWAIT';
    lowBet: number;
    RepertoryCard: number[] = [];
    ply_zj: mjPlayer;

    /**记录发话时候的时间 */
    lastFahuaTime: number;
    /**当前说话的座位索引 */
    curr_doing_seat: number;
    /**当前出的牌 */
    curr_majiang: number = null;
    record_history: Imsg_majiang_record;
    /**摸牌随机数 */
    mo_random = 0;
    constructor(opts) {
        super(opts)
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    /**初始化 */
    Initialization() {
        this.record_history = { res_fan_arr: [], player_info: [], oper: [] };
        this.updateRoundId();
        this.battle_kickNoOnline();
        this.status = 'INWAIT';
        this.wait();
    }


    wait(playerInfo?: mjPlayer) {
        if (this.status == 'NONE' || this.status == 'INWAIT') {
            const list = this.players.filter(pl => pl && pl.status == "PS_READY");
            if (list.length >= 2) {
                // setTimeout(() => {
                this.handler_start();
                // }, 5000);
            }
        }
    }

    async handler_start() {
        this.status = "INGAME";
        this.players.forEach(pl => pl.status = "PS_WAIT");
        this.RepertoryCard = mj_Logic.shuffle_cards();
        // this.ply_zj = this.players[utils.random(0, 1)];
        this.ply_zj = this.players[0];
        this.mo_random = utils.random(0, 35);
        for (const ply of this.players) {
            let num = 13 - ply.hand_majiang.length;
            if (num < 13) {
                for (const mj of ply.hand_majiang) {
                    this.RepertoryCard = mj_Logic.arr_erase_one(this.RepertoryCard, mj, 1);
                }
            }
            ply.hand_majiang.push(...this.RepertoryCard.splice(0, num));
            if (ply.uid == this.ply_zj.uid) {
                ply.hand_majiang.push(...this.RepertoryCard.splice(0, 1));
            }
        }

        this.record_history.zhuang_uid = this.ply_zj.uid;

        for (const ply of this.players) {
            const member = ply && this.channel.getMember(ply.uid);
            let opts: mjConst.IMJ_deal = {
                zj_seat: this.ply_zj.seat,
                players: this.players.map(pl => pl.deal_strip()),
                mo_random: this.mo_random
            }
            opts.players.find(c => c.uid != ply.uid).hand_mjs.map(mj => mj = 0x99);
            member && MessageService.pushMessageByUids("MJ_deal", opts, member);
        }
        await utils.delay(2500);
        this.curr_doing_seat = this.ply_zj.seat;
        this.handle_buhua();
        return Promise.resolve();
    }

    /**抹花 */
    async handle_buhua() {
        await utils.delay(500);
        let is_bu = false;
        for (const pl of this.players) {
            let hua_majiang: number[] = [];
            try {
                for (let idx = pl.hand_majiang.length; idx > -1; idx--) {
                    const mj = pl.hand_majiang[idx];
                    if ([0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48].includes(mj)) {
                        pl.hand_majiang.splice(idx, 1);
                        hua_majiang.push(mj);
                        pl.hua_majiang.push(mj);
                    }
                }
            } catch (error) {
                console.warn("MJ|000");
            }

            let len = hua_majiang.length;
            if (len > 0) {
                if (this.RepertoryCard.length <= len) {
                    //没有牌摸比赛结束
                    this.status = "END";
                    this.handler_complete();
                    return false;
                }
                is_bu = true;
                let buhua_arr = this.RepertoryCard.splice(0, len);
                pl.hand_majiang.push(...buhua_arr);

                for (const ply of this.players) {
                    let opts = {
                        uid: pl.uid,
                        seat: pl.seat,
                        hua_majiang: hua_majiang,
                        buhua_arr: buhua_arr
                    }
                    const member = ply && this.channel.getMember(ply.uid);
                    if (opts.uid != ply.uid) {
                        opts.buhua_arr.map(mj => mj = 0x99);
                    }
                    member && MessageService.pushMessageByUids("MJ_deal_bu", opts, member);
                }
            }
        }
        if (is_bu) {
            this.handle_buhua();
        } else {
            this.note_players_doing();
        }
    }

    auto_play(playerInfo: mjPlayer) {
        let mj = playerInfo.hand_majiang[playerInfo.hand_majiang.length - 1];
        if (playerInfo.ting_status || !playerInfo.trusteeship) {
            playerInfo.majiang_oper_c(Player_Oper.PO_PLAY, mj, this);
        } else {
            if (playerInfo.oper_data.is_hu) {
                playerInfo.majiang_oper_c(Player_Oper.PO_HU, mj, this);
                return;
            }
            const Er_AI = new ErMahjong_AI();
            const table_mjs: number[] = [];
            for (const ply of this.players) {
                ply.uid == playerInfo.uid && table_mjs.push(...ply.hand_majiang);
                table_mjs.push(...ply.chu_majiang);
                table_mjs.push(...ply.an_gang_majiang);
            }
            let res = Er_AI.PlayLogic(playerInfo.hand_majiang, table_mjs, []);
            playerInfo.majiang_oper_c(Player_Oper.PO_PLAY, res.playId, this);
        }
    }

    auto_pass(playerInfo: mjPlayer) {
        if (playerInfo.curr_oper == Player_Oper.PO_NONE) {
            if (playerInfo.trusteeship) {
                if (mj_Logic.is_can_hu(playerInfo.hand_majiang, this.curr_majiang)) {
                    playerInfo.majiang_oper_c(Player_Oper.PO_HU, playerInfo.hand_majiang, this);
                    return;
                }
            }
            playerInfo.majiang_oper_c(Player_Oper.PO_PASS, null, this);
        }
    }

    /**重置其他玩家状态和定时器 */
    handler_pass(currPlayer: mjPlayer) {
        for (const sh_pl of this.players) {
            if (sh_pl.uid == currPlayer.uid) {
                continue;
            }
            if (!sh_pl.onLine) {
                sh_pl.curr_oper = Player_Oper.PO_PASS;
                sh_pl.pre_oper = Player_Oper.PO_PASS;
                continue;
            }
            sh_pl.oper_data.is_ting = false;
            sh_pl.oper_data.is_chi = false;
            sh_pl.oper_data.is_peng = false;
            sh_pl.oper_data.is_gang = false;
            sh_pl.oper_data.is_hu = false;
            if (currPlayer.curr_oper == Player_Oper.PO_BA_GANG) {
                sh_pl.oper_data.is_hu = mj_Logic.is_can_hu(sh_pl.hand_majiang, currPlayer.gang_mj);
            }
            else if (currPlayer.curr_oper == Player_Oper.PO_PLAY) {
                sh_pl.oper_data.is_chi = mj_Logic.is_can_chi(sh_pl.hand_majiang, this.curr_majiang);
                sh_pl.oper_data.is_peng = mj_Logic.is_can_peng(sh_pl.hand_majiang, this.curr_majiang);
                sh_pl.oper_data.is_gang = this.RepertoryCard.length > 0 && mj_Logic.is_can_gang(sh_pl.hand_majiang, this.curr_majiang);
                sh_pl.oper_data.is_hu = mj_Logic.is_can_hu(sh_pl.hand_majiang, this.curr_majiang);
                if (sh_pl.ting_status) {
                    sh_pl.oper_data.is_chi = false;
                    sh_pl.oper_data.is_peng = false;
                    sh_pl.oper_data.is_gang = false;
                }
            }

            if (!sh_pl.oper_data.is_chi && !sh_pl.oper_data.is_peng && !sh_pl.oper_data.is_gang && !sh_pl.oper_data.is_hu) {
                sh_pl.curr_oper = Player_Oper.PO_PASS;
                sh_pl.pre_oper = Player_Oper.PO_PASS;
                continue;
            }
            sh_pl.curr_oper = Player_Oper.PO_NONE;
            sh_pl.pre_oper = Player_Oper.PO_NONE;
            this.handler_play(sh_pl);
            this.note_player_oper_data(sh_pl, false);
        }
    }

    /**等待其他玩家相应操作 */
    async handler_wait_oper() {
        await utils.delay(200);
        let oper_num = 0;
        let select_hu_num = 0;
        for (const ply of this.players) {
            if (ply.curr_oper != Player_Oper.PO_NONE) {
                if (ply.curr_oper == Player_Oper.PO_HU) {
                    select_hu_num++;
                }
                oper_num++;
            }
        }
        if (oper_num == 2) {
            let next = this.curr_doing_seat + 1;
            let next_doing = 0;   //下一个说话的座位号
            do {
                next = next >= 2 ? 0 : next;
                // if (next == this.curr_doing_seat) {
                if (oper_num == 0) {
                    next_doing = this.curr_doing_seat + 1;
                    next_doing = next_doing >= 2 ? 0 : next_doing;
                    this.curr_doing_seat = next_doing;
                    break;
                }
                let sh_wait_player = this.players[next];
                if (sh_wait_player.curr_oper == Player_Oper.PO_HU) {
                    sh_wait_player.logic_hu(this, this.curr_majiang);
                    this.status = "END";
                    this.handler_complete();
                    return;
                } else if (sh_wait_player.curr_oper == Player_Oper.PO_PENG) {
                    sh_wait_player.logic_peng(this, this.curr_majiang);
                    this.curr_doing_seat = sh_wait_player.seat;
                    this.note_players_doing();
                    return;
                } else if (sh_wait_player.curr_oper == Player_Oper.PO_GANG) {
                    sh_wait_player.logic_gang(this, sh_wait_player.gang_mj);
                    this.curr_doing_seat = sh_wait_player.seat;
                    break;
                } else if (sh_wait_player.curr_oper == Player_Oper.PO_BA_GANG) {
                    sh_wait_player.logic_gang(this, sh_wait_player.gang_mj);
                    this.curr_doing_seat = sh_wait_player.seat;
                    break;
                } else if (sh_wait_player.curr_oper == Player_Oper.PO_CHI) {
                    sh_wait_player.logic_chi(this, this.curr_majiang);
                    this.curr_doing_seat = sh_wait_player.seat;
                    this.note_players_doing();
                    return;
                }
                next++;
                oper_num--;
            } while (true);
            if (this.handler_mo())
                this.handle_buhua();
        }
    }

    handler_mo() {
        if (this.RepertoryCard.length == 0) {
            //没有牌摸比赛结束
            this.status = "END";
            this.handler_complete();
            return false;
        } else {
            let sh_mo_player = this.players.find(pl => pl.seat == this.curr_doing_seat);
            let mj = this.RepertoryCard.shift();
            sh_mo_player.hand_majiang.push(mj);
            sh_mo_player.curr_oper = Player_Oper.PO_NONE;
            sh_mo_player.pre_oper = Player_Oper.PO_NONE;
            sh_mo_player.status = "PS_OPER";
            // sh_mo_player.mo_num++;
            for (const pl of this.players) {
                const member = pl && this.channel.getMember(pl.uid);
                let opts: Imsg_majiang_mo_majiang_s = {
                    uid: pl.uid,
                    seat: pl.seat,
                    mj: mj,
                }
                if (pl.uid != sh_mo_player.uid) {
                    delete opts.mj;
                }
                member && MessageService.pushMessageByUids('msg_majiang_mo_majiang_s', opts, member);
            }
        }
        return true;
    }

    /**通知所有玩家 正在说话的玩家 且重置定时器*/
    note_players_doing() {
        this.lastFahuaTime = Date.now();
        this.curr_majiang = null;
        let playerInfo = this.players.find(pl => pl.seat == this.curr_doing_seat);
        playerInfo.status = "PS_OPER";
        playerInfo.curr_oper = Player_Oper.PO_NONE;
        let opts: Imsg_majiang_note_doing_s = {
            uid: playerInfo.uid,
            seat: playerInfo.seat
        }
        opts["hand_mjs"] = playerInfo.hand_majiang;
        this.channelIsPlayer("msg_majiang_note_doing_s", opts);
        this.note_player_oper_data(playerInfo, true);
        this.handler_play(playerInfo);
    }

    /**通知玩家是否拥有 对应的操作
     * auto true 计算 是否可以 胡 杠
     */
    note_player_oper_data(currPlayer: mjPlayer, auto: boolean) {
        const fn = (pl: mjPlayer) => {
            const member = pl && this.channel.getMember(pl.uid);
            let opts = {
                is_chi: pl.oper_data.is_chi,
                is_peng: pl.oper_data.is_peng,
                is_gang: pl.oper_data.is_gang,
                is_hu: pl.oper_data.is_hu,
                is_ting: pl.oper_data.is_ting
            }
            member && MessageService.pushMessageByUids("MJ_oper_data", opts, member);
        }
        if (this.record_history.oper.length == 0) {
            for (const pl of this.players) {
                if (pl && pl.uid == this.ply_zj.uid) {
                    pl.oper_data.is_ting = mj_Logic.is_can_ting(pl.hand_majiang);
                    pl.oper_data.is_hu = mj_Logic.is_can_hu(pl.hand_majiang, null);
                    pl.oper_data.is_gang = mj_Logic.find_gang(pl.hand_majiang) == null ? false : true;
                    fn(pl);
                } else {
                    pl.oper_data.is_ting = mj_Logic.is_jiao(pl.hand_majiang).length > 0 ? true : false;
                    fn(pl);
                }
            }
            return;
        }
        /**吃碰之后 只能出牌 */
        if (currPlayer.pre_oper != Player_Oper.PO_NONE) {
            currPlayer.oper_data.is_peng = false;
            currPlayer.oper_data.is_chi = false;
            currPlayer.oper_data.is_ting = false;
            currPlayer.oper_data.is_hu = false;
            currPlayer.oper_data.is_gang = false;
            currPlayer.oper_data.is_ting = !currPlayer.ting_status && mj_Logic.is_can_ting(currPlayer.hand_majiang);
        }
        if (auto && currPlayer.pre_oper == Player_Oper.PO_NONE) {
            currPlayer.oper_data.is_peng = false;
            currPlayer.oper_data.is_chi = false;
            currPlayer.oper_data.is_ting = false;
            currPlayer.oper_data.is_ting = !currPlayer.ting_status && mj_Logic.is_can_ting(currPlayer.hand_majiang);
            currPlayer.oper_data.is_hu = mj_Logic.is_can_hu(currPlayer.hand_majiang, null);

            if (currPlayer.ting_status) {//only 巴杠
                currPlayer.oper_data.is_gang = this.RepertoryCard.length > 0 && mj_Logic.find_ba_gang(currPlayer.tai_majiang, currPlayer.hand_majiang);
            } else {
                currPlayer.oper_data.is_gang = this.RepertoryCard.length > 0 && mj_Logic.find_gang(currPlayer.hand_majiang) == null ? false : true;//暗杠
                if (!currPlayer.oper_data.is_gang) {//巴杠
                    currPlayer.oper_data.is_gang = this.RepertoryCard.length > 0 && mj_Logic.find_ba_gang(currPlayer.tai_majiang, currPlayer.hand_majiang);
                }
            }
            fn(currPlayer);
        } else {
            fn(currPlayer);
        }
    }

    /**通知玩家操作[发送给所有玩家,包含自己] */
    note_players_oper(opts: any) {
        this.channelIsPlayer("msg_majiang_oper_c", opts);
    }

    /**操作 超时 则 自动托管 */
    handler_play(playerInfo: mjPlayer) {
        let auto_time = AUTO_TIME;
        if (playerInfo.ting_status || playerInfo.trusteeship) {//自己操作
            if (!playerInfo.oper_data.is_gang && !playerInfo.oper_data.is_hu &&
                !playerInfo.oper_data.is_peng && !playerInfo.oper_data.is_chi) {
                auto_time = 1000;
            }
        }
        clearTimeout(playerInfo.Oper_timeout);
        playerInfo.Oper_timeout = setTimeout(() => {
            switch (this.status) {
                case "INGAME":
                    if (this.curr_majiang == null)
                        this.auto_play(playerInfo);
                    else
                        this.auto_pass(playerInfo);
                    break;
                default:
                    break;
            }
        }, auto_time);
        this.channelIsPlayer("msg_majiang_time_out_s", { auto_time: AUTO_TIME });
        return auto_time;
    }

    async handler_complete() {
        let ishu_true_ply = this.players.find(pl => pl.ishu == true);
        let res_fan_arr: { type: mj_Logic.Mj_Hu_Type, fan: number }[] = [];
        if (ishu_true_ply) {
            ishu_true_ply.change_socre = 0;
            res_fan_arr = ishu_true_ply.possible_max_fan(this);
            for (const res_fan of res_fan_arr) {
                ishu_true_ply.change_socre += res_fan.fan;
            }
            ishu_true_ply.change_socre = ishu_true_ply.change_socre * Math.pow(2, ishu_true_ply.pass_hu_num);
            let ishu_false_ply = this.players.find(pl => pl.ishu == false);
            ishu_false_ply.change_socre = - ishu_true_ply.change_socre;
        }
        this.record_history.res_fan_arr = res_fan_arr;
        for (const ply of this.players) {
            ply.profit = ply.change_socre * this.lowBet;
            this.record_history.player_info.push({
                uid: ply.uid, nickname: ply.nickname,
                seat: ply.seat, change_socre: ply.change_socre,
                mjs: ply.hand_majiang,
            });
        }
        for (const ply of this.players) {
            await ply.settlement(this);
        }
        let smsg: Imsg_majiang_result_s = { Info: [], zhuang_id: this.ply_zj.uid, res_fan_arr };
        for (const ply of this.players) {
            smsg.Info.push({
                uid: ply.uid,
                change_socre: ply.change_socre,
                seat: ply.seat,
                hand_mjs: ply.hand_majiang,
                gang_majiang: ply.gang_majiang,
                an_gang_majiang: ply.an_gang_majiang,
                tai_mjs: ply.tai_majiang,
                is_hu: ply.ishu,
                gold: ply.gold,
                profit: ply.profit,
                hu_majiang: ply.hu_majiang,
                chi_majiang: ply.chi_majiang,
                pass_hu_num: ply.pass_hu_num
            });
        }
        // console.warn(this.roundId, this.roomId, this.players.map(c => c.uid).toString(), "MJ");
        this.channelIsPlayer("msg_majiang_result_s", smsg);
        this.Initialization();
    }

    getWaitTime() {
        if (this.status == 'INGAME') {
            return Math.max(AUTO_TIME - (Date.now() - this.lastFahuaTime), 0);
        }
        return 0;
    }

    /**添加玩家 */
    addPlayerInRoom(dbplayer) {
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(dbplayer);
            return true;
        }
        if (this.isFull()) return false;
        const idxs: number[] = [];
        this.players.forEach((m, i) => !m && idxs.push(i));//空位置压入数组
        // 数组中随机一个位置
        // const i = idxs[utils.random(0, idxs.length - 1)];
        const i = idxs[0];
        this.players[i] = new mjPlayer(i, dbplayer);
        // 添加到消息通道
        this.addMessage(dbplayer);
        return true;
    }
    /**
     * leave
     * @param isOffLine true离开房间
     */
    // 有玩家离开
    leave(playerInfo: mjPlayer, isOffLine: boolean) {
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        let opts: Imsg_majiang_oper_c = {
            oper_type: Player_Oper.PO_EXIT,
            uid: playerInfo.uid,
            // roomId?: ,
            // hand_mj?: number
        }
        this.note_players_oper(opts);
        this.players[playerInfo.seat] = null;
        this.kickOutMessage(playerInfo.uid);
        roomManager.removePlayerSeat(playerInfo.uid);
    }

    /**踢掉离线玩家 */
    battle_kickNoOnline() {
        const offLinePlayers: mjPlayer[] = [];
        for (const pl of this.players) {
            if (!pl) continue;
            // 不在线移除玩家 在线则不移除 因为还在这个场中
            if (!pl.onLine) roomManager.removePlayer(pl);
            // this.leave(pl, false);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            roomManager.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;

        }
        //更新数据（前端需要切换场景）
        this.kickingPlayer(pinus.app.getServerId(), offLinePlayers);
    }
}