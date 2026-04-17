import React, { Component, Suspense, lazy } from 'react';
import MyContext from '../contexts/MyContext';
import Menu from './MenuComponent';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load components for better performance
const Home = lazy(() => import('./HomeComponent'));
const Category = lazy(() => import('./CategoryComponent'));
const Product = lazy(() => import('./ProductComponent'));
const Order = lazy(() => import('./OrderComponent'));
const Customer = lazy(() => import('./CustomerComponent'));

class Main extends Component {
  static contextType = MyContext;

  render() {
    if (this.context.token !== '') {
      return (
        <div className="body-admin">
          <Menu />
          <Suspense fallback={<div className="text-center" style={{ padding: "40px" }}>Loading...</div>}>
            <Routes>
              <Route path='/admin' element={<Navigate replace to='/admin/home' />} />
              <Route path='/admin/home' element={<Home />} />
              <Route path='/admin/category' element={<Category />} />
              <Route path='/admin/product' element={<Product />} />
              <Route path='/admin/order' element={<Order />} />
              <Route path='/admin/customer' element={<Customer />} />
              <Route path='*' element={<div className="text-center" style={{ padding: "40px" }}><h2>404 - Page Not Found</h2></div>} />
            </Routes>
          </Suspense>
        </div>
      );
    }
    return <div />;
  }
}

export default Main;