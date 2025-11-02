import {ClayPotGameElementType, default as config, OrchardGameElementType, SubGameType} from "../constant";
import {clone, random, selectElement} from '../../../../utils';
import {ElementsEnum} from "../config/elemenets";


/**
 * 判断选线是否合理
 */
export const isHaveLine = (lineNum) => lineNum >= 1 && lineNum <= config.winLines.length;

/**
 * 中奖线
 * @property index 第几条中奖线
 * @property linkNum 几连
 * @property linkIds 连接的元素下标
 * @property money 这条线收益
 * @property type 开奖类型
 * @property multiple 赔率
 */
interface WinLine {
    index: number,
    linkNum: number,
    linkIds: boolean[],
    money: number,
    type: ElementsEnum,
    multiple: number
}

/**
 * 中奖列
 * @property index 第几条中奖线
 * @property linkIds 连接的元素
 * @property money 这条线收益
 * @property type 开奖类型
 * @property multiple 赔率
 */
interface WinRow {
    index: number,
    linkIds: ElementsEnum[],
    money: number,
    type: ElementsEnum,
    multiple: number
}

/**
 * @property elementType 中奖类型 默认返回空为未中奖
 * @property rewardType 中奖类型 赔率的下标 默认返回0 根据下标查找赔率 详情参见 award.ts 表
 * @property linkNum 元素几连 默认0
 */
interface LineResult {
    elementType: ElementsEnum,
    rewardType: 0 | 1 | 2 | 3,
    linkNum: number,
    linkIds: boolean[],
}


/**
 * 开奖结果
 * @property window 显示结果
 * @property winLines 中奖的行
 * @property winRows 中奖的列
 * @property totalWin 总收益
 */
export interface SlotResult {
    window: ElementsEnum[][],
    winLines: WinLine[],
    winRows: WinRow[],
    totalWin: number,
    multiple: number,
    subGame: { type: SubGameType, count: number },
}

/**
 * 选择权重
 * @property newer 是否是新玩家
 * @property roulette 权重轮盘
 * @property overallControl 总体调控
 * @property singleControlOne 单人调控1
 * @property singleControlTwo 单人调控2
 * @property bet 玩家单押注
 * @property totalBet 玩家总押注
 * @property totalWin 总收益
 * @property jackpotWin 奖池收益
 * @property jackpotType 中奖类型 已废弃不会开奖但是前端还需要
 * @property weights 权重轮盘
 * @property window 窗口
 * @property winLines 中奖线
 * @property totalMultiple 总赔率
 * @property controlState 调控状态 1是随机开奖 2是让系统赢 3是让系统输 默认为1
 */
export class Lottery {
    newer: boolean;
    roulette: '1' | '2' | '3';
    overallControl: boolean;
    singleControlOne: boolean;
    singleControlTwo: boolean;
    bet: number;
    totalBet: number = 0;
    totalWin: number = 0;
    weights: { [element: string]: number[] };
    window: ElementsEnum[][] = [];
    winLines: WinLine[] = [];
    winRows: WinRow[] = [];
    totalMultiple: number = 0;
    bonusCount: number = 0;
    controlState: 1 | 2 | 3 = 1;
    subGame: { type: SubGameType, count: number } = {type: null, count: 0};

    constructor(newer: boolean, roulette: '1' | '2' | '3') {
        this.newer = newer;
        this.roulette = roulette;
    }

    private init() {
        this.totalWin = 0;
        this.window = [];
        this.winLines = [];
        this.winRows = [];
        this.totalMultiple = 0;
        this.bonusCount = 0;
        this.subGame = {type: null, count: 0};
    }

    /**
     * 设置单线押注额
     * @param bet 下注
     */
    setBet(bet: number) {
        this.bet = bet;
        return this;
    }


    /**
     * 设置总押注
     * @param totalBet 总押注
     */
    setTotalBet(totalBet: number) {
        this.totalBet = totalBet;
        return this;
    }

    /**
     * 设置内部调控
     * @param overallControl
     * @param singleControlOne
     * @param singleControlTwo
     */
    setInternalControl(overallControl: boolean, singleControlOne: boolean, singleControlTwo: boolean) {
        this.overallControl = overallControl;
        this.singleControlOne = singleControlOne;
        this.singleControlTwo = singleControlTwo;
        return this;
    }

