var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var verifier = require('alexa-verifier')
var port = process.env.PORT || 3000;
var io = require('socket.io')(http);

http.listen(port, function () {
    console.log('Server listening at port %d', port);
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/default.html');
});

var currentTurn;

io.on('connection', function (socket) {

    // initialization
    io.emit('init');

    // on turn changed
    socket.on('changeTurn', function(turn) {
        currentTurn = turn;
    });

    // verification
    app.use(function (req, res, next) {
        if (!req.headers.signaturecertchainurl) {
            return next();
        }

        // mark the request body as already having been parsed so it's ignored by 
        // other body parser middlewares 
        req._body = true;
        req.rawBody = '';

        //once we get data, add it on to our body
        req.on('data', function (data) {
            return req.rawBody += data;
        });

        //once its all over
        req.on('end', function () {

            var cert_url, er, error, requestBody, signature;

            //parse the raw body
            try {
                req.body = JSON.parse(req.rawBody);
            } catch (error) {
                er = error;
                req.body = {};
            }

            //get the information needed to verify the request
            cert_url = req.headers.signaturecertchainurl;
            signature = req.headers.signature;
            requestBody = req.rawBody;

            //verify the request
            verifier(cert_url, signature, requestBody, function (er) {

                if (er) {
                    //if it fails, throw an error and return a failure
                    console.error('error validating the alexa cert:', er);
                    res.status(401).json({ status: 'failure', reason: er });
                } else {
                    //proceed
                    console.log("verified!")
                    next();
                }
            });
        });

    });

    // Handles the route for echo apis
    app.post('/api/echo', function (req, res) {
        var info = req.body.request;

        // Called when all data has been accumulated

        console.log(info.type);

        // parsing the requestBody for information
        if (info.type == "LaunchRequest") {
            // crafting a response
            responseBody = {
                "version": "0.1",
                "response": {
                    "outputSpeech": {
                        "type": "PlainText",
                        "text": "Welcome to Voice Chess! Let's get started"
                    },
                    "card": {
                        "type": "Simple",
                        "title": "Opened",
                        "content": "Launch application"
                    },
                    "reprompt": {
                        "outputSpeech": {
                            "type": "PlainText",
                            "text": "Say a command"
                        }
                    },
                    "shouldEndSession": false
                }
            };
        }
        else if (info.type == "IntentRequest") {
            var outputSpeechText = "";
            var cardContent = "";
          
            if (info.intent.name == "MoveIntent") {
                var target = info.intent.slots.target.value;
                var fromLetter = info.intent.slots.from_letter.value.toLowerCase();
                var fromNumber = info.intent.slots.from_number.value;
                var toLetter = info.intent.slots.to_letter.value.toLowerCase();
                var toNumber = info.intent.slots.to_number.value;
                
                io.emit('move', {
                    from : fromLetter.charAt(0) + fromNumber,
                    to: toLetter.charAt(0) + toNumber
                });

                outputSpeechText = target + "moved to " + toLetter + " " + toNumber;
                cardContent = "Successfully called " + info.intent.name + ", but it's not implemented!";
            } else {
                outputSpeechText = info.intent.name + " not implemented";
                cardContent = "Successfully called " + info.intent.name + ", but it's not implemented!";
            }
            responseBody = {
                "version": "0.1",
                "response": {
                    "outputSpeech": {
                        "type": "PlainText",
                        "text": outputSpeechText
                    },
                    "card": {
                        "type": "Simple",
                        "title": "Move",
                        "content": cardContent
                    },
                    "shouldEndSession": false
                }
            };
        } else {
            // Not a recognized type
            responseBody = {
                "version": "0.1",
                "response": {
                    "outputSpeech": {
                        "type": "PlainText",
                        "text": "Could not parse data"
                    },
                    "card": {
                        "type": "Simple",
                        "title": "Error Parsing",
                        "content": JSON.stringify(requestBody)
                    },
                    "reprompt": {
                        "outputSpeech": {
                            "type": "PlainText",
                            "text": "Say a command"
                        }
                    },
                    "shouldEndSession": false
                }
            };
        }

        res.statusCode = 200;
        res.contentType('application/json');
        res.send(responseBody);
    });
});

