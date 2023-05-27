var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Car_angle;
export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    clone() {
        return new Point(this.x, this.y);
    }
    $move(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    $rotate(angle) {
        const { x, y } = this;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        this.x = x * cos - y * sin;
        this.y = x * sin + y * cos;
        return this;
    }
    toArr() {
        return [this.x, this.y];
    }
}
export class Vector extends Point {
    static Polar(r, a) {
        return new Vector(r, 0).$rotate(a);
    }
    length2() {
        return this.x ** 2 + this.y ** 2;
    }
    length() {
        return this.length2() ** (1 / 2);
    }
    clone() {
        return new Vector(this.x, this.y);
    }
}
const between = (value, max) => Math.max(-max, Math.min(max, value));
export class Car {
    get angle() {
        return __classPrivateFieldGet(this, _Car_angle, "f");
    }
    set angle(newAngle) {
        __classPrivateFieldSet(this, _Car_angle, newAngle % (2 * Math.PI), "f");
    }
    constructor(x, y, options) {
        this.options = options;
        this.speed = 0;
        _Car_angle.set(this, 0);
        this.direction = null; // Направление
        this.turn = null; // Поворот
        this.initPosition = new Point(x, y);
        this.position = new Point(x, y);
        if (this.options.angle) {
            this.angle = this.options.angle;
        }
        this.initAngle = this.angle;
    }
    $reset() {
        this.position = this.initPosition.clone();
        this.angle = this.initAngle;
        this.speed = 0;
    }
    getDirection() {
        switch (this.direction) {
            case 'back':
                return -1;
            case 'forward':
                return 1;
            case 'stop':
                return -Math.sign(this.speed);
            case null:
                return 0;
            default:
                return this.direction;
        }
    }
    getTurn() {
        switch (this.turn) {
            case 'left':
                return -1;
            case 'right':
                return 1;
            case null:
                return 0;
            default:
                return this.turn;
        }
    }
    $step(t) {
        // Сопротивление
        const s = this.speed;
        const r = this.options.resistance * t;
        this.speed = (Math.abs(s - r) - Math.abs(s + r)) / 2 + s; // чтобы не колебатся в нуле
        // Направление
        if (this.direction) {
            this.speed = between(this.speed + this.getDirection() * this.options.dspeed * t, this.options.maxSpeed);
        }
        // Поворот
        if (this.turn) {
            this.angle += Math.sign(this.speed)
                * Math.abs(this.speed / this.options.maxSpeed) ** 0.5
                * this.getTurn()
                * this.options.turn * t;
        }
        // Позиция
        this.position.$move(Vector.Polar(this.speed * t, this.angle));
        return this;
    }
}
_Car_angle = new WeakMap();
