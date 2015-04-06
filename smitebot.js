/**
 * Created by Messyfresh on 3/29/2015.
 */

var irc = require('irc'),
    request = require('request'),
    ircChannel = '#remedeez',
    twitchUser = process.env.twitchUser,
    twitchPass = process.env.twitchPass;

var client = new irc.Client('irc.twitch.tv', twitchUser, {
    debug: true,
    userName: twitchUser,
    password: twitchPass,
    channels: [ircChannel]
});

var errorMsg = 'Sorry, an error has occurred, EVERYONE JUST STAY CALM!!!';

client.addListener('message', function(from, to, message) {
    var msgArray = message.split(" ");
    if (message.toLowerCase() == "hi elo bot") {
        client.say(ircChannel, "Hello Human Bot " + from);
        client.say(ircChannel, "2Hello Human Bot " + from);
    }
    if (msgArray[0] == '!elo') {
        request({
                url: 'http://localhost:5000/api/getplayer/' + msgArray[1]
            }, function (error, response, body) {
                var jsonBody = JSON.parse(body);
                if (error) {
                    client.say(ircChannel, errorMsg);
                }
                if (jsonBody.length == 0) {
                    client.say(ircChannel, 'No Results found for ' + msgArray[1]);
                } else {
                    var elo = jsonBody[0].Rank_Stat;
                    var eloRounded = Math.round(elo);
                    client.say(ircChannel, "Conquest League ELO for " + msgArray[1] + " is " + eloRounded);
                }
            }
        )
    }
    if (msgArray[0] == '!winrate') {
        request({
                url: 'http://localhost:5000/api/getplayer/' + msgArray[1]
            }, function (error, response, body) {
                var jsonBody = JSON.parse(body);
                if (error) {
                    client.say(ircChannel, errorMsg);
                }
                if (jsonBody.length == 0) {
                    client.say(ircChannel, 'No Results found for ' + msgArray[1]);
                } else {
                    var totalWins = jsonBody[0].LeagueConquest.Wins + jsonBody[0].LeagueConquest.Losses;
                    var winPercent = Math.round(jsonBody[0].LeagueConquest.Wins / totalWins * 100);
                    if (totalWins == 0) {
                        client.say(ircChannel, msgArray[1] + " has not played any Conquest League games.");
                    } else {
                        client.say(ircChannel, msgArray[1] + " has played " + totalWins + " Conquest League games with a " + winPercent + "% winrate.");
                    }
                }
            }
        )
    }
    if (msgArray[0] == '!masteries') {
        request({
            url: 'http://localhost:5000/api/getplayer/' + msgArray[1]
        }, function (error, response, body) {
            var jsonBody = JSON.parse(body);
            if (error) {
                client.say(ircChannel, errorMsg);
                console.log(error);
            } if (jsonBody.length == 0) {
                client.say(ircChannel, 'No Results found for ' + msgArray[1]);
            } else {
                 var masteryLevel = jsonBody[0].MasteryLevel;
                 if (masteryLevel == 0) {
                 client.say(ircChannel, msgArray[1] + " has not mastered any gods.");
                 }
                 else {
                 client.say(ircChannel, msgArray[1] + " has mastered " + masteryLevel + " gods.");
                 }
            }
        });
    }

    //TODO: implement better error handling for players with stupid characters in their name
    if (msgArray[0] == '!matchinfo') {
        request({
            url: 'http://localhost:5000/api/getplayerstatus/' + msgArray[1]
        }, function (error, response, body) {
            var jsonBody = JSON.parse(body);
            if (error) {
                client.say(ircChannel, errorMsg);
                console.log(error);
            } if (jsonBody[0].status == '5') {
                client.say(ircChannel, 'No Results found for ' + msgArray[1]);
            } if (jsonBody[0].status == 2 || jsonBody[0].status == 1){
                client.say(ircChannel, msgArray[1] + ' is not currently in a game.')
            } if (jsonBody[0].status == '3') {
                console.log('Match ID: ' + jsonBody[0].Match);
               request({
                   url: 'http://localhost:5000/api/getmatchplayerdetails/' + jsonBody[0].Match
               }, function(error, response, body){
                   var matchBody = JSON.parse(body);
                   //console.log(matchBody);
                   if(error){
                       client.say(ircChannel, errorMsg)
                   } else {
                       for (var i = 0; i < matchBody.length; i++){
                        request({
                            url: 'http://localhost:5000/api/getplayer/' + matchBody[i].playerName
                        }, function(error, response, body){
                            if(error){
                                client.say(ircChannel, errorMsg)
                            } else {
                                try {
                                    var playerBody = JSON.parse(body);
                                    var elo = Math.round(playerBody[0].Rank_Stat);
                                    client.say(ircChannel, playerBody[0].Name + " - ELO:" + elo);
                                }
                                catch(e) {
                                    client.say(ircChannel, e);
                                }
                            }
                        });
                       } // End 'for' statement
                   }
               });
            }
        });
    }
});