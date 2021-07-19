const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const compression = require("compression");

const PORT = 5080;

app.use(cors());

//Use Compression(gzip)
app.use(compression({level:9}));

app.use(express.static('client/build'))

app.get('*', (req, res) => {
res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

// Setting up server
app.listen(PORT, () => {
    console.log(`CAP protal is being served on hot and fresh on ${PORT}`);
});





