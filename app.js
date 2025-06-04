const express = require('express') ; 
const app  = express() ; 
const socketIO = require('socket.io') ; 
const http  =require('http')  ;
const path = require('path') ; 
app.set('view engine', 'ejs') ;
app.use(express.json()) ; 
app.use(express.urlencoded({extended : true})) ; 
app.use(express.static(path.join(__dirname,"public"))) ; 

const server = http.createServer(app) ; 
const io = socketIO(server) ; 

const waitingUsers = [] ; 

io.on("connection",(socket)=>{
    socket.on("JoinRoom",()=>{
        if(!waitingUsers.length){
            waitingUsers.push(socket) ; 
        } else {
            const partner = waitingUsers.shift() ; 
            const roomName = `${socket.id}-${partner.id}` ; 
            socket.join(roomName) ;
            partner.join(roomName) ; 
            io.to(roomName).emit("Joined",{roomName})  ;
        }
    })

    socket.on("message",(data)=>{ 
        console.log(data.room) ;
        socket.to(data.room.roomName).emit("message", data.message);
    })

    socket.on("signalingMessage", ({room,message})=>{
        console.log("Yeh room hain", room) ; 
        console.log(message) ;
      socket.broadcast.to(room.roomName).emit("signalingMessage",message) ;      
    })

    socket.on("startVideoChat",( { room } )=>{
       console.log(room) ; 
       socket.broadcast.to(room.roomName).emit("IncomingCall") ;      
    })
    
    socket.on("acceptCall", ( { room } )=> {
        socket.broadcast.to(room.roomName).emit("callAccepted") ; 
    })

    socket.on("rejectCall" , ( { room } )=>{
        socket.broadcast.to(room.roomName).emit("callRejected") ; 
    })

})

app.get('/',(req,res)=>{
    res.render("index") ; 
})

app.get('/chat',(req,res)=>{
    res.render('chat') ;
})


server.listen(3000) ;