import qznnRoom from "./qznnRoom";
import {filterProperty, random} from "../../../utils";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {ControlState} from "../../../services/newControl/constants";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";
import {bipai, getDoubleByConfig} from "./qznn_logic";

/**
 * 抢庄牛牛调控
 */
export default class ControlImpl extends BaseGameControl {
    room: qznnRoom;
    isControl: boolean = false;
    constructor(params: { room: qznnRoom }) {
        super(params);
    }

    async runControl(): Promise<any> {
        this.isControl = false;
        // 如果所有玩家类型相同则不进行调控
        if (this.room.isSameGamePlayers()) {
            return this.room.randomDeal();
        }

        // 获取调控结果
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players,  isPlatformControl } = controlResult;

        // 如果是个控方案且有个控玩家
        if (players.length > 0) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            if (needControlPlayers.length > 0) {
                // 查看正调控的玩家
                const positivePlayers = this.filterControlPlayer(players, true);
                // 如果有负调控的玩家
                const negativePlayers = this.filterControlPlayer(players, false);
                this.isControl = true;

                return this.room.controlPersonalDeal(positivePlayers, negativePlayers);
            }
        }

        if (controlResult.sceneControlState === ControlState.NONE) {
            return this.room.randomDeal();
        }

        this.isControl = true;
        return await this.room.runSceneControl(controlResult.sceneControlState, isPlatformControl);
    }

    /**
     * 兜底调控
     */
    limitControl() {
        if (this.room._cur_players.every(p => p.isRobot === RoleEnum.ROBOT) ||
            this.room._cur_players.every(p => p.isRobot === RoleEnum.REAL_PLAYER)) {
            return;
        }

        const banker = this.room._cur_players.find(p => p.uid === this.room.zhuangInfo.uid);
        const players = this.room._cur_players.filter(p => p.uid !== banker.uid);

        if (banker.isRobot === RoleEnum.ROBOT) {
            players.forEach(p => {
                if (p.isRobot === RoleEnum.REAL_PLAYER) {
                    let isBankerWin = bipai(banker.cards, p.cards);

                    if (!isBankerWin) {
                        const odds = p.betNum * this.room.zhuangInfo.mul * getDoubleByConfig(p.cardType.count);

                        // 进行干预
                        if (odds >= 90 && random(0, 100) >= 20) {
                            console.warn('变牌之前player', p.uid, banker.cards, p.cards);
                            // 变玩家牌  变出比庄家小得牌即可
                            let best = this.getPlayerBestCards(banker.cards, p.cards);
                            console.warn('变牌之前player', p.uid, best);

                            // 当前的牌比玩家的大才换
                            if (bipai(p.cards, best)) {
                                this.room.setPlayerCards(p, best);
                                this.room.pais = this.room.pais.filter(c => c !== best[4]);
                            }

                            if (bipai(banker.cards, p.cards)) return;

                            // 如果变不出来  尽可能调小玩家的牌 然后变庄家的牌
                            best = this.getBankerBestCards(banker.cards, p.cards);

                            if (!bipai(banker.cards, best)) {
                                console.warn('变牌之后player 庄家机器人变牌', banker.uid, best);
                                this.room.setPlayerCards(banker, best);
                                this.room.pais = this.room.pais.filter(c => c !== best[4]);
                            }
                        }
                    }
                }
            })

            return ;
        }

        players.forEach(p => {
            if (p.isRobot === RoleEnum.ROBOT) {
                const isBankerWin = bipai(banker.cards, p.cards);

                if (isBankerWin) {
                    const odds = p.betNum * this.room.zhuangInfo.mul * getDoubleByConfig(banker.cardType.count);

                    console.warn('限制押注调控', odds);
                    // 进行干预
                    if (odds >= 90 && random(0, 100) >= 20) {
                        console.warn('变牌之前banker', banker.uid, banker.cards, p.cards);
                        // 变庄家牌  变出比该玩家得牌即可
                        let best = this.getBankerBestCardsRealPlayer(banker.cards, p.cards);
                        console.warn('变牌之后banker', best);

                        // 如果当前庄的牌比换的牌大换牌
                        if (bipai(banker.cards, best)) {
                            this.room.setPlayerCards(banker, best);
                            this.room.pais = this.room.pais.filter(c => c !== best[4]);
                        }

                        if (!bipai(banker.cards, p.cards)) return;

                        // 如果变不出来  尽可能调庄家的牌 然后变玩家的牌
                        best = this.getPlayerBestCardsRealPlayer(banker.cards, p.cards);
                        if (!bipai(p.cards, best)) {
                            console.warn('变牌之后banker 玩家机器人变牌', p.uid, best);
                            this.room.setPlayerCards(p, best);
                            this.room.pais = this.room.pais.filter(c => c !== best[4]);
                        }
                    }
                }
            }
        })
    }

    /**
     * 当装家是机器人的时候获取最合适的牌
     * @param bankerCards 庄家牌
     * @param playerCards 玩家牌越好
     */
    getPlayerBestCards(bankerCards, playerCards) {
        // 变玩家牌  变出比庄家小得牌即可
        let cp = playerCards.slice();
        let best = cp.slice();
        let isBankerWin;
        for (let c of this.room.pais) {
            cp[4] = c;

            isBankerWin = bipai(bankerCards, cp);

            // 如果庄家比他大则换牌
            if (isBankerWin) {
                best = cp.slice();
                break;
            }

            // 如果当前换牌比以前的牌大则
            if (bipai(best, cp)) {
                best = cp.slice();
            }
        }

        return best;
    }

    /**
     * 获取
     * @param bankerCards
     * @param playerCards
     */
    getBankerBestCards(bankerCards, playerCards) {
        let cp = bankerCards.slice();
        let best = cp.slice();
        let isBankerWin;
        for (let c of this.room.pais) {
            cp[4] = c;

            isBankerWin = bipai(cp, playerCards);

            // 如果庄家比他大则换牌
            if (isBankerWin) {
                best = cp.slice();
                break;
            }

            // 如果当前换牌比以前的牌小则换牌
            if (!bipai(best, cp)) {
                best = cp.slice();
            }
        }

        return best;
    }

    /**
     * 当真人玩家是庄的时候 调控庄最好的牌
     * @param bankerCards
     * @param playerCards
     */
    getBankerBestCardsRealPlayer(bankerCards, playerCards) {
        let cp = bankerCards.slice();
        let best = cp.slice();
        let isWin;
        for (let c of this.room.pais) {
            cp[4] = c;

            isWin = bipai(cp, playerCards);

            // 如果庄家比他小则换牌
            if (!isWin) {
                best = cp.slice();
                break;
            }

            // 如果当前换牌比没有以前的牌大则通过
            if (!bipai(best, cp)) {
                best = cp.slice();
            }
        }

        return best;
    }

    /**
     * 当庄家是真人的时候获取机器人玩家最合适的牌
     * @param bankerCards 庄家牌
     * @param playerCards 玩家牌越好
     */
    getPlayerBestCardsRealPlayer(bankerCards, playerCards) {
        let cp = playerCards.slice();
        let best = cp.slice();
        let isWin;
        for (let c of this.room.pais) {
            cp[4] = c;

            isWin = bipai(cp, bankerCards);

            // 如果他大庄大则换牌
            if (isWin) {
                best = cp.slice();
                break;
            }

            // 如果当前换牌比以前的牌小则换牌
            if (!bipai(best, cp)) {
                best = cp.slice();
            }
        }

        return best;
    }

    /**
     * 包装游戏玩家
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room._cur_players.map(player => filterProperty(player));
    }
}