import { useState, useEffect } from 'react';
import './App.css';
import {sourceUrl, nodesData, innermostNodeData} from './data/data.js'

function App() {
  let [html, setHtml] = useState(); // Source html
  let [decodedUrl, setDecodedUrl] = useState(''); // Destination url
  
  useEffect(() => {
    // fetch source html
    getHtmlFromUrl(sourceUrl)
    .then(htmlString => {
      if (htmlString) {
        console.log("HTML content retrieved successfully:");
        // convert string into html
        const parser = new DOMParser();
        setHtml(parser.parseFromString(htmlString, 'text/xml'));
      } else {
        console.log("Failed to retrieve HTML content.");
      }
    });
  },[]);

  // get source html (string) from url
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


  return (
    <div className="App">
      <header className="App-header">
        <p>
          <a
            className="App-link"
            href={decodedUrl}
            target="_blank"
          >
            {decodedUrl}
          </a>
        </p>
        <button
          className="App-decode-btn"
          disabled={html === undefined}
          onClick={() => {
            if(!decodedUrl) decodeUrl()
          }}
        >
          Decode URL
        </button>
      </header>
    </div>
  );
}

export default App;
