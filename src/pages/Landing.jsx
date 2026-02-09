
import Hero from '../components/Hero';
import DemoVideo from '../components/DemoVideo';

import InteractiveStory from '../components/InteractiveStory';
import FeatureShowcase from '../components/FeatureShowcase';
import Timeline from '../components/Timeline';
import Pricing from '../components/Pricing';
import Community from '../components/Community';

const Landing = () => {
    return (
        <>
            <Hero />
            <DemoVideo />

            <InteractiveStory />
            <FeatureShowcase />
            <Timeline />
            <Pricing />
            <Community />
        </>
    );
};

export default Landing;
