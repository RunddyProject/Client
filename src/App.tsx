import './App.css';
import { NaverMap } from './components/NaverMap';

function App() {
  return (
    <div>
      <h1 className='text-3xl font-bold underline'>Runddy</h1>
      <div className='w-[400px] h-[300px] mt-4'>
        <NaverMap className='w-full h-full rounded-xl' />
      </div>
    </div>
  );
}

export default App;
