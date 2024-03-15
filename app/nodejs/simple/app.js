const express = require('express');
//const cors = require('cors')
const swagger = require('./swagger') 

// load environment variables from .env file
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('static'))
//app.use(cors()); // enable all CORS requests


/**
* @openapi
* tags:
* - name: v1
*   description: Call Azure OpenAI service to make Chat Completions.
* - name: v2
*   description: Call Azure OpenAI service to make Chat Completions, also integrating Azure Search for additional data.
*/
require('./api/v1.js')(app)
require('./api/v2.js')(app)


// Add support for Swagger UI
swagger(app)
  
const port = process.env.PORT || 8080;  
module.exports = app.listen(port, () => {
    console.log(`Server running on port ${port}`);  
});
