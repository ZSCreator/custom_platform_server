"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerInfo = void 0;
const Utils = require("../../../utils/index");
const HallConst = require("../../../consts/hallConst");
const PositionEnum_1 = require("../../constant/player/PositionEnum");
const RoleEnum_1 = require("../../constant/player/RoleEnum");
const constants_1 = require("../../../services/newControl/constants");
class PlayerInfo {
    constructor(opts) {
        this.standbyRounds = 0;
        this.uid = opts.uid;
        this.thirdUid = opts.thirdUid || '';
        this.addRmb = opts.addRmb || 0;
        this.addTixian = opts.addTixian || 0;
        this.addDayRmb = opts.addDayRmb || 0;
        this.addDayTixian = opts.addDayTixian || 0;
        this.oneAddRmb = opts.oneAddRmb || 0;
        this.gold = opts.gold || 0;
        this.nickname = opts.nickname || 'P' + this.uid;
        this.headurl = opts.headurl || Utils.getHead();
        this.language = opts.language || HallConst.LANGUAGE.DEFAULT;
        this.superior = opts.superior || '';
        this.group_id = opts.group_id || '';
        this.groupRemark = opts.groupRemark || '';
        this.loginTime = opts.loginTime || 0;
        this.lastLogoutTime = opts.lastLogoutTime || 0;
        this.createTime = new Date();
        this.isRobot = opts.isRobot || RoleEnum_1.RoleEnum.REAL_PLAYER;
        this.sid = opts.sid || '';
        this.ip = opts.ip || '';
        this.loginCount = opts.loginCount || 0;
        this.abnormalOffline = opts.abnormalOffline || false;
        this.kickedOutRoom = opts.kickedOutRoom || false;
        this.position = opts.position || PositionEnum_1.PositionEnum.HALL;
        this.closeTime = opts.closeTime || 0;
        this.closeReason = opts.closeReason || '';
        this.dayMaxWin = opts.dayMaxWin || 0;
        this.dailyFlow = opts.dailyFlow || 0;
        this.flowCount = opts.flowCount || 0;
        this.oneWin = opts.oneWin || 0;
        this.instantNetProfit = opts.instantNetProfit || 0;
        this.walletGold = opts.walletGold || 0;
        this.rom_type = opts.rom_type || '';
        this.onLine = true;
        this.isOnLine = false;
        this.guestid = opts.guestid || '';
        this.cellPhone = opts.cellPhone || '';
        this.passWord = opts.passWord || '';
        this.maxBetGold = opts.maxBetGold || 0;
        this.earlyWarningGold = opts.earlyWarningGold || 0;
        this.earlyWarningFlag = opts.earlyWarningFlag || false;
        this.entryGold = opts.entryGold || 0;
        this.kickself = opts.kickself || false;
        this.controlType = constants_1.ControlKinds.NONE;
        this.lineCode = opts.lineCode;
        this.updatetime = opts.updatetime || Math.round(new Date().getTime() / 1000);
    }
    basicsStrip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            isRobot: this.isRobot
        };
    }
    setControlType(type) {
        if (type !== constants_1.ControlKinds.NONE) {
            this.controlType = type;
        }
    }
    initControlType() {
        this.controlType = constants_1.ControlKinds.NONE;
    }
    update_time() {
        this.updatetime = Math.round(new Date().getTime() / 1000);
    }
    registerListener() { }
    destroy() { }
}
exports.PlayerInfo = PlayerInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVySW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vcG9qby9lbnRpdHkvUGxheWVySW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4Q0FBK0M7QUFDL0MsdURBQXdEO0FBQ3hELHFFQUFrRTtBQUNsRSw2REFBMEQ7QUFDMUQsc0VBQXNFO0FBTXRFLE1BQWEsVUFBVTtJQTZKbkIsWUFBWSxJQUFTO1FBWHJCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBWXRCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNoRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQy9DLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxT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