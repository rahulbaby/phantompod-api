import Notification from 'models/notification';
import { toMongoObjectId } from 'db';

class NotificationController {
  index = async (req, res, next) => {
    try {
      let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
      let query = { receiver: req.user._id };
      let ret = await Notification.paginate(query, paginateOptions);
      return res.send(ret);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  read = async (req, res, next) => {
    const _id = req.params._id;
    try {
      let ret = await Notification.findOneAndUpdate({ _id: toMongoObjectId(_id) }, { seen: true });
      return res.send(ret);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };
}

export default new NotificationController();
