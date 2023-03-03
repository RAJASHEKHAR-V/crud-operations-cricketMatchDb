//import express, core path

const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

app.use(express.json());

//import sqlite sqlite3

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

//initialize the database and server
let db = null;
const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

//API-1 Getting the list of all the players from player_details table

app.get("/players/", async (request, response) => {
  const getALlPlayersQuery = `
  SELECT player_id AS playerId, player_name AS playerName
  FROM player_details`;
  const getArrayOfPlayers = await db.all(getALlPlayersQuery);
  response.send(getArrayOfPlayers);
});

//API-2 Get the specific player based on the player Id from player_details table

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getIdPlayerQuery = `
    SELECT player_id AS playerId, player_name AS playerName
  FROM player_details WHERE player_id=${playerId}`;
  const playerObject = await db.get(getIdPlayerQuery);
  response.send(playerObject);
});

//API-3 Update the specific player based on the id from player_details table

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatePlayer = request.body;
  const { playerName } = updatePlayer;
  const updateIdPlayerQuery = `
    UPDATE player_details
    SET player_name='${playerName}'
    WHERE player_id=${playerId}`;
  await db.run(updateIdPlayerQuery);
  response.send("Player Details Updated");
});

//API-4 Get the match details of specific match based on the match id from match_details table

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getIdMatchQuery = `
    SELECT match_id AS matchId, match AS match,
    year AS year
    FROM match_details
    WHERE match_id=${matchId}`;
  const specificMatchDetails = await db.get(getIdMatchQuery);
  response.send(specificMatchDetails);
});

//API-5 Get the match Details based on the player_id

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getIdPlayerMatchDetails = `
    SELECT match_details.match_id AS matchId, match_details.match AS match,
    match_details.year AS year
    FROM match_details NATURAL JOIN player_match_score
    WHERE player_id=${playerId}`;
  const idPlayerMatchDetails = await db.all(getIdPlayerMatchDetails);
  response.send(idPlayerMatchDetails);
});

//API-6 Get the list of players for specific Match Id from player_details,player_match_score table

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getIdMatchPlayersQuery = `
  SELECT player_details.player_id AS playerId,
  player_details.player_name AS playerName
  FROM player_details NATURAL JOIN player_match_score
  WHERE match_id=${matchId}`;
  const idMatchPlayerDetails = await db.all(getIdMatchPlayersQuery);
  response.send(idMatchPlayerDetails);
});

//API-7 get the details of the statistics of the particular player(id) from player_match_score table.

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getIdPlayerStatisticsQuery = `
    SELECT player_details.player_id AS playerId, player_details.player_name AS playerName,
     SUM(player_match_score.score) AS totalScore,
    SUM(player_match_score.fours) AS totalFours,
    SUM (player_match_score.sixes) AS totalSixes
    FROM player_details NATURAL JOIN player_match_score
    WHERE player_details.player_id=${playerId}`;
  const idPlayerStatistics = await db.get(getIdPlayerStatisticsQuery);
  response.send(idPlayerStatistics);
});

module.exports = app;
