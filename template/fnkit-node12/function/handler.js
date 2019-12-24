"use strict"
const GraphQLJSON = require('graphql-type-json');
const { gql } = require('apollo-server-fastify');

const META = {
    name: 'math',
    description: 'Math Utility Functions',
    version: 1,
    configSchema: {
        "required": ["token", "rounding"],
        "properties": {
            "token": { "type": "string" },
            "rounding": {
                "type": "number"
                //   "minimum": 2
            }
        }
    }
}

const typeDefs = gql`
  scalar JSON

  type Query {
    hello: String,
  }
  type Mutation {
    # This mutation takes id and email parameters and responds with a User
    add(num1: Float!, num2: Float!): Float!
    subtract(num1: Float!, num2: Float!): Float!
  }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        hello: () => "world",
    },
    Mutation: {
        add: (parent, args, ctx) => {
            const {rounding} = ctx.conf
            if(args.num1 < 50) {
                throw new Error('too small num1 ' + args.num1)
            }
            return (args.num1 + args.num2).toFixed(rounding)
        },
        subtract: (parent, args, ctx) => {
            return args.num1 - args.num2
        },
    },
    JSON: GraphQLJSON
};

module.exports = {
    META,
    typeDefs,
    resolvers
}
