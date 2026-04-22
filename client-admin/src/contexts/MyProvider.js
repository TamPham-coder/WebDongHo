import React, { Component } from 'react';
import MyContext from './MyContext';

class MyProvider extends Component {
  constructor(props) {
    super(props);

    const savedToken = localStorage.getItem('adminToken') || '';
    const savedUsername = localStorage.getItem('adminUsername') || '';

    this.state = { // global state
      // variables
      token: savedToken,
      username: savedUsername,
      // functions
      setToken: this.setToken,
      setUsername: this.setUsername
    };
  }

  setToken = (value) => {
    localStorage.setItem('adminToken', value);
    this.setState({ token: value });
  }

  setUsername = (value) => {
    localStorage.setItem('adminUsername', value);
    this.setState({ username: value });
  }

  render() {
    return (
      <MyContext.Provider value={this.state}>
        {this.props.children}
      </MyContext.Provider>
    );
  }
}

export default MyProvider;
