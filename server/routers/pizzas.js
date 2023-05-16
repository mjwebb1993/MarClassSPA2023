const { Router } = require("express");
const Pizza = require("../models/Pizza");
const router = Router();

// Create record in MongoDB Atlas using Mongoose.js ORM
router.post("/", (request, response) => {
  const newPizza = new Pizza(request.body);
  newPizza.save((error, record) => {
    // if (error && error.name && error.name === "ValidationError")
    if (error?.name === "ValidationError")
      return response.status(400).json(error.errors);
    if (error) return response.status(500).json(error.errors);

    response.json(record);
  });
});

// Get (read) all records from the collection
router.get("/", (request, response) => {
  Pizza.find({}, (error, record) => {
    if (error) return response.status(500).json(error.errors);

    response.json(record);
  });
});

// Get a single record by ID using a query parameter
router.get("/:id", (request, response) => {
  Pizza.findById(request.params.id, (error, record) => {
    if (error) return response.status(500).json(error.errors);

    response.json(record);
  });
});

router.delete("/:id", (request, response) => {
  Pizza.findByIdAndRemove(request.params.id, {}, (error, record) => {
    if (error) return response.status(500).json(error.errors);

    response.json(record);
  });
});

router.put("/:id", (request, response) => {
  const body = request.body;
  Pizza.findByIdAndUpdate(
    request.params.id,
    {
      $set: {
        // Take note that the customer is not included, so it can't update the customer
        crust: body.crust,
        cheese: body.cheese,
        sauce: body.sauce,
        toppings: body.toppings
      }
    },
    {
      new: true,
      upsert: true
    },
    (error, record) => {
      if (error?.name === "ValidationError")
        return response.status(400).json(error.errors);
      if (error) return response.status(500).json(error.errors);

      response.json(record);
    }
  );
});

module.exports = router;
