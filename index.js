'use strict';

var Alexa = require('alexa-sdk');
var request = require('request');
var rp = require('request-promise');
var moment = require('moment');

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.58addfae-a93b-42b7-8ce9-b666db6514ad'; //skill id
    alexa.registerHandlers(hazeIntentsHandler);
    alexa.execute();
};

exports.test = function () {
    var today = moment().format();
    console.log(today);

    var options = {
        uri: 'https://api.data.gov.sg/v1/environment/psi',
        qs: {
            'date_time': today
        },
        headers: {
            'User-Agent': 'Request-Promise',
            'api-key': 'some_api_key'
        },
        json: true // Automatically parses the JSON string in the response
    };

    rp(options)
        .then(function (response) {
            var regionPsi = response.items[0].readings.psi_twenty_four_hourly.national;
            console.log("The P S I level in the national region is " + regionPsi);
        })
        .catch(function (err) {
            // API call failed...
            console.log("request failed" + err);
        });
};

var today = moment().format();
var today_forCard = moment().format('LLL');
var options = {
    uri: 'https://api.data.gov.sg/v1/environment/psi',
    qs: {
        'date_time': today
    },
    headers: {
        'User-Agent': 'Request-Promise',
        'api-key': 'some_api_key'
    },
    json: true // Automatically parses the JSON string in the response
};

var hazeIntentsHandler = {

    'LaunchRequest': function () {
        this.emit(':askWithCard', 'Welcome! Ask me if there is haze today, or in the North, South, East, West, or central region.',
            "Come on. Ask me if there's any haze in the west region or how Singapore PSI level is like today.",
            "Welcome!",
            "Ask me whether there is haze today, or whether the North, South, East, West, or central region has any haze.")
    },

    'IsThereHazeIntent': function () {
        var haze = this;

        rp(options)
            .then(function (response) {
                var overallPsi = response.items[0].readings.psi_twenty_four_hourly.national;
                if (overallPsi <= 50) {
                    haze.emit(':tellWithCard',
                        ("Todays overall air quality is good. P S I level is " + overallPsi),
                        'Air quality today is good.',
                        ('PSI level is ' + overallPsi));
                }
                else if (overallPsi <= 100 && overallPsi > 50) {
                    haze.emit(':tellWithCard',
                        ("Todays overall air quality is moderate. P S I level is " + overallPsi),
                        'Air quality today is moderate.',
                        ('PSI level is ' + overallPsi));
                }
                else if (overallPsi <= 200 && overallPsi > 100) {
                    haze.emit(':tellWithCard',
                        ("Todays overall air quality is unhealthy. P S I level is " + overallPsi),
                        'Air quality today is unhealthy.',
                        ('PSI level is ' + overallPsi));
                }
                else if (overallPsi <= 300 && overallPsi > 200) {
                    haze.emit(':tellWithCard',
                        ("Todays overall air quality is very unhealthy. P S I level is " + overallPsi),
                        'Air quality today is very unhealthy.',
                        ('PSI level is ' + overallPsi));
                }
                else {
                    haze.emit(':tellWithCard',
                        ("Todays overall air quality is hazardous. P S I level is " + overallPsi),
                        'Air quality today is hazardous.',
                        ('PSI level is ' + overallPsi));
                }
            })
            .catch(function (err) {
                // API call failed...
                console.log("request failed!!!!!" + err);
                haze.emit(':tellWithCard',
                    ("Sorry, there was a connection error. Please try again."),
                    "Sorry!",
                    "There was a connection error. Please try again.");
            });

    },

    'OverallPsiIntent': function () {
        var overall = this;
        var cardTitle = 'PSI level as of ' + today_forCard;
        var cardContent = function (nationalPsi) {
            return "Singapore's overall 24 hour PSI level is " + nationalPsi;
        };

        rp(options)
            .then(function (response) {
                overall.emit(':tellWithCard',
                    ("Singapores overall 24 hour P S I level is " + response.items[0].readings.psi_twenty_four_hourly.national),
                    cardTitle,
                    cardContent(response.items[0].readings.psi_twenty_four_hourly.national));
            })
            .catch(function (err) {
                // API call failed...
                console.log("request failed!!!!!" + err);
                overall.emit(':tell',
                    ("Sorry, there was a connection error. Please try again."));
            });
    },

    'RegionalPsiIntent': function () {
        var regional = this;
        var region = this.event.request.intent.slots.region.value;
        var cardTitle = '24-hr PSI level as of ' + today_forCard;
        var cardContent = function (regionalPsi) {
            return "The PSI level in the " + region + " region is " + regionalPsi;
        };

        rp(options)
            .then(function (response) {
                if (region === "north") {
                    regional.emit(':tellWithCard',
                        ("The twenty four hour P S I level in the north region is " + response.items[0].readings.psi_twenty_four_hourly.north),
                        cardTitle,
                        cardContent(response.items[0].readings.psi_twenty_four_hourly.north));
                }
                else if (region === "south") {
                    regional.emit(':tellWithCard',
                        ("The twenty four hour P S I level in the south region is " + response.items[0].readings.psi_twenty_four_hourly.south),
                        cardTitle,
                        cardContent(response.items[0].readings.psi_twenty_four_hourly.south));
                }
                else if (region === "east") {
                    regional.emit(':tellWithCard',
                        ("The twenty four hour P S I level in the east region is " + response.items[0].readings.psi_twenty_four_hourly.east),
                        cardTitle,
                        cardContent(response.items[0].readings.psi_twenty_four_hourly.east));
                }
                else if (region === "central") {
                    regional.emit(':tellWithCard',
                        ("The twenty four hour P S I level in the central region is " + response.items[0].readings.psi_twenty_four_hourly.central),
                        cardTitle,
                        cardContent(response.items[0].readings.psi_twenty_four_hourly.central));
                }
                else {
                    regional.emit(':tellWithCard',
                        ("The twenty four hour P S I level in the west region is " + response.items[0].readings.psi_twenty_four_hourly.west),
                        cardTitle,
                        cardContent(response.items[0].readings.psi_twenty_four_hourly.west));
                }
            })
            .catch(function (err) {
                // API call failed...
                console.log("request failed!!!!!" + err);
                regional.emit(':tell',
                    ("Sorry, there was a connection error. Please try again."));
            });
    },

    'AMAZON.StopIntent': function () {
        var cardTitle = "Goodbye!";
        var cardContent = "Thanks for using Today Got Haze?";
        this.emit(":tellWithCard", "Goodbye!", cardTitle, cardContent);  // tell will say something and stop. ask will ask and continue the conversation
    },

    'AMAZON.CancelIntent': function () {
        this.emit('AMAZON.StopIntent');
    },

    'AMAZON.HelpIntent': function () {
        var cardTitle = "Need help?";
        var cardContent = "Ask me about Singapore's 24-hr PSI levels or in the North, South, East, West, or central regions!";

        this.emit(':askWithCard',
            'Ask me about Singapores P S I level or specifically in the North, South, East, West, or central region!', //speechOutput
            'Come on! Ask me if you would like to know about todays P S I levels.',
            cardTitle,
            cardContent); //repromptText (after 8 seconds - give users chance to say something)
    },

    'Unhandled': function () {
        this.emit('AMAZON.HelpIntent');
    }

};
