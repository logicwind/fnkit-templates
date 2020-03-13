const nats = require('nats');
const { skip } = require('graphql-resolvers')

const createNats = async () => {
  let nc = await nats.connect({
    servers: [process.env.NATS_URL],
    json: true
  });
  return nc
}

const EVENT = {
  RECEIVED: 'RECEIVED',
  EXECUTING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
}

const TYPE = {
  REQUEST: 'REQUEST',
  ACTION: 'ACTION'
}

const createActionLogger = (nc) => async (event, requestId, args, errors, response) => {
  return nc.publish(process.env.NATS_TOPIC, {
    type: TYPE.ACTION, event, requestId, args, errors, response
  })
}

const createLogActions = async () => {
  const natsClient = await createNats();
  const actionLogger = createActionLogger(natsClient)

  const actionRequestLogger = (parent, args, context) => {
    //console.log("%%% LOG ACTION ", args)
    //TODO: Add more info to log
    //TODO: introduce ActionId?
    actionLogger(EVENT.RECEIVED, context.requestId, args)
    return skip;
  }

  const actionResponseLogger = (parent, args, context) => {
    //console.log("%%% LOG ACTION ", args)
    //TODO: Add more info to log
    //TODO: add time taken
    actionLogger(EVENT.COMPLETED, context.requestId, args, null, parent)
    return parent;
  }

  return { actionRequestLogger, actionResponseLogger }
}

module.exports = {
  createLogActions
}
