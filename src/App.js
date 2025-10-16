import logo from './logo.svg';
import { useState, useEffect } from 'react';
import './App.css';
import {sourceUrl, parentElementsData, childElementData} from './data/data.js'

function App() {
  let [decodedUrl, setDecodedUrl] = useState(''); // Destination url
  
  useEffect(() => {
    // fetch source html
    getHtmlFromUrl(sourceUrl)
    .then(htmlString => {
      if (htmlString) {
        console.log("HTML content retrieved successfully:");
        // convert html string into html
        const parser = new DOMParser();
        const html = parser.parseFromString(htmlString, 'text/xml');
        decodeUrl(html)
      } else {
        console.log("Failed to retrieve HTML content.");
      }
    });
  },[]);

  const getHtmlFromUrl = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const htmlContent = await response.text();
      return htmlContent;
    } catch (error) {
      console.error("Error fetching HTML:", error);
      return null;
    }
  }

  const decodeUrl = (html) => {
    for (let data of parentElementsData) {
      // node list of elements with specified tag
      const elements = html.querySelectorAll(data.tag)
      // regex to match attribute against
      const regex = new RegExp(data.regex)
      // for each element, check if the specified attribute matches the regular expression
      elements.forEach((element) => {
        // if attribute value doesn't match the regexp, remove it from the node list
        if (!regex.test(element.attributes[data.attribute].value)) {
          const parent = element.parentNode;
          parent.removeChild(element)
        }
      })
    }

    let bNodes = html.querySelectorAll(childElementData.tag)
    let str = ""
    bNodes.forEach((node) => {
      if(node.classList.contains(childElementData.className)) {
        let val = node.attributes.value.nodeValue;
        str += val
      }
    })
    setDecodedUrl(str)
  }


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
