/*
 * GET home page.
 */

module.exports = function(req, res){
  res.render('home', { title: 'Homepage', page: 'home' });
};
