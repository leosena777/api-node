"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../common/router");
const fs = require("fs");
const moment = require("moment");
class AtendimentosRouter extends router_1.Router {
    constructor() {
        super(...arguments);
        this.pathRegras = "./data/regrasDeAtendimento.json";
        this.regras = {};
    }
    applyRoutes(appliction) {
        moment().format();
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
            var error = false;
            var messageError = [];
            switch (req.body) {
                case '':
                case undefined:
                    error = true;
                    return resp.json({
                        message: "Não foi possível processar a requisição"
                    });
                    break;
                default:
                    if (req.body.tipo == undefined) {
                        error = true;
                        messageError.push('tipo');
                    }
                    if (req.body.tipo != 'diariamente') {
                        if (req.body.valor == undefined) {
                            error = true;
                            messageError.push('valor');
                        }
                    }
                    if (req.body.horario_inicio == undefined) {
                        error = true;
                        messageError.push('horario inicial');
                    }
                    if (req.body.horario_fim == undefined) {
                        error = true;
                        messageError.push('horario final');
                    }
            }
            if (error === true) {
                return resp.json({
                    message: 'Você precisa definir um ' + messageError.join(', ')
                });
            }
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
            var error = false;
            var messageError = [];
            switch (req.params) {
                case '':
                case undefined:
                    error = true;
                    return resp.json({
                        message: "Não foi possível processar a requisição"
                    });
                    break;
                default:
                    if (req.params.id == undefined) {
                        error = true;
                        messageError.push('id');
                    }
            }
            if (error === true) {
                return resp.json({
                    message: 'Você precisa definir um ' + messageError.join(', ')
                });
            }
            var total = this.regras.length;
            this.regras = this.regras.filter(function (jsonObject) {
                return jsonObject['id'] != req.params.id;
            });
            if (total == this.regras.length) {
                return resp.json({
                    message: 'esta regra não existe'
                });
            }
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
            var error = false;
            var messageError = [];
            switch (req.body) {
                case '':
                case undefined:
                    error = true;
                    return resp.json({
                        message: "Não foi possível processar a requisição"
                    });
                    break;
                default:
                    if (req.body.data_inicial == undefined) {
                        error = true;
                        messageError.push('data inicial');
                    }
                    if (req.body.data_final == undefined) {
                        error = true;
                        messageError.push('data final');
                    }
            }
            if (error === true) {
                return resp.json({
                    message: 'Você precisa definir um ' + messageError.join(', ')
                });
            }
            var dataInicial = req.body.data_inicial.split('-');
            var dataFinal = req.body.data_final.split('-');
            dataInicial = new Date(dataInicial[2] + '-' + dataInicial[1] + '-' + dataInicial[0]);
            dataFinal = new Date(dataFinal[2] + '-' + dataFinal[1] + '-' + dataFinal[0]);
            var filtroRegras = [];
            this.regras.forEach(regra => {
                switch (regra.tipo) {
                    case 'diariamente':
                        // diariamente                           
                        var mInicial = moment(dataInicial);
                        var mFinal = moment(dataFinal);
                        var diffDays = mFinal.diff(mInicial, 'days');
                        for (var i = 1; i <= diffDays + 1; i++) {
                            var newDate = mInicial.clone();
                            newDate.add(i, 'days');
                            var dataFormata = newDate.format('DD-MM-YYYY');
                            var existe = false;
                            filtroRegras.forEach((filtroTeste, index) => {
                                if (filtroTeste != undefined && filtroTeste.day == dataFormata) {
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
                                filtrado.day = newDate.format('DD-MM-YYYY');
                                filtrado.intervals = [];
                                filtrado.intervals.push({ start: regra.horario_inicio, end: regra.horario_fim });
                                filtroRegras.push(filtrado);
                            }
                        }
                        break;
                    case 'semanalmente':
                        // diariamente                           
                        var mInicial = moment(dataInicial);
                        var mFinal = moment(dataFinal);
                        var diffDays = mFinal.diff(mInicial, 'days');
                        var semana = [];
                        semana[1] = 'segunda';
                        semana[2] = 'terca';
                        semana[3] = 'quarta';
                        semana[4] = 'quinta';
                        semana[5] = 'sexta';
                        semana[6] = 'sabado';
                        semana[0] = 'domingo';
                        for (var i = 1; i <= diffDays + 1; i++) {
                            var newDate = mInicial.clone();
                            newDate.add(i, 'days');
                            if (regra.valor.indexOf(semana[newDate.day()]) != -1) {
                                var dataFormata = newDate.format('DD-MM-YYYY');
                                var existe = false;
                                filtroRegras.forEach((filtroTeste, index) => {
                                    if (filtroTeste != undefined && filtroTeste.day == dataFormata) {
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
                                    filtrado.day = newDate.format('DD-MM-YYYY');
                                    filtrado.intervals = [];
                                    filtrado.intervals.push({ start: regra.horario_inicio, end: regra.horario_fim });
                                    filtroRegras.push(filtrado);
                                }
                            }
                        }
                        break;
                    case 'dia':
                        // dia                    
                        var dataValor = regra.valor.split('-');
                        dataValor = new Date(dataValor[2] + '-' + dataValor[1] + '-' + dataValor[0]);
                        if (dataValor != "Invalid Date") {
                            if (regra.tipo == "dia" && dataValor <= dataFinal && dataValor >= dataInicial) {
                                let existe = false;
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
                        break;
                    default:
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
