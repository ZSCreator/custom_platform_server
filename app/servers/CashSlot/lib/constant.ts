import { award } from "./config/award";
import { winLines } from "./config/winLines";
import { elementType } from "./config/elementType";
import { weights } from './config/weights';


const Constant = {
	// 中奖线
	winLines: winLines,

	// 元素类映射
	elementType: elementType,

	// 权重表
	weights: weights,

	// 中奖赔率表
	award: award,

	// 行数
	row: 3,

	// 列数
	column: 3,


	// 最大开奖倍数
	maxAward: 750,

	// 总体调控配置
	overallControlSetting: {
		'1': -30,   //第一轮盘W权重 - 21.7
		'2': -8,
		'3': 0,
	},

	// 免费开奖次数映射
	freeSpinMapping: 9,

	// 单体调控配置
	singleControlSetting: {
		'1': [0, 0],
		'2': [2, 8],
		'3': [3, 14],
	},
};

/**
 * 免费摇奖的结果
 * @property window 窗口
 * @property totalWin 盈利
 * @property winLines 中奖线
 */
export interface FreeSpinResult {
	group?: number;
	odds?: number,
	// window: elementType[][],
	totalWin?: number,
	// winLines: WinLine[],
}

// 元素类型
export type elementType = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "bonus";

// 大奖类型 none 为没有
export type prizeType = 'mega' | 'monster' | 'colossal' | 'mini' | 'none';

export default Constant;

// 最大奖励倍数
export const maxAward = 750;

export const weightsConfig = [
	{
		group: [
			{ group: 1, weight: 20 },
			{ group: 2, weight: 10 },
		]
	},
	{
		group: [
			{ group: 1, weight: 20 },
			{ group: 2, weight: 10 },
		]
	},
	{
		group: [
			{ group: 1, weight: 20 },
			{ group: 2, weight: 10 },
		]
	},
]
export const bonusGame = [
	// group 对应 幸运转盘奖金	x5	x10	x50	x100	x200	x500	mini	mini	mini	minor	minor	Grand
	{ group: 1, weight: 300, name: "x5", value: 5 },
	{ group: 2, weight: 10, name: "x10", value: 10 },
	{ group: 3, weight: 10, name: "x50", value: 50 },
	{ group: 4, weight: 10, name: "x100", value: 100 },
	{ group: 5, weight: 10, name: "x200", value: 200 },
	{ group: 6, weight: 10, name: "x500", value: 500 },

	{ group: 7, weight: 0, name: "mini", value: 0 },
	{ group: 8, weight: 0, name: "mini", value: 0 },
	{ group: 9, weight: 0, name: "mini", value: 0 },

	{ group: 10, weight: 0, name: "minor", value: 0 },
	{ group: 11, weight: 0, name: "minor", value: 0 },

	{ group: 12, weight: 0, name: "Grand", value: 0 },
]