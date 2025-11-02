// 玩家信息数据库模型存取层
import Redlock = require('redlock');
import { pinus } from "pinus";
import HallConst = require('../../consts/hallConst');
import LogConst = require('../../consts/logConst');
import DatabaseConst = require('../../consts/databaseConst');
import { PlayerInfo } from '../pojo/entity/PlayerInfo';
import RedisManager = require('./redis/lib/redisManager');
import RedisLuaManager = require('./redis/lib/redisLuaManager');
import MongoManager = require('./mongoDB/lib/mongoManager');
import BufferUtil = require('../../utils/bufferUtil');
import Utils = require('../../utils/general/index');
import LogService = require('../../services/common/logService');
import { getLogger } from "pinus-logger";
import { RoleEnum } from '../constant/player/RoleEnum';
const Logger = getLogger('server_out', __filename);


/**玩家表名 */
const playerTableName = 'player_info';
/**真实玩家缓存key前缀 */
const REAL_PLAYER_BUFFER_PREFIX = `real_${playerTableName}:`;
/**机器人玩家缓存key前缀 */
const ROBOT_PLAYER_BUFFER_PREFIX = `robot_${playerTableName}:`;
/**所有真实玩家缓存key的正则模式 */
const ALL_REAL_PLAYER_BUFFER_KEY_PATTERN = `${REAL_PLAYER_BUFFER_PREFIX}*`;
/**所有玩家缓存key的正则模式 */
const ALL_PLAYER_BUFFER_KEY_PATTERN = `*_${playerTableName}:*`;
/**玩家表模型 */
const PLAYER_INFO_DAO = MongoManager[playerTableName];

/**重启的时候：初始化所有玩家的一些状态字段 */
export const resetAllPlayers = async () => {
    console.warn(`--------------------  初始化玩家状态  --------------------`);
    // 把所有玩家的 异常离线字段、踢出房间字段、位置字段置为初始状态
    try {
        const where = { $or: [{ abnormalOffline: true }, { kickedOutRoom: true }, { position: { $ne: HallConst.PLAYER_POSITIONS.HALL } }] };
        const filterFunc = player => {
            return player.abnormalOffline || player.kickedOutRoom || player.position !== HallConst.PLAYER_POSITIONS.HALL;
        };
        await updateSomePlayer(where, filterFunc, {
            abnormalOffline: false,
            kickedOutRoom: false,
            position: HallConst.PLAYER_POSITIONS.HALL
        });
    } catch (error) {
        Logger.error('export const resetAllPlayers ==>', error);
    }
    return Promise.resolve();
};

// 随机生成一个 uid
function getUIDPromise(uidPrefix: number) {
    return new Promise(resolve => {
        let uid;
        // uidPrefix = uidPrefix.toString() ? uidPrefix : 1;
        // 根据自增的ID找到这个数据库 只要保证这个数据里面唯一即可
        const generateUID = () => {
            // uid = (uidPrefix + Utils.getNumStr(6) + Utils.randomFromRange(1, 9));
            uid = (Utils.getNumStr(8));
            PLAYER_INFO_DAO.findOne({ uid }, (error, user) => {
                return user ? generateUID() : resolve(uid);
            });
        };
        generateUID();
    });
}

/**创建账户信息 */
export const createPlayer = async function (createArgs: any) {
    let errorMessage = 'export const createPlayer ==>';
    try {
        const uidPrefix = null;
        // if (!createArgs.nickname) {
        //     createArgs.nickname = RobotNicknameService.getRandomNickname();
        // }
        createArgs.uid = await getUIDPromise(uidPrefix);
        createArgs.guestid = Utils.generateID();
        const player = new PlayerInfo(createArgs);
        await PLAYER_INFO_DAO.create(player);
        // 把玩家账户数据放入缓存
        await setPlayerIntoBuffer(player);
        return Promise.resolve(player);
    } catch (error) {
        errorMessage += '创建出错' + error;
        return Promise.reject(errorMessage)
    }
};

