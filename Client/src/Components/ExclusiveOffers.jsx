import { assets, exclusiveOffers } from "../assets/assets";

/**
 * Exclusive Offers Component
 * Displays special offers and promotions
 */
const ExclusiveOffers = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full mb-16">
        <div className="text-left mb-6 md:mb-0 md:max-w-xl">
          <h2 className="text-5xl md:text-4xl font-semibold font-playfair text-gray-900 mb-4">
            Exclusive Offers
          </h2>
          <p className="text-lg text-gray-600">
            Indulge in chef-curated seasonal creations—an exquisite dining
            experience awaits.
          </p>
        </div>
        <button className="flex items-center gap-2 font-medium text-primary hover:text-primary-dark px-6 py-3 transition-all group hover:cursor-pointer">
          View All Offers
          <img
            src={assets.arrowIcon}
            alt="arrowIcon"
            className="w-5 h-5 group-hover:translate-x-2 transition-all duration-200"
          />
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full  hover:cursor-pointer">
        {exclusiveOffers.map((offer) => (
          <div
            key={offer._id}
            className="group relative overflow-hidden rounded-xl h-full min-h-[400px] flex flex-col justify-end p-6 bg-cover bg-center after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/80 after:to-transparent"
            style={{ backgroundImage: `url(${offer.image})` }}
          >
            {/* Discount Badge */}
            <span className="absolute top-6 left-6 px-4 py-1.5 text-sm font-medium bg-white text-primary rounded-full z-10">
              {offer.priceOff}% OFF
            </span>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-2xl font-playfair font-semibold text-white mb-2">
                {offer.title}
              </h3>
              <p className="text-gray-200 mb-4 line-clamp-2">
                {offer.description}
              </p>
              <p className="text-sm text-gray-300 mb-6">
                Expires {offer.expiryDate}
              </p>

              <button className="flex items-center gap-2 font-medium text-white hover:text-amber-300 transition-colors cursor-pointer">
                View Offers
                <img
                  src={assets.arrowIcon}
                  alt="arrowIcon"
                  className="invert w-5 h-5 group-hover:translate-x-2 transition-all duration-200"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExclusiveOffers;
