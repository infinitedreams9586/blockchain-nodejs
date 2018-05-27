const express = require('express');
const bodyParser = require('body-parser');
const blockChain = require('../blockchain');
const P2Pserver = require('./p2p-server');

const HTTP_PORT = process.env.HTTP_PORT || 3002;


const app = express();
const bc = new blockChain();
const p2pserver = new P2Pserver(bc);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
    res.json(bc.chain);
});

app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);
    p2pserver.syncChains();
    res.redirect('/blocks');
});

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
p2pserver.listen();