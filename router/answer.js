const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const Query = require('mongo-promise');
const utils = require('../utils');
const querystring = require('querystring');

router.get('/', function(req, res) {
  if(String(req.url).startsWith('/?'))
  {
    let GET = querystring.parse(req.url.substring(2));
    let hash = utils.createHash(req.session.hex + '_' + GET['t']);
    if(hash !== req.session.hscore)
      return res.redirect('/404');

    let t = GET['t'];
    let options = {};
    let id = '';
    try {
      id = new ObjectID(t.substring(t.indexOf('_') + 1));
    }catch(e){}

    let db = new Query(utils.config.dbname)
    .find({_id: id}, 'exam')
    .handle((rows) => {
      if(rows.length !== 1) throw new Error('Not Found');
      utils.clonewith(rows[0], options, ['title', 'subject', 'level', 'type', 'year', 'count']);
    })
    .find({}, 'question', {}, (a, b) => {
      return [{exam_id: id}, {}, false];
    })
    .handle((rows) => {
      options.questions = '';
      let letter = 'ABCDEFGHIJ';

      rows.forEach((row, idx) => {
        let choice = '';

        for(let i = 0; i < row.choice.length; i++)
          choice += `
            <div class="da">
              <span class="rd">
                <input type="radio" ${row.answer===i?'checked="checked"':''} id="question_${idx}_pos_${i}" name="question_${idx}" value="${i}">
                <label for="question_${idx}_pos_${i}">${letter[i]}. ${row.choice[i]}</label>
              </span>
            </div>
          `;

        options.questions += `
        <div class="row col-md-12 box-question">
          <div class="col-md-1 nex-right">
            <div class="stt-left">
              <span class="stt-ch" data-id="${row._id}">${idx + 1}</span><!-- câu số mấy tại đây-->
            </div>
          </div>
          <div class="col-md-11 cont-left">
            <div class="nd-ch">
              <p>
                ${row.content}
              </p>
              <hr>
            </div>
            <div class="nd-da">
              <div class="row">
                <div class="col-md-3">
                  <p style="color:#565656">
                    Chọn câu trả lời đúng!
                  </p>
                </div>
                <div class="col-md-9">
                  ${choice}
                </div>
              </div>
            </div>
          </div>
        </div>
        `;
      });
    })
    .close((done)=> {
      res.render('answer', options);
    }, (error) => {
      console.log(error);
      res.redirect('/404');
    });
  }
  else
    return res.redirect('/404');
});

module.exports = router;
