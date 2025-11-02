// import * as sangongConst from '../../app/servers/sangong/lib/sangongConst';

{
    let Banker = {
        robOdds: 5,
        gold: 80,
        profit: 0
    }
    let curPlayers = [
        { isWin: true, profit: 0, gold: 20, bet: 50 },
        { isWin: true, profit: 0, gold: 60, bet: 60 },
        { isWin: true, profit: 0, gold: 200, bet: 500 },
    ]

    /**以小博大*/
    {
        /**庄家赢取 */
        let totalWin = 0;
        /**计算庄家可赢取 */
        for (const pl of curPlayers) {
            if (pl.isWin) {
                let mloseGold = pl.bet;
                // 检查玩家钱包的金币
                pl.profit = - mloseGold;
                totalWin += mloseGold;
            }
        }
        /**原始赢取 算比列用 */
        let initialWin = totalWin;
        /**修正最大赢取 */
        if (totalWin > Banker.gold) {
            totalWin = Banker.gold;
        }
        /**临时计算 储存值 */
        let temp_totalWin = totalWin;
        /**按比列 和 最大输 修正玩家输出金币 */
        for (const pl of curPlayers) {
            if (pl.isWin) {
                pl.profit = -Math.abs((pl.profit / initialWin) * temp_totalWin);
                let diffNum = Math.abs(pl.profit) - pl.gold;
                if (diffNum > 0) {
                    pl.profit = -pl.gold;
                    totalWin -= diffNum;
                }
            }
        }
        Banker.profit += totalWin;
        console.warn(initialWin, totalWin);
        // console.warn(Banker);
        // console.warn(curPlayers);
        /**第二部分 庄家输钱出去 */
        let totalLoss = 0;
        for (const pl of curPlayers) {
            if (!pl.isWin) {
                pl.profit = pl.bet;
                let diffNum = Math.abs(pl.profit) - pl.gold;
                if (diffNum > 0) {
                    pl.profit = pl.gold;
                    // totalLoss += diffNum;
                }
                totalLoss -= pl.profit;
            }
        }
        console.warn("=====", curPlayers);
        /**原始赢取 算比列用 */
        let initialLoss = totalLoss;
        /**修正最大赢取 */
        if (Math.abs(totalLoss) > (Banker.gold + totalWin)) {
            totalLoss = -(Banker.gold + totalWin);
        }
        // let temp_totalLoss = totalLoss;
        /**按比列 和 最大输 修正玩家输出金币 */
        for (const pl of curPlayers) {
            if (!pl.isWin) {
                pl.profit = Math.abs((pl.profit / initialLoss) * totalLoss);
            }
        }
        Banker.profit = totalWin + totalLoss;
    }
    console.warn("=====================================")
    console.warn(Banker);
    console.warn(curPlayers);
}