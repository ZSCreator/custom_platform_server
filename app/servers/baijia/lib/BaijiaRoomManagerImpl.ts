import { Application, pinus } from 'pinus';
import BaiJiaRoomImpl from './BaiJiaRoomImpl';
import BaseRoomManager, { RoomType, constructorParameter } from "../../../common/pojo/baseClass/BaseRoomManager";
import { getLogger } from 'pinus-logger';
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
import baijiaConst = require('./baijiaConst');
import RoomManagerDao from "../../../common/dao/daoManager/Room.manager";
import { TenantRoomManager } from '../../../common/classes/subclass/tenantRoomManager';
import { get as getConfiguration } from "../../../../config/data/JsonMgr";
import { InteriorGameType } from "../../../common/constant/game/GameTypeEnum";
const baijiaErrorLogger = getLogger('server_out', __filename);
/**
 * 百人场 管理中心
 */
export interface IsceneMgr {
    nid: string;
    id: number;
    name: string;
    entryCond?: number;
    /**最低下注要求 */
    lowBet?: number;
    /**顶注 */
    tallBet?: number;
    room_count?: number;
    ShangzhuangMinNum?: number;
    ChipList: number[];
}


export class BaijiaRoomManager extends TenantRoomManager<BaiJiaRoomImpl>{

    constructor(nid: GameNidEnum, type: InteriorGameType, name: string) {
        super(nid, type, name);
    }
    /**
     * 停下房间
     * @param room
     */
    stopTheRoom(room: BaiJiaRoomImpl) {
        room.close();
    }


    //实例化房间
    createRoom(sceneId: number | string, roomId: string) {
        const room = {
            roomId,
            sceneId,
            nid: GameNidEnum.baijia,
            serverId: pinus.app.getServerId(),
        }
        const sceneInfo: IsceneMgr = getConfiguration('scenes/baijia').datas.find(scene => scene.id === sceneId);
        const { baseChannel } = this.genChannel(sceneId, roomId);
        room['channel'] = baseChannel;

        room['entryCond'] = sceneInfo.entryCond;
        room['sceneId'] = sceneInfo.id;
        room['tallBet'] = sceneInfo.tallBet;
        room['lowBet'] = sceneInfo.lowBet;
        room['ShangzhuangMinNum'] = sceneInfo.ShangzhuangMinNum;
        /**欢乐百人和/对限红 */
        room['twainUpperLimit'] = sceneInfo.tallBet * baijiaConst.BET_XIANZHI2;
        /**欢乐百人大小/庄闲限红 */
        room['betUpperLimit'] = sceneInfo.tallBet * baijiaConst.BET_XIANZHI;
        room['ChipList'] = sceneInfo.ChipList;
        let roomInfo = new BaiJiaRoomImpl(room);
        roomInfo.run();//运行房间
        return roomInfo;
    }
}
export default new BaijiaRoomManager(GameNidEnum.baijia, InteriorGameType.Br, 'baijia');