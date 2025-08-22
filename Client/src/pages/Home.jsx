import HeroSection from "../Components/HeroSection";
import FeaturedDestination from "../Components/DiningDestination";
import ExclusiveOffers from "../Components/ExclusiveOffers";
import Testimonial from "../Components/Testimonial";
import NewsLetter from "../Components/NewsLetter";
import RecommendedDinings from "../Components/RecommendedDinings";

/**
 * Home page component that serves as the main landing page
 * Displays various sections including hero, recommended dinings, featured destinations, etc.
 */
const Home = () => {
  return (
    <div>
      <HeroSection />
      <RecommendedDinings />
      <FeaturedDestination />
      <ExclusiveOffers />
      <Testimonial />
      <NewsLetter />
    </div>
  );
};

export default Home;
