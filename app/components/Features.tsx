import { features } from '../data/fakeData';

export default function Features() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
            Everything You Need to
            <span className="text-primary"> Cook Better</span>
          </h2>
          <p className="text-xl text-textSecondary max-w-2xl mx-auto">
            Powerful features designed to make your cooking experience seamless and enjoyable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-surface p-8 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-border group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-text mb-3">
                {feature.title}
              </h3>
              <p className="text-textSecondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

