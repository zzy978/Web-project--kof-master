import { GameObject } from "/static/js/game_object/base.js";

export class Player extends GameObject {
    constructor(root, info) {
        super();

        this.root = root;

        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;

        this.direction = 1; // 1向右 -1向左

        this.vx = 0;
        this.vy = 0;
        this.speedx = 400;  //水平移动速度
        this.speedy = 1200; // 跳起的速度

        this.gravity = 50; //重力

        this.ctx = this.root.game_map.ctx;
        this.pressed_keys = this.root.game_map.controller.pressed_keys;
        this.status = 3; // 0:idle 1:向右走 2:向左走 3:跳跃 4：攻击 5:被击打 6:死亡
        this.animations = new Map();
        this.frame_current_cnt = 0;

        this.hp = 100;
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`);
        this.$hp_div = this.root.$kof.find(`.kof-head-hp-${this.id}>div>div`);

    }

    start() {

    }

    update_control() {
        let w, a, d, space;
        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        }
        else {
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }

        // console.log(this.pressed_keys);
        // console.log(w, a, d, space);

        if (this.status === 0 || this.status === 1 || this.status === 2) {
            if (space) {
                this.status = 4;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } else if (w) {
                if (d) {
                    this.vx = this.speedx;
                } else if (a) {
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0;
                }
                this.vy = -this.speedy;
                this.status = 3;
                this.frame_current_cnt = 0;
            } else if (d) {
                this.vx = this.speedx;
                this.status = 1;
            } else if (a) {
                this.vx = -this.speedx;
                this.status = 1;
            } else {
                this.vx = 0;
                this.status = 0;
            }
        }

    }

    update_move() {
        if (this.status === 3) {
            this.vy += this.gravity;
        }
        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        // 推人效果
        let [a, b] = this.root.players;
        if (a !== this) [a, b] = [b, a];
        if (a && b) {
            let r1 = {
                x1: a.x,
                y1: a.y,
                x2: a.x + a.width - 40,
                y2: a.y + a.height
            };
            let r2 = {
                x1: b.x + 30,
                y1: b.y,
                x2: b.x + b.width,
                y2: b.y + b.height
            }
            if (this.is_collision(r1, r2)) {
                b.x += this.vx * this.timedelta / 1000 / 2;
                b.y += this.vy * this.timedelta / 1000 / 2;
                a.x -= this.vx * this.timedelta / 1000 / 2;
                a.y -= this.vy * this.timedelta / 1000 / 2;
            }
        }

        if (this.y > 450) {
            this.vy = 0;
            this.y = 450; // 玩家不能掉出地图
            this.status = 0;
        }

        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }
    }

    update_direction() {
        if (this.status === 6) return; // 玩家死亡时，不改变方向

        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) {
                me.direction = 1;
            } else {
                me.direction = -1;
            }
        }
    }

    is_collision(r1, r2) {
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2)) {
            return false;
        }
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2)) {
            return false;
        }
        return true;
    }

    is_attack() {
        if (this.status === 6) return;
        this.status = 5;
        this.frame_current_cnt = 0;
        this.hp -= 10;

        this.$hp_div.animate({
            width: this.$hp.parent().width() * this.hp / 100,
        }, 500); // 玩家血条减少
        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp / 100,
        }, 800); // 血量减少拖影效果
        // this.$hp.width(this.$hp.parent().width() * this.hp / 100);
        if (this.hp <= 0) {
            this.hp = 0;
            this.status = 6;
            this.frame_current_cnt = 0;
            this.vx = this.vy = 0;
            this.y = 450;
        }
    }

    update_attack() {
        if (this.status === 4 && this.frame_current_cnt === 18) {
            let me = this, you = this.root.players[1 - this.id];
            let r1;
            if (this.direction > 0) {
                r1 = {
                    x1: me.x + 200,
                    y1: me.y + 40,
                    x2: me.x + 200 + 20,
                    y2: me.y + 40 + 20
                };
            } else {
                r1 = {
                    x1: me.x - 200 + me.width - 30,
                    y1: me.y + 40,
                    x2: me.x - 200 + me.width - 30 + 20,
                    y2: me.y + 40 + 20
                };
            }

            let r2;
            if (this.direction > 0) {
                r2 = {
                    x1: you.x,
                    y1: you.y,
                    x2: you.x + you.width - 40,
                    y2: you.y + you.height
                };
            } else {
                r2 = {
                    x1: you.x + 30,
                    y1: you.y,
                    x2: you.x + you.width,
                    y2: you.y + you.height
                };
            }
            if (this.is_collision(r1, r2)) {
                you.is_attack();
            }
        }
    }

    update() {

        this.update_control();
        this.update_move();
        this.update_direction();
        this.update_attack();
        this.render();
    }

    render() {
        // this.ctx.fillStyle = this.color;
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);
        // console.log(this.vx);

        // 碰撞盒子
        // if (this.direction === -1) {
        //     this.ctx.fillStyle = 'blue';
        //     this.ctx.fillRect(this.x + 30, this.y, this.width - 30, this.height);
        // } else {
        //     this.ctx.fillStyle = 'blue';
        //     this.ctx.fillRect(this.x, this.y, this.width - 40, this.height);
        // }
        // if (this.direction === 1) {
        //     this.ctx.fillStyle = 'red';
        //     this.ctx.fillRect(this.x + 200, this.y + 40, 20, 20);
        // } else {
        //     this.ctx.fillStyle = 'red';
        //     this.ctx.fillRect(this.x - 200 + this.width - 30, this.y + 40, 20, 20);
        // }

        if (this.status === 1 && this.direction * this.vx < 0) {
            this.status = 2;

        }
        let status = this.status;
        // console.log(this.pressed_keys);
        // console.log(this.status);
        let obj = this.animations.get(this.status);

        if (obj && obj.loaded) {

            if (this.direction > 0) {
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image; // 获取当前帧的图片
                // console.log(image);
                // this.ctx.fillStyle = 'blue';
                // this.ctx.fillRect(this.x, this.y, this.width - 40, this.height);
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale); // 绘制图片
            } else {
                this.ctx.save();;
                this.ctx.scale(-1, 1);
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0);
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image; // 获取当前帧的图片
                // this.ctx.fillStyle = 'blue';
                // this.ctx.fillRect(this.root.game_map.$canvas.width() - this.x - this.width, this.y, this.width - 40, this.height);
                // console.log(image);
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale); // 绘制图片
                this.ctx.restore();
            }


        }
        if (status === 4 && parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt === obj.frame_cnt - 1) {
            this.status = 0;

        }
        if (status === 5 && parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt === obj.frame_cnt - 1) {
            this.status = 0;
        }
        if (status === 6 && parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt === obj.frame_cnt - 1) {
            this.frame_current_cnt--;
        }

        this.frame_current_cnt++; // 更新当前帧计数
    }
}