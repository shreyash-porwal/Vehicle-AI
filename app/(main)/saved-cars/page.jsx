import React from 'react'
import { auth } from '@clerk/nextjs/server';
import { getSavedCars } from '@/actions/cars';
import {SavedCarsList} from './_components/saved-cars-list';

export const metadata = {
    title: "Saved Cars | Vehicle-AI",
    description: "View your saved cars and favorites",
};

const SavedCarsPage = async () => {
    const { userId } = await auth();
    if (!userId) {
        // Fetch saved cars on the server
        const savedCarsResult = await getSavedCars();
    }

    // Fetch saved cars on the server
    const savedCarsResult = await getSavedCars();
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-6xl mb-6 gradient-title">Your Saved Cars</h1>
            <SavedCarsList initialData={savedCarsResult} />
        </div>
    )
}

export default SavedCarsPage
