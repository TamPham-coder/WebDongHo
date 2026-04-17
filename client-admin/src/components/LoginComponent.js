import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      loading: false,
      error: null
    };
  }

  render() {
    if (this.context.token === '') {
      const { txtUsername, txtPassword, loading, error } = this.state;

      return (
        <div className="align-valign-center" style={{ padding: "40px" }}>
          <h2 className="text-center">ADMIN LOGIN</h2>
          
          {error && (
            <div style={{ 
              backgroundColor: "#f8d7da", 
              color: "#721c24", 
              padding: "10px", 
              marginBottom: "20px", 
              borderRadius: "4px",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={(e) => this.btnLoginClick(e)}>
            <table className="align-center">
              <tbody>
                <tr>
                  <td>Username</td>
                  <td>
                    <input 
                      type="text" 
                      value={txtUsername} 
                      onChange={(e) => { this.setState({ txtUsername: e.target.value, error: null }) }} 
                      disabled={loading}
                      style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Password</td>
                  <td>
                    <input 
                      type="password" 
                      value={txtPassword} 
                      onChange={(e) => { this.setState({ txtPassword: e.target.value, error: null }) }} 
                      disabled={loading}
                      style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <input 
                      type="submit" 
                      value={loading ? "LOGGING IN..." : "LOGIN"} 
                      disabled={loading}
                      style={{ 
                        padding: "10px 20px", 
                        backgroundColor: loading ? "#ccc" : "#007bff", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "4px", 
                        cursor: loading ? "not-allowed" : "pointer"
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      );
    }
    return (<div />);
  }

  btnLoginClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername.trim();
    const password = this.state.txtPassword.trim();
    
    if (!username || !password) {
      this.setState({ error: 'Please input username and password' });
      return;
    }

    const account = { username: username, password: password };
    this.apiLogin(account);
  }

  apiLogin(account) {
    this.setState({ loading: true, error: null });
    
    axios
      .post('http://localhost:3000/api/admin/login', account)
      .then((res) => {
        const response = res.data || {};
        const payload = response.data ?? response;
        if (response.success === true && payload?.token) {
          this.context.setToken(payload.token);
          this.context.setUsername(account.username);
          this.setState({ txtUsername: '', txtPassword: '', loading: false });
        } else {
          this.setState({ error: response.message || 'Login failed', loading: false });
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        this.setState({ 
          error: err.response?.data?.message || 'Network error. Please try again.',
          loading: false 
        });
      });
  }
}

export default Login;