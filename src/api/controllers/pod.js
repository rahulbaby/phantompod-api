import Pod from 'models/pod';
import { createNotification } from 'models/notification';
import { _ } from 'underscore';
import { podMemeberStatus } from 'base/constants';
import { toMongoObjectId } from 'db';

class PodController {
  index = async (req, res, next) => {
    try {
      let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
      let query = req.query.query ? JSON.parse(req.query.query) : {};
      query.$or = [{ 'members.userId': req.user._id }, { userId: req.user._id }];
      let ret = await Pod.paginate(query, paginateOptions);
      return res.send(ret);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
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
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  allterMembers = async (req, res, next) => {
    const podKey = req.body.id;
    const remove = req.body.remove;
    const userId = req.user._id;
    const userName = req.user.name;

    let record = await Pod.findOne({ podKey });
    if (!record) return res.status(500).send({ message: "Pod doesn't exists" });
    if (record.userId === userId) return res.status(500).send({ message: 'You own this pod.' });
    let existing = record.members.find(x => x.userId.toString() == userId.toString());

    if (remove && existing) {
      record.members.id(existing._id).remove();
    } else if (!existing && !remove) {
      let notificationLabel = `${userName} requested to join your pod <strong>${record.name}</strong>`;
      await createNotification(userId, record.userId, notificationLabel, { id: record._id });
      record.members.push({ userId, name: userName, status: podMemeberStatus.REQUESTED });
    } else if (existing && !remove) {
      return res.status(400).send({ message: 'You already requested for this pod.' });
    }
    try {
      await record.save();
      return res.send({ record, message: 'Success' });
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  allterMemberAcccess = async (req, res, next) => {
    const { _id, podId, memberId, status } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    let record = await Pod.findOne({ _id: podId });
    if (!record) return res.status(500).send({ message: "Pod doesn't exists" });
    if (record.userId.toString() !== userId.toString())
      return res.status(500).send({ message: "You don' have permission" });

    let existing = record.members.findIndex(x => x.userId.toString() == memberId.toString());
    if (existing < 0) return res.status(500).send({ message: "Member doesn't exists" });
    record.members[existing].status = status;

    try {
      let notificationLabel = `${userName} ${status} for your pod request <strong>${record.name}</strong>`;
      await createNotification(memberId, record.userId, notificationLabel, { id: record._id });
      await record.save();
      return res.send({ record, message: 'Success' });
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  destroy = async (req, res, next) => {
    const _id = req.body.id;
    const userId = req.user._id;

    try {
      let ret = await Pod.findOneAndDelete({ _id: toMongoObjectId(_id), userId });
      return res.send(ret);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };
}

export default new PodController();
