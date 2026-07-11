const jwt = require("jsonwebtoken");

function verifyToken(request, response, next) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return response.status(401).json({
      message: "Unauthorized",
    });
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    request.user = {
      userId: payload.userId,
      roleId: payload.roleId,
    };

    return next();
  } catch (_error) {
    return response.status(401).json({
      message: "Unauthorized",
    });
  }
}

module.exports = verifyToken;
