// import { random} from "../benzlogic";
// import {BetAreas} from "../benzConst";
//
// const weights = [
//     { area: BetAreas.BMW, odds: 4, prob: 20 },
//     { area: BetAreas.Benz, odds: 4, prob: 20 },
//     { area: BetAreas.Audi, odds: 4, prob: 20 },
//     { area: BetAreas.AlfaRomeo, odds: 4, prob: 20 },
//     { area: BetAreas.Maserati, odds: 9, prob: 9.34 },
//     { area: BetAreas.Porsche, odds: 14, prob: 5.66 },
//     { area: BetAreas.Lamborghini, odds: 24, prob: 3.5 },
//     { area: BetAreas.Ferrari, odds: 39, prob: 1.5 },
// ]
//
// function getRanomByWeight() {
//     let sum = 0;
//     for (const c of weights) {
//         sum = sum + c.prob;
//     }
//
//     let compareWeight = random(1, sum);
//     let weightIndex = 0;
//     while (sum > 0) {
//         sum = sum - weights[weightIndex].prob
//         if (sum <= compareWeight) {
//             let c = weights[weightIndex];
//             return c;
//         }
//         weightIndex = weightIndex + 1;
//     }
//     return;
// }
//
// /**
//  * 开奖
//  */
// function lottery() {
//     return getRanomByWeight();
// }
//
// class Player {
//     bets: any = {};
//     gold: number = 0;
//
//     constructor(gold: number) {
//         this.gold = gold;
//     }
//
//     addBets(bets) {
//         this.bets = bets;
//     }
// }
//
// function settlement(result: any, player: Player) {
//     const bets = player.bets;
//     let totalProfit = 0;
//
//     for (let key in bets) {
//         if (key === result.area) {
//             const profit = result.odds * bets[key];
//             totalProfit += profit;
//         } else {
//             totalProfit -= bets[key];
//         }
//     }
//
//     player.gold += totalProfit;
//     return totalProfit;
// }
//
// const results = {};
//
// const player = new Player(10000);
// // player.addBets({[BetAreas.Maserati]: 20, [BetAreas.Porsche]: 20, [BetAreas.Lamborghini]: 20, [BetAreas.Ferrari]: 20});
// player.addBets({[BetAreas.Benz]: 10, [BetAreas.BMW]: 10, [BetAreas.Audi]: 10, [BetAreas.AlfaRomeo]: 10});
// // player.addBets({[BetAreas.Benz]: 10});
//
// for (let i = 0; i < 100000; i++) {
//     const result = lottery();
//
//     if (!results[result.area]) {
//         results[result.area] = 0;
//     }
//
//     settlement(result, player);
//
//     // if (player.gold <= 0) {
//     //     console.warn('输光了', i)
//     //     break;
//     // }
//
//     results[result.area] += 1;
// }
//
// console.warn('结果', results);