import { FixedArr } from '../FixedArr';

export class Point {
	constructor(
		public x: number,
		public y: number,
	) { }

	clone() {
		return new Point(this.x, this.y);
	}

	$move(v: Point) {
		this.x += v.x;
		this.y += v.y;
		return this;
	}

	$rotate(angle: number) {
		const { x, y } = this;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		this.x = x * cos - y * sin;
		this.y = x * sin + y * cos;
		return this;
	}

	toArr(): FixedArr<2, number> {
		return [this.x, this.y];
	}
}

export class Vector extends Point {
	static Polar(r: number, a: number) {
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

type Interval = number;

const between = (
	value: number, max: Interval,
) => Math.max(-max, Math.min(max, value));

export class Car {
	public position: Point;

	public speed = 0;

	#angle = 0;

	get angle() {
		return this.#angle;
	}

	set angle(newAngle: number) {
		this.#angle = newAngle % (2 * Math.PI);
	}

	public direction: 'forward' | 'back' | 'stop' | number | null = null; // Направление

	public turn: 'left' | 'right' | number | null = null; // Поворот

	public initPosition: Point;

	public initAngle: number;

	constructor(
		x: number,
		y: number,
		public options: {
			maxSpeed: number, turn: number; resistance: number; dspeed: number; angle?: number;
		},
	) {
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

	getDirection(): number {
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

	getTurn(): number {
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

	$step(t: number) {
		// Сопротивление
		const s = this.speed;
		const r = this.options.resistance * t;
		this.speed = (Math.abs(s - r) - Math.abs(s + r)) / 2 + s;
		// Направление
		if (this.direction) {
			this.speed = between(
				this.speed + this.getDirection() * this.options.dspeed * t,
				this.options.maxSpeed,
			);
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
