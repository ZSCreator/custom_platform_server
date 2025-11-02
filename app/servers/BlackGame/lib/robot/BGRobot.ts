
// 推筒子 或 推筒子庄 的机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import utils = require("../../../../utils");
import commonUtil = require("../../../../utils/lottery/commonUtil");
import robotBetUtil = require("../../../../utils/robot/robotBetUtil");
import RobotManagerDao from "../../../../common/dao/daoManager/Robot.manager";
import BGConst = require('../BGConst');
import BG_logic = require('../BG_logic');
import mathUtil = require("../../../../utils/lottery/mathUtil");
// 推筒子下注条件
/**庄家钱是否够赔付 */
const pl_totalBets: { roomId: string, totalBet: number, flag: false }[] = [];




export default class TTZRobot extends BaseRobot {
    playerGold: number = 0;
    banker_cards: number[] = [];
    /**最低下注要求 */
    lowBet: number;
    seat: number;
    auto_time: number;
    area_list: {
        [seat: number]: {
            uid: string,
        }[]
    } = {};

    constructor(opts) {
        super(opts);
        for (let idx = 0; idx < 5; idx++) {
            this.area_list[idx] = [];
        }
    }

    // 加载
    async ttzLoaded() {
        try {
            const data = await this.requestByRoute(`BlackGame.mainHandler.loaded`, {});
            let Me = data.players.find(c => c && c.uid == this.uid);
            this.seat = Me.seat;
            this.lowBet = data.roomInfo.lowBet;
            this.playerGold = Me.gold;
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // 离开推筒子游戏
    async destroy() {
        await this.leaveGameAndReset(false);
    }

    /**收到通知后处理 */
    registerListener() {
        // 开始下注
        this.Emitter.on(`BlackGame.start`, this.BlackGame_start.bind(this));
        this.Emitter.on("BlackGame.deal", this.on_deal.bind(this));
        this.Emitter.on("BlackGame.oper", this.onTTZ_Start.bind(this));
        this.Emitter.on("BlackGame.settlement", this.onSettlement.bind(this));
        this.Emitter.on("BlackGame.action_first", this.on_first.bind(this));
    }

    async onTTZ_Start(data: BGConst.BlackGame_oper) {
        if (data.seat == this.seat) {
            let delayTime = commonUtil.randomFromRange(2000, 3000);
            let random = commonUtil.randomFromRange(1, 100);
            const bet = data.area_list[data.location][data.idx].bet;
            const cards = data.area_list[data.location][data.idx].cards;
            const result = BG_logic.get_Points(cards, false);
            const banker_result = BG_logic.get_Points(this.banker_cards, false);
            /**可以买保险 */
            if (data.insurance && data.insurance_bet == -1) {
                let opts = { flag: false };
                if (result.Points == 21 ||
                    result.Points == 20 && random <= 90 ||
                    result.Points == 19 && random <= 70 ||
                    result.Points == 18 && random <= 50 ||
                    result.Points == 17 && random <= 50 ||
                    result.Points <= 16 && random <= 10) {
                    opts = { flag: true };
                }
                if (this.playerGold < bet / 2) {
                    opts = { flag: false };
                }
                if (opts.flag) {
                    this.playerGold -= bet / 2;
                }
                try {
                    const res = await this.delayRequest(`BlackGame.mainHandler.insurance`, opts, delayTime);
                } catch (error) {
                    console.warn("--");
                }

                return;
            }
            /**要牌(hit)、停牌(stand)、加倍(double)、分牌(split) */
            let oper_type: "hit" | "stand" | "double" | "split" | "" = "";
            if (data.separatePoker) {
                const value = BG_logic.Card2RealCard[cards[0]];
                if (value == "2" && banker_result.Points <= 7) {
                    oper_type = random <= 90 ? "split" : "hit";
                } else if (value == "3" && banker_result.Points <= 7) {
                    oper_type = random <= 90 ? "split" : "hit";
                } else if (value == "4" && (banker_result.Points == 5 || banker_result.Points == 6)) {
                    oper_type = "split";
                } else if (value == "5" && banker_result.Points <= 7) {
                    oper_type = random <= 80 ? "double" : "hit";
                } else if (value == "6" && banker_result.Points <= 6) {
                    oper_type = random <= 90 ? "split" : "hit";
                } else if (value == "7" && banker_result.Points <= 7) {
                    oper_type = random <= 90 ? "split" : "hit";
                } else if (value == "8") {
                    oper_type = "split";
                } else if (value == "9" && banker_result.Points <= 6) {
                    oper_type = random <= 90 ? "split" : "stand";
                } else if (value == "9" && banker_result.Points >= 7) {
                    oper_type = random <= 90 ? "stand" : "split";
                } else if (value == "10" && banker_result.Points >= 7) {
                    oper_type = "stand";
                } else if (value == "A") {
                    oper_type = "split";
                }
            }
            const first = BG_logic.getCardValue(cards[0]);
            const second = BG_logic.getCardValue(cards[1]);
            if (oper_type == "") {
                //A + x的时候 规则二
                if (cards.length == 2 && (first == 1 || second == 1)) {
                    const Ace_not = first == 1 ? second : first;
                    if (2 <= Ace_not && Ace_not <= 5) {
                        if (4 < banker_result.Points && banker_result.Points < 7) {
                            oper_type = random <= 90 ? "double" : "hit";
                        } else
                            oper_type = random <= 10 ? "double" : "hit";
                    } else if (Ace_not == 6) {
                        if (2 < banker_result.Points && banker_result.Points < 7) {
                            oper_type = random <= 90 ? "double" : "hit";
                        } else {
                            oper_type = random <= 10 ? "double" : "hit";
                        }
                    } else if (Ace_not == 7) {
                        if (2 < banker_result.Points && banker_result.Points < 7) {
                            oper_type = random <= 90 ? "double" : "hit";
                        } else if (banker_result.Points == 2 || banker_result.Points == 7 || banker_result.Points == 8) {
                            oper_type = random <= 90 ? "double" : "hit";
                        }
                    } else if (Ace_not == 8 || Ace_not == 9) {
                        oper_type = random <= 90 ? "stand" : "hit";
                    }
                }
                //规则一
                if (oper_type == "") {
                    if (result.Points <= 8) {
                        oper_type = "hit";
                    } else if (result.Points == 9) {
                        oper_type = random <= 40 ? "double" : "hit";
                    } else if (result.Points == 10) {
                        oper_type = random <= 80 ? "double" : "hit";
                    } else if (result.Points == 11) {
                        oper_type = random <= 90 ? "double" : "hit";
                    } else if (result.Points == 12) {
                        oper_type = random <= 50 ? "stand" : "hit";
                    } else if (result.Points == 13) {
                        if (2 <= banker_result.Points && banker_result.Points <= 6) {
                            oper_type = random <= 60 ? "stand" : "hit";
                        } else {
                            oper_type = random <= 40 ? "stand" : "hit";
                        }
                    } else if (result.Points == 14) {
                        if (2 <= banker_result.Points && banker_result.Points <= 6) {
                            oper_type = random <= 70 ? "stand" : "hit";
                        } else {
                            oper_type = random <= 90 ? "hit" : "stand";
                        }
                    } else if (result.Points == 15) {
                        if (2 <= banker_result.Points && banker_result.Points <= 6) {
                            oper_type = random <= 80 ? "stand" : "hit";
                        } else {
                            oper_type = random <= 90 ? "hit" : "stand";
                        }
                    } else if (result.Points == 16) {
                        if (2 <= banker_result.Points && banker_result.Points <= 6) {
                            oper_type = random <= 90 ? "stand" : "hit";
                        } else {
                            oper_type = random <= 90 ? "hit" : "stand";
                        }
                    } else {
                        oper_type = "stand";
                    }
                }
            }
            try {
                if (oper_type == "double" && cards.length > 2) {
                    oper_type = "hit";
                }
                if (this.playerGold < bet && (oper_type == "split" || oper_type == "double")) {
                    oper_type = "hit";
                }
                if (oper_type == "hit") {
                    const res = await this.delayRequest(`BlackGame.mainHandler.getOnePoker`, {}, delayTime);
                } else if (oper_type == "stand") {
                    const res = await this.delayRequest(`BlackGame.mainHandler.action_stop_getCard`, {}, delayTime);
                } else if (oper_type == "double") {
                    this.playerGold -= bet;
                    const res = await this.delayRequest(`BlackGame.mainHandler.addMultiple`, {}, delayTime);
                } else if (oper_type == "split") {
                    this.playerGold -= bet;
                    const res = await this.delayRequest(`BlackGame.mainHandler.separatePoker`, {}, delayTime);
                } else {
                    console.warn("BlackGame,error22", oper_type, cards.map(c => BG_logic.Card2RealCard[c]).toString());
                }
            } catch (error) {
                console.warn("BlackGame,error", error, bet, oper_type, cards.map(c => BG_logic.Card2RealCard[c]).toString());
            }
        }
    }

    on_deal(data: BGConst.BlackGame_deal) {
        this.banker_cards = data.banker_cards;
    }

    onSettlement() {
        let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
        if (pl_totalBet) {
            pl_totalBet.totalBet = 0;
            pl_totalBet.flag = false;
        }
    }

    on_first(data) {
        this.area_list[data.location] = [{ uid: data.uid }];
    }

    // 下注
    BlackGame_start({ auto_time }) {
        this.auto_time = new Date() + auto_time;
        let delayTime = commonUtil.randomFromRange(2000, 8000);
        this.action_bet(this.seat, delayTime);
        setTimeout(() => {
            const random = commonUtil.randomFromRange(1, 100);
            if (random <= 10) {
                for (let key in this.area_list) {
                    const temp_areaList = this.area_list[key];
                    if (temp_areaList.length == 0) {
                        delayTime = commonUtil.randomFromRange(1000, 15000 - 9000);
                        this.action_bet(parseInt(key), delayTime);
                    }
                }
            }
        }, 8 * 1000);
    }

    async action_bet(seat: number, delayTime: number) {
        // let delayTime = commonUtil.randomFromRange(2000, 8000);
        let opts = { location: seat, bet: this.lowBet };
        const random = commonUtil.randomFromRange(1, 100);
        opts.bet = opts.bet * random;
        while (opts.bet > this.playerGold) {
            opts.bet -= this.lowBet;
        }
        if (opts.bet >= this.lowBet) {
            this.playerGold -= opts.bet;
            try {
                const data = await this.delayRequest(`BlackGame.mainHandler.first_bet`, opts, delayTime);
            } catch (error) {
            }
        }
    }
}