/**
 * 查找单个玩家信息:
 * @param: where, 如：{uid: ''}、{nickname: ''}等
 * needLock 是否需要加锁；
 * needCache 如果玩家不在缓存里的时候是否存入缓存，默认为 true
 * @return: {player, lock}，第一个参数是玩家信息、第二个参数是锁
 *
 * 注：如果是刚刚更改过的值，尚未更新到数据库，此时通过更改后的值来查找是找不到的
 * 如：通过后台更改玩家绑定的号码，此时立即通过该号码去登录时时找不到该号码对应的玩家的，因为此时更改后号码的信息只存在缓存中
 * 解决办法：再遍历一遍缓存，看缓存里是否有属性值满足条件的玩家信息
 * */
export async function getPlayer(where: { [key: string]: any }, needLock: boolean = false, needCache = true): Promise<{ player: PlayerInfo, lock: Redlock.Lock }> {
    let playerAndLock: { player: any, lock: Redlock.Lock } = { player: null, lock: null };

    try {
        let playerInfo;
        // 没有指定查询条件 where 的，返回 null
        if (!where) {
            return playerAndLock;
        }

        /***加锁情况一：有 uid 的时候已经根据 needLock 加过锁了**/
        if (where.uid) {
            // 如果条件里面有 uid，根据 uid 从缓存里面找
            playerAndLock = await getBufferPlayerAndLock(needLock, where.uid, where.isRobot);
        } else {
            // // 否则，遍历缓存里面的数据
            // const allPlayerBufferData = await RedisManager.getAllValuesSatisfyPattern(ALL_PLAYER_BUFFER_KEY_PATTERN);
            // playerInfo = BufferUtil.getObjMeetWhere(allPlayerBufferData, where);
            // // 如果遍历到了，且需要加锁，则先加锁再获取
            // /**加锁情况二：没有 uid 且玩家数据在缓存里的也根据 needLock 加过锁了**/
            // if (playerInfo && playerInfo.uid && needLock) {
            //     playerAndLock = await getBufferPlayerAndLock(needLock, playerInfo.uid, playerInfo.isRobot);
            // }
            const player = await PLAYER_INFO_DAO.findOne(where, 'uid isRobot', { lean: true });
            if (!player) {
                return playerAndLock;
            }
            playerAndLock = await getBufferPlayerAndLock(needLock, player.uid, player.isRobot);
        }


        // 缓存里面找到了就返回
        if (playerAndLock.player) {
            // callback && callback(playerAndLock);
            return playerAndLock;
        }

        // 如果根缓存里面没找到，再去数据库里翻一遍
        playerInfo = await PLAYER_INFO_DAO.findOne(where, '-_id -__v', { lean: true });

        // 如果数据库里面没找到，说明找不到了，直接返回
        if (!playerInfo) {
            // 有锁还需要释放掉
            await RedisManager.unlock(playerAndLock.lock);
            playerAndLock.lock = null;
            return playerAndLock;
        }

        // 数据库中找到了，因为根据 where 条件没找到，有可能是 where 里面的条件里面包含 {$in: []} 这种东西
        // 这个时候根据数据库找到的玩家的 uid，再去缓存里面翻一遍，看是不是真的不在缓存里
        /**加锁情况三：没有 uid 且没在缓存里的时候根据 needLock 加锁**/
        if (!where.uid) {
            playerAndLock = await getBufferPlayerAndLock(needLock, playerInfo.uid, playerInfo.isRobot);
        }

        // 若缓存里有这个玩家信息，最新的已经在 playerAndLock 中
        // 若缓存里没有这个玩家信息，根据 needCache 将值设置到 Redis 中，同时把值添加到 playerAndLock 中（此时已经加过锁）
        if (!playerAndLock.player) {
            needCache && await setPlayerIntoBuffer(playerInfo);
            playerAndLock.player = playerInfo;
        }

        // 如果最后的结果里面没有玩家信息，释放锁
        if (!playerAndLock.player && needLock) {
            playerAndLock.lock = null;
            await RedisManager.unlock(playerAndLock.lock);
        }

        return Promise.resolve(playerAndLock);
    } catch (error) {
        Logger.error('playerManager.getPlayer ==>获取玩家信息出错：', error);
        // 有锁需要释放
        await RedisManager.unlock(playerAndLock.lock);
        playerAndLock.lock = null;
        return playerAndLock;
    }
};

