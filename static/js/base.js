import { Game_Map } from '/static/js/game_map/base.js';
import { Kyo } from '/static/js/player/Kyo.js';

class KOF {
    constructor(id) {
        this.$kof = $('#' + id)
        this.game_map = new Game_Map(this);
        this.players = [
            new Kyo(this, {
                id: 0,
                x: 200,
                y: 0,
                width: 150,
                height: 200,
                color: 'blue',
            }),
            new Kyo(this, {
                id: 1,
                x: 900,
                y: 0,
                width: 150,
                height: 200,
                color: 'red',
            })
        ]
    }
}



export {
    KOF
};