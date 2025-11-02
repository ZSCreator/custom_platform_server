import format = require('string-format');


function getlanguage(conntext: { "zh-cn": string, en: string }, useLanguage = "zh-cn", ...optionalParams: any) {
    let msg = "";
    switch (useLanguage) {
        case "zh-cn":
            msg = conntext["zh-cn"];
            break;
        case "zh-cn":
            msg = conntext["en"];
            break;
        default:
            msg = conntext["zh-cn"];
            break;
    }
    msg = format(msg, optionalParams);
    return msg;
}