/**
 * 查找多个玩家信息（如果要做批量更新，不要调用这个方法去批量查找）:
 * @param: 参数格式：
 * where: Object，筛选条件，如：{uid: {$in: [...]}}
 * filterFunc: 筛选函数，因为还要筛选 Redis 中的
 * fields: String，期望获取的字段，如：'-_id nickname uid'
 * @return: Array, 返回找到的玩家数组。
 * */
export const findPlayerList = async (where, filterFunc?, fields?, callback?) => {
    const { matchPlayers } = await getMatchPlayerUIDDist(where, filterFunc, fields);
    callback && callback(matchPlayers);
    return matchPlayers;
};

/**
 * 随机选择给定数量的玩家:
 * aggregateCond: 聚合条件
 * filterFunc: 缓存筛选条件
 * fields：String，期望获取的字段，如：'-_id nickname uid'
 * num：期望的玩家个数
 * @return: Array, 返回找到的玩家数组。
 * */
export const randomChoseMatchPlayers = async (aggregateCond, filterFunc, fields, num) => {
    // 满足条件的结果
    const matchedPlayers = [];
    try {
        // num 个名额平均分配至缓存和数据库
        let fromBuffer = Utils.randomFromRange(0, num);
        let fromDB = num - fromBuffer;
        // 缓存里的所有玩家
        const bufferPlayers = await getAllBufferPlayer();
        // 缓存中筛选出来的所有满足条件的玩家

        const bufferMatchPlayer = filterFunc ? bufferPlayers.filter(filterFunc) : [...bufferPlayers];
        // 如果缓存中不足 fromBuffer 个，全部选择，不足的从DB中多选几个
        if (bufferMatchPlayer.length < fromBuffer) {
            fromDB += (fromBuffer - bufferMatchPlayer.length);
        }

        // 从数据库中随机选择 fromDB 个
        // 先重新构造 aggregate 条件，在缓存中的全都不选择，且只选择 fromDB 个
        if (fromDB) {
            const bufferUID = bufferPlayers.map(player => player.uid);
            // 除去缓存中的 uid
            let index = aggregateCond.findIndex(ele => ele['$match'] !== undefined);
            if (index < 0) {
                aggregateCond.push({ '$match': { uid: { $nin: bufferUID } } });
            } else {
                const matchCond = aggregateCond[index];
                let matchUIDCond = matchCond['$match']['uid'];
                if (!matchUIDCond) {
                    matchCond['$match']['uid'] = { $nin: bufferUID };
                } else {
                    if (matchUIDCond['$nin']) {
                        matchUIDCond['$nin'].push(...bufferUID);
                        matchUIDCond['$nin'] = Array.from(new Set(matchUIDCond['$nin']));
                    } else {
                        matchUIDCond['$nin'] = bufferUID;
                    }
                }
            }
            aggregateCond.push({ $sample: { size: fromDB } });
            const dbMatchedPlayers = await PLAYER_INFO_DAO.aggregate(aggregateCond);
            matchedPlayers.push(...dbMatchedPlayers);
            /**
             * 有一种情况：如果数据库中大部分的玩家信息已在缓存，此时除去缓存的部分，数据库中满足条件的玩家个数可能已经不足 fromDB 个
             * 这个时候要看能否从缓存中再选择 fromDB - dbMatchedPlayers.length 个出来
             */
            if (matchedPlayers.length < fromDB) {
                fromBuffer += fromDB - dbMatchedPlayers.length;
            }
        }
        // 从 bufferMatchPlayer 中随机选择 fromBuffer 个放入 matchedPlayers
        matchedPlayers.push(...Utils.randomChoseFromArray(bufferMatchPlayer, fromBuffer));

        // 去掉不需要的字段
        const fieldsInArray = fields ? fields.split(' ') : null;
        return matchedPlayers.map(player => {
            fieldsInArray && deletePlayerAttrs(fieldsInArray, player);
            return player;
        });
    } catch (error) {
        Logger.error('export const randomChoseMatchPlayers ==>', error);
        return matchedPlayers;
    }
};



