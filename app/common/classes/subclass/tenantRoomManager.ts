import RoomManager from "../roomManager";
import {SystemRoom} from "../../pojo/entity/SystemRoom";
import {PlayerInfo} from "../../pojo/entity/PlayerInfo";
import RoomGroup from "./roomGroup";
import SceneManager from "../../dao/daoManager/Scene.manager";
import GameManager from "../../dao/daoManager/Game.manager";
import {random} from "../../../utils";
import {RoleEnum} from "../../constant/player/RoleEnum";
import {InteriorGameType} from "../../constant/game/GameTypeEnum";
import ShareTenantRoomSituationRedisDao from "../../dao/redis/ShareTenantRoomSituation.redis.dao";


// 过期时间
const EXPIRATION_TIME = 2 * 60 * 1000;

// 静止时间
const STATIONARY_WAIT_TIME = 20 * 60 * 1000;

// 刷新时间
const REFRESH_TIME = 10 * 1000;

// 房间容纳上限
const ROOM_COUNT_LIMIT = 10000;

export abstract class TenantRoomManager<T extends SystemRoom<PlayerInfo>> extends RoomManager<T> {
    // 备用房间号
    private roomCodeList: string[];

    // 场id
    private sceneIdList: number[] = [];
    // 房间号映射
    private groupMapOfRoomId: Map<string, RoomGroup<T>> = new Map();
    // 单场房间数量
    private roomCount: number;
    private roomGroupMap: Map<string, Map<string, RoomGroup<T>>> = new Map();
    readonly defaultPlatformId: string = '999999999';
    readonly defaultIndex: string = '999999999';
    readonly _roomCodeSet: Set<string> = new Set();
    private timer: NodeJS.Timer;

    // 运行房间组
    runningGroupList: RoomGroup<T>[] = [];
    // 空闲房间组
    leisureGroupList: RoomGroup<T>[] = [];
    // 是否在搜索房间时在房间不够的情况下新增房间
    needAdd: boolean = false;


    abstract createRoom(sceneId: number | string, roomId?: string): T;
    abstract stopTheRoom(room: T);

    async init() {
        super.init();
        const scenes = await SceneManager.findList({ nid: this._nid });
        const game = await GameManager.findOne({ nid: this._nid });
        scenes.forEach(s => this.sceneIdList.push(s.sceneId));
        this.roomCount = game.roomCount;
        this.roomCodeList = genRoomsCode(this.sceneIdList.length, this.roomCount);

        if (this.roomCodeList.length > ROOM_COUNT_LIMIT) {
            throw new Error('房间数量上限超过10000');
        }

        this.roomCodeList.forEach(c => this._roomCodeSet.add(c));

        this.timer = setInterval(async () => {
            // 销毁空闲时间过长的房间组
            this.destructionOverdueGroup();
            // 检查长时间无动作的玩家session
            await this.insurance();
            // 更新测试数据
            await this.updateProcessData();
        }, REFRESH_TIME);
    }

    /**
     * 关闭房间管理器
     */
    close() {
        // this.runningGroupList.forEach(g => this.destructionTenantScene(g.platformId, g.index, true));
        clearInterval(this.timer);
    }

    /**
     * 测试接口 只允许测试程序调用
     * @param group
     */
    _testDestructGroup(group: RoomGroup<T>) {
        this.destructionTenantScene(group.platformId, group.index);
    }

    /**
     * 获取一个房间实体类 如果房间存在则返回 不存在则创建
     * @param sceneId       场id
     * @param roomId        房间id
     * @param player        玩家
     */
    getRoom(sceneId: number, roomId: string, player?: PlayerInfo): T {
        if (!!roomId && !this._roomCodeSet.has(roomId)) {
            throw new Error(`房间号传入错误 ${roomId}`);
        }

        let room;
        if (!!player) {
            const position = this.getPlayerSeat(player.uid);
            if (position) {
                room = this.searchRoom(position.sceneId, position.roomId);
            }
        }

        if (!room) {
            room = super.getRoom(sceneId, roomId, player);
        }

        // 只要在房间里说明都是断线重连
        if (!!room &&
            !!player &&
            room.players.find(p => !!p && p.uid === player.uid)) {
            return room;
        }

        // 如果是百人游戏鉴权不通过 或者 房间已满返回undefined
        if (this._type === InteriorGameType.Br &&
            !!room &&
            !!player &&
            (!this.checkPermissions(player, room.roomId) ||
                !this.check(room, player))) {

            return undefined;
        }

        // 如果是对战游戏 进入玩家又是机器人 对房间进行二次鉴权 因为机器人是直接传入房间号并没有走鉴权逻辑
        if (this._type === InteriorGameType.Battle &&
            !!room &&
            !!player &&
            // player.isRobot === RoleEnum.REAL_PLAYER &&
            !this.check(room, player)) {
            return undefined;
        }


        return room;
    }


