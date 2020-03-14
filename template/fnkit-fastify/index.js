const express = require('express')
const handler = require('./function/handler')
const cors = require('cors')
const fastify = require('fastify')({
  pluginTimeout: 100000
})

const app = express()
const corsOptions = {
  credentials: true,
  origin: true
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

fastify.register(handler());
fastify.listen(4000, () => {
  console.log(`🚀 Server ready at http://localhost:${4000}/graphql`)
})
