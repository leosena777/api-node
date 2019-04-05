"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../common/router");
const fs = require("fs");
class AtendimentosRouter extends router_1.Router {
    constructor() {
        super(...arguments);
        this.pathRegras = "./data/regrasDeAtendimento.json";
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
            var dataInicial = req.body.data_inicial.split('-');
            var dataFinal = req.body.data_final.split('-');
            dataInicial = new Date(dataInicial[2] + '-' + dataInicial[1] + '-' + dataInicial[0]);
            dataFinal = new Date(dataFinal[2] + '-' + dataFinal[1] + '-' + dataFinal[0]);
            var filtroRegras = [];
            this.regras.forEach(regra => {
                var dataValor = regra.valor.split('-');
                dataValor = new Date(dataValor[2] + '-' + dataValor[1] + '-' + dataValor[0]);
                if (dataValor != "Invalid Date") {
                    if (regra.tipo == "dia" && dataValor <= dataFinal && dataValor >= dataInicial) {
                        let existe = false;
                        console.log(filtroRegras);
                        filtroRegras.forEach((filtroTeste, index) => {
                            if (filtroTeste != undefined && filtroTeste.day == regra.valor) {
                                existe = index;
                                return;
                            }
                        });
                        //existe esse dia
                        if (existe !== false) {
                            filtroRegras[existe].intervals.push({ start: regra.horario_inicio, end: regra.horario_fim });
                        }
                        else if (existe === false) {
                            //não existe esse dia
                            var filtrado = {};
                            filtrado.day = regra.valor;
                            filtrado.intervals = [];
                            filtrado.intervals.push({ start: regra.horario_inicio, end: regra.horario_fim });
                            filtroRegras.push(filtrado);
                        }
                    }
                }
            });
            resp.json(filtroRegras);
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
