import { useState, useEffect } from 'react';
import { tempToColor } from 'temp-color';
import './App.css';

function App() {

  const [tempMediaGeral, setTempMediaGeral] = useState();
  const [tempMediaSelec, setTempMediaSelec] = useState();

  const [dadosInterpolados, setDadosInterpolados] = useState([]);

  const [tempMin, setTempMin] = useState(0);
  const [tempMax, setTempMax] = useState(127);

  const [selected, setSelected] = useState([]);

  const [shiftPressed, setShiftPressed] = useState(false);
  const [lastClick, setLastClick] = useState(null);

  function numberToRGB(array, tMin, tMax)
  {
    const arrayRGB = [];
    for (let row of array)
    {
      const rowRGB = [];
      for (let element of row)
      {
        rowRGB.push(tempToColor(parseInt(element), parseInt(tMin), parseInt(tMax)));  
                    // Retorna objeto de três inteiros representando à cor em formato RGB
      }
      arrayRGB.push(rowRGB);
    }
    return arrayRGB;
  }

  function calculateMediaGeral(array)
  {
    let media = 0;
    for (let row of array)
    {
      for (let element of row)
        media += parseInt(element);
    }
    return media/(array.length * array[0].length);
  }

  function calculateMediaSelec(tempMatrix)
  {
    let media = 0;
    for(let element of selected)
      media += tempMatrix[element.row][element.column];
    return media/selected.length;
  }

  function isSelected(row, column)
  {
    for (let element of selected)
    {
      if (element.row === row && element.column === column) 
        return true;
    }
    return false;
  }

  function selectInterval(start, end) 
  {    
    const startRow = Math.min(start.row, end.row);
    const endRow = Math.max(start.row, end.row);
    const startColumn = Math.min(start.column, end.column);
    const endColumn = Math.max(start.column, end.column);
  
    for (let Row = startRow; Row <= endRow; Row++)
    {
      for (let Column = startColumn; Column <= endColumn; Column++)
        setSelected(prevSelected => [...prevSelected, {row: Row, column: Column}])
    } 
  }
  
  useEffect(() => {
      function handleKeyDown(event)
      {
        if (event.key === 'Shift') 
        {
          setShiftPressed(true);
          console.log("Pressed");
        }
      }
    
      function handleKeyUp(event)
      {
        if (event.key === 'Shift')
        {
          setShiftPressed(false);
          console.log("Released");
        }
      }

      // Usamos o hook useEffect para adicionar event listeners globais (para todo o documento) que chamam tais funções
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, []);

  useEffect(() => {
    const interval = setInterval(() => {

        fetch('http://localhost:3001/')
        .then((result) => result.json())
        .then((jsonData) => {

          const dataMatrix = jsonData;

          setTempMediaGeral(calculateMediaGeral(dataMatrix));
          setTempMediaSelec(calculateMediaSelec(dataMatrix));

          const colorMatrix = numberToRGB(dataMatrix, tempMin, tempMax);

          setDadosInterpolados(colorMatrix.map((row, rowIndex) => {
            return(
            <div key = {rowIndex} className="row">
            {row.map((element, elementIndex) => {
              return(
              <div key = {elementIndex} 
              className = {isSelected(rowIndex, elementIndex) ? "selected" : "color"} 
              style = {{backgroundColor: `rgb(${element.r}, ${element.g}, ${element.b})`}}
              onClick={() => {
                if(isSelected(rowIndex, elementIndex))
                {   
                    const newArray = selected.filter(item => item.row !== rowIndex || item.column !== elementIndex);
                    setSelected(newArray);
                }
                else
                {
                  setSelected([...selected, {row: rowIndex, column: elementIndex}])
  
                  if (shiftPressed) 
                    setLastClick({ row: rowIndex, column: elementIndex });
                }

                if(lastClick != null)
                {
                  selectInterval(lastClick, { row: rowIndex, column: elementIndex });
                  setLastClick(null);
                }
              }}>
              </div>
            )})}
            </div>
          )}))
        })
        .catch((error) => {
          console.error('Error :/', error);})
      }, 20);
      return () => clearInterval(interval); // Não continua atualizando quando o componente não está sendo renderizado 
  }, [selected, tempMin, tempMax, shiftPressed]);

  return(
    <>
    <header>
      <h1>Análise de Temperatura</h1>
      <img src={require('./assets/tesla.png')} alt="tesla logo" className="teslaLogo"/>
    </header>
    <main>
      <div className="title">
          <h1>Dados Interpolados</h1>
          <button className="button" onClick= {() => {setSelected([]); setLastClick(null)}}>
            <img src={require('./assets/broom.png')} alt="clean" className="vassoura"/>
          </button>
      </div>

      <div className="matriz"> {dadosInterpolados} </div>

      <div className="infos">
        <div className="medias">
          <h2>Temperatura Média</h2>
          <h5>GERAL</h5>
          <div className="valores"><h3>{tempMediaGeral} °C</h3></div>
        </div>

        <div className="inputs">
          <label>Temperatura Mínima</label>
          <input type="number" value={tempMin} onChange= {(event) => setTempMin(event.target.value)}/>

          <label>Temperatura Máxima</label>
          <input type="number" value={tempMax} onChange= {(event) => setTempMax(event.target.value)}/>
        </div>

        <div className="medias">
          <h2>Temperatura Média</h2>
          <h5>PONTOS SELECIONADOS</h5>
          <div className="valores"><h3>{isNaN(tempMediaSelec) ? "-" : tempMediaSelec.toFixed(2)} °C</h3></div>
        </div>
      </div>
    </main>
    <footer>
      <h4>Tesla Projects &#169;</h4>
    </footer>
    </>
  )
}

export default App;