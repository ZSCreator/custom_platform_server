import {Body, Controller, Post } from "@nestjs/common";
const log4js = require("log4js");
import OnlinePlayerRedisDao from '../../../../../common/dao/redis/OnlinePlayer.redis.dao';
import {pinus} from "pinus";
import ConnectionManager from "../../../../../common/dao/mysql/lib/connectionManager";
import {PlayerGameHistory} from "../../../../../common/dao/mysql/entity/PlayerGameHistory.entity";
import GameManager from "../../../../../common/dao/daoManager/Game.manager";
@Controller('rpc')
export class RpcHttpController {
    logger: any;

    constructor() {
        this.logger = log4js.getLogger('tixian_money_record');
    }

    /**
     * 上下分检查玩家是否有下注
     * @param info
     */
    @Post('lowerPlayerMoney')
    async lowerPlayerMoney(@Body() { uid , account }): Promise<any> {
        let serverId = null;
        try {
            if(!uid){
                return {code : 200 , isCanLower : false};
            }
            const onlinePlayer = await OnlinePlayerRedisDao.findOne({uid});

            if(!onlinePlayer){
                //如果玩家不在线，那么就从玩家进入从大厅进入游戏的历史记录里面获取
                const historyRecord = await ConnectionManager.getConnection(false)
                    .getRepository(PlayerGameHistory)
                    .createQueryBuilder("PlayerGameHistory")
                    .where("PlayerGameHistory.uid = :uid", { uid })
                    .orderBy("PlayerGameHistory.createDateTime", "DESC")
                    .getOne();

                if(!historyRecord){
                    return {code : 200 , isCanLower : true};
                }else{
                    const {nid , sceneId  , roomId   } = historyRecord;
                    const paramsData = { nid , uid, sceneId  , roomId , hallServerId : null };
                    const result = await this.checkPlayerLower(paramsData);
                    return  result;
                }
            }
            const {nid , sceneId  , roomId , hallServerId ,frontendServerId } = onlinePlayer;

            serverId = frontendServerId;

            if( nid == '-1'){
                pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
                await OnlinePlayerRedisDao.deleteOne({uid});
                return {code : 200 , isCanLower : true};
            }

            if(sceneId == -1){
                pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
                await OnlinePlayerRedisDao.deleteOne({uid});
                return {code : 200 , isCanLower : true};
            }
            const paramsData = { nid , uid, sceneId  , roomId ,hallServerId };
            const result = await this.checkPlayerLower(paramsData);
            if(result.code == 200){
                pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
                await OnlinePlayerRedisDao.deleteOne({uid});
            }
            return result;
        }catch (e) {
            this.logger.error(`uid: ${uid} ,account:${account}, e:${e.stack}`);
            if(serverId){
                pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(serverId, uid);
            }
            await OnlinePlayerRedisDao.deleteOne({uid});
            return {code : 200 , isCanLower : true};
        }

    }


    /**检查玩家是否可以下分 */
    async checkPlayerLower(paramsData) {
        try {

            let { nid , uid, sceneId  , roomId ,hallServerId } = paramsData;

            const { name  } = await GameManager.findOne({ nid });

            /** Step 1: 检测服务器状态 */
            if (!pinus.app.rpc[name]) {
                return {code: 200 , isCanLower : true};
            }
            if(!hallServerId){
                hallServerId =  `${name}-server-1`;
            }
            let result = await pinus.app.rpc[name].mainRemote.rpcLowerPlayer.toServer(hallServerId,{uid ,sceneId,roomId});

            if(result && result.code == 200){
                return {code: 200 , isCanLower : true};

            }
            return {code: 500 , isCanLower : false};
        } catch (e) {
            console.error(`检查玩家是否可以下分:${e}`);
            return {code: 200 , isCanLower : true};
        }
    };

}