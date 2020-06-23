import Pod from 'models/pod';
import Post from 'models/post';
import { createNotification } from 'models/notification';
import { _ } from 'underscore';
import { toMongoObjectId } from 'db';
import { podMemeberStatus } from 'base/constants';

class PostController {
  index = async (req, res, next) => {
    try {
      let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
      paginateOptions.populate = { path: 'userId', select: ['_id', 'name'] };
      let query = req.query.query ? JSON.parse(req.query.query) : {};
      query.$or = [{ 'members.userId': req.user._id }, { userId: req.user._id }];
      let ret = await Post.paginate(query, paginateOptions);
      return res.send(ret);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  create = async (req, res, next) => {
    let _id = req.body._id;
    let podId = req.body.podId;
    let data = _.pick(
      req.body,
      'podId',
      'url',
      'name',
      'comments',
      'autoShare',
      'autoLike',
      'autoComment',
      'autoValidate',
    );

    try {
      const pod = await Pod.getPodRow(podId);
      if (!pod) return res.status(500).send({ message: "Pod doesn't exists!" });
      data.approved = pod.autoValidate;
      data.userId = req.user._id;
      let record = new Post(data);
      let ret = await record.save();

      return res.send({ ret });
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  destroy = async (req, res, next) => {
    const _id = req.body.id;
    const userId = req.user._id;

    try {
      let ret = await Post.findOneAndDelete({ _id: toMongoObjectId(_id), userId });
      return res.send({ message: 'Deleted', ret });
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };
}

export default new PostController();
