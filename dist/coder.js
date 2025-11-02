"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preEncode = exports.preDecode = void 0;
const pinus_protocol_1 = require("pinus-protocol");
const pinus_logger_1 = require("pinus-logger");
const path = require("path");
let logger = (0, pinus_logger_1.getLogger)('pinus', path.basename(__filename));
function preDecode(msg) {
    msg = pinus_protocol_1.Message.decode(msg.body);
    let route = msg.route;
    if (!!msg.compressRoute) {
        if (!!this.connector.useDict) {
            let abbrs = this.connector.dictionary.getAbbrs();
            if (!abbrs[route]) {
                logger.error('dictionary error! no abbrs for route : %s', route);
                return null;
            }
            route = msg.route = abbrs[route];
        }
        else {
            logger.error('fail to uncompress route code for msg: %j, server not enable dictionary.', msg);
            return null;
        }
    }
    try {
        msg.body = JSON.parse(cryptoCode(msg.body.toString()));
    }
    catch (ex) {
        msg.body = {};
    }
    return msg;
}
exports.preDecode = preDecode;
function preEncode(reqId, route, msg) {
    let data;
    if (!!reqId) {
        data = composeResponse(this, reqId, route, msg);
    }
    else {
        data = composePush(this, route, msg);
    }
    return data;
}
exports.preEncode = preEncode;
function cryptoCode(str) {
    let offset = 0;
    const buf = Buffer.from(str);
    for (const byte of buf) {
        buf.writeUInt8((byte ^ 32 ^ 64), offset);
        offset++;
    }
    return buf.toString();
}
function composeResponse(server, msgId, route, msgBody) {
    if (!msgId || !route || !msgBody) {
        return null;
    }
    msgBody = encodeBody(server, route, msgBody);
    return pinus_protocol_1.Message.encode(msgId, pinus_protocol_1.Message.TYPE_RESPONSE, false, null, msgBody);
}
function composePush(server, route, msgBody) {
    if (!route || !msgBody) {
        return null;
    }
    msgBody = encodeBody(server, route, msgBody);
    let compressRoute = false;
    if (!!server.connector.dictionary) {
        let dict = server.connector.dictionary.getDict();
        if (!!server.connector.useDict && !!dict[route]) {
            route = dict[route];
            compressRoute = true;
        }
    }
    return pinus_protocol_1.Message.encode(0, pinus_protocol_1.Message.TYPE_PUSH, compressRoute, route, msgBody);
}
function encodeBody(server, route, msgBody) {
    let offset = 0;
    const buf = Buffer.from(JSON.stringify(msgBody));
    for (const byte of buf) {
        buf.writeUInt8((byte ^ 32 ^ 64), offset);
        offset++;
    }
    return buf;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9jb2Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtREFBdUM7QUFFdkMsK0NBQXlDO0FBQ3pDLDZCQUE2QjtBQUM3QixJQUFJLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUUzRCxTQUFnQixTQUFTLENBQWMsR0FBUTtJQUMzQyxHQUFHLEdBQUcsd0JBQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRy9CLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7SUFHdEIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRTtRQUNyQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRTtZQUMxQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqRCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNmLE1BQU0sQ0FBQyxLQUFLLENBQUMsMkNBQTJDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pFLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFDRCxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDcEM7YUFBTTtZQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsMEVBQTBFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDOUYsT0FBTyxJQUFJLENBQUM7U0FDZjtLQUNKO0lBRUQsSUFBSTtRQUNBLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FD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