'use strict';

import util = require('../../utils');

export = {

	/**
	 * 选择游戏轮盘
	 * @parama cur -上一局使用的轮盘
	 */
	selectRoulette(cur) {
		let temp = Math.random();
		if (temp < 0.1) {
			return '1';
		} else if (temp < 0.2) {
			return '2';
		} else if (temp < 0.3) {
			return '3';
		} else if (temp < 0.4) {
			return '2';
		} else if (temp < 0.5) {
			return '3';
		} else if (temp < 0.6) {
			return '2';
		} else if (temp < 0.7) {
			return '1';
		} else if (temp < 0.8) {
			return '2';
		} else if (temp < 0.9) {
			return '3';
		} else {
			return '2';
		}
	},

	// 玩家押注进入奖池的比例
	intoJackpot: {
		'jackpot': 0,
		'runningPool': 0.95,
		'profitPool': 0.05,
	},

	//整体调控
	wholeRegulation(jackpot, runningPool) {
		if (jackpot + runningPool < 0) {
			return true;
		}
		return false;
	},

	//放奖调控
	awardRegulation({  roomId, viper, jackpot, roomUserLens }, envRoomAward) {
		const awardEnv = () => {
			if (envRoomAward[viper] == null) {
				envRoomAward[viper] = {};
			}
			if (envRoomAward[viper][roomId] == null) {
				envRoomAward[viper][roomId] = {
					lastTime: 0,            //上次放奖结束时间
					awardState: false,      //是否处于放奖状态
					readyAwardTime: 0,      //准备放奖时间
					readyAward: false,      //准备放奖
					jackpotBaseLine: null,  //停止放奖线
					initJackpot: null,      //初始奖池
				};
			}
			return envRoomAward[viper][roomId];

		};

		const envAward = awardEnv();
		let { lastTime, awardState, jackpotBaseLine, readyAwardTime, readyAward, initJackpot } = envAward;
		if (jackpotBaseLine == null) {
			envAward.jackpotBaseLine = jackpot;
			jackpotBaseLine = jackpot;
		}
		if (initJackpot == null) {
			envAward.initJackpot = jackpotBaseLine;
		}
		/*
		if(awardState ){   //放奖阶段 直接放奖
			return [envAward, true];
		}else{
			if(Date.now() > readyAwardTime && readyAward){
				envAward.awardState = true;
				return [envAward, true];
			}else{
				if((jackpot - jackpotBaseLine) > jackpotBaseLine * 0.001 && (Date.now() - lastTime) > 60 * 1000){
					envAward.readyAwardTime = Date.now() + util.random(5*1000, 300*1000);
					envAward.readyAward = true;
					envAward.jackpotBaseLine += (jackpot - jackpotBaseLine) * 0.1;
					console.log('*******准备放奖时间******', new Date(envAward.readyAwardTime));
				}else if((Date.now() - lastTime) > 5 * 60 * 1000
					&& (Date.now() - lastTime) < 15 * 60 * 1000
						&& (jackpot - envAward.initJackpot) > 100 * roomUserLens
				){
					envAward.readyAwardTime = Date.now() + util.random(5*1000, 300*1000);
					envAward.readyAward = true;
					envAward.jackpotBaseLine += (jackpot - jackpotBaseLine) * 0.1;
					console.log('*******准备放奖时间******', new Date(envAward.readyAwardTime));
				}
			}
		}
		*/
		return [envAward, false];
	},

	//个体调控
	individualRegulation({ aR = null, curRoulette, userEnvRecord, totalBet = null }, gname) {
		// 放奖期间和十局之前(可以重置)不触发个体调控
		if (!aR && userEnvRecord.record.length >= 10) {
			switch (gname) {
				case '777': case 'xiyouji':
					if (curRoulette == '1') {   //777、西游记第一轮盘不做个体调控
						return [false, false];
					}
					break;

			}
			const args = () => {
				if (gname === '777') {
					return [0.9, [0.75, 0.45, 0.25], [0.55, 0.25, 0.05]];
				} else if (gname === 'hamburger') {
					return [0.85, [0.85, 0.65, 0.25], [0.65, 0.45, 0.05]];
				} else if (gname === 'xiyouji') {
					return [0.85, [0.75, 0.55, 0.25], [0.55, 0.35, 0.05]];
				} else if (gname === 'indiana') {
					return [0.6, 0.35, 0.15];
				}
			};
			const argvs = args();
			const indiRate = userEnvRecord.totalBet == 0 ? 0 : Number((userEnvRecord.totalWin / userEnvRecord.totalBet).toFixed(5));
			if (indiRate > argvs[0] || userEnvRecord.bet != totalBet) {
				userEnvRecord.record = [];
				userEnvRecord.totalBet = 0;
				userEnvRecord.totalWin = 0;
			}
			if (gname === 'indiana') {
				if (indiRate < argvs[1] && indiRate > argvs[2]) {
					return [true, false];
				} else if (indiRate < argvs[2]) {
					return [false, true];
				} else {
					return [false, false];
				}
			}
			const gt = curRoulette == '1' ? argvs[1][0] : curRoulette == '2' ? argvs[1][1] : argvs[1][2];
			const lt = curRoulette == '1' ? argvs[2][0] : curRoulette == '2' ? argvs[2][1] : argvs[2][2];
			if (indiRate < gt && indiRate > lt) {
				return [true, false];
			} else if (indiRate <= lt) {
				return [false, true];
			}
		}
		return [false, false];
	},

	/**
	 * 夺宝游戏bonus调控
	 * @return 是否bonus开奖 若是,还需返回bonus个数
	 */
	bonusRegulation(curJackpot, totalBet, bonusControl) {

		let bonusNum;
		if (curJackpot < totalBet * 7.5) {
			bonusNum = 'void';
		} else if (curJackpot > 0 && curJackpot <= 100000) {
			bonusNum = util.selectEle(bonusControl['1']);
		} else if (curJackpot > 100000 && curJackpot <= 1000000) {
			bonusNum = util.selectEle(bonusControl['2']);
		} else if (curJackpot > 1000000 && curJackpot <= 10000000) {
			bonusNum = util.selectEle(bonusControl['3']);
		} else if (curJackpot > 10000000) {
			bonusNum = util.selectEle(bonusControl['4']);
		} else {
			bonusNum = 'void';
		}
		if (bonusNum != 'void') {
			bonusNum = Number(bonusNum);
			return [true, bonusNum];
		}
		return [false, 0];
	},

	/**
	 * 太空夺宝 个体调控freespin个数
	 */
	freeNum() {
		return 1;
	}

};