"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackRoomImpl = void 0;
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const BlackJackPlayerImpl_1 = require("./BlackJackPlayerImpl");
const pinus_1 = require("pinus");
const BlackJackRoomStatusEnum_1 = require("./enum/BlackJackRoomStatusEnum");
const BlackJackRuntimeData_1 = require("./expansion/roomExpansion/BlackJackRuntimeData");
const BlackJackRoomChannelForPlayer_1 = require("./expansion/roomExpansion/BlackJackRoomChannelForPlayer");
const BlackJackPlayerRoleEnum_1 = require("./enum/BlackJackPlayerRoleEnum");
const BlackJackPlayerStatusEnum_1 = require("./enum/BlackJackPlayerStatusEnum");
const ApiResult_1 = require("../../../common/pojo/ApiResult");
const blackJack_state_1 = require("../../../common/systemState/blackJack.state");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const BlackJackSettlementAction_1 = require("./expansion/roomExpansion/BlackJackSettlementAction");
const index_1 = require("../../../utils/index");
const GameUtil_1 = require("../../../utils/GameUtil");
const BlackJackDealerActionStrategy_1 = require("./expansion/roomExpansion/BlackJackDealerActionStrategy");
const langsrv_1 = require("../../../services/common/langsrv");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_1 = require("../../../services/newControl/constants");
const control_1 = require("./control");
const pinus_logger_1 = require("pinus-logger");
const events_1 = require("events");
const robotlogger = (0, pinus_logger_1.getLogger)("server_out", __filename);
class BlackJackRoomImpl extends SystemRoom_1.SystemRoom {
    constructor(opts, roomManager) {
        super(opts);
        this.areaMaxBet = 1000000;
        this.roomStatus = BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.None;
        this.beRunning = false;
        this.processInterval = null;
        this.licensingAnimation = false;
        this.insuranceBeginning = false;
        this.waitForNoticeAreaListOnInsurance = [];
        this.waitForNoticePlayerList = [];
        this.beInsuranceToSettlement = false;
        this.playerBeginning = false;
        this.beSeparate = false;
        this.playerSeparateBeginning = false;
        this.playerSeparateFirstNotice = false;
        this.beAddPoker = false;
        this.currentNoticeAreaIdx = -1;
        this.beShowSecendPoker = false;
        this.control = new control_1.default({ room: this });
        this.settlementBeginning = false;
        this.playerGameHistoryMap = new Map();
        this.areaMaxBet = opts["areaMaxBet"];
        this.ChipList = opts.ChipList;
        this.lowBet = opts["lowBet"];
        this.roomUserLimit = opts["roomUserLimit"];
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.runtimeData = new BlackJackRuntimeData_1.BlackJackRuntimeData(this);
        this.settlementAction = BlackJackSettlementAction_1.BlackJackSettlementAction.getInstance(this, this.roomId);
        this.channelForPlayer = new BlackJackRoomChannelForPlayer_1.BlackJackRoomChannelForPlayer(this);
        this.dealerActionStrategy = BlackJackDealerActionStrategy_1.BlackJackDealerActionStrategy.getInstance(this, this.roomId);
        this.event = new events_1.EventEmitter();
        this.roomManager = roomManager;
    }
    init() {
        if (this.roomBeInit) {
            return;
        }
        this.roomBeInit = true;
        this.runtimeData.initRuntimeData();
        this.addPlayerInRoom(new BlackJackPlayerImpl_1.BlackJackPlayerImpl({
            role: BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Dealer
        }));
        this.run();
    }
    async run() {
        if (this.beRunning) {
            return;
        }
        this.beRunning = true;
        try {
            this.processInterval = setInterval(() => this.process.apply(this), 1e3);
        }
        catch (e) {
            robotlogger.error(`21点进程出错: ${e.stack}`);
        }
    }
    async process() {
        if (this.roomStatus !== BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.None) {
            this.runtimeData.decreaseToCountDown();
        }
        switch (this.roomStatus) {
            case BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.None: {
                await this.noneState();
                this.printLog('初始');
                break;
            }
            case BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Betting: {
                this.betState();
                this.printLog('押注');
                break;
            }
            case BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Licensing: {
                this.licensingState();
                this.printLog('发牌');
                break;
            }
            case BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Insurance: {
                this.insuranceState();
                this.printLog('保险');
                break;
            }
            case BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Player: {
                this.playerState();
                this.printLog('闲家');
                break;
            }
            case BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Dealer: {
                await this.dealerState();
                this.printLog('庄家');
                break;
            }
            case BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Settlement: {
                await this.settlementState();
                this.printLog('结算');
                break;
            }
            default:
                break;
        }
    }
    printLog(state) {
        const { rss, heapTotal, heapUsed, external } = process.memoryUsage();
    }
    async noneState() {
        await this.br_kickNoOnline();
        this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Betting);
        this.runtimeData.resetRoomInfoAndRestart();
        this.initRunData();
        this.startTime = Date.now();
        this.channelForPlayer.bettingToAllPlayer(this.roundId, this.runtimeData.getCurrentCountdown());
    }
    betState() {
        if (this.runtimeData.getCurrentCountdown() === 0) {
            if (!this.runtimeData.checkBettingToPlayer()) {
                this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.None);
                return;
            }
            this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Licensing);
        }
    }
    licensingState() {
        if (this.licensingAnimation) {
            if (this.runtimeData.getCurrentCountdown() === 0) {
                this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Insurance);
            }
            return;
        }
        const dealerPlayer = this.players.find(p => p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Dealer);
        if (!dealerPlayer) {
            throw new Error(`没有庄家`);
        }
        this.runtimeData.handoutPokerForCommonArea(BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Dealer);
        this.runtimeData.handoutPokerForCommonArea(BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player);
        const commonPokerInfoList = this.runtimeData.copyPokerFromCommonArea();
        const currentAreaPlayerList = this.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game &&
            p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player &&
            p.getCurrentTotalBet() > 0);
        currentAreaPlayerList.forEach(p => {
            commonPokerInfoList.forEach((playerArea, idx) => {
                const { basePokerList, baseCount } = playerArea;
                p.commonAreaBetList[idx].setPokerList([...basePokerList], [...baseCount]);
            });
        });
        this.channelForPlayer.showPokerToAllPlayer(this.runtimeData.getDealerPokerListAndCount(), this.runtimeData.getCommonPokerListAndCount());
        const second = commonPokerInfoList.reduce((second, { basePokerList }) => {
            if (basePokerList.length > 0)
                ++second;
            return second;
        }, 0);
        this.runtimeData.setSettlementCountdown(second);
        this.licensingAnimation = true;
    }
    insuranceState() {
        if (this.insuranceBeginning) {
            const currentCountdown = this.runtimeData.getCurrentCountdown();
            if (currentCountdown === 0) {
                const areaIdxOrFalse = this.runtimeData.nextAreaSpeakOnInsurance();
                if (typeof areaIdxOrFalse === "number") {
                    const waitToNoticePlayerList = this.waitForNoticePlayerList[areaIdxOrFalse];
                    this.channelForPlayer.insuranceToAllPlayer(areaIdxOrFalse, waitToNoticePlayerList);
                    return;
                }
                const dealerMaxCount = this.runtimeData.dealerHit();
                if (dealerMaxCount === 21) {
                    this.channelForPlayer.showDealerPokerToAllPlayer(this.runtimeData.getDealerPokerListAndCount());
                    this.beInsuranceToSettlement = true;
                    this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Settlement);
                    return;
                }
                this.runtimeData.rollbackBankerDeal();
                this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Player);
                return;
            }
            return;
        }
        if (!this.runtimeData.checkChangesToInsurance()) {
            const dealerMaxCount = this.runtimeData.dealerHit();
            if (dealerMaxCount === 21) {
                this.channelForPlayer.showDealerPokerToAllPlayer(this.runtimeData.getDealerPokerListAndCount());
                this.beInsuranceToSettlement = true;
                this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Settlement);
                return;
            }
            this.runtimeData.rollbackBankerDeal();
            this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Player);
            return;
        }
        this.insuranceBeginning = true;
        const insurancePlayerList = this.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game && p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player && p.getCurrentTotalBet() > 0);
        this.waitForNoticePlayerList = insurancePlayerList.reduce((playerList, player) => {
            player.commonAreaBetList.map((p, i) => {
                if (p.getCurrentBet() > 0) {
                    if (!this.waitForNoticeAreaListOnInsurance.includes(i)) {
                        this.waitForNoticeAreaListOnInsurance.push(i);
                    }
                    playerList[i].push(player);
                }
            });
            return playerList;
        }, [[], [], []]);
        const firstAreaIdx = this.runtimeData.nextAreaSpeakOnInsurance();
        if (typeof firstAreaIdx === "boolean") {
            this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Player);
            return;
        }
        const waitToNoticePlayerList = this.waitForNoticePlayerList[firstAreaIdx];
        this.channelForPlayer.insuranceToAllPlayer(firstAreaIdx, waitToNoticePlayerList);
    }
    playerState() {
        if (this.playerBeginning) {
            if (this.runtimeData.getCurrentCountdown() !== 0) {
                return;
            }
            if (this.beSeparate) {
                this.beSeparate = false;
                this.playerSeparateFirstNotice = true;
                const currentAreaPlayerList = this.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game &&
                    p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player &&
                    p.commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0);
                if (this.beAddPoker) {
                    this.beAddPoker = false;
                    const addPokerPlayerList = currentAreaPlayerList.filter((p) => p.commonAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction);
                    addPokerPlayerList.forEach(p => {
                        p.commonAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction = false;
                        p.commonAreaBetList[this.currentNoticeAreaIdx].playerHadAction = false;
                        p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = false;
                    });
                }
                this.playerSeparateBeginning = true;
                this.runtimeData.pasteSeparateAreaFromCommonArea(this.currentNoticeAreaIdx);
                const poker = this.runtimeData.getOnePokerFromPokerPool();
                this.runtimeData.addPokerIntoSeparateAreaByAreaIdx(this.currentNoticeAreaIdx, poker);
                this.runtimeData.nextAreaSpeakOnPlayer();
                const firstSeparateAreaActionPlayerList = currentAreaPlayerList.filter((p) => p.commonAreaBetList[this.currentNoticeAreaIdx].checkHadSeparate());
                firstSeparateAreaActionPlayerList.forEach(p => {
                    p.actionList.separate = false;
                    p.separateAreaBetList[this.currentNoticeAreaIdx].addPoker(poker);
                });
                this.channelForPlayer.noticeSeparateActionToAllPlayer(this.currentNoticeAreaIdx, firstSeparateAreaActionPlayerList);
                const commonAreaEveryPlayerBeActionComplete = currentAreaPlayerList.every(p => p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete);
                firstSeparateAreaActionPlayerList.forEach(p => {
                    p.commonAreaBetList[this.currentNoticeAreaIdx].playerHadAction = false;
                    p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = false;
                });
                if (!commonAreaEveryPlayerBeActionComplete) {
                    this.channelForPlayer.noticeActionToAllPlayer(this.currentNoticeAreaIdx, currentAreaPlayerList.filter(p => !p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete));
                }
                else {
                    this.channelForPlayer.noticeActionToAllPlayer(this.currentNoticeAreaIdx, firstSeparateAreaActionPlayerList, true);
                }
                return;
            }
            if (this.currentNoticeAreaIdx >= 3) {
                this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Dealer);
                return;
            }
            const currentAreaPlayerList = this.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game &&
                p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player &&
                p.commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0);
            if (this.beAddPoker) {
                const addPokerPlayerList = this.players.filter(p => p.commonAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction);
                if (addPokerPlayerList.length > 0) {
                    this.beAddPoker = false;
                    let poker = this.runtimeData.getOnePokerFromPokerPool();
                    const maxCount = this.runtimeData.addPokerIntoCommonAreaByAreaIdx(this.currentNoticeAreaIdx, poker);
                    addPokerPlayerList.forEach(p => {
                        p.commonAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction = false;
                        p.commonAreaBetList[this.currentNoticeAreaIdx].addPoker(poker);
                        if (maxCount >= 21) {
                            p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
                        }
                        if (p.commonAreaBetList[this.currentNoticeAreaIdx].getPokerAndCount().pokerList.length === 5) {
                            p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
                        }
                    });
                    const currentAreaList = this.runtimeData.getCommonPokerListAndCount();
                    this.channelForPlayer.showPlayerListPokerToAllPlayer(this.currentNoticeAreaIdx, this.beSeparate, addPokerPlayerList, currentAreaList);
                }
            }
            const commonAreaEveryPlayerBeActionComplete = currentAreaPlayerList.every(p => p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete);
            if (!commonAreaEveryPlayerBeActionComplete) {
                const continuePlayerList = currentAreaPlayerList.filter(p => p.commonAreaBetList[this.currentNoticeAreaIdx].playerHadAction &&
                    p.commonAreaBetList[this.currentNoticeAreaIdx].continueAction &&
                    !p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete);
                if (continuePlayerList.length !== 0) {
                    this.runtimeData.nextAreaSpeakOnPlayer();
                    continuePlayerList.forEach(p => {
                        p.actionList.multiple = false;
                        p.actionList.separate = false;
                        p.commonAreaBetList[this.currentNoticeAreaIdx].playerHadAction = false;
                    });
                    this.channelForPlayer.noticeActionToAllPlayer(this.currentNoticeAreaIdx, continuePlayerList.filter(({ commonAreaBetList }) => commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0));
                    return;
                }
                currentAreaPlayerList.forEach(p => {
                    p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
                });
            }
            if (this.beAddPoker) {
                const addPokerPlayerList = this.players.filter(p => p.separateAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction);
                if (addPokerPlayerList.length > 0) {
                    this.beAddPoker = false;
                    const poker = this.runtimeData.getOnePokerFromPokerPool();
                    const maxCount = this.runtimeData.addPokerIntoSeparateAreaByAreaIdx(this.currentNoticeAreaIdx, poker);
                    addPokerPlayerList.forEach(p => {
                        p.separateAreaBetList[this.currentNoticeAreaIdx].beAddPokerAction = false;
                        p.separateAreaBetList[this.currentNoticeAreaIdx].addPoker(poker);
                        if (maxCount >= 21) {
                            p.separateAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
                        }
                        if (p.separateAreaBetList[this.currentNoticeAreaIdx].getPokerAndCount().pokerList.length === 5) {
                            p.separateAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
                        }
                    });
                    const currentAreaList = this.runtimeData.getSeparatePokerListAndCount();
                    this.channelForPlayer.showPlayerListPokerToAllPlayer(this.currentNoticeAreaIdx, this.playerSeparateBeginning, addPokerPlayerList, currentAreaList);
                }
            }
            if (this.playerSeparateBeginning) {
                const separateAreaEveryPlayerBeActionComplete = currentAreaPlayerList.every(p => {
                    p.commonAreaBetList[this.currentNoticeAreaIdx].checkHadSeparate() &&
                        p.separateAreaBetList[this.currentNoticeAreaIdx].actionComplete;
                });
                if (!separateAreaEveryPlayerBeActionComplete) {
                    if (this.playerSeparateFirstNotice) {
                        if (!currentAreaPlayerList.every(p => p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete)) {
                            currentAreaPlayerList.filter(p => !p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete).forEach(p => {
                                p.commonAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
                            });
                        }
                        this.playerSeparateFirstNotice = false;
                        const firstSeparateAreaActionPlayerList = this.players.filter(p => p.commonAreaBetList[this.currentNoticeAreaIdx].checkHadSeparate());
                        firstSeparateAreaActionPlayerList.forEach(p => {
                            p.actionList.multiple = true;
                        });
                        this.runtimeData.nextAreaSpeakOnPlayer();
                        this.channelForPlayer.noticeActionToAllPlayer(this.currentNoticeAreaIdx, firstSeparateAreaActionPlayerList.filter(({ commonAreaBetList }) => commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0), true);
                        return;
                    }
                    const currentSeparateAreaPlayerList = currentAreaPlayerList.filter(p => p.commonAreaBetList[this.currentNoticeAreaIdx].checkHadSeparate() &&
                        p.separateAreaBetList[this.currentNoticeAreaIdx].playerHadAction &&
                        p.separateAreaBetList[this.currentNoticeAreaIdx].continueAction &&
                        !p.separateAreaBetList[this.currentNoticeAreaIdx].actionComplete);
                    if (currentSeparateAreaPlayerList.length !== 0) {
                        this.runtimeData.nextAreaSpeakOnPlayer();
                        currentSeparateAreaPlayerList.forEach(p => {
                            p.separateAreaBetList[this.currentNoticeAreaIdx].playerHadAction = false;
                            p.actionList.multiple = false;
                        });
                        this.channelForPlayer.noticeActionToAllPlayer(this.currentNoticeAreaIdx, currentSeparateAreaPlayerList.filter(({ commonAreaBetList }) => commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0), true);
                        return;
                    }
                    currentSeparateAreaPlayerList.forEach(p => {
                        p.separateAreaBetList[this.currentNoticeAreaIdx].actionComplete = true;
                    });
                }
            }
            this.playerSeparateBeginning = false;
            let nextNoticeFlag = false;
            while (!nextNoticeFlag) {
                this.currentNoticeAreaIdx++;
                if (this.currentNoticeAreaIdx >= 3) {
                    this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Dealer);
                    return;
                }
                const nextAreaPlayerList = this.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game &&
                    p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player &&
                    p.getCurrentTotalBet() > 0 &&
                    p.commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0);
                nextNoticeFlag = nextAreaPlayerList.length > 0;
                nextNoticeFlag = !nextAreaPlayerList.every(p => Math.max(...p.commonAreaBetList[this.currentNoticeAreaIdx].getPokerAndCount().countList) === 21);
                if (nextNoticeFlag) {
                    nextAreaPlayerList.forEach(p => {
                        const canSeparate = p.commonAreaBetList[this.currentNoticeAreaIdx].canPlayerSeparate();
                        p.actionList.multiple = true;
                        p.actionList.separate = !!canSeparate;
                    });
                    this.runtimeData.nextAreaSpeakOnPlayer();
                    this.channelForPlayer.noticeActionToAllPlayer(this.currentNoticeAreaIdx, nextAreaPlayerList);
                }
            }
            return;
        }
        this.playerBeginning = true;
        const curPlayerList = this.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game && p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player && p.getCurrentTotalBet() > 0);
        curPlayerList.forEach(player => {
            const canSeparate = player.commonAreaBetList.some(area => area.canPlayerSeparate());
            if (canSeparate) {
                player.actionList.separate = true;
            }
        });
        let noticeFlag = false;
        while (!noticeFlag) {
            this.currentNoticeAreaIdx++;
            if (this.currentNoticeAreaIdx >= 3) {
                this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Dealer);
                return;
            }
            const noticePlayerList = curPlayerList.filter(p => p.commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0);
            noticeFlag = noticePlayerList.length > 0;
            noticeFlag = !noticePlayerList.every(p => Math.max(...p.commonAreaBetList[this.currentNoticeAreaIdx].getPokerAndCount().countList) === 21);
            if (noticeFlag) {
                noticePlayerList.forEach(p => {
                    const canSeparate = p.commonAreaBetList[this.currentNoticeAreaIdx].canPlayerSeparate();
                    p.actionList.multiple = true;
                    p.actionList.separate = !!canSeparate;
                });
                this.runtimeData.nextAreaSpeakOnPlayer();
                this.channelForPlayer.noticeActionToAllPlayer(this.currentNoticeAreaIdx, curPlayerList.filter(({ commonAreaBetList }) => commonAreaBetList[this.currentNoticeAreaIdx].getCurrentBet() > 0));
            }
        }
    }
    async dealerState() {
        if (!this.beShowSecendPoker) {
            this.beShowSecendPoker = true;
            await this.control.startControl();
            const dealPoker = this.runtimeData.getDealerPokerListAndCount();
            this.channelForPlayer.showDealerPokerAfterHitPoker({
                pokerList: dealPoker.pokerList.slice(0, 2),
                countList: (0, GameUtil_1.calculateDot)(dealPoker.pokerList.slice(0, 2))
            });
            const { countList } = dealPoker;
            if (Math.max(...countList) >= 17) {
                this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Settlement);
            }
            return;
        }
        const dealerPokerMaxCount = this.runtimeData.afterDealerHit();
        const dealPoker = this.runtimeData.getDealerPokerListAndCount();
        const { pokerList } = dealPoker;
        this.channelForPlayer.showDealerPokerAfterHitPoker(dealPoker);
        if (pokerList.length === 5 || dealerPokerMaxCount >= 17) {
            this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Settlement);
            return;
        }
    }
    async settlementState() {
        if (this.settlementBeginning) {
            if (this.runtimeData.getCurrentCountdown() === 0) {
                this.changeRoomStatus(BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.None);
            }
            return;
        }
        this.settlementBeginning = true;
        this.runtimeData.setSettlementCountdown(5);
        this.endTime = Date.now();
        await this.settlementAction.settedCurrentGame();
        const playerList = this.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game &&
            p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player &&
            p.totalBet > 0);
        await this.channelForPlayer.showSettlementResult(playerList);
        playerList.forEach(p => p.initRunData());
    }
    initRunData() {
        this.commonMaxBetListForRobot = Array.from({ length: 3 }).map(() => (0, index_1.random)(40, 60) * this.areaMaxBet / 100);
        this.commonBetListForRobot = [0, 0, 0];
        this.licensingAnimation = false;
        this.insuranceBeginning = false;
        this.beInsuranceToSettlement = false;
        this.waitForNoticeAreaListOnInsurance = [];
        this.waitForNoticePlayerList = [];
        this.playerBeginning = false;
        this.playerSeparateBeginning = false;
        this.playerSeparateFirstNotice = false;
        this.beAddPoker = false;
        this.beSeparate = false;
        this.currentNoticeAreaIdx = -1;
        this.beShowSecendPoker = false;
        this.settlementBeginning = false;
        this.updateRoundId();
    }
    addPlayerInRoom(dbplayer) {
        const beInRoom = this.getPlayer(dbplayer.uid);
        if (beInRoom) {
            beInRoom.sid = dbplayer.sid;
            this.offLineRecover(beInRoom);
            return true;
        }
        dbplayer.role = this.players.length >= 1 ? BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player : BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Dealer;
        let seatNumberOrFailResult = 1;
        if (dbplayer.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player) {
            const statusOrSeatNum = this.runtimeData.sitInSeat(dbplayer);
            if (!statusOrSeatNum) {
                robotlogger.warn(`${this.backendServerId} | 场: ${this.sceneId} | 房间: ${this.roomId} | 当前房间状态: ${this.roomStatus} | 进入房间 | 玩家 ${dbplayer.uid} | 进入位置失败 `);
                return false;
            }
            seatNumberOrFailResult = statusOrSeatNum;
        }
        dbplayer.onLine = true;
        dbplayer.seatNum = seatNumberOrFailResult;
        dbplayer.status = BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Ready;
        this.players.push(new BlackJackPlayerImpl_1.BlackJackPlayerImpl(dbplayer));
        if (dbplayer.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player) {
            this.addMessage(dbplayer);
        }
        this.channelForPlayer.playerListWithUpdate();
        return true;
    }
    getRoomInfoAfterEntryRoom(uid) {
        const player = this.getPlayer(uid);
        player.onLine = true;
        const { roomStatus, insuranceBeginning, beSeparate, areaMaxBet, sceneId, lowBet } = this;
        const countdown = this.runtimeData.getCurrentCountdown();
        let areaIdx = -1;
        if (roomStatus === BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Insurance && this.insuranceBeginning) {
            const { length } = this.waitForNoticeAreaListOnInsurance;
            areaIdx = length > 0 ? length - 1 : -1;
        }
        if (roomStatus === BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Player && this.playerBeginning) {
            areaIdx = this.currentNoticeAreaIdx;
        }
        let dealerArea = { pokerList: [], countList: [] };
        if (this.roomStatus === BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Dealer || this.roomStatus === BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Settlement) {
            dealerArea = this.runtimeData.getDealerPokerListAndCount();
        }
        else {
            const firstPoker = this.runtimeData.getDealerPokerListAndCount().pokerList[0];
            dealerArea.pokerList.push(firstPoker);
            dealerArea.countList.push(...(0, GameUtil_1.calculateDot)([firstPoker]));
        }
        const roomInfo = {
            countdown,
            roomStatus,
            insuranceBeginning,
            beSeparate,
            areaIdx,
            areaMaxBet,
            sceneId,
            lowBet,
            dealerArea,
            commonAreaList: this.runtimeData.getCommonPokerListAndCount(),
            separatePokerList: this.runtimeData.getSeparatePokerListAndCount(),
            areaBetList: [0, 0, 0].map((v, i) => this.runtimeData.getTotalBetByAreaIdx(i) || v)
        };
        const playerList = this.players
            .filter(({ role }) => role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player)
            .map(player => {
            const { uid, nickname, headurl, gold, totalBet, seatNum, status } = player;
            return {
                uid,
                nickname,
                headurl,
                gold: gold - totalBet,
                seat: seatNum,
                playerStatus: status,
                commonAreaList: player.commonAreaBetList.map(area => {
                    const { countList, pokerList } = area.getPokerAndCount();
                    return {
                        bet: area.getCurrentBet(),
                        hadSeparate: area.checkHadSeparate(),
                        countList: [...countList],
                        pokerList: [...pokerList],
                    };
                }),
                separatePokerList: player.separateAreaBetList.map(area => {
                    const { countList, pokerList } = area.getPokerAndCount();
                    return {
                        bet: area.getCurrentBet(),
                        hadSeparate: area.checkHadSeparate(),
                        countList: [...countList],
                        pokerList: [...pokerList],
                    };
                })
            };
        });
        return {
            roomInfo,
            playerList,
            currentPlayer: playerList.find(p => p.uid === uid),
            roundId: this.roundId
        };
    }
    rankinglist() {
        const playerList = this.players
            .filter(({ role }) => role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player)
            .map(({ uid, nickname, headurl, gold, totalBet, winRound, profitQueue }) => {
            return {
                uid,
                nickname,
                headurl,
                totalBet,
                gold: gold - totalBet,
                winRound,
                totalProfit: profitQueue.length === 0 ? 0 : profitQueue.reduce((total, val) => total + val)
            };
        })
            .sort((p1, p2) => p2.totalProfit - p1.totalProfit);
        return playerList;
    }
    playerLeaveRoom(uid, disconnect = false) {
        const player = this.getPlayer(uid);
        if (!player) {
            return;
        }
        if (disconnect) {
            this.kickOutMessage(uid);
            player.onLine = false;
            return;
        }
        if (player.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game) {
            player.onLine = false;
            return;
        }
        this.kickOutMessage(uid);
        this.runtimeData.leaveSeat(uid);
        player.playerHadLeave();
        (0, index_1.remove)(this.players, "uid", uid);
        this.channelForPlayer.playerLeaveToAllPlayer(this.players);
    }
    changeRoomStatus(roomStatus) {
        this.roomStatus = roomStatus;
    }
    bet(areaIdx, bet, uid) {
        const player = this.getPlayer(uid);
        const { language } = player;
        if (this.roomStatus !== BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Betting) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 下注: ${bet} | 当前房间状态不允许下注`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_bet, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1729));
        }
        const currentCountdown = this.runtimeData.getCurrentCountdown();
        if (currentCountdown <= 0) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 下注: ${bet} | 当前房间下注时间: ${currentCountdown} 不能再下注`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_bet, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1730));
        }
        const areaCanBetFlag = this.runtimeData.checkAreaCanBet(areaIdx, bet);
        if (!areaCanBetFlag) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${player.uid} | 下注失败 | 区域: ${areaIdx} 已达可下注上限 `);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Area_Gold_Had_Be_Max, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1731));
        }
        const playerCanBetFlag = player.checkPlayerCanBet(bet);
        if (!playerCanBetFlag) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${player.uid} | 下注失败 | 区域: ${areaIdx} 已达可下注上限 `);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Player_Gold_Had_Be_Max, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1724));
        }
        this.runtimeData.betIntoCommonByAreaIdx(areaIdx, bet);
        if (player.totalBet === 0) {
            const commonPokerInfoList = this.runtimeData.copyPokerFromCommonArea();
            commonPokerInfoList.forEach(({ basePokerList, baseCount }, idx) => {
                player.commonAreaBetList[idx].setPokerList(basePokerList, baseCount);
            });
            player.status = BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game;
            player.betHistory = [0, 0, 0];
        }
        player.bet(areaIdx, bet);
        player.standbyRounds = 0;
        this.channelForPlayer.someOneBeting(areaIdx, player, bet);
    }
    insurance(areaIdx, uid) {
        const player = this.getPlayer(uid);
        const { language } = player;
        if (this.roomStatus !== BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Insurance) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 保险 | 当前房间状态不允许购买保险`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_insurance, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1732));
        }
        const currentCountdown = this.runtimeData.getCurrentCountdown();
        if (currentCountdown <= 0) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 保险 | 当前房间时间: ${currentCountdown} 不能再购买保险`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_insurance, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1733));
        }
        if (player.insuranceAreaList[areaIdx].checkBuyInsurance()) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 保险 | 当前房间时间: ${currentCountdown} 已购买过当前区域 ${areaIdx} 保险`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Had_Buy_insurance, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1734));
        }
        player.insurance(areaIdx);
    }
    separate(areaIdx, uid) {
        const player = this.getPlayer(uid);
        const { language } = player;
        if (this.roomStatus !== BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Player) {
            robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 分牌 | 当前房间状态不允许分牌操作`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_Separate, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1725));
        }
        const currentCountdown = this.runtimeData.getCurrentCountdown();
        if (currentCountdown <= 0) {
            robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 分牌 | 当前房间时间: ${currentCountdown} 不能进行分牌操作`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_Separate, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1726));
        }
        const currentAreaBet = player.commonAreaBetList[areaIdx].getCurrentBet();
        this.beSeparate = true;
        this.runtimeData.betIntoBySeparateAreaIdx(areaIdx, currentAreaBet);
        player.separate(areaIdx);
        player.actionList.multiple = false;
        player.commonAreaBetList[areaIdx].playerHadAction = true;
        this.channelForPlayer.someOneSeparate(areaIdx, player, currentAreaBet, this.runtimeData.getTotalBetByAreaIdx(areaIdx));
    }
    playerHit(uid, areaIdx) {
        const player = this.getPlayer(uid);
        if (this.roomStatus !== BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Player) {
            robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 要牌 | 当前房间状态不允许要牌操作`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_Hit, null, "当前房间状态不允许要牌操作");
        }
        const currentCountdown = this.runtimeData.getCurrentCountdown();
        if (currentCountdown <= 0) {
            robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 要牌 | 当前房间时间: ${currentCountdown} 不能进行要牌操作`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_Hit, null, "当前房间已超过要牌时间");
        }
        const { pokerList, countList } = this.beSeparate ?
            player.separateAreaBetList[areaIdx].getPokerAndCount() :
            player.commonAreaBetList[areaIdx].getPokerAndCount();
        if (pokerList.length === 5) {
            robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 要牌 | 已经 5 张手牌,不能再要`);
            return new ApiResult_1.ApiResult(300);
        }
        const poker = this.runtimeData.getOnePokerFromPokerPool();
        this.beSeparate ?
            player.separateAreaBetList[areaIdx].addPoker(poker) :
            player.commonAreaBetList[areaIdx].addPoker(poker);
        this.beSeparate ?
            player.separateAreaBetList[areaIdx].playerHadAction = true :
            player.commonAreaBetList[areaIdx].playerHadAction = true;
        const maxPokerCount = this.beSeparate ?
            player.separateAreaBetList[areaIdx].getCount() :
            player.commonAreaBetList[areaIdx].getCount();
        if (maxPokerCount >= 21) {
            if (this.beSeparate) {
                player.separateAreaBetList[areaIdx].continueAction = false;
                player.separateAreaBetList[areaIdx].actionComplete = true;
            }
            else {
                player.commonAreaBetList[areaIdx].continueAction = false;
                player.commonAreaBetList[areaIdx].actionComplete = true;
            }
            return new ApiResult_1.ApiResult(300);
        }
        return {
            commonAreaList: player.commonAreaBetList.map(area => {
                area.getPokerAndCount();
                return {};
            })
        };
    }
    playerHitWithNew(uid, areaIdx) {
        const player = this.getPlayer(uid);
        const { language } = player;
        if (this.roomStatus !== BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Player) {
            robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 要牌 | 当前房间状态不允许要牌操作`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_Hit, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1727));
        }
        const currentCountdown = this.runtimeData.getCurrentCountdown();
        if (currentCountdown <= 0) {
            robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 要牌 | 当前房间时间: ${currentCountdown} 不能进行要牌操作`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_Hit, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1728));
        }
        if (!this.beAddPoker) {
            this.beAddPoker = true;
        }
        const currentAreaPlayerList = this.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game &&
            p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player &&
            p.commonAreaBetList[areaIdx].getCurrentBet() > 0);
        const beSeparateArea = this.playerSeparateBeginning && currentAreaPlayerList.every(p => p.commonAreaBetList[areaIdx].actionComplete);
        if (beSeparateArea) {
            player.separateAreaBetList[areaIdx].beAddPokerAction = true;
            player.separateAreaBetList[areaIdx].playerHadAction = true;
            return true;
        }
        player.commonAreaBetList[areaIdx].beAddPokerAction = true;
        player.commonAreaBetList[areaIdx].playerHadAction = true;
        return true;
    }
    multiple(areaIdx, uid) {
        const player = this.getPlayer(uid);
        const { language } = player;
        if (this.roomStatus !== BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Player) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 加倍 | 当前房间状态不允许加倍`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_bet, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1722));
        }
        const currentCountdown = this.runtimeData.getCurrentCountdown();
        if (currentCountdown <= 0) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 加倍 | 当前房间时间: ${currentCountdown} 不能加倍`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_bet, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1723));
        }
        const currentAreaBet = player.commonAreaBetList[areaIdx].getCurrentBet();
        const playerCanBetFlag = player.checkPlayerCanBet(currentAreaBet);
        if (!playerCanBetFlag) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 加倍 | 当前房间时间: ${currentCountdown} 不能再购买保险`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Player_Gold_Had_Be_Max, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1724));
        }
        this.runtimeData.betIntoCommonByAreaIdx(areaIdx, currentAreaBet);
        player.multiple(areaIdx, currentAreaBet);
        if (!this.beAddPoker) {
            this.beAddPoker = true;
        }
        const currentAreaPlayerList = this.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game &&
            p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player &&
            p.commonAreaBetList[areaIdx].getCurrentBet() > 0);
        const beSeparateArea = this.playerSeparateBeginning && currentAreaPlayerList.every(p => p.commonAreaBetList[areaIdx].actionComplete);
        if (beSeparateArea) {
            player.separateAreaBetList[areaIdx].beAddPokerAction = true;
            return true;
        }
        player.actionDone(areaIdx, beSeparateArea);
        player.commonAreaBetList[areaIdx].beAddPokerAction = true;
        this.channelForPlayer.someOneMultiple(areaIdx, player, currentAreaBet, this.runtimeData.getTotalBetByAreaIdx(areaIdx));
    }
    continueBet(uid) {
        const player = this.getPlayer(uid);
        const { language } = player;
        if (this.roomStatus !== BlackJackRoomStatusEnum_1.BlackJackRoomStatusEnum.Betting) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 续押 | 当前房间状态不允许续押`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_bet, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1735));
        }
        const currentCountdown = this.runtimeData.getCurrentCountdown();
        if (currentCountdown <= 0) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 续押 | 当前房间下注时间: ${currentCountdown} 不能续押`);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_bet, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1736));
        }
        const betHistory = player.betHistory;
        const areaCanBetFlag = betHistory.reduce((areaCanBetFlag, bet, areaIdx) => {
            if (!areaCanBetFlag)
                return false;
            areaCanBetFlag = this.runtimeData.checkAreaCanBet(areaIdx, bet);
            return areaCanBetFlag;
        }, true);
        if (!areaCanBetFlag) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${player.uid} | 续押失败 | 区域:  已达可下注上限 `);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Area_Gold_Had_Be_Max, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1731));
        }
        const playerCanBetFlag = player.checkPlayerCanBet(betHistory.reduce((total, bet) => total + bet));
        if (!playerCanBetFlag) {
            if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                robotlogger.warn(`${this.backendServerId} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${player.uid} | 续押失败 |  下注不能超过携带金额的一半 `);
            return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Player_Gold_Had_Be_Max, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1724));
        }
        const commonPokerInfoList = this.runtimeData.copyPokerFromCommonArea();
        commonPokerInfoList.forEach(({ basePokerList, baseCount }, idx) => {
            player.commonAreaBetList[idx].setPokerList(basePokerList, baseCount);
        });
        for (let areaIdx = 0; areaIdx < betHistory.length; areaIdx++) {
            const bet = betHistory[areaIdx];
            if (bet === 0)
                continue;
            this.runtimeData.betIntoCommonByAreaIdx(areaIdx, bet);
            player.continueBet(areaIdx, bet);
            this.channelForPlayer.someOneBeting(areaIdx, player, bet);
        }
        player.status = BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game;
    }
    changeDealerPoker() {
        let dealerMaxCount = this.runtimeData.dealerHit();
        while (dealerMaxCount < 17) {
            dealerMaxCount = this.runtimeData.dealerHit();
        }
        return dealerMaxCount;
    }
    setPreparePokerAndReservePoker() {
        this.runtimeData.setDealerPreparePoker(this.runtimeData.getDealerResidualPoker());
        this.runtimeData.reserveDealerPoker();
    }
    randomLottery() {
        this.changeDealerPoker();
        this.setPreparePokerAndReservePoker();
    }
    calculatePlayersProfit(players) {
        const { pokerList, countList } = this.runtimeData.getDealerPokerListAndCount();
        return players.reduce((totalProfit, p) => {
            return totalProfit + p.presettlement(pokerList, countList);
        }, 0);
    }
    personalControl(controlPlayers, state) {
        const players = controlPlayers.map(p => this.getPlayer(p.uid));
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        for (let i = 0; i < 100; i++) {
            this.changeDealerPoker();
            const totalProfit = this.calculatePlayersProfit(players);
            if ((state === commonConst_1.CommonControlState.LOSS && totalProfit < 0)) {
                break;
            }
            if (state === commonConst_1.CommonControlState.WIN && totalProfit > 0) {
                break;
            }
            this.runtimeData.reserveDealerOnePoker();
        }
        this.setPreparePokerAndReservePoker();
    }
    sceneControl(sceneControlState, isPlatformControl) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return this.randomLottery();
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        const players = this.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER);
        players.forEach(p => p.setControlType(type));
        for (let i = 0; i < 100; i++) {
            this.changeDealerPoker();
            const totalProfit = this.calculatePlayersProfit(players);
            if ((sceneControlState === constants_1.ControlState.SYSTEM_WIN && totalProfit < 0)) {
                break;
            }
            if (sceneControlState === constants_1.ControlState.PLAYER_WIN && totalProfit > 0) {
                break;
            }
            this.runtimeData.reserveDealerOnePoker();
        }
        this.setPreparePokerAndReservePoker();
    }
    async br_kickNoOnline() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players.filter(p => p.role !== BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Dealer), 5, 3);
        offlinePlayers.forEach(p => {
            this.playerLeaveRoom(p.uid, false);
            if (!p.onLine) {
                this.roomManager.removePlayer(p);
            }
        });
        if (this.players.filter(p => p.role !== BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Dealer && p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER).length === 0) {
            this.canBeDestroy = true;
        }
    }
    destroy() {
        clearInterval(this.processInterval);
        this.sendRoomCloseMessage();
    }
    close() {
        this.roomManager = null;
        clearInterval(this.processInterval);
    }
}
exports.BlackJackRoomImpl = BlackJackRoomImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrUm9vbUltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CbGFja0phY2svbGliL0JsYWNrSmFja1Jvb21JbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVFQUFvRTtBQUNwRSwrREFBNEQ7QUFDNUQsaUNBQThCO0FBQzlCLDRFQUF5RTtBQUN6RSx5RkFBc0Y7QUFDdEYsMkdBQXdHO0FBQ3hHLDRFQUF5RTtBQUN6RSxnRkFBNkU7QUFDN0UsOERBQTJEO0FBQzNELGlGQUE2RTtBQUM3RSx1RUFBb0U7QUFDcEUsbUdBQWdHO0FBQ2hHLGdEQUFzRDtBQUN0RCxzREFBdUQ7QUFDdkQsMkdBQXdHO0FBQ3hHLDhEQUE0RTtBQUU1RSxrRkFBc0Y7QUFDdEYsc0VBQW9GO0FBQ3BGLHVDQUFnQztBQUNoQywrQ0FBeUM7QUFFekMsbUNBQXNDO0FBSXRDLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFeEQsTUFBYSxpQkFBa0IsU0FBUSx1QkFBK0I7SUFnSHBFLFlBQVksSUFBUyxFQUFFLFdBQXVDO1FBQzVELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTdHZCxlQUFVLEdBQVcsT0FBTyxDQUFDO1FBY3JCLGVBQVUsR0FBNEIsaURBQXVCLENBQUMsSUFBSSxDQUFDO1FBTW5FLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFDM0Isb0JBQWUsR0FBbUIsSUFBSSxDQUFBO1FBWTlDLHVCQUFrQixHQUFZLEtBQUssQ0FBQztRQU81Qix1QkFBa0IsR0FBWSxLQUFLLENBQUM7UUFHNUMscUNBQWdDLEdBQWtCLEVBQUUsQ0FBQztRQUdyRCw0QkFBdUIsR0FBc0MsRUFBRSxDQUFDO1FBR2hFLDRCQUF1QixHQUFZLEtBQUssQ0FBQztRQU9qQyxvQkFBZSxHQUFZLEtBQUssQ0FBQztRQUd6QyxlQUFVLEdBQVksS0FBSyxDQUFDO1FB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