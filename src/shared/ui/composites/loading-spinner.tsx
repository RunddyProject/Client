const LoadingSpinner = () => {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2'></div>
    </div>
  );
};

export default LoadingSpinner;
