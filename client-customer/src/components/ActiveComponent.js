import axios from 'axios';
import React, { Component } from 'react';

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtToken: '',
      loading: false,
      error: null,
      success: null
    };
  }

  render() {
    const { txtID, txtToken, loading, error, success } = this.state;

    return (
      <div className="align-center">
        <h2 className="text-center">ACTIVE ACCOUNT</h2>
        
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

        {success && (
          <div style={{ 
            backgroundColor: "#d4edda", 
            color: "#155724", 
            padding: "10px", 
            marginBottom: "20px", 
            borderRadius: "4px",
            textAlign: "center"
          }}>
            {success}
          </div>
        )}

        <form>
          <table className="align-center">
            <tbody>
              <tr>
                <td>ID</td>
                <td>
                  <input 
                    type="text" 
                    value={txtID} 
                    onChange={(e) => { this.setState({ txtID: e.target.value, error: null, success: null }) }} 
                    disabled={loading}
                    style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                </td>
              </tr>
              <tr>
                <td>Token</td>
                <td>
                  <input 
                    type="text" 
                    value={txtToken} 
                    onChange={(e) => { this.setState({ txtToken: e.target.value, error: null, success: null }) }} 
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
                    value={loading ? "ACTIVATING..." : "ACTIVE"} 
                    onClick={(e) => this.btnActiveClick(e)} 
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
  btnActiveClick(e) {
    e.preventDefault();
    const id = this.state.txtID.trim();
    const token = this.state.txtToken.trim();
    
    if (!id) {
      this.setState({ error: 'Please input ID' });
      return;
    }
    if (!token) {
      this.setState({ error: 'Please input Token' });
      return;
    }

    this.apiActive(id, token);
  }

  // apis
  apiActive(id, token) {
    this.setState({ loading: true, error: null, success: null });
    const body = { id: id, token: token };
    axios
      .post('/api/customer/active', body)
      .then((res) => {
        const result = res.data || {};
        const isActivated = result.success === true || !!result._id || !!result.data;

        if (isActivated) {
          this.setState({ 
            success: result.message || 'Account activated successfully!',
            loading: false,
            txtID: '',
            txtToken: ''
          });
        } else {
          this.setState({ 
            error: result.message || 'Activation failed',
            loading: false 
          });
        }
      })
      .catch((err) => {
        console.error('Active error:', err);
        this.setState({ 
          error: err.response?.data?.message || 'Network error. Please try again.',
          loading: false 
        });
      });
  }
}

export default Active;