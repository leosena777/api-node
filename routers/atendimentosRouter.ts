import { Router } from '../common/router';
import * as restify from 'restify';

class AtendimentosRouter extends Router{
    applyRoutes(appliction: restify.Server){
        appliction.get('/teste',(req,resp,next)=>{
            resp.json({message:'teste router'});
        })
    }
}

export const atendimentosRouter = new AtendimentosRouter();