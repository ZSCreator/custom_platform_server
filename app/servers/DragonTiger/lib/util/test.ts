// import {getCardValue} from "./lotteryUtil";
// import {odds} from '../DragonTigerConst';
// import {writeFileSync} from 'fs';
//
// function puke() {
//     let arr: number[] = [];
//     for (let index = 1; index < 52; index++) {
//         arr.push(index);
//     }
//     // 打乱数组
//     arr.sort((a, b) => Math.random() > 0.5 ? -1 : 1);
//     return arr;
// }
//
// function lottery() {
//     const cards = puke();
//     const result = cards.slice(0, 2);
//     return { d: result[0], t: result[1] };
// }
//
// function winAreas(results: { d: number, t: number }) {
//     let winArea: string[] = [];
//
//     if (getCardValue(results.d) == getCardValue(results.t)) {
//         return `f`;
//     } else if (getCardValue(results.d) > getCardValue(results.t)) {
//         return `d`;
//     } else {
//         return `t`;
//     }
// }
//
// class Player {
//     bets: {[key: string]: number} = {};
//     gold: number = 0;
//     totalBet: number = 0;
//
//     constructor(gold: number) {
//         this.gold = gold;
//     }
//
//     addBets(bets) {
//         for (let area in bets) {
//             this.bets[area] = bets[area];
//             this.totalBet += bets[area];
//         }
//     }
// }
//
// function settlement(player: Player) {
//     const lotteryResults = lottery();
//     const winArea = winAreas(lotteryResults);
//     const bets = player.bets;
//
//     let totalProfit = 0,  water = 0;;
//
//     for (const area in bets) {
//         // if (Math.random() <= 0.01) {
//         //     const profit = bets[area] * odds[area] * 0.95;
//         //     player.gold += profit;
//         //     totalProfit += profit;
//         //
//         //     break;
//         // }
//
//         if (winArea === area) {
//             const profit = bets[area] * odds[area] * 0.95;
//             // const profit = bets[area] * odds[area] ;
//             player.gold += profit;
//             totalProfit += profit;
//             water += bets[area] * odds[area] * 0.05;
//
//         } else {
//             if (winArea === 'f') {
//                 if (area === 't' || area === 'd') {
//
//                 }
//             } else {
//                 const profit = -(bets[area]);
//                 player.gold += profit;
//                 totalProfit += profit;
//             }
//         }
//     }
//
//
//
//
//
//     // if (totalProfit > 0) {
//     //     totalProfit *= 0.95;
//     //     water += totalProfit * 0.05;
//     // }
//
//
//
//     return {totalProfit, water};
// }
//
// const player = new Player(100000);
// player.addBets({d: 100});
// let betAmount = 0;
// let profit = 0, winCount = 0, lossCount = 0, drawCount = 0, waterAmount = 0;
//
//
// const amounts = [], killRate = [];
//
// for (let i = 0; i < 10000; i++) {
//     const {totalProfit, water} = settlement(player);
//     profit -= totalProfit;
//     betAmount += player.totalBet;
//     waterAmount += water
//
//     if (totalProfit === 0) {
//         drawCount += 1;
//     } else if (totalProfit > 0) {
//         winCount += 1;
//     } else {
//         lossCount += 1;
//     }
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
//     if (player.gold <= 0) {
//         console.warn('玩家输光了')
//         break;
//     }
//
// }
//
// console.warn('玩家金币', player.gold, waterAmount, betAmount, profit, drawCount, lossCount, winCount);
// writeFileSync('./result.json', JSON.stringify([amounts, killRate]), {flag: 'w'});
//
//
//
//
//
//
