import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';

class Login extends Component {
  static contextType = MyContext; // using this.context to access global state

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: 'sonkk',
      txtPassword: '123',
      loading: false,
      error: null
    };
  }

  render() {
    const { txtUsername, txtPassword, loading, error } = this.state;

    return (
      <div className="align-center">
        <h2 className="text-center">CUSTOMER LOGIN</h2>
        
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

        <form>
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
                    onClick={(e) => this.btnLoginClick(e)} 
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

  // event-handlers
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

  // apis
  apiLogin(account) {
    this.setState({ loading: true, error: null });
    axios
      .post('http://localhost:3000/api/customer/login', account)
      .then((res) => {
        const result = res.data;
        const token = result.token || result.data?.token || result.data?.data?.token;
        let customer = result.customer || result.data?.customer || result.data?.data?.customer;

        if (customer && !customer.password) {
          customer = { ...customer, password: account.password };
        }

        if (result.success === true && token && customer) {
          this.context.setToken(token);
          this.context.setCustomer(customer);
          this.setState({ txtUsername: '', txtPassword: '', loading: false }, () => {
            this.props.navigate('/home');
          });
        } else {
          this.setState({ error: result.message || 'Login failed', loading: false });
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

export default withRouter(Login);