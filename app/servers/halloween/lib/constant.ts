import {award, awardRow} from "./config/award";
import {winLines} from "./config/winLines";
import {weights} from './config/weights';
import {ElementsEnum} from "./config/elemenets";


const Constant = {
	// 中奖线
	winLines: winLines,

	// 权重表
	weights: weights,

	// 中奖行赔率表
	award: award,
	// 中奖列赔率
	awardRow: awardRow,

	// 行数
	row: 3,

	// 列数
	column: 5,

	// 总体调控配置
	overallControlSetting: {
		'1': -30,   //第一轮盘W权重 - 21.7
		'2': -8,
		'3': 0,
	},

	// 单体调控配置
	singleControlSetting: {
		'1': [0, 0],
		'2': [2, 8],
		'3': [3, 14],
	},

	/**
	 * 小游戏元素
	 */
	littleGameElements: [
		ElementsEnum.Vampire,
		ElementsEnum.ClayPot,
		ElementsEnum.Witch,
		ElementsEnum.Wizard,
	]
};

// 小游戏类型
export type SubGameType = ElementsEnum.Vampire | ElementsEnum.ClayPot | ElementsEnum.Witch | ElementsEnum.Wizard;

/**
 * 陶罐小游戏
 */
export enum ClayPotGameElementType {
	Fifty = 50,
	SevenTyFive = 75,
	OneHundred = 100,
	OneHundredFifty = 150,
	Bonus = 2
}


// 所有的中奖线
export const AWARD_LINE_COUNT = 25;

// 骰子小游戏奖励
export const DICE_GAME_BONUS = 50;

// 转盘小游戏
export const TURNTABLE_BONUS = 70;

/**
 * 果园小游戏
 */
export enum OrchardGameElementType  {
	// 农夫
	None  = 0,
	Two = 2,
	Five = 5,
	Ten  = 10,
	Twenty  = 20,
	Fifty = 50,
	OneHundred = 100,
}

export default Constant;
