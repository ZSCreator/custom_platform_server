/**
 * 开奖结果
 */
interface LotteryResult {
    result: string[],
    winArea: string[],
    winAreaOdds:  { name:string , odds : number }[],
}