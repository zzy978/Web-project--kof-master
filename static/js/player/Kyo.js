import { Player } from "/static/js/player/base.js";
import { GIF } from "/static/js/utils/gif.js";

export class Kyo extends Player {
    constructor(root, info) {
        super(root, info);

        this.init_animations();
    }

    init_animations() {
        let offsets = [0, -22, -22, -120, 0, 0, 0]; // 偏移量
        for (let i = 0; i < 7; i++) {
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`);
            this.animations.set(i, {
                gif: gif,
                frame_cnt: 0,  // 总帧数
                frame_rate: 5, // 每秒多少帧
                offset_y: offsets[i], // 偏移量
                loaded: false,
                scale: 2
            })

            let outer = this;
            gif.onload = function () {
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;

                if (i === 3) {
                    obj.frame_rate = 4;
                }
            }
        }
    }
}