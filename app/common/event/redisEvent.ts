import utils = require('../../utils');
import { EventEmitter } from "events";

export const globalEvent = new EventEmitter();
export const globalArr: { [key: string]: { event: EventEmitter, updatetime: number } } = {};

globalEvent.on("doForward", (uid: string, route: string, parameter: any) => {
    let vv = globalArr[uid];
    if (vv) {
        let args = utils.clone(parameter);
        process.nextTick(() => {
            vv.event.emit(route, args);
        });
    }
});





