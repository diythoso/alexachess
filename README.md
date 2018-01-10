## Inspiration
When we read the famous Harry Potter story, there is a part describing Wizard's chess where people can force pieces to move by voice commands. We were very impressed, and now with the development of home assistants like Amazon Echo, Google Home,.. We think that it's not going to be Wizard's chess anymore, we are going to build it step by step. And we've built the very first demo with Amazon Alexa called AlexaChess.

## What it does
The application will get the chess movement's command from Amazon Alexa Skills Service, Chessboard should act correspondingly.

## How we built it
We created a skill at Amazon Alexa Skills, the skill(intents, slots,..) allows service to recognize 'movement' command likes
```Move pawn from a2 to a4```
Responses to user are processed by a webhook linking with the skill. (For this demonstration, we use Heroku service to organize webhook's server and the application as well)
Server was implemented with Node.js and communicate to client through Websocket (socket.io).

## What we learned
We've learned so much from doing this project. Before this project, we almost know nothing how to build a skill, how to create chess application. We've encountered lots of challenges over this application. However, finally we did it in the simplest way. 

## What's next for Alexa Chess
- We're going to make it to be online multiplayer game where people are able to play in pair.
- We'll build an AI at server for player to play with
- Finally, we want to build a chessboard in hardware and controlled by amazon alexa the most.