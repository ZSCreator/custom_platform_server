import { pinus } from "pinus";
import { SystemRoom } from "../pojo/entity/SystemRoom";
import { PlayerInfo } from "../pojo/entity/PlayerInfo";
import { GameNidEnum } from "../constant/game/GameNidEnum";
import { PositionEnum } from "../constant/player/PositionEnum";
import PlayerManagerDao from "../dao/daoManager/Player.manager";
import { RoleEnum } from "../constant/player/RoleEnum";
import { Player } from "../dao/mysql/entity/Player.entity";
import { random } from "../../utils";
import { get as getJsonConfig } from "../../../config/data/JsonMgr";
import { InteriorGameType } from "../constant/game/GameTypeEnum";

/**
 * 另一种实现房间管理基类
 * @property realPlayerFirst 真人玩家优先
 */
export default abstract class RoomManager<T extends SystemRoom<PlayerInfo>> {
    readonly _nid: GameNidEnum;
    readonly _name: string;
    readonly _type: InteriorGameType = InteriorGameType.None;
    protected playerSeats: Map<string, { sceneId: number, roomId: string }> = new Map();
    roomMap: Map<string, T> = new Map();
    realPlayerFirst: boolean = true;
    ipCheck: boolean = false;

    protected constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        this._nid = nid;
        this._type = type;
        this._name = name;
    }

    /**
     * 创建一个房间
     * @param sceneId
     * @param roomId
     */
    abstract createRoom(sceneId: number | string, roomId?: string): T;

    /**
     * 初始化
     */
    init() {
        const gamesIpConfig = getJsonConfig('ipSwitch').datas;
        const config = gamesIpConfig.find(game => game.id === this._nid);

        if (config) {
            this.ipCheck = config.open;
        }
    }

    /**
     * 获取所有房间
     */
    public getAllRooms(): T[] {
        return [...this.roomMap.values()];
    }

    /**
     * 通过场ID 获取房间
     * @param sceneId
     */
    public getRoomsBySceneId(sceneId: number) {
        return [...this.roomMap.values()].filter(room => room.sceneId === sceneId);
    }

    /**
     * 获取一个房间实体类 如果房间存在则返回 不存在则创建
     * @param sceneId       场id
     * @param roomId        房间id
     * @param player        玩家
     */
    public getRoom(sceneId: number, roomId: string, player?: PlayerInfo): T {
        // 如果没有房间号，代表这时候已经初始化 获取一个可以进入的房间
        if (!roomId && !!player) {
            return this.getAccessibleRoom(sceneId, player);
        }

        let key: string = RoomManager.getKey(sceneId, roomId);

        let room: T = this.roomMap.get(key);

        if (!room) {
            // 清理房间玩家
            room = this.createRoom(sceneId, roomId);

            if (!room) {
                console.warn('未生成房间')
                return undefined;
            }

            this.addRoom(key, room);
        }

        return room;
    }

    /**
     * 搜索一个一个房间
     * @param sceneId
     * @param roomId
     */
    public searchRoom(sceneId: number, roomId: string): T | undefined;
    public searchRoom(roomId: string): T | undefined;
    public searchRoom(sceneId: number | string, roomId?: string): T | undefined {
        let key: string = RoomManager.getKey(sceneId, roomId);
        return this.roomMap.get(key);
    }

    /**
     * 销毁房间
     * @param room
     */
    public destroyRoom(room) {
        pinus.app.channelService.destroyChannel(room.channel);
        room.sendRoomCloseMessage();
        room.players.forEach(p => !!p && this.removePlayerSeat(p.uid));
        room.players = [];
        this.roomMap.delete(RoomManager.getKey(room.sceneId, room.roomId));
    }

    /**
     * 记录玩家所在房间
     * @param uid
     * @param sceneId
     * @param roomId
     */
    recordPlayerSeat(uid: string, sceneId: number, roomId: string) {
        if (!uid || typeof sceneId !== 'number' || !roomId) {
            throw new Error(`recordPlayerSeat错误: 请输入正确的位置参数 uid: ${uid} sceneId: ${sceneId} roomId: ${roomId}`);
        }

        this.playerSeats.set(uid, { sceneId, roomId });
    }

    /**
     * 获取玩家房间位置
     * @param uid
     */
    getPlayerSeat(uid: string) {
        return this.playerSeats.get(uid);
    }

    /**
     * 移除玩家位置
     * @param uid
     */
    removePlayerSeat(uid: string) {
        return this.playerSeats.delete(uid);
    }

    /**
     * 服务器结束操作
     */
    async beforeShutdown() {
        await Promise.all([...this.roomMap.values()].map(room => {
            return room.players.map(async p => {
                // @ts-ignore
                const player: Player = await PlayerManagerDao.findOne({ uid: p.uid }, false);
                if (!player) {
                    return;
                }
                await PlayerManagerDao.updateOne({ uid: player.uid }, { position: PositionEnum.HALL, abnormalOffline: false, kickedOutRoom: true });
            })
        }));
    }



    /**
     * 创建两条通道 一条给所有人使用 另外一条只给真人玩家使用
     * @param sceneId
     * @param roomId
     */
    protected genChannel(sceneId: number | string, roomId?: string) {
        const channelName = this.genChannelName(sceneId, roomId);

        return {
            baseChannel: pinus.app.channelService.createChannel(channelName)
        };
    }


    /**
     * 检查是否可以进入这个房间 默认都可以自进入 如果有其他检查规则可自有实现
     * @param room
     * @param player
     * @private
     */
    check(room: T, player: PlayerInfo): boolean {
        // 满员则不允许进
        if (room.isFull()) {
            return false;
        }

        // if (player.isRobot === RoleEnum.REAL_PLAYER && this.ipCheck) {
        //     return !(room.players.find(p => !!p && p.isRobot === RoleEnum.REAL_PLAYER && p.ip === player.ip));
        // }

        return true;
    }

    /**
     * 从已生成房间中获取一个可用房间
     * @param sceneId 场
     * @param player 玩家
     */
    protected getAccessibleRoom(sceneId: number, player: PlayerInfo) {
        const rooms = this.getRoomsBySceneId(sceneId);

        // 获取所有可以进入的房间
        const canEntryRooms = rooms.filter(room => this.check(room, player));

        if (canEntryRooms.length === 0) {
            throw new Error(`游戏: ${this._name} | RoomManager.getAccessibleRoom | 错误 | 场: ${sceneId} | 没有可以进入的房间 `);
        }

        // if (this.realPlayerFirst) {
        if (true) {
            // 有真人的房间
            const hasRealPlayerRooms = canEntryRooms.filter(room => room.players.find(p => !!p && p.isRobot === RoleEnum.REAL_PLAYER));

            if (hasRealPlayerRooms.length) {
                return hasRealPlayerRooms[random(0, hasRealPlayerRooms.length - 1)];
            }
        }

        // 有人的房间
        // const hasPlayerRooms = canEntryRooms.filter(room => room.players.find(p => !!p));

        // if (hasPlayerRooms.length) {
        //     return hasPlayerRooms[random(0, hasPlayerRooms.length - 1)];
        // }

        return canEntryRooms[random(0, canEntryRooms.length - 1)];
    }

    /**
     * 生成通道名字
     * @param sceneId 场id 如果没有场的游戏未 房间id
     * @param roomId 房间id
     */
    private genChannelName(sceneId: number | string, roomId?: string): string {
        return typeof sceneId === 'number' ? `${this._name}|${sceneId}|${roomId}` : `${this._name}|${sceneId}`
    }

    /**
     * 添加一个房间
     * @param key
     * @param room
     */
    private addRoom(key: string, room: T) {
        this.roomMap.set(key, room);
    }

    /**
     * 根据场id和房间id唯一hash key
     * @param sceneId
     * @param roomId
     */
    private static getKey(sceneId: number | string, roomId?: string): string {
        if (typeof sceneId === 'string' || !roomId) {
            return `${sceneId}`;
        }

        return `${sceneId}|${roomId}`
    }
}