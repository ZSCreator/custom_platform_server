import { AbstractDao } from "../ADao.abstract";
import ConnectionManager from "../mysql/lib/connectionManager";
import { VipConfig } from "./entity/VipConfig.entity";

type vipConfigParams = {
    id?: number;
    level?: number;
    des?: string;
    levelScore?: number;
    bonus?: number;
    bonusForWeeks?: number;
    bonusForMonth?: number;
    createDateTime?: Date;
    updateDateTime?: Date;
};

export class VipConfigMysqlDao extends AbstractDao<VipConfig>{
    async findList(parameter: vipConfigParams): Promise<VipConfig[]> {
        try {
            return ConnectionManager.getConnection()
                .getRepository(VipConfig)
                .find(parameter);
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: vipConfigParams): Promise<VipConfig> {
        try {
            return ConnectionManager.getConnection()
                .getRepository(VipConfig)
                .findOne(parameter);
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: vipConfigParams): Promise<any> {
        try {
            const BonusPoolRepository = ConnectionManager.getConnection()
                .getRepository(VipConfig);

            const p = BonusPoolRepository.create(parameter);
            return await BonusPoolRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async delete(parameter: vipConfigParams): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(VipConfig)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async updateOne(parameter: vipConfigParams, partialEntity: vipConfigParams): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(VipConfig)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }

    async findListToLimit(page: number, limit: number) {
        try {
            const [list, count] = await ConnectionManager.getConnection(true)
                .getRepository(VipConfig)
                .createQueryBuilder("cfg")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }
}

export default new VipConfigMysqlDao();
