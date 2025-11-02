import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import * as buyuConst from './buyuConst';
import utils = require('../../../utils/index');
import buyuRoom from './Room';
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import utilsEx = require('../../../utils/utils');
/**一个玩家 */
export default class Player extends PlayerInfo {
    seat: number;
    /**子弹id 递增 */
    Bullet_id: number = 0;
    BulletInfoList: buyuConst.Bullet_info[] = [];
    /**炮台等级 */
    bullet_kind: number;
    /**击中鱼 赢取的金币 */
    profit: number = 0;
    /**击中鱼消耗的金币 */
    bet: number = 0;
    roundId = "";
    /**一局的历史记录 */
    record_history = { initgold: 0, Fire_num: 0, hit_fishs: {}, profit: 0 };
    constructor(i: number, opts: any, roomInfo: buyuRoom) {
        super(opts);
        this.seat = i;
        this.gold = utils.sum(opts.gold);
        this.bullet_kind = 0;
        this.roundId = utilsEx.genRoundId(roomInfo.nid, roomInfo.roomId);
        this.record_history.initgold = this.gold;
    }

    new_bullet_id() {
        this.Bullet_id++;
        if (this.Bullet_id > 100) {
            this.Bullet_id = 0;
        }
        return this.Bullet_id;
    }

    GetBulletInfo(bullet_id: number) {
        return this.BulletInfoList.find(m => m.Bullet_id == bullet_id);
    }

    strip() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            seat: this.seat,
            roundId: this.roundId,
            gold: utils.sum(this.gold),
            BulletInfoList: this.BulletInfoList,
            bullet_kind: this.bullet_kind
        }
    }

    addHit_fishs(roomInfo: buyuRoom, main_fish_info: buyuConst.Fish_info, multiple: number) {
        if (!this.record_history.hit_fishs[`${main_fish_info.kind}_${multiple}`]) {
            this.record_history.hit_fishs[`${main_fish_info.kind}_${multiple}`] = {
                kind: main_fish_info.kind, name: main_fish_info.name,
                multiple: main_fish_info.multiple, hit_fish_num: 1, profit: main_fish_info.multiple * multiple * roomInfo.bullet_value,
                bullet_value: multiple
            };
        } else {
            this.record_history.hit_fishs[`${main_fish_info.kind}_${multiple}`].hit_fish_num++;
            this.record_history.hit_fishs[`${main_fish_info.kind}_${multiple}`].profit += main_fish_info.multiple * multiple * roomInfo.bullet_value;
        }
    }

    /**结算 */
    async settlement(roomInfo: buyuRoom) {
        let bet = this.bet;
        let profit = this.profit;
        this.bet = 0;
        this.profit = 0;
        const record_history = utils.clone(this.record_history);
        // record_history.Fire_num -= this.BulletInfoList.length;
        record_history.profit = profit - bet;
        this.record_history = { initgold: 0, Fire_num: 0, hit_fishs: {}, profit: 0 };
        if (bet > 0) {
            const res = await createPlayerRecordService()
                .setPlayerBaseInfo(this.uid, false, this.isRobot , this.gold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(this.roundId, roomInfo.realPlayersNumber, 0)
                .setControlType(this.controlType)
                .setGameRecordInfo(Math.abs(bet), Math.abs(bet), profit - bet, false)
                .setGameRecordLivesResult(record_history)
                .sendToDB(1);
            this.roundId = utilsEx.genRoundId(roomInfo.nid, roomInfo.roomId);
            this.record_history.initgold = res.gold;
            //这个地方 同步一下结算期间，打死的鱼得到得利润，和当前|消耗子弹的消耗
            const tatalbet = this.BulletInfoList.reduce((sum, value) => sum + value.multiple * roomInfo.bullet_value, 0);
            this.gold = res.gold + this.profit - this.bet - tatalbet;
            this.initControlType();
        }
    }

    /**掉线的时候获取信息 */
    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat
        };
    }
}