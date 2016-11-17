const router = require('express').Router();
const Query = require('mongo-promise');
const ObjectID = require('mongodb').ObjectID;
const querystring = require('querystring');
const utils = require('../../utils');

let newposts = function(req, res, options) {
  res.render('dashboard/qspost', options || {
    method: 'addnew',
    username: req.session.user.username,
    hash: req.session.hash,
    title: '',
    image: '',
    examid: 0
  });
};

router.get('*', function(req, res, next) {
  if(req.url === '/') return next();
  if(req.url === '/?newposts')
    return newposts(req, res);

  let GET = querystring.parse(req.url.substring(2));
  if(typeof GET['page'] !== 'undefined')
  {
    req.body.page = GET['page'];
    return next();
  }
});

router.get('/', function(req, res) {
  let options = {
    username: req.session.user.username,
    hash: req.session.hash
  };

  let count, skip = 0, limit;
  try {
    limit = utils.config.dashboard.exam.limit;
    if(typeof req.body.page !== 'undefined')
      skip = Math.floor((parseInt(req.body.page) - 1) * limit);
    else req.body.page = 1;

    if(skip < 0) skip = 0;
  }catch(e){}

  let db = new Query(utils.config.dbname);
  db.query({}, 'exam')
  .exec('count')
  .handle((c) => {
    count = c;
    if(skip > c) throw new Error('Page not found.');
  })
  .find({}, 'exam', {sort: {datecreate: -1}, skip, limit})
  .handle((docs) => {
    //query
    let len = docs.length;
    options.pages = Math.ceil(count / limit);
    options.curpage = req.body.page;
    options.count_exam = (len + skip) + '/' + count;
    options.exams = '';

    for(let i = 0; i < len; i++)
    {
      let href = `/exam/${utils.toUrl(docs[i].title)}.${docs[i]._id}`;

      options.exams += `
          <div class="news">
            <p><input type="checkbox" style="display: inline; margin: auto 6px;"><a href="${href}" target="_blank">${docs[i].title}</a></p>
            <small><b style="font-size: 16px">${utils.config.exam.level[docs[i].level]} / ${utils.config.exam.subject[docs[i].subject]}</b></small>
            <div class="tools"><a href="?method=edit&id=${docs[i]._id}">Edit</a>|<a href="?method=delete&id=${docs[i]._id}">Delete</a></div>
          </div>
      `;
    }
  })
  .close((done) => {
    res.render('dashboard/question', options);
  }, (error) => {
    console.log(error);
    res.redirect('/404');
  });
});

router.post('/', function(req, res) {
  let POST = req.body;

  if(POST['method'] === 'addnew')
  {
    let exam = {
      title: POST['title'],
      subject: Number(POST['level']),
      level: Number(POST['level']),
      type: Number(POST['type']),
      year: Number(POST['year']),
      image: POST['image'],
      datecreate: Date.now(),
      dateupdate: Date.now()
    };

    let questions = [];

    if(exam.type === 1)
    {
      exam.question_file = POST['info'];
      exam.answer_file = POST['answer'];
    }
    else
    {
      //so luong cau hoi
      exam.count = Number(POST['info']);
    }

    let db = new Query(utils.config.dbname);
    db.insert(exam, 'exam');

    if(exam.type === 0)
    {
      db.handle((result) => {
        for(let i = 0; i < exam.count; i++)
        {
          let prefix = 'question_' + i;
          let n_answer = Number(POST[prefix + '_n_answer']);
          let choice = [];
          for(let j = 0; j < n_answer; j++)
            choice.push(POST[prefix + '_answer_' + j])

          questions.push({
            exam_id: result[0].insertedIds,
            content: POST[prefix],
            choice,
            answer: POST[prefix + '_choose']
          });
        }
      });

      db.insert(questions, 'question');
    }


    return db.close(() => {
      res.redirect('/dashboard/question');
    }, (error) => {
      res.redirect('/dashboard/question');
    });
  }

  return res.redirect('/dashboard/question');
});

module.exports = router;
