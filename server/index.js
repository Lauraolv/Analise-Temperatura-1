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
app.get("/", (req, res) => {
  let array1 = [];
  let array2 = [];
  let resArray;
  let auxArray = [];

  for (let i = 0; i < 32; i++) 
  {
    for (let j = 0; j < 128; j++) 
    {
      auxArray.push(j);
    }

    array1.push(auxArray);
    auxArray = [];
  }

  for (let i = 0; i < 32; i++)
  {
    for (let j = 0; j < 128; j++) 
    {
      auxArray.push(127 - j);
    }

    array2.push(auxArray);
    auxArray = [];
  }

  if (Math.floor(Math.random() * 2) === 0)  // Math.random retorna um decimal aleatório entre 0 e 1
    resArray = array1;
  else
    resArray = array2;

  res.send(resArray); // um dos arrays preenchidos é enviado como resposta para a solicitação GET
});

app.listen(3001, () => {
    console.log('running on port 3001')
});