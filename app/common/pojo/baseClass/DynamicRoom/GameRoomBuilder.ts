import { pinus, Logger } from "pinus";
import { getLogger } from "pinus-logger";
import { getArrayMember, randomFromRange } from "../../../../utils/lottery/commonUtil";
import JsonManager = require("../../../../../config/data/JsonMgr");
import { FAKE_JACKPOT } from "../../../constant/game/jackpotConst";
import { GameNidEnum } from "../../../constant/game/GameNidEnum";
import { BlackJackRoomImpl } from "../../../../servers/BlackJack/lib/BlackJackRoomImpl";
import RedPacketRoomImpl from "../../../../servers/redPacket/lib/RedPacketRoomImpl";

/** 基础信息 */
interface IRoomInfo {
    nid: GameNidEnum;
    name: string;
    jackpot: number;
}

/** 奖池信息 */
interface IJackpotShow {
    otime: number;
    ctime: number;
    show: number;
    rand: number;
}

export class GameRoomBuilder {

    private logger: Logger;

    serverId: string;

    sceneId: number;

    /** gameName */
    name: string;

    hadJackpot: boolean = false;

    jackpot: number;

    jackpotShow: IJackpotShow;

    createTime?: Date;

    constructor(private nid: string, private roomId: string) {
        this.logger = getLogger("server_out", __filename);
    }

    /**
     * @name 基础信息
     * @returns 
     */
    public setBaseInfo(gameName: string) {
        const roomJackpotList = require("../../../../../config/data/systemRoom")
        // const allRoomJackpotList = JsonManager.get('systemRoom').datas;
        // console.log("JsonManager", roomJackpotList)
        // return this;
        const roomInfo: IRoomInfo = getArrayMember(roomJackpotList, 'nid', this.nid);

        if (!roomInfo) throw new Error('未查询到对应游戏的奖池配置信息');

        /** 基础信息 */
        const { jackpot } = roomInfo;

        this.name = gameName;

        this.jackpot = jackpot;

        return this;
    }

    /**
     * @name 所属服务器编号
     * @param serverId 服务器编号
     * @returns 
     */
    public setServerId() {
        this.serverId = pinus.app.getServerId();
        return this;
    }

    /**
     * @name 所属场编号
     * @param sceneId 场编号
     * @returns 
     */
    public setSceneId(sceneId: number) {
        this.sceneId = sceneId;
        return this;
    }

    /**
     * @name 奖池信息
     * @returns 
     */
    public setJackpot() {
        this.hadJackpot = FAKE_JACKPOT.GAMES.includes(this.nid);
        if (!this.hadJackpot) {
            return this;
        }

        /** 配置参数是否符合预设区间 */
        const inLineWithRangeFlag = this.jackpot >= FAKE_JACKPOT.FIRST_PERIOD_COND.LOW && this.jackpot < FAKE_JACKPOT.FIRST_PERIOD_COND.HIGH;

        this.jackpotShow = {
            otime: Date.now(),
            ctime: Date.now(),
            show: this.jackpot,
            rand: inLineWithRangeFlag ?
                this.jackpot * FAKE_JACKPOT.FIRST_PERIOD_INC_RATE :
                randomFromRange(
                    FAKE_JACKPOT.FIRST_PERIOD_INC_RANGE.LOW,
                    FAKE_JACKPOT.FIRST_PERIOD_INC_RANGE.HIGH
                )
        };

        return this;
    }

    /**
     * @name 构建各游戏各自基础属性
     * @returns 
     * @description 原 BaseRoomManager 对象里 getMysqlInstance 函数的逻辑
     */
    public setEachGameProps() {
        switch (this.nid) {
            //实例化 西游记
            case '7':
                Object.assign(this, { redPacketHistory: [] });
                break;
            //实例化 欢乐百人 系统房间
            case '8':
                // const { lowBet: bjlowBet, tallBet: bjtallBet } = baijia.find(m => m.id == this.sceneId);
                const { lowBet: bjlowBet, tallBet: bjtallBet } = JsonManager.get('scenes/baijia').datas.find(m => m.id == this.sceneId);
                //baijiaConst.BET_XIANZHI
                Object.assign(this, { betUpperLimit: { 0: bjlowBet, 1: bjtallBet * 10 } });
                Object.assign(this, { baijiaHistory: [] });
                break;
            //bairen
            case '9':
                Object.assign(this, { bairenHistory: [] });
                break;
            //骰宝
            case '43':
                const { lowBet: slowBet, tallBet: stallBet } = JsonManager.get('scenes/SicBo').datas.find(m => m.id == this.sceneId);
                Object.assign(this, { betUpperLimit: { 0: slowBet, 1: stallBet * 10 } });
                Object.assign(this, { sicboHistorys: [] });
                break;
            //红黑大站
            case '19':
                const { lowBet: rblowBet, capBet: rbtallBet } = JsonManager.get('scenes/RedBlack').datas.find(m => m.id == this.sceneId);
                Object.assign(this, { betUpperLimit: { 0: rblowBet, 1: rbtallBet * 10 } });
                break;
            // 龙虎斗
            case '42':
                const { lowBet: dtlowBet, capBet: dttallBet } = JsonManager.get('scenes/DragonTiger').datas.find(m => m.id == this.sceneId);
                Object.assign(this, { betUpperLimit: { 0: dtlowBet, 1: dttallBet * 10 } });
                break;
            // 国王与水手
            case '18':
                const { lowBet: kaslowBet, capBet: kastallBet } = JsonManager.get('scenes/Erba').datas.find(m => m.id == this.sceneId);
                Object.assign(this, { betUpperLimit: { 0: kaslowBet, 1: kastallBet * 10 } });
                break;
            //渔场大亨
            case '51':
                Object.assign(this, { fisheryHistory: [] });
                break;
            case '81':
                Object.assign(this, { redPacketHistory: [] });
                break;
            case '17':
                const { tallBet: blackJackAreaBet } = JsonManager.get('scenes/BlackJack').datas.find(m => m.id == this.sceneId);

                Object.assign(this, { areaMaxBet: blackJackAreaBet });
                break;
            default:
                Object.assign(this, {});
                break;
        }

        return this;
    }

