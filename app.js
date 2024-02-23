const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

const app = express()
app.use(express.json())

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(e.message)
  }
}
initializeDbAndServer()

const convertPlayerDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  }
}

const convertMatchPlayerDbObjectToResponseObject = dbObject => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  }
}
//Get Players API-1

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
            SELECT 
              *
            FROM 
                player_details;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer =>
      convertPlayerDbObjectToResponseObject(eachPlayer),
    ),
  )
})

//Get Players API-2

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
           SELECT
               *
            FROM 
               player_details 
            WHERE 
                player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(convertPlayerDbObjectToResponseObject(player))
})

//Update Player API-3
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const updatePlayersQuery = `
  UPDATE 
     player_details 
  SET 
     player_name ='${playerName}'
  WHERE 
      player_id = ${playerId};`
  await db.run(updatePlayersQuery)
  response.send('Player Details Updated')
})

//Get Match Details API-4
app.get('/matches/:matchId', async (request, response) => {
  const {matchId} = request.params
  const getMatchDetailsQuery = `
            SELECT 
              *
            FROM 
               match_details
            WHERE 
               match_id = ${matchId};`
  const matchDetails = await db.get(getMatchDetailsQuery)
  response.send(convertMatchPlayerDbObjectToResponseObject(matchDetails))
})
//Get Matches Of Player API -5
app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerMatchesQuery = `
         SELECT 
            *
          FROM 
              player_match_score NATURAL JOIN match_details
          WHERE 
            player_id = ${playerId};`
  const playerMatches = await db.all(getPlayerMatchesQuery)
  response.send(
    playerMatches.map(eachMatch =>
      convertMatchPlayerDbObjectToResponseObject(eachMatch),
    ),
  )
})

//Get Match Player API-6
app.get('/matches/:matchId/players/', async (request, response) => {
  const {matchId} = request.params
  const getMatchPlayersQuery = `
        SELECT 
          *
        FROM 
            player_details NATURAL JOIN player_match_score 
        WHERE 
            match_id = ${matchId};`
  const playerArray = await db.all(getMatchPlayersQuery)
  response.send(
    playerArray.map(eachPlayer =>
      convertPlayerDbObjectToResponseObject(eachPlayer),
    ),
  )
})

//Get Players Score API-7
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getMatchPlayersQuery = `
        SELECT 
            player_id AS playerId,
            player_name AS playerName,
            SUM(score) AS totalScore,
            SUM(fours) AS totalFours,
            SUM(sixes) AS totalSixes
        FROM 
            player_details NATURAL JOIN player_match_score
        WHERE 
           player_id = ${playerId};`
  const playerMatchDetails = await db.get(getMatchPlayersQuery)
  response.send(playerMatchDetails)
})

module.exports = app
