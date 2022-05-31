const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const server = require("http").Server(app)
const { ExpressPeerServer } = require("peer");
const io = require('socket.io')(server)
const { v4: uuidV4 } = require("uuid")
const mongoose = require("mongoose")
const Admin = require("./model/admin")
const Staff = require("./model/staff")
const Student = require("./model/student")
const Class = require("./model/class")
const peerUser = require("./model/peerUser");
const room = require("./model/rooms");
var cookieParser = require('cookie-parser')

const dbURL = "mongodb+srv://thejaywebtech:jethro1998@virtual-learning.in2qg.mongodb.net/e-learning?retryWrites=true&w=majority";
mongoose.connect(dbURL).then((result)=> console.log("Database Connected!")).catch((err)=> console.log(err));

const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use("/peerjs", peerServer);

var staffauth
var studentauth
var adminauth
const isAuth = (req, res, next) => {
  if(req.cookies[staffauth]==null){
    res.redirect("/staff")
   
  }else{
    next()
  }
}

const stuisAuth = (req, res, next) => {
  if(req.cookies[studentauth]==null){
    res.redirect("/student-login")
   
  }else{
    next()
  }
}

const addisAuth = (req, res, next) => {
  if(req.cookies[adminauth]==null){
    res.redirect("/backend")
   
  }else{
    next()
  }
}


app.get("/", (req, res) => {
  res.render("index");
});

app.get("/staff", (req, res) => {
  if(req.cookies[staffauth]==null){
    const userName = "user"
    res.render(__dirname + '/views/staff/index', {userName}); 
  }else{
    var currrentID = req.cookies[staffauth]
    Staff.findById(currrentID)
    .then((result) =>{
      
      res.render(__dirname + '/views/staff/dashboard', {id: result});
    })
      .catch((err) => {
        console.log(err)
      });

  }
});

app.get("/student-login", (req, res) => {
  if(req.cookies[studentauth]==null){
    const userName = "user"
    res.render(__dirname + '/views/student/index', {userName}); 
  }else{
    var currrentID = req.cookies[studentauth]
    Student.findById(currrentID)
    .then((result) =>{
      
      res.render(__dirname + '/views/student/dashboard', {id: result});
    })
      .catch((err) => {
        console.log(err)
      });

  }
});

app.get("/backend", (req, res) => {
  res.render(__dirname + '/views/backend/index'); 
});

app.get("/dashboard", (req, res) => {
  
  Student.countDocuments()
  .then((result) =>{
    Staff.countDocuments()
    .then((result2) =>{
      res.render(__dirname + '/views/backend/dashboard', {staff: result2, student: result});
    })
      .catch((err) => {
        console.log(err)
      });
  })
  .catch((err) => {
    console.log(err)
  }); 
});


app.post('/api/admin-login', async (req, res)=>{
  const { uname, pword } = req.body
  console.log({uname, pword})
  const user = await Admin.findOne({ uname, pword }).lean()
  if (!user) {
      return res.json ({ status: 'error', error: 'Invalid Username/Password'})
  }
  res.json({status : 'ok'});
});

app.get("/register", (req, res) => {
  res.render(__dirname + '/views/backend/register');
});

app.get("/success", (req, res) => {
  res.render(__dirname + '/views/backend/success');
});

app.get("/student", (req, res) => {
  res.render(__dirname + '/views/backend/student');
});

app.post("/register", (req, res) => {
  const { name,email,password, course, level, dept } = req.body;
  const new_course = course.join(', ');
  const new_level = level.join(', ');
  const new_dept = dept.join(', ');
  const staff = new Staff({ name,email,password, new_course, new_level, new_dept });
  staff.save()
  .then((result) => {
    res.render(__dirname + '/views/backend/success');
  })
  .catch((err) =>{
    console.log(err);
  })

});

app.post("/student", (req, res) => {
  const student = new Student(req.body);
  student.save()
  .then((result) => {
    res.render(__dirname + '/views/backend/success-2');
  })
  .catch((err) =>{
    console.log(err);
  })

});

app.get("/view-student", (req, res) => {
 
  Student.find().sort({ createdAt: -1})
  .then((result) =>{
    res.render(__dirname + '/views/backend/view-student', {student: result});
  })
  .catch((err) => {
    console.log(err)
  })
});


app.get("/view-staff", (req, res) => {
 
  Staff.find().sort({ createdAt: -1})
  .then((result) =>{
    res.render(__dirname + '/views/backend/view-staff', {staff: result});
  })
  .catch((err) => {
    console.log(err)
  })
});

