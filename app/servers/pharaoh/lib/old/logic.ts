'use strict';

import config = require('./config');
import util = require('../../../../utils');
import { slotsAwardRateLimit } from "../../../../consts/allSlotsGameConst";

/**
 * 判断该下注数和下注倍数是否合理
 */
export const isHaveBet = (betNum: number, betOdd: number) => {
	if (!config.stake.num.includes(betNum)) {
		return '下注数不合法';
	}
	if (!config.stake.odd.includes(betOdd)) {
		return '下注倍数不合法';
	}
	return true;
};

/**
 * 根据 铲子数判断关卡
 */
export const pass = ({ shovelNum }) => {
	shovelNum = parseInt(shovelNum);
	if (shovelNum < 0) {
		return null;
	}
	return Math.floor(shovelNum / 15) % 3 + 1;
};

/**
 * 生成大雷管的概率
 */
export const bigDetonatorProbility = () => {
	return 0.1;
};

/**
 * 选择游戏轮盘
 */
export const selectRoulette = (cur) => {
	if (cur == '1') {
		return Math.random() < 0.0417 ? '2' : '1';
	} else if (cur == '2') {
		return Math.random() < 0.0667 ? '3' : '2';
	} else if (cur == '3') {
		return Math.random() < 0.0909 ? '1' : '3';
	} else {
		return '2';
	}
};

/**
 * 根据押注得到的大奖赔率
 */
export const bigOdd = (betAll) => {
	return betAll / 10;
};

/**
 * 将一个对象的所有键的值赋值为0
 */
const keyValueZero = (obj) => {
	for (let i in obj) {
		obj[i] = 0;
	}
};

/**
 * 在n*n的数组中随机一个2*2的矩形
 */
const randSquare = (n) => {
	if (n < 2) {
		throw new Error(`参数有误 ${n}`);
	}
	const first = [util.random(0, n - 1), util.random(0, n - 1)];
	const others = [first[0] + '' + first[1]];
	//随即一个和first距离为根号2的点
	(function () {
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (Math.pow(i - first[0], 2) + Math.pow(j - first[1], 2) == 2) {  //(i ,j)满足条件
					others.push(i + '' + j);
					if (i > first[0]) {
						others.push(first[0] + '' + j, i + '' + first[1]);
						return;
					} else {
						others.push(i + '' + first[1], first[0] + '' + j);
						return;
					}
				}
			}
		}
	})();
	return others;
};
/**
 * 按照游戏配置生成窗口
 */
export const generatorWindow = (pass, bigDetonatorPro = 1.0 / 20) => {
	let winIds = [], bonusNum = 0, freespinNum = 0, shovelNum = 0, only;
	//判断是否有大雷管
	const bigDetonator = Math.random() < bigDetonatorPro;
	bigDetonator && (only = config.shovel, shovelNum = 4);
	const colDistribute = Object.keys(config.type).map(id => {
		if (config.specialEle.includes(id)) {
			if (bigDetonator) {
				return { [id]: 0 }
			}
			return { [id]: config.type[id].weight[pass] }
		} else {
			return { [id]: config.type[id].weight };
		}
	});
	for (let i = 0; i < config.checkPoint[pass]; i++) {
		let colArray = [];
		for (let j = 0; j < config.checkPoint[pass]; j++) {
			let select = util.selectEle(colDistribute);
			// 控制每局游戏只出现一种特殊元素
			if (config.specialEle.includes(select) && only == null) {
				only = select;
			}
			if (!bigDetonator && only != null) {
				config.specialEle.filter(e => e != only).forEach(e => {
					keyValueZero(colDistribute.find(dis => Object.keys(dis)[0] == e));
				});
			}

			if (select == config.free) {  //开出引爆
				if (freespinNum < config.type[select].max) {
					freespinNum++;
					if (freespinNum >= config.type[select].max) {
						const index = colDistribute.findIndex(e => Object.keys(e)[0] == select);
						colDistribute[index] = { [select]: 0 };
					}
				}
			}
			if (select == config.bonus) {
				if (bonusNum < config.type[select].max) {
					bonusNum++;
					if (bonusNum >= config.type[select].max) {
						const index = colDistribute.findIndex(e => Object.keys(e)[0] == select);
						colDistribute[index] = { [select]: 0 };
					}
				}
			}
			if (select == config.shovel) {
				if (shovelNum < config.type[select].max) {
					shovelNum++;
					if (shovelNum >= config.type[select].max) {
						const index = colDistribute.findIndex(e => Object.keys(e)[0] == select);
						colDistribute[index] = { [select]: 0 };
					}
				}
			}
			colArray.push(select);
		}
		winIds.push(colArray);
	}
	if (bigDetonator) {
		randSquare(config.checkPoint[pass]).forEach(e => winIds[e[0]][e[1]] = config.shovel);
	}
	return { winIds, only, shovelNum };
};

