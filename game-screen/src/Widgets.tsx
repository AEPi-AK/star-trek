import * as React from 'react';
import * as _ from 'lodash';

import './Widgets.css';

const MAX_HEALTH = 6;

export const HealthBar = (props: { failures: number }) => {
  const remaining = MAX_HEALTH - props.failures;
  return (
    <div className="HealthBar">
      {_.range(MAX_HEALTH).map(i => (
        <div
          className={`HealthBar-circle ${
            i >= remaining ? 'HealthBar-circle-missing' : ''
          }
          }`}
          key={i}
        />
      ))}
    </div>
  );
};

// Press F to pay respects
function formatSeconds(seconds: number) {
  return new Date(0, 0, 0, 0, 0, seconds).toTimeString().substring(4, 8);
}

export const TorpedoTimer = (props: { time: number }) => {
  return <div className="TorpedoTimer">{formatSeconds(props.time)}</div>;
};
