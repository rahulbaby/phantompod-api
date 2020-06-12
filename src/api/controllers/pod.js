import Pod from 'models/pod';
import { _ } from 'underscore';
import { podMemeberStatus } from 'base/constants';

class PodController {
  index = async (req, res, next) => {
    try {
      let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
      let query = req.query.query ? JSON.parse(req.query.query) : {};
      query.$or = [{ 'members.userId': req.user._id }, { userId: req.user._id }];
      let ret = await Pod.paginate(query, paginateOptions);
      return res.send(ret);
    } catch (error) {
      let msg = error.message || `Something went wrong!`;
      return res.status(400).send({ msg, error });
    }
  };

  create = async (req, res, next) => {
    let _id = req.body._id;
    let data = _.pick(
      req.body,
      'isPrivate',
      'name',
      'description',
      'comments',
      'autoShare',
      'autoLike',
      'autoComment',
      'autoVlidate',
    );

    try {
      if (!_id) {
        data.userId = req.user._id;
        data.podKey = _.random(111111, 999999);
        let record = new Pod(data);
        let ret = await record.save();
        _id = ret._id;
      } else {
        await Pod.findByIdAndUpdate(_id, data);
      }
      return res.send({ _id });
    } catch (error) {
      let msg = error.message || `Something went wrong!`;
      return res.status(400).send({ msg, error });
    }
  };

  allterMembers = async (req, res, next) => {
    const podKey = req.query.id;
    const remove = req.query.remove;
    const userId = req.user._id;
    const userName = req.user.name;

    let record = await Pod.findOne({ podKey });
    if (!record) return res.status(500).send({ msg: "Pod doesn't exists" });
    if (record.userId === userId) return res.status(500).send({ msg: 'You own this pod.' });
    let existing = record.members.find(x => x.userId.toString() == userId.toString());

    if (remove && existing) {
      record.members.id(existing._id).remove();
    } else if (!existing && !remove) {
      //should be new entry to join
      record.members.push({ userId, name: userName, status: podMemeberStatus.REQUESTED });
    }
    try {
      await record.save();
      return res.send(record.members);
    } catch (error) {
      let msg = error.message || `Something went wrong!`;
      return res.status(400).send({ msg, error });
    }
  };
}

export default new PodController();
