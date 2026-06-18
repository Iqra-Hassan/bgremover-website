'use client';

import { TestimonialsColumn } from './testimonials-column';

const testimonials = [
  {
    text: 'As a product photographer, I used to spend so much time cleaning up backgrounds. Eraseo made it effortless—one click and it’s done!',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    name: 'Maya Leonard',
    role: 'Product Photographer',
  },
  {
    text: 'I removed all background distractions from my product photos and my shop instantly looked more professional. My sales even improved!',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    name: 'Ravi Kapoor',
    role: 'Small Business Owner',
  },
  {
    text: 'I’ve used Photoshop for years, but Eraseo is way faster for object removal. Great for quick edits when I’m on a deadline.',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    name: 'Jasmine Park',
    role: 'Graphic Designer',
  },
  {
    text: 'I uploaded 40 photos from a shoot and removed clutter in minutes. Can’t believe how clean they look now.',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    name: 'Daniel Simmons',
    role: 'Freelance Photographer',
  },
  {
    text: 'I’m not tech-savvy, but this tool is super simple. I cleaned up my vacation photos and they look amazing.',
    image: 'https://randomuser.me/api/portraits/women/5.jpg',
    name: 'Lena Torres',
    role: 'Casual User',
  },
  {
    text: 'I use Eraseo to remove watermarks and random objects before posting social media content. It’s incredibly efficient.',
    image: 'https://randomuser.me/api/portraits/women/6.jpg',
    name: 'Marco Giannetti',
    role: 'Content Creator',
  },
  {
    text: 'I removed people from the background of my wedding photos—looked like they were never there. Unreal results.',
    image: 'https://randomuser.me/api/portraits/men/7.jpg',
    name: 'Aisha Bukhari',
    role: 'Newlywed',
  },
  {
    text: 'I create minimalist branding visuals and Eraseo makes it so easy to focus on the subject by erasing all the noise.',
    image: 'https://randomuser.me/api/portraits/women/8.jpg',
    name: 'Elle McKenzie',
    role: 'Brand Strategist',
  },
  {
    text: 'Used it on my phone and was shocked at how clean the edits came out. No app needed, just works.',
    image: 'https://randomuser.me/api/portraits/men/9.jpg',
    name: 'Tyrell Robinson',
    role: 'Instagram Marketer',
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const Testimonials = () => {
  return (
    <section className="py-14 md:py-20">
      <div className="container !max-w-5xl">
        <div className="flex flex-col items-center gap-1 text-center md:gap-2">
          <div className="bg-primary/10 text-primary mb-2 rounded-full px-3 py-1 text-xs font-medium md:mb-0">
            Testimonials
          </div>
          <h1 className="text-2xl font-semibold md:text-3xl">What our users say</h1>
          <p className="text-muted-foreground text-base">
            See what our customers have to say about us.
          </p>
        </div>

        <div className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={50} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={70}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={50}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
