import { testimonials } from "../assets/assets";
import Star from "./Star";

/**
 * Testimonial Section Component - Displays customer reviews and ratings
 */
const Testimonial = () => {
  return (
    <section className="w-full bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-4xl font-semibold font-playfair text-gray-900 mb-4">
            What Our Guests Say
          </h2>
          <p className="text-md text-gray-600 max-w-2xl mx-auto">
            Discover why discerning travelers consistently choose QuickStay for
            their exclusive and luxurious accommodations around the world.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              {/* User Info */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                </div>
              </div>

              {/* Star Ratings */}
              <div className="flex items-center gap-1 mb-4">
                <Star rating={testimonial.rating} />
              </div>

              {/* Review Text */}
              <p className="text-gray-600 text-sm leading-relaxed">
                "{testimonial.review}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
