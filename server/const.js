const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const root = path.resolve(__dirname, '..');
const static = path.resolve(root, 'static');
const tsconfig = JSON.parse(
	fs.readFileSync(path.resolve(root, 'tsconfig.json'))
		.toString()
		.replace(/\/\/.*|\/\*(?=[^"]).*?\*\//g, '')
);
const { compilerOptions } = tsconfig;
const build = path.resolve(
	root,
	compilerOptions.outDir || '.'
);
const rootDir = path.resolve(root, compilerOptions.rootDir || '.');
// const paths = Object.entries(compilerOptions.paths || {}).map(
// 	/**
// 	 * @param {[string, [string]]} param0 
// 	 * @returns {[RegExp, string]}
// 	 */
// 	([reg, [rep]]) => [
// 		new RegExp(('^' + reg + '$').replace(/\^?\*\$?/, '')),
// 		rep.replace('*', '').replace(/^\.(?=\/)/, build),
// 	]);

module.exports = { root, build, static, port };
