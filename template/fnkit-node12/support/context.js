var Ajv = require('ajv');
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

module.exports = (meta) => {
  var validate = ajv.compile(meta.configSchema);
  return (context) => {
    //console.log({ context })
    const { req, body: { query } } = context
    try {
      //console.log('HEADERS', req.headers, query)
      //FIXME: Security RISK: Confirm whether GetServiceDefinition can be passed with mutation or other queries?
      //Bypass conf checking if service definition request
      if (query && query.includes('GetServiceDefinition')) {
        return {}
      }
      const confString = req.headers['conf'] ? req.headers['conf'] : '{}'
      const conf = JSON.parse(confString);
      const valid = validate(conf);
      //console.log({ conf, valid, confString, 'headers': req.headers })
      if (!valid) {
        console.log(validate.errors);
        throw new Error(validate.errors)
      }
      return {
        user: req.headers['user-id'],
        conf: conf
      }
    } catch (e) {
      console.error(e)
      throw new Error(e)
    }
  }
}
