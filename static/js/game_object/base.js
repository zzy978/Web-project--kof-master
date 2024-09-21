let Game_Objects = [];

class GameObject {
    constructor() {
        Game_Objects.push(this);

        this.timedelta = 0;
        this.has_call_start = false;
    }

    start() { //初始执行一次

    }

    update() { //每帧执行一次（除了第一帧）

    }

    destroy() { //销毁对象
        for (let i in Game_Objects) {
            if (Game_Objects[i] === this) {
                Game_Objects.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let Game_Objects_Frame = timestamp => {
    for (let obj of Game_Objects) {
        if (!obj.has_call_start) {
            obj.start();
            obj.has_call_start = true;
        }
        else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;
    requestAnimationFrame(Game_Objects_Frame);
}

requestAnimationFrame(Game_Objects_Frame);

export {
    GameObject
}