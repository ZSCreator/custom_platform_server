//获取 mongo 数据库的 dao
import * as Mongoose from 'mongoose';

Mongoose.set('useFindAndModify', false);
Mongoose.set('useUnifiedTopology', true);
Mongoose.set("useCreateIndex", true);


export * from './schemas/activity_info';
export * from './schemas/user_info';
export * from './schemas/player_info';
export * from './schemas/system_game';
export * from './schemas/system_scene';
export * from './schemas/system_room';
export * from './schemas/system_config';
export * from './schemas/game_record';
export * from './schemas/pay_info';
export * from './schemas/player_login_record';
export * from './schemas/agentBack_record';
export * from './schemas/tixian_money_record';
export * from './schemas/mails';
export * from './schemas/system_shop_gold';
export * from './schemas/auth_code';
export * from './schemas/reality_video_game_record';
export * from './schemas/reality_video_schedule_task';
export * from './schemas/day_profits_info';
export * from './schemas/day_qudao_profits_info';
export * from './schemas/agentBack_day_record';
export * from './schemas/promotion_ltv';
export * from './schemas/promotion_agent_ltv';
export * from './schemas/day_player_profits_pay_record';
export * from './schemas/game_record_gameType_day';
export * from './schemas/game_analysis_day';
export * from './schemas/player_day_game_record';
export * from './schemas/reality_video_sms_task';
export * from './schemas/pay_order';
export * from './schemas/big_post_notice';
export * from './schemas/pay_type';
export * from './schemas/receive_mail_record';
export * from './schemas/player_profits';
export * from './schemas/scratch_card_result';
export * from './schemas/jackpot_record_info';
export * from './schemas/slot_win_limit';
export * from './schemas/game_jackpot';
export * from './schemas/wallet_record';
export * from './schemas/game_Records_live';
export * from './schemas/pirate_data';
export * from './schemas/customer_info';
export * from './schemas/agent_yuzhi_record';
export * from './schemas/infinite_agent_info';
export * from './schemas/agent_profits_record';
export * from './schemas/bonus_pools_history';
export * from './schemas/bonus_pools';
export * from './schemas/test_pay_info';
export * from './schemas/customer_pay_info';
export * from './schemas/reality_video_user_info';
export * from './schemas/day_not_player_profits';
export * from './schemas/scene_control';
export * from './schemas/gameControl_info';
export * from './schemas/daili_liushui_record';
export * from './schemas/update_announcement';
export * from './schemas/vip_customer_info';
export * from './schemas/reality_video_agent_balance_record';
export * from './schemas/personal_control';
export * from './schemas/pharaoh';
export * from './schemas/manager_info';
export * from './schemas/third_gold_record';
export * from './schemas/system_game_type';
export * from './schemas/total_personal_control';
export * from './schemas/white_ip_info';
export * from './schemas/player_day_profit_record';
export * from './schemas/control_record';
export * from './schemas/day_agent_profits_info';
export * from './schemas/alarm_event_thing';



/**
 * 新的获取对应库的所有表名
 */
export const getCollectionNames = async () => {
    let cols = await Mongoose.connection.db.collections();
    let colStrArr = [];
    for (let c of cols) {
        colStrArr.push(c.collectionName);
    }
    return colStrArr;
};
export function disconnect() {
    Mongoose.disconnect();
}