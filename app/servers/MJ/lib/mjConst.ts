'use strict'
export const nid = '13';


export enum Player_Oper {
    PO_NONE,
    PO_READY,
    PO_PLAY,
    PO_PASS,
    PO_CHI,
    PO_PENG,
    PO_GANG,
    PO_HU,
    PO_BA_GANG,
    PO_EXIT,
    /**听牌 */
    PO_TING,
    /**托管 */
    PO_TUOGUAN
};

/**拉取房间信息 */
export interface MJ_mainHandler_loaded {
    code: number,
    uid: string,
    seat: number,
    roundId: string,
    players: {
        uid: string,
        nickname: string,
        gold: number,
        seat: number,
        headurl: string,
        status: 'NONE' | 'PS_WAIT' | 'PS_OPER' | 'PS_READY',
        hand_mjs: number[];
        /**已经打出去的麻将 */
        chu_majiang: number[];
        /**碰 等操作后 桌面摆放的麻将 */
        tai_majiang: number[];
        /**暗杠的麻将 */
        an_gang_majiang: number[];
        /**花牌 */
        hua_majiang: number[];
        ting_status: boolean;
        trusteeship: boolean;
    }[],
    roomInfo: {
        /**桌面剩余麻将 */
        RepertoryCard_len: number,
        /**底注 */
        lowBet: number,
        /**当前可操作玩家seat */
        curr_doing_seat: number,
        /**当前麻将 */
        curr_majiang: number,
        status: 'NONE' | 'INWAIT' | 'INGAME' | 'END',
        sceneId: number,
        roomId: string,
        /**等待操作时间 */
        WaitTime: number,
        mo_random: number
    },
}

/**发牌 */
export interface IMJ_deal {
    zj_seat: number,
    players: {
        uid: string,
        seat: number,
        hand_mjs: number[]
    }[],
    mo_random: number
}
/**玩家进入接口 */
export interface IMJ_onEntry {
    sceneId: number,
    roomId: string,
    player: {
        uid: string,
        nickname: string,
        gold: number,
        headurl: string,
        seat: number,
    },
    status: string,
    lowBet: number,
}

/**广播玩家操作 */
export interface Imsg_majiang_oper_c {
    oper_type: Player_Oper,
    uid: string,
    seat?: number,
    other_seat?: number,
    roomId?: string,
    hand_mj?: number,
    cmsg?: number
}

/**麻将录像 */
export interface Imsg_majiang_record {
    zhuang_uid?: string,
    res_fan_arr: { type: number, fan: number }[],
    player_info: {
        uid: string,
        nickname: string
        seat: number
        change_socre: number,
        /**起手手牌 */
        mjs: number[],
        /**得到的新牌 */
        // new_mjs: number[]
    }[],
    oper: {
        uid: string,
        oper_type_string: string,
        oper_type: Player_Oper,
        /**出牌麻将 */
        mj: number,
        update_time: string
    }[]
}

/**通知所有玩家当前局结果 */
export interface Imsg_majiang_result_s {
    Info: {
        uid: string,
        change_socre: number,
        seat: number,
        tai_mjs: number[],
        an_gang_majiang: number[],
        hand_mjs: number[],
        gang_majiang: number[],
        is_hu: boolean,
        gold: number,
        profit: number,
        /**胡牌 */
        hu_majiang: number[],
        chi_majiang: number[],
        pass_hu_num: number,
    }[],
    zhuang_id: string,
    res_fan_arr: { type: number, fan: number }[];
}


export interface Imsg_majiang_mo_majiang_s {
    uid: string,
    seat: number,
    mj: number,
}

/**通知玩家说话 */
export interface Imsg_majiang_note_doing_s {
    uid: string,
    seat: number
}

/**得分结算 */
export interface Imsg_majiang_get_result {
    //1.点杠,2.暗杠,3.碰,4.自摸,5.胡其他人
    oper: number,
}

/**失分结算 */
export interface Imsg_majiang_lose_result {

}

export interface IMJ_deal_bu {
    uid: string;
    seat: number;
    hua_majiang: number[];
    buhua_arr: number[];
}