/**
 * 更新玩家信息，游戏中更新均调用该方法：
 * @param: uid: 玩家UID； isRobot判断是否机器人，updateAttrs修改对象，attr为KEY，value为对应值；
 * update为false直接修改原值，为true增加，如：gold=gold+value 可以传入多个对象，
 * 格式: [{"attr":"gold","value":1,"update":true},{"attr":"loginCount","value":1,"update":true}]
 * 注意：必带[]
 * @return: error
 * 注意：如果该玩家在缓存里面，则使用 pushSyncTaskForPlayer 来推送定时更新任务；否则
 *
 * 直接调用lua脚本根据bufferKey更新缓存数据，lua脚本具有原子性代替redis加锁功能
 *
 * */
export async function updateOnePlayerEx(uid: string, isRobot: number, updateAttrs: { attr: string, value: any, update: boolean }[], callback?) {
    let errorMessage = 'playerManager.updateOnePlayer ==>';
    try {
        // 更新之前记录一次传入的玩家信息需要更新的值
        LogService.UpdateAttrLog(LogConst.PLAYER_VALUE_TYPE.PARAM, uid, updateAttrs);
        if (!uid) {
            errorMessage += `玩家ID错误: ${uid}`;
            Logger.error(errorMessage);
            callback && callback('需要更新的玩家uid错误');
            return Promise.reject('需要更新的玩家uid错误');
        }
        const bufferKey = getBufferKey(uid, isRobot);
        // 没有要更新的属性
        if (!updateAttrs || !updateAttrs.length) {
            callback && callback(null);
            return Promise.resolve(null);
        }
        let bufferData = await getBufferPlayer(uid, isRobot, true);
        // 更新过后的玩家信息
        let updatedPlayer;
        if (bufferData) {
            let rs = await RedisLuaManager.luaRun('luaScript', bufferKey, JSON.stringify(updateAttrs));
            if (rs > 0) {
                updatedPlayer = await getBufferPlayer(uid, isRobot);
            }
        }
        // 更新过后的记录
        if (updatedPlayer) {
            LogService.UpdateAttrLog(LogConst.PLAYER_VALUE_TYPE.UPDATED, updatedPlayer, updateAttrs);
        }
        callback && callback(null);
        return Promise.resolve();
    } catch (error) {
        errorMessage += error;
        Logger.error(errorMessage, error);
        callback && callback('更新玩家信息出错');
        return Promise.reject('更新玩家信息出错');
    }
};

/**
 * 更新玩家信息，游戏中更新均调用该方法：
 * @param: player: 修改后的玩家信息对象； lock: 获取的时候一并加的锁对象； updateAttrs: Array，修改过的属性数组，如 ['uid', 'gold']
 * @return: error
 * 注意：如果该玩家在缓存里面，则使用 pushSyncTaskForPlayer 来推送定时更新任务；否则，
 * 直接调用 update 方法来更新，因为批量查找的时候有可能只获取部分数据（如只获取player的 uid 和 sid），对于这种数据不能放到缓存里
 *
 * 为什么更新玩家属性一定要加锁？
 * 假设有 A 和 B 两个人要更新 player，如果不加锁，或者 A 和 B 只有一个人加了锁，设初始值：{attA: 1, attB: 1}，
 * 若 A 要更新 attA的值为 2，B 要更新 attB的值为 2，可能的顺序是
 * A取到 {attA: 1, attB: 1} ==> A修改 {attA: 2, attB: 1}，尚未写入redis ==> B取到 {attA: 1, attB: 1} ==> A写入redis {attA: 2, attB: 1}
 * ==> B修改 {attA: 1, attB: 2}==> B 写入  {attA: 1, attB: 2}
 * 因此，为避免脏数据问题，必须加锁
 * */
