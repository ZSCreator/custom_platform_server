
const Constant = {
	// 最大开奖倍数
	maxAward: 750,
};
/**赔率 */
export const odds = {
	'4': 3,
	"5": 35,
	"6": 88,
};
export default Constant;
/**幸运卡片配置 */
export const XingYunKaPConfig = [
	{ group: 1, weight: 35 },
	{ group: 2, weight: 30 },
	{ group: 3, weight: 10 },
	{ group: 4, weight: 5 },
	{ group: 0, weight: 20 },
]

export const XingYunKaPConfig2 = [
	{
		group: [
			{ group: 2, weight: 80 },
			{ group: 5, weight: 19 },
			{ group: 10, weight: 1 }
		],
		weight: 80
	},
	{
		group: [
			{ group: 2, weight: 80 },
			{ group: 5, weight: 19 },
			{ group: 50, weight: 1 }
		], weight: 14
	},
	{
		group: [
			{ group: 2, weight: 80 },
			{ group: 10, weight: 19 },
			{ group: 50, weight: 1 }
		], weight: 5
	},
	{
		group: [
			{ group: 5, weight: 80 },
			{ group: 10, weight: 19 },
			{ group: 50, weight: 1 }
		], weight: 1
	},
]

// 最大奖励倍数
export const maxAward = 750;
