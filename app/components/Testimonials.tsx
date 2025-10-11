import { testimonials } from '../data/fakeData';
import Image from 'next/image';

export default function Testimonials() {
  return (
    <section className="py-20 bg-backgroundSecondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
            Loved by <span className="text-primary">Home Cooks</span>
          </h2>
          <p className="text-xl text-textSecondary max-w-2xl mx-auto">
            See what our community has to say about their cooking journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-surface p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-border"
            >
              <div className="flex items-center mb-4">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={60}
                  height={60}
                  className="rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold text-text">{testimonial.name}</h4>
                  <p className="text-sm text-textSecondary">{testimonial.role}</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-2xl text-warning">★★★★★</span>
              </div>
              <p className="text-textSecondary leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

