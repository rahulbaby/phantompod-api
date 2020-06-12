export const allowOnly = (accessLevel, callback) => {
  checkUserRole = (req, res) => {
    if (!(accessLevel & req.user.role)) {
      res.sendStatus(403);
      return;
    }

    callback(req, res);
  };

  return checkUserRole;
};
