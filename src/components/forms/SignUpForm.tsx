"use client"
import Link from "next/link";
import Image from "next/image"
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { authService } from '@/services/auth';
import { createSignUpFormSchema } from '@/utils/formValidation';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import FormField from './FormField';
import LoadingButton from './LoadingButton';

import icon from "@/assets/images/icon/google.png"

interface FormData {
   name: string;
   email: string;
   password: string;
}
const SignUpForm = () => {
   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(createSignUpFormSchema()), });

   const { submit: onSubmit, isSubmitting } = useFormSubmission(
      async (data: FormData) => {
         return await authService.register({
            name: data.name,
            email: data.email,
            password: data.password,
         });
      },
      { resetForm: reset }
   );

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="user-form" noValidate>
         <FormField
            id="signup_name"
            label="Nama lengkap"
            type="text"
            placeholder="Contoh: Andi Wijaya"
            register={register("name")}
            error={errors.name}
            disabled={isSubmitting}
         />
         <FormField
            id="signup_email"
            label="Email kantor"
            type="email"
            placeholder="nama@perusahaan.co.id"
            register={register("email")}
            error={errors.email}
            disabled={isSubmitting}
         />
         <FormField
            id="signup_password"
            label="Kata sandi"
            type="password"
            placeholder="Minimal 8 karakter"
            register={register("password")}
            error={errors.password}
            disabled={isSubmitting}
         />
         <div className="form-group mb-25">
            <LoadingButton
               className="theme-btn style-one"
               isLoading={isSubmitting}
               loadingText="Mendaftarkan..."
            >
               Daftarkan akun
            </LoadingButton>
         </div>
         <div className="form-group">
            <button type="button" className="theme-btn style-one" disabled={isSubmitting} aria-label="Daftar dengan Google Workspace (Fitur akan segera hadir)">
               <Image src={icon} alt="google" width={20} height={20} />Daftar dengan Google Workspace
            </button>
         </div>
         <div className="form-text text-center">
            <span>Sudah memiliki akun? <Link href="/login">Masuk di sini</Link></span>
         </div>
      </form>
   )
}

export default SignUpForm
