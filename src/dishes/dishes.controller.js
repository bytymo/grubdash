const path = require('path')

// Use the existing dishes data
const dishes = require(path.resolve('src/data/dishes-data'))

// Use this function to assign ID's when necessary
const nextId = require('../utils/nextId')

// TODO: Implement the /dishes handlers needed to make the tests pass

// Middleware
function dishExists(request, response, next) {
  const dishId = request.params.dishId
  const foundDish = dishes.find((dish) => dish.id === dishId)

  if (foundDish) {
    response.locals.dishId = dishId
    response.locals.dish = foundDish
    return next()
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  })
}

function isValid(request, _, next) {
  const { data: { name, description, price, image_url } = {} } = request.body

  if (!name) {
    return next({
      status: 400,
      message: 'Dish must include a name',
    })
  } else if (!description) {
    return next({
      status: 400,
      message: 'Dish must include a description',
    })
  } else if (!price) {
    return next({
      status: 400,
      message: 'Dish must include a price',
    })
  } else if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: 'Dish must have a price that is an integer greater than 0',
    })
  } else if (!image_url) {
    return next({
      status: 400,
      message: 'Dish must include a image_url',
    })
  }
  next()
}

// Create
function create(request, response) {
  const { data: { name, description, price, image_url } = {} } = request.body

  const newDish = {
    id: { nextId },
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  }

  dishes.push(newDish)
  response.status(201).json({ data: newDish })
}

// Read
function read(_, response) {
  response.json({ data: response.locals.dish })
}

// Update
function update(request, response, next) {
  const dishId = response.locals.dishId
  const {
    data: { id, name, description, price, image_url } = {},
  } = request.body

  if (id && dishId !== id) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    })
  }
  const newDish = {
    id: dishId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  }

  response.json({ data: newDish })
}

// List
function list(_, response) {
  response.json({ data: dishes })
}

// Exports
module.exports = {
  create: [isValid, create],
  read: [dishExists, read],
  update: [dishExists, isValid, update],
  list,
}
