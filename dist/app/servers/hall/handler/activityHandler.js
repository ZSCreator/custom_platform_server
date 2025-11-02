'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityHandler = void 0;
const ActivityService = require("../service/ActivityService");
const pinus_logger_1 = require("pinus-logger");
function default_1(app) {
    return new activityHandler(app);
}
exports.default = default_1;
;
class activityHandler {
    constructor(app) {
        this.app = app;
        this.getOpenActivity = async (msg, session) => {
            try {
                let result = await ActivityService.getOpenActivityInfo();
                return { code: 200, result };
            }
            catch (e) {
                this.logger.warn(`activityHandler.getOpenActivity exception: ${e.stack | e}`);
                return { code: 500, error: '异常' };
            }
        };
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
}
exports.activityHandler = activityHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvaGFsbC9oYW5kbGVyL2FjdGl2aXR5SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLDhEQUErRDtBQUkvRCwrQ0FBeUM7QUFHekMsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQUZELDRCQUVDO0FBQUEsQ0FBQztBQUdGLE1BQWEsZUFBZTtJQUV4QixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBVXBDLG9CQUFlLEdBQUcsS0FBSyxFQUFFLEdBQU8sRUFBRSxPQUF1QixFQUFFLEVBQUU7WUFDekQsSUFBSTtnQkFDQSxJQUFJLE1BQU0sR0FBRyxNQUFNLGVBQWUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUN6RCxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQzthQUNoQztZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLDhDQUE4QyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzlFLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQzthQUNyQztRQUNMLENBQUMsQ0FBQztRQWpCRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztDQWlCSjtBQXJCRCwwQ0FxQkMifQ==