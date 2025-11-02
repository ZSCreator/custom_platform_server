'use strict';
import { Application, pinus } from "pinus";
import wrjhRoom from './wrjhRoom';
import BaseRoomManager, { RoomType, constructorParameter } from "../../../common/pojo/baseClass/BaseRoomManager";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import WanRenJHConst = require('../../../consts/WanRenJHConst');
import RoomManagerDao from "../../../common/dao/daoManager/Room.manager";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { TenantRoomManager } from "../../../common/classes/subclass/tenantRoomManager";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";

export interface IsceneMgr {
    nid: string;
    id: number;
    name: string
    entryCond?: number
    ShangzhuangMinNum?: number
    lowBet?: number,
    tallBet?: number
    room_count?: number
    compensate?: number
    ChipList: number[];
}

export class WJRoomManger extends TenantRoomManager<wrjhRoom>{

    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: wrjhRoom) {
        room.close();
    }

    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.WanRenJH,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/WanRenJH').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        room['sceneId'] = sceneInfo.id;
        room['entryCond'] = sceneInfo.entryCond;
        room['ShangzhuangMinNum'] = sceneInfo.ShangzhuangMinNum;
        room['lowBet'] = sceneInfo.lowBet;
        room['tallBet'] = sceneInfo.tallBet;
        room['compensate'] = sceneInfo.compensate;
        room['ChipList'] = sceneInfo.ChipList;
        let roomInfo = new wrjhRoom(room);
        roomInfo.runRoom();//运行房间
        return roomInfo;
    }
}

export default new WJRoomManger(GameNidEnum.WanRenJH, InteriorGameType.Br, 'WanRenJH');