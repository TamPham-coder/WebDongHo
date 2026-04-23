import axios from "axios";
import React, { Component } from "react";
import MyContext from "../contexts/MyContext";
import CategoryDetail from "./CategoryDetailComponent";

class Category extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      itemSelected: null,
    };
  }

  render() {
    console.log("CategoryComponent render - categories:", this.state.categories);
    const cates = this.state.categories.map((item) => {
      return (
        <tr
          key={item._id}
          className="datatable"
          onClick={() => this.trItemClick(item)}
        >
          <td>{item._id}</td>
          <td>{item.name}</td>
        </tr>
      );
    });
    return (
      <div>
        <div className="float-left">
          <h2 className="text-center">CATEGORY LIST</h2>
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Name</th>
              </tr>
              {cates}
            </tbody>
          </table>
        </div>
        <div className="inline" />
        {}
        <CategoryDetail
          item={this.state.itemSelected}
          updateCategories={this.updateCategories}
        />
        <div className="float-clear" />
      </div>
    );
  }

  updateCategories = (categories) => {
    this.setState({ categories: categories });
  };

  componentDidMount() {
    console.log("CategoryComponent mounted, token:", this.context.token);
    this.apiGetCategories();
  }

  trItemClick(item) {
    this.setState({ itemSelected: item });
  }

  apiGetCategories() {
    const config = { headers: { "x-access-token": this.context.token } };
    axios
      .get("http://localhost:3000/api/admin/categories", config)
      .then((res) => {
        console.log("API Response:", res.data);
        const categories = res.data?.data || [];
        const result = Array.isArray(categories) ? categories : [];
        console.log("Categories to set:", result);
        this.setState({ categories: result });
      })
      .catch((err) => {
        console.error('Get categories error:', err);
        this.setState({ categories: [] });
      });
  }
}
export default Category;