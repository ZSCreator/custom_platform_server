'use strict';
import { Application, pinus } from 'pinus';
import sicboRoom from './sicboRoom'; //vip场
import BaseRoomManager, { RoomType, constructorParameter } from "../../../common/pojo/baseClass/BaseRoomManager";
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
import sicboConst = require('./sicboConst');
import RoomManagerDao from "../../../common/dao/daoManager/Room.manager";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { TenantRoomManager } from '../../../common/classes/subclass/tenantRoomManager';
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";

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
export class ScRoomManger extends TenantRoomManager<sicboRoom>{

    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: sicboRoom) {
        room.close();
    }

    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.SicBo,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/SicBo').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        room['entryCond'] = sceneInfo.entryCond;
        room['sceneId'] = sceneInfo.id;
        room['tallBet'] = sceneInfo.tallBet;
        room['lowBet'] = sceneInfo.lowBet;
        room['ChipList'] = sceneInfo.ChipList;
        let roomInfo = new sicboRoom(room);
        roomInfo.run();
        return roomInfo;
    }

}
export default new ScRoomManger(GameNidEnum.SicBo, InteriorGameType.Br, 'SicBo');