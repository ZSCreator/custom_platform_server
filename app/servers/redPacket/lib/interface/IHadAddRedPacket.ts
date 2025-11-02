export interface IHadAddRedPacket {
    /** 玩家基础信息 */
    uid: string;
    sex: number;
    gold: number;
    gain: number;
    nickname: string;
    headurl: string;
    status: number;
    /** 红包金额 */
    amount: number;
  }