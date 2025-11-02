export const CHANNEL_NAME = 'att';

/**
 * 游戏状态
 */
export enum GameState {
    /** 初始牌 */
    Deal,
    /** 补牌 */
    Again,
    /** 搏一搏 */
    Bo,
    /** 初始状态 */
    Init,
}
