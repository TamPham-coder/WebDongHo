import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';

class Product extends Component {
  static contextType = MyContext; // using this.context to access global state
  
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null
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
          <td><img src={imageSrc} width="100px" height="100px" alt={item?.name || 'Product'} /></td>
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
    this.apiGetProducts(this.state.curPage);
  }

  // event-handlers
  lnkPageClick(index) {
    this.apiGetProducts(index);
  }

  trItemClick(item) {
    this.setState({ itemSelected: item });
  }

  // apis
  apiGetProducts(page) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('http://localhost:3000/api/admin/products?page=' + page, config).then((res) => {
      const payload = res.data?.data ?? res.data ?? {};
      const products = Array.isArray(payload.products)
        ? payload.products
        : Array.isArray(payload)
        ? payload
        : [];
      this.setState({ 
        products,
        noPages: typeof payload.noPages === 'number' ? payload.noPages : 0,
        curPage: typeof payload.curPage === 'number' ? payload.curPage : page || 1 
      });
    }).catch((error) => {
      console.error("API Error:", error);
      this.setState({ products: [], noPages: 0 });
    });
  }
}

export default Product;