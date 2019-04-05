"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../common/router");
const fs = require("fs");
class AtendimentosRouter extends router_1.Router {
    constructor() {
        super(...arguments);
        this.pathRegras = "./data/regras.json";
        this.regras = {};
    }
    applyRoutes(appliction) {
        //Leitura de regras.json
        fs.readFile(this.pathRegras, "utf8", (err, data) => {
            if (err) {
                return console.log(err.message);
            }
            var jsonData = JSON.parse(data); // faz o parse para json                   
            this.regras = jsonData;
        });
        //Cadastrar regras de horários para atendimento
        appliction.post('/regras', (req, resp, next) => {
            var ultimoElemento = this.regras[this.regras.length - 1];
            console.log(ultimoElemento);
            var data;
            data = req.body;
            data.id = ultimoElemento.id != undefined ? ultimoElemento.id + 1 : 1; // id auto increment
            if (ultimoElemento.id != undefined) {
                this.regras.push(data);
            }
            else {
                this.regras = [data];
            }
            if (this.saveRegras()) {
                resp.json({ message: 'Regra adicionada com sucesso' });
            }
        });
        //Apagar regra de horário para atendimento
        appliction.post('/regras/:id', (req, resp, next) => {
            this.regras = this.regras.filter(function (jsonObject) {
                return jsonObject['id'] != req.params.id;
            });
            if (this.saveRegras()) {
                resp.json({ message: 'Regra deletada com sucesso' });
            }
        });
        // Listar regras de horários para atendimento
        appliction.get('/regras', (req, resp, next) => {
            resp.json(this.regras);
        });
        // Listar horários disponíveis dentro de um intervalo
        appliction.post('/horarios', (req, resp, next) => {
            resp.json({ message: 'listar horarios' });
        });
    }
    saveRegras() {
        fs.writeFile(this.pathRegras, JSON.stringify(this.regras), (err) => {
            if (err)
                throw err;
        });
        return true;
    }
}
exports.atendimentosRouter = new AtendimentosRouter();
