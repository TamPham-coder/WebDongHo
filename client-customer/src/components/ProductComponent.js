import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import withRouter from "../utils/withRouter";

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loading: false,
      error: null
    };
  }

  render() {
    const { products, loading, error } = this.state;
    const productList = Array.isArray(products) ? products : [];

    if (loading) {
      return (
        <div className="text-center" style={{ padding: "40px" }}>
          Đang tải sản phẩm...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center" style={{ padding: "40px", color: "#ff6b6b" }}>
          {error}
        </div>
      );
    }

    if (productList.length === 0) {
      return (
        <div className="text-center" style={{ padding: "40px" }}>
          Không có sản phẩm nào.
        </div>
      );
    }

    const prods = productList.map((item) => (
      <div key={item._id} className="inline">
        <figure>
          <Link to={"/product/" + item._id}>
            <img
              src={"data:image/jpg;base64," + item.image}
              width="300px"
              height="300px"
              alt={item.name}
            />
          </Link>
          <figcaption className="text-center">
            {item.name}
            <br />
            Price: {item.price}
          </figcaption>
        </figure>
      </div>
    ));

    return (
      <div className="text-center">
        <h2 className="text-center">LIST PRODUCTS</h2>
        {prods}
      </div>
    );
  }

  componentDidMount() {
    this.loadProducts(this.props.params);
  }

  componentDidUpdate(prevProps) {
    const { params } = this.props;
    if (params.cid !== prevProps.params.cid || params.keyword !== prevProps.params.keyword) {
      this.loadProducts(params);
    }
  }

  loadProducts(params) {
    if (params.cid) {
      this.apiGetProductsByCatID(params.cid);
    } else if (params.keyword) {
      this.apiGetProductsByKeyword(params.keyword);
    } else {
      this.apiGetAllProducts();
    }
  }

  apiGetAllProducts() {
    this.setState({ loading: true, error: null });
    axios
      .get("http://localhost:3000/api/customer/products")
      .then((res) => {
        const products = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        this.setState({ products, loading: false });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          error: "Lỗi tải sản phẩm",
          products: [],
          loading: false
        });
      });
  }

  apiGetProductsByCatID(cid) {
    this.setState({ loading: true, error: null });
    axios
      .get("http://localhost:3000/api/customer/products/category/" + cid)
      .then((res) => {
        const products = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        this.setState({ products, loading: false });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          error: "Lỗi tải sản phẩm theo danh mục",
          products: [],
          loading: false
        });
      });
  }

  apiGetProductsByKeyword(keyword) {
    this.setState({ loading: true, error: null });
    axios
      .get("http://localhost:3000/api/customer/products/search/" + keyword)
      .then((res) => {
        const products = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        this.setState({ products, loading: false });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          error: "Lỗi tìm kiếm sản phẩm",
          products: [],
          loading: false
        });
      });
  }
}

export default withRouter(Product);