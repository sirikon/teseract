/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useState } from 'react';

export default () => {
	const [text, setText] = useState('Hello World');

	return (
		<div>
			<h1>{text}</h1>
			<input type="text"
				value={text}
				onChange={(e) => setText(e.target.value)} />
		</div>
	);
};
