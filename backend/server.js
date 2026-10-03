const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Bearing Condition Monitoring Backend"
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});