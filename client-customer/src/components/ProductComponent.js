import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import withRouter from "../utils/withRouter";

const productCache = {};

const getProductCacheKey = (params) =>
  params.cid ? `cat_${params.cid}` : params.keyword ? `search_${params.keyword}` : 'all';

const getProductStorageKey = (cacheKey) => `customer_product_${cacheKey}`;

const loadProductCacheFromStorage = (cacheKey) => {
  try {
    const raw = localStorage.getItem(getProductStorageKey(cacheKey));
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && Array.isArray(parsed.products) ? parsed.products : null;
  } catch (err) {
    console.error('Load product cache from storage failed:', err);
    return null;
  }
};

const saveProductCacheToStorage = (cacheKey, products) => {
  try {
    localStorage.setItem(getProductStorageKey(cacheKey), JSON.stringify({ products }));
  } catch (err) {
    console.error('Save product cache to storage failed:', err);
  }
};

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

    if (loading && productList.length === 0) {
      return (
        <div className="text-center" style={{ padding: "40px" }}>
          Đang tải sản phẩm...
        </div>
      );
    }

    if (error && productList.length === 0) {
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
              loading="lazy"
              src={item.image ? "data:image/jpg;base64," + item.image : "/images/watch1.jpg"}
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
    this.loadCachedProducts(this.props.params);
    this.loadProducts(this.props.params);
  }

  componentDidUpdate(prevProps) {
    const { params } = this.props;
    if (params.cid !== prevProps.params.cid || params.keyword !== prevProps.params.keyword) {
      this.loadCachedProducts(params);
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

  loadCachedProducts(params) {
    const cacheKey = getProductCacheKey(params);
    const cached = productCache[cacheKey];
    const storageProducts = cached && Array.isArray(cached.products) && cached.products.length > 0
      ? cached.products
      : loadProductCacheFromStorage(cacheKey);

    if (Array.isArray(storageProducts) && storageProducts.length > 0) {
      this.setState({ products: storageProducts, loading: false, error: null });
      productCache[cacheKey] = { products: storageProducts };
    }
  }

  apiGetAllProducts() {
    const cacheKey = 'all';
    const hasCache = !!productCache[cacheKey];
    this.setState({ loading: !hasCache, error: null });
    axios
      .get('/api/customer/products')
      .then((res) => {
        const products = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        productCache[cacheKey] = { products };
        saveProductCacheToStorage(cacheKey, products);
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
    const cacheKey = `cat_${cid}`;
    const hasCache = !!productCache[cacheKey];
    this.setState({ loading: !hasCache, error: null });
    axios
      .get('/api/customer/products/category/' + cid)
      .then((res) => {
        const products = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        productCache[cacheKey] = { products };
        saveProductCacheToStorage(cacheKey, products);
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
    const cacheKey = `search_${keyword}`;
    const hasCache = !!productCache[cacheKey];
    this.setState({ loading: !hasCache, error: null });
    axios
      .get('/api/customer/products/search/' + keyword)
      .then((res) => {
        const products = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        productCache[cacheKey] = { products };
        saveProductCacheToStorage(cacheKey, products);
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