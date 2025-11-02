import fRoom from './fRoom';
import fisheryConst = require('./fisheryConst');
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';

export default class Player extends PlayerInfo {
    brine: { //海水区
        self: { bet: number; };
        shoalSater: {
            self: { bet: number; };
            fish1: { bet: number; };
            fish2: { bet: number; };
            fish3: { bet: number; };
        }; deepwater: {
            self: { bet: number; };
            fish4: { bet: number; }; fish5: { bet: number; };
            fish6: { bet: number; };
        };
    };
    freshWater: { self: { bet: number; }; };
    fightFlood: { //淡水区
        self: { bet: number; }; watch: {
            self: { bet: number; }; fish7: { bet: number; };
            fish8: { bet: number; }; fish9: { bet: number; };
        }; rare: {
            self: { bet: number; };
            fish10: { bet: number; }; fish11: { bet: number; }; fish12: { bet: number; };
        };
    };
    /**该局总下注 */
    bet: number = 0;
    /**回合总下注 */
    totalBet: number[] = [];
    /**玩家回合收益 */
    profit: number = 0;
    /**进入房间的总盈利 */
    totalProfit: number[] = [];

    allSeat: { [area: string]: number } = {};
    isBet: boolean;
    isContinue: boolean;
    allWinArea: any[];
    betWinArea: any[];
    betAreas: { [area: string]: number } = {};
    validBet: number;
    /**20局 胜利 回合 */
    winRound = 0;
    /**待机轮数 */
    standbyRounds = 0;
    constructor(opts: any) {
        super(opts);
        this.brine = {//海水区
            self: { bet: 0 },
            shoalSater: {
                self: { bet: 0 },
                fish1: { bet: 0 },
                fish2: { bet: 0 },
                fish3: { bet: 0 }
            },
            deepwater: {
                self: { bet: 0 },
                fish4: { bet: 0 },
                fish5: { bet: 0 },
                fish6: { bet: 0 }
            }
        };
        this.freshWater = { self: { bet: 0 } };//灾祸区
        this.fightFlood = {//淡水区
            self: { bet: 0 },
            watch: {
                self: { bet: 0 },
                fish7: { bet: 0 },
                fish8: { bet: 0 },
                fish9: { bet: 0 }
            },
            rare: {
                self: { bet: 0 },
                fish10: { bet: 0 },
                fish11: { bet: 0 },
                fish12: { bet: 0 }
            }
        }
        this.bet = 0;
        this.profit = 0;
        this.allSeat = {};
        this.isBet = false;
        this.isContinue = false;
        this.allWinArea = [];
        this.betWinArea = [];
        this.betAreas = {};
        this.validBet = 0;          // 有效押注
    }

    /**初始化玩家信息 */
    initPlayer() {
        this.initControlType();
        this.standbyRounds++;
        if (this.bet) {
            this.standbyRounds = 0;
            this.totalProfit.push(this.profit > 0 ? this.profit : 0);
            this.totalBet.push(this.bet);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
        }

        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
        this.betAreas = {};
        this.validBet = 0;
        this.brine = {//海水区
            self: { bet: 0 },
            shoalSater: {
                self: { bet: 0 },
                fish1: { bet: 0 },
                fish2: { bet: 0 },
                fish3: { bet: 0 }
            },
            deepwater: {
                self: { bet: 0 },
                fish4: { bet: 0 },
                fish5: { bet: 0 },
                fish6: { bet: 0 }
            }
        };
        this.freshWater = { self: { bet: 0 } };//灾祸区
        this.fightFlood = {//淡水区
            self: { bet: 0 },
            watch: {
                self: { bet: 0 },
                fish7: { bet: 0 },
                fish8: { bet: 0 },
                fish9: { bet: 0 }
            },
            rare: {
                self: { bet: 0 },
                fish10: { bet: 0 },
                fish11: { bet: 0 },
                fish12: { bet: 0 }
            }
        }
        this.bet = 0;
        this.profit = 0;
        this.isContinue = false;
        this.isBet = false;
        this.allWinArea = [];
        this.betWinArea = [];
    }

    /**玩家下注记录 */
    betHistory(area: string, gold: number) {
        if (!this.betAreas[area]) this.betAreas[area] = 0;
        this.betAreas[area] += gold;
    }

    /**玩家有效押注 */
    validBetCount(betNumber: number) {
        this.validBet = betNumber;
    }
    /**是否超过下注限制 */
    betCheck(gold: number) {
        return this.bet + gold > fisheryConst.betLimit;
    }

