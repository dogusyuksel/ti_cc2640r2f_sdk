/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';
import { dsServiceType, debugCoreType } from '../../ti-service-ds/lib/DSService';
const port = 9999;
(async () => {
    /* get the DS Service for target communication */
    const dsService = ServicesRegistry.getService(dsServiceType);
    /* read the ccxml file and the program file */
    const ccxml = fs.readFileSync(path.join(__dirname, '../test/assets/MSP432P401R.ccxml'), 'utf-8');
    const program = fs.readFileSync(path.join(__dirname, '../test/assets/MSP432P401R_Blink.out'));
    /* configure DS service with the ccxml file */
    await dsService.configure(ccxml);
    /* get the first core, connect, and load the program */
    const [core] = await dsService.listCores(debugCoreType);
    core.connect();
    await core.loadProgram(program, false);
    /* create an express instance */
    const app = express();
    /* GET route */
    app.get('/msp432', async (req, res) => {
        const blink = await core.readValue('blink');
        const on = await core.readValue('on');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ blink: blink, on: on }));
    });
    /* POST route */
    app.post('/msp432', bodyParser.json(), async (req, res) => {
        const data = req.body;
        const blink = data['blink'];
        if (typeof blink !== 'undefined') {
            await core.writeValue('blink', blink);
        }
        res.end();
    });
    /* start the server */
    app.listen(port, () => {
        console.log(`Server is listening on port: ${port}`);
    });
})();
//# sourceMappingURL=WebServer.js.map