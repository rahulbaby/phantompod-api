import superagent from 'superagent';

const username = 'arisetothink';
const password = 'ScienceHub';
const sendername = 'AARISE';
const routetype = 1;

export default async (mobile, message) => {
  console.log(mobile, message);
  superagent
    .post('http://sapteleservices.com/SMS_API/sendsms.php')
    .query({ username, password, mobile, message, sendername, routetype })
    .set('accept', 'json')
    .end((err, result) => {
      return result.status === 200;
    });
};
