import * as land_Logic from '../../app/servers/land/lib/land_Logic';

import * as land_interface from "../../app/servers/land/lib/land_interface";

/**正序发牌规则 */
function cardDataSort() {
    let cards = land_Logic.genereteCard();
    let cardData: { cards: number[], max_type: number }[] = [];
    // console.warn("==============================");
    for (let index = 0; index < 3; index++) {
        let Thencards = cards.splice(0, 17).sort((a, b) => land_Logic.getCardValue(b) - land_Logic.getCardValue(a));
        cardData.push({ cards: Thencards, max_type: 0 });
    }

    // for (const cards of cardData) {
    //     let ret = cards.cards.map(c => land_Logic.getZhanshi(c));
    //     console.warn(ret.toString());
    // }
    for (const cards of cardData) {
        // console.warn("next");
        let ret = land_Logic.chaipai(cards.cards, []);
        for (const cc of ret) {
            // let ret2 = cc.cards.map(c => land_Logic.getZhanshi(c));
            // console.warn(cc.type, ret2.toString());

            if (cards.max_type < cc.type) {
                cards.max_type = cc.type;
            }
        }
    }
    cardData.sort((a, b) => a.max_type - b.max_type);
    for (const cards of cardData) {
        // console.warn("next22");
        // console.warn(cards.max_type, cards.cards.map(c => land_Logic.getZhanshi(c)).toString());
    }
    return cardData;
}
cardDataSort()