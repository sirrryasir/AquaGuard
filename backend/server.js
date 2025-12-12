const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
const ussdRoutes = require('./routes/ussd');
const apiRoutes = require('./routes/api');

app.use('/ussd', ussdRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('AquaGuard Backend Running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
