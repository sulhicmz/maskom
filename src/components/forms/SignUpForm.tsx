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
         name: yup.string().required().label("Nama"),
         email: yup.string().required().email().label("Email"),
         password: yup.string().required().label("Kata sandi"),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
   const onSubmit = () => {
      const notify = () => toast('Registrasi berhasil dikirim', { position: 'top-center' });
      notify();
      reset();
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="user-form">
         <div className="form-group">
            <label>Nama lengkap</label>
            <input
               id="name"
               {...register("name")}
               className="form-control"
               type="text"
               placeholder="Contoh: Andi Wijaya"
            />
            <p className="form_error">{errors.name?.message}</p>
         </div>
         <div className="form-group">
            <label>Email kantor</label>
            <input
               id="email"
               {...register("email")}
               className="form-control"
               type="email"
               placeholder="nama@perusahaan.co.id"
            />
            <p className="form_error">{errors.email?.message}</p>
         </div>
         <div className="form-group">
            <label>Kata sandi</label>
            <input
               type="password"
               {...register("password")}
               className="form-control"
               placeholder="Minimal 8 karakter"
            />
            <p className="form_error">{errors.password?.message}</p>
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
