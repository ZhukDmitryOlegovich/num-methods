const style = require('chalk');
const express = require('express');
const { port } = require('./const');

const app = express();

const getTime = () => new Date().toLocaleString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// eslint-disable-next-line no-console
const print = (...message) => console.log(style.grey(getTime()), ...message);

app.use((req, _, next) => {
	// print(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
	print(style.green(req.originalUrl));
	next();
});

app.use(express.static('.'));

app.listen(port, () => print('Server listening', style.green(`http://localhost:${port}`)));
