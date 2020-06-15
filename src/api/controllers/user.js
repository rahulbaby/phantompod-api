import User from 'models/user';

class UserController {
  create = async (req, res, next) => {
    let { name, email, password } = req.body;
    let record = new User({ name, email, password });
    try {
      let ret = await record.save();
      return res.send(ret);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };
}

export default new UserController();
