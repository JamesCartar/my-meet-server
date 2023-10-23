const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const admin = require("firebase-admin");
const eventEmitter = require('../utils/eventEmitter');

const userModel = require('../models/user');
const roomModel = require('../models/room');



// Define a route for creating a new room
router.post('/create', async (req, res) => {
    try {
        const { user } = req.body;
        if( !user || !user.name || !user.socketId ) {
            return res.status(400).json({ success: false, message: 'Please provide all the necessicity filelds !' });
        }  

        const oldUser = await userModel.findOne({ name: user.name });
        if(oldUser) {
            res.status(400).json({ success: false, message: "User already exist" });
        } else {
           const newUser = await userModel.create(user);
           const newRoom = await roomModel.create({
                admin: newUser._id,
                participants: [ newUser._id ]
            });
        
            // eventEmitter.emit('room:create', { userId: newUser.socketId, roomId: newRoom._id.toString() });

            res.status(200).json({ roomId: newRoom._id, user: newUser });
        }

        // Push the data to the database reference
        // rommDatabaseRef.child(roomID).set(newRoom, (error) => {
        //     if (error) {
        //         console.error("Data could not be saved.", error);
        //         res.status(500).send("Data could not be saved.");
        //     } else {
        //         console.log("Data saved successfully.");
        //         console.log(newUser)
        //         userDatabaseRef.child(userID).set(newUser, (userError) => {
        //             if (userError) {
        //                 console.error("User data could not be saved.", userError);
        //                 res.status(500).send("User data could not be saved.");
        //             } else {
        //                 console.log("User data saved successfully.");
        //                 // Respond with the room ID
        //                 res.status(200).json({ roomID });
        //             }
        //         });
        //     }
        // });
    } catch(e) {
        console.log(e)
        res.status(500).json({ success: false, message: e.message || 'Something went wrong, Please try again.' })
    }

});

// Define a route for joining to a room
router.post('/join', async(req, res) => {
    // const { user, roomID } = req.body;

    // console.log(req.body)

    // const db = admin.database();
    // const userRef = db.ref('users/' + user.id);
    // const roomRef = db.ref('rooms/' + roomID);

    // roomRef.once('value', function (snapshot) {
    //     if (!snapshot.exists()) {
    //         res.status(404).send("Room doesn't exist");
    //     } else {
    //         const roomData = snapshot.val();
    //         if(!roomData.participants.includes(user.id)) {
    //             roomData.participants.push(user.id);
    //             roomRef.update(roomData);
    //         }

    //         userRef.once('value', function (snapshot) {
    //             if (!snapshot.exists()) {
    //                 userRef.child(user.id).set(user, (userError) => {
    //                     if (userError) {
    //                         console.error("User data could not be saved.", userError);
    //                     } else {
    //                         console.log("User data saved successfully.");
    //                     }
    //                 });
    //             } else {
    //                 console.log('old user: ', snapshot.val());
    //             }
                
    //             // eventEmitter.emit('room:join', { user, roomID });
    //             // Respond with the room ID
    //             res.status(200).json({ user, roomID });
    //         })        


    //         // userRef.child(user.id).set(newUser, (userError) => {
    //         //     if (userError) {
    //         //         console.error("User data could not be saved.", userError);
    //         //         res.status(500).send("User data could not be saved.");
    //         //     } else {
    //         //         console.log("User data saved successfully.");
    //         //         eventEmitter.emit('room:join', { user, roomID });
    //         //         // Respond with the room ID
    //         //         res.status(200).json({ user, roomID });
    //         //     }
    //         // });
    //     }
    // });
    const { user, roomId } = req.body;

    console.log(req.body)
    if( !user || !user.name || !user.socketId || !roomId ) {
        return res.status(400).json({ success: false, message: 'Please provide all the necessicity filelds !' });
    };

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return res.status(400).json({ success: false, message: 'Invalid room id provided' });
    }

    const checkRoom = await roomModel.findById(roomId);
    if(!checkRoom) {
       return res.status(400).json({ success: false, message: "Room does not exist" });
    }
    
    const oldUser = await userModel.findOne({ name: user.name });
    const room = await roomModel.findById(roomId).populate('admin participants');


    if(oldUser || !room) {
        res.status(400).json({ success: false, message: "User already exist" });
    } else {
        const newUser = await userModel.create(user);

        room.participants.push(newUser._id);
        await room.save();

        
        // eventEmitter.emit('room:join', { userId: user.socketId, roomId: room._id.toString() });

        res.status(200).json({ roomId: room._id, user: newUser });
    }
});


// Define a route for creating a new room
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const room = await roomModel.findById(id).populate('admin participants');

        if(!room) return res.status(400).json({ success: false, message: "Room does not exist" });

        return res.status(200).json({ success: true, room: room });
    } catch(e) {
        console.log(e)
        res.status(500).json({ success: false, message: e.message || 'Something went wrong, Please try again.' })
    }
});


router.delete('/clear', async(req, res) => {
    await roomModel.deleteMany({});
    await userModel.deleteMany({});
    res.send('clear')
})


// Add more routes as needed

module.exports = router;