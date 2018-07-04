const {
    feetToMetres,
    metresToFeet,
    euclideanDistance,
    distFrom,
    minDistancePointLine
} = require('air-commons').utils;

const Flight = require('air-commons').Flight;
const Position = require('air-commons').Position;
const TimedPosition = require('air-commons').TimedPosition;

const MAX_TIME_NO_NEW_DATA = 30; // in seconds

exports.genFlightsStats = (allOrderedSamples, position) => {
    let allFlights = [];
    let allSummaries = [];
    let toRemoveSet = new Set();

    const populateAllSummaries = (currentTimestamp, justRemainers) => {
        for (let flight of allFlights) {
            let lastTimedPos = flight.getLastTimedPosition();
            if ((lastTimedPos && lastTimedPos.timestamp > currentTimestamp + MAX_TIME_NO_NEW_DATA) ||
                justRemainers) {
                let resSummary = flight.getSummary(position);

                if (resSummary.samples > 2) {
                    allSummaries.push(resSummary);
                }
                console.log(resSummary);
                toRemoveSet.add(flight);
            }
        }
    }

    for (let sample of allOrderedSamples) {

        let existingFlight = allFlights.find((f) => f.icao === sample.icao);

        let pos = new TimedPosition({
            lat: sample.latitude,
            lon: sample.longitude,
            alt: sample.galtM,
            timestamp: sample.time
        });

        if (existingFlight) {
            existingFlight.addTimedPosition(pos);
        } else {
            let currentFlight = new Flight(sample);
            currentFlight.addTimedPosition(pos);
            allFlights.push(currentFlight);
        }

        populateAllSummaries(pos.timestamp);

        allFlights = allFlights.filter(f => !toRemoveSet.has(f));
        toRemoveSet = new Set();
    }

    populateAllSummaries(null, true);

    return(allSummaries);
};