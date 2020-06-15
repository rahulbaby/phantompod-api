import mongoose from 'mongoose';
import config from 'config';
import chalk from 'chalk';

var connected = chalk.bold.cyan;
var error = chalk.bold.yellow;
var disconnected = chalk.bold.red;
var termination = chalk.bold.magenta;

export const connectDb = cb => {
	const dbURL = config.get('db.url');
	mongoose.connect(dbURL, { useNewUrlParser: true, useCreateIndex: true });
	mongoose.connection.on('connected', function () {
		console.log(connected('Mongoose default connection is open to ', dbURL));
		cb();
	});

	mongoose.connection.on('error', function (err) {
		console.log(error('Mongoose default connection has occured ' + err + ' error'));
	});

	mongoose.connection.on('disconnected', function () {
		console.log(disconnected('Mongoose default connection is disconnected'));
	});
};

export { default as paginatePlugin } from './paginatePlugin';
export const toMongoObjectId = id => mongoose.Types.ObjectId(id);
