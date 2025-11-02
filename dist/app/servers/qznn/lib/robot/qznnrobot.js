'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const utils = require("../../../../utils");
const qznnConst = require("../qznnConst");
const qznn_logic = require("../qznn_logic");
const pinus_logger_1 = require("pinus-logger");
const log_logger = (0, pinus_logger_1.getLogger)('robot', __filename);
class qznnRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playTimes = 0;
        this.isControl = false;
        this.Rank = false;
        this.entryCond = 0;
        this.is_zhadan = false;
        this.seat = opts.seat;
        this.initgold = 10000 * utils.random(3, 10);
        this.has_robmul3 = false;
    }
    async loaded() {
        try {
            let result = await this.requestByRoute("qznn.mainHandler.loaded", {});
            this.entryCond = result.room.entryCond;
            return Promise.resolve(result);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset(false);
    }
    registerListener() {
        this.Emitter.on('qz_onStart', (data) => {
        });
        this.Emitter.on("qz_onRobzhuang", this.onfahua.bind(this));
        this.Emitter.on("qz_onWait", this.onWait.bind(this));
        this.Emitter.on("qz_onSettlement", this.onEndRound.bind(this));
        this.Emitter.on("qz_onReadybet", this.onReadybet.bind(this));
        this.Emitter.on("qz_onLook", this.onLook.bind(this));
        this.Emitter.on("qz_onEntry", this.onEnter.bind(this));
        this.Emitter.on("qz_onExit", this.onExit.bind(this));
        this.Emitter.on("qz_onOpts", this.onOpts.bind(this));
    }
    onLook(data) {
    }
    onOpts(data) {
        if (data.type == "robzhuang") {
            if (data.robmul == 3) {
                this.has_robmul3 = true;
            }
        }
    }
    async onReadybet(data) {
        setTimeout(async () => {
            if (data.zhuangInfo.uid == this.uid) {
                return;
            }
            if (!data.players.find(pl => pl && pl.uid == this.uid)) {
                return;
            }
            let betNum = qznnConst.xj_bet_arr[0];
            let ran = utils.random(1, 100);
            if (this.isControl) {
                let _arr = [
                    { group: 0, weight: 90 },
                    { group: 1, weight: 5 },
                    { group: 2, weight: 5 },
                ];
                if (this.Rank) {
                    _arr = [
                        { group: 0, weight: 0 },
                        { group: 1, weight: 20 },
                        { group: 2, weight: 40 },
                        { group: 2, weight: 40 },
                    ];
                }
                let bet = utils.sortProbability_(_arr);
                betNum = qznnConst.xj_bet_arr[bet];
            }
            else {
                if (!this.hasNiu) {
                    if (this.max_point >= 7) {
                        if (ran <= 90) {
                            betNum = qznnConst.xj_bet_arr[0];
                        }
                        else if (90 < ran && ran <= 95) {
                            betNum = qznnConst.xj_bet_arr[1];
                        }
                        else {
                            betNum = qznnConst.xj_bet_arr[2];
                        }
                    }
                    else {
                        betNum = qznnConst.xj_bet_arr[0];
                    }
                }
                else {
                    if (ran <= 30) {
                        betNum = qznnConst.xj_bet_arr[0];
                    }
                    else if (30 < ran && ran <= 60) {
                        betNum = qznnConst.xj_bet_arr[1];
                    }
                    else if (60 < ran && ran <= 90) {
                        betNum = qznnConst.xj_bet_arr[2];
                    }
                    else {
                        betNum = qznnConst.xj_bet_arr[3];
                    }
                }
                if (this.is_zhadan) {
                    betNum = qznnConst.xj_bet_arr[3];
                }
            }
            await this.delayRequest("qznn.mainHandler.bet", { betNum: betNum }, utils.random(2, 4) * 1000);
        }, 1 * 1000);
    }
    async onfahua(data) {
        let robotHands = [];
        if (data.players.length > 0) {
            for (let pl of data.players) {
                if (pl && pl.uid == this.uid && pl.cards.length > 0) {
                    robotHands = pl.cards;
                    break;
                }
            }
        }
        if (robotHands.length < 4) {
            return;
        }
        this.isControl = data.isControl;
        this.Rank = data.Rank;
        setTimeout(async () => {
            let isQz = this.qzUtil(robotHands);
            if (data.isControl) {
                if (data.Rank == false) {
                    let _arr = [
                        { group: 0, weight: 50 },
                        { group: 1, weight: 30 },
                        { group: 2, weight: 10 },
                    ];
                    isQz = utils.sortProbability_(_arr);
                }
                else {
                    let _arr = [
                        { group: 0, weight: 20 },
                        { group: 1, weight: 20 },
                        { group: 2, weight: 30 },
                        { group: 3, weight: 30 },
                    ];
                    isQz = utils.sortProbability_(_arr);
                }
            }
            await this.delayRequest("qznn.mainHandler.robzhuang", { mul: isQz }, 100);
        }, utils.random(1, 3) * 1000);
    }
    qzUtil(robotHands_c) {
        const ran = utils.random(1, 100);
        this.hasNiu = qznn_logic.isNiuCards(robotHands_c);
        this.max_point = 0;
        for (let card of robotHands_c) {
            if (qznn_logic.getCardValue(card) > this.max_point) {
                this.max_point = qznn_logic.getCardValue(card);
            }
        }
        if (qznn_logic.getCardValue(robotHands_c[0]) == qznn_logic.getCardValue(robotHands_c[1]) &&
            qznn_logic.getCardValue(robotHands_c[1]) == qznn_logic.getCardValue(robotHands_c[2]) &&
            qznn_logic.getCardValue(robotHands_c[2]) == qznn_logic.getCardValue(robotHands_c[3])) {
            this.is_zhadan = true;
            return 3;
        }
        if (!this.hasNiu) {
            if (this.max_point < 7) {
                return 0;
            }
            else {
                if (ran <= 90) {
                    return 0;
                }
                if (ran <= 95)
                    return 1;
                return 2;
            }
        }
        else {
            if (!this.has_robmul3) {
                if (ran <= 10)
                    return 0;
                if (ran <= 40)
                    return 1;
                if (ran <= 70)
                    return 2;
                return 3;
            }
            else {
                if (ran <= 10)
                    return 0;
                if (ran <= 30)
                    return 1;
                if (ran <= 60)
                    return 1;
                return 3;
            }
        }
    }
    async onEnter(onen) {
    }
    onExit(data) {
        if (data.uid == this.uid) {
            this.destroy();
        }
    }
    onWait(res) {
    }
    async onEndRound(res) {
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
}
exports.default = qznnRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpubnJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcXpubi9saWIvcm9ib3QvcXpubnJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYiwyRUFBd0U7QUFDeEUsMkNBQTRDO0FBQzVDLDBDQUEyQztBQUMzQyw0Q0FBNkM7QUFDN0MsK0NBQXdDO0FBQ3hDLE1BQU0sVUFBVSxHQUFHLElBQUEsd0JBQVMsRUFBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFHbEQsTUFBcUIsU0FBVSxTQUFRLHFCQUFTO0lBb0I5QyxZQUFZLElBQVM7UUFDbkIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBakJkLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFHdEIsY0FBUyxHQUFZLEtBQUssQ0FBQztRQUUzQixTQUFJLEdBQVksS0FBSyxDQUFDO1FBR3RCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFNdEIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUloQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFDM0IsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNO1FBQ1YsSUFBSTtZQUNGLElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUV0RSxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3ZDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNoQztRQUFDLE9BQU8sS0FBSyxFQUFFO1lB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