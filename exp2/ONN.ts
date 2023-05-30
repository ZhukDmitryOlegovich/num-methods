import type { M1, M2 } from './Matrix';
import { sum } from './sum';

const TwoPi = 2 * Math.PI;

export class ONN {
	public phi: M1;

	public dphi: M1;

	public N: number;

	constructor(
		public K: M2,
		public f: M1,
		public t: number,
		initPhi?: M1,
	) {
		this.N = f.length;

		if (![
			K.length,
			...K.map((k2) => k2.length),
		].every((size) => size === this.N)) {
			throw new RangeError('incorrect size');
		}

		this.phi = initPhi || [...f];
		this.dphi = [...f];
	}

	step() {
		const {
			phi, K, f, N, t,
		} = this;
		this.dphi = phi.map((_, i) => TwoPi * (
			f[i] + sum(N, (j) => K[i][j] * Math.sin(phi[j] - phi[i]))
		));
		this.phi = phi.map((_, i) => (phi[i] + t * this.dphi[i]) % TwoPi);
	}

	run() {
		this.step();
		return this.phi;
	}

	matrix() {
		return this.K;
	}

	// eslint-disable-next-line class-methods-use-this
	derivative(x: number, y: number) {
		return Math.asin(y);
	}
}
