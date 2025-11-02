import { Injectable, } from '@nestjs/common';
import { getLogger } from "pinus-logger";
import GatePlayerService from "../../../../../gate/lib/services/GatePlayerService";
import PlayerAgentMysqlDao from '../../../../../../common/dao/mysql/PlayerAgent.mysql.dao';
import { GmsApiResultVO } from '../../../const/GmsApiResult.vo';
import { HttpCode } from '../../../support/code/HttpCode.enum';
import { PlayerAgent } from '../../../../../../common/dao/mysql/entity/PlayerAgent.entity';
import PlayerManager from '../../../../../../common/dao/daoManager/Player.manager';
import ThirdGoldRecordMysqlDao from '../../../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao';
import PlatformNameAgentListMysqlDao from '../../../../../../common/dao/mysql/PlatformNameAgentList.mysql.dao';
import { LANGUAGE_LIST } from '../../../../../../consts/hallConst';
import * as moment from "moment";
import TenantGameDataRedisDao from '../../../../../../common/dao/redis/TenantGameData.redis.dao';
import PlatformProfitAndLossDataRedisDao from '../../../../../../common/dao/redis/PlatformProfitAndLossData.redis.dao';
import AgentProfitAndLossDataRedisDao from '../../../../../../common/dao/redis/AgentProfitAndLossData.redis.dao';
import TenantGameDataDao from '../../../../../../common/dao/mysql/TenantGameData.mysql.dao';
import DateTime2GameRecordService from './DateTime2GameRecord.service';
import PlatformNameAgentListRedisDao from "../../../../../../common/dao/redis/PlatformNameAgentList.redis.dao";
import PlayerAgentRedisDao from "../../../../../../common/dao/redis/PlayerAgent.redis.dao";
import ConnectionManager from "../../../../../../common/dao/mysql/lib/connectionManager";
import GameRecordDateTableDao from "../../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao";
import SystemConfigManager from "../../../../../../common/dao/daoManager/SystemConfig.manager";
import GameManager from "../../../../../../common/dao/daoManager/Game.manager";
const agent_name = require('../../../../../../../config/data/agent_name.json');

const logger = getLogger('http', __filename);


const possible = "ABCDEFGHJKLMNPQRSTUVWXY23456789";

