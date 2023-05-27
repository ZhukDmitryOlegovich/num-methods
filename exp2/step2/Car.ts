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

type Interval = { max: number, min: number; };

const between = (value: number, { min, max }: Interval) => Math.max(min, Math.min(max, value));

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

	public direction: 'forward' | 'back' | 'stop' | null = null; // Направление

	public turn: 'left' | 'right' | null = null; // Поворот

	constructor(
		x: number,
		y: number,
		public options: { speed: Interval, turn: number; resistance: number; dspeed: number; },
	) {
		this.position = new Point(x, y);
	}

	$step(t: number) {
		// Сопротивление
		const s = this.speed;
		const r = this.options.resistance * t;
		this.speed = (Math.abs(s - r) - Math.abs(s + r)) / 2 + s; // чтобы не колебатся в нуле
		// Направление
		if (this.direction) {
			const sign = this.direction === 'stop' ? -Math.sign(this.speed) : this.direction === 'forward' ? 1 : -1;
			this.speed = between(this.speed + sign * this.options.dspeed * t, this.options.speed);
		}
		// Поворот
		if (this.turn) {
			this.angle += Math.sign(this.speed) * Math.abs(this.speed / this.options.speed.max) ** 0.5 * (this.turn === 'right' ? 1 : -1) * this.options.turn * t;
		}
		// Позиция
		this.position.$move(Vector.Polar(this.speed * t, this.angle));
		return this;
	}
}
