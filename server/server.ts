import * as restify from 'restify';
import {environment} from '../common/environment';

export class Server{

    application: restify.Server;

    initRouter():Promise<any>{
        return new Promise((resolve, reject)=>{
            try{

                this.application  = restify.createServer({
                    name: 'api-clinica',
                    version: '1.0.0'
                });
                
                this.application.use(restify.plugins.queryParser());

                //Routes
                this.application.get('/teste', (req,resp,next)=>{
                    resp.json({                        
                        message:'ok'                        
                    });
                  return next();  
                
                }
                );

                this.application.listen(environment.server.port, ()=>{
                    resolve(this.application);
                });


            }catch(error){
                reject(error);
            }
        });
    }

    bootstrap(): Promise<Server>{
        return this.initRouter().then(()=> this );
    }

}