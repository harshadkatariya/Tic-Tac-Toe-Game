import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import SignIn from './components/Signin';
import Game from './components/Game';

function App() {
    const [user, setUser] = useState(null);

    return (
        <Router>
            <Switch>
                <Route path="/signin">
                    {user ? <Redirect to="/game" /> : <SignIn onSignIn={setUser} />}
                </Route>
                <Route path="/game">
                    {/* {user ? <Game user={user} /> : <Redirect to="/signin" />} */}
                    <Game user={user} />
                </Route>
                <Redirect from="/" to="/signin" />
            </Switch>
        </Router>
    );
}

export default App;