export async function updateOnePlayer(player, updateAttrs: string[] = [], lock?) {
    let errorMessage = 'playerManager.updateOnePlayer ==>';
    try {
        // 更新之前记录一次传入的玩家信息需要更新的值
        LogService.UpdateAttrLog(LogConst.PLAYER_VALUE_TYPE.PARAM, player, updateAttrs);
        if (!player || !player.uid) {
            errorMessage += `需要更新的玩家信息错误: ${JSON.stringify(player)}`;
            Logger.error(errorMessage);
            return Promise.reject('需要更新的玩家信息错误');
        }
        const bufferKey = getBufferKey(player.uid, player.isRobot);
        // 看锁是不是合法的锁，注：机器人不验证锁是不是合法的
        if (player.isRobot !== RoleEnum.ROBOT && !(await RedisManager.isLockValid(lock, bufferKey))) {
            errorMessage += `锁不合法, 需要更新的玩家信息为: ${JSON.stringify(player)}`;
            Logger.error(errorMessage);
            return Promise.reject('锁不合法');
        }
        // 没有要更新的属性
        if (!updateAttrs || !updateAttrs.length) {
            return Promise.resolve(null);
        }
        let bufferData = await getBufferPlayer(player.uid, player.isRobot, true);
        const { needToStoreData, allUpdateAttrs, needAddTask } = BufferUtil.getNeedStoreBufferData(bufferData, player, updateAttrs);
        LogService.UpdateAttrLog(LogConst.PLAYER_VALUE_TYPE.TO_BE_UPDATE, needToStoreData, updateAttrs);
        // 更新过后的玩家信息
        let updatedPlayer;
        // 未在缓存里的直接更新数据库
        if (!bufferData) {
            const updateFiledObj = BufferUtil.getUpdateFiledObjFromArray(needToStoreData, allUpdateAttrs);
            // 返回更新过后的数据
            updatedPlayer = await updatePlayerInternal({ uid: player.uid }, updateFiledObj);
        } else {
            await setPlayerIntoBuffer(needToStoreData);

            // 更新完成之后，从缓存中取一次
            updatedPlayer = await getBufferPlayer(player.uid, needToStoreData.isRobot);
        }
        // 更新过后的记录
        if (updatedPlayer) {
            LogService.UpdateAttrLog(LogConst.PLAYER_VALUE_TYPE.UPDATED, updatedPlayer, updateAttrs);
        }
        // 有锁的时候要释放锁
        lock && await RedisManager.unlock(lock);
        lock = null;

        if (Object.prototype.toString.call(player.yesterdayPlayCommissionRatio) === HallConst.BASE_TYPE.OBJ) {
            Logger.error('恭喜你报错了');
            throw '恭喜你报错了'
        }

        return Promise.resolve();
    } catch (error) {
        errorMessage += error;
        Logger.error(errorMessage, error);
        // 有锁的时候要释放锁
        lock && await RedisManager.unlock(lock);
        console.log("更新玩家信息出错", error)
        return Promise.reject('更新玩家信息出错');
    } finally {
        await RedisManager.unlock(lock);
    }
};


