import sesTransport from 'nodemailer-ses-transport';
import nodemailer from 'nodemailer';
import Cryptr from 'cryptr';
const cryptr = new Cryptr('pass123');

const mailOptions = {
	from: `hello@phantompod.co`,
	to: 'developer@phantompod.co',
	subject: `${name}`,
	text: `http://localhost:3000/verify-email?hash=${encryptedString}`,
	replyTo: `hello@phantompod.co`,
};
const sendEmail = () => {
	return async extrConfig => {
		sesTransporter.sendMail({ ...mailOptions, ...extrConfig }, (err, resp) => {
			if (err) {
				console.error('there was an error: ', err);
			} else {
				console.log('here is the res: ', resp);

				return newRes.send('Saved');
			}
		});
	};
};

export default sendEmail;
