/*
 * GET FAQ page.
 */

module.exports = function(req, res){
  res.render('faq', { title: 'Frequently Asked Questions', page: 'faq' });
};
