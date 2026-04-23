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
      success: null,
      userId: null,
      userToken: null
    };
  }

  render() {
    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail, loading, error, success, userId, userToken } = this.state;

    return (
      <div className="align-center">
        <h2 className="text-center">SIGN-UP</h2>

        {error && (
          <div style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "6px", marginBottom: "16px", textAlign: "center" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: "#d4edda", color: "#155724", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>
            <div style={{ textAlign: "center", marginBottom: "12px", fontWeight: "bold" }}>
              {success}
            </div>
            <div style={{ backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "4px", textAlign: "left", fontSize: "12px", marginBottom: "12px" }}>
              <p style={{ marginTop: 0 }}><strong>What's next:</strong></p>
              <ul style={{ margin: "6px 0", paddingLeft: "20px" }}>
                <li>Check your email for a verification message</li>
                <li>Copy the ID and Token below</li>
                <li>Use them to activate your account</li>
              </ul>
            </div>
            {userId && userToken && (
              <div style={{ backgroundColor: "#f0f0f0", padding: "10px", borderRadius: "4px", textAlign: "left", fontSize: "12px", marginBottom: "12px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>ID:</strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <input 
                      type="text" 
                      value={userId} 
                      readOnly 
                      style={{ flex: 1, padding: "6px", fontFamily: "monospace", fontSize: "11px", color: "#000", backgroundColor: "#fff", border: "1px solid #ddd" }}
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(userId);
                        alert('ID copied!');
                      }}
                      style={{ padding: "6px 12px", cursor: "pointer", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <strong>Token:</strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <input 
                      type="text" 
                      value={userToken} 
                      readOnly 
                      style={{ flex: 1, padding: "6px", fontFamily: "monospace", fontSize: "11px", color: "#000", backgroundColor: "#fff", border: "1px solid #ddd" }}
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(userToken);
                        alert('Token copied!');
                      }}
                      style={{ padding: "6px 12px", cursor: "pointer", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <form style={{ display: userId && userToken ? 'none' : 'block' }}>
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

        {userId && userToken && (
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => this.props.navigate('/active')}
              style={{ 
                padding: "10px 20px", 
                backgroundColor: "#007bff", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px"
              }}
            >
              Go to Activate Account
            </button>
            <button
              onClick={() => this.props.navigate('/login')}
              style={{ 
                padding: "10px 20px", 
                backgroundColor: "#6c757d", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Go to Login
            </button>
          </div>
        )}
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
      .post('/api/customer/signup', account)
      .then((res) => {
        const result = res.data;
        if (result.success) {
          this.setState({
            success: result?.message || 'Sign-up successful!',
            loading: false,
            userId: result.data?._id || '',
            userToken: result.data?.token || '',
            txtUsername: '',
            txtPassword: '',
            txtName: '',
            txtPhone: '',
            txtEmail: ''
          });
        } else {
          this.setState({
            error: result?.message || 'Sign-up failed',
            loading: false
          });
        }
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