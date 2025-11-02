/**
 * 玩家保险区域
 */
export class BlackJackPlayerInsuranceArea {

    /** @property 当前区域是否购买保险 */
    private hadBuyInsurance: boolean = false;

    /** @property 保险金额 */
    private bet: number = 0;

    public setBet(bet: number) {
        this.bet = Math.ceil(bet / 2);
        return this.bet;
    }

    /**
     * 获取保险金额
     */
    public getBet() {
        return this.bet;
    }

    public checkBuyInsurance() {
        return this.hadBuyInsurance;
    }

    public buyInsurance() {

        if (!this.hadBuyInsurance) {
            this.hadBuyInsurance = true;
        }

    }
}
