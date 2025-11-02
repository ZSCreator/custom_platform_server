'use strict';
import { Application, pinus } from 'pinus';
import up7Room from './up7Room'; //vip场
import BaseRoomManager, { RoomType, constructorParameter } from "../../../common/pojo/baseClass/BaseRoomManager";
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
import up7Const = require('./up7Const');
import RoomManagerDao from "../../../common/dao/daoManager/Room.manager";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import { InteriorGameType } from '../../../common/constant/game/GameTypeEnum';

export interface IsceneMgr {
    nid: string,
    id: number,
    name: string,
    entryCond: number,
    lowBet: number,
    room_count: number,
    tallBet: number,
    ChipList: number[];
}
export class upRoomManger extends TenantRoomManager<up7Room>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: up7Room) {
        room.close();
    }

    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.up7down,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/7up7down').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        room['entryCond'] = sceneInfo.entryCond;
        room['sceneId'] = sceneInfo.id;
        room['tallBet'] = sceneInfo.tallBet;
        room['lowBet'] = sceneInfo.lowBet;
        room['ChipList'] = sceneInfo.ChipList;
        let roomInfo = new up7Room(room);
        roomInfo.gameStart();
        return roomInfo;
    }
}
export default new upRoomManger(GameNidEnum.up7down, InteriorGameType.Br, 'up7down');