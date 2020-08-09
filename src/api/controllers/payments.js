import Payments from 'models/payments';
import { toMongoObjectId } from 'db';

//dummy coment
class PaymentsController {
  index = async (req, res, next) => {
    try {
      const userId = req.user.id;
      let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
      paginateOptions.sort = { createdAt: -1 };
      paginateOptions.populate = { path: 'user', select: ['_id', 'name', 'email'] };
      let query = req.query.query ? JSON.parse(req.query.query) : {};
      let ret = await Payments.paginate(query, paginateOptions);
      return res.send(ret);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };
}

export default new PaymentsController();
