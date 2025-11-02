// import {lottery, compare} from './lotteryUtil';
// import {betArea, odds2, pair} from "../RedBlackConst";
// import {writeFileSync} from "fs";
//
// function _lottery() {
//     const result = lottery();
//     const winAreas = compare(result.red, result.black);
//
//     return {result, winAreas};
// }
//
// class Player {
//     gold: number = 0;
//     totalBet: number = 0;
//     bets: any;
//
//     constructor(gold: number) {
//         this.gold = gold;
//     }
//
//     addBets(bets) {
//         this.bets = bets;
//
//         for (let i in bets) {
//             this.totalBet += bets[i];
//         }
//     }
//
// }
//
// function settlement(winArea, player: Player) {
//     const bets = player.bets;
//     let totalProfit = 0, water = 0;
//
//     for (let area in bets) {
//         if (area === betArea.luck) {
//             if (!!winArea.luck && winArea.luck >= pair[7]) {
//                 totalProfit += bets[area] * odds2[winArea.luck] - bets[area];
//                 continue;
//             } else {
//                 totalProfit -= bets[area];
//             }
//         }
//
//         if (area === winArea.win) {
//             totalProfit += bets[area] * odds2[winArea.win] - bets[area];
//         } else {
//             totalProfit -= bets[area];
//         }
//     }
//
//     if (totalProfit > 0) {
//         water = totalProfit * 0.05
//         totalProfit *= 0.95
//     }
//
//     player.gold += totalProfit
//
//     return {totalProfit, water};
// }
//
//
// let counts = {luck: 0, pair: 0, sz: 9, th: 0, ths: 0, bz: 0};
//
// const player = new Player(10000);
// player.addBets({red: 10, black:10})
//
// let betAmount = 0;
// let profit = 0, winCount = 0, lossCount = 0, drawCount = 0, waterAmount = 0;
// const amounts = [], killRate = [];
//
// for (let i = 0; i < 10; i++) {
//     const {result, winAreas} = _lottery();
//     const {water, totalProfit} = settlement(winAreas, player)
//
//     betAmount += player.totalBet;
//     waterAmount += water;
//     profit -= totalProfit;
//
//     if (betAmount > 10000) {
//         if (i % 100 === 0) {
//             amounts.push(betAmount);
//
//             const rate = (profit + waterAmount) / betAmount;
//
//             killRate.push(Math.floor(rate * 100) / 100);
//         }
//     }
//
//     if (!counts[winAreas.win]) {
//         counts[winAreas.win] = 0;
//     }
//
//     counts[winAreas.win]++;
//
//     if (!!winAreas.luck && winAreas.luck >= pair[7]) {
//         counts["luck"] += 1;
//
//         if (winAreas.luck <= 14) {
//             counts['pair'] += 1;
//         }
//
//         if (winAreas.luck === 15) {
//             counts['sz'] += 1;
//         }
//
//         if (winAreas.luck === 16) {
//             counts['th'] += 1;
//         }
//
//         if (winAreas.luck === 17) {
//             counts['ths'] += 1;
//         }
//
//         if (winAreas.luck === 18) {
//             counts['bz'] += 1;
//         }
//     }
//
//
// }
//
// console.warn('结果', counts, player.gold);
// writeFileSync('./result.json', JSON.stringify([amounts, killRate]), {flag: 'w'});
//
