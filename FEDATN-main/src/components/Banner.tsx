import React from 'react'
import banner from'./img/banner.png'
type Props = {}

const Banner = (props: Props) => {
  return (
    <div className='pt-[20px] pb-[50px]'>
      <img src={banner} alt="" />
    </div>
  )
}

export default Banner