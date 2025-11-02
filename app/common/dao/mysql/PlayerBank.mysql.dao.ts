import { AbstractDao } from "../ADao.abstract";
import { PlayerBank } from "./entity/PlayerBank.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

type IPlayerBank= { id?: number; uid?: string;  upiUserName?: string; upiAddress?: string; upiPhone?: string; bankCardNo?: string; bankName?: string; ifscCode?: string, email?: string; bankUserName?: string; createDate?: Date;}

export class PlayerBankMysqlDao  extends AbstractDao<PlayerBank> {
    async findList(parameter: IPlayerBank): Promise<PlayerBank[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(PlayerBank)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: IPlayerBank): Promise<PlayerBank> {
        try {
            const playerBank = await ConnectionManager.getConnection()
                .getRepository(PlayerBank)
                .findOne(parameter);

            return playerBank;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: IPlayerBank, partialEntity: IPlayerBank): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerBank)
                .update(parameter, partialEntity);

            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async insertOne(parameter: IPlayerBank): Promise<any> {
        try {
            const playerRepository = ConnectionManager.getConnection()
                .getRepository(PlayerBank);

            const p = playerRepository.create(parameter);

            return await playerRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async delete(parameter: IPlayerBank): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerBank)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }


    /** 查询平台分页列表信息 */
    async findManyAndCountForPlatform(platformUid: string, currentPage: number, pageSize: number = 20) {
        try {
            if (platformUid) {
                const result = await ConnectionManager.getConnection(true)
                    .getRepository(PlayerBank)
                    .createQueryBuilder("PlayerBank")
                    .where("PlayerBank.uid = :uid", { uid: platformUid })
                    .getManyAndCount();
                return result;
            } else {
                const result = await ConnectionManager.getConnection(true)
                    .getRepository(PlayerBank)
                    .createQueryBuilder("PlayerBank")
                    .where("PlayerBank.deep_level = 1")
                    .andWhere("PlayerBank.role_type = 2")
                    .andWhere("PlayerBank.status = 1")
                    .skip((currentPage - 1) * pageSize)
                    .take(currentPage * pageSize)
                    .orderBy("PlayerBank.id", "DESC")
                    .getManyAndCount();
                return result;
            }

        } catch (e) {
            return [[], 0];
        }
    }

    /** 查询代理分页列表信息 */
    async findManyAndCountForAgentFromPlatform(rootUid: string, currentPage: number, pageSize: number = 20) {
        return await ConnectionManager.getConnection(true)
            .getRepository(PlayerBank)
            .createQueryBuilder("PlayerBank")
            .where("PlayerBank.root_uid = :rootUid")
            .andWhere("PlayerBank.deep_level = 2")
            .andWhere("PlayerBank.role_type = 3")
            .andWhere("PlayerBank.status = 1")
            .skip((currentPage - 1) * pageSize)
            .take(pageSize)
            .orderBy("PlayerBank.createDateTime")
            .setParameters({ rootUid })
            .getManyAndCount();
    }


    /**
     * 作用于删除平台相关数据 获取这个平台下面所有的uid
     * @param uid
     */
    async findPlatformAllUid(uid: string): Promise<any> {
        try {
            const result = await ConnectionManager.getConnection(true)
                .getRepository(PlayerBank)
                .createQueryBuilder("PlayerBank")
                .where("PlayerBank.rootUid = :rootUid", { rootUid: uid })
                .orderBy("PlayerBank.id", "DESC")
                .select(['PlayerBank.uid'])
                .getMany();
            return result;
        } catch (e) {
            return [];
        }
    }

    /**
     * 作用于删除代理相关数据 获取这个平台下面所有的uid
     * @param uid
     */
    async findAgentAllUid(uid: string): Promise<any> {
        try {
            const result = await ConnectionManager.getConnection(true)
                .getRepository(PlayerBank)
                .createQueryBuilder("PlayerBank")
                .where("PlayerBank.parentUid = :parentUid", { parentUid: uid })
                .orWhere("PlayerBank.uid = :uid", { uid: uid })
                .orderBy("PlayerBank.id", "DESC")
                .select(['PlayerBank.uid'])
                .getMany();
            return result;
        } catch (e) {
            return [];
        }
    }



    /**
     * 增加代理的金币额度 针对 http 上分处
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updateAddForThirdApi(platformName: string, partialEntity: { gold: number }) {
        try {
            const {
                gold,
            } = partialEntity;

            const sql = `
                UPDATE Sp_Player_Agent 
                    SET
                        platform_gold = platform_gold + ${gold}
                    WHERE platform_name = "${platformName}"
            `;

            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;

            return isSuccess;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }


    /**
     * 减少代理的金币额度 针对 http 上分处
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updateDeleForThirdApi(platformName: string, partialEntity: { gold: number }) {
        try {
            const {
                gold,
            } = partialEntity;

            const sql = `
                UPDATE Sp_Player_Agent 
                    SET
                        platform_gold = platform_gold - ${gold}
                    WHERE platform_name = "${platformName}"
            `;
            
            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;


            return isSuccess;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }



}

export default new PlayerBankMysqlDao();
