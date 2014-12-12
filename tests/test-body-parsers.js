var assert = require('assert');
var after = require('after');
var exec = require('child_process').exec;
var root = require('../index');
var app = root();

var ran = 0;
var next = after(3, process.exit.bind(null, 0));

app.post('/body', function(req, res) {
	req.on('body', function(body) {
		ran++;
		assert.equal(body, 'body');
		res.end();
	});
});
app.post('/json', function(req, res, next) {
	req.on('json', function(body) {
		ran++;
		assert.equal(body.foo, 'bar');
		res.end();
	});
});
app.post('/jsonbool', function(req, res, next) {
	req.on('json', function(body) {
		ran++;
		assert.equal(body, false);
		res.end();
	});
});
app.post('/form', function(req, res, next) {
	req.on('form', function(body) {
		ran++;
		assert.equal(body.bar, 'baz');
		res.end();
	});
});

app.listen(9999, function() {
	exec('curl -d body localhost:9999/body; curl -d \'{"foo":"bar"}\' localhost:9999/json; curl -d \'false\' localhost:9999/jsonbool; curl -d "bar=baz" localhost:9999/form', function() {
		assert.equal(ran, 4);
		next();
	});
});

var ran2 = 0;
var app2 = root({payloadLimit: 10})
app2.post('/limit', function(req, res) {
	req.on('body', function() {
		ran2++;
		res.end('hej');
	});
});

app2.listen(9998, function() {
	exec('curl -d qwertyuiopasdfghjklzsdsddsdsdsdsdsdsdssdds localhost:9998/limit', function(err, stdout, stderr) {
		assert(stderr.indexOf('Empty reply from server') !== -1);
		next();
	});

	exec('curl -d qwerty localhost:9998/limit', function(err, stdout) {
		assert.equal(stdout, 'hej');
		next();
	});
});
