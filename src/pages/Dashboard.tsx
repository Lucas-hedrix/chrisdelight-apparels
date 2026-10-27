import Hero from '../components/Hero';
import PopularCollection from '../components/PopularCollection';
import PickedForYou from '../components/PickedForYou';

export default function Dashboard() {
  return (
    <div>
      <Hero />
      <PickedForYou />
      <PopularCollection />
    </div>
  );
}