/**
 * 判断两个Set数据的结构是否完全相同
 */
let isEqualSet = (a, b) => {
	return new Set([...a].filter(x => !b.has(x))).size == 0 &&
		new Set([...b].filter(x => !a.has(x))).size == 0
};

/**
 * 判断两个位置是否相邻
 */
const isAdjoin = ([x1, y1], [x2, y2]) => {
	const leg = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	if (leg == 1) {
		return true;
	}
	return false;
};

/**
 * 根据坐标数组查找需要消除的位置
 */
const clear = (position, pass) => {
	let mid = {};

	for (let i in position) {
		let remain: any = util.difference(position, position[i]);

		for (let j in remain) {
			if (isAdjoin(position[i], remain[j])) {
				if (mid[position[i]] == null) {	
					mid[position[i]] = new Set()
				}
				// console.warn('33333', mid)
				mid[position[i]].add(remain[j].join('-'));
			}
		}
	}
	for (let i in mid) {
		mid[i].forEach((value, key) => {
			mid[value.split('-')].forEach((v, k) => {
				mid[i].add(v);
			})
		})
	}

	const vMid: any = util.values(mid);
	for (let ii in vMid) {
		let i = Number(ii)
		if (vMid[i] == null) {
			continue;
		}
		for (let j = i + 1; j < vMid.length; j++) {
			if (vMid[j] == null) {
				continue;
			}
			if (isEqualSet(vMid[i], vMid[j])) {
				vMid[j] = null;
			}
		}
	}
	return vMid.filter(e => e != null && e.size >= config.checkPoint[pass]);
};

/**
 * 根据生成的窗口判断消除情况
 */
export const windowClear = (winIds, pass) => {
	let censu = {};
	for (let i in winIds) {  //将每种类型的元素归类
		for (let j in winIds[i]) {
			if (Object.keys(config.type).includes(winIds[i][j])) {
				if (censu[winIds[i][j]] == null) {
					censu[winIds[i][j]] = [];
				}
				censu[winIds[i][j]].push([Number(i), Number(j)])
			}
		}
	}
	//先消除特殊元素再消除普通元素
	let temp = censu;
	for (let i in censu) {
		if (i == 'H') {
			console.log(censu['H']);
			temp = { 'H': censu['H'] }
		}
	}
	censu = temp;

	for (let i in censu) {
		if (i == 'S') {
			console.log(censu['S']);
			temp = { 'S': censu['S'] }
		}
	}
	censu = temp;
	/*
	for(let i in censu){
		if(i=='F'){
			console.log(censu['F']);
			temp = {'F':censu['F']}
		}
	}	
	censu = temp
	*/
	const awardResult = {};
	//判断是否存在 爆破元素 （F）
	const existF = !!censu[config.free];
	let clearAll = null;
	if (existF) {  //如果存在爆破 随机一个普通元素消除
		const existODE = Object.keys(censu).filter(t => config.ordinaryEle.includes(t));
		clearAll = existODE[Math.floor(Math.random() * existODE.length)];
	}
	for (let i in censu) {
		const position = censu[i];
		if (config.ordinaryEle.includes(i)) {
			if (i !== clearAll) {
				awardResult[i] = clear(position, pass);
			} else {
				awardResult[i] = [position];
			}
		} else {
			awardResult[i] = [position];
		}
	}
	// console.warn('333333333333',awardResult);
	const clearElement:any = util.filter((e: any) => e.length > 0)(awardResult);

	// console.warn('5555555555', clearElement);
	for (let i in clearElement) {
		if (config.ordinaryEle.includes(i) && i !== clearAll) {
			clearElement[i] = clearElement[i].map(e => {
				return Array.from(e).map((k: any) => k.split('-'));
			});
		}
	}

	for (let i in clearElement) {
		for (let j in clearElement[i]) {
			clearElement[i][j] = util.sortWith([
				(r1, r2) => r2[1] - r1[1],
				(r1, r2) => r1[0] - r2[0]
			])(clearElement[i][j])
		}
		clearElement[i] = util.sortWith([
			(r1, r2) => r2[0][1] - r1[0][1],
			(r1, r2) => r1[0][0] - r2[0][0],
		])(clearElement[i])
	}
	return { clearElement, clearAll };
};

