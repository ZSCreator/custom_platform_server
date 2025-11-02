//行动配置
export default [{
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

}]