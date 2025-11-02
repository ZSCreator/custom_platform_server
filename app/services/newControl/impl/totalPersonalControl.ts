import {TotalPersonalControlDAO} from '../DAO/totalPersonalControlDAO';
import {PersonalControlPlayer} from "..";
import OnlinePlayerDao from "../../../common/dao/redis/OnlinePlayer.redis.dao";


/**
 * 个人总调控 在此调控的玩家所有被调控的游戏都会被调控
 * @property DAO 数据模型
 */
export class TotalPersonalControl {

    /**
     * 添加调控玩家
     * @param controlPlayer 调控玩家
     */
    static async addPlayer(controlPlayer: PersonalControlPlayer) {
        await TotalPersonalControlDAO.getPersonalTotalControlDAO().addTotalControlPlayer(controlPlayer);

        // 检查玩家是否在线 如果在线则把玩家添加入调控玩家队列
        const isOnline = await OnlinePlayerDao.findOne({uid:controlPlayer.uid});
        // 如果在线添加入在线集合
        if (isOnline) {
            await this.addOnlinePlayer(controlPlayer.uid);
        }
    }

    /**
     * 删除调控玩家
     * @param uid
     */
    static async removePlayer(uid: string) {
        await TotalPersonalControlDAO.getPersonalTotalControlDAO().deleteControlPlayer(uid);
        // 不管在没在直接删
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().deleteOnlineControlPlayer(uid);
    }

    /**
     * 根据uid 差找一个玩家
     * @param uid
     */
    static async findPlayer(uid: string) {
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().find({uid});
    }

    /**
     * 添加
     * @param uid
     */
    static async addOnlinePlayer(uid: string): Promise<any> {
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().addOnlinePlayer(uid);
    }

    /**
     * 添加
     * @param uid
     */
    static async removeOnlinePlayer(uid: string): Promise<any> {
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().deleteOnlineControlPlayer(uid);
    }

    /**
     * 获取所有调控玩家uid
     */
    static async getAllPlayersUidList(): Promise<string[]> {
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().getControlPlayersUid();
    }


    /**
     * 获取所有调控玩家uid和调控值
     */
    static async getControlPlayers(): Promise<any[]> {
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().getControlPlayers();
    }

    /**
     * 获取玩家区间
     * @param where 查询条件
     * @param start 开始
     * @param stop 结束
     */
    static async getPlayersRange(where: object, start: number, stop: number) {
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().getControlPlayersRange(where, start, stop);
    }

    /**
     * 获取总的玩家数量
     * @param where
     */
    static async getPlayersCount(where: object) {
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().getControlPlayersCount(where);
    }

    /**
     * 获取在线玩家数量
     */
    static async getOnlinePlayersCount() {
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().getOnlinePlayersLength();
    }

    /**
     * 获取在线调控玩家区间
     */
    static async getOnlinePlayersUidRange(start: number, end: number) {
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().getOnlineControlPlayers(start, end);
    }

    /**
     * 清空在线调控玩家集合
     */
    static async clearOnlineSet() {
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().clearOnlineControlPlayersSet();
    }

    /**
     * 一键删除小黑屋
     * @param uid
     */
    static async removeControlPlayers(): Promise<any> {
        return TotalPersonalControlDAO.getPersonalTotalControlDAO().removeAll();
    }
}