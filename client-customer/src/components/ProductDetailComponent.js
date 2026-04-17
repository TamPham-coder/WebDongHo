import axios from 'axios';
import React, { Component } from 'react';
import withRouter from '../utils/withRouter';
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      product: null,
      txtQuantity: 1,
      loading: false,
      error: null,
      success: null
    };
  }

  render() {
    const { product, txtQuantity, loading, error, success } = this.state;

    if (loading) {
      return <div className="text-center" style={{ padding: '40px' }}>Đang tải...</div>;
    }

    if (error) {
      return <div className="text-center" style={{ padding: '40px', color: '#ff6b6b' }}>{error}</div>;
    }

    if (!product) {
      return <div className="text-center" style={{ padding: '40px' }}>Không tìm thấy sản phẩm.</div>;
    }

    const imageSrc = product.image ? `data:image/jpg;base64,${product.image}` : '/images/watch1.jpg';

    return (
      <div className="align-center">
        <h2 className="text-center">PRODUCT DETAILS</h2>

        {success && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
            {success}
          </div>
        )}

        <figure className="caption-right">
          <img
            src={imageSrc}
            width="400px"
            height="400px"
            alt={product.name || 'Product'}
          />
          <figcaption>
            <form>
              <table>
                <tbody>
                  <tr>
                    <td align="right">ID :</td>
                    <td>{product._id}</td>
                  </tr>
                  <tr>
                    <td align="right">Name :</td>
                    <td>{product.name}</td>
                  </tr>
                  <tr>
                    <td align="right">Price :</td>
                    <td>{product.price}</td>
                  </tr>
                  <tr>
                    <td align="right">Category :</td>
                    <td>{product.category?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td align="right">Quantity :</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={txtQuantity}
                        onChange={(e) => this.setState({ txtQuantity: Number(e.target.value), success: null })}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <input
                        type="submit"
                        value="ADD TO CART"
                        onClick={(e) => this.btnAdd2CartClick(e)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </figcaption>
        </figure>
      </div>
    );
  }

  componentDidMount() {
    this.loadProduct();
  }

  componentDidUpdate(prevProps) {
    const prevId = prevProps.params?.id;
    const currentId = this.props.params?.id;
    if (currentId && currentId !== prevId) {
      this.loadProduct();
    }
  }

  loadProduct() {
    const id = this.props.params?.id;
    if (!id) {
      this.setState({ error: 'Product ID không hợp lệ.', loading: false, product: null });
      return;
    }
    this.apiGetProduct(id);
  }

  apiGetProduct(id) {
    this.setState({ loading: true, error: null, success: null });
    axios
      .get('http://localhost:3000/api/customer/products/' + id)
      .then((res) => {
        const product = res.data?.data ?? res.data ?? null;
        this.setState({ product, loading: false, error: product ? null : 'Không tìm thấy sản phẩm.' });
      })
      .catch((err) => {
        this.setState({
          loading: false,
          product: null,
          error: err.response?.data?.message || 'Lỗi tải sản phẩm.'
        });
      });
  }

  btnAdd2CartClick(e) {
    e.preventDefault();
    const product = this.state.product;
    const quantity = Number(this.state.txtQuantity);

    if (!quantity || quantity < 1) {
      this.setState({ success: null, error: 'Please input quantity' });
      return;
    }

    const mycart = [...this.context.mycart];
    const index = mycart.findIndex((x) => x.product._id === product._id);

    if (index === -1) {
      mycart.push({ product, quantity });
    } else {
      mycart[index] = {
        ...mycart[index],
        quantity: mycart[index].quantity + quantity
      };
    }

    this.context.setMycart(mycart);
    this.setState({ success: 'Đã thêm vào giỏ hàng!', error: null });
  }
}

export default withRouter(ProductDetail);