// import * as synaptic from synaptic';

// class OscillatorLayer extends synaptic.Layer {
// 	public amplitude: number;

// 	public frequency: number;

// 	public phase: number;

// 	constructor(
// 		numberOfNeurons: number,
// 		options: { amplitude?: number, frequency?: number, phase?: number; },
// 	) {
// 		super(numberOfNeurons);
// 		this.amplitude = options.amplitude || 1;
// 		this.frequency = options.frequency || 1;
// 		this.phase = options.phase || 0;
// 	}

// 	activate(input: number[]) {
// 		const activation = super.activate(input);
// 		const oscillation = activation.map((value) => this.amplitude
// 			* Math.sin((2 * Math.PI * this.frequency * value) + this.phase));
// 		return oscillation;
// 	}
// }
