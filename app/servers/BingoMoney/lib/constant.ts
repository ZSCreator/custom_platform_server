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
	column: 5,


	// 最大开奖倍数
	maxAward: 750,

	// 总体调控配置
	overallControlSetting: {
		'1': -30,   //第一轮盘W权重 - 21.7
		'2': -8,
		'3': 0,
	},

	// 免费开奖次数映射
	freeSpinMapping: {
		'3': 5,
		'4': 10,
		'5': 20,
	},

	// 单体调控配置
	singleControlSetting: {
		'1': [0, 0],
		// '2': [6, 8],
		// '3': [9, 14],
		'2': [2, 8],
		'3': [3, 14],
	},
};


// 元素类型
export type elementType = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "W";

// 大奖类型 none 为没有
export type prizeType = 'mega' | 'monster' | 'colossal' | 'mini' | 'none';

export default Constant;

/**
 * 类型映射名字
 */
export const type = {
	'A': { name: '宝箱' },
	'B': { name: '金砖' },
	'C': { name: '树' },
	'D': { name: '老虎机' },
	'E': { name: '钻石' },
	'F': { name: '皇冠' },
	'G': { name: '钞票' },
	'H': { name: '猪' },
	'I': { name: '草' },
	'W': { name: '保险箱' },
	// 'W': {name:'WILD'},
};

// 最大奖励倍数
export const maxAward = 750;
