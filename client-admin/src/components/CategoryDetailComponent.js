import axios from "axios";
import React, { Component } from "react";
import MyContext from "../contexts/MyContext";

class CategoryDetail extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      txtID: "",
      txtName: "",
      loading: false,
      error: null,
    };
  }

  render() {
    const { txtID, txtName, loading, error } = this.state;

    return (
      <div className="float-right">
        <h2 className="text-center">CATEGORY DETAIL</h2>
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
                <td>
                  <input
                    type="text"
                    value={txtID}
                    onChange={(e) => {
                      this.setState({ txtID: e.target.value });
                    }}
                    readOnly={true}
                  />
                </td>
              </tr>
              <tr>
                <td>Name</td>
                <td>
                  <input
                    type="text"
                    value={txtName}
                    onChange={(e) => {
                      this.setState({ txtName: e.target.value });
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <input
                    type="submit"
                    value="ADD NEW"
                    onClick={(e) => this.btnAddClick(e)}
                    disabled={loading}
                  />
                  <input
                    type="submit"
                    value="UPDATE"
                    onClick={(e) => this.btnUpdateClick(e)}
                    disabled={loading}
                  />
                  <input
                    type="submit"
                    value="DELETE"
                    onClick={(e) => this.btnDeleteClick(e)}
                    disabled={loading}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        {loading && <p style={{ textAlign: "center", marginTop: "10px" }}>Đang xử lý...</p>}
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item && this.props.item) {
      this.setState({
        txtID: this.props.item._id || "",
        txtName: this.props.item.name || "",
        error: null,
      });
    } else if (!this.props.item && prevProps.item) {
      this.setState({
        txtID: "",
        txtName: "",
        error: null,
      });
    }
  }

  btnAddClick = (e) => {
    e.preventDefault();
    const name = this.state.txtName.trim();
    if (name) {
      const cate = { name: name };
      this.apiPostCategory(cate);
    } else {
      this.setState({ error: "Vui lòng nhập tên danh mục" });
    }
  };

  btnUpdateClick = (e) => {
    e.preventDefault();
    const id = this.state.txtID.trim();
    const name = this.state.txtName.trim();
    if (id && name) {
      const cate = { name: name };
      this.apiPutCategory(id, cate);
    } else {
      this.setState({ error: "Vui lòng nhập ID và tên" });
    }
  };

  btnDeleteClick = (e) => {
    e.preventDefault();
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      const id = this.state.txtID.trim();
      if (id) {
        this.apiDeleteCategory(id);
      } else {
        this.setState({ error: "Vui lòng chọn danh mục cần xóa" });
      }
    }
  };

  apiPostCategory = (cate) => {
    this.setState({ loading: true, error: null });
    const config = { headers: { "x-access-token": this.context.token } };
    axios
      .post("/api/admin/categories", cate, config)
      .then((res) => {
        const result = res.data;
        if (result) {
          alert("Thêm thành công!");
          this.setState({ txtID: "", txtName: "", loading: false });
          this.apiGetCategories();
        } else {
          this.setState({ error: "Thêm thất bại!", loading: false });
        }
      })
      .catch((err) => {
        this.setState({ 
          error: err.response?.data?.message || "Lỗi khi thêm",
          loading: false 
        });
      });
  };

  apiPutCategory = (id, cate) => {
    this.setState({ loading: true, error: null });
    const config = { headers: { "x-access-token": this.context.token } };
    axios
      .put("/api/admin/categories/" + id, cate, config)
      .then((res) => {
        const result = res.data;
        if (result) {
          alert("Cập nhật thành công!");
          this.setState({ loading: false });
          this.apiGetCategories();
        } else {
          this.setState({ error: "Cập nhật thất bại!", loading: false });
        }
      })
      .catch((err) => {
        this.setState({ 
          error: err.response?.data?.message || "Lỗi khi cập nhật",
          loading: false 
        });
      });
  };

  apiDeleteCategory = (id) => {
    this.setState({ loading: true, error: null });
    const config = { headers: { "x-access-token": this.context.token } };
    axios
      .delete("/api/admin/categories/" + id, config)
      .then((res) => {
        const result = res.data;
        if (result) {
          alert("Xóa thành công!");
          this.setState({ txtID: "", txtName: "", loading: false });
          this.apiGetCategories();
        } else {
          this.setState({ error: "Xóa thất bại!", loading: false });
        }
      })
      .catch((err) => {
        this.setState({ 
          error: err.response?.data?.message || "Lỗi khi xóa",
          loading: false 
        });
      });
  };

  apiGetCategories = () => {
    const config = { headers: { "x-access-token": this.context.token } };
    axios
      .get("/api/admin/categories", config)
      .then((res) => {
        const categories = Array.isArray(res.data?.data) ? res.data.data : [];
        if (categories.length >= 0 && this.props.updateCategories) {
          this.props.updateCategories(categories);
        }
      })
      .catch((err) => {
        this.setState({ error: "Lỗi tải danh sách" });
      });
  };
}
export default CategoryDetail;