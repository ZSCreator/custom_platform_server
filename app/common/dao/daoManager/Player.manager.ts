import { Player } from "../mysql/entity/Player.entity";
import { PlayerInRedis } from "../redis/entity/player.entity";
import PlayerMysqlDao from "../mysql/Player.mysql.dao";
import PlayerRedisDao from "../redis/Player.redis.dao";
import OnlinePlayerDao from "../redis/OnlinePlayer.redis.dao";
import ConnectionManager from "../mysql/lib/connectionManager";
import { lock, unlock } from "../redis/lib/redisManager";


type Parameter<T> = { [P in keyof T]?: T[P] };
export class PlayerManager {

    async findList(parameter: Parameter<Player>): Promise<Player[] | PlayerInRedis[]> {
        try {
            const list = await PlayerMysqlDao.findList(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: Parameter<Player>, onlyMysql: boolean = false): Promise<Player | PlayerInRedis> {
        try {
            // Step 1: 是否只读 Mysql 数据库;
            if (!onlyMysql) {
                const player = await PlayerRedisDao.findOne(parameter);

                if (player) {
                    return player;
                }

                const playerOnMysql = await PlayerMysqlDao.findOne(parameter);
                /** Mysql 有数据则更新进redis，无则返回 */
                if (playerOnMysql) {

                    const sec = await PlayerRedisDao.insertOne(new PlayerInRedis(playerOnMysql));
                }

                return playerOnMysql;
            } else {
                /** 直接查询数据库，如果存在redis存一份 */
                const player = await PlayerMysqlDao.findOne(parameter);
                if (player) {
                    const sec = await PlayerRedisDao.insertOne(new PlayerInRedis(player));
                }
                return player;
            }

        } catch (e) {
            return null;
        }
    }


    async insertOne(parameter: Parameter<Player>): Promise<any> {
        try {
            const p = await PlayerMysqlDao.insertOne(parameter);
            await PlayerRedisDao.insertOne(new PlayerInRedis(p));
            return p;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: Parameter<Player>, partialEntity: {  addRmb?: number; instantNetProfit?: number; thirdUid?: string; myGames?: string; headurl?: string; kickself?: boolean; gold?: number; addDayRmb?: number; addDayTixian?: number; addTixian?: number; oneAddRmb?: number; oneWin?: number; language?: string; superior?: string; group_id?: string; groupRemark?: string; loginTime?: Date; lastLogoutTime?: Date; createTime?: Date; ip?: string; sid?: string; loginCount?: number; kickedOutRoom?: boolean; abnormalOffline?: boolean; position?: number; teamPeople?: number; closeTime?: Date; closeReason?: string; dayMaxWin?: number; dailyFlow?: number; flowCount?: number; walletGold?: number; walletPassword?: number; walletAddress?: string; rom_type?: string; guestid?: string; cellPhone?: string; passWord?: string; maxBetGold?: number; earlyWarningGold?: number; earlyWarningFlag?: boolean; entryGold?: number; onLine?: boolean; isOnLine?: boolean; userId?: string; level?: number, withdrawalChips?: number }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Player)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;

            if (isSuccess) {
                await PlayerRedisDao.updateOne(parameter, new PlayerInRedis(partialEntity));
            }

            return isSuccess;
        } catch (e) {
            return false;
        }
    }

    /**
     * 修改玩家信息 针对 游戏结算处
     * @param parameter 
     * @param partialEntity 
     * @returns 
     */
    async updateOneForRecordGeneral(uid: string, partialEntity: { instantNetProfit?: number; gold?: number; oneWin?: number; dailyFlow?: number; flowCount?: number; maxBetGold?: number, withdrawalChips?: number }, beResetGold: boolean = false) {

        try {

            const {
                instantNetProfit,
                oneWin,
                dailyFlow,
                flowCount,
                maxBetGold,
                gold,
                withdrawalChips
            } = partialEntity;

            const goldPartial = gold >= 0 ? `+ ${gold}` : `- ${Math.abs(gold)}`;

            const goldSql = beResetGold ? `gold = 0` : `gold = gold ${goldPartial}`;

            const sql = `
                UPDATE Sp_Player 
                    SET
                        instantNetProfit = ${instantNetProfit},
                        ${goldSql},
                        oneWin = ${oneWin},
                        dailyFlow = ${dailyFlow},
                        flowCount = ${flowCount},
                        maxBetGold = ${maxBetGold},
                        withdrawalChips = ${withdrawalChips}
                    WHERE pk_uid = "${uid}"
            `;

            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;

            if (isSuccess) {
                const p = await PlayerRedisDao.findOne({ uid });

                p.instantNetProfit = instantNetProfit;
                p.oneWin = oneWin;
                p.dailyFlow = dailyFlow;
                p.flowCount = flowCount;
                p.maxBetGold = maxBetGold;
                p.gold = beResetGold ? 0 : parseFloat((p.gold + gold).toFixed(3));
                p.withdrawalChips = withdrawalChips;
                await PlayerRedisDao.updateOne({ uid }, new PlayerInRedis(p));
            }

            return isSuccess;
        } catch (e) {
            console.error(e.stack)
            return false;
        }
    }

    /**
     * 修改玩家信息 针对 http 上分处
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updateOneForaddPlayerMoney(uid: string, partialEntity: { gold?: number, oneAddRmb?: number, addDayRmb?: number, addRmb?: number ,withdrawalChips? : number }) {
        let _lock = null;
        try {
            _lock = await lock(uid);
            const {
                gold,
                oneAddRmb,
                addDayRmb,
                withdrawalChips,
                addRmb
            } = partialEntity;

            const sql = `
                UPDATE Sp_Player 
                    SET
                        oneWin = 0,
                        gold = gold + ${gold},
                        addDayRmb =  ${addDayRmb},
                        oneAddRmb =  ${oneAddRmb},
                        withdrawalChips =  ${withdrawalChips},
                        addRmb = ${addRmb}
                    WHERE pk_uid = "${uid}"
            `;

            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;

            if (isSuccess) {


                const p = await PlayerRedisDao.findOne({ uid });

                if (p) {
                    p.gold = p.gold + gold;
                    p.oneWin = 0;
                    p.addDayRmb = addDayRmb;
                    p.oneAddRmb = oneAddRmb;
                    p.withdrawalChips = withdrawalChips;
                    p.addRmb = addRmb;

                    await PlayerRedisDao.updateOne({ uid }, new PlayerInRedis(p));
                } else {
                    await this.findOne({ uid }, true);
                    // await PlayerRedisDao.insertOne(new PlayerInRedis(playerInfo));
                }

            }

            return isSuccess;
        } catch (e) {
            console.error(e.stack)
            return false;
        } finally {
            !!_lock && await unlock(_lock);
        }
    }




    /**
     * 修改玩家信息 针对 APP版本 提现金币退回
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updateOneCash(uid: string, partialEntity: { gold: number, addTixian: number }) {
        let _lock = null;
        try {
            _lock = await lock(uid);
            const {
                gold,
                addTixian,
            } = partialEntity;

            const sql = `
                UPDATE Sp_Player 
                    SET
                        oneWin = 0,
                        gold = gold + ${gold},
                        addTixian = ${addTixian}
                    WHERE pk_uid = "${uid}"
            `;

            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;

            if (isSuccess) {


                const p = await PlayerRedisDao.findOne({ uid });

                if (p) {
                    p.gold = p.gold + gold;
                    p.addTixian = addTixian;

                    await PlayerRedisDao.updateOne({ uid }, new PlayerInRedis(p));
                } else {
                    await this.findOne({ uid }, true);
                    // await PlayerRedisDao.insertOne(new PlayerInRedis(playerInfo));
                }

            }

            return isSuccess;
        } catch (e) {
            return false;
        } finally {
            !!_lock && await unlock(_lock);
        }
    }





    /**
     * 修改玩家信息 针对 APP版本 玩家自动获取金币返佣
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updatePlayerGold(uid: string, gold: number) {
        let _lock = null;
        try {
            _lock = await lock(uid);

            const sql = `
                UPDATE Sp_Player 
                    SET
                        gold = gold + ${gold}
                    WHERE pk_uid = "${uid}"
            `;
            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;

            if (isSuccess) {
                const p = await PlayerRedisDao.findOne({ uid });

                if (p) {
                    p.gold = p.gold + gold;
                    await PlayerRedisDao.updateOne({ uid }, new PlayerInRedis(p));
                }

            }

            return isSuccess;
        } catch (e) {
            return false;
        } finally {
            !!_lock && await unlock(_lock);
        }
    }




    async delete(parameter: Parameter<Player>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Player)
                .delete(parameter);
            await PlayerRedisDao.delete(parameter)
            const isSuccess = !!affected;
            if (isSuccess) {
                await PlayerRedisDao.delete(parameter);
            }
            return isSuccess;
        } catch (e) {
            return false;
        }
    }


    /**
     * 作用于后台,批量获取玩家的相关信息
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async findListToLimitForManager(page: number, limit: number, selectFile: any): Promise<any> {
        try {
            const [list, count] = await ConnectionManager.getConnection(true)
                .getRepository(Player)
                .createQueryBuilder("Player")
                .orderBy("Player.id", "DESC")
                .select(selectFile)
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        } catch (e) {
            return false;
        }
    }


    /**
     * 作用于后台,批量获取玩家的相关信息
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async findListForManager(where: string, page: number, limit: number, selectFile: any): Promise<any> {
        try {
            const [list, count] = await ConnectionManager.getConnection(true)
                .getRepository(Player)
                .createQueryBuilder("Player")
                .where(where)
                .orderBy("Player.id", "DESC")
                .select(selectFile)
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        } catch (e) {
            console.warn(e)
            return false;
        }
    }


    /**
     * 作用于导出
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async fileExprotData(startTime: string, endTime: string, selectFile: any): Promise<any> {
        try {
            const list = await ConnectionManager.getConnection(true)
                .getRepository(Player)
                .createQueryBuilder("Player")
                .orderBy("Player.id", "DESC")
                .select(selectFile)
                .getMany();
            return list;
        } catch (e) {
            return false;
        }
    }


    /**
     * 作用于后台,根据uid获取玩家的相关信息
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async findListToLimitInUids(selectFile: any, uidList: string[]): Promise<any> {
        try {
            const list = await ConnectionManager.getConnection(true)
                .getRepository(Player)
                .createQueryBuilder("Player")
                .where("Player.uid IN (:...uids)", { uids: uidList })
                .select(selectFile)
                .getMany();
            return list;
        } catch (e) {
            return [];
        }
    }




    /**
     * 获取在线玩家uid，gold , 从redis里面获取
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async findListRedisInUidsForSid(): Promise<any> {
        try {
            const onlineList = await OnlinePlayerDao.findList();
            const uidList = onlineList.map(pl => pl.uid);
            const list = await PlayerRedisDao.findListInUids(uidList)
            return list;
        } catch (e) {
            return [];
        }
    }



    /**
     * 获取在线玩家uid，gold , 从redis里面获取
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async findOneForUid(uid: string): Promise<any> {
        try {
            const player = await ConnectionManager.getConnection(true)
                .getRepository(Player)
                .createQueryBuilder("Player")
                .where("Player.uid = :uid", { uid: uid })
                .getOne();
            return player;
        } catch (e) {
            return null;
        }
    }


    /**
     * 获取在线玩家uid，gold , 从redis里面获取
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async findOneForthirdUid(thirdUid: string): Promise<any> {
        try {
            const player = await ConnectionManager.getConnection(true)
                .getRepository(Player)
                .createQueryBuilder("Player")
                .where("Player.thirdUid = :thirdUid", { thirdUid: thirdUid })
                .getOne();
            return player;
        } catch (e) {
            return null;
        }
    }





    /**
     * 获取当天登陆过的玩家相关信息
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async findPlayerDayLoginData(): Promise<any> {
        try {
            const result = await ConnectionManager.getConnection(true)
                .getRepository(Player)
                .createQueryBuilder("Player")
                .select("SUM(Player.addDayRmb)", "addDayRmb")
                .addSelect("SUM(Player.addDayTixian)", "addDayTixian")
                .addSelect("SUM(Player.gold)", "gold")
                .where("Player.updateTime >= date_format(now(),'%Y-%m-%d 00:00:00')")
                .getRawOne();
            return result;
        } catch (e) {
            return null;
        }
    }



    /**
     * 获取当天新增的玩家人数
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async todayAddPlayer(startTime, endTime): Promise<any> {
        try {
            const sql_player = `SELECT
                    COUNT(player.id) AS todayPlayer,
                    IFNULL(player.groupRemark,'无') AS agentName
            FROM
                    Sp_Player AS player
            WHERE           
                     player.createTime >= "${startTime}"
                 AND player.createTime < "${endTime}"
            GROUP BY agentName`;
            const result = await ConnectionManager.getConnection(true).query(sql_player);
            return result;
        } catch (e) {
            return null;
        }
    }

    /**
     * 获取当天新增的玩家人数
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async todayAddPlayer_uid(group_id, startTime, endTime): Promise<any> {
        try {
            const sql_player = `SELECT
                    IFNULL(player.pk_uid,'无') AS uid,
                    IFNULL(player.groupRemark,'无') AS agentName
            FROM
                    Sp_Player AS player
            WHERE           
                     player.createTime >= "${startTime}"
                 AND player.createTime < "${endTime}"
                 AND player.group_id = "${group_id}"	
            GROUP BY agentName,uid`;
            const result = await ConnectionManager.getConnection(true).query(sql_player);
            return result;
        } catch (e) {
            return null;
        }
    }


    /**
     * 获取当天活跃的玩家人数
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async todayBetPlayer(group_id, startTime, endTime): Promise<any> {
        try {
            const sql_player = `
            SELECT
                    IFNULL(player.pk_uid,'无') AS uid,
                    IFNULL(player.groupRemark,'无') AS agentName
            FROM
                    Sp_Player AS player
            WHERE           
                     player.dailyFlow >= 0
            AND      player.group_id = "${group_id}"	
            AND      player.createTime >=  "${startTime}"
            AND      player.createTime <   "${endTime}"			 
            GROUP BY agentName,uid`;
            const result = await ConnectionManager.getConnection(true).query(sql_player);
            return result;
        } catch (e) {
            return null;
        }
    }


    /**
     * 获取当天新增的玩家人数
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async todayAddPlayer_groupRemark(groupRemark, startTime, endTime): Promise<any> {
        try {
            const sql_player = `SELECT
                    COUNT(player.id) AS todayPlayer,
                    IFNULL(player.groupRemark,'无') AS agentName
            FROM
                    Sp_Player AS player
            WHERE           
                     player.createTime >=  "${startTime}"
                 AND player.createTime <   "${endTime}"
                 AND player.groupRemark = "${groupRemark}"
                     GROUP BY agentName`;
            const result = await ConnectionManager.getConnection(true).query(sql_player);
            return result;
        } catch (e) {
            return null;
        }
    }



    /**
     *
     * 释放玩家表空间出错
     */
    async optimize() {
        try {
            await ConnectionManager.getConnection()
                .query(`optimize table Sp_Player`);
            return true;
        } catch (e) {
            console.error(`释放玩家表空间出错: ${e.stack}`);
            return false;
        }
    }

}

export default new PlayerManager();
