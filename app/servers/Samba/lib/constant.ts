

// 行数
export const ROW_NUM = 3;
// 列数
export const COLUMN_NUM = 5;

// 默认选线
export const DEFAULT_LINE_NUM = 15;
;

export enum ElementEnum {
	LEMON = 'A',
	ORANGE = "B",
	WATERMELON = 'C',
	PINEAPPLE = 'D',
	GREEN = 'E',
	BLUE = 'F',
	PINK = 'G',
	ANY_TWO = 'H',
	ANY_THREE = 'I',
	ANY_FOUR = 'J',
	ANY_FIVE = 'K',
	SAMBA = 'L'
}

// 百搭符号
export const anyList = [ElementEnum.ANY_FIVE, ElementEnum.ANY_FOUR, ElementEnum.ANY_THREE, ElementEnum.ANY_TWO];


/**
 * 玩家游戏状态
 */
export enum PlayerGameState {
	// 正常游戏状态
	NORMAL ,
	// 免费游戏状态
	FREE,
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
	// 黑色
	Black = 22,
	// 红色
	Red = 11,
}

/**
 * 类型映射名字
 */
export const type = {
	'A': {name:'柠檬'},
	'B': {name:'橘子'},
	'C': {name:'西瓜'},
	'D': {name:'菠萝'},
	'E': {name:'绿色桑巴女郎'},
	'F': {name:'蓝色桑巴女郎'},
	'G': {name:'粉色桑巴女郎'},
	'H': {name:'ANY*2'},
	'I': {name:'ANY*3'},
	'J': {name:'ANY*4'},
	'K': {name:'ANY*5'},
	'L': {name:'SAMBA'},
};

export const anyOddsMap = {
	[ElementEnum.ANY_TWO]: 2,
	[ElementEnum.ANY_THREE]: 3,
	[ElementEnum.ANY_FOUR]: 4,
	[ElementEnum.ANY_FIVE]: 5,
}