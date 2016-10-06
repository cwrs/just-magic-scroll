/*eslint-env node */
/*eslint no-console: 0*/
require('babel-polyfill');
var jsdom = require('jsdom');

//used to log internal jsdom-errors to the console
var virtualConsole = jsdom.createVirtualConsole();
virtualConsole.on('jsdomError', function (error) {
    console.error(error.stack, error.detail);
});

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>', {
    url: 'http://localhost',
    virtualConsole
});
global.window = document.defaultView;
window.sessionStorage = {
    getItem: function (key) {
        return this[key];
    },
    setItem: function (key, value) {
        this[key] = value;
    },
    removeItem: function(key) {
        this[key] = null;
    }
};
global.navigator = {userAgent: 'node.js'};
global.FormData = document.defaultView.FormData;
global.Element = window.Element;



//run tests in production environment
global.__DEVELOPMENT__ = false;
global.__DEVTOOLS__ = false;
global.__TEST__ =  true;

require.extensions['.less'] = () => null;
require.extensions['.css'] = () => null;
