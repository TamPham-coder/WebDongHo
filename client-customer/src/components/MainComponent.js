import React, { Component, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load components for better performance
const Menu = lazy(() => import('./MenuComponent'));
const Inform = lazy(() => import('./InformComponent'));
const Home = lazy(() => import('./HomeComponent'));
const Product = lazy(() => import('./ProductComponent'));
const ProductDetail = lazy(() => import('./ProductDetailComponent'));
const Signup = lazy(() => import('./SignupComponent'));
const Active = lazy(() => import('./ActiveComponent'));
const Login = lazy(() => import('./LoginComponent'));
const Myprofile = lazy(() => import('./MyprofileComponent'));
const Mycart = lazy(() => import('./MycartComponent'));
const Myorders = lazy(() => import('./MyordersComponent'));

class Main extends Component {
  render() {
    return (
      <div className="body-customer">
        <Suspense fallback={<div className="text-center" style={{ padding: "40px" }}>Loading...</div>}>
          <Menu />
          <Inform />

          <Routes>
            <Route path='/' element={<Navigate replace to='/home' />} />
            <Route path='/home' element={<Home />} />
            <Route path='/product/category/:cid' element={<Product />} />
            <Route path='/product/search/:keyword' element={<Product />} />
            <Route path='/product/:id' element={<ProductDetail />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/active' element={<Active />} />
            <Route path='/login' element={<Login />} />
            <Route path='/myprofile' element={<Myprofile />} />
            <Route path='/mycart' element={<Mycart />} />
            <Route path='/myorders' element={<Myorders />} />
            <Route path='*' element={<div className="text-center" style={{ padding: "40px" }}><h2>404 - Page Not Found</h2></div>} />
          </Routes>
        </Suspense>
      </div>
    );
  }
}

export default Main;