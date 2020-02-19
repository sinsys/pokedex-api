require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const { getValidTypes } = require('./helpers.js');

const POKEDEX = require('./pokedex.json');
const validTypes = getValidTypes(POKEDEX.pokemon);

const app = express();

const morganSetting = 
  (process.env.NODE_ENV === 'production')
    ? 'tiny' 
    : 'common';

app.use(
  morgan(morganSetting),
  helmet(),
  cors()
);

validateBearerToken = (req, res, next) => {

  const authToken = req.get('Authorization');
  const apiToken = process.env.API_TOKEN;

  if ( 
    !authToken ||
    authToken.split(' ')[1] !== apiToken 
  ) {
    return(
      res
        .status(401)
        .json({
          code: 401,
          error: 'Unauthorized request'
        })
    );
  };

  next();
};

app.use(validateBearerToken);

handleGetTypes = (req, res) => {
  res.json(validTypes);
};

handleGetPokemon = (req, res) => {
  let { 
    name = '', 
    type 
  } = req.query;

  if( type && !validTypes.includes(type) ) {
    return(
      res
      .status(400)
      .send(`Query Error: type must be one of [${validTypes.join(', ')}]`)
    );
  };

  let pokemon = POKEDEX.pokemon;

  pokemon = pokemon
    .filter((poke) => (
      poke.name.toLowerCase()
        .includes(name.toLowerCase())
    )
  );

  if( type ) {
    pokemon = pokemon
      .filter((poke) => (
        poke.type.includes(type)
      ))
  };

  let response = {
    message: '',
    pokemon: pokemon
  };

  (response.pokemon.length === 0)
    ? (response.message = "No results found",
        res
          .json({
            ...response
          })
      )
    : (response.message = "Success",
        res
          .json({
            ...response
          })
      );
};

app.get(
  '/types',
  handleGetTypes
);

app.get(
  '/pokemon',
  handleGetPokemon
);

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
});

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
