import {Message} from "pinus-protocol";
import {IConnector} from "pinus/lib/interfaces/IConnector";
import { getLogger } from 'pinus-logger';
import * as path from 'path';
let logger = getLogger('pinus', path.basename(__filename));

export function preDecode(this: any ,  msg: any) {
    msg = Message.decode(msg.body);
    // console.warn('接受的数据1', msg);

    let route = msg.route;

    // decode use dictionary
    if (!!msg.compressRoute) {
        if (!!this.connector.useDict) {
            let abbrs = this.connector.dictionary.getAbbrs();
            if (!abbrs[route]) {
                logger.error('dictionary error! no abbrs for route : %s', route);
                return null;
            }
            route = msg.route = abbrs[route];
        } else {
            logger.error('fail to uncompress route code for msg: %j, server not enable dictionary.', msg);
            return null;
        }
    }

    try {
        msg.body = JSON.parse(cryptoCode(msg.body.toString()));
    } catch (ex) {
        msg.body = {};
    }

    // console.warn('接受的数据2', msg);
    return msg;
}

export function preEncode(this: IConnector ,  reqId: number, route: string, msg: any) {
    // console.warn('发送的数据1', msg);
    let data;
    if (!!reqId) {
        data = composeResponse(this, reqId, route, msg);
    } else {
        data = composePush(this, route, msg);
    }

    // console.warn('发送的数据2', msg);
    return data;
}


function cryptoCode(str: string) {
    let offset = 0;
    const buf = Buffer.from(str);

    for (const byte of buf) {
        buf.writeUInt8((byte ^ 32 ^ 64), offset)
        offset++;
    }

    return buf.toString();
}

function composeResponse(server: any, msgId: number, route: string, msgBody: any) {
    if (!msgId || !route || !msgBody) {
        return null;
    }

    msgBody = encodeBody(server, route, msgBody);
    // console.warn('数据长度1', msgBody.length)
    return Message.encode(msgId, Message.TYPE_RESPONSE, false, null, msgBody);
}

function composePush(server: any, route: string, msgBody: any) {
    if (!route || !msgBody) {
        return null;
    }
    msgBody = encodeBody(server, route, msgBody);

    // console.warn('数据长度2', msgBody.length)
    // encode use dictionary
    let compressRoute = false;
    if (!!server.connector.dictionary) {
        let dict = server.connector.dictionary.getDict();
        if (!!server.connector.useDict && !!dict[route]) {
            route = dict[route];
            compressRoute = true;
        }
    }
    return Message.encode(0, Message.TYPE_PUSH, compressRoute, route, msgBody);
}


function encodeBody(server: any, route: string, msgBody: any) {
    let offset = 0;
    const buf = Buffer.from(JSON.stringify(msgBody));

    for (const byte of buf) {
        buf.writeUInt8((byte ^ 32 ^ 64), offset)
        offset++;
    }

    return buf;
}