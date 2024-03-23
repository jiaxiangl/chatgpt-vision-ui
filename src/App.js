import React, { useState } from "react";
import { ThemeProvider } from "@zendeskgarden/react-theming";
import {
  Modal,
  Body,
  Footer,
  FooterItem,
  Close,
} from "@zendeskgarden/react-modals";
import { Button, IconButton } from "@zendeskgarden/react-buttons";
import { Field, Label, Input } from "@zendeskgarden/react-forms";
import ChatGPTResponse from './ChatGPTResponse';
import { ReactComponent as SettingsIcon } from "@zendeskgarden/svg-icons/src/16/gear-stroke.svg";
import { ReactComponent as UploadIcon } from "@zendeskgarden/svg-icons/src/16/upload-stroke.svg";
import "./App.css";

function App() {
  const [imageBase64Src, setImageBase64Src] = useState("");
  const [prompt, setPrompt] = useState("");
  const [domain, setDomain] = useState(
    localStorage.getItem("chatGPTDomain") || ""
  );
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("chatGPTApiKey") || ""
  );
  const [response, setResponse] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.log("Error: ", error);
  };

  const fetchChatGPTCompletion = async (prompt) => {
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
              text: prompt + " and return with markdown format",
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
      max_tokens: 900,
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

  const handlePromptChange = (e) => {
    const value = e.target.value;
    setPrompt(value);
  };

  // Fetch ChatGPT Completion (same as your original function)
  // ...

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <ThemeProvider>
      <div className="App">
        <header className="App-header">
          <IconButton onClick={openModal} aria-label="settings">
            <SettingsIcon />
          </IconButton>
          {isModalOpen && (
            <Modal isOpen={isModalOpen} onClose={closeModal}>
              <Body>
                <Field>
                  <Label>ChatGPT Domain:</Label>
                  <Input value={domain} onChange={handleDomainChange} />
                </Field>
                <Field>
                  <Label>API Access Key:</Label>
                  <Input value={apiKey} onChange={handleApiKeyChange} />
                </Field>
              </Body>
              <Footer>
                <FooterItem>
                  <Button onClick={closeModal} isPrimary>
                    Save
                  </Button>
                </FooterItem>
              </Footer>
              <Close aria-label="Close modal" />
            </Modal>
          )}
          <div className="upload-and-prompt flex justify-center items-center gap-2 p-4 fixed bottom-0 left-0 right-0">
            <label className="cursor-pointer">
              <div className="flex items-center px-2 py-1 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                <UploadIcon className="w-5 h-5" />
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <Input
              placeholder="Write your prompt here"
              onChange={handlePromptChange}
            />
            <Button
              onClick={() => fetchChatGPTCompletion(prompt)}
              disabled={!imageBase64Src}
            >
              Analyze Image
            </Button>
          </div>
          <div className="api-response">
            {response && <ChatGPTResponse markdownText={response} />}
          </div>
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
