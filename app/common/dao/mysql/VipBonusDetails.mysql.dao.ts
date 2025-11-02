import { AbstractDao } from "../ADao.abstract";
import ConnectionManager from "../mysql/lib/connectionManager";
import { VipBonusDetails } from "./entity/VipBonusDetails.entity";

type vipBonusDetailsParams = {
    id?: number;
    uid?: string;
    level?: number;
    bonus?: number;
    whetherToReceiveLeverBonus?: number;
    bonusForWeeks?: number;
    bonusForWeeksLastDate?: Date;
    bonusForMonth?: number;
    bonusForMonthLastDate?: Date;
    createDateTime?: Date;
    updateDateTime?: Date;
};

export class VipBonusDetailsMysqlDao extends AbstractDao<VipBonusDetails>{
    async findList(parameter: vipBonusDetailsParams): Promise<VipBonusDetails[]> {
        try {
            return ConnectionManager.getConnection()
                .getRepository(VipBonusDetails)
                .find(parameter);
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: vipBonusDetailsParams): Promise<VipBonusDetails> {
        try {
            return ConnectionManager.getConnection()
                .getRepository(VipBonusDetails)
                .findOne(parameter);
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: vipBonusDetailsParams): Promise<any> {
        try {
            const BonusPoolRepository = ConnectionManager.getConnection()
                .getRepository(VipBonusDetails);

            const p = BonusPoolRepository.create(parameter);
            return await BonusPoolRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async delete(parameter: vipBonusDetailsParams): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(VipBonusDetails)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async updateOne(parameter: vipBonusDetailsParams, partialEntity: vipBonusDetailsParams): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(VipBonusDetails)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async findListToLimit(page: number, limit: number) {
        try {
            const [list, count] = await ConnectionManager.getConnection(true)
                .getRepository(VipBonusDetails)
                .createQueryBuilder("detail")
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

export default new VipBonusDetailsMysqlDao();
