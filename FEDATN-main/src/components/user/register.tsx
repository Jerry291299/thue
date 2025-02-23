import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { UserRegister } from '../../service/user'

type Props = {}

const Register = (props: Props) => {
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isError, setIsError] = useState<boolean>(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      const data = await UserRegister({ name, email, password })
      if (data?.name === "Axioserror") {
        setMessage("Đăng ký thất bại. Vui lòng thử lại.")
        setIsError(true)
      } else {
        setMessage("Đăng ký thành công!")
        setIsError(false)
      }
    } catch (error) {
      console.log(error)
      setMessage("Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.")
      setIsError(true)
    }
  }

  return (
    <>
      <div className="font-[sans-serif] text-[#333]">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="grid md:grid-cols-2 items-center gap-4 max-w-6xl w-full p-4 m-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] rounded-md">
            <div className="md:max-w-md w-full sm:px-6 py-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-12">
                  <h3 className="text-3xl font-extrabold">Đăng ký</h3>
                  <p className="text-sm mt-4 ">
                    Đã có tài khoản?{" "}
                    <NavLink to={'/login'}>
                      <span className="text-blue-600 font-semibold hover:underline ml-1 whitespace-nowrap">
                        Đăng nhập tại đây!
                      </span>
                    </NavLink>
                  </p>
                </div>
                {message && (
                  <div
                    className={`text-sm mb-4 p-2 rounded ${
                      isError ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                    }`}
                  >
                    {message}
                  </div>
                )}
                <div>
                  <label className="text-xs block mb-2">Tên</label>
                  <div className="relative flex items-center">
                    <input
                      name="name"
                      type="text"
                      onChange={(e: any) => {
                        setName(e.target.value)
                      }}
                      className="w-full text-sm border-b border-gray-300 focus:border-[#333] px-2 py-3 outline-none"
                      placeholder="Mời nhập tên"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs pt-[15px] block mb-2">Email</label>
                  <div className="relative flex items-center">
                    <input
                      name="email"
                      type="email"
                      onChange={(e: any) => {
                        setEmail(e.target.value)
                      }}
                      className="w-full text-sm border-b border-gray-300 focus:border-[#333] px-2 py-3 outline-none"
                      placeholder="Mời nhập email"
                    />
                  </div>
                </div>
                <div className="mt-8">
                  <label className="text-xs block mb-2">Mật khẩu</label>
                  <div className="relative flex items-center">
                    <input
                      name="password"
                      type="password"
                      onChange={(e: any) => {
                        setPassword(e.target.value)
                      }}
                      className="w-full text-sm border-b border-gray-300 focus:border-[#333] px-2 py-3 outline-none"
                      placeholder="Mời nhập mật khẩu"
                    />
                  </div>
                </div>
                <div className="mt-12">
                  <button
                    type="submit"
                    className="w-full shadow-xl py-2.5 px-4 text-sm font-semibold rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    Đăng ký
                  </button>
                </div>
              </form>
            </div>
            <div className="md:h-full max-md:mt-10 bg-[#000842] rounded-xl lg:p-12 p-8">
              <img
                src="https://readymadeui.com/signin-image.webp"
                className="w-full h-full object-contain"
                alt="login-image"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
