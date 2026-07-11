const prisma = require("../config/db");

function requireRole(allowedRoles) {
  return async (request, response, next) => {
    if (!request.user?.roleId) {
      return response.status(401).json({
        message: "Unauthorized",
      });
    }

    const role = await prisma.role.findUnique({
      where: {
        id: request.user.roleId,
      },
    });

    if (!role || !allowedRoles.includes(role.name)) {
      return response.status(403).json({
        message: "Forbidden",
      });
    }

    request.user.roleName = role.name;

    return next();
  };
}

module.exports = requireRole;
