export interface IUser {
  status: "active" | "deactive"; 
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  password: string;
  fullname: string;
  active: boolean;
  reason:String;
}

  export type IUserRegister = Pick<IUser,'name'|'email'|'password'>
  export type IUserLogin = Pick<IUser,'email'|'password'>
  export type IUserCart = Pick<IUser,'_id'>
  export type IUserLite = Pick<IUser, 'role' >
  export interface PUser {
    status: "active" | "deactive"; 
    id: string;
    _id: string;
    name: string;
    email: string;
    role: string;
    password: string;
    fullname: string;
    active: boolean;
    reason:String;
  }
 
    export type PUserCart = Pick<PUser,'id'>
    