const requireSubscription = (trialAllowed = true) => {
	return (req, res, next) => {
		if (req.user.isActive || (trialAllowed && req.user.onTrial)) {
			next();
		} else {
			return res.status(400).send({ message: "You don't have any active subscription" });
		}
	};
};

export default requireSubscription;
