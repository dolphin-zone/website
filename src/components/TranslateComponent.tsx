import React, { useState } from "react";
import { translate, isDolphin } from "@dolphin-zone/translator";
import styles from "./TranslateComponent.module.css";

const TranslateComponent: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [outputLabel, setOutputLabel] = useState<string>("");
  const [inputLabel, setInputLabel] = useState<string>("");
  const [replaceSpaces, setReplaceSpaces] = useState<boolean>(true);

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
    <div className={styles.translater}>
      <header className={styles.header}>
        <label className={styles.label}>Input: {inputLabel}</label>
        <label className={styles.button}>
          <input
            type="checkbox"
            checked={replaceSpaces}
            onChange={handleReplaceSpacesChange}
            disabled={isDolphin(inputText)}
          />
          Hyphenate
        </label>
        <button
          className={styles.button}
          onClick={handleClear}
          disabled={!outputText}
        >
          Clear
        </button>
        <button className={styles.button} onClick={handlePaste}>
          Paste
        </button>
      </header>
      <textarea
        className={styles.textarea}
        value={inputText}
        onChange={handleInputChange}
        placeholder="Write or paste your text here"
      />
      <header className={styles.header}>
        <label className={styles.label}>Output: {outputLabel}</label>
        <button
          className={styles.button}
          onClick={handleSwap}
          disabled={!outputText}
        >
          Swap
        </button>
        <button
          className={styles.button}
          onClick={handleCopy}
          disabled={!outputText}
        >
          Copy
        </button>
      </header>
      <textarea className={styles.textarea} value={outputText} readOnly />
      <header className={`${styles.header} ${!outputText ? "hidden" : ""}`}>
        <label className={styles.label}>
          Character Count: {outputText.length}
        </label>
        <button
          className={styles.button}
          onClick={handleCastToWarpcast}
          disabled={!outputText || outputText.length > 1024}
        >
          Post to Warpcast
        </button>
        <button
          className={styles.button}
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
