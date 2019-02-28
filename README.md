# Morse.js
CQRS transport API for messaging between apps in one html document.

## Motivation
This may be necessary when one page contains applications written on different technologies
(for example, React and Backbone) or when there are two applications on the page divided
into different bundles (separate scripts).

## Install

Using **npm**: coming soon...

## Usage

Simple interface allows to communicate using *commands* and *requests*:

## Example

#### `header.js` - entry point of header app

```javascript
import { register } from 'morse';
import HeaderView from './views/header-view.js';

// create a new service and get a interface for messaging.
const headerService = register('backbone-header');

const headerView = new HeaderView({
    onLogOut: headerService.command('user-logout'),
});
```


#### `sidebar.js` - entry point of sidebar app

```javascript
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { register } from 'morse';
import store from './store.js';
import Sidebar from './connectors/sidebar.js';

const sidebarService = register('react-sidebar');

sidebarService.subscribeOnCommand('user-logout', () => {
    store.dispatch('CLEAR_USER_DATA');
});

render((
    <Provider store={store}>
        <Sidebar />
    </Provider>
), document.getElementById('sidebar-container'));
```
