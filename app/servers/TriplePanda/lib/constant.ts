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


// 元素类型
export type elementType = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "W";

// 大奖类型 none 为没有
export type prizeType = 'mega' | 'monster' | 'colossal' | 'mini' | 'none';

export default Constant;
// 基础下注 只能选择这里的下注
export const baseBetList = [20, 40, 100, 400, 1000,2000,4000];
/**
 * 类型映射名字
 */
export const type = {
	'A': { name: '一根竹子' },
	'B': { name: '二根竹子' },
	'C': { name: '三根竹子' },
	'D': { name: '橙子' },
	'E': { name: '茶壶' },
	'F': { name: '鱼' },
	'G': { name: '熊' },
	'H': { name: '熊猫' },
};

// 最大奖励倍数
export const maxAward = 750;
