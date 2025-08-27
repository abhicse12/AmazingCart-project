exports.PageNotFound=(req, res, next) => {
    res.status(404).render('user/404.ejs', {pageTitle: 'Page Not Found',currentPage:'404'});
}