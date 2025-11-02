import { getLogger } from "pinus-logger";
import Player from './Player';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import utils = require('../../../utils/index');
import * as buyuConst from './buyuConst';
import offLineService = require('../../../services/hall/offLineService');
import langsrv = require('../../../services/common/langsrv');
import ControlImpl from "./ControlImpl";
import { pinus } from "pinus";
import roomManager, { BuYuRoomManagerImpl } from '../lib/BuYuRoomManagerImpl';


export default class Room extends SystemRoom<Player>{
    players: Player[] = new Array(4).fill(null);// 玩家列表;
    /**活动的鱼 */
    active_fish_trace: buyuConst.Fish_info[] = [];
    /**鱼id  递增 */
    fish_id_: number = 0;
    controlLogic: ControlImpl;
    base_rate: number;
    entryCond: number;
    /**子弹价值 */
    bullet_value: number;
    boss_time: number = 0;
    /**鱼阵时间 */
    yuzhen_run: boolean = false;
    status = 'INWAIT';// 等待玩家准备
    backendServerId: string;
    /**背景 */
    bg = 0;
    Interval1: NodeJS.Timeout = null;
    Interval2: NodeJS.Timeout = null;
    Interval3: NodeJS.Timeout = null;
    constructor(opts: any) {
        super(opts);
        this.backendServerId = pinus.app.getServerId();
        this.controlLogic = new ControlImpl({ room: this });
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
    /**进入游戏主体 */
    StartGame() {
        this.Interval1 = setInterval(() => {
            if (this.yuzhen_run == false)
                this.create_yu();
        }, 1000);
        this.Interval2 = setInterval(() => {
            //  清理过期鱼儿
            this.dell_fish_Bullet();
            // 清理不在线玩家
            this.br_kickNoOnline();
        }, 1 * 1000);

        /**鱼阵 */
        this.Interval3 = setInterval(() => {
            if (this.players.length > 0) {
                this.yuzhen_run = true;
                let times = [34, 34, 35, 36, 36, 25];
                let ran = utils.random(0, 4);
                let ran1 = utils.random(0, 3);/**背景图片 */

                let fish_trace_info: { fish_id: number, fish_kind: number }[] = [];
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
                }
                this.bg = ran1;
                this.channelIsPlayer('buyu_yuzhen', opts);
                setTimeout(() => { this.yuzhen_run = false }, (times[ran] + 3) * 1000);
            }
        }, 5 * 60 * 1000);
    }

    /**创建鱼 定时器 */
    create_yu() {
        let fish_arr: { group: number, weight: number }[] = [];
        for (const weight of buyuConst.weights) {
            let len = this.active_fish_trace.filter(m => m.fish_group == weight.group).length;
            if (len < weight.min) {
                fish_arr.push({ group: weight.group, weight: weight.weight });
            } else if (len > weight.min && len < weight.max) {
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
            } else
                if (fish_kind == 23) {
                    this.BuildFishTrace(4, group, fish_kind);
                } else {
                    this.BuildFishTrace(1, group, fish_kind);
                }
        }
    }
    /**添加玩家 */
    addPlayerInRoom(dbPlayer: any) {
        let currPlayer = this.getPlayer(dbPlayer.uid);

        // 运行定时获取调控方案定时器
        this.controlLogic.controlPlanTimer();

        if (currPlayer) {
            currPlayer.onLine = true;
            this.addMessage(dbPlayer);
            return true;
        }
        if (this.isFull()) return false;

        const i = this.players.findIndex(m => !m);
        this.players[i] = new Player(i, dbPlayer, this);

        // 添加到消息通道
        this.addMessage(dbPlayer);
        this.channelIsPlayer('buyu_onEntry', {
            pl: this.players[i].strip(),
        });
        return true;
    }

