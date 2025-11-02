import {SystemRoom} from "../../pojo/entity/SystemRoom";
import {PlayerInfo} from "../../pojo/entity/PlayerInfo";
import {pinus, Channel, getLogger} from "pinus";


enum GroupState {
    IDLE,
    BUSY,
    DESTRUCT
}

const logger = getLogger('server_out', __filename);

export default class RoomGroup<T extends SystemRoom<PlayerInfo>> {
    // 租户使用id
    readonly id: string;
    readonly platformId: string;
    readonly index: string;

    // 包含的房间
    private rooms: T[] = [];
    // 状态
    private state: GroupState;
    // 公共channel
    channel: Channel;
    // 游戏nid
    nid: string;
    // 闲置时间
    idleTime: number;

    // 最后更新的时间
    lastUpdateTime: number;

    uidMap: Map<string, {uid, sid}> = new Map();

    constructor(platformId: string, index: string,nid: string, rooms: T[]) {
        this.platformId = platformId;
        this.index = index;
        this.id = genGroupId(this.platformId, this.index);
        this.rooms = rooms;
        this.nid = nid;
        this.channel = pinus.app.channelService.createChannel(`${this.id}`);
        this.lastUpdateTime = Date.now();
    }

    /**
     * 是否空闲
     */
    isIdle(): boolean {
        return this.state === GroupState.IDLE;
    }

    /**
     * 检查玩家session
     */
    async checkPlayersSession(): Promise<boolean> {
        this.lastUpdateTime = Date.now();
        const players = [...this.uidMap.values()];

        if (players.length === 0) {
            return true;
        }

        const sids = players.reduce((sids, {sid}, ) => sids.add(sid), new Set());
        const results = await Promise.all([...sids.values()].map((sid: string) => {
            const s = players.filter(p => p.sid === sid);
            return pinus.app.rpc.connector.enterRemote.checkPlayersSession.toServer(sid, s.map(({uid}) => uid));
        }));

        // 如果所有玩家的session都断开了则返回true
        return results.every(r => !r);
    }

    /**
     * 添加房间
     * @param room
     */
    addRoom(room: T) {
        this.rooms.push(room);
    }

    /**
     * 自毁中
     */
    setDestructState() {
        this.state = GroupState.DESTRUCT;
    }

    /**
     * 是否是自毁状态
     */
    isDestructState() {
        return this.state === GroupState.DESTRUCT;
    }

    /**
     * 根据场id查找房间
     * @param sceneId
     */
    findRoomsBySceneId(sceneId:number) {
        return this.rooms.filter(r => r.sceneId === sceneId);
    }

    /**
     * 获取房间组
     */
    getRooms() {
        return this.rooms;
    }

    /**
     * 添加玩家
     * @param player
     */
    addPlayer(player: PlayerInfo) {
        this.addToChannel(player);

        this.uidMap.set(player.uid, {uid: player.uid, sid: player.sid});

        this.lastUpdateTime = Date.now();

        if (this.state === GroupState.IDLE) {
            this.state = GroupState.BUSY;
        }
    }

    /**
     * 删除玩家
     * @param player
     */
    removePlayer(player: PlayerInfo) {
        this.leaveTheChannel(player);

        this.uidMap.delete(player.uid);

        this.lastUpdateTime = Date.now();

        if (this.uidMap.size === 0) {
            this.state = GroupState.IDLE;
            this.idleTime = Date.now();
        }
    }

    /**
     * 离开通道
     * @param player
     */
    leaveTheChannel(player: PlayerInfo) {
        const member = this.channel.getMember(player.uid);
        member && this.channel.leave(member.uid, member.sid);
    }

    /**
     * 添加进通道
     * @param player
     */
    addToChannel(player: PlayerInfo) {
        if (this.channel.getMember(player.uid)) {
            return;
        }

        if (!this.channel.add(player.uid, player.sid)) {
            logger.warn(`玩家添加盘路通道失败 游戏: ${this.nid} uid: ${player.uid} id: ${this.id}`);
            return;
        }
    }

    /**
     * 发送消息
     * @param route
     * @param data
     */
    pushMessage(route: string, data: any) {
        this.channel.pushMessage(route, data);
    }

    /**
     * 销毁
     */
    destruct() {
        this.rooms = [];
        pinus.app.channelService.destroyChannel(this.id);
        this.channel = null;
        this.uidMap.clear();
    }
}

/**
 * 生成租户组的id
 * @param platformId
 * @param index
 */
function  genGroupId(platformId: string, index: string) {
    return `${platformId}:${index}`;
}