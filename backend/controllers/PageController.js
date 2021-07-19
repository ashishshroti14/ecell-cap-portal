exports.redirectHome = async (req,res) => {
  res.redirect('/home');
}

exports.home = async (req, res) => {
  res.render('index');
}
exports.team = async (req, res) => {
  res.render('team');
}
exports.sponsors = async (req, res) => {
  res.render('sponsors');
}
exports.edd = async (req, res) => {
  res.render('edd');
}
exports.eupdates = async (req, res) => {
  res.render('eupdates');
}
exports.ideathon = async (req, res) => {
  res.render('IDEAthon');
}
exports.plandemic = async (req, res) => {
  res.render('PLANdemic');
}
exports.pankh = async (req, res) => {
  res.render('Pankh');
}
exports.teambuildingforum = async (req, res) => {
  res.render('teamBuildingForum');
}
exports.startupseries = async (req, res) => {
  res.render('startupSeries');
}
exports.startupSeriesRegistration = async (req, res) => {
  res.render('startupSeriesRegistration');
}
exports.blogs = async (req, res) => {
  res.render('blogs');
}
exports.blogpost = async (req, res) => {
  res.render('./blogpost/post-' + req.params.num);
}
exports.Cap = async (req, res) => {
  res.render('CAP');
}
exports.teamUp = async (req, res) => {
  res.render('teamUp');
}
exports.e21 = async (req, res) => {
  res.render('e21');
}
exports.amResult = async (req, res) => {
  res.render('amResult');
}