    /**
     * 有玩家离开 isOffLine代表是否断线 断线则不删除玩家
     * @param player 
     * @param isOffLine 
     */
    async removePlayer(playerInfo: Player, isOffLine: boolean) {
        // let BulletInfoList = playerInfo.BulletInfoList;
        do {
            const user_fire = playerInfo.BulletInfoList.shift();
            if (!user_fire) {
                break;
            }
            this.channelIsPlayer("on_S_Bullet_dell", { pl: playerInfo.strip(), BulletInfo: user_fire });
        } while (true);
        await playerInfo.settlement(this);
        roomManager.removePlayerSeat(playerInfo.uid);
        const idx = this.players.findIndex(m => m && m.uid == playerInfo.uid);
        if (idx !== -1) {
            this.players[idx] = null;
            this.channelIsPlayer('buyu_onExit', {
                uid: playerInfo.uid,
                seat: playerInfo.seat,
                gold: playerInfo.gold
            });
            this.kickOutMessage(playerInfo.uid);

            // 没人关闭定时器
            this.cancelGetControlPlanTimer();
            return true;
        }
        return false;
    }

    /**鱼阵的时候 根据kind 生成一个鱼 返回 回去 计算 */
    GetFishTraceInfo(fish_id: number, fish_kind?: number) {
        if (this.yuzhen_run == true && fish_kind) {
            let temp = buyuConst.Fish_list.find(m => m.kind == fish_kind);
            if (temp) {
                let fish_info = this.ActiveFishTrace(fish_kind);
                return fish_info;
            }
            return null;
        }
        return this.active_fish_trace.find(m => m.fish_id == fish_id);;
    }

