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
    };
  }

  render() {
    return (
      <div className="float-right">
        <h2 className="text-center">CATEGORY DETAIL</h2>
        <form>
          <table>
            <tbody>
              <tr>
                <td>ID</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtID}
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
                    value={this.state.txtName}
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
                  />
                  <input
                    type="submit"
                    value="UPDATE"
                    onClick={(e) => this.btnUpdateClick(e)}
                  />
                  {/* --- SỬA DÒNG NÀY: Thêm sự kiện onClick cho nút DELETE --- */}
                  <input
                    type="submit"
                    value="DELETE"
                    onClick={(e) => this.btnDeleteClick(e)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      this.setState({
        txtID: this.props.item._id,
        txtName: this.props.item.name,
      });
    }
  }

  // --- CÁC HÀM CŨ (GIỮ NGUYÊN) ---
  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName;
    if (name) {
      const cate = { name: name };
      this.apiPostCategory(cate);
    } else {
      alert("Please input name");
    }
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName;
    if (id && name) {
      const cate = { name: name };
      this.apiPutCategory(id, cate);
    } else {
      alert("Please input id and name");
    }
  }

  apiPostCategory(cate) {
    const config = { headers: { "x-access-token": this.context.token } };
    axios
      .post("http://localhost:3000/api/admin/categories", cate, config).then((res) => {const result = res.data;
        if (result) {
          alert("OK BABY!");
          this.apiGetCategories();
        } else {
          alert("SORRY BABY!");
        }
      });
  }

  apiPutCategory(id, cate) {
    const config = { headers: { "x-access-token": this.context.token } };
    axios
      .put("http://localhost:3000/api/admin/categories/" + id, cate, config)
      .then((res) => {
        const result = res.data;
        if (result) {
          alert("OK BABY!");
          this.apiGetCategories();
        } else {
          alert("SORRY BABY!");
        }
      });
  }

  apiGetCategories() {
    const config = { headers: { "x-access-token": this.context.token } };
    axios
      .get("http://localhost:3000/api/admin/categories", config)
      .then((res) => {
        const result = res.data;
        this.props.updateCategories(result);
      });
  }
  // 1. Xử lý khi bấm nút DELETE
  btnDeleteClick(e) {
    e.preventDefault();
    // Hiện thông báo xác nhận: Are you sure?
    if (window.confirm("ARE YOU SURE?")) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteCategory(id);
      } else {
        alert("Please input id");
      }
    }
  }

  // 2. Gọi API Xóa
  apiDeleteCategory(id) {
    const config = { headers: { "x-access-token": this.context.token } };
    // Gọi method DELETE lên Server
    axios
      .delete("http://localhost:3000/api/admin/categories/" + id, config)
      .then((res) => {
        const result = res.data;
        if (result) {
          alert("OK BABY!");
          this.apiGetCategories(); // Load lại danh sách
        } else {
          alert("SORRY BABY!");
        }
      });
  }
}
export default CategoryDetail;