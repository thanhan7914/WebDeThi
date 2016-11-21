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
    utils.clonewith(row, options, ['title', 'image']);
    utils.escapeHtml(options, ['title', 'image']);
    let hinfo = {};
    utils.clonewith(row, hinfo, ['subject', 'level', 'type', 'year', 'answer_file']);
    options.hinfo = JSON.stringify(hinfo);
    options.info = row.type === 0?row.count:row.question_file;
    options.question = '';

    let db = new Query(utils.config.dbname)
    .find({exam_id: new ObjectID(row._id)}, 'question')
    .handle((docs) => {
      let letter = 'ABCDEFGHIJKLM';

      docs.forEach((doc, i) => {
        let choice = '';
        for(let j = 0; j < doc.choice.length; j++)
        {
          let choose = Number(doc.answer) === j ? 'checked' : '';

          choice += `
            <span>${letter[j]}.</span> <input type="radio" name="question_${i}_choose" value="${j}" ${choose}>
            <input type="text" name="question_${i}_answer_${j}" value="${doc.choice[j]}">
          `;
        }

        options.question +=`
        <div class="form-group">
          <strong>Question ${i + 1}:</strong>
          <textarea class="form-control" name="question_${i}" rows="4">${doc.content}</textarea>
          <span>Answer: </span>
          <div style="margin: 6px 8px; display: inline-block;" class="answer">
            <input type="hidden" name="question_${i}_id" value="${doc._id}">
            <input type="hidden" name="question_${i}_n_answer" value="${doc.choice.length}">
            ${choice}
          </div>
          <span class="add_answer">+</span>
          <span class="remove_answer">-</span>
        </div>
        `;
      });
    });

    return db.line.then(() => {
      db.close();
      return Promise.resolve(true);
    });
  }

  delHandle(db, idx) {
    db.remove({exam_id: new ObjectID(idx)}, 'question');
  }

  postHandle(req, res) {
    let POST = req.body;
    let mode = 0;

    if(POST['hash'] !== req.session.hash)
      return res.redirect('/404');

    if(POST['method'] === 'edit' && String(POST['examid']).length === 24)
      mode = 2;
    else if(POST['method'] == 'addnew')
      mode = 1;

    if(mode > 0)
    {
      let exam = {
        title: POST['title'],
        subject: Number(POST['subject']),
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

      let db = new Query(utils.config.dbname, true);
      if(mode === 2)
        db.update({_id: new ObjectID(POST['examid'])}, exam, 'exam');
      else
        db.insert(exam, 'exam');

      if(exam.type === 0)
      {
        let exid;

        db.handle((result) => {
          exid = new ObjectID(mode === 2? POST['examid'] : result.ops[0]._id);

          for(let i = 0; i < exam.count; i++)
          {
            let prefix = 'question_' + i;
            let n_answer = Number(POST[prefix + '_n_answer']);
            let choice = [];
            for(let j = 0; j < n_answer; j++)
              choice.push(POST[prefix + '_answer_' + j]);

            let qrow = {
              exam_id: exid,
              content: POST[prefix],
              choice,
              answer: Number(POST[prefix + '_choose'])
            };

            questions.push(qrow);
          }
        });

        if(mode === 2)
          db.remove({}, 'question', () => {
            return [{exam_id: exid}];
          });

        db.insert([], 'question', function() {
          return [questions];
        });
      }


      return db.close(() => {
        res.redirect('/dashboard/question');
      }, (error) => {
        res.end(error);
      });
    }

    return res.end(POST['method']);
  }
}

const router = (new Question()).Router;
module.exports = router;
