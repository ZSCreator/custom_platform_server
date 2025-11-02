"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const utils = require("../../../utils/index");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const utilsEx = require("../../../utils/utils");
class Player extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts, roomInfo) {
        super(opts);
        this.Bullet_id = 0;
        this.BulletInfoList = [];
        this.profit = 0;
        this.bet = 0;
        this.roundId = "";
        this.record_history = { initgold: 0, Fire_num: 0, hit_fishs: {}, profit: 0 };
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
    GetBulletInfo(bullet_id) {
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
        };
    }
    addHit_fishs(roomInfo, main_fish_info, multiple) {
        if (!this.record_history.hit_fishs[`${main_fish_info.kind}_${multiple}`]) {
            this.record_history.hit_fishs[`${main_fish_info.kind}_${multiple}`] = {
                kind: main_fish_info.kind, name: main_fish_info.name,
                multiple: main_fish_info.multiple, hit_fish_num: 1, profit: main_fish_info.multiple * multiple * roomInfo.bullet_value,
                bullet_value: multiple
            };
        }
        else {
            this.record_history.hit_fishs[`${main_fish_info.kind}_${multiple}`].hit_fish_num++;
            this.record_history.hit_fishs[`${main_fish_info.kind}_${multiple}`].profit += main_fish_info.multiple * multiple * roomInfo.bullet_value;
        }
    }
    async settlement(roomInfo) {
        let bet = this.bet;
        let profit = this.profit;
        this.bet = 0;
        this.profit = 0;
        const record_history = utils.clone(this.record_history);
        record_history.profit = profit - bet;
        this.record_history = { initgold: 0, Fire_num: 0, hit_fishs: {}, profit: 0 };
        if (bet > 0) {
            const res = await (0, RecordGeneralManager_1.default)()
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.gold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(this.roundId, roomInfo.realPlayersNumber, 0)
                .setControlType(this.controlType)
                .setGameRecordInfo(Math.abs(bet), Math.abs(bet), profit - bet, false)
                .setGameRecordLivesResult(record_history)
                .sendToDB(1);
            this.roundId = utilsEx.genRoundId(roomInfo.nid, roomInfo.roomId);
            this.record_history.initgold = res.gold;
            const tatalbet = this.BulletInfoList.reduce((sum, value) => sum + value.multiple * roomInfo.bullet_value, 0);
            this.gold = res.gold + this.profit - this.bet - tatalbet;
            this.initControlType();
        }
    }
    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYnV5dS9saWIvUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUVBQW9FO0FBRXBFLDhDQUErQztBQUUvQyxtRkFBaUY7QUFDakYsZ0RBQWlEO0FBRWpELE1BQXFCLE1BQU8sU0FBUSx1QkFBVTtJQWMxQyxZQUFZLENBQVMsRUFBRSxJQUFTLEVBQUUsUUFBa0I7UUFDaEQsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBWmhCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFDdEIsbUJBQWMsR0FBNEIsRUFBRSxDQUFDO1FBSTdDLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkIsUUFBRyxHQUFXLENBQUMsQ0FBQztRQUNoQixZQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWIsbUJBQWMsR0FBRyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUdwRSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDN0MsQ0FBQztJQUVELGFBQWE7UUFDVCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDakIsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsRUFBRTtZ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