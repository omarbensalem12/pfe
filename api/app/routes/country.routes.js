const controller = require("../controllers/country.controller");


module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.post("/api/country/create", controller.create);
    app.put("/api/country/update", controller.update);
    app.get("/api/country/getAll", controller.getAll);

    app.get("/api/country/countries", controller.getCounties);
    app.get("/api/country/countries/:countryId/states", controller.getStates);
    app.get("/api/country/countries/:countryId/states/:stateId/cities", controller.getCities);
    app.delete("/api/country/delete", controller.delete);



  };