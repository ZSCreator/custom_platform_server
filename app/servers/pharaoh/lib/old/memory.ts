'use strict';

//关卡
const pass = ['1', '2', '3'];
//赔率
const odds = ['0.15', '0.55', '0.95', '1.65', '3.55', '7.55', '10'];
//窗口记录
export const windowRecord = {};
pass.forEach(i => {
	windowRecord[i] = {};
	odds.forEach(j => {
		windowRecord[i][j] = {
			'1': [],     // 一个或两个界面
			'2': [],     // 三个界面
			'3': [],     // 四个及以上
		}
	})
});

export let record = {
	//roomId: {uid: {shovelNum, profit, record:[], littleGameJackpot, littleGame: {activation, diceResult, initMoney}, lastUse}}
};

export let vipRecord = {
	/*
		 viper: {roomId: {uid: {shovelNum, profit, record:[], littleGameJackpot, littleGame: {activation, diceResult, initMoney}, lastUse}}
		 */
};

//记录玩家的铲子数
export let shovelNum = {
		'system': {
			// roomId: {uid}
		},
		/*
         viper: {}
         */
};

export let littleGame = {};