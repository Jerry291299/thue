import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Profileinfo from '../components/user/profile/profileinfo'

type Props = {}

const Profile = (props: Props) => {
  return (
    <>
     <Header/>
        <Profileinfo/>
    <Footer/>
    </>
  )
}

export default Profile