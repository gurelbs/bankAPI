import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>
          Wellcome To BankAPI
        </h1>
        <a
          className="App-link"
          href="/create"
          rel="noopener noreferrer"
        >
          Open your account
        </a>
      </header>
    </div>
  );
}

export default App;
