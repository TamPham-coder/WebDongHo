import React, { Component } from 'react';
import MyContext from './MyContext';

class MyProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: this.getStorageItem('token') || '',
      customer: this.getStorageItem('customer') || null,
      mycart: this.getStorageItem('mycart') || [],
      setToken: this.setToken,
      setCustomer: this.setCustomer,
      setMycart: this.setMycart,
      addToCart: this.addToCart,
      removeFromCart: this.removeFromCart,
      updateCartItem: this.updateCartItem,
      clearCart: this.clearCart,
      logout: this.logout
    };
  }

  getStorageItem = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  }

  setStorageItem = (key, value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  }

  setToken = (value) => {
    this.setState({ token: value });
    this.setStorageItem('token', value);
  }

  setCustomer = (value) => {
    this.setState({ customer: value });
    this.setStorageItem('customer', value);
  }

  setMycart = (value) => {
    this.setState({ mycart: value || [] });
    this.setStorageItem('mycart', value);
  }

  addToCart = (product, quantity = 1) => {
    const { mycart } = this.state;
    const existingItem = mycart.find(item => item.product._id === product._id);

    let updatedCart;
    if (existingItem) {
      updatedCart = mycart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [...mycart, { product, quantity }];
    }

    this.setMycart(updatedCart);
    return updatedCart;
  }

  removeFromCart = (productId) => {
    const { mycart } = this.state;
    const updatedCart = mycart.filter(item => item.product._id !== productId);
    this.setMycart(updatedCart);
    return updatedCart;
  }

  updateCartItem = (productId, quantity) => {
    const { mycart } = this.state;
    const updatedCart = mycart.map(item =>
      item.product._id === productId
        ? { ...item, quantity: Math.max(quantity, 1) }
        : item
    );
    this.setMycart(updatedCart);
    return updatedCart;
  }

  clearCart = () => {
    this.setMycart([]);
  }

  logout = () => {
    this.setToken('');
    this.setCustomer(null);
    this.clearCart();
  }

  render() {
    return (
      <MyContext.Provider value={this.state}>
        {this.props.children}
      </MyContext.Provider>
    );
  }
}

export default MyProvider;