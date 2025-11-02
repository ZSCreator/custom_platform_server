'use strict'
import { Application, pinus } from 'pinus';
import RedBlackRoom from './RedBlackRoom';
import { getLogger } from 'pinus-logger';
import BaseRoomManager, { RoomType, constructorParameter } from "../../../common/pojo/baseClass/BaseRoomManager";
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
import JsonMgr = require('../../../../config/data/JsonMgr');
import RoomManagerDao from "../../../common/dao/daoManager/Room.manager";
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import langsrv = require('../../../services/common/langsrv');
import { TenantRoomManager } from '../../../common/classes/subclass/tenantRoomManager';
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import {InteriorGameType} from "../../../common/constant/game/GameTypeEnum";

const LoggerErr = getLogger('server_out', __filename);

export interface IsceneMgr {
    nid: string,
    id: number,
    name: string,
    lowBet: number,
    capBet: number,
    allinMaxNum: number
    room_count: number,
    entryCond: number,
    ChipList: number[];
}
export class RedBlackRoomManger extends TenantRoomManager<RedBlackRoom>{


    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: RedBlackRoom) {
        room.close();
    }


    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.RedBlack,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/RedBlack').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        room['capBet'] = sceneInfo.capBet;
        room['lowBet'] = sceneInfo.lowBet;
        room['ChipList'] = sceneInfo.ChipList;
        room.sceneId = sceneInfo.id;
        const roomInfo = new RedBlackRoom(room);
        roomInfo.run();
        return roomInfo;

    }
}

export default new RedBlackRoomManger(GameNidEnum.RedBlack, InteriorGameType.Br, 'RedBlack');