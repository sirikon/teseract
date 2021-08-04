import React, { useState } from "react";

export default () => {
  const [text, setText] = useState("Hello World");

  return <>
    <h1>{text}</h1>
    <TextInput text={text} onText={setText}></TextInput>
  </>;
};

const TextInput = (params: {
	text: string,
	onText: (text: string) => void
}) => (
  <input
    type="text"
    value={params.text}
    onChange={(e) => params.onText(e.target.value)} />
);
