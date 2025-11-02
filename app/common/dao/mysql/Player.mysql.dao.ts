import { RoleEnum } from "../../constant/player/RoleEnum";
import { AbstractDao } from "../ADao.abstract";
import { Player } from "./entity/Player.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class PlayerMysqlDao extends AbstractDao<Player> {
    async findList(parameter: { id?: number; uid?: string;  thirdUid?: string; lineCode?: string; nickname?: string; headurl?: string;  gold?: number; addDayRmb?: number; addDayTixian?: number; oneAddRmb?: number; oneWin?: number; language?: string; superior?: string; group_id?: string; groupRemark?: string; loginTime?: Date; lastLogoutTime?: Date; createTime?: Date; isRobot?: RoleEnum; ip?: string; sid?: string; loginCount?: number; kickedOutRoom?: boolean; abnormalOffline?: boolean; position?: number; closeTime?: Date; closeReason?: string; dayMaxWin?: number; dailyFlow?: number; flowCount?: number;   walletGold?: number; walletPassword?: number; walletAddress?: string; rom_type?: string;  guestid?: string; cellPhone?: string; passWord?: string;  maxBetGold?: number; earlyWarningGold?: number; earlyWarningFlag?: boolean; entryGold?: number; onLine?: boolean; isOnLine?: boolean; }): Promise<Player[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(Player)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id?: number; uid?: string;shareUid?: string; thirdUid?: string; lineCode?: string; nickname?: string; headurl?: string;  gold?: number; addDayRmb?: number; addDayTixian?: number; oneAddRmb?: number; oneWin?: number; language?: string; superior?: string; group_id?: string; groupRemark?: string; loginTime?: Date; lastLogoutTime?: Date; createTime?: Date; isRobot?: RoleEnum; ip?: string; sid?: string; loginCount?: number; kickedOutRoom?: boolean; abnormalOffline?: boolean; position?: number; closeTime?: Date; closeReason?: string; dayMaxWin?: number; dailyFlow?: number; flowCount?: number;  walletGold?: number; walletPassword?: number; walletAddress?: string; rom_type?: string;  guestid?: string; cellPhone?: string; passWord?: string;  maxBetGold?: number; earlyWarningGold?: number; earlyWarningFlag?: boolean; entryGold?: number; onLine?: boolean; isOnLine?: boolean; }): Promise<Player> {
        try {
            const player = await ConnectionManager.getConnection()
                .getRepository(Player)
                .findOne(parameter);
            return player;
        } catch (e) {
            return null;
        }
    }


    async insertOne(parameter: { id?: number; uid?: string;  shareUid?: string; thirdUid?: string; lineCode?: string; myGames?: string; nickname?: string; headurl?: string;  gold?: number; addDayRmb?: number; addDayTixian?: number; addTixian?: number; oneAddRmb?: number; oneWin?: number; language?: string; superior?: string; group_id?: string; groupRemark?: string; loginTime?: Date; lastLogoutTime?: Date; createTime?: Date; isRobot?: RoleEnum; ip?: string; sid?: string; loginCount?: number; kickedOutRoom?: boolean; abnormalOffline?: boolean; position?: number; closeTime?: Date; closeReason?: string; dayMaxWin?: number; dailyFlow?: number; flowCount?: number;   walletGold?: number; walletPassword?: number; walletAddress?: string; rom_type?: string;  guestid?: string; cellPhone?: string; passWord?: string;  maxBetGold?: number; earlyWarningGold?: number; earlyWarningFlag?: boolean; entryGold?: number; onLine?: boolean; isOnLine?: boolean; }): Promise<any> {
        try {
            const playerRepository = ConnectionManager.getConnection()
                .getRepository(Player);

            const p = playerRepository.create(parameter);

            return await playerRepository.save(p);
        } catch (e) {
            console.error(`mysql | insertOne | 插入真实玩家信息出错: ${e.stack}`);
            return null;
        }
    }

    async updateOne(parameter: { id?: number; uid?: string; lineCode?: string;  thirdUid?: string; nickname?: string;  headurl?: string;  gold?: number; addDayRmb?: number; addDayTixian?: number; oneAddRmb?: number; oneWin?: number; language?: string; superior?: string; group_id?: string; groupRemark?: string; loginTime?: Date; lastLogoutTime?: Date; isRobot?: RoleEnum; ip?: string; sid?: string; loginCount?: number; kickedOutRoom?: boolean; abnormalOffline?: boolean; position?: number; closeTime?: Date; closeReason?: string; dayMaxWin?: number; dailyFlow?: number; flowCount?: number; walletGold?: number; walletPassword?: number; walletAddress?: string; rom_type?: string;  guestid?: string; cellPhone?: string; passWord?: string;  maxBetGold?: number; earlyWarningGold?: number; earlyWarningFlag?: boolean; entryGold?: number; onLine?: boolean; isOnLine?: boolean;  }, partialEntity: {  thirdUid?: string; addTixian?: number; shareUid?: string; lineCode?: string; gold?: number; addDayRmb?: number; addDayTixian?: number; oneAddRmb?: number; oneWin?: number; language?: string; superior?: string; group_id?: string; groupRemark?: string; loginTime?: Date; lastLogoutTime?: Date; myGames?: string; createTime?: Date; isRobot?: RoleEnum; ip?: string; sid?: string; loginCount?: number; kickedOutRoom?: boolean; abnormalOffline?: boolean; position?: number; teamPeople?: number; closeTime?: Date; closeReason?: string; dayMaxWin?: number; dailyFlow?: number; flowCount?: number;  walletGold?: number; walletPassword?: number; walletAddress?: string; rom_type?: string;  guestid?: string; cellPhone?: string; passWord?: string;  maxBetGold?: number; earlyWarningGold?: number; earlyWarningFlag?: boolean; entryGold?: number; onLine?: boolean; isOnLine?: boolean; }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Player)
                .update(parameter, partialEntity);

            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: { id?: number; uid?: string; lineCode?: string; thirdUid?: string; nickname?: string; headurl?: string;  gold?: number; addDayRmb?: number; addDayTixian?: number; oneAddRmb?: number; oneWin?: number; language?: string; superior?: string; group_id?: string; groupRemark?: string; loginTime?: Date; lastLogoutTime?: Date; createTime?: Date; isRobot?: RoleEnum; ip?: string; sid?: string; loginCount?: number; kickedOutRoom?: boolean; abnormalOffline?: boolean; position?: number; closeTime?: Date; closeReason?: string; dayMaxWin?: number; dailyFlow?: number; flowCount?: number;   walletGold?: number; walletPassword?: number; walletAddress?: string; rom_type?: string;  guestid?: string; cellPhone?: string; passWord?: string;  maxBetGold?: number; earlyWarningGold?: number; earlyWarningFlag?: boolean; entryGold?: number; onLine?: boolean; isOnLine?: boolean; }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Player)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

}

export default new PlayerMysqlDao();