/**
 * 根据消除将原窗口降落并补全
 */
export const completeWindow = (winIds, clearElement, only, clearAll) => {

	const pass = winIds.length == 4 ? '1' : winIds.length == 5 ? '2' : '3';
	const allClear = [], position = [];
	for (let i in clearElement) {
		clearElement[i].forEach(ele => {
			if (i == clearAll) {
				ele.forEach(e => allClear.unshift(e));
			} else {
				ele.forEach(e => allClear.push(e));
			}
		})
	}
	allClear.forEach(re => {
		winIds[re[0]][re[1]] = 'del';
		position.push({ x: Number(re[0]), y: Number(re[1]) });
	});
	//降落
	for (let i in winIds) { //每列
		for (let j = winIds[i].length - 1; j > 0; j--) {  //从每列底部开始
			if (winIds[i][j] == 'del') {
				const index = util.findLastIndex(v => v != 'del')(winIds[i].slice(0, j))
				if (index != -1) {
					[winIds[i][j], winIds[i][index]] = [winIds[i][index], winIds[i][j]]
				}
			}
		}
	}
	//补全
	const colDistribute = Object.keys(config.type).map(id => {
		if (config.specialEle.includes(id)) {
			return { key: id, value: 0 };
		} else {
			return { key: id, value: config.type[id].weight };
		}
	});
	const newly = [];
	let bonusNum = 0;
	for (let i in winIds) {
		const col = [];
		for (let j in winIds) {
			if (winIds[i][j] == 'del') {
				let select = util.selectElement(colDistribute);
				winIds[i][j] = select;
				col.push({ type: winIds[i][j] });
			} else {
				break;
			}
		}
		newly.push(col);
	}
	return { winIds, newly, position }
};

/**
 * 根据窗口的消除情况计算中奖情况
 */
export const windowAward = ({ clearElement, jackpotMoney, jackpotOdd, pass, clearAll, totalBet }) => {
	if (util.isVoid(clearElement)) {
		// return false;
	}
	const result = { windowAward: 0, jackpotMoney: null };

	//遍历所有消除的元素
	for (let i in clearElement) {
		if (i == config.shovel) {  //铲子
			result[i] = { shovelNum: clearElement[i][0].length };
		} else if (i == config.bonus) {  //bonus
			const bonusNum = clearElement[i][0].length;
			const jackpotWin = config.jackpotBigWin[bonusNum];
			const fixedAward = 7.5 * totalBet;
			jackpotMoney -= fixedAward;
			const floatAward = Math.ceil(jackpotMoney * jackpotWin.ratio * jackpotOdd);
			const award = fixedAward + floatAward;
			jackpotMoney -= award;
			//窗口上的bonus奖金额外计算
			//result.windowAward += award;
			result[i] = { bonusNum, award, type: jackpotWin.name }
		} else if (config.ordinaryEle.includes(i)) {   //普通元素
			const groupNum = clearElement[i].length;
			result[i] = {};
			const eleAward = config.type[i].clearAward[pass];
			for (let j in clearElement[i]) {
				const len = clearElement[i][j].length;
				let award;
				if (i === clearAll && len < config.checkPoint[pass]) {
					award = config.type['A'].clearAward[pass][0];
				} else if (eleAward[len - 4 + 1 - pass] == undefined) {
					award = eleAward[eleAward.length - 1];
				} else {
					award = eleAward[len - 4 + 1 - pass];
				}
				result.windowAward += award;
				result[i]['group' + j] = {
					award,
				}
			}
		}
	}
	result.jackpotMoney = jackpotMoney;
	return result;
};

//改变数据结构
const changeWins = (winArray) => {
	const result = winArray.map(line => {
		return line.map(e => {
			return { type: e }
		})
	});
	return result;
};

/**
 * 统计此局游戏最终结果
 */
