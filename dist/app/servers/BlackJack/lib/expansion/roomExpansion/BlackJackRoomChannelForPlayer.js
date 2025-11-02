"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackRoomChannelForPlayer = void 0;
const BlackJackRoomChannelEventName_1 = require("../../enum/BlackJackRoomChannelEventName");
const BlackJackPlayerRoleEnum_1 = require("../../enum/BlackJackPlayerRoleEnum");
class BlackJackRoomChannelForPlayer {
    constructor(room) {
        this.room = room;
    }
    static getInstance(room, roomId) {
        if (this.roomIdList.findIndex(roomId => roomId === roomId) < 0) {
            this.roomIdList.push(roomId);
            this.instanceMap[roomId] = new BlackJackRoomChannelForPlayer(room);
        }
        return this.instanceMap[roomId];
    }
    playerOffLineToAllPlayer(playerList) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.PlayerOffLine, {
            playerList: playerList.map(({ uid, headurl, nickname, gold }) => ({ uid, headurl, nickname, gold }))
        });
    }
    playerListWithUpdate() {
        let rankingList = this.room.rankinglist();
        let firstPlayer;
        if (rankingList.length > 0) {
            firstPlayer = rankingList[0];
            const otherPlayerList = rankingList.slice(1).sort((a, b) => b.gold - a.gold);
            rankingList = [firstPlayer, ...otherPlayerList];
        }
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.PlayerListWithUpdate, {
            players: this.room.players
                .filter(p => p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player)
                .map(({ uid, headurl, nickname, gold, totalBet }) => ({ uid, headurl, nickname, gold: gold - totalBet })),
            rankingList: rankingList.slice(0, 6)
        });
    }
    playerLeaveToAllPlayer(playerList) {
        let rankingList = this.room.rankinglist();
        let firstPlayer;
        if (rankingList.length > 0) {
            firstPlayer = rankingList[0];
            const otherPlayerList = rankingList.slice(1).sort((a, b) => b.gold - a.gold);
            rankingList = [firstPlayer, ...otherPlayerList];
        }
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.PlayerLeave, {
            players: playerList
                .filter(p => p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player)
                .map(({ uid, headurl, nickname, gold, totalBet }) => ({ uid, headurl, nickname, gold: gold - totalBet })),
            rankingList: rankingList.slice(0, 6)
        });
    }
    bettingToAllPlayer(roundId, countDown) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.Betting, { roundId, countDown });
    }
    showPokerToAllPlayer(dealerPoker, commonPokerList) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.ShowInitPokerList, {
            dealerPoker,
            commonPokerList
        });
    }
    insuranceToAllPlayer(areaIdx, playerList) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.Insurance, {
            countDown: this.room.runtimeData.getCurrentCountdown(),
            areaIdx,
            playerList: playerList.map((p) => ({ uid: p.uid, bet: p.commonAreaBetList[areaIdx].getCurrentBet() }))
        });
    }
    showDealerPokerToAllPlayer(dealerPoker) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.ShowDealerPokerList, {
            dealerPoker
        });
    }
    noticeActionToAllPlayer(areaIdx, playerList, isSeparatePoker = false) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.Player, {
            countDown: this.room.runtimeData.getCurrentCountdown(),
            commonPokerList: this.room.runtimeData.getCommonPokerListAndCount(),
            separatePokerList: this.room.runtimeData.getSeparatePokerListAndCount(),
            areaIdx,
            playerList: playerList.map(({ uid, actionList, canAction, commonAreaBetList, separateAreaBetList }) => {
                const commonPokerList = commonAreaBetList.map(area => (Object.assign({}, area.getPokerAndCount())));
                const separatePokerList = separateAreaBetList.map(area => (Object.assign({}, area.getPokerAndCount())));
                return {
                    uid,
                    actionList,
                    canAction,
                    commonPokerList,
                    separatePokerList
                };
            }),
            isSeparatePoker
        });
    }
    noticeSeparateActionToAllPlayer(areaIdx, playerList) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.Player_Separate, {
            countDown: this.room.runtimeData.getCurrentCountdown(),
            commonPokerList: this.room.runtimeData.getCommonPokerListAndCount(),
            separatePokerList: this.room.runtimeData.getSeparatePokerListAndCount(),
            areaIdx,
            playerList: playerList.map(({ uid, actionList, canAction, commonAreaBetList, separateAreaBetList }) => {
                const commonPokerList = commonAreaBetList.map(area => (Object.assign({}, area.getPokerAndCount())));
                const separatePokerList = separateAreaBetList.map(area => (Object.assign({}, area.getPokerAndCount())));
                return {
                    uid,
                    actionList,
                    canAction,
                    commonPokerList,
                    separatePokerList
                };
            })
        });
    }
    showPlayerListPokerToAllPlayer(areaIdx, beSeparate, playerList, currentAreaList) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.playerPokerList, {
            currentAreaIdx: areaIdx,
            currentAreaList,
            separateAreaList: this.room.runtimeData.getSeparatePokerListAndCount(),
            beSeparate,
            playerList: playerList.map(({ uid, actionList, canAction, commonAreaBetList, separateAreaBetList }) => {
                const commonPokerList = commonAreaBetList.map(area => (Object.assign({}, area.getPokerAndCount())));
                const separatePokerList = separateAreaBetList.map(area => (Object.assign({}, area.getPokerAndCount())));
                return {
                    uid,
                    actionList,
                    canAction,
                    commonPokerList,
                    separatePokerList
                };
            })
        });
    }
    showDealerPokerAfterHitPoker(dealerPoker) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.Dealer, {
            dealerPoker
        });
    }
    showSettlementResult(playerList) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.Settlement, {
            countDown: this.room.runtimeData.getCurrentCountdown(),
            playerList: playerList.map(({ uid, headurl, nickname, gold, seatNum, profitQueue }) => ({
                uid, headurl, nickname, gold, seatNum,
                profit: profitQueue.reverse()[0]
            }))
        });
    }
    someOneBeting(areaIdx, { uid, headurl, gold, totalBet, commonAreaBetList }, bet) {
        const areaTotalBet = this.room.runtimeData.getTotalBetByAreaIdx(areaIdx);
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.SomeOneBeting, {
            areaBetInfo: {
                areaTotalBet,
                areaIdx
            },
            playerBetInfo: {
                areaIdx,
                uid,
                headurl,
                gold: gold - totalBet,
                totalBet,
                currentBet: bet,
                commonAreaList: commonAreaBetList.map(area => ({
                    bet: area.getCurrentBet()
                }))
            }
        });
    }
    someOneMultiple(areaIdx, { uid, headurl, gold, totalBet, commonAreaBetList, separateAreaBetList }, bet, areaTotalBet) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.SomeOneMultiple, {
            areaBetInfo: {
                areaTotalBet,
                areaIdx
            },
            playerBetInfo: {
                areaIdx,
                uid,
                headurl,
                gold: gold - totalBet,
                totalBet,
                currentBet: bet,
                commonAreaList: commonAreaBetList.map(area => ({
                    bet: area.getCurrentBet()
                })),
                separateAreaList: separateAreaBetList.map(area => ({
                    bet: area.getCurrentBet()
                }))
            }
        });
    }
    someOneSeparate(areaIdx, { uid, headurl, gold, totalBet, commonAreaBetList, separateAreaBetList }, bet, areaTotalBet) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.SomeOneSeparate, {
            areaBetInfo: {
                areaTotalBet,
                areaIdx
            },
            playerBetInfo: {
                areaIdx,
                uid,
                headurl,
                gold: gold - totalBet,
                totalBet,
                currentBet: bet,
                commonAreaList: commonAreaBetList.map(area => ({
                    bet: area.getCurrentBet()
                })),
                separateAreaList: separateAreaBetList.map(area => ({
                    bet: area.getCurrentBet()
                }))
            }
        });
    }
    playerActionResult() {
    }
}
exports.BlackJackRoomChannelForPlayer = BlackJackRoomChannelForPlayer;
BlackJackRoomChannelForPlayer.roomIdList = [];
BlackJackRoomChannelForPlayer.instanceMap = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrUm9vbUNoYW5uZWxGb3JQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CbGFja0phY2svbGliL2V4cGFuc2lvbi9yb29tRXhwYW5zaW9uL0JsYWNrSmFja1Jvb21DaGFubmVsRm9yUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDRGQUF5RjtBQUd6RixnRkFBNkU7QUFHN0UsTUFBYSw2QkFBNkI7SUFpQnRDLFlBQVksSUFBdUI7UUFDL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQVhELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBdUIsRUFBRSxNQUFjO1FBQ3RELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzVELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN0RTtRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBVUQsd0JBQXdCLENBQUMsVUFBc0M7UUFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsNkRBQTZCLENBQUMsYUFBYSxFQUFFO1lBQ25FLFVBQVUsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUN0QixDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ2hGLENBQUMs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