app.delete("/view-staff/:id", (req, res) => {
 
 const id = req.params.id;
 Staff.findByIdAndDelete(id)
  .then((result) =>{
    res.json({redirect: '/view-staff'});
  })
  .catch((err) => {
    console.log(err)
  })
});


app.delete("/view-student/:id", (req, res) => {
 
  const id = req.params.id;
  Student.findByIdAndDelete(id)
   .then((result) =>{
     res.json({redirect: '/view-student'});
   })
   .catch((err) => {
     console.log(err)
   })
 });

 

 app.post('/staff-login', async (req, res)=>{
  const { email, password } = req.body
  const user = await Staff.findOne({ email, password }).lean()
  if (!user) {
    const userName = "false"
    res.render(__dirname + '/views/staff', {userName});
  }else{

  Staff.findOne({ email, password }).lean()
  .then((result) =>{ 
    var staffid = result._id.toString()
    res.cookie(staffauth, staffid, {expire: 360000 + Date.now()})
    var currrentID = req.cookies[staffauth]
    res.render(__dirname + '/views/staff/dashboard', {id: result})
  })
  .catch((err) => {
    console.log(err)
  }) 
 }
});


app.post('/student-auth', async (req, res)=>{
  const { email, password } = req.body
  const user = await Student.findOne({ email, password }).lean()
  if (!user) {
    const userName = "false"
    res.render(__dirname + '/views/student/index', {userName});
  }else{

  Student.findOne({ email, password }).lean()
  .then((result) =>{ 
    var stuid = result._id.toString()
    res.cookie(studentauth, stuid, {expire: 360000 + Date.now()})
    var currrentID = req.cookies[studentauth]
    res.render(__dirname + '/views/student/dashboard', {id: result})
  })
  .catch((err) => {
    console.log(err)
  }) 
 }
});

app.get("/staff/dashboard/",isAuth, (req, res) => {

  var currrentID = req.cookies[staffauth]
  Staff.findById(currrentID)
  .then((result) =>{
    
    res.render(__dirname + '/views/staff/dashboard', {id: result});
  })
    .catch((err) => {
      console.log(err)
    });

});

app.get("/student/dashboard/",stuisAuth, (req, res) => {

  var currrentID = req.cookies[studentauth]
  Student.findById(currrentID)
  .then((result) =>{
    
    res.render(__dirname + '/views/student/dashboard', {id: result});
  })
    .catch((err) => {
      console.log(err)
    });

});


app.get("/staff/create",isAuth, (req, res) => {
  var currrentID = req.cookies[staffauth]
  Staff.findById(currrentID)
  .then((result) =>{
    var dept = result.new_dept
    var finalDept = dept.split(", ")

    let uniqueChars = [...new Set(finalDept)];
    
    var level = result.new_level
    var finalLevel = level.split(", ")

    var course = result.new_course
    var finalCourse = course.split(", ")
    const userName = "user"
    res.render(__dirname + '/views/staff/create', {id: result, cusDept: uniqueChars, cusLevel: finalLevel, cusCourse: finalCourse, userName});
  })
    .catch((err) => {
      console.log(err)
    });
})

app.post('/staff/create', async (req, res)=>{
  var currrentID = req.cookies[staffauth]
  const { course, dept, level, classdate, classtime, descp, email } = req.body
  if(Array.isArray(dept)){
    var newDept = dept.join(', ')
  }else{
    var newDept = dept
  }
 
    const newclass = new Class({course, dept: newDept, level, classdate, classtime, descp, email, unique: currrentID, class_link: uuidV4()});
    newclass.save()
    .then((result) => {
      const userName = "success"
     
        Staff.findById(currrentID)
        .then((result) =>{
          var dept = result.new_dept
          var finalDept = dept.split(", ")

          let uniqueChars = [...new Set(finalDept)];
          console.log(uniqueChars)
      
          var level = result.new_level
          var finalLevel = level.split(", ")
      
          var course = result.new_course
          var finalCourse = course.split(", ")
          res.render(__dirname + '/views/staff/create', {id: result, cusDept: uniqueChars, cusLevel: finalLevel, cusCourse: finalCourse, userName});
        })
        .catch((err) => {
          console.log(err)
        })
      })
      .catch((err) => {
        console.log(err)
      });
});


app.get("/staff/view-class",isAuth, (req, res) => {
  var currrentID = req.cookies[staffauth]
  Class.find({unique: currrentID}).sort({ _id: -1})
  .then((result) =>{
    var datetime = new Date();
    var currentDate = datetime.toISOString().slice(0,10)
    const userName = "user"
    res.render(__dirname + '/views/staff/view-class', {output: result, userName, currentDate});
  })
    .catch((err) => {
      console.log(err)
    });
})


