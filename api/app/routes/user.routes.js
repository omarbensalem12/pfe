const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const axios = require('axios');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", controller.allAccess);

  app.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);

  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  app.post('/getRoute', async (req, res) => {
    try {
      const { coordinates } = req.body;
  
      if (!coordinates || coordinates.length !== 2) {
        return res.status(400).json({ error: 'Invalid coordinates' });
      }
  
      const [start, end] = coordinates;
      const osrmApiUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?steps=true`;
  
      const response = await axios.get(osrmApiUrl);
  
      const route = response.data.routes[0].geometry.coordinates;
  
      res.json({ route });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
