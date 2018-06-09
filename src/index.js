import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

function noop() {}
if (process.env.NODE_ENV !== 'development') {
    console.log = noop;
    console.warn = noop;
    console.error = noop;
}

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
