"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRemote = void 0;
const pinus_1 = require("pinus");
function default_1(app) {
    return new loadRemote(app);
}
exports.default = default_1;
class loadRemote {
    constructor(app) {
        this.app = app;
        this.app = app;
        this.start_server_login_statistics = false;
    }
    async get_ConnectorLoginCount() {
        try {
            const connectionService = pinus_1.pinus.app.components.__connection__;
            if (connectionService) {
                const loginedCount = connectionService.getStatisticsInfo().loginedCount;
                return { ServerId: this.app.getServerId(), loginedCount };
            }
        }
        catch (error) {
            return { ServerId: this.app.getServerId(), loginedCount: 0 };
        }
    }
}
exports.loadRemote = loadRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZFJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2Nvbm5lY3Rvci9yZW1vdGUvbG9hZFJlbW90ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpQ0FBMkM7QUFHM0MsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUZELDRCQUVDO0FBR0QsTUFBYSxVQUFVO0lBR25CLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDaEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsNkJBQTZCLEdBQUcsS0FBSyxDQUFDO0lBQy9DLENBQUM7SUE2Qk0sS0FBSyxDQUFDLHVCQUF1QjtRQUNoQyxJQUFJO1lBQ0EsTUFBTSxpQkFBaUIsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUM7WUFDOUQsSUFBSSxpQkFBaUIsRUFBRTtnQkFDbkIsTUFBTSxZQUFZLEdBQUcsaUJBQWlCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxZQUFZLENBQUM7Z0JBQ3hFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQzthQUM3RDtTQUNKO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDO1NBQ2hFO0lBQ0wsQ0FBQztDQUNKO0FBOUNELGdDQThDQyJ9