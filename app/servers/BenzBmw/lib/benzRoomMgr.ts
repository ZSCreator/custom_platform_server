'use strict'
import { Application, pinus } from "pinus";
import benzRoom from './benzRoom';
import BaseRoomManager, { RoomType, constructorParameter } from "../../../common/pojo/baseClass/BaseRoomManager";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import benzConst = require('./benzConst');
import RoomManagerDao from "../../../common/dao/daoManager/Room.manager";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";

export interface IsceneMgr {
    nid: string;
    id: number;
    name: string;
    entryCond: number;
    /**最低下注要求 */
    lowBet: number;
    // capBet: number;
    room_count: number;
    upZhuangCond: number;
    ChipList: number[];
}



export class benzRoomManger extends TenantRoomManager<benzRoom>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }

    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: benzRoom) {
        room.close();
    }
    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.BenzBmw,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/BenzBmw').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        // room['capBet'] = sceneInfo.capBet;
        room['upZhuangCond'] = sceneInfo.upZhuangCond;
        room['ChipList'] = sceneInfo.ChipList;
        room.sceneId = sceneId;
        room.roomId = roomId;
        let roomInfo = new benzRoom(room);
        roomInfo.runRoom();
        return roomInfo;
    }
}

export default new benzRoomManger(GameNidEnum.BenzBmw, InteriorGameType.Br, 'benzbmv');