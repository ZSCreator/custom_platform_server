"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotLimitConfigSubject = void 0;
const subject_1 = require("../../common/classes/observer/remoteObserver/subject");
const winLimitConfigDAOImpl_1 = require("./DAO/winLimitConfigDAOImpl");
const pinus_1 = require("pinus");
const slotsBaseConst_1 = require("./config/slotsBaseConst");
class SlotLimitConfigSubject extends subject_1.RemoteSubject {
    constructor(themeName, redis) {
        super(themeName, redis);
        this.DAO = winLimitConfigDAOImpl_1.default.getInstance();
    }
    async init() {
        this.limitConfig = await this.DAO.findOneConfig(this.nid);
        if (!this.limitConfig) {
            const server = pinus_1.pinus.app.getCurServer();
            const servers = pinus_1.pinus.app.getServersByType(server.serverType);
            if (server.id === servers[0].id) {
                await this.DAO.create({ nid: this.nid, winLimitConfig: slotsBaseConst_1.WIN_LIMITED_CONFIG });
            }
            this.limitConfig = slotsBaseConst_1.WIN_LIMITED_CONFIG;
        }
        await this.registration();
    }
    getConfig() {
        return this.limitConfig;
    }
    invoke(msg) {
        this.DAO.findOneConfig(this.nid).then(res => {
            if (res) {
                this.limitConfig = res;
            }
        });
    }
}
exports.SlotLimitConfigSubject = SlotLimitConfigSubject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xvdExpbWl0Q29uZmlnU3ViamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9kb21haW4vQ29tbW9uQ29udHJvbC9zbG90TGltaXRDb25maWdTdWJqZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGtGQUFtRjtBQUduRix1RUFBMEQ7QUFFMUQsaUNBQTRCO0FBQzVCLDREQUEyRDtBQVEzRCxNQUFzQixzQkFBdUIsU0FBUSx1QkFBYTtJQUs5RCxZQUFzQixTQUFpQixFQUFFLEtBQVk7UUFDakQsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUg1QixRQUFHLEdBQW9CLCtCQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7SUFJckQsQ0FBQztJQU1ELEtBQUssQ0FBQyxJQUFJO1FBQ04sSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUVuQixNQUFNLE1BQU0sR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3hDLE1BQU0sT0FBTyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRzlELElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUM3QixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLG1DQUFrQixFQUFDLENBQUMsQ0FBQzthQUM5RTtZQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsbUNBQWtCLENBQUM7U0FDekM7UUFHRCxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBS0QsU0FBUztRQUNMLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUM1QixDQUFDO0lBTUQsTUFBTSxDQUFDLEdBQVM7UUFDWixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hDLElBQUksR0FBRyxFQUFFO2dCQUNMLElBQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO2FBQzFCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFsREQsd0RBa0RDIn0=