const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const router = require("./routes/userRoutes");
const http = require('http');
const { Server } = require('socket.io'); 
const jwt = require('jsonwebtoken');
const User  = require('../backend/models/userModels');
require("dotenv").config({path:"config.env"});

app.set('trust proxy', true);


app.use(cors({
    origin: ['http://localhost:8081', 'http://localhost:8080'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));

app.use(fileUpload({useTempFiles:true}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use("/api/v1", router);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:8081','http://localhost:8080'],
        methods: ['GET','POST']
    }
});

connections = {}; 

io.use((socket,next)=>{
    const token = socket.handshake.auth.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {return next(new Error('Authentication error'));}
            socket.user = decoded;
            next();
        });
    } 
    else next(new Error('Authentication error'));
});

io.on('connection', (socket) => {
    const connectedClient = socket.user.id;
    connections[connectedClient] = socket.id;
    console.log('User connected:', connectedClient);

    socket.on('sendRequest', async (data) => {
        try {
            const { senderId, receiverId } = data;
            if (!senderId||!receiverId) console.log("Received Null values");
            const receiverSocketId = connections[receiverId];
            console.log('Received request from:', senderId, 'to', receiverId);
            User.findByIdAndUpdate(
                senderId,
                {$push:{invitationsSent: {id:receiverId}}},
                {new:true}
            ).catch((err)=>{console.log(err);});
            if (connections[receiverId]) {
                const target = await User.findOne({ _id: senderId }).select('_id name email phone avatar job workAt age');
                io.to(receiverSocketId).emit('requestReceived', { user: target });
                console.log('Request sent to receiver:', receiverId);
                User.findByIdAndUpdate(
                    { _id: receiverId },
                    {  
                        $push: { pendingList: { id: senderId } }
                    }, 
                    { new: true }
                ).catch(err => console.log(`Error updating receiver ${receiverId}:`, err));
            
            } else {
                User.findOneAndUpdate(
                    { _id: receiverId },
                    { 
                        $set: { dirty: 1 }, 
                        $push: { deltaPending: { id: senderId }}
                    },
                    { new: true }
                ).catch(err => console.log(`Error updating receiver ${receiverId}:`, err));
            }    
        } catch (error) {
            console.log(error);
            socket.emit('error', { message: 'Failed to send request' });
        }
    });

    socket.on('skipRequest', async (data) => {
        try {
            const { senderId, receiverData } = data;
            const { id,type,randomHash } = receiverData;
            if (type === 0){
                const result = await User.findOne({_id:id,broadcastQRsalt:randomHash}).select('_id name email job workAt phone avatar age');
                console.log(result,randomHash);
                
                if (result){
                    const sender = await User.findOne({ _id: senderId }).select('_id name email job workAt phone avatar age');
                    console.log(sender);
                    try{
                        if (connections[id]) {      
                            const receiverSocketId=connections[id];
                            io.to(receiverSocketId).emit('requestAccepted',{accepter:sender});
                            User.findOneAndUpdate(
                                { _id: id },
                                {  
                                    $push: {contactList:{id:senderId}}
                                },
                                { new: true }
                            ).catch(err => console.log(`Error updating receiver ${id}:`, err));
                        }
                        else{
                            User.findOneAndUpdate(
                                {_id:id},
                                { 
                                    $set:  {dirty:1}, 
                                    $push: {deltaConnection:{id:senderId}} 
                                },
                                { new: true }
                            ).catch(err => console.log(`Error updating receiver ${id}:`, err));
                        }
                    }
                    catch(error){
                        console.log(error);
                    }
                    const senderSocketId = connections[senderId];
                    if (senderSocketId){
                        User.findByIdAndUpdate({ _id: senderId },{$push:{contactList:{id:id}}},{new:true}).catch(err => console.log(`Error updating sender ${senderId}:`,err));
                        io.to(senderSocketId).emit("requestAccepted",{accepter:result});
                    }
                    else User.findByIdAndUpdate({ _id: senderId },{$push:{deltaConnection:{id:id}}},{new:true}).catch(err => console.log(`Error updating sender ${senderId}:`,err));
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('fetchedUpdates', async (data) => {
        try {
            const { senderId } = data;
            const sender = await User.findOne({ _id:senderId });
            if (sender) {
                const { deltaPending, deltaConnection } = sender;
                await User.findByIdAndUpdate(
                    senderId,{
                        $push: {
                            pendingList:{$each:deltaPending},
                            contactList:{$each:deltaConnection},
                        },
                        $set: {
                            dirty:0,
                            deltaPending:[],
                            deltaConnection:[],
                            deletedConnections:[],
                            eventQueue:[],
                        },
                    },
                    {new:true}
                );
            }
            console.log("Received Request for updates fetching and acted accordingly");
        } catch (error) {
            console.error('Error in fetchUpdates:', error);
        }
    });

    socket.on('changedDetails',async (data) =>{
        try{
            console.log("Requesex Received");
            const {_id,fieldChanged,newData} = data;
            console.log(_id,fieldChanged,newData);
            User.findByIdAndUpdate(
                _id,
                {$set: { [fieldChanged]: newData }},
                {new:true}
            ).catch((error)=>{console.log(error)});
            const result = await User.findById(_id);
            if (result){
                for (let i=0;i<result.contactList.length;i+=1){
                    const userId = result.contactList[i].id;
                    const receiverSocketId = connections[userId];
                    if (receiverSocketId) io.to(receiverSocketId).emit("changeDetected",{_id:_id,fieldChanged:fieldChanged,newData:newData});
                    else{
                        User.findByIdAndUpdate(
                            userId,
                            {$push:{eventQueue:{_id:_id,fieldChanged:fieldChanged,newData:newData}}},
                            {new:true}
                        );
                    }
                }
                for (let i=0;i<result.invitationsSent.length;i+=1){
                    const userId = result.invitationsSent[i].id;
                    const receiverSocketId = connections[userId];
                    if (receiverSocketId) io.to(receiverSocketId).emit("changeDetected",{_id:_id,fieldChanged:fieldChanged,newData:newData});
                    else{
                        User.findByIdAndUpdate(
                            userId,
                            {$push:{eventQueue:{_id:_id,fieldChanged:fieldChanged,newData:newData}}},
                            {new:true}
                        );
                    }
                }
            }
        }
        catch(error){ console.log(error); }
    })

    socket.on('acceptRequest', async (data) => {
        try {
            const { senderId, accepterId } = data;
            const accepter = await User.findOne({_id:accepterId}).select('_id name email phone avatar job workAt age');
            const receiverSocketId = connections[senderId]; 
            User.findOneAndUpdate(
                {_id:accepterId},
                { 
                    $push: {contactList:{id:senderId}}, 
                    $pull: {pendingList:{id:senderId}} 
                },
                { new: true }
            ).catch(err => console.log(`Error updating accepter ${accepterId}:`, err));
            
            User.findByIdAndUpdate(
                senderId,
                { $pull: { invitationsSent: { id:accepterId }}},
                {new:true}
            ).catch(err => console.log(err));

            if (receiverSocketId) {
                console.log("Online");
                io.to(receiverSocketId).emit('requestAccepted',{accepter:accepter});
                User.findByIdAndUpdate(
                    senderId,
                    { 
                        $push: {contactList:{id:accepterId}} 
                    },
                    { new: true }
                ).catch(err => console.log(`Error updating sender ${senderId}:`, err));
            }
            else{
                console.log("Offline");
                User.findByIdAndUpdate(
                    senderId,
                    { 
                        $set:  {dirty:1}, 
                        $push: {deltaConnection:{id:accepterId}} 
                    },
                    { new: true }
                ).catch((err => console.log(`Error updating sender ${senderId}:`, err)));
            }
            console.log("Changes Updated");
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('rejectRequest', async (data) => {
        try {
            const { senderId, accepterId } = data;
            User.findByIdAndUpdate(
                accepterId,
                { $pull: { pendingList: { id:senderId }}},
                {new: true}
            ).catch(err => console.log(`Error rejecting request for accepter ${accepterId}:`, err));
            User.findByIdAndUpdate(
                senderId,
                { $pull: { invitationsSent: { id:accepterId }}},
                {new:true}
            ).catch(err => console.log(err));
            console.log("Rejected Successfully!");
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('removeConnection',async(data) => {
        try{
            const {deleterId, deletedId} = data;
            User.findByIdAndUpdate(
                deleterId,
                {$pull:{ contactList:{id:deletedId}}},
                {new:true}
            ).catch(err => console.log("Error  :- ",err));
            User.findByIdAndUpdate(
                deletedId,
                {$pull:{ contactList:{id:deleterId}}},
                {new:true}
            ).catch(err => console.log("Error  :- ",err));
            const receiverSocketId = connections[deletedId];
            if (receiverSocketId){
                io.to(receiverSocketId).emit("deletedConnection",{deleterId:deleterId});
                User.findByIdAndUpdate(
                    deletedId,
                    {$pull:{ contactList:{id:deleterId}}},
                    {new:true}
                ).catch(err => console.log("Error :- ",err));
            }
            else{
                User.findByIdAndUpdate(
                    deletedId,
                    {$push:{deletedConnections:{id:deleterId}}},
                    {$pull:{contactList:{id:deleterId}}},
                    { new: true }
                ).catch(err => console.log("Error :- ",err));
            }
        }
        catch(error){console.log(error);}
    })

    
    socket.on('disconnect', () => {
        const userId = socket.user.id;
        if (userId) {
            delete connections[userId];
            console.log(`User ${userId} disconnected.`);
        }
    });
});


module.exports = { app, server };


