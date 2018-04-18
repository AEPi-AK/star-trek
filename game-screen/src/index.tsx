import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Screen from './Screen';
import ArmChair from './ArmChair';
import './index.css';

if (document.location.search.includes('armchair')) {
  ReactDOM.render(<ArmChair />, document.getElementById('root') as HTMLElement);
} else {
  ReactDOM.render(<Screen />, document.getElementById('root') as HTMLElement);
}
