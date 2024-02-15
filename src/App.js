import React, { useState } from "react";
import "./App.css";

function App() {
  const [imageBase64Src, setImageBase64Src] = useState("");
  const [domain, setDomain] = useState(
    localStorage.getItem("chatGPTDomain") || ""
  );
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("chatGPTApiKey") || ""
  );
  const [response, setResponse] = useState("");

  const fileToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.log("Error: ", error);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    fileToBase64(file, (result) => {
      setImageBase64Src(result);
    });
  };

  const handleDomainChange = (e) => {
    const value = e.target.value;
    setDomain(value);
    localStorage.setItem("chatGPTDomain", value);
  };

  const handleApiKeyChange = (e) => {
    const value = e.target.value;
    setApiKey(value);
    localStorage.setItem("chatGPTApiKey", value);
  };

  const fetchChatGPTCompletion = async () => {
    if (!domain || !apiKey) {
      setResponse("Error: ChatGPT domain or API access key not provided.");
      return;
    }

    const requestBody = {
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Convert this image into a technical design document",
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64Src,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    };

    try {
      const response = await fetch(`/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorMessage = `HTTP error! status: ${response.status}`;
        setResponse(errorMessage);
        console.error(errorMessage);
        return;
      }

      const data = await response.json();
      setResponse(data.choices[0].message.content); // Pretty print JSON response
    } catch (error) {
      const errorMessage = `Error fetching data: ${error}`;
      setResponse(errorMessage);
      console.error(errorMessage);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ChatGPT API Image Analysis</h1>

        <div>
          <label htmlFor="domain">ChatGPT Domain:</label>
          <input
            id="domain"
            type="text"
            value={domain}
            onChange={handleDomainChange}
          />
        </div>

        <div>
          <label htmlFor="apiKey">API Access Key:</label>
          <input
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={handleApiKeyChange}
            style={{ marginBottom: "20px" }}
          />
        </div>

        <input type="file" onChange={handleFileChange} />
        {Boolean(imageBase64Src) && (
            <div>
              <h2>Image Preview</h2>
              <img
                src={imageBase64Src}
                alt="Uploaded preview"
                style={{ width: '100%', maxWidth: '400px', maxHeight: '500px' }}
              />
            </div>
          )}
        <button onClick={fetchChatGPTCompletion} disabled={!imageBase64Src}>
          Analyze Image
        </button>

        {response && (
          <div>
            <h2>API Response</h2>
            <textarea style={{ textAlign: "left" }}>{response}</textarea>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
