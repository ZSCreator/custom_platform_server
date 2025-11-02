"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [{
        addRoom: [
            {
                player: 1,
                probability: 0.999,
                robot: 2,
                join_max: 4,
                join_min: 10
            },
            {
                player: 2,
                probability: 0.98,
                robot: 2,
                join_max: 15,
                join_min: 5
            },
            {
                player: 3,
                probability: 0.4,
                robot: 2,
                join_max: 15,
                join_min: 5
            },
            {
                player: 4,
                probability: 0.1,
                robot: 2,
                join_max: 15,
                join_min: 5
            },
            {
                player: 5,
                probability: 0,
                robot: 2,
                join_max: 15,
                join_min: 5
            },
            {
                player: 6,
                probability: 0,
                robot: 2,
                join_max: 15,
                join_min: 5
            },
        ],
        moneyLevRoom: {
            ten_win: [{
                    lev_prob: 0.1,
                    back: 5
                }],
            ten_lose: [{
                    lev_prob: 0.1,
                    back: 5
                }],
            one_win: [{
                    lev_prob: 0.15,
                    back_time: 10
                }],
            one_lose: [{
                    lev_prob: 0.2,
                    back_time: 10
                }],
            less_win: [{
                    lev_prob: 0.1,
                    back_time: 15
                }],
            less_lose: [{
                    lev_prob: 0.2,
                    back_time: 15
                }],
        },
        paddLevRoom: [{
                p_numb: 2,
                probability: 0.2,
                robot: 1,
                lg_numb_min: 2,
                lg_numb_max: 8,
            },
            {
                p_numb: 3,
                probability: 0.2,
                robot: 1,
                lg_numb_min: 2,
                lg_numb_max: 8,
            },
            {
                p_numb: 4,
                probability: 0.6,
                robot: 1,
                lg_numb_min: 2,
                lg_numb_max: 6,
            },
            {
                p_numb: 5,
                probability: 0.8,
                robot: 2,
                lg_numb_min: 1,
                lg_numb_max: 5,
            },
            {
                p_numb: 6,
                probability: 1,
                robot: 2,
                lg_numb_min: 1,
                lg_numb_max: 3,
            },
        ],
    }];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RDb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xenBqL2xpYi9yb2JvdENvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGtCQUFlLENBQUM7UUFDZCxPQUFPLEVBQUU7WUFDUDtnQkFDRSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsS0FBSztnQkFDbEIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLEVBQUU7YUFDYjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxJQUFJO2dCQUNqQixLQUFLLEVBQUUsQ0FBQztnQkFDUixRQUFRLEVBQUUsRUFBRTtnQkFDWixRQUFRLEVBQUUsQ0FBQzthQUNaO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLEdBQUc7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDO2dCQUNSLFFBQVEsRUFBRSxFQUFFO2dCQUNaLFFBQVEsRUFBRSxDQUFDO2FBQ1o7WUFDRDtnQkFDRSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsR0FBRztnQkFDaEIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osUUFBUSxFQUFFLENBQUM7YUFDWjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxDQUFDO2dCQUNkLEtBQUssRUFBRSxDQUFDO2dCQUNSLFFBQVEsRUFBRSxFQUFFO2dCQUNaLFFBQVEsRUFBRSxDQUFDO2FBQ1o7WUFDRDtnQkFDRSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsQ0FBQztnQkFDZCxLQUFLLEVBQUUsQ0FBQztnQkFDUixRQUFRLEVBQUUsRUFBRTtnQkFDWixRQUFRLEVBQUUsQ0FBQzthQUNaO1NBQ0Y7UUFDRCxZQUFZLEVBQUU7WUFDWixPQUFPLEVBQUUsQ0FBQztvQkFDUixRQUFRLEVBQUUsR0FBRztvQkFDYixJQUFJLEVBQUUsQ0FBQztpQkFDUixDQUFDO1lBQ0YsUUFBUSxFQUFFLENBQUM7b0JBQ1QsUUFBUSxFQUFFLEdBQUc7b0JBQ2IsSUFBSSxFQUFFLENBQUM7aUJBQ1IsQ0FBQztZQUNGLE9BQU8sRUFBRSxDQUFDO29CQUVSLFFBQVEsRUFBRSxJQUFJO29CQUNkLFNBQVMsRUFBRSxFQUFFO2lCQUNkLENBQUM7WUFDRixRQUFRLEVBQUUsQ0FBQztvQkFDVCxRQUFRLEVBQUUsR0FBRztvQkFDYixTQUFTLEVBQUUsRUFBRTtpQkFDZCxDQUFDO1lBQ0YsUUFBUSxFQUFFLENBQUM7b0JBQ1QsUUFBUSxFQUFFLEdBQUc7b0JBQ2IsU0FBUyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQztZQUVGLFNBQVMsRUFBRSxDQUFDO29CQUNWLFFBQVEsRUFBRSxHQUFHO29CQUNiLFNBQVMsRUFBRSxFQUFFO2lCQUNkLENBQUM7U0FFSDtRQUNELFdBQVcsRUFBRSxDQUFDO2dCQUNaLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxHQUFHO2dCQUNoQixLQUFLLEVBQUUsQ0FBQztnQkFDUixXQUFXLEVBQUUsQ0FBQztnQkFDZCxXQUFXLEVBQUUsQ0FBQzthQUNmO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLEdBQUc7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDO2dCQUNSLFdBQVcsRUFBRSxDQUFDO2dCQUNkLFdBQVcsRUFBRSxDQUFDO2FBQ2Y7WUFDRDtnQkFDRSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsR0FBRztnQkFDaEIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsV0FBVyxFQUFFLENBQUM7YUFDZjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxHQUFHO2dCQUNoQixLQUFLLEVBQUUsQ0FBQztnQkFDUixXQUFXLEVBQUUsQ0FBQztnQkFDZCxXQUFXLEVBQUUsQ0FBQzthQUNmO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsV0FBVyxFQUFFLENBQUM7YUFDZjtTQUVBO0tBRUYsQ0FBQyxDQUFBIn0=