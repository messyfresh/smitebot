/**
 * Created by Messyfresh on 3/29/2015.
 */

var irc = require('irc'),
    request = require('request'),
    ircChannel = '#remedeez',
    twitchUser = process.env.twitchUser,
    twitchPass = process.env.twitchPass;

var client = new irc.Client('irc.twitch.tv', twitchUser, {
    //debug: true,
    userName: twitchUser,
    password: twitchPass,
    channels: [ircChannel]
});

client.addListener('message', function(from, to, message) {
    var msgArray = message.split(" ");
    if (message.toLowerCase() == "hi elo bot") {
        client.say(ircChannel, "Hello " + from);
    }
    if (msgArray[0] == '!elo') {
        request({
                url: 'http://localhost:5000/api/getplayer/' + msgArray[1]
            }, function (error, response, body) {
                var jsonBody = JSON.parse(body);
                if (error) {
                    client.say(ircChannel, 'Sorry, an error has occurred, EVERYONE JUST STAY CALM!!!');
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
                    client.say(ircChannel, 'Sorry, an error has occurred, EVERYONE JUST STAY CALM!!!');
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
                client.say(ircChannel, 'Sorry, an error has occurred, EVERYONE JUST STAY CALM!!!');
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
});