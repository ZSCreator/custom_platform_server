export enum ElementEnum {
	SEVEN = 'A',
	BAR = "B",
	BELL = 'C',
	LEMON = 'D',
	CHERRY = 'E',
	CA = 'F',
	CK = 'G',
	CQ = 'H',
	CJ = 'I',
	CTEN = 'K',
	WILD = 'W',
}

// 行数
export const ROW_NUM = 3;
// 列数
export const COLUMN_NUM = 5;
// 默认选线
export const DEFAULT_LINE_NUM = 10;

// 特殊元素
export const specialElements = [ElementEnum.SEVEN, ElementEnum.BAR, ElementEnum.BELL, ElementEnum.LEMON, ElementEnum.CHERRY];

/**
 * 类型映射名字
 */
export const type = {
	'A': {name:'7'},
	'B': {name:'BAR'},
	'C': {name:'铃铛'},
	'D': {name:'柠檬'},
	'E': {name:'樱桃'},
	'F': {name:'A'},
	'G': {name:'K'},
	'H': {name:'Q'},
	'I': {name:'J'},
	'K': {name:'10'},
	'W': {name:'WILD'},
};


