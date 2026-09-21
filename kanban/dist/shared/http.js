export function redirect(url, status = 302) {
    return { redirectTo: url, status };
}
export function respond(res, result) {
    if ('redirectTo' in result) {
        res.redirect(result.status ?? 302, result.redirectTo);
        return;
    }
    res.status(result.status).render(result.view, result.locals);
}
