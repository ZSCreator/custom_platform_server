import { AbstractDao } from "../ADao.abstract";
import { SystemConfig } from "./entity/SystemConfig.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class SystemConfigMysqlDao extends AbstractDao<SystemConfig> {
    async findList(parameter: {id?: number; tixianRabate?: number; signData?: any; apiTestAgent?: string; gameResultUrl?: string;  tixianBate?: number;  startGold?: number;  isCloseApi?: boolean; closeNid?: any; backButton?: any; bankList?: any; hotGameButton?: any;    h5GameUrl?: string ; inputGoldThan?: number ; winGoldThan?: number ; winAddRmb?: number;cellPhoneGold? : number}): Promise<SystemConfig[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(SystemConfig)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id?: number; apiTestAgent?: string; gameResultUrl?: string; tixianBate?: number;  startGold?: number; isCloseApi?: boolean; closeNid?: any; backButton?: any;hotGameButton?: any; h5GameUrl?: string ; inputGoldThan?: number ; winGoldThan?: number ; winAddRmb?: number;cellPhoneGold? : number}): Promise<SystemConfig> {
        try {
            const systemConfig = await ConnectionManager.getConnection()
                .getRepository(SystemConfig)
                .findOne(parameter);

            return systemConfig;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id?: number; openUnlimited?: boolean;  unlimitedList?: any; tixianRabate?: number; iplRebate?: number; signData?: any; bankList?: any; isOpenH5?: boolean; apiTestAgent?: string; customer?: string; defaultChannelCode?: string; languageForWeb?: string;  gameResultUrl?: string;  tixianBate?: number;  startGold?: number; isCloseApi?: boolean; closeNid?: any; backButton?: any;hotGameButton?: any;    h5GameUrl?: string ; inputGoldThan?: number ; winGoldThan?: number ; winAddRmb?: number;cellPhoneGold? : number}): Promise<any> {
        try {
            const systemConfigRepository =  ConnectionManager.getConnection()
                .getRepository(SystemConfig);

            const p = systemConfigRepository.create(parameter);
            return await systemConfigRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id?: number} , partialEntity :{ id?: number; openUnlimited?: boolean; iplRebate?: number;  unlimitedList?: any; tixianRabate?: number; signData?: any; bankList?: any; isOpenH5?: boolean; defaultChannelCode?: string; customer?: string; apiTestAgent?: string; languageForWeb?: string;  gameResultUrl?: string; tixianBate?: number; goldToMoney?: number; startGold?: number; isCloseApi?: boolean; closeNid?: any; backButton?: any;hotGameButton?: any; tixianPoundage?: number;  tixianLimit?: number; h5GameUrl?: string ; inputGoldThan?: number ; winGoldThan?: number ; winAddRmb?: number;cellPhoneGold? : number} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemConfig)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemConfig)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

}

export default new SystemConfigMysqlDao();