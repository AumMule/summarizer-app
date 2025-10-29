import React from "react";

const ResultCard = ({ summary }) => {
  return (
    <div className="max-w-2xl mt-8 bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-green-400 mb-2">Summary</h2>
      <p className="text-gray-300">{summary}</p>
    </div>
  );
};

export default ResultCard;
