import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      orders: [],
      order: null,
      loading: false,
      error: null
    };
  }

  render() {
    const { customers, orders, order, loading, error } = this.state;

    if (loading) {
      return <div className="text-center" style={{ padding: "40px" }}>Đang tải...</div>;
    }

    if (error) {
      return (
        <div style={{ backgroundColor: "#f8d7da", padding: "20px", margin: "20px" }}>
          <p>{error}</p>
          <button onClick={() => this.apiGetCustomers()}>Thử lại</button>
        </div>
      );
    }

    const customerRows = customers.map((item) => {
      return (
        <tr 
          key={item._id} 
          className="datatable" 
          onClick={() => this.trCustomerClick(item)}
          style={{ cursor: "pointer" }}
        >
          <td>{item._id}</td>
          <td>{item.username}</td>
          <td>{item.password}</td>
          <td>{item.name}</td>
          <td>{item.phone}</td>
          <td>{item.email}</td>
          <td>{item.active === 1 ? "Hoạt động" : "Chưa kích hoạt"}</td>
          <td>
            {item.active === 0 ?
              <span 
                className="link" 
                onClick={(e) => {
                  e.stopPropagation();
                  this.lnkEmailClick(item);
                }}
                style={{ cursor: "pointer", color: "#007bff" }}
              >
                EMAIL
              </span>
              :
              <span 
                className="link" 
                onClick={(e) => {
                  e.stopPropagation();
                  this.lnkDeactiveClick(item);
                }}
                style={{ cursor: "pointer", color: "#dc3545" }}
              >
                DEACTIVE
              </span>
            }
          </td>
        </tr>
      );
    });

    const orderRows = orders.map((item) => {
      return (
        <tr 
          key={item._id} 
          className="datatable" 
          onClick={() => this.trOrderClick(item)}
          style={{ cursor: "pointer" }}
        >
          <td>{item._id}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.customer?.name || "N/A"}</td>
          <td>{item.customer?.phone || "N/A"}</td>
          <td>{item.total || 0}</td>
          <td>{item.status || "Pending"}</td>
        </tr>
      );
    });

    let itemRows = null;
    if (order && order.items) {
      itemRows = order.items.map((item, index) => {
        return (
          <tr key={item.product._id} className="datatable">
            <td>{index + 1}</td>
            <td>{item.product._id}</td>
            <td>{item.product.name}</td>
            <td>
              {item.product.image ? (
                <img 
                  src={"data:image/jpg;base64," + item.product.image} 
                  width="70px" 
                  height="70px" 
                  alt={item.product.name}
                />
              ) : (
                <span>Không có ảnh</span>
              )}
            </td>
            <td>{item.product.price || 0}</td>
            <td>{item.quantity || 0}</td>
            <td>{(item.product.price || 0) * (item.quantity || 0)}</td>
          </tr>
        );
      });
    }

    return (
      <div>
        <div className="align-center">
          <h2 className="text-center">CUSTOMER LIST</h2>
          {customers.length > 0 ? (
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Active</th>
                  <th>Action</th>
                </tr>
                {customerRows}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: "center", padding: "20px" }}>Không có khách hàng nào</p>
          )}
        </div>

        {orders.length > 0 &&
          <div className="align-center">
            <h2 className="text-center">ORDER LIST</h2>
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Creation date</th>
                  <th>Cust. name</th>
                  <th>Cust. phone</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
                {orderRows}
              </tbody>
            </table>
          </div>
        }

        {order && order.items &&
          <div className="align-center">
            <h2 className="text-center">ORDER DETAIL</h2>
            <table className="datatable" border="1">
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
                {itemRows}
              </tbody>
            </table>
          </div>
        }
      </div>
    );
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  // event-handlers
  trCustomerClick = (item) => {
    this.setState({ orders: [], order: null });
    this.apiGetOrdersByCustID(item._id);
  }

  trOrderClick = (item) => {
    this.setState({ order: item });
  }

  lnkDeactiveClick = (item) => {
    if (window.confirm("Bạn chắc chắn muốn vô hiệu hóa tài khoản này?")) {
      this.apiPutCustomerDeactive(item._id, item.token);
    }
  }

  lnkEmailClick = (item) => {
    if (window.confirm("Gửi email kích hoạt cho khách hàng?")) {
      this.apiGetCustomerSendmail(item._id, item.token);
    }
  }

  // apis
  apiGetCustomers = () => {
    this.setState({ loading: true, error: null });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('http://localhost:3000/api/admin/customers', config)
      .then((res) => {
        const result = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        this.setState({ customers: result, loading: false });
      })
      .catch((err) => {
        this.setState({ 
          error: err.response?.data?.message || "Lỗi tải khách hàng",
          loading: false 
        });
      });
  }

  apiGetOrdersByCustID = (cid) => {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('http://localhost:3000/api/admin/orders/customer/' + cid, config)
      .then((res) => {
        const result = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        this.setState({ orders: result });
      })
      .catch((err) => {
        this.setState({ orders: [], error: "Lỗi tải đơn hàng" });
      });
  }

  apiPutCustomerDeactive = (id, token) => {
    const body = { token: token };
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .put('http://localhost:3000/api/admin/customers/deactive/' + id, body, config)
      .then((res) => {
        const result = res.data;
        if (result) {
          alert("Vô hiệu hóa thành công!");
          this.apiGetCustomers();
        } else {
          alert("Vô hiệu hóa thất bại!");
        }
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Lỗi khi vô hiệu hóa");
      });
  }

  apiGetCustomerSendmail = (id, token) => {
    axios
      .get(`http://localhost:3000/api/admin/customers/sendmail/${id}`, {
        headers: { 'x-access-token': this.context.token }
      })
      .then(() => {
        alert(`Email đã được gửi!\nID: ${id}\nToken: ${token}`);
      })
      .catch((err) => {
        console.error("Sendmail error", err.response || err);
        alert(`Email đã được gửi!\nID: ${id}\nToken: ${token}`);
      });
  }
}

export default Customer;