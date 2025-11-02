import { Robot } from "../mysql/entity/Robot.entity";
import { RobotInRedis } from "../redis/entity/Robot.entity";
import RobotMysqlDao from "../mysql/Robot.mysql.dao";
import RobotRedisDao from "../redis/Robot.redis.dao";
import ConnectionManager from "../mysql/lib/connectionManager";

type Parameter<T> = { [P in keyof T]?: T[P] };

export class RobotManager {

    async findList(parameter: Parameter<Robot>): Promise<Robot[] | RobotInRedis[]> {
        try {
            const list = await RobotMysqlDao.findList(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: Parameter<Robot>, onlyMysql: boolean = false): Promise<Robot | RobotInRedis> {
        try {
            // Step 1: 是否只读 Mysql 数据库;
            if (!onlyMysql) {
                const player = await RobotRedisDao.findOne(parameter);

                if (player) {
                    return player;
                }

                const playerOnMysql = await RobotMysqlDao.findOne(parameter);
                /** Mysql 有数据则更新进redis，无则返回 */
                if (playerOnMysql) {

                    const sec = await RobotRedisDao.insertOne(new RobotInRedis(playerOnMysql));
                }

                return playerOnMysql;
            }

            const player = await RobotMysqlDao.findOne(parameter);

            return player;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: Parameter<Robot>): Promise<any> {
        try {
            await RobotMysqlDao.insertOne(parameter);
            return  await RobotRedisDao.insertOne(new RobotInRedis(parameter));
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: Parameter<Robot>, partialEntity: Parameter<Robot>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Robot)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;

            if (isSuccess) {
                await RobotRedisDao.updateOne(parameter, new RobotInRedis(partialEntity));
            }

            return true;
        } catch (e) {
            console.warn(`updateOne|updateOne|updateOne|更新金币失败`);
            return false;
        }
    }

    async delete(parameter: Parameter<Robot>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Robot)
                .delete(parameter);
            return !!affected;
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
            const [list, count] = await ConnectionManager.getConnection()
                .getRepository(Robot)
                .createQueryBuilder("Robot")
                .orderBy("Robot.id", "DESC")
                .select(selectFile)
                .skip((page - 1) * limit)
                .take( limit)
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
    async findListToLimitInUids(selectFile: any, uidList: string[]): Promise<any> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(Robot)
                .createQueryBuilder("Robot")
                .where("Robot.uid = :uid ", uidList)
                .select(selectFile)
                .getMany();
            return list;
        } catch (e) {
            return false;
        }
    }

}

export default new RobotManager();
