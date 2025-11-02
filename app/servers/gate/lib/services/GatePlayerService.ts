import { pinus, Logger } from "pinus";
import { getLogger } from 'pinus-logger';
import PlayerManager from "../../../../common/dao/daoManager/Player.manager";
import { random } from "../../../../utils/index";
import { PlayerBuilder } from "../../../../common/dao/mysql/builder/Player.builder";
import SystemConfigManager from "../../../../common/dao/daoManager/SystemConfig.manager";
import DayCreatePlayer from "../../../../common/dao/redis/DayCreatePlayer.redis.dao";
import PlayerAgentMysqlDao from "../../../../common/dao/mysql/PlayerAgent.mysql.dao";
import PlayerRebateMysqlDao from "../../../../common/dao/mysql/PlayerRebate.mysql.dao";
import PlayerAgentRedisDao from "../../../../common/dao/redis/PlayerAgent.redis.dao";

export class GatePlayerService {

    private logger: Logger;
    private lineCodeList: string[];
    constructor() {
        this.logger = getLogger("server_out", __filename);
        this.lineCodeList = ['line_1'];
    }

    public async createPlayer(guestId: string = null, superior: string = null, group_id: string = null, thirdUid: string = null, groupRemark: string = null, language: string = null, lineCode: string = null, shareUid: string = null, rom_type: string = null) {
        try {
            const playerImpl = await new PlayerBuilder()
                .createPlayer()
                .setGuestId(guestId)
                .setPlayerRole()
                .setThirdUid(superior, group_id, thirdUid, groupRemark, language, lineCode, shareUid, rom_type)
                .getPlayerImpl();
            const cfg = await SystemConfigManager.findOne({ id: 1 });

            playerImpl.gold = cfg.startGold || 0;
            //修改玩家语言
            if (!language && cfg.languageForWeb) {
                playerImpl.language = cfg.languageForWeb;
            }

            const p = await PlayerManager.insertOne(playerImpl);
            //如果当日有玩家新增就添加玩家新增记录在redis 里面
            await DayCreatePlayer.insertOne({ uid: p.uid, createTime: Date.now() });
            return !!p ? p : null;
        } catch (e) {
            let ServerId = pinus.app && pinus.app.getServerId() || "";
            this.logger.error(`网关服务器 ${ServerId} | 玩家服务 | 创建玩家出错: ${e.stack}`);
            return null;
        }
    }

    public async checkPlayerExits(guestid: string, defaultChannelCode: string, channelCode: string, shareUid: string, rom_type: string) {
        try {
            //判断分享推广人是否存在
            if (shareUid && shareUid.length == 8) {
                const playerAgent = await PlayerAgentMysqlDao.findOne({ uid: shareUid });
                if (!playerAgent) {
                    shareUid = null;
                }
            } else {
                shareUid = null;
            }

            let player = null;
            if (guestid) {
                player = await PlayerManager.findOne({ guestid }, true);
            }
            if (!player) {
                //玩家不存在要创建账号的时候，设置站点
                // let index = random(0,14);
                let lineCode = this.lineCodeList[0];
                /**
                 * 判断是否存在参数platformName平台名称，绑定代理关系，根据代理的语言设置玩家的语言
                 */
                if (channelCode) {
                    const platfromInfo = await PlayerAgentRedisDao.findOne({ platformName: channelCode });
                    if (!platfromInfo) {
                        //就默认代理
                        const platfromInfo = await PlayerAgentRedisDao.findOne({ platformName: defaultChannelCode });
                        if (platfromInfo) {
                            /** 创建玩家 */
                            player = await this.createPlayer(null, platfromInfo.uid, platfromInfo.rootUid, null, platfromInfo.platformName, null, lineCode, shareUid, rom_type);
                            /** 建立代理关系 */
                            PlayerAgentMysqlDao.insertOne({
                                uid: player.uid,
                                parentUid: platfromInfo.uid,
                                rootUid: platfromInfo.rootUid,
                                platformName: player.uid,
                                platformGold: 0,
                                deepLevel: platfromInfo.deepLevel + 1,
                                roleType: 1,
                                status: 1,
                                // language: platfromInfo.language,
                            });
                            // 今日邀请人数的增加
                            if (shareUid) {
                                PlayerRebateMysqlDao.updateAddDayPeople(shareUid, 1);
                            }

                        } else {
                            player = await this.createPlayer();
                        }
                    } else {
                        /** 创建玩家 */
                        player = await this.createPlayer(null, platfromInfo.uid, platfromInfo.rootUid, null, platfromInfo.platformName, null, lineCode, shareUid, rom_type);
                        /** 建立代理关系 */
                        PlayerAgentMysqlDao.insertOne({
                            uid: player.uid,
                            parentUid: platfromInfo.uid,
                            rootUid: platfromInfo.rootUid,
                            platformName: player.uid,
                            platformGold: 0,
                            deepLevel: platfromInfo.deepLevel + 1,
                            roleType: 1,
                            status: 1,
                            // language: platfromInfo.language,
                        });
                        // 今日邀请人数的增加
                        if (shareUid) {
                            PlayerRebateMysqlDao.updateAddDayPeople(shareUid, 1);
                        }
                    }

                } else {
                    if (defaultChannelCode) {
                        const platfromInfo = await PlayerAgentRedisDao.findOne({ platformName: defaultChannelCode });
                        if (platfromInfo) {
                            /** 创建玩家 */
                            player = await this.createPlayer(null, platfromInfo.uid, platfromInfo.rootUid, null, platfromInfo.platformName, null, lineCode, shareUid);
                            /** 建立代理关系 */
                            PlayerAgentMysqlDao.insertOne({
                                uid: player.uid,
                                parentUid: platfromInfo.uid,
                                rootUid: platfromInfo.rootUid,
                                platformName: player.uid,
                                platformGold: 0,
                                deepLevel: platfromInfo.deepLevel + 1,
                                roleType: 1,
                                status: 1,
                                // language: platfromInfo.language,
                            });
                            // 今日邀请人数的增加
                            if (shareUid) {
                                PlayerRebateMysqlDao.updateAddDayPeople(shareUid, 1);
                            }
                        } else {
                            player = await this.createPlayer(null, null, null, null, null, null, lineCode, null);
                        }

                    } else {
                        player = await this.createPlayer(null, null, null, null, null, null, lineCode, null);
                    }
                }

            }

            return player;
        } catch (e) {
            this.logger.error(`网关服务器 ${pinus.app.getServerId()} | 玩家服务 | 检测玩家存在或创建玩家出错: ${e.stack}`);
            return null;
        }
    }

}

export default new GatePlayerService();
