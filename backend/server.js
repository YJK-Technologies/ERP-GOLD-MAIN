

// app.js
const express = require("express");
const cors = require("cors");
const dataRoutes = require("./routes/dataRoutes");
const app = express();
const PORT = 5499;

app.use(cors());
app.use(express.json());

app.use("/", dataRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




// const express = require("express");
// const cors = require("cors");
// const dataRoutes = require("./routes/dataRoutes");
// const fs = require("fs");
// const https = require("https");
// const path = require("path");

// const app = express();
// const PORT = 5500;


// app.use(cors());
// app.use(express.json());


// app.use("/", dataRoutes);


// const sslOptions = {
//   key: fs.readFileSync(path.resolve("D:/YJK Technologies/YJKDEV/React/YJKerp/backend/SSL", "Private_Key.pem")), 
//   cert: fs.readFileSync(path.resolve("D:/YJK Technologies/YJKDEV/React/YJKerp/backend/SSL", "STAR_yjktechnologies.pem")), 
//   ca: fs.readFileSync(path.resolve("D:/YJK Technologies/YJKDEV/React/YJKerp/backend/SSL", "Inter_certificate.pem")), 
// };



// https.createServer(sslOptions, app).listen(PORT, () => {
//   console.log(`HTTPS server is running on https://STAR_yjktechnologies:${PORT}`);
// });


