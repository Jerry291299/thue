import React from 'react'
import { Navigate } from 'react-router-dom'

type Props = {
    children: React.ReactNode
}

const Privaterouter = ({children}: Props) => {
  // let UserLogin = true;
  let user = false
  const localuser = sessionStorage.getItem('user')
  console.log(localuser);
  
  if (localuser!==null){
    user =true
  }
  return (
    (user)?<>{children}</>:Navigate({to:'/'})
  )
}

export default Privaterouter