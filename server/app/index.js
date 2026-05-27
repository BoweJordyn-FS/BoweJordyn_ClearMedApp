const express = require('express');
const app = express();
const routeHandler = require('./routes');
const morgan = require('morgan');

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
	res.status(200).json({ message: 'api is working', success: true });
});

app.use('/ClearMed/v1', routeHandler);
module.exports = app;
