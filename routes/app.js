/*
 * GET app page.
 */

module.exports = function(req, res){
  res.render('app', { title: 'Manage your Debt', page: 'app' });
};
