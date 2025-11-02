import { Application, pinus, Channel } from 'pinus';
import { get as getJsonConfig } from "../../../../config/data/JsonMgr";
import { PlayerInfo } from "../entity/PlayerInfo";
import { SystemRoom } from "../entity/SystemRoom";
import { PositionEnum } from '../../constant/player/PositionEnum';
import { RoleEnum } from "../../constant/player/RoleEnum";
import utils = require('../../../utils');
/** Mysql */
import PlayerManagerDao from "../../dao/daoManager/Player.manager";
import RoomManagerDao from "../../dao/daoManager/Room.manager";
/** new Redis */
import PlayersInRoomDao from "../../dao/redis/PlayersInRoom.redis.dao";
import SceneManager from "../../dao/daoManager/Scene.manager";

/**
 * 泛型基本属性
 * @property id 场 序号(唯一)
 * @property nid 游戏编号
 * @property name 游戏名称
 */
export interface base {
  id: number;
  nid: string;
  name: string;
  roomList?: SystemRoom<PlayerInfo>[];
  /**对战类等待匹配队列 */
  wait_queue?: PlayerInfo[];
}

/**
 * 房间类型
 */
export enum RoomType {
  /**对战 */
  battle,
  /**百人 电玩游戏统一为百人游戏 */
  Br
}

/**
 * 构造函数传参属性
 * @property configDataPath 可选参数;项目根目录下 相对 config/data 的路径位置;如 'scenes/redPacket'。有此参数则会 new 操作时自动获取配置，否则需手动 initScene()。
 * @property type 类型 百人还是对战 电玩游戏统一为百人游戏
 */
export interface constructorParameter {
  nid: string,
  configDataPath?: string
  type: RoomType
}



/**
 * 游戏管理工具基类
 * @property sceneList 该游戏的各"场"信息集合
 * @function initScene 初始化游戏"场"信息；同时添加 roomList<T> 属性;
 * @function get_sceneInfo  获取某"场"信息
 */
export default abstract class BaseRoomManager<T extends base> {
  nid: string;
  protected sceneList: Array<T> = [];
  roomUserLimit: number = 0;
  type: RoomType;
  /**
   * @constructor
   * @param {object} parameter
   */
  constructor(parameter: constructorParameter) {
    this.nid = parameter.nid;
    this.type = parameter.type;

    if (parameter['configDataPath']) {
      this.initSceneList(parameter['configDataPath']);
    }
  }

  initSceneList(configDataPath: string) {
    this.sceneList = getJsonConfig(configDataPath).datas.map((sceneInfo: T) => {
      sceneInfo.roomList = [];
      sceneInfo.wait_queue = [];
      return sceneInfo;
    });

    const gamesJson = require("../../../../config/data/games.json");

    const targetGameJson = gamesJson.find(({ nid }) => nid === this.nid);
    this.roomUserLimit = targetGameJson.roomUserLimit;
  }

  abstract createRoom(app: Application, sceneId: number, roomId: string)
  abstract searchAndEntryRoom(app: Application, sceneId: number, roomId: string, dbplayer: any);

  public get_sceneList() {
    return this.sceneList;
  }
  public getRoomList() {
    let roomList: SystemRoom<PlayerInfo>[] = [];
    let sceneList = this.sceneList;
    for (const sceneInfo of sceneList) {
      for (const roomInfo of sceneInfo.roomList) {
        roomList.push(roomInfo);
      }
    }
    roomList = roomList.sort((a, b) => parseInt(a.roomId) - parseInt(b.roomId));
    return roomList;
  }
  /**
   * 获取场信息
   * @param sceneId
   * @return Array<T>
   */
  public get_sceneInfo(sceneId: number): T {
    return this.sceneList.find((sceneInfo: T) => sceneInfo.id === sceneId);
  }

  /**检测房间信息 */
  public detectionAllRoom(uid: string, sceneId: number, roomId: string) {
    for (const sceneInfo of this.sceneList) {
      for (const roomInfo of sceneInfo.roomList) {
        if (roomInfo.channel && roomInfo.channel.getMembers().includes(uid)) {
          roomInfo.kickOutMessage(uid);
        }
      }
    }
  }

  /**
   * 用于服务启动后，加载房间信息
   * @param app
   */
  public async initAfterServerStart(app: Application) {
    /**  Step 1.1:获取此游戏所有场是否正确 */
    const sceneListInRedis = await SceneManager.findList({ nid: this.nid }, true);
    if (sceneListInRedis.length !== this.get_sceneList().length) {
      console.warn(`游戏场: ${this.nid} 未初始化成功`);
      return;
    }

    /**  Step 1.2:获取此游戏所有房间是否正确  */
    let roomList = await RoomManagerDao.findList({ serverId: pinus.app.getServerId() }, true);

    if (!roomList.length) {
      console.warn(`游戏房间: ${this.nid} 未初始化成功`);
      return;
    }

    for (const sceneInfo of this.get_sceneList()) {
      /** Step 2:过滤出相同场的房间 */
      const roomListWithSameSceneId = roomList.filter((room) => room.sceneId === sceneInfo.id);

      /** Step 3:添加进 secen.roomList */
      for (const room of roomListWithSameSceneId) {
        await PlayersInRoomDao.deleteAll(room.serverId, room.roomId);
        await this.createRoom(app, sceneInfo.id, room.roomId);
      }
    };

  }

