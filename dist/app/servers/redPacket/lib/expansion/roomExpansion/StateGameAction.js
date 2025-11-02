"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RedPacketGameStatusEnum_1 = require("../../enum/RedPacketGameStatusEnum");
const RoleEnum_1 = require("../../../../../common/constant/player/RoleEnum");
const utils = require("../../../../../utils/index");
const ApiResult_1 = require("../../../../../common/pojo/ApiResult");
const langsrv_1 = require("../../../../../services/common/langsrv");
const utils_1 = require("../../../../../utils");
class StateGameAction {
    constructor(room) {
        this.room = room;
    }
    static getInstance(room, paramRoomCode) {
        if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
            this.roomCodeList.push(paramRoomCode);
            this.instanceMap[paramRoomCode] = new StateGameAction(room);
        }
        return this.instanceMap[paramRoomCode];
    }
    addRedPacketToRedPackQueue(redPacket) {
        this.room.redPackQueue.push(redPacket);
        const redPacketOfStatusNotInGameList = this.room.redPackQueue
            .filter((redPacket) => redPacket.status === RedPacketGameStatusEnum_1.RedPacketGameStatusEnum.WAIT)
            .sort((redPacketA, redPacketB) => redPacketB.amount - redPacketA.amount);
        this.room.redPackQueue = this.room.redPackQueue[0].status === RedPacketGameStatusEnum_1.RedPacketGameStatusEnum.WAIT ? redPacketOfStatusNotInGameList : [this.room.redPackQueue[0]].concat(redPacketOfStatusNotInGameList);
    }
    deleteRedPacketFromRedPacketQueue(uid) {
        utils.remove(this.room.redPackQueue, 'owner_uid', uid);
    }
    redPacketGenerator(num, amount) {
        let redPacketList = [];
        let fSumTmp = amount;
        let iAcc = 0;
        for (let i = 0; i < (num - 1); i++) {
            let iTmp = Math.ceil((Math.random() * (fSumTmp / 2)));
            redPacketList.push(iTmp);
            fSumTmp -= iTmp;
            iAcc += iTmp;
        }
        redPacketList.push(Number((amount - iAcc)));
        return redPacketList;
    }
    randomRedPacketList(redPacketNumber, amount, mineNum, targetMineNum) {
        const { maxMineNum } = this.room.sceneInfo;
        let checkRedPacketFlag = true;
        let resultRedPacketList = [];
        do {
            let tmpRedPacketList = [];
            let redPacketList = this.redPacketGenerator(redPacketNumber, amount);
            if ((Math.max(...redPacketList) / amount) > 0.6 || Math.min(...redPacketList) === 0)
                continue;
            let curretMineNum = redPacketList.reduce((totalMineNum, val) => {
                let valStr = `${val}`;
                tmpRedPacketList.push(valStr);
                return valStr.split('').reverse()[0] === mineNum.toString() ? ++totalMineNum : totalMineNum;
            }, 0);
            if (curretMineNum > maxMineNum)
                continue;
            if (typeof targetMineNum === "number" && targetMineNum <= maxMineNum && curretMineNum !== targetMineNum)
                continue;
            resultRedPacketList = tmpRedPacketList;
            checkRedPacketFlag = false;
        } while (checkRedPacketFlag);
        return resultRedPacketList;
    }
    async checkRedPacketListOnReady() {
        const { redParketNum, maxMineNum, realPlayerMineNum } = this.room.sceneInfo;
        const { amount, mineNumber } = this.room.redPackQueue[0];
        const bet_ratio = this.room.currentCommissionBetRatio;
        const redPacketAmount = amount - (amount * bet_ratio);
        const redPacketOwner = this.room.players.find(player => player.uid === this.room.redPackQueue[0].owner_uid);
        if (redPacketOwner.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
            const randomValue = utils.random(0, 1000);
            let currentMineNumber = 0;
            if (this.room.sceneId === 0) {
                if (randomValue > 990) {
                    currentMineNumber = 6;
                }
                else if (randomValue > 970) {
                    currentMineNumber = 5;
                }
                else if (randomValue > 930) {
                    currentMineNumber = 4;
                }
                else if (randomValue > 840) {
                    currentMineNumber = 3;
                }
                else if (randomValue > 700) {
                    currentMineNumber = 2;
                }
                else if (randomValue > 460) {
                    currentMineNumber = 1;
                }
                else {
                    currentMineNumber = 0;
                }
            }
            else {
                if (randomValue > 994) {
                    currentMineNumber = 6;
                }
                else if (randomValue > 982) {
                    currentMineNumber = 5;
                }
                else if (randomValue > 959) {
                    currentMineNumber = 4;
                }
                else if (randomValue > 909) {
                    currentMineNumber = 3;
                }
                else if (randomValue > 829) {
                    currentMineNumber = 2;
                }
                else if (randomValue > 589) {
                    currentMineNumber = 1;
                }
                else {
                    currentMineNumber = 0;
                }
            }
            this.room.currentRedPacketList = this.randomRedPacketList(redParketNum, redPacketAmount, currentMineNumber);
        }
        else if (await this.room.control.isControl(redPacketOwner)) {
            const { personalControlPlayers } = await this.room.control.getControlResult([(0, utils_1.filterProperty)(redPacketOwner)]);
            if (personalControlPlayers.length > 0) {
                const randomValue = utils.random(0, 100);
                const currentMineNumber = randomValue > personalControlPlayers[0].probability ? 1 : 0;
                this.room.currentRedPacketList = this.randomRedPacketList(redParketNum, redPacketAmount, mineNumber, currentMineNumber);
            }
            else {
                this.room.currentRedPacketList = this.randomRedPacketList(redParketNum, redPacketAmount, mineNumber, 0);
            }
        }
        else if (redPacketOwner.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER) {
            const randomValue = utils.random(0, 1000);
            let currentMineNumber = 0;
            if (this.room.sceneId === 0) {
                if (randomValue > 990) {
                    currentMineNumber = 6;
                }
                else if (randomValue > 970) {
                    currentMineNumber = 5;
                }
                else if (randomValue > 930) {
                    currentMineNumber = 4;
                }
                else if (randomValue > 840) {
                    currentMineNumber = 3;
                }
                else if (randomValue > 700) {
                    currentMineNumber = 2;
                }
                else if (randomValue > 460) {
                    currentMineNumber = 1;
                }
                else {
                    currentMineNumber = 0;
                }
            }
            else {
                if (randomValue > 994) {
                    currentMineNumber = 6;
                }
                else if (randomValue > 982) {
                    currentMineNumber = 5;
                }
                else if (randomValue > 959) {
                    currentMineNumber = 4;
                }
                else if (randomValue > 909) {
                    currentMineNumber = 3;
                }
                else if (randomValue > 829) {
                    currentMineNumber = 2;
                }
                else if (randomValue > 589) {
                    currentMineNumber = 1;
                }
                else {
                    currentMineNumber = 0;
                }
            }
            this.room.currentRedPacketList = this.randomRedPacketList(redParketNum, redPacketAmount, currentMineNumber);
        }
        else {
            const randomValue = utils.random(0, 1000);
            let currentMineNumber = 0;
            if (this.room.sceneId === 0) {
                if (randomValue > 990) {
                    currentMineNumber = 6;
                }
                else if (randomValue > 970) {
                    currentMineNumber = 5;
                }
                else if (randomValue > 930) {
                    currentMineNumber = 4;
                }
                else if (randomValue > 840) {
                    currentMineNumber = 3;
                }
                else if (randomValue > 700) {
                    currentMineNumber = 2;
                }
                else if (randomValue > 460) {
                    currentMineNumber = 1;
                }
                else {
                    currentMineNumber = 0;
                }
            }
            else {
                if (randomValue > 994) {
                    currentMineNumber = 6;
                }
                else if (randomValue > 982) {
                    currentMineNumber = 5;
                }
                else if (randomValue > 959) {
                    currentMineNumber = 4;
                }
                else if (randomValue > 909) {
                    currentMineNumber = 3;
                }
                else if (randomValue > 829) {
                    currentMineNumber = 2;
                }
                else if (randomValue > 589) {
                    currentMineNumber = 1;
                }
                else {
                    currentMineNumber = 0;
                }
            }
            this.room.currentRedPacketList = this.randomRedPacketList(redParketNum, redPacketAmount, currentMineNumber);
        }
        this.room.currentGraberQueue = this.room.currentRedPacketList.map((amountStr, idx) => {
            const isStepInMine = amountStr.toString().split('').reverse()[0] === mineNumber.toString();
            return {
                grabUid: null,
                hasGrabed: false,
                grabTime: 0,
                redPacketListIdx: idx,
                redPacketAmount: amountStr,
                isStepInMine,
                nickname: null,
                gold: 0,
                headurl: null,
            };
        });
    }
    canBeSettled() {
        return this.room.currentGraberQueue.length === this.room.sceneInfo.redParketNum || this.room.tmp_countDown === 0;
    }
    getHasMineInRedPacket(uid) {
        const grabRedPacketIdx = this.room.currentGraberQueue.findIndex((graberRedPacket) => !graberRedPacket.hasGrabed && graberRedPacket.isStepInMine);
        if (grabRedPacketIdx >= 0) {
            const player = this.room.getPlayer(uid);
            const graberRedPacket = this.room.currentGraberQueue[grabRedPacketIdx];
            graberRedPacket.grabUid = uid;
            graberRedPacket.hasGrabed = true;
            graberRedPacket.grabTime = Date.now();
            graberRedPacket.nickname = player.nickname;
            graberRedPacket.gold = player.gold;
            graberRedPacket.headurl = player.headurl;
            return graberRedPacket.isStepInMine;
        }
        return this.getRedPacketByRandom(uid);
    }
    getRedPacketByRandom(uid) {
        const grabRedPacketIdx = this.room.currentGraberQueue.findIndex((graberRedPacket) => !graberRedPacket.hasGrabed);
        if (grabRedPacketIdx < 0) {
            const p = this.room.getPlayer(uid);
            return ApiResult_1.ApiResult.ERROR(null, (0, langsrv_1.getlanguage)(p.language, langsrv_1.Net_Message.id_8116));
        }
        ;
        const graberRedPacket = this.room.currentGraberQueue[grabRedPacketIdx];
        const player = this.room.getPlayer(uid);
        graberRedPacket.grabUid = uid;
        graberRedPacket.hasGrabed = true;
        graberRedPacket.grabTime = Date.now();
        graberRedPacket.nickname = player.nickname;
        graberRedPacket.gold = player.gold;
        graberRedPacket.headurl = player.headurl;
        return graberRedPacket.isStepInMine;
    }
    getNotHasMineInRedPacket(uid) {
        const grabRedPacketIdx = this.room.currentGraberQueue.findIndex((graberRedPacket) => !graberRedPacket.hasGrabed && !graberRedPacket.isStepInMine);
        if (grabRedPacketIdx < 0)
            return this.getRedPacketByRandom(uid);
        const graberRedPacket = this.room.currentGraberQueue[grabRedPacketIdx];
        const player = this.room.getPlayer(uid);
        graberRedPacket.grabUid = uid;
        graberRedPacket.hasGrabed = true;
        graberRedPacket.grabTime = Date.now();
        graberRedPacket.nickname = player.nickname;
        graberRedPacket.gold = player.gold;
        graberRedPacket.headurl = player.headurl;
        return true;
    }
}
exports.default = StateGameAction;
StateGameAction.roomCodeList = [];
StateGameAction.instanceMap = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVHYW1lQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcmVkUGFja2V0L2xpYi9leHBhbnNpb24vcm9vbUV4cGFuc2lvbi9TdGF0ZUdhbWVBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxnRkFBNkU7QUFHN0UsNkVBQTBFO0FBQzFFLG9EQUFxRDtBQUNyRCxvRUFBaUU7QUFDakUsb0VBQWtGO0FBQ2xGLGdEQUFzRDtBQUV0RCxNQUFxQixlQUFlO0lBa0JsQyxZQUFZLElBQVU7UUFDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQVhELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBVSxFQUFFLGFBQXFCO1FBQ2xELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDNUQ7UUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQVVELDBCQUEwQixDQUFDLFNBQXFCO1FBRTlDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV2QyxNQUFNLDhCQUE4QixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWTthQUMxRCxNQUFNLENBQUMsQ0FBQyxTQUFxQixFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLGlEQUF1QixDQUFDLElBQUksQ0FBQzthQUNwRixJQUFJLENBQUMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUzRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssaURBQXVCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0lBQ25NLENBQUM7SUFFRCxpQ0FBaUMsQ0FBQyxHQUFXO1FBQzNDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBT3pELENBQUM7SUFRRCxrQkFBa0IsQ0FBQyxHQUFXLEVBQUUsTUFBYztRQUM1QyxJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNsQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RCxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLE9BQU8sSUFBSSxJQUFJLENBQUM7WUFDaEIsSUFBSSxJQUFJLElBQUksQ0FBQztTQUNkO1FBQ0QsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE9BQU8sYUFBYSxDQUFDO0lBQ3ZCLENBQUM7SUFXRCxtQkFBbUIsQ0FBQyxlQUF1QixFQUFFLE1BQWMsRUFBRSxPQUFlLEVBQUUsYUFBc0I7UUFDbEcsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzNDLElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1FBQzlCLElBQUksbUJBQW1CLEdBQUcsRUFBRSxDQUFDO1FBRTdCLEdBQUc7WUFDRCxJQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztZQUkxQixJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBR3JFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDO2dCQUFFLFNBQVM7WUFHOUYsSUFBSSxhQUFhLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDN0QsSUFBSSxNQUFNLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztnQkFDdEIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO1lBQzlGLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUdOLElBQUksYUFBYSxHQUFHLFVBQVU7Z0JBQUUsU0FBUztZQUd6QyxJQUFJLE9BQU8sYUFBYSxLQUFLLFFBQVEsSUFBSSxhQUFhLElBQUksVUFBVSxJQUFJLGFBQWEsS0FBSyxhQUFhO2dCQUFFLFNBQVM7WUFFbEgsbUJBQW1CLEdBQUcsZ0JBQWdCLENBQUM7WUFFdkMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO1NBRTVCLFFBQVEsa0JBQWtCLEVBQUU7UUFFN0IsT0FBTyxtQkFBbUIsQ0FBQztJQUM3QixDQUFDO0lBS0QsS0FBSyxDQUFDLHlCQUF5QjtRQUU3QixNQUFNLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBSzVFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekQsTUFBTSxTQUFTLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQztRQUM5RCxNQUFNLGVBQWUsR0FBVyxNQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDOUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU1RyxJQUFJLGNBQWMsQ0FBQyxPQUFPLEtBQUssbUJBQVEsQ0FBQyxLQUFLLEVBQUU7WUFDN0MsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUMsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7WUFFMUIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQUU7Z0JBRTNCLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFckIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTSxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRTVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUU1QixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFNUIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTSxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRTVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUU1QixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUVMLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7YUFDRjtpQkFBTTtnQkFFTCxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRXJCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUU1QixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFNUIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTSxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRTVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUU1QixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFNUIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTTtvQkFFTCxpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO2FBQ0Y7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDN0c7YUFBTSxJQUFJLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBRTVELE1BQU0sRUFBRSxzQkFBc0IsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFBLHNCQUFjLEVBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlHLElBQUksc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDckMsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0saUJBQWlCLEdBQUcsV0FBVyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RGLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUM7YUFDekg7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDekc7U0FFRjthQUFNLElBQUksY0FBYyxDQUFDLE9BQU8sS0FBSyxtQkFBUSxDQUFDLFdBQVcsRUFBRTtZQUUxRCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxQyxJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQztZQUUxQixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLENBQUMsRUFBRTtnQkFFM0IsSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUVyQixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFNUIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTSxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRTVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUU1QixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFNUIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTSxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRTVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU07b0JBRUwsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjthQUNGO2lCQUFNO2dCQUVMLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFckIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTSxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRTVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUU1QixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFNUIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTSxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRTVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUU1QixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUVMLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7YUFDRjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxlQUFlLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUM3RzthQUFNO1lBRUwsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUMsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7WUFFMUIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQUU7Z0JBRTNCLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFckIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTSxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRTVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUU1QixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFNUIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTSxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRTVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUU1QixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUVMLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7YUFDRjtpQkFBTTtnQkFFTCxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRXJCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUU1QixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFNUIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTSxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBRTVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFO29CQUU1QixpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRTtvQkFFNUIsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTTtvQkFFTCxpQkFBaUIsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO2FBQ0Y7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FRN0c7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ25GLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzNGLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsU0FBUyxFQUFFLEtBQUs7Z0JBQ2hCLFFBQVEsRUFBRSxDQUFDO2dCQUNYLGdCQUFnQixFQUFFLEdBQUc7Z0JBQ3JCLGVBQWUsRUFBRSxTQUFTO2dCQUMxQixZQUFZO2dCQUNaLFFBQVEsRUFBRSxJQUFJO2dCQUNkLElBQUksRUFBRSxDQUFDO2dCQUNQLE9BQU8sRUFBRSxJQUFJO2FBQ2QsQ0FBQTtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQVFELFlBQVk7UUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsS0FBSyxDQUFDLENBQUE7SUFDbEgsQ0FBQztJQU1ELHFCQUFxQixDQUFDLEdBQVc7UUFFL0IsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDLGVBQWlDLEVBQUUsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsSUFBSSxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbkssSUFBSSxnQkFBZ0IsSUFBSSxDQUFDLEVBQUU7WUFDekIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFeEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3ZFLGVBQWUsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQzlCLGVBQWUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ2pDLGVBQWUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3RDLGVBQWUsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUMzQyxlQUFlLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDbkMsZUFBZSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQ3pDLE9BQU8sZUFBZSxDQUFDLFlBQVksQ0FBQztTQUNyQztRQUVELE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFNRCxvQkFBb0IsQ0FBQyxHQUFXO1FBRTlCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxlQUFpQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuSSxJQUFJLGdCQUFnQixHQUFHLENBQUMsRUFBRTtZQUN4QixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQyxPQUFPLHFCQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFBLHFCQUFXLEVBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDNUU7UUFBQSxDQUFDO1FBRUYsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXZFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLGVBQWUsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQzlCLGVBQWUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLGVBQWUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RDLGVBQWUsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUMzQyxlQUFlLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDbkMsZUFBZSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBRXpDLE9BQU8sZUFBZSxDQUFDLFlBQVksQ0FBQztJQUN0QyxDQUFDO0lBUUQsd0JBQXdCLENBQUMsR0FBVztRQUVsQyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsZUFBaUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXBLLElBQUksZ0JBQWdCLEdBQUcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWhFLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUV2RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QyxlQUFlLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztRQUM5QixlQUFlLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUNqQyxlQUFlLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QyxlQUFlLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDM0MsZUFBZSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ25DLGVBQWUsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUN6QyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7O0FBM1pILGtDQTRaQztBQXZaUSw0QkFBWSxHQUFhLEVBQUUsQ0FBQztBQUU1QiwyQkFBVyxHQUFXLEVBQUUsQ0FBQyJ9