    /**
     * @name 实力化房间对象并构建各游戏业务属性
     * @description 主要来自原逻辑，继承BaseRoomManager后，实现的createRoom函数逻辑
     */
    public getInstance(sceneInfo, roomUserLimit: number) {
        const { nid } = this;

        let roomInfo = null;

        switch (nid) {
            case GameNidEnum.BlackJack:
                roomInfo = this.blackJackRoomInstance(sceneInfo, roomUserLimit);
                break;
            case GameNidEnum.redPacket:
                roomInfo = this.redPacketRoomInstance(sceneInfo, roomUserLimit);
                break;
            default:
                throw new Error(`实例化游戏房间具体业务属性和函数，没有符合条件的分支`);
        }

        if (roomInfo === null) {
            throw new Error(`实例化游戏房间具体业务属性和函数，roomInfo 不能为null`);
        }

        return roomInfo;
    }

    private blackJackRoomInstance(sceneInfo, roomUserLimit: number) {
        const {
            name,
            sceneId,
            roomId
        } = this;

        const channelName = `${name}${sceneId}${roomId}`;

        const isChannelExist = pinus.app.channelService.getChannel(channelName, false);

        if (isChannelExist) {
            this.logger.warn(` 场: ${sceneId} | 房间: ${roomId} | 实例化房间 | channelName ${channelName}`)
            this.logger.error(`${pinus.app.getServerId()} | 场: ${sceneId} | 房间: ${roomId} | 实例化房间 | 失败: 已经存在相同消息通道 - ${channelName}`);
            return null;
        }

        const {
            id,
            entryCond,
            lowBet,
            tallBet
        } = sceneInfo;

        this['channel'] = pinus.app.channelService.createChannel(channelName);
        this['channelBet'] = pinus.app.channelService.createChannel(`${channelName}Bet`);
        this['sceneId'] = id;
        this['entryCond'] = entryCond;
        this['lowBet'] = lowBet;
        this['roomUserLimit'] = roomUserLimit;
        this['areaMaxBet'] = tallBet;
        /// @ts-ignore
        const roomInfo = new BlackJackRoomImpl(this);

        if (!roomInfo.roomBeInit) {
            roomInfo.init();
        }

        return roomInfo;
    }

    private redPacketRoomInstance(sceneInfo, roomUserLimit: number) {
        const {
            name,
            sceneId,
            roomId
        } = this;

        const channelName = `${name}${sceneId}${roomId}`;

        const isChannelExist = pinus.app.channelService.getChannel(channelName, false);

        if (isChannelExist) {
            this.logger.warn(` 场: ${sceneId} | 房间: ${roomId} | 实例化房间 | channelName ${channelName}`)
            this.logger.error(`${pinus.app.getServerId()} | 场: ${sceneId} | 房间: ${roomId} | 实例化房间 | 失败: 已经存在相同消息通道 - ${channelName}`);
            return null;
        }

        const {
            id,
            entryCond,
            lowBet,
            tallBet,
            redParketNum
        } = sceneInfo;

        this['channel'] = pinus.app.channelService.createChannel(channelName);
        this['channelBet'] = pinus.app.channelService.createChannel(`${channelName}Bet`);
        this['sceneId'] = id;
        this['entryCond'] = entryCond;
        this['lowBet'] = lowBet;
        this['roomUserLimit'] = roomUserLimit;
        this['areaMaxBet'] = tallBet;
        this['redParketNum'] = redParketNum;

        /// @ts-ignore
        const roomInfo = new RedPacketRoomImpl(this);

        roomInfo.init();

        roomInfo.run();

        return roomInfo;
    }
}