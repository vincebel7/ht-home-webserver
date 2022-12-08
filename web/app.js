require("dotenv").config();

// Redis
const redis = require('redis');
const redis_client = redis.createClient({ socket: { port: 6379 } });
const redis_subscriber = redis_client.duplicate();
redis_subscriber.connect();

redis_subscriber.on('ready', () => console.log("Connected to Redis"));
redis_subscriber.on('error', err => console.error("Error connecting to Redis", err));

redis_subscriber.on('connect', () => {
	//redis_client.publish('DHT-data-dummy', "testpub from node"); // Works!
});

// MySQL (TODO)

// Web server
var http = require('http');
var express = require('express');
var app = express();

var server = http.createServer(app);
const io = require('socket.io')(server);

console.log("Listening on 8080");

app.get('/', function (req, res) {
	console.log("New client");
	res.sendFile(__dirname + "/index.html");
});

// Serve CSS, etc
app.use(express.static('public')); 

// On connection
io.on('connection', function (socket) {
	console.log("Client connection established");

	(async () => {
		await redis_subscriber.subscribe('DHT-data', (message) => {
			console.log(message);
			socket.emit("data-from-server", message);
		});
	})();
});

server.listen(8080);
