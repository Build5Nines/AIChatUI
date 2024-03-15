const chai = require('chai'),
      expect = chai.expect,
      chaiHttp = require('chai-http')

chai.use(chaiHttp)

const app = require('../app.js')

describe('AIChatUI Web App', function() {
  it('should respond with a 200 status code', function(done) {
    chai.request(app)
      .get('/')
      .end(function(err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });
});