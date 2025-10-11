import { howItWorks } from '../data/fakeData';

export default function HowItWorks() {
  return (
    <section className="py-20 bg-backgroundSecondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-xl text-textSecondary max-w-2xl mx-auto">
            From discovery to grocery shopping to cooking - all in four simple steps.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Connector line - hidden on mobile and after last item */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-1/2 w-full h-1 bg-gradient-to-r from-primary to-secondary" style={{ zIndex: 0 }}></div>
                )}
                
                {/* Step circle */}
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6 bg-gradient-button rounded-full shadow-xl">
                  <div className="text-6xl">{step.icon}</div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-text shadow-lg">
                    {step.step}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-text mb-3">
                  {step.title}
                </h3>
                <p className="text-textSecondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

