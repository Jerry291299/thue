import React from 'react'
import Header from '../components/Header'
import Banner from '../components/Banner'
import Content from '../components/Content'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'

type Props = {}

const Home = (props: Props) => {
  return (
    <>
    <Header/>
    <Banner/>
    <Content/>
    <Outlet/>
    <Footer/>
    </>
  )
}

export default Home