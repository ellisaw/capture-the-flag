import { useState, useEffect } from 'react';
import './App.css';
import {sourceUrl, nodesData, innermostNodeData} from './data/data.js'

function App() {
  let [html, setHtml] = useState(); // Source html
  let [decodedUrl, setDecodedUrl] = useState(''); // Destination url
  let [flag, setFlag] = useState(""); // Flag string
  let [showUrl, setShowUrl] = useState(true);
  let [flagDisplayed, setFlagDisplayed] = useState(false);
  let [loadingText, setLoadingText] = useState("");
  
  useEffect(() => {
    // fetch source html
    setLoadingText("Fetching HTML content to decode...")
    getPageContentFromUrl(sourceUrl)
    .then(pageContent => {
      if (pageContent) {
        console.log("HTML content retrieved successfully:");
        // convert string into html
        const parser = new DOMParser();
        setHtml(parser.parseFromString(pageContent, 'text/xml'));
        setLoadingText("")
        
      } else {
        console.log("Failed to retrieve page content.");
      }
    });
  },[]);

  const getPageContentFromUrl = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const pageContent = await response.text();
      return pageContent;
    } catch (error) {
      console.error("Error fetching HTML:", error);
      return null;
    }
  }

  // decode the url hidden in the html
  const decodeUrl = () => {
    let tagQuery = ""
    // filter nodes data for nodes that fit the attribute criteria
    for (let data of nodesData) {
      // build query as nested elements get deeper
      // e.g. parent > child > grandchild
      tagQuery = tagQuery ? `${tagQuery} > ${data.tag}` : data.tag
      // use query to retrieve node list for tag
      const nodeList = html.querySelectorAll(tagQuery)
      const regex = new RegExp(data.regex)
      nodeList.forEach((node) => {
        // if attribute value doesn't match the regexp, remove it from the node list
        if (!regex.test(node.attributes[data.attribute].value)) {
          const parent = node.parentNode;
          parent.removeChild(node)
        }
      })
    }

    // once last nested node is reached, store url characters
    tagQuery += " > " + innermostNodeData.tag
    let innermostNodes = html.querySelectorAll(tagQuery)
    let urlStr = ""
    innermostNodes.forEach((node) => {
      // only store if node has correct class name
      if(node.classList.contains(innermostNodeData.className)) {
        let val = node.attributes.value.nodeValue;
        urlStr += val
      }
    })
    setDecodedUrl(urlStr) 
  }

  // capture the flag (word) from decoded url
  const captureFlag = async () => {
    setShowUrl(false);
    setLoadingText("Fetching flag...")
    await getPageContentFromUrl(decodedUrl)
    .then((f) => {
      const timeout = f.length * 500;
      let i = 0, str = ""
      // Every 1/2 second, add another letter from flag to the display
      const interval = setInterval(() => {
        if (i < f.length) {
          str += f[i];
          setFlag(str);
          i++;
        }
      }, 500)

      // Stop interval after all letters have been displayed
      setTimeout(() => {
        clearInterval(interval)
      }, timeout)

      // Set boolean to disable button
      setFlagDisplayed(true);
      
    });
    setLoadingText("")
  }


  return (
    <div className="App">
      <header className="App-header">
        {
          showUrl
          ? <p className="App-display-text">
            {
              decodedUrl
              ? 
              <a
                className="App-link"
                href={decodedUrl}
                target="_blank"
              >
                {decodedUrl}
              </a>
              : loadingText
            }
          </p>
          : <p className="App-display-text">
            {flag ? flag : "Fetching flag..."}
          </p>
        }
        <div className="App-buttons">
          <button
            className="App-btn"
            disabled={!html || decodedUrl}
            onClick={() => decodeUrl()}
          >
            Decode URL
            </button>
          <button
            className="App-btn"
            disabled={!decodedUrl || flag}
            onClick={() => captureFlag()}
          >
            Capture Flag
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;


// import { useEffect, useState } from "react";
// import "./styles.css";

//   export default function App() {
//     const flagUrl = "https://wgg522pwivhvi5gqsn675gth3q0otdja.lambda-url.us-east-1.on.aws/686f72";

//   let [flag, setFlag] = useState()
//   // When document loads, fetch url
//   useEffect(() => {
//     fetchFlagFromUrl(flagUrl)
//     .then(str => {
//       for (let i = 0; i < str.length; i++) {
//         // set timeout
//         const timer = setTimeout(() => {
          
//         // add character to string
//         setFlag(flag + str[i])
//         }, 2000)
//       }
      
//     })
//     .then(() => {
      
//     })
//   }, []);

//   const fetchFlagFromUrl = async (url) => {
//     try {
//     const response =  await fetch(url)
//     if (response.ok) {
//         const htmlContent = await response.text()
//         return htmlContent
//       } else {
//         console.log("Error fetching url");
//       }
//     } catch (err) {
//       console.error("Error fetching html")
//     }
//   }

//   return (
//     <div>
//       <p>{flag ? flag : "Loading..."}</p>
//     </div>
//   );
// }
