'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLimitRateResult = exports.getResult = exports.randomResult = exports.sortResult = exports.noWinWindow = exports.cast = exports.cast1 = exports.littlerGameWindow = exports.finalResult = exports.windowAward = exports.completeWindow = exports.windowClear = exports.generatorWindow = exports.bigOdd = exports.selectRoulette = exports.bigDetonatorProbility = exports.pass = exports.isHaveBet = void 0;
const config = require("./config");
const util = require("../../../../utils");
const isHaveBet = (betNum, betOdd) => {
    if (!config.stake.num.includes(betNum)) {
        return '下注数不合法';
    }
    if (!config.stake.odd.includes(betOdd)) {
        return '下注倍数不合法';
    }
    return true;
};
exports.isHaveBet = isHaveBet;
const pass = ({ shovelNum }) => {
    shovelNum = parseInt(shovelNum);
    if (shovelNum < 0) {
        return null;
    }
    return Math.floor(shovelNum / 15) % 3 + 1;
};
exports.pass = pass;
const bigDetonatorProbility = () => {
    return 0.1;
};
exports.bigDetonatorProbility = bigDetonatorProbility;
const selectRoulette = (cur) => {
    if (cur == '1') {
        return Math.random() < 0.0417 ? '2' : '1';
    }
    else if (cur == '2') {
        return Math.random() < 0.0667 ? '3' : '2';
    }
    else if (cur == '3') {
        return Math.random() < 0.0909 ? '1' : '3';
    }
    else {
        return '2';
    }
};
exports.selectRoulette = selectRoulette;
const bigOdd = (betAll) => {
    return betAll / 10;
};
exports.bigOdd = bigOdd;
const keyValueZero = (obj) => {
    for (let i in obj) {
        obj[i] = 0;
    }
};
const randSquare = (n) => {
    if (n < 2) {
        throw new Error(`参数有误 ${n}`);
    }
    const first = [util.random(0, n - 1), util.random(0, n - 1)];
    const others = [first[0] + '' + first[1]];
    (function () {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (Math.pow(i - first[0], 2) + Math.pow(j - first[1], 2) == 2) {
                    others.push(i + '' + j);
                    if (i > first[0]) {
                        others.push(first[0] + '' + j, i + '' + first[1]);
                        return;
                    }
                    else {
                        others.push(i + '' + first[1], first[0] + '' + j);
                        return;
                    }
                }
            }
        }
    })();
    return others;
};
const generatorWindow = (pass, bigDetonatorPro = 1.0 / 20) => {
    let winIds = [], bonusNum = 0, freespinNum = 0, shovelNum = 0, only;
    const bigDetonator = Math.random() < bigDetonatorPro;
    bigDetonator && (only = config.shovel, shovelNum = 4);
    const colDistribute = Object.keys(config.type).map(id => {
        if (config.specialEle.includes(id)) {
            if (bigDetonator) {
                return { [id]: 0 };
            }
            return { [id]: config.type[id].weight[pass] };
        }
        else {
            return { [id]: config.type[id].weight };
        }
    });
    for (let i = 0; i < config.checkPoint[pass]; i++) {
        let colArray = [];
        for (let j = 0; j < config.checkPoint[pass]; j++) {
            let select = util.selectEle(colDistribute);
            if (config.specialEle.includes(select) && only == null) {
                only = select;
            }
            if (!bigDetonator && only != null) {
                config.specialEle.filter(e => e != only).forEach(e => {
                    keyValueZero(colDistribute.find(dis => Object.keys(dis)[0] == e));
                });
            }
            if (select == config.free) {
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
exports.generatorWindow = generatorWindow;
let isEqualSet = (a, b) => {
    return new Set([...a].filter(x => !b.has(x))).size == 0 &&
        new Set([...b].filter(x => !a.has(x))).size == 0;
};
const isAdjoin = ([x1, y1], [x2, y2]) => {
    const leg = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    if (leg == 1) {
        return true;
    }
    return false;
};
const clear = (position, pass) => {
    let mid = {};
    for (let i in position) {
        let remain = util.difference(position, position[i]);
        for (let j in remain) {
            if (isAdjoin(position[i], remain[j])) {
                if (mid[position[i]] == null) {
                    mid[position[i]] = new Set();
                }
                mid[position[i]].add(remain[j].join('-'));
            }
        }
    }
    for (let i in mid) {
        mid[i].forEach((value, key) => {
            mid[value.split('-')].forEach((v, k) => {
                mid[i].add(v);
            });
        });
    }
    const vMid = util.values(mid);
    for (let ii in vMid) {
        let i = Number(ii);
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
const windowClear = (winIds, pass) => {
    let censu = {};
    for (let i in winIds) {
        for (let j in winIds[i]) {
            if (Object.keys(config.type).includes(winIds[i][j])) {
                if (censu[winIds[i][j]] == null) {
                    censu[winIds[i][j]] = [];
                }
                censu[winIds[i][j]].push([Number(i), Number(j)]);
            }
        }
    }
    let temp = censu;
    for (let i in censu) {
        if (i == 'H') {
            console.log(censu['H']);
            temp = { 'H': censu['H'] };
        }
    }
    censu = temp;
    for (let i in censu) {
        if (i == 'S') {
            console.log(censu['S']);
            temp = { 'S': censu['S'] };
        }
    }
    censu = temp;
    const awardResult = {};
    const existF = !!censu[config.free];
    let clearAll = null;
    if (existF) {
        const existODE = Object.keys(censu).filter(t => config.ordinaryEle.includes(t));
        clearAll = existODE[Math.floor(Math.random() * existODE.length)];
    }
    for (let i in censu) {
        const position = censu[i];
        if (config.ordinaryEle.includes(i)) {
            if (i !== clearAll) {
                awardResult[i] = clear(position, pass);
            }
            else {
                awardResult[i] = [position];
            }
        }
        else {
            awardResult[i] = [position];
        }
    }
    const clearElement = util.filter((e) => e.length > 0)(awardResult);
    for (let i in clearElement) {
        if (config.ordinaryEle.includes(i) && i !== clearAll) {
            clearElement[i] = clearElement[i].map(e => {
                return Array.from(e).map((k) => k.split('-'));
            });
        }
    }
    for (let i in clearElement) {
        for (let j in clearElement[i]) {
            clearElement[i][j] = util.sortWith([
                (r1, r2) => r2[1] - r1[1],
                (r1, r2) => r1[0] - r2[0]
            ])(clearElement[i][j]);
        }
        clearElement[i] = util.sortWith([
            (r1, r2) => r2[0][1] - r1[0][1],
            (r1, r2) => r1[0][0] - r2[0][0],
        ])(clearElement[i]);
    }
    return { clearElement, clearAll };
};
exports.windowClear = windowClear;
const completeWindow = (winIds, clearElement, only, clearAll) => {
    const pass = winIds.length == 4 ? '1' : winIds.length == 5 ? '2' : '3';
    const allClear = [], position = [];
    for (let i in clearElement) {
        clearElement[i].forEach(ele => {
            if (i == clearAll) {
                ele.forEach(e => allClear.unshift(e));
            }
            else {
                ele.forEach(e => allClear.push(e));
            }
        });
    }
    allClear.forEach(re => {
        winIds[re[0]][re[1]] = 'del';
        position.push({ x: Number(re[0]), y: Number(re[1]) });
    });
    for (let i in winIds) {
        for (let j = winIds[i].length - 1; j > 0; j--) {
            if (winIds[i][j] == 'del') {
                const index = util.findLastIndex(v => v != 'del')(winIds[i].slice(0, j));
                if (index != -1) {
                    [winIds[i][j], winIds[i][index]] = [winIds[i][index], winIds[i][j]];
                }
            }
        }
    }
    const colDistribute = Object.keys(config.type).map(id => {
        if (config.specialEle.includes(id)) {
            return { key: id, value: 0 };
        }
        else {
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
            }
            else {
                break;
            }
        }
        newly.push(col);
    }
    return { winIds, newly, position };
};
exports.completeWindow = completeWindow;
const windowAward = ({ clearElement, jackpotMoney, jackpotOdd, pass, clearAll, totalBet }) => {
    if (util.isVoid(clearElement)) {
    }
    const result = { windowAward: 0, jackpotMoney: null };
    for (let i in clearElement) {
        if (i == config.shovel) {
            result[i] = { shovelNum: clearElement[i][0].length };
        }
        else if (i == config.bonus) {
            const bonusNum = clearElement[i][0].length;
            const jackpotWin = config.jackpotBigWin[bonusNum];
            const fixedAward = 7.5 * totalBet;
            jackpotMoney -= fixedAward;
            const floatAward = Math.ceil(jackpotMoney * jackpotWin.ratio * jackpotOdd);
            const award = fixedAward + floatAward;
            jackpotMoney -= award;
            result[i] = { bonusNum, award, type: jackpotWin.name };
        }
        else if (config.ordinaryEle.includes(i)) {
            const groupNum = clearElement[i].length;
            result[i] = {};
            const eleAward = config.type[i].clearAward[pass];
            for (let j in clearElement[i]) {
                const len = clearElement[i][j].length;
                let award;
                if (i === clearAll && len < config.checkPoint[pass]) {
                    award = config.type['A'].clearAward[pass][0];
                }
                else if (eleAward[len - 4 + 1 - pass] == undefined) {
                    award = eleAward[eleAward.length - 1];
                }
                else {
                    award = eleAward[len - 4 + 1 - pass];
                }
                result.windowAward += award;
                result[i]['group' + j] = {
                    award,
                };
            }
        }
    }
    result.jackpotMoney = jackpotMoney;
    return result;
};
exports.windowAward = windowAward;
const changeWins = (winArray) => {
    const result = winArray.map(line => {
        return line.map(e => {
            return { type: e };
        });
    });
    return result;
};
const finalResult = ({ winIds, jackpotMoney, pass, totalBet, only, jackpotAndProfit }) => {
    const result = { totalWin: 0, wins: [], awards: [], shovelNum: 0, jackpotWin: [], jackpotTypes: [], clearAll: null };
    result.wins.push(changeWins(winIds));
    let { clearElement, clearAll } = (0, exports.windowClear)(winIds, pass);
    result.clearAll = clearAll;
    const jackpotOdd = (0, exports.bigOdd)(totalBet);
    while (true) {
        if (!util.isVoid(clearElement)) {
            let winAward = (0, exports.windowAward)({ clearElement, jackpotMoney, jackpotOdd, pass, clearAll, totalBet });
            jackpotMoney = winAward.jackpotMoney;
            if (winAward[config.shovel]) {
                result.shovelNum += winAward[config.shovel].shovelNum;
            }
            if (winAward[config.bonus]) {
                result.jackpotWin.push(winAward[config.bonus].award);
                result.jackpotTypes.push(winAward[config.bonus].type);
            }
            result.totalWin += winAward.windowAward;
            result.awards.push(winAward.windowAward * totalBet);
            let newWindow = (0, exports.completeWindow)(util.clone(winIds), clearElement, only, clearAll);
            result.wins.push(newWindow.position);
            result.wins.push(newWindow.newly);
            winIds = newWindow.winIds;
            clearElement = (0, exports.windowClear)(winIds, pass).clearElement;
        }
        else {
            break;
        }
    }
    result.totalWin = result.totalWin * totalBet + result.jackpotWin.reduce((num, v) => num + v, 0);
    return result;
};
exports.finalResult = finalResult;
const littlerGameWindow = (pass) => {
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
exports.littlerGameWindow = littlerGameWindow;
const cast1 = (userLittleGame, jackpotMoney) => {
    let minTimes = 6;
    const castResult = [];
    let winTotal = 0, bigWinRoulette, jackpotWin = 0;
    while (minTimes > 0) {
        const randomPoint = util.random(1, 6);
        userLittleGame.curPosition += randomPoint;
        if (userLittleGame.curPosition > config.littleGame[userLittleGame.pass].length) {
            userLittleGame.curPosition = config.littleGame[userLittleGame.pass].length;
        }
        const curAward = config.littleGame[userLittleGame.pass][userLittleGame.curPosition - 1];
        const result = { point: randomPoint, awardType: curAward };
        if (['gold', 'silver', 'copper'].includes(curAward)) {
            result.award = userLittleGame.initMoney * config.acerType[curAward];
            winTotal += result.award;
        }
        else if (curAward === 'dice') {
            minTimes++;
        }
        castResult.push(result);
        if (curAward === 'bonus') {
            const awards = { r0: 'g', r1: 'g', r2: 'g', r3: 'g', r4: 'king', r5: 'diamond', r6: 'platinum', r7: 'gold' };
            const weight = [1, 1, 1, 1, 1, 1, 1, 1];
            const weightArray = awards.map((e, i) => {
                return { ['r' + i]: e };
            });
            const select = util.selectEle(weightArray);
            result.select = select;
            result.awardType = awards[select];
            if (awards[select] == 'g') {
                result.award = userLittleGame.initMoney * config.acerType['gold'];
            }
            else {
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
exports.cast1 = cast1;
const cast = (userLittleGame, jackpotMoney) => {
    let bigWinRoulette, jackpotWin = 0;
    const randomPoint = util.random(1, 6);
    userLittleGame.curPosition += randomPoint;
    if (userLittleGame.curPosition > config.littleGame[userLittleGame.pass].length) {
        userLittleGame.curPosition = config.littleGame[userLittleGame.pass].length;
    }
    userLittleGame.historyPosition.push(userLittleGame.curPosition);
    const curAward = config.littleGame[userLittleGame.pass][userLittleGame.curPosition - 1];
    const result = { point: randomPoint, awardType: curAward, award: [0, 0] };
    if (['gold', 'silver', 'copper'].includes(curAward)) {
        result.award.forEach((e, i) => {
            result.award[i] += Math.floor(userLittleGame.initMoneyDis[i] * config.acerType[curAward]);
        });
        userLittleGame.gains[curAward]++;
        userLittleGame.totalWin += util.sum(result.award, true);
    }
    else if (curAward === 'dice') {
        userLittleGame.restDice++;
    }
    else if (curAward == 'bonus') {
        const awards = { r0: 'g', r1: 'king', r2: 'g', r3: 'diamond', r4: 'g', r5: 'platinum', r6: 'g', r7: 'gold' };
        const weight = [21, 6, 21, 5, 21, 3, 21, 2];
        if (userLittleGame.bonusMoney * 7.5 > jackpotMoney) {
            [1, 3, 5, 7].forEach(p => {
                weight[p] = 0;
            });
        }
        const weightArray = weight.map((e, i) => {
            return { ['r' + i]: e };
        });
        const select = util.selectEle(weightArray);
        result.select = select;
        result.selectType = awards[select];
        if (awards[select] == 'g') {
            result.award.forEach((e, i) => {
                result.award[i] += Math.floor(userLittleGame.initMoneyDis[i] * config.acerType['gold']);
            });
        }
        else {
            bigWinRoulette = awards[select];
            const fixedReward = userLittleGame.bonusMoney * 7.5;
            const RATIO = {
                'king': 0.0008,
                'diamond': 0.00008,
                'platinum': 0.00005,
                'gold': 0.00001,
            };
            const floatReward = (jackpotMoney - fixedReward) * (0, exports.bigOdd)(userLittleGame.bonusMoney) * RATIO[bigWinRoulette];
            result.award[1] += Math.floor(fixedReward + floatReward);
            jackpotWin += util.sum(result.award);
        }
    }
    userLittleGame.restDice--;
    return { result, bigWinRoulette, jackpotWin };
};
exports.cast = cast;
const noWinWindow = (pass, bonusNum) => {
    let ele, num;
    if (bonusNum > 0) {
        ele = 'S';
        num = bonusNum;
    }
    let window = (0, exports.generatorWindow)(pass, 0);
    let clearEle = (0, exports.windowClear)(window.winIds, pass).clearElement;
    let con = util.isVoid(clearEle);
    while (!con) {
        window = (0, exports.generatorWindow)(pass, 0);
        clearEle = (0, exports.windowClear)(window.winIds, pass).clearElement;
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
};
exports.noWinWindow = noWinWindow;
const sortResult = (ans) => {
    ans.sort((a, b) => {
        return a.finalResult1.totalWin - b.finalResult1.totalWin;
    });
};
exports.sortResult = sortResult;
const randomResult = ({ jackpotMoney, pass, totalBet, jackpotAndProfit }) => {
    let getWindow1 = (0, exports.generatorWindow)(pass);
    let finalResult1 = (0, exports.finalResult)({ winIds: getWindow1.winIds, jackpotMoney, pass, totalBet,
        only: getWindow1.only, jackpotAndProfit });
    return { getWindow1, finalResult1 };
};
exports.randomResult = randomResult;
const getResult = (par, totalBet, isSystemWin) => {
    let res;
    for (let i = 0; i < 100; i++) {
        res = (0, exports.randomResult)(par);
        if (isSystemWin && res.finalResult1.totalWin < totalBet &&
            !res.finalResult1.wins[0].find(element => element.find(p => p.type === config.shovel))) {
            break;
        }
        if (!isSystemWin && res.finalResult1.totalWin > totalBet && (res.finalResult1.totalWin / totalBet < 500)) {
            break;
        }
    }
    return res;
};
exports.getResult = getResult;
const getLimitRateResult = (par, rateLimit) => {
    let ret = (0, exports.randomResult)(par);
    for (let i = 0; i < 100 && ret.finalResult1.totalWin / par.totalBet > rateLimit; i++) {
        ret = (0, exports.randomResult)(par);
    }
    return ret;
};
exports.getLimitRateResult = getLimitRateResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9waGFyYW9oL2xpYi9vbGQvbG9naWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYixtQ0FBb0M7QUFDcEMsMENBQTJDO0FBTXBDLE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBYyxFQUFFLE1BQWMsRUFBRSxFQUFFO0lBQzNELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDdkMsT0FBTyxRQUFRLENBQUM7S0FDaEI7SUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3ZDLE9BQU8sU0FBUyxDQUFDO0tBQ2pCO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDLENBQUM7QUFSVyxRQUFBLFNBQVMsYUFRcEI7QUFLSyxNQUFNLElBQUksR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtJQUNyQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hDLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRTtRQUNsQixPQUFPLElBQUksQ0FBQztLQUNaO0lBQ0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNDLENBQUMsQ0FBQztBQU5XLFFBQUEsSUFBSSxRQU1mO0FBS0ssTUFBTSxxQkFBcUIsR0FBRyxHQUFHLEVBQUU7SUFDekMsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDLENBQUM7QUFGVyxRQUFBLHFCQUFxQix5QkFFaEM7QUFLSyxNQUFNLGNBQWMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBQ3JDLElBQUksR0FBRyxJQUFJLEdBQUcs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R0FBRyxDQUFDLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFO0lBQ25HLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRTtLQUU5QjtJQUNELE1BQU0sTUFBTSxHQUFHLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFHdEQsS0FBSyxJQUFJLENBQUMsSUFBSSxZQUFZLEVBQUU7UUFDM0IsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3JEO2FBQU0sSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtZQUM3QixNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQzNDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEQsTUFBTSxVQUFVLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQztZQUNsQyxZQUFZLElBQUksVUFBVSxDQUFDO1lBQzNCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLENBQUM7WUFDM0UsTUFBTSxLQUFLLEdBQUcsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUN0QyxZQUFZLElBQUksS0FBSyxDQUFDO1lBR3RCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtTQUN0RDthQUFNLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDMUMsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2YsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakQsS0FBSyxJQUFJLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzlCLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBQ3RDLElBQUksS0FBSyxDQUFDO2dCQUNWLElBQUksQ0FBQyxLQUFLLFFBQVEsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDcEQsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM3QztxQkFBTSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxTQUFTLEVBQUU7b0JBQ3JELEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDdEM7cUJBQU07b0JBQ04sS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztpQkFDckM7Z0JBQ0QsTUFBTSxDQUFDLFdBQVcsSUFBSSxLQUFLLENBQUM7Z0JBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUc7b0JBQ3hCLEtBQUs7aUJBQ0wsQ0FBQTthQUNEO1NBQ0Q7S0FDRDtJQUNELE1BQU0sQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQ25DLE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBNUNXLFFBQUEsV0FBVyxlQTRDdEI7QUFHRixNQUFNLFVBQVUsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO0lBQy9CLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDbEMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ25CLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUE7UUFDbkIsQ0FBQyxDQUFDLENBQUE7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBS0ssTUFBTSxXQUFXLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFO0lBQy9GLE1BQU0sTUFBTSxHQUFHLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO0lBRXJILE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRXJDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBQSxtQkFBVyxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRCxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMzQixNQUFNLFVBQVUsR0FBRyxJQUFBLGNBQU0sRUFBQyxRQUFRLENBQUMsQ0FBQztJQUVwQyxPQUFPLElBQUksRUFBRTtRQUVaLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBRS9CLElBQUksUUFBUSxHQUFHLElBQUEsbUJBQVcsRUFBQyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNqRyxZQUFZLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztZQUVyQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzVCLE1BQU0sQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUM7YUFDdEQ7WUFDRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzNCLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3JELE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdEQ7WUFDRCxNQUFNLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsQ0FBQztZQUdwRCxJQUFJLFNBQVMsR0FBRyxJQUFBLHNCQUFjLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2pGLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFbEMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFDMUIsWUFBWSxHQUFHLElBQUEsbUJBQVcsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDO1NBQ3REO2FBQU07WUFDTixNQUFNO1NBQ047S0FDRDtJQUNELE1BQU0sQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWhHLE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBeENXLFFBQUEsV0FBVyxlQXdDdEI7QUFLSyxNQUFNLGlCQUFpQixHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUU7SUFDekMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDO0lBRTVDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsQjtRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDcEI7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUMsQ0FBQztBQVpXLFFBQUEsaUJBQWlCLHFCQVk1QjtBQUtLLE1BQU0sS0FBSyxHQUFHLENBQUMsY0FBYyxFQUFFLFlBQVksRUFBRSxFQUFFO0lBQ3JELElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztJQUNqQixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDdEIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLGNBQWMsRUFBRSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ2pELE9BQU8sUUFBUSxHQUFHLENBQUMsRUFBRTtRQUNwQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0QyxjQUFjLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQztRQUMxQyxJQUFJLGNBQWMsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQy9FLGNBQWMsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO1NBQzNFO1FBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4RixNQUFNLE1BQU0sR0FBUSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDO1FBQ2hFLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNwRCxNQUFNLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwRSxRQUFRLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztTQUN6QjthQUFNLElBQUksUUFBUSxLQUFLLE1BQU0sRUFBRTtZQUMvQixRQUFRLEVBQUUsQ0FBQztTQUNYO1FBQ0QsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QixJQUFJLFFBQVEsS0FBSyxPQUFPLEVBQUU7WUFDekIsTUFBTSxNQUFNLEdBQVEsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNsSCxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4QyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN2QyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbEU7aUJBQU07Z0JBQ04sY0FBYyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEMsTUFBTSxDQUFDLEtBQUssR0FBRyxZQUFZLEdBQUcsR0FBRyxDQUFDO2dCQUNsQyxVQUFVLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQzthQUMzQjtZQUNELE1BQU07U0FDTjtRQUNELFFBQVEsRUFBRSxDQUFDO0tBQ1g7SUFDRCxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDN0QsQ0FBQyxDQUFDO0FBeENXLFFBQUEsS0FBSyxTQXdDaEI7QUFFSyxNQUFNLElBQUksR0FBRyxDQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsRUFBRTtJQUVwRCxJQUFJLGNBQWMsRUFBRSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBRW5DLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3RDLGNBQWMsQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDO0lBQzFDLElBQUksY0FBYyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDL0UsY0FBYyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7S0FDM0U7SUFDRCxjQUFjLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDaEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN4RixNQUFNLE1BQU0sR0FBUSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUUvRSxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDcEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO1FBQzFGLENBQUMsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQ2pDLGNBQWMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3hEO1NBQU0sSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFO1FBQy9CLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUMxQjtTQUFNLElBQUksUUFBUSxJQUFJLE9BQU8sRUFBRTtRQUMvQixNQUFNLE1BQU0sR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQzdHLE1BQU0sTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVDLElBQUksY0FBYyxDQUFDLFVBQVUsR0FBRyxHQUFHLEdBQUcsWUFBWSxFQUFFO1lBQ25ELENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN4QixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUE7U0FDRjtRQUNELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdkMsT0FBTyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMzQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUU7WUFFMUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUN4RixDQUFDLENBQUMsQ0FBQztTQUVIO2FBQU07WUFDTixjQUFjLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBR2hDLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO1lBQ3BELE1BQU0sS0FBSyxHQUFHO2dCQUNiLE1BQU0sRUFBRSxNQUFNO2dCQUNkLFNBQVMsRUFBRSxPQUFPO2dCQUNsQixVQUFVLEVBQUUsT0FBTztnQkFDbkIsTUFBTSxFQUFFLE9BQU87YUFDZixDQUFDO1lBR0YsTUFBTSxXQUFXLEdBQUcsQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDLEdBQUcsSUFBQSxjQUFNLEVBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUU3RyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxDQUFDO1lBQ3pELFVBQVUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyQztLQUNEO0lBQ0QsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzFCLE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQy9DLENBQUMsQ0FBQztBQTlEVyxRQUFBLElBQUksUUE4RGY7QUFFSyxNQUFNLFdBQVcsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRTtJQUM3QyxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDYixJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7UUFDakIsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNWLEdBQUcsR0FBRyxRQUFRLENBQUM7S0FDZjtJQUNELElBQUksTUFBTSxHQUFHLElBQUEsdUJBQWUsRUFBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdEMsSUFBSSxRQUFRLEdBQUcsSUFBQSxtQkFBVyxFQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDO0lBQzdELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEMsT0FBTyxDQUFDLEdBQUcsRUFBRTtRQUNaLE1BQU0sR0FBRyxJQUFBLHVCQUFlLEVBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLFFBQVEsR0FBRyxJQUFBLG1CQUFXLEVBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFDekQsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDNUI7SUFDRCxPQUFPLEdBQUcsR0FBRyxDQUFDLEVBQUU7UUFDZixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEUsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRTtZQUN0QyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2RCxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM1RDtRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQzlCLEdBQUcsRUFBRSxDQUFDO0tBQ047SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUMsQ0FBQTtBQXpCWSxRQUFBLFdBQVcsZUF5QnZCO0FBRU0sTUFBTSxVQUFVLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUNqQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2pCLE9BQU8sQ0FBQyxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7SUFDMUQsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUM7QUFKVyxRQUFBLFVBQVUsY0FJckI7QUFPSyxNQUFNLFlBQVksR0FBRyxDQUFDLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUMsRUFBTSxFQUFFO0lBRW5GLElBQUksVUFBVSxHQUFHLElBQUEsdUJBQWUsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxJQUFJLFlBQVksR0FBRyxJQUFBLG1CQUFXLEVBQUMsRUFBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFFBQVE7UUFDdEYsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDO0lBTzNDLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLENBQUM7QUFFdEMsQ0FBQyxDQUFDO0FBYlcsUUFBQSxZQUFZLGdCQWF2QjtBQUtLLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsRUFBRTtJQUV0RCxJQUFJLEdBQUcsQ0FBQztJQUNSLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDN0IsR0FBRyxHQUFHLElBQUEsb0JBQVksRUFBQyxHQUFHLENBQUMsQ0FBQztRQUV4QixJQUFJLFdBQVcsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxRQUFRO1lBQ3RELENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7WUFDeEYsTUFBTTtTQUNOO1FBRUQsSUFBSSxDQUFDLFdBQVcsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDekcsTUFBTTtTQUNOO0tBQ0Q7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUViLENBQUMsQ0FBQztBQWxCVyxRQUFBLFNBQVMsYUFrQnBCO0FBUUssTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsRUFBRTtJQUNwRCxJQUFJLEdBQUcsR0FBRyxJQUFBLG9CQUFZLEVBQUMsR0FBRyxDQUFDLENBQUM7SUFHNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNyRixHQUFHLEdBQUcsSUFBQSxvQkFBWSxFQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3hCO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDLENBQUM7QUFUVyxRQUFBLGtCQUFrQixzQkFTN0IifQ==