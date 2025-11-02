"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const mjPlayer_1 = require("./mjPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const utils = require("../../../utils");
const mj_Logic = require("./mj_Logic");
const MessageService = require("../../../services/MessageService");
const mjConst_1 = require("./mjConst");
const ErMahjong_AI_1 = require("./robot/ErMahjong_AI");
const mjGameManger_1 = require("../lib/mjGameManger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const AUTO_TIME = 25000;
class mjRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.players = new Array(2).fill(null);
        this.status = 'INWAIT';
        this.RepertoryCard = [];
        this.curr_majiang = null;
        this.mo_random = 0;
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        this.record_history = { res_fan_arr: [], player_info: [], oper: [] };
        this.updateRoundId();
        this.battle_kickNoOnline();
        this.status = 'INWAIT';
        this.wait();
    }
    wait(playerInfo) {
        if (this.status == 'NONE' || this.status == 'INWAIT') {
            const list = this.players.filter(pl => pl && pl.status == "PS_READY");
            if (list.length >= 2) {
                this.handler_start();
            }
        }
    }
    async handler_start() {
        this.status = "INGAME";
        this.players.forEach(pl => pl.status = "PS_WAIT");
        this.RepertoryCard = mj_Logic.shuffle_cards();
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
            let opts = {
                zj_seat: this.ply_zj.seat,
                players: this.players.map(pl => pl.deal_strip()),
                mo_random: this.mo_random
            };
            opts.players.find(c => c.uid != ply.uid).hand_mjs.map(mj => mj = 0x99);
            member && MessageService.pushMessageByUids("MJ_deal", opts, member);
        }
        await utils.delay(2500);
        this.curr_doing_seat = this.ply_zj.seat;
        this.handle_buhua();
        return Promise.resolve();
    }
    async handle_buhua() {
        await utils.delay(500);
        let is_bu = false;
        for (const pl of this.players) {
            let hua_majiang = [];
            try {
                for (let idx = pl.hand_majiang.length; idx > -1; idx--) {
                    const mj = pl.hand_majiang[idx];
                    if ([0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48].includes(mj)) {
                        pl.hand_majiang.splice(idx, 1);
                        hua_majiang.push(mj);
                        pl.hua_majiang.push(mj);
                    }
                }
            }
            catch (error) {
                console.warn("MJ|000");
            }
            let len = hua_majiang.length;
            if (len > 0) {
                if (this.RepertoryCard.length <= len) {
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
                    };
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
        }
        else {
            this.note_players_doing();
        }
    }
    auto_play(playerInfo) {
        let mj = playerInfo.hand_majiang[playerInfo.hand_majiang.length - 1];
        if (playerInfo.ting_status || !playerInfo.trusteeship) {
            playerInfo.majiang_oper_c(mjConst_1.Player_Oper.PO_PLAY, mj, this);
        }
        else {
            if (playerInfo.oper_data.is_hu) {
                playerInfo.majiang_oper_c(mjConst_1.Player_Oper.PO_HU, mj, this);
                return;
            }
            const Er_AI = new ErMahjong_AI_1.default();
            const table_mjs = [];
            for (const ply of this.players) {
                ply.uid == playerInfo.uid && table_mjs.push(...ply.hand_majiang);
                table_mjs.push(...ply.chu_majiang);
                table_mjs.push(...ply.an_gang_majiang);
            }
            let res = Er_AI.PlayLogic(playerInfo.hand_majiang, table_mjs, []);
            playerInfo.majiang_oper_c(mjConst_1.Player_Oper.PO_PLAY, res.playId, this);
        }
    }
    auto_pass(playerInfo) {
        if (playerInfo.curr_oper == mjConst_1.Player_Oper.PO_NONE) {
            if (playerInfo.trusteeship) {
                if (mj_Logic.is_can_hu(playerInfo.hand_majiang, this.curr_majiang)) {
                    playerInfo.majiang_oper_c(mjConst_1.Player_Oper.PO_HU, playerInfo.hand_majiang, this);
                    return;
                }
            }
            playerInfo.majiang_oper_c(mjConst_1.Player_Oper.PO_PASS, null, this);
        }
    }
    handler_pass(currPlayer) {
        for (const sh_pl of this.players) {
            if (sh_pl.uid == currPlayer.uid) {
                continue;
            }
            if (!sh_pl.onLine) {
                sh_pl.curr_oper = mjConst_1.Player_Oper.PO_PASS;
                sh_pl.pre_oper = mjConst_1.Player_Oper.PO_PASS;
                continue;
            }
            sh_pl.oper_data.is_ting = false;
            sh_pl.oper_data.is_chi = false;
            sh_pl.oper_data.is_peng = false;
            sh_pl.oper_data.is_gang = false;
            sh_pl.oper_data.is_hu = false;
            if (currPlayer.curr_oper == mjConst_1.Player_Oper.PO_BA_GANG) {
                sh_pl.oper_data.is_hu = mj_Logic.is_can_hu(sh_pl.hand_majiang, currPlayer.gang_mj);
            }
            else if (currPlayer.curr_oper == mjConst_1.Player_Oper.PO_PLAY) {
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
                sh_pl.curr_oper = mjConst_1.Player_Oper.PO_PASS;
                sh_pl.pre_oper = mjConst_1.Player_Oper.PO_PASS;
                continue;
            }
            sh_pl.curr_oper = mjConst_1.Player_Oper.PO_NONE;
            sh_pl.pre_oper = mjConst_1.Player_Oper.PO_NONE;
            this.handler_play(sh_pl);
            this.note_player_oper_data(sh_pl, false);
        }
    }
    async handler_wait_oper() {
        await utils.delay(200);
        let oper_num = 0;
        let select_hu_num = 0;
        for (const ply of this.players) {
            if (ply.curr_oper != mjConst_1.Player_Oper.PO_NONE) {
                if (ply.curr_oper == mjConst_1.Player_Oper.PO_HU) {
                    select_hu_num++;
                }
                oper_num++;
            }
        }
        if (oper_num == 2) {
            let next = this.curr_doing_seat + 1;
            let next_doing = 0;
            do {
                next = next >= 2 ? 0 : next;
                if (oper_num == 0) {
                    next_doing = this.curr_doing_seat + 1;
                    next_doing = next_doing >= 2 ? 0 : next_doing;
                    this.curr_doing_seat = next_doing;
                    break;
                }
                let sh_wait_player = this.players[next];
                if (sh_wait_player.curr_oper == mjConst_1.Player_Oper.PO_HU) {
                    sh_wait_player.logic_hu(this, this.curr_majiang);
                    this.status = "END";
                    this.handler_complete();
                    return;
                }
                else if (sh_wait_player.curr_oper == mjConst_1.Player_Oper.PO_PENG) {
                    sh_wait_player.logic_peng(this, this.curr_majiang);
                    this.curr_doing_seat = sh_wait_player.seat;
                    this.note_players_doing();
                    return;
                }
                else if (sh_wait_player.curr_oper == mjConst_1.Player_Oper.PO_GANG) {
                    sh_wait_player.logic_gang(this, sh_wait_player.gang_mj);
                    this.curr_doing_seat = sh_wait_player.seat;
                    break;
                }
                else if (sh_wait_player.curr_oper == mjConst_1.Player_Oper.PO_BA_GANG) {
                    sh_wait_player.logic_gang(this, sh_wait_player.gang_mj);
                    this.curr_doing_seat = sh_wait_player.seat;
                    break;
                }
                else if (sh_wait_player.curr_oper == mjConst_1.Player_Oper.PO_CHI) {
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
            this.status = "END";
            this.handler_complete();
            return false;
        }
        else {
            let sh_mo_player = this.players.find(pl => pl.seat == this.curr_doing_seat);
            let mj = this.RepertoryCard.shift();
            sh_mo_player.hand_majiang.push(mj);
            sh_mo_player.curr_oper = mjConst_1.Player_Oper.PO_NONE;
            sh_mo_player.pre_oper = mjConst_1.Player_Oper.PO_NONE;
            sh_mo_player.status = "PS_OPER";
            for (const pl of this.players) {
                const member = pl && this.channel.getMember(pl.uid);
                let opts = {
                    uid: pl.uid,
                    seat: pl.seat,
                    mj: mj,
                };
                if (pl.uid != sh_mo_player.uid) {
                    delete opts.mj;
                }
                member && MessageService.pushMessageByUids('msg_majiang_mo_majiang_s', opts, member);
            }
        }
        return true;
    }
    note_players_doing() {
        this.lastFahuaTime = Date.now();
        this.curr_majiang = null;
        let playerInfo = this.players.find(pl => pl.seat == this.curr_doing_seat);
        playerInfo.status = "PS_OPER";
        playerInfo.curr_oper = mjConst_1.Player_Oper.PO_NONE;
        let opts = {
            uid: playerInfo.uid,
            seat: playerInfo.seat
        };
        opts["hand_mjs"] = playerInfo.hand_majiang;
        this.channelIsPlayer("msg_majiang_note_doing_s", opts);
        this.note_player_oper_data(playerInfo, true);
        this.handler_play(playerInfo);
    }
    note_player_oper_data(currPlayer, auto) {
        const fn = (pl) => {
            const member = pl && this.channel.getMember(pl.uid);
            let opts = {
                is_chi: pl.oper_data.is_chi,
                is_peng: pl.oper_data.is_peng,
                is_gang: pl.oper_data.is_gang,
                is_hu: pl.oper_data.is_hu,
                is_ting: pl.oper_data.is_ting
            };
            member && MessageService.pushMessageByUids("MJ_oper_data", opts, member);
        };
        if (this.record_history.oper.length == 0) {
            for (const pl of this.players) {
                if (pl && pl.uid == this.ply_zj.uid) {
                    pl.oper_data.is_ting = mj_Logic.is_can_ting(pl.hand_majiang);
                    pl.oper_data.is_hu = mj_Logic.is_can_hu(pl.hand_majiang, null);
                    pl.oper_data.is_gang = mj_Logic.find_gang(pl.hand_majiang) == null ? false : true;
                    fn(pl);
                }
                else {
                    pl.oper_data.is_ting = mj_Logic.is_jiao(pl.hand_majiang).length > 0 ? true : false;
                    fn(pl);
                }
            }
            return;
        }
        if (currPlayer.pre_oper != mjConst_1.Player_Oper.PO_NONE) {
            currPlayer.oper_data.is_peng = false;
            currPlayer.oper_data.is_chi = false;
            currPlayer.oper_data.is_ting = false;
            currPlayer.oper_data.is_hu = false;
            currPlayer.oper_data.is_gang = false;
            currPlayer.oper_data.is_ting = !currPlayer.ting_status && mj_Logic.is_can_ting(currPlayer.hand_majiang);
        }
        if (auto && currPlayer.pre_oper == mjConst_1.Player_Oper.PO_NONE) {
            currPlayer.oper_data.is_peng = false;
            currPlayer.oper_data.is_chi = false;
            currPlayer.oper_data.is_ting = false;
            currPlayer.oper_data.is_ting = !currPlayer.ting_status && mj_Logic.is_can_ting(currPlayer.hand_majiang);
            currPlayer.oper_data.is_hu = mj_Logic.is_can_hu(currPlayer.hand_majiang, null);
            if (currPlayer.ting_status) {
                currPlayer.oper_data.is_gang = this.RepertoryCard.length > 0 && mj_Logic.find_ba_gang(currPlayer.tai_majiang, currPlayer.hand_majiang);
            }
            else {
                currPlayer.oper_data.is_gang = this.RepertoryCard.length > 0 && mj_Logic.find_gang(currPlayer.hand_majiang) == null ? false : true;
                if (!currPlayer.oper_data.is_gang) {
                    currPlayer.oper_data.is_gang = this.RepertoryCard.length > 0 && mj_Logic.find_ba_gang(currPlayer.tai_majiang, currPlayer.hand_majiang);
                }
            }
            fn(currPlayer);
        }
        else {
            fn(currPlayer);
        }
    }
    note_players_oper(opts) {
        this.channelIsPlayer("msg_majiang_oper_c", opts);
    }
    handler_play(playerInfo) {
        let auto_time = AUTO_TIME;
        if (playerInfo.ting_status || playerInfo.trusteeship) {
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
        let res_fan_arr = [];
        if (ishu_true_ply) {
            ishu_true_ply.change_socre = 0;
            res_fan_arr = ishu_true_ply.possible_max_fan(this);
            for (const res_fan of res_fan_arr) {
                ishu_true_ply.change_socre += res_fan.fan;
            }
            ishu_true_ply.change_socre = ishu_true_ply.change_socre * Math.pow(2, ishu_true_ply.pass_hu_num);
            let ishu_false_ply = this.players.find(pl => pl.ishu == false);
            ishu_false_ply.change_socre = -ishu_true_ply.change_socre;
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
        let smsg = { Info: [], zhuang_id: this.ply_zj.uid, res_fan_arr };
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
        this.channelIsPlayer("msg_majiang_result_s", smsg);
        this.Initialization();
    }
    getWaitTime() {
        if (this.status == 'INGAME') {
            return Math.max(AUTO_TIME - (Date.now() - this.lastFahuaTime), 0);
        }
        return 0;
    }
    addPlayerInRoom(dbplayer) {
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(dbplayer);
            return true;
        }
        if (this.isFull())
            return false;
        const idxs = [];
        this.players.forEach((m, i) => !m && idxs.push(i));
        const i = idxs[0];
        this.players[i] = new mjPlayer_1.default(i, dbplayer);
        this.addMessage(dbplayer);
        return true;
    }
    leave(playerInfo, isOffLine) {
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        let opts = {
            oper_type: mjConst_1.Player_Oper.PO_EXIT,
            uid: playerInfo.uid,
        };
        this.note_players_oper(opts);
        this.players[playerInfo.seat] = null;
        this.kickOutMessage(playerInfo.uid);
        mjGameManger_1.default.removePlayerSeat(playerInfo.uid);
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                mjGameManger_1.default.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            mjGameManger_1.default.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
}
exports.default = mjRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWpSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvTUovbGliL21qUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFvRDtBQUNwRCwrQ0FBeUM7QUFDekMseUNBQWtDO0FBQ2xDLHVFQUFvRTtBQUVwRSx3Q0FBeUM7QUFDekMsdUNBQXdDO0FBRXhDLG1FQUFvRTtBQUNwRSx1Q0FHbUI7QUFHbkIsdURBQWdEO0FBQ2hELHNEQUFnRTtBQUNoRSxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBSW5ELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQztBQUt4QixNQUFxQixNQUFPLFNBQVEsdUJBQW9CO0lBaUJwRCxZQUFZLElBQUk7UUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUFqQmYsWUFBTyxHQUFlLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU5QyxXQUFNLEdBQXlDLFFBQVEsQ0FBQztRQUV4RCxrQkFBYSxHQUFhLEVBQUUsQ0FBQztRQVE3QixpQkFBWSxHQUFXLElBQUksQ0FBQztRQUc1QixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBR1YsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMxQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUNELEtBQUs7UUFDRCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQsY0FBYztRQUNWLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxF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