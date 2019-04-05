"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const environment_1 = require("../common/environment");
class Server {
    initRouter() {
        return new Promise((resolve, reject) => {
            try {
                this.application = restify.createServer({
                    name: 'api-clinica',
                    version: '1.0.0'
                });
                this.application.use(restify.plugins.queryParser());
                //Routes
                this.application.get('/teste', (req, resp, next) => {
                    resp.json({
                        message: 'ok'
                    });
                    return next();
                });
                this.application.listen(environment_1.environment.server.port, () => {
                    resolve(this.application);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    bootstrap() {
        return this.initRouter().then(() => this);
    }
}
exports.Server = Server;
