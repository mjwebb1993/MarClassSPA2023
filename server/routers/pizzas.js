const { Router } = require("express");
const Pizza = require("../models/Pizza");
const router = Router();

//  Route definitions go here
// Create record in MongoDB Atlas using Mongoose.js ORM
router.post("/", (request, response) => {
  const newPizza = new Pizza(request.body);
  newPizza.save((error, record) => {
    if (error && "name" in error && error.name === "ValidationError")
      return response.status(400).json(error.errors);
    if (error) return response.status(500).json(error.errors);

    response.json(record);
  });
});

module.exports = router;
