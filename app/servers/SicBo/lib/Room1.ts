import Room from './sicboRoom';
import sicboService = require('./util/lotteryUtil');

//普通场房间类
export default class Room1 extends Room {
    constructor(opts: any) {
        super(opts)
        this.allBetAreas = this.bssd.concat(this.diceNum);
    }

    //获取结果
    // getResult_(result) {
    //     //结算
    //     // let results_ = sicboService.settle1(result, this);
    //     // return results_;
    // }
}
