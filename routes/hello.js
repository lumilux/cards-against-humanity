exports.hello = function(req, res){
  res.render('hello', { title: 'Hello' })
};