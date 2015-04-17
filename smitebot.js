/**
 * Created by Messyfresh on 3/29/2015.
 */

var irc = require('irc'),
    request = require('request'),
    cheerio = require('cheerio'),
    ircChannel = '#username',
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
    /* not quite ready for prime time
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
     end comment of !matchinfo */

    if(msgArray[0] == '!arena'){
        request({
            url: 'http://smite.guru/stats/' + msgArray[1]
        }, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);

                var arenaPlayed, arenaWin;
                var json = { arenaPlayed: '', arenaWin: ''};

                //start the scraping!!!
                $('#casual').filter(function(){
                   var data = $(this);

                    arenaPlayed = data.children().first().children().first().children().eq('2')
                        .children().eq('0').children().eq('1').children().eq('0').children()
                        .eq('1').children().eq('0').children('strong').text();

                    json.arenaPlayed = arenaPlayed;

                    arenaWin = data.children().first().children().first().children().eq('2')
                        .children().eq('0').children().eq('1').children().eq('0').children()
                        .eq('2').children().eq('0').children('strong').text();

                    json.arenaWin = arenaWin;
                    client.say(ircChannel, msgArray[1] + " has played " + json.arenaPlayed + " arena " +
                    "games with a winrate of " + json.arenaWin);
                });
            }
        });
    }
    if(msgArray[0] == '!assault'){
        request({
            url: 'http://smite.guru/stats/' + msgArray[1]
        }, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);

                var assaultPlayed, assaultWin;
                var json = { assaultPlayed: '', assaultWin: ''};

                //start the scraping!!!
                $('#casual').filter(function(){
                    var data = $(this);

                    assaultPlayed = data.children().first().children().first().children().eq('3')
                        .children().eq('0').children().eq('1').children().eq('0').children()
                        .eq('1').children().eq('0').children('strong').text();

                    json.assaultPlayed = assaultPlayed;

                    assaultWin = data.children().first().children().first().children().eq('3')
                        .children().eq('0').children().eq('1').children().eq('0').children()
                        .eq('2').children().eq('0').children('strong').text();

                    json.assaultWin = assaultWin;

                    client.say(ircChannel, msgArray[1] + " has played " + json.assaultPlayed + " assault " +
                    "games with a winrate of " + json.assaultWin);
                });
            }
        });
    }
    if(msgArray[0] == '!siege'){
        request({
            url: 'http://smite.guru/stats/' + msgArray[1]
        }, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);

                var siegePlayed, siegeWin;
                var json = { siegePlayed: '', siegeWin: ''};

                //start the scraping!!!
                $('#casual').filter(function(){
                    var data = $(this);

                    siegePlayed = data.children().first().children().first().children().eq('5')
                        .children().eq('0').children().eq('1').children().eq('0').children()
                        .eq('1').children().eq('0').children('strong').text();

                    json.siegePlayed = siegePlayed;

                    siegeWin = data.children().first().children().first().children().eq('5')
                        .children().eq('0').children().eq('1').children().eq('0').children()
                        .eq('2').children().eq('0').children('strong').text();

                    json.siegeWin = siegeWin;

                    client.say(ircChannel, msgArray[1] + " has played " + json.siegePlayed + " siege " +
                    "games with a winrate of " + json.siegeWin);
                });
            }
        });
    }
});