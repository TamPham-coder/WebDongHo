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
    this.setState({ products: products, noPages: noPages });
  }

  render() {
    const prods = this.state.products.map((item) => {
      return (
        <tr key={item._id} className="datatable" onClick={() => this.trItemClick(item)}>
          <td>{item._id}</td>
          <td>{item.name}</td>
          <td>{item.price}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.category.name}</td>
          <td><img src={"data:image/jpg;base64," + item.image} width="100px" height="100px" alt="" /></td>
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
      const result = res.data;
      this.setState({ 
        products: result.products,noPages: result.noPages, 
        curPage: result.curPage 
      });
    }).catch((error) => {
      console.error("API Error:", error);
    });
  }
}

export default Product;