    //玩家下注
    /**
     * @param seat ='fightFlood-watch-fish8'
     */
    playerFisheryBet(gold: number, roomInfo: fRoom, seat: string, seat_) {
        this.betHistory(seat_, gold);
        !this.betWinArea.includes(seat_) && this.betWinArea.push(seat_);
        let isSeat = seat.indexOf('-');
        let roomArea;
        if (isSeat >= 0) {
            let Seat_arr = seat.split('-');
            if (Seat_arr.length == 3) {
                try {
                    // // room.fightFlood.rare.fiedsh11.allbet
                    // roomArea1 = room[Seat_arr[0]]
                    // roomArea2 = room[Seat_arr[0]][Seat_arr[1]]
                    // roomArea3 = room[Seat_arr[0]][Seat_arr[1]][Seat_arr[2]];
                    roomArea = roomInfo[Seat_arr[0]][Seat_arr[1]][Seat_arr[2]];
                    this[Seat_arr[0]][Seat_arr[1]][Seat_arr[2]].bet += gold;
                    roomArea.allbet += gold;//这个位置玩家的总下注
                } catch (error) {
                    console.error(error);
                }
            } else {
                roomArea = roomInfo[Seat_arr[0]][Seat_arr[1]].self;
                this[Seat_arr[0]][Seat_arr[1]].self.bet += gold;
                roomArea.allbet += gold;
            }
        } else {
            this[seat].self.bet += gold;
            roomArea = roomInfo[seat].self;
            roomArea.allbet += gold;//这个位置玩家的总下注
        }

        let isExitPlayer = roomArea.allPeople.find(m => m && m.uid == this.uid);//查看玩家之前在这个地方是否下过注
        if (isExitPlayer) {
            isExitPlayer.bet += gold;
        } else {
            roomArea.allPeople.push({ uid: this.uid, bet: gold });
        }
        this.bet += gold;//记录玩家总押注
    }


    /**玩家续押 */
    continueGolds(roomInfo: fRoom) {
        for (let x in this.allSeat) {
            this.playerFisheryBet(this.allSeat[x], roomInfo, fisheryConst.SEAT[x], x);
        }
        this.isContinue = true;
    }

    //记录下注位置(续押用)
    recordBetSeat(gold: number, seat_: number) {
        if (this.allSeat[seat_] === undefined) {
            this.allSeat[seat_] = gold;
        } else {
            this.allSeat[seat_] += gold;
        }
    }

    /**包装玩家数据 */
    stip() {
        return {
            uid: this.uid,
            gold: this.gold - this.profit,
            profit: this.profit,
            headurl: this.headurl,
            nickname: this.nickname,
            allWinArea: this.allWinArea
        }
    }

    /**结算数据包装 */
    mailStrip() {
        return {
            uid: this.uid,
            profit: this.profit,
            nickname: this.nickname
        }
    }

    /**
     * 检查玩家是否有押注区域必杀
     * @param killCondition
     */
    checkOverrunBet(killCondition: number) {
        const areas = {}

        // 必杀区域
        for (let key in this.brine) {
            if (key === 'self' && this.brine.self.bet >= killCondition) {
                areas['brine'] = this.brine.self.bet;
            } else {
                for (let shallow in this.brine[key]) {
                    if (shallow === 'self' && this.brine[key].self.bet >= killCondition) {
                        areas[key] = this.brine[key].self.bet;
                    } else {
                        if (this.brine[key][shallow].bet >= killCondition) {
                            areas[shallow] = this.brine[key][shallow].bet;
                        }
                    }
                }
            }
        }

        for (let key in this.fightFlood) {
            if (key === 'self' && this.fightFlood.self.bet >= killCondition) {
                areas['fightFlood'] = this.fightFlood.self.bet;
            } else {
                for (let shallow in this.fightFlood[key]) {
                    if (shallow === 'self' && this.fightFlood[key].self.bet >= killCondition) {
                        areas[key] = this.fightFlood[key].self.bet;
                    } else {
                        if (this.fightFlood[key][shallow].bet >= killCondition) {
                            areas[shallow] = this.fightFlood[key][shallow].bet;
                        }
                    }
                }
            }
        }

        if (this.freshWater.self.bet >= killCondition) {
            areas['freshWater'] = this.freshWater.self.bet;
        }

        return areas;
    }
}

