
const express = require('express');
const express_queue = require('express-queue');

const app = express();

app.use(express_queue({ activeLimit: 1, queuedLimit: -1 }));

app.post('/ingest', async (req, res) => {
    res.send('Hello World!');
});

app.listen(9000,"0.0.0.0");