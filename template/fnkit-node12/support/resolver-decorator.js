const { skip, combineResolvers, pipeResolvers } = require('graphql-resolvers')
const {createLogActions} = require('./nats-log')

const decorateResolvers = async (resolvers) => {
  const {actionResponseLogger, actionRequestLogger} = await createLogActions()

  const { Query = {}, Mutation = {} } = resolvers
  Object.keys(Query).forEach(key => {
    Query[key] = pipeResolvers(
      combineResolvers(actionRequestLogger, Query[key]),
      actionResponseLogger)
  });
  Object.keys(Mutation).forEach(key => {
    Mutation[key] = pipeResolvers(
      combineResolvers(actionRequestLogger, Mutation[key]),
      actionResponseLogger)
  });
  return resolvers
}

module.exports = decorateResolvers
