const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const Todo = require('./models/todos');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var task;
mongoose
  .connect(
    'mongodb+srv://rishav:2799@cluster0.lj9gs.mongodb.net/todoApp?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  )
  .then(() => {
    console.log('DB CONNECTED');
  });

app.get('/', (req, res) => {
  Todo.find({}, (err, todos) => {
    if (err) console.log('SOME ERROR OCCURED TO LOAD TODO LIST');
    else {
      res.render('list', { todos });
    }
  });
});

app.get('/add', (req, res) => {
  res.render('add');
});

const addMinutes = (mins) => {
  let currentDate = new Date(Date.now());
  const futureDate = {
    second: currentDate.getSeconds(),
    minutes: currentDate.getMinutes(),
    hours: currentDate.getHours(),
    day: currentDate.getDate(),
    month: currentDate.getMonth(),
  };
  console.log(futureDate);
  futureDate.minutes += mins;

  if (futureDate.minutes > 59) {
    futureDate.hours += parseInt(futureDate.minutes / 60);
    futureDate.minutes = futureDate.minutes % 60;
  }
  if (futureDate.hours > 23) {
    futureDate.day += parseInt(futureDate.hours / 24);
    futureDate.hours = futureDate.hours % 24;
  }
  if (futureDate.day > 31) {
    futureDate.month += parseInt(futureDate.day / 31);
    futureDate.day = futureDate.day % 31;
  }

  return futureDate;
};

app.post('/add', (req, res) => {
  try {
    const duration = parseInt(req.body.duration);
    console.log('Duration Given ', duration);
    const currentDate = new Date(Date.now());
    const cronDate = addMinutes(duration);
    const { minutes, hours, second, day, month } = cronDate;

    console.log(cronDate, 'expected delete time');
    new Todo({
      todoName: req.body.todoName,
      todoDescription: req.body.todoDescription,
      name: req.body.name,
      duration: req.body.duration,
    }).save((err, doc) => {
      if (err) console.log(err);
      else {
        console.log('saves success. Doc ID = ', doc._id);
        let documentId = doc._id;
        task = cron.schedule(
          `0 */${minutes} */${hours} * * *`,
          () => {
            let currentDate = new Date(Date.now());
            const futureDate = {
              second: currentDate.getSeconds(),
              minutes: currentDate.getMinutes(),
              hours: currentDate.getHours(),
              day: currentDate.getDate(),
              month: currentDate.getMonth(),
            };

            console.log('Task runing at ', futureDate);
            Todo.findByIdAndRemove(documentId, (err1, docs) => {
              if (err1) console.log(err1);
              else {
                console.log('deleted successfully, ID = ', docs);
                task.stop();
              }
            });
          },
          {
            scheduled: true,
            timezone: 'Asia/Kolkata',
          }
        );

        res.redirect('/');
      }
    });
  } catch (error) {
    console.log(error);
  }
});

const port = process.env.PORT || 8001;

app.listen(port, () => {
  console.log(`SERVER IS RUNNING TO PORT ${port}`);
});
