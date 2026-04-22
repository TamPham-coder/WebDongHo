import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';
import CartUtil from '../utils/CartUtil';

class Payment extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      paymentMethod: 'qr',
      loading: false,
      error: null,
      success: null
    };
  }

  render() {
    if (this.context.token === '') {
      return <Navigate replace to="/login" />;
    }

    const mycart = Array.isArray(this.context.mycart) ? this.context.mycart : [];
    if (mycart.length === 0) {
      return (
        <div className="align-center">
          <h2 className="text-center">Thanh toán</h2>
          <p style={{ textAlign: 'center', padding: '20px' }}>Giỏ hàng của bạn đang trống.</p>
        </div>
      );
    }

    const { paymentMethod, loading, error, success } = this.state;
    const total = CartUtil.getTotal(mycart);
    const qrValue = JSON.stringify({
      type: 'SHOP_PAYMENT',
      customer: this.context.customer?._id || 'guest',
      amount: total,
      orderTime: new Date().toISOString()
    });

    return (
      <div className="align-center">
        <h2 className="text-center">CHECKOUT</h2>

        {error && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '6px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '6px', marginBottom: '16px', textAlign: 'center' }}>
            {success}
          </div>
        )}

        <div className="table-container" style={{ marginBottom: '24px', maxWidth: '860px', width: '100%' }}>
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Amount</th>
              </tr>
              {mycart.map((item, index) => (
                <tr key={item.product._id || index} className="datatable">
                  <td>{item.product._id}</td>
                  <td>{item.product.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.product.price || 0}</td>
                  <td>{(item.product.price || 0) * (item.quantity || 0)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                <td>{total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ width: '100%', maxWidth: '860px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => this.setState({ paymentMethod: e.target.value, error: null })}
              disabled={loading}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="qr">QR Scan Payment</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {paymentMethod === 'qr' && (
            <div style={{ marginBottom: '16px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#ffffff', color: '#111' }}>
              <h4 style={{ marginTop: 0, color: '#111' }}>Quét mã QR để thanh toán</h4>
              <p style={{ color: '#222' }}>Quét mã QR bằng ứng dụng ngân hàng, Momo, ZaloPay hoặc QRPay của bạn.</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '12px' }}>
                <QRCode value={qrValue} size={192} level="M" />
              </div>
              <p style={{ margin: '0 0 8px 0', color: '#222' }}><strong>Amount:</strong> ${total}</p>
              <p style={{ margin: 0, color: '#222' }}>Sau khi quét và thanh toán, nhấn nút <strong>Pay</strong> để xác nhận đơn hàng.</p>
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div style={{ marginBottom: '16px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f8f9fa', color: '#111' }}>
              <h4 style={{ marginTop: 0, color: '#111' }}>Giao hàng thu tiền sau</h4>
              <p style={{ color: '#222' }}>Chọn phương thức này để thanh toán khi nhân viên giao hàng tới.</p>
              <p style={{ color: '#222' }}>Lưu ý: đơn hàng sẽ có trạng thái <strong>COD_PENDING</strong> cho đến khi hoàn tất thu tiền.</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => this.btnPayClick()}
            disabled={loading}
            style={{ padding: '12px 24px', backgroundColor: '#c49c2d', color: '#111', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Processing payment...' : paymentMethod === 'cod' ? `Place COD order` : `Pay $${total}`}
          </button>
        </div>
      </div>
    );
  }

  btnPayClick() {
    const { paymentMethod } = this.state;
    const mycart = Array.isArray(this.context.mycart) ? this.context.mycart : [];

    if (mycart.length === 0) {
      this.setState({ error: 'Giỏ hàng trống', success: null });
      return;
    }

    this.apiPayAndCheckout({ paymentMethod });
  }

  apiPayAndCheckout(paymentInfo) {
    this.setState({ loading: true, error: null, success: null });
    const body = {
      total: CartUtil.getTotal(this.context.mycart),
      items: this.context.mycart,
      customer: this.context.customer,
      paymentInfo: {
        method: paymentInfo.paymentMethod
      }
    };
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios
      .post('http://localhost:3000/api/customer/checkout', body, config)
      .then((res) => {
        const result = res.data;
        if (result) {
          this.context.setMycart([]);
          this.setState({
            success: 'Thanh toán thành công! Đơn hàng đã được tạo.',
            loading: false
          });
          setTimeout(() => {
            this.props.navigate('/myorders');
          }, 1500);
        } else {
          this.setState({ error: 'Thanh toán thất bại', loading: false });
        }
      })
      .catch((err) => {
        console.error('Payment error:', err.response?.data || err.message);
        this.setState({ error: err.response?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại.', loading: false });
      });
  }
}

export default withRouter(Payment);