export const finalResult = ({ winIds, jackpotMoney, pass, totalBet, only, jackpotAndProfit }) => {
	const result = { totalWin: 0, wins: [], awards: [], shovelNum: 0, jackpotWin: [], jackpotTypes: [], clearAll: null };
	//先加入初始窗口
	result.wins.push(changeWins(winIds));
	//初始窗口的消除
	let { clearElement, clearAll } = windowClear(winIds, pass);
	result.clearAll = clearAll;
	const jackpotOdd = bigOdd(totalBet);

	while (true) {
		//窗口可消除
		if (!util.isVoid(clearElement)) {
			// 该可消除的窗口的盈利情况
			let winAward = windowAward({ clearElement, jackpotMoney, jackpotOdd, pass, clearAll, totalBet });
			jackpotMoney = winAward.jackpotMoney;

			if (winAward[config.shovel]) { // 统计铲子
				result.shovelNum += winAward[config.shovel].shovelNum;
			}
			if (winAward[config.bonus]) {  //统计bonus产生的奖池
				result.jackpotWin.push(winAward[config.bonus].award);
				result.jackpotTypes.push(winAward[config.bonus].type);
			}
			result.totalWin += winAward.windowAward;
			result.awards.push(winAward.windowAward * totalBet);

			//消除窗口的可消除的元素 得到新窗口
			let newWindow = completeWindow(util.clone(winIds), clearElement, only, clearAll);
			result.wins.push(newWindow.position);
			result.wins.push(newWindow.newly);

			winIds = newWindow.winIds;
			clearElement = windowClear(winIds, pass).clearElement;
		} else {
			break;
		}
	}
	result.totalWin = result.totalWin * totalBet + result.jackpotWin.reduce((num, v) => num + v, 0);

	return result;
};

/**
 * 生成小游戏的初始页面
 */
export const littlerGameWindow = (pass) => {
	const winIds = [];
	const range = config.littleGame[pass].range;

	for (let i = 0; i < range[0]; i++) {
		const colIds = [];
		for (let j = 0; j < range[1]; j++) {
			colIds.push(null);
		}
		winIds.push(colIds);
	}
	return winIds;
};

/**
 * 玩家投掷
 */
export const cast1 = (userLittleGame, jackpotMoney) => {
	let minTimes = 6;  //初始六次投掷
	const castResult = [];
	let winTotal = 0, bigWinRoulette, jackpotWin = 0;
	while (minTimes > 0) {
		const randomPoint = util.random(1, 6);  //随机点数
		userLittleGame.curPosition += randomPoint;
		if (userLittleGame.curPosition > config.littleGame[userLittleGame.pass].length) {
			userLittleGame.curPosition = config.littleGame[userLittleGame.pass].length;
		}
		const curAward = config.littleGame[userLittleGame.pass][userLittleGame.curPosition - 1];
		const result: any = { point: randomPoint, awardType: curAward };
		if (['gold', 'silver', 'copper'].includes(curAward)) {  //金 银 铜
			result.award = userLittleGame.initMoney * config.acerType[curAward];
			winTotal += result.award;
		} else if (curAward === 'dice') {
			minTimes++;
		}
		castResult.push(result);
		if (curAward === 'bonus') {
			const awards: any = { r0: 'g', r1: 'g', r2: 'g', r3: 'g', r4: 'king', r5: 'diamond', r6: 'platinum', r7: 'gold' };
			const weight = [1, 1, 1, 1, 1, 1, 1, 1];
			const weightArray = awards.map((e, i) => {
				return { ['r' + i]: e };
			});
			const select = util.selectEle(weightArray);
			result.select = select;
			result.awardType = awards[select];
			if (awards[select] == 'g') {
				result.award = userLittleGame.initMoney * config.acerType['gold'];
			} else {
				bigWinRoulette = awards[select];
				result.award = jackpotMoney * 0.1;
				jackpotWin += result.award;
			}
			break;
		}
		minTimes--;
	}
	return { castResult, winTotal, bigWinRoulette, jackpotWin };
};

