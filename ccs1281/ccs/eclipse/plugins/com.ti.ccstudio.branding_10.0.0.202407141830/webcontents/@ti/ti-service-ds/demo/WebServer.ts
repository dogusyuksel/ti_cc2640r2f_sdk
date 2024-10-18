/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import fs from 'fs';   //^ti-service-ds\demo\WebServer.ts,3^
import path from 'path';   //^ti-service-ds\demo\WebServer.ts,4^
import express from 'express';   //^ti-service-ds\demo\WebServer.ts,5^
import bodyParser from 'body-parser';   //^ti-service-ds\demo\WebServer.ts,6^

import { ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';   //^ti-service-ds\demo\WebServer.ts,8^
import { dsServiceType, IDebugCore, debugCoreType } from '../../ti-service-ds/lib/DSService';   //^ti-service-ds\demo\WebServer.ts,9^

const port = 9999;   //^ti-service-ds\demo\WebServer.ts,11^
(async () => {   //^ti-service-ds\demo\WebServer.ts,12^
    /* get the DS Service for target communication */
    const dsService = ServicesRegistry.getService(dsServiceType);   //^ti-service-ds\demo\WebServer.ts,14^

    /* read the ccxml file and the program file */
    const ccxml = fs.readFileSync(path.join(__dirname, '../test/assets/MSP432P401R.ccxml'), 'utf-8');   //^ti-service-ds\demo\WebServer.ts,17^
    const program = fs.readFileSync(path.join(__dirname, '../test/assets/MSP432P401R_Blink.out'));   //^ti-service-ds\demo\WebServer.ts,18^

    /* configure DS service with the ccxml file */
    await dsService.configure(ccxml);   //^ti-service-ds\demo\WebServer.ts,21^

    /* get the first core, connect, and load the program */
    const [core] = await dsService.listCores<IDebugCore>(debugCoreType);   //^ti-service-ds\demo\WebServer.ts,24^
    core.connect();   //^ti-service-ds\demo\WebServer.ts,25^
    await core.loadProgram(program, false);   //^ti-service-ds\demo\WebServer.ts,26^

    /* create an express instance */
    const app = express();   //^ti-service-ds\demo\WebServer.ts,29^

    /* GET route */
    app.get('/msp432', async (req, res) => {   //^ti-service-ds\demo\WebServer.ts,32^
        const blink = await core.readValue('blink');   //^ti-service-ds\demo\WebServer.ts,33^
        const on = await core.readValue('on');   //^ti-service-ds\demo\WebServer.ts,34^
        res.setHeader('Content-Type', 'application/json');   //^ti-service-ds\demo\WebServer.ts,35^
        res.end(JSON.stringify({ blink: blink, on: on }));   //^ti-service-ds\demo\WebServer.ts,36^
    });   //^ti-service-ds\demo\WebServer.ts,37^

    /* POST route */
    app.post('/msp432', bodyParser.json(), async (req, res) => {   //^ti-service-ds\demo\WebServer.ts,40^
        const data = req.body as any;   //^ti-service-ds\demo\WebServer.ts,41^
        const blink = data['blink'];   //^ti-service-ds\demo\WebServer.ts,42^
        if (typeof blink !== 'undefined') {   //^ti-service-ds\demo\WebServer.ts,43^
            await core.writeValue('blink', blink);   //^ti-service-ds\demo\WebServer.ts,44^
        }   //^ti-service-ds\demo\WebServer.ts,45^
        res.end();   //^ti-service-ds\demo\WebServer.ts,46^
    });   //^ti-service-ds\demo\WebServer.ts,47^

    /* start the server */
    app.listen(port, () => {   //^ti-service-ds\demo\WebServer.ts,50^
        console.log(`Server is listening on port: ${ port }`);   //^ti-service-ds\demo\WebServer.ts,51^
    });   //^ti-service-ds\demo\WebServer.ts,52^
})();   //^ti-service-ds\demo\WebServer.ts,53^

