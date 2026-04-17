import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

class Myorders extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null,
      customerId: null,
      error: null
    };
    this._hasFetchedOrders = false;
  }

  render() {
    if (this.context.token === '') {
      return <Navigate replace to="/login" />;
    }

    const orderList = Array.isArray(this.state.orders) ? this.state.orders : [];
    const orders = orderList.map((item) => {
      return (
        <tr
          key={item._id}
          className="datatable"
          onClick={() => this.trItemClick(item)}
          style={{ cursor: 'pointer' }}
        >
          <td>{item._id}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.customer?.name || 'N/A'}</td>
          <td>{item.customer?.phone || 'N/A'}</td>
          <td>{item.total}</td>
          <td>{item.status}</td>
        </tr>
      );
    });

    let items = null;
    if (this.state.order) {
      items = this.state.order.items.map((item, index) => {
        return (
          <tr key={item.product._id || index} className="datatable">
            <td>{index + 1}</td>
            <td>{item.product._id}</td>
            <td>{item.product.name}</td>
            <td>
              <img
                src={'data:image/jpg;base64,' + item.product.image}
                width="70px"
                height="70px"
                alt={item.product.name}
              />
            </td>
            <td>{item.product.price}</td>
            <td>{item.quantity}</td>
            <td>{item.product.price * item.quantity}</td>
          </tr>
        );
      });
    }

    return (
      <div className="page-section">
        <div className="page-card">
          <h2 className="text-center">ORDER LIST</h2>

          <div className="table-wrapper">
            <table className="datatable order-table">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Creation date</th>
                  <th>Cust. name</th>
                  <th>Cust. phone</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
                {orders}
              </tbody>
            </table>
          </div>

          {this.state.order ? (
            <div className="table-wrapper" style={{ marginTop: '32px' }}>
              <h2 className="text-center">ORDER DETAIL</h2>
              <table className="datatable order-table">
                <tbody>
                  <tr className="datatable">
                    <th>No.</th>
                    <th>Prod. ID</th>
                    <th>Prod. name</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                  </tr>
                  {items}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  componentDidMount() {
    if (this.context.customer) {
      this.setOrdersForCustomer(this.context.customer);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const customer = this.context.customer;
    if (customer && customer._id !== prevState.customerId) {
      this.setOrdersForCustomer(customer);
    }
  }

  setOrdersForCustomer(customer) {
    this.setState({ customerId: customer._id });
    this.apiGetOrdersByCustID(customer._id);
  }

  trItemClick(item) {
    this.setState({ order: item });
  }

  apiGetOrdersByCustID(cid) {
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios
      .get('http://localhost:3000/api/customer/orders/customer/' + cid, config)
      .then((res) => {
        this._hasFetchedOrders = true;
        const data = res.data;
        const orders = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        if (!Array.isArray(orders)) {
          console.warn('MyordersComponent: expected array but got', data);
        }

        this.setState({ orders, error: null });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          orders: [],
          error: err.response?.data?.message || 'Lỗi tải đơn hàng'
        });
      });
  }
}

export default Myorders;