import Pod from 'models/pod';
import User from 'models/user';
import { getRow } from 'models/settings';
import ShortUniqueId from 'short-unique-id';

import config from 'config';
import { createNotification } from 'models/notification';
import { _ } from 'underscore';
import { podMemeberStatus } from 'base/constants';
import { toMongoObjectId } from 'db';

const uid = new ShortUniqueId({ length: 8 });

class PodController {
  index = async (req, res, next) => {
    try {
      let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
      let query = req.query.query ? JSON.parse(req.query.query) : {};
      query.$or = [
        { userId: req.user._id },
        { members: { $elemMatch: { userId: req.user._id, status: podMemeberStatus.ACCEPTED } } },
      ];
      let ret = await Pod.paginate(query, paginateOptions);
      return res.send(ret);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  marketplace = async (req, res, next) => {
    try {
      let paginateOptions = req.query.options ? JSON.parse(req.query.options) : {};
      let query = req.query.query ? JSON.parse(req.query.query) : {};
      query.$and = [
        { isPrivate: false },
        { userId: { $ne: req.user._id } },
        { 'members.userId': { $ne: req.user._id } },
      ];
      let ret = await Pod.paginate(query, paginateOptions);
      return res.send(ret);
    } catch (error) {
      x;
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  create = async (req, res, next) => {
    let _id = req.body._id;
    const userId = req.user._id;
    let data = _.pick(
      req.body,
      'isPrivate',
      'name',
      'description',
      'comments',
      'autoShare',
      'autoLike',
      'autoComment',
      'autoValidate',
    );

    try {
      const POD_COUNT = await getRow('trialPodCount');
      const activePods = await Pod.paginate({
        $or: [
          { userId },
          { members: { $elemMatch: { userId, status: podMemeberStatus.ACCEPTED } } },
        ],
      });
      if (activePods.total >= POD_COUNT && req.user.onTrial)
        return res
          .status(400)
          .send({ message: `No more than ${POD_COUNT} pods allowded for trial account` });
      if (!req.user.isActive && !req.user.onTrial)
        return res.status(400).send({ message: `You don't have any active plans!` });
      data.userId = userId;
      data.podKey = uid();
      data.members = [
        {
          userId,
          name: req.user.name,
          status: podMemeberStatus.ACCEPTED,
        },
      ];
      let record = new Pod(data);
      let ret = await record.save();
      _id = ret._id;
      return res.send({ _id });
    } catch (error) {
      let message = error?.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  update = async (req, res, next) => {
    let _id = req.body._id;
    const userId = req.user._id;
    let data = _.pick(
      req.body,
      'isPrivate',
      'name',
      'description',
      'comments',
      'autoShare',
      'autoLike',
      'autoComment',
      'autoValidate',
    );

    try {
      await Pod.findByIdAndUpdate(_id, data);
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
      return res.status(500).send({ message: "You don't have permission" });

    let existing = record.members.findIndex(x => x.userId.toString() == memberId.toString());
    if (existing < 0) return res.status(500).send({ message: "Member doesn't exists" });
    record.members[existing].status = status;

    try {
      const POD_COUNT = await getRow('trialPodCount');
      if (status === podMemeberStatus.ACCEPTED) {
        const member = await User.findOne({ _id: memberId });
        const activePods = await Pod.paginate({
          $or: [
            { userId: memberId },
            { members: { $elemMatch: { userId: memberId, status: podMemeberStatus.ACCEPTED } } },
          ],
        });
        if (activePods.total >= POD_COUNT && member.onTrial)
          return res.status(400).send({ message: `The member restricted to join any more pods!` });
        if (!member.isActive && !member.onTrial)
          return res.status(400).send({ message: `User doesn't have any active plans!` });
      }

      let notificationLabel = `${userName} ${status} for your pod request <strong>${record.name}</strong>`;
      await createNotification(record.userId, memberId, notificationLabel, { id: record._id });
      await record.save();
      return res.send({ record, message: 'Success' });
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  removeMemberAcccess = async (req, res, next) => {
    const { _id, podId, memberId } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    let record = await Pod.findOne({ _id: podId });
    if (!record) return res.status(500).send({ message: "Pod doesn't exists" });
    if (record.userId.toString() !== userId.toString())
      return res.status(500).send({ message: "You don' have permission" });

    let existing = record.members.findIndex(x => x.userId.toString() == memberId.toString());
    if (existing < 0) return res.status(500).send({ message: "Member doesn't exists" });
    record.members = record.members.filter(x => x.userId.toString() != memberId.toString());

    try {
      let notificationLabel = `${userName} removed from pod - <strong>${record.name}</strong>`;
      await createNotification(record.userId, memberId, notificationLabel, { id: record._id });
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
      return res.send({ message: 'deleted', ret });
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };

  getActiveMembers = async (req, res, next) => {
    const id = req.query.id;
    try {
      let record = await Pod.findOne({ _id: id }).populate('members.userId');
      record.members.map(({ userId: user }) => {
        console.log(`USER NAME : ${user.name} , linkedinCookiId : ${user.linkedinCookiId} `);
      });
      return res.send(record);
    } catch (error) {
      let message = error.message || `Something went wrong!`;
      return res.status(400).send({ message, error });
    }
  };
}

export default new PodController();
