import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtID: '',
      txtName: '',
      txtPrice: 0,
      cmbCategory: '',
      imgProduct: '',
    };
  }

  // --- HELPER ---
  clearForm() {
    this.setState({
      txtID: '',
      txtName: '',
      txtPrice: 0,
      cmbCategory: '',
      imgProduct: ''
    });
  }

  render() {
    const cates = this.state.categories.map((cate) => {
      return (<option key={cate._id} value={cate._id}>{cate.name}</option>);
    });

    return (
      <div className="float-right">
        <h2 className="text-center">PRODUCT DETAIL</h2>
        <form>
          <table>
            <tbody>
              <tr>
                <td>ID</td>
                <td><input type="text" value={this.state.txtID} readOnly={true} /></td>
              </tr>
              <tr>
                <td>Name</td>
                <td><input type="text" value={this.state.txtName} onChange={(e) => this.setState({ txtName: e.target.value })} /></td>
              </tr>
              <tr>
                <td>Price</td>
                <td><input type="number" value={this.state.txtPrice} onChange={(e) => this.setState({ txtPrice: e.target.value })} /></td>
              </tr>
              <tr>
                <td>Image</td>
                <td><input type="file" name="fileImage" accept="image/jpeg, image/png, image/gif" onChange={(e) => this.previewImage(e)} /></td>
              </tr>
              <tr>
                <td>Category</td>
                <td>
                  <select value={this.state.cmbCategory} onChange={(e) => this.setState({ cmbCategory: e.target.value })}>
                    <option value="">---select---</option>
                    {cates}
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <input type="button" value="ADD NEW" onClick={(e) => this.btnAddClick(e)} />
                  <input type="button" value="UPDATE" onClick={(e) => this.btnUpdateClick(e)} />
                  <input type="button" value="DELETE" onClick={(e) => this.btnDeleteClick(e)} />
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <img src={this.state.imgProduct} width="300px" height="300px" alt="Preview" />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item && this.props.item !== null) {
      this.setState({
        txtID: this.props.item._id,
        txtName: this.props.item.name,
        txtPrice: this.props.item.price,cmbCategory: this.props.item.category._id,
        imgProduct: this.props.item.image ? `data:image/jpg;base64,${this.props.item.image}` : ''
      });
    }
  }

  // --- EVENT HANDLERS ---
  previewImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.setState({ imgProduct: evt.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  btnAddClick(e) {
    e.preventDefault();
    const txtName = this.state.txtName;
    const txtPrice = this.state.txtPrice;
    const cmbCategory = this.state.cmbCategory;
    const imgProduct = this.state.imgProduct;
    const image = imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');
    
    if (txtName && txtPrice && cmbCategory && image) {
      const prod = { name: txtName, price: parseInt(txtPrice), category: cmbCategory, image: image };
      this.apiPostProduct(prod);
    } else {
      alert('Vui lòng nhập đầy đủ thông tin!');
    }
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const txtID = this.state.txtID;
    const txtName = this.state.txtName;
    const txtPrice = this.state.txtPrice;
    const cmbCategory = this.state.cmbCategory;
    const imgProduct = this.state.imgProduct;
    const image = imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');

    if (txtID && txtName && txtPrice && cmbCategory && image) {
      const prod = { name: txtName, price: parseInt(txtPrice), category: cmbCategory, image: image };
      this.apiPutProduct(txtID, prod);
    } else {
      alert('Vui lòng chọn sản phẩm và nhập đủ thông tin!');
    }
  }

  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('ARE YOU SURE?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteProduct(id);
      } else {
        alert('Please input id');
      }
    }
  }

  // --- APIS ---
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('http://localhost:3000/api/admin/categories', config).then((res) => {
      this.setState({ categories: res.data });
    });
  }

  apiPostProduct(prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('http://localhost:3000/api/admin/products', prod, config).then((res) => {
      if (res.data) {
        alert('OK BABY!');
        this.clearForm();
        this.apiGetProducts();
      } else {
        alert('SORRY BABY!');
      }
    });
  }

  apiPutProduct(id, prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('http://localhost:3000/api/admin/products/' + id, prod, config).then((res) => {
      if (res.data) {
        alert('OK BABY!');
        this.apiGetProducts();
      } else {
        alert('SORRY BABY!');
      }
    });
  }

  apiDeleteProduct(id) {
    const config = { headers: { 'x-access-token': this.context.token } };axios.delete('http://localhost:3000/api/admin/products/' + id, config).then((res) => {
      if (res.data) {
        alert('OK BABY!');
        this.clearForm();
        this.apiGetProducts();
      } else {
        alert('SORRY BABY!');
      }
    });
  }

  apiGetProducts() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('http://localhost:3000/api/admin/products?page=' + this.props.curPage, config).then((res) => {
      const result = res.data;
      if (result.products.length !== 0) {
        this.props.updateProducts(result.products, result.noPages);
      } else {
        // Nếu xóa hết ở trang hiện tại, lùi về 1 trang
        axios.get('http://localhost:3000/api/admin/products?page=' + (this.props.curPage - 1), config).then((res) => {
          const result = res.data;
          this.props.updateProducts(result.products, result.noPages);
        });
      }
    });
  }
}

export default ProductDetail;