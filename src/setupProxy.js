const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/dev",
        createProxyMiddleware({
            target: "http://127.0.0.1:80",
            changeOrigin: true,
            pathRewrite: (path, req) => {
                const newPath = "/dev" + path;
                console.log(
                    `[Proxy] Rewriting path from "${path}" to "${newPath}"`
                );
                return newPath;
            },
            logLevel: "debug",
        })
    );
};
