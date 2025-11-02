"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const qznn_logic_1 = require("./qznn_logic");
class ControlImpl extends baseGameControl_1.BaseGameControl {
    constructor(params) {
        super(params);
        this.isControl = false;
    }
    async runControl() {
        this.isControl = false;
        if (this.room.isSameGamePlayers()) {
            return this.room.randomDeal();
        }
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players, isPlatformControl } = controlResult;
        if (players.length > 0) {
            const needControlPlayers = this.filterNeedControlPlayer(players);
            if (needControlPlayers.length > 0) {
                const positivePlayers = this.filterControlPlayer(players, true);
                const negativePlayers = this.filterControlPlayer(players, false);
                this.isControl = true;
                return this.room.controlPersonalDeal(positivePlayers, negativePlayers);
            }
        }
        if (controlResult.sceneControlState === constants_1.ControlState.NONE) {
            return this.room.randomDeal();
        }
        this.isControl = true;
        return await this.room.runSceneControl(controlResult.sceneControlState, isPlatformControl);
    }
    limitControl() {
        if (this.room._cur_players.every(p => p.isRobot === RoleEnum_1.RoleEnum.ROBOT) ||
            this.room._cur_players.every(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)) {
            return;
        }
        const banker = this.room._cur_players.find(p => p.uid === this.room.zhuangInfo.uid);
        const players = this.room._cur_players.filter(p => p.uid !== banker.uid);
        if (banker.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
            players.forEach(p => {
                if (p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER) {
                    let isBankerWin = (0, qznn_logic_1.bipai)(banker.cards, p.cards);
                    if (!isBankerWin) {
                        const odds = p.betNum * this.room.zhuangInfo.mul * (0, qznn_logic_1.getDoubleByConfig)(p.cardType.count);
                        if (odds >= 90 && (0, utils_1.random)(0, 100) >= 20) {
                            console.warn('变牌之前player', p.uid, banker.cards, p.cards);
                            let best = this.getPlayerBestCards(banker.cards, p.cards);
                            console.warn('变牌之前player', p.uid, best);
                            if ((0, qznn_logic_1.bipai)(p.cards, best)) {
                                this.room.setPlayerCards(p, best);
                                this.room.pais = this.room.pais.filter(c => c !== best[4]);
                            }
                            if ((0, qznn_logic_1.bipai)(banker.cards, p.cards))
                                return;
                            best = this.getBankerBestCards(banker.cards, p.cards);
                            if (!(0, qznn_logic_1.bipai)(banker.cards, best)) {
                                console.warn('变牌之后player 庄家机器人变牌', banker.uid, best);
                                this.room.setPlayerCards(banker, best);
                                this.room.pais = this.room.pais.filter(c => c !== best[4]);
                            }
                        }
                    }
                }
            });
            return;
        }
        players.forEach(p => {
            if (p.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
                const isBankerWin = (0, qznn_logic_1.bipai)(banker.cards, p.cards);
                if (isBankerWin) {
                    const odds = p.betNum * this.room.zhuangInfo.mul * (0, qznn_logic_1.getDoubleByConfig)(banker.cardType.count);
                    console.warn('限制押注调控', odds);
                    if (odds >= 90 && (0, utils_1.random)(0, 100) >= 20) {
                        console.warn('变牌之前banker', banker.uid, banker.cards, p.cards);
                        let best = this.getBankerBestCardsRealPlayer(banker.cards, p.cards);
                        console.warn('变牌之后banker', best);
                        if ((0, qznn_logic_1.bipai)(banker.cards, best)) {
                            this.room.setPlayerCards(banker, best);
                            this.room.pais = this.room.pais.filter(c => c !== best[4]);
                        }
                        if (!(0, qznn_logic_1.bipai)(banker.cards, p.cards))
                            return;
                        best = this.getPlayerBestCardsRealPlayer(banker.cards, p.cards);
                        if (!(0, qznn_logic_1.bipai)(p.cards, best)) {
                            console.warn('变牌之后banker 玩家机器人变牌', p.uid, best);
                            this.room.setPlayerCards(p, best);
                            this.room.pais = this.room.pais.filter(c => c !== best[4]);
                        }
                    }
                }
            }
        });
    }
    getPlayerBestCards(bankerCards, playerCards) {
        let cp = playerCards.slice();
        let best = cp.slice();
        let isBankerWin;
        for (let c of this.room.pais) {
            cp[4] = c;
            isBankerWin = (0, qznn_logic_1.bipai)(bankerCards, cp);
            if (isBankerWin) {
                best = cp.slice();
                break;
            }
            if ((0, qznn_logic_1.bipai)(best, cp)) {
                best = cp.slice();
            }
        }
        return best;
    }
    getBankerBestCards(bankerCards, playerCards) {
        let cp = bankerCards.slice();
        let best = cp.slice();
        let isBankerWin;
        for (let c of this.room.pais) {
            cp[4] = c;
            isBankerWin = (0, qznn_logic_1.bipai)(cp, playerCards);
            if (isBankerWin) {
                best = cp.slice();
                break;
            }
            if (!(0, qznn_logic_1.bipai)(best, cp)) {
                best = cp.slice();
            }
        }
        return best;
    }
    getBankerBestCardsRealPlayer(bankerCards, playerCards) {
        let cp = bankerCards.slice();
        let best = cp.slice();
        let isWin;
        for (let c of this.room.pais) {
            cp[4] = c;
            isWin = (0, qznn_logic_1.bipai)(cp, playerCards);
            if (!isWin) {
                best = cp.slice();
                break;
            }
            if (!(0, qznn_logic_1.bipai)(best, cp)) {
                best = cp.slice();
            }
        }
        return best;
    }
    getPlayerBestCardsRealPlayer(bankerCards, playerCards) {
        let cp = playerCards.slice();
        let best = cp.slice();
        let isWin;
        for (let c of this.room.pais) {
            cp[4] = c;
            isWin = (0, qznn_logic_1.bipai)(cp, bankerCards);
            if (isWin) {
                best = cp.slice();
                break;
            }
            if (!(0, qznn_logic_1.bipai)(best, cp)) {
                best = cp.slice();
            }
        }
        return best;
    }
    stripPlayers() {
        return this.room._cur_players.map(player => (0, utils_1.filterProperty)(player));
    }
}
exports.default = ControlImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xem5uL2xpYi9Db250cm9sSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDBDQUFzRDtBQUN0RCxtRkFBOEU7QUFFOUUsc0VBQW9FO0FBQ3BFLHVFQUFrRTtBQUNsRSw2Q0FBc0Q7QUFLdEQsTUFBcUIsV0FBWSxTQUFRLGlDQUFlO0lBR3BELFlBQVksTUFBMEI7UUFDbEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRmxCLGNBQVMsR0FBWSxLQUFLLENBQUM7SUFHM0IsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVO1FBQ1osSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFFdkIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDL0IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQ2pDO1FBR0QsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNwRCxNQUFNLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFHLGlCQUFpQixFQUFFLEdBQUcsYUFBYSxDQUFDO1FBRzlFLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFFcEIsTUFBTSxrQkFBa0IsR0FBNEIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTFGLElBQUksa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFFL0IsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFaEUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDakUsSUFBSSxDQUFDLFNBQVMsR0FB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