"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const PositionEnum_1 = require("../constant/player/PositionEnum");
const Player_manager_1 = require("../dao/daoManager/Player.manager");
const RoleEnum_1 = require("../constant/player/RoleEnum");
const utils_1 = require("../../utils");
const JsonMgr_1 = require("../../../config/data/JsonMgr");
const GameTypeEnum_1 = require("../constant/game/GameTypeEnum");
class RoomManager {
    constructor(nid, type, name) {
        this._type = GameTypeEnum_1.InteriorGameType.None;
        this.playerSeats = new Map();
        this.roomMap = new Map();
        this.realPlayerFirst = true;
        this.ipCheck = false;
        this._nid = nid;
        this._type = type;
        this._name = name;
    }
    init() {
        const gamesIpConfig = (0, JsonMgr_1.get)('ipSwitch').datas;
        const config = gamesIpConfig.find(game => game.id === this._nid);
        if (config) {
            this.ipCheck = config.open;
        }
    }
    getAllRooms() {
        return [...this.roomMap.values()];
    }
    getRoomsBySceneId(sceneId) {
        return [...this.roomMap.values()].filter(room => room.sceneId === sceneId);
    }
    getRoom(sceneId, roomId, player) {
        if (!roomId && !!player) {
            return this.getAccessibleRoom(sceneId, player);
        }
        let key = RoomManager.getKey(sceneId, roomId);
        let room = this.roomMap.get(key);
        if (!room) {
            room = this.createRoom(sceneId, roomId);
            if (!room) {
                console.warn('未生成房间');
                return undefined;
            }
            this.addRoom(key, room);
        }
        return room;
    }
    searchRoom(sceneId, roomId) {
        let key = RoomManager.getKey(sceneId, roomId);
        return this.roomMap.get(key);
    }
    destroyRoom(room) {
        pinus_1.pinus.app.channelService.destroyChannel(room.channel);
        room.sendRoomCloseMessage();
        room.players.forEach(p => !!p && this.removePlayerSeat(p.uid));
        room.players = [];
        this.roomMap.delete(RoomManager.getKey(room.sceneId, room.roomId));
    }
    recordPlayerSeat(uid, sceneId, roomId) {
        if (!uid || typeof sceneId !== 'number' || !roomId) {
            throw new Error(`recordPlayerSeat错误: 请输入正确的位置参数 uid: ${uid} sceneId: ${sceneId} roomId: ${roomId}`);
        }
        this.playerSeats.set(uid, { sceneId, roomId });
    }
    getPlayerSeat(uid) {
        return this.playerSeats.get(uid);
    }
    removePlayerSeat(uid) {
        return this.playerSeats.delete(uid);
    }
    async beforeShutdown() {
        await Promise.all([...this.roomMap.values()].map(room => {
            return room.players.map(async (p) => {
                const player = await Player_manager_1.default.findOne({ uid: p.uid }, false);
                if (!player) {
                    return;
                }
                await Player_manager_1.default.updateOne({ uid: player.uid }, { position: PositionEnum_1.PositionEnum.HALL, abnormalOffline: false, kickedOutRoom: true });
            });
        }));
    }
    genChannel(sceneId, roomId) {
        const channelName = this.genChannelName(sceneId, roomId);
        return {
            baseChannel: pinus_1.pinus.app.channelService.createChannel(channelName)
        };
    }
    check(room, player) {
        if (room.isFull()) {
            return false;
        }
        return true;
    }
    getAccessibleRoom(sceneId, player) {
        const rooms = this.getRoomsBySceneId(sceneId);
        const canEntryRooms = rooms.filter(room => this.check(room, player));
        if (canEntryRooms.length === 0) {
            throw new Error(`游戏: ${this._name} | RoomManager.getAccessibleRoom | 错误 | 场: ${sceneId} | 没有可以进入的房间 `);
        }
        if (true) {
            const hasRealPlayerRooms = canEntryRooms.filter(room => room.players.find(p => !!p && p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER));
            if (hasRealPlayerRooms.length) {
                return hasRealPlayerRooms[(0, utils_1.random)(0, hasRealPlayerRooms.length - 1)];
            }
        }
        return canEntryRooms[(0, utils_1.random)(0, canEntryRooms.length - 1)];
    }
    genChannelName(sceneId, roomId) {
        return typeof sceneId === 'number' ? `${this._name}|${sceneId}|${roomId}` : `${this._name}|${sceneId}`;
    }
    addRoom(key, room) {
        this.roomMap.set(key, room);
    }
    static getKey(sceneId, roomId) {
        if (typeof sceneId === 'string' || !roomId) {
            return `${sceneId}`;
        }
        return `${sceneId}|${roomId}`;
    }
}
exports.default = RoomManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvY29tbW9uL2NsYXNzZXMvcm9vbU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBOEI7QUFJOUIsa0VBQStEO0FBQy9ELHFFQUFnRTtBQUNoRSwwREFBdUQ7QUFFdkQsdUNBQXFDO0FBQ3JDLDBEQUFvRTtBQUNwRSxnRUFBaUU7QUFNakUsTUFBOEIsV0FBVztJQVNyQyxZQUFzQixHQUFnQixFQUFFLElBQXNCLEVBQUUsSUFBWTtRQU5uRSxVQUFLLEdBQXFCLCtCQUFnQixDQUFDLElBQUksQ0FBQztRQUMvQyxnQkFBVyxHQUFxRCxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3BGLFlBQU8sR0FBbUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNwQyxvQkFBZSxHQUFZLElBQUksQ0FBQztRQUNoQyxZQUFPLEdBQVksS0FBSyxDQUFDO1FBR3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFZRCxJQUFJO1FBQ0EsTUFBTSxhQUFhLEdBQUcsSUFBQSxhQUFhLEVBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3RELE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqRSxJQUFJLE1BQU0sRUFBRTtZQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztTQUM5QjtJQUNMLENBQUM7SUFLTSxXQUFXO1FBQ2QsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lB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