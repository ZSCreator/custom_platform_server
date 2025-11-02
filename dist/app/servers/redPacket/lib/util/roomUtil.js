"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = void 0;
function buildRecordResult(grabQueue) {
    const redPacketAmount = grabQueue.reduce(((num, redPacket) => {
        return parseFloat(redPacket.redPacketAmount) + num;
    }), 0);
    const redPacketCount = grabQueue.length;
    const containMinesCount = grabQueue.filter(redPacket => redPacket.isStepInMine).length;
    let redPackets = grabQueue.reduce((str, redPacket) => {
        return str + `${redPacket.redPacketAmount}/${redPacket.hasGrabed ? 1 : 0}/${redPacket.isStepInMine ? 1 : 0}|`;
    }, '');
    redPackets = redPackets.slice(0, redPackets.length - 1);
    return `${redPacketAmount}|${redPacketCount}|${containMinesCount}|${redPackets}`;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9yZWRQYWNrZXQvbGliL3V0aWwvcm9vbVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBTUEsU0FBZ0IsaUJBQWlCLENBQUMsU0FBNkI7SUFFM0QsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxFQUFFO1FBQ3pELE9BQU8sVUFBVSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDdkQsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUM7SUFJUixNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO0lBR3hDLE1BQU0saUJBQWlCLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFHdkYsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsRUFBRTtRQUNqRCxPQUFPLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxlQUFlLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUNsSCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFUCxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUV4RCxPQUFPLEdBQUcsZUFBZSxJQUFJLGNBQWMsSUFBSSxpQkFBaUIsSUFBSSxVQUFVLEVBQUUsQ0FBQztBQUNyRixDQUFDO0FBckJELDhDQXFCQyJ9