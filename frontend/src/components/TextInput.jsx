import React from "react";

const TextInput = ({ text, setText }) => {
  return (
    <textarea
      className="w-full max-w-2xl h-56 bg-gray-800 p-4 rounded-lg text-gray-200 border border-gray-700 outline-none resize-none"
      placeholder="Paste or type your text here..."
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  );
};

export default TextInput;
