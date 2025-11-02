import {
    IBaseManagerInfo,
    IBaseRoomManagerConstructorParameter,
    IRoomManagerCreateRoomInfo,
    ITimerPool
} from "./interface";
import { pinus, Logger } from "pinus";
import { getLogger } from "pinus-logger";
import { GameNidEnum } from "../../../constant/game/GameNidEnum";
import { PlayerInfo } from "../../entity/PlayerInfo";
import { SystemRoom } from "../../entity/SystemRoom";
import { pad, remove } from "../../../../utils";
import { GameRoomBuilder } from "./GameRoomBuilder";
import { GameRoomDirector } from "./GameRoomDirector";
import { IPlatformIsolationPool } from "./interface/IPlatformIsolationPool";
import { RoleEnum } from "../../../constant/player/RoleEnum";
import { random } from "../../../../utils";
import { BlackJackPlayerRoleEnum } from "../../../../servers/BlackJack/lib/enum/BlackJackPlayerRoleEnum";
import GameManagerDao from "../../../dao/daoManager/Game.manager";
import SceneManagerDao from "../../../dao/daoManager/Scene.manager";
import IsolationRoomPoolRedisDao from "../../../dao/redis/IsolationRoomPool.redis.dao";
import ShareTenantRoomSituationRedisDao from "../../../dao/redis/ShareTenantRoomSituation.redis.dao";

const initializeArrayWithRange = (len: number) =>
    Array.from({ length: len }).map((v, i) => i + 1);

/**
 * @name 指定每组大小进行分组
 * @param arr 目标数组
 * @param size 指定每组大小
 * @returns 
 */
const chunk = (arr: Array<string>, size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );

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
 * @name 房间管理器
 * @description 内部调用: 基础属性和函数
 */
class BaseDynamicRoomMnager<T extends IBaseManagerInfo, K extends SystemRoom<L>, L extends PlayerInfo> {

    protected serverId: string = null;

    /** 基础信息 Start */

    /** @property 游戏编号 */
    protected nid: GameNidEnum = null;

    /** @property 游戏名称 */
    protected gameName: string = null;

    /** @property 房间限制人数 */
    protected roomUserLimit: number = 0

    /** @property 当前实际生成房间组数 */
    private currentRoomKind: number = 0; // 1组 = 单场 * 房间数 

    /** 基础信息  End  */

    /** @property 游戏房间所属游戏玩法类型 */
    protected type: RoomType = null;

    /** @property 场配置信息地址 */
    protected configDataPath: string = null;

    /** @property 是否初始化 */
    protected hasBeenInitializ: boolean = false;

    protected sceneList: Array<T> = [];

    /** 核心业务部分 Start */
    protected createRoomCoreInfo: IRoomManagerCreateRoomInfo;

    protected roomPool: Array<Array<K>> = [[]];

    /** 核心业务部分  End  */

    public logger: Logger = getLogger("server_out", __filename);

    protected _logger(msg: string, logLever: string = "info") {
        if (pinus.app.get("env") === "development") {
            this.logger[logLever](msg);
        }
    }

    constructor(parameter: IBaseRoomManagerConstructorParameter) {
        const { nid, type } = parameter;
        this.nid = nid;
        this.type = type;
        this.serverId = pinus.app.getServerId();
        this.roomPool = [[]];
    }

    /**
     * @name 初始化调度函数
     */
    public async init() {
        if (this.hasBeenInitializ) {
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 初始化 | 已重复并终止`)
            return;
        }
        await this.initGameInfo();
        await this.initSceneList();
        // this.initRoomList();
        this.hasBeenInitializ = true;

        this._logger(`动态房间管理 | 游戏 ${this.nid} | 初始化 | 完成`);
        return this;
    }

    /**
     * @name 初始化游戏配置信息
     */
    private async initGameInfo() {
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 游戏配置信息 | 初始化`);
        const gamesJson = require("../../../../../config/data/games.json");
        const {
            roomUserLimit,
            name,
            roomCount,
            whetherToShowScene
        } = gamesJson.find(({ nid }) => nid === this.nid);

        this.gameName = name;

        this.roomUserLimit = roomUserLimit;

        /** 首次生成房间必要信息 */
        this.createRoomCoreInfo = {
            whetherToShowScene,
            sceneCount: 0,
            roomCount
        }

        /** 查询数据库是否存在，不存咋就插入到数据库当中*/
        const gameInfo = await GameManagerDao.findOne({ nid: this.nid }, true);
        if (!gameInfo) {
            const targetGameJson = gamesJson.find(({ nid }) => nid === this.nid);
            await GameManagerDao.insertOne(targetGameJson);
        }
    }

