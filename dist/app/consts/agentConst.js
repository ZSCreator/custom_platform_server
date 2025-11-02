'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTokenKey = exports.TOKEN_KEY_TTL = exports.AGNET_LOCK_TTL = exports.AGENT_LOCK_PREFIX = exports.AGENT_LEVEL = void 0;
exports.AGENT_LEVEL = {
    TOP_LEVEL: 1,
    BORDER: 0,
};
exports.AGENT_LOCK_PREFIX = 'agent:';
exports.AGNET_LOCK_TTL = 20000;
exports.TOKEN_KEY_TTL = 60;
const redisTokenKey = 'agentToken';
function buildTokenKey(token) {
    return redisTokenKey + ":" + token;
}
exports.buildTokenKey = buildTokenKey;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnRDb25zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9jb25zdHMvYWdlbnRDb25zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtBLFFBQUEsV0FBVyxHQUFHO0lBQ3ZCLFNBQVMsRUFBRSxDQUFDO0lBQ1osTUFBTSxFQUFFLENBQUM7Q0FDWixDQUFDO0FBR1csUUFBQSxpQkFBaUIsR0FBRyxRQUFRLENBQUM7QUFHN0IsUUFBQSxjQUFjLEdBQUcsS0FBSyxDQUFDO0FBR3ZCLFFBQUEsYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUdoQyxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUM7QUFNbkMsU0FBZ0IsYUFBYSxDQUFDLEtBQWE7SUFDdkMsT0FBTyxhQUFhLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztBQUN2QyxDQUFDO0FBRkQsc0NBRUM7QUFBQSxDQUFDIn0=