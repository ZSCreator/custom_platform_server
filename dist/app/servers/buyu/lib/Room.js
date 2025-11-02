"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Player_1 = require("./Player");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const utils = require("../../../utils/index");
const buyuConst = require("./buyuConst");
const langsrv = require("../../../services/common/langsrv");
const ControlImpl_1 = require("./ControlImpl");
const pinus_1 = require("pinus");
const BuYuRoomManagerImpl_1 = require("../lib/BuYuRoomManagerImpl");
class Room extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.players = new Array(4).fill(null);
        this.active_fish_trace = [];
        this.fish_id_ = 0;
        this.boss_time = 0;
        this.yuzhen_run = false;
        this.status = 'INWAIT';
        this.bg = 0;
        this.Interval1 = null;
        this.Interval2 = null;
        this.Interval3 = null;
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.controlLogic = new ControlImpl_1.default({ room: this });
        this.base_rate = opts.base_rate || 0;
        this.entryCond = opts.entryCond;
        this.bullet_value = opts.bullet_value;
    }
    close() {
        clearInterval(this.Interval1);
        clearInterval(this.Interval2);
        clearInterval(this.Interval3);
        this.sendRoomCloseMessage();
        this.players = [];
    }
    StartGame() {
        this.Interval1 = setInterval(() => {
            if (this.yuzhen_run == false)
                this.create_yu();
        }, 1000);
        this.Interval2 = setInterval(() => {
            this.dell_fish_Bullet();
            this.br_kickNoOnline();
        }, 1 * 1000);
        this.Interval3 = setInterval(() => {
            if (this.players.length > 0) {
                this.yuzhen_run = true;
                let times = [34, 34, 35, 36, 36, 25];
                let ran = utils.random(0, 4);
                let ran1 = utils.random(0, 3);
                let fish_trace_info = [];
                for (const fishZhen of buyuConst.fishZhen_arr[ran]) {
                    let fish_count = fishZhen.fish_count;
                    do {
                        let fish_info = this.ActiveFishTrace(fishZhen.fish_kind);
                        if (fish_info) {
                            fish_info.fish_group = 0;
                            this.active_fish_trace.push(fish_info);
                            fish_trace_info.push({ fish_id: fish_info.fish_id, fish_kind: fish_info.kind });
                        }
                        fish_count--;
                    } while (fish_count > 0);
                }
                const opts = {
                    fish_zhen_type: ran,
                    bg: ran1,
                    fish_trace_info
                };
                this.bg = ran1;
                this.channelIsPlayer('buyu_yuzhen', opts);
                setTimeout(() => { this.yuzhen_run = false; }, (times[ran] + 3) * 1000);
            }
        }, 5 * 60 * 1000);
    }
    create_yu() {
        let fish_arr = [];
        for (const weight of buyuConst.weights) {
            let len = this.active_fish_trace.filter(m => m.fish_group == weight.group).length;
            if (len < weight.min) {
                fish_arr.push({ group: weight.group, weight: weight.weight });
            }
            else if (len > weight.min && len < weight.max) {
                if (Math.random() > 0.5) {
                    fish_arr.push({ group: weight.group, weight: weight.weight });
                }
            }
        }
        if (fish_arr.length > 0) {
            let group = this.sortProbability_(fish_arr);
            let fish_group = buyuConst.fish_group.find(m => m.group == group);
            let fish_kind = this.sortProbability(fish_group.weights);
            if ((group == 1 || group == 2) && Math.random() < 0.30) {
                this.BuildFishTrace(4, group, fish_kind);
            }
            else if (fish_kind == 23) {
                this.BuildFishTrace(4, group, fish_kind);
            }
            else {
                this.BuildFishTrace(1, group, fish_kind);
            }
        }
    }
    addPlayerInRoom(dbPlayer) {
        let currPlayer = this.getPlayer(dbPlayer.uid);
        this.controlLogic.controlPlanTimer();
        if (currPlayer) {
            currPlayer.onLine = true;
            this.addMessage(dbPlayer);
            return true;
        }
        if (this.isFull())
            return false;
        const i = this.players.findIndex(m => !m);
        this.players[i] = new Player_1.default(i, dbPlayer, this);
        this.addMessage(dbPlayer);
        this.channelIsPlayer('buyu_onEntry', {
            pl: this.players[i].strip(),
        });
        return true;
    }
    async removePlayer(playerInfo, isOffLine) {
        do {
            const user_fire = playerInfo.BulletInfoList.shift();
            if (!user_fire) {
                break;
            }
            this.channelIsPlayer("on_S_Bullet_dell", { pl: playerInfo.strip(), BulletInfo: user_fire });
        } while (true);
        await playerInfo.settlement(this);
        BuYuRoomManagerImpl_1.default.removePlayerSeat(playerInfo.uid);
        const idx = this.players.findIndex(m => m && m.uid == playerInfo.uid);
        if (idx !== -1) {
            this.players[idx] = null;
            this.channelIsPlayer('buyu_onExit', {
                uid: playerInfo.uid,
                seat: playerInfo.seat,
                gold: playerInfo.gold
            });
            this.kickOutMessage(playerInfo.uid);
            this.cancelGetControlPlanTimer();
            return true;
        }
        return false;
    }
    GetFishTraceInfo(fish_id, fish_kind) {
        if (this.yuzhen_run == true && fish_kind) {
            let temp = buyuConst.Fish_list.find(m => m.kind == fish_kind);
            if (temp) {
                let fish_info = this.ActiveFishTrace(fish_kind);
                return fish_info;
            }
            return null;
        }
        return this.active_fish_trace.find(m => m.fish_id == fish_id);
        ;
    }
    ActiveFishTrace(fish_kind) {
        const temp = buyuConst.Fish_list.find(m => m.kind == fish_kind);
        if (temp) {
            let fish_info = { kind: fish_kind, name: temp.name, type: temp.type, multiple: temp.multiple, aliveTime: temp.aliveTime };
            this.fish_id_++;
            if (this.fish_id_ > 10000) {
                this.fish_id_ = 0;
            }
            fish_info.fish_id = this.fish_id_;
            fish_info.create_time = new Date().getTime();
            fish_info.aliveTime = 35 * 1000;
            fish_info.path = utils.random(0, 200);
            fish_info.places = [];
            let places = [];
            switch (fish_kind) {
                case 20:
                case 23:
                    let ran = utils.random(5, 10);
                    fish_info.places.push(ran);
                    fish_info.multiple = buyuConst.Fish_list.find(m => m.kind == ran).multiple;
                    break;
                case 25:
                    for (;;) {
                        let ran = utils.random(1, 10);
                        if (!places.includes(ran))
                            places.push(ran);
                        if (places.length == 2)
                            break;
                    }
                    fish_info.places = places;
                    fish_info.multiple = buyuConst.Fish_list.find(m => m.kind == places[0]).multiple;
                    fish_info.multiple += buyuConst.Fish_list.find(m => m.kind == places[1]).multiple;
                    break;
                case 26:
                    {
                        for (;;) {
                            let ran = utils.random(1, 10);
                            if (!places.includes(ran))
                                places.push(ran);
                            if (places.length == 3)
                                break;
                        }
                        fish_info.places = places;
                        fish_info.multiple = buyuConst.Fish_list.find(m => m.kind == places[0]).multiple;
                        fish_info.multiple += buyuConst.Fish_list.find(m => m.kind == places[1]).multiple;
                        fish_info.multiple += buyuConst.Fish_list.find(m => m.kind == places[2]).multiple;
                    }
                    break;
                case 33:
                    fish_info.places.push(...[19, 15, 9, 9]);
                    fish_info.multiple = buyuConst.Fish_list.find(m => m.kind == 19).multiple;
                    fish_info.multiple += buyuConst.Fish_list.find(m => m.kind == 15).multiple;
                    fish_info.multiple += buyuConst.Fish_list.find(m => m.kind == 9).multiple;
                    fish_info.multiple += buyuConst.Fish_list.find(m => m.kind == 9).multiple;
                    break;
                default:
                    break;
            }
            return fish_info;
        }
        return null;
    }
    BuildFishTrace(fish_count, group, fish_kind) {
        let fish_trace_info = [];
        try {
            do {
                let fish_info = this.ActiveFishTrace(fish_kind);
                if (fish_info) {
                    fish_info.fish_group = group;
                    this.active_fish_trace.push(fish_info);
                    fish_trace_info.push(fish_info);
                }
                fish_count--;
            } while (fish_count > 0);
            this.channelIsPlayer("on_S_FISH_TRACE", { fish_trace_info: fish_trace_info });
        }
        catch (error) {
            console.warn(`BuildFishTrace:${error}`);
        }
    }
    dell_fish_Bullet() {
        try {
            for (let i = this.active_fish_trace.length - 1; i > -1; i--) {
                let fish_trace_info = this.active_fish_trace[i];
                let now_tick = new Date().getTime();
                if (now_tick - fish_trace_info.create_time > fish_trace_info.aliveTime + 1000) {
                    this.active_fish_trace.splice(i, 1);
                    this.channelIsPlayer("on_S_FISH_dell", { fish_trace_info });
                }
            }
        }
        catch (error) {
            console.warn(`dell_fish_Bullet:${error}`);
        }
    }
    dell_Bullet(currPlayer, Bullet_id, fish_id) {
        if (Bullet_id) {
            let BulletInfo = currPlayer.BulletInfoList.find(bl => bl.Bullet_id == Bullet_id);
            if (BulletInfo) {
                this.channelIsPlayer("on_S_Bullet_dell", { pl: currPlayer.strip(), BulletInfo });
            }
            currPlayer.BulletInfoList = currPlayer.BulletInfoList.filter(m => m.Bullet_id != Bullet_id);
            if (fish_id) {
                let BulletInfoList = currPlayer.BulletInfoList;
                for (const BulletInfo of BulletInfoList) {
                    if (BulletInfo.lock_fishid == fish_id) {
                        this.channelIsPlayer("on_S_Bullet_dell", { pl: currPlayer.strip(), BulletInfo });
                    }
                }
            }
            return;
        }
    }
    dell_fish_one(fish_id) {
        this.active_fish_trace = this.active_fish_trace.filter(m => m.fish_id != fish_id);
    }
    strip() {
        return {
            sceneId: this.sceneId,
            roomId: this.roomId,
            bullet_value: this.bullet_value,
            yuzhen_run: this.yuzhen_run,
            bg: this.bg
        };
    }
    get_same_places_kind(main_fish_id, fish_id_arr, places) {
        let fish_List = [];
        for (const fish_id of fish_id_arr) {
            let fish_info = this.GetFishTraceInfo(fish_id);
            if (!fish_info || fish_info.fish_id == main_fish_id)
                continue;
            for (const kind of places) {
                if (fish_info.kind == kind)
                    fish_List.push(fish_info);
            }
        }
        return fish_List;
    }
    get_multiple_fish(fish_id_arr, multiple) {
        let fish_List = [];
        for (const fish_id of fish_id_arr) {
            let fish_info = this.GetFishTraceInfo(fish_id);
            if (fish_info && fish_info.multiple < multiple &&
                ![20, 23, 25, 26].includes(fish_info.kind)) {
                fish_List.push(fish_info);
            }
        }
        return fish_List;
    }
    get_same_kind(main_fish_id, fish_id_arr, main_fish_kind) {
        let fish_List = [];
        for (const fish_id of fish_id_arr) {
            let fish_info = this.GetFishTraceInfo(fish_id);
            if (!fish_info || fish_info.fish_id == main_fish_id || fish_info.kind != main_fish_kind)
                continue;
            fish_List.push(fish_info);
        }
        return fish_List;
    }
    sortProbability(_arr) {
        let allweight = 0;
        let section = 0;
        let arr = _arr.map(m => {
            const obj = {};
            for (let key in m) {
                obj[key] = m[key];
            }
            return obj;
        });
        arr.sort((a, b) => {
            return a.weight - b.weight;
        });
        for (let i = 0; i < arr.length; i++) {
            allweight += Number(arr[i].weight);
        }
        for (let i = 0; i < arr.length; i++) {
            if (i === 0) {
                let right = (arr[i].weight / allweight);
                arr[i]['section'] = [0, right];
                section = right;
            }
            else {
                let right = (arr[i].weight / allweight) + section;
                arr[i]['section'] = [section, right];
                section = right;
            }
        }
        const random = Math.random();
        for (let i = 0; i < arr.length; i++) {
            if (random >= arr[i].section[0] && random < arr[i].section[1]) {
                return arr[i].kind;
            }
        }
    }
    sortProbability_(_arr) {
        let allweight = 0;
        let section = 0;
        let arr = _arr.map(m => {
            const obj = {};
            for (let key in m) {
                obj[key] = m[key];
            }
            return obj;
        });
        arr.sort((a, b) => {
            return a.weight - b.weight;
        });
        for (let i = 0; i < arr.length; i++) {
            allweight += Number(arr[i].weight);
        }
        for (let i = 0; i < arr.length; i++) {
            if (i === 0) {
                let right = (arr[i].weight / allweight);
                arr[i]['section'] = [0, right];
                section = right;
            }
            else {
                let right = (arr[i].weight / allweight) + section;
                arr[i]['section'] = [section, right];
                section = right;
            }
        }
        const random = Math.random();
        for (let i = 0; i < arr.length; i++) {
            if (random >= arr[i].section[0] && random < arr[i].section[1]) {
                return arr[i].group;
            }
        }
    }
    br_kickNoOnline() {
        const beingKickedPlayers = [];
        let kickPlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            let describe = langsrv.getlanguage(pl.language, langsrv.Net_Message.id_1098);
            let now_tick = Math.floor(new Date().getTime() / 1000);
            if (now_tick - pl.updatetime > 1 * 60) {
                pl.onLine = false;
                describe = langsrv.getlanguage(pl.language, langsrv.Net_Message.id_1101);
            }
            if (pl.onLine == false) {
                kickPlayers.push({ uid: pl.uid, seat: pl.seat });
                const member = this.channel.getMember(pl.uid);
                beingKickedPlayers.push({
                    uid: pl.uid,
                    nid: this.nid,
                    roomId: this.roomId,
                    sceneId: this.sceneId,
                    member: member,
                });
                this.removePlayer(pl, true);
            }
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), beingKickedPlayers);
        this.cancelGetControlPlanTimer();
    }
    cancelGetControlPlanTimer() {
        if (this.players.every(p => p === null)) {
            this.controlLogic.cancelTimer();
        }
    }
}
exports.default = Room;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2J1eXUvbGliL1Jvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxQ0FBOEI7QUFDOUIsdUVBQW9FO0FBQ3BFLDhDQUErQztBQUMvQyx5Q0FBeUM7QUFFekMsNERBQTZEO0FBQzdELCtDQUF3QztBQUN4QyxpQ0FBOEI7QUFDOUIsb0VBQThFO0FBRzlFLE1BQXFCLElBQUssU0FBUSx1QkFBa0I7SUFxQmhELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFyQmhCLFlBQU8sR0FBYSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUMsc0JBQWlCLEdBQTBCLEVBQUUsQ0FBQztRQUU5QyxhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBTXJCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQUM1QixXQUFNLEdBQUcsUUFBUSxDQUFDO1FBR2xCLE9BQUUsR0FBRyxDQUFDLENBQUM7UUFDUCxjQUFTLEdBQW1CLElBQUksQ0FBQztRQUNqQyxjQUFTLEdBQW1CLElBQUksQ0FBQztRQUNqQyxjQUFTLEdBQW1CLElBQUksQ0FBQztRQUc3QixJQUFJLENBQUMsZUFBZSxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLHFCQUFXLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZ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