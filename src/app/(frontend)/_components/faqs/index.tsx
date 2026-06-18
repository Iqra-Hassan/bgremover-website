'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is Eraseo?',
    answer:
      'Eraseo is an AI-powered tool that removes unwanted objects from images in seconds. Its perfect for creating clean, professional visuals without needing any design skills.',
  },
  {
    question: 'Do I need editing experience to use Eraseo?',
    answer:
      'Not at all! Eraseo is designed for anyone—just upload your image, click on what you want to remove, and let the AI handle the rest.',
  },
  {
    question: 'What types of objects can I remove?',
    answer:
      'Eraseo can remove almost anything—people, logos, clutter, props, shadows, reflections, and more. It works on a wide range of images, from product shots to portraits to landscapes.',
  },
  {
    question: 'Will the background look natural after removal?',
    answer:
      'Yes. Eraseo uses advanced generative AI to intelligently fill in the removed area with matching textures and colors, making it look seamless.',
  },
  {
    question: 'Can I use Eraseo on mobile devices?',
    answer:
      'Yes, Eraseo is fully responsive and works smoothly on both desktop and mobile browsers—no app download required.',
  },
  {
    question: 'What file formats do you support?',
    answer: 'We currently support JPG, PNG, and WebP image uploads. More formats are coming soon',
  },
  {
    question: 'Is my data and image content safe?',
    answer:
      'Yes, your data is encrypted and images are processed securely. We never use your content for training or sharing without permission. All images are deleted after some time.',
  },
];

const Faqs = () => {
  return (
    <div className="py-14 md:py-20">
      <div className="container !max-w-4xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
            FAQs
          </div>
          <h1 className="text-2xl font-semibold md:text-3xl">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Find answers to common questions about our ERP system.
          </p>
        </div>
        <Accordion className="mt-10" type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem
              className="bg-muted mb-2 rounded-lg border-0 px-4"
              key={index}
              value={faq.question}
            >
              <AccordionTrigger className="hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Faqs;
