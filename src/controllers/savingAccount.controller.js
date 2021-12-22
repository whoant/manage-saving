class SavingAccountController {
    index(req, res, next) {
        res.render('savingAccount/index');
    }
}

module.exports = new SavingAccountController();
