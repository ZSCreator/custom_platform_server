import { exp, number } from "mathjs";
import { award } from "./config/award";
import { elementType } from "./config/elementType";
import { weights } from './config/weights';


const Constant = {
	// 元素类映射
	elementType: elementType,

	// 权重表
	weights: weights,

	// 中奖赔率表
	award: award,


	// 最大开奖倍数
	maxAward: 750,


};

//财神|元宝|鞭炮|扇子|灯笼|Bonus|WILD
// 元素类型
export type elementType = "A" | "B" | "C" | "D" | "E" | "H" | "W";

export const Points = [25, 50, 75, 100, 125, 150, 200, 300, 500];

// 大奖类型 none 为没有
export type prizeType = 'mega' | 'monster' | 'colossal' | 'mini' | 'none';

export default Constant;
// 基础下注 只能选择这里的下注
export const baseBetList = [100, 200, 400, 1000, 2000, 4000, 10000];


// 最大奖励倍数
export const maxAward = 750;
