import config from 'config';
import { userAccountStatus } from 'base/constants';

export { userAccountStatus };
export const comments = [
	'Great post {{firstName}}!',
	'Thanks for sharing {{firstName}}!',
	'Love it {{firstName}}!',
	'What a great post',
	'Always great reading your posts!',
];

export const podMemeberStatus = {
	REQUESTED: 'requested',
	ACCEPTED: 'accepted',
	BANNED: 'banned',
};
const PUBLIC_KEY = config.get('stripe.PUBLIC_KEY');
const PRODUCT_PRICE_ID = config.get('stripe.PRODUCT_PRICE_ID');
const apiVersion = config.get('stripe.apiVersion');
const PRODUCT_NAME = config.get('stripe.PRODUCT_NAME');

export const paymentCredentials = {
	PUBLIC_KEY,
	PRODUCT_PRICE_ID,
	apiVersion,
	PRODUCT_NAME,
};