/**把所有缓存里的玩家信息同步到数据库（只同步真实玩家的数据） */
export const updateAllBufferPlayerInstant = async () => {
    let errorMessage = 'export const updateAllBufferPlayerInstant ==>';
    try {
        // 所有真实玩家的数据
        const allRealPlayers = await getAllBufferPlayer(true);
        // 更新所有真实玩家的信息
        await Promise.all(allRealPlayers.map(player => {
            return player.uid ? updatePlayerInternal({ uid: player.uid }, player) : null;
        }));
        // 返回真实玩家的 uid
        return Promise.resolve(allRealPlayers.map(player => player.uid));
    } catch (error) {
        errorMessage += ' 更新出错:';
        Logger.error(errorMessage, error);
        return Promise.resolve(errorMessage);
    }
};

/**
 * 立即更新玩家信息到数据库
 * 注：
 * 1.该方法不会把更改修改到缓存，该方法只供 pomeloSync 模块调用
 * 2.更新玩家信息使用：PlayerManager.updateOnePlayer
 * */
async function updatePlayerInternal(where, updateFields) {
    try {
        // 返回更新后的玩家信息
        const updatedPlayer = await PLAYER_INFO_DAO.findOneAndUpdate(where, updateFields, {
            new: true,
            upsert: false,
            // lean: true,
            fields: '-_id'
        });
        return Promise.resolve(updatedPlayer)
    } catch (error) {
        let errorMessage = 'export const updatePlayerInternal ==> 更新玩家信息失败';
        Logger.error(errorMessage, error, `, 需要更新的值是：${JSON.stringify(updateFields)}`);
        return Promise.resolve(errorMessage)
    }
}

/**
 * 更新一些玩家的信息
 * @param:
 * where: 数据库筛选条件
 * filterFunc: 数组筛选方法 filter，如 player => player.isRobot === 1
 * updateFields: 只能是键值对象，不能有如 {$addToSet: {subPlayers: uid}} 这种值
 *
 * 如将所有isRobot为 1 的玩家的金币改为 {1:0,2:2000}，调用方式：
 *
 * export const updateSomePlayer(player => player.isRobot === 1, {gold: 0})
 * */
export async function updateSomePlayer(where, filterFunc, updateFields) {
    let errorMessage = 'playerManager.updateAllPlayer ==>';
    try {
        const { bufferUID, dbUID } = await getMatchPlayerUIDDist(where, filterFunc);
        if (!bufferUID.length && !dbUID.length) {
            return;
        }
        // 先更新所有数据库中的玩家的属性，数据库中的数据不需要加锁，即更新数据库中所有满足条件的玩家
        await PLAYER_INFO_DAO.updateOne({ uid: { $in: dbUID } }, updateFields, { multi: true });
        // 所有需要更新的属性的数组
        const attrKeys = Object.keys(updateFields);
        // 更新所有缓存中的玩家，需要先加锁再更新
        let playerAndLock;
        for (let uid of bufferUID) {
            playerAndLock = await getBufferPlayerAndLock(true, uid);
            if (!playerAndLock || !playerAndLock.player) {
                continue;
            }
            // 单个玩家更新出错不影响其他玩家
            try {
                // 先改变玩家的属性
                changePlayerAttrs(playerAndLock.player, updateFields, attrKeys);
                // 更新
                await updateOnePlayer(playerAndLock.player, attrKeys, playerAndLock.lock);
            } catch (error) {
                Logger.error(errorMessage + `uid: ${playerAndLock.player.uid} `, error);
                await RedisManager.unlock(playerAndLock.lock)
            }
        }
    } catch (error) {
        Logger.error(errorMessage, error);
        return Promise.reject(errorMessage + JSON.stringify(error));
    }
};

