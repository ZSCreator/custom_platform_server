import { pinus, ServerInfo } from "pinus";
import { IBaseScene } from "../../interface/IBaseScene";
import * as RedisManager from "../../dao/redis/lib/redisManager";
import { DB1 } from "../../constant/RedisDict";
import { getLogger } from "pinus-logger";
const logger = getLogger("server_out", __filename);
import { pad } from "../../../utils";
import * as ServerMaxNumberPlayersDao from "../../dao/redis/ServerMaxNumberPlayersDao";
import * as ServerCurrentNumbersPlayersDao from "../../dao/redis/ServerCurrentNumbersPlayersDao";
import { GameNidEnum } from "../../constant/game/GameNidEnum";
/** Mysql */
import GameManagerDao from "../../dao/daoManager/Game.manager";
import SceneManagerDao from "../../dao/daoManager/Scene.manager";
import RoomManagerDao from "../../dao/daoManager/Room.manager";
// import SceneManagerDao from "../../dao/daoManager/";
import { SystemRoomBuilder } from "../entity/SystemRoomBuilder";
import { SystemRoomDirector } from "../entity/SystemRoomDirector";


const initializeArrayWithRange = (len: number) =>
  Array.from({ length: len }).map((v, i) => i + 1);

const chunk = (arr: Array<string>, size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
/**
 * 游戏管理器基类
 * @description
 */
export class BaseGameManager<T extends IBaseScene> {
  private serverId: string;
  // private serverList: ServerInfo[];

  /** @property nid 游戏编号 */
  public nid: GameNidEnum;

  /** @property gameName 游戏名称 */
  public gameName: string;

  private roomCount: number;

  private whetherToShowScene: boolean;

  private whetherToShowGamingInfo: boolean;

  private sceneCount: number = 1;

  private roomUserLimit: number = 1;

  private sceneList: Array<T> = [];
  /**游戏分组 */
  private kind: number = 1;

  private setGameInfo(name: string, count: number, whetherToShowScene: boolean, whetherToShowGamingInfo: boolean = false) {
    this.gameName = name;

    this.roomCount = count;

    this.whetherToShowScene = whetherToShowScene;

    this.whetherToShowGamingInfo = whetherToShowGamingInfo;
  }

  public async init() {
    this.serverId = pinus.app.getServerId();
    // this.serverList = pinus.app.get('servers')[pinus.app.getServerType()];

    logger.info(`服务器 ${this.serverId} | 初始化 | 开始`);

    if (typeof this.nid !== "string") {
      logger.error(`服务器 ${this.serverId} | 初始化 | 出错 :传入 nid 异常:${this.nid} `);

      throw new Error(`服务器 ${this.serverId} 初始化场或房间出错,传入 nid 异常:${this.nid} `);
    }

    const gameInfo = await GameManagerDao.findOne({ nid: this.nid }, true);

    /** Step A.5: 初始化 重置在线玩家数 redis */
    await this.resetServerCurrentNumberPlayers();

    /** 是否初始化 */
    if (!gameInfo) {
      // 单个服务器类型，第一序负责信息初始化
      if (this.serverId.split("").reverse()[0] !== "1") {
        return;
      }

      logger.info(`服务器 ${this.serverId} | 初始化 | 检测 表 system_game 信息 | 数据库 Mongodb 和 Redis 未查询到 nid:${this.nid} 信息 | 开始从 json 读取初始信息`);

      /** Step A.1: 初始化 system_game */
      await this._initSystemGame();

      /** Step A.2: 初始化 system_scene */
      logger.info(`服务器 ${this.serverId} | 初始化 | 表 system_scene :${this.nid} 名称:${this.gameName} | 开始 `);

      await this._initSystemScene();

      /** Step A.3: 初始化 system_room */
      // logger.info(`服务器 ${this.serverId} | 初始化 | 表 system_room :${this.nid} 名称:${this.gameName} | 开始 `);
      //
      await this._initSystemRoom();

      /** Step A.4: 初始化 redis - cluster:maxNumberPlayers*/
      await this.initServerMaxNumberPlayers();

      /** Step A.5: 初始化 重置在线玩家数 redis */
      await this.resetServerCurrentNumberPlayers();

      return;
    }

    const {
      name,
      roomCount,
      whetherToShowScene,
      roomUserLimit,
      whetherToShowGamingInfo,
    } = gameInfo;

    this.roomUserLimit = roomUserLimit;

    this.setGameInfo(name, roomCount, whetherToShowScene, whetherToShowGamingInfo);
  }

  private async _initSystemGame() {
    try {
      /** Step 1:创建对应的 system_game 数据库表信息 */
      const gamesJson = require("../../../../config/data/games.json");

      const targetGameJson = gamesJson.find(({ nid }) => nid === this.nid);

      if (!targetGameJson) {
        logger.error(`服务器 ${this.serverId} | 初始化 | 检测 games.json 配置信息 |  未查询到 nid:${this.nid} 配置信息 |system_game 初始化终止`);

        throw new Error(`${this.serverId} games.json 缺少 nid:${this.nid} 的配置信息`);
      }

      /** Step 2:判断是否需要创建场信息 */
      const {
        name,
        roomCount,
        whetherToShowGamingInfo,
        whetherToShowScene,
        roomUserLimit,
      } = await GameManagerDao.insertOne(targetGameJson);

      if (!roomCount || !roomUserLimit) {
        throw new Error(`games.json 游戏nid: ${this.nid} 参数 roomCount 或 roomUserLimit 缺失`);
      }
      this.kind = targetGameJson.kind || 1;
      this.roomUserLimit = roomUserLimit;

      this.setGameInfo(name, roomCount, whetherToShowScene, whetherToShowGamingInfo);

      logger.info(`服务器 ${this.serverId} | 初始化 | 表 system_game :${this.nid} 名称:${this.gameName} | 完成 `);
    } catch (e) {
      logger.error(`gameManager.initSystemGame() 错误: ${e.stack}`);
    }
  }

  private async _initSystemScene() {
    const sceneJsonList = require(`../../../../config/data/scenes/${this.gameName}.json`);

    if (!sceneJsonList) {
      throw new Error(`${this.serverId} 配置文件 config/scenes/${this.gameName}.json 未查询到 ${this.gameName} 场配置信息 | 初始化终止`);
    }

    this.sceneList = sceneJsonList;

    for await (const info of sceneJsonList) {
      const { id: sceneId, ...rest } = info;
      await SceneManagerDao.insertOne({ sceneId, ...rest });
    }

    logger.info(`服务器 ${this.serverId} | 初始化 | 表 system_scene :${this.nid} 名称:${this.gameName} | 完成 `);
  }

  private async _initSystemRoom() {
    // const serverList = this.serverList;

    const sceneList = require(`../../../../config/data/scenes/${this.gameName}.json`);

    // const { length: curServerTypeCount } = serverList;

    this.sceneCount = this.whetherToShowScene ? sceneList.length : 1;

    const maxRoomCount = this.sceneCount * this.roomCount * this.kind;

    if (typeof maxRoomCount !== "number" && maxRoomCount === 0) {
      throw new Error(
        `${this.serverId} 初始化房间出错， 场数量 ${this.sceneCount} | 游戏房间配置数字 roomCount:${this.roomCount} | 总房间数 :${maxRoomCount}`
      );
    }

    /** 生成房间号 */
    const maxRoomList = initializeArrayWithRange(maxRoomCount).map((v) =>
      pad(v, 3)
    );

    /** 根据服务器数截取 */
    const serverRoomList = chunk(maxRoomList, this.sceneCount * this.roomCount);

    /** 当前服务器应取房间数组 */
    for (let idx = 0; idx < this.kind; idx++) {
      const curServerRoomIdList = serverRoomList[idx];

      logger.info(`服务器 ${pinus.app.getServerId()} | 初始化 | 表 system_room :${this.nid} 名称:${this.gameName} | 场数量: ${this.sceneCount} | 房间数: ${this.roomCount} | 需要创建房间总数: ${maxRoomList.length} | 当前服务器:${this.serverId} 承载房间名称: ${curServerRoomIdList.join(" ")}`);

      /** 场应分配的房间数 */
      const curSceneRoomIdList = chunk(curServerRoomIdList, this.roomCount);

      for (let index = 0; index < sceneList.length; index++) {
        // 获取当前场id
        const { id } = sceneList[index];

        // 当前场可分配的房间数
        const roomList = curSceneRoomIdList[index];

        // 开始创建房间
        for (let i = 0; i < roomList.length; i++) {
          const roomId = roomList[i];

          const roomBuilder = new SystemRoomBuilder(this.nid, roomId);

          const roomDirector = new SystemRoomDirector(roomBuilder);

          const roomInstance = roomDirector._getRoom(this.serverId, id);

          roomInstance.createTime = new Date();
          roomInstance["kind"] = idx;
          await RoomManagerDao.insertOne(roomInstance);
        }
      }

      logger.info(`服务器 ${pinus.app.getServerId()} | 初始化 | 表 system_room :${this.nid} 名称:${this.gameName} | 完成 `);

      // idx++;
    }
  }

  private async initServerMaxNumberPlayers() {
    try {
      const maxNumberPlayers = this.sceneCount * this.roomCount * this.roomUserLimit;

      // const serverList = this.serverList;

      // serverList.map(async ({ id }) => {

      await ServerMaxNumberPlayersDao.insertOneByServerId(maxNumberPlayers, this.serverId);
      logger.info(` 初始化 | 表 cluster:maxNumberPlayers : ${maxNumberPlayers} | 完成 `);
      // });
    } catch (e) {
      logger.error(`服务器 ${pinus.app.getServerId()} | 初始化 | 表 cluster:maxNumberPlayers  | 出错: ${e.stack} `);
    }
  }

  /**
   * 重置服务器当前人数
   */
  public async resetServerCurrentNumberPlayers() {
    try {
      // const serverList = this.serverList;

      // serverList.map(async ({ id }) => {
      console.warn(`重置当前服务器人数 ${this.serverId}`);
      await ServerCurrentNumbersPlayersDao.resetByServerId(this.serverId);

      logger.info(`服务器 ${this.serverId} | 重置在线玩家数 | 键 cluster:currentNumberPlayers  | nid:${this.nid} | 完成`);
      // });
    } catch (e) {
      logger.error(`服务器 ${pinus.app.getServerId()} | 重置在线玩家数 | 键 cluster:currentNumberPlayers  | nid:${this.nid} | 出错 :${e.stack}`);
    }
  }
}