    /**
     * 查找一个租户场
     * @param player 玩家
     */
    getTenantScene(player: PlayerInfo) {
        let platformId = player.group_id || this.defaultPlatformId;
        let index = player.lineCode || this.defaultIndex;

        let platformGroups = this.roomGroupMap.get(platformId);

        if (!platformGroups) {
            this.createTenantScene(platformId, index);
            platformGroups = this.roomGroupMap.get(platformId);
        }

        let group = platformGroups.get(index);

        if (!group) {
            this.createTenantScene(platformId, index);
            group = platformGroups.get(index);
        }

        if (group.isDestructState()) {
            throw new Error('自毁中');
        }

        return group;
    }

    /**
     * 移除玩家
     * @param player
     */
    removePlayer(player: PlayerInfo) {
        const group = this.findGroup(player);

        if (!group) {
            return null;
        }

        group.removePlayer(player);

        // 同时也移除玩家在房间的位置
        this.removePlayerSeat(player.uid);

        // 如果闲置了 加入闲置组
        if (group.isIdle() && this.leisureGroupList.findIndex(g => g === group) === -1) {
            this.leisureGroupList.push(group);
        }
    }

    /**
     * 玩家离开通道
     * @param player
     */
    playerLeaveChannel(player: PlayerInfo) {
        if (player.isRobot === RoleEnum.ROBOT) {
            return;
        }

        const group = this.findGroup(player);

        if (!group) {
            return null;
        }

        group.leaveTheChannel(player);
    }

    /**
     * 玩家添加通道
     * @param player
     */
    playerAddToChannel(player: PlayerInfo) {
        if (player.isRobot === RoleEnum.ROBOT) {
            return;
        }

        const group = this.findGroup(player);

        if (!group) {
            return null;
        }

        group.addToChannel(player);
    }

    /**
     * 添加玩家
     * @param player
     */
    addPlayer(player: PlayerInfo) {
        const group = this.findGroup(player);

        if (!group) {
            return null;
        }

        group.addPlayer(player);

        const index = this.leisureGroupList.findIndex(g => g === group);
        if (index !== -1) {
            this.leisureGroupList.splice(index, 1);
        }
    }

    /**
     * 发送消息
     * @param roomId
     * @param route
     * @param data
     */
    pushMessage(roomId, route, data) {
        const group = this.groupMapOfRoomId.get(roomId);

        if (!group) {
            return;
        }

        group.pushMessage(route, data);
    }

    /**
     * 发送盘路消息
     * @param roomId
     * @param data
     */
    pushRoomStateMessage(roomId, data) {
        const group = this.groupMapOfRoomId.get(roomId);

        if (!group) {
            return;
        }

        group.pushMessage(`${this._nid}_redisHistory`, data);
    }

    /**
     * 查找一个组 这个时候调用都是初始化过的 所以注意调用顺序
     * @param player
     */
    findGroup(player: PlayerInfo) {
        let platformId = player.group_id || this.defaultPlatformId;
        let index = player.lineCode || this.defaultIndex;

        let platformGroups = this.roomGroupMap.get(platformId);

        if (!platformGroups) {
            return null;
        }

        return platformGroups.get(index);
    }

    /**
     * 检查玩家房间权限
     * @param player
     * @param roomId
     */
    checkPermissions(player, roomId: string): boolean {
        if (player.isRobot === RoleEnum.ROBOT) {
            return true;
        }

        const groupA = this.findGroup(player);
        const groupB = this.groupMapOfRoomId.get(roomId);

        return groupA === groupB;
    }

    /**
     * 从已生成房间中获取一个可用房间
     * @param sceneId 场
     * @param player 玩家
     */
    protected getAccessibleRoom(sceneId: number, player: PlayerInfo) {
        // 查找租户组
        const group = this.findGroup(player);
        if (!group) {
            throw new Error('租户未生成');
        }

        const rooms = group.findRoomsBySceneId(sceneId);
        // 获取所有可以进入的房间
        const canEntryRooms = rooms.filter(room => this.check(room, player));

        // 如果没有则新增一个
        if (canEntryRooms.length === 0) {
            if (this._type === InteriorGameType.Battle || this.needAdd) {
                console.warn('满员了添加房间');
                const code = this.getRoomCode();
                const room = this.getRoom(sceneId, code);
                group.addRoom(room);
                this.groupMapOfRoomId.set(room.roomId, group);
                return room;
            }

            throw new Error(`游戏: ${this._name} | RoomManager.getAccessibleRoom | 错误 | 场: ${sceneId} | 没有可以进入的房间 `);
        }

        // 如果真人优先则有限匹配真人
        if (this.realPlayerFirst) {
            // 有真人的房间
            const hasRealPlayerRooms = canEntryRooms.filter(room => room.players.find(p => !!p && p.isRobot === RoleEnum.REAL_PLAYER));

            if (hasRealPlayerRooms.length) {
                return hasRealPlayerRooms[random(0, hasRealPlayerRooms.length - 1)];
            }
        }

        // 有人的房间
        const hasPlayerRooms = canEntryRooms.filter(room => room.players.find(p => !!p));

        if (hasPlayerRooms.length) {
            return hasPlayerRooms[random(0, hasPlayerRooms.length - 1)];
        }

        return canEntryRooms[random(0, canEntryRooms.length - 1)];
    }

