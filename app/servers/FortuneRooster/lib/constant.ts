import {award} from "./config/award";
import {winLines} from "./config/winLines";
import {weights} from './config/weights';


const Constant = {
	// 中奖线
	winLines: winLines,

	// 权重表
	weights: weights,

	// 中奖赔率表
	award: award,

	// 行数
	row: 3,

	// 列数
	column: 5,

	// 线的数量
	lineNum: 25,

	// scatter元素
	scatter: 'S',

	// wild元素
	wild: 'W',

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

	// 醒狮子
	lion: 'A',
	// 鱼
	fish: 'B',
	// 灯笼
	toad: 'C',
	// 蟾蜍
	lantern: 'D',
	// 爆竹
	firecrackers: 'E',
	A: 'F',
	K: 'G',
	Q: 'H',
	J: 'I',
	TEN: 'J',

	// 单体调控配置
	singleControlSetting: {
		'1': [0, 0],
		// '2': [6, 8],
		// '3': [9, 14],
		'2': [2, 8],
		'3': [3, 14],
	},

	// 是7的元素集合
	sevenElementGroup: ['G', 'H', 'I'],

	// bar的元素集合
	barElementGroup: ['D', 'E', 'F']
};

// 金鸡到元素
export const JIN_JI_DAO = 0;


// 元素类型
export type elementType = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" |"S" | "W";

// 大奖类型 none 为没有
export type prizeType = 'mega' | 'monster' | 'colossal' | 'mini' | 'none';

export default Constant;


/**
 * 类型映射名字
 */
export const type = {
	'A': {name:'醒狮'},
	'B': {name:'年年有鱼'},
	'C': {name:'蟾蜍'},
	'D': {name:'灯笼'},
	'E': {name:'爆竹'},
	'F': {name:'A'},
	'G': {name:'K'},
	'H': {name:'Q'},
	'I': {name:'J'},
	'J': {name:'10'},
	'S': {name:'SCATTER'},
	'W': {name:'WILD'},
};

// 最大奖励倍数
export const maxAward = 750;
