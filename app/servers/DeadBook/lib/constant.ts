import {award} from "./config/award";
import {winLines} from "./config/winLines";
import {elementType} from "./config/elementType";
import {weights} from './config/weights';


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

	// scatter元素
	wild: 'W',

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
	}
};

// 特殊元素
export const specialElements = ['A', 'B', 'C', 'D'];

// 基础元素
export const baseElements = ['A', 'B', 'C', 'D', "E" , "F" , "G" , "H" , "I"];

// 特殊元素奖励
export const specialAward = {
	'3': 2,
	'4': 20,
	'5': 200,
}

/**
 * 玩家游戏状态
 */
export enum PlayerGameState {
	// 正常游戏状态
	NORMAL ,
	// 博一博状态
	BO
}

// 博一博次数
export const BoTimes = 5;

// 黑、红、梅
export enum ColorType {
	// 黑桃
	Spade = 0,
	// 红桃
	Heart = 1,
	// 梅花
	Club = 2,
	// 方块
	Diamond = 3,
	// 黑桃
	Black = 22,
	// 红桃
	Red = 11,
}

// 元素类型
export type elementType = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "W";

export default Constant;

/**
 * 类型映射名字
 */
export const type = {
	'A': {name:'探险家'},
	'B': {name:'法老'},
	'C': {name:'阿努比斯'},
	'D': {name:'贝努'},
	'E': {name:'A'},
	'F': {name:'K'},
	'G': {name:'Q'},
	'H': {name:'J'},
	'I': {name:'10'},
	'W': {name:'WILD'},
};

// 默认选线
export const defaultLineNum = 10;