    /**
     * 销毁租户场
     * @param platformId 平台号
     * @param index 租户标识
     * @param mandatory 强制销毁
     */
    private destructionTenantScene(platformId: string, index: string, mandatory: boolean = false) {
        console.warn('房间销毁',this._nid);
        const groups = this.roomGroupMap.get(platformId);

        if (!groups) {
            console.warn('未找到租户组')
            return;
        }

        const group = groups.get(index);
        if (!group) {
            console.warn('未找到租户');
            return;
        }

        // 不空闲且不是强制性的
        if (!group.isIdle() && !mandatory) {
            console.warn('房间不是空闲');
            return;
        }

        // 设置为自毁状态
        group.setDestructState();

        group.getRooms().forEach(r => {
            // 停下房间
            this.stopTheRoom(r);
            // 销毁房间
            this.destroyRoom(r);
            // 销毁group映射
            this.groupMapOfRoomId.delete(r.roomId);
            // 归还房间号
            this.roomCodeList.push(r.roomId);
        });

        // 租户自毁
        group.destruct();
        // 销毁租户
        groups.delete(index);

        if (groups.size === 0) {
            this.roomGroupMap.delete(platformId);
        }

        this.runningGroupList.splice(this.runningGroupList.findIndex(g => g === group), 1);

        const i = this.leisureGroupList.findIndex(g => g === group);
        if (i !== -1) {
            this.leisureGroupList.splice(i, 1);
        }

        console.warn('房间销毁结束',this._nid)
    }

    /**
     * 销毁闲置组
     */
    private destructionOverdueGroup() {
        for (let i = this.leisureGroupList.length - 1; i >= 0; i--) {
            const group = this.leisureGroupList[i];

            // 如果是闲置状态 且 闲置时间超过一定时间则进行销毁
            if (group.isIdle() && Date.now() - group.idleTime > EXPIRATION_TIME) {
                this.destructionTenantScene(group.platformId, group.index);
            }
        }
    }

    /**
     * 保险机制
     * @private
     */
    private async insurance() {
        for (let i = this.runningGroupList.length - 1; i >= 0; i--) {
            const group = this.runningGroupList[i];

            // 如果最后一次更新时间超过一定时间 主动销毁
            if (Date.now() - group.lastUpdateTime > STATIONARY_WAIT_TIME && await group.checkPlayersSession()) {
                this.destructionTenantScene(group.platformId, group.index, true);
            }
        }
    }

    /**
     * 更新测试数据
     * @private
     */
    private async updateProcessData() {
        if (this.leisureGroupList.length > 0 && this.runningGroupList.length === 0) {
            console.warn('数据错误', this.leisureGroupList[0]);
        }

        await ShareTenantRoomSituationRedisDao.insertOne(this._nid, JSON.stringify({
            running: this.runningGroupList.length,
            idle: this.leisureGroupList.length,
            memory: process.memoryUsage(),
            idleRoomCodeCount: this.roomCodeList.length,
        }));
    }

    /**
     * 创建一个租户场
     * @param platformId 平台号
     * @param index 租户标识
     */
    private createTenantScene(platformId: string, index: string) {
        const num = this.sceneIdList.length * this.roomCount;
        const _roomCodeList = [];

        if (this.roomCodeList.length < num) {
            throw new Error(`房间号不足 租户数量: ${this.runningGroupList.length}`);
        }

        // 获取房间号
        for (let i = 0; i < num; i++) {
            const code = this.getRoomCode();
            _roomCodeList.push(code);
        }

        // 创建房间
        const rooms = [];
        // 房间分组
        const roomGroup = new RoomGroup(platformId, index, this._nid, rooms);
        this.sceneIdList.map(id => {
            for (let i = 0; i < this.roomCount; i++) {
                const room = this.getRoom(id, _roomCodeList.pop());
                rooms.push(room);
                this.groupMapOfRoomId.set(room.roomId, roomGroup);
            }
        });

        let groups = this.roomGroupMap.get(platformId);

        if (!groups) {
            groups = new Map();
            this.roomGroupMap.set(platformId, groups);
        }

        groups.set(index, roomGroup);

        this.runningGroupList.push(roomGroup);
    }

    /**
     * 获取房间号
     */
    private getRoomCode() {
        return this.roomCodeList.splice(random(0, this.roomCodeList.length - 1), 1)[0];
    }
}


/**
 * 生成备用房间号
 * @param sceneNum 场数量
 * @param roomNum 房间数量
 * @param tenantNum 租户量
 */
function genRoomsCode(sceneNum: number, roomNum: number, tenantNum = 100): string[] {
    const count = sceneNum * roomNum * tenantNum;
    const roomCodeList = [];

    for (let i = 0; i < count; i++) {
        roomCodeList.push(i.toString());
    }

    return roomCodeList;
}
