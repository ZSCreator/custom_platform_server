export const CHANNEL_NAME = 'Erba_zhuang';
// export const startGrab_List = [0, 3, 68, 134, 200];
// export const bet_mul_List = [1, 16, 33, 50, 66];
export interface Erba_startGrab {
    status: "startGrab";
    countdown: number;
    startGrab_List: number[];
}

export interface Erba_startBet {
    status: "startBet";
    countdown: number;
    bet_mul_List: number[];
}
