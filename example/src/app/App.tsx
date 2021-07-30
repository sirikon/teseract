/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useState } from 'react';

type TextInputArgs = {
	text: string,
	onText: (text: string) => void
}
const TextInput = ({ text, onText }: TextInputArgs) =>
	<input
		type="text"
		value={text}
		onChange={(e) => onText(e.target.value)} />;


export default () => {
	const [text, setText] = useState('Hello World');

	return <>
		<h1>{text}</h1>
		<TextInput text={text} onText={setText}></TextInput>
	</>;
};
