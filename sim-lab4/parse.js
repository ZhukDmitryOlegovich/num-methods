import * as fs from 'fs';

let data = Array.from(
	fs.readFileSync('./data.txt').toString()
		.matchAll(/^(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/mg)
)
	.map((e) => e.slice(1))
	.map(([index, id, f1, f2, f3, p]) => [+index, id, +f1, +f2, +f3, +p])
	.reduce((accum, e) => {
		if (e[0] === 0) {
			accum.push([]);
		}
		accum.at(-1).push(e.slice(1));
		return accum;
	}, []);

fs.writeFileSync('parsed_data.json', JSON.stringify(data, null, '\t'));
