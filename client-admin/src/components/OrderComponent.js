import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null,
      loading: false,
      error: null,
      updatingOrderId: null // Track which order is being updated
    };
  }

  render() {
    const { orders, order, loading, error, updatingOrderId } = this.state;

    const stats = orders.reduce(
      (acc, item) => {
        const status = String(item.status || 'PENDING').toUpperCase();
        acc.total += 1;
        if (!acc.counts[status]) acc.counts[status] = 0;
        acc.counts[status] += 1;
        return acc;
      },
      {
        total: 0,
        counts: {
          PENDING: 0,
          APPROVED: 0,
          REJECTED: 0,
          CANCELED: 0,
          SHIPPED: 0,
          DELIVERED: 0
        }
      }
    );

    const statusLabel = (status) => {
      const statusMap = {
        PENDING: 'warning',
        APPROVED: 'success',
        REJECTED: 'danger',
        CANCELED: 'danger',
        SHIPPED: 'info',
        DELIVERED: 'success'
      };
      return statusMap[status] || 'muted';
    };

    const renderStatusPill = (status) => {
      return (
        <span className={`status-pill status-${statusLabel(status)}`}>{status}</span>
      );
    };

    if (loading) {
      return <div className="text-center" style={{ padding: '40px' }}>Đang tải dữ liệu đơn hàng...</div>;
    }

    return (
      <div className="body-admin">
        <div className="border-bottom">
          <div>
            <h2>ORDER MANAGEMENT</h2>
            <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
              Quản lý đơn hàng, duyệt hoặc hủy các yêu cầu đang chờ.
            </p>
          </div>
          <div className="summary-line">
            <span className="status-pill status-success">Total: {stats.total}</span>
            <span className="status-pill status-warning">Pending: {stats.counts.PENDING}</span>
            <span className="status-pill status-success">Approved: {stats.counts.APPROVED}</span>
            <span className="status-pill status-danger">Canceled: {stats.counts.CANCELED + stats.counts.REJECTED}</span>
          </div>
        </div>

        {error && (
          <div className="panel" style={{ marginBottom: '20px' }}>
            <p style={{ margin: 0, color: 'var(--danger)' }}>{error}</p>
          </div>
        )}

        <div className="table-container" style={{ marginBottom: '28px' }}>
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Creation date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
              {orders.length > 0 ? (
                orders.map((item) => {
                  const isUpdating = updatingOrderId === item._id;
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
                      <td>{item.total || 0}</td>
                      <td>{renderStatusPill(item.status || 'PENDING')}</td>
                      <td>
                        {item.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="status-action"
                              disabled={isUpdating}
                              onClick={(e) => {
                                e.stopPropagation();
                                this.lnkApproveClick(item._id);
                              }}
                            >
                              {isUpdating ? 'APPROVING...' : 'APPROVE'}
                            </button>
                            <button
                              type="button"
                              className="status-action status-cancel"
                              disabled={isUpdating}
                              onClick={(e) => {
                                e.stopPropagation();
                                this.lnkCancelClick(item._id);
                              }}
                            >
                              {isUpdating ? 'CANCELING...' : 'CANCEL'}
                            </button>
                          </div>
                        ) : (
                          renderStatusPill(item.status || 'PENDING')
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                    Không có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0 }}>Order Detail</h3>
          {order && order.items ? (
            <>
              <p style={{ margin: '0 0 16px 0' }}>
                <strong>Selected Order:</strong> {order._id}
              </p>
              <div className="table-container">
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
                    {order.items.map((item, index) => (
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
                        <td>{item.product.price || 0}</td>
                        <td>{item.quantity || 0}</td>
                        <td>{(item.product.price || 0) * (item.quantity || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p>Nhấn vào một đơn hàng để xem chi tiết.</p>
          )}
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.apiGetOrders();
  }

  // event-handlers
  trItemClick = (item) => {
    this.setState({ order: item });
  }

  lnkApproveClick = (id) => {
    if (window.confirm("Bạn chắc chắn muốn duyệt đơn hàng này?")) {
      this.apiPutOrderStatus(id, 'APPROVED');
    }
  }

  lnkCancelClick = (id) => {
    if (window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) {
      this.apiPutOrderStatus(id, 'CANCELED');
    }
  }

  // apis
  apiGetOrders = () => {
    this.setState({ loading: true, error: null });
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios
      .get('http://localhost:3000/api/admin/orders', config)
      .then((res) => {
        const result = res.data;
        const orders = Array.isArray(result)
          ? result
          : Array.isArray(result?.orders)
          ? result.orders
          : Array.isArray(result?.data)
          ? result.data
          : [];
        this.setState({ orders, loading: false });
      })
      .catch((err) => {
        this.setState({ 
          error: err.response?.data?.message || "Lỗi tải đơn hàng",
          loading: false 
        });
      });
  }

  apiPutOrderStatus = (id, status) => {
    this.setState({ updatingOrderId: id });
    const body = { status: status };
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios
      .put(`http://localhost:3000/api/admin/orders/status/${id}`, body, config)
      .then((res) => {
        const result = res.data;
        if (result?.success) {
          this.setState({ updatingOrderId: null });
          this.apiGetOrders();
        } else {
          alert(result?.message || 'Cập nhật thất bại!');
          this.setState({ updatingOrderId: null });
        }
      })
      .catch((err) => {
        console.error('Update order status error:', err.response || err);
        alert(err.response?.data?.message || err.message || 'Lỗi cập nhật trạng thái');
        this.setState({ updatingOrderId: null });
      });
  }
}

export default Order;