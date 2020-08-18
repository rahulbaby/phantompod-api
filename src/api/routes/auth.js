import { Router } from 'express';
import passport from 'passport';
import { app } from 'config';
import Auth from 'controllers/auth';

const router = Router();

router.route('/login').post(Auth.login);
router.route('/details').post(Auth.userDetails);

router.route('/google').get(
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  }),
);

/*
router.get(
  '/google/signin',
  (req, res) => {
    console.log(req.user);
    res.send({ req: JSON.stringify(req), kex: 'kex' });
    //res.redirect(`${app.webUrl}/`);
  },
);
*/

<<<<<<< HEAD
router
  .route('/google/signin')
  .get(passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    try {
      console.log('user', req.user);
      return res.send({ user: req.user, user2: 'hell' });
    } catch (error) {
      console.log('error', error);
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  });
=======
// router.route('/google/signin').get(
//   passport.authenticate('google', { 
//     successRedirect: '/',
//     failureRedirect: '/login'
// }),
// );

// router.get('/google/signin',passport.authenticate('google', (req,res)=>{
//   console.log('req sucess =======>',req);
// })),

router.get("/google/signin",passport.authenticate("google"),(req,res)=>{
  console.log('req  ====> ',req);
  res.send(req.user);
  res.send("you reached the redirect URI");
});




// app.get( '/google/signin', 
//     passport.authenticate( 'google', { 
//         successRedirect: '/auth/google/success',
//         failureRedirect: '/auth/google/failure'
// }));


// router
//   .route('/google/signin')
//   .get(passport.authenticate('google', {failureRedirect:'/login'}),(req, res) => {
//     try {
//       console.log('user', req);
//       return res.send({ user: req.user, user2: 'hell' });
//     } catch (error) {
//       console.log('error', error);
//       let message = error.message || `Something went wrong!`;
//       return res.status(400).send({ message, error });
//     }
//   });
  
>>>>>>> 002f70259fab4aed78e848a0f0978313f9dceddc

export default router;
