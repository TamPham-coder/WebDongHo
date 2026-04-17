import axios from 'axios';
import React, { Component } from 'react';
import withRouter from '../utils/withRouter';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: '',
      loading: false,
      error: null,
      success: null
    };
  }

  render() {
    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail, loading, error, success } = this.state;

    return (
      <div className="align-center">
        <h2 className="text-center">SIGN-UP</h2>

        {error && (
          <div style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "6px", marginBottom: "16px", textAlign: "center" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: "#d4edda", color: "#155724", padding: "12px", borderRadius: "6px", marginBottom: "16px", textAlign: "center" }}>
            {success}
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
                    onChange={(e) => this.setState({ txtUsername: e.target.value, error: null })}
                    disabled={loading}
                  />
                </td>
              </tr>

              <tr>
                <td>Password</td>
                <td>
                  <input 
                    type="password" 
                    value={txtPassword} 
                    onChange={(e) => this.setState({ txtPassword: e.target.value, error: null })}
                    disabled={loading}
                  />
                </td>
              </tr>

              <tr>
                <td>Name</td>
                <td>
                  <input 
                    type="text" 
                    value={txtName} 
                    onChange={(e) => this.setState({ txtName: e.target.value, error: null })}
                    disabled={loading}
                  />
                </td>
              </tr>

              <tr>
                <td>Phone</td>
                <td>
                  <input 
                    type="tel" 
                    value={txtPhone} 
                    onChange={(e) => this.setState({ txtPhone: e.target.value, error: null })}
                    disabled={loading}
                  />
                </td>
              </tr>

              <tr>
                <td>Email</td>
                <td>
                  <input 
                    type="email" 
                    value={txtEmail} 
                    onChange={(e) => this.setState({ txtEmail: e.target.value, error: null })}
                    disabled={loading}
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <input 
                    type="submit" 
                    value={loading ? "SIGNING UP..." : "SIGN-UP"} 
                    onClick={(e) => this.btnSignupClick(e)}
                    disabled={loading}
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
  btnSignupClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername.trim();
    const password = this.state.txtPassword.trim();
    const name = this.state.txtName.trim();
    const phone = this.state.txtPhone.trim();
    const email = this.state.txtEmail.trim();

    if (!username || !password || !name || !phone || !email) {
      this.setState({ error: 'Please fill all fields', success: null });
      return;
    }

    const account = { username, password, name, phone, email };
    this.apiSignup(account);
  }

  // apis
  apiSignup(account) {
    this.setState({ loading: true, error: null, success: null });
    
    axios
      .post('http://localhost:3000/api/customer/signup', account)
      .then((res) => {
        const result = res.data;
        this.setState({
          success: result?.message || 'Sign-up successful!',
          loading: false,
          txtUsername: '',
          txtPassword: '',
          txtName: '',
          txtPhone: '',
          txtEmail: ''
        });
        // Redirect to login sau 2 giây
        setTimeout(() => {
          this.props.navigate('/login');
        }, 2000);
      })
      .catch((err) => {
        console.error('Signup error:', err.response?.data || err.message);
        this.setState({
          error: err.response?.data?.message || err.message || 'Sign-up failed. Please try again.',
          loading: false
        });
      });
  }
}

export default withRouter(Signup);