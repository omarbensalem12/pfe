const controller = require("../controllers/parking.controller");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'app/uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/parking/createParking", [upload.array('images', 5)] , controller.createParking);
    app.post("/api/parking/createParkingSpot", controller.createParkingSpot);
    app.post("/api/parking/createReservation", controller.createReservation);
    app.get("/api/parking/getAvailableParkingSpots", controller.getAvailableParkingSpots)
    app.get("/api/parking/getParkingLotsNearby", controller.getParkingLotsNearby)
    app.get("/api/parking/parkingSearch", controller.parkingSearch)
    app.get("/api/parking/getReservationByUser", controller.getReservationByUser)
    app.put("/api/parking/cancelReservation", controller.cancelReservation)
    app.put("/api/parking/updateParking", [upload.array('images', 5)] , controller.updateParking);
    app.put("/api/parking/updateParkinSpot", controller.updateParkinSpot);
    app.delete("/api/parking/deleteParking", controller.deleteParking)
    app.delete("/api/parking/deleteParkingSpot", controller.deleteParkingSpot)


}