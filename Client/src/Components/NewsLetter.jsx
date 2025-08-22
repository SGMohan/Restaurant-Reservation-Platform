import { assets } from "../assets/assets";

/**
 * Newsletter subscription component
 */
const NewsLetter = () => {
  return (
    <div className="flex flex-col items-center w-full px-2 sm:px-4 mx-auto my-30">
      <div className="flex flex-col items-center w-full max-w-5xl rounded-2xl px-4 py-12 md:py-16 bg-gray-900 text-white">
        {/* Heading section */}
        <div className="flex flex-col justify-center items-center text-center w-full px-2 sm:px-0">
          <h1 className="text-4xl md:text-[40px] font-medium font-playfair">
            Stay Inspired
          </h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-xl px-2">
            Join our newsletter and be the first to discover new updates,
            exclusive offers, and inspiration.
          </p>
        </div>

        {/* Subscription form */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 w-full px-2 sm:px-4">
          <input
            type="text"
            className="bg-white/10 px-4 py-2.5 border border-white/20 rounded outline-none w-full max-w-md"
            placeholder="Enter your email"
          />
          <button className="flex items-center justify-center gap-2 group bg-black px-4 md:px-7 py-2.5 rounded active:scale-95 transition-all hover:cursor-pointer w-full sm:w-auto">
            Subscribe
            <img
              src={assets.arrowIcon}
              alt="arrowIcon"
              className="invert w-5 h-5 group-hover:translate-x-2 transition-all duration-200"
            />
          </button>
        </div>

        {/* Privacy notice */}
        <p className="text-gray-500 mt-6 text-xs text-center px-2 sm:px-0">
          By subscribing, you agree to our Privacy Policy and consent to receive
          updates.
        </p>
      </div>
    </div>
  );
};

export default NewsLetter;
