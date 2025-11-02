# MongoDB数据字典

## 表说明

| 表名                          | 模块          | 用途                                                                      |
| ----------------------------- | ------------- | ------------------------------------------------------------------------- |
| auth_code                     | 基础          | 验证码                                                                    |
| invite_code_info              | 基础          | 邀请码记录（废弃，没用）                                                  |
| luckyAround_record            | 基础          | 金币奖励表                                                                |
| mails                         | 基础          | 邮件                                                                      |
| system_config                 | 基础          | 系统设置的表结构定义                                                      |
| system_game                   | 基础          | 游戏数据结构定义                                                          |
| system_room                   | 基础          | 房间数据结构定义                                                          |
| system_scene                  | 基础          | 场的表结构定义                                                            |
| system_shop_gold              | 基础          | 记录系统上传的购买金币的物品                                              |
| update_announcement           | 基础          | 更新公告                                                                  |
| user_info                     | 基础          | 用户表                                                                    |
| vip_system_config             | 基础          | VIP系统配置                                                               |
| wallet_record                 | 基础          | 钱包操作记录                                                              |
| red_packet_record             | 基础          | 红包领取记录                                                              |
| relation_info                 | 基础          | 玩家关系信息表结构定义                                                    |
| pay_note_config               | 基础          | 充值假消息播放                                                            |
| player_bank                   | 基础          | 记录每个玩家的银行卡号                                                    |
| player_info                   | 基础          | 用户-玩家表                                                               |
| player_login_record           | 基础          | 玩家登陆信息记录                                                          |
| pay_info                      | 基础          | 充值记录                                                                  |
| pay_order                     | 基础:支付     | 订单请求的支付记录                                                        |
| pay_type                      | 基础:支付     | 支付类型                                                                  |
| customer_info                 | 后台          | 玩家反馈信息                                                                  |
| customer_pay_info             | 后台          | 配置客服的充值信息                                                        |
| hour_player_gold              | 后台          | 每半小时记录一次玩家的金币                                                |
| regional_profits_record       | 后台          | 记录大区进行计算考核的记录                                                |
| manager_gold_agent            | 后台          | 通过管理后台给代理充值金币的记录                                          |
| test_pay_info                 | 后台          | 测试充值记录                                                              |
| agent_info                    | 代理返佣      | 无限级代理的代理信息表   agent_info 和  infinite_agent_info 选其一                                               |
| agent_wuxian_config           | 代理返佣      | 无限级代理级差的后台设置表                                                    |
| daili_day_liushui_record      | 代理返佣      | 代理抽取流水的总和 在该表里面，玩家会有两天数据 ，每日新增人数            |
| dailyNet_profit               | 代理返佣      | 记录每个玩家的当日流水利润，如果存在上级，就进行累加上去                  |
| day_player_profits_pay_record | 代理返佣      | 记录每个玩家当返利的时候返利给上级多少记录信息                            |
| day_profits_info              | 代理返佣      | 每日系统的数据整合信息（充值，赠送，提现，流水）                                                      |
| day_qudao_profits_info        | 代理返佣      | 每日大区渠道整合信息（充值，赠送，提现，流水）                                                            |
| infinite_agent_info           | 代理返佣      | 无限级代理的代理信息表（废弃，没用）  agent_info 和  infinite_agent_info 选其一                                      |
| player_profits                | 代理返佣      | 记录渠道和代理人的利润                                                    |
| dish_data                     | 调控          | 返奖调控数据                                                                  |
| dzpipei_data                  | 游戏:德州     | 德州匹配数据                                                              |
| fishing_lottery_10_5          | 游戏:钓鱼     | ~~钓鱼开奖信息~~                                                              |
| fishing_lottery_11_5          | 游戏:钓鱼     | ~~钓鱼开奖信息~~                                                             |
| game_Records_live             | 游戏          | 游戏实况记录 对战游戏 扎金花 比牌牛牛专用                                 |
| game_jackpot                  | 游戏          | 奖池信息                                                                  |
| game_record                   | 游戏          | 游戏金币变化记录                                                          |
| game_record_gameType_day      | 游戏          | 公司输赢，每日第二天凌晨统计每个类型游戏的输赢                                                          |
| game_record_sms               | 游戏          | 游戏中奖实况盈利超过限额短信                                                              |                                                            |
| have_shop_welcome_image       | 游戏          | 是否弹出商城                                                              |
| jackpot_record_info           | 游戏          | 奖池记录                                                                  |
| korss_info                    | 游戏:推筒子   | 赛车                                                                      |
| match_info                    | 游戏:足球     | ~~比赛信息表~~                                                                |
| quarter_info1                 | 游戏:足球     | ~~比赛半场信息记录~~                                                          |
| quarter_info2                 | 游戏:足球     | ~~比赛半场信息记录~~                                                          |
| quarter_info3                 | 游戏:足球     | ~~比赛半场信息记录~~                                                          |
| quarter_info4                 | 游戏:足球     | ~~比赛半场信息记录~~                                                          |
| quarter_info5                 | 游戏:足球     | ~~比赛半场信息记录~~                                                          |
| racing_info                   | 游戏:赛车     | ~~赛车数据~~                                                                  |
| receive_mail_record           | 游戏          | 领取邮件的记录                                                            |
| regulation_fishing_10_5       | 游戏:钓鱼     | ~~调控表~~                                                                    |
| regulation_fishing_11_5       | 游戏:钓鱼     | ~~调控表~~                                                                    |
| regulation_racing             | 游戏:赛车     | ~~调控表~~                                                                    |
| relation_record               | 游戏          | 玩家操作玩家关系的记录                                                    |
| scratch_card_result           | 游戏:刮刮乐   | 刮刮乐卡片结果                                                            |
| slots_record                  | 游戏:老虎机类 | slots游戏的内存记录 疯狂汉堡+幸运777+猴王传奇+埃及夺宝+太空多宝           |
| ssc_bet_history               | 游戏:彩票     | 玩家押注表                                                                |
| ssc_lottery_history           | 游戏:彩票     | 玩家押注期号开奖信息                                                      |
| ssc_lottery_info              | 游戏:彩票     | 开奖信息表名                                                              |
| tixian_money_record           | 游戏          | 提现金额的记录                                                            |
| betOrder                      | 游戏:彩票     | 投注记录                                                                  |
| lottery_info                  | 游戏:彩票     | 开奖信息                                                                  |
| third_gold_record             | 第三方接口    | 上下分记录                                                                |
| third_config_rebate           | 第三方接口    | ~~全局返点配~~                                                          |
| third_config_return           | 第三方接口    | ~~代理方全局返点配置~~                                                    |
| activity_info                 | 基础          | 活动配置表信息表                                                          |
| bonus_pools                   | 调控          | 奖池记录表                                                                |
| control_info                  | 调控          | 调控记录表                                                                |
| login_ip_record               | 基础          | 玩家登陆信息记录                                                          |
| personalControl_info          | 调控          | 个人游戏精控配置                                                          |
| personal_TotalControl_info    | 调控          | 个人总控配置                                                          |
| slot_win_limit                | 调控          | slot游戏兜底配置                                                          |
| gameControl_info              | 调控          | 个人精控游戏配置                                                        |
| add_off_noticeType            | 活动          | 玩家点开某个公告进行记录,下次不用在打开该公告     (废弃)                          |
| agent_apply_info              | 活动          | 玩家想做代理,在游戏中填写申请表记录      (废弃)                          |
| agent_assessment_info         | 后台          | 玩家无限级代理的周末佣金考核表         (废弃)                          |
| agent_profits                 | 活动          | 记录代理身上通过返佣得到的金币,可以通过提取佣金得到金币  （废弃）                          |
| agent_profits_records         | 活动          | 代理提取佣金记录（废弃）                          |
| agent_yuzhi_records           | 活动          | 玩家提取佣金和提取预支记录                           |
| agentBack_day_records         | 活动          | 无限级代理,每把玩家玩游戏进行返佣，然后对玩家抽取流水当日的数据总和记录                          |
| agentBack_record              | 活动          | 无限级代理,每把玩家玩游戏进行返佣，然后对玩家团队抽取的总流水进行数据整合                           |
| big_post_notice               | 活动          |  发送大喇叭的记录表    (废弃)                       |
| card_record                   | 活动          |  以前兑换物品的记录表  （废弃）                           |
| daili_customer_pay_info       | 活动          |  代理设置的客服充值表    （废弃）                                                                   |
| daili_day_liushui_record      | 活动          | 无限级代理,代理抽取流水的总和 在该表里面，玩家会有两天数据                           |
| daili_invitecode_info         | 活动          | 无限代理生成多个反码点的表  （废弃）                           |
| daili_liushui_reocrd          | 活动          | 玩家代理抽取的流水总和  （废弃）                         |
| daili_tixian_record           | 活动          | 代理提现金额的记录  （废弃）                         |
| daili_zhuan_gold              | 活动          | 代理转给玩家的金币记录  （废弃）                         |
| dailyNet_profit               | 活动          | 记录每个玩家的当日流水利润，如果存在上级，就进行累加上去 (废弃)  |
| day_qudao_profits_player_complete             | 活动          | 记录每个玩家的当日流水利润，如果存在上级，就进行累加上去 (废弃)  |
| day_not_player_profits        | 活动          | 如果代理返佣出现错误，就讲每把需要返佣的数据存储到该表  |
| game_version                  | 后台          | 游戏分包记录，记录这个服务器有那几个包，然后开那些游戏  |
| indiana_reocrd                | 游戏          | 太空夺宝的游戏记录  |
| indianaWins                   | 游戏          | 太空夺宝的win  |
| pharaoh                       | 游戏          | 埃及夺宝的窗口效果  |
| pirate_data                   | 游戏          | 海盗船的游戏信息  |
| player_other_field            | 基础          | player_info 其他不经常用到的数据存在这张表  |
| player_profits                | 基础          | 玩家玩游戏代理返佣的佣金存储表  |
| present_record                | 活动          | 赠送道具的记录   （废弃）  |
| promotion_agent_ltv           | 后台          | 当日的注册人数记录充值，提现进行累加以及ltv  这个是给代理看的 |
| promotion_ltv                 | 后台          | 当日的注册人数记录充值，提现进行累加以及ltv   |
| ranking_record                | 活动          | 排行榜   （废弃）  |
| reality_video_agent_balance_record                | 真人视讯          | 金币变化记录表     |
| reality_video_game_record     | 真人视讯          | 游戏押注记录表     |
| reality_video_schedule_task   | 真人视讯          | 真人视讯   （废弃）  |
| reality_video_score_record    | 真人视讯          | 真人视讯   （废弃）  |
| reality_video_sms_task        | 真人视讯          | 真人视讯   （废弃）  |
| reality_video_user_info       | 活动          | 真人视讯   （废弃）  |
| receive_mail_record           | 基础          | 领取邮件记录     |
| red_packet_record.            | 基础          | 红包领取记录     |
| regional_profits_record       | 后台          | 记录大区进行计算考核的记录 (废弃)     |
| robot                         | 基础          | 机器人信息     |
| robot_account                 | 基础             | 机器人金钱明细    |
| roulette_record               | 活动                | 轮盘游戏结果记录     |
| save_card_things              | 活动          | 保存兑换物品信息  （废弃）     |
| settlement_day_record         | 活动          | 代理后台  代理后台进行结算返点以及占成比列  （废弃）     |
| settlement_record             | 活动          | 代理后台  代理后台进行结算返点以及占成比列  （废弃）     |
| bonus_pools_history.ts        | 调控          | 奖池变动记录     |