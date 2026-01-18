"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import FormField from "@/components/forms/FormField";
import { createCommentFormSchema } from "@/utils/validation/yupAdapter";
import { yupResolver } from "@hookform/resolvers/yup";
import { VALIDATION } from "@/constants/validation";

export interface CommentFormData {
  name: string;
  email: string;
  content: string;
}

interface CommentFormProps {
  blogId: number;
  parentId?: number | null;
  onSubmitSuccess?: (data: CommentFormData) => void;
  onCancelReply?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CommentForm = ({ blogId, parentId, onSubmitSuccess, onCancelReply }: CommentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = createCommentFormSchema();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    reset
  } = useForm<CommentFormData>({
    mode: "onChange",
    resolver: yupResolver(schema)
  });

  const handleSubmitComment = async (data: CommentFormData) => {
    setIsSubmitting(true);
    try {
      if (onSubmitSuccess) {
        onSubmitSuccess(data);
      }
      reset();
    } catch (error) {
      console.error("Comment submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comment-form-wrapper" data-testid="comment-form">
      <form onSubmit={handleSubmit(handleSubmitComment)} noValidate>
        <div className="row">
          <div className="col-md-6">
            <FormField
              id="name"
              label="Nama"
              type="text"
              placeholder="Masukkan nama Anda"
              register={register("name")}
              error={errors.name}
              trigger={trigger}
              required
            />
          </div>
          <div className="col-md-6">
            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="Masukkan email Anda"
              register={register("email")}
              error={errors.email}
              trigger={trigger}
              required
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <FormField
              id="content"
              label="Komentar"
              type="textarea"
              placeholder="Tulis komentar Anda di sini..."
              register={register("content")}
              error={errors.content}
              trigger={trigger}
              required
              maxLength={VALIDATION.COMMENT_MAX_LENGTH}
              description="Komentar Anda akan ditampilkan setelah disetujui oleh moderator"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="theme-btn gradient-btn"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Mengirim..." : "Kirim Komentar"}
              </button>
              {onCancelReply && (
                <button
                  type="button"
                  className="theme-btn gradient-btn"
                  onClick={onCancelReply}
                  aria-label="Batalkan balasan"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;