"use strict";
module.exports = [{
        addRoom: [{
                player: 1,
                probability: 0,
                robot: 2,
                join_max: 4,
                join_min: 10
            },
            {
                player: 2,
                probability: 0.7,
                robot: 2,
                join_max: 15,
                join_min: 5
            },
            {
                player: 3,
                probability: 0.1,
                robot: 2,
                join_max: 15,
                join_min: 5
            },
            {
                player: 4,
                probability: 0.02,
                robot: 2,
                join_max: 15,
                join_min: 5
            },
            {
                player: 5,
                probability: 0.01,
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
                    lev_prob: 0.05,
                    back: 5
                }],
            ten_lose: [{
                    lev_prob: 0.1,
                    back: 5
                }],
            one_win: [{
                    lev_prob: 0.1,
                    back_time: 10
                }],
            one_lose: [{
                    lev_prob: 0.3,
                    back_time: 10
                }],
            less_win: [{
                    lev_prob: 0.4,
                    back_time: 15
                }],
            less_lose: [{
                    lev_prob: 0.8,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RDb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvcm9ib3RTZXJ2aWNlL0JsYWNrSmFjay9yb2JvdENvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsaUJBQVMsQ0FBQztRQUNOLE9BQU8sRUFBRSxDQUFDO2dCQUNGLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxDQUFDO2dCQUNkLEtBQUssRUFBRSxDQUFDO2dCQUNSLFFBQVEsRUFBRSxDQUFDO2dCQUNYLFFBQVEsRUFBRSxFQUFFO2FBRWY7WUFDRDtnQkFDSSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsR0FBRztnQkFDaEIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osUUFBUSxFQUFFLENBQUM7YUFDZDtZQUNEO2dCQUNJLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxHQUFHO2dCQUNoQixLQUFLLEVBQUUsQ0FBQztnQkFDUixRQUFRLEVBQUUsRUFBRTtnQkFDWixRQUFRLEVBQUUsQ0FBQzthQUNkO1lBQ0Q7Z0JBQ0ksTUFBTSxFQUFFLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLEtBQUssRUFBRSxDQUFDO2dCQUNSLFFBQVEsRUFBRSxFQUFFO2dCQUNaLFFBQVEsRUFBRSxDQUFDO2FBQ2Q7WUFDRDtnQkFDSSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsSUFBSTtnQkFDakIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osUUFBUSxFQUFFLENBQUM7YUFDZDtZQUNEO2dCQUNJLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxDQUFDO2dCQUNkLEtBQUssRUFBRSxDQUFDO2dCQUNSLFFBQVEsRUFBRSxFQUFFO2dCQUNaLFFBQVEsRUFBRSxDQUFDO2FBQ2Q7U0FDSjtRQUNELFlBQVksRUFBRTtZQUNWLE9BQU8sRUFBRSxDQUFDO29CQUNOLFFBQVEsRUFBRSxJQUFJO29CQUNkLElBQUksRUFBRSxDQUFDO2lCQUNWLENBQUM7WUFDRixRQUFRLEVBQUUsQ0FBQztvQkFDUCxRQUFRLEVBQUUsR0FBRztvQkFDYixJQUFJLEVBQUUsQ0FBQztpQkFDVixDQUFDO1lBQ0YsT0FBTyxFQUFFLENBQUM7b0JBRU4sUUFBUSxFQUFFLEdBQUc7b0JBQ2IsU0FBUyxFQUFFLEVBQUU7aUJBQ2hCLENBQUM7WUFDRixRQUFRLEVBQUUsQ0FBQztvQkFDUCxRQUFRLEVBQUUsR0FBRztvQkFDYixTQUFTLEVBQUUsRUFBRTtpQkFDaEIsQ0FBQztZQUNGLFFBQVEsRUFBRSxDQUFDO29CQUNQLFFBQVEsRUFBRSxHQUFHO29CQUNiLFNBQVMsRUFBRSxFQUFFO2lCQUNoQixDQUFDO1lBRUYsU0FBUyxFQUFFLENBQUM7b0JBQ1IsUUFBUSxFQUFFLEdBQUc7b0JBQ2IsU0FBUyxFQUFFLEVBQUU7aUJBQ2hCLENBQUM7U0FFTDtRQUNELFdBQVcsRUFBRSxDQUFDO2dCQUNOLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxHQUFHO2dCQUNoQixLQUFLLEVBQUUsQ0FBQztnQkFDUixXQUFXLEVBQUUsQ0FBQztnQkFDZCxXQUFXLEVBQUUsQ0FBQzthQUNqQjtZQUNEO2dCQUNJLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxHQUFHO2dCQUNoQixLQUFLLEVBQUUsQ0FBQztnQkFDUixXQUFXLEVBQUUsQ0FBQztnQkFDZCxXQUFXLEVBQUUsQ0FBQzthQUNqQjtZQUNEO2dCQUNJLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxHQUFHO2dCQUNoQixLQUFLLEVBQUUsQ0FBQztnQkFDUixXQUFXLEVBQUUsQ0FBQztnQkFDZCxXQUFXLEVBQUUsQ0FBQzthQUNqQjtZQUNEO2dCQUNJLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxHQUFHO2dCQUNoQixLQUFLLEVBQUUsQ0FBQztnQkFDUixXQUFXLEVBQUUsQ0FBQztnQkFDZCxXQUFXLEVBQUUsQ0FBQzthQUNqQjtZQUNEO2dCQUNJLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxDQUFDO2dCQUNkLEtBQUssRUFBRSxDQUFDO2dCQUNSLFdBQVcsRUFBRSxDQUFDO2dCQUNkLFdBQVcsRUFBRSxDQUFDO2FBQ2pCO1NBRUo7S0FFSixDQUFDLENBQUEifQ==