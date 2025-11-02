import { BlackJackRoomImpl } from "../../BlackJackRoomImpl";
import { BlackJackPlayerImpl } from "../../BlackJackPlayerImpl";
import { BlackJackRoomChannelEventName } from "../../enum/BlackJackRoomChannelEventName";
import { BlackJackBetArea } from "../BlackJackBetArea";
import { BlackJackPlayerStatusEnum } from "../../enum/BlackJackPlayerStatusEnum";
import { BlackJackPlayerRoleEnum } from "../../enum/BlackJackPlayerRoleEnum";
import { RoleEnum } from "../../../../../common/constant/player/RoleEnum";

export class BlackJackRoomChannelForPlayer {

    room: BlackJackRoomImpl;

    static roomIdList: string[] = [];

    static instanceMap: object = {};

    static getInstance(room: BlackJackRoomImpl, roomId: string): BlackJackRoomChannelForPlayer {
        if (this.roomIdList.findIndex(roomId => roomId === roomId) < 0) {
            this.roomIdList.push(roomId);
            this.instanceMap[roomId] = new BlackJackRoomChannelForPlayer(room);
        }

        return this.instanceMap[roomId];
    }

    constructor(room: BlackJackRoomImpl) {
        this.room = room;
    }

    /**
     * 群发 - 有玩家离线广播
     * @param playerList 玩家列表
     */
    playerOffLineToAllPlayer(playerList: Array<BlackJackPlayerImpl>) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.PlayerOffLine, {
            playerList: playerList.map(
                ({ uid, headurl, nickname, gold }) => ({ uid, headurl, nickname, gold }))
        });
    }

    /**
     * 群发 - 玩家进入
     * @param playerList 玩家列表
     */
    playerListWithUpdate() {
        let rankingList = this.room.rankinglist();
        let firstPlayer;
        if (rankingList.length > 0) {
            firstPlayer = rankingList[0];
            const otherPlayerList = rankingList.slice(1).sort((a, b) => b.gold - a.gold);
            rankingList = [firstPlayer, ...otherPlayerList];
        }
        this.room.channelIsPlayer( BlackJackRoomChannelEventName.PlayerListWithUpdate,
            {
                players: this.room.players
                    .filter(p => p.role === BlackJackPlayerRoleEnum.Player)
                    .map(({ uid, headurl, nickname, gold, totalBet }) => ({ uid, headurl, nickname, gold: gold - totalBet })),
                rankingList: rankingList.slice(0, 6)

            }
        );
    }

    /**
     * 群发 - 玩家离开
     */
    playerLeaveToAllPlayer(playerList: Array<BlackJackPlayerImpl>) {
        let rankingList = this.room.rankinglist();
        let firstPlayer;
        if (rankingList.length > 0) {
            firstPlayer = rankingList[0];
            const otherPlayerList = rankingList.slice(1).sort((a, b) => b.gold - a.gold);
            rankingList = [firstPlayer, ...otherPlayerList];
        }
        this.room.channelIsPlayer(
            BlackJackRoomChannelEventName.PlayerLeave,
            {
                players: playerList
                    .filter(p => p.role === BlackJackPlayerRoleEnum.Player)
                    .map(({ uid, headurl, nickname, gold, totalBet }) => ({ uid, headurl, nickname, gold: gold - totalBet })),
                rankingList: rankingList.slice(0, 6)

            }
        );
    }

    /**
     * 群发 - 通知玩家下注
     * @param countDown 计时器
     */
    bettingToAllPlayer(roundId: string, countDown: number) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.Betting, { roundId, countDown });
        /* this.room.players
            .filter(p => p.role !== BlackJackPlayerRoleEnum.Dealer && p.isRobot === RoleEnum.ROBOT)
            .forEach(p => {
                p.event.emit(`${BlackJackRoomChannelEventName.Betting}`, { roundId, countDown })
            }); */
        // BlackJackRoomChannelEventName
    }

    /**
     * 群发 - 展示牌
     * @param dealerPoker 庄家牌
     * @param commonPokerList 闲家牌
     */
    showPokerToAllPlayer(
        dealerPoker: { pokerList: Array<number>, countList: Array<number> },
        commonPokerList: Array<{ pokerList: Array<number>, countList: Array<number> }>
    ) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.ShowInitPokerList, {
            dealerPoker,
            commonPokerList
        });

        /* this.room.players
            .filter(p => p.isRobot === RoleEnum.ROBOT)
            .forEach(p => p.event.emit(`${BlackJackRoomChannelEventName.ShowInitPokerList}`, {
                dealerPoker,
                commonPokerList
            })); */
    }

    /**
     * 群发 - 已下注玩家是否购买保险
     * @param areaIdx    区域列表
     * @param playerList 玩家列表
     * @description 保险阶段
     */
    insuranceToAllPlayer(areaIdx: number, playerList: Array<BlackJackPlayerImpl>) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.Insurance, {
            countDown: this.room.runtimeData.getCurrentCountdown(),
            areaIdx,
            playerList: playerList.map((p) => ({ uid: p.uid, bet: p.commonAreaBetList[areaIdx].getCurrentBet() }))
        });
    }

    /**
     * 群发 - 展示庄家第二张牌
     * @param dealerPoker 庄家手牌和点数
     * @description 保险阶段
     */
    showDealerPokerToAllPlayer(dealerPoker: { pokerList: Array<number>, countList: Array<number> }) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.ShowDealerPokerList, {
            dealerPoker
        });
    }

    /**
     * 群发 - 通知玩家进行操作
     * @param areaIdx         区域
     * @param playerList      玩家列表
     * @param isSeparatePoker 是否分牌区域
     * @description 玩家阶段
     */
    noticeActionToAllPlayer(areaIdx: number, playerList: Array<BlackJackPlayerImpl>, isSeparatePoker: boolean = false) {

        this.room.channelIsPlayer(BlackJackRoomChannelEventName.Player, {
            countDown: this.room.runtimeData.getCurrentCountdown(),
            commonPokerList: this.room.runtimeData.getCommonPokerListAndCount(),
            separatePokerList: this.room.runtimeData.getSeparatePokerListAndCount(),
            areaIdx,
            playerList: playerList.map(({ uid, actionList, canAction, commonAreaBetList, separateAreaBetList }) => {
                const commonPokerList = commonAreaBetList.map(area => ({ ...area.getPokerAndCount() }));

                const separatePokerList = separateAreaBetList.map(area => ({ ...area.getPokerAndCount() }));

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

        /* this.room.players
            .filter(p => p.isRobot === RoleEnum.ROBOT && p.status === BlackJackPlayerStatusEnum.Game)
            .forEach(p => p.event.emit(`${BlackJackRoomChannelEventName.Player}`, {
                countDown: this.room.runtimeData.getCurrentCountdown(),
                commonPokerList: this.room.runtimeData.getCommonPokerListAndCount(),
                separatePokerList: this.room.runtimeData.getSeparatePokerListAndCount(),
                areaIdx,
                playerList: playerList.map(({ uid, actionList, canAction, commonAreaBetList, separateAreaBetList }) => {
                    const commonPokerList = commonAreaBetList.map(area => ({ ...area.getPokerAndCount() }));

                    const separatePokerList = separateAreaBetList.map(area => ({ ...area.getPokerAndCount() }));

                    return {
                        uid,
                        actionList,
                        canAction,
                        commonPokerList,
                        separatePokerList
                    };
                }),
                isSeparatePoker
            })); */
    }

    /**
     * 群发 - 通知前端进行分牌操作
     * @param areaIdx         区域
     * @param playerList      玩家列表
     * @description 玩家阶段 - 每个区域首次操作后可能发生
     */
    noticeSeparateActionToAllPlayer(areaIdx: number, playerList: Array<BlackJackPlayerImpl>) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.Player_Separate, {
            countDown: this.room.runtimeData.getCurrentCountdown(),
            commonPokerList: this.room.runtimeData.getCommonPokerListAndCount(),
            separatePokerList: this.room.runtimeData.getSeparatePokerListAndCount(),
            areaIdx,
            playerList: playerList.map(({ uid, actionList, canAction, commonAreaBetList, separateAreaBetList }) => {
                const commonPokerList = commonAreaBetList.map(area => ({ ...area.getPokerAndCount() }));

                const separatePokerList = separateAreaBetList.map(area => ({ ...area.getPokerAndCount() }));

                return {
                    uid,
                    actionList,
                    canAction,
                    commonPokerList,
                    separatePokerList
                };
            })
        })
    }

    /**
     * 群发 - 闲家阶段 计时器末 广播牌等信息
     * @param areaIdx 
     * @param beSeparate 
     * @param playerList 
     * @param currentAreaList 
     */
    showPlayerListPokerToAllPlayer(areaIdx: number, beSeparate: boolean, playerList: Array<BlackJackPlayerImpl>, currentAreaList: Array<{ pokerList: Array<number>, countList: Array<number> }>) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.playerPokerList, {
            currentAreaIdx: areaIdx,
            currentAreaList,
            separateAreaList: this.room.runtimeData.getSeparatePokerListAndCount(),
            beSeparate,
            playerList: playerList.map(({ uid, actionList, canAction, commonAreaBetList, separateAreaBetList }) => {
                const commonPokerList = commonAreaBetList.map(area => ({ ...area.getPokerAndCount() }));

                const separatePokerList = separateAreaBetList.map(area => ({ ...area.getPokerAndCount() }));

                return {
                    uid,
                    actionList,
                    canAction,
                    commonPokerList,
                    separatePokerList
                };
            })
        })
    }

    /**
     * 群发 - 展示庄家手牌
     * @param dealerPoker 庄家手牌和点数
     * @description 庄家阶段
     */
    showDealerPokerAfterHitPoker(dealerPoker: { pokerList: Array<number>, countList: Array<number> }) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.Dealer, {
            dealerPoker
        })
    }

    /**
     * 群发 - 展示结算结果
     * @description 结算阶段
     */
    showSettlementResult(playerList: Array<BlackJackPlayerImpl>) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.Settlement, {
            countDown: this.room.runtimeData.getCurrentCountdown(),
            playerList: playerList.map(({
                uid, headurl, nickname, gold, seatNum,
                profitQueue
            }) => ({
                uid, headurl, nickname, gold, seatNum,
                profit: profitQueue.reverse()[0]
            }))
        });

        /* this.room.players
            .filter(p => p.isRobot === RoleEnum.ROBOT && p.status === BlackJackPlayerStatusEnum.Game)
            .forEach(p => p.event.emit(`${BlackJackRoomChannelEventName.Settlement}`, {
                countDown: this.room.runtimeData.getCurrentCountdown(),
                playerList: playerList.map(({
                    uid, headurl, nickname, gold, seatNum,
                    profitQueue
                }) => ({
                    uid, headurl, nickname, gold, seatNum,
                    profit: profitQueue.reverse()[0]
                }))
            })); */
    }

    /**
     * 群发 - 有人下注
     */
    someOneBeting(areaIdx: number, { uid, headurl, gold, totalBet, commonAreaBetList }: BlackJackPlayerImpl, bet: number) {
        const areaTotalBet = this.room.runtimeData.getTotalBetByAreaIdx(areaIdx);
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.SomeOneBeting, {
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
        })
    }

    /**
     * 群发 - 有人加倍
     */
    someOneMultiple(areaIdx: number, { uid, headurl, gold, totalBet, commonAreaBetList, separateAreaBetList }: BlackJackPlayerImpl, bet: number, areaTotalBet: number) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.SomeOneMultiple, {
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
        })
    }

    /**
     * 群发 - 有人分牌
     */
    someOneSeparate(areaIdx: number, { uid, headurl, gold, totalBet, commonAreaBetList, separateAreaBetList }: BlackJackPlayerImpl, bet: number, areaTotalBet: number) {
        this.room.channelIsPlayer(BlackJackRoomChannelEventName.SomeOneSeparate, {
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
        })
    }

    /**
     * 玩家操作后的信息推送
     */
    playerActionResult() {

    }
}
