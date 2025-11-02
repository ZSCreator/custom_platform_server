'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSicBoRecord = exports.addSicBoRecord = exports.getDragonTigerRound = exports.udtDragonTigerRound = exports.getDragonTigerRecord = exports.addDragonTigerRecord = exports.addAnnexationRechargeMoney = void 0;
const util = require("../../index");
const databaseService = require("../../../services/databaseService");
let redisClient;
const addAnnexationRechargeMoney = async (num) => {
    num = util.Int(num);
    redisClient = await databaseService.getRedisClient();
    return redisClient.incrby('annexation:recharge:money', num);
};
exports.addAnnexationRechargeMoney = addAnnexationRechargeMoney;
const addDragonTigerRecord = async ({ env, roomId, lotteryResult, properties, winAreas, userWin, roundNum }) => {
    redisClient = await databaseService.getRedisClient();
    return redisClient.lpush(`dragon_tiger:record:${env}:${roomId}:${roundNum}`, JSON.stringify({
        lotteryResult, properties, winAreas, userWin
    }));
};
exports.addDragonTigerRecord = addDragonTigerRecord;
const getDragonTigerRecord = async ({ roundNum, env, roomId }, start, stop) => {
    start = start || 0;
    stop = stop || 250;
    redisClient = await databaseService.getRedisClient();
    return redisClient.lrange(`dragon_tiger:record:${env}:${roomId}:${roundNum}`, start, stop).then(records => {
        if (util.isVoid(records)) {
            return Promise.resolve([]);
        }
        return Promise.resolve(records.map(record => JSON.parse(record)));
    });
};
exports.getDragonTigerRecord = getDragonTigerRecord;
const udtDragonTigerRound = async ({ roundNum, env, roomId, usedCards, cards }) => {
    redisClient = await databaseService.getRedisClient();
    return redisClient.hset(`dragon_tiger:round:${env}:${roomId}`, roundNum, JSON.stringify({ usedCards, cards }));
};
exports.udtDragonTigerRound = udtDragonTigerRound;
const getDragonTigerRound = async ({ env, roomId }) => {
    redisClient = await databaseService.getRedisClient();
    return redisClient.hkeys(`dragon_tiger:round:${env}:${roomId}`).then(keys => {
        if (util.isVoid(keys)) {
            return Promise.resolve([]);
        }
        return Promise.resolve(keys);
    });
};
exports.getDragonTigerRound = getDragonTigerRound;
const addSicBoRecord = async ({ env, roomId, lotteryResult, winAreas, userWin }) => {
    const date = util.dateKey();
    redisClient = await databaseService.getRedisClient();
    return redisClient.lpush(`SicBo:record:${env}:${roomId}:${date}`, JSON.stringify({
        lotteryResult, winAreas, userWin
    }));
};
exports.addSicBoRecord = addSicBoRecord;
const getSicBoRecord = async ({ env, roomId }, start, stop) => {
    start = start || 0;
    stop = stop || 250;
    const date = util.dateKey();
    redisClient = await databaseService.getRedisClient();
    return redisClient.lrange(`SicBo:record:${env}:${roomId}:${date}`, start, stop).then(records => {
        if (util.isVoid(records)) {
            return Promise.resolve([]);
        }
        return Promise.resolve(records.map(record => JSON.parse(record)));
    });
};
exports.getSicBoRecord = getSicBoRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Vuc3VzTWdyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3V0aWxzL2RiL2RiTWdyL2NlbnN1c01nci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLG9DQUFxQztBQUNyQyxxRUFBc0U7QUFHdEUsSUFBSSxXQUFXLENBQUM7QUFNVCxNQUFNLDBCQUEwQixHQUFHLEtBQUssRUFBQyxHQUFHLEVBQUMsRUFBRTtJQUNsRCxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQixXQUFXLEdBQUcsTUFBTSxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDckQsT0FBTyxXQUFXLENBQUMsTUFBTSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2hFLENBQUMsQ0FBQztBQUpXLFFBQUEsMEJBQTBCLDhCQUlyQztBQU1LLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRTtJQUNsSCxXQUFXLEdBQUcsTUFBTSxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDckQsT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLHVCQUF1QixHQUFHLElBQUksTUFBTSxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDeEYsYUFBYSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTztLQUMvQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUMsQ0FBQztBQUxXLFFBQUEsb0JBQW9CLHdCQUsvQjtBQU1LLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDakYs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