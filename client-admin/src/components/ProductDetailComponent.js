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
      loading: false,
      error: null
    };
  }

  // --- HELPER ---
  clearForm() {
    this.setState({
      txtID: '',
      txtName: '',
      txtPrice: 0,
      cmbCategory: '',
      imgProduct: '',
      error: null
    });
  }

  render() {
    const { categories, txtID, txtName, txtPrice, cmbCategory, imgProduct, loading, error } = this.state;
    const safeCategories = Array.isArray(categories) ? categories : [];

    const cates = safeCategories.map((cate) => {
      return (<option key={cate._id} value={cate._id}>{cate.name}</option>);
    });

    return (
      <div className="float-right">
        <h2 className="text-center">PRODUCT DETAIL</h2>
        
        {error && (
          <div style={{ backgroundColor: "#f8d7da", padding: "10px", marginBottom: "10px", color: "#721c24" }}>
            {error}
          </div>
        )}

        <form>
          <table>
            <tbody>
              <tr>
                <td>ID</td>
                <td><input type="text" value={txtID} readOnly={true} /></td>
              </tr>
              <tr>
                <td>Name</td>
                <td><input type="text" value={txtName} onChange={(e) => this.setState({ txtName: e.target.value, error: null })} disabled={loading} /></td>
              </tr>
              <tr>
                <td>Price</td>
                <td><input type="number" value={txtPrice} onChange={(e) => this.setState({ txtPrice: e.target.value, error: null })} disabled={loading} /></td>
              </tr>
              <tr>
                <td>Image</td>
                <td><input type="file" name="fileImage" accept="image/jpeg, image/png, image/gif" onChange={(e) => this.previewImage(e)} disabled={loading} /></td>
              </tr>
              <tr>
                <td>Category</td>
                <td>
                  <select value={cmbCategory} onChange={(e) => this.setState({ cmbCategory: e.target.value, error: null })} disabled={loading}>
                    <option value="">---select---</option>
                    {cates}
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <input type="button" value={loading ? "PROCESSING..." : "ADD NEW"} onClick={(e) => this.btnAddClick(e)} disabled={loading} />
                  <input type="button" value={loading ? "PROCESSING..." : "UPDATE"} onClick={(e) => this.btnUpdateClick(e)} disabled={loading} />
                  <input type="button" value={loading ? "PROCESSING..." : "DELETE"} onClick={(e) => this.btnDeleteClick(e)} disabled={loading} />
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <img src={imgProduct} width="300px" height="300px" alt={txtName || "Product Preview"} />
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
        txtPrice: this.props.item.price,
        cmbCategory: this.props.item.category?._id || '',
        imgProduct: this.props.item.image ? `data:image/jpg;base64,${this.props.item.image}` : '',
        error: null
      });
    } else if (this.props.item === null && prevProps.item !== null) {
      this.clearForm();
    }
  }

  // --- EVENT HANDLERS ---
  previewImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.setState({ imgProduct: evt.target.result, error: null });
      };
      reader.readAsDataURL(file);
    }
  }

  btnAddClick(e) {
    e.preventDefault();
    const txtName = this.state.txtName.trim();
    const txtPrice = parseFloat(this.state.txtPrice);
    const cmbCategory = this.state.cmbCategory;
    const imgProduct = this.state.imgProduct;

    if (!txtName) {
      this.setState({ error: 'Vui lòng nhập tên sản phẩm' });
      return;
    }
    if (!txtPrice || txtPrice <= 0) {
      this.setState({ error: 'Vui lòng nhập giá hợp lệ' });
      return;
    }
    if (!cmbCategory) {
      this.setState({ error: 'Vui lòng chọn danh mục' });
      return;
    }
    if (!imgProduct) {
      this.setState({ error: 'Vui lòng chọn hình ảnh' });
      return;
    }

    const image = imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');
    const prod = { name: txtName, price: txtPrice, category: cmbCategory, image: image };
    this.apiPostProduct(prod);
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const txtID = this.state.txtID;
    const txtName = this.state.txtName.trim();
    const txtPrice = parseFloat(this.state.txtPrice);
    const cmbCategory = this.state.cmbCategory;
    const imgProduct = this.state.imgProduct;

    if (!txtID) {
      this.setState({ error: 'Vui lòng chọn sản phẩm cần cập nhật' });
      return;
    }
    if (!txtName) {
      this.setState({ error: 'Vui lòng nhập tên sản phẩm' });
      return;
    }
    if (!txtPrice || txtPrice <= 0) {
      this.setState({ error: 'Vui lòng nhập giá hợp lệ' });
      return;
    }
    if (!cmbCategory) {
      this.setState({ error: 'Vui lòng chọn danh mục' });
      return;
    }
    if (!imgProduct) {
      this.setState({ error: 'Vui lòng chọn hình ảnh' });
      return;
    }

    const image = imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');
    const prod = { name: txtName, price: txtPrice, category: cmbCategory, image: image };
    this.apiPutProduct(txtID, prod);
  }

  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('ARE YOU SURE?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteProduct(id);
      } else {
        this.setState({ error: 'Vui lòng chọn sản phẩm cần xóa' });
      }
    }
  }

  // --- APIS ---
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('http://localhost:3000/api/admin/categories', config)
      .then((res) => {
        const categories = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        this.setState({ categories });
      })
      .catch((err) => {
        this.setState({ error: 'Lỗi tải danh mục' });
      });
  }

  apiPostProduct(prod) {
    this.setState({ loading: true, error: null });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .post('http://localhost:3000/api/admin/products', prod, config)
      .then((res) => {
        if (res.data) {
          alert('OK BABY!');
          this.clearForm();
          this.apiGetProducts();
        } else {
          this.setState({ error: 'Thêm sản phẩm thất bại' });
        }
      })
      .catch((err) => {
        this.setState({ 
          error: err.response?.data?.message || 'Lỗi khi thêm sản phẩm'
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  apiPutProduct(id, prod) {
    this.setState({ loading: true, error: null });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .put('http://localhost:3000/api/admin/products/' + id, prod, config)
      .then((res) => {
        if (res.data) {
          alert('OK BABY!');
          this.apiGetProducts();
        } else {
          this.setState({ error: 'Cập nhật sản phẩm thất bại' });
        }
      })
      .catch((err) => {
        this.setState({ 
          error: err.response?.data?.message || 'Lỗi khi cập nhật sản phẩm'
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  apiDeleteProduct(id) {
    this.setState({ loading: true, error: null });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .delete('http://localhost:3000/api/admin/products/' + id, config)
      .then((res) => {
        if (res.data) {
          alert('OK BABY!');
          this.clearForm();
          this.apiGetProducts();
        } else {
          this.setState({ error: 'Xóa sản phẩm thất bại' });
        }
      })
      .catch((err) => {
        this.setState({ 
          error: err.response?.data?.message || 'Lỗi khi xóa sản phẩm'
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  apiGetProducts() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('http://localhost:3000/api/admin/products?page=' + this.props.curPage, config)
      .then((res) => {
        const result = res.data?.data ?? res.data ?? {};
        const products = Array.isArray(result.products) ? result.products : [];
        if (products.length !== 0) {
          this.props.updateProducts(products, result.noPages);
        } else {
          // Nếu xóa hết ở trang hiện tại, lùi về 1 trang
          axios
            .get('http://localhost:3000/api/admin/products?page=' + (this.props.curPage - 1), config)
            .then((res) => {
              const result = res.data?.data ?? res.data ?? {};
              this.props.updateProducts(Array.isArray(result.products) ? result.products : [], result.noPages || 0);
            })
            .catch((err) => {
              this.props.updateProducts([], 0);
            });
        }
      })
      .catch((err) => {
        this.setState({ error: 'Lỗi tải sản phẩm' });
      });
  }
}

export default ProductDetail;