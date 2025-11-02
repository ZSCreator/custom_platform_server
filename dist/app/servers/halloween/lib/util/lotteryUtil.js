"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTurntableLotteryResult = exports.genOrchardGameWindow = exports.getDiceLotteryResult = exports.getClayPotLotteryResult = exports.personalInternalControl = exports.crateSlotLottery = exports.Lottery = exports.isHaveLine = void 0;
const constant_1 = require("../constant");
const utils_1 = require("../../../../utils");
const elemenets_1 = require("../config/elemenets");
const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= constant_1.default.winLines.length;
exports.isHaveLine = isHaveLine;
class Lottery {
    constructor(newer, roulette) {
        this.totalBet = 0;
        this.totalWin = 0;
        this.window = [];
        this.winLines = [];
        this.winRows = [];
        this.totalMultiple = 0;
        this.bonusCount = 0;
        this.controlState = 1;
        this.subGame = { type: null, count: 0 };
        this.newer = newer;
        this.roulette = roulette;
    }
    init() {
        this.totalWin = 0;
        this.window = [];
        this.winLines = [];
        this.winRows = [];
        this.totalMultiple = 0;
        this.bonusCount = 0;
        this.subGame = { type: null, count: 0 };
    }
    setBet(bet) {
        this.bet = bet;
        return this;
    }
    setTotalBet(totalBet) {
        this.totalBet = totalBet;
        return this;
    }
    setInternalControl(overallControl, singleControlOne, singleControlTwo) {
        this.overallControl = overallControl;
        this.singleControlOne = singleControlOne;
        this.singleControlTwo = singleControlTwo;
        return this;
    }
    setSystemWinOrLoss(win) {
        this.controlState = win ? 2 : 3;
        return this;
    }
    result() {
        this.selectWights();
        if (this.controlState === 1) {
            this.randomLottery();
        }
        else {
            this.controlLottery();
        }
        return {
            window: this.window,
            winRows: this.winRows,
            winLines: this.winLines,
            totalWin: this.totalWin,
            multiple: this.totalMultiple,
            subGame: this.subGame,
        };
    }
    randomLottery() {
        this.init();
        this.window = this.generateWindow();
        const result = this.calculateEarnings(this.window);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;
        this.winRows = result.winRows;
    }
    controlLottery() {
        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            if (this.controlState === 2 && this.totalWin <= this.totalBet) {
                break;
            }
            if (this.controlState === 3 && this.totalWin > this.totalBet) {
                break;
            }
        }
    }
    selectWights() {
        const roulette = this.roulette;
        if (this.newer) {
            this.weights = (0, utils_1.clone)(constant_1.default.weights['1']);
        }
        else {
            this.weights = (0, utils_1.clone)(constant_1.default.weights[roulette]);
        }
    }
    generateWindow() {
        const window = [];
        const elementKeys = Object.keys(this.weights);
        for (let i = 0; i < constant_1.default.column; i++) {
            const elementSet = elementKeys.map(element => {
                return { key: element, value: this.weights[element][i] };
            });
            const line = [];
            for (let j = 0; j < constant_1.default.row; j++) {
                line.push((0, utils_1.selectElement)(elementSet));
            }
            window.push(line);
        }
        let elementSet = new Set();
        const selectLines = constant_1.default.winLines.slice();
        selectLines.forEach((line, index) => {
            const elementLine = line.map((l, i) => window[i][l - 1]);
            const transcript = (0, utils_1.clone)(elementLine);
            const lineResult = this.calculateLineResult(transcript);
            if (lineResult.elementType) {
                if (lineResult.elementType === elemenets_1.ElementsEnum.ClayPot) {
                    elementSet.add(elemenets_1.ElementsEnum.ClayPot);
                }
                else if (lineResult.elementType === elemenets_1.ElementsEnum.Witch && lineResult.linkNum !== 5) {
                    elementSet.add(elemenets_1.ElementsEnum.Witch);
                }
            }
        });
        window.forEach((row) => {
            const _row = (0, utils_1.clone)(row);
            const rowResult = this.calculateRowResult(_row);
            if (rowResult.elementType !== null) {
                elementSet.add(rowResult.elementType);
            }
        });
        if (elementSet.size > 1) {
            return this.generateWindow();
        }
        if (this.controlState !== 1 && !!constant_1.default.littleGameElements.find(e => elementSet.has(e))) {
            return this.generateWindow();
        }
        return window;
    }
    calculateEarnings(window) {
        let winLines = [], winRows = [], totalWin = 0;
        totalWin += this.calculateLines(window, winLines);
        totalWin += this.calculateRows(window, winRows);
        if (this.bonusCount > 0) {
            totalWin *= this.bonusCount;
        }
        return { winLines, totalWin, winRows };
    }
    calculateRows(window, winRows) {
        let totalWin = 0, wizardCount = 0, witchCount = 0, clayPotCount = 0, vampireCount = 0;
        window.forEach((row, index) => {
            const _row = (0, utils_1.clone)(row);
            const rowResult = this.calculateRowResult(_row);
            switch (rowResult.elementType) {
                case elemenets_1.ElementsEnum.Pumpkin:
                case elemenets_1.ElementsEnum.Demon:
                case elemenets_1.ElementsEnum.Magician:
                case elemenets_1.ElementsEnum.Scarecrow:
                case elemenets_1.ElementsEnum.Zombie:
                case elemenets_1.ElementsEnum.Ghost: {
                    let odds = constant_1.default.awardRow[rowResult.elementType];
                    const rowProfit = this.bet * odds;
                    totalWin += rowProfit;
                    this.totalMultiple += odds;
                    winRows.push({
                        index,
                        linkIds: row.slice(),
                        money: rowProfit,
                        type: rowResult.elementType,
                        multiple: odds
                    });
                    break;
                }
                case elemenets_1.ElementsEnum.Wizard:
                    wizardCount++;
                    this.bonusCount++;
                    if (wizardCount > this.subGame.count) {
                        this.subGame.count = wizardCount;
                        this.subGame.type = elemenets_1.ElementsEnum.Wizard;
                    }
                    winRows.push({
                        index,
                        linkIds: row.slice(),
                        money: 0,
                        type: rowResult.elementType,
                        multiple: 0
                    });
                    break;
                case elemenets_1.ElementsEnum.Witch:
                    witchCount++;
                    this.bonusCount++;
                    if (witchCount > this.subGame.count) {
                        this.subGame.count = witchCount;
                        this.subGame.type = elemenets_1.ElementsEnum.Witch;
                    }
                    winRows.push({
                        index,
                        linkIds: row.slice(),
                        money: 0,
                        type: rowResult.elementType,
                        multiple: 0
                    });
                    break;
                case elemenets_1.ElementsEnum.ClayPot:
                    clayPotCount++;
                    this.bonusCount++;
                    if (clayPotCount > this.subGame.count) {
                        this.subGame.count = clayPotCount;
                        this.subGame.type = elemenets_1.ElementsEnum.ClayPot;
                    }
                    winRows.push({
                        index,
                        linkIds: row.slice(),
                        money: 0,
                        type: rowResult.elementType,
                        multiple: 0
                    });
                    break;
                case elemenets_1.ElementsEnum.Vampire:
                    vampireCount++;
                    this.bonusCount++;
                    if (vampireCount > this.subGame.count) {
                        this.subGame.count = vampireCount;
                        this.subGame.type = elemenets_1.ElementsEnum.Vampire;
                    }
                    winRows.push({
                        index,
                        linkIds: row.slice(),
                        money: 0,
                        type: rowResult.elementType,
                        multiple: 0
                    });
                    break;
                case null:
                default:
                    break;
            }
        });
        return totalWin;
    }
    calculateRowResult(elementLine) {
        const result = { elementType: null };
        if (elementLine.every(v => v === elementLine[0])) {
            result.elementType = elementLine[0];
        }
        return result;
    }
    calculateLines(window, winLines) {
        const selectLines = constant_1.default.winLines.slice();
        let totalWin = 0;
        selectLines.forEach((line, index) => {
            const elementLine = line.map((l, i) => window[i][l - 1]);
            const transcript = (0, utils_1.clone)(elementLine);
            const lineResult = this.calculateLineResult(transcript);
            let clayPotCount = 0, witchCount = 0;
            if (lineResult.elementType) {
                let odds = constant_1.default.award[lineResult.elementType][lineResult.rewardType];
                let lineProfit = 0;
                if (lineResult.elementType === elemenets_1.ElementsEnum.ClayPot) {
                    clayPotCount++;
                    this.bonusCount += odds;
                    if (clayPotCount > this.subGame.count) {
                        this.subGame.count = clayPotCount;
                        this.subGame.type = elemenets_1.ElementsEnum.ClayPot;
                    }
                }
                else if (lineResult.elementType === elemenets_1.ElementsEnum.Witch && lineResult.linkNum !== 5) {
                    witchCount++;
                    this.bonusCount += odds;
                    if (witchCount > this.subGame.count) {
                        this.subGame.count = witchCount;
                        this.subGame.type = elemenets_1.ElementsEnum.Witch;
                    }
                }
                else {
                    lineProfit = this.bet * odds;
                    totalWin += lineProfit;
                    this.totalMultiple += odds;
                }
                winLines.push({
                    index,
                    linkNum: lineResult.linkNum,
                    linkIds: lineResult.linkIds,
                    money: lineProfit,
                    type: lineResult.elementType,
                    multiple: odds
                });
            }
        });
        return totalWin;
    }
    calculateLineResult(elementLine) {
        const elementResult = getMoreThanThreeElement(elementLine);
        let result = {
            elementType: null,
            rewardType: 0,
            linkNum: 0,
            linkIds: [true, true, true, true, true]
        };
        if (!elementResult) {
            return result;
        }
        switch (elementResult.element) {
            case elemenets_1.ElementsEnum.Ghost:
                this.calculateGhostLine(elementLine, elementResult, result);
                break;
            case elemenets_1.ElementsEnum.Zombie:
                this.calculateZombieLine(elementLine, elementResult, result);
                break;
            case elemenets_1.ElementsEnum.Vampire:
                this.calculateVampireLine(elementLine, elementResult, result);
                break;
            case elemenets_1.ElementsEnum.Wizard:
                this.calculateWizardLine(elementLine, elementResult, result);
                break;
            case elemenets_1.ElementsEnum.Scarecrow:
                this.calculateScarecrowLine(elementLine, elementResult, result);
                break;
            case elemenets_1.ElementsEnum.ClayPot:
                this.calculateClayPotLine(elementLine, elementResult, result);
                break;
            case elemenets_1.ElementsEnum.Witch:
                this.calculateWitchLine(elementLine, elementResult, result);
                break;
            case elemenets_1.ElementsEnum.Magician:
                this.calculateMagicianLine(elementLine, elementResult, result);
                break;
            case elemenets_1.ElementsEnum.Demon:
                this.calculateDemonLine(elementLine, elementResult, result);
                break;
            case elemenets_1.ElementsEnum.Pumpkin:
                this.calculatePumpkinLine(elementLine, elementResult, result);
                break;
            default:
                break;
        }
        return result;
    }
    calculateGhostLine(elementLine, elementResult, result) {
        if (elementResult.count < 4) {
            return;
        }
        if (elementResult.count === 5) {
            result.elementType = elemenets_1.ElementsEnum.Ghost;
            result.rewardType = 1;
            result.linkNum = 5;
        }
        else if (elementResult.count === 4 && elementLine[4] !== elemenets_1.ElementsEnum.Ghost) {
            result.elementType = elemenets_1.ElementsEnum.Ghost;
            result.rewardType = 0;
            result.linkNum = 4;
            result.linkIds[4] = false;
        }
    }
    calculateZombieLine(elementLine, elementResult, result) {
        if (elementResult.count === 5) {
            result.elementType = elemenets_1.ElementsEnum.Zombie;
            result.rewardType = 3;
            result.linkNum = 5;
        }
        else if (elementResult.count === 4) {
            if (elementLine[4] !== elemenets_1.ElementsEnum.Zombie) {
                result.elementType = elemenets_1.ElementsEnum.Zombie;
                result.rewardType = 2;
                result.linkNum = 4;
                result.linkIds[4] = false;
            }
            else if (elementLine[2] === elemenets_1.ElementsEnum.Zombie) {
                result.elementType = elemenets_1.ElementsEnum.Zombie;
                result.rewardType = 1;
                result.linkNum = 3;
                if (elementLine[0] === elemenets_1.ElementsEnum.Zombie &&
                    elementLine[1] === elemenets_1.ElementsEnum.Zombie &&
                    elementLine[2] === elemenets_1.ElementsEnum.Zombie) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                }
                else if (elementLine[2] === elemenets_1.ElementsEnum.Zombie &&
                    elementLine[3] === elemenets_1.ElementsEnum.Zombie &&
                    elementLine[4] === elemenets_1.ElementsEnum.Zombie) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        }
        else if (elementResult.count === 3) {
            if (elementLine[0] !== elemenets_1.ElementsEnum.Zombie && elementLine[4] !== elemenets_1.ElementsEnum.Zombie) {
                result.elementType = elemenets_1.ElementsEnum.Zombie;
                result.rewardType = 0;
                result.linkNum = 3;
            }
            else if ((elementLine[0] !== elemenets_1.ElementsEnum.Zombie && elementLine[1] !== elemenets_1.ElementsEnum.Zombie) ||
                (elementLine[3] !== elemenets_1.ElementsEnum.Zombie && elementLine[4] !== elemenets_1.ElementsEnum.Zombie)) {
                result.elementType = elemenets_1.ElementsEnum.Zombie;
                result.rewardType = 1;
                result.linkNum = 3;
            }
            elementLine.forEach((e, index) => {
                result.linkIds[index] = e === elemenets_1.ElementsEnum.Zombie;
            });
        }
    }
    calculateVampireLine(elementLine, elementResult, result) {
        if (elementResult.count === 5) {
            result.elementType = elemenets_1.ElementsEnum.Vampire;
            result.rewardType = 3;
            result.linkNum = 5;
        }
        else if (elementResult.count === 4) {
            if (elementLine[0] === elemenets_1.ElementsEnum.Vampire && elementLine[4] !== elemenets_1.ElementsEnum.Vampire) {
                result.elementType = elemenets_1.ElementsEnum.Vampire;
                result.rewardType = 2;
                result.linkNum = 4;
                result.linkIds[4] = false;
            }
            else if (elementLine[2] === elemenets_1.ElementsEnum.Vampire) {
                result.elementType = elemenets_1.ElementsEnum.Vampire;
                result.rewardType = 1;
                result.linkNum = 3;
                if (elementLine[0] === elemenets_1.ElementsEnum.Vampire &&
                    elementLine[1] === elemenets_1.ElementsEnum.Vampire &&
                    elementLine[2] === elemenets_1.ElementsEnum.Vampire) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                }
                else if (elementLine[2] === elemenets_1.ElementsEnum.Vampire &&
                    elementLine[3] === elemenets_1.ElementsEnum.Vampire &&
                    elementLine[4] === elemenets_1.ElementsEnum.Vampire) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        }
        else if (elementResult.count === 3) {
            elementLine.forEach((e, index) => {
                result.linkIds[index] = e === elemenets_1.ElementsEnum.Vampire;
            });
            if (elementLine[0] !== elemenets_1.ElementsEnum.Vampire && elementLine[4] !== elemenets_1.ElementsEnum.Vampire) {
                result.elementType = elemenets_1.ElementsEnum.Vampire;
                result.rewardType = 0;
                result.linkNum = 3;
            }
            else if ((elementLine[0] !== elemenets_1.ElementsEnum.Vampire && elementLine[1] !== elemenets_1.ElementsEnum.Vampire) ||
                (elementLine[3] !== elemenets_1.ElementsEnum.Vampire && elementLine[4] !== elemenets_1.ElementsEnum.Vampire)) {
                result.elementType = elemenets_1.ElementsEnum.Vampire;
                result.rewardType = 1;
                result.linkNum = 3;
            }
        }
    }
    calculateWizardLine(elementLine, elementResult, result) {
        if (elementResult.count === 5) {
            result.elementType = elemenets_1.ElementsEnum.Wizard;
            result.rewardType = 2;
            result.linkNum = 5;
        }
        else if (elementResult.count === 4) {
            if (elementLine[0] === elemenets_1.ElementsEnum.Wizard && elementLine[4] !== elemenets_1.ElementsEnum.Wizard) {
                result.elementType = elemenets_1.ElementsEnum.Wizard;
                result.rewardType = 1;
                result.linkNum = 4;
                result.linkIds[4] = false;
            }
            else if (elementLine[2] === elemenets_1.ElementsEnum.Wizard) {
                result.elementType = elemenets_1.ElementsEnum.Wizard;
                result.rewardType = 0;
                result.linkNum = 3;
                if (elementLine[0] === elemenets_1.ElementsEnum.Wizard &&
                    elementLine[1] === elemenets_1.ElementsEnum.Wizard &&
                    elementLine[2] === elemenets_1.ElementsEnum.Wizard) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                }
                else if (elementLine[2] === elemenets_1.ElementsEnum.Wizard &&
                    elementLine[3] === elemenets_1.ElementsEnum.Wizard &&
                    elementLine[4] === elemenets_1.ElementsEnum.Wizard) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        }
        else if (elementResult.count === 3) {
            if ((elementLine[0] !== elemenets_1.ElementsEnum.Wizard && elementLine[4] !== elemenets_1.ElementsEnum.Wizard) ||
                ((elementLine[0] !== elemenets_1.ElementsEnum.Wizard && elementLine[1] !== elemenets_1.ElementsEnum.Wizard) ||
                    (elementLine[3] !== elemenets_1.ElementsEnum.Wizard && elementLine[4] !== elemenets_1.ElementsEnum.Wizard))) {
                result.elementType = elemenets_1.ElementsEnum.Wizard;
                result.rewardType = 0;
                result.linkNum = 3;
                elementLine.forEach((e, index) => {
                    result.linkIds[index] = e === elemenets_1.ElementsEnum.Wizard;
                });
            }
        }
    }
    calculateScarecrowLine(elementLine, elementResult, result) {
        elementLine.forEach((e, index) => {
            result.linkIds[index] = e === elemenets_1.ElementsEnum.Scarecrow;
        });
        if (elementResult.count === 5) {
            result.elementType = elemenets_1.ElementsEnum.Scarecrow;
            result.rewardType = 2;
            result.linkNum = 5;
        }
        else if (elementResult.count === 4) {
            result.elementType = elemenets_1.ElementsEnum.Scarecrow;
            result.rewardType = 1;
            result.linkNum = 4;
        }
        else if (elementResult.count === 3) {
            result.elementType = elemenets_1.ElementsEnum.Scarecrow;
            result.rewardType = 0;
            result.linkNum = 3;
        }
    }
    calculateClayPotLine(elementLine, elementResult, result) {
        if (elementResult.count === 5) {
            result.elementType = elemenets_1.ElementsEnum.ClayPot;
            result.rewardType = 2;
            result.linkNum = 5;
        }
        else if (elementResult.count === 4) {
            if (elementLine[4] !== elemenets_1.ElementsEnum.ClayPot || elementLine[0] !== elemenets_1.ElementsEnum.ClayPot) {
                result.elementType = elemenets_1.ElementsEnum.ClayPot;
                result.rewardType = 1;
                result.linkNum = 4;
                if (elementLine[4] !== elemenets_1.ElementsEnum.ClayPot) {
                    result.linkIds[4] = false;
                }
                else if (elementLine[0] !== elemenets_1.ElementsEnum.ClayPot) {
                    result.linkIds[0] = false;
                }
            }
            else if (elementLine[2] === elemenets_1.ElementsEnum.ClayPot) {
                result.elementType = elemenets_1.ElementsEnum.ClayPot;
                result.rewardType = 0;
                result.linkNum = 3;
                if (elementLine[0] === elemenets_1.ElementsEnum.ClayPot &&
                    elementLine[1] === elemenets_1.ElementsEnum.ClayPot) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                }
                else if (elementLine[3] === elemenets_1.ElementsEnum.ClayPot &&
                    elementLine[4] === elemenets_1.ElementsEnum.ClayPot) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        }
        else if (elementResult.count === 3) {
            if ((elementLine[0] !== elemenets_1.ElementsEnum.ClayPot && elementLine[1] !== elemenets_1.ElementsEnum.ClayPot) ||
                (elementLine[3] !== elemenets_1.ElementsEnum.ClayPot && elementLine[4] !== elemenets_1.ElementsEnum.ClayPot)) {
                result.elementType = elemenets_1.ElementsEnum.ClayPot;
                result.rewardType = 0;
                result.linkNum = 3;
                elementLine.forEach((e, index) => {
                    result.linkIds[index] = e === elemenets_1.ElementsEnum.ClayPot;
                });
            }
        }
    }
    calculateWitchLine(elementLine, elementResult, result) {
        if (elementResult.count === 5) {
            result.elementType = elemenets_1.ElementsEnum.Witch;
            result.rewardType = 2;
            result.linkNum = 5;
        }
        else if (elementResult.count === 4) {
            if (elementLine[4] !== elemenets_1.ElementsEnum.Witch) {
                result.elementType = elemenets_1.ElementsEnum.Witch;
                result.rewardType = 1;
                result.linkNum = 4;
                result.linkIds[4] = false;
            }
            else if (elementLine[2] === elemenets_1.ElementsEnum.Witch) {
                result.elementType = elemenets_1.ElementsEnum.Witch;
                result.rewardType = 0;
                result.linkNum = 3;
                if (elementLine[0] === elemenets_1.ElementsEnum.Witch &&
                    elementLine[1] === elemenets_1.ElementsEnum.Witch &&
                    elementLine[2] === elemenets_1.ElementsEnum.Witch) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                }
                else if (elementLine[1] === elemenets_1.ElementsEnum.Witch &&
                    elementLine[2] === elemenets_1.ElementsEnum.Witch &&
                    elementLine[3] === elemenets_1.ElementsEnum.Witch) {
                    result.linkIds[0] = false;
                    result.linkIds[4] = false;
                }
                else if (elementLine[2] === elemenets_1.ElementsEnum.Witch &&
                    elementLine[3] === elemenets_1.ElementsEnum.Witch &&
                    elementLine[4] === elemenets_1.ElementsEnum.Witch) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        }
        else if (elementResult.count === 3) {
            if ((elementLine[0] !== elemenets_1.ElementsEnum.Witch && elementLine[4] !== elemenets_1.ElementsEnum.Witch) ||
                ((elementLine[0] !== elemenets_1.ElementsEnum.Witch && elementLine[1] !== elemenets_1.ElementsEnum.Witch) ||
                    (elementLine[3] !== elemenets_1.ElementsEnum.Witch && elementLine[4] !== elemenets_1.ElementsEnum.Witch))) {
                result.elementType = elemenets_1.ElementsEnum.Witch;
                result.rewardType = 0;
                result.linkNum = 3;
                elementLine.forEach((e, index) => {
                    result.linkIds[index] = e === elemenets_1.ElementsEnum.Witch;
                });
            }
        }
    }
    calculateMagicianLine(elementLine, elementResult, result) {
        if (elementResult.count === 5) {
            result.elementType = elemenets_1.ElementsEnum.Magician;
            result.rewardType = 2;
            result.linkNum = 5;
        }
        else if (elementResult.count === 4) {
            if (elementLine[4] !== elemenets_1.ElementsEnum.Magician) {
                result.elementType = elemenets_1.ElementsEnum.Magician;
                result.rewardType = 1;
                result.linkNum = 4;
                result.linkIds[0] = false;
            }
            else if (elementLine[2] === elemenets_1.ElementsEnum.Magician) {
                result.elementType = elemenets_1.ElementsEnum.Magician;
                result.rewardType = 0;
                result.linkNum = 3;
                if (elementLine[0] === elemenets_1.ElementsEnum.Magician &&
                    elementLine[1] === elemenets_1.ElementsEnum.Magician) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                }
                else if (elementLine[3] === elemenets_1.ElementsEnum.Magician &&
                    elementLine[4] === elemenets_1.ElementsEnum.Magician) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        }
        else if (elementResult.count === 3) {
            if ((elementLine[0] !== elemenets_1.ElementsEnum.Magician && elementLine[1] !== elemenets_1.ElementsEnum.Magician) ||
                (elementLine[3] !== elemenets_1.ElementsEnum.Magician && elementLine[4] !== elemenets_1.ElementsEnum.Magician)) {
                result.elementType = elemenets_1.ElementsEnum.Magician;
                result.rewardType = 0;
                result.linkNum = 3;
                elementLine.forEach((e, index) => {
                    result.linkIds[index] = e === elemenets_1.ElementsEnum.Magician;
                });
            }
        }
    }
    calculateDemonLine(elementLine, elementResult, result) {
        if (elementResult.count === 5) {
            result.elementType = elemenets_1.ElementsEnum.Demon;
            result.rewardType = 2;
            result.linkNum = 5;
        }
        else if (elementResult.count === 4) {
            if (elementLine[0] !== elemenets_1.ElementsEnum.Demon) {
                result.elementType = elemenets_1.ElementsEnum.Demon;
                result.rewardType = 1;
                result.linkNum = 4;
                result.linkIds[0] = false;
            }
            else if (elementLine[2] === elemenets_1.ElementsEnum.Demon) {
                result.elementType = elemenets_1.ElementsEnum.Demon;
                result.rewardType = 0;
                result.linkNum = 3;
                if (elementLine[0] === elemenets_1.ElementsEnum.Demon &&
                    elementLine[1] === elemenets_1.ElementsEnum.Demon) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                }
                else if (elementLine[3] === elemenets_1.ElementsEnum.Demon &&
                    elementLine[4] === elemenets_1.ElementsEnum.Demon) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        }
        else if (elementResult.count === 3) {
            if ((elementLine[0] !== elemenets_1.ElementsEnum.Demon && elementLine[4] !== elemenets_1.ElementsEnum.Demon) ||
                ((elementLine[0] !== elemenets_1.ElementsEnum.Demon && elementLine[1] !== elemenets_1.ElementsEnum.Demon) ||
                    (elementLine[3] !== elemenets_1.ElementsEnum.Demon && elementLine[4] !== elemenets_1.ElementsEnum.Demon))) {
                result.elementType = elemenets_1.ElementsEnum.Demon;
                result.rewardType = 0;
                result.linkNum = 3;
                elementLine.forEach((e, index) => {
                    result.linkIds[index] = e === elemenets_1.ElementsEnum.Demon;
                });
            }
        }
    }
    calculatePumpkinLine(elementLine, elementResult, result) {
        if (elementResult.count === 5) {
            result.elementType = elemenets_1.ElementsEnum.Pumpkin;
            result.rewardType = 2;
            result.linkNum = 5;
        }
        else if (elementResult.count === 4 && elementLine[4] !== elemenets_1.ElementsEnum.Pumpkin) {
            result.elementType = elemenets_1.ElementsEnum.Pumpkin;
            result.rewardType = 1;
            result.linkNum = 4;
            result.linkIds[4] = false;
        }
        else if (elementLine[0] === elemenets_1.ElementsEnum.Pumpkin &&
            elementLine[1] === elemenets_1.ElementsEnum.Pumpkin &&
            elementLine[2] === elemenets_1.ElementsEnum.Pumpkin) {
            result.elementType = elemenets_1.ElementsEnum.Pumpkin;
            result.rewardType = 0;
            result.linkNum = 3;
            elementLine.forEach((e, index) => {
                result.linkIds[index] = e === elemenets_1.ElementsEnum.Pumpkin;
            });
        }
    }
}
exports.Lottery = Lottery;
function getMoreThanThreeElement(elements) {
    const counts = {};
    elements.forEach(e => {
        if (!counts[e])
            counts[e] = 0;
        counts[e] += 1;
    });
    for (let key in counts) {
        if (counts[key] >= 3)
            return {
                element: key,
                count: counts[key],
            };
    }
    return null;
}
function crateSlotLottery(newer, roulette) {
    return new Lottery(newer, roulette);
}
exports.crateSlotLottery = crateSlotLottery;
function personalInternalControl(recordCount, roulette, winPercentage, overallControl) {
    if (!overallControl && recordCount >= 10) {
        if (roulette === '1') {
            return [false, false];
        }
        const rightValue = roulette === '2' ? 0.45 : 0.25;
        const leftValue = roulette == '2' ? 0.25 : 0.05;
        if (leftValue < winPercentage && winPercentage < rightValue) {
            return [true, false];
        }
        if (winPercentage <= leftValue) {
            return [false, true];
        }
    }
    return [false, false];
}
exports.personalInternalControl = personalInternalControl;
function getClayPotLotteryResult() {
    const arr = [constant_1.ClayPotGameElementType.Fifty, constant_1.ClayPotGameElementType.SevenTyFive, constant_1.ClayPotGameElementType.OneHundred,
        constant_1.ClayPotGameElementType.OneHundred, constant_1.ClayPotGameElementType.Bonus];
    return arr[(0, utils_1.random)(0, 4)];
}
exports.getClayPotLotteryResult = getClayPotLotteryResult;
function getDiceLotteryResult() {
    const arr = [1, 2, 3, 4, 5, 6];
    return arr[(0, utils_1.random)(0, 5)];
}
exports.getDiceLotteryResult = getDiceLotteryResult;
function genOrchardGameWindow() {
    const base = [constant_1.OrchardGameElementType.None, constant_1.OrchardGameElementType.Two, constant_1.OrchardGameElementType.Five,
        constant_1.OrchardGameElementType.Ten, constant_1.OrchardGameElementType.Twenty, constant_1.OrchardGameElementType.Fifty, constant_1.OrchardGameElementType.OneHundred];
    const window = [];
    for (let i = 0; i < 5; i++) {
        window.push({ type: base[(0, utils_1.random)(0, 6)], open: false });
    }
    base.forEach(e => window.push({ type: e, open: false }));
    return window;
}
exports.genOrchardGameWindow = genOrchardGameWindow;
function getTurntableLotteryResult() {
    const arr = [];
    for (let i = 1; i < 25; i++) {
        arr.push(i);
    }
    return arr[(0, utils_1.random)(0, 23)];
}
exports.getTurntableLotteryResult = getTurntableLotteryResult;
function test() {
    const lottery = crateSlotLottery(false, '1');
    const result = lottery.setBet(10)
        .setTotalBet(3)
        .setInternalControl(false, false, false)
        .result();
    if (!!result.subGame.type) {
        console.log(result);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9oYWxsb3dlZW4vbGliL3V0aWwvbG90dGVyeVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMENBQTJHO0FBQzNHLDZDQUErRDtBQUMvRCxtREFBaUQ7QUFNMUMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksT0FBTyxJQUFJLGtCQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztBQUE1RSxRQUFBLFVBQVUsY0FBa0U7QUFtRnpGLE1BQWEsT0FBTztJQWtCaEIsWUFBWSxLQUFjLEVBQUUsUUFBeUI7UUFYckQsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLFdBQU0sR0FBcUIsRUFBRSxDQUFDO1FBQzlCLGFBQVEsR0FBYyxFQUFFLENBQUM7UUFDekIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLGlCQUFZLEdBQWMsQ0FBQyxDQUFDO1FBQzVCLFlBQU8sR0FBeUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUMsQ0FBQztRQUduRSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBRU8sSUFBSTtRQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxh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