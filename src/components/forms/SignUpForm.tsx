"use client"
import Link from "next/link";
import Image from "next/image"
import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { authService } from '@/services/auth';

import icon from "@/assets/images/icon/google.png"

interface FormData {
   name: string;
   email: string;
   password: string;
}
const SignUpForm = () => {

   const schema = yup
      .object({
         name: yup.string().required().label("Nama"),
         email: yup.string().required().email().label("Email"),
         password: yup.string().required().label("Kata sandi"),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
   const onSubmit = async (data: FormData) => {
      const result = await authService.register({
         name: data.name,
         email: data.email,
         password: data.password,
      });

      if (result.success) {
         toast(result.message, { position: 'top-center' });
         reset();
      } else {
         toast(result.error, { position: 'top-center' });
      }
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="user-form" noValidate>
         <div className="form-group">
            <label htmlFor="signup_name">Nama lengkap</label>
            <input
               id="signup_name"
               {...register("name")}
               className="form-control"
               type="text"
               placeholder="Contoh: Andi Wijaya"
               aria-invalid={!!errors.name}
               aria-describedby="signup_name_error"
            />
            <p id="signup_name_error" className="form_error" role="alert">{errors.name?.message}</p>
         </div>
         <div className="form-group">
            <label htmlFor="signup_email">Email kantor</label>
            <input
               id="signup_email"
               {...register("email")}
               className="form-control"
               type="email"
               placeholder="nama@perusahaan.co.id"
               aria-invalid={!!errors.email}
               aria-describedby="signup_email_error"
            />
            <p id="signup_email_error" className="form_error" role="alert">{errors.email?.message}</p>
         </div>
         <div className="form-group">
            <label htmlFor="signup_password">Kata sandi</label>
            <input
               id="signup_password"
               type="password"
               {...register("password")}
               className="form-control"
               placeholder="Minimal 8 karakter"
               aria-invalid={!!errors.password}
               aria-describedby="signup_password_error"
            />
            <p id="signup_password_error" className="form_error" role="alert">{errors.password?.message}</p>
         </div>
         <div className="form-group mb-25">
            <button className="theme-btn style-one">Daftarkan akun</button>
         </div>
         <div className="form-group">
            <button className="theme-btn style-one">
               <Image src={icon} alt="google" />Daftar dengan Google Workspace
            </button>
         </div>
         <div className="form-text text-center">
            <span>Sudah memiliki akun? <Link href="/login">Masuk di sini</Link></span>
         </div>
      </form>
   )
}

export default SignUpForm