// 随机生成邀请码
function generateRandomStr(num: number) {
    let text = "";

    if (!num) {
        num = 4;
    }

    for (let i = 0; i < num; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}


@Injectable()
export class AgentService {

    /**
     * 获取  创建一个平台
     * @param {string} platform   平台编号
     * @param {number} gold       金币数
     */
    async createPlatform(manager:string , platform: string, gold: number, language: string): Promise<any> {
        try {


            if(gold < 0 ){
                return Promise.reject(new GmsApiResultVO(HttpCode.Platform_Existence, null, "金币不能为负数"));
            }

            /** Step 1: 平台是否已存在 */
            const platformInfo = await PlayerAgentMysqlDao.findOne({ platformName: platform });

            if (platformInfo) {
                return Promise.reject(new GmsApiResultVO(HttpCode.Platform_Existence, null, "平台已存在"));
            }


            // while (true) {
            //     inviteCode = generateRandomStr(4);
            //
            //     const exitsInfo = await PlayerAgentMysqlDao.findOne({ inviteCode });
            //
            //     if (!exitsInfo) {
            //         break;
            //     }
            // }

            /** Step 3: 创建代理账号(基于玩家) */
            const { uid } = await GatePlayerService.createPlayer();


            /** Step 4: 创建平台信息 */
            const agentInfo = ConnectionManager.getRepository(PlayerAgent).create({
                uid,
                rootUid: uid,
                parentUid: uid,
                platformName: platform,
                platformGold: gold || 0,
                deepLevel: 1,
                roleType: 2,
                status: 1,
                language: LANGUAGE_LIST.includes(language) ? language : 'english'
            });

            await PlayerAgentMysqlDao.insertOne(agentInfo);

            /** Step 5: 创建上分记录 */
            const info = {
                userName: manager,
                platformName: platform,
                agentName: platform,
                goldChangeBefore: 0,
                gold,
                goldChangeAfter: gold,
            }
            await PlatformNameAgentListMysqlDao.insertOne(info);
            //将改平台的uid存入到redis key值 里面
            await PlatformNameAgentListRedisDao.insertPlatformUid({platformName : platform, platformUid: uid });

            // 5.4 更新redis里面平台拥有哪些分代的值
            await PlatformNameAgentListRedisDao.addAgent(platform, uid);

            //创建该平台的本月表和下个月的表
            const timeTableName =  moment().format("YYYYMM");
            let tableName = `${uid}_${timeTableName}`;
            const  isExists = await GameRecordDateTableDao.tableBeExists(tableName);
            if(!isExists){
                await GameRecordDateTableDao.createTable(tableName);
            }

            //创建下个月的表,万一是28或者29号创建平台，就不会自动创建表了
            const nextMonthTime =  moment().add(1,'month').format("YYYYMM");
            let nextMonthTableName = `${uid}_${nextMonthTime}`;
            const  nextMonthisExists = await GameRecordDateTableDao.tableBeExists(nextMonthTableName);
            if(!nextMonthisExists){
                await GameRecordDateTableDao.createTable(nextMonthTableName);
            }

            return { uid, platform };
        } catch (error) {
            logger.warn(`createPlatform ==>error: ${error}`);
            console.info(`createPlatform ==>error: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 删除一个平台
     * @param {string} platform   平台编号
     * @param {number} gold       金币数
     */
    async deletePlatform(platform: string): Promise<any> {
        try {
            /** Step 1: 平台是否已存在 */
            const platformInfo = await PlayerAgentMysqlDao.findOne({ platformName: platform });
            if (!platformInfo) {
                return Promise.reject(new GmsApiResultVO(HttpCode.Platform_Existence, null, "平台不存在"));
            }

            // /** Step 2: 删除这个平台下面所有的租户和玩家 */
            // const uidList = await PlayerAgentMysqlDao.findPlatformAllUid(platformInfo.uid);
            // if (uidList.length != 0) {
            //     for (let key of uidList) {
            //         /** Step 2.1: 删除playerAgent信息 */
            //         await PlayerAgentMysqlDao.delete({ uid: key.uid });
            //         /** Step 2.2: 删除player信息 */
            //         await PlayerManager.delete({ uid: key.uid });
            //     }
            // }
            /** Step 2: 先删除Player表里面得数据 */
            const sqlForPlayer = `DELETE   FROM Sp_Player 
						where  
						Sp_Player.pk_uid  in ( select Sp_Player_Agent.fk_uid  from Sp_Player_Agent 
						WHERE   Sp_Player_Agent.root_uid   = "${platformInfo.uid}" )`;

            await ConnectionManager.getConnection().query(sqlForPlayer);

            /** Step 2: 先删除PlayerAgent表里面得数据 */
            const sqlForPlayerAgent = `DELETE  FROM Sp_Player_Agent 
						WHERE   Sp_Player_Agent.root_uid   = "${platformInfo.uid}" `;
            await ConnectionManager.getConnection().query(sqlForPlayerAgent);

            //删除分代在redis 存储的数据
            const playerAgentList = await PlatformNameAgentListRedisDao.findOne({platformName : platformInfo.platformName});
            for(let agent of playerAgentList){
                await PlayerAgentRedisDao.delete({platformName : agent});
            }
            /** Step 2: 释放数据库空间 */
            // 5.4 更新redis里面平台拥有哪些分代的值
            await PlatformNameAgentListRedisDao.deletePlatformUidOne({platformName : platformInfo.platformName});
            await PlatformNameAgentListRedisDao.deleteOne({platformName : platformInfo.platformName});
            return true;
        } catch (error) {
            logger.warn(`deletePlatform ==>error: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 大区列表
     * @param {number} currentPage 当前页
     * @param {number} pageSize    每页数量
     */
    async platformList(currentPage: number, pageSize: number, platformUid: string): Promise<any> {
        try {

            const [recordList, totalCount] = await PlayerAgentMysqlDao.findManyAndCountForPlatform(
                platformUid,
                currentPage,
                pageSize
            );

            return { recordList, totalCount };
        } catch (e) {
            logger.error(`获取平台信息列表出错: ${e.stack}`)
            return Promise.reject(e);
        }
    }

    /**
     * 创建一个平台下面的代理
     * @param {string} agentUid 代理or平台编号
     * @param {string} platform 平台名
     * @param {number} gold     金币
     */
    async createAgentForPlatform(manager :string ,agentUid: string, platform: string, gold: number, language: string): Promise<any> {
        try {

            if( gold < 0 ){
                return Promise.reject(new GmsApiResultVO(HttpCode.Platform_Existence, null, "金币不能为负数"));
            }

            /** Step 1: 代理信息是否已存在 */
            const agentInfo = await PlayerAgentMysqlDao.findOne({ platformName: platform });

            if (agentInfo) {
                return Promise.reject(new GmsApiResultVO(HttpCode.Agent_Existence, null, "租户已存在"));
            }

            /** Step 2: 建立代理账号 */
            const platfromInfo = await PlayerAgentMysqlDao.findOne({ uid: agentUid });

            if (!platfromInfo) {
                return Promise.reject(new GmsApiResultVO(HttpCode.Platfrom_Nonexistence, null, "平台不存在"));
            }

            if (platfromInfo.platformGold < gold) {
                return Promise.reject(new GmsApiResultVO(HttpCode.PlatformGold_Not_Enough, null, "平台金币不足"));
            }

            /** Step 3: 创建代理账号(基于玩家) */
            const { uid } = await GatePlayerService.createPlayer(null, agentUid, agentUid, null, platform, null);

            /** Step 4: 创建代理信息(基于平台下) */
            const playerAgentInfo = {
                uid,
                parentUid: platfromInfo.uid,
                rootUid: platfromInfo.rootUid,
                platformName: platform,
                platformGold: gold || 0,
                deepLevel: platfromInfo.deepLevel + 1,
                roleType: 3,
                status: 1,
                language: LANGUAGE_LIST.includes(language) ? language : 'english'
            };


            /** Step 5: 创建上分记录 */
            const info = {
                userName: manager,
                platformName: platfromInfo.platformName,
                agentName: platform,
                goldChangeBefore: 0,
                gold,
                goldChangeAfter: gold,
            }

            await  Promise.all([
                PlayerAgentMysqlDao.insertOne(playerAgentInfo),  // 5.1 插入代理信息
                PlayerAgentMysqlDao.updateOne({ uid: platfromInfo.uid }, { platformGold: Math.floor(platfromInfo.platformGold - gold )}), // 5.2 扣除平台金币
                PlatformNameAgentListMysqlDao.insertOne(info)
            ]);

            // 5.4 更新redis里面平台拥有哪些分代的值
            await PlatformNameAgentListRedisDao.addAgent(platfromInfo.platformName,platfromInfo.uid);

            return true;
        } catch (e) {
            logger.error(`创建平台代理出错: ${e.stack}`);
            return Promise.reject(e);
        }
    }


    /**
     * 删除一个平台下面的代理
     * @param {string} agentUid 代理编号
     * @param {string} platformUid 平台名Uid
     * @param {number} gold     金币
     */
    async deleteAgentForPlatform(platformUid: string, agentUid: string): Promise<any> {
        try {
            /** Step 1: 代理信息是否已存在 */
            const agentInfo = await PlayerAgentMysqlDao.findOne({ uid: agentUid });

            if (!agentInfo) {
                return Promise.reject(new GmsApiResultVO(HttpCode.Agent_Existence, null, "代理不存在"));
            }

            // if(agentInfo.parentUid != platformUid){
            //     return Promise.reject(new GmsApiResultVO(HttpCode.Agent_Existence, null, "该代理的上级平台不是该账号，不能删除"));
            // }

            /** Step 2: 删除这个代理下面所有的租户和玩家 */
            // const uidList = await PlayerAgentMysqlDao.findAgentAllUid(agentInfo.uid);
            // if (uidList.length != 0) {
            //     for (let key of uidList) {
            //         /** Step 2.1: 删除playerAgent信息 */
            //         await PlayerAgentMysqlDao.delete({ uid: key.uid });
            //         /** Step 2.2: 删除player信息 */
            //         await PlayerManager.delete({ uid: key.uid });
            //     }
            // }
            /** Step 2: 先删除Player表里面得数据 */
            const sqlForPlayer = `DELETE   from Sp_Player 
						where  
						Sp_Player.groupRemark = "${agentInfo.platformName}"`;
            await ConnectionManager.getConnection().query(sqlForPlayer);

            /** Step 2: 先删除PlayerAgent表里面得数据 */
            const sqlForPlayerAgent = `DELETE	 from Sp_Player_Agent 
						WHERE   Sp_Player_Agent.parent_uid   = "${agentInfo.uid}" `;
            await ConnectionManager.getConnection().query(sqlForPlayerAgent);

            //删除该代理信息
            const sqlForPlayerToAgent = `DELETE   from Sp_Player 
						where  
						Sp_Player.pk_uid = "${agentInfo.uid}"`;
            await ConnectionManager.getConnection().query(sqlForPlayerToAgent);

            //删除该代理信息
            const sqlForPlayerAgentToAgent = `DELETE   from Sp_Player_Agent 
						where  
						Sp_Player_Agent.fk_uid = "${agentInfo.uid}"`;
            await ConnectionManager.getConnection().query(sqlForPlayerAgentToAgent);

            //删除redis 中的该代理
            await PlayerAgentRedisDao.delete({platformName : agentInfo.platformName});
            /** Step 2: 释放数据库空间 */
            return true;
        } catch (e) {
            logger.error(`删除平台代理出错: ${e.stack}`);
            return Promise.reject(e);
        }
    }

    /**
     *  平台下面的代理列表
     *  @param {string} platfromUid 平台编号，即代理表字段 rootUid
     *  @param {number} currentPage 当前页
     *  @param {number} pageSize    每页展示数量
     */
    async agentListFromPlatform(platfromUid: string, rootAgent : string, currentPage: number, pageSize: number): Promise<any> {
        try {

            const [recordList, totalCount] = await PlayerAgentMysqlDao.findManyAndCountForAgentFromPlatform(platfromUid, currentPage, pageSize);
            const systemConfig = await SystemConfigManager.findOne({});
            const url = systemConfig.gameResultUrl ? systemConfig.gameResultUrl : null ;
            const list = recordList.map((info)=>{
               info.platformName =  this.agentForChangeName(info.platformName);
               info['url'] = url ? `${url}?PlatformCode=${info.platformName}`: null ;
               return info;
            });
            return { recordList : list, totalCount };
        } catch (e) {
            logger.error(`查询平台下的代理列表出错: ${e.stack}`);
            return Promise.reject(e);
        }
    }


    /**
     *  平台下面的代理列表
     *  @param {string} platfromUid 平台编号，即代理表字段 rootUid
     *  @param {number} currentPage 当前页
     *  @param {number} pageSize    每页展示数量
     */
    async bingManagerAgentList(platfromUid: string): Promise<any> {
        try {

            const recordList = await PlayerAgentMysqlDao.bingManagerAgentList(platfromUid);
            const list = recordList.map((info)=>{
                return this.agentForChangeName(info.platformName);
            });
            return { list : list };
        } catch (e) {
            logger.error(`查询平台下的代理列表出错: ${e.stack}`);
            return Promise.reject(e);
        }
    }


    /**
     *  给平台添加金币或者减少金币
     * @param {number} gold        变化金币数
     * @param {string} platfromUid 平台编号
     */
    async updateGoldForPlatform(manager : string ,gold: number, platfromUid: string): Promise<any> {
        try {
            /** Step 1: 查询平台信息 */
            const platformInfo = await PlayerAgentMysqlDao.findOne({ uid: platfromUid });

            if (!platformInfo) {
                return Promise.reject(new GmsApiResultVO(HttpCode.Platfrom_Nonexistence, null, "平台不存在"));
            }

            if(gold < 0 && Math.abs(gold) > Math.abs(platformInfo.platformGold) ){
                return Promise.reject(new GmsApiResultVO(HttpCode.PlatformGold_Not_Enough, null, "扣除金币超过平台拥有金币"));
            }

            /** Step 2: 数据库事务操作 */

            await PlayerAgentMysqlDao.updateOne({ uid: platfromUid }, { platformGold: Math.floor(platformInfo.platformGold + gold )  });


            const info = {
                userName: manager,
                platformName: platformInfo.platformName,
                agentName: null,
                goldChangeBefore: platformInfo.platformGold,
                gold,
                goldChangeAfter: Math.floor(platformInfo.platformGold + gold ),
            };
            await PlatformNameAgentListMysqlDao.insertOne(info);
            return true;
        } catch (e) {
            logger.error(`修改平台金币出错: ${e.stack}`);
            return Promise.reject(e);
        }
    }

    /**
     *  平台给代理添加金币或者减少金币
     * @param uid
     * * @param
     */
    async addPlatformAgentGold(manager : string , platform: string, gold: number, uid: string): Promise<any> {
        try {
            /** Step 1: 平台是否已存在 */
            const platformInfo = await PlayerAgentMysqlDao.findOne({ platformName: platform });

            if (!platformInfo) {
                return Promise.reject(new GmsApiResultVO(HttpCode.Platfrom_Nonexistence, null, "平台不存在"));
            }

            /** Step 2: 平台金币是否足够 */
            if ( gold > 0 && platformInfo.platformGold < gold) {
                return Promise.reject(new GmsApiResultVO(HttpCode.PlatformGold_Not_Enough, null, "平台金币不足"));
            }

            /** Step 3: 代理是否存在 */
            const agentInfo = await PlayerAgentMysqlDao.findOne({ uid });

            if (!agentInfo) {
                return Promise.reject(new GmsApiResultVO(HttpCode.Platfrom_Nonexistence, null, "代理不存在"));
            }

            if(gold < 0 && Math.abs(gold) > Math.abs(agentInfo.platformGold) ){
                return Promise.reject(new GmsApiResultVO(HttpCode.PlatformGold_Not_Enough, null, "扣除金币超过代理拥有金币"));
            }

            // 4.1 扣除平台金币
            await PlayerAgentMysqlDao.updateOne({ uid: platformInfo.uid }, { platformGold: Math.floor(platformInfo.platformGold - gold) });

            // 4.3 增加代理金币
            // await PlayerAgentMysqlDao.updateOne({ uid }, { platformGold: Math.floor(agentInfo.platformGold + gold) });
            if(gold > 0){
                await PlayerAgentMysqlDao.updateAddForThirdApi(agentInfo.platformName,{gold : Math.abs(gold)});
            }else{
                await PlayerAgentMysqlDao.updateDeleForThirdApi(agentInfo.platformName,{gold : Math.abs(gold)});
            }
            // 4.3 代理上分记录日志

            const info = {
                userName: manager,
                platformName: platformInfo.platformName,
                agentName: agentInfo.platformName,
                goldChangeBefore: agentInfo.platformGold,
                gold,
                goldChangeAfter:  Math.floor(agentInfo.platformGold + gold ) ,
            }
            await PlatformNameAgentListMysqlDao.insertOne(info);

            return true;
        } catch (e) {
            logger.error(`修改代理金币出错: ${e}`);
            return Promise.reject(e);
        }
    }


    /**
     *  查看所有给平台和代理加金币的记录
     * @param uid
     * * @param
     */
    async getPlatformToAgentGoldRecordList(managerAgent: string = null, agentSearch : string = null , currentPage: number, pageSize: number = 20): Promise<any> {
        try {
            if(agentSearch){
                const { list, totalCount } = await PlatformNameAgentListMysqlDao.searchPlatformToAgentGoldRecordList(managerAgent  , agentSearch , currentPage , pageSize);
                return { list, totalCount };
            }
            /** Step x: managerAgent存在查询下面所有代理的上下分 */
            if(managerAgent){
                const { list, totalCount } = await PlatformNameAgentListMysqlDao.getPlatformToAgentGoldRecordList(managerAgent  ,currentPage , pageSize);
                if(list && list.length !== 0){
                    if(managerAgent == '459pt'){
                        const recordList = list.map((info)=>{
                            info.agentName = this.agentForChangeName(info.agentName);
                            return info;
                        });
                        return { list : recordList, totalCount : totalCount  };
                    };
                }
                return { list, totalCount };
            }else {
                const { list, totalCount } = await PlatformNameAgentListMysqlDao.findListToLimitNoTime(currentPage , pageSize);
                return { list, totalCount };
            }
        } catch (error) {
            logger.warn(`addPlatformGold ==>error: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     *  查看代理查看下面所有玩家上下分
     * @param uid
     * * @param
     */
    async getAgentForPlayerGoldRecordList(managerAgent: string = null,  page: number = 1, pageSize: number = 20 ,startTime:string , endTime :string ,uid : string): Promise<any> {
        try {

            /** Step x: managerAgent存在查询下面所有代理的上下分 */
            if(managerAgent){
                const agentList = await PlatformNameAgentListRedisDao.findOne({platformName : managerAgent} , false);
                let where = null;
                if(startTime && startTime){
                    where = `ThirdGoldRecord.createDateTime > "${startTime}"
                             AND ThirdGoldRecord.createDateTime < "${endTime}"`;
                }

                if(uid){
                    if(where){
                        where = where + ` AND ThirdGoldRecord.fk_uid = "${uid}"`;
                    }else {
                        where =  `ThirdGoldRecord.uid = ${uid}`;
                    }
                }
                if(!agentList || agentList.length == 0){
                    if(where){
                        where = where + ` AND ThirdGoldRecord.agentRemark = "${managerAgent}"`;
                    }else {
                        where =  `ThirdGoldRecord.agentRemark = "${managerAgent}"`;
                    }

                }else {
                    const list =[];
                    agentList.forEach(x=>{
                        list.push(`"${x}"`)
                    });
                    if(where){
                        where = where + ` AND ThirdGoldRecord.agentRemark in (${list})`;
                    }else {
                        where =  `ThirdGoldRecord.agentRemark in (${list})`;
                    }
                }

                const { list, count } = await ThirdGoldRecordMysqlDao.getAgentForPlayerGoldRecordList(where  ,page , pageSize);
                if(list && list.length !== 0){
                    if(managerAgent == '459pt'){
                        const recordList = list.map((info)=>{
                            info.agentRemark = this.agentForChangeName(info.agentRemark);
                            return info;
                        });
                        return { record : recordList, allLength : count  };
                    };
                }
                return { record: list, allLength: count };
            }else {
                return { record : [], allLength : 0 };
            }
        } catch (error) {
            logger.warn(`addPlatformGold ==>error: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 获取所有租户运营数据 =====获取当日的代理数据
     * @param startTimestamp 开始时间戳
     * @param endTimestamp 截止时间戳
     * @returns Array
     */
    async getTenantOperationalDataList( platformUid : string, currentPage: number, pageSize: number) {
        try {
            let startTimestamp = null ;
            let endTimestamp = null;

            const dyadicArray = await DateTime2GameRecordService.breakUpDate(startTimestamp, endTimestamp);
            /** 判断采用哪一种查询方式 */
            const [dayBeforeYesterdayDate, todayDate] = dyadicArray;
                // 查今日
            const [startDateTime, endDateTime] = todayDate;
            // let startDateTime = "2021-07-26 00:00:00";
            // let endDateTime = "2021-07-26 23:59:59";
            let tableName = moment().format("YYYYMM");
            let  total = await TenantGameDataDao.getTenantOperationalDataListForToday(platformUid,startDateTime, endDateTime ,tableName);


            /**
             *  注  单  量:  recordCount
             有效投注额： validBetTotal
             赢  单  额： winCount
             输  单  额： loseCount
             赢  单  量： winTotal
             输  单  量： loseTotal
             游戏  输赢： profitTotal
             胜      率： winRate1
             赢      率： winRate2
             */
            // const startDateTime: string = !!startTimestamp ? `"${moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss")}"` : "DATE_FORMAT(now(), '%Y-%m-%d 00:00:00')";

            // const endDateTime: string = !!endTimestamp ? `"${moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss")}"` : "DATE_FORMAT(now(), '%Y-%m-%d 23:59:59')";

            // const total = await TenantGameDataDao.getTenantOperationalDataList(startDateTime, endDateTime);

            // const totalSize = total.length;

            // const startPageSize = (currentPage - 1) * pageSize;

            // const list = total.slice(startPageSize, startPageSize + pageSize);
            if(total.length == 0){
                return { totalSize: 1, list: [] };
            }
            const res = total.map((info) => {
                const { winCount, recordCount, profitTotal, validBetTotal } = info;
                const winRate1 = winCount > 0 ? (winCount / recordCount).toFixed(4) : 0;
                const winRate2 = validBetTotal > 0 ? (  ( (-Number(profitTotal))  )/ validBetTotal).toFixed(4) : 0;
                info.profitTotal =  Math.floor(-Number(profitTotal));
                return { winRate1, winRate2, loseCount: recordCount - winCount, ...info };
            });
            res.sort((a,b)=> Number(b.validBetTotal) - Number(a.validBetTotal));
            return { totalSize: 1, list: res };
        } catch (e) {
            return Promise.reject(e);
        }
    }


    /**
     * 搜索租户号获取租户的信息
     * @param startTimestamp 开始时间戳
     * @param endTimestamp 截止时间戳
     * @returns Array
     */
    async selectTenantData( groupRemark: string) {
        try {
            /** Step 1: 平台是否已存在 */
            const platformInfo = await PlayerAgentMysqlDao.findOne({ platformName: groupRemark });
            if(!platformInfo){
                return Promise.reject(new GmsApiResultVO(HttpCode.FAIL, null, "代理不存在"));
            }
            let list = [];
            const info = {
                winRate1 : 0,
                winRate2 : 0,
                loseCount : 0,
                recordCount : 0,
                groupRemark : platformInfo.platformName,
                parent_uid : platformInfo.parentUid,
                uid : platformInfo.uid,
                validBetTotal : 0,
                winCount : 0,
                winTotal : 0,
                loseTotal : 0,
                profitTotal : 0,
                bet_commissionTotal : 0,
                win_commissionTotal : 0,
                settle_commissionTotal : 0,
            }
            list.push(info);
            return { totalSize: 1, list: list };
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * 租户当日数据风控=====获取当日的游戏数据
     * @param uid
     * @param startTimestamp
     * @param endTimestamp
     * @param currentPage
     * @param pageSize
     *
     */
    async getTenantGameData(platformUid : string ,groupRemark: string,  currentPage: number, pageSize: number) {
        try {
            let startTimestamp = null;
            let endTimestamp = null;
            const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${groupRemark}`;

            const beExistence = await TenantGameDataRedisDao.exits(uniqueDateTime);

            if (beExistence) {
                return await TenantGameDataRedisDao.findOne(uniqueDateTime);
            }
            const dyadicArray = await DateTime2GameRecordService.breakUpDate(startTimestamp, endTimestamp);

            const [dayBeforeYesterdayDate, todayDate] = dyadicArray;
            let tableName = moment().format("YYYYMM");
            const total = await TenantGameDataDao.getTenantGameData(platformUid ,groupRemark, todayDate[0], todayDate[1] , tableName);

            // const total = await TenantGameDataDao.getTenantGameData(uid, startDateTime, endDateTime);

            // const totalSize = total.length;

            // const startPageSize = (currentPage - 1) * pageSize;

            // const list = total.slice(startPageSize, startPageSize + pageSize);

            const res = total.map((info) => {
                const { winCount, recordCount, profitTotal, validBetTotal } = info;
                const winRate1 = winCount > 0 ? (winCount / recordCount).toFixed(4) : 0;
                const winRate2 = validBetTotal > 0 ?  ( (-Number(profitTotal))  / validBetTotal).toFixed(4) : 0;
                info.profitTotal =  Math.floor(-Number(profitTotal));
                return { winRate1, winRate2, loseCount: recordCount - winCount, ...info };
            });

            if (total.length > 0) {
                await TenantGameDataRedisDao.insertOne(uniqueDateTime, { totalSize: 1, list: res });
            }

            return { totalSize: 1, list: res };
        } catch (e) {
            return Promise.reject(e);
        }
    }


    /**
     * 代理盈亏报表
     * @param platformUid
     * @param startTimestamp
     * @param endTimestamp
     * @param currentPage
     * @param pageSize
     */

    async platformProfitAndLossData(platform: string = null, startTimestamp: number = null, endTimestamp: number = null, currentPage: number = 1, pageSize: number) {
        try {
            platform = platform ? platform : null;
            /**
             * 先查找redis 里面有没有
             */
            const platformNameList = await PlatformNameAgentListRedisDao.findList(false);
            //判断  platform   是否存在
            // console.warn("先走redis")
            if(platform){
            /** 1 判断是否是分代理  */
                const key = platformNameList.find(x=>x.platformName == platform);
                //是分代
                if(!key){
                    const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platform}`;
                    const result : any = await PlatformProfitAndLossDataRedisDao.findOne(uniqueDateTime);
                    if(result){
                        const list = result.list.map((info)=>{
                            info.groupRemark = this.agentForChangeName(info.groupRemark);
                            return info;
                        });
                        return {  totalSize: 1 , list: list };
                    }

                }else{
                    // 如果是平台
                    const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platform}`;
                    const result : any = await PlatformProfitAndLossDataRedisDao.findOne(uniqueDateTime);
                    let resultList = [];
                    if(result){
                        let list = key.list;
                        let info = {
                            recordCount: 0,
                            validBetTotal: 0,
                            winCount: 0,
                            winTotal: 0,
                            loseTotal: 0,
                            loseCount: 0,
                            profitTotal: 0,
                            commission: 0,
                            winRate2: 0,
                            groupRemark: key.platformName,
                            parentUid: null,
                            startTime: moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                            endTime: moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                        };
                        for(let m of list){
                            const item = result.list.find(x=>x.groupRemark == m );
                            if(item){
                                info.recordCount += Number(item.recordCount);
                                info.validBetTotal += Number(item.validBetTotal);
                                info.winCount += Number(item.winCount);
                                info.winTotal += Number(item.winTotal);
                                info.loseTotal += Number(item.loseTotal);
                                info.loseCount += Number(item.loseCount);
                                info.profitTotal += Number(item.profitTotal);
                                info.commission += Number(item.commission);
                            }
                        }
                        info.winRate2 = Number(info.validBetTotal > 0 ? ( info.profitTotal / info.validBetTotal).toFixed(4) : 0);
                        resultList.push(info);
                        return {  totalSize: 1 , list: resultList };
                    }
                }
            }else{
                 let redisResult = [];
                 for(let platformRedis of platformNameList){
                     const platformName = platformRedis.platformName;
                     const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platformName}`;
                     const result : any = await PlatformProfitAndLossDataRedisDao.findOne(uniqueDateTime);
                     if(result){
                         redisResult.push({platformName : platformName , list : result });
                     }
                 }
                 // redis存的平台数据汇报必须和平台数量一致才能走redis,不然从走数据库
                 if(redisResult.length == platformNameList.length){
                     //如果不存在 那么就查询所有平台
                     let resultList = [];
                     for (let key of platformNameList) {
                         const list = key.list;
                         const platformName = key.platformName;
                         // const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platformName}`;
                         // const result : any = await PlatformProfitAndLossDataRedisDao.findOne(uniqueDateTime);
                         const result = redisResult.find(x=>x.platformName == platformName);
                         if(result){
                             let info = {
                                 recordCount: 0,
                                 validBetTotal: 0,
                                 winCount: 0,
                                 winTotal: 0,
                                 loseTotal: 0,
                                 loseCount: 0,
                                 profitTotal: 0,
                                 commission: 0,
                                 winRate2: 0,
                                 groupRemark: key.platformName,
                                 parentUid: null,
                                 startTime: moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                                 endTime: moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                             };
                             for(let m of list){
                                 const item = result.list.list.find(x=>x.groupRemark == m );
                                 if(item){
                                     info.recordCount += Number(item.recordCount);
                                     info.validBetTotal += Number(item.validBetTotal);
                                     info.winCount += Number(item.winCount);
                                     info.winTotal += Number(item.winTotal);
                                     info.loseTotal += Number(item.loseTotal);
                                     info.loseCount += Number(item.loseCount);
                                     info.profitTotal += Number(item.profitTotal);
                                     info.commission += Number(item.commission);
                                 }
                             }
                             info.winRate2 = Number(info.validBetTotal > 0 ? ( info.profitTotal / info.validBetTotal).toFixed(4) : 0);
                             resultList.push(info);
                         }
                     }
                     if(resultList.length > 0){
                         return {  totalSize: 1 , list: resultList };
                     }
                 }

            }
            // console.warn("走数据库")
            // 走数据库流程
            const dyadicArray = await DateTime2GameRecordService.newBreakUpDate(startTimestamp, endTimestamp);

            let total = [];
            // 无平台、代理id 则查询全平台
            let tableName = moment(startTimestamp).format("YYYYMM");
            if (!platform) {
                let platformUidList = await PlatformNameAgentListRedisDao.findAllPlatformUidList(false);
                if(platformUidList.length == 0){
                    return Promise.reject(new GmsApiResultVO(HttpCode.FAIL, null, "平台号获取参数失败"));
                }
                total = await TenantGameDataDao.getAllPlatformGameData(platformUidList , dyadicArray , null , tableName);
            } else {
                const platformInfo = await PlayerAgentMysqlDao.findOne({ platformName: platform });

                if (!platformInfo) {
                    return { totalSize: 0, list: [] };
                }
                // 判断身份是平台还是代理 ,
                const { roleType, platformGold, platformName } = platformInfo;
                if (roleType === 2) {
                    //只查询一个平台数据
                    const agentList = await PlatformNameAgentListRedisDao.findOne({platformName:platformName});
                    const list =[];
                    agentList.forEach(x=>{
                        list.push(`"${x}"`)
                    });
                    let platformUid = platformInfo.uid;
                    total = await TenantGameDataDao.getPlatformGameData(dyadicArray ,platformUid, tableName , list);
                } else {
                    let platformUid = platformInfo.rootUid;
                    // 代理
                    total = await TenantGameDataDao.getOnePlatformGameData(dyadicArray, platformName , tableName, platformUid);

                }

            }

            if(!total || total.length == 0){
                return {  totalSize: 1 , list: [] };
            }

            /**
             * 这里有一个问题求不求和的问题，到时候问需求，先不求和
             */
            let list = [];
            for(let key of total){
                let item = list.find(x=>x.groupRemark == key.groupRemark);
                if(!item){
                    list.push(key);
                }else{
                    item.recordCount = Number(item.recordCount) +  Number(key.recordCount);
                    item.validBetTotal = Number(item.validBetTotal) +  Number(key.validBetTotal);
                    item.winCount = Number(item.winCount) +  Number(key.winCount);
                    item.winTotal = Number(item.winTotal) +  Number(key.winTotal);
                    item.loseTotal =Number(item.loseTotal) +  Number(key.loseTotal);
                    item.profitTotal = Number(item.profitTotal) +  Number(key.profitTotal);
                    item.bet_commissionTotal = Number(item.bet_commissionTotal) +  Number(key.bet_commissionTotal);
                    item.win_commissionTotal = Number(item.win_commissionTotal) +  Number(key.win_commissionTotal);
                    item.settle_commissionTotal = Number(item.settle_commissionTotal) +  Number(key.settle_commissionTotal);
                    const index = list.findIndex(x=>x.groupRemark == key.groupRemark);
                    list.splice(index, 1);
                    list.push(item);
                }
            }

            const res = list.map((info) => {
                const { recordCount, winCount, profitTotal, validBetTotal, bet_commissionTotal, win_commissionTotal, settle_commissionTotal } = info;
                const commission = Math.floor(Number(bet_commissionTotal) + Number(win_commissionTotal) + Number(settle_commissionTotal));
                const winRate2 = validBetTotal > 0 ?  ((-Number(profitTotal))    / validBetTotal).toFixed(4) : 0;
                delete info.bet_commissionTotal;
                delete info.win_commissionTotal;
                delete info.settle_commissionTotal;
                info.profitTotal =  Math.floor(-Number(profitTotal));
                return {
                    winRate2, loseCount: recordCount - winCount, commission,
                    ...info
                };
            });


            /** 把代理的数据汇总成平台  */
            let resultList = [];
            if(platform){
                const key = platformNameList.find(x=>x.platformName == platform);
                if(!key){
                    const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platform}`;
                    await PlatformProfitAndLossDataRedisDao.insertOne(uniqueDateTime, { list: res });
                    const list =  res.map((info)=>{
                        info.groupRemark = this.agentForChangeName(info.groupRemark);
                        return info;
                    });
                    return {  totalSize: 1 , list: list };
                }else {
                    let list = key.list;
                    let info = {
                        recordCount: 0,
                        validBetTotal: 0,
                        winCount: 0,
                        winTotal: 0,
                        loseTotal: 0,
                        loseCount: 0,
                        profitTotal: 0,
                        commission: 0,
                        winRate2: 0,
                        groupRemark: key.platformName,
                        parentUid: null,
                        startTime: moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                        endTime: moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                    };
                    let platformOneResultList = [];
                    for(let m of list){
                        const item = res.find(x=>x.groupRemark == m );
                        if(item){
                            info.recordCount += Number(item.recordCount);
                            info.validBetTotal += Number(item.validBetTotal);
                            info.winCount += Number(item.winCount);
                            info.winTotal += Number(item.winTotal);
                            info.loseTotal += Number(item.loseTotal);
                            info.loseCount += Number(item.loseCount);
                            info.profitTotal += Number(item.profitTotal);
                            info.commission += Number(item.commission);
                            platformOneResultList.push(item);
                        }
                    }

                    info.winRate2 = Number(info.validBetTotal > 0 ? ( info.profitTotal / info.validBetTotal).toFixed(4) : 0);
                    resultList.push(info);
                    //存入redis
                    if(platformOneResultList.length > 0 ){
                        const platform = key.platformName;
                        const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platform}`;
                        await PlatformProfitAndLossDataRedisDao.insertOne(uniqueDateTime, { list: platformOneResultList });
                    }
                    return {  totalSize: 1 , list: resultList };
                }

            }

            for (let key of platformNameList) {
                const list = key.list;
                let info = {
                    recordCount: 0,
                    validBetTotal: 0,
                    winCount: 0,
                    winTotal: 0,
                    loseTotal: 0,
                    loseCount: 0,
                    profitTotal: 0,
                    commission: 0,
                    winRate2: 0,
                    groupRemark: key.platformName,
                    parentUid: null,
                    startTime: moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                    endTime: moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                };
                // 存入redis的数组
                let platformResultList = [];
                for(let m of list){
                    const item = res.find(x=>x.groupRemark == m );
                    if(item){
                        info.recordCount += Number(item.recordCount);
                        info.validBetTotal += Number(item.validBetTotal);
                        info.winCount += Number(item.winCount);
                        info.winTotal += Number(item.winTotal);
                        info.loseTotal += Number(item.loseTotal);
                        info.loseCount += Number(item.loseCount);
                        info.profitTotal += Number(item.profitTotal);
                        info.commission += Number(item.commission);
                        platformResultList.push(item);
                    }
                }

                info.winRate2 = Number(info.validBetTotal > 0 ? ( info.profitTotal / info.validBetTotal).toFixed(4) : 0);
                resultList.push(info);
                //存入redis
                if(platformResultList.length > 0 ){
                    const platform = key.platformName;
                    const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platform}`;
                    await PlatformProfitAndLossDataRedisDao.insertOne(uniqueDateTime, { list: platformResultList });
                }

            }
            return {  totalSize: 1 , list: resultList };

        } catch (e) {
            return Promise.reject(e);
        }
    }



    /**
     * 代理盈亏报表
     * @param platformUid
     * @param startTimestamp
     * @param endTimestamp
     * @param currentPage
     * @param pageSize
     */

    async agentProfitAndLossData(platform: string = null, groupRemark: string, startTimestamp: number = null, endTimestamp: number = null, currentPage: number = 1, pageSize: number = 100) {
        try {
            platform = platform ? platform : null;
            const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${groupRemark}`;
            /**先在redis里面取  */
            const beExistence = await PlatformProfitAndLossDataRedisDao.exits(uniqueDateTime);
            if (beExistence) {
                    /** 把代理的数据汇总成平台  */
                    const res1: any = await PlatformProfitAndLossDataRedisDao.findOne(uniqueDateTime);
                // console.warn("走redis")
                if(platform && platform == '459pt'){
                    const list = res1.list.map((info)=>{
                        info.groupRemark = this.agentForChangeName(info.groupRemark);
                        return info;
                    });
                    return {totalSize: 1, list: list};
                }else{
                    return {totalSize: 1, list: res1.list};
                }

             }

            const dyadicArray = await DateTime2GameRecordService.newBreakUpDate(startTimestamp, endTimestamp);

            let total = [];
            // 无平台、代理id 则查询全平台
            let tableName = moment(startTimestamp).format("YYYYMM");
            const platformInfo = await PlayerAgentMysqlDao.findOne({platformName: groupRemark});

            if (!platformInfo) {

                return {totalSize: 0, list: []};
            }
            // console.warn("走数据库")
            // 判断身份是平台还是代理 ,
            const {roleType, platformGold, platformName , rootUid } = platformInfo;
            if (roleType === 2) {
                //只查询一个平台数据
                const agentList = await PlatformNameAgentListRedisDao.findOne({platformName: platformName});
                const list = [];
                agentList.forEach(x => {
                    list.push(`"${x}"`)
                });
                let platformUid = rootUid;
                total = await TenantGameDataDao.getPlatformGameData(dyadicArray, platformUid, tableName, list);
            } else {
                // 代理
                let platformUid = rootUid;
                total = await TenantGameDataDao.getOnePlatformGameData(dyadicArray, platformName, tableName , platformUid);

            }


            if (total.length == 0) {
                return {totalSize: 1, list: []};
            }

            /**
             * 这里有一个问题求不求和的问题，到时候问需求，先不求和
             */

            let list = [];
            for (let key of total) {
                let item = list.find(x => x.groupRemark == key.groupRemark);
                if (!item) {
                    list.push(key);
                } else {
                    item.recordCount = Number(item.recordCount) + Number(key.recordCount);
                    item.validBetTotal = Number(item.validBetTotal) + Number(key.validBetTotal);
                    item.winCount = Number(item.winCount) + Number(key.winCount);
                    item.winTotal = Number(item.winTotal) + Number(key.winTotal);
                    item.loseTotal = Number(item.loseTotal) + Number(key.loseTotal);
                    item.profitTotal = Number(item.profitTotal) + Number(key.profitTotal);
                    item.bet_commissionTotal = Number(item.bet_commissionTotal) + Number(key.bet_commissionTotal);
                    item.win_commissionTotal = Number(item.win_commissionTotal) + Number(key.win_commissionTotal);
                    item.settle_commissionTotal = Number(item.settle_commissionTotal) + Number(key.settle_commissionTotal);
                    const index = list.findIndex(x => x.groupRemark == key.groupRemark);
                    list.splice(index, 1);
                    list.push(item);
                }
            }


            const res = list.map((info) => {

                const {recordCount, winCount, profitTotal, validBetTotal, bet_commissionTotal, win_commissionTotal, settle_commissionTotal} = info;
                const commission = Math.floor(Number(bet_commissionTotal) + Number(win_commissionTotal) + Number(settle_commissionTotal));
                const winRate2 = validBetTotal > 0 ?  ((-Number(profitTotal)) / validBetTotal).toFixed(4) : 0;
                delete info.bet_commissionTotal;
                delete info.win_commissionTotal;
                delete info.settle_commissionTotal;
                info.profitTotal =  Math.floor(-Number(profitTotal)) ;
                if(platform && platform == '459pt') {
                    info.groupRemark = this.agentForChangeName(info.groupRemark);
                }
                return {
                    winRate2, loseCount: recordCount - winCount, commission,
                    ...info
                };
            });
            //存入redis
            if(res.length > 0 ){
                const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platformName}`;
                await PlatformProfitAndLossDataRedisDao.insertOne(uniqueDateTime, { list: res });
            }
            return {totalSize: 1, list: res};

        } catch (e) {
            return Promise.reject(e);
        }
    }


    /**
     * 获取租户的游戏数据
     * @param uid
     * @param startTimestamp
     * @param endTimestamp
     * @param currentPage
     * @param pageSize
     */
    async agentGameRecordData(groupRemark: string, startTimestamp: number = null, endTimestamp: number = null, currentPage: number = 1, pageSize: number = 20) {
        try {
            const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${groupRemark}`;

            const beExistence = await AgentProfitAndLossDataRedisDao.exits(uniqueDateTime);

            if (beExistence) {
                return await AgentProfitAndLossDataRedisDao.findOne(uniqueDateTime);
            }
            const platformUid = await PlatformNameAgentListRedisDao.findPlatformUidForAgent({agent : groupRemark});
            if(!platformUid){
                return Promise.reject(new GmsApiResultVO(HttpCode.FAIL, null, "该代理的平台号不存在"));
            }
            const dyadicArray = await DateTime2GameRecordService.breakUpDate(startTimestamp, endTimestamp);

            const [dayBeforeYesterdayDate, todayDate] = dyadicArray;

            let total = [];

            if (dayBeforeYesterdayDate.length > 0 && todayDate.length > 0) {
                // 联合
                total = await TenantGameDataDao.getTenantGameYesterDayData(platformUid, groupRemark,dyadicArray);
            } else if (todayDate.length > 0) {
                // 查今日
                const [startDateTime, endDateTime] = todayDate;
                const tableName = moment().format("YYYYMM");
                total = await TenantGameDataDao.getTenantGameData(platformUid, groupRemark,startDateTime, endDateTime ,tableName);
            } else if (dayBeforeYesterdayDate.length > 0) {
                // 查昨日
                total = await TenantGameDataDao.getTenantGameYesterDayData(platformUid , groupRemark,dyadicArray);
            }
            /**
             * 得到的结果进行求和,因为得到的结果数组对象里面可能有两个：777的游戏数据条数
             */

            if(total.length == 0){

                return {  totalSize: 1 , list: [] };
            }

            let list = [];
            for(let key of total){
                let item = list.find(x=>x.gameName == key.gameName);
                if(!item){
                    list.push(key);
                }else{
                    item.recordCount = Number(item.recordCount) +  Number(key.recordCount);
                    item.validBetTotal = Number(item.validBetTotal) +  Number(key.validBetTotal);
                    item.winCount = Number(item.winCount) +  Number(key.winCount);
                    item.winTotal = Number(item.winTotal) +  Number(key.winTotal);
                    item.loseTotal =Number(item.loseTotal) +  Number(key.loseTotal);
                    item.profitTotal = Number(item.profitTotal) +  Number(key.profitTotal);
                    item.bet_commissionTotal = Number(item.bet_commissionTotal) +  Number(key.bet_commissionTotal);
                    item.win_commissionTotal = Number(item.win_commissionTotal) +  Number(key.win_commissionTotal);
                    item.settle_commissionTotal = Number(item.settle_commissionTotal) +  Number(key.settle_commissionTotal);
                    const index = list.findIndex(x=>x.gameName == key.gameName);
                    list.splice(index, 1);
                    list.push(item);
                }
            }


            const res = list.map((info) => {
                const { recordCount, winCount, profitTotal, validBetTotal, bet_commissionTotal, win_commissionTotal, settle_commissionTotal } = info;
                const commission = Math.floor(Number(bet_commissionTotal) + Number(win_commissionTotal) + Number(settle_commissionTotal));
                const winRate2 = validBetTotal > 0 ?  ( (-Number(profitTotal))   / validBetTotal).toFixed(4) : 0;
                delete info.bet_commissionTotal;
                delete info.win_commissionTotal;
                delete info.settle_commissionTotal;
                info.profitTotal = Math.floor(-Number(profitTotal)) ;
                return { winRate2, loseCount: recordCount - winCount, commission, ...info };
            });

            if (list.length > 0) {
                await AgentProfitAndLossDataRedisDao.insertOne(uniqueDateTime, { totalSize: 1, list: res });
            }

            return { totalSize: 1, list: res };
        } catch (e) {
            return Promise.reject(e);
        }
    }


    /**
     * 获取租户的游戏数据
     * @param uid
     * @param startTimestamp
     * @param endTimestamp
     * @param currentPage
     * @param pageSize
     */
    async getPlatformUidList() {
        try {
            const platformUidList = await PlatformNameAgentListRedisDao.findAllPlatformUidList(false);
            return  platformUidList ;
        } catch (e) {
            return Promise.reject(e);
        }
    }


    /**
     * 获取某一个平台下面的所有租户
     * @param uid
     * @param startTimestamp
     * @param endTimestamp
     * @param currentPage
     * @param pageSize this.agentForChangeName(info.groupRemark);
     */
    async getPlatformForAgent(platformName : string) {
        try {
            const agentList = await PlatformNameAgentListRedisDao.findOne({platformName : platformName},false);
            if(platformName == '459pt'){
                let list = agentList.map( m =>{
                    return this.agentForChangeName(m)
                });
                return  list;
            }else {
                return  agentList ;
            }

        } catch (e) {
            return Promise.reject(e);
        }
    }


    /* 获取平台的游戏配置列表
     * getPlatformGameList
     * @param
     */
    async getPlatformGameList(platformName :string,): Promise<any> {
        try {
            let gameList = [];
            //获取所有开放的游戏
            const allGames = await GameManager.findList({});
            const openGames = allGames.filter(x=>x.opened == true);
            //获取平台关闭游戏的
            //从数据库里面获取
            const platform = await PlayerAgentMysqlDao.findOne({platformName : platformName});
            if(!platform){
                return null;
            }
            let closeGameList = []
            if(platform.closeGameList ){
                closeGameList = platform.closeGameList.split(',');
            }

            for(let game of openGames){
                const key = closeGameList.find(x=>x == game.nid);
                let opened = true;
                if(key){
                    opened = false;
                }
                gameList.push({
                    zname: game.zname,
                    nid: game.nid,
                    sort : game.sort,
                    opened: opened })
            }
            return gameList;
        } catch (error) {
            return Promise.reject(error);
        }
    }



    /* 设置平台的游戏开关
     * getPlatformGameList
     * @param
     */
    async setPlatformCloseGame(platformName :string, closeGameList: string []): Promise<any> {
        try {
            let platform = await PlayerAgentMysqlDao.findOne({platformName : platformName});
            if(!platform){
                return Promise.reject("该平台不存在");
            }
            if(closeGameList && closeGameList.length > 0){
                let closeGameString = closeGameList.toString();
                //先跟新数据库
                await PlayerAgentMysqlDao.updateOne({platformName : platformName }, { closeGameList :closeGameString });
                await PlatformNameAgentListRedisDao.insertPlatformCloseGame({platformName : platformName ,closeGameList : closeGameList });
            }else {
                //先跟新数据库
                await PlayerAgentMysqlDao.updateOne({platformName : platformName }, { closeGameList :null });
                await PlatformNameAgentListRedisDao.insertPlatformCloseGame({platformName : platformName ,closeGameList : [] });
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * 平台分代的表映射
     * @param uid
     * @param startTimestamp
     * @param endTimestamp
     * @param currentPage
     * @param pageSize
     */

     agentForChangeName(agent : string ){
        const agentName = agent_name.find(x=>x.old == agent);
        if(agentName){
            return agentName.new;
        }else{
            return agent;
        }
    }



}

