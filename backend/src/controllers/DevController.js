const axios = require('axios');

const Dev = require('../models/Dev');
const ParseStringAsArray = require ('../utils/ParseStringAsArray');
const { findConnections, sendMessage } = require ('../websocket');

module.exports = {
  async index(req, res) {
    const devs = await Dev.find();

    return res.json(devs);
  },

  async store (req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
    
      const { name = login, avatar_url, bio } = apiResponse.data;
    
      const techsArray = ParseStringAsArray(techs);
    
      const location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    
      dev = await Dev.create({
        name,
        github_username, 
        avatar_url, 
        bio, 
        techs: techsArray,
        location
      });

      const sendSocketMessageTo = findConnections(
        {
          latitude,
          longitude
        },
        techsArray
      )

      sendMessage(sendSocketMessageTo, 'newDev', dev);
    };
  
    return res.json(dev);
  }
};