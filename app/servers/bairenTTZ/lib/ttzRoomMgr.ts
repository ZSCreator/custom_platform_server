'use strict'
import { Application, pinus } from "pinus";
import ttzRoom from './ttzRoom';
import BaseRoomManager, { RoomType, constructorParameter } from "../../../common/pojo/baseClass/BaseRoomManager";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import ttz_zhuangConst = require('./ttzConst');
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
    allinMaxNum: number;
    room_count: number;
    upZhuangCond: number;
    roomList?: ttzRoom[];
    ChipList: number[];
}



export class TtzRoomManager extends TenantRoomManager<ttzRoom>{
    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: ttzRoom) {
        room.close();
    }

    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.bairenTTZ,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/bairenTTZ').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;


        room['entryCond'] = sceneInfo.entryCond;
        room['lowBet'] = sceneInfo.lowBet;
        room['ChipList'] = sceneInfo.ChipList;
        room['allinMaxNum'] = sceneInfo.allinMaxNum;
        room['upZhuangCond'] = sceneInfo.upZhuangCond;
        room['sceneId'] = sceneInfo.id;//场id
        room.sceneId = sceneId;
        room.roomId = roomId;
        let roomInfo = new ttzRoom(room);
        roomInfo.runRoom();
        return roomInfo;

    }

}
export default new TtzRoomManager(GameNidEnum.bairenTTZ, InteriorGameType.Br, 'bairenttz');
