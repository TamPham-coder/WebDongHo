import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

class Myprofile extends Component {
  static contextType = MyContext; // using this.context to access global state

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
      customerId: null
    };
  }

  componentDidMount() {
    const customer = this.context.customer;
    if (customer) {
      this.setCustomerFields(customer);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const customer = this.context.customer;
    if (customer && customer._id !== prevState.customerId) {
      this.setCustomerFields(customer);
    }
  }

  setCustomerFields(customer) {
    this.setState({
      txtUsername: customer.username || '',
      txtPassword: customer.password || '',
      txtName: customer.name || '',
      txtPhone: customer.phone || '',
      txtEmail: customer.email || '',
      customerId: customer._id
    });
  }

  render() {
    if (this.context.token === '') return (<Navigate replace to='/login' />);

    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail, loading, error, success } = this.state;

    return (
      <div className="align-center">
        <h2 className="text-center">MY PROFILE</h2>

        {error && (
          <div style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "6px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "6px",
            textAlign: "center"
          }}>
            {success}
          </div>
        )}

        <form onSubmit={(e) => this.btnUpdateClick(e)}>
          <table className="align-center">
            <tbody>
              <tr>
                <td>Username</td>
                <td>
                  <input
                    type="text"
                    value={txtUsername}
                    onChange={(e) => this.setState({ txtUsername: e.target.value, error: null, success: null })}
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
                    onChange={(e) => this.setState({ txtPassword: e.target.value, error: null, success: null })}
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
                    onChange={(e) => this.setState({ txtName: e.target.value, error: null, success: null })}
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
                    onChange={(e) => this.setState({ txtPhone: e.target.value, error: null, success: null })}
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
                    onChange={(e) => this.setState({ txtEmail: e.target.value, error: null, success: null })}
                    disabled={loading}
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <input
                    type="submit"
                    value={loading ? "UPDATING..." : "UPDATE"}
                    disabled={loading}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: loading ? "#ccc" : "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
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

  btnUpdateClick(e) {
    e.preventDefault();
    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail } = this.state;

    if (!txtUsername.trim() || !txtName.trim() || !txtPhone.trim() || !txtEmail.trim()) {
      this.setState({ error: 'Please fill Username, Name, Phone, and Email. Password is optional.' });
      return;
    }

    const customer = {
      username: txtUsername.trim(),
      name: txtName.trim(),
      phone: txtPhone.trim(),
      email: txtEmail.trim()
    };

    // Only include password if user entered something
    if (txtPassword.trim()) {
      customer.password = txtPassword.trim();
    }

    console.log('Form data to send:', customer);
    this.apiPutCustomer(this.context.customer._id, customer);
  }

  apiPutCustomer(id, customer) {
    this.setState({ loading: true, error: null, success: null });
    
    console.log('Updating customer:', id, customer);

    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('http://localhost:3000/api/customer/customers/' + id, customer, config)
      .then((res) => {
        console.log('Update response full:', res);
        console.log('Update response data:', res.data);
        const result = res.data;
        
        if (result.success === true && result.data) {
          console.log('Update successful, new customer:', result.data);
          this.context.setCustomer(result.data);
          this.setCustomerFields(result.data);
          this.setState({
            loading: false,
            success: 'Profile updated successfully.',
            error: null
          });
        } else if (result && typeof result === 'object' && result._id) {
          console.log('Update returned customer object directly:', result);
          this.context.setCustomer(result);
          this.setCustomerFields(result);
          this.setState({
            loading: false,
            success: 'Profile updated successfully.',
            error: null
          });
        } else {
          console.log('Update response not in expected format:', result);
          this.setState({
            loading: false,
            error: result?.message || 'Update failed. Please try again.',
            success: null
          });
        }
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Update failed';
        console.error('Update profile error details:', {
          status: err.response?.status,
          message: errorMsg,
          data: err.response?.data
        });
        this.setState({
          loading: false,
          error: String(errorMsg),
          success: null
        });
      });
  }
}

export default Myprofile;