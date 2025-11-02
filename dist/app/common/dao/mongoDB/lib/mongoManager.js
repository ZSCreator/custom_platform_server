"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = exports.getCollectionNames = void 0;
const Mongoose = require("mongoose");
Mongoose.set('useFindAndModify', false);
Mongoose.set('useUnifiedTopology', true);
Mongoose.set("useCreateIndex", true);
__exportStar(require("./schemas/activity_info"), exports);
__exportStar(require("./schemas/user_info"), exports);
__exportStar(require("./schemas/player_info"), exports);
__exportStar(require("./schemas/system_game"), exports);
__exportStar(require("./schemas/system_scene"), exports);
__exportStar(require("./schemas/system_room"), exports);
__exportStar(require("./schemas/system_config"), exports);
__exportStar(require("./schemas/game_record"), exports);
__exportStar(require("./schemas/pay_info"), exports);
__exportStar(require("./schemas/player_login_record"), exports);
__exportStar(require("./schemas/agentBack_record"), exports);
__exportStar(require("./schemas/tixian_money_record"), exports);
__exportStar(require("./schemas/mails"), exports);
__exportStar(require("./schemas/system_shop_gold"), exports);
__exportStar(require("./schemas/auth_code"), exports);
__exportStar(require("./schemas/reality_video_game_record"), exports);
__exportStar(require("./schemas/reality_video_schedule_task"), exports);
__exportStar(require("./schemas/day_profits_info"), exports);
__exportStar(require("./schemas/day_qudao_profits_info"), exports);
__exportStar(require("./schemas/agentBack_day_record"), exports);
__exportStar(require("./schemas/promotion_ltv"), exports);
__exportStar(require("./schemas/promotion_agent_ltv"), exports);
__exportStar(require("./schemas/day_player_profits_pay_record"), exports);
__exportStar(require("./schemas/game_record_gameType_day"), exports);
__exportStar(require("./schemas/game_analysis_day"), exports);
__exportStar(require("./schemas/player_day_game_record"), exports);
__exportStar(require("./schemas/reality_video_sms_task"), exports);
__exportStar(require("./schemas/pay_order"), exports);
__exportStar(require("./schemas/big_post_notice"), exports);
__exportStar(require("./schemas/pay_type"), exports);
__exportStar(require("./schemas/receive_mail_record"), exports);
__exportStar(require("./schemas/player_profits"), exports);
__exportStar(require("./schemas/scratch_card_result"), exports);
__exportStar(require("./schemas/jackpot_record_info"), exports);
__exportStar(require("./schemas/slot_win_limit"), exports);
__exportStar(require("./schemas/game_jackpot"), exports);
__exportStar(require("./schemas/wallet_record"), exports);
__exportStar(require("./schemas/game_Records_live"), exports);
__exportStar(require("./schemas/pirate_data"), exports);
__exportStar(require("./schemas/customer_info"), exports);
__exportStar(require("./schemas/agent_yuzhi_record"), exports);
__exportStar(require("./schemas/infinite_agent_info"), exports);
__exportStar(require("./schemas/agent_profits_record"), exports);
__exportStar(require("./schemas/bonus_pools_history"), exports);
__exportStar(require("./schemas/bonus_pools"), exports);
__exportStar(require("./schemas/test_pay_info"), exports);
__exportStar(require("./schemas/customer_pay_info"), exports);
__exportStar(require("./schemas/reality_video_user_info"), exports);
__exportStar(require("./schemas/day_not_player_profits"), exports);
__exportStar(require("./schemas/scene_control"), exports);
__exportStar(require("./schemas/gameControl_info"), exports);
__exportStar(require("./schemas/daili_liushui_record"), exports);
__exportStar(require("./schemas/update_announcement"), exports);
__exportStar(require("./schemas/vip_customer_info"), exports);
__exportStar(require("./schemas/reality_video_agent_balance_record"), exports);
__exportStar(require("./schemas/personal_control"), exports);
__exportStar(require("./schemas/pharaoh"), exports);
__exportStar(require("./schemas/manager_info"), exports);
__exportStar(require("./schemas/third_gold_record"), exports);
__exportStar(require("./schemas/system_game_type"), exports);
__exportStar(require("./schemas/total_personal_control"), exports);
__exportStar(require("./schemas/white_ip_info"), exports);
__exportStar(require("./schemas/player_day_profit_record"), exports);
__exportStar(require("./schemas/control_record"), exports);
__exportStar(require("./schemas/day_agent_profits_info"), exports);
__exportStar(require("./schemas/alarm_event_thing"), exports);
const getCollectionNames = async () => {
    let cols = await Mongoose.connection.db.collections();
    let colStrArr = [];
    for (let c of cols) {
        colStrArr.push(c.collectionName);
    }
    return colStrArr;
};
exports.getCollectionNames = getCollectionNames;
function disconnect() {
    Mongoose.disconnect();
}
exports.disconnect = disconnect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvbW9uZ29NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EscUNBQXFDO0FBRXJDLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDeEMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN6QyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBR3JDLDBEQUF3QztBQUN4QyxzREFBb0M7QUFDcEMsd0RBQXNDO0FBQ3RDLHdEQUFzQztBQUN0Qyx5REFBdUM7QUFDdkMsd0RBQXNDO0FBQ3RDLDBEQUF3QztBQUN4Qyx3REFBc0M7QUFDdEMscURBQW1DO0FBQ25DLGdFQUE4QztBQUM5Qyw2REFBMkM7QUFDM0MsZ0VBQThDO0FBQzlDLGtEQUFnQztBQUNoQyw2REFBMkM7QUFDM0Msc0RBQW9DO0FBQ3BDLHNFQUFvRDtBQUNwRCx3RUFBc0Q7QUFDdEQsNkRBQTJDO0FBQzNDLG1FQUFpRDtBQUNqRCxpRUFBK0M7QUFDL0MsMERBQXdDO0FBQ3hDLGdFQUE4QztBQUM5QywwRUFBd0Q7QUFDeEQscUVBQW1EO0FBQ25ELDhEQUE0QztBQUM1QyxtRUFBaUQ7QUFDakQsbUVBQWlEO0FBQ2pELHNEQUFvQztBQUNwQyw0REFBMEM7QUFDMUMscURBQW1DO0FBQ25DLGdFQUE4QztBQUM5QywyREFBeUM7QUFDekMsZ0VBQThDO0FBQzlDLGdFQUE4QztBQUM5QywyREFBeUM7QUFDekMseURBQXVDO0FBQ3ZDLDBEQUF3QztBQUN4Qyw4REFBNEM7QUFDNUMsd0RBQXNDO0FBQ3RDLDBEQUF3QztBQUN4QywrREFBNkM7QUFDN0MsZ0VBQThDO0FBQzlDLGlFQUErQztBQUMvQyxnRUFBOEM7QUFDOUMsd0RBQXNDO0FBQ3RDLDBEQUF3QztBQUN4Qyw4REFBNEM7QUFDNUMsb0VBQWtEO0FBQ2xELG1FQUFpRDtBQUNqRCwwREFBd0M7QUFDeEMsNkRBQTJDO0FBQzNDLGlFQUErQztBQUMvQyxnRUFBOEM7QUFDOUMsOERBQTRDO0FBQzVDLCtFQUE2RDtBQUM3RCw2REFBMkM7QUFDM0Msb0RBQWtDO0FBQ2xDLHlEQUF1QztBQUN2Qyw4REFBNEM7QUFDNUMsNkRBQTJDO0FBQzNDLG1FQUFpRDtBQUNqRCwwREFBd0M7QUFDeEMscUVBQW1EO0FBQ25ELDJEQUF5QztBQUN6QyxtRUFBaUQ7QUFDakQsOERBQTRDO0FBT3JDLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDekMsSUFBSSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0RCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUU7UUFDaEIsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDcEM7SUFDRCxPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDLENBQUM7QUFQVyxRQUFBLGtCQUFrQixzQkFPN0I7QUFDRixTQUFnQixVQUFVO0lBQ3RCLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMxQixDQUFDO0FBRkQsZ0NBRUMifQ==