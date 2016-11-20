const Views = require('./page');
const Query = require('mongo-promise');
const ObjectID = require('mongodb').ObjectID;
const utils = require('../../utils');

class Question extends Views {
  constructor() {
    super('exam', 'dashboard/question', '/?newposts', utils.config.dashboard.exam);
  }

  wrapPosts(docs) {
    let len = docs.length;
    let content = '';

    for(let i = 0; i < len; i++)
    {
      let href = `/exam/${utils.toUrl(docs[i].title)}.${docs[i]._id}`;

      content += `
          <div class="news">
            <p><input type="checkbox" style="display: inline; margin: auto 6px;"><a href="${href}" target="_blank">${docs[i].title}</a></p>
            <small><b style="font-size: 16px">${utils.config.exam.level[docs[i].level]} / ${utils.config.exam.subject[docs[i].subject]}</b></small>
            <div class="tools"><a href="?method=edit&id=${docs[i]._id}">Edit</a>|<a href="?method=delete&id=${docs[i]._id}">Delete</a></div>
          </div>
      `;
    }

    return content;
  }

  renderNewPost(req, res, options) {
    res.render('dashboard/qspost', options || {
      method: 'addnew',
      username: req.session.user.username,
      hash: req.session.hash,
      title: '',
      image: '',
      post_id: 0
    });
  }

  editPost(options, row) {
//    utils.clonewith(row, options, ['title', 'description', 'content', 'image']);
  //  utils.escapeHtml(options, ['title', 'description', 'content', 'image']);
    options.title = 'Game';
    return options;
  }

  delHandle(db, idx) {
    db.remove({exam_id: new ObjectID(idx)}, 'question');
  }

  postHandle(req, res) {
    let POST = req.body;

    if(POST['hash'] !== req.session.hash)
      return res.redirect('/404');

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
              exam_id: result.ops[0]._id,
              content: POST[prefix],
              choice,
              answer: POST[prefix + '_choose']
            });
          }
        });

        db.insert([], 'question', function() {
          return questions;
        });
      }


      return db.close(() => {
        res.redirect('/dashboard/question');
      }, (error) => {
        res.redirect('/dashboard/question');
      });
    }

    return res.end(POST['method']);
  }
}

const router = (new Question()).Router;
module.exports = router;
