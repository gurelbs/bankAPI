import './App.css';
import {
  Switch,
  Route,
  BrowserRouter as Router,
} from "react-router-dom";
import HomePage from './components/HomePage'
import UserPage from './components/UserPage'
import CreateUser from './components/CreateUser'
import Main from './components/Main'
import UserAccount from './components/UserAccount'

export default function App() {
  return (
    <Router>
      <Switch>
          <Route exact path="/" component={HomePage}/>
          <Route exact path="/main" component={Main}/>
          <Route exact path="/main/create" component={CreateUser}/>
          <Route exact path="/user/:id" component={UserPage}/>
          <Route exact path="/user/:id/:account" component={UserAccount}/>
      </Switch>
    </Router>
  )
}