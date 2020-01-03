"use strict"

// const bodyParser = require('body-parser')

// // app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(bodyParser.raw());
// app.use(bodyParser.text({ type : "text/*" }));
// app.disable('x-powered-by');

const { ApolloServer } = require('apollo-server-fastify');
const { buildFederatedSchema } = require('@apollo/federation');
const createContext = require('./support/context')
const decorateResolvers = require('./support/resolver-decorator')
const handler = require('./function/handler');
const {typeDefs, resolvers, META} = handler

const init = async () => {
  // Resolvers define the technique for fetching the types defined in the
  // schema. This resolver retrieves books from the "books" array above.
  const decoratedResolvers = await decorateResolvers(resolvers);
  const server = new ApolloServer({
    schema: buildFederatedSchema([{ typeDefs, resolvers:decoratedResolvers }]),
    context: createContext(META),
    plugins: []
  });

  const INFO = "this is fnkit function. use /graphql to perform actions";
  const fastify = require('fastify')()
  fastify.get('/meta', async (request, reply) => META)
  fastify.get('/', async (request, reply) => 'fnkit function')
  fastify.post('/', async (request, reply) => INFO)

  const port = process.env.http_port || 3000;
  const url = await fastify.listen(port)
  console.log(`fnkit function running on port ${port}`)
}

init();