    ActiveFishTrace(fish_kind: number) {
        const temp = buyuConst.Fish_list.find(m => m.kind == fish_kind);
        if (temp) {
            let fish_info: buyuConst.Fish_info = { kind: fish_kind, name: temp.name, type: temp.type, multiple: temp.multiple, aliveTime: temp.aliveTime };
            this.fish_id_++;
            if (this.fish_id_ > 10000) {
                this.fish_id_ = 0;
            }

            fish_info.fish_id = this.fish_id_;
            fish_info.create_time = new Date().getTime();
            fish_info.aliveTime = 35 * 1000;
            fish_info.path = utils.random(0, 200);
            fish_info.places = [];

            let places: number[] = [];
            switch (fish_kind) {
                case 20:
                case 23:
                    let ran = utils.random(5, 10);
                    fish_info.places.push(ran);
                    fish_info.multiple = buyuConst.Fish_list.find(m => m.kind == ran).multiple;
                    break;
                case 25:
                    for (; ;) {
                        let ran = utils.random(1, 10);
                        if (!places.includes(ran))
                            places.push(ran);
                        if (places.length == 2) break;
                    }
                    fish_info.places = places;
                    fish_info.multiple = buyuConst.Fish_list.find(m => m.kind == places[0]).multiple;
                    fish_info.multiple += buyuConst.Fish_list.find(m => m.kind == places[1]).multiple;
                    break;
                case 26:
                    {
                        for (; ;) {
                            let ran = utils.random(1, 10);
                            if (!places.includes(ran))
                                places.push(ran);
                            if (places.length == 3) break;
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

    BuildFishTrace(fish_count: number, group: number, fish_kind: number) {
        let fish_trace_info: buyuConst.Fish_info[] = [];
        try {
            do {
                // let fish_kind = kind ? kind : this.sortProbability(fish_group.weights);
                let fish_info = this.ActiveFishTrace(fish_kind);
                if (fish_info) {
                    fish_info.fish_group = group;
                    this.active_fish_trace.push(fish_info);
                    fish_trace_info.push(fish_info);
                }
                fish_count--;
            } while (fish_count > 0);
            this.channelIsPlayer("on_S_FISH_TRACE", { fish_trace_info: fish_trace_info });
        } catch (error) {
            console.warn(`BuildFishTrace:${error}`);
        }
    }
    /**清理过期鱼儿 */
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
        } catch (error) {
            console.warn(`dell_fish_Bullet:${error}`);
        }
    }

    /**击中鱼 消耗子弹和鱼 */
    dell_Bullet(currPlayer: Player, Bullet_id?: number, fish_id?: number) {
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
    /**清理指定鱼 */
    dell_fish_one(fish_id: number) {
        this.active_fish_trace = this.active_fish_trace.filter(m => m.fish_id != fish_id);
    }
    strip() {
        return {
            sceneId: this.sceneId,
            roomId: this.roomId,
            bullet_value: this.bullet_value,
            yuzhen_run: this.yuzhen_run,
            bg: this.bg
        }
    }
    /**获取places同类型得鱼 */
    get_same_places_kind(main_fish_id: number, fish_id_arr: number[], places: number[]) {
        let fish_List: buyuConst.Fish_info[] = [];
        for (const fish_id of fish_id_arr) {
            let fish_info = this.GetFishTraceInfo(fish_id);
            if (!fish_info || fish_info.fish_id == main_fish_id) continue;
            for (const kind of places) {
                if (fish_info.kind == kind)
                    fish_List.push(fish_info);
            }
        }
        return fish_List;
    }

    /**返回multiple倍以下鱼 arr */
    get_multiple_fish(fish_id_arr: number[], multiple: number) {
        let fish_List: buyuConst.Fish_info[] = [];
        for (const fish_id of fish_id_arr) {
            let fish_info = this.GetFishTraceInfo(fish_id);
            if (fish_info && fish_info.multiple < multiple &&
                ![20, 23, 25, 26].includes(fish_info.kind)) {
                fish_List.push(fish_info);
            }
        }
        return fish_List;
    }
    /**获取相同类型的鱼 */
    get_same_kind(main_fish_id: number, fish_id_arr: number[], main_fish_kind: number) {
        let fish_List: buyuConst.Fish_info[] = [];//this.active_fish_trace.filter(m => m.kind == main_fish_kind);
        for (const fish_id of fish_id_arr) {
            let fish_info = this.GetFishTraceInfo(fish_id);
            if (!fish_info || fish_info.fish_id == main_fish_id || fish_info.kind != main_fish_kind) continue;
            fish_List.push(fish_info);
        }
        return fish_List;
    }

    /**鱼kind 权重计算 */
    sortProbability(_arr: { kind: number, weight: number }[]) {
        let allweight = 0;
        let section = 0; //区间临时变量
        let arr = _arr.map(m => {
            const obj: { kind?: number, weight?: number, section?: number[] } = {};
            for (let key in m) {
                obj[key] = m[key];
            }
            return obj;
        });
        //console.log("obj=", arr);
        //排序
        arr.sort((a, b) => {
            return a.weight - b.weight;
        });
        //计算总权重
        for (let i = 0; i < arr.length; i++) {
            allweight += Number(arr[i].weight);
        }

        //获取概率区间
        for (let i = 0; i < arr.length; i++) {
            if (i === 0) {
                let right = (arr[i].weight / allweight);
                arr[i]['section'] = [0, right];
                section = right;
            } else {
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

    /**group权重 */
    sortProbability_(_arr: { group: number, weight: number }[]) {
        let allweight = 0;
        let section = 0; //区间临时变量
        let arr = _arr.map(m => {
            const obj: { group?: number, weight?: number, section?: number[] } = {};
            for (let key in m) {
                obj[key] = m[key];
            }
            return obj;
        });
        //console.log("obj=", arr);
        //排序
        arr.sort((a, b) => {
            return a.weight - b.weight;
        });
        //计算总权重
        for (let i = 0; i < arr.length; i++) {
            allweight += Number(arr[i].weight);
        }

        //获取概率区间
        for (let i = 0; i < arr.length; i++) {
            if (i === 0) {
                let right = (arr[i].weight / allweight);
                arr[i]['section'] = [0, right];
                section = right;
            } else {
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

    /**踢掉离线玩家 */
    br_kickNoOnline() {
        const beingKickedPlayers = [];
        let kickPlayers: { uid: string, seat: number }[] = [];
        // let temp = false;
        for (const pl of this.players) {
            if (!pl) continue;
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
                // this.channelIsPlayer('buyu_onExit', { uid: pl.uid, seat: pl.seat, msg: describe });
                // this.kickOutMessage(pl.uid);
                this.removePlayer(pl, true);
            }
        }

        //更新数据（前端需要切换场景）
        this.kickingPlayer(pinus.app.getServerId(), beingKickedPlayers);
        // 如果没人关闭定器
        this.cancelGetControlPlanTimer();
    }

    /**
     * 如果房间里没人清楚定时器
     */
    private cancelGetControlPlanTimer() {
        // 如果房间里没有玩家清除定时器
        if (this.players.every(p => p === null)) {
            this.controlLogic.cancelTimer();
        }
    }


}