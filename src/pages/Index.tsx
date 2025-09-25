import { NaverMap } from '@/components/NaverMap';

function Index() {
  return (
    <div className='grid gap-2'>
      <h1 className='text-3xl font-bold underline'>Runddy</h1>

      <div className='w-[400px] h-[300px]'>
        <NaverMap className='w-full h-full rounded-xl' />
      </div>
    </div>
  );
}

export default Index;
