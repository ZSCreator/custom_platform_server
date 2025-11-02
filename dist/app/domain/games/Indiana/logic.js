'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortResult = exports.noWinWindow = exports.click = exports.littlerGameResult = exports.littlerGameWindow = exports.finalResult = exports.windowAward = exports.completeWindow = exports.windowClear = exports.generatorWindow = exports.selectRoulette = exports.bigOdd = exports.pass = exports.isHaveBet = void 0;
const config = require('./config');
const util = require('../../../utils');
const memory = require('./memory');
function isHaveBet(betNum, betOdd) {
    if (config.stake.num.includes(betNum)) {
        return '下注数不合法';
    }
    if (config.stake.odd.includes(betOdd)) {
        return '下注倍数不合法';
    }
    return true;
}
exports.isHaveBet = isHaveBet;
;
function pass({ shovelNum }) {
    shovelNum = parseInt(shovelNum);
    if (shovelNum < 0) {
        return null;
    }
    return (shovelNum / 15) % 3 + 1;
}
exports.pass = pass;
function bigOdd(betAll) {
    return betAll / 10;
}
exports.bigOdd = bigOdd;
;
function selectRoulette(cur) {
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
}
exports.selectRoulette = selectRoulette;
;
const getDifEle = (select, selectArray, opt) => {
    let selectNew = util.selectElement(selectArray);
    while (select === selectNew || opt[selectNew] === false) {
        selectNew = util.selectElement(selectArray);
    }
    return selectNew;
};
function generatorWindow(pass, isFreespin = false) {
    let winIds = [], freespinNum = 0, bonusNum = 0, shovelNum = 0, only;
    const colDistribute = Object.keys(config.type).map(id => {
        if (isFreespin && config.specialEle.includes(id)) {
            return { key: id, value: 0 };
        }
        else {
            if (config.specialEle.includes(id)) {
                return { key: id, value: config.type[id].weight[pass] };
            }
            else {
                return { key: id, value: config.type[id].weight };
            }
        }
    });
    for (let i = 0; i < config.checkPoint[pass]; i++) {
        let colArray = [];
        for (let j = 0; j < config.checkPoint[pass]; j++) {
            let select = util.selectElement(colDistribute);
            if (config.specialEle.includes(select) && only == null && !isFreespin) {
                only = select;
            }
            if (only != null) {
                config.specialEle.filter(e => e != only).forEach(e => {
                    colDistribute.find(dis => dis.key == e).value = 0;
                });
            }
            if (select == config.free) {
                if (freespinNum < config.type[select].max) {
                    freespinNum++;
                    if (freespinNum >= config.type[select].max) {
                        const index = colDistribute.findIndex(e => e.key == select);
                        colDistribute[index] = { key: select, value: 0 };
                    }
                }
            }
            if (select == config.bonus) {
                if (bonusNum < config.type[select].max) {
                    bonusNum++;
                    if (bonusNum >= config.type[select].max) {
                        const index = colDistribute.findIndex(e => e.key == select);
                        colDistribute[index] = { key: select, value: 0 };
                    }
                }
            }
            if (select == config.shovel) {
                if (shovelNum < config.type[select].max) {
                    shovelNum++;
                    if (shovelNum >= config.type[select].max) {
                        const index = colDistribute.findIndex(e => e.key == select);
                        colDistribute[index] = { key: select, value: 0 };
                    }
                }
            }
            colArray.push(select);
        }
        winIds.push(colArray);
    }
    return { winIds, only };
}
exports.generatorWindow = generatorWindow;
;
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
function windowClear(winIds, pass) {
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
    for (let i in censu) {
        if (i == 'F') {
            console.log(censu['F']);
            temp = { 'F': censu['F'] };
        }
    }
    censu = temp;
    const awardResult = {};
    for (let i in censu) {
        const position = censu[i];
        if (config.ordinaryEle.includes(i)) {
            awardResult[i] = clear(position, pass);
        }
        else {
            awardResult[i] = [position];
        }
    }
    const clearElement = util.filter(e => e.length > 0)(awardResult);
    for (let i in clearElement) {
        if (config.ordinaryEle.includes(i)) {
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
    return clearElement;
}
exports.windowClear = windowClear;
;
function completeWindow(winIds, clearElement, isFreespin, only) {
    const pass = winIds.length == 4 ? '1' : winIds.length == 5 ? '2' : '3';
    const allClear = [], position = [];
    for (let i in clearElement) {
        clearElement[i].forEach(ele => {
            ele.forEach(e => allClear.push(e));
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
    let bonusNum = 0, freespinNum = 0;
    for (let i in winIds) {
        const col = [];
        for (let j in winIds) {
            if (winIds[i][j] == 'del') {
                let select = util.selectElement(colDistribute);
                if (only == null && config.specialEle.includes(select) && !isFreespin) {
                    only = select;
                    config.specialEle.filter(e => e != only).forEach(e => {
                        colDistribute.find(dis => dis.key == e).value = 0;
                    });
                }
                if (select == config.free) {
                    if (freespinNum < config.type[select].max) {
                        freespinNum++;
                        if (freespinNum >= config.type[select].max) {
                            const index = colDistribute.findIndex(e => e.key == select);
                            colDistribute[index] = { key: select, value: 0 };
                        }
                    }
                }
                if (select == config.bonus) {
                    if (bonusNum < config.type[select].max) {
                        bonusNum++;
                        if (bonusNum >= config.type[select].max) {
                            const index = colDistribute.findIndex(e => e.key == select);
                            colDistribute[index] = { key: select, value: 0 };
                        }
                    }
                }
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
}
exports.completeWindow = completeWindow;
;
const dealFreeSpin = ({ freespinNum, freespinOdd, pass }) => {
    let freeSpinRemain = freespinNum, freeAward = 0;
    const freespinWindow = {}, freespins = [], freeAwards = [];
    let freeNum = 1;
    while (freeSpinRemain > 0) {
        const winIds = generatorWindow(pass, true).winIds;
        const clearEle = windowClear(winIds, pass);
        const oneSpin = [changeWins(winIds)];
        const oneSpinAward = [];
        if (util.isVoid(clearEle)) {
            freespinWindow[freeNum] = [{ winIds: changeWins(winIds), clearEle, award: 0 }];
            freespins.push(oneSpin);
            freeAwards.push(oneSpinAward);
            freeSpinRemain--;
            freeNum++;
            continue;
        }
        else {
            let oneFreeAward = 0;
            const freeWindowAward = (windowAward({ clearElement: clearEle, pass }).windowAward) * freespinOdd;
            freeAward += freeWindowAward;
            oneFreeAward += freeWindowAward;
            let newWindow = completeWindow(util.clone(winIds), clearEle, true);
            oneSpin.push(newWindow.position);
            oneSpin.push(newWindow.newly);
            oneSpinAward.push(freeWindowAward);
            freespinWindow[freeNum] = [{ winIds: changeWins(winIds), clearEle, award: oneFreeAward, clear: newWindow }];
            let newClearEle = windowClear(newWindow.winIds, pass);
            const clears = [];
            while (true) {
                if (util.isVoid(newClearEle)) {
                    clears.push({
                        winIds: changeWins(newWindow.winIds),
                        clearEle: newClearEle,
                        award: 0,
                    });
                    break;
                }
                else {
                    const newFreeWindowAward = (windowAward({ clearElement: newClearEle, pass }).windowAward) * freespinOdd;
                    freeAward += newFreeWindowAward;
                    oneFreeAward += newFreeWindowAward;
                    clears.push({
                        winIds: changeWins(newWindow.winIds),
                        clearEle: newClearEle,
                        award: newFreeWindowAward,
                        clear: newWindow,
                    });
                    newWindow = completeWindow(util.clone(newWindow.winIds), newClearEle, true);
                    oneSpin.push(newWindow.position);
                    oneSpin.push(newWindow.newly);
                    oneSpinAward.push(newFreeWindowAward);
                    newClearEle = windowClear(newWindow.winIds, pass);
                }
            }
            freespinWindow[freeNum] = freespinWindow[freeNum].concat(clears);
            freespins.push(oneSpin);
            freeAwards.push(oneSpinAward);
            freeSpinRemain--;
            freeNum++;
        }
    }
    return { freespinWindow, freeAward, freespins, freeAwards };
};
function windowAward({ clearElement, jackpotMoney = 0, jackpotOdd = 0, pass, totalBet = 0 }) {
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
        else if (i == config.free) {
            const freeNum = clearElement[i][0].length;
            const [freespinNum, freespinOdd] = config.freespin[freeNum];
            const freespinResult = dealFreeSpin({ freespinNum, freespinOdd, pass });
            result[i] = freespinResult;
        }
        else if (config.ordinaryEle.includes(i)) {
            const groupNum = clearElement[i].length;
            result[i] = {};
            const eleAward = config.type[i].clearAward[pass];
            for (let j in clearElement[i]) {
                const len = clearElement[i][j].length;
                let award;
                if (eleAward[len - 4 + 1 - pass] == undefined) {
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
}
exports.windowAward = windowAward;
;
const changeWins = (winArray) => {
    const result = winArray.map(line => {
        return line.map(e => {
            return { type: e };
        });
    });
    return result;
};
function finalResult({ winIds, jackpotMoney, pass, totalBet, only }) {
    const result = { totalWin: 0, wins: [], freespins: [], awards: [], freeAwards: [], shovelNum: 0, jackpotWin: [], jackpotTypes: [] };
    result.wins.push(changeWins(winIds));
    let clearEle = windowClear(winIds, pass);
    const jackpotOdd = bigOdd(totalBet);
    while (true) {
        if (!util.isVoid(clearEle)) {
            let winAward = windowAward({ clearElement: clearEle, jackpotMoney, jackpotOdd, pass, totalBet });
            jackpotMoney = winAward.jackpotMoney;
            if (winAward[config.shovel]) {
                result.shovelNum += winAward[config.shovel].shovelNum;
            }
            if (winAward[config.bonus]) {
                result.jackpotWin.push(winAward[config.bonus].award);
                result.jackpotTypes.push(winAward[config.bonus].type);
            }
            if (winAward[config.free]) {
                result.freespins = result.freespins.concat(winAward[config.free].freespins);
                const freeAwards = winAward[config.free].freeAwards.map(awards => awards.map(e => e * totalBet / 10));
                result.freeAwards = result.freeAwards.concat(freeAwards);
                result.totalWin += winAward[config.free].freeAwards.reduce((num, award) => {
                    return num + award.reduce((v, s) => v + s, 0);
                }, 0);
            }
            result.totalWin += winAward.windowAward;
            result.awards.push(winAward.windowAward * totalBet / 10);
            let newWindow = completeWindow(util.clone(winIds), clearEle, false, only);
            result.wins.push(newWindow.position);
            result.wins.push(newWindow.newly);
            winIds = newWindow.winIds;
            clearEle = windowClear(winIds, pass);
        }
        else {
            break;
        }
    }
    result.totalWin = result.totalWin * totalBet / 10 + result.jackpotWin.reduce((num, v) => num + v, 0);
    return result;
}
exports.finalResult = finalResult;
;
function littlerGameWindow(pass) {
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
}
exports.littlerGameWindow = littlerGameWindow;
;
function littlerGameResult(pass) {
    const distribute = config.littleGame[pass].acer;
    const select = util.selectElement(distribute);
    const result = util.clone(config.acer[pass][select]);
    delete result.weight;
    return result;
}
exports.littlerGameResult = littlerGameResult;
;
function click(position, userLittleGame) {
    const [x, y] = position;
    const remain = userLittleGame.result;
    const window = userLittleGame.window;
    const initMoney = userLittleGame.initMoney;
    let result = {};
    if (Object.keys(remain).length > 1) {
        const remainDistribute = Object.keys(remain).map(acer => {
            return { key: acer, value: remain[acer] };
        });
        const select = util.selectElement(remainDistribute);
        remain[select]--;
        if (remain[select] == 0) {
            delete remain[select];
        }
        result.open = select;
    }
    else if (Object.keys(remain).length == 1) {
        const select = Object.keys(remain)[0];
        remain[select]--;
        if (remain[select] == 0) {
            delete remain[select];
        }
        result.open = select;
    }
    else if (Object.keys(remain).length == 0) {
        result.open = 'boom';
    }
    result.award = (config.acerType[result.open] * util.sum(initMoney));
    window[x][y] = result.open;
    if (result.open == 'boom') {
        const supply = userLittleGame.supply;
        supply[result.open]--;
        for (let i in window) {
            for (let j in window[i]) {
                if (window[i][j] == null) {
                    const distribute = Object.keys(supply).map(e => {
                        return { key: e, value: supply[e] };
                    });
                    const selectAdd = util.selectElement(distribute);
                    supply[selectAdd]--;
                    window[i][j] = selectAdd;
                    if (supply[selectAdd] == 0) {
                        delete supply[selectAdd];
                    }
                }
            }
        }
        result.window = window;
        return result;
    }
    else {
        return result;
    }
}
exports.click = click;
;
function noWinWindow(pass, bonusNum, freeNum) {
    let ele, num;
    if (bonusNum > 0) {
        ele = 'S';
        num = bonusNum;
    }
    else if (freeNum > 0) {
        ele = 'F';
        num = freeNum;
    }
    let window = generatorWindow(pass, true);
    let clearEle = windowClear(window.winIds, pass);
    let con = util.isVoid(clearEle);
    while (!con) {
        window = generatorWindow(pass, true);
        clearEle = windowClear(window.winIds, pass);
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
exports.noWinWindow = noWinWindow;
function sortResult(ans) {
    ans.sort((a, b) => {
        return a.finalResult_1.totalWin - b.finalResult_1.totalWin;
    });
}
exports.sortResult = sortResult;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvZG9tYWluL2dhbWVzL0luZGlhbmEvbG9naWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDdkMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBS25DLFNBQWdCLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTTtJQUN2QyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUN0QyxPQUFPLFFBQVEsQ0FBQztLQUNoQjtJQUNELElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3RDLE9BQU8sU0FBUyxDQUFDO0tBQ2pCO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBUkQsOEJBUUM7QUFBQSxDQUFDO0FBS0YsU0FBZ0IsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFO0lBQ2pDLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDaEMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFO1FBQ2xCLE9BQU8sSUFBSSxDQUFDO0tBQ1o7SUFDRCxPQUFPLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQU5ELG9CQU1DO0FBS0QsU0FBZ0IsTUFBTSxDQUFDLE1BQU07SUFDNUIsT0FBTyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLENBQUM7QUFGRCx3QkFFQztBQUFBLENBQUM7QUFLRixTQUFnQixjQUFjLENBQUMsR0FBRztJQUNqQyxJ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QUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQTtBQUNsRCxDQUFDLENBQUM7QUFLRixNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDdkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkUsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFO1FBQ2IsT0FBTyxJQUFJLENBQUM7S0FDWjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQyxDQUFBO0FBSUQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDaEMsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsS0FBSyxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUU7UUFDdkIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsS0FBSyxJQUFJLENBQUMsSUFBSSxNQUFNLEVBQUU7WUFDckIsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNyQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUU7b0JBQzdCLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJ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LFdBQVcsQ0FBQyxFQUFFLFlBQVksRUFBRSxZQUFZLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsR0FBRyxDQUFDLEVBQUU7SUFDakcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFO0tBRTlCO0lBQ0QsTUFBTSxNQUFNLEdBQUcsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUd0RCxLQUFLLElBQUksQ0FBQyxJQUFJLFlBQVksRUFBRTtRQUMzQixJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ3ZCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDckQ7YUFBTSxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQzdCLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDM0MsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRCxNQUFNLFVBQVUsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDO1lBQ2xDLFlBQVksSUFBSSxVQUFVLENBQUM7WUFDM0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsQ0FBQztZQUMzRSxNQUFNLEtBQUssR0FBRyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQ3RDLFlBQVksSUFBSSxLQUFLLENBQUM7WUFHdEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFBO1NBQ3REO2FBQU0sSUFBSSxDQUFD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