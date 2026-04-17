import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import withRouter from '../utils/withRouter';

class Mycart extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null
    };
  }

  render() {
    const { loading, error } = this.state;
    const mycart = this.context.mycart;

    if (mycart.length === 0) {
      return (
        <div className="align-center">
          <h2 className="text-center">ITEM LIST</h2>
          <p style={{ textAlign: "center", padding: "20px" }}>Your cart is empty</p>
        </div>
      );
    }

    const cartItems = mycart.map((item, index) => {
      return (
        <tr key={item.product._id} className="datatable">
          <td>{index + 1}</td>
          <td>{item.product._id}</td>
          <td>{item.product.name}</td>
          <td>{item.product.category?.name || "N/A"}</td>
          <td>
            <img
              src={'data:image/jpg;base64,' + item.product.image}
              width="70px"
              height="70px"
              alt={item.product.name}
            />
          </td>
          <td>{item.product.price || 0}</td>
          <td>{item.quantity || 0}</td>
          <td>{(item.product.price || 0) * (item.quantity || 0)}</td>
          <td>
            <span
              className="link"
              onClick={() => this.lnkRemoveClick(item.product._id)}
              style={{ cursor: "pointer" }}
            >
              Remove
            </span>
          </td>
        </tr>
      );
    });

    return (
      <div className="align-center">
        <h2 className="text-center">ITEM LIST</h2>
        
        {error && (
          <div style={{ backgroundColor: "#f8d7da", padding: "10px", marginBottom: "10px", color: "#721c24" }}>
            {error}
          </div>
        )}

        <table className="datatable" border="1">
          <tbody>
            <tr className="datatable">
              <th>No.</th>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Image</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>

            {cartItems}

            <tr>
              <td colSpan="6"></td>
              <td>Total</td>
              <td>{CartUtil.getTotal(this.context.mycart)}</td>
              <td>
                <span
                  className="link"
                  onClick={() => this.lnkCheckoutClick()}
                  style={{ 
                    cursor: loading ? "not-allowed" : "pointer",
                    color: loading ? "#ccc" : "#007bff"
                  }}
                  disabled={loading}
                >
                  {loading ? "CHECKING OUT..." : "CHECKOUT"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // event-handlers
  lnkRemoveClick(id) {
    if (window.confirm('Are you sure you want to remove this item?')) {
      const mycart = this.context.mycart;
      const index = mycart.findIndex((x) => x.product._id === id);

      if (index !== -1) {
        mycart.splice(index, 1);
        this.context.setMycart(mycart);
      }
    }
  }

  lnkCheckoutClick() {
    if (window.confirm('ARE YOU SURE?')) {
      if (this.context.mycart.length > 0) {
        const total = CartUtil.getTotal(this.context.mycart);
        const items = this.context.mycart;
        const customer = this.context.customer;

        if (customer) {
          this.apiCheckout(total, items, customer);
        } else {
          this.props.navigate('/login');
        }
      } else {
        alert('Your cart is empty');
      }
    }
  }

  // apis
  apiCheckout(total, items, customer) {
    this.setState({ loading: true, error: null });
    const body = { total: total, items: items, customer: customer };
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios
      .post('http://localhost:3000/api/customer/checkout', body, config)
      .then((res) => {
        const result = res.data;
        if (result) {
          alert('OK BABY!');
          this.context.setMycart([]);
          this.props.navigate('/home');
        } else {
          this.setState({ error: 'Checkout failed', loading: false });
        }
      })
      .catch((err) => {
        console.error('Checkout error:', err);
        this.setState({ 
          error: err.response?.data?.message || 'Checkout failed. Please try again.',
          loading: false 
        });
      });
  }
}

export default withRouter(Mycart);