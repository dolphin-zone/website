import React, { useState } from "react";
import { translate, isDolphin } from "@dolphin-zone/translator";

const TranslateComponent: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [outputLabel, setOutputLabel] = useState<string>("");
  const [inputLabel, setInputLabel] = useState<string>("");
  const [replaceSpaces, setReplaceSpaces] = useState<boolean>(false);

  const maxLength = outputText.length < 280 ? 280 : 1024;

  const handleTranslate = async (text: string) => {
    const translatedText = await translate(text);
    setOutputText(translatedText);
    const isDolphinText = isDolphin(text);
    setOutputLabel(text ? (!isDolphinText ? "🐬" : "👤") : "");
    setInputLabel(text ? (isDolphinText ? "🐬" : "👤") : "");
    if (isDolphinText) {
      setReplaceSpaces(false);
    }
  };

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    let text = event.target.value;
    if (replaceSpaces && !isDolphin(text)) {
      text = text.replace(/ /g, "-");
    }
    setInputText(text);
    await handleTranslate(text);
  };

  const handlePaste = async () => {
    let text = await navigator.clipboard.readText();
    if (replaceSpaces && !isDolphin(text)) {
      text = text.replace(/ /g, "-");
    }
    setInputText(text);
    await handleTranslate(text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
  };

  const handleClear = async () => {
    setInputText("");
    await handleTranslate("");
  };

  const handleSwap = async () => {
    let text = outputText;
    if (replaceSpaces && !isDolphin(text)) {
      text = text.replace(/ /g, "-");
    }
    setInputText(text);
    await handleTranslate(text);
  };

  const handleCastToWarpcast = () => {
    const urlRegex =
      /(https?:\/\/[^\s]+)|((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])/gi;
    const matches = outputText.match(urlRegex) || [];

    const embedUrls = matches.map((url) => {
      if (!url.startsWith("http")) {
        return `https://${url}`;
      }
      return url;
    });

    let warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(outputText)}&channelKey=dolphin-zone`;

    if (embedUrls.length > 0) {
      warpcastUrl += embedUrls
        .map((url) => `&embeds[]=${encodeURIComponent(url)}`)
        .join("");
    }
    window.open(warpcastUrl, "_blank");
  };

  const handlePostToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(outputText)}`;
    window.open(twitterUrl, "_blank");
  };

  const handleReplaceSpacesChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isDolphin(inputText)) {
      return;
    }
    const newReplaceSpaces = e.target.checked;
    setReplaceSpaces(newReplaceSpaces);

    // Update existing input text based on new setting
    const updatedText = newReplaceSpaces
      ? inputText.replace(/ /g, "-")
      : inputText.replace(/-/g, " ");
    setInputText(updatedText);
    await handleTranslate(updatedText);
  };

  return (
    <div style={{ maxWidth: "64ch", margin: "0 auto" }}>
      <header>
        <label>{inputLabel ? `${inputLabel} ` : "Input"}:</label>
        <label className="button">
          <input
            type="checkbox"
            checked={replaceSpaces}
            onChange={handleReplaceSpacesChange}
            disabled={isDolphin(inputText)}
          />
          Hyphenate
        </label>
        <button onClick={handleClear} disabled={!outputText}>
          Clear
        </button>
        <button onClick={handlePaste}>Paste</button>
      </header>
      <textarea
        value={inputText}
        onChange={handleInputChange}
        placeholder={
          (replaceSpaces
            ? "write-or-paste-your-text-here"
            : "write or paste your text here") +
          "\n\nEee EeE EE e E eee EeE EeeE Ee EEE e E eEee eee EEe EeE EE eE EeeE EEe e e E eEEe e EEEE E EeE E"
        }
      />
      <header>
        <label>{outputLabel ? `${outputLabel} ` : "Output"}:</label>
        <button onClick={handleSwap} disabled={!outputText}>
          Swap
        </button>
        <button onClick={handleCopy} disabled={!outputText}>
          Copy
        </button>
      </header>
      <textarea value={outputText} readOnly />
      <header className={!outputText ? "hidden" : ""}>
        <label>
          {outputText.length} / {maxLength}
        </label>
        <button
          onClick={handleCastToWarpcast}
          disabled={!outputText || outputText.length > 1024}
        >
          Post to Warpcast
        </button>
        <button
          onClick={handlePostToTwitter}
          disabled={!outputText || outputText.length > 280}
        >
          Post to X
        </button>
      </header>
    </div>
  );
};

export default TranslateComponent;
