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
         password: yup.string().required().label("Kata sandi"),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
   const onSubmit = () => {
      const notify = () => toast('Berhasil masuk ke portal', { position: 'top-center' });
      notify();
      reset();
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="user-form">
         <div className="form-group">
            <label>Email terdaftar</label>
            <input
               id="email"
               {...register("email")}
               type="email"
               className="form-control"
               placeholder="nama@maskom.co.id"
            />
            <p className="form_error">{errors.email?.message}</p>
         </div>
         <div className="form-group">
            <label>Kata sandi <a href="#">Lupa?</a></label>
            <input
               type="password"
               {...register("password")}
               className="form-control"
               placeholder="Masukkan kata sandi"
            />
            <p className="form_error">{errors.password?.message}</p>
         </div>
         <div className="form-group">
            <button className="theme-btn style-one">Masuk sekarang</button>
         </div>
         <div className="form-text text-center">
            <span>Belum punya akun? <Link href="/sign-up">Daftar Maskom</Link></span>
         </div>
      </form>
   )
}

export default LoginForm
