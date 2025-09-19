"use client"
import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import emailjs from '@emailjs/browser';
import { useRef } from 'react';
import { event } from '@/utils/analytics';

interface FormData {
   user_name: string;
   user_email: string;
   message: string;
}

const schema = yup
   .object({
      user_name: yup.string().required().label("Name"),
      user_email: yup.string().required().email().label("Email"),
      message: yup.string().required().label("Message"),
   })
   .required();

const ContactForm = () => {

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });

   const form = useRef<HTMLFormElement>(null);

   const sendEmail = () => {
      if (form.current) {
         emailjs.sendForm('service_fuc95rb', 'template_9gahggu',
            form.current, '2xsKQqT3Wmfx0sYeF')
            .then((result) => {
               const notify = () => toast('Message sent successfully', { position: 'top-center' });
               notify();
               reset();
               console.log(result.text);
               
               // Track form submission as conversion
               event({
                 action: 'submit',
                 category: 'Contact Form',
                 label: 'Form Submission Success'
               });
            }, (error) => {
               console.log(error.text);
            });
      } else {
         console.error("Form reference is null");
      }
   };

   return (
      <form ref={form} onSubmit={handleSubmit(sendEmail)} className="contact-form">
         <div className="row">
            <div className="col-lg-6">
               <div className="form-group">
                  <input type="text" {...register("user_name")} className="form-control" placeholder="Full Name" />
                  <p className="form_error">{errors.user_name?.message}</p>
               </div>
            </div>
            <div className="col-lg-6">
               <div className="form-group">
                  <input type="email" {...register("user_email")} className="form-control" placeholder="Email Address" />
                  <p className="form_error">{errors.user_email?.message}</p>
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form-group">
                  <textarea {...register("message")} placeholder="Type Message"
                     className="form-control" cols={30} rows={8}></textarea>
                  <p className="form_error">{errors.message?.message}</p>
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form-group">
                  <button className="theme-btn gradient-btn">Send Messages</button>
               </div>
            </div>
         </div>
      </form>
   )
}

export default ContactForm
