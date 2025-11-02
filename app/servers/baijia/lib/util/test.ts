// import {canBupaiByPlay, canBupaiByBank, getPai, getCardTypeTo9, getResultTo9} from "../baijia_logic";
// import {random} from "../../../../utils";
// import {writeFileSync} from 'fs';
//
// function genPuke() {
//     let cards = getPai(8);
//     const index = cards.length - random(30, 80);
//     cards =  cards.slice(0, index);
//
//     return cards;
// }
//
// /**
//  * 随机开奖
//  * @param cards
//  */
// function randomLottery(cards: number[]) {
//     const idle = [], banker = [];
//     let bu: number;
//
//     for (let i = 0; i < 2; i++) {
//         idle.push(cards.shift());
//     }
//
//     for (let i = 0; i < 2; i++) {
//         banker.push(cards.shift());
//     }
//
//     let idleType = getCardTypeTo9(idle), bankerType = getCardTypeTo9(banker);
//
//     // 先补闲家
//     if (canBupaiByPlay(idleType, bankerType)) {
//         bu = cards.shift();
//         idle.push(bu);
//     }
//
//     if (canBupaiByBank(idleType, bankerType)) {
//         banker.push(cards.shift());
//     }
//
//     idleType = getCardTypeTo9(idle);
//     bankerType = getCardTypeTo9(banker);
//
//     return getResultTo9(idle, banker, idleType, bankerType);
// }
//
// class Player {
//     bets: any;
//     totalBet: any;
//     gold: number = 0;
//
//     constructor(gold: number) {
//         this.gold = gold;
//         this.bets = {
//             play: { mul: 1, bet: 0, gain: 0 }, // 闲
//             draw: { mul: 8, bet: 0, gain: 0 }, // 和
//             bank: { mul: 0.95, bet: 0, gain: 0 }, // 庄
//             small: { mul: 1.5, bet: 0, gain: 0 }, // 小
//             pair0: { mul: 11, bet: 0, gain: 0 }, // 闲对
//             pair1: { mul: 11, bet: 0, gain: 0 }, // 庄对
//             big: { mul: 0.55, bet: 0, gain: 0 }, // 大
//         };
//     }
//
//     addBets(bets) {
//         for (let area in bets) {
//             this.bets[area].bet = bets[area];
//             this.totalBet = bets[area];
//         }
//     }
// }
//
// function  settlement(result, player: Player) {
//     const bets = player.bets;
//     let profit = 0, water = 0;
//
//     for (let area in bets) {
//         const ver = bets[area];
//
//         if (result[area]) {
//             profit += ver.mul * ver.bet * 0.95;
//             water += ver.mul * ver.bet * 0.05;
//             player.gold += ver.mul * ver.bet * 0.95;
//             // profit += ver.mul * ver.bet;
//             // // water += ver.mul * ver.bet * 0.05;
//             // player.gold += ver.mul * ver.bet;
//         } else {
//             profit -= ver.bet;
//             player.gold -= ver.bet;
//         }
//     }
//
//     if (result.draw) {
//         profit += (player.bets.play.bet + player.bets.bank.bet);
//         player.gold += (player.bets.play.bet + player.bets.bank.bet);
//     }
//
//     return {profit, water};
// }
//
// const player = new Player(100000);
// player.addBets({big: 100});
// let betAmount = 0;
// let profit = 0, winCount = 0, lossCount = 0, drawCount = 0, waterAmount = 0;
//
//
// const amounts = [], killRate = [];
// let cards = genPuke(), roundCount = 0;
//
// for (let i = 0; i < 10000; i++) {
//     if (roundCount >= 48) {
//         cards = genPuke();
//     }
//
//     const result = randomLottery(cards)
//
//     const {profit: totalProfit, water} = settlement(result, player);
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
//     roundCount++;
// }
//
// console.warn('玩家金币', player.gold, waterAmount, betAmount, profit, drawCount, lossCount, winCount);
// writeFileSync('./result.json', JSON.stringify([amounts, killRate]), {flag: 'w'});
//
//
