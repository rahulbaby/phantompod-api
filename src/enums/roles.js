export const userRoles = {
	ADMIN: 1,
	USER: 2,
};

export const accessLevels = {
	USER: userRoles.STUDENT || userRoles.ADMIN,
	ADMIN: userRoles.ADMIN,
};
