import * as React from 'react';
// import * as _ from 'lodash';
import { HealthBar, TorpedoTimer } from './Widgets';
import * as Socket from 'socket.io-client';
import { GameState, GamePhase, GameDifficulty } from './shared/GameTypes';

import './fonts/slider.css';
import './ArmChair.css';
import * as _ from 'lodash';

const socket: SocketIOClient.Socket = Socket(process.env.REACT_APP_MASTER!);

const defaultGameState: GameState = {
  tasks: [],
  failures: 0,
  time: 0,
  difficulty: GameDifficulty.PreEasy,
  phase: GamePhase.NotConnected,
  weights: {},
  durations: {},
  task_frequency: {
    [GameDifficulty.PreEasy]: 10,
    [GameDifficulty.Easy]: 5,
    [GameDifficulty.Medium]: 4,
    [GameDifficulty.Hard]: 3,
  },
  max_tasks: {
    [GameDifficulty.PreEasy]: 2,
    [GameDifficulty.Easy]: 3,
    [GameDifficulty.Medium]: 4,
    [GameDifficulty.Hard]: 5,
  },
};

function subscribeToGameState(setTasks: (state: GameState) => void) {
  socket.on('connect', () => {
    socket.emit('identification', 'game-screen');
  });
  socket.on('game-state-updated', (t: GameState) => {
    setTasks(t);
  });
}

type ArmChairState = {
  gameState: GameState;
  selectedNumber: number | null;
};

class ArmChair extends React.Component<{}, ArmChairState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      gameState: defaultGameState,
      selectedNumber: null,
    };

    subscribeToGameState(gameState => {
      this.setState({ gameState });
    });

    this.startGame = this.startGame.bind(this);
  }

  startGame() {
    if (this.state.selectedNumber !== 0) {
      this.setState({ selectedNumber: null });
      socket.emit('number-players', this.state.selectedNumber);
    }
  }

  selectNumber(selectedNumber: number) {
    this.setState({
      selectedNumber,
    });
  }

  render() {
    if (this.state.gameState.phase === GamePhase.EnterPlayers) {
      return (
        <div className="ArmChair">
          <div className="ArmChair-instruction">Select number of players</div>
          <div className="ArmChair-numbers">
            {_.range(2, 6).map(num => (
              <div
                className={`ArmChair-number ${
                  num === this.state.selectedNumber
                    ? 'ArmChair-number-selected'
                    : ''
                }`}
                key={num}
                onClick={() => this.selectNumber(num)}
              >
                {num}
              </div>
            ))}
          </div>
          <div
            className={`ArmChair-button-start ${
              this.state.selectedNumber ? '' : 'ArmChair-button-start-disabled'
            }`}
            onClick={this.startGame}
          >
            START GAME
          </div>
        </div>
      );
    } else {
      return (
        <div className="ArmChair ArmChair-InGame">
          <div className="ArmChair-Banner">NCC-1701</div>
          <div className="ArmChair-Subbanner">U.S.S. Enterprise</div>
          <div className="ArmChair-InGame-Inner">
            <div className="ArmChair-HealthBar">
              <div className="ArmChair-Health-Label">Ship Health</div>
              <HealthBar failures={this.state.gameState.failures} />
            </div>
            <div className="ArmChair-Torpedo">
              <div className="ArmChair-Torpedo-Label">Torpedo Ready In</div>
              <TorpedoTimer time={this.state.gameState.time} />
            </div>
          </div>
        </div>
      );
    }
  }
}

export default ArmChair;
