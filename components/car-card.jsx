"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import Image from 'next/image'
import { CarIcon, Heart, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useRouter } from 'next/navigation'
import useFetch from '@/hooks/use-fetch'
import { toggleSavedCar } from '@/actions/car-listing'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'sonner'

const CarCard = ({ car }) => {
  const router = useRouter();

  const [isSaved, setIsSaved] = useState(car.wishlisted);
  const [formatted, setFormatted] = useState("");
  const { isSignedIn } = useAuth();
  const { loading: isToggling,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError
  } = useFetch(toggleSavedCar);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    console.log("INside handleToggleSave",isSignedIn);
    if (!isSignedIn) {
      // console.log("INside handleToggleSave 2",isSignedIn);
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }
    

    if (isToggling){
      console.log("INside handleToggleSave 3",isSignedIn);
      return;
    } 
    // Call the toggleSavedCar function using our useFetch hook
    await toggleSavedCarFn(car.id);
  };

  useEffect(() => {
    if (typeof car.price === "number") {
      const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(car.price);

      setFormatted(formattedPrice);
    }
  }, [car.price]);


  // Handle toggle result with useEffect
  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved !== isSaved) {
      setIsSaved(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult, isSaved]);

  // Handle errors with useEffect
  useEffect(() => {
    if (toggleError) {
      toast.error("Failed to update favorites");
    }
  }, [toggleError]);

  return <Card className="overflow-hidden hover:shadow-lg transition group py-0">
    <div className="relative h-60">
      {car.images && car.images.length > 0 ? (<div className="relative h-full w-full">
        <Image src={car.images[0]} alt={`${car.make} ${car.model}`} fill className="object-cover group-hover:scale-105 transition duration-300" />
      </div>) : (<div className='w-full h-full bg-gray-200 flex items-center justify-center'>
        <CarIcon className="h-12 w-12 text-shadow-gray-400" />
      </div>)}
      <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 ${
            isSaved
              ? "text-red-500 hover:text-red-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={handleToggleSave}
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={isSaved ? "fill-current" : ""} size={20} />
          )}
        </Button>
    </div>
    <CardContent className="p-4">
      <div className="flex flex-col mb-2">
        <h3 className="text-lg font-bold line-clamp-1">{car.make} {car.model}</h3>
        {/* <span className="text-xl font-bold text-blue-600">${car.price.toLocaleString()}</span> */}
        {/* <span className="text-xl font-bold text-blue-600">${car.price}</span> */}
        <span className="text-xl font-bold text-blue-600">{formatted}</span>
      </div>

      <div className="text-gray-600 mb-2 flex items-center">
        <span>{car.year}</span>
        <span className="mx-2">•</span>
        <span>{car.transmission}</span>
        <span className="mx-2">•</span>
        <span>{car.fuelType}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        <Badge variant="outline" className="bg-gray-50">
          {car.bodyType}
        </Badge>
        <Badge variant="outline" className="bg-gray-50">
          {car.mileage.toLocaleString()} miles
        </Badge>
        <Badge variant="outline" className="bg-gray-50">
          {car.color}
        </Badge>
      </div>

      <div className="flex justify-between">
        <Button
          className="flex-1"
          onClick={() => {
            router.push(`/cars/${car.id}`);
          }}
        >
          View Car
        </Button>
      </div>
    </CardContent>
  </Card>
}

export default CarCard
