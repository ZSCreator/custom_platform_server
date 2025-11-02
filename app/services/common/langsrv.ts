'use strict';

import HallConst = require('../../consts/hallConst');
import CommonUtil = require('../../utils/lottery/commonUtil');
import format = require('string-format');
import multiLanguage = require("./multiLanguage");


export const Net_Message = multiLanguage.Net_Message;
// 语言脚本
// const LANGUAGE_PACKAGE = 'language_package';

/**idOrMessage 是 id 就根据 ID返回警告，否则直接返回 idOrMessage */
// export function chooseWarning(idOrMessage, language) {
//     if (Number.isInteger(idOrMessage)) {
//         return getlanguage(language, idOrMessage)
//     }
//     return idOrMessage;
// };

/**根据语言类型 和 ID来获取警告语，默认是中文 */
// export function getlanguage(language: string, warningID: number) {
//     if (!language) {
//         language = HallConst.LANGUAGE.DEFAULT;
//     }
//     // multiLanguage.language.
//     let languageJson = JsonManager.get(language);
//     if (!languageJson) {
//         languageJson = JsonManager.get(HallConst.LANGUAGE.DEFAULT);
//     }
//     return languageJson.getById(warningID).warning;
// };

/**
 * 获取带参数的语言包
 * @param language 语言包类型
 * @param waringId 语言包ID
 * @param optionalParams 语言包参数
 * @returns {*}
 */
// export function getMessage(language: string, waringId: number, ...optionalParams) {
//     let msg_temp = getlanguage(language, waringId);
//     if (!msg_temp) {
//         return waringId;
//     }
//     let msg = format.apply(this, [msg_temp].concat(optionalParams));
//     return msg;
// }

// /**获取微信登录的密钥 */
// export function getWeixinKey() {
//     return JsonManager.get('weixinKey').datas;
// };


/**选择一个不同于上一场比赛的球队ID */
function choseDiffTeam(lastHostID, lastGuestID, teamCollection) {
    let selectedTeamID;
    while (true) {
        selectedTeamID = teamCollection[CommonUtil.randomFromRange(0, teamCollection.length - 1)];
        if (lastHostID !== selectedTeamID && lastGuestID !== selectedTeamID) {
            break;
        }
    }
    return selectedTeamID;
}
/**
 * 获取带参数的语言包
 * @param language 语言包类型
 * @param waringId 语言包ID
 * @param optionalParams 语言包参数
 * @returns {*}
 */
// export function getLanguageMessage(language: string, key: string, ...optionalParams) {
//     let languageJson = JsonManager.get(LANGUAGE_PACKAGE);
//     const value = languageJson.get(key).warning;
//     if (!language) {
//         language = HallConst.LANGUAGE.CHINESE;
//     }
//     let msg = value[language];
//     msg = format.apply(this, [msg].concat(optionalParams));
//     return msg;
// }




export function getlanguage(useLanguage: string, context: any, ...optionalParams: any) {
    let msg_temp = "";
    const LANGUAGE = HallConst.LANGUAGE;
    switch (useLanguage) {
        case LANGUAGE.ENGLISH:
            msg_temp = context[LANGUAGE.ENGLISH];
            break;
        case LANGUAGE.CHINESE_ZH:
            msg_temp = context[LANGUAGE.CHINESE_ZH];
            break;
        case LANGUAGE.Dai:
            msg_temp = context[LANGUAGE.Dai];
            break;
        case LANGUAGE.Vietnamese:
            msg_temp = context[LANGUAGE.Vietnamese];
            break;
        case LANGUAGE.Portugal:
            msg_temp = context[LANGUAGE.Portugal];
            break;
        case LANGUAGE.Indonesia:
            msg_temp = context[LANGUAGE.Indonesia];
            break;
        case LANGUAGE.Malaysia:
            msg_temp = context[LANGUAGE.Malaysia];
            break;
        case LANGUAGE.Spanish:
            msg_temp = context[LANGUAGE.Spanish];
            break;
        case LANGUAGE.Hindi:
            msg_temp = context[LANGUAGE.Hindi];
            break;
        default:
            msg_temp = context[LANGUAGE.DEFAULT];
            break;
    }
    let msg = format.apply(this, [msg_temp].concat(optionalParams));
    return msg;
}
