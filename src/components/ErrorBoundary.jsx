import React from 'react';
import {
  exportBrokenSaveToConsole,
  recoverActiveSave,
  returnToTitleAfterError
} from '../game/recoveryActions.js';

export default class ErrorBoundary extends React.Component {
  state = { error: null, remountKey: 0 };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[App render error]', error, info.componentStack);
  }

  remount = action => {
    action();
    this.setState(current => ({
      error: null,
      remountKey: current.remountKey + 1
    }));
  };

  render() {
    const { error, remountKey } = this.state;
    if (!error) return React.cloneElement(React.Children.only(this.props.children), {
      key: remountKey
    });
    const reason = error instanceof Error ? error.message : 'unknown render error';

    return (
      <div className="app">
        <header className="app-title"><h1>Lantern Deckbuilder</h1></header>
        <main>
          <section className="placeholder-screen error-recovery-panel" role="alert">
            <p className="eyebrow">Recovery</p>
            <h2>Something went wrong while loading this screen.</h2>
            <p className="muted-text">Recovery reason: {reason}</p>
            <div className="recovery-actions">
              <button type="button" onClick={() => this.remount(
                () => recoverActiveSave('manual recovery from render error')
              )}>
                Return to Settlement
              </button>
              <button type="button" onClick={() => this.remount(returnToTitleAfterError)}>
                Return to Title
              </button>
              <button type="button" onClick={() => this.remount(
                () => recoverActiveSave('manual recovery from render error', true)
              )}>
                Reset Current Hunt Only
              </button>
              <button type="button" onClick={() => exportBrokenSaveToConsole(error)}>
                Export Broken Save to Console
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }
}