/**
 * 根据条件获取所有满足条件的玩家列表 和 满足条件的玩家中在缓存中的 uid 数组、在数据库中的玩家的 uid 数组
* 因为缓存里的是最新的：
* 1.数据库里满足条件的有，缓存中没有该玩家，选择数据库中查出来的；
* 2.数据库里满足条件的有，缓存中有该玩家，且缓存中该玩家也满足条件，选择缓存中满足条件的；
* 3.数据库里满足条件的有，缓存中有该玩家，但缓存中该玩家不满足条件，该玩家不满足条件；
* 4.缓存中某个玩家满足条件，但是数据库中的不满足，则选择缓存中该玩家信息
* 假如：
* 数据库里的所有满足条件的玩家：[A1, B1, C1]
* 缓存里的所有玩家: [B2, C2, D2, E2]
* 缓存中所有满足条件的玩家: [C2, D2, E2]
* 则最后的选择结果应该是：[A1, C2, D2, E2]
* 即，缓存中所有满足条件的都选择，再选择数据库中满足条件的，且不在缓存中的所有玩家
* */
async function getMatchPlayerUIDDist(where, filterFunc, fields?) {
    const matchPlayerAndBufferUID = { matchPlayers: [], bufferUID: [], dbUID: [] };
    try {
        // 数据库里的所有满足条件的玩家
        const dbMatchPlayers = await PLAYER_INFO_DAO.find(where, fields, { lean: true });
        // 缓存里的所有玩家
        const bufferPlayers = await getAllBufferPlayer();
        // 缓存中筛选出来的所有满足条件的玩家
        const bufferMatchPlayer = filterFunc ? bufferPlayers.filter(filterFunc) : [...bufferPlayers];
        // 缓存中所有满足条件的都选择，再选择数据库中满足条件的，且不在缓存中的所有玩家
        matchPlayerAndBufferUID.matchPlayers.push(...bufferMatchPlayer);
        matchPlayerAndBufferUID.bufferUID = bufferMatchPlayer.map(player => player.uid);
        dbMatchPlayers.forEach(player => {
            if (!Utils.getArrayMember(bufferPlayers, 'uid', player.uid)) {
                matchPlayerAndBufferUID.matchPlayers.push(player);
                matchPlayerAndBufferUID.dbUID.push(player.uid);
            }
        });
        // 替换完成之后，每个账户信息只保留想要的属性
        const fieldsInArray = fields ? fields.split(' ') : null;
        matchPlayerAndBufferUID.matchPlayers = matchPlayerAndBufferUID.matchPlayers.map(player => {
            fieldsInArray && deletePlayerAttrs(fieldsInArray, player);
            return player;
        });
    } catch (error) {
        Logger.error(pinus.app.getServerType(), 'playerManager.getMatchPlayerUIDDist ==>', error);
    }
    return Promise.resolve(matchPlayerAndBufferUID);
}

/**onlyReal 表示是否只要真实玩家，返回值：缓存中玩家的数据 */
export const getAllBufferPlayer = async (onlyReal?) => {
    try {
        // 缓存 key 的正则模式
        const keysPattern = onlyReal ? ALL_REAL_PLAYER_BUFFER_KEY_PATTERN : ALL_PLAYER_BUFFER_KEY_PATTERN;
        // 所有缓存中的数据
        const allPlayerBufferData = await RedisManager.getAllValuesSatisfyPattern(keysPattern);
        const playerList = allPlayerBufferData ? allPlayerBufferData.map(buffer => buffer.data) : [];
        return Promise.resolve(playerList);
    } catch (error) {
        Logger.error('export const getAllBufferPlayer ==>', error);
        return Promise.resolve([]);
    }
};

/**各个字段来单独处理 */
function changePlayerAttrs(player, updateFields, attrKeys) {
    // 所有需要更新的属性的数组
    for (let attr of attrKeys) {
        if (Object.prototype.toString.call(updateFields[attr]) === '[object Object]' && Utils.isNullOrUndefined(player[attr])) {
            player[attr] = {};
        } else {
            player[attr] = updateFields[attr];
        }
    }
}

/**获取缓存前缀 */
function getBufferKey(uid: string, isRobot: number) {
    return (isRobot === RoleEnum.ROBOT ? ROBOT_PLAYER_BUFFER_PREFIX : REAL_PLAYER_BUFFER_PREFIX) + uid;
}