app.get("/student/view-class",stuisAuth, (req, res) => {
  var currrentID = req.cookies[studentauth]
  Student.findById(currrentID)
  .then((result) =>{
    var dept = result.dept
    var level = result.level
    var datetime = new Date();
    var currentDate = datetime.toISOString().slice(0,10)
    const userName = "user"
    Class.find({$text: {$search: dept}, level: level})
    .then((result2) =>{
    console.log(result2)
      res.render(__dirname + '/views/student/view-class', {output: result2, userName, currentDate});

  })
  .catch((err) => {
    console.log(err)
  });
  })
    .catch((err) => {
      console.log(err)
    });
})

app.get("/student/class/:room", stuisAuth, (req, res) => {

 
  const room = req.params.room;
  var currrentID = req.cookies[studentauth]
  Student.findOne({ _id: currrentID })
  .then((result) =>{
    Class.findOne({ class_link: room })
    .then((result2) =>{
      res.render(__dirname + "/views/staff/room", {roomID: room, course: result2.course, details: result});
    })
    .catch((err) => {
      console.log(err)
    })

  })
  .catch((err) => {
    console.log(err)
  })

});

app.get("/student/room/", stuisAuth, (req, res) => {

  const room = req.query.room;
  res.redirect(`/student/class/${room}`)

});




 app.get("/staff/room/", isAuth, (req, res) => {

    const room = req.query.room;
    res.redirect(`/staff/class/${room}`)
  
 });

 app.get("/staff/class/:room", isAuth, (req, res) => {

 
  const room = req.params.room;
  var currrentID = req.cookies[staffauth]
  Staff.findOne({ _id: currrentID })
  .then((result) =>{
    Class.findOne({ class_link: room })
    .then((result2) =>{
      res.render(__dirname + "/views/staff/room", {roomID: room, course: result2.course, details: result});
    })
    .catch((err) => {
      console.log(err)
    })

  })
  .catch((err) => {
    console.log(err)
  })
 


});

app.delete("/staff/view-class/:id", isAuth, (req, res) => {
 
  const id = req.params.id;
  Class.findByIdAndDelete(id)
   .then((result) =>{
     res.json({redirect: '/staff/view-class'});
   })
   .catch((err) => {
     console.log(err)
   })
 });


io.on("connection", (socket) => {
  socket.on(
      "join-room",
      async (roomId, peerId, userId, name, audio, video) => {
          // add peer details
          await peerUser({
              peerId: peerId,
              name: name,
              audio: audio,
              video: video,
          }).save();
          // add room details
          var roomData = await room.findOne({ roomId: roomId }).exec();
          if (roomData == null) {
              await room({
                  roomId: roomId,
                  userId: userId,
                  count: 1,
              }).save();
              roomData = { count: 0 };
          } else if (roomData.userId == userId) {
              await room.updateOne(
                  { roomId: roomId },
                  { count: roomData.count + 1 }
              );
          }
          socket.join(roomId);
          socket
              .to(roomId)
              .emit(
                  "user-connected",
                  peerId,
                  name,
                  audio,
                  video,
                  roomData.count + 1
              );
          socket.on("audio-toggle", async (type) => {
              await peerUser.updateOne({ peerId: peerId }, { audio: type });
              socket
                  .to(roomId)
                  .emit("user-audio-toggle", peerId, type);
          });
          socket.on("video-toggle", async (type) => {
              await peerUser.updateOne({ peerId: peerId }, { video: type });
              socket
                  .to(roomId)
                  .emit("user-video-toggle", peerId, type);
          });
          // chat
          socket.on("client-send", (data) => {
              socket.to(roomId).emit("client-podcast", data, name);
          });
          socket.on("disconnect", async () => {
              roomData = await room.findOne({ roomId: roomId }).exec();
              await room.updateOne(
                  { roomId: roomId },
                  { count: roomData.count - 1 }
              );
              // remove peer details
              await peerUser.deleteOne({ peerId: peerId });
              socket
                  .to(roomId)
                   .emit(
                      "user-disconnected",
                      peerId,
                      roomData.count - 1
                  );
          });
      }
  );
});


app.get("/logout", (req, res) => {
  res.clearCookie(staffauth)
    res.redirect("/")

});
app.use((req, res) => {
    res.status(404).render("404");
});



server.listen(process.env.PORT || 3030);