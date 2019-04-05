"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../common/router");
class AtendimentosRouter extends router_1.Router {
    applyRoutes(appliction) {
        appliction.get('/teste', (req, resp, next) => {
            resp.json({ message: 'teste router' });
        });
    }
}
exports.atendimentosRouter = new AtendimentosRouter();
