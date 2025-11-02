import { RoleEnum } from "../../constant/player/RoleEnum";
import { AbstractDao } from "../ADao.abstract";
import { Robot } from "./entity/Robot.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class RobotMysqlDao extends AbstractDao<Robot> {
    async findList(parameter: { id?: number; uid?: string; position?: number; robotOnLine?: boolean; nickname?: string; headurl?: string; gold?: number; language?: string; createTime?: Date; isRobot?: RoleEnum; sid?: string; vipScore?: number; guestid?: string; onLine?: boolean; isOnLine?: boolean; }): Promise<Robot[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(Robot)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id?: number; uid?: string; nickname?: string; position?: number; robotOnLine?: boolean; headurl?: string; gold?: number; language?: string; createTime?: Date; isRobot?: RoleEnum; sid?: string; vipScore?: number; guestid?: string; onLine?: boolean; isOnLine?: boolean; }): Promise<Robot> {
        try {
            const player = await ConnectionManager.getConnection()
                .getRepository(Robot)
                .findOne(parameter);

            return player;
        } catch (e) {
            return null;
        }
    }
    async updateOne(parameter: { id?: number; uid?: string; nickname?: string; position?: number; robotOnLine?: boolean; headurl?: string; gold?: number; language?: string; createTime?: Date; isRobot?: RoleEnum; sid?: string; vipScore?: number; guestid?: string; onLine?: boolean; isOnLine?: boolean; }, partialEntity: { id?: number; uid?: string; position?: number; robotOnLine?: boolean; nickname?: string; headurl?: string; gold?: number; language?: string; createTime?: Date; isRobot?: RoleEnum; sid?: string; vipScore?: number; guestid?: string; onLine?: boolean; isOnLine?: boolean; }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Robot)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }
    async insertOne(parameter: { id?: number; uid?: string; nickname?: string; position?: number; robotOnLine?: boolean; headurl?: string; gold?: number; language?: string; createTime?: Date; isRobot?: RoleEnum; sid?: string; vipScore?: number; guestid?: string; onLine?: boolean; isOnLine?: boolean; }): Promise<any> {
        try {
            const playerRepository = ConnectionManager.getConnection()
                .getRepository(Robot);

            const p = playerRepository.create(parameter);

            return await playerRepository.save(p);
        } catch (e) {
            return null;
        }
    }
    async delete(parameter: { id?: number; uid?: string; nickname?: string; headurl?: string; position?: number; robotOnLine?: boolean; gold?: number; language?: string; createTime?: Date; isRobot?: RoleEnum; sid?: string; vipScore?: number; guestid?: string; onLine?: boolean; isOnLine?: boolean; }): Promise<any> {
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
     * 机器人离线批量操作
     * @param uidList 机器人uid集合
     */
    async updateManyForSessionClose(uidList: Array<string>) {
        const sql = `
        UPDATE Sp_Robot SET position = 0,robotOnLine = false
        WHERE pk_uid IN (${uidList.map((uid: string) => `'${uid}'`).join(",")})
        `;

        // console.warn(sql);

        try {
            await ConnectionManager.getConnection()
                .query(sql);
            return true;
        } catch (e) {
            console.error(`RobotMysqlDao | 机器人批量更新离线信息出错:${e.stack}`);
            return false;
        }
    }
}

export default new RobotMysqlDao();