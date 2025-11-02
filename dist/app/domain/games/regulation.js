'use strict';
const util = require("../../utils");
module.exports = {
    selectRoulette(cur) {
        let temp = Math.random();
        if (temp < 0.1) {
            return '1';
        }
        else if (temp < 0.2) {
            return '2';
        }
        else if (temp < 0.3) {
            return '3';
        }
        else if (temp < 0.4) {
            return '2';
        }
        else if (temp < 0.5) {
            return '3';
        }
        else if (temp < 0.6) {
            return '2';
        }
        else if (temp < 0.7) {
            return '1';
        }
        else if (temp < 0.8) {
            return '2';
        }
        else if (temp < 0.9) {
            return '3';
        }
        else {
            return '2';
        }
    },
    intoJackpot: {
        'jackpot': 0,
        'runningPool': 0.95,
        'profitPool': 0.05,
    },
    wholeRegulation(jackpot, runningPool) {
        if (jackpot + runningPool < 0) {
            return true;
        }
        return false;
    },
    awardRegulation({ roomId, viper, jackpot, roomUserLens }, envRoomAward) {
        const awardEnv = () => {
            if (envRoomAward[viper] == null) {
                envRoomAward[viper] = {};
            }
            if (envRoomAward[viper][roomId] == null) {
                envRoomAward[viper][roomId] = {
                    lastTime: 0,
                    awardState: false,
                    readyAwardTime: 0,
                    readyAward: false,
                    jackpotBaseLine: null,
                    initJackpot: null,
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
        return [envAward, false];
    },
    individualRegulation({ aR = null, curRoulette, userEnvRecord, totalBet = null }, gname) {
        if (!aR && userEnvRecord.record.length >= 10) {
            switch (gname) {
                case '777':
                case 'xiyouji':
                    if (curRoulette == '1') {
                        return [false, false];
                    }
                    break;
            }
            const args = () => {
                if (gname === '777') {
                    return [0.9, [0.75, 0.45, 0.25], [0.55, 0.25, 0.05]];
                }
                else if (gname === 'hamburger') {
                    return [0.85, [0.85, 0.65, 0.25], [0.65, 0.45, 0.05]];
                }
                else if (gname === 'xiyouji') {
                    return [0.85, [0.75, 0.55, 0.25], [0.55, 0.35, 0.05]];
                }
                else if (gname === 'indiana') {
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
                }
                else if (indiRate < argvs[2]) {
                    return [false, true];
                }
                else {
                    return [false, false];
                }
            }
            const gt = curRoulette == '1' ? argvs[1][0] : curRoulette == '2' ? argvs[1][1] : argvs[1][2];
            const lt = curRoulette == '1' ? argvs[2][0] : curRoulette == '2' ? argvs[2][1] : argvs[2][2];
            if (indiRate < gt && indiRate > lt) {
                return [true, false];
            }
            else if (indiRate <= lt) {
                return [false, true];
            }
        }
        return [false, false];
    },
    bonusRegulation(curJackpot, totalBet, bonusControl) {
        let bonusNum;
        if (curJackpot < totalBet * 7.5) {
            bonusNum = 'void';
        }
        else if (curJackpot > 0 && curJackpot <= 100000) {
            bonusNum = util.selectEle(bonusControl['1']);
        }
        else if (curJackpot > 100000 && curJackpot <= 1000000) {
            bonusNum = util.selectEle(bonusControl['2']);
        }
        else if (curJackpot > 1000000 && curJackpot <= 10000000) {
            bonusNum = util.selectEle(bonusControl['3']);
        }
        else if (curJackpot > 10000000) {
            bonusNum = util.selectEle(bonusControl['4']);
        }
        else {
            bonusNum = 'void';
        }
        if (bonusNum != 'void') {
            bonusNum = Number(bonusNum);
            return [true, bonusNum];
        }
        return [false, 0];
    },
    freeNum() {
        return 1;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVndWxhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9kb21haW4vZ2FtZXMvcmVndWxhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFFYixvQ0FBcUM7QUFFckMsaUJBQVM7SUFNUixjQUFjLENBQUMsR0FBRztRQUNqQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDekIsSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFO1lBQ2YsT0FBTyxHQUFHLENBQUM7U0FDWDthQUFNLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRTtZQUN0QixPQUFPLEdBQUcsQ0FBQztTQUNYO2FBQU0sSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFO1lBQ3RCLE9BQU8sR0FBRyxDQUFDO1NBQ1g7YUFBTSxJQUFJLElBQUksR0FBRyxHQUFHLEVBQUU7WUFDdEIsT0FBTyxHQUFHLENBQUM7U0FDWDthQUFNLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRTtZQUN0QixPQUFPLEdBQUcsQ0FBQztTQUNYO2FBQU0sSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFO1lBQ3RCLE9BQU8sR0FBRyxDQUFDO1NBQ1g7YUFBTSxJQUFJLElBQUksR0FBRyxHQUFHLEVBQUU7WUFDdEIsT0FBTyxHQUFHLENBQUM7U0FDWDthQUFNLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRTtZQUN0QixPQUFPLEdBQUcsQ0FBQztTQUNYO2FBQU0sSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFO1lBQ3RCLE9BQU8sR0FBRyxDQUFDO1NBQ1g7YUFBTTtZQUNOLE9BQU8sR0FBRyxDQUFDO1NBQ1g7SUFDRixDQUFDO0lBR0QsV0FBVyxFQUFFO1FBQ1osU0FBUyxFQUFFLENBQUM7UUFDWixhQUFhLEVBQUUsSUFBSTtRQUNuQixZQUFZLEVBQUUsSUFBSTtLQUNsQjtJQUdELGVBQWUsQ0FBQyxPQUFPLEVBQUUsV0FBVztRQUNuQyxJ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