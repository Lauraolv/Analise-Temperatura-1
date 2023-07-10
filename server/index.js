const express = require('express');
const app = express();
const cors = require('cors');

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true);
    next();
  });
  app.use(express.json());
  app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );

// A rota app.get('/', ...) é definida, indicando que esse código será executado quando uma solicitação GET for feita 
app.get('/', (req,res) => {    
    let array = [];
    for(let i = 0; i < 32; i++)
    {
        array[i] = [];
        for(let j = 0; j < 128; j++)
            array[i][j] = j;
    }
    res.send(array); // o array preenchido é enviado como resposta para a solicitação GET
});

app.listen(3001, () => {
    console.log('running on port 3001')
});