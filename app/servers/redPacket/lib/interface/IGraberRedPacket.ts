/**
 *  @property grabUid 抢包者 uid
 *  @property hasGrabed 是否已抢
 *  @property redPacketListIdx 当前对局红包下标
 *  @property redPacketAmount 红包金额
 *  @property isStepInMine 是否中雷
 *  @property grabTime 抢包时间
 *  
 *  @property nickname 昵称
 *  @property gold     携带金币
 *  @property headurl  头像
 *  @property vipScore vip分
 */
export class IGraberRedPacket {
    grabUid: string | null = null;
    hasGrabed: boolean = false;
    grabTime: number = 0;
    redPacketListIdx: number = -1;
    redPacketAmount: string = '0.00';
    isStepInMine: boolean = false;
  
    nickname: string | null = null;
    gold: number = 0;
    headurl: string | null = null;
  }
  