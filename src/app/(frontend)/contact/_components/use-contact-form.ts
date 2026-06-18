import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export const useContactForm = () => {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const { mutate: sendContactEmail, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof contactFormSchema>) => {
      const response = await apiClient.api.contacts.$post({
        json: data,
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to send contact email');
      }

      return result;
    },
    onSuccess: () => {
      toast.success('Contact email sent successfully');
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send contact email');
    },
  });

  const onSubmit = (data: z.infer<typeof contactFormSchema>) => {
    sendContactEmail(data);
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};
