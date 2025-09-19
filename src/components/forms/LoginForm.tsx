"use client"
import Link from "next/link";
import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

interface FormData {
   email: string;
   password: string;
}

const LoginForm = () => {

   const schema = yup
      .object({
         email: yup.string().required().email().label("Email"),
         password: yup.string().required().label("Password"),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
   const onSubmit = () => {
      const notify = () => toast('Login successfully', { position: 'top-center' });
      notify();
      reset();
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="user-form">
         <div className="form-group">
            <label>Email</label>
            <input id="email" {...register("email")} type="email" className="form-control" placeholder="demo@gmail.com" />
            <p className="form_error">{errors.email?.message}</p>
         </div>
         <div className="form-group">
            <label>Password <a href="#">Forgot？</a></label>
            <input type="password" {...register("password")} className="form-control" placeholder="Enter your password" />
            <p className="form_error">{errors.password?.message}</p>
         </div>
         <div className="form-group">
            <button className="theme-btn style-one">Login now</button>
         </div>
         <div className="form-text text-center">
            <span>Don&apos;t have an account ?<Link href="/sign-up">Sign up</Link></span>
         </div>
      </form>
   )
}

export default LoginForm
