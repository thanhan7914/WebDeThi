const Views = require('./page');
const Query = require('mongo-promise');
const ObjectID = require('mongodb').ObjectID;
const utils = require('../../utils');

class Ebook extends Views {
  constructor() {
    super('ebook', 'dashboard/ebook', '/?newposts', utils.config.dashboard.ebook);
  }

  wrapPosts(docs) {
    let len = docs.length;
    let content = '';

    for(let i = 0; i < len; i++)
    {
      let href = `/ebook/${utils.toUrl(docs[i].title)}.${docs[i]._id}`;

      content += `
          <div class="news">
            <p><input type="checkbox" style="display: inline; margin: auto 6px;"><a href="${href}" target="_blank">${docs[i].title}</a></p>
            <small><b>${docs[i].description}</b></small>
            <div class="tools"><a href="?method=edit&id=${docs[i]._id}">Edit</a>|<a href="?method=delete&id=${docs[i]._id}">Delete</a></div>
          </div>
      `;
    }

    return content;
  }

  renderNewPost(req, res, options) {
    res.render('dashboard/ebpost', options || {
      method: 'addnew',
      title: '',
      content: '',
      description: '',
      image: '',
      post_id: '',
      username: req.session.user.username,
      hash: req.session.hash
    });
  }

  editPost(options, row) {
    utils.clonewith(row, options, ['title', 'description', 'content', 'image', 'subject', 'level']);
    utils.escapeHtml(options, ['title', 'description', 'content', 'image', 'subject', 'level']);
    return options;
  }

  postHandle(req, res) {
    let POST = req.body;

    if(req.url === '/?newposts')
    {
      if(typeof POST['method'] === 'undefined' && POST['hash'] !== req.session.hash)
        return res.redirect('/dashboard/ebook');

      if(POST['method'] === 'addnew' || POST['method'] === 'edit')
      {
        if(!utils.hasattr(POST, ['title', 'content', 'description', 'image', 'subject', 'level']))
          return res.redirect('/dashboard/ebook');

        let row = {datecreate: Date.now(), dateupdate: Date.now(), author: req.session.user.username};
        utils.clonewith(POST, row, ['title', 'content', 'description', 'image', 'subject', 'level']);
        utils.subject = Number(utils.subject);
        utils.level = Number(utils.level);

        let db = new Query(utils.config.dbname);
        if(POST['method'] === 'addnew')
          db.insert(row, 'ebook');
        else if(POST['method'] === 'edit' && POST['post_id'].length === 24)
        {
          db.find({_id: new ObjectID(POST['post_id'])}, 'ebook')
          .handle((docs) => {
            if(docs.length === 0) throw new Error('Not found');

            row.datecreate = docs[0].datecreate;
          })
          .update({_id: new ObjectID(POST['post_id'])}, row, 'ebook');
        }

        db.close(() => {
          res.redirect('/dashboard/ebook');
        }, (error) => {
          console.log(error);
          res.redirect('/404');
        });
      }
    }
    else
      res.redirect('/dashboard/ebook');
  }
}

const router = (new Ebook()).Router;
module.exports = router;
