"use client"
import Link from "next/link";
import Image from "next/image"
import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

import icon from "@/assets/images/icon/google.png"

interface FormData {
   name: string;
   email: string;
   password: string;
}
const SignUpForm = () => {

   const schema = yup
      .object({
         name: yup.string().required().label("Name"),
         email: yup.string().required().email().label("Email"),
         password: yup.string().required().label("Password"),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
   const onSubmit = () => {
      const notify = () => toast('Registration successfully', { position: 'top-center' });
      notify();
      reset();
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="user-form">
         <div className="form-group">
            <label>Name</label>
            <input id="name" {...register("name")} className="form-control" type="text" placeholder="Nathaniel Lewis" />
            <p className="form_error">{errors.name?.message}</p>
         </div>
         <div className="form-group">
            <label>Email</label>
            <input id="name" {...register("email")} className="form-control" type="email" placeholder="demo@gmail.com" />
            <p className="form_error">{errors.email?.message}</p>
         </div>
         <div className="form-group">
            <label>Password</label>
            <input type="password" {...register("password")} className="form-control"
               placeholder="Enter your password" />
            <p className="form_error">{errors.password?.message}</p>
         </div>
         <div className="form-group mb-25">
            <button className="theme-btn style-one">Create account</button>
         </div>
         <div className="form-group">
            <button className="theme-btn style-one"><Image src={icon}
               alt="google" />Continue with Google</button>
         </div>
         <div className="form-text text-center">
            <span>Already have an account ? <Link href="/login">Log in</Link></span>
         </div>
      </form>
   )
}

export default SignUpForm
