const express = require('express')
const app = express()

app.use(express.static(__dirname + "/src"))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/src/index.html")
})

app.listen(4444, () => {
    console.log(`Server live at *:4444`)
})