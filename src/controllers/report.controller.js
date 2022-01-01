class ReportController {
    index(req, res, next) {
        res.render('report/index');
    }
}

module.exports = new ReportController();