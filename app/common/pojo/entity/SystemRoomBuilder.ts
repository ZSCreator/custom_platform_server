import { SystemRoom } from "./SystemRoom";
import JsonManager = require("../../../../config/data/JsonMgr");
import { getArrayMember, randomFromRange } from "../../../utils/lottery/commonUtil";
import JackpotConst = require('../../constant/game/jackpotConst');

/**
 * 基础信息
 */
interface IRoomInfo {
    nid: string;
    name: string;
    jackpot: number;
}

/**
 * 奖池信息
 */
interface IJackpotShow {
    otime: number;
    ctime: number;
    show: number;
    rand: number;
}

/**
 * SystemRoom 建造者
 */
export class SystemRoomBuilder {

    nid: string;

    roomId: string;

    serverId: string;

    sceneId: number;

    /** gameName */
    name: string;

    hadJackpot: boolean = false;

    jackpot: number;

    jackpotShow: IJackpotShow;

    createTime?: Date;

    constructor(nid: string, roomId: string) {
        this.nid = nid;

        this.roomId = roomId;
    }

    /**
     * 构建基础信息
     */
    public buildBaseInfo() {

        const allRoomJackpotList = JsonManager.get('systemRoom').datas;

        const roomInfo: IRoomInfo = getArrayMember(allRoomJackpotList, 'nid', this.nid);

        if (!roomInfo) throw new Error('未查询到对应游戏的奖池配置信息');

        /** 基础信息 */
        const { name, jackpot } = roomInfo;

        this.name = name;

        this.jackpot = jackpot;

        return this;
    }

    public buildServerId(serverId: string) {
        if (!serverId) throw new Error('未传入服务器id');
        this.serverId = serverId;
        return this;
    }

    /**
     * 构建场id信息
     * @param sceneId 场id
     */
    public buildSceneId(sceneId: number) {
        if (sceneId === undefined || sceneId === null) return this;
        this.sceneId = sceneId;
        return this;
    }

    /**
     * 构建奖池
     */
    public buildJackpot() {

        /** 需要奖池的游戏 */
        this.hadJackpot = JackpotConst.FAKE_JACKPOT.GAMES.includes(this.nid);
        if (!this.hadJackpot) {
            return this;
        }

        /** 配置参数是否符合预设区间 */
        const inLineWithRangeFlag = this.jackpot >= JackpotConst.FAKE_JACKPOT.FIRST_PERIOD_COND.LOW && this.jackpot < JackpotConst.FAKE_JACKPOT.FIRST_PERIOD_COND.HIGH;

        this.jackpotShow = {
            otime: Date.now(),
            ctime: Date.now(),
            show: this.jackpot,
            rand: inLineWithRangeFlag ?
                this.jackpot * JackpotConst.FAKE_JACKPOT.FIRST_PERIOD_INC_RATE :
                randomFromRange(
                    JackpotConst.FAKE_JACKPOT.FIRST_PERIOD_INC_RANGE.LOW,
                    JackpotConst.FAKE_JACKPOT.FIRST_PERIOD_INC_RANGE.HIGH
                )
        };

        return this;
    }

    public getInstance() {
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
                const { lowBet: kaslowBet, capBet: kastallBet } = JsonManager.get('scenes/KASailor').datas.find(m => m.id == this.sceneId);
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
        }
        return new SystemRoom(this);
    }

    public getMysqlInstance() {
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
        /* const rep = getRepository(Room);
        // .create({ ...this })
        const initProps = { ...this };
        rep.create(initProps) */

        return this;
    }
}
