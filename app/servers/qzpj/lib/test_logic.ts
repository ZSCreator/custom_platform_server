{//倒叙算法测试
    let players = [
        { seat: 0 },
        { seat: 1 },
        { seat: 2 },
        { seat: 3 },
        { seat: 4 },
        { seat: 5 },
    ]
    let start_seat = 0;
    let filterArr = [];
    for (let index = players.length + start_seat; index >= 0; index--) {
        let seat = index;
        if (index >= players.length) seat = index - players.length;
        const pl = players[seat];
        if (!pl || filterArr.includes(pl.seat)) continue;
        filterArr.push(pl.seat);

        // const member = pl && this.channel.getMember(pl.uid);
        // const opts = pl && pl.strip();
        // member && MessageService.pushMessageByUids('qzpj.onDeal', opts, member);
    }
    console.warn(filterArr);
}