    /**
     * 设置系统赢或者输
     * @param win
     */
    setSystemWinOrLoss(win: boolean) {
        this.controlState = win ? 2 : 3;
        return this;
    }

    /**
     * 获取最终结果
     */
    result(): SlotResult {
        // 选择轮盘
        this.selectWights();

        // 如果是不调控 随机开奖
        if (this.controlState === 1) {
            this.randomLottery();
        } else {
            this.controlLottery();
        }

        return {
            window: this.window,
            winRows: this.winRows,
            winLines: this.winLines,
            totalWin: this.totalWin,
            multiple: this.totalMultiple,
            subGame: this.subGame,
        }
    }

    /**
     * 随机开奖
     */
    private randomLottery() {
        // 初始化
        this.init();

        // 生成窗口
        this.window = this.generateWindow();

        // 计算收益
        const result = this.calculateEarnings(this.window);
        this.winLines = result.winLines;
        this.totalWin += result.totalWin;
        this.winRows = result.winRows;
    }

    /**
     * 调控开奖
     */
    private controlLottery() {
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


    /**
     * 选择轮盘
     */
    private selectWights() {
        const roulette = this.roulette;

        // 是新人就直接使用第一个轮盘
        if (this.newer) {
            this.weights = clone(config.weights['1']);
        } else {
            this.weights = clone(config.weights[roulette]);
        }
    }

    /**
     * 生成窗口
     */
    generateWindow(): ElementsEnum[][] {
        const window: ElementsEnum[][] = [];
        const elementKeys = Object.keys(this.weights);

        // 生成一个矩阵
        for (let i = 0; i < config.column; i++) {
            const elementSet = elementKeys.map(element => {
                return {key: element, value: this.weights[element][i]};
            });

            // 一列
            const line = [];

            for (let j = 0; j < config.row; j++) {
                // 随机选择一个元素
                line.push(selectElement(elementSet));
            }

            window.push(line);
        }

        let elementSet = new Set();
        const selectLines: number[][] = config.winLines.slice();
        selectLines.forEach((line, index) => {
            // 这条线上的元素
            const elementLine: ElementsEnum[] = line.map((l, i) => window[i][l - 1]);

            // 先克隆一个当前元素的副本
            const transcript = clone(elementLine);

            // 计算元素线中奖结果
            const lineResult: LineResult = this.calculateLineResult(transcript);

            // 如果有中奖元素
            if (lineResult.elementType) {
                if (lineResult.elementType === ElementsEnum.ClayPot) {
                    elementSet.add(ElementsEnum.ClayPot);
                } else if (lineResult.elementType === ElementsEnum.Witch && lineResult.linkNum !== 5) {
                    elementSet.add(ElementsEnum.Witch);
                }
            }
        });

        window.forEach((row) => {
            const _row = clone(row);
            const rowResult = this.calculateRowResult(_row);

            if (rowResult.elementType !== null) {
                elementSet.add(rowResult.elementType);
            }
        });

        if (elementSet.size > 1) {
            return this.generateWindow();
        }

        // 如果是调控状态不允许开小游戏
        if (this.controlState !== 1 && !!config.littleGameElements.find(e => elementSet.has(e))) {
            return this.generateWindow();
        }

        return window;
    }

    /**
     * 计算收益
     */
    private calculateEarnings(window: ElementsEnum[][]): { winLines: WinLine[], winRows: WinRow[], totalWin: number } {
        // 中奖线
        let winLines: WinLine[] = [],
            winRows: WinRow[] = [],
            // 累积收益
            totalWin = 0;

        totalWin += this.calculateLines(window, winLines);
        totalWin += this.calculateRows(window, winRows);

        // bonus奖励
        if (this.bonusCount > 0) {
            totalWin *= this.bonusCount;
        }

        return {winLines, totalWin, winRows};
    }

    /**
     * 计算列的中奖
     * @param window
     * @param winRows
     * @private
     */
    private calculateRows(window: ElementsEnum[][], winRows: WinRow[]) {
        let totalWin = 0,
            wizardCount = 0,
            witchCount = 0,
            clayPotCount = 0,
            vampireCount = 0;

        window.forEach((row, index) => {
            const _row = clone(row);
            const rowResult = this.calculateRowResult(_row);

            switch (rowResult.elementType) {
                case ElementsEnum.Pumpkin:
                case ElementsEnum.Demon:
                case ElementsEnum.Magician:
                case ElementsEnum.Scarecrow:
                case ElementsEnum.Zombie:
                case ElementsEnum.Ghost: {
                    let odds = config.awardRow[rowResult.elementType];
                    const rowProfit = this.bet * odds;
                    totalWin += rowProfit;
                    this.totalMultiple += odds;

                    winRows.push({
                        index,
                        linkIds: row.slice(),
                        money: rowProfit,
                        type: rowResult.elementType,
                        multiple: odds
                    })

                    break;
                }
                case ElementsEnum.Wizard:
                    wizardCount++;
                    this.bonusCount++;

                    if (wizardCount > this.subGame.count) {
                        this.subGame.count = wizardCount;
                        this.subGame.type = ElementsEnum.Wizard;
                    }

                    winRows.push({
                        index,
                        linkIds: row.slice(),
                        money: 0,
                        type: rowResult.elementType,
                        multiple: 0
                    });
                    break;
                case ElementsEnum.Witch:
                    witchCount++;
                    this.bonusCount++;

                    if (witchCount > this.subGame.count) {
                        this.subGame.count = witchCount;
                        this.subGame.type = ElementsEnum.Witch;
                    }

                    winRows.push({
                        index,
                        linkIds: row.slice(),
                        money: 0,
                        type: rowResult.elementType,
                        multiple: 0
                    });
                    break;
                case ElementsEnum.ClayPot:
                    clayPotCount++;
                    this.bonusCount++;

                    if (clayPotCount > this.subGame.count) {
                        this.subGame.count = clayPotCount;
                        this.subGame.type = ElementsEnum.ClayPot;
                    }

                    winRows.push({
                        index,
                        linkIds: row.slice(),
                        money: 0,
                        type: rowResult.elementType,
                        multiple: 0
                    });
                    break;
                case ElementsEnum.Vampire:
                    vampireCount++;
                    this.bonusCount++;

                    if (vampireCount > this.subGame.count) {
                        this.subGame.count = vampireCount;
                        this.subGame.type = ElementsEnum.Vampire;
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

    /**
     * 计算这条线的开奖结果
     * @param elementLine 元素线
     */
    private calculateRowResult(elementLine: ElementsEnum[]): { elementType: ElementsEnum } {
        const result: { elementType: ElementsEnum } = {elementType: null};

        if (elementLine.every(v => v === elementLine[0])) {
            result.elementType = elementLine[0];
        }

        return result;
    }

    /**
     * 计算线
     * @param winLines
     * @param window
     * @private
     */
    private calculateLines(window: ElementsEnum[][], winLines: WinLine[]) {
        const selectLines: number[][] = config.winLines.slice();
        let totalWin = 0;

        selectLines.forEach((line, index) => {
            // 这条线上的元素
            const elementLine: ElementsEnum[] = line.map((l, i) => window[i][l - 1]);

            // 先克隆一个当前元素的副本
            const transcript = clone(elementLine);

            // 计算元素线中奖结果
            const lineResult: LineResult = this.calculateLineResult(transcript);

            let clayPotCount = 0, witchCount = 0;

            // 如果有中奖元素
            if (lineResult.elementType) {
                // 中奖赔率
                let odds = config.award[lineResult.elementType][lineResult.rewardType];
                let lineProfit = 0;

                if (lineResult.elementType === ElementsEnum.ClayPot) {
                    clayPotCount++;
                    this.bonusCount += odds;

                    if (clayPotCount > this.subGame.count) {
                        this.subGame.count = clayPotCount;
                        this.subGame.type = ElementsEnum.ClayPot;
                    }
                } else if (lineResult.elementType === ElementsEnum.Witch && lineResult.linkNum !== 5) {
                    witchCount++;
                    this.bonusCount += odds;

                    if (witchCount > this.subGame.count) {
                        this.subGame.count = witchCount;
                        this.subGame.type = ElementsEnum.Witch;
                    }
                } else {
                    lineProfit = this.bet * odds;
                    totalWin += lineProfit;

                    // 累计总赔率
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

    /**
     * 计算这条线的开奖结果
     * @param elementLine 元素线
     */
    private calculateLineResult(elementLine: ElementsEnum[]): LineResult {
        // 查看是否有超过三个的元素
        const elementResult = getMoreThanThreeElement(elementLine);
        let result: LineResult = {
            elementType: null,
            rewardType: 0,
            linkNum: 0,
            linkIds: [true, true, true, true, true]
        };

        if (!elementResult) {
            return result;
        }

        switch (elementResult.element) {
            case ElementsEnum.Ghost:
                this.calculateGhostLine(elementLine, elementResult, result);
                break;
            case ElementsEnum.Zombie:
                this.calculateZombieLine(elementLine, elementResult, result);
                break;
            case ElementsEnum.Vampire:
                this.calculateVampireLine(elementLine, elementResult, result);
                break;
            case ElementsEnum.Wizard:
                this.calculateWizardLine(elementLine, elementResult, result);
                break;
            case ElementsEnum.Scarecrow:
                this.calculateScarecrowLine(elementLine, elementResult, result);
                break;
            case ElementsEnum.ClayPot:
                this.calculateClayPotLine(elementLine, elementResult, result);
                break;
            case ElementsEnum.Witch:
                this.calculateWitchLine(elementLine, elementResult, result);
                break;
            case ElementsEnum.Magician:
                this.calculateMagicianLine(elementLine, elementResult, result);
                break;
            case ElementsEnum.Demon:
                this.calculateDemonLine(elementLine, elementResult, result);
                break;
            case ElementsEnum.Pumpkin:
                this.calculatePumpkinLine(elementLine, elementResult, result);
                break;
            default:
                // throw new Error(`未判断的情况 元素线: ${elementLine}`);
                break;
        }

        return result;
    }

    /**
     * 计算幽灵开奖
     * @param elementLine
     * @param elementResult
     * @param result
     * @private
     */
    private calculateGhostLine(elementLine: ElementsEnum[],
                               elementResult: { element: ElementsEnum, count: number },
                               result: LineResult) {
        if (elementResult.count < 4) {
            return;
        }

        if (elementResult.count === 5) {
            result.elementType = ElementsEnum.Ghost;
            result.rewardType = 1;
            result.linkNum = 5;
        } else if (elementResult.count === 4 && elementLine[4] !== ElementsEnum.Ghost) {
            result.elementType = ElementsEnum.Ghost;
            result.rewardType = 0;
            result.linkNum = 4;

            result.linkIds[4] = false;
        }
    }

    /**
     * 计算僵尸开奖
     * @param elementLine
     * @param elementResult
     * @param result
     * @private
     */
    private calculateZombieLine(elementLine: ElementsEnum[],
                                elementResult: { element: ElementsEnum, count: number },
                                result: LineResult) {
        if (elementResult.count === 5) {
            result.elementType = ElementsEnum.Zombie;
            result.rewardType = 3;
            result.linkNum = 5;
        } else if (elementResult.count === 4) {
            if (elementLine[4] !== ElementsEnum.Zombie) {
                result.elementType = ElementsEnum.Zombie;
                result.rewardType = 2;
                result.linkNum = 4;
                result.linkIds[4] = false;
            } else if (elementLine[2] === ElementsEnum.Zombie) {
                result.elementType = ElementsEnum.Zombie;
                result.rewardType = 1;
                result.linkNum = 3;

                if (elementLine[0] === ElementsEnum.Zombie &&
                    elementLine[1] === ElementsEnum.Zombie &&
                    elementLine[2] === ElementsEnum.Zombie) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                } else if (elementLine[2] === ElementsEnum.Zombie &&
                    elementLine[3] === ElementsEnum.Zombie &&
                    elementLine[4] === ElementsEnum.Zombie) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        } else if (elementResult.count === 3) {
            if (elementLine[0] !== ElementsEnum.Zombie && elementLine[4] !== ElementsEnum.Zombie) {
                result.elementType = ElementsEnum.Zombie;
                result.rewardType = 0;
                result.linkNum = 3;
            } else if ((elementLine[0] !== ElementsEnum.Zombie && elementLine[1] !== ElementsEnum.Zombie) ||
                (elementLine[3] !== ElementsEnum.Zombie && elementLine[4] !== ElementsEnum.Zombie)) {
                result.elementType = ElementsEnum.Zombie;
                result.rewardType = 1;
                result.linkNum = 3;
            }

            elementLine.forEach((e, index) => {
                result.linkIds[index] = e === ElementsEnum.Zombie;
            })
        }
    }

    /**
     * 计算吸血鬼开奖
     * @param elementLine
     * @param elementResult
     * @param result
     * @private
     */
    private calculateVampireLine(elementLine: ElementsEnum[],
                                 elementResult: { element: ElementsEnum, count: number },
                                 result: LineResult) {
        if (elementResult.count === 5) {
            result.elementType = ElementsEnum.Vampire;
            result.rewardType = 3;
            result.linkNum = 5;
        } else if (elementResult.count === 4) {
            if (elementLine[0] === ElementsEnum.Vampire && elementLine[4] !== ElementsEnum.Vampire) {
                result.elementType = ElementsEnum.Vampire;
                result.rewardType = 2;
                result.linkNum = 4;
                result.linkIds[4] = false;
            } else if (elementLine[2] === ElementsEnum.Vampire) {
                result.elementType = ElementsEnum.Vampire;
                result.rewardType = 1;
                result.linkNum = 3;

                if (elementLine[0] === ElementsEnum.Vampire &&
                    elementLine[1] === ElementsEnum.Vampire &&
                    elementLine[2] === ElementsEnum.Vampire) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                } else if (elementLine[2] === ElementsEnum.Vampire &&
                    elementLine[3] === ElementsEnum.Vampire &&
                    elementLine[4] === ElementsEnum.Vampire) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        } else if (elementResult.count === 3) {
            elementLine.forEach((e, index) => {
                result.linkIds[index] = e === ElementsEnum.Vampire;
            })
            if (elementLine[0] !== ElementsEnum.Vampire && elementLine[4] !== ElementsEnum.Vampire) {
                result.elementType = ElementsEnum.Vampire;
                result.rewardType = 0;
                result.linkNum = 3;
            } else if ((elementLine[0] !== ElementsEnum.Vampire && elementLine[1] !== ElementsEnum.Vampire) ||
                (elementLine[3] !== ElementsEnum.Vampire && elementLine[4] !== ElementsEnum.Vampire)) {
                result.elementType = ElementsEnum.Vampire;
                result.rewardType = 1;
                result.linkNum = 3;
            }
        }
    }

    /**
     * 计算巫师开奖
     * @param elementLine
     * @param elementResult
     * @param result
     * @private
     */
    private calculateWizardLine(elementLine: ElementsEnum[],
                                elementResult: { element: ElementsEnum, count: number },
                                result: LineResult) {
        if (elementResult.count === 5) {
            result.elementType = ElementsEnum.Wizard;
            result.rewardType = 2;
            result.linkNum = 5;
        } else if (elementResult.count === 4) {
            if (elementLine[0] === ElementsEnum.Wizard && elementLine[4] !== ElementsEnum.Wizard) {
                result.elementType = ElementsEnum.Wizard;
                result.rewardType = 1;
                result.linkNum = 4;
                result.linkIds[4] = false;
            } else if (elementLine[2] === ElementsEnum.Wizard) {
                result.elementType = ElementsEnum.Wizard;
                result.rewardType = 0;
                result.linkNum = 3;

                if (elementLine[0] === ElementsEnum.Wizard &&
                    elementLine[1] === ElementsEnum.Wizard &&
                    elementLine[2] === ElementsEnum.Wizard) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                } else if (elementLine[2] === ElementsEnum.Wizard &&
                    elementLine[3] === ElementsEnum.Wizard &&
                    elementLine[4] === ElementsEnum.Wizard) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        } else if (elementResult.count === 3) {
            if ((elementLine[0] !== ElementsEnum.Wizard && elementLine[4] !== ElementsEnum.Wizard) ||
                ((elementLine[0] !== ElementsEnum.Wizard && elementLine[1] !== ElementsEnum.Wizard) ||
                    (elementLine[3] !== ElementsEnum.Wizard && elementLine[4] !== ElementsEnum.Wizard))) {
                result.elementType = ElementsEnum.Wizard;
                result.rewardType = 0;
                result.linkNum = 3;

                elementLine.forEach((e, index) => {
                    result.linkIds[index] = e === ElementsEnum.Wizard;
                })
            }
        }
    }

    /**
     * 计算稻草人开奖
     * @param elementLine
     * @param elementResult
     * @param result
     * @private
     */
    private calculateScarecrowLine(elementLine: ElementsEnum[],
                                   elementResult: { element: ElementsEnum, count: number },
                                   result: LineResult) {

        elementLine.forEach((e, index) => {
            result.linkIds[index] = e === ElementsEnum.Scarecrow;
        })
        if (elementResult.count === 5) {
            result.elementType = ElementsEnum.Scarecrow;
            result.rewardType = 2;
            result.linkNum = 5;
        } else if (elementResult.count === 4) {
            result.elementType = ElementsEnum.Scarecrow;
            result.rewardType = 1;
            result.linkNum = 4;
        } else if (elementResult.count === 3) {
            result.elementType = ElementsEnum.Scarecrow;
            result.rewardType = 0;
            result.linkNum = 3;
        }
    }

    /**
     * 计算陶罐开奖
     * @param elementLine
     * @param elementResult
     * @param result
     * @private
     */
    private calculateClayPotLine(elementLine: ElementsEnum[],
                                 elementResult: { element: ElementsEnum, count: number },
                                 result: LineResult) {
        if (elementResult.count === 5) {
            result.elementType = ElementsEnum.ClayPot;
            result.rewardType = 2;
            result.linkNum = 5;
        } else if (elementResult.count === 4) {
            if (elementLine[4] !== ElementsEnum.ClayPot || elementLine[0] !== ElementsEnum.ClayPot) {
                result.elementType = ElementsEnum.ClayPot;
                result.rewardType = 1;
                result.linkNum = 4;

                if (elementLine[4] !== ElementsEnum.ClayPot) {
                    result.linkIds[4] = false;
                } else if (elementLine[0] !== ElementsEnum.ClayPot) {
                    result.linkIds[0] = false;
                }

            } else if (elementLine[2] === ElementsEnum.ClayPot) {
                result.elementType = ElementsEnum.ClayPot;
                result.rewardType = 0;
                result.linkNum = 3;

                if (elementLine[0] === ElementsEnum.ClayPot &&
                    elementLine[1] === ElementsEnum.ClayPot) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                } else if (elementLine[3] === ElementsEnum.ClayPot &&
                    elementLine[4] === ElementsEnum.ClayPot) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        } else if (elementResult.count === 3) {
            if ((elementLine[0] !== ElementsEnum.ClayPot && elementLine[1] !== ElementsEnum.ClayPot) ||
                (elementLine[3] !== ElementsEnum.ClayPot && elementLine[4] !== ElementsEnum.ClayPot)) {
                result.elementType = ElementsEnum.ClayPot;
                result.rewardType = 0;
                result.linkNum = 3;

                elementLine.forEach((e, index) => {
                    result.linkIds[index] = e === ElementsEnum.ClayPot;
                })
            }
        }
    }

    /**
     * 计算女巫开奖
     * @param elementLine
     * @param elementResult
     * @param result
     * @private
     */
    private calculateWitchLine(elementLine: ElementsEnum[],
                               elementResult: { element: ElementsEnum, count: number },
                               result: LineResult) {
        if (elementResult.count === 5) {
            result.elementType = ElementsEnum.Witch;
            result.rewardType = 2;
            result.linkNum = 5;
        } else if (elementResult.count === 4) {
            if (elementLine[4] !== ElementsEnum.Witch) {
                result.elementType = ElementsEnum.Witch;
                result.rewardType = 1;
                result.linkNum = 4;
                result.linkIds[4] = false;
            } else if (elementLine[2] === ElementsEnum.Witch) {
                result.elementType = ElementsEnum.Witch;
                result.rewardType = 0;
                result.linkNum = 3;

                if (elementLine[0] === ElementsEnum.Witch &&
                    elementLine[1] === ElementsEnum.Witch &&
                    elementLine[2] === ElementsEnum.Witch) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                } else if (elementLine[1] === ElementsEnum.Witch &&
                    elementLine[2] === ElementsEnum.Witch &&
                    elementLine[3] === ElementsEnum.Witch) {
                    result.linkIds[0] = false;
                    result.linkIds[4] = false;
                } else if (elementLine[2] === ElementsEnum.Witch &&
                    elementLine[3] === ElementsEnum.Witch &&
                    elementLine[4] === ElementsEnum.Witch) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        } else if (elementResult.count === 3) {
            if ((elementLine[0] !== ElementsEnum.Witch && elementLine[4] !== ElementsEnum.Witch) ||
                ((elementLine[0] !== ElementsEnum.Witch && elementLine[1] !== ElementsEnum.Witch) ||
                    (elementLine[3] !== ElementsEnum.Witch && elementLine[4] !== ElementsEnum.Witch))) {
                result.elementType = ElementsEnum.Witch;
                result.rewardType = 0;
                result.linkNum = 3;

                elementLine.forEach((e, index) => {
                    result.linkIds[index] = e === ElementsEnum.Witch;
                })
            }
        }
    }

    /**
     * 计算魔法师开奖
     * @param elementLine
     * @param elementResult
     * @param result
     * @private
     */
    private calculateMagicianLine(elementLine: ElementsEnum[],
                                  elementResult: { element: ElementsEnum, count: number },
                                  result: LineResult) {
        if (elementResult.count === 5) {
            result.elementType = ElementsEnum.Magician;
            result.rewardType = 2;
            result.linkNum = 5;
        } else if (elementResult.count === 4) {
            if (elementLine[4] !== ElementsEnum.Magician) {
                result.elementType = ElementsEnum.Magician;
                result.rewardType = 1;
                result.linkNum = 4;
                result.linkIds[0] = false;
            } else if (elementLine[2] === ElementsEnum.Magician) {
                result.elementType = ElementsEnum.Magician;
                result.rewardType = 0;
                result.linkNum = 3;

                if (elementLine[0] === ElementsEnum.Magician &&
                    elementLine[1] === ElementsEnum.Magician) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                } else if (elementLine[3] === ElementsEnum.Magician &&
                    elementLine[4] === ElementsEnum.Magician) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        } else if (elementResult.count === 3) {
            if ((elementLine[0] !== ElementsEnum.Magician && elementLine[1] !== ElementsEnum.Magician) ||
                (elementLine[3] !== ElementsEnum.Magician && elementLine[4] !== ElementsEnum.Magician)) {
                result.elementType = ElementsEnum.Magician;
                result.rewardType = 0;
                result.linkNum = 3;

                elementLine.forEach((e, index) => {
                    result.linkIds[index] = e === ElementsEnum.Magician;
                })
            }
        }
    }

    /**
     * 计算恶魔开奖
     * @param elementLine
     * @param elementResult
     * @param result
     * @private
     */
    private calculateDemonLine(elementLine: ElementsEnum[],
                               elementResult: { element: ElementsEnum, count: number },
                               result: LineResult) {
        if (elementResult.count === 5) {
            result.elementType = ElementsEnum.Demon;
            result.rewardType = 2;
            result.linkNum = 5;
        } else if (elementResult.count === 4) {
            if (elementLine[0] !== ElementsEnum.Demon) {
                result.elementType = ElementsEnum.Demon;
                result.rewardType = 1;
                result.linkNum = 4;
                result.linkIds[0] = false;
            } else if (elementLine[2] === ElementsEnum.Demon) {
                result.elementType = ElementsEnum.Demon;
                result.rewardType = 0;
                result.linkNum = 3;

                if (elementLine[0] === ElementsEnum.Demon &&
                    elementLine[1] === ElementsEnum.Demon) {
                    result.linkIds[3] = false;
                    result.linkIds[4] = false;
                } else if (elementLine[3] === ElementsEnum.Demon &&
                    elementLine[4] === ElementsEnum.Demon) {
                    result.linkIds[0] = false;
                    result.linkIds[1] = false;
                }
            }
        } else if (elementResult.count === 3) {
            if ((elementLine[0] !== ElementsEnum.Demon && elementLine[4] !== ElementsEnum.Demon) ||
                ((elementLine[0] !== ElementsEnum.Demon && elementLine[1] !== ElementsEnum.Demon) ||
                    (elementLine[3] !== ElementsEnum.Demon && elementLine[4] !== ElementsEnum.Demon))) {
                result.elementType = ElementsEnum.Demon;
                result.rewardType = 0;
                result.linkNum = 3;

                elementLine.forEach((e, index) => {
                    result.linkIds[index] = e === ElementsEnum.Demon;
                })
            }
        }
    }

    /**
     * 计算南瓜开奖
     * @param elementLine
     * @param elementResult
     * @param result
     * @private
     */
    private calculatePumpkinLine(elementLine: ElementsEnum[],
                                 elementResult: { element: ElementsEnum, count: number },
                                 result: LineResult) {
        if (elementResult.count === 5) {
            result.elementType = ElementsEnum.Pumpkin;
            result.rewardType = 2;
            result.linkNum = 5;
        } else if (elementResult.count === 4 && elementLine[4] !== ElementsEnum.Pumpkin) {
            result.elementType = ElementsEnum.Pumpkin;
            result.rewardType = 1;
            result.linkNum = 4;
            result.linkIds[4] = false;
        } else if (elementLine[0] === ElementsEnum.Pumpkin &&
            elementLine[1] === ElementsEnum.Pumpkin &&
            elementLine[2] === ElementsEnum.Pumpkin) {
            result.elementType = ElementsEnum.Pumpkin;
            result.rewardType = 0;
            result.linkNum = 3;
            elementLine.forEach((e, index) => {
                result.linkIds[index] = e === ElementsEnum.Pumpkin;
            })
        }
    }
}

/**
 * 获取大于三个的元素
 * @param elements
 */
function getMoreThanThreeElement(elements: ElementsEnum[]): { element: ElementsEnum, count: number } {
    const counts: any = {};
    elements.forEach(e => {
        if (!counts[e]) counts[e] = 0;
        counts[e] += 1;
    });

    for (let key in counts) {
        if (counts[key] >= 3) return {
            element: key as ElementsEnum,
            count: counts[key],
        }
    }

    return null;
}

/**
 * 创建slot开奖
 * @param newer 是否是新玩家
 * @param roulette 轮盘
 */
export function crateSlotLottery(newer: boolean, roulette: '1' | '2' | '3'): Lottery {
    return new Lottery(newer, roulette);
}

/**
 * 游戏内部个控
 * @param recordCount 游戏次数
 * @param roulette 轮盘
 * @param winPercentage 输赢比
 * @param overallControl 游戏内总控 根据奖池决定
 */
export function personalInternalControl(recordCount: number,
                                        roulette: '1' | '2' | '3',
                                        winPercentage: number,
                                        overallControl: boolean): [boolean, boolean] {
    // 放奖期间和十局之前(可以重置)不触发个体调控
    if (!overallControl && recordCount >= 10) {
        // 使用第一个轮盘不使用调控
        if (roulette === '1') {
            return [false, false];
        }

        const rightValue: number = roulette === '2' ? 0.45 : 0.25;
        const leftValue: number = roulette == '2' ? 0.25 : 0.05;

        // 如果输赢比处于这个区间加大点调控
        if (leftValue < winPercentage && winPercentage < rightValue) {
            return [true, false];
        }

        // 如果输赢比比左值还低加大调控
        if (winPercentage <= leftValue) {
            return [false, true];
        }
    }

    return [false, false];
}

/**
 * 获取陶罐小游戏开奖结果
 */
export function getClayPotLotteryResult(): ClayPotGameElementType {
    const arr = [ClayPotGameElementType.Fifty, ClayPotGameElementType.SevenTyFive, ClayPotGameElementType.OneHundred,
        ClayPotGameElementType.OneHundred, ClayPotGameElementType.Bonus];
    return arr[random(0, 4)];
}

/**
 * 获取陶罐小游戏开奖结果
 */
export function getDiceLotteryResult(): number {
    const arr = [1, 2, 3, 4, 5, 6];
    return arr[random(0, 5)];
}

/**
 * 生成果园小游戏window
 */
export function genOrchardGameWindow() {
    const base = [OrchardGameElementType.None, OrchardGameElementType.Two, OrchardGameElementType.Five,
        OrchardGameElementType.Ten, OrchardGameElementType.Twenty, OrchardGameElementType.Fifty, OrchardGameElementType.OneHundred];

    const window: { type: OrchardGameElementType, open: boolean }[] = [];

    for (let i = 0; i < 5; i++) {
        window.push({type: base[random(0, 6)], open: false});
    }

    base.forEach(e => window.push({type: e, open: false}));

    return window;
}

/**
 * 获取陶罐小游戏开奖结果
 */
export function getTurntableLotteryResult(): number {
    const arr = [];
    for (let i = 1; i < 25; i++) {
        arr.push(i);
    }

    return arr[random(0, 23)];
}

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

// for (let i = 0; i < 100; i++) {
//     test();
// }

// 根据jackpots数组给出jackpotType
// function judgeJackPotType(jackpots) {
//     if (jackpots.length == 0) {
//         return null;
//     }
//     if (jackpots.includes('colossal')) {
//         return 'colossal';
//     } else if (jackpots.includes('monster')) {
//         return 'monster';
//     } else if (jackpots.includes('mega')) {
//         return 'mega';
//     } else {
//         return 'mini';
//     }
// }