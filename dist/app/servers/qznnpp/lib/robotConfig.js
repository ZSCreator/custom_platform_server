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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RDb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xem5ucHAvbGliL3JvYm90Q29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0JBQWUsQ0FBQztRQUNkLE9BQU8sRUFBRTtZQUNQO2dCQUNFLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxLQUFLO2dCQUNsQixLQUFLLEVBQUUsQ0FBQztnQkFDUixRQUFRLEVBQUUsQ0FBQztnQkFDWCxRQUFRLEVBQUUsRUFBRTthQUNiO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLEtBQUssRUFBRSxDQUFDO2dCQUNSLFFBQVEsRUFBRSxFQUFFO2dCQUNaLFFBQVEsRUFBRSxDQUFDO2FBQ1o7WUFDRDtnQkFDRSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsR0FBRztnQkFDaEIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osUUFBUSxFQUFFLENBQUM7YUFDWjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxHQUFHO2dCQUNoQixLQUFLLEVBQUUsQ0FBQztnQkFDUixRQUFRLEVBQUUsRUFBRTtnQkFDWixRQUFRLEVBQUUsQ0FBQzthQUNaO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osUUFBUSxFQUFFLENBQUM7YUFDWjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxDQUFDO2dCQUNkLEtBQUssRUFBRSxDQUFDO2dCQUNSLFFBQVEsRUFBRSxFQUFFO2dCQUNaLFFBQVEsRUFBRSxDQUFDO2FBQ1o7U0FDRjtRQUNELFlBQVksRUFBRTtZQUNaLE9BQU8sRUFBRSxDQUFDO29CQUNSLFFBQVEsRUFBRSxHQUFHO29CQUNiLElBQUksRUFBRSxDQUFDO2lCQUNSLENBQUM7WUFDRixRQUFRLEVBQUUsQ0FBQztvQkFDVCxRQUFRLEVBQUUsR0FBRztvQkFDYixJQUFJLEVBQUUsQ0FBQztpQkFDUixDQUFDO1lBQ0YsT0FBTyxFQUFFLENBQUM7b0JBRVIsUUFBUSxFQUFFLElBQUk7b0JBQ2QsU0FBUyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQztZQUNGLFFBQVEsRUFBRSxDQUFDO29CQUNULFFBQVEsRUFBRSxHQUFHO29CQUNiLFNBQVMsRUFBRSxFQUFFO2lCQUNkLENBQUM7WUFDRixRQUFRLEVBQUUsQ0FBQztvQkFDVCxRQUFRLEVBQUUsR0FBRztvQkFDYixTQUFTLEVBQUUsRUFBRTtpQkFDZCxDQUFDO1lBRUYsU0FBUyxFQUFFLENBQUM7b0JBQ1YsUUFBUSxFQUFFLEdBQUc7b0JBQ2IsU0FBUyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQztTQUVIO1FBQ0QsV0FBVyxFQUFFLENBQUM7Z0JBQ1osTUFBTSxFQUFFLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLEdBQUc7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDO2dCQUNSLFdBQVcsRUFBRSxDQUFDO2dCQUNkLFdBQVcsRUFBRSxDQUFDO2FBQ2Y7WUFDRDtnQkFDRSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsR0FBRztnQkFDaEIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsV0FBVyxFQUFFLENBQUM7YUFDZjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxHQUFHO2dCQUNoQixLQUFLLEVBQUUsQ0FBQztnQkFDUixXQUFXLEVBQUUsQ0FBQztnQkFDZCxXQUFXLEVBQUUsQ0FBQzthQUNmO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLEdBQUc7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDO2dCQUNSLFdBQVcsRUFBRSxDQUFDO2dCQUNkLFdBQVcsRUFBRSxDQUFDO2FBQ2Y7WUFDRDtnQkFDRSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsQ0FBQztnQkFDZCxLQUFLLEVBQUUsQ0FBQztnQkFDUixXQUFXLEVBQUUsQ0FBQztnQkFDZCxXQUFXLEVBQUUsQ0FBQzthQUNmO1NBRUE7S0FFRixDQUFDLENBQUEifQ==