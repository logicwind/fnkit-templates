const nats = require('nats');
const { skip } = require('graphql-resolvers')

const createNats = async () => {
  let nc = await nats.connect({
    servers: ['nats://demo.nats.io:4222'], //, 'tls://demo.nats.io:4443'],
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

const createRequestLogger = (nc) => async (event, requestId, query, errors, response) => {
  return nc.publish('nix-demo', {
    type: TYPE.REQUEST, event, requestId, query, errors, response
  })
}

const createActionLogger = (nc) => async (event, requestId, args, errors, response) => {
  return nc.publish('nix-demo', {
    type: TYPE.ACTION, event, requestId, args, errors, response
  })
}

const logRequestPlugin = async (options) => {
  const natsClient = await createNats();
//TODO: Pass variables with variable hiding in function meta
  const requestLogger = createRequestLogger(natsClient)
  //setTimeout(()=>natsClient.publish('nix-demo', {test:'dd'}), 2000)

  return {
    serverWillStart() {
      console.log('Server will Start! ');
    },
    requestDidStart({request, context}) {
      requestLogger(EVENT.RECEIVED, context.requestId, request.query)
      console.log('Request started!');

      return {
        parsingDidStart(requestContext) {
          console.log('Parsing started!');
        },
        validationDidStart(requestContext) {
          console.log('Validation started!');
        },
        didResolveOperation(requestContext) {
          console.log('Resolved Operation!')
        },
        executionDidStart({request, context}) {
          requestLogger(EVENT.EXECUTING, context.requestId, request.query)
          console.log('Execution Did Start!')
        },
        didEncounterErrors(requestContext) {
          console.log('Did Encounter Errors!')
        },
        willSendResponse(requestContext) {
          const {request, context, errors, response} = requestContext
          requestLogger(EVENT.COMPLETED, context.requestId, request.query, errors, response.data)
          //console.log('Will Send Response!')
        },

      }
    },
  };
};

//TODO: Log each resolver call


const createLogActions = async () => {
  const natsClient = await createNats();
  const actionLogger = createActionLogger(natsClient)

  const actionRequestLogger= (parent, args, context) => {
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

  return {actionRequestLogger, actionResponseLogger}
}

module.exports = {
  logRequestPlugin,
  createLogActions
}
