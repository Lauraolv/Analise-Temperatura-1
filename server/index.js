
const express = require('express');
const cors = require('cors');
const fs = require('fs');


var SerialPort = require('serialport');
const { time } = require('console');
const parsers = SerialPort.parsers;

var dataFromArduino;

const parser = new parsers.Readline({
    delimiter: '\r\n'
});

/*
var port = new SerialPort('COM22',{ 
    baudRate: 200000,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});
*/
const port = new SerialPort('COM22', { baudRate: 2000000 });


port.pipe(parser);



const app = express();

let controle = 0;

app.use(cors());
app.use(express.json());

parser.on('data', function(data) {

    //console.log(data);
    
    //console.log('Received data from porta: ' + data); 
    

    fileStream = fs.createWriteStream(`Data (JSON)/${"Dados_Sensor"}.json`, { flags: 'a' });
    //fileStream1 = fs.createWriteStream(`Data (JSON)/${"Interpolado"}.json`, { flags: 'a' });

   


    //console.log(jsonData)

    //fileStream.write(jsonData);



    const startTime = performance.now();

    
    const listaData = data.split(",")

    const matrixData = [];

    for (let i = 0; i < listaData.length; i += 16) 
    {
        const subArr = listaData.slice(i, i + 16);
        matrixData.push(subArr);
    }


    const matrixInterpolada = interpolateMatrix(matrixData)



    dataFromArduino = matrixInterpolada;

    // Gambiarra pq a primeira info sempre vem zuada dai pego so a partir da 20 dps que o programa comecou
    if (controle > 20)
    {
      let jsonData = JSON.parse("[" + data + "]");

      console.log(jsonData)

      const outputData = JSON.stringify(jsonData);
      //const outputData2 = JSON.stringify(matrixInterpolada);

      if (controle == 21) 
      {
        fileStream.write(`[${outputData}`);
        //fileStream1.write(`[${outputData2}`);

      } 
      else 
      {
        fileStream.write(`,\n${outputData}`);
        //fileStream2.write(`,\n${outputData2}`);

      }

    }
    controle ++;

    const endTime = performance.now();

    const elapsedTime = endTime - startTime;

    //console.log(`The task took ${elapsedTime} milliseconds to complete.`);

});

//var file = fs.createWriteStream("file_name");


function interpolateMatrix(matrix4x16) {
    // Define the dimensions of the input and output matrices
    const inputRows = matrix4x16.length;
    const inputCols = matrix4x16[0].length;
    const outputRows = 32;
    const outputCols = 128;
  
    // Define the row and column ratios between input and output matrices
    const rowRatio = outputRows / inputRows;
    const colRatio = outputCols / inputCols;
  
    // Create an empty output matrix
    const matrix32x128 = new Array(outputRows);
    for (let i = 0; i < outputRows; i++) {
      matrix32x128[i] = new Array(outputCols);
    }
  
    // Interpolate the matrix
    for (let i = 0; i < outputRows; i++) {
      for (let j = 0; j < outputCols; j++) {
        const x = i / rowRatio;
        const y = j / colRatio;
  
        const i1 = Math.floor(x);
        const i2 = Math.min(i1 + 1, inputRows - 1);
        const j1 = Math.floor(y);
        const j2 = Math.min(j1 + 1, inputCols - 1);
  
        const q11 = parseFloat(matrix4x16[i1][j1]);
        const q12 = parseFloat(matrix4x16[i1][j2]);
        const q21 = parseFloat(matrix4x16[i2][j1]);
        const q22 = parseFloat(matrix4x16[i2][j2]);
  
        const x1 = parseFloat(i1);
        const x2 = parseFloat(i2);
        const y1 = parseFloat(j1);
        const y2 = parseFloat(j2);
  
        let f1 = parseFloat((x2 - x) / (x2 - x1) * q11 + (x - x1) / (x2 - x1) * q21);

        if (isNaN(f1))
        {
            f1 = parseFloat((q11+q21)/2)
        }

        let f2 = parseFloat((x2 - x) / (x2 - x1) * q12 + (x - x1) / (x2 - x1) * q22);

        if (isNaN(f2))
        {
            f2 = parseFloat((q12+q22)/2)
        }
     
        let f = (y2 - y) / (y2 - y1) * f1 + (y - y1) / (y2 - y1) * f2;

        if (isNaN(f))
        {
            f = (f1+f2)/2
        }

        matrix32x128[i][j] = f.toFixed(2);
      }
    }  
    return matrix32x128;
  }






app.get('/', (req, res) => {
    res.json({ message: dataFromArduino});
});   


app.listen(3001, () => {
    console.log(`Server is running on port 3001.`);
  });