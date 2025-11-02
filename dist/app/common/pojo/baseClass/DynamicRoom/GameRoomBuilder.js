"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoomBuilder = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const commonUtil_1 = require("../../../../utils/lottery/commonUtil");
const JsonManager = require("../../../../../config/data/JsonMgr");
const jackpotConst_1 = require("../../../constant/game/jackpotConst");
const GameNidEnum_1 = require("../../../constant/game/GameNidEnum");
const BlackJackRoomImpl_1 = require("../../../../servers/BlackJack/lib/BlackJackRoomImpl");
const RedPacketRoomImpl_1 = require("../../../../servers/redPacket/lib/RedPacketRoomImpl");
class GameRoomBuilder {
    constructor(nid, roomId) {
        this.nid = nid;
        this.roomId = roomId;
        this.hadJackpot = false;
        this.logger = (0, pinus_logger_1.getLogger)("server_out", __filename);
    }
    setBaseInfo(gameName) {
        const roomJackpotList = require("../../../../../config/data/systemRoom");
        const roomInfo = (0, commonUtil_1.getArrayMember)(roomJackpotList, 'nid', this.nid);
        if (!roomInfo)
            throw new Error('未查询到对应游戏的奖池配置信息');
        const { jackpot } = roomInfo;
        this.name = gameName;
        this.jackpot = jackpot;
        return this;
    }
    setServerId() {
        this.serverId = pinus_1.pinus.app.getServerId();
        return this;
    }
    setSceneId(sceneId) {
        this.sceneId = sceneId;
        return this;
    }
    setJackpot() {
        this.hadJackpot = jackpotConst_1.FAKE_JACKPOT.GAMES.includes(this.nid);
        if (!this.hadJackpot) {
            return this;
        }
        const inLineWithRangeFlag = this.jackpot >= jackpotConst_1.FAKE_JACKPOT.FIRST_PERIOD_COND.LOW && this.jackpot < jackpotConst_1.FAKE_JACKPOT.FIRST_PERIOD_COND.HIGH;
        this.jackpotShow = {
            otime: Date.now(),
            ctime: Date.now(),
            show: this.jackpot,
            rand: inLineWithRangeFlag ?
                this.jackpot * jackpotConst_1.FAKE_JACKPOT.FIRST_PERIOD_INC_RATE :
                (0, commonUtil_1.randomFromRange)(jackpotConst_1.FAKE_JACKPOT.FIRST_PERIOD_INC_RANGE.LOW, jackpotConst_1.FAKE_JACKPOT.FIRST_PERIOD_INC_RANGE.HIGH)
        };
        return this;
    }
    setEachGameProps() {
        switch (this.nid) {
            case '7':
                Object.assign(this, { redPacketHistory: [] });
                break;
            case '8':
                const { lowBet: bjlowBet, tallBet: bjtallBet } = JsonManager.get('scenes/baijia').datas.find(m => m.id == this.sceneId);
                Object.assign(this, { betUpperLimit: { 0: bjlowBet, 1: bjtallBet * 10 } });
                Object.assign(this, { baijiaHistory: [] });
                break;
            case '9':
                Object.assign(this, { bairenHistory: [] });
                break;
            case '43':
                const { lowBet: slowBet, tallBet: stallBet } = JsonManager.get('scenes/SicBo').datas.find(m => m.id == this.sceneId);
                Object.assign(this, { betUpperLimit: { 0: slowBet, 1: stallBet * 10 } });
                Object.assign(this, { sicboHistorys: [] });
                break;
            case '19':
                const { lowBet: rblowBet, capBet: rbtallBet } = JsonManager.get('scenes/RedBlack').datas.find(m => m.id == this.sceneId);
                Object.assign(this, { betUpperLimit: { 0: rblowBet, 1: rbtallBet * 10 } });
                break;
            case '42':
                const { lowBet: dtlowBet, capBet: dttallBet } = JsonManager.get('scenes/DragonTiger').datas.find(m => m.id == this.sceneId);
                Object.assign(this, { betUpperLimit: { 0: dtlowBet, 1: dttallBet * 10 } });
                break;
            case '18':
                const { lowBet: kaslowBet, capBet: kastallBet } = JsonManager.get('scenes/Erba').datas.find(m => m.id == this.sceneId);
                Object.assign(this, { betUpperLimit: { 0: kaslowBet, 1: kastallBet * 10 } });
                break;
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
    getInstance(sceneInfo, roomUserLimit) {
        const { nid } = this;
        let roomInfo = null;
        switch (nid) {
            case GameNidEnum_1.GameNidEnum.BlackJack:
                roomInfo = this.blackJackRoomInstance(sceneInfo, roomUserLimit);
                break;
            case GameNidEnum_1.GameNidEnum.redPacket:
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
    blackJackRoomInstance(sceneInfo, roomUserLimit) {
        const { name, sceneId, roomId } = this;
        const channelName = `${name}${sceneId}${roomId}`;
        const isChannelExist = pinus_1.pinus.app.channelService.getChannel(channelName, false);
        if (isChannelExist) {
            this.logger.warn(` 场: ${sceneId} | 房间: ${roomId} | 实例化房间 | channelName ${channelName}`);
            this.logger.error(`${pinus_1.pinus.app.getServerId()} | 场: ${sceneId} | 房间: ${roomId} | 实例化房间 | 失败: 已经存在相同消息通道 - ${channelName}`);
            return null;
        }
        const { id, entryCond, lowBet, tallBet } = sceneInfo;
        this['channel'] = pinus_1.pinus.app.channelService.createChannel(channelName);
        this['channelBet'] = pinus_1.pinus.app.channelService.createChannel(`${channelName}Bet`);
        this['sceneId'] = id;
        this['entryCond'] = entryCond;
        this['lowBet'] = lowBet;
        this['roomUserLimit'] = roomUserLimit;
        this['areaMaxBet'] = tallBet;
        const roomInfo = new BlackJackRoomImpl_1.BlackJackRoomImpl(this);
        if (!roomInfo.roomBeInit) {
            roomInfo.init();
        }
        return roomInfo;
    }
    redPacketRoomInstance(sceneInfo, roomUserLimit) {
        const { name, sceneId, roomId } = this;
        const channelName = `${name}${sceneId}${roomId}`;
        const isChannelExist = pinus_1.pinus.app.channelService.getChannel(channelName, false);
        if (isChannelExist) {
            this.logger.warn(` 场: ${sceneId} | 房间: ${roomId} | 实例化房间 | channelName ${channelName}`);
            this.logger.error(`${pinus_1.pinus.app.getServerId()} | 场: ${sceneId} | 房间: ${roomId} | 实例化房间 | 失败: 已经存在相同消息通道 - ${channelName}`);
            return null;
        }
        const { id, entryCond, lowBet, tallBet, redParketNum } = sceneInfo;
        this['channel'] = pinus_1.pinus.app.channelService.createChannel(channelName);
        this['channelBet'] = pinus_1.pinus.app.channelService.createChannel(`${channelName}Bet`);
        this['sceneId'] = id;
        this['entryCond'] = entryCond;
        this['lowBet'] = lowBet;
        this['roomUserLimit'] = roomUserLimit;
        this['areaMaxBet'] = tallBet;
        this['redParketNum'] = redParketNum;
        const roomInfo = new RedPacketRoomImpl_1.default(this);
        roomInfo.init();
        roomInfo.run();
        return roomInfo;
    }
}
exports.GameRoomBuilder = GameRoomBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVJvb21CdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9wb2pvL2Jhc2VDbGFzcy9EeW5hbWljUm9vbS9HYW1lUm9vbUJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQXNDO0FBQ3RDLCtDQUF5QztBQUN6QyxxRUFBdUY7QUFDdkYsa0VBQW1FO0FBQ25FLHNFQUFtRTtBQUNuRSxvRUFBaUU7QUFDakUsMkZBQXdGO0FBQ3hGLDJGQUFvRjtBQWlCcEYsTUFBYSxlQUFlO0lBbUJ4QixZQUFvQixHQUFXLEVBQVUsTUFBYztRQUFuQyxRQUFHLEdBQUgsR0FBRyxDQUFRO1FBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQVJ2RCxlQUFVLEdBQVksS0FBSyxDQUFDO1FBU3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBTU0sV0FBVyxDQUFDLFFBQWdCO1FBQy9CLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFBO1FBSXhFLE1BQU0sUUFBUSxHQUFjLElBQUEsMkJBQWMsRUFBQyxlQUFlLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU3RSxJQUFJLENBQUMsUUFBUTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUdsRCxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsUUFBUSxDQUFDO1FBRTdCLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBRXJCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBRXZCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFPTSxXQUFXO1FBQ2QsSUFBSSxDQUFDLFFBQVEsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFPTSxVQUFVLENBQUMsT0FBZTtRQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBTU0sVUFBVTtRQUNiLElBQUksQ0FBQyxVQUFVLEdBQUcsMkJBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNsQixPQUFPLElBQUksQ0FBQztTQUNmO1FBR0QsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLDJCQUFZLENBQUMsaUJBQWlCLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsMkJBQVksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUM7UUFFckksSUFBSSxDQUFDLFdBQVcsR0FBRztZQUNmLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ2pCLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ2pCLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTztZQUNsQixJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRywyQkFBWSxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQ25ELElBQUEsNEJBQWUsRUFDWCwyQkFBWSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFDdkMsMkJBQVksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQzNDO1NBQ1IsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFPTSxnQkFBZ0I7UUFDbkIsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBRWQsS0FBSyxHQUFHO2dCQUNKLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDOUMsTUFBTTtZQUVWLEtBQUssR0FBRztnQkFFSixNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRXhILE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsU0FBUyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDM0UsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDM0MsTUFBTTtZQUVWLEtBQUssR0FBRztnQkFDSixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNO1lBRVYsS0FBSyxJQUFJO2dCQUNMLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNO1lBRVYsS0FBSyxJQUFJO2dCQUNMLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN6SCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFNBQVMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzNFLE1BQU07WUFFVixLQUFLLElBQUk7Z0JBQ0wsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzVILE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsU0FBUyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDM0UsTUFBTTtZQUVWLEtBQUssSUFBSTtnQkFDTCxNQUFNLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZILE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsVUFBVSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDN0UsTUFBTTtZQUVWLEtBQUssSUFBSTtnQkFDTCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNO1lBQ1YsS0FBSyxJQUFJO2dCQUNMLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDOUMsTUFBTTtZQUNWLEtBQUssSUFBSTtnQkFDTCxNQUFNLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFaEgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNO1lBQ1Y7Z0JBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3hCLE1BQU07U0FDYjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFNTSxXQUFXLENBQUMsU0FBUyxFQUFFLGFBQXFCO1FBQy9DLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBRXBCLFFBQVEsR0FBRyxFQUFFO1lBQ1QsS0FBSyx5QkFBVyxDQUFDLFNBQVM7Z0JBQ3RCLFFBQVEsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNoRSxNQUFNO1lBQ1YsS0FBSyx5QkFBVyxDQUFDLFNBQVM7Z0JBQ3RCLFFBQVEsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNoRSxNQUFNO1lBQ1Y7Z0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQ3JEO1FBRUQsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztTQUN4RDtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsYUFBcUI7UUFDMUQsTUFBTSxFQUNGLElBQUksRUFDSixPQUFPLEVBQ1AsTUFBTSxFQUNULEdBQUcsSUFBSSxDQUFDO1FBRVQsTUFBTSxXQUFXLEdBQUcsR0FBRyxJQUFJLEdBQUcsT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDO1FBRWpELE1BQU0sY0FBYyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFL0UsSUFBSSxjQUFjLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxPQUFPLFVBQVUsTUFBTSwwQkFBMEIsV0FBVyxFQUFFLENBQUMsQ0FBQTtZQUN2RixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsT0FBTyxVQUFVLE1BQU0sK0JBQStCLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDMUgsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELE1BQU0sRUFDRixFQUFFLEVBQ0YsU0FBUyxFQUNULE1BQU0sRUFDTixPQUFPLEVBQ1YsR0FBRyxTQUFTLENBQUM7UUFFZCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsR0FBRyxXQUFXLEtBQUssQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztRQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxhQUFhLENBQUM7UUFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUU3QixNQUFNLFFBQVEsR0FBRyxJQUFJLHFDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO1lBQ3RCLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNuQjtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsYUFBcUI7UUFDMUQsTUFBTSxFQUNGLElBQUksRUFDSixPQUFPLEVBQ1AsTUFBTSxFQUNULEdBQUcsSUFBSSxDQUFDO1FBRVQsTUFBTSxXQUFXLEdBQUcsR0FBRyxJQUFJLEdBQUcsT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDO1FBRWpELE1BQU0sY0FBYyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFL0UsSUFBSSxjQUFjLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxPQUFPLFVBQVUsTUFBTSwwQkFBMEIsV0FBVyxFQUFFLENBQUMsQ0FBQTtZQUN2RixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsT0FBTyxVQUFVLE1BQU0sK0JBQStCLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDMUgsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELE1BQU0sRUFDRixFQUFFLEVBQ0YsU0FBUyxFQUNULE1BQU0sRUFDTixPQUFPLEVBQ1AsWUFBWSxFQUNmLEdBQUcsU0FBUyxDQUFDO1FBRWQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLEdBQUcsV0FBVyxLQUFLLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxTQUFTLENBQUM7UUFDOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUN4QixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsYUFBYSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxPQUFPLENBQUM7UUFDN0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLFlBQVksQ0FBQztRQUdwQyxNQUFNLFFBQVEsR0FBRyxJQUFJLDJCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTdDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVoQixRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFZixPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0NBQ0o7QUE3UUQsMENBNlFDIn0=