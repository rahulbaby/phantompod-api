import { Router } from 'express';
import User from 'models/user';
import passport from 'passport';
import sesTransport from 'nodemailer-ses-transport';
import nodemailer from 'nodemailer';
import Cryptr from 'cryptr';

import auth from 'routes/auth';
import notification from 'routes/notification';
import stripe from 'routes/stripe';
import user from 'routes/user';
import pod from 'routes/pod';
import post from 'routes/post';
import admin from 'routes/admin';
import settings from 'routes/settings';
import cron from './cron';

const cryptr = new Cryptr('pass123');

const router = Router();

router.use('/auth', auth);
router.use('/user', user);
router.use('/stripe', stripe);
router.use('/cron', cron);

router.use('/pod', passport.authenticate('jwt', { session: false }), pod);
router.use('/post', passport.authenticate('jwt', { session: false }), post);
router.use('/notification', passport.authenticate('jwt', { session: false }), notification);
router.use('/admin', passport.authenticate('jwt', { session: false }), admin);
router.use('/settings', passport.authenticate('jwt', { session: false }), settings);

router.route('/items').get((req, res, next) => {
	const items = require('../enums/items');
	res.send(items);
});

router.route('/verify-email').post(async (req, res, next) => {
	try {
		const decryptedString = cryptr.decrypt(req.body.hash);
		await User.findOneAndUpdate({ email: decryptedString }, { emailVerified: true });
		let record = await User.findOne({ email: decryptedString });
		return res.send({ verified: record.emailVerified });
	} catch (error) {
		let message = error.message || `Something went wrong!`;
		return res.status(400).send({ message, error });
	}
});

router.route('/create-admin').get(async (req, res, next) => {
	let admin = { name: 'Admin', email: 'admin@admin.com', password: 'admin', role: 'admin' };
	let record = new User(admin);
	let ret = await record.save();
	res.send(ret);
});

export default router;
