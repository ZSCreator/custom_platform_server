'use strict'
import { Application, pinus } from 'pinus';
import dtRoom from './dtRoom';
import { getLogger } from 'pinus-logger';
import BaseRoomManager, { RoomType, constructorParameter } from "../../../common/pojo/baseClass/BaseRoomManager";
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
import * as langsrv from '../../../services/common/langsrv';
import RoomManagerDao from "../../../common/dao/daoManager/Room.manager";
const LoggerErr = getLogger('server_out', __filename);
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { TenantRoomManager } from '../../../common/classes/subclass/tenantRoomManager';
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";

export interface IsceneMgr {
    nid: string,
    id: number,
    name: string,
    lowBet?: number,
    capBet?: number,
    allinMaxNum?: number,
    room_count?: number,
    entryCond?: number,
    roomList?: dtRoom[];
    ChipList: number[];
}

export class DragonTigerRoomMangerImpl extends TenantRoomManager<dtRoom>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: dtRoom) {
        room.close();
    }

    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.DragonTiger,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/DragonTiger').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        room['sceneId'] = sceneInfo.id;
        room['lowBet'] = sceneInfo.lowBet;
        room['capBet'] = sceneInfo.capBet;
        room['ChipList'] = sceneInfo.ChipList;
        const roomInfo = new dtRoom(room);
        roomInfo.runRoom();
        return roomInfo;
    };
}
export default new DragonTigerRoomMangerImpl(GameNidEnum.DragonTiger, InteriorGameType.Br, 'dt');