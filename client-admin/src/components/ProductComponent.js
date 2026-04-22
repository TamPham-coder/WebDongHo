import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';

const productPageCache = {};

class Product extends Component {
  static contextType = MyContext; // using this.context to access global state
  
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null,
      error: null,
      loading: false
    };
  }

  // Cập nhật 1: Thêm hàm updateProducts sử dụng arrow function
  updateProducts = (products, noPages) => {
    this.setState({
      products: Array.isArray(products) ? products : [],
      noPages: typeof noPages === 'number' ? noPages : 0
    });
  }

  render() {
    const productsRaw = this.state.products;
    const products = Array.isArray(productsRaw)
      ? productsRaw
      : productsRaw && typeof productsRaw === 'object'
      ? Object.values(productsRaw).filter(Boolean)
      : [];

    if (!Array.isArray(productsRaw) && productsRaw !== undefined) {
      console.warn('ProductComponent: products state is not an array', productsRaw);
    }

    const prods = products.filter(Boolean).map((item) => {
      const categoryName = item?.category?.name || 'N/A';
      const imageSrc = item?.image ? `data:image/jpg;base64,${item.image}` : '/images/watch1.jpg';

      return (
        <tr key={item._id || Math.random()} className="datatable" onClick={() => this.trItemClick(item)}>
          <td>{item?._id || 'N/A'}</td>
          <td>{item?.name || 'N/A'}</td>
          <td>{item?.price ?? 'N/A'}</td>
          <td>{item?.cdate ? new Date(item.cdate).toLocaleString() : 'N/A'}</td>
          <td>{categoryName}</td>
          <td style={{ width: '120px', padding: '5px' }}>
            <img className="product-image-thumb" loading="lazy" src={imageSrc} alt={item?.name || 'Product'} />
          </td>
        </tr>
      );
    });

    const pagination = Array.from({ length: this.state.noPages }, (_, index) => {
      if ((index + 1) === this.state.curPage) {
        return (<span key={index}>| <b>{index + 1}</b> |</span>);
      } else {
        return (<span key={index} className="link" onClick={() => this.lnkPageClick(index + 1)}>| {index + 1} |</span>);
      }
    });

    return (
      <div>
        <div className="float-left">
          <h2 className="text-center">PRODUCT LIST</h2>
          {this.state.loading && (
            <div style={{ backgroundColor: '#f3f0d7', color: '#4f432d', padding: '8px', marginBottom: '10px', borderRadius: '4px' }}>
              Đang tải dữ liệu... Hiển thị ngay khi có dữ liệu cũ.
            </div>
          )}
          {this.state.error && (
            <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
              {this.state.error}
            </div>
          )}
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Creation date</th>
                <th>Category</th>
                <th>Image</th>
              </tr>
              {prods}
              <tr>
                <td colSpan="6">{pagination}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="inline" />
        
        {/* Cập nhật 2: Truyền updateProducts vào ProductDetail theo hình ảnh mẫu */}
        <ProductDetail 
          item={this.state.itemSelected} 
          curPage={this.state.curPage} 
          updateProducts={this.updateProducts} 
        />
        
        <div className="float-clear" />
      </div>
    );
  }

  componentDidMount() {
    const cacheKey = `page_${this.state.curPage}`;
    const cachedPage = productPageCache[cacheKey];
    if (cachedPage) {
      this.setState({
        products: cachedPage.products,
        noPages: cachedPage.noPages,
        loading: false,
        error: null
      });
    }
    this.apiGetProducts(this.state.curPage);
  }

  // event-handlers
  lnkPageClick(index) {
    const cacheKey = `page_${index}`;
    const cachedPage = productPageCache[cacheKey];
    if (cachedPage) {
      this.setState({
        products: cachedPage.products,
        noPages: cachedPage.noPages,
        curPage: index,
        loading: false,
        error: null
      });
    }
    this.apiGetProducts(index);
  }

  trItemClick(item) {
    this.setState({ itemSelected: item });
  }

  // apis
  apiGetProducts(page) {
    this.setState({ loading: true, error: null });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('http://localhost:3000/api/admin/products?page=' + page, config).then((res) => {
      const payload = res.data?.data ?? res.data ?? {};
      const products = Array.isArray(payload.products)
        ? payload.products
        : Array.isArray(payload)
        ? payload
        : [];
      const nextPage = typeof payload.curPage === 'number' ? payload.curPage : page || 1;
      this.setState({ 
        products,
        noPages: typeof payload.noPages === 'number' ? payload.noPages : 0,
        curPage: nextPage,
        loading: false,
        error: null
      });
      productPageCache[`page_${nextPage}`] = {
        products,
        noPages: typeof payload.noPages === 'number' ? payload.noPages : 0
      };
    }).catch((error) => {
      console.error("API Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        'Lỗi tải sản phẩm';
      this.setState({ loading: false, products: [], noPages: 0, error: errorMessage });
    });
  }
}

export default Product;