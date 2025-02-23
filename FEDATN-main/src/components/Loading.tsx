import React from 'react'
import {
    LoadingOutlined
} from '@ant-design/icons';
import { Spin } from 'antd';

type Props = {
  size?: string; 
}

const LoadingComponent = ({ size = '24px' }: Props) => {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#ffffff9e] flex items-center justify-center">
  <Spin />
</div>

    </>
  )
}

export default LoadingComponent;