    /**
     * @name 初始化场信息
     */
    private async initSceneList() {
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 场配置信息 | 初始化 `);
        const sceneList = require(`../../../../../config/data/scenes/${this.gameName}.json`);
        this.sceneList = sceneList.map((sceneInfo: T) => {
            sceneInfo.roomList = [];
            sceneInfo.wait_queue = [];
            return sceneInfo;
        });

        this.createRoomCoreInfo.sceneCount = this.createRoomCoreInfo.whetherToShowScene ? this.sceneList.length : 1;

        /** 查询数据库是否存在，不存咋就插入到数据库当中*/
        const mysqlSceneList = await SceneManagerDao.findList({ nid: this.nid }, true);
        if (mysqlSceneList.length == 0 || mysqlSceneList.length !== sceneList.length) {
            for await (const info of sceneList) {
                const { id: sceneId, ...rest } = info;
                //现删除所有该游戏在数据库中的场配置
                await SceneManagerDao.delete({ nid: this.nid, sceneId: sceneId })
                await SceneManagerDao.insertOne({ sceneId, ...rest });
            }
        }

    }

    /**
     * @name 初始化游戏房间相关信息
     */
    /* private initRoomList() {

        this._logger(`动态房间管理 | 游戏 ${this.nid} | 预生成在线房间 | 场数量: ${this.createRoomCoreInfo.sceneCount} | 单场房间数量: ${this.createRoomCoreInfo.roomCount} | 初始化`)

        const { sceneCount, roomCount } = this.createRoomCoreInfo

        // 房间总数
        const maxRoomCount = sceneCount * roomCount;

        // 生成房间号
        const roomIdList = initializeArrayWithRange(maxRoomCount).map((v): string =>
            pad(v, 3)
        );

        const serverRoomList = chunk(roomIdList, sceneCount * roomCount);


        for (let idx = 0; idx < 1; idx++) {

            // 场应分配的房间数
            const curServerRoomIdList = serverRoomList[idx];

            const curSceneRoomIdList = chunk(curServerRoomIdList, roomCount);

            for (let index = 0; index < this.sceneList.length; index++) {
                this.currentRoomKind++;
                // 获取当前场id
                const { id } = this.sceneList[index];

                // 当前场可分配的房间数
                const roomList = curSceneRoomIdList[index];

                // 开始创建房间
                for (let i = 0; i < roomList.length; i++) {
                    const roomId = roomList[i];

                    const roomInfo = this.createRoomInfo(roomId, id);

                    this.addRoomInfoInRoomPool(roomInfo);
                }
            }

        }

        this._logger(`动态房间管理 | 游戏 ${this.nid} | 预生成在线房间 | 合计: ${maxRoomCount} 房间数 | sceneCount( ${sceneCount} ) * roomCount( ${roomCount} ) `)
    } */

    /**
     * @name 创建房间信息
     * @param roomId 房间编号
     * @param sceneId 场编号
     * @returns 
     */
    private createRoomInfo(roomId: string, sceneId: number) {
        const { nid, gameName, roomUserLimit } = this;

        const roomBuilder = new GameRoomBuilder(nid, roomId);

        const roomDirector = new GameRoomDirector(roomBuilder);

        const roomBaseInfo = roomDirector.getRoomInstance({ gameName, sceneId, roomUserLimit }, this.sceneList[sceneId]);

        return roomBaseInfo;
    }

    /**
     * @name 添加房间信息进指定房间集合
     * @param roomInfo 房间信息
     * @param targetIdx 指定房间集合下标
     */
    private addRoomInfoInRoomPool(roomInfo: K, targetIdx: number = -1) {
        if (targetIdx >= 0) {
            this.roomPool[targetIdx].push(roomInfo);
            return;
        }

        const kindIdxOfRoomLength = this.roomPool.length;

        const totalRoomCountForRoomList = this.createRoomCoreInfo.roomCount * this.sceneList.length;

        // 最新的kind房间组满足了房间数 roomCount 则新增空kind数组
        if (this.roomPool[kindIdxOfRoomLength - 1].length === totalRoomCountForRoomList) {
            this.roomPool.push([]);
            this.roomPool[kindIdxOfRoomLength].push(roomInfo);
        }

        if (this.roomPool[kindIdxOfRoomLength - 1].length < totalRoomCountForRoomList) {
            this.roomPool[kindIdxOfRoomLength - 1].push(roomInfo);
        }

    }

    /**
     * @name 获取当前房间总数
     * @returns {number} 
     */
    protected totalNumberRooms() {

        const totalNumber = this.roomPool.reduce((num, roomList) => {
            num += roomList.length
            return num;
        }, 0);

        return totalNumber;
    }

    /**
     * @name 动态增加指定场的房间
     * @returns {Array<string>} 新生成的房间集合
     */
    protected dynamicIncreaseRoom() {
        this.currentRoomKind++;

        this._logger(`动态房间管理 | 游戏 ${this.nid} | 动态增加房间 | 场数量: ${this.createRoomCoreInfo.sceneCount} |  单场房间数量: ${this.createRoomCoreInfo.roomCount}`)

        // 当前房间总数 
        const totalNumber = this.totalNumberRooms();

        this._logger(`动态房间管理 | 游戏 ${this.nid} | 动态增加房间 | 场数量: ${this.createRoomCoreInfo.sceneCount} |  单场房间数量: ${this.createRoomCoreInfo.roomCount} | 当前房间数: ${totalNumber}`)


        // 准备生成的房间数
        const {
            sceneCount,
            roomCount
        } = this.createRoomCoreInfo


        const createRoomCount = sceneCount * roomCount;

        /** 生成房间号 */
        let beginRoomId = 0;

        let notHadRoomInfoForRoomListIdx = this.roomPool.findIndex(roomList => roomList.length === 0);

        if (notHadRoomInfoForRoomListIdx >= 0) {
            // 若有空房间组，则递补进对应组的房间号
            beginRoomId = createRoomCount * notHadRoomInfoForRoomListIdx;
        } else {
            // 默认累增
            beginRoomId = totalNumber;
        }

        const roomIdList = initializeArrayWithRange(createRoomCount)
            .map((v): string =>
                pad(v + beginRoomId, 3)
            );

        const curSceneRoomIdList = chunk(roomIdList, roomCount);

        for (let index = 0; index < this.sceneList.length; index++) {
            this.currentRoomKind++;

            const { id } = this.sceneList[index];

            const roomList = curSceneRoomIdList[index];

            // 开始创建房间
            for (let i = 0; i < roomList.length; i++) {
                const roomId = roomList[i];

                const roomInfo = this.createRoomInfo(roomId, id);

                this.addRoomInfoInRoomPool(roomInfo, notHadRoomInfoForRoomListIdx);

                roomInfo.robotRunning = true;
                // roomInfo.robotManager.addRobot();
            }
        }

        this._logger(`动态房间管理 | 游戏 ${this.nid} | 动态增加房间 | 场数量: ${this.createRoomCoreInfo.sceneCount} | 单场房间数量: ${this.createRoomCoreInfo.roomCount} | 完成 |当前房间数: ${this.totalNumberRooms()}`)

        return roomIdList;
    }

    /**
     * @name 获取指定房间信息
     * @param sceneId 场编号 
     * @param roomId  房间编号
     * @returns {K}
     */
    public getRoomInfo(roomId: string) {
        const idx = this.getRoomKindIdxFromRoomPool(roomId);

        if (idx === null) {
            return idx;
        }

        const roomList = this.roomPool[idx];

        const room = roomList.find(({ roomId: rid }) => rid === roomId);

        return room;
    }
    /**
         * @name 获取所有房间列表
         * @returns {Array<K>}
         */
    getRoomInfoList() {
        return this.roomPool.reduce((list, roomList) => {
            list.push(...roomList);
            return list
        }, []);
    }

    /**
     * @name 获取指定房间号所在RoomPool里指定场具体的下标位置
     * @param roomId  房间编号
     * @returns {number} roomPoolIdx 所处房间下标
     */
    protected getRoomKindIdxFromRoomPool(roomId: string) {
        const roomTwoList = this.roomPool;
        let roomPoolIdx = null;

        for (let kIdx = 0; kIdx < roomTwoList.length; kIdx++) {
            const roomList = roomTwoList[kIdx];
            const roomInfo = roomList.find(info => info.roomId === roomId);
            if (!!roomInfo) {
                roomPoolIdx = kIdx;
                break;
            }
        }

        if (roomPoolIdx === null) {
            return roomPoolIdx;
        }

        if (roomPoolIdx < 0) {
            throw new Error(`获取指定房间号所在RoomPool里指定场具体的下标位置 | 游戏 ${this.nid} 未查询到房间号 ${roomId} `);
        }

        return roomPoolIdx;
    }
}

/**
 * @name 房间管理器基类
 * @description 外部调用: 业务属性和函数；
 */
export class IDynamicRoomManager<T extends IBaseManagerInfo, K extends SystemRoom<L>, L extends PlayerInfo> extends BaseDynamicRoomMnager<T, K, L> {

    private isolationPool: IPlatformIsolationPool = {};

    /** @property 房间销毁耗时: 默认 30秒 */
    private desestroyTime: number = 30e3;

    private timerPool: ITimerPool = {};

    constructor(parameter: IBaseRoomManagerConstructorParameter) {
        super(parameter);
        const { configDataPath } = parameter;
        !!configDataPath && (this.configDataPath = configDataPath);
    }

    /**
     * @name 返回指定场信息
     * @param sceneId 场编号
     * @returns T
     */
    public getSceneInfo(sceneId: number): T {
        return this.sceneList.find((sceneInfo: T) => sceneInfo.id === sceneId);
    }

    /** 核心功能: 大厅选场逻辑获取房间列表 Start */

    /**
     * @name 为当前玩家选择可选的房间列表
     * @param rootUid   平台编号
     * @param parantUid 代理编号
     */
    public getRoomListByPlayerInfo(rootUid: string, parantUid: string) {
        rootUid = !!rootUid ? rootUid : "-1";

        parantUid = !!parantUid ? parantUid : "-1";

        let result: any = [];

        this.beRoomAvailableInIsolationPool(rootUid, parantUid);

        const roomListIdxList = this.isolationPool[rootUid][parantUid];

        const lastIdx = roomListIdxList.length - 1;

        const roomListIdx = this.isolationPool[rootUid][parantUid][lastIdx]

        for (let i = 0; i < this.roomPool[roomListIdx].length; i++) {
            const {
                roomId,
                sceneId
            } = this.roomPool[roomListIdx][i];

            result.push({
                roomId,
                sceneId
            });
        }

        return result;
    }

    /** 核心功能: 大厅选场逻辑获取房间列表  End */

    /** 核心块 - 获取房间号 Start */

    /**
     * @name 获取符合规则、条件的房间
     * @param sceneId 场编号
     * @param roomId  房间编号
     * @param player  玩家信息
     * @returns {string} roomId 房间编号
     */
    public searchAndEntryRoom(sceneId: number, roomId: string, player: L) {
        try {
            if (player.isRobot === RoleEnum.ROBOT) {
                const roomInfo = this.getRoomInfo(roomId);
                let status = false;
                if (roomInfo) {
                    status = roomInfo.addPlayerInRoom(player);
                }
                return { status, roomInfo };
            }

            roomId = this.filterConditionalRoom(sceneId, roomId, player);
            const roomInfo = this.getRoomInfo(roomId);
            let status = false;
            if (roomInfo) {
                if (roomInfo.canBeDestroy) {
                    roomInfo.canBeDestroy = false;
                }
                status = roomInfo.addPlayerInRoom(player);
            }
            return { status, roomInfo };
        } catch (error) {
            return { error };
        }
    }

    /**
     * @name 筛选符合条件的房间编号
     * @param sceneId 场编号
     * @param roomId 房间编号
     * @param player 玩家信息
     * @return {string} roomId
     */
    private filterConditionalRoom(sceneId: number, roomId: string, player: L) {
        /** Step 1: 根据游戏类型、房间规则和平台租户隔离集合里房间占用情况，过滤出可用房间 */
        const {
            // 平台编号
            group_id: rootUid,
            // 代理编号
            lineCode: parantUid
        } = player;

        /** Step 2: 平台、租户隔离功能和旧有房间规则判断 */
        this.beRoomAvailableInIsolationPool(rootUid, parantUid);

        /** 可选房间集合 */
        const roomList = [];

        const list = this.getRoomList(rootUid, parantUid);

        list.filter(room => room.sceneId === sceneId)
            .forEach(room => {
                const subRoomList = this.subFileterConditionalRoom(room, player);
                roomList.push(...subRoomList);
            });


        /** Step 3: 可用房间集合大于0 */
        if (roomList.length > 0) {

            /** Step 3.1: 优先返回传入的房间号 */
            if (!!roomId && roomList.find(({ roomId: rid }) => rid == roomId)) {
                return roomId;
            }

            /** 不空的房间 */
            const hasRobotRoomList = roomList.filter(m => m.players.find(p => !!p));
            if (hasRobotRoomList.length != 0) {
                let randomIndex = random(0, hasRobotRoomList.length - 1);
                return hasRobotRoomList[randomIndex].roomId;
            }

            /** 其他 */
            let randomIndex = random(0, roomList.length - 1);
            return roomList[randomIndex].roomId;
        }

        /** Step 4: 无可用房间 */
        if (roomList.length === 0) {
            this._logger(`房间动态管理类 | 无可用房间 | 新增房间组 `);
            this.dynamicIncreaseRoom();
            this.updateTenantRoomSituation();
            this.addRoomListIdxInRoomPool(rootUid, parantUid);
            const idx = this.roomPool.length - 1;
            const roomIdList = this.roomPool[idx]
                .filter(room => room.sceneId === sceneId)
                .map(room => room.roomId);
            return roomIdList[random(0, roomList.length - 1)];
        }

        throw new Error(`房间动态管理类 | 未查询到可用的房间号`);

        return null;
    }

    /**
     * @name 过滤可用房间
     * @param roomInfo 房间信息
     * @param player 玩家信息
     * @returns {Array<K>}可选房间集合
     * @description 原 getUseableRoomForRemote 函数的过滤核心逻辑
     */
    private subFileterConditionalRoom(roomInfo: K, player: L,): Array<K> {
        const subRoomList = [];

        if (
            this.type === RoomType.Br &&
            this.checkRoomRulesForPlayer(roomInfo, player)
        ) {

            subRoomList.push(roomInfo);

        } else if (this.type === RoomType.battle) {

            if (!!roomInfo.getPlayer(player.uid)) {
                subRoomList.push(roomInfo);
            }

            const condition1 = this.checkRoomRulesForPlayer(roomInfo, player);
            const condition2 = roomInfo['status'] === "INWAIT";

            if (condition1 && condition2) {
                subRoomList.push(roomInfo)
            }

        }
        return subRoomList;
    }

    /**
     * @name 校验玩家是否符合进入房间的规则
     * @param roomInfo 房间信息
     * @param player   玩家信息
     * @returns {boolean} true 进 | false 拒绝
     */
    private checkRoomRulesForPlayer(roomInfo: K, player: L) {
        // 重连直接进入
        if (roomInfo.getPlayer(player.uid)) {
            return true;
        }

        // 特殊: buyu跳过此逻辑
        if (!["6"].includes(this.nid)) {
            if (player.isRobot === RoleEnum.REAL_PLAYER && this.type == RoomType.battle) {
                if (roomInfo.players.some(c => !!c && c.isRobot == 0 && c.uid !== player.uid)) {
                    return false;
                }
            }
        }

        // 房间人数是否满了
        if (roomInfo.isFull()) {
            return false;
        }

        /** IP地址相关校验 */
        const ipSwitch = require("../../../../../config/data/ipSwitch.json");
        const isRestrictIP = ipSwitch && ipSwitch.open;

        // 未开启ip限制 直接返回可以进入
        if (!isRestrictIP) {
            return true;
        }

        // 是否有非机器人、同IP的人、非自己（断线重连时自己还在房间中）在房间里面
        // 开了IP限制、且房间里有同IP的玩家、且不是自己、且不是机器人，不能再进
        return !(roomInfo.players.some(user => {
            return !!user && user.isRobot !== RoleEnum.ROBOT && user.ip === player.ip && user.uid !== player.uid;
        }));

    }

    /** 核心块 - 获取房间号  End  */

    /**
     * @name 获取指定平台代理拥有的房间号列表
     * @param rootUid 平台uid
     * @param parantUid 代理uid
     * @returns 
     */
    private getRoomList(rootUid: string, parantUid: string) {

        rootUid = !!rootUid ? rootUid : "-1";

        parantUid = !!parantUid ? parantUid : "-1";

        if (!rootUid || rootUid === "") {
            const idxList = this.isolationPool["-1"]["-1"];
            return idxList.reduce((list, roomListIdx) => {
                this.roomPool[roomListIdx].map(roomInfo => {
                    list.push(roomInfo);
                })
                return list;
            }, []);
        }

        const idxList = this.isolationPool[rootUid][parantUid];
        return idxList.reduce((list, roomListIdx) => {
            this.roomPool[roomListIdx].map(roomInfo => {
                list.push(roomInfo);
            })
            return list;
        }, []);
    }

    /**
     * @name 指定代理是否有占用
     * @param rootUid   平台编号
     * @param parantUid 代理编号
     * @returns {boolean} true 可进|false 不可
     */
    public beRoomAvailableInIsolationPool(rootUid: string, parantUid: string) {
        rootUid = !!rootUid ? rootUid : "-1";

        parantUid = !!parantUid ? parantUid : "-1";

        // 无平台
        if (!rootUid || rootUid === "") {

            const flag = !!this.isolationPool["-1"] || !!this.isolationPool["-1"]["-1"];

            if (flag) {
                if (this.isolationPool["-1"]["-1"].length === 0) {

                    this.dynamicIncreaseRoom();
                    this.updateTenantRoomSituation();
                    this.addRoomListIdxInRoomPool("-1", "-1");
                }
            }

            return true;
        }

        // 有平台
        if (!this.isolationPool[rootUid] || !this.isolationPool[rootUid][parantUid]) {
            this.dynamicIncreaseRoom();
            this.updateTenantRoomSituation();
            this.addRoomListIdxInRoomPool(rootUid, parantUid);
            return true;
        }

        // 有但被销毁过
        if (this.isolationPool[rootUid][parantUid].length === 0) {
            let notHadRoomInfoForRoomListIdx = this.roomPool.findIndex(roomList => roomList.length === 0);
            this.dynamicIncreaseRoom();
            this.updateTenantRoomSituation();
            this.addRoomListIdxInRoomPool(rootUid, parantUid, notHadRoomInfoForRoomListIdx);
        }

        return true;
    }

    private addRoomListIdxInRoomPool(rootUid: string, parantUid: string, roomListIdx: number = -1) {

        if (!this.isolationPool[rootUid]) {
            this.isolationPool[rootUid] = {};
        }

        if (!this.isolationPool[rootUid][parantUid]) {
            this.isolationPool[rootUid][parantUid] = []
        }

        if (roomListIdx < 0) {
            const roomListIdx = this.roomPool.length - 1;

            this.isolationPool[rootUid][parantUid].push(roomListIdx);
        } else {
            this.isolationPool[rootUid][parantUid].push(roomListIdx);
        }
    }

    /**
     * @name 玩家进入指定平台代理
     * @param rootUid   平台编号
     * @param parantUid 代理编号
     * @description 玩家进入房间时调用: RPC进入游戏房间
     */
    public async entryRoomInIsolationPool(rootUid: string, parantUid: string, roomId: string) {

        rootUid = !!rootUid ? rootUid : "-1";

        parantUid = !!parantUid ? parantUid : "-1";

        const playerNum = await IsolationRoomPoolRedisDao.findOneByRootUidAndParantUid(rootUid, parantUid, this.serverId);

        await IsolationRoomPoolRedisDao.increaseByRootUidAndParantUid(rootUid, parantUid, this.serverId);

        this.updateTenantRoomSituation();

        if (playerNum === 0) {

            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 该代理玩家数从无到有，检测是否有房间销毁任务正在执行`);
            const HadDestoryTask = this.checkDestroyTask(rootUid, parantUid);
            if (HadDestoryTask) {
                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 该代理有房间销毁任务`);
                clearTimeout(this.timerPool[rootUid][parantUid]);
                this.timerPool[rootUid][parantUid] = null;
                delete this.timerPool[rootUid][parantUid];
                delete this.timerPool[rootUid];
                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 该代理有房间销毁任务 | 已销毁延迟期任务`);
            }
        }
    }

    /**
     * @name 玩家离开指定平台代理
     * @description 玩家离开房间时调用: RPC离开房间(玩家主动离开房间)、socket断开(房间检测踢出玩家)
     */
    public async leaveRoomInIsolationPool(rootUid: string, parantUid: string, roomId: string = "-1") {
        rootUid = !!rootUid ? rootUid : "-1";

        parantUid = !!parantUid ? parantUid : "-1";

        const playerNum = await IsolationRoomPoolRedisDao.findOneByRootUidAndParantUid(rootUid, parantUid, this.serverId);

        if (playerNum >= 1)
            await IsolationRoomPoolRedisDao.decreaseByRootUidAndParantUid(rootUid, parantUid, this.serverId);

        if (playerNum <= 1) {
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 开始   `);

            // 玩家离线
            if (roomId !== "-1") {
                const roomInfo = this.getRoomInfo(roomId);

                const realPlayerList = roomInfo.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER);

                if (this.nid === "17") {
                    ///@ts-ignore
                    const p = realPlayerList.filter(p => p.role !== BlackJackPlayerRoleEnum.Dealer);
                    if (p.length === 0 && !roomInfo.canBeDestroy) {
                        roomInfo.canBeDestroy = true;
                    }

                } else if (realPlayerList.length === 0 && !roomInfo.canBeDestroy) {
                    roomInfo.canBeDestroy = true;
                }
            } else {
                // 玩家返回大厅
                const roomListIdx = this.isolationPool[rootUid][parantUid];
                roomListIdx.forEach(idx => {
                    const roomList = this.roomPool[idx];
                    roomList.forEach((roomInfo, i) => {

                        const realPlayerList = roomInfo.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER);
                        if (this.nid === "17") {
                            ///@ts-ignore
                            const p = realPlayerList.filter(p => p.role !== BlackJackPlayerRoleEnum.Dealer);
                            if (p.length === 0 && !roomInfo.canBeDestroy) {
                                roomInfo.canBeDestroy = true;
                            }

                        } else if (realPlayerList.length === 0 && !roomInfo.canBeDestroy) {
                            roomInfo.canBeDestroy = true;
                        }
                    })
                })
            }


            // 检测是否已有延迟器运行
            if (!!this.timerPool[rootUid] && !!this.timerPool[rootUid][parantUid]) {
                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 已有任务正在执行`);

                return;
            }

            if (!this.timerPool[rootUid]) {
                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 添加平台编号`);
                this.timerPool[rootUid] = {};
            }

            if (!this.timerPool[rootUid][parantUid]) {
                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 添加分代编号`);
                this.timerPool[rootUid][parantUid] = setTimeout(() => {
                    this.destroyRoomTask(rootUid, parantUid);
                }, this.desestroyTime);
            }
        }

    }

    /** 销毁房间核心功能模块区域 Start */

    /** 玩家进入相关 */

    /**
     * 检测是否有房间销毁任务
     * @param rootUid 平台编号
     * @param parantUid 代理编号
     * @returns {boolean}
     */
    private checkDestroyTask(rootUid: string, parantUid: string) {
        if (!this.timerPool[rootUid] || !this.timerPool[rootUid][parantUid]) {
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 该代理没有房间销毁任务`);
            return false;
        }

        return true;
    }

    /** 玩家进入相关 */

    /** 玩家退出相关 */

    /**
     * @name 定时器任务 - 销毁房间
     * @description core
     */
    private destroyRoomTask(rootUid: string, parantUid: string) {
        // 当前代理拥有的房间组下标标识
        const idxList = this.isolationPool[rootUid][parantUid];
        // 房间组数量
        const listLen = idxList.length;

        this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 有 ${listLen} 组房间正在运行`);

        // 是否有做清理工作
        let taskFlag = false;

        for (let i = 0; i < idxList.length; i++) {
            const roomIdx = idxList[i];

            const roomList = this.roomPool[roomIdx];

            if (roomList.length === 0) {

                if (this.isolationPool[rootUid][parantUid].includes(roomIdx)) {
                    this.isolationPool[rootUid][parantUid] = this.isolationPool[rootUid][parantUid].filter(v => v !== roomIdx);
                } else {
                    this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 房间组下标 ${roomIdx} | 房间组为空 | 异常情况，应清理 isolationPool 标识位而未清理`, "error");
                }
                continue;
            }

            const canBeDestroy = roomList.every(roomInfo => roomInfo.canBeDestroy);

            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 房间组下标 ${roomIdx} | 可销毁状态 ${canBeDestroy ? "是" : "否"}`);

            if (canBeDestroy) {

                taskFlag = true;

                roomList.forEach((roomInfo, i) => {
                    const {
                        roomId,
                        sceneId,
                        players
                    } = roomInfo;
                    /**
                     * ToDo 
                     * Step 1:销毁机器人
                     */
                    //  roomInfo.players.filter
                    // this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 房间组下标 ${roomIdx} | 机器人销毁完成`);
                    // const robotList = players.filter(p => p.isRobot === RoleEnum.ROBOT);
                    // if (robotList.length > 0) {
                    //     for (const { uid } of robotList) {
                    //         // roomInfo.kickOutMessage(uid);
                    //         /* const robot = roomInfo.getPlayer(uid);
                    //         if (robot)
                    //             robot.destroy();
                    //         remove(roomInfo.players, "uid", uid);*/
                    //     }
                    // }
                    /**
                     * Step 2:销毁房间
                     */
                    roomInfo.destroy();
                    const channelName = `${this.gameName}${sceneId}${roomId}`;
                    pinus.app.channelService.destroyChannel(`${channelName}`);
                    pinus.app.channelService.destroyChannel(`${channelName}Bet`);
                    !!roomInfo.event && roomInfo.event.removeAllListeners();
                    this.roomPool[roomIdx][i] = null;
                })

                this.roomPool[roomIdx] = [];

                this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 房间组下标 ${roomIdx} | 房间销毁完成`);

                // 设置房间组 null，为清理后过滤用
                this.isolationPool[rootUid][parantUid][i] = null;
            }
        }

        if (taskFlag) {
            this.isolationPool[rootUid][parantUid] = this.isolationPool[rootUid][parantUid].filter(value => typeof value === "number");
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 完成房间清理任务`);
            this.clearTimerPoolAfterDestroyRoom(rootUid, parantUid);
            this.updateTenantRoomSituation();
        } else {
            this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 未完成房间清理任务 | 房间销毁状态没变，进入下一次销毁任务`);
            if (!rootUid || !parantUid) {
                return;
            }
            if (!this.timerPool[rootUid]) {
                this.timerPool[rootUid] = {}
            }

            if (this.timerPool[rootUid][parantUid]) {
                clearTimeout(this.timerPool[rootUid][parantUid]);
            }

            this.timerPool[rootUid][parantUid] = setTimeout(() => {
                this.destroyRoomTask(rootUid, parantUid);
            }, this.desestroyTime);
        }


    }

    /**
     * @name 清理 timerPool
     * @description 销毁房间后的收尾工作
     */
    private async clearTimerPoolAfterDestroyRoom(rootUid: string, parantUid: string) {
        this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 定时器后置清理任务`);
        // 当前代理拥有的房间组下标标识
        const idxList = this.isolationPool[rootUid][parantUid];
        // 房间组数量
        const listLen = idxList.length;

        this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 定时器后置清理任务 | 还有 ${listLen} 组房间`);
        if (!!this.timerPool[rootUid] && !!this.timerPool[rootUid][parantUid]) {
            clearTimeout(this.timerPool[rootUid][parantUid]);
            this.timerPool[rootUid][parantUid] = null;
        }


        this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 定时器后置清理任务 | 清理定时器 | 完成`);

        if (!!this.timerPool[rootUid] && !!this.timerPool[rootUid][parantUid])
            delete this.timerPool[rootUid][parantUid];
        if (!!this.timerPool[rootUid])
            delete this.timerPool[rootUid];

        this._logger(`动态房间管理 | 游戏 ${this.nid} | 平台 ${rootUid} | 代理 ${parantUid} | 房间销毁逻辑 | 定时器后置清理任务 | 清理timerPool | 完成`);
        /* 
        if (listLen === 0) {
        } else {
            const playerNum = await IsolationRoomPoolRedisDao.findOneByRootUidAndParantUid(rootUid, parantUid, this.serverId);
            if (playerNum === 0) {
    
            }
        } */
    }

    /** 玩家退出相关 */

    /** 销毁房间核心功能模块区域 End */

    /** 变更房间销毁时间 */
    public changDesestroyTime(time: number) {
        this.desestroyTime = time;
        return this;
    }

    /** 更新隔离运行信息 */
    protected async updateTenantRoomSituation() {
        const running = Object.keys(this.isolationPool)
            .reduce((num, platform, idx) => {
                const lineCodeList = Object.keys(this.isolationPool[platform]);
                lineCodeList.forEach(lineCode => {
                    const len = this.isolationPool[platform][lineCode].length;
                    if (len > 0) {
                        num += len;
                    }
                })
                return num;
            }, 0);
        const idleRoomCodeCount = this.roomPool.reduce((idleRoomCodeCount, list) => {
            if (list.length > 0) {
                ++idleRoomCodeCount;
            }
            return idleRoomCodeCount;
        }, 0)
        await ShareTenantRoomSituationRedisDao.insertOne(this.nid, JSON.stringify({
            running,
            idle: idleRoomCodeCount - running,
            memory: process.memoryUsage(),
            idleRoomCodeCount: idleRoomCodeCount,
        }));
    }
}
