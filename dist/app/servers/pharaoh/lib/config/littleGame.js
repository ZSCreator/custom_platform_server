"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.littleGameBonusOdds = exports.gold = exports.platinum = exports.diamond = exports.king = exports.awardOdds = exports.littleGameLayout = void 0;
exports.littleGameLayout = {
    '1': [
        'silver', 'copper', 'silver', 'copper', 'copper', 'null',
        'silver', 'copper', 'dice', 'copper', 'null', 'copper',
        'gold', 'null', 'silver', 'dice', 'gold', 'null',
        'copper', 'silver', 'gold', 'null', 'copper', 'silver',
        'copper', 'silver', 'gold', 'bonus'
    ],
    '2': [
        'gold', 'copper', 'silver', 'copper', 'silver', 'null',
        'silver', 'dice', 'null', 'copper', 'null', 'copper',
        'gold', 'null', 'copper', 'silver', 'gold', 'null',
        'dice', 'silver', 'gold', 'null', 'copper', 'silver',
        'gold', 'silver', 'gold', 'bonus'
    ],
    '3': [
        'silver', 'copper', 'copper', 'copper', 'copper', 'null',
        'silver', 'dice', 'copper', 'copper', 'null', 'copper',
        'copper', 'gold', 'silver', 'copper', 'copper', 'null',
        'copper', 'silver', 'copper', 'gold', 'silver', 'dice',
        'copper', 'silver', 'gold', 'bonus'
    ]
};
exports.awardOdds = {
    'null': 0,
    'gold': 1,
    'silver': 0.2,
    'copper': 0.1,
    'dice': 1,
};
exports.king = 'king';
exports.diamond = 'diamond';
exports.platinum = 'platinum';
exports.gold = 'gold';
exports.littleGameBonusOdds = {
    [exports.king]: 0.0008,
    [exports.diamond]: 0.00008,
    [exports.platinum]: 0.00005,
    [exports.gold]: 0.00001,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl0dGxlR2FtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3BoYXJhb2gvbGliL2NvbmZpZy9saXR0bGVHYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNhLFFBQUEsZ0JBQWdCLEdBQUc7SUFDNUIsR0FBRyxFQUFFO1FBQ0QsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNO1FBQ3hELFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUTtRQUN0RCxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU07UUFDaEQsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRO1FBQ3RELFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU87S0FDdEM7SUFDRCxHQUFHLEVBQUU7UUFDRCxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU07UUFDdEQsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRO1FBQ3BELE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTTtRQUNsRCxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVE7UUFDcEQsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTztLQUNwQztJQUNELEdBQUcsRUFBRTtRQUNELFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTTtRQUN4RCxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVE7UUFDdEQsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNO1FBQ3RELFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTTtRQUN0RCxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPO0tBQ3RDO0NBQ0osQ0FBQztBQUdXLFFBQUEsU0FBUyxHQUFHO0lBQ3JCLE1BQU0sRUFBRSxDQUFDO0lBQ1QsTUFBTSxFQUFFLENBQUM7SUFDVCxRQUFRLEVBQUUsR0FBRztJQUNiLFFBQVEsRUFBRSxHQUFHO0lBQ2IsTUFBTSxFQUFFLENBQUM7Q0FDWixDQUFDO0FBR1csUUFBQSxJQUFJLEdBQUcsTUFBTSxDQUFDO0FBR2QsUUFBQSxPQUFPLEdBQUcsU0FBUyxDQUFDO0FBR3BCLFFBQUEsUUFBUSxHQUFHLFVBQVUsQ0FBQztBQUd0QixRQUFBLElBQUksR0FBRyxNQUFNLENBQUM7QUFTZCxRQUFBLG1CQUFtQixHQUFHO0lBQy9CLENBQUMsWUFBSSxDQUFDLEVBQUUsTUFBTTtJQUNkLENBQUMsZUFBTyxDQUFDLEVBQUUsT0FBTztJQUNsQixDQUFDLGdCQUFRLENBQUMsRUFBRSxPQUFPO0lBQ25CLENBQUMsWUFBSSxDQUFDLEVBQUUsT0FBTztDQUNsQixDQUFDIn0=