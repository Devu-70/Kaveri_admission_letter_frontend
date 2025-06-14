import React from 'react';
import Lottie from 'lottie-react';
import noInternetAnim from '../assets/no-internet.json'; // adjust path if needed

const NoInternet = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black/90 text-white px-4">
      <div className="w-72 md:w-96">
        <Lottie animationData={noInternetAnim} loop={true} />
      </div>
      <h1 className="text-2xl text-center">No Internet Connection</h1>
      <p className="mt-2 text-base text-sm text-center text-gray-300">
        Please check your connection and try again.
      </p>
    </div>
  );
};

export default NoInternet;