export const cast = (userLittleGame, jackpotMoney) => {

	let bigWinRoulette, jackpotWin = 0;

	const randomPoint = util.random(1, 6);  //随机点数
	userLittleGame.curPosition += randomPoint;  //当前步数
	if (userLittleGame.curPosition > config.littleGame[userLittleGame.pass].length) {
		userLittleGame.curPosition = config.littleGame[userLittleGame.pass].length;
	}
	userLittleGame.historyPosition.push(userLittleGame.curPosition);   //记录历史位置
	const curAward = config.littleGame[userLittleGame.pass][userLittleGame.curPosition - 1];
	const result: any = { point: randomPoint, awardType: curAward, award: [0, 0] };

	if (['gold', 'silver', 'copper'].includes(curAward)) {  //金 银 铜
		result.award.forEach((e, i) => {
			result.award[i] += Math.floor(userLittleGame.initMoneyDis[i] * config.acerType[curAward])
		});
		userLittleGame.gains[curAward]++;
		userLittleGame.totalWin += util.sum(result.award, true);
	} else if (curAward === 'dice') {
		userLittleGame.restDice++;
	} else if (curAward == 'bonus') {
		const awards = { r0: 'g', r1: 'king', r2: 'g', r3: 'diamond', r4: 'g', r5: 'platinum', r6: 'g', r7: 'gold' };
		const weight = [21, 6, 21, 5, 21, 3, 21, 2];
		if (userLittleGame.bonusMoney * 7.5 > jackpotMoney) {
			[1, 3, 5, 7].forEach(p => {
				weight[p] = 0;
			})
		}
		const weightArray = weight.map((e, i) => {
			return { ['r' + i]: e };
		});
		const select = util.selectEle(weightArray);
		result.select = select;
		result.selectType = awards[select];
		if (awards[select] == 'g') {

			result.award.forEach((e, i) => {
				result.award[i] += Math.floor(userLittleGame.initMoneyDis[i] * config.acerType['gold'])
			});

		} else {
			bigWinRoulette = awards[select];

			// 玩家总押注
			const fixedReward = userLittleGame.bonusMoney * 7.5;
			const RATIO = {
				'king': 0.0008,
				'diamond': 0.00008,
				'platinum': 0.00005,
				'gold': 0.00001,
			};

			// (奖池 - 下注金额 * 7.5） * （玩家总押注 / 10) * 宝箱类型的比例（eg: 0.00001）
			const floatReward = (jackpotMoney - fixedReward) * bigOdd(userLittleGame.bonusMoney) * RATIO[bigWinRoulette];

			result.award[1] += Math.floor(fixedReward + floatReward);
			jackpotWin += util.sum(result.award);
		}
	}
	userLittleGame.restDice--;
	return { result, bigWinRoulette, jackpotWin };
};

export const noWinWindow = (pass, bonusNum) => {
	let ele, num;
	if (bonusNum > 0) {
		ele = 'S';
		num = bonusNum;
	}
	let window = generatorWindow(pass, 0);
	let clearEle = windowClear(window.winIds, pass).clearElement;
	let con = util.isVoid(clearEle);
	while (!con) {
		window = generatorWindow(pass, 0);
		clearEle = windowClear(window.winIds, pass).clearElement;
		con = util.isVoid(clearEle);
	}
	while (num > 0) {
		let col = Math.floor(Math.random() * window.winIds.length);
		let row = Math.floor(Math.random() * window.winIds[col].length);
		while (window.winIds[col][row] == ele) {
			col = Math.floor(Math.random() * window.winIds.length);
			row = Math.floor(Math.random() * window.winIds[col].length);
		}
		window.winIds[col][row] = ele;
		num--;
	}
	return window;
}

export const sortResult = (ans) => {
	ans.sort((a, b) => {
		return a.finalResult1.totalWin - b.finalResult1.totalWin;
	});
};


/**
 * 随机结果
 * 规则修改： 返奖率不能超过40 修改时间 2019.8.27
 */
export const randomResult = ({jackpotMoney, pass, totalBet, jackpotAndProfit}):any => {
	// return () => {
		let getWindow1 = generatorWindow(pass);
		let finalResult1 = finalResult({winIds: getWindow1.winIds, jackpotMoney, pass, totalBet,
			only: getWindow1.only, jackpotAndProfit});

		// while (finalResult1.totalWin / totalBet > slotsAwardRateLimit('12')) {
		// 	getWindow1 = generatorWindow(pass);
		// 	finalResult1 = finalResult({winIds: getWindow1.winIds, jackpotMoney, pass, totalBet,
		// 		only: getWindow1.only, jackpotAndProfit});
		// }
		return { getWindow1, finalResult1 };
	// };
};

/**
 * 获取系统必输或者必胜方法
 */
export const getResult = (par, totalBet, isSystemWin) => {
	// return () => {
		let res;
		for (let i = 0; i < 100; i++) {
			res = randomResult(par);
			// 如果系统赢则不获得雷管
			if (isSystemWin && res.finalResult1.totalWin < totalBet &&
				!res.finalResult1.wins[0].find(element => element.find(p => p.type === config.shovel))) {
				break;
			}

			if (!isSystemWin && res.finalResult1.totalWin > totalBet && (res.finalResult1.totalWin / totalBet < 500)) {
				break;
			}
		}

		return res;
	// }
};

/**
 * 返回限制返奖率的结果
 * @param par			开奖所需参数
 * @param bet			下注金额
 * @param rateLimit		限制返奖率
 */
export const getLimitRateResult = (par, rateLimit) => {
	let ret = randomResult(par);

	// 不用while的原因是防止出现死循环, 找到返奖率小于limitOdds的，如果没有则用最后一次
	for (let i = 0; i < 100 && ret.finalResult1.totalWin / par.totalBet > rateLimit; i++) {
		ret = randomResult(par);
	}

	return ret;
};