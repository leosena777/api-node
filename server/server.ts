import * as restify from 'restify';
import {environment} from '../common/environment';
import {Router} from '../common/router';

export class Server{

    application: restify.Server;

    initRouter( routers: Router[]):Promise<any>{
        return new Promise((resolve, reject)=>{
            try{

                this.application  = restify.createServer({
                    name: 'api-clinica',
                    version: '1.0.0'
                });
                
                this.application.use(restify.plugins.queryParser());
                this.application.use(restify.plugins.bodyParser());

                //Routes
                for( let router of routers){
                    router.applyRoutes(this.application);
                }

                this.application.listen(environment.server.port, ()=>{
                    resolve(this.application);
                });


            }catch(error){
                reject(error);
            }
        });
    }

    bootstrap( routers: Router[] = [] ): Promise<Server>{
        return this.initRouter(routers).then(()=> this );
    }

}