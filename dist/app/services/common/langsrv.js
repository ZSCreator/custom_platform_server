'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getlanguage = exports.Net_Message = void 0;
const HallConst = require("../../consts/hallConst");
const CommonUtil = require("../../utils/lottery/commonUtil");
const format = require("string-format");
const multiLanguage = require("./multiLanguage");
exports.Net_Message = multiLanguage.Net_Message;
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
function getlanguage(useLanguage, context, ...optionalParams) {
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
exports.getlanguage = getlanguage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3Nydi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9jb21tb24vbGFuZ3Nydi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLG9EQUFxRDtBQUNyRCw2REFBOEQ7QUFDOUQsd0NBQXlDO0FBQ3pDLGlEQUFrRDtBQUdyQyxRQUFBLFdBQVcsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDO0FBZ0RyRCxTQUFTLGFBQWEsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLGNBQWM7SUFDMUQsSUFBSSxjQUFjLENBQUM7SUFDbkIsT0FBTyxJQUFJLEVBQUU7UUFDVCxjQUFjLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRixJQUFJLFVBQVUsS0FBSyxjQUFjLElBQUksV0FBVyxLQUFLLGNBQWMsRUFBRTtZQUNqRSxNQUFNO1NBQ1Q7S0FDSjtJQUNELE9BQU8sY0FBYyxDQUFDO0FBQzFCLENBQUM7QUFzQkQsU0FBZ0IsV0FBVyxDQUFDLFdBQW1CLEVBQUUsT0FBWSxFQUFFLEdBQUcsY0FBbUI7SUFDakYsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7SUFDcEMsUUFBUSxXQUFXLEVBQUU7UUFDakIsS0FBSyxRQUFRLENBQUMsT0FBTztZQUNqQixRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyQyxNQUFNO1FBQ1YsS0FBSyxRQUFRLENBQUMsVUFBVTtZQUNwQixRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QyxNQUFNO1FBQ1YsS0FBSyxRQUFRLENBQUMsR0FBRztZQUNiLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLE1BQU07UUFDVixLQUFLLFFBQVEsQ0FBQyxVQUFVO1lBQ3BCLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hDLE1BQU07UUFDVixLQUFLLFFBQVEsQ0FBQyxRQUFRO1lBQ2xCLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RDLE1BQU07UUFDVixLQUFLLFFBQVEsQ0FBQyxTQUFTO1lBQ25CLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU07UUFDVixLQUFLLFFBQVEsQ0FBQyxRQUFRO1lBQ2xCLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RDLE1BQU07UUFDVixLQUFLLFFBQVEsQ0FBQyxPQUFPO1lBQ2pCLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JDLE1BQU07UUFDVixLQUFLLFFBQVEsQ0FBQyxLQUFLO1lBQ2YsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkMsTUFBTTtRQUNWO1lBQ0ksUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckMsTUFBTTtLQUNiO0lBQ0QsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUNoRSxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFyQ0Qsa0NBcUNDIn0=