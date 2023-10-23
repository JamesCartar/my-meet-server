// Example route in your Node.js server
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const admin = require("firebase-admin");
const eventEmitter = require('../utils/eventEmitter');

const userModel = require('../models/user');
const roomModel = require('../models/room');



router.get('/:name', (req, res, next) => {
    
})