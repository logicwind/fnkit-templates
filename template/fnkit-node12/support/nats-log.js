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

const createActionLogger = (nc) => async (event, requestId, appFnConfigId, query, args, errors, response) => {
  return nc.publish(process.env.NATS_TOPIC, {
    type: TYPE.ACTION, event, requestId, appFnConfig: appFnConfigId ? { connect: { id: appFnConfigId } } : {}, query, args, errors, response: typeof response == 'object' ? response : { response: response }
  })
}

const createLogActions = async () => {
  const natsClient = await createNats();
  const actionLogger = createActionLogger(natsClient)

  const actionRequestLogger = (parent, args, context) => {
    // console.log('context', JSON.stringify(context))
    //console.log("%%% LOG ACTION ", args)
    //TODO: Add more info to log
    //TODO: introduce ActionId?
    actionLogger(EVENT.RECEIVED, context.requestId, context.conf ? context.conf.id : undefined, context.query, args)
    return skip;
  }

  const actionResponseLogger = (parent, args, context) => {
    //console.log("%%% LOG ACTION ", args)
    //TODO: Add more info to log
    //TODO: add time taken
    actionLogger(EVENT.COMPLETED, context.requestId, context.conf ? context.conf.id : undefined, context.query, args, null, parent)
    return parent;
  }

  return { actionRequestLogger, actionResponseLogger }
}

module.exports = {
  createLogActions
}
