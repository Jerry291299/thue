import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import Home from "./layout/Home";
import Admin from "./layout/Admin";
import Add from "./components/admin/modaladd/add";
import Dashboard from "./components/admin/Dashboard";
import Register from "./components/user/register";
import Update from "./components/admin/modaladd/update";
import View from "./components/admin/modaladd/view";
import Users from "./components/admin/User";
import Listcategory from "./components/admin/listcategory";
import Addcategory from "./components/admin/modaladd/addcategory";
import Login from "./components/user/login";
import Updatecategory from "./components/admin/modaladd/updatecategory";
import Productspage from "./components/Productspage";
import ProductDetail from "./components/ProductDetail";
import Privaterouter from "./components/privaterouter";
import Cart from "./components/cart/cart";
import Tintuc from "./components/tintuc";
import Tintucdetail from "./components/tintucdetail";
import Gioithieu from "./components/gioithieu";
import SearchResults from "./components/SearchResults";
import OrderPayment from "./components/OrderPayment";
import Order from "./components/admin/Orderadmin";
import Success from "./components/success";
import Donhangpage from "./components/Donhangpage";
import AddMaterial from "./components/admin/modaladd/addmaterial";
import { updateMaterial } from "./service/material";
import UpdateMaterial from "./components/admin/modaladd/updatemaerial";
import CommentDashboard from "./components/admin/CommentDashboard";
import Donhang from "./components/Orderlisthistory";
import Shipper from "./layout/Shipper";
import ShipperDashboard from "./components/admin/shipper/ShipperDashboard";
import OrdersShipper from "./components/admin/shipper/OrdersShipper";
import Orderlist from "./components/Orderlisthistory";
import Orderlisthistory from "./components/Orderlisthistory";
import NewsTable from "./components/admin/tintuc";
import AddNews from "./components/admin/modaladd/addtintuc";
import UpdateNews from "./components/admin/modaladd/updatetintuc";
import DashboardNews from "./components/admin/tintuc";
import Profileinfo from "./components/user/profile/profileinfo";
import Profile from "./layout/profile";
import OrderDetail from "./components/OrderDetail";
import ListVouchers from "./components/admin/voucher/ListVoucher";
import AddVoucher from "./components/admin/voucher/AddVoucher";
import EditVoucher from "./components/admin/voucher/EditVoucher";
import Thongke from "./components/admin/thongke";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>

          <Route path="/products" element={<Productspage />} />
          <Route path="/products/categories/:id" element={<Productspage />} />
          <Route path="/search/:searchTerm" element={<SearchResults />} />
          <Route
            path="/Cart/:id"
            element={
              <Privaterouter>
                <Cart />
              </Privaterouter>
            }
          ></Route>
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tintuc" element={<Tintuc />} />
          <Route path="/tintuc/:id" element={<Tintucdetail />} />
          <Route path="/gioithieu" element={<Gioithieu />} />
          <Route path="/order" element={<OrderPayment />} />
          <Route path="/donhang" element={<Orderlisthistory />} />
          <Route path="/success" element={<Success />} />
          <Route path="/listdonhang" element={<Donhangpage />} />
          <Route path="/Orders/:id" element={<OrderDetail />} />

          <Route
            path="/admin"
            element={
              <Privaterouter>
                <Admin />
              </Privaterouter>
            }
          >
            <Route path="thongke" element={<Thongke />} />
             <Route path="comments" element={<CommentDashboard />} />
            <Route path="add" element={<Add />} />
            <Route path="addNews" element={<AddNews />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="Listcategory" element={<Listcategory />} />
            <Route path="addcategory" element={<Addcategory />} />
            <Route path="addMaterial" element={<AddMaterial />} />
            <Route path="users" element={<Users />} />
            <Route path="order" element={<Order />} />
            <Route path="vouchers" element={<ListVouchers />} />
            <Route path="vouchers/:id" element={<EditVoucher />} />
            <Route path="voucher/add" element={<AddVoucher />} />
            
            <Route path="tintuc" element={<DashboardNews />} />
            {/* <Route path="dashboard/update/:id" Component={Update}></Route> */}
            <Route path="dashboard/update/:id" Component={Update}></Route>
            <Route path="dashboard/view/:id" Component={View}></Route>
            <Route path="News/updatenews/:id" Component={UpdateNews}></Route>

            <Route
              path="Listcategory/updatecategory/:id"
              Component={Updatecategory}
            ></Route>
            <Route
              path="Material/updateMaterial/:id"
              Component={UpdateMaterial}
            ></Route>
          </Route>

          <Route
            path="/profileinfo/:id"
            element={
              <Privaterouter>
                <Profile />
              </Privaterouter>
            }
          >

          </Route>
          <Route
            path="/shipper"
            element={
              <Privaterouter>
                <Shipper />
              </Privaterouter>
            }
          >
            {/* {/* <Route path="orders" element={<ShipperOrders />} /> */}
            <Route path="/shipper/orders" element={<OrdersShipper />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
