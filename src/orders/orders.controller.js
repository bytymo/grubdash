const path = require('path')
const orders = require(path.resolve('src/data/orders-data'))
const nextId = require('../utils/nextId')

// MiddleWare
function orderExists(request, response, next) {
  const orderId = request.params.orderId
  const foundOrder = orders.find((order) => order.id === orderId)

  if (foundOrder) {
    response.locals.orderId = orderId
    response.locals.order = foundOrder
    return next()
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  })
}

function isValid(request, _, next) {
  const {
    data: { deliverTo, mobileNumber, dishes },
  } = request.body

  if (!deliverTo) {
    return next({
      status: 400,
      message: 'Order must include a deliverTo',
    })
  } else if (!mobileNumber) {
    return next({
      status: 400,
      message: 'Order must include a mobileNumber',
    })
  } else if (!dishes) {
    return next({
      status: 400,
      message: 'Order must include a dish',
    })
  } else if (!dishes.length || !Array.isArray(dishes)) {
    return next({
      status: 400,
      message: 'Order must include at least one dish',
    })
  }
  for (index in dishes) {
    const dish = dishes[index]
    const { quantity } = dish

    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      })
    }
  }
  next()
}

//
//
// Create
function create(request, response) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = request.body

  const newOrder = {
    id: { nextId },
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes,
  }

  orders.push(newOrder)
  response.status(201).json({ data: newOrder })
}
// Read
function read(_, response) {
  response.json({ data: response.locals.order })
}

// Update
function update(request, response, next) {
  const orderId = response.locals.orderId
  const {
    data: { id, deliverTo, mobileNumber, dishes, status } = {},
  } = request.body

  if (id && orderId !== id) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${orderId}`,
    })
  } else if (!status || status === 'invalid') {
    next({
      status: 400,
      message:
        'Order must have a status of pending, preparing, out-for-delivery, delivered',
    })
  } else if (status === 'delivered') {
    next({
      status: 400,
      message: 'A delivered order cannot be changed',
    })
  }

  const newOrder = {
    id: orderId,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes,
    status: status,
  }

  response.json({ data: newOrder })
}

// Delete
function destroy(request, response, next) {
  const order = response.locals.order
  const { orderId } = request.params
  const index = orders.findIndex((order) => order.id === Number(orderId))
  if (order.status !== 'pending') {
    console.log('index', index)
    next({
      status: 400,
      message: 'An order cannot be deleted unless it is pending',
    })
  }

  if (index > -1) {
    notes.splice(index, 1)
  }
  response.sendStatus(204)
}
// List
function list(_, response) {
  response.json({ data: orders })
}

// Exports
module.exports = {
  create: [isValid, create],
  read: [orderExists, read],
  update: [orderExists, isValid, update],
  delete: [orderExists, destroy],
  list,
}
