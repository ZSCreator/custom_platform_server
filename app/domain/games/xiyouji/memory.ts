'use strict';

export = {
	
	'record': {
		//uid: {bet, totalWin, totalBet, record:[]}
	},
	'vipRecord': {
		//uid: {bet, totalWin, totalBet, record:[]}
	},
	'system':{
		countQ: {
			// roomId: {uid: 0}
		},
		scatter: {
			// roomId: {bet: {uid: []}}
		},
		littleGame: {
			// roomId: {uid: 0}
		},
	},
	'vip': {
      /*
       countQ: {
       // roomId: {uid: 0}
       },
       scatter: {
       // roomId: {bet: {uid: []}}
       },
       littleGame: {
       // roomId: {uid: 0}
       },
       */
	},
//放奖控制
	awardRegulation: {
		'system':{},
		'vip':{}
	}
};