  /**停止服务器之前操作 */
  public async beforeShutdown() {
    for (const sceneInfo of this.sceneList) {
      for (const roomInfo of sceneInfo.roomList) {
        for (const pl of roomInfo.players) {

          const p = await PlayerManagerDao.findOne({ uid: pl.uid });
          if (!p) {
            continue;
          }

          await PlayerManagerDao.updateOne({ uid: pl.uid }, {
            position: PositionEnum.HALL,
            abnormalOffline: false,
            kickedOutRoom: true
          })
        }
      }
    }
  }


  /** 从服务器缓存里面获取可用的房间号
   * 获取可用的房间编号
   * @param nid     游戏id
   * @param sceneId 场id
   * @param roomId  不存在则寻找,否则验证
   * @param roomUserLimit 房间用户限制数
   * @param player 玩家信息
   */
  public getUseableRoomForRemote(sceneId: number, roomId: string, player: PlayerInfo): string {
    try {
      let sceneInfo = this.get_sceneInfo(sceneId);
      let roomList = sceneInfo.roomList;
      roomList = [];

      for (const system_room of sceneInfo.roomList) {
        // 允许进入的房间
        if (this.type == RoomType.Br) {
          if (this.canPlayerEnterRoom(this.nid, system_room, this.roomUserLimit, player)) {
            roomList.push(system_room);
          }
        } else if (this.type == RoomType.battle) {
          // 允许进入的房间
          if (system_room.getPlayer(player.uid)) {
            return system_room.roomId;
          }
          let ret1 = this.canPlayerEnterRoom(this.nid, system_room, this.roomUserLimit, player);
          let ret2 = system_room['status'] == "INWAIT";
          if (ret1 && ret2) {
            roomList.push(system_room);
          }
        }
      }

      if (roomList.length != 0) {
        /**优先返回传入的房间号 */
        if (!!roomId && roomList.find(c => c.roomId == roomId)) {
          return roomId;
        }
        /**真实玩家 */
        const hasRealplRoomList = roomList.filter(m => m.players.find(p => !!p && p.isRobot !== 2));
        if (hasRealplRoomList.length != 0) {
          //注释留着 别删
          // hasRealplRoomList.sort((a, b) => {
          //     let a_ = a.users.filter(m => m.isRobot !== 2).length;
          //     let b_ = b.users.filter(m => m.isRobot !== 2).length;
          //     //如果真实玩家人数相等，按照总人数排序
          //     if (a_ === b_) {
          //         a_ = a.users.length;
          //         b_ = b.users.length;
          //     }
          //     return b_ - a_;
          // });
          let randomIndex = utils.random(0, hasRealplRoomList.length - 1);
          return hasRealplRoomList[randomIndex].roomId;
        }
        /**不空的房间 */
        let hasRobotRoomList = roomList.filter(m => m.players.find(p => !!p));
        if (hasRobotRoomList.length != 0) {
          let randomIndex = utils.random(0, hasRobotRoomList.length - 1);
          return hasRobotRoomList[randomIndex].roomId;
        }
        /**其他 */
        let randomIndex = utils.random(0, roomList.length - 1);
        return roomList[randomIndex].roomId;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  /**对战类游戏 匹配 */
  public match_and_reconnection(sceneId: number, roomId: string, dbplayer: PlayerInfo) {
    let sceneInfo = this.get_sceneInfo(sceneId);
    for (const system_room of sceneInfo.roomList) {
      if (system_room.players.find(pl => pl && pl.uid == dbplayer.uid)) {
        return system_room.roomId;
      }
    }
    if (!sceneInfo.wait_queue.find(c => c.uid == dbplayer.uid)) {
      sceneInfo.wait_queue.push(dbplayer);
    }
    return null;
  }

  /**
   * 判断玩家是否能够进入该房间：能进入房间返回null，不能进入房间返回不能进的提示
   * ignoreClosed 为 true 表示不检查房间是否关闭，为 false 表示需要检查
   * 返回值：如果可以进入，返回 Null；否则返回不能进入的理由
   * */
  public canPlayerEnterRoom(nid: string, room: SystemRoom<any>, roomUserLimit: number, player) {
    // 是不是已经在房间里了 掉线的人，重连时未从房间剔除，可以重进
    if (room.getPlayer(player.uid)) {
      return true;
    }
    //不同租戶不可以进入同一个房间
    if (player.isRobot == RoleEnum.REAL_PLAYER && this.type == RoomType.battle) {
      if (room.players.some(c => c && c.isRobot == 0 &&
        (c.groupRemark != player.groupRemark || c.group_id != player.group_id))) {
        return false;
      }
    }

    // 房间人数满了的不能进入
    if (room.isFull()) {
      return false;
    }

    // 机器人不限制IP 或者 是百人游戏房间 不限制IP
    if (player.isRobot === RoleEnum.ROBOT || this.type === RoomType.Br) {
      return true;
    }

    // 是否同IP不能进入同一个房间
    let ipSwitch = getJsonConfig('ipSwitch').datas.find(m => m.id === nid);
    const isRestrictIP = ipSwitch && ipSwitch.open;

    // 如果开启了未开启ip限制 直接返回可以进入
    if (!isRestrictIP) {
      return true;
    }

    // 是否有非机器人、同IP的人、非自己（断线重连时自己还在房间中）在房间里面
    // 开了IP限制、且房间里有同IP的玩家、且不是自己、且不是机器人，不能再进
    return !(room.players.some(user => {
      return !!user && user.isRobot !== RoleEnum.ROBOT && user.ip === player.ip && user.uid !== player.uid;
    }));
  };


}
