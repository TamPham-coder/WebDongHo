import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const homeCache = {
  newprods: null,
  hotprods: null
};

const HOME_NEWPRODS_KEY = 'customer_home_newprods';
const HOME_HOTPRODS_KEY = 'customer_home_hotprods';

const loadHomeCacheFromStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && Array.isArray(parsed.products) ? parsed.products : null;
  } catch (err) {
    console.error('Load home cache from storage failed:', err);
    return null;
  }
};

const saveHomeCacheToStorage = (key, products) => {
  try {
    localStorage.setItem(key, JSON.stringify({ products }));
  } catch (err) {
    console.error('Save home cache to storage failed:', err);
  }
};

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newprods: homeCache.newprods || loadHomeCacheFromStorage(HOME_NEWPRODS_KEY) || [],
      hotprods: homeCache.hotprods || loadHomeCacheFromStorage(HOME_HOTPRODS_KEY) || []
    };
  }

  render() {
    const newprods = Array.isArray(this.state.newprods) ? this.state.newprods : [];
    const hotprods = Array.isArray(this.state.hotprods) ? this.state.hotprods : [];

    const newprodsList = newprods.map((item) => {
      return (
        <div key={item._id || Math.random()} className="inline">
          <figure>
            <Link to={'/product/' + (item._id || '')}>
              <img loading="lazy" src={item.image ? 'data:image/jpg;base64,' + item.image : '/images/watch1.jpg'} width="300px" height="300px" alt={item.name || 'Product'} />
            </Link>
            <figcaption className="text-center">
              {item.name || 'Unknown'}<br />Price: {item.price ?? 'N/A'}
            </figcaption>
          </figure>
        </div>
      );
    });

    const hotprodsList = hotprods.map((item) => {
      return (
        <div key={item._id || Math.random()} className="inline">
          <figure>
            <Link to={'/product/' + (item._id || '')}>
              <img loading="lazy" src={item.image ? 'data:image/jpg;base64,' + item.image : '/images/watch1.jpg'} width="300px" height="300px" alt={item.name || 'Product'} />
            </Link>
            <figcaption className="text-center">
              {item.name || 'Unknown'}<br />Price: {item.price ?? 'N/A'}
            </figcaption>
          </figure>
        </div>
      );
    });

    return (
      <div>

        <div className="align-center">
          <h2 className="text-center">NEW PRODUCTS</h2>
          {newprodsList}
        </div>

        {hotprods.length > 0 ?
          <div className="align-center">
            <h2 className="text-center">HOT PRODUCTS</h2>
            {hotprodsList}
          </div>
          : <div />
        }

      </div>
    );
  }

  componentDidMount() {
    if (homeCache.newprods) {
      this.setState({ newprods: homeCache.newprods });
    }
    if (homeCache.hotprods) {
      this.setState({ hotprods: homeCache.hotprods });
    }
    this.apiGetNewProducts();
    this.apiGetHotProducts();
  }

  // apis
  apiGetNewProducts() {
    axios.get('http://localhost:3000/api/customer/products/new').then((res) => {
      const result = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      homeCache.newprods = result;
      saveHomeCacheToStorage(HOME_NEWPRODS_KEY, result);
      this.setState({ newprods: result });
    }).catch((err) => {
      console.error('New products error:', err);
      this.setState({ newprods: [] });
    });
  }

  apiGetHotProducts() {
    axios.get('http://localhost:3000/api/customer/products/hot').then((res) => {
      const result = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      homeCache.hotprods = result;
      saveHomeCacheToStorage(HOME_HOTPRODS_KEY, result);
      this.setState({ hotprods: result });
    }).catch((err) => {
      console.error('Hot products error:', err);
      this.setState({ hotprods: [] });
    });
  }
}

export default Home;