/**从缓存中获取玩家信息，同时根据 needLock 来选择是否加锁 */
async function getBufferPlayerAndLock(needLock: boolean, uid: string, isRobot?: number) {
    const playerAndLock: { player: any, lock: Redlock.Lock } = { player: null, lock: null };
    if (!uid) {
        return Promise.resolve(playerAndLock);
    }
    try {
        // 需要加锁的时候要不停的重复加锁，最多加锁十次
        if (needLock) {
            playerAndLock.lock = await lockPlayer(uid, isRobot);
        }
        playerAndLock.player = await getBufferPlayer(uid, isRobot);
        return Promise.resolve(playerAndLock);
    } catch (error) {
        Logger.error('getPlayerFromBuffer ==>', error);
        return Promise.resolve(playerAndLock);
    }
}

/**给 player 加锁 */
export const lockPlayer = async (uid, isRobot) => {
    try {
        const bufferKey = getBufferKey(uid, isRobot);
        return Promise.resolve(await RedisManager.lock(bufferKey));
    } catch (error) {
        return Promise.reject(error);
    }
};


/**删除掉 player 中不需要的属性 */
function deletePlayerAttrs(fieldsInArray, player) {
    for (let attribute in player) {
        if (!fieldsInArray.includes(attribute)) {
            delete player[attribute];
        }
    }
}

/**从缓存中获取玩家信息，original 为 true 返回：{updateFields: [], data: {}}，否则返回缓存中的 bufferData.data */
async function getBufferPlayer(uid: string, isRobot: number, original?) {
    try {
        if (!uid) {
            return;
        }
        // 如果 isRobot 是 undefined 或 null，去两个范围里面都找一遍；否则只用从真实玩家或者机器人的范围找
        let bufferData = await RedisManager.getObjectFromRedis(getBufferKey(uid, isRobot));
        // isRobot 是 undefined 或 null，已经从真实玩家的范围找过了，再去机器人的范围找一遍
        if (Utils.isNullOrUndefined(isRobot) && !bufferData) {
            bufferData = await RedisManager.getObjectFromRedis(getBufferKey(uid, RoleEnum.ROBOT));
        }
        if (!bufferData) {
            return;
        }
        return original ? bufferData : bufferData.data;
    } catch (error) {
        Logger.error('getBufferPlayer ==>', error);
        return null;
    }
}

/**将 player 存入缓存 */
async function setPlayerIntoBuffer(player, updateFields: string[] = []) {
    try {
        if (!player || !player.uid) {
            Logger.error(`setPlayerIntoBuffer ==> player数据有误: ${player}`);
            return Promise.resolve();
        }
        const bufferKey = getBufferKey(player.uid, player.isRobot);
        // 将值设置到Redis中
        await RedisManager.setObjectIntoRedisHasExpiration(bufferKey, {
            updateFields,
            data: player
        }, DatabaseConst.BUFFER_EXPIRATION.ONE_HOUR);
        return Promise.resolve();
    } catch (error) {
        Logger.error(`setPlayerIntoBuffer ==> 玩家数据存入 redis 出错: `, error);
        return Promise.resolve();
    }
}

/**
 * 删除一个玩家
 * @param player
 */
export const deleteOnePlayer = async (player: { uid: string, isRobot: number }): Promise<boolean> => {
    try { // 先删除缓存
        await deleteCachePlayer(player);
        // 再删除数据库
        await PLAYER_INFO_DAO.deleteOne({ uid: player.uid });
        return true;
    } catch (e) {
        Logger.error(`deleteOnePlayer ==> error: ${JSON.stringify(e)}`);
        return false;
    }
};

/**
 * 删除缓存中的玩家
 * @param player
 */
async function deleteCachePlayer(player: { uid: string, isRobot: number }): Promise<void> {
    const key: string = getBufferKey(player.uid, player.isRobot);
    await RedisManager.deleteKeyFromRedis(key);
}