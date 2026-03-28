export default (req, res, next) => {
    res.locals.title = 'Taipei Date的網站';
    res.locals.pageName = '';
    res.locals.session = req.session;
    res.locals.originalUrl = req.originalUrl;
    next();
};
