import { AbstractDao } from "../ADao.abstract";
import ConnectionManager from "../mysql/lib/connectionManager";
import { TelegramCustomer } from "./entity/TelegramCustomer.entity";

type telegramCustomerParams = {
    id?: number;
    url?: string;
    nickname?: string;
    per?: number;
    status?: number;
    createDateTime?: Date;
    updateDateTime?: Date;
};

export class TelegramCustomerMysqlDao extends AbstractDao<TelegramCustomer>{
    findList(parameter: telegramCustomerParams): Promise<TelegramCustomer[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(parameter: telegramCustomerParams): Promise<TelegramCustomer> {
        try {
            const telegramCustomer = await ConnectionManager.getConnection(true)
                .getRepository(TelegramCustomer)
                .findOne(parameter);

            return telegramCustomer;
        } catch (e) {
            console.error(e.stack);
            return null;
        }
    }
    async insertOne(parameter: telegramCustomerParams): Promise<any> {
        try {
            const BonusPoolRepository = ConnectionManager.getConnection()
                .getRepository(TelegramCustomer);

            const p = BonusPoolRepository.create(parameter);
            return await BonusPoolRepository.save(p);
        } catch (e) {
            console.error(e.stack);
            return null;
        }
    }

    async delete(parameter: telegramCustomerParams): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(TelegramCustomer)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async updateOne(parameter: telegramCustomerParams, partialEntity: telegramCustomerParams) {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(TelegramCustomer)
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
                .getRepository(TelegramCustomer)
                .createQueryBuilder()
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

export default new TelegramCustomerMysqlDao();